import { describe, it, expect } from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execFileSync } from 'node:child_process'
import { buildUnifiedDiff } from './runtime.js'

describe('buildUnifiedDiff', () => {
  it('returns empty string for identical content', () => {
    expect(buildUnifiedDiff('a.txt', 'same\n', 'same\n')).toBe('')
  })

  it('produces headers and hunks for a single-line change', () => {
    const patch = buildUnifiedDiff('file.txt', 'one\ntwo\nthree\n', 'one\n2\nthree\n')
    expect(patch).toContain('--- a/file.txt')
    expect(patch).toContain('+++ b/file.txt')
    expect(patch).toContain('-two')
    expect(patch).toContain('+2')
    expect(patch).toMatch(/@@ -\d+,\d+ \+\d+,\d+ @@/)
  })

  it('round-trips through git apply', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-diff-'))
    try {
      execFileSync('git', ['init', '-q'], { cwd: dir })
      const original = [
        'line 1',
        'line 2',
        'line 3',
        'line 4',
        'line 5',
        'line 6',
        'line 7',
        'line 8',
        '',
      ].join('\n')
      const updated = original
        .replace('line 3', 'LINE THREE')
        .replace('line 7', 'line 7 extended')
      fs.writeFileSync(path.join(dir, 'sample.txt'), original)

      const patch = buildUnifiedDiff('sample.txt', original, updated)
      const patchFile = path.join(dir, 'change.patch')
      fs.writeFileSync(patchFile, patch)
      execFileSync('git', ['apply', '--whitespace=nowarn', patchFile], {
        cwd: dir,
      })

      const result = fs.readFileSync(path.join(dir, 'sample.txt'), 'utf-8')
      expect(result).toBe(updated)
    } finally {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  })

  it('handles additions at end of file', () => {
    const patch = buildUnifiedDiff('x.txt', 'a\nb\n', 'a\nb\nc\nd\n')
    expect(patch).toContain('+c')
    expect(patch).toContain('+d')
  })

  it('handles full file replacement', () => {
    const patch = buildUnifiedDiff('x.txt', 'old content\n', 'entirely new\n')
    expect(patch).toContain('-old content')
    expect(patch).toContain('+entirely new')
  })
})
