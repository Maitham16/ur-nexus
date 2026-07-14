import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDesktop } from '../hooks/useDesktop.js'
import { useProject } from '../state/ProjectContext.js'
import { Card } from '../components/Card.js'
import type {
  DesktopProviderKind,
  DesktopProviderInfoDto,
  DesktopProviderConfigDto,
  DesktopProviderConfigPatch,
  DesktopModelInfoDto,
  DesktopProviderConnectionResultDto,
  ProjectSafetyPolicyDto,
  AgentPermissionSettingsDto,
} from '../../shared/ipc.js'

const DEFAULT_PERMISSIONS: AgentPermissionSettingsDto = {
  approvalPolicy: 'on-request',
  sandboxMode: 'workspace-write',
  networkAccess: false,
}

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
  const { projectRoot } = useProject()
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
  const [permissions, setPermissions] = useState<AgentPermissionSettingsDto>(DEFAULT_PERMISSIONS)
  const [permissionsSaved, setPermissionsSaved] = useState(false)

  // Provider/model configuration is global (user settings), so it does not
  // require an open project. Safety policy below is project-scoped.
  const providerRoot = projectRoot ?? ''

  const activeProvider = useMemo(
    () => providers.find(p => p.active),
    [providers],
  )
  const selectedProvider = useMemo(
    () => providers.find(p => p.id === selectedKind),
    [providers, selectedKind],
  )
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

  useEffect(() => {
    if (!desktop) return
    desktop
      .getProviderConfig(providerRoot)
      .then(cfg => {
        setConfig(cfg)
        setSelectedKind(cfg.providerId)
        setModel(cfg.model ?? '')
        setBaseUrl(cfg.baseUrl ?? '')
      })
      .catch(err => setError(String(err)))
  }, [desktop, providerRoot])

  useEffect(() => {
    if (!desktop) return
    desktop
      .getAgentPermissions()
      .then(setPermissions)
      .catch(err => setError(String(err)))
  }, [desktop])

  useEffect(() => {
    if (!desktop) return
    desktop
      .listProviders(providerRoot)
      .then(setProviders)
      .catch(err => setError(String(err)))
  }, [desktop, providerRoot, config])

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
    if (!desktop) return
    setLoading(true)
    setError(null)
    try {
      const discovered = await desktop.listProviderModels(providerRoot, selectedKind)
      setModels(discovered)
      if (discovered[0] && !model) {
        setModel(discovered[0].id)
      }
      if (discovered.length === 0) {
        setError(
          `No models discovered for ${selectedKind}. For API providers, save a key first; for Ollama, check the base URL and that the server is running.`,
        )
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [desktop, providerRoot, selectedKind, model])

  // Auto-discover models when the selected provider changes so the list is
  // populated without a manual click.
  useEffect(() => {
    if (!desktop) return
    let cancelled = false
    desktop
      .listProviderModels(providerRoot, selectedKind)
      .then(discovered => {
        if (!cancelled) setModels(discovered)
      })
      .catch(() => {
        // Discovery failures surface via the Discover button / Test action.
      })
    return () => {
      cancelled = true
    }
  }, [desktop, providerRoot, selectedKind])

  const handleTest = useCallback(async () => {
    if (!desktop) return
    setLoading(true)
    setTestResult(null)
    setError(null)
    try {
      // A newly entered key must be stored through the approved credential
      // action before connection testing; it never travels on the ordinary
      // provider configuration channel.
      if (apiKey.trim()) {
        await desktop.setProviderConfig(providerRoot, {
          providerId: selectedKind,
          model,
          baseUrl: needsBaseUrl ? baseUrl : undefined,
        })
        await desktop.storeProviderApiKey(providerRoot, selectedKind, apiKey)
        setApiKey('')
        setProviders(await desktop.listProviders(providerRoot))
      }
      const result = await desktop.testProviderConnection(providerRoot, selectedKind)
      setTestResult(result)
      if (result.models && result.models.length > 0) {
        setModels(result.models.map(id => ({ id, displayName: id, provider: selectedKind })))
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [apiKey, baseUrl, desktop, model, needsBaseUrl, providerRoot, selectedKind])

  const handleSave = useCallback(async () => {
    if (!desktop) return
    setSaving(true)
    setError(null)
    try {
      const patch: DesktopProviderConfigPatch = {
        providerId: selectedKind,
        model,
        baseUrl: needsBaseUrl ? baseUrl : undefined,
      }
      await desktop.setProviderConfig(providerRoot, patch)
      if (apiKey) {
        await desktop.storeProviderApiKey(providerRoot, selectedKind, apiKey)
      }
      const [updatedProviders, updatedConfig] = await Promise.all([
        desktop.listProviders(providerRoot),
        desktop.getProviderConfig(providerRoot, selectedKind),
      ])
      setProviders(updatedProviders)
      setConfig(updatedConfig)
      setApiKey('')
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }, [desktop, providerRoot, selectedKind, model, baseUrl, apiKey, needsBaseUrl])

  const handleClearKey = useCallback(async () => {
    if (!desktop) return
    setSaving(true)
    setError(null)
    try {
      await desktop.clearProviderApiKey(providerRoot, selectedKind)
      setProviders(await desktop.listProviders(providerRoot))
      setApiKey('')
      setTestResult(null)
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }, [desktop, providerRoot, selectedKind])

  const handleSavePermissions = useCallback(async () => {
    if (!desktop) return
    setSaving(true)
    setError(null)
    setPermissionsSaved(false)
    try {
      setPermissions(await desktop.setAgentPermissions(permissions))
      setPermissionsSaved(true)
      window.setTimeout(() => setPermissionsSaved(false), 1800)
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }, [desktop, permissions])

  const handleActivate = useCallback(async () => {
    if (!desktop) return
    setSaving(true)
    setError(null)
    try {
      await desktop.updateProvider(providerRoot, selectedKind, model || undefined)
      const [updated, updatedConfig] = await Promise.all([
        desktop.listProviders(providerRoot),
        desktop.getProviderConfig(providerRoot, selectedKind),
      ])
      setProviders(updated)
      setConfig(updatedConfig)
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }, [desktop, providerRoot, selectedKind, model])

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
            ? `${activeProvider.displayName} is active (${activeProvider.keySource === 'env' ? 'key from environment' : activeProvider.hasKey ? 'secure key stored' : activeProvider.id === 'ollama' || activeProvider.id === 'ollama-network' ? 'no key required' : 'key required'}).`
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
                if (desktop) {
                  void desktop
                    .getProviderConfig(providerRoot, p.id)
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
                {p.keySource === 'env'
                  ? 'environment key'
                  : p.hasKey
                    ? 'secure key'
                    : p.id === 'ollama' || p.id === 'ollama-network'
                      ? 'no key required'
                      : 'key required'} · tools: {p.supportsTools ? 'yes' : 'no'}
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
            <div className="provider-key-block">
              <label className="form-label">
                API key
                <input
                  className="input"
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={selectedProvider?.hasKey
                    ? `Enter a new key to replace the ${selectedProvider.keySource === 'env' ? 'environment' : 'stored'} key`
                    : 'Enter your provider API key'}
                />
                <span className="hint">
                  Stored in macOS Keychain when available. The key is never bundled,
                  logged, or returned to the interface after saving.
                </span>
              </label>
              {selectedProvider?.keySource === 'stored' && (
                <button
                  className="button button-secondary button-small"
                  onClick={handleClearKey}
                  disabled={saving}
                >
                  Remove stored key
                </button>
              )}
              {selectedProvider?.keySource === 'env' && (
                <span className="hint">
                  This key comes from your environment. Enter a key above to replace it,
                  or remove the provider variable from your shell configuration.
                </span>
              )}
            </div>
          )}

          {testResult && (
            <div className={`provider-test-result ${testResult.ok ? 'is-success' : 'is-error'}`}>
              {testResult.ok ? 'Connected' : testResult.status}: {testResult.error ?? ''}
              {testResult.latencyMs ? ` (${testResult.latencyMs}ms)` : ''}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button className="button" onClick={handleSave} disabled={saving || loading}>
              {saving ? 'Saving...' : 'Save settings'}
            </button>
            <button className="button button-secondary" onClick={handleTest} disabled={loading}>
              {loading ? 'Testing...' : apiKey.trim() ? 'Save & test' : 'Test connection'}
            </button>
            <button className="button button-secondary" onClick={handleActivate} disabled={saving || loading}>
              Set active
            </button>
          </div>
        </div>
      </Card>

      <Card title="Agent permissions">
        <div className="permission-settings">
          <div className="settings-section-copy">
            <strong>Approval behavior</strong>
            <span>Choose what the agent may do without interrupting you.</span>
          </div>
          <div className="permission-option-grid">
            {([
              ['untrusted', 'Ask every time', 'Confirm every change and side-effecting action.'],
              ['on-request', 'Auto-approve edits', 'Allow safe workspace edits; ask for commands, network, and risky actions.'],
              ['never', 'Auto approve', 'Do not prompt for actions allowed by the active sandbox.'],
            ] as const).map(([value, title, description]) => (
              <button
                key={value}
                type="button"
                className={`permission-option${permissions.approvalPolicy === value ? ' selected' : ''}`}
                onClick={() => setPermissions(current => ({ ...current, approvalPolicy: value }))}
              >
                <span className="permission-radio" />
                <span><strong>{title}</strong><small>{description}</small></span>
              </button>
            ))}
          </div>

          <div className="settings-section-copy permission-section-divider">
            <strong>Workspace access</strong>
            <span>Sandbox scope is independent from approval behavior.</span>
          </div>
          <div className="permission-option-grid">
            {([
              ['read-only', 'Read only', 'Inspect and plan without changing project state.'],
              ['workspace-write', 'Workspace', 'Read and write inside the opened project.'],
              ['danger-full-access', 'Full access', 'Allow unsandboxed commands after an explicit high-risk choice.'],
            ] as const).map(([value, title, description]) => (
              <button
                key={value}
                type="button"
                className={`permission-option${permissions.sandboxMode === value ? ' selected' : ''}${value === 'danger-full-access' ? ' dangerous' : ''}`}
                onClick={() => setPermissions(current => ({ ...current, sandboxMode: value }))}
              >
                <span className="permission-radio" />
                <span><strong>{title}</strong><small>{description}</small></span>
              </button>
            ))}
          </div>

          {permissions.sandboxMode === 'danger-full-access' && (
            <div className="permission-warning">
              Full access can run commands beyond the workspace. Core safety denials
              still apply, but only use this mode for projects you trust.
            </div>
          )}

          <label className="settings-toggle-row">
            <span>
              <strong>Network access</strong>
              <small>Allow agent commands to contact external services.</small>
            </span>
            <input
              type="checkbox"
              checked={permissions.networkAccess}
              onChange={event => setPermissions(current => ({
                ...current,
                networkAccess: event.target.checked,
              }))}
            />
          </label>

          <div className="settings-save-row">
            <button className="button" onClick={handleSavePermissions} disabled={saving}>
              {permissionsSaved ? 'Saved' : 'Save permission defaults'}
            </button>
            <span>New threads use these defaults. Existing runs keep their original profile.</span>
          </div>
        </div>
      </Card>

      <Card title="Project safety policy">
        {!projectRoot ? (
          <p className="card-body">
            Open a project to view and edit its <code>.ur/safety-policy.json</code>.
            Provider and model settings above are global and do not require an
            open project.
          </p>
        ) : (
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
        )}
      </Card>
    </div>
  )
}
