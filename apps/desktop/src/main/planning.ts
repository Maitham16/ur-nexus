import { randomUUID } from 'node:crypto'
import type { PlanDto, PlanTaskDto } from '../shared/ipc.js'
import {
  openProjectAndCache,
  startRun,
  runPromptStream,
  emitToRenderer,
  getCurrentMaxParallelAgents,
} from './runtime.js'
import {
  createTask,
  startTask,
  completeTask,
  failTask,
  skipTask,
  startAgent,
  finishAgent,
  failAgent,
} from './taskAgentRegistry.js'
import { TaskScheduler } from './agents/scheduler.js'

/**
 * Decide whether a prompt warrants a planning pass. Simple questions and
 * single short actions execute directly; multi-step or multi-concern work
 * gets planned. Deterministic so it can be unit-tested.
 */
export function shouldPlan(prompt: string): boolean {
  const text = prompt.trim()
  if (text.length === 0) return false
  // Pure questions rarely need task decomposition.
  if (/^(what|why|how|where|when|who|which|is|are|does|do|can|could|should)\b/i.test(text) && text.length < 300) {
    return false
  }
  if (text.length > 400) return true
  const stepMarkers =
    /\b(then|after that|afterwards|next,|finally|first|second|third|step \d)\b/gi
  const conjunctionCount = (text.match(stepMarkers) ?? []).length
  if (conjunctionCount >= 2) return true
  if (/^\s*(\d+[.)]|[-*])\s+/m.test(text) && text.split('\n').length >= 3) return true
  const heavyVerbs =
    /\b(refactor|migrate|implement|redesign|rewrite|overhaul|integrate)\b/i
  const combinedWork = /\band (also )?(add|write|update|fix|create)\b/i
  if (heavyVerbs.test(text) && (text.length > 100 || combinedWork.test(text))) {
    return true
  }
  return false
}

const SUSPECT_TITLES = [
  /^task \d+$/i,
  /^todo/i,
  /^placeholder/i,
  /^step \d+$/i,
  /^\.+$/,
  /^tbd$/i,
  /^do (the )?(thing|work|task)/i,
]

export function buildPlanningPrompt(userPrompt: string): string {
  return [
    'Break the following request into an ordered, dependency-aware task plan.',
    'Respond with ONLY a JSON object, no prose, matching exactly:',
    '{"tasks":[{"id":"t1","title":"…","description":"…","role":"coder|reviewer|tester|researcher","dependencies":["t0"],"fileTargets":["relative/path"],"expectedOutput":"…","verification":"…"}]}',
    'Rules: 2-8 tasks; ids t1..tN; dependencies reference earlier ids only;',
    'titles must be specific actions, not placeholders; fileTargets lists the',
    'files the task is expected to modify (empty array when unknown);',
    'verification describes how to confirm the task worked.',
    '',
    'Request:',
    userPrompt,
  ].join('\n')
}

export class PlanParseError extends Error {}

export function parsePlanResponse(text: string, originalPrompt: string): PlanDto {
  // Accept fenced or bare JSON; take the first balanced object.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1] : text
  const start = candidate.indexOf('{')
  if (start === -1) {
    throw new PlanParseError('Planning response contained no JSON object')
  }
  let parsed: { tasks?: unknown }
  try {
    parsed = JSON.parse(candidate.slice(start, candidate.lastIndexOf('}') + 1)) as {
      tasks?: unknown
    }
  } catch (err) {
    throw new PlanParseError(
      `Planning response was not valid JSON: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
  if (!Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
    throw new PlanParseError('Plan has no tasks')
  }

  const tasks: PlanTaskDto[] = []
  const seen = new Set<string>()
  for (let i = 0; i < parsed.tasks.length; i++) {
    const raw = parsed.tasks[i] as Record<string, unknown>
    const id = typeof raw.id === 'string' && raw.id ? raw.id : `t${i + 1}`
    const title = typeof raw.title === 'string' ? raw.title.trim() : ''
    if (!title) throw new PlanParseError(`Task ${id} has no title`)
    if (SUSPECT_TITLES.some(p => p.test(title))) {
      throw new PlanParseError(`Task ${id} has a placeholder title: "${title}"`)
    }
    if (seen.has(id)) throw new PlanParseError(`Duplicate task id: ${id}`)
    const dependencies = Array.isArray(raw.dependencies)
      ? raw.dependencies.filter((d): d is string => typeof d === 'string')
      : []
    for (const dep of dependencies) {
      if (!seen.has(dep)) {
        throw new PlanParseError(
          `Task ${id} depends on ${dep}, which is not an earlier task`,
        )
      }
    }
    seen.add(id)
    tasks.push({
      id,
      title,
      description: typeof raw.description === 'string' ? raw.description : '',
      role: typeof raw.role === 'string' ? raw.role : 'coder',
      dependencies,
      fileTargets: Array.isArray(raw.fileTargets)
        ? raw.fileTargets.filter((f): f is string => typeof f === 'string')
        : [],
      expectedOutput:
        typeof raw.expectedOutput === 'string' ? raw.expectedOutput : '',
      verification:
        typeof raw.verification === 'string' ? raw.verification : '',
    })
  }
  return {
    id: `plan-${randomUUID().slice(0, 8)}`,
    prompt: originalPrompt,
    tasks,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Generate a plan with a real one-shot model run. Fails loudly when the
 * provider is unavailable or the model does not produce a valid plan.
 */
export async function generatePlan(
  projectRoot: string,
  prompt: string,
): Promise<PlanDto> {
  await openProjectAndCache(projectRoot)
  const { runId } = await startRun(projectRoot)
  let responseText = ''
  let failure: string | null = null
  for await (const event of runPromptStream(runId, buildPlanningPrompt(prompt))) {
    if (event.type === 'model_stream') {
      responseText += (event as { delta: string }).delta
    } else if (event.type === 'run_failed') {
      failure = (event as { error: string }).error
    }
  }
  if (failure) {
    throw new Error(`Planning failed: ${failure}`)
  }
  return parsePlanResponse(responseText, prompt)
}

/**
 * Execute an approved plan: each task runs as a real agent session under the
 * dependency-aware scheduler with file-target locking. Task states mirror
 * into the shared task registry so the live task board reflects reality.
 */
export async function executePlan(
  projectRoot: string,
  plan: PlanDto,
): Promise<{ planId: string; tasks: Array<{ id: string; status: string; error?: string }> }> {
  await openProjectAndCache(projectRoot)

  const emitTaskEvent = (type: string, payload: Record<string, unknown>) => {
    emitToRenderer(projectRoot, {
      type,
      runId: plan.id,
      sessionId: plan.id,
      projectRoot,
      timestamp: Date.now(),
      ...payload,
    })
  }

  plan.tasks.forEach((task, index) => {
    createTask(plan.id, task.id, {
      index: index + 1,
      title: task.title,
      description: task.description,
      dependencies: task.dependencies,
    })
    emitTaskEvent('task_created', {
      taskId: task.id,
      title: task.title,
      description: task.description,
      index: index + 1,
      dependencies: task.dependencies,
    })
  })

  const scheduler = new TaskScheduler({
    concurrency: getCurrentMaxParallelAgents(),
    onTaskChange: task => {
      switch (task.status) {
        case 'running':
          startTask(plan.id, task.id, task.id)
          startAgent(plan.id, task.id, task.id)
          emitTaskEvent('task_started', { taskId: task.id, assignedAgent: task.id })
          break
        case 'done':
          completeTask(plan.id, task.id)
          finishAgent(plan.id, task.id)
          emitTaskEvent('task_done', { taskId: task.id })
          break
        case 'failed':
          failTask(plan.id, task.id, task.error ?? 'failed')
          failAgent(plan.id, task.id, task.error ?? 'failed')
          emitTaskEvent('task_failed', { taskId: task.id, error: task.error ?? 'failed' })
          break
        case 'cancelled':
        case 'skipped':
          skipTask(plan.id, task.id)
          emitTaskEvent('task_skipped', { taskId: task.id })
          break
        default:
          break
      }
    },
    executor: async (scheduled, signal) => {
      const planTask = plan.tasks.find(t => t.id === scheduled.id)
      if (!planTask) throw new Error(`Unknown plan task ${scheduled.id}`)
      if (signal.aborted) throw new Error('Cancelled')
      const { runId } = await startRun(projectRoot)
      const taskPrompt = [
        `You are executing one task of a larger plan. Original request:`,
        plan.prompt,
        '',
        `Your task: ${planTask.title}`,
        planTask.description,
        planTask.expectedOutput ? `Expected output: ${planTask.expectedOutput}` : '',
        planTask.verification ? `Verify by: ${planTask.verification}` : '',
      ]
        .filter(Boolean)
        .join('\n')
      let failure: string | null = null
      for await (const event of runPromptStream(runId, taskPrompt)) {
        if (signal.aborted) break
        emitToRenderer(projectRoot, { ...event, planId: plan.id, planTaskId: scheduled.id })
        if (event.type === 'run_failed') {
          failure = (event as { error: string }).error
        }
      }
      if (signal.aborted) throw new Error('Cancelled')
      if (failure) throw new Error(failure)
    },
  })

  for (const task of plan.tasks) {
    scheduler.addTask({
      id: task.id,
      title: task.title,
      dependencies: task.dependencies,
      fileTargets: task.fileTargets,
    })
  }

  const settled = await scheduler.run()
  return {
    planId: plan.id,
    tasks: settled.map(t => ({ id: t.id, status: t.status, error: t.error })),
  }
}
