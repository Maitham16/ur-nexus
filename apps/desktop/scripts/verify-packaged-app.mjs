import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const desktopRoot = path.resolve(scriptDirectory, '..')
const packagedDirectory = process.arch === 'arm64' ? 'mac-arm64' : 'mac'
const appBin = path.join(
  desktopRoot,
  'dist',
  packagedDirectory,
  'UR Nexus Desktop.app',
  'Contents',
  'MacOS',
  'UR Nexus Desktop',
)

if (!existsSync(appBin)) {
  throw new Error(`Packaged app not found at ${appBin}. Run bun run package:mac first.`)
}

function launch(dataDir, { linger = false } = {}) {
  return spawn(appBin, ['--headless', '--smoke-test'], {
    cwd: desktopRoot,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      SKIP_WINDOW_ON_NO_DISPLAY: '1',
      UR_DESKTOP_SMOKE_TEST: '1',
      UR_DESKTOP_DATA_DIR: dataDir,
      ...(linger ? { UR_SMOKE_LINGER_MS: '20000' } : {}),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
}

function observe(proc) {
  let output = ''
  proc.stdout?.on('data', chunk => { output += String(chunk) })
  proc.stderr?.on('data', chunk => { output += String(chunk) })
  return () => output
}

function waitForReady(proc, output, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error(`Timeout waiting for UR_DESKTOP_READY. Output:\n${output()}`))
    }, timeoutMs)
    const poll = setInterval(() => {
      if (output().includes('UR_DESKTOP_READY')) {
        cleanup()
        resolve()
      }
    }, 25)
    const onExit = code => {
      if (!output().includes('UR_DESKTOP_READY')) {
        cleanup()
        reject(new Error(`App exited ${code} before ready. Output:\n${output()}`))
      }
    }
    const cleanup = () => {
      clearTimeout(timer)
      clearInterval(poll)
      proc.off('exit', onExit)
    }
    proc.on('exit', onExit)
  })
}

function waitForExit(proc, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    if (proc.exitCode !== null) {
      resolve(proc.exitCode)
      return
    }
    const timer = setTimeout(() => {
      proc.kill('SIGTERM')
      reject(new Error('Second app instance did not exit promptly.'))
    }, timeoutMs)
    proc.once('exit', code => {
      clearTimeout(timer)
      resolve(code)
    })
  })
}

async function stop(proc) {
  if (proc.exitCode !== null) return
  proc.kill('SIGTERM')
  await new Promise(resolve => proc.once('exit', resolve))
}

async function smoke() {
  const dataDir = mkdtempSync(path.join(tmpdir(), 'ur-nexus-smoke-'))
  const proc = launch(dataDir)
  const output = observe(proc)
  try {
    await waitForReady(proc, output)
    console.log('Packaged app smoke check passed: UR_DESKTOP_READY')
  } finally {
    await stop(proc)
    rmSync(dataDir, { recursive: true, force: true })
  }
}

async function singleInstance() {
  const dataDir = mkdtempSync(path.join(tmpdir(), 'ur-nexus-single-instance-'))
  const first = launch(dataDir, { linger: true })
  const firstOutput = observe(first)
  try {
    await waitForReady(first, firstOutput)
    const second = launch(dataDir)
    const secondOutput = observe(second)
    const secondCode = await waitForExit(second)
    if (secondOutput().includes('UR_DESKTOP_READY')) {
      throw new Error('A second app process acquired the single-instance lock.')
    }
    if (secondCode === null) {
      throw new Error('The second app process did not terminate.')
    }
    console.log('Packaged app single-instance check passed')
  } finally {
    await stop(first)
    rmSync(dataDir, { recursive: true, force: true })
  }
}

const command = process.argv[2]
if (command === 'smoke') await smoke()
else if (command === 'single-instance') await singleInstance()
else throw new Error('Usage: node scripts/verify-packaged-app.mjs <smoke|single-instance>')
