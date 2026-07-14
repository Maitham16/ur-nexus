#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
)

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  console.log(`${packageJson.version} (UR-Nexus Desktop)`)
  process.exit(0)
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`UR-Nexus Desktop ${packageJson.version}\n\nUsage: ur-nexus-desktop [Electron options]\n       ur-nexus-desktop --version`)
  process.exit(0)
}

function resolveElectronBinary() {
  try {
    const resolved = require('electron')
    if (typeof resolved === 'string' && existsSync(resolved)) return resolved
  } catch {
    // npm may install Electron's files before its path metadata is written.
    // Fall back to the platform binary below so this remains recoverable.
  }

  const executable = {
    darwin: 'Electron.app/Contents/MacOS/Electron',
    linux: 'electron',
    win32: 'electron.exe',
  }[process.platform]
  if (executable) {
    const fallback = fileURLToPath(
      new URL(`../node_modules/electron/dist/${executable}`, import.meta.url),
    )
    if (existsSync(fallback)) return fallback
  }

  console.error(`UR-Nexus Desktop ${packageJson.version} could not find its Electron runtime.\n`)
  console.error('npm did not run the two reviewed native setup scripts required by the desktop app.')
  console.error('Repair the installation with:\n')
  console.error(
    `  npm install --global --allow-scripts=electron,node-pty ur-nexus-desktop@${packageJson.version}\n`,
  )
  console.error('No broad script permission is required.')
  process.exit(1)
}

const electronBinary = resolveElectronBinary()
const mainScript = fileURLToPath(new URL('../dist/main/main.mjs', import.meta.url))
const child = spawn(electronBinary, [mainScript, ...process.argv.slice(2)], {
  stdio: 'inherit',
  windowsHide: false,
})

child.once('error', error => {
  console.error(`Unable to start UR-Nexus Desktop: ${error.message}`)
  process.exitCode = 1
})

child.once('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exitCode = code ?? 1
})
