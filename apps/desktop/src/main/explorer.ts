import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import type { ExplorerEntryDto, GitFileStatusDto } from '../shared/ipc.js'

const execFileAsync = promisify(execFile)

const ALWAYS_HIDDEN = new Set(['.git', '.DS_Store'])

function resolveInsideProject(projectRoot: string, relPath: string): string {
  const abs = path.resolve(projectRoot, relPath)
  const rel = path.relative(path.resolve(projectRoot), abs)
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`Path escapes the project root: ${relPath}`)
  }
  return abs
}

async function git(
  projectRoot: string,
  args: string[],
): Promise<{ stdout: string; ok: boolean }> {
  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd: projectRoot,
      maxBuffer: 10 * 1024 * 1024,
    })
    return { stdout, ok: true }
  } catch (err) {
    // git check-ignore exits 1 when nothing matches; treat as valid empty output.
    const e = err as { code?: number; stdout?: string }
    if (typeof e.code === 'number' && e.code === 1) {
      return { stdout: e.stdout ?? '', ok: true }
    }
    return { stdout: '', ok: false }
  }
}

function parsePorcelainStatus(stdout: string): Map<string, GitFileStatusDto> {
  const map = new Map<string, GitFileStatusDto>()
  for (const line of stdout.split('\n')) {
    if (!line.trim()) continue
    const x = line[0]
    const y = line[1]
    let rest = line.slice(3)
    // Renames are formatted "R  old -> new"; report the new path.
    if (rest.includes(' -> ')) rest = rest.split(' -> ')[1]
    const relPath = rest.replace(/^"|"$/g, '')
    let status: GitFileStatusDto['status']
    if (x === '?' || y === '?') status = 'untracked'
    else if (x === 'A' || y === 'A') status = 'added'
    else if (x === 'D' || y === 'D') status = 'deleted'
    else if (x === 'R' || y === 'R') status = 'renamed'
    else status = 'modified'
    map.set(relPath, { relPath, status, staged: x !== ' ' && x !== '?' })
  }
  return map
}

export async function gitStatus(projectRoot: string): Promise<GitFileStatusDto[]> {
  const { stdout, ok } = await git(projectRoot, ['status', '--porcelain'])
  if (!ok) return []
  return [...parsePorcelainStatus(stdout).values()]
}

export async function gitDiff(
  projectRoot: string,
  relPath?: string,
): Promise<string> {
  const args = ['diff', '--no-color']
  if (relPath) {
    resolveInsideProject(projectRoot, relPath)
    args.push('--', relPath)
  }
  const { stdout, ok } = await git(projectRoot, args)
  if (!ok) throw new Error('git diff failed — is this a git repository?')
  // Untracked files have no diff; synthesize one so review shows content.
  if (relPath && !stdout.trim()) {
    const status = await gitStatus(projectRoot)
    const entry = status.find(s => s.relPath === relPath)
    if (entry?.status === 'untracked') {
      const abs = resolveInsideProject(projectRoot, relPath)
      const content = await fs.readFile(abs, 'utf-8').catch(() => null)
      if (content !== null) {
        const lines = content.split('\n')
        return [
          `--- /dev/null`,
          `+++ b/${relPath}`,
          `@@ -0,0 +1,${lines.length} @@`,
          ...lines.map(l => `+${l}`),
          '',
        ].join('\n')
      }
    }
  }
  return stdout
}

export async function gitRevertFile(
  projectRoot: string,
  relPath: string,
): Promise<void> {
  resolveInsideProject(projectRoot, relPath)
  const status = await gitStatus(projectRoot)
  const entry = status.find(s => s.relPath === relPath)
  if (!entry) {
    throw new Error(`No pending change for ${relPath}`)
  }
  if (entry.status === 'untracked') {
    await fs.rm(resolveInsideProject(projectRoot, relPath), { force: true })
    return
  }
  const { ok } = await git(projectRoot, ['checkout', '--', relPath])
  if (!ok) throw new Error(`git checkout failed for ${relPath}`)
}

async function ignoredSet(
  projectRoot: string,
  relPaths: string[],
): Promise<Set<string>> {
  if (relPaths.length === 0) return new Set()
  const { spawn } = await import('node:child_process')
  return new Promise(resolve => {
    const child = spawn('git', ['check-ignore', '--stdin'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'ignore'],
    })
    let stdout = ''
    child.stdout.on('data', chunk => {
      stdout += String(chunk)
    })
    // Exit code 1 means "nothing ignored"; any failure degrades to none.
    child.on('close', () => {
      resolve(new Set(stdout.split('\n').filter(Boolean)))
    })
    child.on('error', () => resolve(new Set()))
    child.stdin.write(relPaths.join('\n'))
    child.stdin.end()
  })
}

export async function listExplorerEntries(
  projectRoot: string,
  relPath = '',
  showIgnored = false,
): Promise<ExplorerEntryDto[]> {
  const absDir = resolveInsideProject(projectRoot, relPath || '.')
  const dirents = await fs.readdir(absDir, { withFileTypes: true })
  const visible = dirents.filter(d => !ALWAYS_HIDDEN.has(d.name))

  const rels = visible.map(d =>
    relPath ? path.join(relPath, d.name) : d.name,
  )
  const [ignored, statusMap] = await Promise.all([
    ignoredSet(projectRoot, rels),
    git(projectRoot, ['status', '--porcelain']).then(r =>
      parsePorcelainStatus(r.stdout),
    ),
  ])

  const entries: ExplorerEntryDto[] = []
  for (let i = 0; i < visible.length; i++) {
    const dirent = visible[i]
    const rel = rels[i]
    const isIgnored = ignored.has(rel)
    if (isIgnored && !showIgnored) continue
    const isDir = dirent.isDirectory()
    let sizeBytes: number | undefined
    if (!isDir) {
      sizeBytes = await fs
        .stat(path.join(absDir, dirent.name))
        .then(s => s.size)
        .catch(() => undefined)
    }
    // A directory is "modified" when any pending change lives under it.
    let gitFileStatus = statusMap.get(rel)?.status
    if (isDir && !gitFileStatus) {
      const prefix = `${rel}/`
      for (const key of statusMap.keys()) {
        if (key.startsWith(prefix)) {
          gitFileStatus = 'modified'
          break
        }
      }
    }
    entries.push({
      name: dirent.name,
      relPath: rel,
      type: isDir ? 'directory' : 'file',
      sizeBytes,
      gitStatus: gitFileStatus,
      ignored: isIgnored || undefined,
      hasChildren: isDir ? true : undefined,
    })
  }

  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  return entries
}

export async function createExplorerEntry(
  projectRoot: string,
  relPath: string,
  kind: 'file' | 'directory',
): Promise<void> {
  const abs = resolveInsideProject(projectRoot, relPath)
  if (kind === 'directory') {
    await fs.mkdir(abs, { recursive: true })
    return
  }
  await fs.mkdir(path.dirname(abs), { recursive: true })
  await fs.writeFile(abs, '', { flag: 'wx' })
}

export async function renameExplorerEntry(
  projectRoot: string,
  relPath: string,
  newRelPath: string,
): Promise<void> {
  const from = resolveInsideProject(projectRoot, relPath)
  const to = resolveInsideProject(projectRoot, newRelPath)
  await fs.mkdir(path.dirname(to), { recursive: true })
  await fs.rename(from, to)
}

export async function deleteExplorerEntry(
  projectRoot: string,
  relPath: string,
): Promise<void> {
  const abs = resolveInsideProject(projectRoot, relPath)
  await fs.rm(abs, { recursive: true, force: false })
}
