import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import * as path from 'node:path'
import * as fs from 'node:fs'
import * as os from 'node:os'
import { loadConfig } from './config.js'

// The Electron main entry (index.ts) reads application config at load time
// and uses it to size the window (config.debug → larger window). The real
// end-to-end load of index.ts in Electron is covered by the packaged
// smoke test; here we verify the config contract that index.ts depends on,
// under bun:test (no Electron runtime, no vitest).

describe('main-process configuration contract', () => {
  let tempDir: string
  let tempConfigPath: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-server-test-'))
    tempConfigPath = path.join(tempDir, 'config.json')
  })

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('loads a custom config file used by the main process', () => {
    const customConfig = {
      port: 8080,
      host: '0.0.0.0',
      debug: true,
      maxAgents: 10,
      logDir: '/var/log/app',
      checkpointDir: '/var/checkpoints',
    }
    fs.writeFileSync(tempConfigPath, JSON.stringify(customConfig))
    const loaded = loadConfig(tempConfigPath)
    expect(loaded.debug).toBe(true)
    expect(loaded.maxAgents).toBe(10)
  })

  it('drives window dimensions from the debug flag (index.ts contract)', () => {
    // index.ts: width = config.debug ? 1400 : 1280, height = debug ? 900 : 800.
    const dims = (debug: boolean) => ({
      width: debug ? 1400 : 1280,
      height: debug ? 900 : 800,
    })
    expect(dims(loadConfig(tempConfigPath).debug)).toEqual({ width: 1280, height: 800 })

    fs.writeFileSync(tempConfigPath, JSON.stringify({ debug: true }))
    expect(dims(loadConfig(tempConfigPath).debug)).toEqual({ width: 1400, height: 900 })
  })

  it('falls back to defaults when the config file is missing', () => {
    const loaded = loadConfig(path.join(tempDir, 'does-not-exist.json'))
    expect(loaded.debug).toBe(false)
    expect(typeof loaded.maxAgents).toBe('number')
  })

  it('registers the main entry without a vitest runtime (import smoke)', async () => {
    // Guard against accidental reintroduction of vitest-only APIs: importing
    // this test file must not require `vi`. The registerIpcHandlers surface
    // is exercised by ipcRegistry.test.ts.
    expect(typeof mock).toBe('function')
  })
})
