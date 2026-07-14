import { useCallback, useEffect, useState } from 'react'
import { Card } from './Card.js'
import { useDesktop } from '../hooks/useDesktop.js'
import { Icon } from './Icon.js'
import type { CheckpointDto, RewindPreviewDto } from '../../shared/ipc.js'

export function CheckpointsPanel({ projectRoot }: { projectRoot: string | null }) {
  const desktop = useDesktop()
  const [checkpoints, setCheckpoints] = useState<CheckpointDto[]>([])
  const [preview, setPreview] = useState<RewindPreviewDto | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!desktop || !projectRoot) return
    try {
      setCheckpoints(await desktop.listCheckpoints(projectRoot))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [desktop, projectRoot])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const createManual = async () => {
    if (!desktop || !projectRoot) return
    setBusy(true)
    setError(null)
    try {
      await desktop.createCheckpoint({
        projectRoot,
        reason: 'Manual checkpoint',
      })
      setNotice('Checkpoint created from the current dirty files')
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const showPreview = async (checkpointId: string) => {
    if (!desktop || !projectRoot) return
    setError(null)
    try {
      setPreview(await desktop.previewRewind({ projectRoot, checkpointId }))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const rewind = async (checkpointId: string) => {
    if (!desktop || !projectRoot) return
    setBusy(true)
    setError(null)
    try {
      const result = await desktop.rewindToCheckpoint({ projectRoot, checkpointId })
      setNotice(
        result.safetyCheckpointId
          ? `Rewound ${result.restored.length + result.deleted.length} file(s); previous state saved as ${result.safetyCheckpointId}`
          : 'Nothing to rewind — files already match this checkpoint',
      )
      setPreview(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async (checkpointId: string) => {
    if (!desktop || !projectRoot) return
    setError(null)
    try {
      await desktop.deleteCheckpoint({ projectRoot, checkpointId })
      if (preview?.checkpointId === checkpointId) setPreview(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <Card title="Checkpoints">
      {error && (
        <div className="chat-error-banner">
          <span><Icon name="alert" size={14} /> {error}</span>
          <button className="link-button" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}
      {notice && (
        <div className="notice-banner">
          <span>{notice}</span>
          <button className="link-button" onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          className="button button-secondary button-small"
          onClick={createManual}
          disabled={!projectRoot || busy}
        >
          Create checkpoint now
        </button>
      </div>

      <div className="list">
        {checkpoints.length === 0 && (
          <div className="list-item">
            <span>
              No checkpoints yet. They are created automatically before edits,
              tool writes, and agent runs.
            </span>
          </div>
        )}
        {checkpoints.map(cp => (
          <div key={cp.id} className="list-item checkpoint-row">
            <div className="checkpoint-info">
              <div className="checkpoint-reason">
                {cp.branchedFrom && (
                  <span className="badge badge-worktree" title={`Branched from ${cp.branchedFrom}`}>
                    branch
                  </span>
                )}{' '}
                {cp.reason}
              </div>
              <div className="checkpoint-meta">
                {new Date(cp.createdAt).toLocaleString()} · {cp.trigger} ·{' '}
                {cp.files.length} file(s)
                {cp.gitBranch ? ` · ⎇ ${cp.gitBranch}` : ''}
              </div>
            </div>
            <div className="diffs-detail-actions">
              <button
                className="button button-secondary button-small"
                onClick={() => showPreview(cp.id)}
              >
                Preview
              </button>
              <button
                className="button button-small"
                onClick={() => rewind(cp.id)}
                disabled={busy}
                title="Restores the recorded files after approval; the current state is saved first"
              >
                Rewind
              </button>
              <button
                className="button button-secondary button-small"
                onClick={() => remove(cp.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div className="checkpoint-preview">
          <div className="checkpoint-preview-header">
            Rewinding to “{preview.reason}” ({new Date(preview.createdAt).toLocaleString()}) changes{' '}
            {preview.changes} file(s):
          </div>
          {preview.entries
            .filter(e => e.action !== 'unchanged')
            .map(entry => (
              <div key={entry.relPath} className="checkpoint-preview-row">
                <span className={`git-status-badge git-${entry.action === 'delete' ? 'deleted' : 'modified'}`}>
                  {entry.action[0].toUpperCase()}
                </span>
                <span>{entry.relPath}</span>
                <span className="checkpoint-preview-action">{entry.action}</span>
              </div>
            ))}
          {preview.changes === 0 && (
            <div className="checkpoint-preview-row">
              Files already match this checkpoint.
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
