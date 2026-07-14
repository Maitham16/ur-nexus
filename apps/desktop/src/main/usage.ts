import * as path from 'node:path'
import * as os from 'node:os'
import { readFileSync } from 'node:fs'
import type { RunUsageDto } from '../shared/ipc.js'

/**
 * Model pricing metadata (USD per million tokens). Prices drift; this table
 * is a point-in-time snapshot and every cost derived from it is labeled an
 * estimate. Users can override or extend it in ~/.ur/desktop/pricing.json
 * without an app update. Provider-returned cost is always authoritative.
 */
const BUILTIN_PRICING: PricingTable = {
  updatedAt: '2026-07-10',
  models: {
    'claude-fable-5': { input: 22, output: 110, cacheRead: 2.2 },
    'claude-opus-4-8': { input: 15, output: 75, cacheRead: 1.5 },
    'claude-sonnet-5': { input: 3, output: 15, cacheRead: 0.3 },
    'claude-haiku-4-5': { input: 1, output: 5, cacheRead: 0.1 },
    'gpt-5.2': { input: 1.75, output: 14 },
    'gpt-5.2-mini': { input: 0.35, output: 2.8 },
    'gpt-5.1': { input: 1.25, output: 10 },
    'o4-mini': { input: 1.1, output: 4.4 },
  },
}

export interface ModelPricing {
  /** USD per million input tokens. */
  input: number
  /** USD per million output tokens. */
  output: number
  /** USD per million cache-read tokens. */
  cacheRead?: number
}

export interface PricingTable {
  updatedAt: string
  models: Record<string, ModelPricing>
}

let cachedPricing: PricingTable | null = null

export function loadPricingTable(): PricingTable {
  if (cachedPricing) return cachedPricing
  const merged: PricingTable = {
    updatedAt: BUILTIN_PRICING.updatedAt,
    models: { ...BUILTIN_PRICING.models },
  }
  try {
    const overridePath = path.join(os.homedir(), '.ur', 'desktop', 'pricing.json')
    const override = JSON.parse(readFileSync(overridePath, 'utf-8')) as Partial<PricingTable>
    if (override.models) {
      Object.assign(merged.models, override.models)
    }
    if (override.updatedAt) merged.updatedAt = override.updatedAt
  } catch {
    // No override file; built-in table applies.
  }
  cachedPricing = merged
  return merged
}

export function clearPricingCacheForTests(): void {
  cachedPricing = null
}

function pricingForModel(modelId: string | undefined): ModelPricing | null {
  if (!modelId) return null
  const table = loadPricingTable()
  if (table.models[modelId]) return table.models[modelId]
  // Prefix match tolerates provider-specific suffixes (dates, revisions).
  for (const [key, value] of Object.entries(table.models)) {
    if (modelId.startsWith(key)) return value
  }
  return null
}

const LOCAL_PROVIDER_PATTERNS = [/^ollama/i, /^local/i]

export function isLocalProvider(providerId: string | undefined): boolean {
  if (!providerId) return false
  return LOCAL_PROVIDER_PATTERNS.some(p => p.test(providerId))
}

/** Raw usage payload shape emitted by the agent runtime (Anthropic-style). */
export interface RawUsage {
  input_tokens?: number
  output_tokens?: number
  cache_read_input_tokens?: number
  cache_creation_input_tokens?: number
  reasoning_output_tokens?: number
  [key: string]: unknown
}

export function emptyUsage(): RunUsageDto {
  return {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheCreationTokens: 0,
    reasoningTokens: 0,
    requests: 0,
    elapsedMs: 0,
    costIsEstimate: false,
  }
}

export class RunUsageTracker {
  private usage: RunUsageDto = emptyUsage()
  private readonly startedAt = Date.now()
  private providerCostUsd: number | undefined

  constructor(
    private readonly providerId?: string,
    private readonly modelId?: string,
  ) {}

  /** Merge an incremental per-message usage payload (one API request). */
  addMessageUsage(raw: RawUsage): void {
    this.usage.inputTokens += raw.input_tokens ?? 0
    this.usage.outputTokens += raw.output_tokens ?? 0
    this.usage.cacheReadTokens += raw.cache_read_input_tokens ?? 0
    this.usage.cacheCreationTokens += raw.cache_creation_input_tokens ?? 0
    this.usage.reasoningTokens =
      (this.usage.reasoningTokens ?? 0) + (raw.reasoning_output_tokens ?? 0)
    this.usage.requests += 1
  }

  /** Replace totals with the authoritative end-of-run usage payload. */
  setFinalUsage(raw: RawUsage, providerCostUsd?: number): void {
    this.usage.inputTokens = raw.input_tokens ?? this.usage.inputTokens
    this.usage.outputTokens = raw.output_tokens ?? this.usage.outputTokens
    this.usage.cacheReadTokens =
      raw.cache_read_input_tokens ?? this.usage.cacheReadTokens
    this.usage.cacheCreationTokens =
      raw.cache_creation_input_tokens ?? this.usage.cacheCreationTokens
    if (providerCostUsd !== undefined && providerCostUsd > 0) {
      this.providerCostUsd = providerCostUsd
    }
  }

  snapshot(): RunUsageDto {
    const usage: RunUsageDto = {
      ...this.usage,
      elapsedMs: Date.now() - this.startedAt,
      model: this.modelId,
    }

    if (isLocalProvider(this.providerId)) {
      // Local inference has real token counts but no monetary cost; showing
      // a fabricated dollar figure would be fake data.
      usage.costUsd = undefined
      usage.costIsEstimate = false
      return usage
    }

    if (this.providerCostUsd !== undefined) {
      usage.costUsd = this.providerCostUsd
      usage.costIsEstimate = false
      return usage
    }

    const pricing = pricingForModel(this.modelId)
    if (pricing) {
      const cost =
        (usage.inputTokens / 1_000_000) * pricing.input +
        (usage.outputTokens / 1_000_000) * pricing.output +
        (usage.cacheReadTokens / 1_000_000) * (pricing.cacheRead ?? pricing.input / 10)
      usage.costUsd = Math.round(cost * 1_000_000) / 1_000_000
      usage.costIsEstimate = true
    }
    return usage
  }
}
