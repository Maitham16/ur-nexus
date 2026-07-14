import { useEffect, useMemo, useState } from 'react'
import { Card } from '../components/Card.js'
import { ApprovalCard } from '../components/ApprovalCard.js'
import { useDesktop, useRuntimeEvents } from '../hooks/useDesktop.js'
import { useProject } from '../state/ProjectContext.js'
import { Icon } from '../components/Icon.js'
import type { RuntimeEvent, TerminalCommandDto, ApprovalScope, TestRunResultDto } from '../../shared/ipc.js'

type Tab = 'run-log' | 'terminal' | 'tests' | 'agent-logs' | 'errors'

interface RunLogEntry {
  id: string
  type: 'command' | 'tool' | 'system' | 'error'
  title: string
  timestamp: number
  status: 'running' | 'done' | 'error'
  output?: string
  input?: Record<string, unknown>
  result?: unknown
  exitCode?: number
  raw: boolean
}

interface PendingApproval {
  requestId: string
  toolName: string
  input: Record<string, unknown>
  actionType?: string
  target?: string
  reason?: string
  riskLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical'
  approvalProjectRoot?: string
  timestamp: number
}

function stripAnsi(data: string): string {
  return data
    .replace(/\u001b\[[\d;?]*[A-Za-z]/g, '')
    .replace(/\u001b\][\d;]*[^\u0007]*\u0007/g, '')
    .replace(/\u0007/g, '')
    .replace(/\r\n/g, '\n')
}

function formatTime(ms: number): string {
  const d = new Date(ms)
  return d.toLocaleTimeString()
}

function formatDuration(ms?: number): string {
  if (ms === undefined) return '-'
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, '0')
  const rem = (s % 60).toString().padStart(2, '0')
  return `${m}:${rem}`
}

export function TerminalPage() {
  const desktop = useDesktop()
  const { projectRoot } = useProject()
  const [worktreeRoot, setWorktreeRoot] = useState<string | undefined>(undefined)
  const [tab, setTab] = useState<Tab>('terminal')
  const [commands, setCommands] = useState<TerminalCommandDto[]>([])
  const [runLogs, setRunLogs] = useState<RunLogEntry[]>([])
  const [agentLogs, setAgentLogs] = useState<string[]>([])
  const [errors, setErrors] = useState<RunLogEntry[]>([])
  const [rawById, setRawById] = useState<Record<string, boolean>>({})
  const [input, setInput] = useState('')
  const [pendingApprovals, setPendingApprovals] = useState<Record<string, PendingApproval>>({})

  const refresh = async () => {
    if (!desktop || !projectRoot) return
    const list = await desktop.listCommands(projectRoot, worktreeRoot)
    setCommands(list)
  }

  useEffect(() => {
    refresh()
  }, [projectRoot, worktreeRoot, desktop])

  useRuntimeEvents((event: RuntimeEvent) => {
    switch (event.type) {
      case 'command_started': {
        const e = event as { command?: string; commandId?: string }
        if (!e.command) break
        setRunLogs(prev => {
          if (prev.some(l => l.id === e.commandId)) return prev
          return [
            ...prev,
            {
              id: e.commandId || `cmd-${event.timestamp}`,
              type: 'command',
              title: e.command || 'Command',
              timestamp: event.timestamp,
              status: 'running',
              raw: false,
            },
          ]
        })
        refresh()
        break
      }
      case 'command_output': {
        const e = event as { commandId?: string; output: string }
        setRunLogs(prev => {
          const idx = prev.findLastIndex(
            l => l.type === 'command' && l.id === e.commandId && l.status === 'running',
          )
          if (idx === -1) return prev
          const next = [...prev]
          next[idx] = { ...next[idx], output: (next[idx].output ?? '') + e.output }
          return next
        })
        refresh()
        break
      }
      case 'command_finished': {
        const e = event as { commandId?: string; exitCode: number; output?: string }
        setRunLogs(prev => {
          const idx = prev.findLastIndex(
            l => l.type === 'command' && l.id === e.commandId,
          )
          if (idx === -1) return prev
          const next = [...prev]
          next[idx] = {
            ...next[idx],
            exitCode: e.exitCode,
            status: e.exitCode === 0 ? 'done' : 'error',
            output: e.output ?? next[idx].output,
          }
          return next
        })
        refresh()
        break
      }
      case 'tool_call_started': {
        const e = event as { toolName: string; input: Record<string, unknown>; taskId?: string }
        setRunLogs(prev => [
          ...prev,
          {
            id: `tool-${event.timestamp}`,
            type: 'tool',
            title: e.toolName,
            timestamp: event.timestamp,
            status: 'running',
            input: e.input,
            raw: false,
          },
        ])
        break
      }
      case 'tool_call_finished': {
        const e = event as { toolName: string; result?: unknown }
        setRunLogs(prev => {
          const idx = prev.findLastIndex(
            l => l.type === 'tool' && l.title === e.toolName && l.status === 'running',
          )
          if (idx === -1) return prev
          const next = [...prev]
          const hasError = e.result && typeof e.result === 'object' && 'error' in e.result
          next[idx] = { ...next[idx], result: e.result, status: hasError ? 'error' : 'done' }
          return next
        })
        break
      }
      case 'agent_progress': {
        const e = event as { message?: string }
        if (e.message) setAgentLogs(prev => [...prev.slice(-199), e.message!])
        break
      }
      case 'run_failed': {
        const e = event as { error: string }
        setErrors(prev => [
          ...prev,
          {
            id: `err-${event.timestamp}`,
            type: 'error',
            title: 'Run failed',
            timestamp: event.timestamp,
            status: 'error',
            output: e.error,
            raw: false,
          },
        ])
        break
      }
      case 'approval_required': {
        const e = event as {
          requestId: string
          toolName?: string
          input?: Record<string, unknown>
          actionType?: string
          target?: string
          reason?: string
          riskLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical'
          approvalProjectRoot?: string
        }
        setPendingApprovals(prev => ({
          ...prev,
          [e.requestId]: {
            requestId: e.requestId,
            toolName: e.toolName || 'command',
            input: e.input ?? {},
            actionType: e.actionType,
            target: e.target,
            reason: e.reason,
            riskLevel: e.riskLevel,
            approvalProjectRoot: e.approvalProjectRoot,
            timestamp: event.timestamp,
          },
        }))
        break
      }
      case 'approval_responded': {
        const e = event as { requestId: string; approved: boolean; scope?: ApprovalScope }
        setPendingApprovals(prev => {
          const next = { ...prev }
          delete next[e.requestId]
          return next
        })
        if (!e.approved) {
          setErrors(prev => [
            ...prev,
            {
              id: `approval-denied-${event.timestamp}`,
              type: 'error',
              title: 'Approval denied',
              timestamp: event.timestamp,
              status: 'error',
              output: `Request ${e.requestId} was denied.`,
              raw: false,
            },
          ])
        }
        break
      }
    }
  })

  const run = async (cmd: string) => {
    if (!desktop || !projectRoot || !cmd.trim()) return
    setInput('')
    await desktop.runCommand({
      projectRoot,
      command: cmd.trim(),
      worktreeRoot,
    })
    refresh()
  }

  const rerun = async (command: string) => {
    await run(command)
  }

  const respondApproval = async (requestId: string, approved: boolean, scope: ApprovalScope = 'once') => {
    if (!desktop) return
    await desktop.respondApproval({ requestId, approved, scope })
  }

  const stop = async (id: string) => {
    if (!desktop || !projectRoot) return
    await desktop.stopCommand(projectRoot, id, worktreeRoot)
    refresh()
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const toggleRaw = (id: string) => {
    setRawById(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'run-log', label: 'Run Log', count: runLogs.length },
    { id: 'terminal', label: 'Terminal', count: commands.length },
    { id: 'tests', label: 'Tests' },
    { id: 'agent-logs', label: 'Agent Logs', count: agentLogs.length },
    { id: 'errors', label: 'Errors', count: errors.length },
  ]

  const [hiddenBefore, setHiddenBefore] = useState(0)
  const visibleCommands = useMemo(
    () =>
      [...commands]
        .filter(c => c.startTime > hiddenBefore)
        .sort((a, b) => b.startTime - a.startTime),
    [commands, hiddenBefore],
  )

  return (
    <div className="page">
      <h1 className="page-title">Terminal</h1>
      <p className="page-subtitle">Live terminal execution with approval gating and clean output.</p>

      <Card title="Working directory">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="project-value" style={{ flex: 1, minWidth: 200 }}>
            {projectRoot ?? 'No project open — open one from the title bar'}
          </span>
          <input
            className="input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Worktree root (optional)..."
            value={worktreeRoot ?? ''}
            onChange={e => setWorktreeRoot(e.target.value || undefined)}
          />
          <button
            className="button button-secondary"
            onClick={() => projectRoot && desktop?.revealInFinder(worktreeRoot ?? projectRoot)}
            disabled={!projectRoot}
            title="Reveal the working directory in Finder"
          >
            Open in Finder
          </button>
          <button className="button button-secondary" onClick={refresh} disabled={!projectRoot}>
            Refresh
          </button>
        </div>
      </Card>

      <div className="terminal-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`mode-button ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="tab-count">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {tab === 'terminal' && (
        <Card title="Shell">
          <div className="terminal-input-row">
            <span className="terminal-prompt">$</span>
            <input
              className="input terminal-input"
              placeholder="Type a command and press Enter..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') run(input)
              }}
              disabled={!projectRoot}
            />
            <button className="button" onClick={() => run(input)} disabled={!projectRoot || !input.trim()}>
              Run
            </button>
            <button
              className="button button-secondary"
              onClick={() => setHiddenBefore(Date.now())}
              disabled={visibleCommands.length === 0}
              title="Clear the visible command history (does not delete records)"
            >
              Clear display
            </button>
          </div>

          <div className="command-list">
            {visibleCommands.length === 0 && (
              <div className="agent-log-empty">No commands yet.</div>
            )}
            {visibleCommands.map(cmd => (
              <CommandBlock
                key={cmd.id}
                cmd={cmd}
                raw={!!rawById[cmd.id]}
                onToggleRaw={() => toggleRaw(cmd.id)}
                onCopyCommand={() => copy(cmd.command)}
                onCopyOutput={() => copy(cmd.stdout)}
                onRerun={() => rerun(cmd.command)}
                onStop={() => stop(cmd.id)}
              />
            ))}
          </div>
        </Card>
      )}

      {tab === 'run-log' && (
        <Card title="Run Log">
          <div className="command-list">
            {runLogs.length === 0 && <div className="agent-log-empty">No run events yet.</div>}
            {runLogs.map(log => (
              <LogBlock key={log.id} log={log} raw={!!rawById[log.id]} onToggleRaw={() => toggleRaw(log.id)} onCopy={() => copy(log.output || JSON.stringify(log.result, null, 2) || log.title)} />
            ))}
          </div>
        </Card>
      )}

      {tab === 'tests' && (
        <TestsPanel projectRoot={projectRoot} worktreeRoot={worktreeRoot} />
      )}

      {tab === 'agent-logs' && (
        <Card title="Agent Logs">
          <div className="agent-logs">
            {agentLogs.length === 0 && <div className="agent-log-empty">No agent logs yet.</div>}
            {agentLogs.map((line, i) => (
              <div key={i} className="agent-log-line">
                {line}
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'errors' && (
        <Card title="Errors & Approvals">
          <div className="command-list">
            {errors.length === 0 && Object.keys(pendingApprovals).length === 0 && <div className="agent-log-empty">No errors or pending approvals.</div>}
            {Object.values(pendingApprovals).map(approval => (
              <ApprovalCard
                key={approval.requestId}
                actionType={approval.actionType}
                target={approval.target ?? approval.toolName}
                reason={approval.reason}
                riskLevel={approval.riskLevel}
                toolName={approval.toolName}
                input={approval.input}
                onApprove={(approved, scope) => respondApproval(approval.requestId, approved, scope ?? 'once')}
              />
            ))}
            {errors.map(err => (
              <div key={err.id} className="command-block command-status-error">
                <div className="command-header">
                  <span className="command-title">{err.title}</span>
                  <span className="command-meta">{formatTime(err.timestamp)}</span>
                </div>
                {err.output && <pre className="code-block result">{err.output}</pre>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function TestsPanel({
  projectRoot,
  worktreeRoot,
}: {
  projectRoot: string | null
  worktreeRoot?: string
}) {
  const desktop = useDesktop()
  const [command, setCommand] = useState('bun test')
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<TestRunResultDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState(false)

  const run = async (rerunFailed: boolean) => {
    if (!desktop || !projectRoot || !command.trim()) return
    setRunning(true)
    setError(null)
    try {
      const next =
        rerunFailed && result
          ? await desktop.rerunFailedTests({
              projectRoot,
              command: result.command,
              worktreeRoot,
              framework: result.framework,
              failingTests: result.failingTests,
            })
          : await desktop.runTests({
              projectRoot,
              command: command.trim(),
              worktreeRoot,
            })
      setResult(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card title="Test runner">
      <div className="terminal-input-row">
        <span className="terminal-prompt">$</span>
        <input
          className="input terminal-input"
          placeholder="Test command (e.g. bun test, npx vitest run, pytest)…"
          value={command}
          onChange={e => setCommand(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') void run(false)
          }}
          disabled={!projectRoot || running}
        />
        <button
          className="button"
          onClick={() => run(false)}
          disabled={!projectRoot || running || !command.trim()}
        >
          {running ? 'Running…' : 'Run tests'}
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

      {result && (
        <div className="test-result">
          <div className="test-summary">
            {result.runtimeFailure ? (
              <span className="test-runtime-failure">
                Command failed to run (exit {result.exitCode}) — this is not a
                test failure
              </span>
            ) : (
              <>
                <span className="test-count test-pass">{result.passed} passed</span>
                <span className="test-count test-fail">{result.failed} failed</span>
                <span className="test-count test-skip">{result.skipped} skipped</span>
              </>
            )}
            <span className="test-meta">
              {result.framework} · {(result.durationMs / 1000).toFixed(1)}s · exit {result.exitCode}
            </span>
          </div>

          {result.failingTests.length > 0 && (
            <div className="test-failures">
              {result.failingTests.map((t, i) => (
                <div key={`${t.name}-${i}`} className="test-failure-row">
                  <span className="test-failure-name">
                    <Icon name="x" size={12} /> {t.file ? `${t.file} › ` : ''}
                    {t.name}
                  </span>
                  <span className="diffs-detail-actions">
                    <button
                      className="link-button"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `${t.file ? `${t.file}::` : ''}${t.name}${t.message ? ` — ${t.message}` : ''}`,
                        )
                      }
                    >
                      Copy
                    </button>
                    {t.file && (
                      <button
                        className="link-button"
                        onClick={() =>
                          projectRoot && desktop?.openInDefaultApp(`${projectRoot}/${t.file}`)
                        }
                      >
                        Open file
                      </button>
                    )}
                  </span>
                </div>
              ))}
              <button
                className="button button-secondary button-small"
                onClick={() => run(true)}
                disabled={running}
              >
                Rerun failed only
              </button>
            </div>
          )}

          <button className="link-button" onClick={() => setShowRaw(prev => !prev)}>
            {showRaw ? 'Hide raw output' : 'Show raw output'}
          </button>
          {showRaw && <pre className="command-output">{result.output}</pre>}
        </div>
      )}
      {!result && !running && (
        <p className="card-body">
          Run the project test suite and get a structured summary with per-test
          failures.
        </p>
      )}
    </Card>
  )
}

function CommandBlock({
  cmd,
  raw,
  onToggleRaw,
  onCopyCommand,
  onCopyOutput,
  onRerun,
  onStop,
}: {
  cmd: TerminalCommandDto
  raw: boolean
  onToggleRaw: () => void
  onCopyCommand: () => void
  onCopyOutput: () => void
  onRerun: () => void
  onStop: () => void
}) {
  const output = raw ? cmd.stdout : stripAnsi(cmd.stdout)
  return (
    <div className={`command-block command-status-${cmd.status}`}>
      <div className="command-header">
        <span className="command-title">$ {cmd.command}</span>
        <div className="command-meta-group">
          <span className="command-meta">cwd: {cmd.cwd}</span>
          <span className="command-meta">start: {formatTime(cmd.startTime)}</span>
          <span className="command-meta">duration: {formatDuration(cmd.durationMs)}</span>
          <span className={`command-exit command-exit-${cmd.status}`}>
            exit: {cmd.exitCode ?? '-'}
          </span>
        </div>
      </div>
      <div className="command-toolbar">
        <button className="button button-small button-secondary" onClick={onCopyCommand}>
          Copy command
        </button>
        <button className="button button-small button-secondary" onClick={onCopyOutput}>
          Copy output
        </button>
        <button className="button button-small button-secondary" onClick={onRerun}>
          Rerun
        </button>
        {cmd.status === 'running' && (
          <button className="button button-small button-danger" onClick={onStop}>
            Stop
          </button>
        )}
        <label className="raw-toggle">
          <input type="checkbox" checked={raw} onChange={onToggleRaw} />
          Raw
        </label>
      </div>
      {output && <pre className="command-output">{output}</pre>}
    </div>
  )
}

function LogBlock({
  log,
  raw,
  onToggleRaw,
  onCopy,
}: {
  log: RunLogEntry
  raw: boolean
  onToggleRaw: () => void
  onCopy: () => void
}) {
  const output = raw
    ? log.output
    : log.output
    ? stripAnsi(log.output)
    : log.result !== undefined
    ? JSON.stringify(log.result, null, 2)
    : ''
  return (
    <div className={`command-block command-status-${log.status}`}>
      <div className="command-header">
        <span className="command-title">
          {log.type === 'command' && '$ '}
          {log.type === 'tool' && <><Icon name="tool" size={13} />{' '}</>}
          {log.title}
        </span>
        <span className="command-meta">{formatTime(log.timestamp)}</span>
      </div>
      <div className="command-toolbar">
        <button className="button button-small button-secondary" onClick={onCopy}>
          Copy
        </button>
        <label className="raw-toggle">
          <input type="checkbox" checked={raw} onChange={onToggleRaw} />
          Raw
        </label>
      </div>
      {log.input && <pre className="code-block">{JSON.stringify(log.input, null, 2)}</pre>}
      {output && <pre className="command-output">{output}</pre>}
      {log.exitCode !== undefined && (
        <span className={`command-exit command-exit-${log.status}`}>
          exit: {log.exitCode}
        </span>
      )}
    </div>
  )
}
