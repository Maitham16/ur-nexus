import type Electron from 'electron'
import * as path from 'node:path'
import type {
  IpcChannel,
  ReadFileRequestDto,
  ProposeEditRequestDto,
  ApplyPatchRequestDto,
  RunCommandRequestDto,
  AddMcpServerRequestDto,
  ApprovalResponseDto,
  GetSafetyPolicyRequestDto,
  SetSafetyPolicyRequestDto,
  ListRunsRequestDto,
  GetRunRequestDto,
  DeleteRunRequestDto,
  ExportReportRequestDto,
  GetReportRequestDto,
  AddConnectorRequestDto,
  UpdateConnectorRequestDto,
  CallConnectorToolRequestDto,
  AddContextFilesRequestDto,
  ExplorerListRequestDto,
  ExplorerMutationRequestDto,
  GitDiffRequestDto,
  SaveFileDialogRequestDto,
  SearchRequestDto,
  ApplyHunksRequestDto,
  ParseDiffRequestDto,
  TestRunRequestDto,
  LaunchBackgroundAgentRequestDto,
  CheckpointRequestDto,
  GeneratePlanRequestDto,
  ExecutePlanRequestDto,
  ResumeRunRequestDto,
  AgentPermissionSettingsDto,
  StartRunOptionsDto,
  ApprovalScope,
  DesktopProviderConfigPatch,
  ProjectSafetyPolicyDto,
} from '../shared/ipc.js'
import {
  openProjectAndCache,
  openChatWorkspace,
  listProjects,
  removeRecentProject,
  getProjectInfo,
  createRunWorktree,
  listWorktrees,
  startRun,
  stopRunById,
  pauseRunById,
  resumeRunById,
  runPromptStream,
  readProjectFile,
  proposeEdit,
  applyProjectPatch,
  runProjectCommand,
  stopProjectCommand,
  listProjectTerminalCommands,
  listProjectToolDefinitions,
  listProjectSlashCommands,
  listProjectProviders,
  listProjectModels,
  getProjectProviderConfig,
  setProjectProviderConfig,
  storeProjectProviderApiKey,
  clearProjectProviderApiKey,
  testProjectProviderConnection,
  listProjectProviderModels,
  setActiveProjectProvider,
  listProjectMcpServers,
  addProjectMcpServer,
  removeProjectMcpServer,
  listProjectConnectors,
  addProjectConnector,
  updateProjectConnector,
  removeProjectConnector,
  testProjectConnector,
  listProjectConnectorTools,
  callProjectConnectorTool,
  readProjectHistory,
  exportProjectReport,
  listProjectTasks,
  listProjectAgents,
  respondApproval,
  updateMaxParallelAgents,
  getCurrentMaxParallelAgents,
  getProjectSafetyPolicy,
  setProjectSafetyPolicy,
  listProjectRuns,
  getProjectRun,
  deleteProjectRun,
  exportRunReport,
  getRunReport,
  closeProject,
  requestStandaloneApproval,
} from './runtime.js'
import {
  openProjectDialog,
  openFilesDialog,
  saveFileDialog,
} from './dialogs.js'
import {
  addContextFiles,
  removeContextFile,
  listContextFiles,
} from './contextFiles.js'
import {
  listExplorerEntries,
  createExplorerEntry,
  renameExplorerEntry,
  deleteExplorerEntry,
  gitStatus,
  gitDiff,
  gitRevertFile,
} from './explorer.js'
import { runSearch } from './search.js'
import { parseUnifiedDiff, applySelectedHunks } from './diffs.js'
import { runStructuredTests, buildRerunFailedCommand } from './testRunner.js'
import {
  launchBackgroundAgent,
  listBackgroundAgents,
  getBackgroundAgent,
  cancelBackgroundAgent,
  retryBackgroundAgent,
  removeBackgroundAgent,
  setBackgroundAgentConcurrency,
  reconcileBackgroundAgents,
} from './agents/backgroundAgents.js'
import {
  createCheckpoint,
  listCheckpoints,
  previewRewind,
  rewindToCheckpoint,
  deleteCheckpoint,
  readRewindAudit,
} from './checkpoints.js'
import { generatePlan, executePlan, shouldPlan } from './planning.js'
import {
  listInterruptedRuns,
  getRunState,
  markRunStateFailed,
  archiveRunState,
  reconcileRunStates,
} from './sessions/runState.js'
import { prepareResume } from './sessions/resume.js'
import { readTranscript } from './historyStore.js'
import {
  evaluateFileWrite,
  evaluateFileDelete,
  evaluateShellCommand,
} from './safety/safetyService.js'
import { refreshApplicationMenu } from './menu.js'
import { getElectron } from './electronModule.js'
import { checkForUpdates } from './autoUpdate.js'
import {
  getAgentPermissionSettings,
  setAgentPermissionSettings,
} from './permissionSettings.js'

type Handler = (...args: unknown[]) => unknown

function expectString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Invalid IPC argument: ${name} must be a non-empty string`)
  }
  return value
}

function optionalString(value: unknown, name: string): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') {
    throw new Error(`Invalid IPC argument: ${name} must be a string`)
  }
  return value
}

function expectObject<T extends Record<string, unknown>>(
  value: unknown,
  name: string,
): T {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Invalid IPC argument: ${name} must be an object`)
  }
  return value as T
}

function expectStringArray(value: unknown, name: string): string[] {
  if (!Array.isArray(value) || value.some(v => typeof v !== 'string')) {
    throw new Error(`Invalid IPC argument: ${name} must be a string array`)
  }
  return value as string[]
}

function expectApprovalScope(value: unknown): ApprovalScope {
  if (value === undefined) return 'once'
  if (value === 'once' || value === 'run' || value === 'session') return value
  throw new Error('Invalid IPC argument: scope must be once, run, or session')
}

function expectRecordOfStrings(value: unknown, name: string): Record<string, string> {
  const record = expectObject<Record<string, unknown>>(value, name)
  for (const [key, item] of Object.entries(record)) {
    if (!key || typeof item !== 'string') {
      throw new Error(`Invalid IPC argument: ${name} must contain string values`)
    }
  }
  return record as Record<string, string>
}

function expectPolicyRules(
  value: unknown,
  name: string,
): Array<{ pattern: string; reason: string }> {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid IPC argument: ${name} must be an array`)
  }
  return value.map((rule, index) => {
    const item = expectObject<Record<string, unknown>>(rule, `${name}[${index}]`)
    return {
      pattern: expectString(item.pattern, `${name}[${index}].pattern`),
      reason: expectString(item.reason, `${name}[${index}].reason`),
    }
  })
}

function expectPermissionClasses(value: unknown): Array<'read' | 'write' | 'execute' | 'network'> {
  const classes = expectStringArray(value, 'policy.sandboxRequiredFor')
  if (classes.some(item => !['read', 'write', 'execute', 'network'].includes(item))) {
    throw new Error(
      'Invalid IPC argument: policy.sandboxRequiredFor contains an unknown permission class',
    )
  }
  return classes as Array<'read' | 'write' | 'execute' | 'network'>
}

function expectSafetyPolicy(value: unknown): ProjectSafetyPolicyDto {
  const policy = expectObject<Record<string, unknown>>(value, 'policy')
  if (policy.version !== 1) {
    throw new Error('Invalid IPC argument: policy.version must be 1')
  }
  const developerMode = policy.developerMode === undefined
    ? undefined
    : expectObject<Record<string, unknown>>(policy.developerMode, 'policy.developerMode')
  if (
    developerMode?.denyBecomesAsk !== undefined &&
    typeof developerMode.denyBecomesAsk !== 'boolean'
  ) {
    throw new Error('Invalid IPC argument: policy.developerMode.denyBecomesAsk must be boolean')
  }
  return {
    version: 1,
    permissionClasses: expectRecordOfStrings(
      policy.permissionClasses,
      'policy.permissionClasses',
    ),
    askBefore: expectPolicyRules(policy.askBefore, 'policy.askBefore'),
    deny: expectPolicyRules(policy.deny, 'policy.deny'),
    secretFiles: expectStringArray(policy.secretFiles, 'policy.secretFiles'),
    secretEnvPatterns: expectStringArray(
      policy.secretEnvPatterns,
      'policy.secretEnvPatterns',
    ),
    networkCommands: expectStringArray(policy.networkCommands, 'policy.networkCommands'),
    sandboxRequiredFor: expectPermissionClasses(policy.sandboxRequiredFor),
    developerMode: developerMode
      ? { denyBecomesAsk: developerMode.denyBecomesAsk === true }
      : undefined,
  }
}

async function openInDefaultApp(target: string): Promise<void> {
  const electron = await getElectron()
  const result = await electron.shell.openPath(target)
  if (result) throw new Error(result)
}

async function revealInFinder(target: string): Promise<void> {
  const electron = await getElectron()
  electron.shell.showItemInFolder(target)
}

/**
 * Register every IPC channel exposed to the renderer. Each handler validates
 * its inputs; thrown errors reject the renderer's invoke promise with the
 * message intact, so no channel can silently fail.
 */
export function registerIpcHandlers(
  ipcMain: Electron.IpcMain,
  broadcast: (channel: string, payload: unknown) => void,
): void {
  const handlers: Record<IpcChannel, Handler> = {
    // ------ Native dialogs ------
    'dialog:open-project': () => openProjectDialog(),
    'dialog:open-files': (options?: unknown) =>
      openFilesDialog(
        options === undefined
          ? undefined
          : expectObject<{ multi?: boolean; defaultPath?: string }>(
              options,
              'options',
            ),
      ),
    'dialog:save-file': (req: unknown) =>
      saveFileDialog(expectObject<SaveFileDialogRequestDto>(req ?? {}, 'req')),

    // ------ Projects ------
    'project:open': async (root: unknown) => {
      const result = await openProjectAndCache(expectString(root, 'root'))
      await refreshApplicationMenu().catch(() => undefined)
      return result
    },
    'project:close': (root: unknown) => closeProject(expectString(root, 'root')),
    'project:list': () => listProjects(),
    'project:recent': () => listProjects(),
    'project:remove-recent': async (root: unknown) => {
      await removeRecentProject(expectString(root, 'root'))
      await refreshApplicationMenu().catch(() => undefined)
    },
    'project:inspect': (root: unknown) =>
      getProjectInfo(expectString(root, 'root')),
    'project:chat-workspace': () => openChatWorkspace(),

    // ------ Context files ------
    'context:add-files': (req: unknown) => {
      const r = expectObject<AddContextFilesRequestDto>(req, 'req')
      return addContextFiles(
        expectString(r.projectRoot, 'projectRoot'),
        expectStringArray(r.paths, 'paths'),
      )
    },
    'context:remove-file': (projectRoot: unknown, filePath: unknown) =>
      removeContextFile(
        expectString(projectRoot, 'projectRoot'),
        expectString(filePath, 'filePath'),
      ),
    'context:list': (projectRoot: unknown) =>
      listContextFiles(expectString(projectRoot, 'projectRoot')),

    // ------ File explorer ------
    'explorer:list': (req: unknown) => {
      const r = expectObject<ExplorerListRequestDto>(req, 'req')
      return listExplorerEntries(
        expectString(r.projectRoot, 'projectRoot'),
        optionalString(r.relPath, 'relPath') ?? '',
        r.showIgnored === true,
      )
    },
    'explorer:create': async (req: unknown) => {
      const r = expectObject<ExplorerMutationRequestDto>(req, 'req')
      const projectRoot = expectString(r.projectRoot, 'projectRoot')
      const relPath = expectString(r.relPath, 'relPath')
      const kind = r.kind === 'directory' ? 'directory' : 'file'
      const evaluation = evaluateFileWrite(
        { runId: '', projectRoot },
        path.resolve(projectRoot, relPath),
      )
      if (evaluation.behavior === 'deny') throw new Error(evaluation.reason)
      const approved = await requestStandaloneApproval(projectRoot, {
        ...evaluation,
        behavior: 'ask',
        reason: `Create ${kind} ${relPath}`,
      })
      if (!approved.approved) throw new Error('Creation was not approved')
      await createExplorerEntry(projectRoot, relPath, kind)
    },
    'explorer:rename': async (req: unknown) => {
      const r = expectObject<ExplorerMutationRequestDto>(req, 'req')
      const projectRoot = expectString(r.projectRoot, 'projectRoot')
      await renameExplorerEntry(
        projectRoot,
        expectString(r.relPath, 'relPath'),
        expectString(r.newRelPath, 'newRelPath'),
      )
    },
    'explorer:delete': async (req: unknown) => {
      const r = expectObject<ExplorerMutationRequestDto>(req, 'req')
      const projectRoot = expectString(r.projectRoot, 'projectRoot')
      const relPath = expectString(r.relPath, 'relPath')
      const evaluation = evaluateFileDelete(
        { runId: '', projectRoot },
        path.resolve(projectRoot, relPath),
      )
      if (evaluation.behavior === 'deny') throw new Error(evaluation.reason)
      const approved = await requestStandaloneApproval(projectRoot, {
        ...evaluation,
        behavior: 'ask',
        reason: `Delete ${relPath}`,
      })
      if (!approved.approved) throw new Error('Deletion was not approved')
      await deleteExplorerEntry(projectRoot, relPath)
    },
    'file:reveal': (target: unknown) =>
      revealInFinder(expectString(target, 'path')),
    'file:open-default': (target: unknown) =>
      openInDefaultApp(expectString(target, 'path')),

    // ------ Search ------
    'search:grep': (req: unknown) => {
      const r = expectObject<SearchRequestDto>(req, 'req')
      return runSearch({
        projectRoot: expectString(r.projectRoot, 'projectRoot'),
        pattern: expectString(r.pattern, 'pattern'),
        fixed: r.fixed === true,
        caseSensitive: r.caseSensitive !== false,
        include: r.include === undefined ? undefined : expectStringArray(r.include, 'include'),
        exclude: r.exclude === undefined ? undefined : expectStringArray(r.exclude, 'exclude'),
        maxResults: typeof r.maxResults === 'number' ? r.maxResults : undefined,
      })
    },

    // ------ Git review ------
    'git:status': (projectRoot: unknown) =>
      gitStatus(expectString(projectRoot, 'projectRoot')),
    'git:diff': (req: unknown) => {
      const r = expectObject<GitDiffRequestDto>(req, 'req')
      const root =
        optionalString(r.worktreeRoot, 'worktreeRoot') ??
        expectString(r.projectRoot, 'projectRoot')
      return gitDiff(root, optionalString(r.relPath, 'relPath'))
    },
    'git:revert-file': async (req: unknown) => {
      const r = expectObject<GitDiffRequestDto>(req, 'req')
      const projectRoot = expectString(r.projectRoot, 'projectRoot')
      const root = optionalString(r.worktreeRoot, 'worktreeRoot') ?? projectRoot
      const relPath = expectString(r.relPath, 'relPath')
      const approved = await requestStandaloneApproval(projectRoot, {
        behavior: 'ask',
        riskLevel: 'medium',
        actionType: 'file-delete',
        target: relPath,
        reason: `Revert local changes to ${relPath}`,
      })
      if (!approved.approved) throw new Error('Revert was not approved')
      await gitRevertFile(root, relPath)
    },

    // ------ Worktrees ------
    'worktree:create': (projectRoot: unknown, branch: unknown) =>
      createRunWorktree(
        expectString(projectRoot, 'projectRoot'),
        optionalString(branch, 'branch'),
      ),
    'worktree:list': (projectRoot: unknown) =>
      listWorktrees(expectString(projectRoot, 'projectRoot')),

    // ------ Runs / sessions ------
    'run:start': (projectRoot: unknown, options?: unknown) =>
      startRun(
        expectString(projectRoot, 'projectRoot'),
        options === undefined
          ? {}
          : expectObject<StartRunOptionsDto>(
              options,
              'options',
            ),
      ),
    'run:stop': (runId: unknown) => stopRunById(expectString(runId, 'runId')),
    'run:pause': (runId: unknown) => pauseRunById(expectString(runId, 'runId')),
    'run:resume': (runId: unknown) =>
      resumeRunById(expectString(runId, 'runId')),
    'message:send': async (
      runId: unknown,
      content: unknown,
      attachments?: unknown,
    ) => {
      const id = expectString(runId, 'runId')
      const prompt = expectString(content, 'content')
      const files =
        attachments === undefined
          ? undefined
          : expectStringArray(attachments, 'attachments')
      for await (const event of runPromptStream(id, prompt, files)) {
        broadcast('runtime:event', event)
      }
    },

    // ------ Files / patches ------
    'file:read': (req: unknown) => {
      const r = expectObject<ReadFileRequestDto>(req, 'req')
      return readProjectFile(
        expectString(r.projectRoot, 'projectRoot'),
        expectString(r.path, 'path'),
        optionalString(r.worktreeRoot, 'worktreeRoot'),
      )
    },
    'edit:propose': (req: unknown) => {
      const r = expectObject<ProposeEditRequestDto>(req, 'req')
      return proposeEdit(
        expectString(r.projectRoot, 'projectRoot'),
        expectString(r.path, 'path'),
        expectString(r.newText, 'newText'),
        optionalString(r.worktreeRoot, 'worktreeRoot'),
      )
    },
    'patch:apply': (req: unknown) => {
      const r = expectObject<ApplyPatchRequestDto>(req, 'req')
      return applyProjectPatch(
        expectString(r.projectRoot, 'projectRoot'),
        expectString(r.patch, 'patch'),
        optionalString(r.worktreeRoot, 'worktreeRoot'),
      )
    },
    'patch:parse': (req: unknown) => {
      const r = expectObject<ParseDiffRequestDto>(req, 'req')
      return parseUnifiedDiff(expectString(r.patch, 'patch'))
    },
    'patch:apply-hunks': async (req: unknown) => {
      const r = expectObject<ApplyHunksRequestDto>(req, 'req')
      const projectRoot = expectString(r.projectRoot, 'projectRoot')
      const worktreeRoot = optionalString(r.worktreeRoot, 'worktreeRoot')
      if (!Array.isArray(r.hunkIndexes) || r.hunkIndexes.some(i => typeof i !== 'number')) {
        throw new Error('Invalid IPC argument: hunkIndexes must be a number array')
      }
      return applySelectedHunks({
        targetRoot: worktreeRoot ?? projectRoot,
        patch: expectString(r.patch, 'patch'),
        hunkIndexes: r.hunkIndexes as number[],
        baseHashes: r.baseHashes as Record<string, string> | undefined,
        reverse: r.reverse === true,
      })
    },

    // ------ Shell ------
    'command:run': async (req: unknown) => {
      const r = expectObject<RunCommandRequestDto>(req, 'req')
      const projectRoot = expectString(r.projectRoot, 'projectRoot')
      const command = expectString(r.command, 'command')
      const worktreeRoot = optionalString(r.worktreeRoot, 'worktreeRoot')
      const evaluation = evaluateShellCommand(
        { runId: '', projectRoot, worktreeRoot },
        command,
      )
      if (evaluation.behavior === 'deny') {
        return { output: evaluation.reason, exitCode: -1, denied: true }
      }
      if (evaluation.behavior === 'ask') {
        const approved = await requestStandaloneApproval(projectRoot, evaluation)
        if (!approved.approved) {
          return { output: 'User denied command execution', exitCode: -1, denied: true }
        }
      }
      // Approval state is decided in the trusted main process; the renderer
      // cannot pass a flag that bypasses it.
      return runProjectCommand(projectRoot, command, worktreeRoot, true)
    },
    'command:stop': (
      projectRoot: unknown,
      commandId: unknown,
      worktreeRoot?: unknown,
    ) =>
      stopProjectCommand(
        expectString(projectRoot, 'projectRoot'),
        expectString(commandId, 'commandId'),
        optionalString(worktreeRoot, 'worktreeRoot'),
      ),
    'commands:list': (projectRoot: unknown, worktreeRoot?: unknown) =>
      listProjectTerminalCommands(
        expectString(projectRoot, 'projectRoot'),
        optionalString(worktreeRoot, 'worktreeRoot'),
      ),

    // ------ Structured test runner ------
    'test:run': (req: unknown) => {
      const r = expectObject<TestRunRequestDto>(req, 'req')
      return runStructuredTests(
        expectString(r.projectRoot, 'projectRoot'),
        expectString(r.command, 'command'),
        optionalString(r.worktreeRoot, 'worktreeRoot'),
      )
    },
    'test:rerun-failed': async (req: unknown) => {
      const r = expectObject<
        TestRunRequestDto & { framework?: string; failingTests?: unknown }
      >(req, 'req')
      const rerun = buildRerunFailedCommand(
        (r.framework ?? 'unknown') as Parameters<typeof buildRerunFailedCommand>[0],
        expectString(r.command, 'command'),
        Array.isArray(r.failingTests)
          ? (r.failingTests as Parameters<typeof buildRerunFailedCommand>[2])
          : [],
      )
      if (!rerun) {
        throw new Error('Re-running failed tests is not supported for this framework')
      }
      return runStructuredTests(
        expectString(r.projectRoot, 'projectRoot'),
        rerun,
        optionalString(r.worktreeRoot, 'worktreeRoot'),
      )
    },

    // ------ Tasks / agents ------
    'tasks:list': (projectRoot: unknown) =>
      listProjectTasks(expectString(projectRoot, 'projectRoot')),
    'agents:list': (projectRoot: unknown) =>
      listProjectAgents(expectString(projectRoot, 'projectRoot')),
    'settings:maxAgents': (value?: unknown) => {
      if (value !== undefined) {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 1) {
          throw new Error('Invalid IPC argument: maxAgents must be a positive number')
        }
        updateMaxParallelAgents(Math.floor(value))
        setBackgroundAgentConcurrency(Math.floor(value))
      }
      return getCurrentMaxParallelAgents()
    },

    // ------ Background agents ------
    'bgagent:launch': (req: unknown) => {
      const r = expectObject<LaunchBackgroundAgentRequestDto>(req, 'req')
      return launchBackgroundAgent({
        projectRoot: expectString(r.projectRoot, 'projectRoot'),
        prompt: expectString(r.prompt, 'prompt'),
        useWorktree: r.useWorktree === true,
      })
    },
    'bgagent:list': (projectRoot?: unknown) =>
      listBackgroundAgents(optionalString(projectRoot, 'projectRoot')),
    'bgagent:get': (id: unknown) => getBackgroundAgent(expectString(id, 'id')),
    'bgagent:cancel': (id: unknown) =>
      cancelBackgroundAgent(expectString(id, 'id')),
    'bgagent:retry': (id: unknown) =>
      retryBackgroundAgent(expectString(id, 'id')),
    'bgagent:remove': (id: unknown) =>
      removeBackgroundAgent(expectString(id, 'id')),

    // ------ Checkpoints ------
    'checkpoint:create': (req: unknown) => {
      const r = expectObject<CheckpointRequestDto>(req, 'req')
      return createCheckpoint({
        projectRoot: expectString(r.projectRoot, 'projectRoot'),
        reason: optionalString(r.reason, 'reason') ?? 'Manual checkpoint',
        trigger: 'manual',
        files:
          r.files === undefined ? undefined : expectStringArray(r.files, 'files'),
      })
    },
    'checkpoint:list': (projectRoot: unknown) =>
      listCheckpoints(expectString(projectRoot, 'projectRoot')),
    'checkpoint:preview': (req: unknown) => {
      const r = expectObject<CheckpointRequestDto>(req, 'req')
      return previewRewind(
        expectString(r.projectRoot, 'projectRoot'),
        expectString(r.checkpointId, 'checkpointId'),
      )
    },
    'checkpoint:rewind': async (req: unknown) => {
      const r = expectObject<CheckpointRequestDto>(req, 'req')
      const projectRoot = expectString(r.projectRoot, 'projectRoot')
      const checkpointId = expectString(r.checkpointId, 'checkpointId')
      const preview = await previewRewind(projectRoot, checkpointId)
      if (preview.changes === 0) {
        return { restored: [], deleted: [], safetyCheckpointId: '' }
      }
      // Rewind overwrites current file state: destructive, so it requires
      // an explicit native approval naming the blast radius.
      const approved = await requestStandaloneApproval(projectRoot, {
        behavior: 'ask',
        riskLevel: 'high',
        actionType: 'file-write',
        target: `${preview.changes} file(s)`,
        reason: `Rewind to checkpoint from ${preview.createdAt} (${preview.reason}). A safety checkpoint of the current state is created first.`,
      })
      if (!approved.approved) throw new Error('Rewind was not approved')
      return rewindToCheckpoint(projectRoot, checkpointId)
    },
    'checkpoint:delete': (req: unknown) => {
      const r = expectObject<CheckpointRequestDto>(req, 'req')
      return deleteCheckpoint(
        expectString(r.projectRoot, 'projectRoot'),
        expectString(r.checkpointId, 'checkpointId'),
      )
    },
    'checkpoint:audit': (projectRoot: unknown) =>
      readRewindAudit(expectString(projectRoot, 'projectRoot')),

    // ------ Planning ------
    'plan:generate': (req: unknown) => {
      const r = expectObject<GeneratePlanRequestDto>(req, 'req')
      return generatePlan(
        expectString(r.projectRoot, 'projectRoot'),
        expectString(r.prompt, 'prompt'),
      )
    },
    'plan:execute': (req: unknown) => {
      const r = expectObject<ExecutePlanRequestDto>(req, 'req')
      const plan = expectObject<Record<string, unknown>>(r.plan, 'plan')
      if (!Array.isArray(plan.tasks) || plan.tasks.length === 0) {
        throw new Error('Invalid IPC argument: plan.tasks must be a non-empty array')
      }
      return executePlan(
        expectString(r.projectRoot, 'projectRoot'),
        plan as unknown as Parameters<typeof executePlan>[1],
      )
    },
    'plan:should-plan': (prompt: unknown) =>
      shouldPlan(expectString(prompt, 'prompt')),

    // ------ Session resume ------
    'resume:list': (projectRoot?: unknown) =>
      listInterruptedRuns(optionalString(projectRoot, 'projectRoot')),
    'resume:get': (runId: unknown) => getRunState(expectString(runId, 'runId')),
    'resume:transcript': (runId: unknown) =>
      readTranscript(expectString(runId, 'runId')),
    'resume:run': async (req: unknown) => {
      const r = expectObject<ResumeRunRequestDto>(req, 'req')
      const { newRunId, resumePrompt, resumedFrom } = await prepareResume(
        expectString(r.runId, 'runId'),
      )
      // Stream the continuation exactly like message:send does.
      for await (const event of runPromptStream(newRunId, resumePrompt)) {
        broadcast('runtime:event', { ...event, resumedFrom })
      }
      return { newRunId, resumedFrom }
    },
    'resume:mark-failed': (req: unknown) => {
      const r = expectObject<ResumeRunRequestDto>(req, 'req')
      return markRunStateFailed(expectString(r.runId, 'runId'))
    },
    'resume:archive': (req: unknown) => {
      const r = expectObject<ResumeRunRequestDto>(req, 'req')
      return archiveRunState(expectString(r.runId, 'runId'))
    },

    // ------ Providers / models / tools ------
    // Provider/model configuration is global (stored in user settings), so
    // these accept an optional projectRoot and work before any project is
    // opened. A missing root is normalized to '' (ignored downstream).
    'providers:list': (projectRoot?: unknown) =>
      listProjectProviders(optionalString(projectRoot, 'projectRoot') ?? ''),
    'models:list': (projectRoot?: unknown) =>
      listProjectModels(optionalString(projectRoot, 'projectRoot') ?? ''),
    'provider:update': (
      projectRoot: unknown,
      providerId: unknown,
      model?: unknown,
    ) => {
      // Route through the desktop provider service: it maps desktop kinds
      // (ollama-network, ollama-cloud, …) to core provider ids and persists
      // the choice so new sessions pick it up.
      const result = setActiveProjectProvider(
        optionalString(projectRoot, 'projectRoot') ?? '',
        expectString(providerId, 'providerId'),
        optionalString(model, 'model'),
      )
      if (!result.ok) throw new Error(result.message)
    },
    'provider:config:get': (projectRoot?: unknown, providerId?: unknown) =>
      getProjectProviderConfig(
        optionalString(projectRoot, 'projectRoot') ?? '',
        optionalString(providerId, 'providerId'),
      ),
    'provider:config:set': (projectRoot: unknown, patch: unknown) => {
      const p = expectObject<Record<string, unknown>>(patch, 'patch')
      if (p.apiKey !== undefined || p.preferences !== undefined) {
        throw new Error('Provider secrets and preferences cannot be changed on this channel')
      }
      const validated: DesktopProviderConfigPatch = {
        providerId: expectString(
          p.providerId,
          'patch.providerId',
        ) as DesktopProviderConfigPatch['providerId'],
        model: optionalString(p.model, 'patch.model'),
        baseUrl: optionalString(p.baseUrl, 'patch.baseUrl'),
      }
      return setProjectProviderConfig(
        optionalString(projectRoot, 'projectRoot') ?? '',
        validated,
      )
    },
    'provider:key:store': (
      projectRoot: unknown,
      providerId: unknown,
      apiKey: unknown,
    ) =>
      storeProjectProviderApiKey(
        optionalString(projectRoot, 'projectRoot') ?? '',
        expectString(providerId, 'providerId'),
        expectString(apiKey, 'apiKey'),
      ),
    'provider:key:clear': (projectRoot: unknown, providerId: unknown) =>
      clearProjectProviderApiKey(
        optionalString(projectRoot, 'projectRoot') ?? '',
        expectString(providerId, 'providerId'),
      ),
    'provider:test': (projectRoot: unknown, providerId: unknown) =>
      testProjectProviderConnection(
        optionalString(projectRoot, 'projectRoot') ?? '',
        expectString(providerId, 'providerId'),
      ),
    'provider:models:get': (projectRoot: unknown, providerId: unknown) =>
      listProjectProviderModels(
        optionalString(projectRoot, 'projectRoot') ?? '',
        expectString(providerId, 'providerId'),
      ),
    'tools:list': (projectRoot: unknown) =>
      listProjectToolDefinitions(expectString(projectRoot, 'projectRoot')),
    'slash-commands:list': (projectRoot: unknown) =>
      listProjectSlashCommands(expectString(projectRoot, 'projectRoot')),

    // ------ Agent permissions ------
    'permissions:get': () => getAgentPermissionSettings(),
    'permissions:set': (settings: unknown) =>
      setAgentPermissionSettings(
        expectObject<AgentPermissionSettingsDto>(settings, 'settings'),
      ),

    // ------ MCP / connectors ------
    'mcp:list': (projectRoot: unknown) =>
      listProjectMcpServers(expectString(projectRoot, 'projectRoot')),
    'mcp:add': (req: unknown) => {
      const r = expectObject<AddMcpServerRequestDto>(req, 'req')
      return addProjectMcpServer(
        expectString(r.projectRoot, 'projectRoot'),
        expectString(r.name, 'name'),
        expectString(r.command, 'command'),
        r.args as string[] | undefined,
        r.env as Record<string, string> | undefined,
      )
    },
    'mcp:remove': (projectRoot: unknown, name: unknown) =>
      removeProjectMcpServer(
        expectString(projectRoot, 'projectRoot'),
        expectString(name, 'name'),
      ),
    'connectors:list': (projectRoot: unknown) =>
      listProjectConnectors(expectString(projectRoot, 'projectRoot')),
    'connector:add': (req: unknown) => {
      const r = expectObject<AddConnectorRequestDto>(req, 'req')
      const { projectRoot, ...connector } = r
      return addProjectConnector(
        expectString(projectRoot, 'projectRoot'),
        connector as Parameters<typeof addProjectConnector>[1],
      )
    },
    'connector:update': (req: unknown) => {
      const r = expectObject<UpdateConnectorRequestDto>(req, 'req')
      return updateProjectConnector(
        expectString(r.projectRoot, 'projectRoot'),
        expectString(r.name, 'name'),
        { enabled: r.enabled, config: r.config },
      )
    },
    'connector:remove': (projectRoot: unknown, name: unknown) =>
      removeProjectConnector(
        expectString(projectRoot, 'projectRoot'),
        expectString(name, 'name'),
      ),
    'connector:test': (projectRoot: unknown, name: unknown) =>
      testProjectConnector(
        expectString(projectRoot, 'projectRoot'),
        expectString(name, 'name'),
      ),
    'connector:tools': (projectRoot: unknown, name: unknown) =>
      listProjectConnectorTools(
        expectString(projectRoot, 'projectRoot'),
        expectString(name, 'name'),
      ),
    'connector:tool:call': (req: unknown) => {
      const r = expectObject<CallConnectorToolRequestDto>(req, 'req')
      return callProjectConnectorTool(
        expectString(r.projectRoot, 'projectRoot'),
        expectString(r.serverName, 'serverName'),
        expectString(r.toolName, 'toolName'),
        expectObject(r.input ?? {}, 'input'),
      )
    },

    // ------ History / reports ------
    'history:read': async (projectRoot: unknown) => {
      const events: unknown[] = []
      for await (const event of readProjectHistory(
        expectString(projectRoot, 'projectRoot'),
      )) {
        events.push(event)
      }
      return events
    },
    'report:export': (projectRoot: unknown, worktreeRoot?: unknown) =>
      exportProjectReport(
        expectString(projectRoot, 'projectRoot'),
        optionalString(worktreeRoot, 'worktreeRoot'),
      ),
    'history:list': (req: unknown) => {
      const r = expectObject<ListRunsRequestDto>(req, 'req')
      return listProjectRuns(
        expectString(r.projectRoot, 'projectRoot'),
        typeof r.limit === 'number' ? r.limit : undefined,
      )
    },
    'history:get': (req: unknown) => {
      const r = expectObject<GetRunRequestDto>(req, 'req')
      return getProjectRun(expectString(r.runId, 'runId'))
    },
    'history:delete': (req: unknown) => {
      const r = expectObject<DeleteRunRequestDto>(req, 'req')
      return deleteProjectRun(expectString(r.runId, 'runId'))
    },
    'report:markdown': (req: unknown) => {
      const r = expectObject<ExportReportRequestDto>(req, 'req')
      return exportRunReport(
        expectString(r.projectRoot, 'projectRoot'),
        expectString(r.runId, 'runId'),
        'markdown',
      )
    },
    'report:json': (req: unknown) => {
      const r = expectObject<ExportReportRequestDto>(req, 'req')
      return exportRunReport(
        expectString(r.projectRoot, 'projectRoot'),
        expectString(r.runId, 'runId'),
        'json',
      )
    },
    'report:get': (req: unknown) => {
      const r = expectObject<GetReportRequestDto>(req, 'req')
      return getRunReport(
        expectString(r.projectRoot, 'projectRoot'),
        expectString(r.runId, 'runId'),
      )
    },

    // ------ Approvals ------
    'approval:respond': (res: unknown) => {
      const r = expectObject<ApprovalResponseDto>(res, 'res')
      respondApproval(
        expectString(r.requestId, 'requestId'),
        r.approved === true,
        expectApprovalScope(r.scope),
      )
    },

    // ------ Safety policy ------
    'safety:policy:get': (req: unknown) => {
      const r = expectObject<GetSafetyPolicyRequestDto>(req, 'req')
      return getProjectSafetyPolicy(expectString(r.projectRoot, 'projectRoot'))
    },
    'safety:policy:set': (req: unknown) => {
      const r = expectObject<SetSafetyPolicyRequestDto>(req, 'req')
      return setProjectSafetyPolicy(
        expectString(r.projectRoot, 'projectRoot'),
        expectSafetyPolicy(r.policy),
      )
    },

    // ------ Updates ------
    'update:check': () => checkForUpdates(),
  }

  // Work persisted as running before an app restart no longer has a live
  // process; mark it interrupted rather than showing stale state.
  void reconcileBackgroundAgents().catch(() => undefined)
  void reconcileRunStates().catch(() => undefined)

  registeredChannels = Object.keys(handlers)
  for (const [channel, handler] of Object.entries(handlers)) {
    ipcMain.handle(channel, async (_event, ...args: unknown[]) => {
      try {
        return await handler(...args)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        // Rethrow with a clean message: Electron wraps handler errors, and the
        // renderer surfaces `message` in its error states.
        throw new Error(message)
      }
    })
  }
}

let registeredChannels: string[] = []

/** Channels registered by the last registerIpcHandlers call (for tests). */
export function getRegisteredChannels(): string[] {
  return [...registeredChannels]
}
