import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import './styles/global.css'
import { ChatPage } from './pages/ChatPage.js'
import { ProjectsPage } from './pages/ProjectsPage.js'
import { TasksPage } from './pages/TasksPage.js'
import { AgentsPage } from './pages/AgentsPage.js'
import { TerminalPage } from './pages/TerminalPage.js'
import { DiffsPage } from './pages/DiffsPage.js'
import { ExplorerPage } from './pages/ExplorerPage.js'
import { ConnectorsPage } from './pages/ConnectorsPage.js'
import { SettingsPage } from './pages/SettingsPage.js'
import { HistoryPage } from './pages/HistoryPage.js'
import { ToolsPage } from './pages/ToolsPage.js'
import { ProjectProvider, useProject } from './state/ProjectContext.js'
import { useDesktop } from './hooks/useDesktop.js'
import { Icon, type IconName } from './components/Icon.js'

const navSections: Array<{
  title?: string
  items: Array<{ to: string; label: string; icon: IconName; hint?: string }>
}> = [
  {
    items: [
      { to: '/', label: 'Threads', icon: 'chat', hint: '⌘1' },
      { to: '/tasks', label: 'Automations', icon: 'clock' },
      { to: '/tools', label: 'Skills', icon: 'sparkles' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { to: '/explorer', label: 'Files', icon: 'files', hint: '⌘2' },
      { to: '/diffs', label: 'Changes', icon: 'layers' },
      { to: '/terminal', label: 'Terminal', icon: 'terminal', hint: '⌘3' },
    ],
  },
  {
    title: 'Manage',
    items: [
      { to: '/agents', label: 'Agents', icon: 'agents' },
      { to: '/connectors', label: 'Connectors', icon: 'plug' },
      { to: '/history', label: 'History', icon: 'history' },
      { to: '/projects', label: 'All projects', icon: 'folder' },
      { to: '/settings', label: 'Settings', icon: 'settings', hint: '⌘,' },
    ],
  },
]

const allNavItems = navSections.flatMap(section => section.items)

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand-lockup ${compact ? 'compact' : ''}`}>
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-mark-core" />
      </span>
      {!compact && (
        <span className="brand-copy">
          <strong>UR Nexus</strong>
          <small>Agent workspace</small>
        </span>
      )}
    </div>
  )
}

function TitleBar({
  onOpenCommand,
  onToggleTheme,
  theme,
}: {
  onOpenCommand: () => void
  onToggleTheme: () => void
  theme: 'dark' | 'light'
}) {
  const { projectRoot, projectName, projectInfo, openProjectViaDialog, error } =
    useProject()
  return (
    <header className="titlebar">
      <div className="titlebar-project">
        {projectRoot ? (
          <>
            <span className="titlebar-context-label">Workspace</span>
            <span className="titlebar-separator">/</span>
            <span className="titlebar-project-name" title={projectRoot}>{projectName}</span>
            {projectInfo?.branch && (
              <span className="titlebar-branch"><Icon name="branch" size={13} />{projectInfo.branch}</span>
            )}
          </>
        ) : (
          <span className="titlebar-project-empty">UR Nexus Desktop</span>
        )}
      </div>
      <div className="titlebar-actions">
        {error && (
          <span className="titlebar-error" title={error}>
            <Icon name="alert" size={14} />
            {error.length > 60 ? `${error.slice(0, 60)}…` : error}
          </span>
        )}
        <button className="titlebar-command" onClick={onOpenCommand} title="Open command center (⌘K)">
          <Icon name="search" size={14} />
          <span>Search</span>
          <kbd>⌘ K</kbd>
        </button>
        <button className="icon-button" onClick={onToggleTheme} title={`Use ${theme === 'dark' ? 'light' : 'dark'} appearance`}>
          <span className="theme-glyph">{theme === 'dark' ? '☼' : '◐'}</span>
        </button>
        <button className="button button-secondary button-small titlebar-open" onClick={openProjectViaDialog}>
          <Icon name="folder" size={14} /> Open
        </button>
      </div>
    </header>
  )
}

function CommandCenter({
  open,
  onClose,
  onOpenProject,
}: {
  open: boolean
  onClose: () => void
  onOpenProject: () => void
}) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    return value
      ? allNavItems.filter(item => item.label.toLowerCase().includes(value))
      : allNavItems
  }, [query])

  useEffect(() => {
    if (!open) setQuery('')
    const onKey = (event: KeyboardEvent) => {
      if (open && event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, open])

  if (!open) return null
  const go = (to: string) => {
    navigate(to)
    onClose()
  }

  return (
    <div className="command-overlay" onMouseDown={onClose} role="presentation">
      <section className="command-center" onMouseDown={event => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Command center">
        <div className="command-search-row">
          <Icon name="search" size={19} />
          <input
            autoFocus
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search pages and actions…"
          />
          <kbd>esc</kbd>
        </div>
        <div className="command-content">
          <div className="command-group-label">Navigate</div>
          {filtered.map(item => (
            <button key={item.to} className="command-item" onClick={() => go(item.to)}>
              <span className="command-item-icon"><Icon name={item.icon} size={17} /></span>
              <span>{item.label}</span>
              {item.hint && <kbd>{item.hint}</kbd>}
            </button>
          ))}
          {filtered.length === 0 && <div className="command-empty">No matching destinations</div>}
          {!query && (
            <>
              <div className="command-group-label">Quick actions</div>
              <button className="command-item" onClick={() => { onOpenProject(); onClose() }}>
                <span className="command-item-icon"><Icon name="folder" size={17} /></span>
                <span>Open project</span>
              </button>
              <button className="command-item" onClick={() => {
                navigate('/', { state: { newChat: Date.now() } })
                onClose()
              }}>
                <span className="command-item-icon"><Icon name="plus" size={17} /></span>
                <span>Start new thread</span>
                <kbd>⌘ N</kbd>
              </button>
            </>
          )}
        </div>
        <footer className="command-footer">
          <span><kbd>tab</kbd> navigate</span>
          <span><kbd>esc</kbd> close</span>
          <span className="command-footer-status"><i /> Local runtime</span>
        </footer>
      </section>
    </div>
  )
}

function AppShell() {
  const navigate = useNavigate()
  const desktop = useDesktop()
  const {
    projectRoot,
    recentProjects,
    openProject,
    openProjectViaDialog,
    removeRecentProject,
  } = useProject()
  const [dropActive, setDropActive] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => window.localStorage.getItem('ur-desktop:sidebar') === 'collapsed',
  )
  const [commandOpen, setCommandOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = window.localStorage.getItem('ur-desktop:theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })
  const visibleRecentProjects = useMemo(
    () =>
      recentProjects.filter(project => {
        if (project.root === projectRoot) return true
        return (
          !project.name.startsWith('ur-resume-proj-') &&
          !project.root.includes('/private/var/folders/') &&
          !project.root.includes('/tmp/')
        )
      }),
    [projectRoot, recentProjects],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('ur-desktop:theme', theme)
  }, [theme])

  useEffect(() => {
    window.localStorage.setItem(
      'ur-desktop:sidebar',
      sidebarCollapsed ? 'collapsed' : 'expanded',
    )
  }, [sidebarCollapsed])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(value => !value)
      }
      if ((event.metaKey || event.ctrlKey) && event.key === '\\') {
        event.preventDefault()
        setSidebarCollapsed(value => !value)
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault()
        navigate('/', { state: { newChat: Date.now() } })
      }
      if ((event.metaKey || event.ctrlKey) && event.key === ',') {
        event.preventDefault()
        navigate('/settings')
      }
      if ((event.metaKey || event.ctrlKey) && ['1', '2', '3'].includes(event.key)) {
        event.preventDefault()
        navigate(event.key === '1' ? '/' : event.key === '2' ? '/explorer' : '/terminal')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [navigate])

  // Native menu → renderer routing.
  useEffect(() => {
    if (!desktop) return
    return desktop.onMenuAction(({ action, payload }) => {
      switch (action) {
        case 'new-chat':
          navigate('/', { state: { newChat: Date.now() } })
          break
        case 'open-project': {
          const root = (payload as { root?: string } | undefined)?.root
          if (root) void openProject(root)
          else void openProjectViaDialog()
          break
        }
        case 'open-file':
          navigate('/', { state: { attach: Date.now() } })
          break
        case 'settings':
          navigate('/settings')
          break
        case 'history':
          navigate('/history')
          break
        case 'toggle-terminal-drawer':
          navigate('/terminal')
          break
        case 'toggle-context-panel':
          window.dispatchEvent(new CustomEvent('ur:toggle-context-panel'))
          break
      }
    })
  }, [desktop, navigate, openProject, openProjectViaDialog])

  // Dropping a folder anywhere opens it as a project.
  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault()
      setDropActive(false)
      if (!desktop) return
      const files = Array.from(event.dataTransfer.files)
      if (files.length === 0) return
      const first = files[0]
      const fullPath = desktop.getPathForFile(first)
      if (!fullPath) return
      // Directories open as projects; files route to the chat attachment flow.
      if (!first.type && !first.size) {
        await openProject(fullPath).catch(() => undefined)
      } else {
        window.dispatchEvent(
          new CustomEvent('ur:attach-files', {
            detail: { paths: files.map(f => desktop.getPathForFile(f)).filter(Boolean) },
          }),
        )
        navigate('/')
      }
    },
    [desktop, navigate, openProject],
  )

  return (
    <div
      className={`app-frame ${dropActive ? 'drop-active' : ''} ${sidebarCollapsed ? 'sidebar-is-collapsed' : ''}`}
      onDragOver={e => {
        e.preventDefault()
        setDropActive(true)
      }}
      onDragLeave={e => {
        if (e.currentTarget === e.target) setDropActive(false)
      }}
      onDrop={onDrop}
    >
      <TitleBar
        onOpenCommand={() => setCommandOpen(true)}
        onToggleTheme={() => setTheme(value => (value === 'dark' ? 'light' : 'dark'))}
        theme={theme}
      />
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-brand-row">
            <BrandMark compact={sidebarCollapsed} />
            <button
              className="sidebar-collapse"
              onClick={() => setSidebarCollapsed(value => !value)}
              title={`${sidebarCollapsed ? 'Expand' : 'Collapse'} sidebar (⌘\\)`}
            >
              <Icon name="chevron-left" size={16} />
            </button>
          </div>
          <button
            className="new-thread-button"
            onClick={() => navigate('/', { state: { newChat: Date.now() } })}
            title="New thread (⌘N)"
          >
            <Icon name="plus" size={17} />
            <span>New thread</span>
            <kbd>⌘ N</kbd>
          </button>
          <button className="sidebar-search-button" onClick={() => setCommandOpen(true)}>
            <Icon name="search" size={16} />
            <span>Search</span>
            <kbd>⌘ K</kbd>
          </button>
          <nav className="nav">
            {navSections.map((section, i) => (
              <div className="nav-section" key={section.title ?? i}>
                {section.title && (
                  <div className="nav-section-title">{section.title}</div>
                )}
                {section.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? 'active' : ''}`
                    }
                  >
                    <span className="nav-icon"><Icon name={item.icon} size={17} /></span>
                    <span className="nav-label">{item.label}</span>
                    {item.hint && <span className="nav-hint">{item.hint}</span>}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
          <div className="sidebar-project-list">
            <div className="sidebar-project-heading">
              <span>Projects</span>
              <button onClick={() => void openProjectViaDialog()} title="Open project">
                <Icon name="plus" size={13} />
              </button>
            </div>
            {visibleRecentProjects.length === 0 ? (
              <button className="sidebar-project-empty" onClick={() => void openProjectViaDialog()}>
                Open a project
              </button>
            ) : (
              visibleRecentProjects.slice(0, 5).map(project => (
                <div
                  key={project.root}
                  className={`sidebar-project-row ${project.root === projectRoot ? 'active' : ''}`}
                  title={project.root}
                >
                  <button
                    className="sidebar-project-open"
                    onClick={async () => {
                      await openProject(project.root)
                      navigate('/')
                    }}
                  >
                    <Icon name="folder" size={14} />
                    <span>{project.name}</span>
                  </button>
                  <button
                    className="sidebar-project-remove"
                    onClick={() => void removeRecentProject(project.root)}
                    title={`Remove ${project.name} from Recents (files will not be deleted)`}
                    aria-label={`Remove ${project.name} from Recents`}
                  >
                    <Icon name="x" size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="sidebar-footer">
            <div className="runtime-status">
              <span className="runtime-status-dot" />
              <span className="runtime-status-copy"><strong>Runtime ready</strong><small>Local · Secure</small></span>
              <Icon name="shield" size={15} />
            </div>
            <button className="sidebar-command-hint" onClick={() => setCommandOpen(true)}>
              <Icon name="command" size={15} />
              <span>Command center</span>
              <kbd>⌘ K</kbd>
            </button>
          </div>
        </aside>
        <main className="main">
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/explorer" element={<ExplorerPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/terminal" element={<TerminalPage />} />
            <Route path="/diffs" element={<DiffsPage />} />
            <Route path="/connectors" element={<ConnectorsPage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {dropActive && (
        <div className="drop-overlay">
          <div className="drop-overlay-inner">
            Drop a folder to open it as a project, or files to attach them
          </div>
        </div>
      )}
      <CommandCenter
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onOpenProject={() => void openProjectViaDialog()}
      />
    </div>
  )
}

export default function App() {
  return (
    <ProjectProvider>
      <AppShell />
    </ProjectProvider>
  )
}
