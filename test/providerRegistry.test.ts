import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'bun:test'
import {
  buildProviderAuthCommand,
  doctorProvider,
  getProviderRuntimeInfo,
  type CommandResult,
  type ProviderDoctorAdapters,
} from '../src/services/providers/providerRegistry.js'

function adapters(options: {
  missing?: string[]
  env?: Record<string, string | undefined>
  run?: (file: string, args: string[]) => Promise<CommandResult>
  fetch?: typeof fetch
} = {}): ProviderDoctorAdapters {
  const missing = new Set(options.missing ?? [])
  return {
    env: options.env ?? {},
    which: async command => (missing.has(command) ? null : `/usr/bin/${command}`),
    run:
      options.run ??
      (async (_file, args) => ({
        stdout: args.includes('--version') ? '1.0.0' : 'Logged in',
        stderr: '',
        code: 0,
      })),
    fetch: options.fetch,
  }
}

describe('provider registry legal access paths', () => {
  test('reports Codex CLI missing', async () => {
    const result = await doctorProvider('codex-cli', {
      adapters: adapters({ missing: ['codex'] }),
      settings: {},
    })

    expect(result.ok).toBe(false)
    expect(result.failureReason).toBe('CLI missing')
    expect(result.suggestedFix).toContain('ur auth chatgpt')
  })

  test('reports Codex not logged in', async () => {
    const result = await doctorProvider('codex-cli', {
      adapters: adapters({
        run: async (_file, args) =>
          args[0] === 'login'
            ? {
                stdout: '',
                stderr: 'Not logged in',
                code: 1,
              }
            : {
                stdout: 'codex-cli 1.0.0',
                stderr: '',
                code: 0,
              },
      }),
      settings: {},
    })

    expect(result.ok).toBe(false)
    expect(result.failureReason).toBe('not logged in')
  })

  test('reports Codex logged in', async () => {
    const result = await doctorProvider('codex-cli', {
      adapters: adapters({
        run: async (_file, args) =>
          args[0] === 'login'
            ? {
                stdout: 'Logged in using ChatGPT',
                stderr: '',
                code: 0,
              }
            : {
                stdout: 'codex-cli 1.0.0',
                stderr: '',
                code: 0,
              },
      }),
      settings: {},
    })

    expect(result.ok).toBe(true)
  })

  test('reports Claude CLI missing and exposes subscription login command', async () => {
    const result = await doctorProvider('claude-code-cli', {
      adapters: adapters({ missing: ['claude'] }),
      settings: {},
    })
    const auth = buildProviderAuthCommand('claude-code-cli')

    expect(result.ok).toBe(false)
    expect(result.failureReason).toBe('CLI missing')
    expect(auth?.command).toBe('claude')
    expect(auth?.args).toEqual(['auth', 'login'])
  })

  test('warns when ANTHROPIC_API_KEY may override Claude subscription auth', async () => {
    const result = await doctorProvider('claude-code-cli', {
      adapters: adapters({
        env: { ANTHROPIC_API_KEY: 'set' },
        run: async (_file, args) =>
          args[0] === 'auth'
            ? { stdout: 'authenticated', stderr: '', code: 0 }
            : { stdout: '2.0.0', stderr: '', code: 0 },
      }),
      settings: {},
    })

    expect(result.checks.some(check => check.name === 'api_key_override')).toBe(true)
  })

  test('reports Gemini CLI missing', async () => {
    const result = await doctorProvider('gemini-cli', {
      adapters: adapters({ missing: ['gemini'] }),
      settings: {},
    })

    expect(result.ok).toBe(false)
    expect(result.failureReason).toBe('CLI missing')
  })

  test('accepts Gemini enterprise-supported CLI output', async () => {
    const result = await doctorProvider('gemini-cli', {
      adapters: adapters({
        run: async () => ({
          stdout: 'Gemini Code Assist Enterprise 1.0.0',
          stderr: '',
          code: 0,
        }),
      }),
      settings: {},
    })

    expect(result.ok).toBe(true)
    expect(result.checks.some(check => check.name === 'account_type' && check.status === 'pass')).toBe(true)
  })

  test('blocks Gemini personal unsupported path', async () => {
    const result = await doctorProvider('gemini-cli', {
      adapters: adapters({
        run: async () => ({
          stdout: 'personal account unsupported',
          stderr: '',
          code: 0,
        }),
      }),
      settings: {},
    })

    expect(result.ok).toBe(false)
    expect(result.failureReason).toBe('unsupported account type')
  })

  test('reports Antigravity CLI missing', async () => {
    const result = await doctorProvider('antigravity-cli', {
      adapters: adapters({ missing: ['antigravity', 'google-antigravity', 'ag'] }),
      settings: {},
    })

    expect(result.ok).toBe(false)
    expect(result.failureReason).toBe('CLI missing')
  })

  test('reports Ollama unavailable and available', async () => {
    const unavailable = await doctorProvider('ollama', {
      adapters: adapters({
        fetch: async () => {
          throw new Error('connection refused')
        },
      }),
      settings: {},
    })
    const available = await doctorProvider('ollama', {
      adapters: adapters({
        fetch: async () => new Response('{"models":[{"name":"llama3"}]}'),
      }),
      settings: { provider: { active: 'ollama', model: 'llama3' } },
    })

    expect(unavailable.ok).toBe(false)
    expect(available.ok).toBe(true)
  })

  test('reports OpenAI-compatible endpoint unavailable', async () => {
    const result = await doctorProvider('openai-compatible', {
      adapters: adapters({
        fetch: async () => new Response('unavailable', { status: 503 }),
      }),
      settings: {
        provider: {
          active: 'openai-compatible',
          baseUrl: 'http://localhost:9999/v1',
        },
      },
    })

    expect(result.ok).toBe(false)
    expect(result.failureReason).toContain('HTTP 503')
  })

  test('reports missing API keys only for API providers', async () => {
    const result = await doctorProvider('openai-api', {
      adapters: adapters({ env: {} }),
      settings: {},
    })

    expect(result.ok).toBe(false)
    expect(result.failureReason).toBe('API key missing')
  })

  test('reports fallback disabled and enabled without silently switching', async () => {
    const disabled = await doctorProvider('codex-cli', {
      adapters: adapters({ missing: ['codex'] }),
      settings: { provider: { active: 'codex-cli', fallback: 'disabled' } },
    })
    const enabled = await doctorProvider('codex-cli', {
      adapters: adapters({ missing: ['codex'] }),
      settings: { provider: { active: 'codex-cli', fallback: 'ollama' } },
    })

    expect(disabled.fallback?.enabled).toBe(false)
    expect(enabled.fallback?.enabled).toBe(true)
    expect(enabled.fallback?.message).toContain('will ask before using it')
  })

  test('status bar runtime info includes provider auth display', () => {
    const info = getProviderRuntimeInfo({
      provider: {
        active: 'openrouter',
        model: 'openai/gpt-4.1',
      },
    })

    expect(info.providerLabel).toBe('OpenRouter')
    expect(info.authLabel).toBe('API')
    expect(info.model).toBe('openai/gpt-4.1')
  })

  test('provider registry does not read hidden credential files', () => {
    const source = readFileSync('src/services/providers/providerRegistry.ts', 'utf8')

    expect(source).not.toContain('.codex')
    expect(source).not.toContain('.claude')
    expect(source).not.toContain('refresh_token')
    expect(source).not.toContain('browser cookie')
    expect(source).not.toContain('readFile')
  })
})
