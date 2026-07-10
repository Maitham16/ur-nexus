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
  // Projects
  | 'project:open'
  | 'project:list'
  | 'project:inspect'
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
  // Shell (validated, sandboxed)
  | 'command:run'
  | 'command:stop'
  | 'commands:list'
  // Tasks / agents
  | 'tasks:list'
  | 'agents:list'
  | 'settings:maxAgents'
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

export type ApprovalScope = 'once' | 'run' | 'session' | 'permanent'

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
  projectRoot?: string
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
  skipApproval?: boolean
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
  sandboxRequiredFor: string[]
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
    scope: 'once' | 'run' | 'session' | 'permanent'
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
