import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDesktop } from '../hooks/useDesktop.js'
import { Card } from '../components/Card.js'
import type {
  DesktopProviderKind,
  DesktopProviderInfoDto,
  DesktopProviderConfigDto,
  DesktopProviderConfigPatch,
  DesktopModelInfoDto,
  DesktopProviderConnectionResultDto,
  ProjectSafetyPolicyDto,
} from '../../shared/ipc.js'

const PROVIDER_LABELS: Record<DesktopProviderKind, string> = {
  'openai-api': 'OpenAI API',
  'anthropic-api': 'Claude API',
  openrouter: 'OpenRouter',
  ollama: 'Ollama Local',
  'ollama-network': 'Ollama Network',
  'ollama-cloud': 'Ollama Cloud/API',
  'openai-compatible': 'OpenAI-Compatible',
}

const PROVIDER_DESCRIPTIONS: Record<DesktopProviderKind, string> = {
  'openai-api': 'Official OpenAI API key integration.',
  'anthropic-api': 'Official Anthropic Claude API key integration.',
  openrouter: 'Official OpenRouter API key integration.',
  ollama: 'Local Ollama runtime at localhost:11434.',
  'ollama-network': 'Remote or network Ollama endpoint.',
  'ollama-cloud': 'Ollama Cloud or managed Ollama API endpoint.',
  'openai-compatible': 'Custom OpenAI-compatible endpoint.',
}

export function SettingsPage() {
  const desktop = useDesktop()
  const [projectRoot, setProjectRoot] = useState('')
  const [providers, setProviders] = useState<DesktopProviderInfoDto[]>([])
  const [config, setConfig] = useState<DesktopProviderConfigDto | null>(null)
  const [selectedKind, setSelectedKind] = useState<DesktopProviderKind>('ollama')
  const [model, setModel] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [models, setModels] = useState<DesktopModelInfoDto[]>([])
  const [testResult, setTestResult] = useState<DesktopProviderConnectionResultDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [safetyPolicy, setSafetyPolicy] = useState<ProjectSafetyPolicyDto | null>(null)
  const [policyText, setPolicyText] = useState('')

  const activeProvider = useMemo(
    () => providers.find(p => p.active),
    [providers],
  )

  useEffect(() => {
    if (!desktop || !projectRoot) return
    desktop
      .getProviderConfig(projectRoot)
      .then(cfg => {
        setConfig(cfg)
        setSelectedKind(cfg.providerId)
        setModel(cfg.model ?? '')
        setBaseUrl(cfg.baseUrl ?? '')
      })
      .catch(err => setError(String(err)))
  }, [desktop, projectRoot])

  useEffect(() => {
    if (!desktop || !projectRoot) return
    desktop
      .listProviders(projectRoot)
      .then(setProviders)
      .catch(err => setError(String(err)))
  }, [desktop, projectRoot, config])

  useEffect(() => {
    const storedRoot = localStorage.getItem('ur:projectRoot')
    if (storedRoot) setProjectRoot(storedRoot)
  }, [])

  useEffect(() => {
    if (!desktop || !projectRoot) return
    desktop
      .getSafetyPolicy({ projectRoot })
      .then(policy => {
        const p = policy as unknown as ProjectSafetyPolicyDto
        setSafetyPolicy(p)
        setPolicyText(JSON.stringify(p, null, 2))
      })
      .catch(err => setError(String(err)))
  }, [desktop, projectRoot])

  const refreshModels = useCallback(async () => {
    if (!desktop || !projectRoot) return
    setLoading(true)
    try {
      const discovered = await desktop.listProviderModels(projectRoot, selectedKind)
      setModels(discovered)
      if (discovered[0] && !model) {
        setModel(discovered[0].id)
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [desktop, projectRoot, selectedKind, model])

  const handleTest = useCallback(async () => {
    if (!desktop || !projectRoot) return
    setLoading(true)
    setTestResult(null)
    setError(null)
    try {
      const result = await desktop.testProviderConnection(projectRoot, selectedKind)
      setTestResult(result)
      if (result.models && result.models.length > 0) {
        setModels(result.models.map(id => ({ id, displayName: id, provider: selectedKind })))
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [desktop, projectRoot, selectedKind])

  const handleSave = useCallback(async () => {
    if (!desktop || !projectRoot) return
    setSaving(true)
    setError(null)
    try {
      const patch: DesktopProviderConfigPatch = {
        providerId: selectedKind,
        model: model || undefined,
        baseUrl: baseUrl || undefined,
        apiKey: apiKey || undefined,
      }
      await desktop.setProviderConfig(projectRoot, patch)
      if (apiKey) {
        await desktop.storeProviderApiKey(projectRoot, selectedKind, apiKey)
      }
      const [updatedProviders, updatedConfig] = await Promise.all([
        desktop.listProviders(projectRoot),
        desktop.getProviderConfig(projectRoot),
      ])
      setProviders(updatedProviders)
      setConfig(updatedConfig)
      setApiKey('')
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }, [desktop, projectRoot, selectedKind, model, baseUrl, apiKey])

  const handleActivate = useCallback(async () => {
    if (!desktop || !projectRoot) return
    setSaving(true)
    setError(null)
    try {
      await desktop.updateProvider(projectRoot, selectedKind, model || undefined)
      const updated = await desktop.listProviders(projectRoot)
      setProviders(updated)
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }, [desktop, projectRoot, selectedKind, model])

  const needsBaseUrl = useMemo(
    () =>
      selectedKind === 'ollama-network' ||
      selectedKind === 'ollama-cloud' ||
      selectedKind === 'openai-compatible',
    [selectedKind],
  )

  const needsApiKey = useMemo(
    () => selectedKind !== 'ollama' && selectedKind !== 'ollama-network',
    [selectedKind],
  )

  const handleSavePolicy = useCallback(async () => {
    if (!desktop || !projectRoot) return
    setSaving(true)
    setError(null)
    try {
      const parsed = JSON.parse(policyText) as ProjectSafetyPolicyDto
      await desktop.setSafetyPolicy({ projectRoot, policy: parsed })
      setSafetyPolicy(parsed)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }, [desktop, projectRoot, policyText])

  return (
    <div className="page">
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Configure the active model provider, API keys, and project safety policy.</p>

      {error && <div className="card-body" style={{ color: '#fca5a5', marginBottom: 16 }}>{error}</div>}

      <Card title="Active provider">
        <p className="card-body">
          {activeProvider
            ? `${activeProvider.displayName} is active (${activeProvider.hasKey ? 'key stored' : 'no key'}).`
            : 'No provider configured yet.'}
        </p>
      </Card>

      <Card title="Providers">
        <div className="provider-grid">
          {providers.map(p => (
            <button
              key={p.id}
              className={`provider-card ${p.id === selectedKind ? 'selected' : ''} ${p.active ? 'active' : ''}`}
              onClick={() => {
                setSelectedKind(p.id)
                setConfig(null)
                setModel('')
                setBaseUrl('')
                setApiKey('')
                setTestResult(null)
                setError(null)
                if (desktop && projectRoot) {
                  void desktop
                    .getProviderConfig(projectRoot)
                    .then(cfg => {
                      setConfig(cfg)
                      setModel(cfg.model ?? '')
                      setBaseUrl(cfg.baseUrl ?? '')
                    })
                    .catch(err => setError(String(err)))
                }
              }}
            >
              <div className="provider-card-title">
                {p.id === selectedKind ? '● ' : ''}
                {p.displayName}
                {p.active ? ' (active)' : ''}
              </div>
              <div className="provider-card-meta">
                {p.hasKey ? '🔑 key present' : 'no key'} · tools: {p.supportsTools ? 'yes' : 'no'}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card title={PROVIDER_LABELS[selectedKind]}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p className="card-body">{PROVIDER_DESCRIPTIONS[selectedKind]}</p>

          <label className="form-label">
            Model
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <input
                className="input"
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder={models[0]?.id ?? 'Enter or discover a model'}
                list={`models-${selectedKind}`}
              />
              <datalist id={`models-${selectedKind}`}>
                {models.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.displayName ?? m.id}
                  </option>
                ))}
              </datalist>
              <button
                className="button button-secondary button-small"
                onClick={refreshModels}
                disabled={loading}
              >
                Discover
              </button>
            </div>
          </label>

          {needsBaseUrl && (
            <label className="form-label">
              Base URL
              <input
                className="input"
                type="text"
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                placeholder={
                  selectedKind === 'ollama-network'
                    ? 'http://ollama.local:11434'
                    : selectedKind === 'ollama-cloud'
                      ? 'https://ollama.example.com'
                      : 'http://localhost:1234/v1'
                }
              />
            </label>
          )}

          {needsApiKey && (
            <label className="form-label">
              API key
              <input
                className="input"
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Stored securely in macOS Keychain"
              />
              <span className="hint">Keys are stored by the main process and never sent to the renderer.</span>
            </label>
          )}

          {testResult && (
            <div
              className="card-body"
              style={{
                color: testResult.ok ? '#86efac' : '#fca5a5',
                background: '#1a1a1a',
                padding: 10,
                borderRadius: 6,
              }}
            >
              {testResult.ok ? 'Connected' : testResult.status}: {testResult.error ?? ''}
              {testResult.latencyMs ? ` (${testResult.latencyMs}ms)` : ''}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="button" onClick={handleSave} disabled={saving || loading}>
              {saving ? 'Saving...' : 'Save settings'}
            </button>
            <button className="button button-secondary" onClick={handleTest} disabled={loading}>
              {loading ? 'Testing...' : 'Test connection'}
            </button>
            <button className="button button-secondary" onClick={handleActivate} disabled={saving || loading}>
              Set active
            </button>
          </div>
        </div>
      </Card>

      <Card title="Project safety policy">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p className="card-body">
            Edit the JSON policy loaded from <code>.ur/safety-policy.json</code>. This controls which
            shell commands, file operations, and tool calls require approval.
          </p>
          <textarea
            className="textarea code"
            value={policyText}
            onChange={e => setPolicyText(e.target.value)}
            rows={20}
            spellCheck={false}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="button" onClick={handleSavePolicy} disabled={saving}>
              Save policy
            </button>
            <button
              className="button button-secondary"
              onClick={() => {
                if (safetyPolicy) {
                  setPolicyText(JSON.stringify(safetyPolicy, null, 2))
                }
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
