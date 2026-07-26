import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { getAppDataPath } from '../utils/appDataPath.js'

/**
 * Named chat sessions.
 *
 * A window could previously hold one conversation: starting a new chat replaced
 * the old one, so there was no way to keep an investigation open while running
 * something else. The runtime already tracks concurrent runs keyed by runId —
 * the limit was that nothing named or persisted them, so there was nothing for
 * a tab strip to render.
 *
 * This store owns that missing model: an ordered, named, persisted set of chat
 * sessions per project, each mapped to at most one live runId. Archiving is
 * preferred over deletion so the transcript a session points at stays
 * reachable from History.
 */

const MAX_STORE_BYTES = 8 * 1024 * 1024
const MAX_SESSIONS_PER_PROJECT = 50

export interface ChatSession {
  id: string
  projectRoot: string
  title: string
  /** The live run backing this session, when one is active. */
  runId?: string
  createdAt: number
  updatedAt: number
  archived: boolean
  /** Ordering within the project's tab strip; lower is further left. */
  order: number
}

interface ChatSessionState {
  version: 1
  sessions: ChatSession[]
}

function emptyState(): ChatSessionState {
  return { version: 1, sessions: [] }
}

async function statePath(): Promise<string> {
  return path.join(await getAppDataPath(), 'chat-sessions.json')
}

function safeSessions(value: unknown): ChatSession[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (entry): entry is ChatSession =>
      !!entry &&
      typeof entry === 'object' &&
      typeof (entry as ChatSession).id === 'string' &&
      typeof (entry as ChatSession).projectRoot === 'string',
  )
}

let statePromise: Promise<ChatSessionState> | null = null

async function loadState(): Promise<ChatSessionState> {
  if (statePromise) return statePromise
  statePromise = (async () => {
    const file = await statePath()
    try {
      const info = await fs.stat(file)
      if (info.size > MAX_STORE_BYTES) {
        throw new Error('Chat session store exceeds the 8 MiB limit')
      }
      const parsed = JSON.parse(await fs.readFile(file, 'utf-8')) as Partial<ChatSessionState>
      // A runId cannot outlive the process that owned it, so every session
      // loads detached and re-binds when a new run starts.
      return {
        version: 1 as const,
        sessions: safeSessions(parsed.sessions).map(session => ({
          ...session,
          runId: undefined,
        })),
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyState()
      if (
        error instanceof SyntaxError ||
        (error instanceof Error && error.message.includes('exceeds the 8 MiB limit'))
      ) {
        const quarantine = path.join(
          path.dirname(file),
          `chat-sessions.corrupt-${Date.now()}.json`,
        )
        await fs.rename(file, quarantine).catch(() => undefined)
        return emptyState()
      }
      throw error
    }
  })()
  return statePromise
}

async function persist(state: ChatSessionState): Promise<void> {
  const file = await statePath()
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 })
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`
  const serialized = `${JSON.stringify(state, null, 2)}\n`
  if (Buffer.byteLength(serialized, 'utf-8') > MAX_STORE_BYTES) {
    throw new Error('Chat session store exceeds the 8 MiB limit')
  }
  await fs.writeFile(temporary, serialized, { encoding: 'utf-8', mode: 0o600 })
  await fs.rename(temporary, file)
}

let queue: Promise<unknown> = Promise.resolve()

async function mutate<T>(operation: (state: ChatSessionState) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const state = await loadState()
    const result = await operation(state)
    await persist(state)
    return result
  })
  queue = run.catch(() => undefined)
  return run
}

function nextOrder(state: ChatSessionState, projectRoot: string): number {
  const orders = state.sessions
    .filter(session => session.projectRoot === projectRoot)
    .map(session => session.order)
  return orders.length === 0 ? 0 : Math.max(...orders) + 1
}

/** Untitled chats are numbered per project so tabs are distinguishable. */
function defaultTitle(state: ChatSessionState, projectRoot: string): string {
  const used = new Set(
    state.sessions
      .filter(session => session.projectRoot === projectRoot)
      .map(session => session.title),
  )
  for (let index = 1; ; index += 1) {
    const candidate = `Chat ${index}`
    if (!used.has(candidate)) return candidate
  }
}

function normalizeTitle(title: string | undefined): string | undefined {
  const trimmed = title?.trim()
  if (!trimmed) return undefined
  return trimmed.length > 120 ? trimmed.slice(0, 120) : trimmed
}

export async function createChatSession(
  projectRoot: string,
  title?: string,
): Promise<ChatSession> {
  return mutate(state => {
    const active = state.sessions.filter(
      session => session.projectRoot === projectRoot && !session.archived,
    )
    if (active.length >= MAX_SESSIONS_PER_PROJECT) {
      throw new Error(
        `A project cannot have more than ${MAX_SESSIONS_PER_PROJECT} open chats`,
      )
    }
    const now = Date.now()
    const session: ChatSession = {
      id: randomUUID(),
      projectRoot,
      title: normalizeTitle(title) ?? defaultTitle(state, projectRoot),
      createdAt: now,
      updatedAt: now,
      archived: false,
      order: nextOrder(state, projectRoot),
    }
    state.sessions.push(session)
    return session
  })
}

export async function listChatSessions(
  projectRoot: string,
  includeArchived = false,
): Promise<ChatSession[]> {
  const state = await loadState()
  return state.sessions
    .filter(
      session =>
        session.projectRoot === projectRoot && (includeArchived || !session.archived),
    )
    .sort((a, b) => a.order - b.order)
}

export async function renameChatSession(id: string, title: string): Promise<ChatSession> {
  const normalized = normalizeTitle(title)
  if (!normalized) throw new Error('A chat title cannot be empty')
  return mutate(state => {
    const session = state.sessions.find(candidate => candidate.id === id)
    if (!session) throw new Error('Chat session not found')
    session.title = normalized
    session.updatedAt = Date.now()
    return session
  })
}

/** Bind a session to a live run, or pass undefined to detach it. */
export async function bindChatSessionRun(
  id: string,
  runId: string | undefined,
): Promise<ChatSession> {
  return mutate(state => {
    const session = state.sessions.find(candidate => candidate.id === id)
    if (!session) throw new Error('Chat session not found')
    if (runId) {
      // One run belongs to one session; stealing it would leave two tabs
      // rendering the same event stream.
      for (const other of state.sessions) {
        if (other.id !== id && other.runId === runId) other.runId = undefined
      }
    }
    session.runId = runId
    session.updatedAt = Date.now()
    return session
  })
}

export async function archiveChatSession(id: string): Promise<ChatSession> {
  return mutate(state => {
    const session = state.sessions.find(candidate => candidate.id === id)
    if (!session) throw new Error('Chat session not found')
    session.archived = true
    session.runId = undefined
    session.updatedAt = Date.now()
    return session
  })
}

/** Reorder a project's tabs. Ids not supplied keep their relative order after. */
export async function reorderChatSessions(
  projectRoot: string,
  orderedIds: string[],
): Promise<ChatSession[]> {
  return mutate(state => {
    const ranks = new Map(orderedIds.map((id, index) => [id, index]))
    const project = state.sessions.filter(session => session.projectRoot === projectRoot)
    for (const session of project) {
      const rank = ranks.get(session.id)
      session.order = rank ?? orderedIds.length + session.order
    }
    return project.sort((a, b) => a.order - b.order)
  })
}

export async function getChatSession(id: string): Promise<ChatSession | undefined> {
  const state = await loadState()
  return state.sessions.find(session => session.id === id)
}

/** Test seam: drops the cached state so the next read hits disk again. */
export function resetChatSessionCache(): void {
  statePromise = null
  queue = Promise.resolve()
}
