import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execFileSync } from 'node:child_process'
import {
  parseUnifiedDiff,
  buildPatchForHunks,
  applySelectedHunks,
  hashContent,
  StaleDiffError,
} from './diffs.js'
import { buildUnifiedDiff } from './runtime.js'

let repo: string

function write(rel: string, content: string): void {
  fs.mkdirSync(path.dirname(path.join(repo, rel)), { recursive: true })
  fs.writeFileSync(path.join(repo, rel), content)
}

function read(rel: string): string {
  return fs.readFileSync(path.join(repo, rel), 'utf-8')
}

beforeEach(() => {
  repo = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-hunks-'))
  execFileSync('git', ['init', '-q'], { cwd: repo })
})

afterEach(() => {
  fs.rmSync(repo, { recursive: true, force: true })
})

const MULTI_ORIGINAL = Array.from({ length: 30 }, (_, i) => `line ${i + 1}`).join('\n') + '\n'
const MULTI_UPDATED = MULTI_ORIGINAL.replace('line 3', 'LINE 3 EDITED').replace(
  'line 25',
  'LINE 25 EDITED',
)

describe('parseUnifiedDiff', () => {
  it('splits a multi-hunk diff into indexed hunks', () => {
    const patch = buildUnifiedDiff('multi.txt', MULTI_ORIGINAL, MULTI_UPDATED)
    const files = parseUnifiedDiff(patch)
    expect(files).toHaveLength(1)
    expect(files[0].hunks).toHaveLength(2)
    expect(files[0].hunks[0].index).toBe(0)
    expect(files[0].hunks[1].index).toBe(1)
    expect(files[0].isNew).toBe(false)
  })

  it('recognizes new files, deletions, and binary markers', () => {
    const newFile = parseUnifiedDiff(
      '--- /dev/null\n+++ b/created.txt\n@@ -0,0 +1,1 @@\n+hello\n',
    )
    expect(newFile[0].isNew).toBe(true)

    const deleted = parseUnifiedDiff(
      '--- a/gone.txt\n+++ /dev/null\n@@ -1,1 +0,0 @@\n-bye\n',
    )
    expect(deleted[0].isDeleted).toBe(true)

    const binary = parseUnifiedDiff(
      'diff --git a/img.png b/img.png\nBinary files a/img.png and b/img.png differ\n',
    )
    expect(binary[0].isBinary).toBe(true)
  })

  it('preserves no-newline markers in hunk lines', () => {
    const patch = buildUnifiedDiff('x.txt', 'no newline end', 'no newline end!')
    const files = parseUnifiedDiff(patch)
    const lines = files[0].hunks[0].lines
    expect(lines.some(l => l.startsWith('\\'))).toBe(true)
  })
})

describe('buildPatchForHunks', () => {
  it('builds a subset patch with recomputed offsets', () => {
    const patch = buildUnifiedDiff('multi.txt', MULTI_ORIGINAL, MULTI_UPDATED)
    const secondOnly = buildPatchForHunks(patch, [1])
    expect(secondOnly).toContain('LINE 25 EDITED')
    expect(secondOnly).not.toContain('LINE 3 EDITED')
  })

  it('rejects hunk selection on binary files', () => {
    const patch =
      'diff --git a/img.png b/img.png\nBinary files a/img.png and b/img.png differ\n'
    // Binary sections have no hunks, so any selection is invalid.
    expect(() => buildPatchForHunks(patch, [0])).toThrow(/No hunks selected/)
  })

  it('rejects empty selections', () => {
    const patch = buildUnifiedDiff('multi.txt', MULTI_ORIGINAL, MULTI_UPDATED)
    expect(() => buildPatchForHunks(patch, [])).toThrow(/No hunks selected/)
  })
})

describe('applySelectedHunks', () => {
  it('applies a single hunk and leaves other regions untouched', async () => {
    write('multi.txt', MULTI_ORIGINAL)
    const patch = buildUnifiedDiff('multi.txt', MULTI_ORIGINAL, MULTI_UPDATED)

    await applySelectedHunks({ targetRoot: repo, patch, hunkIndexes: [0] })
    const content = read('multi.txt')
    expect(content).toContain('LINE 3 EDITED')
    expect(content).toContain('line 25') // second hunk not applied
    expect(content).not.toContain('LINE 25 EDITED')
  })

  it('applies the remaining hunk afterwards to reach the full result', async () => {
    write('multi.txt', MULTI_ORIGINAL)
    const patch = buildUnifiedDiff('multi.txt', MULTI_ORIGINAL, MULTI_UPDATED)
    await applySelectedHunks({ targetRoot: repo, patch, hunkIndexes: [0] })
    await applySelectedHunks({ targetRoot: repo, patch, hunkIndexes: [1] })
    expect(read('multi.txt')).toBe(MULTI_UPDATED)
  })

  it('reverse-applies an accepted hunk (revert)', async () => {
    write('multi.txt', MULTI_ORIGINAL)
    const patch = buildUnifiedDiff('multi.txt', MULTI_ORIGINAL, MULTI_UPDATED)
    await applySelectedHunks({ targetRoot: repo, patch, hunkIndexes: [0] })
    expect(read('multi.txt')).toContain('LINE 3 EDITED')

    await applySelectedHunks({
      targetRoot: repo,
      patch,
      hunkIndexes: [0],
      reverse: true,
    })
    expect(read('multi.txt')).toBe(MULTI_ORIGINAL)
  })

  it('creates new files and deletes removed files', async () => {
    const createPatch = '--- /dev/null\n+++ b/created.txt\n@@ -0,0 +1,2 @@\n+alpha\n+beta\n'
    await applySelectedHunks({ targetRoot: repo, patch: createPatch, hunkIndexes: [0] })
    expect(read('created.txt')).toBe('alpha\nbeta\n')

    write('doomed.txt', 'bye\n')
    const deletePatch = '--- a/doomed.txt\n+++ /dev/null\n@@ -1,1 +0,0 @@\n-bye\n'
    await applySelectedHunks({ targetRoot: repo, patch: deletePatch, hunkIndexes: [0] })
    expect(fs.existsSync(path.join(repo, 'doomed.txt'))).toBe(false)
  })

  it('handles files without trailing newlines', async () => {
    write('nonl.txt', 'no newline end')
    const patch = buildUnifiedDiff('nonl.txt', 'no newline end', 'no newline end!')
    await applySelectedHunks({ targetRoot: repo, patch, hunkIndexes: [0] })
    expect(read('nonl.txt')).toBe('no newline end!')
  })

  it('detects stale diffs when the source changed since generation', async () => {
    write('multi.txt', MULTI_ORIGINAL)
    const patch = buildUnifiedDiff('multi.txt', MULTI_ORIGINAL, MULTI_UPDATED)
    const baseHashes = { 'multi.txt': hashContent(MULTI_ORIGINAL) }

    // A later unrelated user edit lands before the hunk is accepted.
    write('multi.txt', MULTI_ORIGINAL.replace('line 10', 'line 10 user-edited'))

    await expect(
      applySelectedHunks({ targetRoot: repo, patch, hunkIndexes: [0], baseHashes }),
    ).rejects.toThrow(StaleDiffError)
  })

  it('preserves unrelated user changes when no stale check is requested and contexts do not overlap', async () => {
    write('multi.txt', MULTI_ORIGINAL)
    const patch = buildUnifiedDiff('multi.txt', MULTI_ORIGINAL, MULTI_UPDATED)
    // User edits a region far from both hunks.
    const userEdited = MULTI_ORIGINAL.replace('line 15', 'line 15 user-edited')
    write('multi.txt', userEdited)

    await applySelectedHunks({ targetRoot: repo, patch, hunkIndexes: [0] })
    const content = read('multi.txt')
    expect(content).toContain('LINE 3 EDITED')
    expect(content).toContain('line 15 user-edited')
  })
})
