import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execFileSync } from 'node:child_process'
import {
  createCheckpoint,
  listCheckpoints,
  previewRewind,
  rewindToCheckpoint,
  deleteCheckpoint,
  readRewindAudit,
} from './checkpoints.js'

let dataDir: string
let repo: string

beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-cp-data-'))
  repo = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-cp-repo-'))
  process.env.UR_DESKTOP_DATA_DIR = dataDir
  execFileSync('git', ['init', '-q'], { cwd: repo })
  fs.writeFileSync(path.join(repo, 'a.txt'), 'original A\n')
  fs.writeFileSync(path.join(repo, 'b.txt'), 'original B\n')
})

afterEach(() => {
  delete process.env.UR_DESKTOP_DATA_DIR
  fs.rmSync(dataDir, { recursive: true, force: true })
  fs.rmSync(repo, { recursive: true, force: true })
})

describe('checkpoints', () => {
  it('creates a checkpoint with metadata and git state', async () => {
    const checkpoint = await createCheckpoint({
      projectRoot: repo,
      reason: 'Before edit',
      trigger: 'before-edit',
      files: ['a.txt', 'missing.txt'],
      sessionId: 'session-1',
      taskId: 'task-1',
    })
    expect(checkpoint.id).toMatch(/^cp-/)
    expect(checkpoint.reason).toBe('Before edit')
    expect(checkpoint.sessionId).toBe('session-1')
    expect(checkpoint.gitBranch).toBeTruthy()
    const a = checkpoint.files.find(f => f.relPath === 'a.txt')
    expect(a?.existed).toBe(true)
    expect(a?.hash).toBeTruthy()
    const missing = checkpoint.files.find(f => f.relPath === 'missing.txt')
    expect(missing?.existed).toBe(false)
  })

  it('lists checkpoints newest first', async () => {
    await createCheckpoint({
      projectRoot: repo,
      reason: 'first',
      trigger: 'manual',
      files: ['a.txt'],
    })
    await new Promise(resolve => setTimeout(resolve, 5))
    await createCheckpoint({
      projectRoot: repo,
      reason: 'second',
      trigger: 'manual',
      files: ['a.txt'],
    })
    const list = await listCheckpoints(repo)
    expect(list.length).toBe(2)
    expect(list[0].reason).toBe('second')
  })

  it('previews exactly what a rewind would change', async () => {
    const checkpoint = await createCheckpoint({
      projectRoot: repo,
      reason: 'baseline',
      trigger: 'manual',
      files: ['a.txt', 'b.txt', 'created-later.txt'],
    })

    fs.writeFileSync(path.join(repo, 'a.txt'), 'modified A\n')
    fs.rmSync(path.join(repo, 'b.txt'))
    fs.writeFileSync(path.join(repo, 'created-later.txt'), 'new file\n')

    const preview = await previewRewind(repo, checkpoint.id)
    const byPath = new Map(preview.entries.map(e => [e.relPath, e.action]))
    expect(byPath.get('a.txt')).toBe('restore')
    expect(byPath.get('b.txt')).toBe('recreate')
    expect(byPath.get('created-later.txt')).toBe('delete')
    expect(preview.changes).toBe(3)
  })

  it('rewinds files, creates a safety checkpoint, and records an audit entry', async () => {
    const checkpoint = await createCheckpoint({
      projectRoot: repo,
      reason: 'baseline',
      trigger: 'manual',
      files: ['a.txt', 'created-later.txt'],
    })

    fs.writeFileSync(path.join(repo, 'a.txt'), 'modified A\n')
    fs.writeFileSync(path.join(repo, 'created-later.txt'), 'should be deleted\n')

    const result = await rewindToCheckpoint(repo, checkpoint.id)
    expect(fs.readFileSync(path.join(repo, 'a.txt'), 'utf-8')).toBe('original A\n')
    expect(fs.existsSync(path.join(repo, 'created-later.txt'))).toBe(false)
    expect(result.restored).toContain('a.txt')
    expect(result.deleted).toContain('created-later.txt')

    // Later history is preserved in the safety checkpoint, not destroyed.
    const list = await listCheckpoints(repo)
    const safety = list.find(c => c.id === result.safetyCheckpointId)
    expect(safety).toBeDefined()
    expect(safety!.trigger).toBe('before-rewind')
    expect(safety!.branchedFrom).toBe(checkpoint.id)

    // The pre-rewind state is recoverable by rewinding to the safety copy.
    await rewindToCheckpoint(repo, result.safetyCheckpointId)
    expect(fs.readFileSync(path.join(repo, 'a.txt'), 'utf-8')).toBe('modified A\n')
    expect(fs.readFileSync(path.join(repo, 'created-later.txt'), 'utf-8')).toBe(
      'should be deleted\n',
    )

    const audit = await readRewindAudit(repo)
    expect(audit.filter(e => e.action === 'rewind').length).toBe(2)
  })

  it('deletes checkpoints and audits the deletion', async () => {
    const checkpoint = await createCheckpoint({
      projectRoot: repo,
      reason: 'temp',
      trigger: 'manual',
      files: ['a.txt'],
    })
    expect(await deleteCheckpoint(repo, checkpoint.id)).toBe(true)
    expect(await deleteCheckpoint(repo, checkpoint.id)).toBe(false)
    expect((await listCheckpoints(repo)).length).toBe(0)
    const audit = await readRewindAudit(repo)
    expect(audit.some(e => e.action === 'delete-checkpoint')).toBe(true)
  })

  it('defaults to snapshotting git-dirty files when none are given', async () => {
    execFileSync('git', ['add', '.'], { cwd: repo })
    execFileSync('git', ['-c', 'user.email=t@e.st', '-c', 'user.name=T', 'commit', '-q', '-m', 'init'], { cwd: repo })
    fs.writeFileSync(path.join(repo, 'a.txt'), 'dirty change\n')
    const checkpoint = await createCheckpoint({
      projectRoot: repo,
      reason: 'auto',
      trigger: 'before-agent',
    })
    expect(checkpoint.files.map(f => f.relPath)).toEqual(['a.txt'])
  })
})
