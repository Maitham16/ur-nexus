import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatSessionDto } from '../../shared/ipc.js'
import { useDesktop } from './useDesktop.js'

/**
 * Named chat tabs for one project.
 *
 * The chat surface keeps a single conversation in React state. Rather than
 * rewrite that into a per-session store — which would touch every handler in
 * ChatPage — this hook keeps the active conversation where it already lives and
 * parks the inactive ones in a ref keyed by session id. Switching tabs snapshots
 * what is on screen, then restores the target.
 *
 * A ref rather than state holds the snapshots deliberately: they are written on
 * every switch and never rendered directly, so putting them in state would
 * re-render the whole chat for no visible change.
 */

export interface ChatSessionsApi<TSnapshot> {
  sessions: ChatSessionDto[]
  activeId: string | null
  loading: boolean
  error: string | null
  /** Snapshot of the session being left, if one was stored for it. */
  select: (id: string) => TSnapshot | undefined
  create: (title?: string) => Promise<string | undefined>
  rename: (id: string, title: string) => Promise<void>
  close: (id: string) => Promise<TSnapshot | undefined>
  reorder: (orderedIds: string[]) => Promise<void>
  bindRun: (runId: string | undefined) => Promise<void>
  /** Store the live conversation for the active session before switching away. */
  capture: (snapshot: TSnapshot) => void
}

export function useChatSessions<TSnapshot>(
  projectRoot: string | null,
  emptySnapshot: () => TSnapshot,
): ChatSessionsApi<TSnapshot> {
  const desktop = useDesktop()
  const [sessions, setSessions] = useState<ChatSessionDto[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const snapshots = useRef(new Map<string, TSnapshot>())
  const activeRef = useRef<string | null>(null)

  activeRef.current = activeId

  // Load the project's tabs, creating the first one so the strip is never
  // empty. Switching projects discards snapshots: they describe conversations
  // in a workspace that is no longer open.
  useEffect(() => {
    if (!desktop || !projectRoot) {
      setSessions([])
      setActiveId(null)
      snapshots.current.clear()
      return
    }
    let cancelled = false
    setLoading(true)
    void (async () => {
      try {
        let list = await desktop.listChatSessions(projectRoot)
        if (list.length === 0) {
          const created = await desktop.createChatSession(projectRoot)
          list = [created]
        }
        if (cancelled) return
        snapshots.current.clear()
        setSessions(list)
        setActiveId(list[0]?.id ?? null)
        setError(null)
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : String(cause))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [desktop, projectRoot])

  const capture = useCallback((snapshot: TSnapshot) => {
    const id = activeRef.current
    if (id) snapshots.current.set(id, snapshot)
  }, [])

  const select = useCallback(
    (id: string): TSnapshot | undefined => {
      if (id === activeRef.current) return undefined
      setActiveId(id)
      return snapshots.current.get(id) ?? emptySnapshot()
    },
    [emptySnapshot],
  )

  const create = useCallback(
    async (title?: string): Promise<string | undefined> => {
      if (!desktop || !projectRoot) return undefined
      try {
        const created = await desktop.createChatSession(projectRoot, title)
        setSessions(current => [...current, created])
        setActiveId(created.id)
        setError(null)
        return created.id
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : String(cause))
        return undefined
      }
    },
    [desktop, projectRoot],
  )

  const rename = useCallback(
    async (id: string, title: string): Promise<void> => {
      if (!desktop) return
      try {
        const updated = await desktop.renameChatSession(id, title)
        setSessions(current =>
          current.map(session => (session.id === id ? updated : session)),
        )
        setError(null)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : String(cause))
      }
    },
    [desktop],
  )

  const close = useCallback(
    async (id: string): Promise<TSnapshot | undefined> => {
      if (!desktop || !projectRoot) return undefined
      try {
        await desktop.archiveChatSession(id)
        snapshots.current.delete(id)
        const remaining = sessions.filter(session => session.id !== id)
        // Closing the last tab would leave nothing to show, so open a fresh one
        // instead of rendering an empty chat with no way back.
        if (remaining.length === 0) {
          const created = await desktop.createChatSession(projectRoot)
          setSessions([created])
          setActiveId(created.id)
          return emptySnapshot()
        }
        setSessions(remaining)
        if (id !== activeRef.current) return undefined
        const neighbour = remaining[remaining.length - 1]
        setActiveId(neighbour?.id ?? null)
        return neighbour ? snapshots.current.get(neighbour.id) ?? emptySnapshot() : undefined
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : String(cause))
        return undefined
      }
    },
    [desktop, projectRoot, sessions, emptySnapshot],
  )

  const reorder = useCallback(
    async (orderedIds: string[]): Promise<void> => {
      if (!desktop || !projectRoot) return
      // Apply locally first so dragging feels immediate, then reconcile.
      setSessions(current => {
        const byId = new Map(current.map(session => [session.id, session]))
        const next = orderedIds
          .map(id => byId.get(id))
          .filter((session): session is ChatSessionDto => !!session)
        const untouched = current.filter(session => !orderedIds.includes(session.id))
        return [...next, ...untouched]
      })
      try {
        setSessions(await desktop.reorderChatSessions(projectRoot, orderedIds))
        setError(null)
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : String(cause))
      }
    },
    [desktop, projectRoot],
  )

  const bindRun = useCallback(
    async (runId: string | undefined): Promise<void> => {
      const id = activeRef.current
      if (!desktop || !id) return
      try {
        const updated = await desktop.bindChatSessionRun(id, runId)
        setSessions(current =>
          current.map(session => (session.id === id ? updated : session)),
        )
      } catch {
        // A failed bind only costs the tab its run badge; the run itself is
        // unaffected, so this must not surface as a chat error.
      }
    },
    [desktop],
  )

  return {
    sessions,
    activeId,
    loading,
    error,
    select,
    create,
    rename,
    close,
    reorder,
    bindRun,
    capture,
  }
}
