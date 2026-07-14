import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {
  validateContextFile,
  addContextFiles,
  removeContextFile,
  listContextFiles,
  clearContextFiles,
  buildPromptContext,
  MAX_CONTEXT_FILE_BYTES,
} from './contextFiles.js'

let projectRoot: string

beforeEach(() => {
  projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-desktop-ctx-'))
})

afterEach(() => {
  clearContextFiles(projectRoot)
  fs.rmSync(projectRoot, { recursive: true, force: true })
})

describe('validateContextFile', () => {
  it('accepts a small text file', async () => {
    const file = path.join(projectRoot, 'notes.md')
    fs.writeFileSync(file, '# hello\n')
    const result = await validateContextFile(projectRoot, file)
    expect(result.ok).toBe(true)
    expect(result.kind).toBe('text')
    expect(result.relPath).toBe('notes.md')
  })

  it('rejects a missing file', async () => {
    const result = await validateContextFile(
      projectRoot,
      path.join(projectRoot, 'nope.txt'),
    )
    expect(result.ok).toBe(false)
    expect(result.kind).toBe('missing')
  })

  it('rejects a directory', async () => {
    const dir = path.join(projectRoot, 'sub')
    fs.mkdirSync(dir)
    const result = await validateContextFile(projectRoot, dir)
    expect(result.ok).toBe(false)
    expect(result.kind).toBe('directory')
  })

  it('rejects an oversized file', async () => {
    const file = path.join(projectRoot, 'big.txt')
    fs.writeFileSync(file, 'x'.repeat(MAX_CONTEXT_FILE_BYTES + 1))
    const result = await validateContextFile(projectRoot, file)
    expect(result.ok).toBe(false)
    expect(result.kind).toBe('too-large')
  })

  it('rejects a binary file', async () => {
    const file = path.join(projectRoot, 'blob.bin')
    fs.writeFileSync(file, Buffer.from([0x00, 0x01, 0x02, 0xff, 0x00, 0x10]))
    const result = await validateContextFile(projectRoot, file)
    expect(result.ok).toBe(false)
    expect(result.kind).toBe('binary')
  })

  it('reports files outside the project with absolute paths', async () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-desktop-out-'))
    const file = path.join(outside, 'external.txt')
    fs.writeFileSync(file, 'external content')
    const result = await validateContextFile(projectRoot, file)
    expect(result.ok).toBe(true)
    expect(result.relPath).toBe(file)
    fs.rmSync(outside, { recursive: true, force: true })
  })
})

describe('attachment store', () => {
  it('adds valid files and skips invalid ones', async () => {
    const good = path.join(projectRoot, 'good.txt')
    fs.writeFileSync(good, 'fine')
    const results = await addContextFiles(projectRoot, [
      good,
      path.join(projectRoot, 'missing.txt'),
    ])
    expect(results).toHaveLength(2)
    expect(results.filter(r => r.ok)).toHaveLength(1)
    expect(listContextFiles(projectRoot)).toHaveLength(1)
  })

  it('removes attached files', async () => {
    const good = path.join(projectRoot, 'good.txt')
    fs.writeFileSync(good, 'fine')
    await addContextFiles(projectRoot, [good])
    expect(removeContextFile(projectRoot, good)).toBe(true)
    expect(listContextFiles(projectRoot)).toHaveLength(0)
  })
})

describe('buildPromptContext', () => {
  it('renders fenced context blocks with relative paths', async () => {
    const file = path.join(projectRoot, 'src.ts')
    fs.writeFileSync(file, 'export const x = 1\n')
    const { context, failures } = await buildPromptContext(projectRoot, [file])
    expect(failures).toEqual([])
    expect(context).toContain('<attached-file path="src.ts">')
    expect(context).toContain('export const x = 1')
  })

  it('reports files that disappeared between attach and send', async () => {
    const file = path.join(projectRoot, 'gone.txt')
    fs.writeFileSync(file, 'temp')
    await addContextFiles(projectRoot, [file])
    fs.rmSync(file)
    const { context, failures } = await buildPromptContext(projectRoot, [file])
    expect(context).toBe('')
    expect(failures).toHaveLength(1)
    expect(failures[0].kind).toBe('missing')
  })
})
