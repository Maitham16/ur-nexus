import * as path from 'node:path'
import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import {
  openProject,
  createSession,
  runPrompt,
  stopRun,
  pauseRun,
  resumeRun,
  listTools,
  listProviders,
  listModels,
  setProvider,
  applyPatch,
  readHistory,
} from '@ur/agent-runtime'
import type {
  RuntimeProject,
  RuntimeSession,
  RuntimeToolInfo,
  RuntimeProviderInfo,
  RuntimeModelInfo,
  ProviderId,
  RuntimeToolDefinition,
} from '@ur/agent-runtime'
import {
  listDesktopProviders,
  getDesktopProviderConfig,
  setDesktopProviderConfig,
  storeDesktopProviderApiKey,
  clearDesktopProviderApiKey,
  testDesktopProviderConnection,
  listDesktopProviderModels,
  activateDesktopProvider,
  type DesktopProviderKind,
} from './providers/providerService.js'
import type {
  DesktopProviderInfoDto,
  DesktopProviderConfigDto,
  DesktopProviderConfigPatch,
  DesktopModelInfoDto,
  DesktopProviderConnectionResultDto,
} from '../shared/ipc.js'
import {
  addRecentProject,
  listRecentProjects,
} from './projectStore.js'
import { inspectProject } from './projectDetector.js'
import type { ProjectInfoDto, WorktreeInfoDto, TaskInfoDto, AgentInfoDto } from '../shared/ipc.js'
import {
  createIsolatedWorktree,
  setWorktree,
  listWorktreesForProject,
  resolveWorktreePath,
  type Worktree,
} from './worktreeManager.js'
import {
  runTerminalCommand,
  stopTerminalCommand,
  listTerminalCommands,
  getTerminalCommand,
} from './terminalManager.js'
import {
  createTask,
  createAgent,
  startTask,
  setTaskProgress,
  completeTask,
  failTask,
  setTaskWaitingApproval,
  skipTask,
  resolveTaskApproval,
  addTaskChangedFile,
  setTaskVerification,
  startAgent,
  setAgentProgress,
  setAgentWaitingApproval,
  finishAgent,
  failAgent,
  canRunAnotherAgent,
  setMaxParallelAgents,
  getMaxParallelAgents,
  toTaskDto,
  toAgentDto,
  listAllTasks,
  listAllAgents,
} from './taskAgentRegistry.js'

export { RuntimeProject, RuntimeSession }

import type { ApprovalScope } from '../shared/ipc.js'
import {
  evaluateToolUse,
  evaluateShellCommand,
  evaluateFileWrite,
  evaluateFileDelete,
  evaluateFileRead,
  evaluateLongRunningCommand,
  evaluateProviderKeyReplacement,
  type SafetyEvaluation,
  type ActionType,
} from './safety/safetyService.js'
import { appendApprovalLog } from './safety/approvalLog.js'
import { dialog, BrowserWindow } from 'electron'
import {
  appendRun,
  updateRun,
  listRuns,
  getRun as getHistoryRun,
  deleteRun,
  appendEvent,
  readTranscript,
  type RunRecord,
} from './historyStore.js'
import { buildRunReport, buildReportMarkdown, buildReportJson, type RunReport } from './reportBuilder.js'

export interface RuntimeRun {
  runId: string
  session: RuntimeSession
  projectRoot: string
  worktreeRoot?: string
  changedFiles: Set<string>
  status: 'idle' | 'running' | 'paused' | 'stopped' | 'failed' | 'finished'
  __canUseTool?: import('@ur/agent-runtime').CanUseToolFn
  allowedActions: Set<string>
}

const projects = new Map<string, RuntimeProject>()
const sessions = new Map<string, RuntimeSession>()
const runs = new Map<string, RuntimeRun>()
const pendingApprovals = new Map<
  string,
  { resolve: (value: { approved: boolean; scope: ApprovalScope }) => void; timeout: NodeJS.Timeout }
>()

export async function openProjectAndCache(root: string): Promise<{ root: string }> {
  const normalized = path.resolve(root)
  if (!projects.has(normalized)) {
    const project = await openProject(normalized)
    projects.set(normalized, project)
  }
  await addRecentProject(normalized)
  return { root: normalized }
}

export async function listProjects(): Promise<
  { root: string; name: string; lastOpenedAt: number }[]
> {
  return listRecentProjects()
}

export async function getProjectInfo(root: string): Promise<ProjectInfoDto> {
  return inspectProject(root)
}

export async function createRunWorktree(
  projectRoot: string,
  branch?: string,
): Promise<WorktreeInfoDto> {
  const project = getProject(projectRoot)
  try {
    const worktree = await createIsolatedWorktree(project.root, branch)
    return { root: worktree.root, branch: worktree.branch, isMain: false }
  } catch (err) {
    // Fallback: return main workspace so caller can switch to patch proposal mode.
    return { root: project.root, branch: 'main', isMain: true }
  }
}

export function listWorktrees(projectRoot: string): WorktreeInfoDto[] {
  return listWorktreesForProject(projectRoot).map(wt => ({
    root: wt.root,
    branch: wt.branch,
    isMain: wt.isMain,
  }))
}

export async function startRun(
  projectRoot: string,
  options: { useWorktree?: boolean; branch?: string } = {},
): Promise<{ runId: string; sessionId: string; projectRoot: string; worktreeRoot?: string }> {
  const project = getProject(projectRoot)
  const runId = randomUUID()

  // Create the run record early so the permission hook can reference it.
  const run: RuntimeRun = {
    runId,
    session: null as unknown as RuntimeSession,
    projectRoot,
    worktreeRoot: undefined,
    changedFiles: new Set(),
    status: 'idle',
    allowedActions: new Set(),
  }
  runs.set(runId, run)

  let worktree: Worktree | undefined
  if (options.useWorktree) {
    worktree = await createIsolatedWorktree(project.root, options.branch).catch(
      () => undefined,
    )
    run.worktreeRoot = worktree?.root
  }

  createTask(runId, 'task-1', {
    index: 1,
    title: 'Process user request',
    description: 'Handle the current user prompt',
    dependencies: [],
  })

  const { ensureConnectorClientsConnected } = await import('./connectors/connectorService.js')
  await ensureConnectorClientsConnected(projectRoot)

  const appState = project.appStateStore.getState()
  const providerSettings = (appState.provider ?? {}) as {
    active?: string
    model?: string
  }

  await appendRun({
    runId,
    sessionId: runId,
    projectRoot,
    projectName: path.basename(projectRoot),
    worktreeRoot: run.worktreeRoot,
    startedAt: new Date().toISOString(),
    status: 'running',
    providerId: providerSettings.active,
    modelId: providerSettings.model,
    changedFiles: [],
    transcriptPath: '',
  })

  const canUseTool: import('@ur/agent-runtime').CanUseToolFn = async (
    tool,
    input,
  ) => {
    const additionalDirectories = project.appStateStore.getState().permissions?.additionalDirectories
    const evaluation = await evaluateToolUse(
      { runId, projectRoot, worktreeRoot: run.worktreeRoot, additionalDirectories },
      {
        name: tool.name,
        isMcp: tool.isMcp,
        isReadOnly: (i?) => tool.isReadOnly(i ?? input),
        isDestructive: tool.isDestructive ? (i?) => tool.isDestructive!(i ?? input) : undefined,
      },
      input as Record<string, unknown>,
    )

    if (evaluation.behavior === 'allow') {
      return { behavior: 'allow' }
    }

    if (evaluation.behavior === 'deny') {
      return { behavior: 'deny', message: evaluation.reason }
    }

    const approved = await requestApproval(
      runId,
      tool.name,
      input as Record<string, unknown>,
      'task-1',
      evaluation,
    )
    return approved.approved
      ? { behavior: 'allow' }
      : { behavior: 'deny', message: 'User denied approval' }
  }

  const session = await createSession(project, { sessionId: runId, canUseTool })
  run.session = session
  sessions.set(session.sessionId, session)
  if (worktree) {
    setWorktree(runId, worktree)
  }
  return {
    runId,
    sessionId: session.sessionId,
    projectRoot,
    worktreeRoot: worktree?.root,
  }
}

export function stopRunById(runId: string): void {
  const run = getRun(runId)
  run.status = 'stopped'
  stopRun(run.session)
}

export function pauseRunById(runId: string): void {
  const run = getRun(runId)
  run.status = 'paused'
  pauseRun(run.session)
}

export function resumeRunById(runId: string): void {
  const run = getRun(runId)
  run.status = 'running'
  resumeRun(run.session)
}

export async function* runPromptStream(
  runId: string,
  prompt: string,
): AsyncGenerator<import('../shared/ipc.js').RuntimeEvent> {
  const run = getRun(runId)
  run.status = 'running'

  try {
    startTask(runId, 'task-1', 'agent-1')
    startAgent(runId, 'agent-1', 'task-1')

    yield makeEvent(run, {
      type: 'run_started',
      worktreeRoot: run.worktreeRoot,
    })
    yield makeEvent(run, {
      type: 'task_created',
      taskId: 'task-1',
      title: 'Process user request',
      description: 'Handle the current user prompt',
      index: 1,
      dependencies: [],
    })
    yield makeEvent(run, {
      type: 'task_started',
      taskId: 'task-1',
      assignedAgent: 'agent-1',
    })
    yield makeEvent(run, {
      type: 'agent_started',
      agentId: 'agent-1',
      taskId: 'task-1',
      name: 'Primary agent',
      role: 'coder',
    })
    yield makeEvent(run, {
      type: 'message_created',
      role: 'user',
      content: prompt,
    })

    setTaskProgress(runId, 'task-1', 'Streaming model response')
    setAgentProgress(runId, 'agent-1', {
      message: 'Thinking',
      currentTool: undefined,
      currentCommand: undefined,
    })

    for await (const event of runPrompt(run.session, prompt)) {
      const translated = translateRuntimeEvent(run, event)
      await appendEvent(runId, translated as unknown as Record<string, unknown>)
      yield translated
    }

    completeTask(runId, 'task-1')
    finishAgent(runId, 'agent-1')
    setTaskVerification(runId, 'task-1', {
      passed: true,
      level: 'l1',
      message: 'Run completed',
    })

    run.status = 'finished'
    yield makeEvent(run, { type: 'task_done', taskId: 'task-1' })
    yield makeEvent(run, { type: 'agent_finished', agentId: 'agent-1', taskId: 'task-1' })
    yield makeEvent(run, {
      type: 'verification_completed',
      taskId: 'task-1',
      passed: true,
      level: 'l1',
      message: 'Run completed',
    })
    yield makeEvent(run, {
      type: 'run_finished',
    })
    if (run.changedFiles.size > 0) {
      yield makeEvent(run, {
        type: 'changed_files',
        files: [...run.changedFiles],
      })
    }

    await finalizeRunRecord(run, prompt)
  } catch (error) {
    run.status = 'failed'
    const message = error instanceof Error ? error.message : String(error)
    failTask(runId, 'task-1', message)
    failAgent(runId, 'agent-1', message)
    yield makeEvent(run, { type: 'task_failed', taskId: 'task-1', error: message })
    yield makeEvent(run, { type: 'agent_finished', agentId: 'agent-1', taskId: 'task-1' })
    yield makeEvent(run, {
      type: 'run_failed',
      error: message,
    })
    await finalizeRunRecord(run, prompt)
  }
}

async function finalizeRunRecord(run: RuntimeRun, prompt: string): Promise<void> {
  const title = prompt.slice(0, 120)
  const current = run.status
  const finalStatus: RunRecord['status'] =
    current === 'running' || current === 'idle' || current === 'paused'
      ? 'finished'
      : current
  await updateRun(run.runId, {
    status: finalStatus,
    finishedAt: new Date().toISOString(),
    title,
    changedFiles: [...run.changedFiles],
  })
}

export async function readProjectFile(
  projectRoot: string,
  filePath: string,
  worktreeRoot?: string,
): Promise<string | null> {
  const safePath = resolveWorktreePath(projectRoot, worktreeRoot, filePath)
  try {
    return await fs.readFile(safePath, 'utf-8')
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null
    }
    throw err
  }
}

export async function proposeEdit(
  projectRoot: string,
  filePath: string,
  newText: string,
  worktreeRoot?: string,
): Promise<{ diffId: string; patch: string }> {
  const safePath = resolveWorktreePath(projectRoot, worktreeRoot, filePath)
  const original = await fs.readFile(safePath, 'utf-8').catch(() => '')
  const diffId = randomUUID()
  // Phase 4 placeholder: simple whole-file replacement patch.
  const patch = `--- a/${filePath}\n+++ b/${filePath}\n@@ -1,1 +1,1 @@\n-${original.split('\n').join('\n ')}\n+${newText.split('\n').join('\n ')}\n`
  trackChangedFile(projectRoot, filePath, worktreeRoot)
  return { diffId, patch }
}

export async function applyProjectPatch(
  projectRoot: string,
  patch: string,
  worktreeRoot?: string,
): Promise<void> {
  const project = getProject(projectRoot)
  if (worktreeRoot && worktreeRoot !== project.root) {
    // Fallback patch proposal mode: write the patched file content to the
    // worktree without using the runtime applyPatch, which expects the main
    // project. We parse a very simple whole-file diff format for the scaffold.
    const parsed = parseSimplePatch(patch)
    for (const [filePath, newText] of Object.entries(parsed)) {
      const safePath = resolveWorktreePath(projectRoot, worktreeRoot, filePath)
      await fs.mkdir(path.dirname(safePath), { recursive: true })
      await fs.writeFile(safePath, newText, 'utf-8')
      trackChangedFile(projectRoot, filePath, worktreeRoot)
    }
    return
  }
  await applyPatch(project, patch)
}

export async function runProjectCommand(
  projectRoot: string,
  command: string,
  worktreeRoot?: string,
  skipApproval?: boolean,
): Promise<{ output: string; exitCode: number; commandId?: string; requiresApproval?: boolean; denied?: boolean }> {
  const run = findRunByWorktree(projectRoot, worktreeRoot)

  if (!skipApproval && run) {
    const evaluation = evaluateShellCommand(
      { runId: run.runId, projectRoot, worktreeRoot },
      command,
    )
    if (evaluation.behavior === 'deny') {
      const reason = evaluation.reason
      emitToRenderer(projectRoot, {
        ...makeEvent(run, { type: 'command_finished', exitCode: -1, output: reason }),
      })
      return { output: reason, exitCode: -1, denied: true }
    }
    if (evaluation.behavior === 'ask') {
      const approved = await requestApproval(run.runId, command, { command }, 'task-1', evaluation)
      if (!approved.approved) {
        const reason = 'User denied command execution'
        emitToRenderer(projectRoot, {
          ...makeEvent(run, { type: 'command_finished', exitCode: -1, output: reason }),
        })
        return { output: reason, exitCode: -1, denied: true }
      }
    }
  }

  const runId = run?.runId
  if (runId) {
    emitToRenderer(projectRoot, {
      ...makeEvent(run, { type: 'command_started', command }),
    })
  }

  const result = await runTerminalCommand(projectRoot, command, { worktreeRoot, skipApproval: true })
  const commandRecord = result.commandId ? getTerminalCommand(projectRoot, result.commandId, worktreeRoot) : undefined
  const output = commandRecord?.stdout ?? ''
  const exitCode = commandRecord?.exitCode ?? 0

  if (runId) {
    emitToRenderer(projectRoot, {
      ...makeEvent(run, { type: 'command_finished', exitCode, output }),
    })
  }
  return { output, exitCode, commandId: result.commandId }
}

export function listProjectTerminalCommands(
  projectRoot: string,
  worktreeRoot?: string,
): import('./shellRunner.js').ShellCommand[] {
  return listTerminalCommands(projectRoot, worktreeRoot)
}

export function stopProjectCommand(
  projectRoot: string,
  commandId: string,
  worktreeRoot?: string,
): boolean {
  return stopTerminalCommand(projectRoot, commandId, worktreeRoot)
}

export function listProjectTools(projectRoot: string): RuntimeToolInfo[] {
  const project = getProject(projectRoot)
  return listTools(project)
}

export function listProjectToolDefinitions(projectRoot: string): RuntimeToolDefinition[] {
  const project = getProject(projectRoot)
  return listTools(project).map(t => ({ name: t.name, risk: 'low', needsApproval: false }))
}

export function listProjectProviders(projectRoot: string): DesktopProviderInfoDto[] {
  const config = getDesktopProviderConfig(projectRoot)
  return listDesktopProviders(config.providerId)
}

export function listProjectModels(projectRoot: string): DesktopModelInfoDto[] {
  const config = getDesktopProviderConfig(projectRoot)
  // Synchronous fallback using cached/static models when available.
  const runtimeModels = listModels(getProject(projectRoot))
  if (runtimeModels.length > 0) {
    return runtimeModels.map(m => ({
      id: m.id,
      displayName: m.displayName,
      provider: config.providerId,
    }))
  }
  return []
}

export async function updateProjectProvider(
  projectRoot: string,
  providerId: string,
  model?: string,
): Promise<void> {
  const project = getProject(projectRoot)
  await setProvider(project, providerId as ProviderId, model)
}

export function getProjectProviderConfig(projectRoot: string): DesktopProviderConfigDto {
  return getDesktopProviderConfig(projectRoot)
}

export async function setProjectProviderConfig(
  projectRoot: string,
  patch: DesktopProviderConfigPatch,
): Promise<void> {
  await setDesktopProviderConfig(projectRoot, patch)
}

export async function storeProjectProviderApiKey(
  projectRoot: string,
  providerId: string,
  apiKey: string,
  runId?: string,
): Promise<void> {
  const evaluation = evaluateProviderKeyReplacement(providerId)
  let approved: { approved: boolean; scope: ApprovalScope }
  if (runId) {
    approved = await requestApproval(runId, 'ProviderKeyStore', { providerId }, 'task-1', evaluation)
  } else {
    approved = await requestStandaloneApproval(projectRoot, evaluation)
  }
  if (!approved.approved) {
    throw new Error('User denied provider key replacement')
  }
  await storeDesktopProviderApiKey(projectRoot, providerId as DesktopProviderKind, apiKey)
}

export async function clearProjectProviderApiKey(
  projectRoot: string,
  providerId: string,
): Promise<void> {
  await clearDesktopProviderApiKey(projectRoot, providerId as DesktopProviderKind)
}

export async function testProjectProviderConnection(
  projectRoot: string,
  providerId: string,
): Promise<DesktopProviderConnectionResultDto> {
  return testDesktopProviderConnection(projectRoot, providerId as DesktopProviderKind)
}

export async function listProjectProviderModels(
  projectRoot: string,
  providerId: string,
): Promise<DesktopModelInfoDto[]> {
  return listDesktopProviderModels(projectRoot, providerId as DesktopProviderKind)
}

export function setActiveProjectProvider(
  projectRoot: string,
  providerId: string,
  model?: string,
): { ok: true; message: string } | { ok: false; message: string } {
  return activateDesktopProvider(projectRoot, providerId as DesktopProviderKind, model)
}

export async function listProjectMcpServers(
  projectRoot: string,
): Promise<{ name: string; enabled: boolean }[]> {
  await openProject(projectRoot)
  const { getAllMcpConfigs } = await import('@ur/agent-runtime')
  const { servers: configs } = await getAllMcpConfigs()
  return Object.entries(configs).map(([name, config]) => ({
    name,
    enabled: !(config as { disabled?: boolean }).disabled,
  }))
}

export async function addProjectMcpServer(
  projectRoot: string,
  name: string,
  command: string,
  args?: string[],
  env?: Record<string, string>,
): Promise<void> {
  const project = getProject(projectRoot)
  project.appStateStore.setState(prev => {
    const mcp = { ...prev.mcp }
    mcp.userServers = {
      ...mcp.userServers,
      [name]: { command, args: args ?? [], env: env ?? {}, disabled: false },
    }
    return { ...prev, mcp }
  })
}

export async function removeProjectMcpServer(
  projectRoot: string,
  name: string,
): Promise<void> {
  const project = getProject(projectRoot)
  project.appStateStore.setState(prev => {
    const mcp = { ...prev.mcp }
    if (mcp.userServers) {
      const { [name]: _, ...rest } = mcp.userServers
      mcp.userServers = rest as Record<string, import('@ur/agent-runtime').RuntimeMcpConfig>
    }
    return { ...prev, mcp }
  })
}

export async function listProjectConnectors(
  projectRoot: string,
): Promise<import('../shared/ipc.js').RuntimeConnectorDto[]> {
  const { listConnectors } = await import('./connectors/connectorService.js')
  return listConnectors(projectRoot)
}

export async function addProjectConnector(
  projectRoot: string,
  connector: import('./connectors/connectorService.js').ConnectorConfig,
): Promise<void> {
  const { addConnector } = await import('./connectors/connectorService.js')
  return addConnector(projectRoot, connector)
}

export async function updateProjectConnector(
  projectRoot: string,
  name: string,
  updates: { enabled?: boolean; config?: Partial<import('./connectors/connectorService.js').ConnectorConfig> },
): Promise<void> {
  const { updateConnector } = await import('./connectors/connectorService.js')
  return updateConnector(projectRoot, name, updates)
}

export async function removeProjectConnector(
  projectRoot: string,
  name: string,
): Promise<void> {
  const { removeConnector } = await import('./connectors/connectorService.js')
  return removeConnector(projectRoot, name)
}

export async function testProjectConnector(
  projectRoot: string,
  name: string,
): Promise<import('./connectors/connectorService.js').ConnectorTestResult> {
  const { testConnector } = await import('./connectors/connectorService.js')
  return testConnector(projectRoot, name)
}

export async function listProjectConnectorTools(
  projectRoot: string,
  name: string,
): Promise<import('../shared/ipc.js').RuntimeConnectorToolDto[]> {
  const { listConnectorTools } = await import('./connectors/connectorService.js')
  return listConnectorTools(projectRoot, name)
}

export async function callProjectConnectorTool(
  projectRoot: string,
  serverName: string,
  toolName: string,
  input: Record<string, unknown>,
): Promise<import('./connectors/connectorService.js').ConnectorToolCallResult> {
  const { callConnectorTool } = await import('./connectors/connectorService.js')
  return callConnectorTool(projectRoot, serverName, toolName, input)
}

export async function* readProjectHistory(
  projectRoot: string,
): AsyncGenerator<unknown> {
  const project = getProject(projectRoot)
  yield* readHistory(project)
}

export async function exportProjectReport(
  projectRoot: string,
  worktreeRoot?: string,
): Promise<{ path: string }> {
  const project = getProject(projectRoot)
  const reportDir = worktreeRoot && worktreeRoot !== project.root
    ? path.join(worktreeRoot, '.ur')
    : path.join(project.root, '.ur')
  const reportPath = path.join(reportDir, 'desktop-report.md')
  await fs.mkdir(reportDir, { recursive: true })
  await fs.writeFile(
    reportPath,
    `# UR Desktop Report\n\nGenerated ${new Date().toISOString()}\n\nProject: ${project.root}\n${worktreeRoot ? `Worktree: ${worktreeRoot}\n` : ''}`,
    'utf-8',
  )
  return { path: reportPath }
}

export async function listProjectRuns(
  projectRoot: string,
  limit?: number,
): Promise<RunRecord[]> {
  return listRuns({ projectRoot, limit })
}

export async function getProjectRun(runId: string): Promise<{
  record: RunRecord
  transcript: Record<string, unknown>[]
} | null> {
  const record = await getHistoryRun(runId)
  if (!record) return null
  const transcript = await readTranscript(runId)
  return { record, transcript }
}

export async function deleteProjectRun(runId: string): Promise<boolean> {
  return deleteRun(runId)
}

export async function exportRunReport(
  projectRoot: string,
  runId: string,
  format: 'markdown' | 'json',
): Promise<{ path: string }> {
  const detail = await getProjectRun(runId)
  if (!detail) {
    throw new Error(`Run not found: ${runId}`)
  }
  const { record, transcript } = detail
  const report = await buildRunReport(projectRoot, runId, transcript, {
    projectName: record.projectName,
    title: record.title,
    startedAt: record.startedAt,
    finishedAt: record.finishedAt,
    status: record.status,
    providerId: record.providerId,
    modelId: record.modelId,
    costUsd: record.costUsd,
    changedFiles: record.changedFiles,
  })

  const ext = format === 'markdown' ? 'md' : 'json'
  const reportDir = path.join(projectRoot, '.ur')
  const reportPath = path.join(reportDir, `report-${runId}.${ext}`)
  await fs.mkdir(reportDir, { recursive: true })
  const content = format === 'markdown' ? buildReportMarkdown(report) : buildReportJson(report)
  await fs.writeFile(reportPath, content, 'utf-8')

  await updateRun(runId, { reportPath })
  return { path: reportPath }
}

export async function getRunReport(
  projectRoot: string,
  runId: string,
): Promise<RunReport> {
  const detail = await getProjectRun(runId)
  if (!detail) {
    throw new Error(`Run not found: ${runId}`)
  }
  const { record, transcript } = detail
  return buildRunReport(projectRoot, runId, transcript, {
    projectName: record.projectName,
    title: record.title,
    startedAt: record.startedAt,
    finishedAt: record.finishedAt,
    status: record.status,
    providerId: record.providerId,
    modelId: record.modelId,
    costUsd: record.costUsd,
    changedFiles: record.changedFiles,
  })
}

function actionKey(actionType: ActionType, target: string): string {
  return `${actionType}:${target}`
}

function runAllowsAction(run: RuntimeRun, actionType: ActionType, target: string): boolean {
  return run.allowedActions.has(actionKey(actionType, target))
}

function getFocusedWindow(): BrowserWindow | null {
  return BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0] ?? null
}

async function showNativeApprovalDialog(
  projectRoot: string,
  evaluation: SafetyEvaluation,
  parentWindow?: BrowserWindow | null,
): Promise<{ approved: boolean; scope: ApprovalScope }> {
  const win = parentWindow ?? getFocusedWindow()
  const buttons = ['Allow once', 'Allow for this run', 'Deny']
  const { response } = await dialog.showMessageBox(win ?? undefined, {
    type: 'warning',
    buttons,
    defaultId: 2,
    cancelId: 2,
    title: 'Approval required',
    message: `${evaluation.actionType}: ${evaluation.target}`,
    detail: `Project: ${projectRoot}\nRisk: ${evaluation.riskLevel}\n\n${evaluation.reason}`,
  })
  if (response === 2) {
    return { approved: false, scope: 'once' }
  }
  return { approved: true, scope: response === 1 ? 'run' : 'once' }
}

export async function requestStandaloneApproval(
  projectRoot: string,
  evaluation: SafetyEvaluation,
  parentWindow?: BrowserWindow,
): Promise<{ approved: boolean; scope: ApprovalScope }> {
  const requestId = randomUUID()
  const result = await showNativeApprovalDialog(projectRoot, evaluation, parentWindow)
  await appendApprovalLog(projectRoot, {
    timestamp: new Date().toISOString(),
    runId: '',
    requestId,
    actionType: evaluation.actionType,
    target: evaluation.target,
    reason: evaluation.reason,
    riskLevel: evaluation.riskLevel,
    decision: result.approved ? 'allowed' : 'denied',
    scope: result.scope,
    projectRoot,
  })
  return result
}

export async function requestApproval(
  runId: string,
  toolName: string,
  input: Record<string, unknown>,
  taskId?: string,
  evaluation?: SafetyEvaluation,
): Promise<{ approved: boolean; scope: ApprovalScope }> {
  const requestId = randomUUID()
  const run = getRun(runId)

  if (evaluation && runAllowsAction(run, evaluation.actionType, evaluation.target)) {
    return { approved: true, scope: 'run' }
  }

  if (taskId) {
    setTaskWaitingApproval(runId, taskId, requestId)
    setAgentWaitingApproval(runId, 'agent-1')
  }

  const result = await new Promise<{ approved: boolean; scope: ApprovalScope }>(resolve => {
    const timeout = setTimeout(() => {
      pendingApprovals.delete(requestId)
      resolve({ approved: false, scope: 'once' })
    }, 5 * 60 * 1000)
    pendingApprovals.set(requestId, { resolve, timeout })

    emitToRenderer(run.projectRoot, {
      ...makeEvent(run, {
        type: 'approval_required',
        requestId,
        toolName,
        input,
        taskId,
        agentId: 'agent-1',
        actionType: evaluation?.actionType,
        target: evaluation?.target,
        reason: evaluation?.reason,
        riskLevel: evaluation?.riskLevel,
        projectRoot: run.projectRoot,
      }),
    })
  })

  await appendApprovalLog(run.projectRoot, {
    timestamp: new Date().toISOString(),
    runId,
    requestId,
    actionType: evaluation?.actionType ?? 'builtin-tool',
    target: evaluation?.target ?? toolName,
    reason: evaluation?.reason ?? 'Approval required',
    riskLevel: evaluation?.riskLevel ?? 'low',
    decision: result.approved ? 'allowed' : 'denied',
    scope: result.scope,
    projectRoot: run.projectRoot,
    taskId,
    agentId: 'agent-1',
  })

  emitToRenderer(run.projectRoot, {
    ...makeEvent(run, {
      type: 'approval_logged',
      entry: {
        timestamp: new Date().toISOString(),
        runId,
        requestId,
        actionType: evaluation?.actionType ?? 'builtin-tool',
        target: evaluation?.target ?? toolName,
        reason: evaluation?.reason ?? 'Approval required',
        riskLevel: evaluation?.riskLevel ?? 'low',
        decision: result.approved ? 'allowed' : 'denied',
        scope: result.scope,
      },
    }),
  })

  if (result.approved && result.scope === 'run' && evaluation) {
    run.allowedActions.add(actionKey(evaluation.actionType, evaluation.target))
  }

  return result
}

export async function executeTool(
  runId: string,
  toolName: string,
  input: Record<string, unknown>,
  opts: { skipApproval?: boolean } = {},
): Promise<unknown> {
  const run = getRun(runId)
  const taskId = 'task-1'

  emitToRenderer(run.projectRoot, {
    ...makeEvent(run, {
      type: 'tool_call_started',
      toolName,
      input,
      taskId,
      agentId: 'agent-1',
    }),
  })

  setAgentProgress(runId, 'agent-1', {
    message: `Tool call: ${toolName}`,
    currentTool: toolName,
  })

  if (!opts.skipApproval) {
    const project = getProject(run.projectRoot)
    const additionalDirectories = project.appStateStore.getState().permissions?.additionalDirectories
    const evaluation = await evaluateToolUse(
      { runId, projectRoot: run.projectRoot, worktreeRoot: run.worktreeRoot, additionalDirectories },
      { name: toolName },
      input,
    )
    if (evaluation.behavior === 'deny') {
      setAgentProgress(runId, 'agent-1', {
        message: `Tool denied: ${toolName}`,
        currentTool: undefined,
      })
      emitToRenderer(run.projectRoot, {
        ...makeEvent(run, {
          type: 'tool_call_finished',
          toolName,
          result: { denied: true, error: evaluation.reason },
          taskId,
          agentId: 'agent-1',
        }),
      })
      return { denied: true, error: evaluation.reason }
    }
    if (evaluation.behavior === 'ask') {
      const approved = await requestApproval(runId, toolName, input, taskId, evaluation)
      if (!approved.approved) {
        setAgentProgress(runId, 'agent-1', {
          message: `Tool denied: ${toolName}`,
          currentTool: undefined,
        })
        emitToRenderer(run.projectRoot, {
          ...makeEvent(run, {
            type: 'tool_call_finished',
            toolName,
            result: { denied: true, error: 'User denied approval' },
            taskId,
            agentId: 'agent-1',
          }),
        })
        return { denied: true, error: 'User denied approval' }
      }
    }
  }

  try {
    const { requestToolCall } = await import('@ur/agent-runtime') as {
      requestToolCall?: (session: RuntimeSession, toolName: string, input: Record<string, unknown>) => Promise<unknown>
    }

    let result: unknown
    if (requestToolCall) {
      result = await requestToolCall(run.session, toolName, input)
    } else {
      result = await executeToolLocal(run, toolName, input)
    }

    if (toolName === 'Write' || toolName === 'Edit' || toolName === 'ApplyPatch') {
      const filePath = String(input.path ?? input.filePath ?? '')
      if (filePath) {
        trackChangedFile(run.projectRoot, filePath, run.worktreeRoot)
        addTaskChangedFile(runId, taskId, filePath)
      }
    }

    setAgentProgress(runId, 'agent-1', {
      message: `Tool result: ${toolName}`,
      currentTool: undefined,
    })
    emitToRenderer(run.projectRoot, {
      ...makeEvent(run, {
        type: 'tool_call_finished',
        toolName,
        result,
        taskId,
        agentId: 'agent-1',
      }),
    })
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    setAgentProgress(runId, 'agent-1', {
      message: `Tool error: ${toolName}: ${message}`,
      currentTool: undefined,
    })
    emitToRenderer(run.projectRoot, {
      ...makeEvent(run, {
        type: 'tool_call_finished',
        toolName,
        result: { error: message },
        taskId,
        agentId: 'agent-1',
      }),
    })
    return { error: message }
  }
}

async function executeToolLocal(
  run: RuntimeRun,
  toolName: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  const projectRoot = run.projectRoot
  const worktreeRoot = run.worktreeRoot

  switch (toolName) {
    case 'Read': {
      const filePath = String(input.path ?? '')
      const project = getProject(run.projectRoot)
      const additionalDirectories = project.appStateStore.getState().permissions?.additionalDirectories
      const readEval = evaluateFileRead(
        { runId: run.runId, projectRoot, worktreeRoot, additionalDirectories },
        filePath,
      )
      if (readEval.behavior === 'deny') {
        return { denied: true, error: readEval.reason }
      }
      if (readEval.behavior === 'ask') {
        const approved = await requestApproval(run.runId, toolName, input, 'task-1', readEval)
        if (!approved.approved) {
          return { denied: true, error: 'User denied approval' }
        }
        if (approved.scope === 'run' && readEval.actionType !== 'builtin-tool') {
          run.allowedActions.add(actionKey(readEval.actionType, readEval.target))
        }
      }
      const content = await readProjectFile(projectRoot, filePath, worktreeRoot)
      return content === null ? { error: 'File not found' } : { content }
    }
    case 'Glob': {
      const pattern = String(input.pattern ?? '')
      const { glob } = await import('node:fs/promises')
      const cwd = resolveWorktreePath(projectRoot, worktreeRoot, '.')
      const files = await glob(pattern, { cwd })
      return { files }
    }
    case 'Grep': {
      const pattern = String(input.pattern ?? '')
      return runProjectCommand(
        projectRoot,
        `grep -Rin "${pattern.replace(/"/g, '\\"')}" .`,
        worktreeRoot,
      )
    }
    case 'Bash': {
      const command = String(input.command ?? '')
      const expectedSeconds =
        input.expectedSeconds !== undefined ? Number(input.expectedSeconds) : undefined
      const bashEval = expectedSeconds
        ? evaluateLongRunningCommand(
            { runId: run.runId, projectRoot, worktreeRoot },
            command,
            expectedSeconds,
          )
        : evaluateShellCommand(
            { runId: run.runId, projectRoot, worktreeRoot },
            command,
          )
      if (bashEval.behavior === 'deny') {
        return { denied: true, error: bashEval.reason }
      }
      if (bashEval.behavior === 'ask') {
        const approved = await requestApproval(run.runId, toolName, input, 'task-1', bashEval)
        if (!approved.approved) {
          return { denied: true, error: 'User denied approval' }
        }
        if (approved.scope === 'run' && bashEval.actionType !== 'bash-command') {
          run.allowedActions.add(actionKey(bashEval.actionType, bashEval.target))
        }
      }
      return runProjectCommand(projectRoot, command, worktreeRoot, true)
    }
    case 'Write': {
      const filePath = String(input.path ?? '')
      const content = String(input.content ?? '')
      const writeEval = evaluateFileWrite(
        { runId: run.runId, projectRoot, worktreeRoot },
        filePath,
      )
      if (writeEval.behavior === 'deny') {
        return { denied: true, error: writeEval.reason }
      }
      if (writeEval.behavior === 'ask') {
        const approved = await requestApproval(run.runId, toolName, input, 'task-1', writeEval)
        if (!approved.approved) {
          return { denied: true, error: 'User denied approval' }
        }
      }
      const safePath = resolveWorktreePath(projectRoot, worktreeRoot, filePath)
      await fs.mkdir(path.dirname(safePath), { recursive: true })
      await fs.writeFile(safePath, content, 'utf-8')
      return { written: true, path: filePath }
    }
    case 'Edit': {
      const filePath = String(input.path ?? '')
      const newText = String(input.newText ?? '')
      const writeEval = evaluateFileWrite(
        { runId: run.runId, projectRoot, worktreeRoot },
        filePath,
      )
      if (writeEval.behavior === 'deny') {
        return { denied: true, error: writeEval.reason }
      }
      if (writeEval.behavior === 'ask') {
        const approved = await requestApproval(run.runId, toolName, input, 'task-1', writeEval)
        if (!approved.approved) {
          return { denied: true, error: 'User denied approval' }
        }
      }
      const { diffId, patch } = await proposeEdit(projectRoot, filePath, newText, worktreeRoot)
      return { diffId, patch, path: filePath }
    }
    case 'TaskCreate': {
      const title = String(input.title ?? '')
      const index = Number(input.index ?? 0)
      const taskId = `task-${randomUUID().slice(0, 8)}`
      createTask(run.runId, taskId, { index, title })
      return { taskId }
    }
    case 'ApplyPatch': {
      const filePath = String(input.filePath ?? input.path ?? '')
      const patch = String(input.patch ?? '')
      const writeEval = evaluateFileWrite(
        { runId: run.runId, projectRoot, worktreeRoot },
        filePath,
      )
      if (writeEval.behavior === 'deny') {
        return { denied: true, error: writeEval.reason }
      }
      if (writeEval.behavior === 'ask') {
        const approved = await requestApproval(run.runId, toolName, input, 'task-1', writeEval)
        if (!approved.approved) {
          return { denied: true, error: 'User denied approval' }
        }
      }
      await applyProjectPatch(projectRoot, patch, worktreeRoot)
      return { applied: true, path: filePath }
    }
    case 'TaskUpdate': {
      const taskId = String(input.taskId ?? '')
      const status = String(input.status ?? '')
      if (status === 'done') completeTask(run.runId, taskId)
      else if (status === 'failed') failTask(run.runId, taskId, String(input.error ?? ''))
      else setTaskProgress(run.runId, taskId, String(input.message ?? ''))
      return { updated: taskId }
    }
    case 'TaskList':
      return listAllTasks().map(toTaskDto)
    case 'EnterWorktree': {
      const branch = String(input.branch ?? '')
      const worktree = await createIsolatedWorktree(projectRoot, branch)
      setWorktree(run.runId, worktree)
      return { worktreeRoot: worktree.root, branch: worktree.branch }
    }
    case 'ExitWorktree': {
      // No destructive action; just clear the run worktree so future edits target main.
      setWorktree(run.runId, { root: projectRoot, branch: 'main', isMain: true })
      return { worktreeRoot: projectRoot }
    }
    default:
      return { ok: true, toolName, note: 'Placeholder execution' }
  }
}

export function respondApproval(
  requestId: string,
  approved: boolean,
  scope: ApprovalScope = 'once',
): void {
  const pending = pendingApprovals.get(requestId)
  if (pending) {
    clearTimeout(pending.timeout)
    pendingApprovals.delete(requestId)
    pending.resolve({ approved, scope })
  }
  const resolved = resolveTaskApproval(requestId, approved)
  if (resolved) {
    const run = runs.get(resolved.runId)
    if (run) {
      emitToRenderer(run.projectRoot, {
        ...makeEvent(run, {
          type: 'approval_responded',
          requestId,
          approved,
          scope,
          taskId: resolved.taskId,
        }),
      })
    }
  }
}

export function listProjectTasks(_projectRoot: string): TaskInfoDto[] {
  return listAllTasks().map(toTaskDto)
}

export function listProjectAgents(_projectRoot: string): AgentInfoDto[] {
  return listAllAgents().map(toAgentDto)
}

export function updateMaxParallelAgents(n: number): void {
  setMaxParallelAgents(n)
}

export function getCurrentMaxParallelAgents(): number {
  return getMaxParallelAgents()
}

export function getProjectSafetyPolicy(
  projectRoot: string,
): import('@ur/agent-runtime').ProjectSafetyPolicy {
  const { loadProjectSafetyPolicy } = require('@ur/agent-runtime') as {
    loadProjectSafetyPolicy: (cwd: string) => import('@ur/agent-runtime').ProjectSafetyPolicy
  }
  return loadProjectSafetyPolicy(projectRoot)
}

export function setProjectSafetyPolicy(
  projectRoot: string,
  policy: import('@ur/agent-runtime').ProjectSafetyPolicy,
): string {
  const { writeProjectSafetyPolicy } = require('@ur/agent-runtime') as {
    writeProjectSafetyPolicy: (cwd: string) => string
  }
  const {
    loadProjectSafetyPolicy,
    DEFAULT_PROJECT_SAFETY_POLICY,
    writeProjectSafetyPolicy: writePolicy,
  } = require('@ur/agent-runtime') as {
    loadProjectSafetyPolicy: (cwd: string) => import('@ur/agent-runtime').ProjectSafetyPolicy
    DEFAULT_PROJECT_SAFETY_POLICY: import('@ur/agent-runtime').ProjectSafetyPolicy
    writeProjectSafetyPolicy: (cwd: string) => string
  }
  const policyPath = writePolicy(projectRoot)
  // Merge with defaults so missing fields inherit safe defaults.
  const merged = {
    ...DEFAULT_PROJECT_SAFETY_POLICY,
    ...policy,
    version: 1,
    permissionClasses: {
      ...DEFAULT_PROJECT_SAFETY_POLICY.permissionClasses,
      ...(policy.permissionClasses ?? {}),
    },
  }
  const file = path.join(projectRoot, '.ur', 'safety-policy.json')
  fs.writeFile(file, `${JSON.stringify(merged, null, 2)}\n`, 'utf-8')
  return policyPath
}

export function getRun(runId: string): RuntimeRun {
  const run = runs.get(runId)
  if (!run) {
    throw new Error(`Run not found: ${runId}`)
  }
  return run
}

export function getProject(projectRoot: string): RuntimeProject {
  const project = projects.get(projectRoot)
  if (!project) {
    throw new Error(`Project not opened: ${projectRoot}`)
  }
  return project
}

export function findRunByProject(projectRoot: string): RuntimeRun | undefined {
  for (const run of runs.values()) {
    if (run.projectRoot === projectRoot) {
      return run
    }
  }
  return undefined
}

export function findRunByWorktree(
  projectRoot: string,
  worktreeRoot?: string,
): RuntimeRun | undefined {
  for (const run of runs.values()) {
    if (run.projectRoot !== projectRoot) continue
    if (worktreeRoot) {
      if (run.worktreeRoot === worktreeRoot) return run
    } else {
      if (!run.worktreeRoot) return run
    }
  }
  return undefined
}

let rendererEmitter: ((projectRoot: string, event: unknown) => void) | null = null

export function setRendererEmitter(
  emitter: (projectRoot: string, event: unknown) => void,
): void {
  rendererEmitter = emitter
}

export function emitToRenderer(projectRoot: string, event: unknown): void {
  rendererEmitter?.(projectRoot, event)
}

function trackChangedFile(
  projectRoot: string,
  filePath: string,
  worktreeRoot?: string,
): void {
  const run = findRunByWorktree(projectRoot, worktreeRoot)
  if (run) {
    run.changedFiles.add(filePath)
  }
}

function makeEvent(
  run: RuntimeRun,
  payload: Record<string, unknown> & { type: string },
): import('../shared/ipc.js').RuntimeEvent {
  return {
    ...payload,
    type: payload.type,
    runId: run.runId,
    sessionId: run.session.sessionId,
    projectRoot: run.projectRoot,
    timestamp: Date.now(),
  } as import('../shared/ipc.js').RuntimeEvent
}

function translateRuntimeEvent(
  run: RuntimeRun,
  event: import('@ur/agent-runtime').RuntimeEvent,
): import('../shared/ipc.js').RuntimeEvent {
  const base = {
    runId: run.runId,
    sessionId: run.session.sessionId,
    projectRoot: run.projectRoot,
    timestamp: Date.now(),
  }

  const type = (event as { type?: string }).type ?? 'unknown'

  switch (type) {
    case 'thinking':
    case 'text':
      return { ...base, type: 'model_stream', delta: String((event as { text?: string }).text ?? '') } as import('../shared/ipc.js').RuntimeEvent
    case 'tool_use': {
      const toolName = String((event as { name?: string }).name ?? '')
      setAgentProgress(run.runId, 'agent-1', {
        message: `Tool call: ${toolName}`,
        currentTool: toolName,
      })
      return {
        ...base,
        type: 'tool_call_started',
        toolName,
        input: ((event as { input?: unknown }).input ?? {}) as Record<string, unknown>,
      } as import('../shared/ipc.js').RuntimeEvent
    }
    case 'tool_result': {
      const toolName = String((event as { name?: string }).name ?? '')
      setAgentProgress(run.runId, 'agent-1', {
        message: `Tool result: ${toolName}`,
        currentTool: undefined,
      })
      return {
        ...base,
        type: 'tool_call_finished',
        toolName,
        result: (event as { result?: unknown }).result,
      } as import('../shared/ipc.js').RuntimeEvent
    }
    case 'command': {
      const command = String((event as { command?: string }).command ?? '')
      setAgentProgress(run.runId, 'agent-1', {
        message: `Command: ${command}`,
        currentCommand: command,
      })
      return {
        ...base,
        type: 'command_started',
        command,
      } as import('../shared/ipc.js').RuntimeEvent
    }
    default:
      return {
        ...base,
        type: 'model_stream',
        delta: JSON.stringify(event),
      } as import('../shared/ipc.js').RuntimeEvent
  }
}

function parseSimplePatch(patch: string): Record<string, string> {
  const result: Record<string, string> = {}
  const lines = patch.split('\n')
  let currentFile: string | null = null
  let newLines: string[] = []
  for (const line of lines) {
    if (line.startsWith('+++ b/')) {
      if (currentFile) result[currentFile] = newLines.join('\n')
      currentFile = line.slice(6)
      newLines = []
    } else if (line.startsWith('+')) {
      newLines.push(line.slice(1))
    }
  }
  if (currentFile) result[currentFile] = newLines.join('\n')
  return result
}
