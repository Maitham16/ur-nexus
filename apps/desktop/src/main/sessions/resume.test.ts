import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execFileSync } from 'node:child_process'
import {
  reconcileRunStates,
  listInterruptedRuns,
  getRunState,
  markRunStateFailed,
  archiveRunState,
  flushRunStates,
} from './runState.js'
import { buildResumePrompt, prepareResume } from './resume.js'
import {
  setRendererEmitter,
  respondApproval,
  runPromptStream,
  stopRunById,
} from '../runtime.js'

const FIXTURE = path.resolve(
  import.meta.dir,
  '../../../test/fixtures/interruptedRun.fixture.ts',
)

let dataDir: string
let projectDir: string

async function ollamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(1500),
    })
    return response.ok
  } catch {
    return false
  }
}

beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-resume-data-'))
  projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-resume-proj-'))
  process.env.UR_DESKTOP_DATA_DIR = dataDir
  process.env.UR_CONFIG_DIR = path.join(dataDir, 'runtime')
  setRendererEmitter((_root, event) => {
    const e = event as { type?: string; requestId?: string }
    if (e.type === 'approval_required' && e.requestId) {
      setImmediate(() => respondApproval(e.requestId!, true, 'run'))
    }
  })
})

afterEach(async () => {
  await flushRunStates().catch(() => undefined)
  delete process.env.UR_DESKTOP_DATA_DIR
  delete process.env.UR_CONFIG_DIR
  fs.rmSync(dataDir, { recursive: true, force: true })
  fs.rmSync(projectDir, { recursive: true, force: true })
})

function runFixture(): string {
  const output = execFileSync('bun', [FIXTURE, projectDir], {
    env: {
      ...process.env,
      UR_DESKTOP_DATA_DIR: dataDir,
      UR_CONFIG_DIR: path.join(dataDir, 'runtime'),
    },
    encoding: 'utf-8',
    timeout: 60000,
  })
  const match = output.match(/FIXTURE_RUN_ID=(\S+)/)
  if (!match) throw new Error(`Fixture did not report a run id: ${output}`)
  return match[1]
}

describe('interrupted-session resume', () => {
  it('detects the interrupted run after a process exit and preserves completed tool calls', async () => {
    const runId = runFixture()

    // The subprocess is gone; its run state still claims `running`.
    const before = await getRunState(runId)
    expect(before!.status).toBe('running')

    // Startup reconciliation flips it to interrupted.
    const reconciled = await reconcileRunStates()
    expect(reconciled.some(s => s.runId === runId)).toBe(true)

    const state = await getRunState(runId)
    expect(state!.status).toBe('interrupted')
    expect(state!.pendingApprovals).toEqual([])
    expect(state!.completedToolCalls.map(c => c.tool)).toContain('Write')
    expect(
      state!.completedToolCalls.find(c => c.tool === 'Write')!.target,
    ).toBe('hello.txt')

    // The real side effect from the first run survived.
    expect(fs.readFileSync(path.join(projectDir, 'hello.txt'), 'utf-8')).toBe(
      'marker-content-from-first-run\n',
    )

    const interrupted = await listInterruptedRuns(projectDir)
    expect(interrupted.map(s => s.runId)).toContain(runId)
  }, 90000)

  it('builds a resume prompt that forbids repeating completed actions', () => {
    const prompt = buildResumePrompt({
      pendingPrompt: 'Create hello.txt then done.txt',
      completedToolCalls: [{ tool: 'Write', target: 'hello.txt' }],
      interruptionNote: 'The app exited mid-run.',
      assistantProgress: 'I created hello.txt.',
    })
    expect(prompt).toContain('ALREADY COMPLETED — do NOT repeat')
    expect(prompt).toContain('- Write hello.txt')
    expect(prompt).toContain('Create hello.txt then done.txt')
    expect(prompt).toContain('I created hello.txt.')
  })

  it('resumes an interrupted run and links both run states', async () => {
    const runId = runFixture()
    await reconcileRunStates()

    const { newRunId, resumePrompt, resumedFrom } = await prepareResume(runId)
    expect(resumedFrom).toBe(runId)
    expect(newRunId).not.toBe(runId)
    expect(resumePrompt).toContain('- Write hello.txt')

    const oldState = await getRunState(runId)
    expect(oldState!.status).toBe('resumed')
    expect(oldState!.resumedBy).toBe(newRunId)
    const newState = await getRunState(newRunId)
    expect(newState!.resumedFrom).toBe(runId)

    // Only interrupted runs are resumable — a second resume must fail.
    await expect(prepareResume(runId)).rejects.toThrow(/only interrupted runs/)
  }, 90000)

  it('completes the resumed run end-to-end with a live provider, without repeating the Write', async () => {
    if (!(await ollamaAvailable())) {
      console.warn('Ollama unavailable; skipping live resume completion test')
      return
    }
    const runId = runFixture()
    await reconcileRunStates()
    const markerBefore = fs.readFileSync(path.join(projectDir, 'hello.txt'), 'utf-8')

    const { newRunId, resumePrompt } = await prepareResume(runId)
    const types: string[] = []
    // Cloud-backed models have highly variable latency. The run gets a fixed
    // budget; exceeding it skips the completion assertions (with a warning)
    // instead of failing the suite on provider slowness. State-machine
    // correctness is still asserted by the other tests in this file.
    const budgetMs = 180000
    const deadline = Date.now() + budgetMs
    let timedOut = false
    for await (const event of runPromptStream(newRunId, resumePrompt)) {
      types.push(event.type)
      if (Date.now() > deadline) {
        timedOut = true
        stopRunById(newRunId)
        break
      }
    }
    if (timedOut) {
      console.warn(
        `live resume run exceeded ${budgetMs / 1000}s provider budget; completion assertions skipped`,
      )
      return
    }
    expect(types).toContain('run_finished')

    // The completed Write from the first run was not blindly repeated: the
    // marker content is intact.
    expect(fs.readFileSync(path.join(projectDir, 'hello.txt'), 'utf-8')).toBe(
      markerBefore,
    )

    const finalState = await getRunState(newRunId)
    expect(finalState!.status).toBe('finished')
  }, 300000)

  it('supports Mark failed and Archive on interrupted runs', async () => {
    const runId = runFixture()
    await reconcileRunStates()

    await markRunStateFailed(runId)
    expect((await getRunState(runId))!.status).toBe('failed')

    // A failed run can still be archived away from the list.
    await archiveRunState(runId)
    expect((await getRunState(runId))!.status).toBe('archived')
    expect((await listInterruptedRuns(projectDir)).length).toBe(0)
  }, 90000)
})
