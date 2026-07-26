import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { getAppDataPath } from './utils/appDataPath.js'
import type { Task } from './taskAgentRegistry.js'

/**
 * Cross-session task persistence.
 *
 * The task registry is in-memory, so every task vanished when the app closed
 * and the Tasks page came back empty even though the work it described had
 * really happened. This store keeps a durable record so tasks outlive the
 * process that created them.
 *
 * Two shape changes matter. `changedFiles` is a Set in memory and an array on
 * disk. And a task that was mid-flight when the process died cannot still be
 * running on load — those are reconciled to `interrupted` on read, matching how
 * run state already treats abandoned runs, so the UI never shows a spinner for
 * work nothing is doing.
 */

const MAX_STORE_BYTES = 16 * 1024 * 1024
const DEFAULT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

export type PersistedTaskStatus = Task['status'] | 'interrupted'

export interface PersistedTask {
  id: string
  runId: string
  projectRoot: string
  index: number
  title: string
  description?: string
  status: PersistedTaskStatus
  assignedAgent?: string
  dependencies: string[]
  changedFiles: string[]
  verification?: Task['verification']
  elapsedMs: number
  /** Epoch ms of the last write, used for retention pruning. */
  updatedAt: number
}

interface TaskStoreState {
  version: 1
  tasks: PersistedTask[]
}

function emptyState(): TaskStoreState {
  return { version: 1, tasks: [] }
}

async function statePath(): Promise<string> {
  return path.join(await getAppDataPath(), 'tasks.json')
}

function safeTasks(value: unknown): PersistedTask[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (entry): entry is PersistedTask =>
      !!entry &&
      typeof entry === 'object' &&
      typeof (entry as PersistedTask).id === 'string' &&
      typeof (entry as PersistedTask).runId === 'string',
  )
}

/** A task cannot still be running once the process that ran it is gone. */
function reconcile(task: PersistedTask): PersistedTask {
  if (task.status === 'running' || task.status === 'waiting_approval') {
    return { ...task, status: 'interrupted' }
  }
  return task
}

let statePromise: Promise<TaskStoreState> | null = null

async function loadState(): Promise<TaskStoreState> {
  if (statePromise) return statePromise
  statePromise = (async () => {
    const file = await statePath()
    try {
      const info = await fs.stat(file)
      if (info.size > MAX_STORE_BYTES) {
        throw new Error('Task store exceeds the 16 MiB limit')
      }
      const parsed = JSON.parse(await fs.readFile(file, 'utf-8')) as Partial<TaskStoreState>
      return { version: 1 as const, tasks: safeTasks(parsed.tasks).map(reconcile) }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyState()
      if (
        error instanceof SyntaxError ||
        (error instanceof Error && error.message.includes('exceeds the 16 MiB limit'))
      ) {
        const quarantine = path.join(
          path.dirname(file),
          `tasks.corrupt-${Date.now()}.json`,
        )
        await fs.rename(file, quarantine).catch(() => undefined)
        return emptyState()
      }
      throw error
    }
  })()
  return statePromise
}

async function persist(state: TaskStoreState): Promise<void> {
  const file = await statePath()
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 })
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`
  const serialized = `${JSON.stringify(state, null, 2)}\n`
  if (Buffer.byteLength(serialized, 'utf-8') > MAX_STORE_BYTES) {
    throw new Error('Task store exceeds the 16 MiB limit')
  }
  await fs.writeFile(temporary, serialized, { encoding: 'utf-8', mode: 0o600 })
  await fs.rename(temporary, file)
}

let queue: Promise<unknown> = Promise.resolve()

/** Serialize mutations so concurrent run events cannot interleave writes. */
async function mutate<T>(operation: (state: TaskStoreState) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const state = await loadState()
    const result = await operation(state)
    await persist(state)
    return result
  })
  queue = run.catch(() => undefined)
  return run
}

export function toPersistedTask(task: Task): PersistedTask {
  return {
    id: task.id,
    runId: task.runId,
    projectRoot: task.projectRoot,
    index: task.index,
    title: task.title,
    description: task.description,
    status: task.status,
    assignedAgent: task.assignedAgent,
    dependencies: [...task.dependencies],
    changedFiles: [...task.changedFiles],
    verification: task.verification,
    elapsedMs: task.elapsedMs,
    updatedAt: Date.now(),
  }
}

/** Insert or replace tasks, matching on runId + task id. */
export async function saveTasks(tasks: Task[]): Promise<void> {
  if (tasks.length === 0) return
  const incoming = tasks.map(toPersistedTask)
  await mutate(state => {
    for (const task of incoming) {
      const existing = state.tasks.findIndex(
        candidate => candidate.runId === task.runId && candidate.id === task.id,
      )
      if (existing >= 0) state.tasks[existing] = task
      else state.tasks.push(task)
    }
  })
}

export async function listPersistedTasks(projectRoot?: string): Promise<PersistedTask[]> {
  const state = await loadState()
  const tasks = projectRoot
    ? state.tasks.filter(task => task.projectRoot === projectRoot)
    : state.tasks
  return [...tasks].sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function clearPersistedTasks(runId?: string): Promise<void> {
  await mutate(state => {
    state.tasks = runId ? state.tasks.filter(task => task.runId !== runId) : []
  })
}

/** Drop records past the retention window so the store cannot grow forever. */
export async function pruneTasks(
  retentionMs: number = DEFAULT_RETENTION_MS,
  now: number = Date.now(),
): Promise<number> {
  return mutate(state => {
    const before = state.tasks.length
    state.tasks = state.tasks.filter(task => now - task.updatedAt <= retentionMs)
    return before - state.tasks.length
  })
}

/** Test seam: drops the cached state so the next read hits disk again. */
export function resetTaskStoreCache(): void {
  statePromise = null
  queue = Promise.resolve()
}
