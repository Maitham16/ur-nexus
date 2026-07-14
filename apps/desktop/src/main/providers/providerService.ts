/**
 * Desktop-only provider/model configuration service.
 *
 * This layer filters the full UR provider registry down to official API and
 * local/network API integrations only. It never exposes raw API keys to the
 * renderer; keys are stored in the OS secure store (macOS Keychain) via the
 * existing providerCredentials module.
 */

import {
  getProviderApiKeySource,
  setProviderApiKey,
  clearProviderApiKey,
  getProviderDefinition,
  getProviderStatus,
  listModelsForProviderWithSource,
  setProviderModel,
  setSafeProviderConfig,
  getActiveProviderSettings,
  getProviderFamily,
  getInitialSettings,
  updateSettingsForSource,
  type ProviderId,
  type SettingsJson,
} from '@ur/agent-runtime'
import { redactValue } from '../utils/redactSecrets.js'

export type DesktopProviderKind =
  | 'openai-api'
  | 'anthropic-api'
  | 'openrouter'
  | 'ollama'
  | 'ollama-network'
  | 'ollama-cloud'
  | 'openai-compatible'

const DESKTOP_PROVIDER_KINDS: DesktopProviderKind[] = [
  'openai-api',
  'anthropic-api',
  'openrouter',
  'ollama',
  'ollama-network',
  'ollama-cloud',
  'openai-compatible',
]

export function parseDesktopProviderKind(value: unknown): DesktopProviderKind {
  if (
    typeof value !== 'string' ||
    !DESKTOP_PROVIDER_KINDS.includes(value as DesktopProviderKind)
  ) {
    throw new Error(`Unsupported desktop provider: ${String(value)}`)
  }
  return value as DesktopProviderKind
}

const DESKTOP_PROVIDER_LABELS: Record<DesktopProviderKind, string> = {
  'openai-api': 'OpenAI API',
  'anthropic-api': 'Claude API',
  openrouter: 'OpenRouter',
  ollama: 'Ollama Local',
  'ollama-network': 'Ollama Network',
  'ollama-cloud': 'Ollama Cloud/API',
  'openai-compatible': 'OpenAI-Compatible',
}

const DEFAULT_BASE_URLS: Partial<Record<DesktopProviderKind, string>> = {
  ollama: 'http://localhost:11434',
}

const OLLAMA_KINDS = new Set<DesktopProviderKind>([
  'ollama',
  'ollama-network',
  'ollama-cloud',
])

const ACTIVE_KIND_PREFERENCE = 'desktop.activeProviderKind'

function profilePreferenceKey(
  kind: DesktopProviderKind,
  field: 'model' | 'baseUrl',
): string {
  return `desktop.provider.${kind}.${field}`
}

function stringPreference(
  preferences: Record<string, string | number | boolean>,
  key: string,
): string | undefined {
  const value = preferences[key]
  return typeof value === 'string' && value.trim() ? value : undefined
}

function isOllamaKind(kind: DesktopProviderKind): boolean {
  return OLLAMA_KINDS.has(kind)
}

export interface DesktopProviderConfig {
  providerId: DesktopProviderKind
  model?: string
  baseUrl?: string
  apiKey?: string
  preferences?: Record<string, string | number | boolean>
}

export interface DesktopProviderConfigDto {
  providerId: DesktopProviderKind
  model?: string
  baseUrl?: string
  preferences?: Record<string, string | number | boolean>
}

export type DesktopProviderConfigPatch = DesktopProviderConfigDto & {
  apiKey?: string
}

export interface DesktopProviderInfo {
  id: DesktopProviderKind
  displayName: string
  active: boolean
  hasKey: boolean
  keySource?: 'stored' | 'env' | 'none'
  supportsTools: boolean
  supportsVision: boolean
  supportsReasoning: boolean
}

export interface DesktopModelInfo {
  id: string
  displayName?: string
  provider: DesktopProviderKind
  contextLength?: number
}

export interface DesktopProviderConnectionResult {
  ok: boolean
  status: 'connected' | 'missing' | 'unavailable' | 'unknown'
  latencyMs?: number
  error?: string
  models?: string[]
}

function toCoreProviderId(kind: DesktopProviderKind): ProviderId {
  if (kind === 'ollama-network' || kind === 'ollama-cloud') {
    return 'ollama'
  }
  return kind as ProviderId
}

function normalizeBaseUrl(value: string | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
  const url = new URL(withScheme)
  if (url.username || url.password) {
    throw new Error('base_url must not contain embedded credentials')
  }
  return withScheme.replace(/\/+$/, '')
}

function getSettingsForProject(projectRoot: string): SettingsJson {
  // UR settings are loaded relative to process.cwd() / getOriginalCwd().
  // The desktop main process must scope settings to the open project. We write
  // to the project's local settings file directly, then invalidate the session
  // cache so subsequent reads pick up the new value.
  void projectRoot
  return getInitialSettings() as SettingsJson
}

export function listDesktopProviders(activeKind?: DesktopProviderKind): DesktopProviderInfo[] {
  return DESKTOP_PROVIDER_KINDS.map(kind => {
    const coreId = toCoreProviderId(kind)
    const def = getProviderDefinition(coreId)
    const source = getProviderApiKeySource(coreId)
    return {
      id: kind,
      displayName: DESKTOP_PROVIDER_LABELS[kind],
      active: kind === activeKind,
      hasKey: source !== 'none',
      keySource: source === 'none' ? undefined : source,
      supportsTools: def.supportsNativeToolCalls,
      supportsVision: providerSupportsVision(kind),
      supportsReasoning: providerSupportsReasoning(kind),
    }
  })
}

export function getDesktopProviderConfig(
  projectRoot: string,
  kind?: DesktopProviderKind,
): DesktopProviderConfigDto {
  if (kind !== undefined) parseDesktopProviderKind(kind)
  const settings = getSettingsForProject(projectRoot)
  const active = getActiveProviderSettings(settings).active ?? 'ollama'
  const providerSettings = (settings as { provider?: { model?: string; baseUrl?: string; preferences?: Record<string, string | number | boolean> } }).provider ?? {}
  const preferences = providerSettings.preferences ?? {}
  const preferredActiveKind = stringPreference(preferences, ACTIVE_KIND_PREFERENCE)
  const effectiveKind = kind ?? (
    preferredActiveKind && DESKTOP_PROVIDER_KINDS.includes(preferredActiveKind as DesktopProviderKind)
      ? preferredActiveKind as DesktopProviderKind
      : coreToDesktopKind(active)
  )
  const isActiveKind = toCoreProviderId(effectiveKind) === active && (
    !preferredActiveKind || preferredActiveKind === effectiveKind
  )
  const model = stringPreference(preferences, profilePreferenceKey(effectiveKind, 'model')) ??
    (isActiveKind ? providerSettings.model : undefined)
  const baseUrl = stringPreference(preferences, profilePreferenceKey(effectiveKind, 'baseUrl')) ??
    (isActiveKind ? providerSettings.baseUrl : undefined) ??
    DEFAULT_BASE_URLS[effectiveKind]
  return {
    providerId: effectiveKind,
    model,
    baseUrl,
    preferences,
  }
}

export async function setDesktopProviderConfig(
  projectRoot: string,
  patch: DesktopProviderConfigPatch,
): Promise<void> {
  const kind = parseDesktopProviderKind(patch.providerId)
  if (patch.apiKey !== undefined) {
    throw new Error('API keys must be changed through the secure credential action.')
  }

  const settings = getSettingsForProject(projectRoot)
  const existingProvider = settings.provider ?? {}
  const preferences = { ...(existingProvider.preferences ?? {}) }
  if (patch.model !== undefined) {
    const normalizedModel = patch.model.trim()
    if (normalizedModel) preferences[profilePreferenceKey(kind, 'model')] = normalizedModel
    else delete preferences[profilePreferenceKey(kind, 'model')]
  }
  if (patch.baseUrl !== undefined) {
    const normalized = normalizeBaseUrl(patch.baseUrl)
    if (normalized) preferences[profilePreferenceKey(kind, 'baseUrl')] = normalized
    else delete preferences[profilePreferenceKey(kind, 'baseUrl')]
  }
  if (patch.preferences !== undefined) {
    Object.assign(preferences, patch.preferences)
  }

  const activeKind = getDesktopProviderConfig(projectRoot).providerId
  const providerSettings: SettingsJson['provider'] = {
    ...existingProvider,
    preferences,
  }
  if (activeKind === kind) {
    providerSettings.model = patch.model === undefined
      ? existingProvider.model
      : patch.model.trim() || undefined
    providerSettings.baseUrl = patch.baseUrl === undefined
      ? existingProvider.baseUrl
      : normalizeBaseUrl(patch.baseUrl)
  }

  const result = updateSettingsForSource('userSettings', {
    provider: providerSettings,
    model: activeKind === kind
      ? (patch.model === undefined ? settings.model : patch.model.trim() || undefined)
      : settings.model,
  } as SettingsJson)
  if (result.error) {
    throw new Error(`Failed to write settings: ${result.error.message}`)
  }

  logForProvider('info', 'set_desktop_provider_config', {
    projectRoot,
    providerId: kind,
    model: patch.model,
    baseUrl: providerSettings.baseUrl,
  })
}

export async function storeDesktopProviderApiKey(
  projectRoot: string,
  kind: DesktopProviderKind,
  apiKey: string,
): Promise<void> {
  void projectRoot
  parseDesktopProviderKind(kind)
  const normalizedKey = apiKey.trim()
  if (!normalizedKey) throw new Error('API key must not be empty.')
  if (normalizedKey.length > 16_384) throw new Error('API key is too long.')
  const coreId = toCoreProviderId(kind)
  const result = setProviderApiKey(coreId, normalizedKey)
  if (!result.ok) {
    throw new Error(result.message)
  }
}

export async function clearDesktopProviderApiKey(
  projectRoot: string,
  kind: DesktopProviderKind,
): Promise<void> {
  void projectRoot
  parseDesktopProviderKind(kind)
  const coreId = toCoreProviderId(kind)
  const result = clearProviderApiKey(coreId)
  if (!result.ok) {
    throw new Error(result.message)
  }
}

export async function testDesktopProviderConnection(
  projectRoot: string,
  kind: DesktopProviderKind,
): Promise<DesktopProviderConnectionResult> {
  parseDesktopProviderKind(kind)
  const start = Date.now()
  const coreId = toCoreProviderId(kind)
  const config = getDesktopProviderConfig(projectRoot, kind)
  const baseUrl = resolveBaseUrl(kind, config.baseUrl)

  // For Ollama variants, probe the tags endpoint directly with the right base URL.
  if (isOllamaKind(kind)) {
    try {
      const url = baseUrl ? `${baseUrl.replace(/\/+$/, '')}/api/tags` : `${DEFAULT_BASE_URLS.ollama}/api/tags`
      const response = await fetch(url, { method: 'GET' })
      if (!response.ok) {
        return {
          ok: false,
          status: 'unavailable',
          latencyMs: Date.now() - start,
          error: `${url} returned HTTP ${response.status}`,
        }
      }
      const body = (await response.json()) as { models?: Array<{ name?: string }> }
      const models = (body.models ?? [])
        .map((m: { name?: string }) => m.name)
        .filter((n): n is string => typeof n === 'string')
      return {
        ok: true,
        status: 'connected',
        latencyMs: Date.now() - start,
        models,
      }
    } catch (error) {
      return {
        ok: false,
        status: 'unavailable',
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  // For API providers use the existing doctor/status helper.
  try {
    const settings = getSettingsForProject(projectRoot)
    const status = await getProviderStatus(coreId, {
      settings: {
        ...settings,
        provider: {
          active: coreId,
          model: config.model,
          baseUrl,
        },
      },
    })
    const modelMatch = status.doctor.checks
      .find((c: { name: string; message?: string }) => c.name === 'models')
      ?.message?.match(/"([^"]+)"/)
    const modelNames = modelMatch ? [modelMatch[1] as string] : undefined
    return {
      ok: status.status === 'connected',
      status: status.status,
      latencyMs: Date.now() - start,
      error: status.status !== 'connected' ? status.label : undefined,
      models: modelNames ?? undefined,
    }
  } catch (error) {
    return {
      ok: false,
      status: 'unavailable',
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function listDesktopProviderModels(
  projectRoot: string,
  kind: DesktopProviderKind,
): Promise<DesktopModelInfo[]> {
  parseDesktopProviderKind(kind)
  const coreId = toCoreProviderId(kind)
  const config = getDesktopProviderConfig(projectRoot, kind)
  const baseUrl = resolveBaseUrl(kind, config.baseUrl)

  if (isOllamaKind(kind)) {
    const result = await testDesktopProviderConnection(projectRoot, kind)
    if (!result.models) return []
    return result.models.map(id => ({
      id,
      displayName: id,
      provider: kind,
    }))
  }

  const settings = getSettingsForProject(projectRoot)
  const discovery = await listModelsForProviderWithSource(coreId, {
    settings: {
      ...settings,
      provider: {
        active: coreId,
        model: config.model,
        baseUrl,
      },
    },
  })
  return discovery.models.map((m: { id: string; displayName?: string; contextLength?: number }) => ({
    id: m.id,
    displayName: m.displayName,
    provider: kind,
    contextLength: m.contextLength,
  }))
}

export function activateDesktopProvider(
  projectRoot: string,
  kind: DesktopProviderKind,
  model?: string,
): { ok: true; message: string } | { ok: false; message: string } {
  parseDesktopProviderKind(kind)
  void projectRoot
  const coreId = toCoreProviderId(kind)
  const config = getDesktopProviderConfig(projectRoot, kind)
  const baseUrl = resolveBaseUrl(kind, config.baseUrl)

  // Update the active provider.
  const providerResult = setSafeProviderConfig('provider', coreId, { source: 'userSettings' })
  if (!providerResult.ok) {
    return providerResult
  }

  // Update base URL and model if provided.
  if (baseUrl) {
    const baseResult = setSafeProviderConfig('base_url', baseUrl, { source: 'userSettings' })
    if (!baseResult.ok) {
      return baseResult
    }
  }
  if (model) {
    // setProviderModel validates against the provider's known model catalog.
    // Ollama's catalog is dynamic (discovered from the server), so validation
    // can reject a perfectly valid model that just is not cached yet. The
    // desktop only ever offers models it discovered, so on validation failure
    // we persist the choice directly rather than rejecting the activation.
    const modelResult = setProviderModel(coreId, model, { source: 'userSettings' })
    if (!modelResult.ok) {
      const fallback = updateSettingsForSource('userSettings', {
        provider: { active: coreId, model },
        model,
      } as SettingsJson)
      if (fallback.error) {
        return { ok: false, message: fallback.error.message }
      }
    }
  }

  const settings = getSettingsForProject(projectRoot)
  const preferences: Record<string, string | number | boolean> = {
    ...(settings.provider?.preferences ?? {}),
    [ACTIVE_KIND_PREFERENCE]: kind,
  }
  if (model) preferences[profilePreferenceKey(kind, 'model')] = model
  if (baseUrl) preferences[profilePreferenceKey(kind, 'baseUrl')] = baseUrl
  const persisted = updateSettingsForSource('userSettings', {
    provider: {
      active: coreId,
      model: model ?? config.model,
      baseUrl,
      preferences,
    },
    model: model ?? config.model,
  } as SettingsJson)
  if (persisted.error) {
    return { ok: false, message: persisted.error.message }
  }

  return { ok: true, message: `Activated ${kind}` }
}

export function providerSupportsTools(kind: DesktopProviderKind): boolean {
  const coreId = toCoreProviderId(kind)
  return getProviderDefinition(coreId).supportsNativeToolCalls
}

export function providerSupportsVision(kind: DesktopProviderKind): boolean {
  const family = getProviderFamily(toCoreProviderId(kind))
  switch (family) {
    case 'anthropic':
    case 'openai':
    case 'google':
      return true
    case 'ollama':
      return true
    default:
      return false
  }
}

export function providerSupportsReasoning(kind: DesktopProviderKind): boolean {
  // Reasoning support is model-specific; providers that expose reasoning-style
  // models are Anthropic, OpenAI, OpenRouter, and OpenAI-compatible endpoints.
  switch (kind) {
    case 'anthropic-api':
    case 'openai-api':
    case 'openrouter':
    case 'openai-compatible':
      return true
    default:
      return false
  }
}

function resolveBaseUrl(kind: DesktopProviderKind, configBaseUrl?: string): string | undefined {
  if (isOllamaKind(kind)) {
    return normalizeBaseUrl(configBaseUrl) ?? DEFAULT_BASE_URLS.ollama
  }
  if (kind === 'openai-compatible') {
    return normalizeBaseUrl(configBaseUrl)
  }
  return undefined
}

function coreToDesktopKind(coreId: ProviderId): DesktopProviderKind {
  if (coreId === 'ollama') return 'ollama'
  if (DESKTOP_PROVIDER_KINDS.includes(coreId as DesktopProviderKind)) {
    return coreId as DesktopProviderKind
  }
  return 'ollama'
}

function logForProvider(
  level: 'info' | 'warn' | 'error',
  event: string,
  data: Record<string, unknown>,
): void {
  try {
    const line = `[desktop-provider] ${event} ${JSON.stringify(redactValue(data))}`
    if (level === 'error') console.error(line)
    else if (level === 'warn') console.warn(line)
    else console.log(line)
  } catch {
    // Logging failures must not break provider operations.
  }
}
