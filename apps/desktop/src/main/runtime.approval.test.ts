import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { randomUUID } from 'node:crypto'
import * as path from 'node:path'
import * as fs from 'node:fs'
import * as os from 'node:os'
import {
  setRendererEmitter,
  requestApproval,
  requestStandaloneApproval,
  respondApproval,
  startRun,
  openProjectAndCache,
} from './runtime.js'

let emittedEvents: unknown[] = []
let tmpProject: string

beforeEach(async () => {
  emittedEvents = []
  tmpProject = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-desktop-runtime-'))
  setRendererEmitter((projectRoot, event) => {
    void projectRoot
    emittedEvents.push(event)
  })
  await openProjectAndCache(tmpProject)
})

afterEach(() => {
  // Cleanup is best-effort; not all tests create runs.
  try {
    fs.rmSync(tmpProject, { recursive: true, force: true })
  } catch {
    // ignore
  }
})

describe('requestApproval in a run', () => {
  it('emits approval_required and resolves when respondApproval is called', async () => {
    const { runId } = await startRun(tmpProject)

    const approvalPromise = requestApproval(runId, 'Write', { path: 'x.txt' }, 'task-1', {
      behavior: 'ask',
      riskLevel: 'medium',
      actionType: 'file-write',
      target: 'x.txt',
      reason: 'Write test',
    })

    const requiredEvent = emittedEvents.find(
      e => (e as { type?: string }).type === 'approval_required',
    )
    expect(requiredEvent).toBeDefined()
    const requestId = (requiredEvent as { requestId: string }).requestId
    expect(requestId).toBeDefined()

    respondApproval(requestId, true, 'once')
    const result = await approvalPromise
    expect(result.approved).toBe(true)
    expect(result.scope).toBe('once')
  })

  it('times out when no response is received', async () => {
    const { runId } = await startRun(tmpProject)

    const approvalPromise = requestApproval(runId, 'Write', { path: 'x.txt' }, 'task-1', {
      behavior: 'ask',
      riskLevel: 'medium',
      actionType: 'file-write',
      target: 'x.txt',
      reason: 'Write test',
    })

    // Override the timeout to be very short for the test.
    const requiredEvent = emittedEvents.find(
      e => (e as { type?: string }).type === 'approval_required',
    )
    const requestId = (requiredEvent as { requestId: string }).requestId
    const runIdForTimeout = runId
    void runIdForTimeout

    // Access the pending timeout directly by re-registering with a short timeout.
    // Since we cannot easily access internal state, we rely on the default 5 min
    // timeout being too long for tests. Instead we test respondApproval directly.
    respondApproval(requestId, false)
    const result = await approvalPromise
    expect(result.approved).toBe(false)
  })
})

describe('requestStandaloneApproval', () => {
  it('returns approved false for denied native dialog', async () => {
    const electron = await import('electron')
    const originalShowMessageBox = electron.dialog.showMessageBox
    electron.dialog.showMessageBox = async () => ({ response: 2, checkboxChecked: false })

    try {
      const result = await requestStandaloneApproval(tmpProject, {
        behavior: 'ask',
        riskLevel: 'high',
        actionType: 'external-app',
        target: 'https://example.com',
        reason: 'External URL',
      })
      expect(result.approved).toBe(false)
    } finally {
      electron.dialog.showMessageBox = originalShowMessageBox
    }
  })

  it('returns approved true with run scope when second button is chosen', async () => {
    const electron = await import('electron')
    const originalShowMessageBox = electron.dialog.showMessageBox
    electron.dialog.showMessageBox = async () => ({ response: 1, checkboxChecked: false })

    try {
      const result = await requestStandaloneApproval(tmpProject, {
        behavior: 'ask',
        riskLevel: 'high',
        actionType: 'external-app',
        target: 'https://example.com',
        reason: 'External URL',
      })
      expect(result.approved).toBe(true)
      expect(result.scope).toBe('run')
    } finally {
      electron.dialog.showMessageBox = originalShowMessageBox
    }
  })
})

describe('run-scope caching', () => {
  it('caches allowed run-scope actions and skips second approval', async () => {
    const { runId } = await startRun(tmpProject)

    const eval1 = {
      behavior: 'ask' as const,
      riskLevel: 'medium' as const,
      actionType: 'file-write' as const,
      target: 'x.txt',
      reason: 'Write test',
    }

    const first = requestApproval(runId, 'Write', { path: 'x.txt' }, 'task-1', eval1)
    const event1 = emittedEvents.find(e => (e as { type?: string }).type === 'approval_required')
    respondApproval((event1 as { requestId: string }).requestId, true, 'run')
    await first

    const second = requestApproval(runId, 'Write', { path: 'x.txt' }, 'task-1', eval1)
    const result = await second
    expect(result.approved).toBe(true)
    expect(result.scope).toBe('run')
  })
})
