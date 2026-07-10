/**
 * Desktop-only provider/model configuration service.
 *
 * This layer filters the full UR provider registry down to official API and
 * local/network API integrations only. It never exposes raw API keys to the
 * renderer; keys are stored in the OS secure store (macOS Keychain) via the
 * existing providerCredentials module.
 */

import {
  getProviderApiKey,
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
  const settings = getSettingsForProject(projectRoot)
  const active = getActiveProviderSettings(settings).active ?? 'ollama'
  const effectiveKind = kind ?? coreToDesktopKind(active)
  const providerSettings = (settings as { provider?: { model?: string; baseUrl?: string; preferences?: Record<string, string | number | boolean> } }).provider ?? {}
  const baseUrl = providerSettings.baseUrl ?? DEFAULT_BASE_URLS[effectiveKind]
  return {
    providerId: effectiveKind,
    model: providerSettings.model,
    baseUrl,
    preferences: providerSettings.preferences ?? {},
  }
}

export async function setDesktopProviderConfig(
  projectRoot: string,
  patch: DesktopProviderConfigPatch,
): Promise<void> {
  const kind = patch.providerId
  const coreId = toCoreProviderId(kind)

  // 1. Persist API key in secure storage, never in settings.
  if (patch.apiKey !== undefined) {
    const trimmed = patch.apiKey.trim()
    if (trimmed) {
      const result = setProviderApiKey(coreId, trimmed)
      if (!result.ok) {
        throw new Error(result.message)
      }
    } else {
      const result = clearProviderApiKey(coreId)
      if (!result.ok) {
        throw new Error(result.message)
      }
    }
  }

  // 2. Persist non-secret config in project local settings.
  const providerSettings: SettingsJson['provider'] = { active: coreId }
  if (patch.model !== undefined) {
    providerSettings.model = patch.model
  }
  if (patch.baseUrl !== undefined) {
    providerSettings.baseUrl = normalizeBaseUrl(patch.baseUrl)
  }
  if (patch.preferences !== undefined) {
    providerSettings.preferences = patch.preferences
  }

  // Ollama network/cloud base URLs need to be stored as baseUrl even though the
  // core provider id is just 'ollama'.
  const result = updateSettingsForSource('localSettings', {
    provider: providerSettings,
    model: patch.model,
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
  const coreId = toCoreProviderId(kind)
  const result = setProviderApiKey(coreId, apiKey)
  if (!result.ok) {
    throw new Error(result.message)
  }
}

export async function clearDesktopProviderApiKey(
  projectRoot: string,
  kind: DesktopProviderKind,
): Promise<void> {
  void projectRoot
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
  void projectRoot
  const coreId = toCoreProviderId(kind)
  const config = getDesktopProviderConfig(projectRoot, kind)
  const baseUrl = resolveBaseUrl(kind, config.baseUrl)

  // Update the active provider.
  const providerResult = setSafeProviderConfig('provider', coreId, { source: 'localSettings' })
  if (!providerResult.ok) {
    return providerResult
  }

  // Update base URL and model if provided.
  if (baseUrl) {
    const baseResult = setSafeProviderConfig('base_url', baseUrl, { source: 'localSettings' })
    if (!baseResult.ok) {
      return baseResult
    }
  }
  if (model) {
    const modelResult = setProviderModel(coreId, model, { source: 'localSettings' })
    if (!modelResult.ok) {
      return modelResult
    }
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
    const { logForDebugging } = require('../../../../src/utils/debug.js') as {
      logForDebugging: (msg: string, opts?: { level: 'info' | 'warn' | 'error' }) => void
    }
    logForDebugging(`[desktop-provider] ${event} ${JSON.stringify(redactValue(data))}`, { level })
  } catch {
    // Logging failures must not break provider operations.
  }
}
