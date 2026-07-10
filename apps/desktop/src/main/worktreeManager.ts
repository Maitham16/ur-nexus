import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'

export interface Worktree {
  root: string
  branch: string
  isMain: boolean
}

const activeWorktrees = new Map<string, Worktree>()

export function getWorktree(runId: string): Worktree | undefined {
  return activeWorktrees.get(runId)
}

export function setWorktree(runId: string, worktree: Worktree): void {
  activeWorktrees.set(runId, worktree)
}

export function listWorktreesForProject(projectRoot: string): Worktree[] {
  const result: Worktree[] = [{ root: projectRoot, branch: 'main', isMain: true }]
  for (const wt of activeWorktrees.values()) {
    if (wt.root.startsWith(projectRoot) || path.dirname(wt.root) === projectRoot) {
      result.push(wt)
    }
  }
  return result
}

export async function createIsolatedWorktree(
  projectRoot: string,
  branch?: string,
): Promise<Worktree> {
  const isGit = await hasGit(projectRoot)
  if (!isGit) {
    throw new Error('Worktree mode requires a git repository')
  }

  const safeBranch = (branch || `ur-${randomUUID().slice(0, 8)}`).replace(/\s+/g, '-')
  const worktreesDir = path.join(projectRoot, '.ur', 'worktrees')
  const worktreeRoot = path.join(worktreesDir, safeBranch)

  await fs.mkdir(worktreesDir, { recursive: true })

  // Phase 4: clone the project into a sibling directory instead of invoking git
  // worktree, which requires git CLI and may fail on nested repos. This gives
  // us an isolated copy for the agent to edit without touching the main tree.
  await copyDirectory(projectRoot, worktreeRoot, ['.git', '.ur', 'node_modules'])

  // Write a marker so we know this is an isolated worktree.
  await fs.writeFile(
    path.join(worktreeRoot, '.ur-worktree.json'),
    JSON.stringify({ parent: projectRoot, branch: safeBranch, createdAt: Date.now() }),
    'utf-8',
  )

  return { root: worktreeRoot, branch: safeBranch, isMain: false }
}

async function hasGit(root: string): Promise<boolean> {
  try {
    await fs.access(path.join(root, '.git'))
    return true
  } catch {
    return false
  }
}

async function copyDirectory(
  src: string,
  dest: string,
  exclude: string[],
): Promise<void> {
  await fs.mkdir(dest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })
  for (const entry of entries) {
    if (exclude.includes(entry.name)) continue
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath, exclude)
    } else {
      await fs.copyFile(srcPath, destPath)
    }
  }
}

export function resolveWorktreePath(
  projectRoot: string,
  worktreeRoot: string | undefined,
  filePath: string,
): string {
  const base = worktreeRoot ?? projectRoot
  const joined = path.resolve(base, filePath)
  const relative = path.relative(base, joined)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path escapes workspace: ${filePath}`)
  }
  return joined
}
