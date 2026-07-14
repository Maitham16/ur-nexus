import { useEffect, useState } from 'react'
import { Card } from '../components/Card.js'
import { useDesktop } from '../hooks/useDesktop.js'
import { useProject } from '../state/ProjectContext.js'
import { Icon } from '../components/Icon.js'
import type { ProjectInfoDto, WorktreeInfoDto } from '../../shared/ipc.js'

export function ProjectsPage() {
  const desktop = useDesktop()
  const {
    projectRoot,
    recentProjects,
    openProject: openProjectShared,
    openProjectViaDialog,
    closeProject,
    removeRecentProject,
  } = useProject()
  const [inspected, setInspected] = useState<ProjectInfoDto | null>(null)
  const [worktrees, setWorktrees] = useState<WorktreeInfoDto[]>([])
  const [branchName, setBranchName] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectRoot) void inspect(projectRoot)
    else {
      setInspected(null)
      setWorktrees([])
    }
  }, [projectRoot])

  const inspect = async (root: string) => {
    if (!desktop) return
    try {
      const info = await desktop.inspectProject(root)
      setInspected(info)
      setWorktrees(await desktop.listWorktrees(root))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const openProject = async (root: string) => {
    setMessage('')
    setError(null)
    try {
      await openProjectShared(root)
      setMessage(`Opened ${root.split('/').pop()}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const createWorktree = async () => {
    if (!desktop || !inspected) return
    setError(null)
    try {
      const wt = await desktop.createWorktree(inspected.root, branchName || undefined)
      setMessage(`Worktree created at ${wt.root}`)
      setWorktrees(await desktop.listWorktrees(inspected.root))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Projects</h1>
      <p className="page-subtitle">Open a directory to start working with UR.</p>

      <Card title="Open project">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="project-value" style={{ flex: 1 }}>
            {projectRoot ?? 'No project open'}
          </span>
          <button className="button" onClick={openProjectViaDialog}>
            Browse…
          </button>
          {projectRoot && (
            <button className="button button-secondary" onClick={() => closeProject()}>
              Close project
            </button>
          )}
        </div>
      </Card>

      {error && (
        <div className="chat-error-banner">
          <span><Icon name="alert" size={14} /> {error}</span>
          <button className="link-button" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {message && (
        <div className="card" style={{ background: '#1f2937', borderColor: '#374151' }}>
          <div className="card-body">{message}</div>
        </div>
      )}

      {inspected && (
        <Card title={inspected.name}>
          <div className="project-grid">
            <div className="project-field">
              <span className="project-label">Path</span>
              <span className="project-value">{inspected.root}</span>
            </div>
            <div className="project-field">
              <span className="project-label">Git</span>
              <span className="project-value">
                {inspected.isGit ? `Yes${inspected.branch ? ` • ${inspected.branch}` : ''}` : 'No'}
              </span>
            </div>
            <div className="project-field">
              <span className="project-label">Package manager</span>
              <span className="project-value">{inspected.packageManager || '—'}</span>
            </div>
            <div className="project-field">
              <span className="project-label">Language</span>
              <span className="project-value">{inspected.language || '—'}</span>
            </div>
            <div className="project-field">
              <span className="project-label">Framework</span>
              <span className="project-value">{inspected.framework || '—'}</span>
            </div>
            <div className="project-field">
              <span className="project-label">UR folder</span>
              <span className="project-value">{inspected.hasUrFolder ? 'Yes' : 'No'}</span>
            </div>
            <div className="project-field">
              <span className="project-label">UR.md</span>
              <span className="project-value">{inspected.hasUrMd ? 'Yes' : 'No'}</span>
            </div>
            <div className="project-field">
              <span className="project-label">UR.local.md</span>
              <span className="project-value">{inspected.hasUrLocalMd ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {inspected.scripts.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="project-label" style={{ marginBottom: 6 }}>Scripts</div>
              <div className="script-list">
                {inspected.scripts.map(script => (
                  <span key={script} className="badge">{script}</span>
                ))}
              </div>
            </div>
          )}

          {inspected.dirtyFiles.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="project-label" style={{ marginBottom: 6 }}>Dirty files</div>
              <div className="dirty-list">
                {inspected.dirtyFiles.map(file => (
                  <div key={file} className="dirty-file">{file}</div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 20, borderTop: '1px solid #262626', paddingTop: 16 }}>
            <div className="project-label" style={{ marginBottom: 8 }}>Worktrees</div>
            <div className="worktree-list">
              {worktrees.map(wt => (
                <div key={wt.root} className={`worktree-row ${wt.isMain ? 'main' : ''}`}>
                  <span className="worktree-branch">{wt.branch}</span>
                  <span className="worktree-path">{wt.root}</span>
                  {wt.isMain && <span className="badge badge-active">main</span>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder="Branch name (optional)"
                value={branchName}
                onChange={e => setBranchName(e.target.value)}
              />
              <button
                className="button"
                onClick={createWorktree}
                disabled={!inspected.isGit}
              >
                Create worktree
              </button>
            </div>
            {!inspected.isGit && (
              <div className="project-hint">Worktrees require a git repository.</div>
            )}
          </div>
        </Card>
      )}

      <h2 className="section-title">Recent projects</h2>
      <div className="list">
        {recentProjects.length === 0 && (
          <div className="list-item">
            <span>No recent projects</span>
          </div>
        )}
        {recentProjects.map(p => (
          <div key={p.root} className="list-item project-row">
            <div className="project-row-info">
              <div className="project-row-name">{p.name}</div>
              <div className="project-row-path">{p.root}</div>
            </div>
            <div className="project-row-actions">
              <button className="button button-secondary" onClick={() => openProject(p.root)}>Open</button>
              <button
                className="button button-secondary"
                onClick={() => void removeRecentProject(p.root)}
                title="Remove from Recents without deleting files"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
