import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDesktop } from '../hooks/useDesktop.js'
import { useProject } from '../state/ProjectContext.js'
import { Icon, type IconName } from '../components/Icon.js'
import type { RuntimeToolDefinitionDto } from '../../shared/ipc.js'

const toolDescriptions: Record<string, string> = {
  Agent: 'Delegate focused work to a specialized background agent.',
  Api: 'Call an HTTP API and return its structured response.',
  Bash: 'Run a shell command inside the active workspace.',
  Docker: 'Build, inspect, and run containerized workloads.',
  Edit: 'Apply a precise change to an existing file.',
  ExitPlanMode: 'Finish planning and move into implementation.',
  GitHub: 'Inspect repositories, issues, pull requests, and workflows.',
  Glob: 'Find files using workspace-aware path patterns.',
  Grep: 'Search code and text across the active project.',
  NotebookEdit: 'Update cells in Jupyter notebook files.',
  Read: 'Read a file with line-aware project context.',
  TaskOutput: 'Inspect output from a running or completed task.',
  TestRunner: 'Run project tests and summarize failures.',
  WebFetch: 'Retrieve and inspect content from a web resource.',
  Write: 'Create or replace a file in the workspace.',
}

function readableName(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
}

function descriptionFor(tool: RuntimeToolDefinitionDto): string {
  return tool.description || toolDescriptions[tool.name] || `Use ${readableName(tool.name)} in the active workspace.`
}

function iconFor(name: string): IconName {
  if (/bash|docker|test/i.test(name)) return 'terminal'
  if (/read|write|edit|glob|grep|notebook/i.test(name)) return 'file'
  if (/agent|task/i.test(name)) return 'agents'
  if (/github|web|api/i.test(name)) return 'plug'
  if (/plan/i.test(name)) return 'plan'
  return 'tool'
}

export function ToolsPage() {
  const desktop = useDesktop()
  const navigate = useNavigate()
  const { projectRoot } = useProject()
  const [tools, setTools] = useState<RuntimeToolDefinitionDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [expandedTool, setExpandedTool] = useState<string | null>(null)

  const refresh = async () => {
    if (!desktop || !projectRoot) return
    try {
      setTools(await desktop.listToolDefinitions(projectRoot))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  useEffect(() => {
    refresh()
  }, [projectRoot, desktop])

  useEffect(() => {
    setExpandedTool(null)
  }, [projectRoot])

  const filteredTools = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return tools
    return tools.filter(tool =>
      `${tool.name} ${descriptionFor(tool)}`.toLowerCase().includes(value),
    )
  }, [query, tools])

  return (
    <div className="page tools-page">
      <div className="tools-shell">
        <div className="page-header-row tools-header">
          <div>
            <h1 className="page-title">Skills</h1>
            <p className="page-subtitle">Capabilities available to UR in this workspace.</p>
          </div>
          <label className="tools-search">
            <Icon name="search" size={14} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Filter skills"
              aria-label="Filter skills"
            />
          </label>
        </div>

        {error && (
          <div className="chat-error-banner">
            <span><Icon name="alert" size={14} /> {error}</span>
            <button className="link-button" onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}

        <div className="tools-context-bar">
          <span className="tools-context-icon"><Icon name="folder" size={16} /></span>
          <span className="tools-context-copy">
            <strong>{projectRoot?.split('/').pop() ?? 'No project open'}</strong>
            <small>{projectRoot ?? 'Open a project to discover runtime capabilities.'}</small>
          </span>
          <span className="tools-count">{tools.length} available</span>
          <button className="button button-secondary button-small" onClick={refresh} disabled={!projectRoot}>
            Refresh
          </button>
        </div>

        <div className="tools-list" role="list">
          {filteredTools.length === 0 && (
            <div className="tools-empty">
              <Icon name={query ? 'search' : 'tool'} size={20} />
              <span>{query ? 'No skills match your search.' : 'Open a project to discover available skills.'}</span>
            </div>
          )}
          {filteredTools.map(tool => (
            <div
              key={tool.name}
              className={`tool-entry${expandedTool === tool.name ? ' is-expanded' : ''}`}
              role="listitem"
            >
              <button
                type="button"
                className="tool-row"
                aria-expanded={expandedTool === tool.name}
                aria-controls={`tool-details-${tool.name}`}
                onClick={() => setExpandedTool(current => current === tool.name ? null : tool.name)}
              >
                <span className="tool-row-icon"><Icon name={iconFor(tool.name)} size={16} /></span>
                <span className="tool-row-copy">
                  <strong>{readableName(tool.name)}</strong>
                  <small>{descriptionFor(tool)}</small>
                </span>
                <span className="tool-row-meta">
                  {tool.needsApproval && <span className="tool-approval"><Icon name="shield" size={12} /> Approval</span>}
                  <span className={`tool-risk tool-risk-${tool.risk ?? 'low'}`}>
                    <i /> {tool.risk ?? 'low'} risk
                  </span>
                  <Icon className="tool-row-chevron" name="chevron-down" size={14} />
                </span>
              </button>

              {expandedTool === tool.name && (
                <div className="tool-details" id={`tool-details-${tool.name}`}>
                  <div className="tool-details-copy">
                    <span className="tool-details-kicker">Runtime capability</span>
                    <p>{descriptionFor(tool)}</p>
                  </div>
                  <dl className="tool-details-grid">
                    <div>
                      <dt>Status</dt>
                      <dd><span className="tool-status-dot" /> Ready</dd>
                    </div>
                    <div>
                      <dt>Risk level</dt>
                      <dd>{readableName(tool.risk ?? 'low')}</dd>
                    </div>
                    <div>
                      <dt>Approval</dt>
                      <dd>{tool.needsApproval ? 'Required before use' : 'Not required'}</dd>
                    </div>
                    <div>
                      <dt>Scope</dt>
                      <dd>Active workspace</dd>
                    </div>
                  </dl>
                  <div className="tool-details-actions">
                    <span><Icon name="folder" size={13} /> Available in {projectRoot?.split('/').pop() ?? 'this project'}</span>
                    <button
                      type="button"
                      className="button button-secondary button-small"
                      onClick={() => navigate('/', {
                        state: {
                          newChat: Date.now(),
                          skillPrompt: `Use the ${readableName(tool.name)} skill to help with: `,
                        },
                      })}
                    >
                      Use in new thread
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
