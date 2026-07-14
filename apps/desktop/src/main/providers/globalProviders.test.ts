import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {
  listProjectProviders,
  getProjectProviderConfig,
  listProjectModels,
  listProjectProviderModels,
  setActiveProjectProvider,
  setProjectProviderConfig,
} from '../runtime.js'

let dataDir: string
let configDir: string
let priorConfigDir: string | undefined

beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-globalprov-'))
  process.env.UR_DESKTOP_DATA_DIR = dataDir
  // Isolate UR global settings (~/.ur) writes to a temp dir so provider tests
  // never touch the real user config.
  configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-config-'))
  priorConfigDir = process.env.UR_CONFIG_DIR
  process.env.UR_CONFIG_DIR = configDir
})

afterEach(() => {
  delete process.env.UR_DESKTOP_DATA_DIR
  if (priorConfigDir === undefined) delete process.env.UR_CONFIG_DIR
  else process.env.UR_CONFIG_DIR = priorConfigDir
  fs.rmSync(dataDir, { recursive: true, force: true })
  fs.rmSync(configDir, { recursive: true, force: true })
})

// Provider/model configuration is global (user settings), so the UI must be
// able to list and configure providers before any project is opened. These
// used to throw "Project not opened" / return empty.
describe('provider configuration without an open project', () => {
  it('lists all desktop providers with an empty project root', () => {
    const providers = listProjectProviders('')
    expect(providers.length).toBe(7)
    const ids = providers.map(p => p.id)
    expect(ids).toContain('ollama')
    expect(ids).toContain('anthropic-api')
    expect(ids).toContain('openai-api')
  })

  it('returns the global provider config with an empty project root', () => {
    const config = getProjectProviderConfig('')
    expect(config.providerId).toBeTruthy()
  })

  it('does not throw for the synchronous model list without a project', () => {
    expect(() => listProjectModels('')).not.toThrow()
  })

  it('lists the static model catalog for an API provider without a key or project', async () => {
    const models = await listProjectProviderModels('', 'anthropic-api')
    expect(models.length).toBeGreaterThan(0)
    expect(models[0].provider).toBe('anthropic-api')
  })

  it('writes provider config to the global user scope even when the cwd is the filesystem root', async () => {
    // Reproduces the packaged-app condition: the app process starts with cwd
    // '/', so localSettings would try to mkdir '/.ur' (ENOENT). Provider
    // config must go to userSettings (~/.ur) instead. Restore cwd afterwards.
    const originalCwd = process.cwd()
    try {
      process.chdir('/')
      await setProjectProviderConfig('', {
        providerId: 'ollama',
        model: 'test-model-x',
      } as Parameters<typeof setProjectProviderConfig>[1])
      const config = getProjectProviderConfig('')
      expect(config.providerId).toBe('ollama')
      expect(config.model).toBe('test-model-x')
    } finally {
      process.chdir(originalCwd)
    }
  })

  it('activates a provider with a dynamic (uncached) model without hard-failing', () => {
    // Ollama models are discovered dynamically; strict catalog validation
    // must not reject activation of a model the desktop just offered.
    const result = setActiveProjectProvider('', 'ollama', 'some-dynamic-model:latest')
    expect(result.ok).toBe(true)
  })

  it('retains separate non-secret profiles for each provider', async () => {
    await setProjectProviderConfig('', {
      providerId: 'openai-api',
      model: 'openai-model-test',
    })
    await setProjectProviderConfig('', {
      providerId: 'anthropic-api',
      model: 'anthropic-model-test',
    })
    expect(getProjectProviderConfig('', 'openai-api').model).toBe('openai-model-test')
    expect(getProjectProviderConfig('', 'anthropic-api').model).toBe('anthropic-model-test')
  })

  it('rejects keys on the non-secret config channel', async () => {
    await expect(setProjectProviderConfig('', {
      providerId: 'openai-api',
      apiKey: 'must-use-secure-channel',
    })).rejects.toThrow('secure credential action')
  })
})
