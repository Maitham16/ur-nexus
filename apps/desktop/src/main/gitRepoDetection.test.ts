import { describe, expect, test } from 'bun:test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createIsolatedWorktree, isGitRepository } from './worktreeManager.js'

/**
 * Regression coverage for a plain-directory project.
 *
 * Plan execution used to force `useWorktree: true` for every task, so opening a
 * folder that was not a git repository failed the first task with raw git
 * stderr (`fatal: not a git repository`) and skipped the rest of the plan.
 */

function plainDirectory(): string {
  return mkdtempSync(join(tmpdir(), 'ur-plain-'))
}

function gitDirectory(): string {
  const root = mkdtempSync(join(tmpdir(), 'ur-git-'))
  execFileSync('git', ['init', '--quiet'], { cwd: root })
  return root
}

describe('isGitRepository', () => {
  test('is false for a plain directory instead of throwing', async () => {
    expect(await isGitRepository(plainDirectory())).toBe(false)
  })

  test('is false for a path that does not exist', async () => {
    expect(await isGitRepository(join(tmpdir(), 'ur-definitely-absent-dir'))).toBe(false)
  })

  test('is true inside a git repository', async () => {
    expect(await isGitRepository(gitDirectory())).toBe(true)
  })

  test('is true in a subdirectory of a repository', async () => {
    const root = gitDirectory()
    const { mkdirSync } = await import('node:fs')
    const nested = join(root, 'a', 'b')
    mkdirSync(nested, { recursive: true })
    expect(await isGitRepository(nested)).toBe(true)
  })
})

describe('createIsolatedWorktree', () => {
  test('reports the real reason rather than leaking git stderr', async () => {
    // The old code surfaced `fatal: not a git repository (or any of the parent
    // directories): .git`, which described git's failure and not the app's.
    const attempt = createIsolatedWorktree(plainDirectory())
    await expect(attempt).rejects.toThrow('Worktree mode requires a git repository')
    await expect(attempt).rejects.not.toThrow(/fatal: not a git repository/)
  })
})

describe('plan execution', () => {
  test('derives worktree isolation from repository detection', () => {
    // Guards the call site itself: a hardcoded `useWorktree: true` here is what
    // broke plans in plain directories.
    const source = readFileSync(join(import.meta.dir, 'planning.ts'), 'utf8')
    expect(source).toContain('useWorktree: await isGitRepository(projectRoot)')
    expect(source).not.toContain('useWorktree: true')
  })
})
