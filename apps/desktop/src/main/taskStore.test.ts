import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdtempSync, writeFileSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  clearPersistedTasks,
  listPersistedTasks,
  pruneTasks,
  resetTaskStoreCache,
  saveTasks,
  toPersistedTask,
} from './taskStore.js'
import type { Task } from './taskAgentRegistry.js'

const PROJECT = '/tmp/project-a'
let dataDir: string

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), 'ur-task-store-'))
  process.env.UR_DESKTOP_DATA_DIR = dataDir
  resetTaskStoreCache()
})

afterEach(() => {
  delete process.env.UR_DESKTOP_DATA_DIR
  resetTaskStoreCache()
})

function task(overrides: Partial<Task> = {}): Task {
  return {
    index: 0,
    id: 'task-1',
    title: 'Do the thing',
    status: 'done',
    dependencies: [],
    changedFiles: new Set(['src/a.ts']),
    elapsedMs: 10,
    runId: 'run-1',
    projectRoot: PROJECT,
    ...overrides,
  } as Task
}

describe('toPersistedTask', () => {
  test('converts the changedFiles Set to an array', () => {
    expect(toPersistedTask(task()).changedFiles).toEqual(['src/a.ts'])
  })

  test('carries the verification verdict through', () => {
    const verification = { passed: true, level: 'l2' as const, outcome: 'verified' as const }
    expect(toPersistedTask(task({ verification })).verification).toEqual(verification)
  })
})

describe('saveTasks', () => {
  test('persists a task and reads it back', async () => {
    await saveTasks([task()])
    const [stored] = await listPersistedTasks(PROJECT)
    expect(stored).toMatchObject({ id: 'task-1', runId: 'run-1', status: 'done' })
  })

  test('replaces rather than duplicates on the same runId and id', async () => {
    await saveTasks([task({ status: 'running' })])
    await saveTasks([task({ status: 'done' })])
    const stored = await listPersistedTasks(PROJECT)
    expect(stored).toHaveLength(1)
    expect(stored[0]?.status).toBe('done')
  })

  test('keeps same-id tasks from different runs apart', async () => {
    await saveTasks([task({ runId: 'run-1' }), task({ runId: 'run-2' })])
    expect(await listPersistedTasks(PROJECT)).toHaveLength(2)
  })

  test('ignores an empty batch', async () => {
    await saveTasks([])
    expect(await listPersistedTasks()).toEqual([])
  })

  test('scopes listing by project', async () => {
    await saveTasks([task(), task({ id: 'task-2', projectRoot: '/tmp/other' })])
    expect(await listPersistedTasks(PROJECT)).toHaveLength(1)
    expect(await listPersistedTasks()).toHaveLength(2)
  })
})

describe('restart reconciliation', () => {
  test('a task left running is reported interrupted, not running', async () => {
    await saveTasks([task({ status: 'running' })])
    resetTaskStoreCache()
    expect((await listPersistedTasks(PROJECT))[0]?.status).toBe('interrupted')
  })

  test('a task left waiting for approval is also interrupted', async () => {
    await saveTasks([task({ status: 'waiting_approval' })])
    resetTaskStoreCache()
    expect((await listPersistedTasks(PROJECT))[0]?.status).toBe('interrupted')
  })

  test('terminal statuses are preserved verbatim', async () => {
    await saveTasks([task({ id: 'a', status: 'done' }), task({ id: 'b', status: 'failed' })])
    resetTaskStoreCache()
    const byId = new Map((await listPersistedTasks(PROJECT)).map(t => [t.id, t.status]))
    expect(byId.get('a')).toBe('done')
    expect(byId.get('b')).toBe('failed')
  })
})

describe('maintenance', () => {
  test('pruneTasks drops records past the retention window', async () => {
    await saveTasks([task()])
    const removed = await pruneTasks(1000, Date.now() + 5000)
    expect(removed).toBe(1)
    expect(await listPersistedTasks()).toEqual([])
  })

  test('pruneTasks keeps records inside the window', async () => {
    await saveTasks([task()])
    expect(await pruneTasks(60_000)).toBe(0)
    expect(await listPersistedTasks()).toHaveLength(1)
  })

  test('clearPersistedTasks can target a single run', async () => {
    await saveTasks([task({ runId: 'run-1' }), task({ runId: 'run-2' })])
    await clearPersistedTasks('run-1')
    expect((await listPersistedTasks()).map(t => t.runId)).toEqual(['run-2'])
  })

  test('clearPersistedTasks with no argument empties the store', async () => {
    await saveTasks([task()])
    await clearPersistedTasks()
    expect(await listPersistedTasks()).toEqual([])
  })

  test('a corrupt store is quarantined instead of crashing', async () => {
    await saveTasks([task()])
    resetTaskStoreCache()
    writeFileSync(join(dataDir, 'tasks.json'), 'not json at all')
    expect(await listPersistedTasks()).toEqual([])
    expect(readdirSync(dataDir).some(name => name.startsWith('tasks.corrupt-'))).toBe(true)
  })
})
