import { randomUUID } from 'node:crypto'

export type ScheduledTaskStatus =
  | 'pending'
  | 'running'
  | 'done'
  | 'failed'
  | 'cancelled'
  | 'skipped'

export interface ScheduledTaskSpec {
  id?: string
  title: string
  description?: string
  role?: string
  dependencies?: string[]
  /** Relative paths this task intends to modify; used for write locking. */
  fileTargets?: string[]
  maxRetries?: number
  payload?: unknown
}

export interface ScheduledTask {
  id: string
  title: string
  description?: string
  role?: string
  dependencies: string[]
  fileTargets: string[]
  maxRetries: number
  payload?: unknown
  status: ScheduledTaskStatus
  attempts: number
  error?: string
  result?: unknown
  queuedAt: number
  startedAt?: number
  finishedAt?: number
}

export type TaskExecutor = (
  task: ScheduledTask,
  signal: AbortSignal,
) => Promise<unknown>

export interface SchedulerOptions {
  executor: TaskExecutor
  concurrency?: number
  onTaskChange?: (task: ScheduledTask, previous: ScheduledTaskStatus) => void
}

const TERMINAL: ReadonlySet<ScheduledTaskStatus> = new Set([
  'done',
  'failed',
  'cancelled',
  'skipped',
])

/** Legal state transitions; anything else is a scheduler bug. */
const ALLOWED: Record<ScheduledTaskStatus, ScheduledTaskStatus[]> = {
  pending: ['running', 'cancelled', 'skipped'],
  running: ['done', 'failed', 'cancelled', 'pending'], // pending = retry
  done: [],
  failed: [],
  cancelled: [],
  skipped: [],
}

/**
 * Dependency-aware task scheduler with configurable concurrency, file-target
 * write locking, FIFO fairness, retries, and cancellation propagation.
 * The executor is injected: production runs real agent sessions, tests run
 * controlled fakes.
 */
export class TaskScheduler {
  private readonly tasks = new Map<string, ScheduledTask>()
  private readonly executor: TaskExecutor
  private readonly onTaskChange?: SchedulerOptions['onTaskChange']
  private concurrency: number
  private readonly running = new Set<string>()
  private readonly lockedTargets = new Map<string, string>() // target -> taskId
  private readonly abortControllers = new Map<string, AbortController>()
  private queueCounter = 0
  private settled: (() => void) | null = null
  private pumping = false

  constructor(options: SchedulerOptions) {
    this.executor = options.executor
    this.concurrency = Math.max(1, options.concurrency ?? 2)
    this.onTaskChange = options.onTaskChange
  }

  addTask(spec: ScheduledTaskSpec): ScheduledTask {
    const id = spec.id ?? `task-${randomUUID().slice(0, 8)}`
    if (this.tasks.has(id)) {
      throw new Error(`Duplicate task id: ${id}`)
    }
    for (const dep of spec.dependencies ?? []) {
      if (!this.tasks.has(dep)) {
        throw new Error(`Task ${id} depends on unknown task ${dep}`)
      }
    }
    const task: ScheduledTask = {
      id,
      title: spec.title,
      description: spec.description,
      role: spec.role,
      dependencies: [...(spec.dependencies ?? [])],
      fileTargets: [...(spec.fileTargets ?? [])],
      maxRetries: spec.maxRetries ?? 0,
      payload: spec.payload,
      status: 'pending',
      attempts: 0,
      queuedAt: this.queueCounter++,
    }
    this.tasks.set(id, task)
    return task
  }

  getTask(id: string): ScheduledTask | undefined {
    return this.tasks.get(id)
  }

  listTasks(): ScheduledTask[] {
    return [...this.tasks.values()].sort((a, b) => a.queuedAt - b.queuedAt)
  }

  counters(): { running: number; queued: number; done: number; failed: number } {
    let queued = 0
    let done = 0
    let failed = 0
    for (const task of this.tasks.values()) {
      if (task.status === 'pending') queued++
      else if (task.status === 'done') done++
      else if (task.status === 'failed') failed++
    }
    return { running: this.running.size, queued, done, failed }
  }

  setConcurrency(value: number): void {
    this.concurrency = Math.max(1, Math.floor(value))
    this.pump()
  }

  cancelTask(id: string): void {
    const task = this.tasks.get(id)
    if (!task || TERMINAL.has(task.status)) return
    if (task.status === 'running') {
      // The abort handler settles the task as cancelled.
      this.abortControllers.get(id)?.abort()
      return
    }
    this.transition(task, 'cancelled', 'Cancelled by user')
    this.skipDependents(task, `dependency ${task.id} was cancelled`)
    this.pump()
  }

  cancelAll(): void {
    for (const task of this.listTasks()) {
      if (!TERMINAL.has(task.status)) this.cancelTask(task.id)
    }
  }

  /** Resolves when every task is in a terminal state. */
  async run(): Promise<ScheduledTask[]> {
    if (this.allSettled()) return this.listTasks()
    await new Promise<void>(resolve => {
      this.settled = resolve
      this.pump()
    })
    return this.listTasks()
  }

  private allSettled(): boolean {
    for (const task of this.tasks.values()) {
      if (!TERMINAL.has(task.status)) return false
    }
    return true
  }

  private transition(
    task: ScheduledTask,
    to: ScheduledTaskStatus,
    error?: string,
  ): void {
    const from = task.status
    if (!ALLOWED[from].includes(to)) {
      throw new Error(`Illegal task transition ${from} → ${to} for ${task.id}`)
    }
    task.status = to
    if (error !== undefined) task.error = error
    if (to === 'running') task.startedAt = Date.now()
    if (TERMINAL.has(to)) task.finishedAt = Date.now()
    this.onTaskChange?.(task, from)
  }

  private depsSatisfied(task: ScheduledTask): boolean {
    return task.dependencies.every(dep => this.tasks.get(dep)?.status === 'done')
  }

  private depsDoomed(task: ScheduledTask): string | null {
    for (const dep of task.dependencies) {
      const status = this.tasks.get(dep)?.status
      if (status === 'failed' || status === 'cancelled' || status === 'skipped') {
        return dep
      }
    }
    return null
  }

  private locksAvailable(task: ScheduledTask): boolean {
    return task.fileTargets.every(target => {
      const holder = this.lockedTargets.get(target)
      return holder === undefined || holder === task.id
    })
  }

  private skipDependents(task: ScheduledTask, reason: string): void {
    for (const other of this.tasks.values()) {
      if (
        !TERMINAL.has(other.status) &&
        other.status !== 'running' &&
        other.dependencies.includes(task.id)
      ) {
        this.transition(other, 'skipped', reason)
        this.skipDependents(other, `dependency ${other.id} was skipped`)
      }
    }
  }

  private pump(): void {
    if (this.pumping) return
    this.pumping = true
    try {
      let progressed = true
      while (progressed) {
        progressed = false

        // Settle tasks whose dependencies can never complete.
        for (const task of this.listTasks()) {
          if (task.status !== 'pending') continue
          const doomed = this.depsDoomed(task)
          if (doomed) {
            const status = this.tasks.get(doomed)?.status
            this.transition(task, 'skipped', `dependency ${doomed} ${status}`)
            progressed = true
          }
        }

        if (this.running.size >= this.concurrency) break

        // FIFO over ready tasks; first whose write locks are free runs.
        for (const task of this.listTasks()) {
          if (this.running.size >= this.concurrency) break
          if (task.status !== 'pending') continue
          if (!this.depsSatisfied(task)) continue
          if (!this.locksAvailable(task)) continue
          this.launch(task)
          progressed = true
        }
      }
    } finally {
      this.pumping = false
    }
    if (this.allSettled() && this.settled) {
      const resolve = this.settled
      this.settled = null
      resolve()
    }
  }

  private launch(task: ScheduledTask): void {
    this.transition(task, 'running')
    task.attempts += 1
    this.running.add(task.id)
    for (const target of task.fileTargets) {
      this.lockedTargets.set(target, task.id)
    }
    const controller = new AbortController()
    this.abortControllers.set(task.id, controller)

    void this.executor(task, controller.signal)
      .then(result => {
        this.settle(task, controller, () => {
          task.result = result
          this.transition(task, 'done')
        })
      })
      .catch((err: unknown) => {
        this.settle(task, controller, () => {
          const message = err instanceof Error ? err.message : String(err)
          if (task.attempts <= task.maxRetries) {
            // Retry: back to the queue tail so peers are not starved.
            task.error = message
            task.queuedAt = this.queueCounter++
            this.transition(task, 'pending')
          } else {
            this.transition(task, 'failed', message)
            this.skipDependents(task, `dependency ${task.id} failed`)
          }
        })
      })
  }

  private settle(
    task: ScheduledTask,
    controller: AbortController,
    apply: () => void,
  ): void {
    this.running.delete(task.id)
    this.abortControllers.delete(task.id)
    for (const target of task.fileTargets) {
      if (this.lockedTargets.get(target) === task.id) {
        this.lockedTargets.delete(target)
      }
    }
    // An abort that raced a successful resolve still counts as cancelled.
    if (controller.signal.aborted && task.status === 'running') {
      this.transition(task, 'cancelled', 'Cancelled while running')
      this.skipDependents(task, `dependency ${task.id} was cancelled`)
    } else {
      apply()
    }
    this.pump()
  }
}
