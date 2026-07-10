import { Routes, Route, NavLink } from 'react-router-dom'
import './styles/global.css'
import { ChatPage } from './pages/ChatPage.js'
import { ProjectsPage } from './pages/ProjectsPage.js'
import { TasksPage } from './pages/TasksPage.js'
import { AgentsPage } from './pages/AgentsPage.js'
import { TerminalPage } from './pages/TerminalPage.js'
import { DiffsPage } from './pages/DiffsPage.js'
import { ConnectorsPage } from './pages/ConnectorsPage.js'
import { SettingsPage } from './pages/SettingsPage.js'
import { HistoryPage } from './pages/HistoryPage.js'
import { ToolsPage } from './pages/ToolsPage.js'

const navItems = [
  { to: '/', label: 'Chat', icon: '💬' },
  { to: '/projects', label: 'Projects', icon: '📁' },
  { to: '/tasks', label: 'Tasks', icon: '✅' },
  { to: '/agents', label: 'Agents', icon: '🤖' },
  { to: '/terminal', label: 'Terminal', icon: '🖥️' },
  { to: '/diffs', label: 'Diffs', icon: '📝' },
  { to: '/connectors', label: 'Connectors', icon: '🔌' },
  { to: '/tools', label: 'Tools', icon: '🧰' },
  { to: '/history', label: 'History', icon: '🕐' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-dot"></span>
          <span>UR Desktop</span>
        </div>
        <nav className="nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main">
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/terminal" element={<TerminalPage />} />
          <Route path="/diffs" element={<DiffsPage />} />
          <Route path="/connectors" element={<ConnectorsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}
