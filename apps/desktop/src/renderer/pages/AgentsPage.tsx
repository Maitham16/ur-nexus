import { useCallback, useEffect, useState } from 'react'
import { Card } from '../components/Card.js'
import { useDesktop, useRuntimeEvents } from '../hooks/useDesktop.js'
import { useProject } from '../state/ProjectContext.js'
import { Icon, type IconName } from '../components/Icon.js'
import type {
  AgentInfoDto,
  RuntimeEvent,
  BackgroundAgentDto,
} from '../../shared/ipc.js'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function statusIcon(status: AgentInfoDto['status']): IconName {
  switch (status) {
    case 'running':
      return 'sparkles'
    case 'waiting_approval':
      return 'pause'
    case 'done':
      return 'check'
    case 'failed':
      return 'x'
    default:
      return 'clock'
  }
}

function bgStatusColor(status: BackgroundAgentDto['status']): string {
  switch (status) {
    case 'running':
      return 'running'
    case 'done':
      return 'done'
    case 'failed':
    case 'interrupted':
      return 'failed'
    default:
      return 'idle'
  }
}

function BackgroundAgentsSection() {
  const desktop = useDesktop()
  const { projectRoot } = useProject()
  const [agents, setAgents] = useState<BackgroundAgentDto[]>([])
  const [prompt, setPrompt] = useState('')
  const [useWorktree, setUseWorktree] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<BackgroundAgentDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [launching, setLaunching] = useState(false)

  const refresh = useCallback(async () => {
    if (!desktop) return
    try {
      setAgents(await desktop.listBackgroundAgents(projectRoot ?? undefined))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [desktop, projectRoot])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useRuntimeEvents((event: RuntimeEvent) => {
    if (event.type === 'background_agent_update') {
      void refresh()
      if (selectedId) void openDetail(selectedId)
    }
  })

  const openDetail = useCallback(
    async (id: string) => {
      if (!desktop) return
      setSelectedId(id)
      try {
        setDetail(await desktop.getBackgroundAgent(id))
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    },
    [desktop],
  )

  const launch = async () => {
    if (!desktop || !projectRoot || !prompt.trim()) return
    setLaunching(true)
    setError(null)
    try {
      const agent = await desktop.launchBackgroundAgent({
        projectRoot,
        prompt: prompt.trim(),
        useWorktree,
      })
      setPrompt('')
      await refresh()
      await openDetail(agent.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLaunching(false)
    }
  }

  const act = async (action: () => Promise<unknown>) => {
    setError(null)
    try {
      await action()
      await refresh()
      if (selectedId) await openDetail(selectedId)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const activeCount = agents.filter(
    a => a.status === 'running' || a.status === 'queued',
  ).length

  return (
    <>
      <Card title={`Background agents${activeCount > 0 ? ` — ${activeCount} active` : ''}`}>
        {error && (
          <div className="chat-error-banner">
            <span><Icon name="alert" size={14} /> {error}</span>
            <button className="link-button" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        )}
        <div className="bg-launch-row">
          <textarea
            className="composer-textarea"
            rows={2}
            placeholder={
              projectRoot
                ? 'Describe a task to run in the background…'
                : 'Open a project to launch background agents'
            }
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            disabled={!projectRoot || launching}
          />
          <div className="bg-launch-controls">
            <label className="worktree-toggle" title="Run in an isolated git worktree">
              <input
                type="checkbox"
                checked={useWorktree}
                onChange={e => setUseWorktree(e.target.checked)}
              />
              Worktree
            </label>
            <button
              className="button"
              onClick={launch}
              disabled={!projectRoot || !prompt.trim() || launching}
            >
              {launching ? 'Launching…' : 'Launch'}
            </button>
          </div>
        </div>

        <div className="list bg-agent-list">
          {agents.length === 0 && (
            <div className="list-item">
              <span>No background agents yet.</span>
            </div>
          )}
          {agents.map(agent => (
            <div
              key={agent.id}
              className={`list-item bg-agent-row ${selectedId === agent.id ? 'active' : ''}`}
              onClick={() => openDetail(agent.id)}
            >
              <span className={`agent-status-badge ${bgStatusColor(agent.status)}`}>
                {agent.status}
              </span>
              <span className="bg-agent-title" title={agent.prompt}>
                {agent.title}
              </span>
              <span className="bg-agent-actions" onClick={e => e.stopPropagation()}>
                {(agent.status === 'running' || agent.status === 'queued') && (
                  <button
                    className="button button-danger button-small"
                    onClick={() => act(() => desktop!.cancelBackgroundAgent(agent.id))}
                  >
                    Cancel
                  </button>
                )}
                {(agent.status === 'failed' ||
                  agent.status === 'cancelled' ||
                  agent.status === 'interrupted') && (
                  <button
                    className="button button-secondary button-small"
                    onClick={() => act(() => desktop!.retryBackgroundAgent(agent.id))}
                  >
                    Retry
                  </button>
                )}
                {agent.status !== 'running' && agent.status !== 'queued' && (
                  <button
                    className="button button-secondary button-small"
                    onClick={() =>
                      act(async () => {
                        await desktop!.removeBackgroundAgent(agent.id)
                        if (selectedId === agent.id) {
                          setSelectedId(null)
                          setDetail(null)
                        }
                      })
                    }
                  >
                    Remove
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {detail && (
        <Card title={`Agent ${detail.id}`}>
          <div className="card-body bg-agent-detail">
            <div>
              <strong>Status:</strong> {detail.status}
              {detail.error ? ` — ${detail.error}` : ''}
            </div>
            <div><strong>Prompt:</strong> {detail.prompt}</div>
            {detail.worktreeRoot && (
              <div><strong>Worktree:</strong> {detail.worktreeRoot}</div>
            )}
            {detail.usage && (
              <div>
                <strong>Usage:</strong> {detail.usage.inputTokens} in /{' '}
                {detail.usage.outputTokens} out
                {detail.usage.costUsd !== undefined &&
                  ` · $${detail.usage.costUsd.toFixed(4)}${detail.usage.costIsEstimate ? ' est.' : ''}`}
              </div>
            )}
            {detail.changedFiles.length > 0 && (
              <div className="changed-files-list">
                {detail.changedFiles.map(file => (
                  <button
                    key={file}
                    className="changed-file-chip link-button"
                    title="Reveal in Finder"
                    onClick={() => desktop?.revealInFinder(`${detail.projectRoot}/${file}`)}
                  >
                    {file}
                  </button>
                ))}
              </div>
            )}
            {detail.resultText && (
              <>
                <strong>Result</strong>
                <pre className="code-block result">{detail.resultText}</pre>
              </>
            )}
            <strong>Logs</strong>
            <div className="agent-logs">
              {detail.logs.length === 0 && (
                <div className="agent-log-empty">No logs recorded.</div>
              )}
              {detail.logs.map((line, i) => (
                <div key={i} className="agent-log-line">
                  {line}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </>
  )
}

export function AgentsPage() {
  const desktop = useDesktop()
  const { projectRoot } = useProject()
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
        Background agents, live run agents, and parallelism controls.
      </p>

      <BackgroundAgentsSection />

      <Card title="Controls">
        <div className="agent-controls">
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
              <span className="agent-status-dot"><Icon name={statusIcon(agent.status)} size={15} /></span>
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
              <span className="agent-meta-item"><Icon name="clock" size={13} /> {formatDuration(agent.elapsedMs)}</span>
            </div>

            {(agent.currentTool || agent.currentCommand) && (
              <div className="agent-current">
                {agent.currentTool && (
                  <div className="agent-current-item"><Icon name="tool" size={13} /> {agent.currentTool}</div>
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
