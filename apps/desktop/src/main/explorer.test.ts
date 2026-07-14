import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execFileSync } from 'node:child_process'
import {
  listExplorerEntries,
  createExplorerEntry,
  renameExplorerEntry,
  deleteExplorerEntry,
  gitStatus,
  gitDiff,
  gitRevertFile,
} from './explorer.js'

let repo: string

function git(...args: string[]): void {
  execFileSync('git', args, { cwd: repo })
}

beforeEach(() => {
  repo = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-explorer-'))
  git('init', '-q')
  git('config', 'user.email', 'test@example.com')
  git('config', 'user.name', 'Test')
  fs.writeFileSync(path.join(repo, 'README.md'), '# repo\n')
  fs.mkdirSync(path.join(repo, 'src'))
  fs.writeFileSync(path.join(repo, 'src/index.ts'), 'export {}\n')
  fs.writeFileSync(path.join(repo, '.gitignore'), 'ignored-dir/\n')
  git('add', '.')
  git('commit', '-q', '-m', 'init')
})

afterEach(() => {
  fs.rmSync(repo, { recursive: true, force: true })
})

describe('listExplorerEntries', () => {
  it('lists directories first, hides .git, and flags git status', async () => {
    fs.writeFileSync(path.join(repo, 'README.md'), '# repo\nchanged\n')
    const entries = await listExplorerEntries(repo)
    const names = entries.map(e => e.name)
    expect(names).not.toContain('.git')
    expect(entries[0].type).toBe('directory')
    const readme = entries.find(e => e.name === 'README.md')
    expect(readme?.gitStatus).toBe('modified')
  })

  it('hides ignored entries unless requested', async () => {
    fs.mkdirSync(path.join(repo, 'ignored-dir'))
    fs.writeFileSync(path.join(repo, 'ignored-dir/x.txt'), 'x')
    const hidden = await listExplorerEntries(repo)
    expect(hidden.map(e => e.name)).not.toContain('ignored-dir')
    const shown = await listExplorerEntries(repo, '', true)
    const ignored = shown.find(e => e.name === 'ignored-dir')
    expect(ignored?.ignored).toBe(true)
  })

  it('rejects paths escaping the project root', async () => {
    await expect(listExplorerEntries(repo, '../outside')).rejects.toThrow(
      /escapes the project root/,
    )
  })
})

describe('explorer mutations', () => {
  it('creates, renames, and deletes entries', async () => {
    await createExplorerEntry(repo, 'notes/todo.md', 'file')
    expect(fs.existsSync(path.join(repo, 'notes/todo.md'))).toBe(true)

    await renameExplorerEntry(repo, 'notes/todo.md', 'notes/done.md')
    expect(fs.existsSync(path.join(repo, 'notes/done.md'))).toBe(true)

    await deleteExplorerEntry(repo, 'notes/done.md')
    expect(fs.existsSync(path.join(repo, 'notes/done.md'))).toBe(false)
  })

  it('refuses to create over an existing file', async () => {
    await expect(createExplorerEntry(repo, 'README.md', 'file')).rejects.toThrow()
  })
})

describe('git review helpers', () => {
  it('reports modified and untracked files', async () => {
    fs.writeFileSync(path.join(repo, 'README.md'), 'changed\n')
    fs.writeFileSync(path.join(repo, 'new.txt'), 'new\n')
    const status = await gitStatus(repo)
    expect(status.find(s => s.relPath === 'README.md')?.status).toBe('modified')
    expect(status.find(s => s.relPath === 'new.txt')?.status).toBe('untracked')
  })

  it('produces a diff for modified files and synthesizes one for untracked files', async () => {
    fs.writeFileSync(path.join(repo, 'README.md'), 'changed\n')
    const diff = await gitDiff(repo, 'README.md')
    expect(diff).toContain('-# repo')
    expect(diff).toContain('+changed')

    fs.writeFileSync(path.join(repo, 'new.txt'), 'fresh content\n')
    const untrackedDiff = await gitDiff(repo, 'new.txt')
    expect(untrackedDiff).toContain('+fresh content')
  })

  it('reverts a modified file to HEAD and deletes untracked files', async () => {
    fs.writeFileSync(path.join(repo, 'README.md'), 'changed\n')
    await gitRevertFile(repo, 'README.md')
    expect(fs.readFileSync(path.join(repo, 'README.md'), 'utf-8')).toBe('# repo\n')

    fs.writeFileSync(path.join(repo, 'scratch.txt'), 'temp\n')
    await gitRevertFile(repo, 'scratch.txt')
    expect(fs.existsSync(path.join(repo, 'scratch.txt'))).toBe(false)
  })

  it('refuses to revert files with no pending change', async () => {
    await expect(gitRevertFile(repo, 'README.md')).rejects.toThrow(
      /No pending change/,
    )
  })
})
