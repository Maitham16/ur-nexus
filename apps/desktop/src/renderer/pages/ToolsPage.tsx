import { useEffect, useState } from 'react'
import { Card } from '../components/Card.js'
import { useDesktop } from '../hooks/useDesktop.js'
import type { RuntimeToolDefinitionDto } from '../../shared/ipc.js'

const riskBadge: Record<string, { bg: string; color: string }> = {
  none: { bg: '#14532d', color: '#86efac' },
  low: { bg: '#0c4a6e', color: '#38bdf8' },
  medium: { bg: '#3f3f08', color: '#facc15' },
  high: { bg: '#450a0a', color: '#fca5a5' },
}

export function ToolsPage() {
  const desktop = useDesktop()
  const [projectRoot, setProjectRoot] = useState('')
  const [tools, setTools] = useState<RuntimeToolDefinitionDto[]>([])

  const refresh = async () => {
    if (!desktop || !projectRoot) return
    const list = await desktop.listToolDefinitions(projectRoot)
    setTools(list)
  }

  useEffect(() => {
    refresh()
  }, [projectRoot, desktop])

  return (
    <div className="page">
      <h1 className="page-title">Tools</h1>
      <p className="page-subtitle">
        Available UR runtime tools and their risk/approval rules.
      </p>

      <Card title="Project">
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder="Project root path..."
            value={projectRoot}
            onChange={e => setProjectRoot(e.target.value)}
          />
          <button className="button button-secondary" onClick={refresh} disabled={!projectRoot}>
            Refresh
          </button>
        </div>
      </Card>

      <div className="tool-grid">
        {tools.length === 0 && (
          <Card title="No tools">
            <p className="card-body">Open a project to see available tools.</p>
          </Card>
        )}
        {tools.map(tool => (
          <div key={tool.name} className="tool-card">
            <div className="tool-card-header">
              <div className="tool-card-name">{tool.name}</div>
              <span
                className="badge"
                style={{
                  background: riskBadge[tool.risk ?? 'low']?.bg,
                  color: riskBadge[tool.risk ?? 'low']?.color,
                }}
              >
                {tool.risk ?? 'low'}
              </span>
            </div>
            <p className="card-body">{tool.description || 'No description.'}</p>
            {tool.needsApproval && (
              <div className="tool-card-warning">
                Requires user approval before each call.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
