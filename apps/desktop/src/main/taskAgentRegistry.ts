import type {
  TaskInfoDto,
  AgentInfoDto,
  TaskStatus,
  AgentStatus,
  VerificationResultDto,
} from '../shared/ipc.js'

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
}

const tasksByRun = new Map<string, Map<string, Task>>()
const agentsByRun = new Map<string, Map<string, Agent>>()
const approvalToTask = new Map<string, string>()

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

export function createTask(
  runId: string,
  taskId: string,
  opts: {
    index: number
    title: string
    description?: string
    dependencies?: string[]
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
}

export function failTask(runId: string, taskId: string, error: string): void {
  const task = getTask(runId, taskId)
  if (!task) return
  task.status = 'failed'
  task.currentAction = `Failed: ${error}`
  if (task.startTime) {
    task.elapsedMs = Date.now() - task.startTime
  }
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
  approvalToTask.set(requestId, taskId)
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
  const taskId = approvalToTask.get(requestId)
  if (!taskId) return undefined
  for (const [runId, map] of tasksByRun) {
    const task = map.get(taskId)
    if (task) {
      task.status = approved ? 'running' : 'failed'
      task.currentAction = approved ? 'Resumed after approval' : 'Denied'
      approvalToTask.delete(requestId)
      return { runId, taskId }
    }
  }
  return undefined
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
}

export function createAgent(
  runId: string,
  agentId: string,
  opts: { name: string; role?: string; assignedTaskId?: string },
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
