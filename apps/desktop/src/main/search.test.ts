import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execFileSync } from 'node:child_process'
import {
  runSearch,
  searchInternal,
  resolveRipgrepPath,
  type SearchOptions,
} from './search.js'

let repo: string

beforeEach(() => {
  repo = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-search-'))
  execFileSync('git', ['init', '-q'], { cwd: repo })
  fs.mkdirSync(path.join(repo, 'src'))
  fs.mkdirSync(path.join(repo, 'docs'))
  fs.writeFileSync(
    path.join(repo, 'src/app.ts'),
    'const magicNeedle = 1\nconst other = 2\n  const MagicNeedle = 3\n',
  )
  fs.writeFileSync(path.join(repo, 'docs/notes.md'), 'no needles here\nmagicNeedle in docs\n')
  fs.writeFileSync(path.join(repo, '.gitignore'), 'ignored.txt\n')
  fs.writeFileSync(path.join(repo, 'ignored.txt'), 'magicNeedle ignored\n')
  fs.writeFileSync(path.join(repo, 'blob.bin'), Buffer.from([0, 1, 2, 3, 0]))
})

afterEach(() => {
  fs.rmSync(repo, { recursive: true, force: true })
})

function opts(extra: Partial<SearchOptions> = {}): SearchOptions {
  return { projectRoot: repo, pattern: 'magicNeedle', ...extra }
}

// The same assertions run against both engines so their semantics stay
// aligned; ripgrep assertions are skipped when the optional binary is absent.
const engines: Array<{
  name: string
  run: (o: SearchOptions) => ReturnType<typeof runSearch>
  available: boolean
}> = [
  { name: 'internal', run: searchInternal, available: true },
  {
    name: 'ripgrep',
    run: runSearch,
    available: resolveRipgrepPath() !== null,
  },
]

for (const engine of engines) {
  const t = engine.available ? describe : describe.skip
  t(`search semantics (${engine.name})`, () => {
    it('finds matches with file, line, and column', async () => {
      const result = await engine.run(opts())
      const hit = result.matches.find(m => m.file === 'src/app.ts')
      expect(hit).toBeDefined()
      expect(hit!.line).toBe(1)
      expect(hit!.column).toBe(7)
      expect(hit!.text).toContain('magicNeedle = 1')
    })

    it('is case-sensitive by default and case-insensitive on request', async () => {
      const sensitive = await engine.run(opts())
      expect(
        sensitive.matches.filter(m => m.file === 'src/app.ts'),
      ).toHaveLength(1)
      const insensitive = await engine.run(opts({ caseSensitive: false }))
      expect(
        insensitive.matches.filter(m => m.file === 'src/app.ts'),
      ).toHaveLength(2)
    })

    it('supports fixed-string mode for regex metacharacters', async () => {
      fs.writeFileSync(path.join(repo, 'src/regex.ts'), 'value = a.b(c)\n')
      const result = await engine.run(opts({ pattern: 'a.b(c)', fixed: true }))
      expect(result.matches.some(m => m.file === 'src/regex.ts')).toBe(true)
    })

    it('supports include and exclude globs', async () => {
      const onlyDocs = await engine.run(opts({ include: ['docs/**'] }))
      expect(onlyDocs.matches.every(m => m.file.startsWith('docs/'))).toBe(true)
      expect(onlyDocs.matches.length).toBeGreaterThan(0)

      const noDocs = await engine.run(opts({ exclude: ['docs/**'] }))
      expect(noDocs.matches.some(m => m.file.startsWith('docs/'))).toBe(false)
      expect(noDocs.matches.length).toBeGreaterThan(0)
    })

    it('respects .gitignore', async () => {
      const result = await engine.run(opts())
      expect(result.matches.some(m => m.file === 'ignored.txt')).toBe(false)
    })

    it('skips binary files', async () => {
      const result = await engine.run(opts({ pattern: '.' }))
      expect(result.matches.length).toBeGreaterThan(0)
      expect(result.matches.some(m => m.file === 'blob.bin')).toBe(false)
    })
  })
}

describe('search validation', () => {
  it('rejects empty patterns', async () => {
    await expect(runSearch(opts({ pattern: '' }))).rejects.toThrow(/must not be empty/)
  })

  it('rejects unsafe globs', async () => {
    await expect(
      runSearch(opts({ include: ['--flag'] })),
    ).rejects.toThrow(/Unsafe glob/)
    await expect(
      runSearch(opts({ exclude: ['/etc/**'] })),
    ).rejects.toThrow(/relative/)
  })

  it('rejects invalid regex in the internal engine', async () => {
    await expect(searchInternal(opts({ pattern: '[unclosed' }))).rejects.toThrow(
      /Invalid search pattern/,
    )
  })
})

describe('ripgrep binary resolution', () => {
  it('resolves the dependency-managed binary in this environment', () => {
    // The desktop declares @vscode/ripgrep as an optional dependency; in CI
    // or offline installs this may legitimately be absent, in which case the
    // internal engine covers search. Log rather than fail when missing.
    const rgPath = resolveRipgrepPath()
    if (rgPath === null) {
      console.warn('ripgrep binary not installed; internal engine will be used')
      return
    }
    expect(fs.existsSync(rgPath)).toBe(true)
  })
})
