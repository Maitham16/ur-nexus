import { contextBridge, ipcRenderer, webUtils, IpcRendererEvent } from 'electron'
import type {
  IpcChannel,
  IpcEvent,
  RuntimeEvent,
  RuntimeProjectDto,
  RuntimeSessionDto,
  RuntimeTaskInfoDto,
  RuntimeAgentInfoDto,
  RuntimeMcpServerDto,
  RuntimeToolDefinitionDto,
  RuntimeSlashCommandDto,
  ProjectInfoDto,
  RecentProjectDto,
  WorktreeInfoDto,
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
  RunSummaryDto,
  RunDetailDto,
  RunReportDto,
  DesktopProviderInfoDto,
  DesktopProviderConfigDto,
  DesktopProviderConfigPatch,
  DesktopModelInfoDto,
  DesktopProviderConnectionResultDto,
  RuntimeConnectorDto,
  RuntimeConnectorToolDto,
  AddConnectorRequestDto,
  UpdateConnectorRequestDto,
  CallConnectorToolRequestDto,
  OpenProjectDialogResultDto,
  OpenFilesDialogResultDto,
  SaveFileDialogRequestDto,
  SaveFileDialogResultDto,
  AddContextFilesRequestDto,
  ContextFileDto,
  ExplorerListRequestDto,
  ExplorerMutationRequestDto,
  ExplorerEntryDto,
  GitFileStatusDto,
  GitDiffRequestDto,
  SearchRequestDto,
  SearchResultDto,
  ParseDiffRequestDto,
  ParsedDiffFileDto,
  ApplyHunksRequestDto,
  TestRunRequestDto,
  TestRunResultDto,
  FailingTestDto,
  BackgroundAgentDto,
  LaunchBackgroundAgentRequestDto,
  CheckpointRequestDto,
  CheckpointDto,
  RewindPreviewDto,
  GeneratePlanRequestDto,
  ExecutePlanRequestDto,
  PlanDto,
  PersistedRunStateDto,
  ResumeRunRequestDto,
  AgentPermissionSettingsDto,
  StartRunOptionsDto,
} from '../shared/ipc.js'

// Thin typed wrapper over ipcRenderer. No Node APIs are exposed to the renderer.
const api = {
  invoke: <T = unknown>(channel: IpcChannel, ...args: unknown[]): Promise<T> =>
    ipcRenderer.invoke(channel, ...args),

  subscribe: (
    channel: IpcEvent,
    callback: (payload: RuntimeEvent) => void,
  ): (() => void) => {
    const handler = (_event: IpcRendererEvent, payload: RuntimeEvent) =>
      callback(payload)
    ipcRenderer.on(channel, handler)
    return () => {
      ipcRenderer.removeListener(channel, handler)
    }
  },

  // Resolve the on-disk path of a dragged-and-dropped File object.
  getPathForFile: (file: File): string => webUtils.getPathForFile(file),

  // Menu actions dispatched by the native macOS menu.
  onMenuAction: (
    callback: (payload: { action: string; payload?: unknown }) => void,
  ): (() => void) => {
    const handler = (
      _event: IpcRendererEvent,
      payload: { action: string; payload?: unknown },
    ) => callback(payload)
    ipcRenderer.on('menu:action', handler)
    return () => {
      ipcRenderer.removeListener('menu:action', handler)
    }
  },

  // Native dialogs
  openProjectDialog: (): Promise<OpenProjectDialogResultDto> =>
    ipcRenderer.invoke('dialog:open-project'),

  openFilesDialog: (options?: {
    multi?: boolean
    defaultPath?: string
  }): Promise<OpenFilesDialogResultDto> =>
    ipcRenderer.invoke('dialog:open-files', options),

  saveFileDialog: (req: SaveFileDialogRequestDto): Promise<SaveFileDialogResultDto> =>
    ipcRenderer.invoke('dialog:save-file', req),

  // Projects
  openProject: (root: string): Promise<RuntimeProjectDto> =>
    ipcRenderer.invoke('project:open', root),

  closeProject: (root: string): Promise<void> =>
    ipcRenderer.invoke('project:close', root),

  listProjects: (): Promise<RecentProjectDto[]> =>
    ipcRenderer.invoke('project:list'),

  removeRecentProject: (root: string): Promise<void> =>
    ipcRenderer.invoke('project:remove-recent', root),

  inspectProject: (root: string): Promise<ProjectInfoDto> =>
    ipcRenderer.invoke('project:inspect', root),

  getChatWorkspace: (): Promise<RuntimeProjectDto> =>
    ipcRenderer.invoke('project:chat-workspace'),

  // Context files / attachments
  addContextFiles: (req: AddContextFilesRequestDto): Promise<ContextFileDto[]> =>
    ipcRenderer.invoke('context:add-files', req),

  removeContextFile: (projectRoot: string, filePath: string): Promise<boolean> =>
    ipcRenderer.invoke('context:remove-file', projectRoot, filePath),

  listContextFiles: (projectRoot: string): Promise<ContextFileDto[]> =>
    ipcRenderer.invoke('context:list', projectRoot),

  // File explorer
  listExplorer: (req: ExplorerListRequestDto): Promise<ExplorerEntryDto[]> =>
    ipcRenderer.invoke('explorer:list', req),

  createExplorerEntry: (req: ExplorerMutationRequestDto): Promise<void> =>
    ipcRenderer.invoke('explorer:create', req),

  renameExplorerEntry: (req: ExplorerMutationRequestDto): Promise<void> =>
    ipcRenderer.invoke('explorer:rename', req),

  deleteExplorerEntry: (req: ExplorerMutationRequestDto): Promise<void> =>
    ipcRenderer.invoke('explorer:delete', req),

  revealInFinder: (absolutePath: string): Promise<void> =>
    ipcRenderer.invoke('file:reveal', absolutePath),

  openInDefaultApp: (absolutePath: string): Promise<void> =>
    ipcRenderer.invoke('file:open-default', absolutePath),

  // Content search (ripgrep-parity)
  searchGrep: (req: SearchRequestDto): Promise<SearchResultDto> =>
    ipcRenderer.invoke('search:grep', req),

  // Structured test runner
  runTests: (req: TestRunRequestDto): Promise<TestRunResultDto> =>
    ipcRenderer.invoke('test:run', req),

  rerunFailedTests: (
    req: TestRunRequestDto & {
      framework: string
      failingTests: FailingTestDto[]
    },
  ): Promise<TestRunResultDto> => ipcRenderer.invoke('test:rerun-failed', req),

  // Git review
  gitStatus: (projectRoot: string): Promise<GitFileStatusDto[]> =>
    ipcRenderer.invoke('git:status', projectRoot),

  gitDiff: (req: GitDiffRequestDto): Promise<string> =>
    ipcRenderer.invoke('git:diff', req),

  gitRevertFile: (req: GitDiffRequestDto): Promise<void> =>
    ipcRenderer.invoke('git:revert-file', req),

  // Worktrees
  createWorktree: (projectRoot: string, branch?: string): Promise<WorktreeInfoDto> =>
    ipcRenderer.invoke('worktree:create', projectRoot, branch),

  listWorktrees: (projectRoot: string): Promise<WorktreeInfoDto[]> =>
    ipcRenderer.invoke('worktree:list', projectRoot),

  // Runs
  startRun: (
    projectRoot: string,
    options?: StartRunOptionsDto,
  ): Promise<RuntimeSessionDto> =>
    ipcRenderer.invoke('run:start', projectRoot, options),

  stopRun: (sessionId: string): Promise<void> =>
    ipcRenderer.invoke('run:stop', sessionId),

  pauseRun: (sessionId: string): Promise<void> =>
    ipcRenderer.invoke('run:pause', sessionId),

  resumeRun: (sessionId: string): Promise<void> =>
    ipcRenderer.invoke('run:resume', sessionId),

  sendMessage: (
    sessionId: string,
    content: string,
    attachments?: string[],
  ): Promise<void> =>
    ipcRenderer.invoke('message:send', sessionId, content, attachments),

  // Files
  readFile: (req: ReadFileRequestDto): Promise<string | null> =>
    ipcRenderer.invoke('file:read', req),

  proposeEdit: (
    req: ProposeEditRequestDto,
  ): Promise<{ diffId: string; patch: string; baseHashes: Record<string, string> }> =>
    ipcRenderer.invoke('edit:propose', req),

  applyPatch: (req: ApplyPatchRequestDto): Promise<void> =>
    ipcRenderer.invoke('patch:apply', req),

  parseDiff: (req: ParseDiffRequestDto): Promise<ParsedDiffFileDto[]> =>
    ipcRenderer.invoke('patch:parse', req),

  applyHunks: (req: ApplyHunksRequestDto): Promise<{ appliedFiles: string[] }> =>
    ipcRenderer.invoke('patch:apply-hunks', req),

  // Commands
  runCommand: (
    req: RunCommandRequestDto,
  ): Promise<{ output: string; exitCode: number; commandId?: string; requiresApproval?: boolean }> =>
    ipcRenderer.invoke('command:run', req),

  stopCommand: (
    projectRoot: string,
    commandId: string,
    worktreeRoot?: string,
  ): Promise<boolean> => ipcRenderer.invoke('command:stop', projectRoot, commandId, worktreeRoot),

  listCommands: (
    projectRoot: string,
    worktreeRoot?: string,
  ): Promise<import('../shared/ipc.js').TerminalCommandDto[]> => ipcRenderer.invoke('commands:list', projectRoot, worktreeRoot),

  listSlashCommands: (projectRoot: string): Promise<RuntimeSlashCommandDto[]> =>
    ipcRenderer.invoke('slash-commands:list', projectRoot),

  // Tasks / agents
  listTasks: (projectRoot: string): Promise<RuntimeTaskInfoDto[]> =>
    ipcRenderer.invoke('tasks:list', projectRoot),

  listAgents: (projectRoot: string): Promise<RuntimeAgentInfoDto[]> =>
    ipcRenderer.invoke('agents:list', projectRoot),

  setMaxAgents: (value: number): Promise<number> =>
    ipcRenderer.invoke('settings:maxAgents', value),

  getMaxAgents: (): Promise<number> => ipcRenderer.invoke('settings:maxAgents'),

  // Background agents
  launchBackgroundAgent: (
    req: LaunchBackgroundAgentRequestDto,
  ): Promise<BackgroundAgentDto> => ipcRenderer.invoke('bgagent:launch', req),

  listBackgroundAgents: (projectRoot?: string): Promise<BackgroundAgentDto[]> =>
    ipcRenderer.invoke('bgagent:list', projectRoot),

  getBackgroundAgent: (id: string): Promise<BackgroundAgentDto | null> =>
    ipcRenderer.invoke('bgagent:get', id),

  cancelBackgroundAgent: (id: string): Promise<void> =>
    ipcRenderer.invoke('bgagent:cancel', id),

  retryBackgroundAgent: (id: string): Promise<BackgroundAgentDto> =>
    ipcRenderer.invoke('bgagent:retry', id),

  removeBackgroundAgent: (id: string): Promise<boolean> =>
    ipcRenderer.invoke('bgagent:remove', id),

  // Checkpoints
  createCheckpoint: (req: CheckpointRequestDto): Promise<CheckpointDto> =>
    ipcRenderer.invoke('checkpoint:create', req),

  listCheckpoints: (projectRoot: string): Promise<CheckpointDto[]> =>
    ipcRenderer.invoke('checkpoint:list', projectRoot),

  previewRewind: (req: CheckpointRequestDto): Promise<RewindPreviewDto> =>
    ipcRenderer.invoke('checkpoint:preview', req),

  rewindToCheckpoint: (
    req: CheckpointRequestDto,
  ): Promise<{ restored: string[]; deleted: string[]; safetyCheckpointId: string }> =>
    ipcRenderer.invoke('checkpoint:rewind', req),

  deleteCheckpoint: (req: CheckpointRequestDto): Promise<boolean> =>
    ipcRenderer.invoke('checkpoint:delete', req),

  readCheckpointAudit: (projectRoot: string): Promise<Record<string, unknown>[]> =>
    ipcRenderer.invoke('checkpoint:audit', projectRoot),

  // Planning
  generatePlan: (req: GeneratePlanRequestDto): Promise<PlanDto> =>
    ipcRenderer.invoke('plan:generate', req),

  executePlan: (
    req: ExecutePlanRequestDto,
  ): Promise<{ planId: string; tasks: Array<{ id: string; status: string; error?: string }> }> =>
    ipcRenderer.invoke('plan:execute', req),

  shouldPlan: (prompt: string): Promise<boolean> =>
    ipcRenderer.invoke('plan:should-plan', prompt),

  // Session resume
  listInterruptedRuns: (projectRoot?: string): Promise<PersistedRunStateDto[]> =>
    ipcRenderer.invoke('resume:list', projectRoot),

  getRunState: (runId: string): Promise<PersistedRunStateDto | null> =>
    ipcRenderer.invoke('resume:get', runId),

  getRunTranscript: (runId: string): Promise<Record<string, unknown>[]> =>
    ipcRenderer.invoke('resume:transcript', runId),

  resumeInterruptedRun: (
    req: ResumeRunRequestDto,
  ): Promise<{ newRunId: string; resumedFrom: string }> =>
    ipcRenderer.invoke('resume:run', req),

  markInterruptedRunFailed: (req: ResumeRunRequestDto): Promise<void> =>
    ipcRenderer.invoke('resume:mark-failed', req),

  archiveInterruptedRun: (req: ResumeRunRequestDto): Promise<void> =>
    ipcRenderer.invoke('resume:archive', req),

  // Providers / models / tools
  listProviders: (projectRoot: string): Promise<DesktopProviderInfoDto[]> =>
    ipcRenderer.invoke('providers:list', projectRoot),

  listModels: (projectRoot: string): Promise<DesktopModelInfoDto[]> =>
    ipcRenderer.invoke('models:list', projectRoot),

  updateProvider: (
    projectRoot: string,
    providerId: string,
    model?: string,
  ): Promise<void> =>
    ipcRenderer.invoke('provider:update', projectRoot, providerId, model),

  getProviderConfig: (projectRoot: string, providerId?: string): Promise<DesktopProviderConfigDto> =>
    ipcRenderer.invoke('provider:config:get', projectRoot, providerId),

  setProviderConfig: (
    projectRoot: string,
    patch: DesktopProviderConfigPatch,
  ): Promise<void> => ipcRenderer.invoke('provider:config:set', projectRoot, patch),

  storeProviderApiKey: (
    projectRoot: string,
    providerId: string,
    key: string,
  ): Promise<void> => ipcRenderer.invoke('provider:key:store', projectRoot, providerId, key),

  clearProviderApiKey: (projectRoot: string, providerId: string): Promise<void> =>
    ipcRenderer.invoke('provider:key:clear', projectRoot, providerId),

  testProviderConnection: (
    projectRoot: string,
    providerId: string,
  ): Promise<DesktopProviderConnectionResultDto> => ipcRenderer.invoke('provider:test', projectRoot, providerId),

  listProviderModels: (projectRoot: string, providerId: string): Promise<DesktopModelInfoDto[]> =>
    ipcRenderer.invoke('provider:models:get', projectRoot, providerId),

  listToolDefinitions: (projectRoot: string): Promise<RuntimeToolDefinitionDto[]> =>
    ipcRenderer.invoke('tools:list', projectRoot),

  // Agent permissions
  getAgentPermissions: (): Promise<AgentPermissionSettingsDto> =>
    ipcRenderer.invoke('permissions:get'),

  setAgentPermissions: (
    settings: AgentPermissionSettingsDto,
  ): Promise<AgentPermissionSettingsDto> =>
    ipcRenderer.invoke('permissions:set', settings),

  // MCP
  listMcpServers: (projectRoot: string): Promise<RuntimeMcpServerDto[]> =>
    ipcRenderer.invoke('mcp:list', projectRoot),

  addMcpServer: (req: AddMcpServerRequestDto): Promise<void> =>
    ipcRenderer.invoke('mcp:add', req),

  removeMcpServer: (projectRoot: string, name: string): Promise<void> =>
    ipcRenderer.invoke('mcp:remove', projectRoot, name),

  // Connectors
  listConnectors: (projectRoot: string): Promise<RuntimeConnectorDto[]> =>
    ipcRenderer.invoke('connectors:list', projectRoot),

  addConnector: (req: AddConnectorRequestDto): Promise<void> =>
    ipcRenderer.invoke('connector:add', req),

  updateConnector: (req: UpdateConnectorRequestDto): Promise<void> =>
    ipcRenderer.invoke('connector:update', req),

  removeConnector: (projectRoot: string, name: string): Promise<void> =>
    ipcRenderer.invoke('connector:remove', projectRoot, name),

  testConnector: (projectRoot: string, name: string): Promise<{ ok: boolean; error?: string; tools?: RuntimeConnectorToolDto[] }> =>
    ipcRenderer.invoke('connector:test', projectRoot, name),

  listConnectorTools: (projectRoot: string, name: string): Promise<RuntimeConnectorToolDto[]> =>
    ipcRenderer.invoke('connector:tools', projectRoot, name),

  callConnectorTool: (req: CallConnectorToolRequestDto): Promise<{ ok: boolean; result?: unknown; error?: string }> =>
    ipcRenderer.invoke('connector:tool:call', req),

  // History / report
  readHistory: (projectRoot: string): Promise<unknown[]> =>
    ipcRenderer.invoke('history:read', projectRoot),

  exportReport: (projectRoot: string, worktreeRoot?: string): Promise<{ path: string }> =>
    ipcRenderer.invoke('report:export', projectRoot, worktreeRoot),

  // Approvals
  respondApproval: (res: ApprovalResponseDto): Promise<void> =>
    ipcRenderer.invoke('approval:respond', res),

  // Safety / policy
  getSafetyPolicy: (req: GetSafetyPolicyRequestDto): Promise<Record<string, unknown>> =>
    ipcRenderer.invoke('safety:policy:get', req),

  setSafetyPolicy: (req: SetSafetyPolicyRequestDto): Promise<void> =>
    ipcRenderer.invoke('safety:policy:set', req),

  // History / reports
  listRuns: (req: ListRunsRequestDto): Promise<RunSummaryDto[]> =>
    ipcRenderer.invoke('history:list', req),

  getRun: (req: GetRunRequestDto): Promise<RunDetailDto | null> =>
    ipcRenderer.invoke('history:get', req),

  deleteRun: (req: DeleteRunRequestDto): Promise<boolean> =>
    ipcRenderer.invoke('history:delete', req),

  exportReportMarkdown: (req: ExportReportRequestDto): Promise<{ path: string }> =>
    ipcRenderer.invoke('report:markdown', req),

  exportReportJson: (req: ExportReportRequestDto): Promise<{ path: string }> =>
    ipcRenderer.invoke('report:json', req),

  getReport: (req: GetReportRequestDto): Promise<RunReportDto> =>
    ipcRenderer.invoke('report:get', req),

  checkForUpdates: (): Promise<{ updateAvailable: boolean; version?: string; error?: string }> =>
    ipcRenderer.invoke('update:check'),
}

declare global {
  interface Window {
    urDesktop: typeof api
  }
}

contextBridge.exposeInMainWorld('urDesktop', api)
