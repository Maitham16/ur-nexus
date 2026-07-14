import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect } from 'bun:test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packagedDirectory = process.arch === 'arm64' ? 'mac-arm64' : 'mac'
const packagedAppBin = path.join(
  __dirname,
  '..',
  'dist',
  packagedDirectory,
  'UR Nexus Desktop.app',
  'Contents',
  'MacOS',
  'UR Nexus Desktop',
)

function waitForOutput(proc, marker, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    let output = ''
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error(`Timeout waiting for ${marker}. Output:\n${output}`))
    }, timeoutMs)
    function cleanup() {
      clearTimeout(timer)
      proc.stdout?.off('data', onData)
      proc.stderr?.off('data', onData)
    }
    function onData(chunk) {
      const text = chunk.toString()
      output += text
      if (output.includes(marker)) {
        cleanup()
        resolve(output)
      }
    }
    proc.stdout?.on('data', onData)
    proc.stderr?.on('data', onData)
  })
}

// The packaged .app binary has a complete Electron Framework. Bun's
// node_modules/electron/dist copy may be a partial shim, so the packaged
// binary is the only reliable smoke target. In a plain `bun test` run before
// packaging, the test is skipped. Direct invocations may set
// UR_REQUIRE_PACKAGED=1 so a missing bundle is a hard failure.
const isPackaged = require('node:fs').existsSync(packagedAppBin)
const requirePackaged = process.env.UR_REQUIRE_PACKAGED === '1'

if (!isPackaged && requirePackaged) {
  throw new Error(
    'Packaged UR Nexus Desktop.app not found. Run `bun run package:mac` before smoke:mac.',
  )
}

// Never launch a GUI process as a side effect of the ordinary unit suite.
// Explicit direct test invocations opt in with UR_REQUIRE_PACKAGED.
const smokeTest = isPackaged && requirePackaged ? test : test.skip

smokeTest('packaged electron app starts and reports ready', async () => {
  const bin = packagedAppBin
  const dataDir = mkdtempSync(path.join(tmpdir(), 'ur-nexus-smoke-'))
  const proc = spawn(bin, ['--headless', '--smoke-test'], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      NODE_ENV: 'production',
      SKIP_WINDOW_ON_NO_DISPLAY: '1',
      UR_DESKTOP_SMOKE_TEST: '1',
      UR_DESKTOP_DATA_DIR: dataDir,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let output = ''
  try {
    output = await waitForOutput(proc, 'UR_DESKTOP_READY')
  } finally {
    proc.kill('SIGTERM')
    await new Promise(resolve => {
      if (proc.exitCode !== null) resolve()
      else proc.once('exit', resolve)
    })
    rmSync(dataDir, { recursive: true, force: true })
  }

  expect(output).toContain('UR_DESKTOP_READY')
}, 15000)
