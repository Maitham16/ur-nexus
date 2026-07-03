import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dir, '..')

describe('UR-Nexus branding', () => {
  test('package metadata and README use UR-Nexus branding', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
      name: string
      description: string
    }
    const readme = readFileSync(join(root, 'README.md'), 'utf8')

    expect(pkg.name).toBe('ur-nexus')
    expect(pkg.description).toContain('UR-Nexus')
    expect(readme).toStartWith('# UR-Nexus')
    expect(readme).not.toContain('UR-AGENT')
  })
})
