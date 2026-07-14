import './vendorGlobals.js'
import type Electron from 'electron'
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
  listModels,
  getCommands,
  getCommandName,
  setProvider,
  applyPatch,
  readHistory,
  setCwd,
} from '@ur/agent-runtime'
import type {
  RuntimeProject,
  RuntimeSession,
  RuntimeToolInfo,
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
  parseDesktopProviderKind,
} from './providers/providerService.js'
import type {
  DesktopProviderInfoDto,
  DesktopProviderConfigDto,
  DesktopProviderConfigPatch,
  DesktopModelInfoDto,
  DesktopProviderConnectionResultDto,
  RuntimeSlashCommandDto,
} from '../shared/ipc.js'
import {
  addRecentProject,
  listRecentProjects,
  removeRecentProject as removeStoredRecentProject,
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
  startTask,
  setTaskProgress,
  completeTask,
  failTask,
  setTaskWaitingApproval,
  resolveTaskApproval,
  addTaskChangedFile,
  setTaskVerification,
  startAgent,
  setAgentProgress,
  setAgentWaitingApproval,
  finishAgent,
  failAgent,
  setMaxParallelAgents,
  getMaxParallelAgents,
  toTaskDto,
  toAgentDto,
  listAllTasks,
  listAllAgents,
} from './taskAgentRegistry.js'

export { RuntimeProject, RuntimeSession }

// The CLI enables config reads during startup; the desktop main process must
// do the same before any session touches provider/model configuration.
import { enableConfigs } from '@ur/agent-runtime'
try {
  enableConfigs()
} catch (err) {
  console.warn(
    `[runtime] enableConfigs failed: ${err instanceof Error ? err.message : String(err)}`,
  )
}

import type {
  AgentPermissionSettingsDto,
  ApprovalScope,
  StartRunOptionsDto,
} from '../shared/ipc.js'
import {
  evaluateToolUse,
  evaluateShellCommand,
  evaluateFileWrite,
  evaluateFileRead,
  evaluateLongRunningCommand,
  evaluateProviderKeyReplacement,
  type SafetyEvaluation,
  type ActionType,
} from './safety/safetyService.js'
import { appendApprovalLog } from './safety/approvalLog.js'
import { getElectron } from './electronModule.js'
import { buildPromptContext, clearContextFiles } from './contextFiles.js'
import { RunUsageTracker, type RawUsage } from './usage.js'
import { createCheckpoint, type CreateCheckpointOptions } from './checkpoints.js'
import {
  initRunState,
  patchRunState,
  appendCompletedToolCall,
  addPendingApproval,
  removePendingApproval,
} from './sessions/runState.js'

/** Checkpointing must never break the operation it protects. */
async function safeCheckpoint(options: CreateCheckpointOptions): Promise<void> {
  try {
    await createCheckpoint(options)
  } catch (err) {
    console.warn(
      `[checkpoints] failed to snapshot (${options.reason}): ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}
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
import {
  applyAgentPermissionSettings,
  getAgentPermissionSettings,
  normalizeAgentPermissionSettings,
} from './permissionSettings.js'
import { ensureChatWorkspace } from './chatWorkspace.js'

export interface RuntimeRun {
  runId: string
  session: RuntimeSession
  projectRoot: string
  worktreeRoot?: string
  changedFiles: Set<string>
  status: 'idle' | 'running' | 'paused' | 'stopped' | 'failed' | 'finished'
  __canUseTool?: import('@ur/agent-runtime').CanUseToolFn
  allowedActions: Set<string>
  permissions: AgentPermissionSettingsDto
  usageTracker?: RunUsageTracker
}

const projects = new Map<string, RuntimeProject>()
const sessions = new Map<string, RuntimeSession>()
const runs = new Map<string, RuntimeRun>()
const sessionAllowedActions = new Set<string>()
const pendingApprovals = new Map<
  string,
  { resolve: (value: { approved: boolean; scope: ApprovalScope }) => void; timeout: NodeJS.Timeout }
>()

export async function openProjectAndCache(root: string): Promise<{ root: string }> {
  const normalized = path.resolve(root)
  const stat = await fs.stat(normalized).catch(() => null)
  if (!stat || !stat.isDirectory()) {
    throw new Error(`Not a directory: ${normalized}`)
  }
  if (!projects.has(normalized)) {
    const project = await openProject(normalized)
    projects.set(normalized, project)
  }
  await addRecentProject(normalized)
  return { root: normalized }
}

/**
 * Open the app-owned workspace used by a project-free conversation. Unlike a
 * user project, it is deliberately not added to Recents or persisted as the
 * last opened project in the renderer.
 */
export async function openChatWorkspace(): Promise<{ root: string }> {
  const root = await ensureChatWorkspace()
  if (!projects.has(root)) {
    const project = await openProject(root)
    projects.set(root, project)
  }
  return { root }
}

export function closeProject(root: string): void {
  const normalized = path.resolve(root)
  projects.delete(normalized)
  clearContextFiles(normalized)
}

/**
 * Return the live slash-command catalog from the same registry used by the
 * terminal agent. This includes project skills and plugins, while excluding
 * hidden and model-only commands that a user cannot invoke from the composer.
 */
export async function listProjectSlashCommands(
  projectRoot: string,
): Promise<RuntimeSlashCommandDto[]> {
  const project = getProject(projectRoot)
  const commands = await getCommands(project.root)
  const seen = new Set<string>()

  return commands.flatMap(command => {
    const name = getCommandName(command)
    if (
      command.isHidden === true ||
      command.userInvocable === false ||
      !name ||
      seen.has(name)
    ) {
      return []
    }
    seen.add(name)
    return [{
      name,
      description: command.description || `Run /${name}`,
      argumentHint: command.argumentHint,
      aliases: command.aliases ?? [],
      commandType: command.type,
      source: command.source,
      loadedFrom: command.loadedFrom,
    }]
  }).sort((a, b) => a.name.localeCompare(b.name))
}

export async function listProjects(): Promise<
  { root: string; name: string; lastOpenedAt: number }[]
> {
  return listRecentProjects()
}

export async function removeRecentProject(root: string): Promise<void> {
  await removeStoredRecentProject(path.resolve(root))
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
  } catch {
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
  options: StartRunOptionsDto = {},
): Promise<{ runId: string; sessionId: string; projectRoot: string; worktreeRoot?: string }> {
  const project = getProject(projectRoot)
  const runId = randomUUID()
  const permissions = options.permissions
    ? normalizeAgentPermissionSettings(options.permissions)
    : await getAgentPermissionSettings()

  // Create the run record early so the permission hook can reference it.
  const run: RuntimeRun = {
    runId,
    session: null as unknown as RuntimeSession,
    projectRoot,
    worktreeRoot: undefined,
    changedFiles: new Set(),
    status: 'idle',
    allowedActions: new Set(),
    permissions,
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
  try {
    await ensureConnectorClientsConnected(projectRoot)
  } catch (err) {
    // Best-effort: MCP connector config may not be available in test/headless
    // environments. The run can proceed without connectors.
    void err
  }

  const appState = project.appStateStore.getState()
  const providerSettings = (appState.provider ?? {}) as {
    active?: string
    model?: string
  }
  run.usageTracker = new RunUsageTracker(
    providerSettings.active,
    providerSettings.model,
  )
  await initRunState({
    runId,
    projectRoot,
    worktreeRoot: run.worktreeRoot,
    provider: {
      providerId: providerSettings.active,
      model: providerSettings.model,
    },
  })

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
    const evaluation = await evaluateRunToolUse(
      run,
      {
        name: tool.name,
        isMcp: tool.isMcp,
        isReadOnly: (i?) => tool.isReadOnly(i ?? input),
        isDestructive: tool.isDestructive ? (i?) => tool.isDestructive!(i ?? input) : undefined,
      },
      input as Record<string, unknown>,
    )

    const updatedInput =
      tool.name === 'Bash' && run.permissions.sandboxMode === 'danger-full-access'
        ? { ...input, dangerouslyDisableSandbox: true }
        : undefined

    if (evaluation.behavior === 'allow') {
      return updatedInput
        ? { behavior: 'allow', updatedInput }
        : { behavior: 'allow' }
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
      ? updatedInput
        ? { behavior: 'allow', updatedInput }
        : { behavior: 'allow' }
      : { behavior: 'deny', message: 'User denied approval' }
  }

  // The engine executes its tools relative to the runtime cwd, which is
  // process-global in the vendored bundle. Point it at the run's workspace
  // so model tool calls land in the opened project, not wherever the app
  // process happened to start.
  try {
    setCwd(run.worktreeRoot ?? project.root)
  } catch (err) {
    console.warn(
      `[runtime] setCwd failed: ${err instanceof Error ? err.message : String(err)}`,
    )
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
  attachments?: string[],
): AsyncGenerator<import('../shared/ipc.js').RuntimeEvent> {
  const run = getRun(runId)
  run.status = 'running'

  // Attached context files are read fresh at send time; unreadable
  // attachments abort the send with a precise error instead of silently
  // shipping a partial prompt.
  let effectivePrompt = prompt
  if (attachments && attachments.length > 0) {
    const { context, failures } = await buildPromptContext(
      run.projectRoot,
      attachments,
    )
    if (failures.length > 0) {
      const detail = failures
        .map(f => `${f.relPath}: ${f.reason ?? f.kind}`)
        .join('; ')
      run.status = 'idle'
      yield makeEvent(run, {
        type: 'run_failed',
        error: `Attachments could not be read — ${detail}`,
      })
      return
    }
    if (context) {
      effectivePrompt = `${context}\n\n${prompt}`
    }
  }

  patchRunState(runId, { pendingPrompt: prompt, status: 'running' })

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

    for await (const event of runPrompt(run.session, effectivePrompt)) {
      const translatedEvents = translateRuntimeEvents(run, event)
      if (translatedEvents.length === 0) {
        // Keep full fidelity in the persisted transcript even for events
        // that produce no UI output.
        await appendEvent(runId, event as unknown as Record<string, unknown>)
        continue
      }
      for (const translated of translatedEvents) {
        await appendEvent(runId, translated as unknown as Record<string, unknown>)
        if (translated.type === 'run_result') {
          const usage = (translated as import('../shared/ipc.js').RunResultEvent).usage
          await updateRun(runId, {
            costUsd: usage.costUsd,
            tokenUsage: {
              inputTokens: usage.inputTokens,
              outputTokens: usage.outputTokens,
              totalTokens: usage.inputTokens + usage.outputTokens,
            },
          }).catch(() => undefined)
        }
        yield translated
      }
    }

    completeTask(runId, 'task-1')
    finishAgent(runId, 'agent-1')
    setTaskVerification(runId, 'task-1', {
      passed: true,
      level: 'l1',
      message: 'Run completed',
    })

    if (run.changedFiles.size > 0) {
      await safeCheckpoint({
        projectRoot: run.worktreeRoot ?? run.projectRoot,
        reason: 'Task completed',
        trigger: 'task-completed',
        files: [...run.changedFiles],
        sessionId: run.runId,
        taskId: 'task-1',
      })
    }

    run.status = 'finished'
    patchRunState(runId, {
      status: 'finished',
      lastPrompt: prompt,
      pendingPrompt: undefined,
      changedFiles: [...run.changedFiles],
    })
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
    patchRunState(runId, { status: 'failed', pendingPrompt: undefined })
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
): Promise<{ diffId: string; patch: string; baseHashes: Record<string, string> }> {
  const safePath = resolveWorktreePath(projectRoot, worktreeRoot, filePath)
  const original = await fs.readFile(safePath, 'utf-8').catch(() => '')
  const diffId = randomUUID()
  const patch = buildUnifiedDiff(filePath, original, newText)
  const { hashContent } = await import('./diffs.js')
  // Base hash lets hunk application detect stale diffs after further edits.
  const baseHashes = { [filePath]: hashContent(original) }
  const run = findRunByWorktree(projectRoot, worktreeRoot)
  if (run) {
    emitToRenderer(projectRoot, {
      ...makeEvent(run, { type: 'diff_created', diffId, filePath, patch, baseHashes }),
    })
  }
  return { diffId, patch, baseHashes }
}

export async function applyProjectPatch(
  projectRoot: string,
  patch: string,
  worktreeRoot?: string,
): Promise<void> {
  const project = getProject(projectRoot)
  const targetRoot =
    worktreeRoot && worktreeRoot !== project.root ? worktreeRoot : project.root

  const touchedFiles = parsePatchFilePaths(patch)
  await safeCheckpoint({
    projectRoot: targetRoot,
    reason: `Before applying patch to ${touchedFiles.join(', ') || 'files'}`,
    trigger: 'before-edit',
    files: touchedFiles,
  })

  const { execFile } = await import('node:child_process')
  const { promisify } = await import('node:util')
  const execFileAsync = promisify(execFile)
  const os = await import('node:os')

  const patchText = patch.endsWith('\n') ? patch : `${patch}\n`
  const tmpFile = path.join(
    os.tmpdir(),
    `ur-desktop-patch-${randomUUID()}.patch`,
  )
  await fs.writeFile(tmpFile, patchText, 'utf-8')
  try {
    await execFileAsync(
      'git',
      ['apply', '--whitespace=nowarn', '--recount', tmpFile],
      { cwd: targetRoot },
    )
  } catch (gitError) {
    // Non-git targets (or malformed contexts) fall back to the runtime's
    // patch application against the main project.
    if (targetRoot === project.root) {
      await applyPatch(project, patchText)
    } else {
      const message =
        gitError instanceof Error ? gitError.message : String(gitError)
      throw new Error(`Patch could not be applied in ${targetRoot}: ${message}`)
    }
  } finally {
    await fs.rm(tmpFile, { force: true }).catch(() => undefined)
  }

  for (const filePath of parsePatchFilePaths(patchText)) {
    trackChangedFile(projectRoot, filePath, worktreeRoot)
    const run = findRunByWorktree(projectRoot, worktreeRoot)
    if (run) {
      emitToRenderer(projectRoot, {
        ...makeEvent(run, { type: 'patch_applied', diffId: '', filePath }),
      })
    }
  }

  await safeCheckpoint({
    projectRoot: targetRoot,
    reason: `After applying patch to ${touchedFiles.join(', ') || 'files'}`,
    trigger: 'after-edit',
    files: touchedFiles,
  })
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
  // Provider config is global; a project need not be open. This synchronous
  // path only returns statically-known/cached models — the renderer uses the
  // async `listProjectProviderModels` for live discovery.
  const config = getDesktopProviderConfig(projectRoot)
  const project = projectRoot ? projects.get(path.resolve(projectRoot)) : undefined
  const runtimeModels = project ? listModels(project) : []
  const models = runtimeModels.map(m => ({
    id: m.id,
    displayName: m.displayName,
    provider: config.providerId,
  }))
  // Always surface the configured model even when nothing else is cached, so
  // the dropdown is never empty for a configured provider.
  if (config.model && !models.some(m => m.id === config.model)) {
    models.unshift({ id: config.model, displayName: config.model, provider: config.providerId })
  }
  return models
}

export async function updateProjectProvider(
  projectRoot: string,
  providerId: string,
  model?: string,
): Promise<void> {
  const project = getProject(projectRoot)
  await setProvider(project, providerId as ProviderId, model)
}

export function getProjectProviderConfig(
  projectRoot: string,
  providerId?: string,
): DesktopProviderConfigDto {
  return getDesktopProviderConfig(
    projectRoot,
    providerId === undefined ? undefined : parseDesktopProviderKind(providerId),
  )
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
  await storeDesktopProviderApiKey(projectRoot, parseDesktopProviderKind(providerId), apiKey)
}

export async function clearProjectProviderApiKey(
  projectRoot: string,
  providerId: string,
): Promise<void> {
  const evaluation = {
    ...evaluateProviderKeyReplacement(providerId),
    reason: 'Removing a provider API key disconnects that provider until a new key is added.',
  }
  const approved = await requestStandaloneApproval(projectRoot, evaluation)
  if (!approved.approved) {
    throw new Error('User denied provider key removal')
  }
  await clearDesktopProviderApiKey(projectRoot, parseDesktopProviderKind(providerId))
}

export async function testProjectProviderConnection(
  projectRoot: string,
  providerId: string,
): Promise<DesktopProviderConnectionResultDto> {
  return testDesktopProviderConnection(projectRoot, parseDesktopProviderKind(providerId))
}

export async function listProjectProviderModels(
  projectRoot: string,
  providerId: string,
): Promise<DesktopModelInfoDto[]> {
  return listDesktopProviderModels(projectRoot, parseDesktopProviderKind(providerId))
}

export function setActiveProjectProvider(
  projectRoot: string,
  providerId: string,
  model?: string,
): { ok: true; message: string } | { ok: false; message: string } {
  return activateDesktopProvider(projectRoot, parseDesktopProviderKind(providerId), model)
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
  // Export the report of the most recent run for this project (running or
  // finished), built from the persisted transcript — not a static stub.
  void worktreeRoot
  const runsForProject = await listRuns({ projectRoot, limit: 1 })
  if (runsForProject.length === 0) {
    throw new Error('No runs recorded for this project yet')
  }
  return exportRunReport(projectRoot, runsForProject[0].runId, 'markdown')
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

function sessionActionKey(
  projectRoot: string,
  actionType: ActionType,
  target: string,
): string {
  return `${path.resolve(projectRoot)}:${actionKey(actionType, target)}`
}

function runAllowsAction(run: RuntimeRun, actionType: ActionType, target: string): boolean {
  return run.allowedActions.has(actionKey(actionType, target)) ||
    sessionAllowedActions.has(sessionActionKey(run.projectRoot, actionType, target))
}

async function evaluateRunToolUse(
  run: RuntimeRun,
  tool: {
    name: string
    isMcp?: boolean
    isReadOnly?: (input?: unknown) => boolean
    isDestructive?: (input?: unknown) => boolean
  },
  input: Record<string, unknown>,
): Promise<SafetyEvaluation> {
  const project = getProject(run.projectRoot)
  const additionalDirectories = project.appStateStore.getState().permissions?.additionalDirectories
  const context = {
    runId: run.runId,
    projectRoot: run.projectRoot,
    worktreeRoot: run.worktreeRoot,
    additionalDirectories,
  }

  let evaluation: SafetyEvaluation
  if (tool.name === 'Read') {
    evaluation = evaluateFileRead(context, String(input.path ?? input.filePath ?? ''))
  } else if (tool.name === 'Write' || tool.name === 'Edit' || tool.name === 'ApplyPatch') {
    evaluation = evaluateFileWrite(context, String(input.path ?? input.filePath ?? ''))
  } else if (tool.name === 'Bash') {
    const command = String(input.command ?? '')
    const expectedSeconds = input.expectedSeconds === undefined
      ? undefined
      : Number(input.expectedSeconds)
    evaluation = expectedSeconds !== undefined && Number.isFinite(expectedSeconds)
      ? evaluateLongRunningCommand(context, command, expectedSeconds)
      : evaluateShellCommand(context, command)
  } else {
    evaluation = await evaluateToolUse(context, tool, input)
  }

  return applyAgentPermissionSettings(evaluation, run.permissions)
}

async function getFocusedWindow(): Promise<Electron.BrowserWindow | null> {
  const electron = await getElectron()
  return electron.BrowserWindow.getFocusedWindow() ?? electron.BrowserWindow.getAllWindows()[0] ?? null
}

async function showNativeApprovalDialog(
  projectRoot: string,
  evaluation: SafetyEvaluation,
  parentWindow?: Electron.BrowserWindow | null,
): Promise<{ approved: boolean; scope: ApprovalScope }> {
  const win = parentWindow ?? (await getFocusedWindow())
  const buttons = ['Allow once', 'Allow for this run', 'Deny']
  const electron = await getElectron()
  const { response } = await electron.dialog.showMessageBox(win ?? undefined as unknown as Electron.BrowserWindow, {
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
  parentWindow?: Electron.BrowserWindow,
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

  addPendingApproval(runId, requestId, toolName, evaluation?.target)
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
        approvalProjectRoot: run.projectRoot,
      }),
    })
  })
  removePendingApproval(runId, requestId)

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
  if (result.approved && result.scope === 'session' && evaluation) {
    sessionAllowedActions.add(
      sessionActionKey(run.projectRoot, evaluation.actionType, evaluation.target),
    )
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
    const evaluation = await evaluateRunToolUse(run, { name: toolName }, input)
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
    // Always execute through the local tool implementations. The bundled
    // runtime's requestToolCall acknowledges the request without performing
    // it (static success), which is exactly the kind of fake behavior the
    // desktop app must not rely on.
    const result: unknown = await executeToolLocal(run, toolName, input, {
      permissionChecked: !opts.skipApproval,
    })

    if (toolName === 'Write' || toolName === 'Edit' || toolName === 'ApplyPatch') {
      const filePath = String(input.path ?? input.filePath ?? '')
      if (filePath) {
        trackChangedFile(run.projectRoot, filePath, run.worktreeRoot)
        addTaskChangedFile(runId, taskId, filePath)
      }
    }

    // Side-effecting tool completions are persisted so an interrupted run
    // can be resumed without repeating them.
    const SIDE_EFFECT_TOOLS = new Set(['Write', 'Edit', 'ApplyPatch', 'Bash', 'EnterWorktree'])
    if (SIDE_EFFECT_TOOLS.has(toolName)) {
      const denied = typeof result === 'object' && result !== null && 'denied' in result
      if (!denied) {
        appendCompletedToolCall(
          runId,
          toolName,
          String(input.path ?? input.filePath ?? input.command ?? ''),
        )
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
  opts: { permissionChecked?: boolean } = {},
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
      if (!opts.permissionChecked && readEval.behavior === 'deny') {
        return { denied: true, error: readEval.reason }
      }
      if (!opts.permissionChecked && readEval.behavior === 'ask') {
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
      const cwd = resolveWorktreePath(projectRoot, worktreeRoot, '.')
      // Electron's embedded Node (20.x) has no fs.glob; use the local walker.
      const files = await globProjectFiles(cwd, pattern)
      return { files }
    }
    case 'Grep': {
      const { runSearch } = await import('./search.js')
      const searchRoot = resolveWorktreePath(projectRoot, worktreeRoot, '.')
      const result = await runSearch({
        projectRoot: searchRoot,
        pattern: String(input.pattern ?? ''),
        fixed: input.fixed === true,
        caseSensitive: input.caseSensitive !== false,
        include:
          typeof input.include === 'string'
            ? [input.include]
            : (input.include as string[] | undefined),
        exclude:
          typeof input.exclude === 'string'
            ? [input.exclude]
            : (input.exclude as string[] | undefined),
      })
      return result
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
      if (!opts.permissionChecked && bashEval.behavior === 'deny') {
        return { denied: true, error: bashEval.reason }
      }
      if (!opts.permissionChecked && bashEval.behavior === 'ask') {
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
      if (!opts.permissionChecked && writeEval.behavior === 'deny') {
        return { denied: true, error: writeEval.reason }
      }
      if (!opts.permissionChecked && writeEval.behavior === 'ask') {
        const approved = await requestApproval(run.runId, toolName, input, 'task-1', writeEval)
        if (!approved.approved) {
          return { denied: true, error: 'User denied approval' }
        }
      }
      await safeCheckpoint({
        projectRoot,
        reason: `Before Write ${filePath}`,
        trigger: 'before-tool',
        files: [filePath],
        sessionId: run.runId,
      })
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
      if (!opts.permissionChecked && writeEval.behavior === 'deny') {
        return { denied: true, error: writeEval.reason }
      }
      if (!opts.permissionChecked && writeEval.behavior === 'ask') {
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
      if (!opts.permissionChecked && writeEval.behavior === 'deny') {
        return { denied: true, error: writeEval.reason }
      }
      if (!opts.permissionChecked && writeEval.behavior === 'ask') {
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
      return {
        error: `Tool ${toolName} is not available in the desktop runtime`,
        unsupported: true,
      }
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

export async function setProjectSafetyPolicy(
  projectRoot: string,
  policy: import('@ur/agent-runtime').ProjectSafetyPolicy,
): Promise<string> {
  const { DEFAULT_PROJECT_SAFETY_POLICY } = require('@ur/agent-runtime') as {
    DEFAULT_PROJECT_SAFETY_POLICY: import('@ur/agent-runtime').ProjectSafetyPolicy
  }
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
  const temp = `${file}.${process.pid}.${randomUUID()}.tmp`
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(temp, `${JSON.stringify(merged, null, 2)}\n`, {
    encoding: 'utf-8',
    mode: 0o600,
  })
  await fs.rename(temp, file)
  return file
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

function translateRuntimeEvents(
  run: RuntimeRun,
  event: import('@ur/agent-runtime').RuntimeEvent,
): import('../shared/ipc.js').RuntimeEvent[] {
  const base = {
    runId: run.runId,
    sessionId: run.session.sessionId,
    projectRoot: run.projectRoot,
    timestamp: Date.now(),
  }

  const type = (event as { type?: string }).type ?? 'unknown'
  const asEvent = (payload: Record<string, unknown>) =>
    ({ ...base, ...payload }) as import('../shared/ipc.js').RuntimeEvent

  switch (type) {
    case 'thinking':
    case 'text':
      return [
        asEvent({
          type: 'model_stream',
          delta: String((event as { text?: string }).text ?? ''),
        }),
      ]
    case 'assistant': {
      // SDK-style assistant message: text/tool_use content blocks plus
      // per-request usage.
      const events: import('../shared/ipc.js').RuntimeEvent[] = []
      const message = (event as {
        message?: {
          content?: Array<Record<string, unknown>> | string
          usage?: RawUsage
        }
      }).message
      if (message?.usage && run.usageTracker) {
        run.usageTracker.addMessageUsage(message.usage)
        events.push(
          asEvent({ type: 'usage_updated', usage: run.usageTracker.snapshot() }),
        )
      }
      const blocks = Array.isArray(message?.content) ? message.content : []
      if (typeof message?.content === 'string' && message.content) {
        events.push(asEvent({ type: 'model_stream', delta: message.content }))
      }
      for (const block of blocks) {
        if (block.type === 'text' && typeof block.text === 'string' && block.text) {
          events.push(asEvent({ type: 'model_stream', delta: block.text }))
        } else if (block.type === 'tool_use') {
          const toolName = String(block.name ?? '')
          setAgentProgress(run.runId, 'agent-1', {
            message: `Tool call: ${toolName}`,
            currentTool: toolName,
          })
          events.push(
            asEvent({
              type: 'tool_call_started',
              toolName,
              input: (block.input ?? {}) as Record<string, unknown>,
            }),
          )
        }
      }
      return events
    }
    case 'tool_use': {
      const toolName = String((event as { name?: string }).name ?? '')
      setAgentProgress(run.runId, 'agent-1', {
        message: `Tool call: ${toolName}`,
        currentTool: toolName,
      })
      return [
        asEvent({
          type: 'tool_call_started',
          toolName,
          input: ((event as { input?: unknown }).input ?? {}) as Record<string, unknown>,
        }),
      ]
    }
    case 'tool_result': {
      const toolName = String((event as { name?: string }).name ?? '')
      setAgentProgress(run.runId, 'agent-1', {
        message: `Tool result: ${toolName}`,
        currentTool: undefined,
      })
      return [
        asEvent({
          type: 'tool_call_finished',
          toolName,
          result: (event as { result?: unknown }).result,
        }),
      ]
    }
    case 'command': {
      const command = String((event as { command?: string }).command ?? '')
      setAgentProgress(run.runId, 'agent-1', {
        message: `Command: ${command}`,
        currentCommand: command,
      })
      return [asEvent({ type: 'command_started', command })]
    }
    case 'result': {
      // Final run summary: authoritative usage and provider-reported cost.
      const e = event as {
        usage?: RawUsage
        total_cost_usd?: number
        duration_ms?: number
        num_turns?: number
        result?: string
        is_error?: boolean
      }
      if (run.usageTracker) {
        run.usageTracker.setFinalUsage(e.usage ?? {}, e.total_cost_usd)
        return [
          asEvent({
            type: 'run_result',
            usage: run.usageTracker.snapshot(),
            durationMs: e.duration_ms,
            numTurns: e.num_turns,
            resultText: e.result,
            isError: e.is_error === true,
          }),
        ]
      }
      return []
    }
    default:
      // Unknown event types are persisted to the transcript by the caller
      // but produce no chat noise.
      return []
  }
}

/** Convert a glob pattern (`*`, `?`, `**`) to a regular expression. */
function globPatternToRegExp(pattern: string): RegExp {
  let regex = ''
  let i = 0
  while (i < pattern.length) {
    const ch = pattern[i]
    if (ch === '*') {
      if (pattern[i + 1] === '*') {
        // `**/` matches any number of directories including none.
        if (pattern[i + 2] === '/') {
          regex += '(?:[^/]+/)*'
          i += 3
        } else {
          regex += '.*'
          i += 2
        }
      } else {
        regex += '[^/]*'
        i += 1
      }
    } else if (ch === '?') {
      regex += '[^/]'
      i += 1
    } else {
      regex += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&')
      i += 1
    }
  }
  return new RegExp(`^${regex}$`)
}

const GLOB_SKIP_DIRS = new Set(['.git', 'node_modules'])

/**
 * Dependency-free recursive glob. Electron's embedded Node has no fs.glob,
 * and the desktop app must not add search dependencies for this.
 */
export async function globProjectFiles(
  cwd: string,
  pattern: string,
  limit = 5000,
): Promise<string[]> {
  const matcher = globPatternToRegExp(pattern)
  const results: string[] = []

  async function walk(relDir: string): Promise<void> {
    if (results.length >= limit) return
    const absDir = path.join(cwd, relDir)
    let entries
    try {
      entries = await fs.readdir(absDir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (results.length >= limit) return
      const rel = relDir ? `${relDir}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        if (!GLOB_SKIP_DIRS.has(entry.name)) {
          await walk(rel)
        }
      } else if (matcher.test(rel)) {
        results.push(rel)
      }
    }
  }

  await walk('')
  return results.sort()
}

/** File paths touched by a unified diff (from +++ b/ headers). */
function parsePatchFilePaths(patch: string): string[] {
  const paths: string[] = []
  for (const line of patch.split('\n')) {
    if (line.startsWith('+++ b/')) {
      paths.push(line.slice(6).trim())
    } else if (line.startsWith('+++ ') && !line.includes('/dev/null')) {
      paths.push(line.slice(4).trim())
    }
  }
  return paths
}

/**
 * Line-based unified diff (Myers via simple LCS table) with 3 lines of
 * context. Suitable for the file sizes the desktop edit flow handles.
 */
export function buildUnifiedDiff(
  filePath: string,
  original: string,
  updated: string,
): string {
  if (original === updated) {
    return ''
  }
  // A trailing newline means the split produces a phantom empty final
  // element; drop it so hunk line counts match what git sees.
  const aEndsNewline = original.endsWith('\n')
  const bEndsNewline = updated.endsWith('\n')
  const a = original.split('\n')
  if (aEndsNewline) a.pop()
  const b = updated.split('\n')
  if (bEndsNewline) b.pop()

  // LCS table.
  const n = a.length
  const m = b.length
  const lcs: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  )
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] =
        a[i] === b[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1])
    }
  }

  type Op = { kind: ' ' | '-' | '+'; line: string; aLine: number; bLine: number }
  const ops: Op[] = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ kind: ' ', line: a[i], aLine: i, bLine: j })
      i++
      j++
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ kind: '-', line: a[i], aLine: i, bLine: j })
      i++
    } else {
      ops.push({ kind: '+', line: b[j], aLine: i, bLine: j })
      j++
    }
  }
  while (i < n) {
    ops.push({ kind: '-', line: a[i], aLine: i, bLine: j })
    i++
  }
  while (j < m) {
    ops.push({ kind: '+', line: b[j], aLine: i, bLine: j })
    j++
  }

  // Group into hunks with context.
  const CONTEXT = 3
  const changedIdx = ops
    .map((op, idx) => (op.kind === ' ' ? -1 : idx))
    .filter(idx => idx !== -1)
  if (changedIdx.length === 0) return ''

  const hunks: Array<{ start: number; end: number }> = []
  let hunkStart = Math.max(0, changedIdx[0] - CONTEXT)
  let hunkEnd = Math.min(ops.length - 1, changedIdx[0] + CONTEXT)
  for (const idx of changedIdx.slice(1)) {
    if (idx - CONTEXT <= hunkEnd + 1) {
      hunkEnd = Math.min(ops.length - 1, idx + CONTEXT)
    } else {
      hunks.push({ start: hunkStart, end: hunkEnd })
      hunkStart = Math.max(0, idx - CONTEXT)
      hunkEnd = Math.min(ops.length - 1, idx + CONTEXT)
    }
  }
  hunks.push({ start: hunkStart, end: hunkEnd })

  const out: string[] = [`--- a/${filePath}`, `+++ b/${filePath}`]
  for (const hunk of hunks) {
    const slice = ops.slice(hunk.start, hunk.end + 1)
    const aStart = (slice.find(op => op.kind !== '+')?.aLine ?? ops[hunk.start].aLine) + 1
    const bStart = (slice.find(op => op.kind !== '-')?.bLine ?? ops[hunk.start].bLine) + 1
    const aCount = slice.filter(op => op.kind !== '+').length
    const bCount = slice.filter(op => op.kind !== '-').length
    out.push(`@@ -${aStart},${aCount} +${bStart},${bCount} @@`)
    for (const op of slice) {
      out.push(`${op.kind}${op.line}`)
      const isLastOfA =
        op.kind !== '+' && op.aLine === a.length - 1 && !aEndsNewline
      const isLastOfB =
        op.kind !== '-' && op.bLine === b.length - 1 && !bEndsNewline
      if (isLastOfA || isLastOfB) {
        out.push('\\ No newline at end of file')
      }
    }
  }
  return `${out.join('\n')}\n`
}
