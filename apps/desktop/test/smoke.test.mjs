import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { test, expect } from 'bun:test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mainScript = path.join(__dirname, '..', 'dist', 'main', 'main.mjs')
const electronBin = path.join(__dirname, '..', '..', '..', 'node_modules', '.bun', 'electron@31.7.7', 'node_modules', 'electron', 'dist', 'electron')

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
      if (text.includes(marker)) {
        cleanup()
        resolve(output)
      }
    }
    proc.stdout?.on('data', onData)
    proc.stderr?.on('data', onData)
  })
}

test('packaged electron main script parses without runtime import errors', async () => {
  const proc = spawn(electronBin, ['--headless', mainScript, '--smoke-test'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, NODE_ENV: 'production', SKIP_WINDOW_ON_NO_DISPLAY: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let output = ''
  try {
    output = await waitForOutput(proc, 'UR_DESKTOP_READY')
  } finally {
    proc.kill('SIGTERM')
  }

  expect(output).toContain('UR_DESKTOP_READY')
}, 15000)
