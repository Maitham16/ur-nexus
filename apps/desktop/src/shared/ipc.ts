// Shared IPC contract between Electron main, preload, and renderer.
// Keep this file dependency-free so it can be imported by both main and renderer.

export type TaskStatus =
  | 'pending'
  | 'running'
  | 'waiting_approval'
  | 'done'
  | 'failed'
  | 'skipped'

export type AgentStatus = 'idle' | 'running' | 'waiting_approval' | 'done' | 'failed'

export interface TaskInfoDto {
  index: number
  id: string
  title: string
  description?: string
  status: TaskStatus
  assignedAgent?: string
  dependencies: string[]
  currentAction?: string
  changedFiles: string[]
  verification?: VerificationResultDto
  elapsedMs: number
  runId: string
  [key: string]: unknown
}

export interface AgentInfoDto {
  id: string
  name: string
  role?: string
  assignedTaskId?: string
  currentTool?: string
  currentCommand?: string
  elapsedMs: number
  status: AgentStatus
  logs: string[]
  runId: string
  [key: string]: unknown
}

export interface VerificationResultDto {
  passed: boolean
  level: 'l1' | 'l2'
  message?: string
  [key: string]: unknown
}

// Channels exposed by the main process for renderer invocation.
export type IpcChannel =
  // Native dialogs (main-process, validated)
  | 'dialog:open-project'
  | 'dialog:open-files'
  | 'dialog:save-file'
  // Projects
  | 'project:open'
  | 'project:close'
  | 'project:list'
  | 'project:recent'
  | 'project:remove-recent'
  | 'project:inspect'
  | 'project:chat-workspace'
  // Context / attachments
  | 'context:add-files'
  | 'context:remove-file'
  | 'context:list'
  // File explorer
  | 'explorer:list'
  | 'explorer:create'
  | 'explorer:rename'
  | 'explorer:delete'
  | 'file:reveal'
  | 'file:open-default'
  // Search
  | 'search:grep'
  // Git status / diff review
  | 'git:status'
  | 'git:diff'
  | 'git:revert-file'
  | 'worktree:create'
  | 'worktree:list'
  // Runs / sessions
  | 'run:start'
  | 'run:stop'
  | 'run:pause'
  | 'run:resume'
  | 'message:send'
  // File system (validated, project/worktree-scoped)
  | 'file:read'
  | 'edit:propose'
  | 'patch:apply'
  | 'patch:parse'
  | 'patch:apply-hunks'
  // Shell (validated, sandboxed)
  | 'command:run'
  | 'command:stop'
  | 'commands:list'
  // Structured test runner
  | 'test:run'
  | 'test:rerun-failed'
  // Tasks / agents
  | 'tasks:list'
  | 'agents:list'
  | 'settings:maxAgents'
  // Background agents
  | 'bgagent:launch'
  | 'bgagent:list'
  | 'bgagent:get'
  | 'bgagent:cancel'
  | 'bgagent:retry'
  | 'bgagent:remove'
  // Checkpoints
  | 'checkpoint:create'
  | 'checkpoint:list'
  | 'checkpoint:preview'
  | 'checkpoint:rewind'
  | 'checkpoint:delete'
  | 'checkpoint:audit'
  // Planning
  | 'plan:generate'
  | 'plan:execute'
  | 'plan:should-plan'
  // Session resume
  | 'resume:list'
  | 'resume:get'
  | 'resume:transcript'
  | 'resume:run'
  | 'resume:mark-failed'
  | 'resume:archive'
  // Providers / models / tools
  | 'providers:list'
  | 'models:list'
  | 'provider:update'
  | 'provider:config:get'
  | 'provider:config:set'
  | 'provider:key:store'
  | 'provider:key:clear'
  | 'provider:test'
  | 'provider:models:get'
  | 'tools:list'
  | 'slash-commands:list'
  // Agent permissions
  | 'permissions:get'
  | 'permissions:set'
  // MCP servers / connectors
  | 'mcp:list'
  | 'mcp:add'
  | 'mcp:remove'
  | 'connectors:list'
  | 'connector:add'
  | 'connector:update'
  | 'connector:remove'
  | 'connector:test'
  | 'connector:tools'
  | 'connector:tool:call'
  // History / export
  | 'history:read'
  | 'report:export'
  // Approvals
  | 'approval:respond'
  // Safety / policy
  | 'safety:policy:get'
  | 'safety:policy:set'
  // History / reports
  | 'history:list'
  | 'history:get'
  | 'history:delete'
  | 'report:markdown'
  | 'report:json'
  | 'report:get'
  // Updates
  | 'update:check'

// Channels the renderer can subscribe to for streaming events.
export type IpcEvent =
  | 'runtime:event'
  | 'runtime:taskUpdate'
  | 'runtime:agentUpdate'
  | 'runtime:approvalRequest'
  | 'runtime:deepLink'
  | 'menu:action'

// Actions dispatched from the native macOS menu to the focused window.
export type MenuAction =
  | 'new-chat'
  | 'open-project'
  | 'open-file'
  | 'settings'
  | 'history'
  | 'toggle-terminal-drawer'
  | 'toggle-context-panel'

export interface OpenProjectDialogResultDto {
  canceled: boolean
  root?: string
}

export interface OpenFilesDialogResultDto {
  canceled: boolean
  paths: string[]
}

export interface SaveFileDialogRequestDto extends Record<string, unknown> {
  defaultPath?: string
  title?: string
  filters?: Array<{ name: string; extensions: string[] }>
}

export interface SaveFileDialogResultDto {
  canceled: boolean
  path?: string
}

export type ContextFileKind = 'text' | 'binary' | 'missing' | 'directory' | 'unreadable' | 'too-large'

export interface ContextFileDto {
  /** Absolute path on disk. */
  path: string
  /** Path relative to the project root when inside it. */
  relPath: string
  name: string
  sizeBytes: number
  kind: ContextFileKind
  /** True when the file can be attached to a prompt. */
  ok: boolean
  reason?: string
}

export interface AddContextFilesRequestDto extends Record<string, unknown> {
  projectRoot: string
  paths: string[]
}

export interface ExplorerEntryDto {
  name: string
  /** Path relative to the project root. */
  relPath: string
  type: 'file' | 'directory'
  sizeBytes?: number
  gitStatus?: 'modified' | 'added' | 'deleted' | 'untracked' | 'renamed'
  ignored?: boolean
  hasChildren?: boolean
}

export interface ExplorerListRequestDto extends Record<string, unknown> {
  projectRoot: string
  /** Directory to list, relative to the project root. Empty = root. */
  relPath?: string
  /** Include entries ignored by git (default false). */
  showIgnored?: boolean
}

export interface ExplorerMutationRequestDto extends Record<string, unknown> {
  projectRoot: string
  relPath: string
  /** For create: 'file' | 'directory'. For rename: the new relative path. */
  kind?: 'file' | 'directory'
  newRelPath?: string
}

export interface GitFileStatusDto {
  relPath: string
  status: 'modified' | 'added' | 'deleted' | 'untracked' | 'renamed'
  staged: boolean
}

export interface GitDiffRequestDto extends Record<string, unknown> {
  projectRoot: string
  /** Limit the diff to one file (relative path). */
  relPath?: string
  worktreeRoot?: string
}

export interface SearchRequestDto extends Record<string, unknown> {
  projectRoot: string
  pattern: string
  fixed?: boolean
  caseSensitive?: boolean
  include?: string[]
  exclude?: string[]
  maxResults?: number
}

export interface SearchMatchDto {
  /** Path relative to the search root. */
  file: string
  line: number
  column: number
  text: string
}

export interface SearchResultDto {
  matches: SearchMatchDto[]
  truncated: boolean
  engine: 'ripgrep' | 'internal'
}

export interface ParsedHunkDto {
  /** Global hunk index across the whole patch (stable selection handle). */
  index: number
  oldStart: number
  oldCount: number
  newStart: number
  newCount: number
  /** Function/context text after the @@ header. */
  context: string
  /** Raw hunk body lines including +/-/space/\\ prefixes. */
  lines: string[]
}

export interface ParsedDiffFileDto {
  oldPath: string
  newPath: string
  isNew: boolean
  isDeleted: boolean
  isRename: boolean
  isBinary: boolean
  hunks: ParsedHunkDto[]
}

export interface ApplyHunksRequestDto extends Record<string, unknown> {
  projectRoot: string
  patch: string
  hunkIndexes: number[]
  worktreeRoot?: string
  /** sha256 per old file path, recorded when the diff was generated. */
  baseHashes?: Record<string, string>
  /** Reverse-apply (revert previously accepted hunks). */
  reverse?: boolean
}

export interface ParseDiffRequestDto extends Record<string, unknown> {
  patch: string
}

export type PersistedRunStatus =
  | 'running'
  | 'interrupted'
  | 'resumed'
  | 'finished'
  | 'failed'
  | 'archived'

export interface PersistedRunStateDto {
  runId: string
  projectRoot: string
  worktreeRoot?: string
  status: PersistedRunStatus
  createdAt: string
  updatedAt: string
  /** Provider reference only — never credentials. */
  provider?: { providerId?: string; model?: string }
  lastPrompt?: string
  /** Prompt in flight when the run was interrupted. */
  pendingPrompt?: string
  completedToolCalls: Array<{ tool: string; target?: string; at: string }>
  pendingApprovals: Array<{ requestId: string; toolName: string; target?: string }>
  changedFiles: string[]
  interruptionNote?: string
  /** Set on runs created by resuming another run. */
  resumedFrom?: string
  /** Set on interrupted runs after they were resumed. */
  resumedBy?: string
}

export interface ResumeRunRequestDto extends Record<string, unknown> {
  runId: string
}

export interface PlanTaskDto {
  id: string
  title: string
  description: string
  role: string
  dependencies: string[]
  fileTargets: string[]
  expectedOutput: string
  verification: string
}

export interface PlanDto {
  id: string
  prompt: string
  tasks: PlanTaskDto[]
  createdAt: string
}

export interface GeneratePlanRequestDto extends Record<string, unknown> {
  projectRoot: string
  prompt: string
}

export interface ExecutePlanRequestDto extends Record<string, unknown> {
  projectRoot: string
  plan: PlanDto
}

export type CheckpointTrigger =
  | 'before-agent'
  | 'before-tool'
  | 'before-edit'
  | 'after-edit'
  | 'task-completed'
  | 'before-rewind'
  | 'manual'

export interface CheckpointFileDto {
  relPath: string
  existed: boolean
  hash?: string
  sizeBytes?: number
}

export interface CheckpointDto {
  id: string
  projectRoot: string
  createdAt: string
  reason: string
  trigger: CheckpointTrigger
  sessionId?: string
  taskId?: string
  files: CheckpointFileDto[]
  gitHead?: string
  gitBranch?: string
  /** Set on safety checkpoints created before a rewind (branched timeline). */
  branchedFrom?: string
}

export interface RewindPreviewEntryDto {
  relPath: string
  action: 'restore' | 'recreate' | 'delete' | 'unchanged'
}

export interface RewindPreviewDto {
  checkpointId: string
  createdAt: string
  reason: string
  entries: RewindPreviewEntryDto[]
  changes: number
}

export interface CheckpointRequestDto extends Record<string, unknown> {
  projectRoot: string
  checkpointId?: string
  reason?: string
  files?: string[]
}

export type BackgroundAgentStatus =
  | 'queued'
  | 'running'
  | 'done'
  | 'failed'
  | 'cancelled'
  | 'interrupted'

export interface BackgroundAgentDto {
  id: string
  projectRoot: string
  prompt: string
  title: string
  status: BackgroundAgentStatus
  createdAt: string
  startedAt?: string
  finishedAt?: string
  error?: string
  resultText?: string
  changedFiles: string[]
  logs: string[]
  runId?: string
  useWorktree?: boolean
  worktreeRoot?: string
  retryOf?: string
  usage?: RunUsageDto
}

export interface LaunchBackgroundAgentRequestDto extends Record<string, unknown> {
  projectRoot: string
  prompt: string
  useWorktree?: boolean
}

export interface BackgroundAgentUpdateEvent extends BaseRuntimeEvent {
  type: 'background_agent_update'
  agent: BackgroundAgentDto
}

export type TestFramework =
  | 'bun'
  | 'jest'
  | 'vitest'
  | 'pytest'
  | 'go'
  | 'mocha'
  | 'unknown'

export interface FailingTestDto {
  name: string
  file?: string
  message?: string
}

export interface TestRunRequestDto extends Record<string, unknown> {
  projectRoot: string
  command: string
  worktreeRoot?: string
}

export interface TestRunResultDto {
  command: string
  framework: TestFramework
  startedAt: number
  finishedAt: number
  durationMs: number
  exitCode: number
  passed: number
  failed: number
  skipped: number
  failingTests: FailingTestDto[]
  output: string
  stderrTail: string
  /** The command itself failed to run (vs. tests failing). */
  runtimeFailure: boolean
  denied?: boolean
}

// All structured runtime events that the renderer can receive.
export type RuntimeEvent =
  | RunStartedEvent
  | MessageCreatedEvent
  | ModelStreamEvent
  | PlanCreatedEvent
  | TaskCreatedEvent
  | TaskStartedEvent
  | TaskProgressEvent
  | TaskDoneEvent
  | TaskFailedEvent
  | TaskWaitingApprovalEvent
  | TaskSkippedEvent
  | AgentStartedEvent
  | AgentProgressEvent
  | AgentFinishedEvent
  | ToolCallStartedEvent
  | ToolCallFinishedEvent
  | CommandStartedEvent
  | CommandOutputEvent
  | CommandFinishedEvent
  | ApprovalRequiredEvent
  | ApprovalRespondedEvent
  | ApprovalLoggedEvent
  | DiffCreatedEvent
  | PatchAppliedEvent
  | WorktreeCreatedEvent
  | ChangedFilesEvent
  | VerificationCompletedEvent
  | UsageUpdatedEvent
  | RunResultEvent
  | BackgroundAgentUpdateEvent
  | RunFinishedEvent
  | RunFailedEvent

export interface BaseRuntimeEvent {
  type: string
  runId: string
  sessionId: string
  projectRoot: string
  timestamp: number
}

export interface RunStartedEvent extends BaseRuntimeEvent {
  type: 'run_started'
  worktreeRoot?: string
}

export interface MessageCreatedEvent extends BaseRuntimeEvent {
  type: 'message_created'
  role: 'user' | 'assistant'
  content: string
}

export interface ModelStreamEvent extends BaseRuntimeEvent {
  type: 'model_stream'
  delta: string
}

export interface PlanCreatedEvent extends BaseRuntimeEvent {
  type: 'plan_created'
  plan: string
}

export interface TaskCreatedEvent extends BaseRuntimeEvent {
  type: 'task_created'
  taskId: string
  title: string
  description?: string
  index: number
  dependencies: string[]
}

export interface TaskStartedEvent extends BaseRuntimeEvent {
  type: 'task_started'
  taskId: string
  assignedAgent?: string
}

export interface TaskProgressEvent extends BaseRuntimeEvent {
  type: 'task_progress'
  taskId: string
  message: string
}

export interface TaskDoneEvent extends BaseRuntimeEvent {
  type: 'task_done'
  taskId: string
}

export interface TaskFailedEvent extends BaseRuntimeEvent {
  type: 'task_failed'
  taskId: string
  error: string
}

export interface TaskWaitingApprovalEvent extends BaseRuntimeEvent {
  type: 'task_waiting_approval'
  taskId: string
  requestId: string
}

export interface TaskSkippedEvent extends BaseRuntimeEvent {
  type: 'task_skipped'
  taskId: string
}

export interface AgentStartedEvent extends BaseRuntimeEvent {
  type: 'agent_started'
  agentId: string
  taskId: string
  name: string
  role?: string
}

export interface AgentProgressEvent extends BaseRuntimeEvent {
  type: 'agent_progress'
  agentId: string
  taskId: string
  message: string
  currentTool?: string
  currentCommand?: string
}

export interface AgentFinishedEvent extends BaseRuntimeEvent {
  type: 'agent_finished'
  agentId: string
  taskId: string
}

export interface ToolCallStartedEvent extends BaseRuntimeEvent {
  type: 'tool_call_started'
  toolName: string
  input: Record<string, unknown>
}

export interface ToolCallFinishedEvent extends BaseRuntimeEvent {
  type: 'tool_call_finished'
  toolName: string
  result: unknown
}

export interface CommandStartedEvent extends BaseRuntimeEvent {
  type: 'command_started'
  command: string
}

export interface CommandOutputEvent extends BaseRuntimeEvent {
  type: 'command_output'
  output: string
  commandId?: string
}

export interface CommandFinishedEvent extends BaseRuntimeEvent {
  type: 'command_finished'
  exitCode: number
  commandId?: string
  output?: string
}

export type ApprovalScope = 'once' | 'run' | 'session'

export interface ApprovalRequiredEvent extends BaseRuntimeEvent {
  type: 'approval_required'
  requestId: string
  taskId?: string
  agentId?: string
  toolName: string
  input: Record<string, unknown>
  actionType?: string
  target?: string
  reason?: string
  riskLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical'
  scope?: ApprovalScope
  approvalProjectRoot?: string
}

export interface ApprovalRespondedEvent extends BaseRuntimeEvent {
  type: 'approval_responded'
  requestId: string
  approved: boolean
  scope?: ApprovalScope
}

export interface ApprovalLoggedEvent extends BaseRuntimeEvent {
  type: 'approval_logged'
  entry: {
    timestamp: string
    runId: string
    requestId: string
    actionType: string
    target: string
    reason: string
    riskLevel: string
    decision: 'allowed' | 'denied'
    scope: ApprovalScope
  }
}

export interface DiffCreatedEvent extends BaseRuntimeEvent {
  type: 'diff_created'
  diffId: string
  filePath: string
  patch: string
  /** sha256 per old file path at generation time, for stale detection. */
  baseHashes?: Record<string, string>
}

export interface PatchAppliedEvent extends BaseRuntimeEvent {
  type: 'patch_applied'
  diffId: string
  filePath: string
}

export interface WorktreeCreatedEvent extends BaseRuntimeEvent {
  type: 'worktree_created'
  worktreeRoot: string
  branch: string
}

export interface ChangedFilesEvent extends BaseRuntimeEvent {
  type: 'changed_files'
  files: string[]
  taskId?: string
}

export interface VerificationCompletedEvent extends BaseRuntimeEvent {
  type: 'verification_completed'
  taskId: string
  passed: boolean
  level: 'l1' | 'l2'
  message?: string
}

export interface RunUsageDto {
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheCreationTokens: number
  reasoningTokens?: number
  requests: number
  elapsedMs: number
  /** Absent for local providers (no fabricated cost) and unknown models. */
  costUsd?: number
  /** True when computed from the pricing table rather than provider data. */
  costIsEstimate: boolean
  model?: string
}

export interface UsageUpdatedEvent extends BaseRuntimeEvent {
  type: 'usage_updated'
  usage: RunUsageDto
}

export interface RunResultEvent extends BaseRuntimeEvent {
  type: 'run_result'
  usage: RunUsageDto
  durationMs?: number
  numTurns?: number
  resultText?: string
  isError?: boolean
}

export interface RunFinishedEvent extends BaseRuntimeEvent {
  type: 'run_finished'
}

export interface RunFailedEvent extends BaseRuntimeEvent {
  type: 'run_failed'
  error: string
}

export interface RuntimeProjectDto {
  root: string
  [key: string]: unknown
}

export interface RuntimeSessionDto {
  sessionId: string
  projectRoot: string
  worktreeRoot?: string
  [key: string]: unknown
}

export type AgentApprovalPolicy = 'untrusted' | 'on-request' | 'never'
export type AgentSandboxMode = 'read-only' | 'workspace-write' | 'danger-full-access'

export interface AgentPermissionSettingsDto extends Record<string, unknown> {
  approvalPolicy: AgentApprovalPolicy
  sandboxMode: AgentSandboxMode
  networkAccess: boolean
}

export interface StartRunOptionsDto extends Record<string, unknown> {
  useWorktree?: boolean
  branch?: string
  permissions?: AgentPermissionSettingsDto
}

export interface RuntimeToolInfoDto {
  name: string
  [key: string]: unknown
}

export interface RuntimeToolDefinitionDto {
  name: string
  description?: string
  risk?: 'none' | 'low' | 'medium' | 'high'
  needsApproval?: boolean
  [key: string]: unknown
}

export interface RuntimeSlashCommandDto {
  name: string
  description: string
  argumentHint?: string
  aliases: string[]
  commandType: 'local' | 'local-jsx' | 'prompt'
  source?: string
  loadedFrom?: string
}

export type DesktopProviderKind =
  | 'openai-api'
  | 'anthropic-api'
  | 'openrouter'
  | 'ollama'
  | 'ollama-network'
  | 'ollama-cloud'
  | 'openai-compatible'

export interface RuntimeProviderInfoDto {
  id: string
  displayName: string
  active: boolean
  [key: string]: unknown
}

export interface DesktopProviderInfoDto {
  id: DesktopProviderKind
  displayName: string
  active: boolean
  hasKey: boolean
  keySource?: 'stored' | 'env' | 'none'
  supportsTools: boolean
  supportsVision: boolean
  supportsReasoning: boolean
}

export interface DesktopProviderConfigDto {
  providerId: DesktopProviderKind
  model?: string
  baseUrl?: string
  preferences?: Record<string, string | number | boolean>
}

export type DesktopProviderConfigPatch = DesktopProviderConfigDto & {
  apiKey?: string
}

export interface DesktopModelInfoDto {
  id: string
  displayName?: string
  provider: DesktopProviderKind
  contextLength?: number
}

export interface DesktopProviderConnectionResultDto {
  ok: boolean
  status: 'connected' | 'missing' | 'unavailable' | 'unknown'
  latencyMs?: number
  error?: string
  models?: string[]
}

export interface RuntimeModelInfoDto {
  id: string
  displayName?: string
  [key: string]: unknown
}

export interface RuntimeTaskInfoDto extends TaskInfoDto {}

export interface RuntimeAgentInfoDto extends AgentInfoDto {}

export type ConnectorTransport = 'stdio' | 'sse' | 'http' | 'ws'

export interface RuntimeConnectorDto {
  name: string
  transport: ConnectorTransport
  enabled: boolean
  command?: string
  args?: string[]
  env?: Record<string, string>
  cwd?: string
  url?: string
  headers?: Record<string, string>
  status?: 'connected' | 'failed' | 'disabled' | 'unknown'
  error?: string
  tools?: RuntimeConnectorToolDto[]
}

export interface RuntimeConnectorToolDto {
  name: string
  description?: string
  inputSchema?: Record<string, unknown>
  serverName: string
}

export interface AddConnectorRequestDto {
  projectRoot: string
  name: string
  transport: ConnectorTransport
  command?: string
  args?: string[]
  env?: Record<string, string>
  cwd?: string
  url?: string
  headers?: Record<string, string>
  enabled?: boolean
  [key: string]: unknown
}

export interface UpdateConnectorRequestDto {
  projectRoot: string
  name: string
  enabled?: boolean
  config?: Partial<Omit<AddConnectorRequestDto, 'projectRoot' | 'name'>>
  [key: string]: unknown
}

export interface CallConnectorToolRequestDto {
  projectRoot: string
  serverName: string
  toolName: string
  input: Record<string, unknown>
  requestId?: string
  [key: string]: unknown
}

export interface RuntimeMcpServerDto {
  name: string
  enabled: boolean
  [key: string]: unknown
}

export interface ProjectInfoDto {
  root: string
  name: string
  isGit: boolean
  branch?: string
  dirtyFiles: string[]
  packageManager?: string
  scripts: string[]
  language?: string
  framework?: string
  hasUrFolder: boolean
  hasUrMd: boolean
  hasUrLocalMd: boolean
  [key: string]: unknown
}

export interface RecentProjectDto {
  root: string
  name: string
  lastOpenedAt: number
  [key: string]: unknown
}

export interface WorktreeInfoDto {
  root: string
  branch: string
  isMain: boolean
  [key: string]: unknown
}

export interface StreamEventDto {
  type: string
  sessionId: string
  payload: unknown
  [key: string]: unknown
}

export interface ReadFileRequestDto {
  projectRoot: string
  path: string
  worktreeRoot?: string
  [key: string]: unknown
}

export interface ProposeEditRequestDto {
  projectRoot: string
  path: string
  newText: string
  worktreeRoot?: string
  [key: string]: unknown
}

export interface ApplyPatchRequestDto {
  projectRoot: string
  patch: string
  worktreeRoot?: string
  [key: string]: unknown
}

export interface RunCommandRequestDto {
  projectRoot: string
  command: string
  worktreeRoot?: string
  [key: string]: unknown
}

export interface TerminalCommandDto {
  id: string
  command: string
  cwd: string
  startTime: number
  endTime?: number
  durationMs?: number
  exitCode?: number
  stdout: string
  stderr: string
  status: 'running' | 'done' | 'error' | 'stopped'
  [key: string]: unknown
}

export interface AddMcpServerRequestDto {
  projectRoot: string
  name: string
  command: string
  args?: string[]
  env?: Record<string, string>
  [key: string]: unknown
}

export interface ApprovalResponseDto {
  requestId: string
  approved: boolean
  scope?: ApprovalScope
  [key: string]: unknown
}

export interface ProjectSafetyPolicyDto {
  version: 1
  permissionClasses: Record<string, string>
  askBefore: Array<{ pattern: string; reason: string }>
  deny: Array<{ pattern: string; reason: string }>
  secretFiles: string[]
  secretEnvPatterns: string[]
  networkCommands: string[]
  sandboxRequiredFor: Array<'read' | 'write' | 'execute' | 'network'>
  developerMode?: {
    denyBecomesAsk?: boolean
  }
}

export interface GetSafetyPolicyRequestDto extends Record<string, unknown> {
  projectRoot: string
}

export interface SetSafetyPolicyRequestDto extends Record<string, unknown> {
  projectRoot: string
  policy: ProjectSafetyPolicyDto
}

export interface RunSummaryDto {
  runId: string
  sessionId: string
  projectRoot: string
  projectName: string
  worktreeRoot?: string
  startedAt: string
  finishedAt?: string
  status: 'running' | 'finished' | 'failed' | 'stopped'
  title?: string
  providerId?: string
  modelId?: string
  changedFiles: string[]
  costUsd?: number
  reportPath?: string
}

export interface RunDetailDto {
  record: RunSummaryDto
  transcript: Record<string, unknown>[]
}

export interface RunReportDto {
  runId: string
  projectRoot: string
  projectName?: string
  title?: string
  startedAt?: string
  finishedAt?: string
  status?: string
  providerId?: string
  modelId?: string
  providerMode?: string
  costUsd?: number
  tokenUsage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number }
  completedTasks: Array<{ id: string; title: string }>
  failedTasks: Array<{ id: string; title: string; error?: string }>
  verifiedChanges: Array<{ file: string; description: string }>
  unverifiedClaims: Array<{ claim: string; reason: string }>
  testsRun: Array<{ command: string; passed: boolean; output?: string }>
  failedChecks: Array<{ check: string; reason: string }>
  remainingIssues: Array<{ issue: string; severity: string }>
  approvals: Array<{
    timestamp: string
    runId: string
    requestId: string
    actionType: string
    target: string
    reason: string
    riskLevel: string
    decision: 'allowed' | 'denied'
    scope: ApprovalScope
  }>
  changedFiles: string[]
  messages: Array<{ role: string; content?: string; toolName?: string }>
}

export interface ListRunsRequestDto extends Record<string, unknown> {
  projectRoot: string
  limit?: number
}

export interface GetRunRequestDto extends Record<string, unknown> {
  runId: string
}

export interface DeleteRunRequestDto extends Record<string, unknown> {
  runId: string
}

export interface ExportReportRequestDto extends Record<string, unknown> {
  projectRoot: string
  runId: string
  format: 'markdown' | 'json'
}

export interface GetReportRequestDto extends Record<string, unknown> {
  projectRoot: string
  runId: string
}
