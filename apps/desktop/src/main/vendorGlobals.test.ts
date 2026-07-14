import { describe, it, expect } from 'bun:test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { APP_VERSION } from './vendorGlobals.js'

describe('vendor globals', () => {
  it('APP_VERSION matches package.json', () => {
    const pkg = JSON.parse(
      fs.readFileSync(
        path.resolve(import.meta.dir, '../../package.json'),
        'utf-8',
      ),
    ) as { version: string }
    expect(APP_VERSION).toBe(pkg.version)
  })

  it('defines the MACRO global the vendored runtime requires', () => {
    const macro = (globalThis as Record<string, unknown>).MACRO as Record<string, string>
    expect(macro).toBeDefined()
    for (const key of [
      'VERSION',
      'BUILD_TIME',
      'FEEDBACK_CHANNEL',
      'ISSUES_EXPLAINER',
      'PACKAGE_URL',
      'VERSION_CHANGELOG',
    ]) {
      expect(typeof macro[key]).toBe('string')
      expect(macro[key].length).toBeGreaterThan(0)
    }
  })
})
