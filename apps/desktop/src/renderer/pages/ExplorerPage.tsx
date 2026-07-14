import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDesktop } from '../hooks/useDesktop.js'
import { useProject } from '../state/ProjectContext.js'
import { Icon, type IconName } from '../components/Icon.js'
import type { ExplorerEntryDto, SearchResultDto } from '../../shared/ipc.js'

interface TreeNode extends ExplorerEntryDto {
  expanded?: boolean
  children?: TreeNode[]
  loading?: boolean
}

function fileIcon(entry: ExplorerEntryDto): IconName {
  return entry.type === 'directory' ? 'folder' : 'file'
}

export function ExplorerPage() {
  const desktop = useDesktop()
  const navigate = useNavigate()
  const { projectRoot, projectName, openProjectViaDialog, refreshInfo } = useProject()
  const [tree, setTree] = useState<TreeNode[]>([])
  const [showIgnored, setShowIgnored] = useState(false)
  const [filter, setFilter] = useState('')
  const [contentQuery, setContentQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResultDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [preview, setPreview] = useState<{ relPath: string; content: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const loadDir = useCallback(
    async (relPath: string): Promise<TreeNode[]> => {
      if (!desktop || !projectRoot) return []
      const entries = await desktop.listExplorer({
        projectRoot,
        relPath,
        showIgnored,
      })
      return entries as TreeNode[]
    },
    [desktop, projectRoot, showIgnored],
  )

  const refreshRoot = useCallback(async () => {
    if (!projectRoot) return
    setLoading(true)
    setError(null)
    try {
      setTree(await loadDir(''))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [projectRoot, loadDir])

  useEffect(() => {
    void refreshRoot()
  }, [refreshRoot])

  const updateNode = useCallback(
    (nodes: TreeNode[], relPath: string, patch: Partial<TreeNode>): TreeNode[] =>
      nodes.map(node => {
        if (node.relPath === relPath) return { ...node, ...patch }
        if (node.children && relPath.startsWith(`${node.relPath}/`)) {
          return { ...node, children: updateNode(node.children, relPath, patch) }
        }
        return node
      }),
    [],
  )

  const toggleDir = useCallback(
    async (node: TreeNode) => {
      if (node.type !== 'directory') return
      if (node.expanded) {
        setTree(prev => updateNode(prev, node.relPath, { expanded: false }))
        return
      }
      setTree(prev => updateNode(prev, node.relPath, { loading: true }))
      try {
        const children = await loadDir(node.relPath)
        setTree(prev =>
          updateNode(prev, node.relPath, {
            expanded: true,
            children,
            loading: false,
          }),
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
        setTree(prev => updateNode(prev, node.relPath, { loading: false }))
      }
    },
    [loadDir, updateNode],
  )

  const openPreview = useCallback(
    async (node: TreeNode) => {
      if (!desktop || !projectRoot || node.type === 'directory') return
      try {
        const content = await desktop.readFile({
          projectRoot,
          path: node.relPath,
        })
        setPreview({
          relPath: node.relPath,
          content: content === null ? '(file not found)' : content,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    },
    [desktop, projectRoot],
  )

  const addToContext = useCallback(
    async (node: TreeNode) => {
      if (!desktop || !projectRoot) return
      const results = await desktop.addContextFiles({
        projectRoot,
        paths: [`${projectRoot}/${node.relPath}`],
      })
      const rejected = results.find(r => !r.ok)
      if (rejected) {
        setError(`${rejected.name}: ${rejected.reason ?? rejected.kind}`)
      } else {
        window.dispatchEvent(
          new CustomEvent('ur:attach-files', {
            detail: { paths: [`${projectRoot}/${node.relPath}`] },
          }),
        )
        setNotice(`${node.name} added to chat context`)
      }
    },
    [desktop, projectRoot],
  )

  // Inline path form: Electron renderers do not support window.prompt.
  const [pendingAction, setPendingAction] = useState<
    | { type: 'create-file' | 'create-directory' }
    | { type: 'rename'; from: string }
    | null
  >(null)
  const [pendingPath, setPendingPath] = useState('')

  const confirmPendingAction = useCallback(async () => {
    if (!desktop || !projectRoot || !pendingAction || !pendingPath.trim()) return
    const relPath = pendingPath.trim()
    try {
      if (pendingAction.type === 'rename') {
        if (relPath !== pendingAction.from) {
          await desktop.renameExplorerEntry({
            projectRoot,
            relPath: pendingAction.from,
            newRelPath: relPath,
          })
          setNotice(`Renamed to ${relPath}`)
        }
      } else {
        const kind = pendingAction.type === 'create-file' ? 'file' : 'directory'
        await desktop.createExplorerEntry({ projectRoot, relPath, kind })
        setNotice(`Created ${relPath}`)
      }
      setPendingAction(null)
      setPendingPath('')
      await refreshRoot()
      await refreshInfo()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [desktop, projectRoot, pendingAction, pendingPath, refreshRoot, refreshInfo])

  const createEntry = useCallback((kind: 'file' | 'directory') => {
    setPendingAction({ type: kind === 'file' ? 'create-file' : 'create-directory' })
    setPendingPath('')
  }, [])

  const renameEntry = useCallback((node: TreeNode) => {
    setPendingAction({ type: 'rename', from: node.relPath })
    setPendingPath(node.relPath)
  }, [])

  const deleteEntry = useCallback(
    async (node: TreeNode) => {
      if (!desktop || !projectRoot) return
      try {
        await desktop.deleteExplorerEntry({ projectRoot, relPath: node.relPath })
        setNotice(`Deleted ${node.relPath}`)
        await refreshRoot()
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    },
    [desktop, projectRoot, refreshRoot],
  )

  const runContentSearch = useCallback(async () => {
    if (!desktop || !projectRoot || !contentQuery.trim()) return
    setError(null)
    try {
      setSearchResults(
        await desktop.searchGrep({
          projectRoot,
          pattern: contentQuery.trim(),
          maxResults: 200,
        }),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [desktop, projectRoot, contentQuery])

  const matchesFilter = useCallback(
    (node: TreeNode): boolean => {
      if (!filter) return true
      return node.name.toLowerCase().includes(filter.toLowerCase())
    },
    [filter],
  )

  const renderNode = (node: TreeNode, depth: number) => {
    if (node.type === 'file' && !matchesFilter(node)) return null
    return (
      <div key={node.relPath}>
        <div
          className={`explorer-row ${node.ignored ? 'ignored' : ''}`}
          style={{ paddingLeft: `${depth * 18 + 8}px` }}
          onClick={() =>
            node.type === 'directory' ? toggleDir(node) : openPreview(node)
          }
        >
          <span className="explorer-caret">
            {node.type === 'directory' ? (node.expanded ? '▾' : '▸') : ''}
          </span>
          <span className="explorer-icon"><Icon name={fileIcon(node)} size={14} /></span>
          <span className="explorer-name">{node.name}</span>
          {node.gitStatus && (
            <span className={`git-status-badge git-${node.gitStatus}`}>
              {node.gitStatus[0].toUpperCase()}
            </span>
          )}
          <span className="explorer-row-actions" onClick={e => e.stopPropagation()}>
            {node.type === 'file' && (
              <button
                className="link-button"
                title="Add to chat context"
                onClick={() => addToContext(node)}
              >
                +ctx
              </button>
            )}
            <button
              className="link-button"
              title="Reveal in Finder"
              onClick={() => desktop?.revealInFinder(`${projectRoot}/${node.relPath}`)}
            >
              reveal
            </button>
            <button
              className="link-button"
              title="Rename"
              onClick={() => renameEntry(node)}
            >
              rename
            </button>
            <button
              className="link-button danger"
              title="Delete (asks for approval)"
              onClick={() => deleteEntry(node)}
            >
              delete
            </button>
          </span>
        </div>
        {node.expanded && node.children && (
          <div>{node.children.map(child => renderNode(child, depth + 1))}</div>
        )}
        {node.loading && (
          <div className="explorer-loading" style={{ paddingLeft: `${(depth + 1) * 18 + 8}px` }}>
            Loading…
          </div>
        )}
      </div>
    )
  }

  if (!projectRoot) {
    return (
      <div className="page">
        <div className="empty-state empty-state-tall">
          <div className="empty-state-icon"><Icon name="files" size={28} /></div>
          <h2>No project open</h2>
          <p>Open a project to browse its files.</p>
          <button className="button" onClick={openProjectViaDialog}>
            Open Project…
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page explorer-page">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Files</h1>
          <p className="page-subtitle">{projectName} — {projectRoot}</p>
        </div>
        <div className="page-header-actions">
          <button className="button button-secondary button-small" onClick={() => createEntry('file')}>
            New File
          </button>
          <button className="button button-secondary button-small" onClick={() => createEntry('directory')}>
            New Folder
          </button>
          <button
            className="button button-secondary button-small"
            onClick={refreshRoot}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
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
          <div>
            <button className="link-button" onClick={() => navigate('/')}>
              Go to chat
            </button>
            <button className="link-button" onClick={() => setNotice(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="explorer-toolbar">
        <input
          className="input explorer-filter"
          placeholder="Filter files by name…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
        <input
          className="input explorer-filter"
          placeholder="Search in file contents…  (Enter)"
          value={contentQuery}
          onChange={e => setContentQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') void runContentSearch()
            if (e.key === 'Escape') setSearchResults(null)
          }}
        />
        <label className="worktree-toggle">
          <input
            type="checkbox"
            checked={showIgnored}
            onChange={e => setShowIgnored(e.target.checked)}
          />
          Show ignored
        </label>
      </div>

      {searchResults && (
        <div className="search-results">
          <div className="search-results-header">
            <span>
              {searchResults.matches.length}
              {searchResults.truncated ? '+' : ''} matches
              <span className="search-engine"> · {searchResults.engine}</span>
            </span>
            <button className="link-button" onClick={() => setSearchResults(null)}>
              Clear
            </button>
          </div>
          <div className="search-results-list">
            {searchResults.matches.map((m, i) => (
              <div
                key={`${m.file}:${m.line}:${i}`}
                className="search-result-row"
                onClick={() =>
                  openPreview({
                    name: m.file.split('/').pop() ?? m.file,
                    relPath: m.file,
                    type: 'file',
                  } as TreeNode)
                }
              >
                <span className="search-result-loc">
                  {m.file}:{m.line}
                </span>
                <span className="search-result-text">{m.text.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingAction && (
        <div className="explorer-toolbar">
          <span className="project-label">
            {pendingAction.type === 'rename'
              ? `Rename ${pendingAction.from} to:`
              : pendingAction.type === 'create-file'
                ? 'New file path:'
                : 'New folder path:'}
          </span>
          <input
            className="input explorer-filter"
            autoFocus
            placeholder="relative/path"
            value={pendingPath}
            onChange={e => setPendingPath(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') void confirmPendingAction()
              if (e.key === 'Escape') setPendingAction(null)
            }}
          />
          <button
            className="button button-small"
            onClick={confirmPendingAction}
            disabled={!pendingPath.trim()}
          >
            {pendingAction.type === 'rename' ? 'Rename' : 'Create'}
          </button>
          <button
            className="button button-secondary button-small"
            onClick={() => setPendingAction(null)}
          >
            Cancel
          </button>
        </div>
      )}

      <div className="explorer-layout">
        <div className="explorer-tree">
          {tree.length === 0 && !loading && (
            <div className="empty-state">
              <p>This directory is empty.</p>
            </div>
          )}
          {tree.map(node => renderNode(node, 0))}
        </div>
        {preview && (
          <div className="explorer-preview">
            <div className="diffs-detail-header">
              <span className="diffs-detail-path">{preview.relPath}</span>
              <div className="diffs-detail-actions">
                <button
                  className="button button-secondary button-small"
                  onClick={() =>
                    desktop?.openInDefaultApp(`${projectRoot}/${preview.relPath}`)
                  }
                >
                  Open
                </button>
                <button
                  className="button button-secondary button-small"
                  onClick={() => setPreview(null)}
                >
                  Close
                </button>
              </div>
            </div>
            <pre className="code-block explorer-preview-content">{preview.content}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
