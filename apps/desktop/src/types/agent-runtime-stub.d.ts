// Type-only stub for @ur/agent-runtime used during desktop tsc typecheck.
// The real implementation is resolved at runtime/bundle time by Node module
// resolution; this stub prevents tsc from traversing the runtime source tree.

export type ProviderId = string

export interface RuntimeMcpStdioConfig {
  type?: 'stdio'
  command: string
  args?: string[]
  env?: Record<string, string>
  cwd?: string
  disabled?: boolean
  scope?: string
  [key: string]: unknown
}

export interface RuntimeMcpRemoteConfig {
  type: 'sse' | 'http' | 'ws'
  url: string
  headers?: Record<string, string>
  disabled?: boolean
  scope?: string
  [key: string]: unknown
}

export type RuntimeMcpConfig = RuntimeMcpStdioConfig | RuntimeMcpRemoteConfig

export interface RuntimeTool {
  name: string
  isMcp?: boolean
  isReadOnly(input?: unknown): boolean
  isDestructive?(input?: unknown): boolean
  [key: string]: unknown
}

export interface RuntimeAppState {
  mcp: {
    clients?: unknown
    tools?: RuntimeTool[]
    commands?: unknown[]
    resources?: Record<string, unknown>[]
    pluginReconnectKey?: number
    userServers?: Record<string, RuntimeMcpConfig>
    [key: string]: unknown
  }
  permissions?: {
    additionalDirectories?: string[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

export interface RuntimeProject {
  root: string
  appStateStore: {
    getState(): RuntimeAppState
    setState(updater: (prev: RuntimeAppState) => RuntimeAppState): void
  }
}

export interface RuntimeSession {
  engine: unknown
  project: RuntimeProject
  sessionId: string
}

export interface RuntimeToolInfo {
  name: string
}

export interface RuntimeProviderInfo {
  id: ProviderId
  displayName: string
  active: boolean
}

export interface RuntimeModelInfo {
  id: string
  displayName?: string
}

export interface RunPromptOptions {
  model?: string
  maxTurns?: number
  systemPrompt?: string
  replayUserMessages?: boolean
  includePartialMessages?: boolean
}

export type RuntimeEvent = {
  type: string
  subtype?: string
  session_id?: string
  uuid?: string
  [key: string]: unknown
}

export interface ContentBlockParam {
  type: string
  [key: string]: unknown
}

export declare function openProject(root: string): Promise<RuntimeProject>
export declare function enableConfigs(): void
export declare function setCwd(path: string): void
export declare function getCwd(): string
export type CanUseToolFn = (
  tool: RuntimeTool,
  input: Record<string, unknown>,
  toolUseContext?: unknown,
  assistantMessage?: unknown,
  toolUseID?: string,
  forceDecision?: PermissionDecision,
) => Promise<PermissionDecision>

export type PermissionDecision =
  | { behavior: 'allow'; updatedInput?: Record<string, unknown>; userModified?: boolean; [key: string]: unknown }
  | { behavior: 'deny'; message: string; [key: string]: unknown }
  | { behavior: 'ask'; message: string; [key: string]: unknown }
  | { behavior: 'passthrough'; message: string; [key: string]: unknown }

export declare function createSession(
  project: RuntimeProject,
  opts?: { sessionId?: string; canUseTool?: CanUseToolFn },
): Promise<RuntimeSession>
export declare function runPrompt(
  session: RuntimeSession,
  prompt: string | ContentBlockParam[],
  opts?: RunPromptOptions,
): AsyncGenerator<RuntimeEvent>
export declare function stopRun(session: RuntimeSession): void
export declare function pauseRun(session: RuntimeSession): void
export declare function resumeRun(session: RuntimeSession): void
export interface RuntimeToolDefinition {
  name: string
  description?: string
  risk?: 'none' | 'low' | 'medium' | 'high'
  needsApproval?: boolean
  [key: string]: unknown
}

export declare function listTools(project: RuntimeProject): RuntimeToolInfo[]
export declare function getToolDefinitions(project: RuntimeProject): RuntimeToolDefinition[]
export declare function requestToolCall(
  session: RuntimeSession,
  toolName: string,
  input: Record<string, unknown>,
): Promise<unknown>
export declare function requestApproval(
  project: RuntimeProject,
  toolName: string,
  input: Record<string, unknown>,
): Promise<{ approved: boolean }>
export declare function listProviders(project: RuntimeProject): RuntimeProviderInfo[]
export declare function setProvider(
  project: RuntimeProject,
  providerId: ProviderId,
  model?: string,
): Promise<void>
export declare function listModels(project: RuntimeProject): RuntimeModelInfo[]
export declare function createWorktree(
  project: RuntimeProject,
  branch: string,
): Promise<string>
export declare function applyPatch(project: RuntimeProject, patch: string): Promise<void>
export declare function readHistory(
  project: RuntimeProject,
  sessionId?: string,
): AsyncGenerator<unknown>

export declare function getAllMcpConfigs(): Promise<{
  servers: Record<string, RuntimeMcpConfig>
  errors: unknown[]
}>

export interface RuntimeTool {
  name: string
  isMcp?: boolean
  isReadOnly(input?: unknown): boolean
  isDestructive?(input?: unknown): boolean
  [key: string]: unknown
}

export declare function fetchToolsForClient(client: ConnectedMCPServer): Promise<RuntimeTool[]>

export type McpServerConfig = RuntimeMcpConfig
export interface McpStdioServerConfig extends RuntimeMcpStdioConfig {}
export interface McpSSEServerConfig extends RuntimeMcpRemoteConfig { type: 'sse' }
export interface McpHTTPServerConfig extends RuntimeMcpRemoteConfig { type: 'http' }
export interface McpWebSocketServerConfig extends RuntimeMcpRemoteConfig { type: 'ws' }

export interface ConnectedMCPServer {
  name: string
  type: 'connected'
  client: {
    listTools: () => Promise<{ tools: Array<{ name: string; description?: string; inputSchema?: Record<string, unknown> }> }>
    callTool: (req: { name: string; arguments?: Record<string, unknown> }) => Promise<unknown>
  }
  capabilities: Record<string, unknown>
  config: McpServerConfig & { scope: string }
  cleanup: () => Promise<void>
}

export interface FailedMCPServer {
  name: string
  type: 'failed'
  config: McpServerConfig
  error?: string
}

export type MCPServerConnection = ConnectedMCPServer | FailedMCPServer

export type ServerResource = { name: string; uri: string }

export declare class WebSocketTransport {
  constructor(ws: unknown)
  start(): Promise<void>
  close(): Promise<void>
  send(message: unknown): Promise<void>
}

export declare function getInitialSettings(): Record<string, unknown>
export declare function updateSettingsForSource(
  source: string,
  settings: Record<string, unknown>,
): { error: Error | null }

export type SettingsJson = Record<string, unknown> & {
  provider?: {
    active?: string
    model?: string
    baseUrl?: string
    commandPath?: string
    fallback?: string | 'disabled'
    preferences?: Record<string, string | number | boolean>
  }
}

export interface ProviderDefinition {
  displayName: string
  envKey?: string
  supportsNativeToolCalls: boolean
  supportsNativeStreaming: boolean
  defaultBaseUrl?: string
  accessType: string
  credentialType: string
  modelDiscoveryType: string
  endpointKind?: 'ollama' | 'openai-compatible'
  statusCheck: string
}

export declare function getProviderApiKey(
  providerId: string,
  options?: { env?: Record<string, string | undefined> },
): string | undefined
export declare function getProviderApiKeySource(
  providerId: string,
  options?: { env?: Record<string, string | undefined> },
): 'stored' | 'env' | 'none'
export declare function setProviderApiKey(
  providerId: string,
  apiKey: string,
): { ok: true; message: string } | { ok: false; message: string }
export declare function clearProviderApiKey(
  providerId: string,
): { ok: true; message: string } | { ok: false; message: string }

export declare function getProviderDefinition(id: string): {
  displayName: string
  envKey?: string
  supportsNativeToolCalls: boolean
  supportsNativeStreaming: boolean
  defaultBaseUrl?: string
  accessType: string
  credentialType: string
  modelDiscoveryType: string
  endpointKind?: 'ollama' | 'openai-compatible'
  statusCheck: string
}
export declare function getProviderStatus(
  providerId: string,
  options?: { settings?: Record<string, unknown> },
): Promise<{
  status: 'connected' | 'missing' | 'unavailable' | 'unknown'
  label: string
  doctor: { checks: Array<{ name: string; message?: string }> }
}>
export declare function listModelsForProviderWithSource(
  providerId: string,
  options?: { settings?: Record<string, unknown>; signal?: AbortSignal },
): Promise<{
  models: Array<{ id: string; displayName?: string; contextLength?: number }>
}>
export declare function setProviderModel(
  providerId: string,
  modelId: string,
  options?: { source?: string },
): { ok: true; message: string } | { ok: false; message: string }
export declare function setSafeProviderConfig(
  key: string,
  value: string,
  options?: { source?: string },
): { ok: true; message: string } | { ok: false; message: string }
export declare function getActiveProviderSettings(
  settings?: Record<string, unknown>,
): {
  active?: string
  model?: string
  baseUrl?: string
  commandPath?: string
  fallback?: string | 'disabled'
}
export declare function getProviderFamily(providerId: string): string

// Safety / project policy / permissions (desktop main process reuse)
export type PermissionClass = 'read' | 'write' | 'execute' | 'network'
export type SafetyBehavior = 'allow' | 'ask' | 'deny'
export type ApprovalLevel =
  | 'read-only'
  | 'edit-project'
  | 'run-safe-commands'
  | 'run-network-commands'
  | 'destructive-commands'

export interface SafetyPolicyRule {
  pattern: string
  reason: string
}

export interface ProjectSafetyPolicy {
  version: 1
  permissionClasses: Record<PermissionClass, string>
  askBefore: SafetyPolicyRule[]
  deny: SafetyPolicyRule[]
  secretFiles: string[]
  secretEnvPatterns: string[]
  networkCommands: string[]
  sandboxRequiredFor: PermissionClass[]
  developerMode?: {
    denyBecomesAsk?: boolean
  }
}

export interface ShellSafetyEvaluation {
  command: string
  behavior: SafetyBehavior
  approvalLevel: ApprovalLevel
  permissions: PermissionClass[]
  audit: {
    mode: string
    commandCategory: ApprovalLevel
    decision: SafetyBehavior
    sandboxRequired: boolean
    sandboxAvailable: boolean | null
    reason: string
    unsafeBypassUsed: boolean
  }
  reasons: string[]
  matchedRules: SafetyPolicyRule[]
}

export declare function evaluateShellSafetyPolicy(
  command: string,
  cwd: string,
  input?: {
    dangerouslyDisableSandbox?: boolean
    autonomousMode?: boolean
    unsafeMode?: boolean
    sandboxAvailable?: boolean
  },
): ShellSafetyEvaluation
export declare function loadProjectSafetyPolicy(cwd: string): ProjectSafetyPolicy
export declare function writeProjectSafetyPolicy(cwd: string): string
export declare const DEFAULT_PROJECT_SAFETY_POLICY: ProjectSafetyPolicy
export declare function formatShellSafetyEvaluation(
  evaluation: ShellSafetyEvaluation,
  json?: boolean,
): string
export declare function approvalLevelForEvaluation(
  permissions: PermissionClass[],
  matchedAsk?: SafetyPolicyRule[],
): ApprovalLevel
export declare function pathIsInsideWorkspace(path: string, cwd: string): boolean

export declare function checkPathSafetyForAutoEdit(
  path: string,
  precomputedPathsToCheck?: readonly string[],
):
  | { safe: true }
  | { safe: false; message: string; classifierApprovable: boolean }

export declare function pathInWorkingPath(path: string, workingPath: string): boolean

export declare const DANGEROUS_FILES: readonly string[]
export declare const DANGEROUS_DIRECTORIES: readonly string[]
export declare function pathIsInsideWorkspace(path: string, cwd: string): boolean

export type PermissionRuleValue = { toolName: string; ruleContent?: string }
export type PermissionRule = {
  source: string
  ruleBehavior: SafetyBehavior
  ruleValue: PermissionRuleValue
}

export declare function getRuleByContentsForToolName(
  toolName: string,
  ruleContent?: string,
): PermissionRule | undefined
export declare function hasPermissionsToUseTool(
  toolName: string,
  input: Record<string, unknown>,
  context: unknown,
  mode: string,
  toolUseContext?: unknown,
  settings?: Record<string, unknown>,
  metadata?: { command?: { name: string; [key: string]: unknown } },
): Promise<PermissionResult>

export type PermissionResult = {
  behavior: 'allow' | 'deny' | 'ask' | 'passthrough'
  message?: string
  decisionReason?: unknown
  suggestions?: unknown[]
  blockedPath?: string
  [key: string]: unknown
}

export declare function createPermissionRequestMessage(
  toolName: string,
  decisionReason?: unknown,
): string

export declare function permissionModeTitle(mode: string): string

export declare const PERMISSION_MODES: readonly string[]
export declare const EXTERNAL_PERMISSION_MODES: readonly string[]
export type ExternalPermissionMode =
  | 'acceptEdits'
  | 'autoApprove'
  | 'bypassPermissions'
  | 'default'
  | 'plan'
export type PermissionMode =
  | ExternalPermissionMode
  | 'auto'
  | 'bubble'
  | 'dontAsk'

export declare function isExternalPermissionMode(
  mode: PermissionMode,
): mode is ExternalPermissionMode

export declare function shouldUseSandbox(
  command: string,
  settings?: Record<string, unknown>,
): boolean

export declare function logPermissionDecision(
  toolName: string,
  decision: 'allow' | 'deny' | 'ask',
  details?: Record<string, unknown>,
): void

export type RuntimeToolDefinition = RuntimeToolInfo

export interface RuntimeMcpConfig extends RuntimeMcpStdioConfig {}

export interface RuntimeTool {
  name: string
  isMcp?: boolean
  isReadOnly(input?: unknown): boolean
  isDestructive?(input?: unknown): boolean
  [key: string]: unknown
}
