// Fails when obvious placeholder/mock implementations exist in production
// source. Test files, type stubs, and vendor bundles are exempt.
import { test, expect } from 'bun:test'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const SRC = path.resolve(import.meta.dir, '../src')

const EXEMPT = [
  /\.test\.(ts|tsx|mjs)$/,
  /src\/types\/agent-runtime-stub\.d\.ts$/,
]

// Each pattern targets a class of fake functionality. `allow` lists files
// where the phrase is legitimate (e.g. UI copy about placeholders).
const FORBIDDEN = [
  {
    name: 'placeholder implementations',
    pattern: /placeholder execution|Phase \d placeholder|PLACEHOLDER_/i,
    allow: [],
  },
  {
    name: 'dead links',
    pattern: /href="#"/,
    allow: [],
  },
  {
    name: 'empty click handlers',
    pattern: /onClick=\{\(\) => \{\}\}|onClick=\{\(\) => undefined\}/,
    allow: [],
  },
  {
    name: 'TODO/FIXME handlers left in production code',
    pattern: /\/\/\s*(TODO|FIXME)\b/,
    allow: [],
  },
  {
    name: 'mocked runtime data',
    pattern: /\bmockRun\b|\bfakeAgent\b|\bMOCK_(TASKS|AGENTS|RUNS|EVENTS)\b|simulateProgress/,
    allow: [],
  },
  {
    name: 'window.prompt (unsupported in Electron renderers)',
    pattern: /window\.prompt\(/,
    allow: [],
  },
  {
    name: 'unimplemented handler bodies',
    pattern: /throw new Error\((['"`])not implemented\1\)/i,
    allow: [],
  },
]

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (/\.(ts|tsx|mjs|js|css|html)$/.test(entry.name)) out.push(full)
  }
  return out
}

test('production source contains no placeholder implementations', () => {
  const files = walk(SRC).filter(
    file => !EXEMPT.some(pattern => pattern.test(file)),
  )
  expect(files.length).toBeGreaterThan(10)

  const violations = []
  for (const file of files) {
    const text = readFileSync(file, 'utf-8')
    for (const rule of FORBIDDEN) {
      if (rule.allow.some(a => file.endsWith(a))) continue
      const match = text.match(rule.pattern)
      if (match) {
        const line = text.slice(0, match.index).split('\n').length
        violations.push(
          `${path.relative(SRC, file)}:${line} — ${rule.name} (${match[0]})`,
        )
      }
    }
  }
  expect(violations).toEqual([])
})
