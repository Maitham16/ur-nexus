import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import { createHash, randomUUID } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { getAppDataPath } from './utils/appDataPath.js'
import type {
  CheckpointDto,
  CheckpointFileDto,
  CheckpointTrigger,
  RewindPreviewDto,
  RewindPreviewEntryDto,
} from '../shared/ipc.js'

const execFileAsync = promisify(execFile)

function hashOf(content: Buffer | string): string {
  return createHash('sha256').update(content).digest('hex')
}

function projectKey(projectRoot: string): string {
  return hashOf(path.resolve(projectRoot)).slice(0, 16)
}

async function checkpointRoot(projectRoot: string): Promise<string> {
  const base = await getAppDataPath()
  return path.join(base, 'checkpoints', projectKey(projectRoot))
}

/** Encode a relative path into a flat, filesystem-safe blob name. */
function blobName(relPath: string): string {
  return `${hashOf(relPath).slice(0, 12)}-${path.basename(relPath)}`
}

async function gitInfo(
  projectRoot: string,
): Promise<{ head?: string; branch?: string }> {
  const result: { head?: string; branch?: string } = {}
  try {
    const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], {
      cwd: projectRoot,
    })
    result.head = stdout.trim()
  } catch {
    // Repo without commits has no HEAD yet.
  }
  try {
    // symbolic-ref resolves the branch name even before the first commit.
    const { stdout } = await execFileAsync(
      'git',
      ['symbolic-ref', '--short', 'HEAD'],
      { cwd: projectRoot },
    )
    result.branch = stdout.trim()
  } catch {
    // Detached HEAD or not a git repo.
  }
  return result
}

async function gitDirtyFiles(projectRoot: string): Promise<string[]> {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['status', '--porcelain'],
      { cwd: projectRoot },
    )
    return stdout
      .split('\n')
      .filter(Boolean)
      .map(line => {
        let rest = line.slice(3)
        if (rest.includes(' -> ')) rest = rest.split(' -> ')[1]
        return rest.replace(/^"|"$/g, '')
      })
  } catch {
    return []
  }
}

export interface CreateCheckpointOptions {
  projectRoot: string
  reason: string
  trigger: CheckpointTrigger
  /** Relative file paths to snapshot. Defaults to the git-dirty set. */
  files?: string[]
  sessionId?: string
  taskId?: string
  /** Set on automatic safety checkpoints taken right before a rewind. */
  branchedFrom?: string
}

export async function createCheckpoint(
  options: CreateCheckpointOptions,
): Promise<CheckpointDto> {
  const projectRoot = path.resolve(options.projectRoot)
  const files =
    options.files && options.files.length > 0
      ? [...new Set(options.files)]
      : await gitDirtyFiles(projectRoot)

  const id = `cp-${Date.now()}-${randomUUID().slice(0, 6)}`
  const root = await checkpointRoot(projectRoot)
  const dir = path.join(root, id)
  const blobsDir = path.join(dir, 'files')
  await fs.mkdir(blobsDir, { recursive: true })

  const fileEntries: CheckpointFileDto[] = []
  for (const relPath of files) {
    const rel = relPath.replace(/^\.\//, '')
    const absPath = path.resolve(projectRoot, rel)
    if (!absPath.startsWith(projectRoot)) continue
    let content: Buffer | null = null
    try {
      content = await fs.readFile(absPath)
    } catch {
      content = null
    }
    if (content !== null) {
      await fs.writeFile(path.join(blobsDir, blobName(rel)), content)
    }
    fileEntries.push({
      relPath: rel,
      existed: content !== null,
      hash: content !== null ? hashOf(content) : undefined,
      sizeBytes: content?.length,
    })
  }

  const git = await gitInfo(projectRoot)
  const checkpoint: CheckpointDto = {
    id,
    projectRoot,
    createdAt: new Date().toISOString(),
    reason: options.reason,
    trigger: options.trigger,
    sessionId: options.sessionId,
    taskId: options.taskId,
    files: fileEntries,
    gitHead: git.head,
    gitBranch: git.branch,
    branchedFrom: options.branchedFrom,
  }
  await fs.writeFile(
    path.join(dir, 'metadata.json'),
    JSON.stringify(checkpoint, null, 2),
    'utf-8',
  )
  return checkpoint
}

export async function listCheckpoints(projectRoot: string): Promise<CheckpointDto[]> {
  const root = await checkpointRoot(projectRoot)
  let entries: string[]
  try {
    entries = await fs.readdir(root)
  } catch {
    return []
  }
  const checkpoints: CheckpointDto[] = []
  for (const entry of entries) {
    try {
      const metadata = JSON.parse(
        await fs.readFile(path.join(root, entry, 'metadata.json'), 'utf-8'),
      ) as CheckpointDto
      checkpoints.push(metadata)
    } catch {
      // Skip corrupt/partial checkpoint directories.
    }
  }
  return checkpoints.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

async function loadCheckpoint(
  projectRoot: string,
  checkpointId: string,
): Promise<{ checkpoint: CheckpointDto; dir: string }> {
  const root = await checkpointRoot(projectRoot)
  const dir = path.join(root, checkpointId)
  const checkpoint = JSON.parse(
    await fs.readFile(path.join(dir, 'metadata.json'), 'utf-8'),
  ) as CheckpointDto
  return { checkpoint, dir }
}

/** Compute what a rewind would change, without touching anything. */
export async function previewRewind(
  projectRoot: string,
  checkpointId: string,
): Promise<RewindPreviewDto> {
  const resolvedRoot = path.resolve(projectRoot)
  const { checkpoint } = await loadCheckpoint(resolvedRoot, checkpointId)
  const entries: RewindPreviewEntryDto[] = []
  for (const file of checkpoint.files) {
    const absPath = path.join(resolvedRoot, file.relPath)
    let current: Buffer | null = null
    try {
      current = await fs.readFile(absPath)
    } catch {
      current = null
    }
    let action: RewindPreviewEntryDto['action']
    if (file.existed && current === null) action = 'recreate'
    else if (file.existed && current !== null) {
      action = hashOf(current) === file.hash ? 'unchanged' : 'restore'
    } else if (!file.existed && current !== null) action = 'delete'
    else action = 'unchanged'
    entries.push({ relPath: file.relPath, action })
  }
  return {
    checkpointId,
    createdAt: checkpoint.createdAt,
    reason: checkpoint.reason,
    entries,
    changes: entries.filter(e => e.action !== 'unchanged').length,
  }
}

async function appendAudit(
  projectRoot: string,
  entry: Record<string, unknown>,
): Promise<void> {
  const root = await checkpointRoot(projectRoot)
  await fs.mkdir(root, { recursive: true })
  await fs.appendFile(
    path.join(root, 'audit.jsonl'),
    `${JSON.stringify({ timestamp: new Date().toISOString(), ...entry })}\n`,
    'utf-8',
  )
}

export async function readRewindAudit(
  projectRoot: string,
): Promise<Record<string, unknown>[]> {
  const root = await checkpointRoot(projectRoot)
  try {
    const raw = await fs.readFile(path.join(root, 'audit.jsonl'), 'utf-8')
    return raw
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line) as Record<string, unknown>)
  } catch {
    return []
  }
}

/**
 * Rewind the recorded files to their checkpoint state. Later history is
 * never silently destroyed: a safety checkpoint of the current state is
 * taken first and linked in the audit log, marking the branched timeline.
 */
export async function rewindToCheckpoint(
  projectRoot: string,
  checkpointId: string,
): Promise<{ restored: string[]; deleted: string[]; safetyCheckpointId: string }> {
  const resolvedRoot = path.resolve(projectRoot)
  const { checkpoint, dir } = await loadCheckpoint(resolvedRoot, checkpointId)

  const safety = await createCheckpoint({
    projectRoot: resolvedRoot,
    reason: `State before rewinding to ${checkpointId}`,
    trigger: 'before-rewind',
    files: checkpoint.files.map(f => f.relPath),
    branchedFrom: checkpointId,
  })

  const restored: string[] = []
  const deleted: string[] = []
  for (const file of checkpoint.files) {
    const absPath = path.join(resolvedRoot, file.relPath)
    if (file.existed) {
      const blob = await fs.readFile(path.join(dir, 'files', blobName(file.relPath)))
      const current = await fs.readFile(absPath).catch(() => null)
      if (current === null || hashOf(current) !== file.hash) {
        await fs.mkdir(path.dirname(absPath), { recursive: true })
        await fs.writeFile(absPath, blob)
        restored.push(file.relPath)
      }
    } else {
      const exists = await fs
        .stat(absPath)
        .then(() => true)
        .catch(() => false)
      if (exists) {
        await fs.rm(absPath, { force: true })
        deleted.push(file.relPath)
      }
    }
  }

  await appendAudit(resolvedRoot, {
    action: 'rewind',
    checkpointId,
    safetyCheckpointId: safety.id,
    restored,
    deleted,
  })
  return { restored, deleted, safetyCheckpointId: safety.id }
}

export async function deleteCheckpoint(
  projectRoot: string,
  checkpointId: string,
): Promise<boolean> {
  const root = await checkpointRoot(path.resolve(projectRoot))
  const dir = path.join(root, checkpointId)
  try {
    await fs.rm(dir, { recursive: true })
    await appendAudit(path.resolve(projectRoot), {
      action: 'delete-checkpoint',
      checkpointId,
    })
    return true
  } catch {
    return false
  }
}
