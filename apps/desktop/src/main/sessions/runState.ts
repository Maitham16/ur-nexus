import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import { getAppDataPath } from '../utils/appDataPath.js'
import type { PersistedRunStateDto } from '../../shared/ipc.js'

/**
 * Incremental run-state persistence. Every meaningful transition of a live
 * run is written to disk so an interrupted session can be inspected and
 * resumed after an app restart. Provider references are stored by id/model
 * only — never raw keys.
 */

async function stateDir(): Promise<string> {
  const base = await getAppDataPath()
  return path.join(base, 'run-state')
}

async function stateFile(runId: string): Promise<string> {
  return path.join(await stateDir(), `${runId}.json`)
}

const writeQueues = new Map<string, Promise<void>>()

function enqueueWrite(runId: string, task: () => Promise<void>): void {
  const prev = writeQueues.get(runId) ?? Promise.resolve()
  const next = prev.then(task).catch(() => undefined)
  writeQueues.set(runId, next)
}

/** Await all pending writes (tests and shutdown). */
export async function flushRunStates(): Promise<void> {
  await Promise.all([...writeQueues.values()])
}

export async function initRunState(
  init: Pick<
    PersistedRunStateDto,
    'runId' | 'projectRoot' | 'worktreeRoot' | 'provider'
  >,
): Promise<void> {
  const state: PersistedRunStateDto = {
    ...init,
    status: 'running',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedToolCalls: [],
    pendingApprovals: [],
    changedFiles: [],
  }
  enqueueWrite(init.runId, async () => {
    const file = await stateFile(init.runId)
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, JSON.stringify(state, null, 2), 'utf-8')
  })
  await flushRunStates()
}

export async function getRunState(
  runId: string,
): Promise<PersistedRunStateDto | null> {
  try {
    const raw = await fs.readFile(await stateFile(runId), 'utf-8')
    return JSON.parse(raw) as PersistedRunStateDto
  } catch {
    return null
  }
}

export function patchRunState(
  runId: string,
  patch:
    | Partial<PersistedRunStateDto>
    | ((state: PersistedRunStateDto) => PersistedRunStateDto),
): void {
  enqueueWrite(runId, async () => {
    const current = await getRunState(runId)
    if (!current) return
    const next =
      typeof patch === 'function'
        ? patch(current)
        : { ...current, ...patch }
    next.updatedAt = new Date().toISOString()
    await fs.writeFile(
      await stateFile(runId),
      JSON.stringify(next, null, 2),
      'utf-8',
    )
  })
}

export function appendCompletedToolCall(
  runId: string,
  tool: string,
  target?: string,
): void {
  patchRunState(runId, state => ({
    ...state,
    completedToolCalls: [
      ...state.completedToolCalls,
      { tool, target, at: new Date().toISOString() },
    ],
  }))
}

export function addPendingApproval(
  runId: string,
  requestId: string,
  toolName: string,
  target?: string,
): void {
  patchRunState(runId, state => ({
    ...state,
    pendingApprovals: [
      ...state.pendingApprovals.filter(a => a.requestId !== requestId),
      { requestId, toolName, target },
    ],
  }))
}

export function removePendingApproval(runId: string, requestId: string): void {
  patchRunState(runId, state => ({
    ...state,
    pendingApprovals: state.pendingApprovals.filter(
      a => a.requestId !== requestId,
    ),
  }))
}

export async function listRunStates(): Promise<PersistedRunStateDto[]> {
  let entries: string[]
  try {
    entries = await fs.readdir(await stateDir())
  } catch {
    return []
  }
  const states: PersistedRunStateDto[] = []
  for (const entry of entries) {
    if (!entry.endsWith('.json')) continue
    const state = await getRunState(entry.replace(/\.json$/, ''))
    if (state) states.push(state)
  }
  return states.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

/**
 * Startup reconciliation: any run persisted as `running` has no live process
 * after a restart. Flip it to `interrupted`, expire its pending approvals,
 * and mark shell commands as unrecoverable (their partial effects on disk
 * cannot be verified).
 */
export async function reconcileRunStates(): Promise<PersistedRunStateDto[]> {
  const interrupted: PersistedRunStateDto[] = []
  for (const state of await listRunStates()) {
    if (state.status !== 'running') continue
    const ranShellCommands = state.completedToolCalls.some(
      c => c.tool === 'Bash' || c.tool === 'command',
    )
    patchRunState(state.runId, {
      status: 'interrupted',
      pendingApprovals: [],
      interruptionNote: ranShellCommands
        ? 'The app exited mid-run. Shell commands recorded before the interruption completed, but any command in flight at exit may have partially run — verify before repeating it.'
        : 'The app exited mid-run.',
    })
    const updated = await (async () => {
      await flushRunStates()
      return getRunState(state.runId)
    })()
    if (updated) interrupted.push(updated)
  }
  return interrupted
}

export async function listInterruptedRuns(
  projectRoot?: string,
): Promise<PersistedRunStateDto[]> {
  const states = await listRunStates()
  return states.filter(
    s =>
      s.status === 'interrupted' &&
      (!projectRoot || s.projectRoot === path.resolve(projectRoot)),
  )
}

export async function markRunStateFailed(runId: string): Promise<void> {
  patchRunState(runId, { status: 'failed' })
  await flushRunStates()
}

export async function archiveRunState(runId: string): Promise<void> {
  patchRunState(runId, { status: 'archived' })
  await flushRunStates()
}
