import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { TaskScheduler } from './scheduler.js'
import type {
  BackgroundAgentDto,
  BackgroundAgentInstructionDto,
  BackgroundAgentTrajectoryDto,
  BackgroundAgentTurnDto,
  RuntimeEvent,
} from '../../shared/ipc.js'
import { getAppDataPath } from '../utils/appDataPath.js'
import { recordPlaybookOutcome } from '../missionControlStore.js'
import {
  openProjectAndCache,
  startRun,
  runPromptStream,
  stopRunById,
  emitToRenderer,
  getCurrentMaxParallelAgents,
} from '../runtime.js'

const MAX_LOG_LINES = 500
const MAX_TURNS = 120
const MAX_INSTRUCTIONS = 50
const MAX_STORE_BYTES = 32 * 1024 * 1024

export interface BackgroundAgentRecord extends BackgroundAgentDto {
  logs: string[]
  sourcePlaybookId?: string
  playbookOutcomeRecorded?: boolean
}

const agents = new Map<string, BackgroundAgentRecord>()
let scheduler: TaskScheduler | null = null
let loaded = false
let persistQueue: Promise<void> = Promise.resolve()

async function storePath(): Promise<string> {
  const dir = await getAppDataPath()
  return path.join(dir, 'background-agents.json')
}

function persist(): void {
  // Serialize writes so rapid state changes cannot interleave file content.
  const write = persistQueue.catch(() => undefined).then(async () => {
    const file = await storePath()
    await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 })
    const records = [...agents.values()]
    const serialized = `${JSON.stringify({ agents: records }, null, 2)}\n`
    if (Buffer.byteLength(serialized, 'utf-8') > MAX_STORE_BYTES) {
      throw new Error('Background-agent store exceeds the 32 MiB limit')
    }
    const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`
    await fs.writeFile(temporary, serialized, { encoding: 'utf-8', mode: 0o600 })
    await fs.rename(temporary, file)
  })
  // Attach a handler immediately so a disk error is reported without becoming
  // an unhandled rejection. Keep the original promise for flush callers.
  void write.catch(error => {
    console.warn(
      `[background-agents] persistence failed: ${error instanceof Error ? error.message : String(error)}`,
    )
  })
  persistQueue = write
}

/** Wait for pending writes; used by tests and app shutdown. */
export async function flushBackgroundAgentStore(): Promise<void> {
  await persistQueue
}

async function loadStore(): Promise<void> {
  if (loaded) return
  loaded = true
  const file = await storePath()
  try {
    const data = JSON.parse(await fs.readFile(file, 'utf-8')) as {
      agents?: BackgroundAgentRecord[]
    }
    for (const stored of data.agents ?? []) {
      const record: BackgroundAgentRecord = {
        ...stored,
        logs: Array.isArray(stored.logs) ? stored.logs : [],
        changedFiles: Array.isArray(stored.changedFiles) ? stored.changedFiles : [],
        instructions: Array.isArray(stored.instructions) ? stored.instructions : [],
        turns: Array.isArray(stored.turns)
          ? stored.turns
          : [{
              id: `turn-${randomUUID().slice(0, 8)}`,
              role: 'user',
              content: stored.prompt,
              createdAt: stored.createdAt,
            }],
        trajectory: stored.trajectory ?? emptyTrajectory(),
      }
      agents.set(record.id, record)
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return
    if (error instanceof SyntaxError) {
      await fs.rename(
        file,
        path.join(
          path.dirname(file),
          `background-agents.corrupt-${Date.now()}.json`,
        ),
      )
      return
    }
    loaded = false
    throw error
  }
}

/**
 * Mark agents that claim to be running/queued as interrupted: their process
 * no longer exists after an app restart, and pretending otherwise would be
 * fake state.
 */
export async function reconcileBackgroundAgents(): Promise<number> {
  await loadStore()
  let reconciled = 0
  for (const record of agents.values()) {
    if (record.status === 'running' || record.status === 'queued') {
      record.status = 'interrupted'
      record.error =
        'The app exited while this agent was active; its process no longer exists'
      record.finishedAt = new Date().toISOString()
      reconciled++
    }
    if (
      record.status === 'done' ||
      record.status === 'failed' ||
      record.status === 'cancelled' ||
      record.status === 'interrupted'
    ) {
      await recordLinkedPlaybookOutcome(record, record.status === 'done')
    }
  }
  if (reconciled > 0) persist()
  return reconciled
}

function getScheduler(): TaskScheduler {
  if (!scheduler) {
    scheduler = new TaskScheduler({
      concurrency: getCurrentMaxParallelAgents(),
      executor: async (task, signal) => {
        const agentId = String(task.payload)
        await executeAgent(agentId, signal)
      },
    })
  }
  return scheduler
}

export function setBackgroundAgentConcurrency(value: number): void {
  getScheduler().setConcurrency(value)
}

function toDto(record: BackgroundAgentRecord, includeLogs: boolean): BackgroundAgentDto {
  const {
    logs,
    sourcePlaybookId: _sourcePlaybookId,
    playbookOutcomeRecorded: _playbookOutcomeRecorded,
    ...rest
  } = record
  return {
    ...rest,
    changedFiles: [...record.changedFiles],
    instructions: record.instructions.map(item => ({ ...item })),
    turns: record.turns.map(turn => ({ ...turn })),
    trajectory: {
      ...record.trajectory,
      checks: record.trajectory.checks.map(check => ({ ...check })),
    },
    logs: includeLogs ? [...logs] : [],
  }
}

async function recordLinkedPlaybookOutcome(
  record: BackgroundAgentRecord,
  success: boolean,
): Promise<void> {
  if (!record.sourcePlaybookId || record.playbookOutcomeRecorded) return
  try {
    await recordPlaybookOutcome(record.sourcePlaybookId, success)
    record.playbookOutcomeRecorded = true
    persist()
  } catch (error) {
    appendLog(
      record,
      `Could not record playbook outcome: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

function update(record: BackgroundAgentRecord, patch: Partial<BackgroundAgentRecord>): void {
  Object.assign(record, { lastActivityAt: new Date().toISOString() }, patch)
  persist()
  emitToRenderer(record.projectRoot, {
    type: 'background_agent_update',
    runId: record.runId ?? '',
    sessionId: record.runId ?? '',
    projectRoot: record.projectRoot,
    timestamp: Date.now(),
    agent: toDto(record, false),
  })
}

function appendLog(record: BackgroundAgentRecord, line: string): void {
  record.logs.push(line)
  if (record.logs.length > MAX_LOG_LINES) {
    record.logs.splice(0, record.logs.length - MAX_LOG_LINES)
  }
}

function emptyTrajectory(): BackgroundAgentTrajectoryDto {
  return {
    eventCount: 0,
    toolCalls: 0,
    commands: 0,
    approvals: 0,
    verificationPassed: false,
    checks: [],
  }
}

function observeTrajectory(
  record: BackgroundAgentRecord,
  event: RuntimeEvent,
): void {
  record.trajectory.eventCount += 1
  if (event.type === 'tool_call_started') record.trajectory.toolCalls += 1
  if (event.type === 'command_started') record.trajectory.commands += 1
  if (event.type === 'approval_required') record.trajectory.approvals += 1
  if (
    event.type === 'verification_completed' &&
    (event as { passed?: boolean }).passed === true
  ) {
    record.trajectory.verificationPassed = true
  }
}

function gradeTrajectory(
  record: BackgroundAgentRecord,
  status: BackgroundAgentDto['status'],
): BackgroundAgentTrajectoryDto {
  const completed = status === 'done'
  const checks = [
    {
      id: 'completion',
      label: 'Run completed',
      passed: completed,
      detail: completed ? 'The agent reached a clean terminal state.' : `Terminal status: ${status}.`,
    },
    {
      id: 'verification',
      label: 'Runtime verification',
      passed: record.trajectory.verificationPassed,
      detail: record.trajectory.verificationPassed
        ? 'The runtime emitted a passing verification event.'
        : 'No passing verification event was captured.',
    },
    {
      id: 'evidence',
      label: 'Evidence captured',
      passed:
        record.trajectory.eventCount > 0 &&
        (record.turns.some(turn => turn.role === 'assistant') ||
          record.changedFiles.length > 0),
      detail: `${record.trajectory.eventCount} events, ${record.trajectory.toolCalls} tool calls, ${record.changedFiles.length} changed files.`,
    },
    {
      id: 'errors',
      label: 'No runtime error',
      passed: !record.error,
      detail: record.error ?? 'No runtime error recorded.',
    },
  ]
  const weights = [40, 25, 20, 15]
  const score = checks.reduce(
    (total, check, index) => total + (check.passed ? weights[index]! : 0),
    0,
  )
  return {
    ...record.trajectory,
    score,
    grade:
      status === 'failed' || status === 'interrupted'
        ? 'failed'
        : score >= 90
          ? 'excellent'
          : score >= 70
            ? 'good'
            : 'needs-attention',
    checks,
  }
}

function appendTurn(
  record: BackgroundAgentRecord,
  turn: Omit<BackgroundAgentTurnDto, 'id' | 'createdAt'>,
): void {
  record.turns.push({
    ...turn,
    id: `turn-${randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
  })
  if (record.turns.length > MAX_TURNS) {
    record.turns.splice(0, record.turns.length - MAX_TURNS)
  }
}

async function executeAgent(agentId: string, signal: AbortSignal): Promise<void> {
  const record = agents.get(agentId)
  if (!record) throw new Error(`Background agent not found: ${agentId}`)
  if (signal.aborted) throw new Error('Cancelled before start')

  update(record, { status: 'running', startedAt: new Date().toISOString() })
  appendLog(record, `Agent started for ${record.projectRoot}`)

  try {
    // Snapshot the current dirty state so agent-made changes can be rewound.
    try {
      const { createCheckpoint } = await import('../checkpoints.js')
      await createCheckpoint({
        projectRoot: record.projectRoot,
        reason: `Before background agent: ${record.title}`,
        trigger: 'before-agent',
      })
    } catch {
      // Checkpointing must not block agent execution.
    }

    await openProjectAndCache(record.projectRoot)
    const { runId, worktreeRoot } = await startRun(record.projectRoot, {
      useWorktree: record.useWorktree,
      nativeApprovals: true,
      ephemeral: true,
    })
    update(record, { runId, worktreeRoot })

    const onAbort = () => {
      appendLog(record, 'Cancellation requested')
      try {
        stopRunById(runId)
      } catch {
        // Run may have already finished.
      }
    }
    signal.addEventListener('abort', onAbort)

    let resultText = record.resultText ?? ''
    let failure: string | null = null
    let prompt = record.prompt
    let instructionId: string | undefined
    try {
      while (!signal.aborted && prompt) {
        let turnResult = ''
        for await (const event of runPromptStream(runId, prompt)) {
          if (signal.aborted) break
          observeTrajectory(record, event)
          // Forward to any open windows so live views stay accurate, tagged
          // with the background agent id.
          emitToRenderer(record.projectRoot, { ...event, backgroundAgentId: agentId })
          switch (event.type) {
            case 'model_stream':
              turnResult += (event as { delta: string }).delta
              break
            case 'tool_call_started': {
              const e = event as { toolName: string }
              appendLog(record, `Tool: ${e.toolName}`)
              break
            }
            case 'command_started': {
              const e = event as { command: string }
              appendLog(record, `$ ${e.command}`)
              break
            }
            case 'changed_files': {
              const e = event as { files: string[] }
              update(record, {
                changedFiles: Array.from(new Set([...record.changedFiles, ...e.files])),
              })
              break
            }
            case 'task_progress':
            case 'agent_progress': {
              const e = event as { message?: string }
              if (e.message) appendLog(record, e.message)
              break
            }
            case 'run_result': {
              const e = event as { usage?: BackgroundAgentDto['usage'] }
              if (e.usage) update(record, { usage: e.usage })
              break
            }
            case 'run_failed': {
              failure = (event as { error: string }).error
              break
            }
          }
        }
        if (turnResult.trim()) {
          resultText = resultText
            ? `${resultText.trimEnd()}\n\n${turnResult.trimStart()}`
            : turnResult
          appendTurn(record, {
            role: 'assistant',
            content: turnResult,
            instructionId,
          })
          update(record, { resultText, turns: record.turns })
        }
        if (failure || signal.aborted) break

        const next = record.instructions.find(item => !item.deliveredAt)
        if (!next) break
        next.deliveredAt = new Date().toISOString()
        instructionId = next.id
        prompt = next.content
        appendTurn(record, {
          role: 'user',
          content: next.content,
          instructionId: next.id,
        })
        appendLog(record, `Steering instruction delivered: ${next.content.slice(0, 120)}`)
        update(record, {
          instructions: record.instructions,
          turns: record.turns,
          currentInstructionId: next.id,
        })
      }
    } finally {
      signal.removeEventListener('abort', onAbort)
    }

    if (signal.aborted) {
      const patch: Partial<BackgroundAgentRecord> = {
        status: 'cancelled',
        finishedAt: new Date().toISOString(),
        resultText: resultText || undefined,
        currentInstructionId: undefined,
      }
      Object.assign(record, patch)
      patch.trajectory = gradeTrajectory(record, 'cancelled')
      update(record, patch)
      appendLog(record, 'Agent cancelled')
      await recordLinkedPlaybookOutcome(record, false)
      throw new Error('Cancelled')
    }
    if (failure) {
      const patch: Partial<BackgroundAgentRecord> = {
        status: 'failed',
        error: failure,
        finishedAt: new Date().toISOString(),
        resultText: resultText || undefined,
        currentInstructionId: undefined,
      }
      Object.assign(record, patch)
      patch.trajectory = gradeTrajectory(record, 'failed')
      update(record, patch)
      appendLog(record, `Agent failed: ${failure}`)
      await recordLinkedPlaybookOutcome(record, false)
      throw new Error(failure)
    }
    const patch: Partial<BackgroundAgentRecord> = {
      status: 'done',
      finishedAt: new Date().toISOString(),
      resultText,
      currentInstructionId: undefined,
    }
    Object.assign(record, patch)
    patch.trajectory = gradeTrajectory(record, 'done')
    update(record, patch)
    appendLog(record, 'Agent finished')
    await recordLinkedPlaybookOutcome(record, true)
  } catch (error) {
    if (record.status === 'running') {
      const message = error instanceof Error ? error.message : String(error)
      Object.assign(record, {
        status: 'failed',
        error: message,
        finishedAt: new Date().toISOString(),
        currentInstructionId: undefined,
      } satisfies Partial<BackgroundAgentRecord>)
      update(record, {
        status: 'failed',
        error: message,
        finishedAt: record.finishedAt,
        currentInstructionId: undefined,
        trajectory: gradeTrajectory(record, 'failed'),
      })
      appendLog(record, `Agent failed during startup: ${message}`)
      await recordLinkedPlaybookOutcome(record, false)
    }
    throw error
  }
}

export interface LaunchBackgroundAgentOptions {
  projectRoot: string
  prompt: string
  useWorktree?: boolean
  retryOf?: string
  sourcePlaybookId?: string
}

export async function launchBackgroundAgent(
  options: LaunchBackgroundAgentOptions,
): Promise<BackgroundAgentDto> {
  await loadStore()
  const id = `bg-${randomUUID().slice(0, 8)}`
  const record: BackgroundAgentRecord = {
    id,
    projectRoot: path.resolve(options.projectRoot),
    prompt: options.prompt,
    title: options.prompt.slice(0, 80),
    status: 'queued',
    createdAt: new Date().toISOString(),
    useWorktree: options.useWorktree,
    retryOf: options.retryOf,
    sourcePlaybookId: options.sourcePlaybookId,
    changedFiles: [],
    logs: [],
    instructions: [],
    turns: [{
      id: `turn-${randomUUID().slice(0, 8)}`,
      role: 'user',
      content: options.prompt,
      createdAt: new Date().toISOString(),
    }],
    trajectory: emptyTrajectory(),
    lastActivityAt: new Date().toISOString(),
  }
  agents.set(id, record)
  update(record, {})

  const bgScheduler = getScheduler()
  bgScheduler.addTask({ id, title: record.title, payload: id })
  // Fire and forget: run() resolves when the queue drains; each launch call
  // may find the queue already running.
  void bgScheduler.run().catch(() => undefined)
  return toDto(record, false)
}

export async function listBackgroundAgents(
  projectRoot?: string,
): Promise<BackgroundAgentDto[]> {
  await loadStore()
  const all = [...agents.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
  const filtered = projectRoot
    ? all.filter(a => a.projectRoot === path.resolve(projectRoot))
    : all
  return filtered.map(a => toDto(a, false))
}

export async function getBackgroundAgent(
  id: string,
): Promise<BackgroundAgentDto | null> {
  await loadStore()
  const record = agents.get(id)
  return record ? toDto(record, true) : null
}

export async function cancelBackgroundAgent(id: string): Promise<void> {
  await loadStore()
  const record = agents.get(id)
  if (!record) throw new Error(`Background agent not found: ${id}`)
  if (record.status !== 'queued' && record.status !== 'running') {
    throw new Error(`Agent ${id} is not active (status: ${record.status})`)
  }
  getScheduler().cancelTask(id)
  // Queued agents settle immediately; running ones settle via the abort path.
  if (record.status === 'queued') {
    update(record, {
      status: 'cancelled',
      finishedAt: new Date().toISOString(),
    })
    await recordLinkedPlaybookOutcome(record, false)
  }
}

export async function steerBackgroundAgent(
  id: string,
  content: string,
): Promise<BackgroundAgentDto> {
  await loadStore()
  const record = agents.get(id)
  if (!record) throw new Error(`Background agent not found: ${id}`)
  if (record.status !== 'queued' && record.status !== 'running') {
    throw new Error(`Agent ${id} is not active (status: ${record.status})`)
  }
  const instructionText = content.trim()
  if (!instructionText) throw new Error('Steering instruction cannot be empty')
  if (instructionText.length > 32_000) {
    throw new Error('Steering instruction exceeds the 32,000 character limit')
  }
  if (record.instructions.length >= MAX_INSTRUCTIONS) {
    throw new Error(`Agent ${id} has reached the ${MAX_INSTRUCTIONS}-instruction limit`)
  }
  const instruction: BackgroundAgentInstructionDto = {
    id: `instruction-${randomUUID().slice(0, 8)}`,
    content: instructionText,
    createdAt: new Date().toISOString(),
  }
  record.instructions.push(instruction)
  appendLog(record, `Steering instruction queued: ${instructionText.slice(0, 120)}`)
  update(record, { instructions: record.instructions })
  return toDto(record, true)
}

export async function broadcastBackgroundAgentInstruction(
  projectRoot: string,
  content: string,
  agentIds?: string[],
): Promise<BackgroundAgentDto[]> {
  await loadStore()
  const selected = new Set(agentIds ?? [])
  const active = [...agents.values()].filter(record => {
    const inProject = record.projectRoot === path.resolve(projectRoot)
    const selectedAgent = selected.size === 0 || selected.has(record.id)
    return (
      inProject &&
      selectedAgent &&
      (record.status === 'queued' || record.status === 'running')
    )
  })
  if (active.length === 0) {
    throw new Error('No active background agents matched this broadcast')
  }
  const steered: BackgroundAgentDto[] = []
  for (const record of active) {
    steered.push(await steerBackgroundAgent(record.id, content))
  }
  return steered
}

export async function retryBackgroundAgent(id: string): Promise<BackgroundAgentDto> {
  await loadStore()
  const record = agents.get(id)
  if (!record) throw new Error(`Background agent not found: ${id}`)
  if (record.status === 'queued' || record.status === 'running') {
    throw new Error('Agent is still active; cancel it before retrying')
  }
  return launchBackgroundAgent({
    projectRoot: record.projectRoot,
    prompt: record.prompt,
    useWorktree: record.useWorktree,
    retryOf: id,
  })
}

export async function removeBackgroundAgent(id: string): Promise<boolean> {
  await loadStore()
  const record = agents.get(id)
  if (!record) return false
  if (record.status === 'queued' || record.status === 'running') {
    throw new Error('Cancel the agent before removing its record')
  }
  agents.delete(id)
  persist()
  return true
}

/** Test-only: stop active work, flush persistence, and clear in-memory state. */
export async function resetBackgroundAgentsForTests(): Promise<void> {
  if (scheduler) {
    scheduler.cancelAll()
    await scheduler.run().catch(() => undefined)
  }
  await persistQueue.catch(() => undefined)
  agents.clear()
  scheduler = null
  loaded = false
  persistQueue = Promise.resolve()
}
