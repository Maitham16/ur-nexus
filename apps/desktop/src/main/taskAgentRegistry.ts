import type {
  TaskInfoDto,
  AgentInfoDto,
  TaskStatus,
  AgentStatus,
  VerificationResultDto,
} from '../shared/ipc.js'
import { saveTasks } from './taskStore.js'

export interface Task {
  index: number
  id: string
  title: string
  description?: string
  status: TaskStatus
  assignedAgent?: string
  dependencies: string[]
  currentAction?: string
  changedFiles: Set<string>
  verification?: VerificationResultDto
  startTime?: number
  elapsedMs: number
  runId: string
  projectRoot: string
}

export interface Agent {
  id: string
  name: string
  role?: string
  assignedTaskId?: string
  currentTool?: string
  currentCommand?: string
  startTime: number
  elapsedMs: number
  status: AgentStatus
  logs: string[]
  runId: string
  projectRoot: string
}

const tasksByRun = new Map<string, Map<string, Task>>()
const agentsByRun = new Map<string, Map<string, Agent>>()
const approvalToTask = new Map<string, { runId: string; taskId: string }>()

let maxParallelAgents = 4

export function setMaxParallelAgents(n: number): void {
  maxParallelAgents = Math.max(1, Math.min(16, n))
}

export function getMaxParallelAgents(): number {
  return maxParallelAgents
}

export function ensureRun(runId: string): void {
  if (!tasksByRun.has(runId)) tasksByRun.set(runId, new Map())
  if (!agentsByRun.has(runId)) agentsByRun.set(runId, new Map())
}

export function removeRunRegistry(runId: string): void {
  tasksByRun.delete(runId)
  agentsByRun.delete(runId)
  for (const [requestId, target] of approvalToTask) {
    if (target.runId === runId) approvalToTask.delete(requestId)
  }
}

export function createTask(
  runId: string,
  taskId: string,
  opts: {
    index: number
    title: string
    description?: string
    dependencies?: string[]
    projectRoot: string
  },
): Task {
  ensureRun(runId)
  const task: Task = {
    index: opts.index,
    id: taskId,
    title: opts.title,
    description: opts.description,
    status: 'pending',
    dependencies: opts.dependencies ?? [],
    currentAction: undefined,
    changedFiles: new Set(),
    verification: undefined,
    elapsedMs: 0,
    runId,
    projectRoot: opts.projectRoot,
  }
  tasksByRun.get(runId)!.set(taskId, task)
  return task
}

export function getTask(runId: string, taskId: string): Task | undefined {
  return tasksByRun.get(runId)?.get(taskId)
}

export function listTasks(runId: string): Task[] {
  const map = tasksByRun.get(runId)
  if (!map) return []
  return [...map.values()].sort((a, b) => a.index - b.index)
}

export function listAllTasks(): Task[] {
  const result: Task[] = []
  for (const map of tasksByRun.values()) {
    result.push(...map.values())
  }
  return result.sort((a, b) => a.index - b.index)
}

export function startTask(
  runId: string,
  taskId: string,
  assignedAgent?: string,
): void {
  const task = getTask(runId, taskId)
  if (!task) return
  task.status = 'running'
  task.assignedAgent = assignedAgent
  task.startTime = Date.now()
  task.currentAction = 'Running'
}

export function setTaskProgress(
  runId: string,
  taskId: string,
  message: string,
): void {
  const task = getTask(runId, taskId)
  if (!task) return
  task.currentAction = message
  if (task.startTime) {
    task.elapsedMs = Date.now() - task.startTime
  }
}

export function completeTask(runId: string, taskId: string): void {
  const task = getTask(runId, taskId)
  if (!task) return
  task.status = 'done'
  task.currentAction = 'Done'
  if (task.startTime) {
    task.elapsedMs = Date.now() - task.startTime
  }
  checkpointTask(task)
}

export function failTask(runId: string, taskId: string, error: string): void {
  const task = getTask(runId, taskId)
  if (!task) return
  task.status = 'failed'
  task.currentAction = `Failed: ${error}`
  if (task.startTime) {
    task.elapsedMs = Date.now() - task.startTime
  }
  checkpointTask(task)
}

/**
 * Persist a task at a terminal or otherwise durable transition. Fire-and-forget
 * on purpose: the registry is synchronous and consulted on the event path, so a
 * slow or failed disk write must never stall or break a run. Losing one
 * checkpoint costs a stale Tasks page, not a broken session.
 */
function checkpointTask(task: Task): void {
  void saveTasks([task]).catch(() => undefined)
}

export function setTaskWaitingApproval(
  runId: string,
  taskId: string,
  requestId: string,
): void {
  const task = getTask(runId, taskId)
  if (!task) return
  task.status = 'waiting_approval'
  task.currentAction = 'Waiting for approval'
  approvalToTask.set(requestId, { runId, taskId })
}

export function skipTask(runId: string, taskId: string): void {
  const task = getTask(runId, taskId)
  if (!task) return
  task.status = 'skipped'
  task.currentAction = 'Skipped'
}

export function resolveTaskApproval(
  requestId: string,
  approved: boolean,
): { runId: string; taskId: string } | undefined {
  const target = approvalToTask.get(requestId)
  if (!target) return undefined
  const task = tasksByRun.get(target.runId)?.get(target.taskId)
  if (!task) {
    approvalToTask.delete(requestId)
    return undefined
  }
  task.status = approved ? 'running' : 'failed'
  task.currentAction = approved ? 'Resumed after approval' : 'Denied'
  approvalToTask.delete(requestId)
  return target
}

export function addTaskChangedFile(
  runId: string,
  taskId: string,
  file: string,
): void {
  const task = getTask(runId, taskId)
  task?.changedFiles.add(file)
}

export function setTaskVerification(
  runId: string,
  taskId: string,
  result: VerificationResultDto,
): void {
  const task = getTask(runId, taskId)
  if (!task) return
  task.verification = result
  // Verification is the last thing to land on a task, so re-checkpoint to keep
  // the persisted verdict rather than the pre-verification snapshot.
  checkpointTask(task)
}

export function createAgent(
  runId: string,
  agentId: string,
  opts: {
    name: string
    role?: string
    assignedTaskId?: string
    projectRoot: string
  },
): Agent {
  ensureRun(runId)
  const agent: Agent = {
    id: agentId,
    name: opts.name,
    role: opts.role,
    assignedTaskId: opts.assignedTaskId,
    currentTool: undefined,
    currentCommand: undefined,
    startTime: Date.now(),
    elapsedMs: 0,
    status: 'idle',
    logs: [],
    runId,
    projectRoot: opts.projectRoot,
  }
  agentsByRun.get(runId)!.set(agentId, agent)
  return agent
}

export function getAgent(runId: string, agentId: string): Agent | undefined {
  return agentsByRun.get(runId)?.get(agentId)
}

export function listAgents(runId: string): Agent[] {
  const map = agentsByRun.get(runId)
  if (!map) return []
  return [...map.values()]
}

export function listAllAgents(): Agent[] {
  const result: Agent[] = []
  for (const map of agentsByRun.values()) {
    result.push(...map.values())
  }
  return result
}

export function startAgent(
  runId: string,
  agentId: string,
  taskId: string,
): void {
  const agent = getAgent(runId, agentId)
  if (!agent) return
  agent.assignedTaskId = taskId
  agent.status = 'running'
  agent.startTime = Date.now()
  agent.logs.push(`Started on task ${taskId}`)
}

export function setAgentProgress(
  runId: string,
  agentId: string,
  opts: {
    message: string
    currentTool?: string
    currentCommand?: string
  },
): void {
  const agent = getAgent(runId, agentId)
  if (!agent) return
  if (opts.currentTool) agent.currentTool = opts.currentTool
  if (opts.currentCommand) agent.currentCommand = opts.currentCommand
  agent.logs.push(opts.message)
  if (agent.startTime) {
    agent.elapsedMs = Date.now() - agent.startTime
  }
}

export function setAgentWaitingApproval(runId: string, agentId: string): void {
  const agent = getAgent(runId, agentId)
  if (!agent) return
  agent.status = 'waiting_approval'
}

export function finishAgent(runId: string, agentId: string): void {
  const agent = getAgent(runId, agentId)
  if (!agent) return
  agent.status = 'done'
  agent.currentTool = undefined
  agent.currentCommand = undefined
  agent.logs.push('Finished')
  if (agent.startTime) {
    agent.elapsedMs = Date.now() - agent.startTime
  }
}

export function failAgent(runId: string, agentId: string, error: string): void {
  const agent = getAgent(runId, agentId)
  if (!agent) return
  agent.status = 'failed'
  agent.logs.push(`Failed: ${error}`)
  if (agent.startTime) {
    agent.elapsedMs = Date.now() - agent.startTime
  }
}

export function canRunAnotherAgent(runId: string): boolean {
  const running = listAgents(runId).filter(a => a.status === 'running').length
  return running < maxParallelAgents
}

export function toTaskDto(task: Task): TaskInfoDto {
  return {
    index: task.index,
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    assignedAgent: task.assignedAgent,
    dependencies: task.dependencies,
    currentAction: task.currentAction,
    changedFiles: [...task.changedFiles],
    verification: task.verification,
    elapsedMs: task.elapsedMs,
    runId: task.runId,
  }
}

export function toAgentDto(agent: Agent): AgentInfoDto {
  return {
    id: agent.id,
    name: agent.name,
    role: agent.role,
    assignedTaskId: agent.assignedTaskId,
    currentTool: agent.currentTool,
    currentCommand: agent.currentCommand,
    elapsedMs: agent.elapsedMs,
    status: agent.status,
    logs: [...agent.logs],
    runId: agent.runId,
  }
}
