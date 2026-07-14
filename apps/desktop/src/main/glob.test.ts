import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { globProjectFiles } from './runtime.js'

let dir: string

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-glob-'))
  fs.mkdirSync(path.join(dir, 'src/deep'), { recursive: true })
  fs.mkdirSync(path.join(dir, 'node_modules/pkg'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'a.ts'), '')
  fs.writeFileSync(path.join(dir, 'b.txt'), '')
  fs.writeFileSync(path.join(dir, 'src/c.ts'), '')
  fs.writeFileSync(path.join(dir, 'src/deep/d.ts'), '')
  fs.writeFileSync(path.join(dir, 'node_modules/pkg/e.ts'), '')
})

afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

describe('globProjectFiles', () => {
  it('matches top-level patterns', async () => {
    expect(await globProjectFiles(dir, '*.ts')).toEqual(['a.ts'])
  })

  it('matches single-directory patterns', async () => {
    expect(await globProjectFiles(dir, 'src/*.ts')).toEqual(['src/c.ts'])
  })

  it('matches recursive ** patterns and skips node_modules', async () => {
    expect(await globProjectFiles(dir, '**/*.ts')).toEqual([
      'a.ts',
      'src/c.ts',
      'src/deep/d.ts',
    ])
  })

  it('supports ? wildcards', async () => {
    expect(await globProjectFiles(dir, '?.txt')).toEqual(['b.txt'])
  })

  it('returns empty for non-matching patterns', async () => {
    expect(await globProjectFiles(dir, '*.py')).toEqual([])
  })
})
