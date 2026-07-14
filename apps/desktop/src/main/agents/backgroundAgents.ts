import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { TaskScheduler } from './scheduler.js'
import type { BackgroundAgentDto } from '../../shared/ipc.js'
import { getAppDataPath } from '../utils/appDataPath.js'
import {
  openProjectAndCache,
  startRun,
  runPromptStream,
  stopRunById,
  emitToRenderer,
  getCurrentMaxParallelAgents,
} from '../runtime.js'

const MAX_LOG_LINES = 500

export interface BackgroundAgentRecord extends BackgroundAgentDto {
  logs: string[]
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
  persistQueue = persistQueue.then(async () => {
    const file = await storePath()
    await fs.mkdir(path.dirname(file), { recursive: true })
    const records = [...agents.values()]
    await fs.writeFile(file, JSON.stringify({ agents: records }, null, 2), 'utf-8')
  })
}

/** Wait for pending writes; used by tests and app shutdown. */
export async function flushBackgroundAgentStore(): Promise<void> {
  await persistQueue
}

async function loadStore(): Promise<void> {
  if (loaded) return
  loaded = true
  try {
    const file = await storePath()
    const data = JSON.parse(await fs.readFile(file, 'utf-8')) as {
      agents?: BackgroundAgentRecord[]
    }
    for (const record of data.agents ?? []) {
      agents.set(record.id, record)
    }
  } catch {
    // First launch: no store yet.
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
  const { logs, ...rest } = record
  return includeLogs ? { ...rest, logs } : { ...rest, logs: [] }
}

function update(record: BackgroundAgentRecord, patch: Partial<BackgroundAgentRecord>): void {
  Object.assign(record, patch)
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

async function executeAgent(agentId: string, signal: AbortSignal): Promise<void> {
  const record = agents.get(agentId)
  if (!record) throw new Error(`Background agent not found: ${agentId}`)
  if (signal.aborted) throw new Error('Cancelled before start')

  update(record, { status: 'running', startedAt: new Date().toISOString() })
  appendLog(record, `Agent started for ${record.projectRoot}`)

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

  let resultText = ''
  let failure: string | null = null
  try {
    for await (const event of runPromptStream(runId, record.prompt)) {
      if (signal.aborted) break
      // Forward to any open windows so live views stay accurate, tagged
      // with the background agent id.
      emitToRenderer(record.projectRoot, { ...event, backgroundAgentId: agentId })
      switch (event.type) {
        case 'model_stream':
          resultText += (event as { delta: string }).delta
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
  } finally {
    signal.removeEventListener('abort', onAbort)
  }

  if (signal.aborted) {
    update(record, {
      status: 'cancelled',
      finishedAt: new Date().toISOString(),
      resultText: resultText || undefined,
    })
    appendLog(record, 'Agent cancelled')
    throw new Error('Cancelled')
  }
  if (failure) {
    update(record, {
      status: 'failed',
      error: failure,
      finishedAt: new Date().toISOString(),
      resultText: resultText || undefined,
    })
    appendLog(record, `Agent failed: ${failure}`)
    throw new Error(failure)
  }
  update(record, {
    status: 'done',
    finishedAt: new Date().toISOString(),
    resultText,
  })
  appendLog(record, 'Agent finished')
}

export interface LaunchBackgroundAgentOptions {
  projectRoot: string
  prompt: string
  useWorktree?: boolean
  retryOf?: string
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
    changedFiles: [],
    logs: [],
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
  }
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
