import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { execFile as execFileCallback } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import {
  createIsolatedWorktree,
  resolveWorktreePath,
} from './worktreeManager.js'

const execFile = promisify(execFileCallback)
let dataDir: string
let projectDir: string

async function git(args: string[]): Promise<void> {
  await execFile('git', ['-C', projectDir, ...args], {
    env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1' },
  })
}

beforeEach(async () => {
  dataDir = await mkdtemp(join(tmpdir(), 'ur-worktree-data-'))
  projectDir = await mkdtemp(join(tmpdir(), 'ur-worktree-project-'))
  process.env.UR_DESKTOP_DATA_DIR = dataDir
  await git(['init', '--initial-branch=main'])
  await git(['config', 'user.name', 'UR Desktop Test'])
  await git(['config', 'user.email', 'desktop-test@example.invalid'])
  await writeFile(join(projectDir, 'README.md'), '# Test\n')
  await git(['add', 'README.md'])
  await git(['commit', '-m', 'initial'])
})

afterEach(async () => {
  delete process.env.UR_DESKTOP_DATA_DIR
  await rm(dataDir, { recursive: true, force: true })
  await rm(projectDir, { recursive: true, force: true })
})

describe('real git worktree isolation', () => {
  it('creates an actual worktree outside the main checkout', async () => {
    await writeFile(join(projectDir, 'README.md'), '# Dirty state\n')
    await writeFile(join(projectDir, 'research.txt'), 'untracked context\n')
    const worktree = await createIsolatedWorktree(projectDir, 'ur/test-isolation')
    expect(worktree.isMain).toBe(false)
    expect(worktree.root.startsWith(projectDir)).toBe(false)
    const branch = (
      await execFile('git', ['-C', worktree.root, 'branch', '--show-current'])
    ).stdout.trim()
    expect(branch).toBe('ur/test-isolation')
    expect(await readFile(join(worktree.root, 'README.md'), 'utf-8')).toBe('# Dirty state\n')
    expect(await readFile(join(worktree.root, 'research.txt'), 'utf-8')).toBe(
      'untracked context\n',
    )
    expect(
      (await execFile('git', ['-C', worktree.root, 'status', '--porcelain'])).stdout,
    ).not.toContain('.ur-worktree.json')
  })

  it('rejects unsafe branch names and paths that escape through symlinks', async () => {
    await expect(
      createIsolatedWorktree(projectDir, '../../outside'),
    ).rejects.toThrow(/Invalid git branch name/)

    const outside = await mkdtemp(join(tmpdir(), 'ur-worktree-outside-'))
    try {
      await mkdir(join(projectDir, 'safe'), { recursive: true })
      await symlink(outside, join(projectDir, 'safe', 'escape'))
      expect(() =>
        resolveWorktreePath(projectDir, undefined, 'safe/escape/file.txt'),
      ).toThrow(/outside workspace|symbolic link/)
    } finally {
      await rm(outside, { recursive: true, force: true })
    }
  })
})
