import * as path from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import { execFile as execFileCallback } from 'node:child_process'
import {
  existsSync,
  lstatSync,
  realpathSync,
} from 'node:fs'
import { promises as fs } from 'node:fs'
import { promisify } from 'node:util'
import { getAppDataPath } from './utils/appDataPath.js'

const execFile = promisify(execFileCallback)

export interface Worktree {
  root: string
  branch: string
  isMain: boolean
  projectRoot?: string
}

const activeWorktrees = new Map<string, Worktree>()

export function getWorktree(runId: string): Worktree | undefined {
  return activeWorktrees.get(runId)
}

export function setWorktree(runId: string, worktree: Worktree): void {
  activeWorktrees.set(runId, worktree)
}

export function removeWorktreeRegistration(runId: string): void {
  activeWorktrees.delete(runId)
}

export function listWorktreesForProject(projectRoot: string): Worktree[] {
  const normalized = realpathSync(projectRoot)
  const result: Worktree[] = [{
    root: normalized,
    branch: 'main',
    isMain: true,
    projectRoot: normalized,
  }]
  for (const worktree of activeWorktrees.values()) {
    if (worktree.projectRoot === normalized) result.push({ ...worktree })
  }
  return result
}

function validateBranchName(branch: string): string {
  const value = branch.trim()
  if (
    value.length < 1 ||
    value.length > 120 ||
    !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/u.test(value) ||
    value.includes('..') ||
    value.includes('@{') ||
    value.endsWith('/') ||
    value.endsWith('.') ||
    value.endsWith('.lock') ||
    value.split('/').some(segment => !segment || segment === '.')
  ) {
    throw new Error(`Invalid git branch name: ${branch}`)
  }
  return value
}

async function git(
  projectRoot: string,
  args: string[],
): Promise<{ stdout: string; stderr: string }> {
  try {
    const result = await execFile('git', ['-C', projectRoot, ...args], {
      encoding: 'utf-8',
      maxBuffer: 64 * 1024 * 1024,
      env: {
        PATH: process.env.PATH,
        LANG: process.env.LANG ?? 'C',
        LC_ALL: 'C',
        GIT_TERMINAL_PROMPT: '0',
        GIT_CONFIG_NOSYSTEM: '1',
      },
    })
    return { stdout: result.stdout, stderr: result.stderr }
  } catch (error) {
    const detail = error as Error & { stderr?: string }
    throw new Error((detail.stderr || detail.message || 'git command failed').trim())
  }
}

async function copyDirtyState(
  projectRoot: string,
  worktreeRoot: string,
  worktreesDir: string,
): Promise<void> {
  const patch = (await git(projectRoot, [
    'diff',
    '--binary',
    '--no-ext-diff',
    'HEAD',
    '--',
  ])).stdout
  if (patch) {
    const patchPath = path.join(worktreesDir, `${randomUUID()}.patch`)
    await fs.writeFile(patchPath, patch, { encoding: 'utf-8', mode: 0o600 })
    try {
      await git(worktreeRoot, [
        'apply',
        '--binary',
        '--whitespace=nowarn',
        patchPath,
      ])
    } finally {
      await fs.rm(patchPath, { force: true })
    }
  }

  const untracked = (await git(projectRoot, [
    'ls-files',
    '--others',
    '--exclude-standard',
    '-z',
  ])).stdout.split('\0').filter(Boolean)
  for (const relative of untracked) {
    if (relative === '.ur' || relative.startsWith('.ur/')) continue
    const source = path.resolve(projectRoot, relative)
    const destination = path.resolve(worktreeRoot, relative)
    if (!isInside(projectRoot, source) || !isInside(worktreeRoot, destination)) {
      throw new Error(`Untracked path escapes the repository: ${relative}`)
    }
    const info = await fs.lstat(source)
    if (info.isSymbolicLink()) {
      throw new Error(
        `Cannot safely copy untracked symbolic link into worktree: ${relative}`,
      )
    }
    if (!info.isFile()) continue
    await fs.mkdir(path.dirname(destination), { recursive: true, mode: 0o700 })
    await fs.copyFile(source, destination)
    await fs.chmod(destination, info.mode)
  }
}

/**
 * Whether a directory is inside a git work tree.
 *
 * Non-throwing on purpose: "this is not a repository" is an ordinary answer,
 * not a failure. Letting git's own stderr escape here surfaced
 * `fatal: not a git repository` as a plan task error, which told the user
 * nothing about what the app had actually tried to do.
 */
export async function isGitRepository(projectRoot: string): Promise<boolean> {
  try {
    const root = await fs.realpath(path.resolve(projectRoot))
    const inside = await git(root, ['rev-parse', '--is-inside-work-tree'])
    return inside.stdout.trim() === 'true'
  } catch {
    return false
  }
}

export async function createIsolatedWorktree(
  projectRoot: string,
  branch?: string,
): Promise<Worktree> {
  const root = await fs.realpath(path.resolve(projectRoot))
  if (!(await isGitRepository(root))) {
    throw new Error('Worktree mode requires a git repository')
  }

  const safeBranch = validateBranchName(
    branch || `ur/${new Date().toISOString().slice(0, 10)}/${randomUUID().slice(0, 8)}`,
  )
  // Let Git apply its complete ref-name rules in addition to our path-safe
  // validation. Arguments are passed without a shell.
  await git(root, ['check-ref-format', '--branch', safeBranch])

  const projectKey = createHash('sha256').update(root).digest('hex').slice(0, 16)
  const worktreesDir = path.join(await getAppDataPath(), 'worktrees', projectKey)
  const worktreeRoot = path.join(worktreesDir, randomUUID())
  await fs.mkdir(worktreesDir, { recursive: true, mode: 0o700 })

  try {
    await git(root, [
      'worktree',
      'add',
      '--no-track',
      '-b',
      safeBranch,
      worktreeRoot,
      'HEAD',
    ])
  } catch (error) {
    await fs.rm(worktreeRoot, { recursive: true, force: true }).catch(() => undefined)
    throw error
  }

  const realWorktree = await fs.realpath(worktreeRoot)
  try {
    await copyDirtyState(root, realWorktree, worktreesDir)
  } catch (error) {
    await git(root, ['worktree', 'remove', '--force', realWorktree]).catch(() => undefined)
    await git(root, ['branch', '-D', safeBranch]).catch(() => undefined)
    throw error
  }
  const marker = {
    version: 1,
    parent: root,
    branch: safeBranch,
    worktreeRoot: realWorktree,
    createdAt: new Date().toISOString(),
  }
  await fs.writeFile(
    path.join(worktreesDir, `${path.basename(realWorktree)}.json`),
    `${JSON.stringify(marker, null, 2)}\n`,
    { encoding: 'utf-8', mode: 0o600 },
  )

  return {
    root: realWorktree,
    branch: safeBranch,
    isMain: false,
    projectRoot: root,
  }
}

function isInside(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate)
  return relative === '' || (
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  )
}

function nearestExisting(candidate: string): string {
  let current = candidate
  while (!existsSync(current)) {
    const parent = path.dirname(current)
    if (parent === current) break
    current = parent
  }
  return current
}

export function resolveWorktreePath(
  projectRoot: string,
  worktreeRoot: string | undefined,
  filePath: string,
): string {
  const baseInput = path.resolve(worktreeRoot ?? projectRoot)
  const base = realpathSync(baseInput)
  const joined = path.resolve(base, filePath)
  if (!isInside(base, joined)) {
    throw new Error(`Path escapes workspace: ${filePath}`)
  }

  // Lexical containment is insufficient when a project contains symlinks.
  // Resolve the target (or its closest existing ancestor for new files) and
  // require that real path to remain under the selected workspace.
  const existing = nearestExisting(joined)
  if (lstatSync(existing).isSymbolicLink()) {
    throw new Error(`Path traverses a symbolic link: ${filePath}`)
  }
  const realExisting = realpathSync(existing)
  if (!isInside(base, realExisting)) {
    throw new Error(`Path resolves outside workspace: ${filePath}`)
  }
  return joined
}
