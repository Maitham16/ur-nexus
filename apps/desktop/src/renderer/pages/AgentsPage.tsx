import { useEffect, useState } from 'react'
import { Card } from '../components/Card.js'
import { useDesktop, useRuntimeEvents } from '../hooks/useDesktop.js'
import type { AgentInfoDto, RuntimeEvent } from '../../shared/ipc.js'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function statusIcon(status: AgentInfoDto['status']): string {
  switch (status) {
    case 'running':
      return '●'
    case 'waiting_approval':
      return '⏸'
    case 'done':
      return '✔'
    case 'failed':
      return '✕'
    default:
      return '○'
  }
}

export function AgentsPage() {
  const desktop = useDesktop()
  const [projectRoot, setProjectRoot] = useState('')
  const [agents, setAgents] = useState<AgentInfoDto[]>([])
  const [maxAgents, setMaxAgents] = useState(4)

  const refresh = async () => {
    if (!desktop || !projectRoot) return
    const [list, currentMax] = await Promise.all([
      desktop.listAgents(projectRoot),
      desktop.getMaxAgents(),
    ])
    setAgents(list)
    setMaxAgents(currentMax)
  }

  useEffect(() => {
    refresh()
  }, [projectRoot, desktop])

  useRuntimeEvents((event: RuntimeEvent) => {
    if (
      event.type.startsWith('agent_') ||
      event.type === 'tool_call_started' ||
      event.type === 'tool_call_finished' ||
      event.type === 'command_started' ||
      event.type === 'run_started' ||
      event.type === 'run_finished'
    ) {
      refresh()
    }
  })

  const activeCount = agents.filter(a => a.status === 'running').length

  const updateMax = async (value: number) => {
    if (!desktop) return
    const next = await desktop.setMaxAgents(value)
    setMaxAgents(next)
  }

  return (
    <div className="page">
      <h1 className="page-title">Agents</h1>
      <p className="page-subtitle">
        Active agents, crews, and parallelism controls.
      </p>

      <Card title="Controls">
        <div className="agent-controls">
          <input
            className="input project-input"
            placeholder="Project root path..."
            value={projectRoot}
            onChange={e => setProjectRoot(e.target.value)}
          />
          <button className="button button-secondary" onClick={refresh} disabled={!projectRoot}>
            Refresh
          </button>
          <div className="max-agents-control">
            <label className="max-agents-label">Max parallel agents</label>
            <input
              type="range"
              min={1}
              max={8}
              value={maxAgents}
              onChange={e => updateMax(Number(e.target.value))}
            />
            <span className="max-agents-value">{maxAgents}</span>
          </div>
        </div>
      </Card>

      <div className="agent-summary">
        <Card title="Active agents">
          <div className="agent-count">
            <span className={activeCount > 0 ? 'active' : ''}>{activeCount}</span>
            <span className="agent-count-sep">/</span>
            <span>{agents.length}</span>
          </div>
          <p className="card-body">
            {activeCount > 0
              ? `${activeCount} agent${activeCount === 1 ? '' : 's'} currently running.`
              : 'No agents running.'}
          </p>
        </Card>
      </div>

      <div className="agent-grid">
        {agents.length === 0 && (
          <Card title="No agents">
            <p className="card-body">Start a run to see agents here.</p>
          </Card>
        )}
        {agents.map(agent => (
          <div key={agent.id} className={`agent-card agent-status-${agent.status}`}>
            <div className="agent-header">
              <span className="agent-status-dot">{statusIcon(agent.status)}</span>
              <div className="agent-name-block">
                <div className="agent-name">{agent.name}</div>
                <div className="agent-id">{agent.id}</div>
              </div>
              <span className={`agent-status-badge ${agent.status}`}>{agent.status}</span>
            </div>

            <div className="agent-meta">
              {agent.role && <span className="agent-meta-item">Role: {agent.role}</span>}
              {agent.assignedTaskId && (
                <span className="agent-meta-item">Task: {agent.assignedTaskId}</span>
              )}
              <span className="agent-meta-item">⏱ {formatDuration(agent.elapsedMs)}</span>
            </div>

            {(agent.currentTool || agent.currentCommand) && (
              <div className="agent-current">
                {agent.currentTool && (
                  <div className="agent-current-item">🔧 {agent.currentTool}</div>
                )}
                {agent.currentCommand && (
                  <div className="agent-current-item">$ {agent.currentCommand}</div>
                )}
              </div>
            )}

            <div className="agent-logs">
              {agent.logs.length === 0 && (
                <div className="agent-log-empty">No logs yet</div>
              )}
              {agent.logs.slice(-6).map((log, i) => (
                <div key={`${agent.id}-log-${i}`} className="agent-log-line">
                  {log}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
