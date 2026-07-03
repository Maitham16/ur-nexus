import { describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  decomposePrompt,
  captureWorkspaceFileState,
  diffWorkspaceFileState,
  renderTaskBoard,
  runPromptPlan,
  validateAfterExecution,
  type NexusTask,
  type PromptPlan,
} from '../src/services/promptPlanning/index.js'

function tempDir(prefix: string): string {
  return mkdtempSync(join(tmpdir(), prefix))
}

function planWithTasks(tasks: NexusTask[]): PromptPlan {
  return {
    id: 'plan-test',
    originalPrompt: 'test',
    tasks,
    assumptions: ['Use test workspace.'],
    createdAt: '2026-01-01T00:00:00.000Z',
    config: {
      taskPlanning: true,
      parallelAgents: true,
      maxAgents: 3,
      showTaskBoard: true,
      strictVerification: true,
    },
  }
}

function task(id: string, title: string, dependencies: string[] = []): NexusTask {
  return {
    id,
    title,
    description: title,
    status: dependencies.length > 0 ? 'pending' : 'ready',
    dependencies,
    assignedAgent: 'executor',
    input: {
      prompt: title,
      assumptions: ['Use the current workspace as the source of truth.'],
      requiredFiles: [],
      targetFiles: [],
      resources: [],
    },
    expectedOutput: title,
    verificationCriteria: ['Output must match the requested task.'],
  }
}

describe('prompt planning', () => {
  test('simple prompt becomes one task without over-splitting', () => {
    const plan = decomposePrompt('Update README wording')
    expect(plan.tasks).toHaveLength(1)
    expect(plan.tasks[0]?.title).toBe('Update README wording')
    expect(plan.tasks[0]?.status).toBe('ready')
  })

  test('long prompt becomes multiple dependent tasks when ordering is explicit', () => {
    const plan = decomposePrompt(
      [
        '1. Update README.md with the new product name',
        '2. Then verify CHANGELOG.md mentions the release',
        '3. Finally report the changed files',
      ].join('\n'),
    )
    expect(plan.tasks).toHaveLength(3)
    expect(plan.tasks[1]?.dependencies).toEqual(['task-1'])
    expect(plan.tasks[2]?.dependencies).toEqual(['task-2'])
    expect(plan.tasks[2]?.assignedAgent).toBe('reporter')
  })

  test('ambiguous prompt is blocked with explicit assumptions', () => {
    const plan = decomposePrompt('fix it')
    expect(plan.tasks).toHaveLength(1)
    expect(plan.tasks[0]?.status).toBe('blocked')
    expect(plan.tasks[0]?.input.assumptions.join(' ')).toContain(
      'Critical target/context is missing',
    )
  })

  test('task statuses transition through running to finished', async () => {
    const dir = tempDir('ur-nexus-plan-')
    try {
      const events: string[] = []
      const result = await runPromptPlan(planWithTasks([task('t1', 'Do work')]), {
        cwd: dir,
        executeTask: async current => ({
          ok: true,
          output: `finished ${current.id}`,
          commandsRun: ['true'],
        }),
        onEvent: event => {
          if (event.type === 'status') events.push(event.task.status)
        },
      })
      expect(events).toContain('running')
      expect(events).toContain('finished')
      expect(result.finished).toBe(1)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('independent tasks can run in parallel', async () => {
    const dir = tempDir('ur-nexus-parallel-')
    try {
      let active = 0
      let maxActive = 0
      await runPromptPlan(
        planWithTasks([task('t1', 'A'), task('t2', 'B'), task('t3', 'C')]),
        {
          cwd: dir,
          config: { maxAgents: 3 },
          executeTask: async () => {
            active += 1
            maxActive = Math.max(maxActive, active)
            await new Promise(resolve => setTimeout(resolve, 10))
            active -= 1
            return { ok: true, output: 'done', commandsRun: ['true'] }
          },
        },
      )
      expect(maxActive).toBeGreaterThan(1)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('dependent tasks wait for prerequisites', async () => {
    const dir = tempDir('ur-nexus-dependent-')
    try {
      const order: string[] = []
      const result = await runPromptPlan(
        planWithTasks([task('t1', 'First'), task('t2', 'Second', ['t1'])]),
        {
          cwd: dir,
          executeTask: async current => {
            order.push(current.id)
            return { ok: true, output: current.id, commandsRun: ['true'] }
          },
        },
      )
      expect(order).toEqual(['t1', 't2'])
      expect(result.finished).toBe(2)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('tasks that target the same file are serialized', async () => {
    const dir = tempDir('ur-nexus-lock-')
    try {
      const a = task('t1', 'Edit README')
      const b = task('t2', 'Edit README again')
      a.input.targetFiles = ['README.md']
      b.input.targetFiles = ['README.md']
      writeFileSync(join(dir, 'README.md'), '# Test\n')

      let active = 0
      let maxActive = 0
      await runPromptPlan(planWithTasks([a, b]), {
        cwd: dir,
        config: { maxAgents: 2 },
        executeTask: async current => {
          active += 1
          maxActive = Math.max(maxActive, active)
          await new Promise(resolve => setTimeout(resolve, 10))
          writeFileSync(join(dir, 'README.md'), `# Test\n${current.id}\n`)
          active -= 1
          return { ok: true, output: 'changed README.md', changedFiles: ['README.md'] }
        },
      })

      expect(maxActive).toBe(1)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('task board renders statuses, agents, and progress', () => {
    const board = renderTaskBoard(
      planWithTasks([
        { ...task('t1', 'Analyze prompt'), assignedAgent: 'planner' },
        { ...task('t2', 'Update README'), status: 'running' },
      ]),
    )
    expect(board).toContain('[UR-Nexus Task Board]')
    expect(board).toContain('planner')
    expect(board).toContain('running')
    expect(board).toContain('Progress:')
  })

  test('verifier catches unsupported file and command claims', () => {
    const current = task('t1', 'Verify claims')
    const result = validateAfterExecution(
      current,
      {
        ok: true,
        output: 'I updated src/missing.ts and ran `npm test`.',
        changedFiles: ['src/actual.ts'],
        commandsRun: ['npm run lint'],
      },
      { cwd: process.cwd() },
    )
    expect(result.ok).toBe(false)
    expect(result.issues.map(issue => issue.code)).toContain(
      'unsupported_file_change_claim',
    )
    expect(result.issues.map(issue => issue.code)).toContain(
      'unsupported_command_claim',
    )
  })

  test('file state before and after detects actual changed files', () => {
    const dir = tempDir('ur-nexus-evidence-')
    try {
      const before = captureWorkspaceFileState(dir)
      writeFileSync(join(dir, 'actual.txt'), 'changed\n')
      const after = captureWorkspaceFileState(dir)
      expect(diffWorkspaceFileState(before, after)).toEqual(['actual.txt'])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  test('non-strict verification warns for unsupported claims', () => {
    const current = task('t1', 'Verify claims')
    const result = validateAfterExecution(
      current,
      {
        ok: true,
        output: 'I updated src/missing.ts and ran `npm test`.',
        changedFiles: ['src/actual.ts'],
        commandsRun: ['npm run lint'],
      },
      { cwd: process.cwd(), actualChangedFiles: ['src/actual.ts'], strict: false },
    )
    expect(result.ok).toBe(true)
    expect(result.issues.every(issue => issue.severity === 'warning')).toBe(true)
    expect(result.issues.map(issue => issue.code)).toContain(
      'unsupported_file_change_claim',
    )
    expect(result.issues.map(issue => issue.code)).toContain(
      'unsupported_command_claim',
    )
  })
})
