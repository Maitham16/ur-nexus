import { describe, it, expect } from 'bun:test'
import {
  shouldPlan,
  buildPlanningPrompt,
  parsePlanResponse,
  PlanParseError,
} from './planning.js'

describe('shouldPlan', () => {
  it('skips planning for simple questions', () => {
    expect(shouldPlan('What does the QueryEngine class do?')).toBe(false)
    expect(shouldPlan('How are worktrees created?')).toBe(false)
    expect(shouldPlan('')).toBe(false)
  })

  it('skips planning for short single actions', () => {
    expect(shouldPlan('Fix the typo in README.md')).toBe(false)
    expect(shouldPlan('Rename foo to bar in utils.ts')).toBe(false)
  })

  it('plans for multi-step prompts', () => {
    expect(
      shouldPlan(
        'First add a config loader, then wire it into the server, and finally write tests for both.',
      ),
    ).toBe(true)
  })

  it('plans for numbered lists', () => {
    expect(
      shouldPlan('Please do:\n1. add auth\n2. add logging\n3. update docs'),
    ).toBe(true)
  })

  it('plans for heavy multi-file work', () => {
    expect(
      shouldPlan(
        'Refactor the storage layer to use the repository pattern across the api and worker packages and add tests',
      ),
    ).toBe(true)
  })

  it('plans for very long prompts', () => {
    expect(shouldPlan('Do things. '.repeat(60))).toBe(true)
  })
})

describe('parsePlanResponse', () => {
  const VALID = JSON.stringify({
    tasks: [
      {
        id: 't1',
        title: 'Add config loader module',
        description: 'Create src/config.ts',
        role: 'coder',
        dependencies: [],
        fileTargets: ['src/config.ts'],
        expectedOutput: 'config.ts exports loadConfig()',
        verification: 'bun test src/config.test.ts',
      },
      {
        id: 't2',
        title: 'Wire config into server startup',
        description: 'Use loadConfig in server.ts',
        role: 'coder',
        dependencies: ['t1'],
        fileTargets: ['src/server.ts'],
        expectedOutput: 'server reads config',
        verification: 'run the server',
      },
    ],
  })

  it('parses a valid plan with dependencies and targets', () => {
    const plan = parsePlanResponse(VALID, 'original prompt')
    expect(plan.tasks).toHaveLength(2)
    expect(plan.prompt).toBe('original prompt')
    expect(plan.tasks[1].dependencies).toEqual(['t1'])
    expect(plan.tasks[0].fileTargets).toEqual(['src/config.ts'])
  })

  it('parses fenced JSON responses', () => {
    const plan = parsePlanResponse('Here is the plan:\n```json\n' + VALID + '\n```', 'p')
    expect(plan.tasks).toHaveLength(2)
  })

  it('rejects placeholder task titles', () => {
    const bad = JSON.stringify({
      tasks: [{ id: 't1', title: 'Task 1', dependencies: [] }],
    })
    expect(() => parsePlanResponse(bad, 'p')).toThrow(PlanParseError)
    const todo = JSON.stringify({
      tasks: [{ id: 't1', title: 'TODO: something', dependencies: [] }],
    })
    expect(() => parsePlanResponse(todo, 'p')).toThrow(/placeholder/)
  })

  it('rejects plans with forward or unknown dependencies', () => {
    const bad = JSON.stringify({
      tasks: [
        { id: 't1', title: 'Real work first', dependencies: ['t2'] },
        { id: 't2', title: 'Later work', dependencies: [] },
      ],
    })
    expect(() => parsePlanResponse(bad, 'p')).toThrow(/not an earlier task/)
  })

  it('rejects empty and non-JSON plans', () => {
    expect(() => parsePlanResponse('no json here', 'p')).toThrow(PlanParseError)
    expect(() => parsePlanResponse('{"tasks":[]}', 'p')).toThrow(/no tasks/)
  })
})

describe('buildPlanningPrompt', () => {
  it('embeds the user request and the JSON contract', () => {
    const prompt = buildPlanningPrompt('Build a REST API')
    expect(prompt).toContain('Build a REST API')
    expect(prompt).toContain('"tasks"')
    expect(prompt).toContain('ONLY a JSON object')
  })
})
