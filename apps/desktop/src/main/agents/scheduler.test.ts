import { describe, it, expect } from 'bun:test'
import { TaskScheduler } from './scheduler.js'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('TaskScheduler', () => {
  it('runs independent tasks up to the concurrency limit', async () => {
    let active = 0
    let peak = 0
    const scheduler = new TaskScheduler({
      concurrency: 3,
      executor: async () => {
        active++
        peak = Math.max(peak, active)
        await sleep(20)
        active--
        return 'ok'
      },
    })
    for (let i = 0; i < 10; i++) {
      scheduler.addTask({ title: `t${i}` })
    }
    const tasks = await scheduler.run()
    expect(tasks.every(t => t.status === 'done')).toBe(true)
    expect(peak).toBe(3)
  })

  it('respects dependencies (topological execution order)', async () => {
    const order: string[] = []
    const scheduler = new TaskScheduler({
      concurrency: 4,
      executor: async task => {
        order.push(task.id)
        await sleep(5)
      },
    })
    scheduler.addTask({ id: 'a', title: 'a' })
    scheduler.addTask({ id: 'b', title: 'b', dependencies: ['a'] })
    scheduler.addTask({ id: 'c', title: 'c', dependencies: ['a'] })
    scheduler.addTask({ id: 'd', title: 'd', dependencies: ['b', 'c'] })
    await scheduler.run()
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('b'))
    expect(order.indexOf('a')).toBeLessThan(order.indexOf('c'))
    expect(order.indexOf('d')).toBeGreaterThan(order.indexOf('b'))
    expect(order.indexOf('d')).toBeGreaterThan(order.indexOf('c'))
  })

  it('never runs two tasks holding the same file target concurrently', async () => {
    const holding = new Map<string, string>()
    const violations: string[] = []
    const scheduler = new TaskScheduler({
      concurrency: 4,
      executor: async task => {
        for (const target of task.fileTargets) {
          if (holding.has(target)) {
            violations.push(`${task.id} vs ${holding.get(target)} on ${target}`)
          }
          holding.set(target, task.id)
        }
        await sleep(15)
        for (const target of task.fileTargets) holding.delete(target)
      },
    })
    scheduler.addTask({ id: 'w1', title: 'w1', fileTargets: ['src/a.ts'] })
    scheduler.addTask({ id: 'w2', title: 'w2', fileTargets: ['src/a.ts'] })
    scheduler.addTask({ id: 'w3', title: 'w3', fileTargets: ['src/a.ts', 'src/b.ts'] })
    scheduler.addTask({ id: 'w4', title: 'w4', fileTargets: ['src/c.ts'] })
    const tasks = await scheduler.run()
    expect(violations).toEqual([])
    expect(tasks.every(t => t.status === 'done')).toBe(true)
  })

  it('skips dependents when a dependency fails, and reports the reason', async () => {
    const scheduler = new TaskScheduler({
      concurrency: 2,
      executor: async task => {
        if (task.id === 'boom') throw new Error('exploded')
      },
    })
    scheduler.addTask({ id: 'boom', title: 'boom' })
    scheduler.addTask({ id: 'child', title: 'child', dependencies: ['boom'] })
    scheduler.addTask({ id: 'grandchild', title: 'g', dependencies: ['child'] })
    scheduler.addTask({ id: 'independent', title: 'i' })
    const tasks = await scheduler.run()
    const byId = new Map(tasks.map(t => [t.id, t]))
    expect(byId.get('boom')!.status).toBe('failed')
    expect(byId.get('child')!.status).toBe('skipped')
    expect(byId.get('child')!.error).toContain('boom')
    expect(byId.get('grandchild')!.status).toBe('skipped')
    expect(byId.get('independent')!.status).toBe('done')
  })

  it('retries up to maxRetries then succeeds', async () => {
    let calls = 0
    const scheduler = new TaskScheduler({
      concurrency: 1,
      executor: async () => {
        calls++
        if (calls < 3) throw new Error(`attempt ${calls} failed`)
        return 'recovered'
      },
    })
    scheduler.addTask({ id: 'flaky', title: 'flaky', maxRetries: 2 })
    const tasks = await scheduler.run()
    expect(tasks[0].status).toBe('done')
    expect(tasks[0].attempts).toBe(3)
    expect(calls).toBe(3)
  })

  it('fails after exhausting retries', async () => {
    const scheduler = new TaskScheduler({
      concurrency: 1,
      executor: async () => {
        throw new Error('always broken')
      },
    })
    scheduler.addTask({ id: 'doomed', title: 'doomed', maxRetries: 1 })
    const tasks = await scheduler.run()
    expect(tasks[0].status).toBe('failed')
    expect(tasks[0].attempts).toBe(2)
  })

  it('cancels running tasks via abort signal and propagates to dependents', async () => {
    const scheduler = new TaskScheduler({
      concurrency: 2,
      executor: (task, signal) =>
        new Promise((resolve, reject) => {
          const timer = setTimeout(resolve, 500)
          signal.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new Error('aborted'))
          })
        }),
    })
    scheduler.addTask({ id: 'longrun', title: 'longrun' })
    scheduler.addTask({ id: 'after', title: 'after', dependencies: ['longrun'] })
    const runPromise = scheduler.run()
    await sleep(20)
    scheduler.cancelTask('longrun')
    const tasks = await runPromise
    const byId = new Map(tasks.map(t => [t.id, t]))
    expect(byId.get('longrun')!.status).toBe('cancelled')
    expect(byId.get('after')!.status).toBe('skipped')
  })

  it('never executes a task twice per attempt (no duplicates)', async () => {
    const executions = new Map<string, number>()
    const scheduler = new TaskScheduler({
      concurrency: 8,
      executor: async task => {
        executions.set(task.id, (executions.get(task.id) ?? 0) + 1)
        await sleep(Math.random() * 10)
      },
    })
    for (let i = 0; i < 40; i++) {
      scheduler.addTask({
        id: `t${i}`,
        title: `t${i}`,
        dependencies: i > 0 && i % 5 === 0 ? [`t${i - 1}`] : [],
      })
    }
    await scheduler.run()
    for (const [, count] of executions) {
      expect(count).toBe(1)
    }
    expect(executions.size).toBe(40)
  })

  it('stress: mixed graph with locks, failures, retries, and dependents settles deterministically', async () => {
    const scheduler = new TaskScheduler({
      concurrency: 4,
      executor: async task => {
        await sleep(Math.random() * 8)
        if (task.payload === 'fail-once' && task.attempts === 1) {
          throw new Error('transient')
        }
        if (task.payload === 'fail-always') {
          throw new Error('permanent')
        }
      },
    })
    scheduler.addTask({ id: 'root', title: 'root' })
    for (let i = 0; i < 8; i++) {
      scheduler.addTask({
        id: `mid${i}`,
        title: `mid${i}`,
        dependencies: ['root'],
        fileTargets: [`src/${i % 3}.ts`],
        payload: i === 3 ? 'fail-once' : undefined,
        maxRetries: i === 3 ? 1 : 0,
      })
    }
    scheduler.addTask({
      id: 'bad',
      title: 'bad',
      dependencies: ['root'],
      payload: 'fail-always',
    })
    scheduler.addTask({ id: 'leaf-ok', title: 'leaf-ok', dependencies: ['mid0', 'mid1'] })
    scheduler.addTask({ id: 'leaf-doomed', title: 'leaf-doomed', dependencies: ['bad'] })

    const tasks = await scheduler.run()
    const byId = new Map(tasks.map(t => [t.id, t]))
    expect(byId.get('root')!.status).toBe('done')
    expect(byId.get('mid3')!.status).toBe('done')
    expect(byId.get('mid3')!.attempts).toBe(2)
    expect(byId.get('bad')!.status).toBe('failed')
    expect(byId.get('leaf-ok')!.status).toBe('done')
    expect(byId.get('leaf-doomed')!.status).toBe('skipped')

    const counters = scheduler.counters()
    expect(counters.running).toBe(0)
    expect(counters.queued).toBe(0)
    expect(counters.failed).toBe(1)
  })

  it('rejects unknown dependencies and duplicate ids', () => {
    const scheduler = new TaskScheduler({ executor: async () => undefined })
    expect(() =>
      scheduler.addTask({ title: 'x', dependencies: ['ghost'] }),
    ).toThrow(/unknown task/)
    scheduler.addTask({ id: 'dup', title: 'dup' })
    expect(() => scheduler.addTask({ id: 'dup', title: 'dup2' })).toThrow(
      /Duplicate task id/,
    )
  })

  it('reports accurate live counters while running', async () => {
    const scheduler = new TaskScheduler({
      concurrency: 2,
      executor: async () => {
        await sleep(30)
      },
    })
    for (let i = 0; i < 5; i++) scheduler.addTask({ title: `t${i}` })
    const runPromise = scheduler.run()
    await sleep(10)
    const mid = scheduler.counters()
    expect(mid.running).toBe(2)
    expect(mid.queued).toBe(3)
    await runPromise
    const end = scheduler.counters()
    expect(end.running).toBe(0)
    expect(end.done).toBe(5)
  })
})
