import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))

describe('desktop npm package contract', () => {
  test('publishes the requested public identity', () => {
    expect(pkg.name).toBe('ur-nexus-desktop')
    expect(pkg.version).toBe('1.0.5')
    expect(pkg.private).not.toBe(true)
    expect(pkg.publishConfig).toEqual({ access: 'public' })
    expect(pkg.repository.url).toContain('Maitham16/ur-nexus')
  })

  test('ships an executable and only allowlisted release content', () => {
    expect(pkg.bin['ur-nexus-desktop']).toBe('bin/ur-nexus-desktop.js')
    for (const required of [
      'bin/ur-nexus-desktop.js',
      'dist/main/main.mjs',
      'dist/preload/preload.cjs',
      'dist/renderer',
      'LICENSE',
      'README.md',
    ]) {
      expect(pkg.files).toContain(required)
    }
    expect(pkg.files.some(file => file.includes('.ur'))).toBe(false)
    expect(pkg.files.some(file => /\.(?:zip|dmg)$/.test(file))).toBe(false)
  })

  test('has no publish-time local dependency', () => {
    for (const value of Object.values(pkg.dependencies ?? {})) {
      expect(String(value)).not.toMatch(/^file:/)
      expect(String(value)).not.toMatch(/^workspace:/)
    }
  })

  test('uses only dependency-owned native setup scripts', () => {
    expect(pkg.scripts.postinstall).toBeUndefined()
    expect(pkg.files).not.toContain('scripts/fix-electron.mjs')
    expect(pkg.trustedDependencies).toContain('electron')
    expect(pkg.trustedDependencies).toContain('node-pty')
  })
})
