import { useEffect, useRef, useState } from 'react'
import type { ChatSessionDto } from '../../shared/ipc.js'

/**
 * Chat tab strip.
 *
 * Renaming happens inline on double-click rather than through a dialog, because
 * naming a chat is a throwaway action and a modal would cost more attention
 * than the rename is worth. Closing archives rather than deletes, so the
 * transcript stays reachable from History.
 */

export interface ChatTabsProps {
  sessions: ChatSessionDto[]
  activeId: string | null
  /** Run ids currently streaming, so a busy tab can be marked. */
  busyRunIds?: string[]
  onSelect: (id: string) => void
  onCreate: () => void
  onRename: (id: string, title: string) => void
  onClose: (id: string) => void
  onReorder?: (orderedIds: string[]) => void
}

export function ChatTabs({
  sessions,
  activeId,
  busyRunIds = [],
  onSelect,
  onCreate,
  onRename,
  onClose,
  onReorder,
}: ChatTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (editingId) inputRef.current?.select()
  }, [editingId])

  const beginRename = (session: ChatSessionDto): void => {
    setEditingId(session.id)
    setDraft(session.title)
  }

  const commitRename = (): void => {
    if (!editingId) return
    const trimmed = draft.trim()
    const original = sessions.find(session => session.id === editingId)?.title
    // Skip the round trip when nothing changed, and reject an empty name rather
    // than letting the store throw for it.
    if (trimmed && trimmed !== original) onRename(editingId, trimmed)
    setEditingId(null)
    setDraft('')
  }

  const handleDrop = (targetId: string): void => {
    if (!dragId || !onReorder || dragId === targetId) {
      setDragId(null)
      return
    }
    const ids = sessions.map(session => session.id)
    const from = ids.indexOf(dragId)
    const to = ids.indexOf(targetId)
    if (from < 0 || to < 0) {
      setDragId(null)
      return
    }
    ids.splice(to, 0, ...ids.splice(from, 1))
    onReorder(ids)
    setDragId(null)
  }

  if (sessions.length === 0) return null

  return (
    <div className="chat-tabs" role="tablist" aria-label="Chats">
      {sessions.map(session => {
        const active = session.id === activeId
        const busy = !!session.runId && busyRunIds.includes(session.runId)
        return (
          <div
            key={session.id}
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className={`chat-tab${active ? ' chat-tab-active' : ''}${
              dragId === session.id ? ' chat-tab-dragging' : ''
            }`}
            draggable={!!onReorder && editingId !== session.id}
            onDragStart={() => setDragId(session.id)}
            onDragOver={event => {
              if (dragId) event.preventDefault()
            }}
            onDrop={() => handleDrop(session.id)}
            onDragEnd={() => setDragId(null)}
            onClick={() => {
              if (editingId !== session.id) onSelect(session.id)
            }}
            onDoubleClick={() => beginRename(session)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelect(session.id)
              }
            }}
          >
            {busy ? <span className="chat-tab-busy" aria-label="Running" /> : null}
            {editingId === session.id ? (
              <input
                ref={inputRef}
                className="chat-tab-rename"
                value={draft}
                autoFocus
                onChange={event => setDraft(event.target.value)}
                onBlur={commitRename}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    commitRename()
                  } else if (event.key === 'Escape') {
                    event.preventDefault()
                    setEditingId(null)
                    setDraft('')
                  }
                }}
                // Clicks inside the field must not re-select or re-open rename.
                onClick={event => event.stopPropagation()}
                onDoubleClick={event => event.stopPropagation()}
              />
            ) : (
              <span className="chat-tab-title" title={session.title}>
                {session.title}
              </span>
            )}
            <button
              type="button"
              className="chat-tab-close"
              aria-label={`Close ${session.title}`}
              onClick={event => {
                event.stopPropagation()
                onClose(session.id)
              }}
            >
              ×
            </button>
          </div>
        )
      })}
      <button type="button" className="chat-tab-new" aria-label="New chat" onClick={onCreate}>
        +
      </button>
    </div>
  )
}
