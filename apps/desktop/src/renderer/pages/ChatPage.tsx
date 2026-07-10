import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useDesktop, useRuntimeEvents } from '../hooks/useDesktop.js'
import type {
  RuntimeEvent,
  DesktopProviderInfoDto,
  DesktopModelInfoDto,
  RuntimeAgentInfoDto,
  RuntimeTaskInfoDto,
  WorktreeInfoDto,
} from '../../shared/ipc.js'

type Mode = 'ask' | 'edit' | 'agent'

type MessageRole =
  | 'user'
  | 'assistant'
  | 'system'
  | 'tool'
  | 'approval'
  | 'diff'
  | 'error'
  | 'final_report'

interface BaseMessage {
  id: string
  role: MessageRole
  runId?: string
  timestamp: number
}

interface UserMessage extends BaseMessage {
  role: 'user'
  content: string
  attachments?: string[]
}

interface AssistantMessage extends BaseMessage {
  role: 'assistant'
  content: string
}

interface SystemMessage extends BaseMessage {
  role: 'system'
  content: string
}

interface ToolMessage extends BaseMessage {
  role: 'tool'
  toolName: string
  input: Record<string, unknown>
  result?: unknown
  status: 'running' | 'done' | 'error'
}

interface ApprovalMessage extends BaseMessage {
  role: 'approval'
  requestId: string
  toolName: string
  input: Record<string, unknown>
  actionType?: string
  target?: string
  reason?: string
  riskLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical'
  projectRoot?: string
  responded?: boolean
  approved?: boolean
  scope?: 'once' | 'run' | 'session' | 'permanent'
}

interface DiffMessage extends BaseMessage {
  role: 'diff'
  diffId: string
  filePath: string
  patch: string
  applied?: boolean
}

interface ErrorMessage extends BaseMessage {
  role: 'error'
  content: string
}

interface FinalReportMessage extends BaseMessage {
  role: 'final_report'
  content: string
  path?: string
}

type ChatMessage =
  | UserMessage
  | AssistantMessage
  | SystemMessage
  | ToolMessage
  | ApprovalMessage
  | DiffMessage
  | ErrorMessage
  | FinalReportMessage

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function ChatPage() {
  const desktop = useDesktop()

  const [projectRoot, setProjectRoot] = useState('')
  const [projectName, setProjectName] = useState('')
  const [runId, setRunId] = useState<string | null>(null)
  const [worktreeRoot, setWorktreeRoot] = useState<string | undefined>(undefined)
  const [useWorktree, setUseWorktree] = useState(true)
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [changedFiles, setChangedFiles] = useState<string[]>([])

  const [worktrees, setWorktrees] = useState<WorktreeInfoDto[]>([])

  const [mode, setMode] = useState<Mode>('ask')
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])

  const [providers, setProviders] = useState<DesktopProviderInfoDto[]>([])
  const [models, setModels] = useState<DesktopModelInfoDto[]>([])
  const [agents, setAgents] = useState<RuntimeAgentInfoDto[]>([])
  const [tasks, setTasks] = useState<RuntimeTaskInfoDto[]>([])
  const [selectedProvider, setSelectedProvider] = useState('')
  const [selectedModel, setSelectedModel] = useState('')

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const streamRef = useRef<HTMLDivElement>(null)

  // Elapsed timer
  useEffect(() => {
    if (!startTime || status !== 'running') return
    const interval = setInterval(() => setElapsed(Date.now() - startTime), 1000)
    return () => clearInterval(interval)
  }, [startTime, status])

  const scrollToBottom = useCallback(() => {
    streamRef.current?.scrollTo({
      top: streamRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const refreshProjectState = useCallback(async () => {
    if (!desktop || !projectRoot) return
    const [p, m, a, t, wts] = await Promise.all([
      desktop.listProviders(projectRoot),
      desktop.listModels(projectRoot),
      desktop.listAgents(projectRoot),
      desktop.listTasks(projectRoot),
      desktop.listWorktrees(projectRoot),
    ])
    setProviders(p)
    setModels(m)
    setAgents(a)
    setTasks(t)
    setWorktrees(wts)
    const active = p.find(x => x.active)
    if (active && !selectedProvider) setSelectedProvider(active.id)
    if (m[0] && !selectedModel) setSelectedModel(m[0].id)
  }, [desktop, projectRoot, selectedProvider, selectedModel])

  const handleEvent = useCallback(
    (event: RuntimeEvent) => {
      switch (event.type) {
        case 'run_started': {
          const started = event as { worktreeRoot?: string }
          setStatus('running')
          setStartTime(Date.now())
          setElapsed(0)
          setWorktreeRoot(started.worktreeRoot)
          setChangedFiles([])
          setMessages(prev => [
            ...prev,
            {
              id: `run-${event.timestamp}`,
              role: 'system',
              content: started.worktreeRoot
                ? `Run started in worktree ${started.worktreeRoot}`
                : 'Run started',
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          refreshProjectState()
          break
        }

        case 'message_created': {
          const e = event as { role: 'user' | 'assistant'; content: string }
          if (e.role === 'assistant') {
            setMessages(prev => [
              ...prev,
              {
                id: `msg-${event.timestamp}`,
                role: 'assistant',
                content: e.content,
                runId: event.runId,
                timestamp: event.timestamp,
              },
            ])
          }
          break
        }

        case 'model_stream': {
          const e = event as { delta: string }
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (last && last.role === 'assistant') {
              const next = [...prev]
              next[next.length - 1] = {
                ...last,
                content: (last as AssistantMessage).content + e.delta,
              }
              return next
            }
            return [
              ...prev,
              {
                id: `stream-${event.timestamp}`,
                role: 'assistant',
                content: e.delta,
                runId: event.runId,
                timestamp: event.timestamp,
              },
            ]
          })
          break
        }

        case 'plan_created': {
          const e = event as { plan: string }
          setMessages(prev => [
            ...prev,
            {
              id: `plan-${event.timestamp}`,
              role: 'system',
              content: `Plan:\n${e.plan}`,
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          break
        }

        case 'task_created': {
          const e = event as { taskId: string; title: string }
          setMessages(prev => [
            ...prev,
            {
              id: `task-${event.timestamp}`,
              role: 'system',
              content: `Task created: ${e.title}`,
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          refreshProjectState()
          break
        }

        case 'task_started':
        case 'task_progress':
        case 'task_done':
        case 'task_failed':
        case 'agent_started':
        case 'agent_progress':
        case 'agent_finished':
          setMessages(prev => [
            ...prev,
            {
              id: `progress-${event.timestamp}`,
              role: 'system',
              content: JSON.stringify(event),
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          refreshProjectState()
          break

        case 'tool_call_started': {
          const e = event as {
            toolName: string
            input: Record<string, unknown>
          }
          setMessages(prev => [
            ...prev,
            {
              id: `tool-${event.timestamp}`,
              role: 'tool',
              toolName: e.toolName,
              input: e.input,
              status: 'running',
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          break
        }

        case 'tool_call_finished': {
          const e = event as { toolName: string; result: unknown }
          setMessages(prev => {
            const idx = prev.findLastIndex(
              m =>
                m.role === 'tool' &&
                m.toolName === e.toolName &&
                m.status === 'running',
            )
            if (idx === -1) return prev
            const next = [...prev]
            next[idx] = {
              ...next[idx],
              status: 'done',
              result: e.result,
            } as ToolMessage
            return next
          })
          break
        }

        case 'command_started': {
          const e = event as { command: string }
          setMessages(prev => [
            ...prev,
            {
              id: `cmd-${event.timestamp}`,
              role: 'tool',
              toolName: 'Bash',
              input: { command: e.command },
              status: 'running',
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          break
        }

        case 'command_output': {
          const e = event as { output: string }
          setMessages(prev => {
            const idx = prev.findLastIndex(m => m.role === 'tool' && m.toolName === 'Bash' && m.status === 'running')
            if (idx === -1) return prev
            const next = [...prev]
            next[idx] = {
              ...next[idx],
              result: (next[idx] as ToolMessage).result ?? '' + e.output,
            } as ToolMessage
            return next
          })
          break
        }

        case 'command_finished': {
          const e = event as { exitCode: number; output?: string }
          setMessages(prev => {
            const idx = prev.findLastIndex(m => m.role === 'tool' && m.toolName === 'Bash' && m.status === 'running')
            if (idx === -1) return prev
            const next = [...prev]
            next[idx] = {
              ...next[idx],
              status: e.exitCode === 0 ? 'done' : 'error',
              result: e.output ?? (next[idx] as ToolMessage).result,
            } as ToolMessage
            return next
          })
          break
        }

        case 'approval_required': {
          const e = event as {
            requestId: string
            toolName: string
            input: Record<string, unknown>
            actionType?: string
            target?: string
            reason?: string
            riskLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical'
            projectRoot?: string
          }
          setMessages(prev => [
            ...prev,
            {
              id: `approval-${event.timestamp}`,
              role: 'approval',
              requestId: e.requestId,
              toolName: e.toolName,
              input: e.input,
              actionType: e.actionType,
              target: e.target,
              reason: e.reason,
              riskLevel: e.riskLevel,
              projectRoot: e.projectRoot,
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          break
        }

        case 'diff_created': {
          const e = event as {
            diffId: string
            filePath: string
            patch: string
          }
          setMessages(prev => [
            ...prev,
            {
              id: `diff-${event.timestamp}`,
              role: 'diff',
              diffId: e.diffId,
              filePath: e.filePath,
              patch: e.patch,
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          break
        }

        case 'patch_applied': {
          const e = event as { diffId: string; filePath: string }
          setMessages(prev => {
            const idx = prev.findIndex(
              m => m.role === 'diff' && m.diffId === e.diffId,
            )
            if (idx === -1) return prev
            const next = [...prev]
            next[idx] = { ...next[idx], applied: true } as DiffMessage
            return next
          })
          setChangedFiles(prev => (prev.includes(e.filePath) ? prev : [...prev, e.filePath]))
          break
        }

        case 'changed_files': {
          const e = event as { files: string[] }
          setChangedFiles(prev => Array.from(new Set([...prev, ...e.files])))
          break
        }

        case 'worktree_created': {
          const e = event as { worktreeRoot: string; branch: string }
          setMessages(prev => [
            ...prev,
            {
              id: `wt-${event.timestamp}`,
              role: 'system',
              content: `Worktree created: ${e.branch}\n${e.worktreeRoot}`,
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          break
        }

        case 'run_finished':
          setStatus('idle')
          setMessages(prev => [
            ...prev,
            {
              id: `finish-${event.timestamp}`,
              role: 'system',
              content: `Run finished in ${formatElapsed(elapsed || 0)}`,
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          break

        case 'run_failed': {
          const e = event as { error: string }
          setStatus('idle')
          setMessages(prev => [
            ...prev,
            {
              id: `fail-${event.timestamp}`,
              role: 'error',
              content: e.error,
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          break
        }
      }
    },
    [elapsed, refreshProjectState],
  )

  useRuntimeEvents(handleEvent)

  const openProject = async () => {
    if (!desktop || !projectRoot) return
    await desktop.openProject(projectRoot)
    setProjectName(projectRoot.split('/').pop() || projectRoot)
    await refreshProjectState()
  }

  const startRun = async () => {
    if (!desktop || !projectRoot) return
    const session = await desktop.startRun(projectRoot, {
      useWorktree,
      branch: undefined,
    })
    setRunId(session.sessionId)
    setWorktreeRoot(session.worktreeRoot)
    setStatus('running')
    setStartTime(Date.now())
    setElapsed(0)
    setChangedFiles([])
    if (selectedProvider) {
      await desktop.updateProvider(projectRoot, selectedProvider, selectedModel)
    }
    await refreshProjectState()
  }

  const send = async () => {
    if (!desktop || !runId || !input.trim()) return
    const content = input.trim()
    setMessages(prev => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        attachments: [...attachments],
        timestamp: Date.now(),
      },
    ])
    setInput('')
    setAttachments([])
    await desktop.sendMessage(runId, content)
  }

  const stop = async () => {
    if (!desktop || !runId) return
    await desktop.stopRun(runId)
    setStatus('idle')
  }

  const clearContext = () => {
    setMessages([])
    setRunId(null)
    setWorktreeRoot(undefined)
    setStatus('idle')
    setStartTime(null)
    setElapsed(0)
    setChangedFiles([])
  }

  const attachFile = async () => {
    if (!desktop || !projectRoot) return
    const candidate = window.prompt('Enter relative file path to attach:')
    if (!candidate) return
    const text = await desktop.readFile({
      projectRoot,
      path: candidate,
      worktreeRoot,
    })
    if (text !== null) {
      setAttachments(prev => [...prev, candidate])
    } else {
      window.alert(`Could not read ${candidate}`)
    }
  }

  const approve = async (
    msg: ApprovalMessage,
    approved: boolean,
    scope: 'once' | 'run' | 'session' | 'permanent' = 'once',
  ) => {
    if (!desktop) return
    await desktop.respondApproval({ requestId: msg.requestId, approved, scope })
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === msg.id)
      if (idx === -1) return prev
      const next = [...prev]
      next[idx] = {
        ...next[idx],
        responded: true,
        approved,
        scope,
      } as ApprovalMessage
      return next
    })
  }

  const applyDiff = async (msg: DiffMessage) => {
    if (!desktop || !projectRoot) return
    await desktop.applyPatch({
      projectRoot,
      patch: msg.patch,
      worktreeRoot,
    })
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === msg.id)
      if (idx === -1) return prev
      const next = [...prev]
      next[idx] = { ...next[idx], applied: true } as DiffMessage
      return next
    })
    setChangedFiles(prev =>
      prev.includes(msg.filePath) ? prev : [...prev, msg.filePath],
    )
  }

  const exportReport = async () => {
    if (!desktop || !projectRoot) return
    const report = await desktop.exportReport(projectRoot, worktreeRoot)
    setMessages(prev => [
      ...prev,
      {
        id: `report-${Date.now()}`,
        role: 'final_report',
        content: `Report exported to ${report.path}`,
        path: report.path,
        timestamp: Date.now(),
      },
    ])
  }

  const activeTask = useMemo(
    () => tasks.find(t => t.status === 'running'),
    [tasks],
  )

  return (
    <div className="page chat-page">
      <header className="chat-header">
        <div className="chat-header-left">
          <div className="chat-project">
            {projectName || 'No project selected'}
          </div>
          <div className="chat-meta">
            <span className="badge">{providers.find(p => p.id === selectedProvider)?.displayName || 'Provider'}</span>
            <span className="badge">{selectedModel || 'Model'}</span>
            <span className="badge">{agents.length} agents</span>
            {activeTask && (
              <span className="badge badge-active">
                ■ {activeTask.title}
              </span>
            )}
            {worktreeRoot && (
              <span className="badge badge-worktree" title={worktreeRoot}>
                worktree
              </span>
            )}
            {changedFiles.length > 0 && (
              <span className="badge badge-changed">
                {changedFiles.length} changed
              </span>
            )}
            {status === 'running' && (
              <span className="badge badge-running">
                ⏱ {formatElapsed(elapsed)}
              </span>
            )}
          </div>
        </div>

        <div className="chat-header-right">
          <select
            className="select"
            value={selectedProvider}
            onChange={async e => {
              const providerId = e.target.value
              setSelectedProvider(providerId)
              const p = providers.find(x => x.id === providerId)
              if (p) {
                await desktop?.updateProvider(projectRoot, p.id, selectedModel)
                try {
                  const discovered = await desktop?.listProviderModels(projectRoot, providerId)
                  if (discovered) {
                    setModels(discovered)
                    if (discovered[0] && !selectedModel) {
                      setSelectedModel(discovered[0].id)
                    }
                  }
                } catch {
                  // Discovery failure is non-fatal; user can still type a model.
                }
              }
            }}
          >
            <option value="">Provider</option>
            {providers.map(p => (
              <option key={p.id} value={p.id}>
                {p.displayName} {p.active ? '(active)' : ''}
              </option>
            ))}
          </select>

          <select
            className="select"
            value={selectedModel}
            onChange={async e => {
              const modelId = e.target.value
              setSelectedModel(modelId)
              if (selectedProvider) {
                await desktop?.updateProvider(projectRoot, selectedProvider, modelId)
              }
            }}
          >
            <option value="">Model</option>
            {models.map(m => (
              <option key={m.id} value={m.id}>
                {m.displayName || m.id}
              </option>
            ))}
          </select>

          <button className="button button-secondary" onClick={exportReport}>
            Export
          </button>
        </div>
      </header>

      <div className="chat-stream" ref={streamRef}>
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <p>Open a project, start a run, and send a message.</p>
          </div>
        )}

        {messages.map(message => (
          <MessageView
            key={message.id}
            message={message}
            onApprove={approve}
            onApplyDiff={applyDiff}
          />
        ))}
      </div>

      <div className="composer-card">
        <div className="composer-toolbar">
          <div className="composer-modes">
            {(['ask', 'edit', 'agent'] as Mode[]).map(m => (
              <button
                key={m}
                className={`mode-button ${mode === m ? 'active' : ''}`}
                onClick={() => setMode(m)}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          <div className="composer-tools">
            <button
              className="button button-secondary"
              onClick={attachFile}
              disabled={!projectRoot}
            >
              Attach
            </button>
            {status === 'running' && (
              <button className="button button-danger" onClick={stop}>
                Stop
              </button>
            )}
            <button
              className="button button-secondary"
              onClick={clearContext}
              disabled={messages.length === 0}
            >
              Clear
            </button>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="attachment-list">
            {attachments.map(file => (
              <span key={file} className="attachment-chip">
                📎 {file}
              </span>
            ))}
          </div>
        )}

        <div className="composer-input-row">
          <textarea
            className="composer-textarea"
            placeholder={`${mode === 'edit' ? 'Describe the edit' : mode === 'agent' ? 'Assign an agent' : 'Ask UR to do something'}...`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                send()
              }
            }}
            rows={3}
          />
          <button
            className="button send-button"
            onClick={send}
            disabled={!runId || !input.trim()}
          >
            Send
          </button>
        </div>

        <div className="composer-footer">
          <input
            className="input project-input"
            placeholder="Project root path..."
            value={projectRoot}
            onChange={e => setProjectRoot(e.target.value)}
          />
          <button
            className="button button-secondary"
            onClick={openProject}
            disabled={!projectRoot}
          >
            Open
          </button>
          <label className="worktree-toggle">
            <input
              type="checkbox"
              checked={useWorktree}
              onChange={e => setUseWorktree(e.target.checked)}
              disabled={status !== 'idle'}
            />
            Worktree
          </label>
          <button
            className="button"
            onClick={startRun}
            disabled={!projectRoot || status !== 'idle'}
          >
            Start run
          </button>
        </div>

        {worktreeRoot && (
          <div className="worktree-bar">
            <span className="worktree-label">Worktree:</span>
            <span className="worktree-path">{worktreeRoot}</span>
          </div>
        )}

        {changedFiles.length > 0 && (
          <div className="changed-files-bar">
            <span className="changed-files-label">Changed files:</span>
            <div className="changed-files-list">
              {changedFiles.map(f => (
                <span key={f} className="changed-file-chip">{f.split('/').pop() ?? f}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MessageView({
  message,
  onApprove,
  onApplyDiff,
}: {
  message: ChatMessage
  onApprove: (
    msg: ApprovalMessage,
    approved: boolean,
    scope?: 'once' | 'run' | 'session' | 'permanent',
  ) => void
  onApplyDiff: (msg: DiffMessage) => void
}) {
  switch (message.role) {
    case 'user':
      return (
        <div className="message user">
          <div className="message-meta">You</div>
          <div className="message-body">{(message as UserMessage).content}</div>
          {(message as UserMessage).attachments &&
            (message as UserMessage).attachments!.length > 0 && (
              <div className="message-attachments">
                {(message as UserMessage).attachments!.map(a => (
                  <span key={a} className="attachment-chip">
                    📎 {a}
                  </span>
                ))}
              </div>
            )}
        </div>
      )

    case 'assistant':
      return (
        <div className="message assistant">
          <div className="message-meta">
            <span className="assistant-dot" /> UR
          </div>
          <div className="message-body">{(message as AssistantMessage).content}</div>
        </div>
      )

    case 'system':
      return (
        <div className="message system">
          <div className="message-body system-body">
            {(message as SystemMessage).content}
          </div>
        </div>
      )

    case 'tool': {
      const m = message as ToolMessage
      return (
        <div className="message tool">
          <div className="message-meta">🔧 {m.toolName}</div>
          <div className="tool-status">{m.status}</div>
          <pre className="code-block">{JSON.stringify(m.input, null, 2)}</pre>
          {m.result !== undefined && (
            <pre className="code-block result">
              {JSON.stringify(m.result, null, 2)}
            </pre>
          )}
        </div>
      )
    }

    case 'approval': {
      const m = message as ApprovalMessage
      const riskClass = `risk-${m.riskLevel ?? 'low'}`
      return (
        <div className={`message approval ${riskClass}`}>
          <div className="message-meta">⏸ Approval required &mdash; {m.actionType ?? m.toolName}</div>
          {m.target && m.target !== m.toolName && (
            <div className="approval-target">{m.target}</div>
          )}
          {m.reason && (
            <div className="approval-reason">{m.reason}</div>
          )}
          {m.riskLevel && (
            <div className={`approval-risk ${riskClass}`}>Risk: {m.riskLevel}</div>
          )}
          {m.projectRoot && (
            <div className="approval-project">Project: {m.projectRoot}</div>
          )}
          <pre className="code-block">{JSON.stringify(m.input, null, 2)}</pre>
          {m.responded ? (
            <div className={`approval-result ${m.approved ? 'approved' : 'denied'}`}>
              {m.approved ? `Approved (${m.scope ?? 'once'})` : 'Denied'}
            </div>
          ) : (
            <div className="approval-actions">
              <button
                className="button"
                onClick={() => onApprove(m, true, 'once')}
              >
                Allow once
              </button>
              &nbsp;
              <button
                className="button"
                onClick={() => onApprove(m, true, 'run')}
              >
                Allow for this run
              </button>
              &nbsp;
              <button
                className="button button-secondary"
                onClick={() => onApprove(m, false)}
              >
                Deny
              </button>
            </div>
          )}
        </div>
      )
    }

    case 'diff': {
      const m = message as DiffMessage
      return (
        <div className="message diff">
          <div className="message-meta">📝 {m.filePath}</div>
          <pre className="code-block diff-block">{m.patch}</pre>
          {m.applied ? (
            <div className="diff-applied">Applied</div>
          ) : (
            <button className="button" onClick={() => onApplyDiff(m)}>
              Apply patch
            </button>
          )}
        </div>
      )
    }

    case 'error':
      return (
        <div className="message error">
          <div className="message-meta">Error</div>
          <div className="message-body">{(message as ErrorMessage).content}</div>
        </div>
      )

    case 'final_report': {
      const m = message as FinalReportMessage
      return (
        <div className="message final-report">
          <div className="message-meta">📋 Final report</div>
          <div className="message-body">{m.content}</div>
        </div>
      )
    }
  }
}
