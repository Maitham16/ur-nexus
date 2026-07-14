import * as path from 'node:path'
import * as os from 'node:os'
import { promises as fs } from 'node:fs'
import { createHash, randomUUID } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { ParsedDiffFileDto, ParsedHunkDto } from '../shared/ipc.js'

const execFileAsync = promisify(execFile)

export class StaleDiffError extends Error {
  constructor(file: string) {
    super(
      `The source of ${file} changed since this diff was generated — regenerate the diff before applying`,
    )
    this.name = 'StaleDiffError'
  }
}

export function hashContent(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex')
}

/**
 * Parse a unified diff into files and hunks. Handles new files, deletions,
 * renames, binary markers, and missing trailing newlines.
 */
export function parseUnifiedDiff(patch: string): ParsedDiffFileDto[] {
  const lines = patch.split('\n')
  const files: ParsedDiffFileDto[] = []
  let current: ParsedDiffFileDto | null = null
  let hunk: ParsedHunkDto | null = null
  let hunkIndex = 0

  const startFile = (oldPath: string, newPath: string): ParsedDiffFileDto => {
    const file: ParsedDiffFileDto = {
      oldPath,
      newPath,
      isNew: oldPath === '/dev/null',
      isDeleted: newPath === '/dev/null',
      isRename: false,
      isBinary: false,
      hunks: [],
    }
    files.push(file)
    hunk = null
    return file
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('diff --git ')) {
      // A new file section begins; paths get refined by ---/+++ lines.
      current = null
      hunk = null
      continue
    }
    if (line.startsWith('--- ')) {
      const oldPath = line.slice(4).replace(/^a\//, '').trim()
      const nextLine = lines[i + 1] ?? ''
      if (nextLine.startsWith('+++ ')) {
        const newPath = nextLine.slice(4).replace(/^b\//, '').trim()
        current = startFile(oldPath, newPath)
        if (
          oldPath !== '/dev/null' &&
          newPath !== '/dev/null' &&
          oldPath !== newPath
        ) {
          current.isRename = true
        }
        i++
      }
      continue
    }
    if (line.startsWith('rename from ') || line.startsWith('rename to ')) {
      if (current) current.isRename = true
      continue
    }
    if (
      line.startsWith('Binary files ') ||
      line.startsWith('GIT binary patch')
    ) {
      if (!current) current = startFile('unknown', 'unknown')
      current.isBinary = true
      continue
    }
    const hunkHeader = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/)
    if (hunkHeader && current) {
      hunk = {
        index: hunkIndex++,
        oldStart: Number(hunkHeader[1]),
        oldCount: hunkHeader[2] === undefined ? 1 : Number(hunkHeader[2]),
        newStart: Number(hunkHeader[3]),
        newCount: hunkHeader[4] === undefined ? 1 : Number(hunkHeader[4]),
        context: hunkHeader[5]?.trim() ?? '',
        lines: [],
      }
      current.hunks.push(hunk)
      continue
    }
    if (
      hunk &&
      (line.startsWith('+') ||
        line.startsWith('-') ||
        line.startsWith(' ') ||
        line.startsWith('\\'))
    ) {
      hunk.lines.push(line)
      continue
    }
    // Anything else ends the current hunk.
    if (line.trim() === '' && hunk) {
      // Blank separator between files in concatenated patches.
      hunk = null
    }
  }
  return files
}

function renderHunk(hunk: ParsedHunkDto, newStart: number): string {
  const header = `@@ -${hunk.oldStart},${hunk.oldCount} +${newStart},${hunk.newCount} @@${hunk.context ? ` ${hunk.context}` : ''}`
  return [header, ...hunk.lines].join('\n')
}

/**
 * Build a valid patch containing only the selected hunks (by global hunk
 * index). New-file start offsets are recomputed so the subset applies
 * cleanly, preserving unrelated hunks as untouched user content.
 */
export function buildPatchForHunks(
  patch: string,
  selectedHunkIndexes: number[],
): string {
  const files = parseUnifiedDiff(patch)
  const selected = new Set(selectedHunkIndexes)
  const parts: string[] = []

  for (const file of files) {
    if (file.isBinary) {
      if (file.hunks.some(h => selected.has(h.index))) {
        throw new Error(
          `Binary file ${file.newPath} does not support hunk-level operations`,
        )
      }
      continue
    }
    const chosen = file.hunks.filter(h => selected.has(h.index))
    if (chosen.length === 0) continue
    if (file.isNew && chosen.length !== file.hunks.length) {
      throw new Error(
        `New file ${file.newPath} must be accepted or rejected as a whole`,
      )
    }
    if (file.isDeleted && chosen.length !== file.hunks.length) {
      throw new Error(
        `Deleted file ${file.oldPath} must be accepted or rejected as a whole`,
      )
    }

    const headerOld = file.isNew ? '/dev/null' : `a/${file.oldPath}`
    const headerNew = file.isDeleted ? '/dev/null' : `b/${file.newPath}`
    const rendered: string[] = [`--- ${headerOld}`, `+++ ${headerNew}`]

    // Offset accumulates only across *selected* hunks: dropping a hunk means
    // its line delta never happens.
    let delta = 0
    for (const hunkEntry of file.hunks) {
      if (!selected.has(hunkEntry.index)) continue
      const newStart =
        hunkEntry.oldCount === 0
          ? hunkEntry.newStart // pure insertion into empty region keeps its position
          : hunkEntry.oldStart + delta
      rendered.push(renderHunk(hunkEntry, file.isNew ? hunkEntry.newStart : newStart))
      delta += hunkEntry.newCount - hunkEntry.oldCount
    }
    parts.push(rendered.join('\n'))
  }

  if (parts.length === 0) {
    throw new Error('No hunks selected')
  }
  return `${parts.join('\n')}\n`
}

async function gitApply(
  targetRoot: string,
  patchText: string,
  reverse: boolean,
): Promise<void> {
  const tmpFile = path.join(os.tmpdir(), `ur-hunks-${randomUUID()}.patch`)
  await fs.writeFile(
    tmpFile,
    patchText.endsWith('\n') ? patchText : `${patchText}\n`,
    'utf-8',
  )
  try {
    const args = ['apply', '--whitespace=nowarn']
    if (reverse) args.push('--reverse')
    args.push(tmpFile)
    await execFileAsync('git', args, { cwd: targetRoot })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Patch could not be applied: ${message}`)
  } finally {
    await fs.rm(tmpFile, { force: true }).catch(() => undefined)
  }
}

export interface ApplyHunksOptions {
  targetRoot: string
  patch: string
  hunkIndexes: number[]
  /** sha256 of each target file's content when the diff was generated. */
  baseHashes?: Record<string, string>
  reverse?: boolean
}

/**
 * Apply (or reverse) the selected hunks. When base hashes are provided the
 * current file content is verified first so a stale diff fails loudly
 * instead of corrupting newer edits.
 */
export async function applySelectedHunks(options: ApplyHunksOptions): Promise<{
  appliedFiles: string[]
}> {
  const subset = buildPatchForHunks(options.patch, options.hunkIndexes)
  const files = parseUnifiedDiff(subset)

  if (options.baseHashes && !options.reverse) {
    for (const file of files) {
      if (file.isNew) continue
      const expected = options.baseHashes[file.oldPath]
      if (!expected) continue
      const absPath = path.join(options.targetRoot, file.oldPath)
      const current = await fs.readFile(absPath, 'utf-8').catch(() => null)
      if (current === null || hashContent(current) !== expected) {
        throw new StaleDiffError(file.oldPath)
      }
    }
  }

  await gitApply(options.targetRoot, subset, options.reverse === true)
  return {
    appliedFiles: files.map(f => (f.isDeleted ? f.oldPath : f.newPath)),
  }
}
