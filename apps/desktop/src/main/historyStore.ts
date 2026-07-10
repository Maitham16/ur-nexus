import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import { getAppDataPath } from './utils/appDataPath.js'
import { redactValue } from './utils/redactSecrets.js'

export type RunStatus = 'running' | 'finished' | 'failed' | 'stopped'

export interface RunRecord {
  runId: string
  sessionId: string
  projectRoot: string
  projectName: string
  worktreeRoot?: string
  startedAt: string
  finishedAt?: string
  status: RunStatus
  title?: string
  providerId?: string
  modelId?: string
  providerMode?: string
  changedFiles: string[]
  costUsd?: number
  tokenUsage?: {
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
  }
  transcriptPath: string
  reportPath?: string
}

export interface HistoryMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool' | 'approval' | 'diff' | 'error'
  content?: string
  toolName?: string
  input?: Record<string, unknown>
  result?: unknown
  status?: 'running' | 'done' | 'error'
  timestamp: number
}

export interface HistoryTask {
  id: string
  index: number
  title: string
  description?: string
  status: 'pending' | 'running' | 'waiting_approval' | 'done' | 'failed' | 'skipped'
  assignedAgent?: string
  dependencies: string[]
  changedFiles: string[]
  verification?: { passed: boolean; level: 'l1' | 'l2'; message?: string }
}

export interface HistoryAgent {
  id: string
  name: string
  role?: string
  assignedTaskId?: string
  status: 'idle' | 'running' | 'waiting_approval' | 'done' | 'failed'
}

export interface HistoryToolCall {
  id: string
  toolName: string
  input: Record<string, unknown>
  result?: unknown
  status: 'running' | 'done' | 'error'
  timestamp: number
}

export interface HistoryCommand {
  id: string
  command: string
  exitCode?: number
  output?: string
  status: 'running' | 'done' | 'error' | 'stopped'
  timestamp: number
}

export interface HistoryApproval {
  requestId: string
  actionType: string
  target: string
  reason: string
  riskLevel: string
  decision: 'allowed' | 'denied'
  scope: 'once' | 'run' | 'session' | 'permanent'
  timestamp: string
}

export interface HistoryDiff {
  diffId: string
  filePath: string
  patch: string
  applied: boolean
  timestamp: number
}

export interface HistoryCheckpoint {
  id: string
  filePath: string
  snapshotPath: string
  createdAt: string
}

export interface RunHistory {
  runId: string
  sessionId: string
  projectRoot: string
  projectName: string
  worktreeRoot?: string
  startedAt: string
  finishedAt?: string
  status: RunStatus
  title?: string
  providerId?: string
  modelId?: string
  providerMode?: string
  costUsd?: number
  tokenUsage?: RunRecord['tokenUsage']
  changedFiles: string[]
  messages: HistoryMessage[]
  tasks: HistoryTask[]
  agents: HistoryAgent[]
  toolCalls: HistoryToolCall[]
  commands: HistoryCommand[]
  approvals: HistoryApproval[]
  diffs: HistoryDiff[]
  checkpoints: HistoryCheckpoint[]
  finalReport?: string
}

const appData = getAppDataPath()
const desktopDir = path.join(appData, 'desktop')
const runsDir = path.join(desktopDir, 'runs')
const transcriptsDir = path.join(desktopDir, 'transcripts')
const checkpointsDir = path.join(desktopDir, 'checkpoints')
const indexPath = path.join(desktopDir, 'history.jsonl')

async function ensureDirs(): Promise<void> {
  await fs.mkdir(desktopDir, { recursive: true })
  await fs.mkdir(runsDir, { recursive: true })
  await fs.mkdir(transcriptsDir, { recursive: true })
  await fs.mkdir(checkpointsDir, { recursive: true })
}

function runPath(runId: string): string {
  return path.join(runsDir, `${runId}.json`)
}

function transcriptPath(runId: string): string {
  return path.join(transcriptsDir, `${runId}.jsonl`)
}

function checkpointDir(runId: string): string {
  return path.join(checkpointsDir, runId)
}

function redactEvent(event: Record<string, unknown>): Record<string, unknown> {
  return redactValue(event) as Record<string, unknown>
}

export async function appendRun(record: RunRecord): Promise<void> {
  await ensureDirs()
  const safeRecord = redactValue(record) as RunRecord
  const file = runPath(record.runId)
  await fs.writeFile(file, `${JSON.stringify(safeRecord, null, 2)}\n`, 'utf-8')
  const line = JSON.stringify({
    runId: record.runId,
    sessionId: record.sessionId,
    projectRoot: record.projectRoot,
    projectName: record.projectName,
    startedAt: record.startedAt,
    status: record.status,
    title: record.title,
    providerId: record.providerId,
    modelId: record.modelId,
    providerMode: record.providerMode,
  })
  await fs.appendFile(indexPath, `${line}\n`, 'utf-8')
}

export async function updateRun(
  runId: string,
  patch: Partial<RunRecord>,
): Promise<void> {
  const file = runPath(runId)
  let record: RunRecord | undefined
  try {
    const content = await fs.readFile(file, 'utf-8')
    record = JSON.parse(content) as RunRecord
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
  }
  if (!record) {
    record = {
      ...(patch as RunRecord),
      runId,
      sessionId: patch.sessionId ?? runId,
      projectRoot: patch.projectRoot ?? '',
      projectName: patch.projectName ?? '',
      startedAt: patch.startedAt ?? new Date().toISOString(),
      status: patch.status ?? 'running',
      transcriptPath: patch.transcriptPath ?? transcriptPath(runId),
      changedFiles: patch.changedFiles ?? [],
    }
  }
  record = { ...record, ...patch }
  await fs.writeFile(file, `${JSON.stringify(redactValue(record), null, 2)}\n`, 'utf-8')
}

export async function listRuns(filters?: {
  projectRoot?: string
  status?: RunRecord['status']
  limit?: number
}): Promise<RunRecord[]> {
  let records = await listAllRuns()
  if (filters?.projectRoot) {
    records = records.filter(r => r.projectRoot === filters.projectRoot)
  }
  if (filters?.status) {
    records = records.filter(r => r.status === filters.status)
  }
  records.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
  if (filters?.limit) {
    records = records.slice(0, filters.limit)
  }
  return records
}

export async function getRun(runId: string): Promise<RunRecord | undefined> {
  try {
    const content = await fs.readFile(runPath(runId), 'utf-8')
    return JSON.parse(content) as RunRecord
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw err
  }
}

export async function getRunHistory(runId: string): Promise<RunHistory | undefined> {
  const record = await getRun(runId)
  if (!record) return undefined
  const transcript = await readTranscript(runId)
  const checkpoints = await listCheckpoints(runId)
  const messages: HistoryMessage[] = []
  const tasks: HistoryTask[] = []
  const agents: HistoryAgent[] = []
  const toolCalls: HistoryToolCall[] = []
  const commands: HistoryCommand[] = []
  const approvals: HistoryApproval[] = []
  const diffs: HistoryDiff[] = []

  for (const event of transcript) {
    const type = String(event.type ?? '')
    const timestamp = Number(event.timestamp ?? Date.now())
    switch (type) {
      case 'message_created': {
        messages.push({
          id: `msg-${timestamp}`,
          role: String(event.role ?? 'assistant') as HistoryMessage['role'],
          content: String(event.content ?? ''),
          timestamp,
        })
        break
      }
      case 'task_created': {
        tasks.push({
          id: String(event.taskId ?? ''),
          index: Number(event.index ?? 0),
          title: String(event.title ?? ''),
          description: String(event.description ?? ''),
          status: 'pending',
          assignedAgent: String(event.assignedAgent ?? ''),
          dependencies: Array.isArray(event.dependencies) ? (event.dependencies as string[]) : [],
          changedFiles: [],
        })
        break
      }
      case 'task_started': {
        const t = tasks.find(x => x.id === event.taskId)
        if (t) t.status = 'running'
        break
      }
      case 'task_done': {
        const t = tasks.find(x => x.id === event.taskId)
        if (t) t.status = 'done'
        break
      }
      case 'task_failed': {
        const t = tasks.find(x => x.id === event.taskId)
        if (t) t.status = 'failed'
        break
      }
      case 'agent_started': {
        agents.push({
          id: String(event.agentId ?? ''),
          name: String(event.name ?? ''),
          role: String(event.role ?? ''),
          assignedTaskId: String(event.taskId ?? ''),
          status: 'running',
        })
        break
      }
      case 'agent_finished': {
        const a = agents.find(x => x.id === event.agentId)
        if (a) a.status = a.status === 'failed' ? 'failed' : 'done'
        break
      }
      case 'tool_call_started': {
        toolCalls.push({
          id: `tool-${timestamp}`,
          toolName: String(event.toolName ?? ''),
          input: (event.input as Record<string, unknown>) ?? {},
          status: 'running',
          timestamp,
        })
        break
      }
      case 'tool_call_finished': {
        const t = toolCalls.findLast(x => x.toolName === event.toolName && x.status === 'running')
        if (t) {
          t.status = (event.result as { error?: string })?.error ? 'error' : 'done'
          t.result = redactValue(event.result)
        }
        break
      }
      case 'command_started': {
        commands.push({
          id: String(event.commandId ?? `cmd-${timestamp}`),
          command: String(event.command ?? ''),
          status: 'running',
          timestamp,
        })
        break
      }
      case 'command_finished': {
        const c = commands.findLast(x => x.status === 'running')
        if (c) {
          c.status = Number(event.exitCode ?? 0) === 0 ? 'done' : 'error'
          c.exitCode = Number(event.exitCode ?? 0)
          c.output = String(event.output ?? '').slice(0, 5000)
        }
        break
      }
      case 'approval_responded': {
        approvals.push({
          requestId: String(event.requestId ?? ''),
          actionType: String(event.actionType ?? 'builtin-tool'),
          target: String(event.target ?? ''),
          reason: String(event.reason ?? ''),
          riskLevel: String(event.riskLevel ?? 'low'),
          decision: event.approved ? 'allowed' : 'denied',
          scope: (event.scope as HistoryApproval['scope']) ?? 'once',
          timestamp: new Date(timestamp).toISOString(),
        })
        break
      }
      case 'diff_created': {
        diffs.push({
          diffId: String(event.diffId ?? ''),
          filePath: String(event.filePath ?? ''),
          patch: String(event.patch ?? ''),
          applied: false,
          timestamp,
        })
        break
      }
      case 'patch_applied': {
        const d = diffs.find(x => x.diffId === event.diffId)
        if (d) d.applied = true
        break
      }
      case 'run_finished':
      case 'run_failed':
        // final status handled by run record
        break
    }
  }

  return {
    ...record,
    messages,
    tasks,
    agents,
    toolCalls,
    commands,
    approvals,
    diffs,
    checkpoints,
  }
}

export async function deleteRun(runId: string): Promise<boolean> {
  try {
    await fs.unlink(runPath(runId))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw err
  }
  try {
    await fs.unlink(transcriptPath(runId))
  } catch {
    // ignore
  }
  try {
    await fs.rm(checkpointDir(runId), { recursive: true, force: true })
  } catch {
    // ignore
  }
  const records = await listAllRuns()
  const filtered = records.filter(r => r.runId !== runId)
  if (filtered.length === records.length) return false
  await writeIndex(filtered)
  return true
}

export async function appendEvent(runId: string, event: Record<string, unknown>): Promise<void> {
  await ensureDirs()
  const file = transcriptPath(runId)
  await fs.appendFile(file, `${JSON.stringify(redactEvent(event))}\n`, 'utf-8')
}

export async function readTranscript(runId: string): Promise<Record<string, unknown>[]> {
  const file = transcriptPath(runId)
  try {
    const content = await fs.readFile(file, 'utf-8')
    return content
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line) as Record<string, unknown>)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw err
  }
}

export async function writeCheckpoint(
  runId: string,
  filePath: string,
  content: string,
): Promise<string> {
  await ensureDirs()
  const dir = checkpointDir(runId)
  await fs.mkdir(dir, { recursive: true })
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const snapshotPath = path.join(dir, `${id}-${path.basename(filePath)}`)
  await fs.writeFile(snapshotPath, content, 'utf-8')
  return snapshotPath
}

export async function readCheckpoint(snapshotPath: string): Promise<string> {
  return fs.readFile(snapshotPath, 'utf-8')
}

export async function listCheckpoints(runId: string): Promise<HistoryCheckpoint[]> {
  const dir = checkpointDir(runId)
  try {
    const entries = await fs.readdir(dir)
    return entries.map(name => {
      const [id, ...rest] = name.split('-')
      return {
        id: id ?? name,
        filePath: rest.join('-') || name,
        snapshotPath: path.join(dir, name),
        createdAt: new Date(Number(id)).toISOString(),
      }
    })
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }
}

async function listAllRuns(): Promise<RunRecord[]> {
  try {
    const content = await fs.readFile(indexPath, 'utf-8')
    const records: RunRecord[] = []
    for (const line of content.split('\n')) {
      if (!line.trim()) continue
      try {
        records.push(JSON.parse(line) as RunRecord)
      } catch {
        // skip malformed lines
      }
    }
    return records
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw err
  }
}

async function writeIndex(records: RunRecord[]): Promise<void> {
  await ensureDirs()
  const lines = records.map(r => JSON.stringify(r)).join('\n')
  await fs.writeFile(indexPath, lines ? `${lines}\n` : '', 'utf-8')
}
