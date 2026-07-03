import {
  DEFAULT_PROMPT_PLANNING_CONFIG,
  resolvePromptPlanningConfig,
} from './config.js'
import {
  captureWorkspaceFileState,
  diffWorkspaceFileState,
} from './evidence.js'
import { renderTaskBoard } from './taskBoard.js'
import type {
  NexusTask,
  NexusTaskStatus,
  PromptPlan,
  RunPromptPlanOptions,
  RunPromptPlanResult,
  TaskExecutionResult,
  TaskRunRecord,
} from './types.js'
import {
  validateAfterExecution,
  validateBeforeExecution,
} from './validation.js'

function cloneTasks(tasks: NexusTask[]): NexusTask[] {
  return tasks.map(task => ({
    ...task,
    dependencies: [...task.dependencies],
    input: {
      ...task.input,
      assumptions: [...task.input.assumptions],
      requiredFiles: [...task.input.requiredFiles],
      targetFiles: [...task.input.targetFiles],
      resources: [...task.input.resources],
    },
    verificationCriteria: [...task.verificationCriteria],
  }))
}

function lockKeys(task: NexusTask): string[] {
  return [...new Set([...task.input.requiredFiles, ...task.input.targetFiles])]
}

function dependenciesFinished(task: NexusTask, tasksById: Map<string, NexusTask>): boolean {
  return task.dependencies.every(id => tasksById.get(id)?.status === 'finished')
}

function dependenciesFailed(task: NexusTask, tasksById: Map<string, NexusTask>): boolean {
  return task.dependencies.some(id => {
    const status = tasksById.get(id)?.status
    return status === 'failed' || status === 'blocked'
  })
}

function isLocked(task: NexusTask, activeLocks: Set<string>): boolean {
  return lockKeys(task).some(key => activeLocks.has(key))
}

function acquireLocks(task: NexusTask, activeLocks: Set<string>): void {
  for (const key of lockKeys(task)) activeLocks.add(key)
}

function releaseLocks(task: NexusTask, activeLocks: Set<string>): void {
  for (const key of lockKeys(task)) activeLocks.delete(key)
}

function summary(
  tasks: NexusTask[],
  records: Map<string, TaskRunRecord>,
): RunPromptPlanResult {
  return {
    tasks,
    finished: tasks.filter(task => task.status === 'finished').length,
    failed: tasks.filter(task => task.status === 'failed').length,
    blocked: tasks.filter(task => task.status === 'blocked').length,
    taskResults: tasks.map(task => {
      const record = records.get(task.id)
      if (record) return record
      return {
        taskId: task.id,
        task,
        actualChangedFiles: [],
        reportedChangedFiles: [],
        unreportedChangedFiles: [],
        observedCommands: [],
        reportedCommands: [],
        unverifiedCommandClaims: [],
        preVerification: { ok: true, blocked: false, issues: [] },
      }
    }),
  }
}

function unique(values: Iterable<string>): string[] {
  return [...new Set([...values].map(value => value.trim()).filter(Boolean))]
}

function reportedChangedFiles(result?: TaskExecutionResult): string[] {
  return unique([
    ...(result?.reportedChangedFiles ?? []),
    ...(result?.changedFiles ?? []),
  ])
}

function observedCommands(result?: TaskExecutionResult): string[] {
  return unique([
    ...(result?.commandsRun ?? []),
    ...(result?.observedCommands ?? []),
  ])
}

function reportedCommands(result?: TaskExecutionResult): string[] {
  return unique(result?.reportedCommands ?? [])
}

function issueValues(
  issues: { code: string; value?: string }[],
  code: string,
): string[] {
  return unique(
    issues
      .filter(issue => issue.code === code && issue.value)
      .map(issue => issue.value!),
  )
}

function emitStatus(
  options: RunPromptPlanOptions,
  task: NexusTask,
  tasks: NexusTask[],
  lastStatuses: Map<string, NexusTaskStatus>,
): void {
  if (lastStatuses.get(task.id) === task.status) return
  lastStatuses.set(task.id, task.status)
  options.onEvent?.({ type: 'status', task, tasks })
  const config = {
    ...DEFAULT_PROMPT_PLANNING_CONFIG,
    ...resolvePromptPlanningConfig(options.config),
  }
  if (config.showTaskBoard) {
    options.onEvent?.({ type: 'board', board: renderTaskBoard(tasks), tasks })
  }
}

async function runOneTask(
  task: NexusTask,
  tasks: NexusTask[],
  options: RunPromptPlanOptions,
  records: Map<string, TaskRunRecord>,
  lastStatuses: Map<string, NexusTaskStatus>,
): Promise<void> {
  const config = {
    ...DEFAULT_PROMPT_PLANNING_CONFIG,
    ...resolvePromptPlanningConfig(options.config),
  }
  const before = validateBeforeExecution(task, {
    cwd: options.cwd,
    strict: config.strictVerification,
  })
  const record: TaskRunRecord = {
    taskId: task.id,
    task,
    startedAt: new Date().toISOString(),
    actualChangedFiles: [],
    reportedChangedFiles: [],
    unreportedChangedFiles: [],
    observedCommands: [],
    reportedCommands: [],
    unverifiedCommandClaims: [],
    preVerification: before,
  }
  records.set(task.id, record)
  if (!before.ok) {
    task.status = 'blocked'
    record.finishedAt = new Date().toISOString()
    emitStatus(options, task, tasks, lastStatuses)
    return
  }

  task.status = 'running'
  emitStatus(options, task, tasks, lastStatuses)
  const workspaceBefore = captureWorkspaceFileState(options.cwd)

  let result: TaskExecutionResult
  try {
    result = await options.executeTask(task)
  } catch (error) {
    result = {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
  const workspaceAfter = captureWorkspaceFileState(options.cwd)
  const actualChangedFiles = unique([
    ...diffWorkspaceFileState(workspaceBefore, workspaceAfter),
    ...(result.observedChangedFiles ?? []),
  ])
  const observed = observedCommands(result)
  const reportedFiles = reportedChangedFiles(result)
  const reportedCommandClaims = reportedCommands(result)

  const after = validateAfterExecution(task, result, {
    cwd: options.cwd,
    strict: config.strictVerification,
    actualChangedFiles,
    commandsRun: observed,
    output: result.output,
  })
  record.execution = result
  record.actualChangedFiles = actualChangedFiles
  record.reportedChangedFiles = reportedFiles
  record.unreportedChangedFiles = issueValues(
    after.issues,
    'unreported_file_change',
  )
  record.observedCommands = observed
  record.reportedCommands = reportedCommandClaims
  record.unverifiedCommandClaims = issueValues(
    after.issues,
    'unsupported_command_claim',
  )
  record.postVerification = after
  record.finishedAt = new Date().toISOString()
  task.status = result.ok && after.ok ? 'finished' : 'failed'
  emitStatus(options, task, tasks, lastStatuses)
}

export async function runPromptPlan(
  plan: PromptPlan,
  options: RunPromptPlanOptions,
): Promise<RunPromptPlanResult> {
  const config = {
    ...DEFAULT_PROMPT_PLANNING_CONFIG,
    ...resolvePromptPlanningConfig(options.config ?? plan.config),
  }
  const tasks = cloneTasks(plan.tasks)
  const tasksById = new Map(tasks.map(task => [task.id, task]))
  const records = new Map<string, TaskRunRecord>()
  const activeLocks = new Set<string>()
  const running = new Set<Promise<void>>()
  const lastStatuses = new Map<string, NexusTaskStatus>()
  const maxAgents = config.parallelAgents ? config.maxAgents : 1

  while (true) {
    for (const task of tasks) {
      if (task.status === 'pending' && dependenciesFailed(task, tasksById)) {
        task.status = 'blocked'
        emitStatus(options, task, tasks, lastStatuses)
      }
      if (task.status === 'pending' && dependenciesFinished(task, tasksById)) {
        task.status = 'ready'
        emitStatus(options, task, tasks, lastStatuses)
      }
    }

    const ready = tasks.filter(
      task =>
        task.status === 'ready' &&
        running.size < maxAgents &&
        !isLocked(task, activeLocks),
    )

    for (const task of ready) {
      if (running.size >= maxAgents) break
      if (isLocked(task, activeLocks)) continue
      acquireLocks(task, activeLocks)
      const promise = runOneTask(
        task,
        tasks,
        options,
        records,
        lastStatuses,
      ).finally(() => {
        releaseLocks(task, activeLocks)
        running.delete(promise)
      })
      running.add(promise)
    }

    if (running.size === 0) {
      const open = tasks.some(task =>
        ['pending', 'ready', 'running'].includes(task.status),
      )
      if (!open) return summary(tasks, records)

      for (const task of tasks) {
        if (task.status === 'pending' || task.status === 'ready') {
          task.status = 'blocked'
          records.set(task.id, {
            taskId: task.id,
            task,
            finishedAt: new Date().toISOString(),
            actualChangedFiles: [],
            reportedChangedFiles: [],
            unreportedChangedFiles: [],
            observedCommands: [],
            reportedCommands: [],
            unverifiedCommandClaims: [],
            preVerification: {
              ok: false,
              blocked: true,
              issues: [
                {
                  code: 'unsatisfied_dependencies',
                  message: `${task.id} could not run because dependencies did not finish.`,
                  severity: 'error',
                },
              ],
            },
          })
          emitStatus(options, task, tasks, lastStatuses)
        }
      }
      return summary(tasks, records)
    }

    await Promise.race(running)
  }
}
