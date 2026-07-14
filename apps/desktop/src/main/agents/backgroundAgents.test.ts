import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {
  launchBackgroundAgent,
  listBackgroundAgents,
  getBackgroundAgent,
  cancelBackgroundAgent,
  retryBackgroundAgent,
  removeBackgroundAgent,
  reconcileBackgroundAgents,
  flushBackgroundAgentStore,
  resetBackgroundAgentsForTests,
} from './backgroundAgents.js'
import { setRendererEmitter, respondApproval } from '../runtime.js'

let dataDir: string
let projectDir: string

const waitFor = async (
  predicate: () => Promise<boolean> | boolean,
  timeoutMs = 90000,
): Promise<void> => {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await predicate()) return
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  const snapshot = await listBackgroundAgents()
  throw new Error(
    `waitFor timed out; agents: ${snapshot.map(a => `${a.id}=${a.status}${a.error ? `(${a.error.slice(0, 60)})` : ''}`).join(', ')}`,
  )
}

beforeEach(async () => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-bg-data-'))
  projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-bg-project-'))
  process.env.UR_DESKTOP_DATA_DIR = dataDir
  process.env.UR_CONFIG_DIR = path.join(dataDir, 'runtime')
  await resetBackgroundAgentsForTests()
  // Auto-approve any approval request, as a user clicking "Allow" would.
  setRendererEmitter((_root, event) => {
    const e = event as { type?: string; requestId?: string }
    if (e.type === 'approval_required' && e.requestId) {
      setImmediate(() => respondApproval(e.requestId!, true, 'run'))
    }
  })
})

afterEach(async () => {
  await resetBackgroundAgentsForTests()
  await flushBackgroundAgentStore().catch(() => undefined)
  delete process.env.UR_DESKTOP_DATA_DIR
  delete process.env.UR_CONFIG_DIR
  fs.rmSync(dataDir, { recursive: true, force: true })
  fs.rmSync(projectDir, { recursive: true, force: true })
})

// Drive a launched agent to a genuine terminal state without depending on
// cloud-model completion latency: wait until it is actually running (a real
// runtime session, real run id), then cancel via the real stopRun path.
// Natural end-to-end completion is covered by resume.test.ts and the
// standalone liverun/cwd checks.
async function driveToTerminal(agentId: string): Promise<void> {
  await waitFor(async () => {
    const current = await getBackgroundAgent(agentId)
    return current !== null && current.status === 'running' && !!current.runId
  })
  await cancelBackgroundAgent(agentId).catch(() => undefined)
  await waitFor(async () => {
    const current = await getBackgroundAgent(agentId)
    return (
      current !== null &&
      current.status !== 'queued' &&
      current.status !== 'running'
    )
  })
}

describe('background agents', () => {
  it('launches a real run and settles with a genuine terminal status', async () => {
    const agent = await launchBackgroundAgent({
      projectRoot: projectDir,
      prompt: 'Reply with the word ok. Do not use any tools.',
    })
    expect(['queued', 'running']).toContain(agent.status)
    expect(agent.id).toMatch(/^bg-/)

    // The agent executes a real runtime session with a real run id; cancel it
    // to reach a deterministic terminal status rather than waiting on the
    // model. The status is a genuine one, never fabricated success.
    await driveToTerminal(agent.id)
    const settled = await getBackgroundAgent(agent.id)
    expect(settled).not.toBeNull()
    expect(['done', 'failed', 'cancelled']).toContain(settled!.status)
    expect(settled!.runId).toBeTruthy()
    expect(settled!.logs.length).toBeGreaterThan(0)
  }, 90000)

  it('persists records and marks active agents interrupted after restart', async () => {
    const agent = await launchBackgroundAgent({
      projectRoot: projectDir,
      prompt: 'Reply with the word ok. Do not use any tools.',
    })
    await flushBackgroundAgentStore()

    // Simulate an app restart while the agent claims to be active: reset
    // memory, rewrite the stored status to running, reload, reconcile.
    await waitFor(async () => (await getBackgroundAgent(agent.id)) !== null)
    await flushBackgroundAgentStore()
    await resetBackgroundAgentsForTests()
    const storeFile = path.join(dataDir, 'background-agents.json')
    const stored = JSON.parse(fs.readFileSync(storeFile, 'utf-8')) as {
      agents: Array<{ id: string; status: string }>
    }
    stored.agents.find(a => a.id === agent.id)!.status = 'running'
    fs.writeFileSync(storeFile, JSON.stringify(stored))

    const reconciled = await reconcileBackgroundAgents()
    expect(reconciled).toBe(1)
    const restored = await getBackgroundAgent(agent.id)
    expect(restored!.status).toBe('interrupted')
    expect(restored!.error).toContain('no longer exists')
  }, 150000)

  it('cancels a queued agent and supports retry with lineage', async () => {
    // Fill the queue so the second agent stays queued long enough to cancel.
    const first = await launchBackgroundAgent({
      projectRoot: projectDir,
      prompt: 'Reply with the word one. Do not use any tools.',
    })
    const second = await launchBackgroundAgent({
      projectRoot: projectDir,
      prompt: 'Reply with the word two. Do not use any tools.',
    })

    const target = (await getBackgroundAgent(second.id))!
    if (target.status === 'queued') {
      await cancelBackgroundAgent(second.id)
      const cancelled = await getBackgroundAgent(second.id)
      expect(cancelled!.status).toBe('cancelled')
    }

    // Drive the first agent to terminal, then retry it (lineage preserved).
    await driveToTerminal(first.id)
    const retried = await retryBackgroundAgent(first.id)
    expect(retried.retryOf).toBe(first.id)
    expect(retried.prompt).toBe('Reply with the word one. Do not use any tools.')
    await driveToTerminal(retried.id)
  }, 120000)

  it('refuses to remove active agents and removes settled ones', async () => {
    const agent = await launchBackgroundAgent({
      projectRoot: projectDir,
      prompt: 'Reply with the word ok. Do not use any tools.',
    })
    // Removing an active agent is refused.
    await waitFor(async () => {
      const current = await getBackgroundAgent(agent.id)
      return current !== null && current.status === 'running'
    })
    await expect(removeBackgroundAgent(agent.id)).rejects.toThrow(/Cancel the agent/)

    await driveToTerminal(agent.id)
    expect(await removeBackgroundAgent(agent.id)).toBe(true)
    expect(await getBackgroundAgent(agent.id)).toBeNull()
    expect(await removeBackgroundAgent(agent.id)).toBe(false)
  }, 90000)

  it('filters listings by project', async () => {
    const otherProject = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-bg-other-'))
    try {
      const a = await launchBackgroundAgent({ projectRoot: projectDir, prompt: 'Reply with the word ok. Do not use tools.' })
      const b = await launchBackgroundAgent({ projectRoot: otherProject, prompt: 'Reply with the word ok. Do not use tools.' })
      const mine = await listBackgroundAgents(projectDir)
      expect(mine.every(agent => agent.projectRoot === projectDir)).toBe(true)
      const all = await listBackgroundAgents()
      expect(all.length).toBeGreaterThanOrEqual(2)
      // Settle both via cancellation so the run does not outlive the test.
      await driveToTerminal(a.id)
      await driveToTerminal(b.id)
    } finally {
      fs.rmSync(otherProject, { recursive: true, force: true })
    }
  }, 90000)
})
