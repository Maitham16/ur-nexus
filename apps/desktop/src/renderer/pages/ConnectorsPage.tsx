import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDesktop } from '../hooks/useDesktop.js'
import { Card } from '../components/Card.js'
import type {
  RuntimeConnectorDto,
  RuntimeConnectorToolDto,
  ConnectorTransport,
  AddConnectorRequestDto,
  UpdateConnectorRequestDto,
} from '../../shared/ipc.js'

const TRANSPORT_LABELS: Record<ConnectorTransport, string> = {
  stdio: 'Stdio',
  sse: 'SSE',
  http: 'HTTP',
  ws: 'WebSocket',
}

const EMPTY_FORM: AddConnectorRequestDto = {
  projectRoot: '',
  name: '',
  transport: 'stdio',
  command: '',
  args: [],
  env: {},
  cwd: '',
  url: '',
  headers: {},
  enabled: true,
}

export function ConnectorsPage() {
  const desktop = useDesktop()
  const [projectRoot, setProjectRoot] = useState('')
  const [connectors, setConnectors] = useState<RuntimeConnectorDto[]>([])
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [form, setForm] = useState<AddConnectorRequestDto>(EMPTY_FORM)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{ name: string; ok: boolean; error?: string; tools?: RuntimeConnectorToolDto[] } | null>(null)
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set())

  useEffect(() => {
    const storedRoot = localStorage.getItem('ur:projectRoot')
    if (storedRoot) setProjectRoot(storedRoot)
  }, [])

  const refresh = useCallback(async () => {
    if (!desktop || !projectRoot) return
    setLoading(true)
    setError(null)
    try {
      const list = await desktop.listConnectors(projectRoot)
      setConnectors(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [desktop, projectRoot])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const selected = useMemo(
    () => connectors.find(c => c.name === selectedName) ?? null,
    [connectors, selectedName],
  )

  const resetForm = useCallback(() => {
    setForm({ ...EMPTY_FORM, projectRoot })
    setEditing(false)
    setSelectedName(null)
    setTestResult(null)
    setError(null)
  }, [projectRoot])

  const startAdd = useCallback(() => {
    resetForm()
    setForm(prev => ({ ...prev, projectRoot }))
  }, [resetForm, projectRoot])

  const startEdit = useCallback((connector: RuntimeConnectorDto) => {
    setSelectedName(connector.name)
    setEditing(true)
    setForm({
      projectRoot,
      name: connector.name,
      transport: connector.transport,
      command: connector.command ?? '',
      args: connector.args ?? [],
      env: connector.env ?? {},
      cwd: connector.cwd ?? '',
      url: connector.url ?? '',
      headers: connector.headers ?? {},
      enabled: connector.enabled,
    })
    setTestResult(null)
    setError(null)
  }, [projectRoot])

  const parseArgs = useCallback((value: string): string[] => {
    return value
      .split(/\s+/)
      .map(s => s.trim())
      .filter(Boolean)
  }, [])

  const parseKeyValue = useCallback((value: string): Record<string, string> => {
    const result: Record<string, string> = {}
    for (const line of value.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq > 0) {
        result[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
      }
    }
    return result
  }, [])

  const handleSave = useCallback(async () => {
    if (!desktop || !projectRoot || !form.name || !form.transport) return
    setLoading(true)
    setError(null)
    try {
      if (editing) {
        const update: UpdateConnectorRequestDto = {
          projectRoot,
          name: form.name,
          enabled: form.enabled,
          config: {
            transport: form.transport,
            command: form.command || undefined,
            args: form.args,
            env: form.env,
            cwd: form.cwd || undefined,
            url: form.url || undefined,
            headers: form.headers,
          },
        }
        await desktop.updateConnector(update)
      } else {
        const add: AddConnectorRequestDto = {
          projectRoot,
          name: form.name,
          transport: form.transport,
          command: form.command || undefined,
          args: form.args,
          env: form.env,
          cwd: form.cwd || undefined,
          url: form.url || undefined,
          headers: form.headers,
          enabled: form.enabled,
        }
        await desktop.addConnector(add)
      }
      await refresh()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [desktop, projectRoot, form, editing, refresh, resetForm])

  const handleRemove = useCallback(async (name: string) => {
    if (!desktop || !projectRoot) return
    setLoading(true)
    setError(null)
    try {
      await desktop.removeConnector(projectRoot, name)
      if (selectedName === name) resetForm()
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [desktop, projectRoot, selectedName, refresh, resetForm])

  const handleTest = useCallback(async (name: string) => {
    if (!desktop || !projectRoot) return
    setLoading(true)
    setTestResult(null)
    setError(null)
    try {
      const result = await desktop.testConnector(projectRoot, name)
      setTestResult({ name, ...result })
      await refresh()
    } catch (err) {
      setTestResult({ name, ok: false, error: err instanceof Error ? err.message : String(err) })
    } finally {
      setLoading(false)
    }
  }, [desktop, projectRoot, refresh])

  const toggleTools = useCallback((name: string) => {
    setExpandedTools(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }, [])

  const isRemote = form.transport !== 'stdio'
  const needsUrl = isRemote
  const needsCommand = form.transport === 'stdio'

  return (
    <div className="page">
      <h1 className="page-title">Connectors</h1>
      <p className="page-subtitle">MCP servers, IDE integrations, and external tools.</p>

      {error && (
        <div
          className="card-body"
          style={{ color: '#fca5a5', marginBottom: 16, background: '#2a0f0f', padding: 10, borderRadius: 6 }}
        >
          {error}
        </div>
      )}

      <Card title="Configured connectors">
        {connectors.length === 0 ? (
          <p className="card-body">No MCP servers configured yet.</p>
        ) : (
          <div className="list">
            {connectors.map(c => (
              <div key={c.name} className={`list-item ${selectedName === c.name ? 'active' : ''}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, color: '#f5f5f5' }}>{c.name}</span>
                    <span className="badge">{TRANSPORT_LABELS[c.transport]}</span>
                    <span className={`badge ${c.enabled ? 'badge-active' : ''}`}>
                      {c.enabled ? 'enabled' : 'disabled'}
                    </span>
                    {c.status === 'connected' && <span className="badge badge-active">connected</span>}
                    {c.status === 'failed' && <span className="badge badge-danger">failed</span>}
                  </div>
                  {c.error && <div style={{ fontSize: 12, color: '#fca5a5' }}>{c.error}</div>}
                  {expandedTools.has(c.name) && c.tools && c.tools.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                      {c.tools.map(t => (
                        <div key={t.name} style={{ fontSize: 12, color: '#a3a3a3' }}>
                          • {t.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    className="button button-secondary button-small"
                    onClick={() => startEdit(c)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    className="button button-secondary button-small"
                    onClick={() => handleTest(c.name)}
                    disabled={loading}
                  >
                    Test
                  </button>
                  <button
                    className="button button-secondary button-small"
                    onClick={() => toggleTools(c.name)}
                    disabled={loading}
                  >
                    {expandedTools.has(c.name) ? 'Hide tools' : 'Tools'}
                  </button>
                  <button
                    className="button button-danger button-small"
                    onClick={() => handleRemove(c.name)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {testResult && (
        <Card title={`Test: ${testResult.name}`}>
          <div
            className="card-body"
            style={{
              color: testResult.ok ? '#86efac' : '#fca5a5',
              background: '#1a1a1a',
              padding: 10,
              borderRadius: 6,
            }}
          >
            {testResult.ok ? 'Connected' : 'Failed'}
            {testResult.error ? `: ${testResult.error}` : ''}
            {testResult.tools && testResult.tools.length > 0 && (
              <div style={{ marginTop: 8 }}>
                Discovered {testResult.tools.length} tool{testResult.tools.length === 1 ? '' : 's'}.
              </div>
            )}
          </div>
        </Card>
      )}

      <Card title={editing ? `Edit ${form.name}` : 'Add connector'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label className="form-label">
            Name
            <input
              className="input"
              type="text"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. filesystem"
              disabled={editing || loading}
            />
          </label>

          <label className="form-label">
            Transport
            <select
              className="select"
              value={form.transport}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  transport: e.target.value as ConnectorTransport,
                  command: '',
                  url: '',
                  args: [],
                }))
              }
              disabled={loading}
            >
              <option value="stdio">Stdio (spawn local process)</option>
              <option value="sse">SSE (Server-Sent Events)</option>
              <option value="http">HTTP (Streamable)</option>
              <option value="ws">WebSocket</option>
            </select>
          </label>

          {needsCommand && (
            <>
              <label className="form-label">
                Command
                <input
                  className="input"
                  type="text"
                  value={form.command}
                  onChange={e => setForm(prev => ({ ...prev, command: e.target.value }))}
                  placeholder="e.g. npx"
                  disabled={loading}
                />
              </label>

              <label className="form-label">
                Args (space-separated)
                <input
                  className="input"
                  type="text"
                  value={form.args?.join(' ') ?? ''}
                  onChange={e => setForm(prev => ({ ...prev, args: parseArgs(e.target.value) }))}
                  placeholder="-y @modelcontextprotocol/server-filesystem /tmp"
                  disabled={loading}
                />
              </label>

              <label className="form-label">
                Working directory (optional)
                <input
                  className="input"
                  type="text"
                  value={form.cwd}
                  onChange={e => setForm(prev => ({ ...prev, cwd: e.target.value }))}
                  placeholder="Project root"
                  disabled={loading}
                />
              </label>
            </>
          )}

          {needsUrl && (
            <label className="form-label">
              URL
              <input
                className="input"
                type="text"
                value={form.url}
                onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))}
                placeholder={
                  form.transport === 'ws'
                    ? 'ws://localhost:3001'
                    : form.transport === 'sse'
                      ? 'http://localhost:3001/sse'
                      : 'http://localhost:3001/mcp'
                }
                disabled={loading}
              />
            </label>
          )}

          <label className="form-label">
            Environment variables
            <textarea
              className="input"
              rows={3}
              value={Object.entries(form.env ?? {})
                .map(([k, v]) => `${k}=${v}`)
                .join('\n')}
              onChange={e => setForm(prev => ({ ...prev, env: parseKeyValue(e.target.value) }))}
              placeholder="KEY=value&#10;SECRET=token"
              disabled={loading}
            />
            <span className="hint">One KEY=value per line. Secrets stay in the main process.</span>
          </label>

          {isRemote && (
            <label className="form-label">
              Headers
              <textarea
                className="input"
                rows={2}
                value={Object.entries(form.headers ?? {})
                  .map(([k, v]) => `${k}=${v}`)
                  .join('\n')}
                onChange={e => setForm(prev => ({ ...prev, headers: parseKeyValue(e.target.value) }))}
                placeholder="Authorization=Bearer token"
                disabled={loading}
              />
              <span className="hint">One Header-Name=value per line. Values are redacted in logs.</span>
            </label>
          )}

          <label className="raw-toggle">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={e => setForm(prev => ({ ...prev, enabled: e.target.checked }))}
              disabled={loading}
            />
            Enabled
          </label>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="button" onClick={handleSave} disabled={loading || !form.name}>
              {editing ? 'Update connector' : 'Add connector'}
            </button>
            {(editing || form.name) && (
              <button className="button button-secondary" onClick={resetForm} disabled={loading}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
