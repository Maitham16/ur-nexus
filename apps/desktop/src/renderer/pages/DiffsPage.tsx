import { useCallback, useEffect, useState } from 'react'
import { useDesktop } from '../hooks/useDesktop.js'
import { useProject } from '../state/ProjectContext.js'
import { Icon } from '../components/Icon.js'
import type { GitFileStatusDto } from '../../shared/ipc.js'

export function DiffsPage() {
  const desktop = useDesktop()
  const { projectRoot, openProjectViaDialog } = useProject()
  const [status, setStatus] = useState<GitFileStatusDto[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [diff, setDiff] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [diffLoading, setDiffLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!desktop || !projectRoot) return
    setLoading(true)
    setError(null)
    try {
      const files = await desktop.gitStatus(projectRoot)
      setStatus(files)
      if (selected && !files.some(f => f.relPath === selected)) {
        setSelected(null)
        setDiff('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [desktop, projectRoot, selected])

  useEffect(() => {
    void refresh()
  }, [desktop, projectRoot])

  const showDiff = useCallback(
    async (relPath: string) => {
      if (!desktop || !projectRoot) return
      setSelected(relPath)
      setDiffLoading(true)
      setError(null)
      try {
        setDiff(await desktop.gitDiff({ projectRoot, relPath }))
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
        setDiff('')
      } finally {
        setDiffLoading(false)
      }
    },
    [desktop, projectRoot],
  )

  const revert = useCallback(
    async (relPath: string) => {
      if (!desktop || !projectRoot) return
      setError(null)
      try {
        await desktop.gitRevertFile({ projectRoot, relPath })
        setNotice(`Reverted ${relPath}`)
        await refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    },
    [desktop, projectRoot, refresh],
  )

  const openFile = useCallback(
    async (relPath: string) => {
      if (!desktop || !projectRoot) return
      try {
        await desktop.openInDefaultApp(`${projectRoot}/${relPath}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    },
    [desktop, projectRoot],
  )

  const reveal = useCallback(
    async (relPath: string) => {
      if (!desktop || !projectRoot) return
      await desktop.revealInFinder(`${projectRoot}/${relPath}`)
    },
    [desktop, projectRoot],
  )

  if (!projectRoot) {
    return (
      <div className="page">
        <div className="empty-state empty-state-tall">
          <div className="empty-state-icon"><Icon name="layers" size={28} /></div>
          <h2>No project open</h2>
          <p>Open a project to review pending changes.</p>
          <button className="button" onClick={openProjectViaDialog}>
            Open Project…
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page diffs-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Changes</h1>
          <p className="page-subtitle">
            Working-tree changes in {projectRoot}. Accepting keeps a change on
            disk; reverting restores the committed version.
          </p>
        </div>
        <button
          className="button button-secondary"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

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

      <div className="diffs-layout">
        <div className="diffs-file-list">
          {status.length === 0 && !loading && (
            <div className="empty-state">
              <p>Working tree is clean — no pending changes.</p>
            </div>
          )}
          {status.map(file => (
            <div
              key={file.relPath}
              className={`diffs-file-row ${selected === file.relPath ? 'active' : ''}`}
              onClick={() => showDiff(file.relPath)}
            >
              <span className={`git-status-badge git-${file.status}`}>
                {file.status[0].toUpperCase()}
              </span>
              <span className="diffs-file-path" title={file.relPath}>
                {file.relPath}
              </span>
            </div>
          ))}
        </div>

        <div className="diffs-detail">
          {selected ? (
            <>
              <div className="diffs-detail-header">
                <span className="diffs-detail-path">{selected}</span>
                <div className="diffs-detail-actions">
                  <button
                    className="button button-secondary button-small"
                    onClick={() => openFile(selected)}
                    title="Open in the default editor"
                  >
                    Open
                  </button>
                  <button
                    className="button button-secondary button-small"
                    onClick={() => reveal(selected)}
                    title="Reveal in Finder"
                  >
                    Reveal
                  </button>
                  <button
                    className="button button-danger button-small"
                    onClick={() => revert(selected)}
                    title="Restore the committed version (asks for approval)"
                  >
                    Revert
                  </button>
                </div>
              </div>
              {diffLoading ? (
                <div className="empty-state">
                  <p>Loading diff…</p>
                </div>
              ) : diff ? (
                <pre className="code-block diff-block diffs-detail-diff">
                  {diff.split('\n').map((line, i) => (
                    <span
                      key={i}
                      className={
                        line.startsWith('+') && !line.startsWith('+++')
                          ? 'diff-line-add'
                          : line.startsWith('-') && !line.startsWith('---')
                            ? 'diff-line-del'
                            : line.startsWith('@@')
                              ? 'diff-line-hunk'
                              : undefined
                      }
                    >
                      {line}
                      {'\n'}
                    </span>
                  ))}
                </pre>
              ) : (
                <div className="empty-state">
                  <p>No textual diff for this file.</p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>Select a file to review its diff.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
