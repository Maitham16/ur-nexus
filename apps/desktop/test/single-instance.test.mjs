import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect } from 'bun:test'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packagedDirectory = process.arch === 'arm64' ? 'mac-arm64' : 'mac'
const appBin = path.join(
  __dirname,
  '..',
  'dist',
  packagedDirectory,
  'UR Nexus Desktop.app',
  'Contents',
  'MacOS',
  'UR Nexus Desktop',
)

// Skipped in plain `bun test` runs before packaging. Direct invocations may
// set UR_REQUIRE_PACKAGED=1 to make a missing bundle a hard failure.
const isPackaged = existsSync(appBin)
const requirePackaged = process.env.UR_REQUIRE_PACKAGED === '1'
if (!isPackaged && requirePackaged) {
  throw new Error(`Packaged app not found at ${appBin}. Run bun run package:mac first.`)
}
const packagedTest = isPackaged && requirePackaged ? test : test.skip
const testDataDir = requirePackaged
  ? mkdtempSync(path.join(tmpdir(), 'ur-nexus-single-instance-'))
  : ''

function launchApp(extraArgs = [], timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    if (!existsSync(appBin)) {
      reject(new Error(`Packaged app not found at ${appBin}. Run bun run package:mac first.`))
      return
    }
    const proc = spawn(appBin, ['--headless', '--smoke-test', ...extraArgs], {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        NODE_ENV: 'production',
        SKIP_WINDOW_ON_NO_DISPLAY: '1',
        UR_DESKTOP_SMOKE_TEST: '1',
        // Hold the first instance open long enough that the second launch
        // races against a live single-instance lock, not a released one.
        UR_SMOKE_LINGER_MS: '20000',
        UR_DESKTOP_DATA_DIR: testDataDir,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let output = ''
    const timer = setTimeout(() => {
      proc.kill('SIGTERM')
      reject(new Error(`Timeout waiting for UR_DESKTOP_READY. Output:\n${output}`))
    }, timeoutMs)
    function onData(chunk) {
      output += chunk.toString()
      if (output.includes('UR_DESKTOP_READY')) {
        clearTimeout(timer)
        resolve({ proc, output, pid: proc.pid })
      }
    }
    proc.stdout?.on('data', onData)
    proc.stderr?.on('data', onData)
    proc.on('exit', (code) => {
      clearTimeout(timer)
      if (!output.includes('UR_DESKTOP_READY')) {
        reject(new Error(`App exited ${code} before ready. Output:\n${output}`))
      }
    })
  })
}

packagedTest('single-instance lock prevents a second process from launching', async () => {
  const first = await launchApp()

  // Give the first process time to fully acquire the single-instance lock.
  await new Promise(r => setTimeout(r, 1000))

  let secondExited = false
  let secondCode = null
  try {
    const second = await new Promise((resolve, reject) => {
      const proc = spawn(appBin, ['--headless', '--smoke-test'], {
        cwd: path.join(__dirname, '..'),
        env: {
          ...process.env,
          NODE_ENV: 'production',
          SKIP_WINDOW_ON_NO_DISPLAY: '1',
          UR_DESKTOP_SMOKE_TEST: '1',
          UR_DESKTOP_DATA_DIR: testDataDir,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      })
      let output = ''
      const timer = setTimeout(() => {
        proc.kill('SIGTERM')
        reject(new Error(`Second instance did not exit quickly. Output:\n${output}`))
      }, 5000)
      proc.stdout?.on('data', c => { output += c.toString() })
      proc.stderr?.on('data', c => { output += c.toString() })
      proc.on('exit', code => {
        clearTimeout(timer)
        secondExited = true
        secondCode = code
        resolve({ code, output })
      })
    })
    // The second instance should quit without printing UR_DESKTOP_READY.
    expect(second.output).not.toContain('UR_DESKTOP_READY')
    expect(second.code).not.toBe(null)
  } finally {
    first.proc.kill('SIGTERM')
    await new Promise(resolve => {
      if (first.proc.exitCode !== null) resolve()
      else first.proc.once('exit', resolve)
    })
    rmSync(testDataDir, { recursive: true, force: true })
  }
}, 20000)
