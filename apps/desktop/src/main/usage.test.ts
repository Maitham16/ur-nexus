import { describe, it, expect } from 'bun:test'
import { RunUsageTracker, isLocalProvider, loadPricingTable } from './usage.js'

describe('RunUsageTracker', () => {
  it('accumulates per-message usage and counts requests', () => {
    const tracker = new RunUsageTracker('anthropic-api', 'claude-sonnet-5')
    tracker.addMessageUsage({ input_tokens: 100, output_tokens: 50 })
    tracker.addMessageUsage({
      input_tokens: 200,
      output_tokens: 80,
      cache_read_input_tokens: 1000,
    })
    const usage = tracker.snapshot()
    expect(usage.inputTokens).toBe(300)
    expect(usage.outputTokens).toBe(130)
    expect(usage.cacheReadTokens).toBe(1000)
    expect(usage.requests).toBe(2)
  })

  it('treats provider-reported cost as authoritative (not an estimate)', () => {
    const tracker = new RunUsageTracker('anthropic-api', 'claude-sonnet-5')
    tracker.addMessageUsage({ input_tokens: 1000, output_tokens: 500 })
    tracker.setFinalUsage({ input_tokens: 1000, output_tokens: 500 }, 0.123456)
    const usage = tracker.snapshot()
    expect(usage.costUsd).toBe(0.123456)
    expect(usage.costIsEstimate).toBe(false)
  })

  it('estimates cost from the pricing table when the provider reports none', () => {
    const tracker = new RunUsageTracker('anthropic-api', 'claude-sonnet-5')
    tracker.addMessageUsage({ input_tokens: 1_000_000, output_tokens: 1_000_000 })
    const usage = tracker.snapshot()
    // claude-sonnet-5: $3/M input + $15/M output
    expect(usage.costUsd).toBeCloseTo(18, 5)
    expect(usage.costIsEstimate).toBe(true)
  })

  it('matches models by prefix for dated revisions', () => {
    const tracker = new RunUsageTracker('anthropic-api', 'claude-haiku-4-5-20251001')
    tracker.addMessageUsage({ input_tokens: 1_000_000, output_tokens: 0 })
    const usage = tracker.snapshot()
    expect(usage.costUsd).toBeCloseTo(1, 5)
  })

  it('never fabricates a cost for local providers', () => {
    const tracker = new RunUsageTracker('ollama', 'llama3.3:70b')
    tracker.addMessageUsage({ input_tokens: 5000, output_tokens: 2000 })
    const usage = tracker.snapshot()
    expect(usage.inputTokens).toBe(5000)
    expect(usage.costUsd).toBeUndefined()
    expect(usage.costIsEstimate).toBe(false)
  })

  it('returns no cost for unknown models instead of guessing', () => {
    const tracker = new RunUsageTracker('openai-compatible', 'mystery-model-9000')
    tracker.addMessageUsage({ input_tokens: 1000, output_tokens: 1000 })
    expect(tracker.snapshot().costUsd).toBeUndefined()
  })

  it('final usage payload replaces accumulated totals', () => {
    const tracker = new RunUsageTracker('anthropic-api', 'claude-sonnet-5')
    tracker.addMessageUsage({ input_tokens: 100, output_tokens: 50 })
    tracker.setFinalUsage({ input_tokens: 120, output_tokens: 60 })
    const usage = tracker.snapshot()
    expect(usage.inputTokens).toBe(120)
    expect(usage.outputTokens).toBe(60)
  })
})

describe('pricing metadata', () => {
  it('is dated so estimates are auditable', () => {
    const table = loadPricingTable()
    expect(table.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(Object.keys(table.models).length).toBeGreaterThan(3)
  })

  it('classifies local providers', () => {
    expect(isLocalProvider('ollama')).toBe(true)
    expect(isLocalProvider('ollama-network')).toBe(true)
    expect(isLocalProvider('anthropic-api')).toBe(false)
    expect(isLocalProvider(undefined)).toBe(false)
  })
})
