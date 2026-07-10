// @ur/agent-runtime — shared UR-Nexus agent runtime for CLI and Desktop.
//
// This package exposes the core agent runtime as a library. The CLI continues to
// import directly from src/, while the desktop app imports from this package.
// Keeping the source of truth in src/ avoids duplicating logic or moving
// thousands of files during Phase 1.

export {
  QueryEngine,
  ask,
  type QueryEngineConfig,
} from 'src/QueryEngine.js'

export { query } from 'src/query.js'

export {
  getAllBaseTools,
  getToolsForDefaultPreset,
  type ToolPreset,
  parseToolPreset,
} from 'src/tools.js'

export {
  PROVIDER_IDS,
  DEFAULT_PROVIDER_ID,
  type ProviderId,
  type ProviderFamily,
  type ProviderAccessType,
  type ProviderCredentialType,
  type ProviderDefinition,
  type ProviderDoctorResult,
  type ProviderRuntimeInfo,
  type ProviderStatusSummary,
  type ProviderConnectionStatus,
  type ProviderSettings,
  getActiveProviderSettings,
  getProviderDefinition,
  getProviderRuntimeInfo,
  listProviders as listProviderDefinitions,
} from 'src/services/providers/providerRegistry.js'

export {
  type Tool,
  type Tools,
  type ToolPermissionContext,
  type ToolUseContext,
  toolMatchesName,
  getEmptyToolPermissionContext,
} from 'src/Tool.js'

export type {
  CanUseToolFn,
} from 'src/hooks/useCanUseTool.js'

export type {
  PermissionResult,
  PermissionDecision,
} from 'src/types/permissions.js'

export {
  getAllowRules,
  getDenyRules,
  getAskRules,
  createPermissionRequestMessage,
} from 'src/utils/permissions/permissions.js'

export {
  type AppState,
  type AppStateStore,
  getDefaultAppState,
} from 'src/state/AppStateStore.js'

export { createStore, type Store } from 'src/state/store.js'

export {
  type Message,
  type UserMessage,
  type AssistantMessage,
  type StreamEvent,
} from 'src/types/message.js'

export {
  getSessionId,
  isSessionPersistenceDisabled,
  getProjectRoot,
} from 'src/bootstrap/state.js'

export {
  type FileHistoryState,
  fileHistoryMakeSnapshot,
  fileHistoryEnabled,
} from 'src/utils/fileHistory.js'

export {
  type TaskState,
} from 'src/tasks/types.js'

export {
  backgroundDir,
  type BackgroundTask,
  type StartBackgroundTaskOptions,
  startBackgroundTask,
  listBackgroundTasks,
} from 'src/services/agents/backgroundRunner.js'

export {
  createUserMessage,
  createSystemMessage,
  normalizeMessagesForAPI,
} from 'src/utils/messages.js'

export {
  asSystemPrompt,
  type SystemPrompt,
} from 'src/utils/systemPromptType.js'

export {
  fetchSystemPromptParts,
} from 'src/utils/queryContext.js'

export {
  getInitialSettings,
  updateSettingsForSource,
} from 'src/utils/settings/settings.js'

export type { SettingsJson } from 'src/utils/settings/types.js'

export {
  getProviderApiKey,
  getProviderApiKeySource,
  setProviderApiKey,
  clearProviderApiKey,
} from 'src/services/providers/providerCredentials.js'

export {
  getProviderStatus,
  listModelsForProviderWithSource,
  setProviderModel,
  setSafeProviderConfig,
  getProviderFamily,
} from 'src/services/providers/providerRegistry.js'

export {
  getSlashCommandToolSkills,
  type Command,
} from 'src/commands.js'

export {
  makeHistoryReader,
  getHistory,
  getTimestampedHistory,
} from 'src/history.js'

export type { HistoryEntry } from 'src/utils/config.js'

export {
  recordTranscript,
  flushSessionStorage,
} from 'src/utils/sessionStorage.js'

export {
  type MCPServerConnection,
  type ConnectedMCPServer,
  type FailedMCPServer,
  type ServerResource,
  type McpServerConfig,
  type McpStdioServerConfig,
  type McpSSEServerConfig,
  type McpHTTPServerConfig,
  type McpWebSocketServerConfig,
} from 'src/services/mcp/types.js'

export {
  getAllMcpConfigs,
  isMcpServerDisabled,
} from 'src/services/mcp/config.js'

export { fetchToolsForClient } from 'src/services/mcp/client.js'

export { WebSocketTransport } from 'src/utils/mcpWebSocketTransport.js'

export {
  type CheckResult,
  Verifier,
} from 'src/services/verifier/index.js'

export {
  getMainLoopModel,
  parseUserSpecifiedModel,
  type ModelSetting,
} from 'src/utils/model/model.js'

export {
  getCwd,
} from 'src/utils/cwd.js'

export {
  setCwd,
} from 'src/utils/Shell.js'

export {
  findCanonicalGitRoot,
  findGitRoot,
} from 'src/utils/git.js'

// Safety / permissions / project policy (desktop main process reuses these)
export {
  evaluateShellSafetyPolicy,
  loadProjectSafetyPolicy,
  writeProjectSafetyPolicy,
  DEFAULT_PROJECT_SAFETY_POLICY,
  formatShellSafetyEvaluation,
  approvalLevelForEvaluation,
  pathIsInsideWorkspace,
  type ProjectSafetyPolicy,
  type ShellSafetyEvaluation,
  type SafetyBehavior,
  type ApprovalLevel,
  type PermissionClass,
} from 'src/services/safety/projectSafety.js'

export {
  checkPathSafetyForAutoEdit,
  pathInWorkingPath,
  DANGEROUS_FILES,
  DANGEROUS_DIRECTORIES,
  type PermissionDecision,
  type PermissionResult,
} from 'src/utils/permissions/filesystem.js'

export {
  getRuleByContentsForToolName,
  hasPermissionsToUseTool,
  type PermissionRule,
  type PermissionRuleValue,
} from 'src/utils/permissions/permissions.js'

export {
  PERMISSION_MODES,
  EXTERNAL_PERMISSION_MODES,
  type ExternalPermissionMode,
  type PermissionMode,
  isExternalPermissionMode,
} from 'src/utils/permissions/PermissionMode.js'

export {
  shouldUseSandbox,
} from 'src/tools/BashTool/shouldUseSandbox.js'

export {
  logPermissionDecision,
} from 'src/hooks/toolPermission/permissionLogging.js'

// --- Desktop-facing high-level runtime API ---

import type { ContentBlockParam } from '@urhq-ai/sdk/resources/messages.mjs'
import { randomUUID } from 'crypto'
import { QueryEngine } from 'src/QueryEngine.js'
import { getEmptyToolPermissionContext } from 'src/Tool.js'
import type { AppState } from 'src/state/AppStateStore.js'
import {
  getDefaultAppState,
  type AppStateStore,
} from 'src/state/AppStateStore.js'
import { createStore } from 'src/state/store.js'
import { setCwdState } from 'src/bootstrap/state.js'
import type { Message } from 'src/types/message.js'
import { createFileStateCacheWithSizeLimit } from 'src/utils/fileStateCache.js'
import {
  getMainLoopModel,
  parseUserSpecifiedModel,
} from 'src/utils/model/model.js'
import { getInitialSettings } from 'src/utils/settings/settings.js'
import {
  getActiveProviderSettings,
  listProviders as listProviderDefinitions,
  type ProviderId,
} from 'src/services/providers/providerRegistry.js'
import { getAllBaseTools } from 'src/tools.js'
import { makeHistoryReader } from 'src/history.js'
import { setCwd } from 'src/utils/Shell.js'
import { fileHistoryMakeSnapshot } from 'src/utils/fileHistory.js'

export interface RuntimeProject {
  root: string
  appStateStore: AppStateStore
}

export interface RuntimeSession {
  engine: QueryEngine
  project: RuntimeProject
  sessionId: string
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

export type RuntimeEvent = import('src/entrypoints/agentSdkTypes.js').SDKMessage

export interface RunPromptOptions {
  model?: string
  maxTurns?: number
  systemPrompt?: string
  replayUserMessages?: boolean
  includePartialMessages?: boolean
}

export async function openProject(root: string): Promise<RuntimeProject> {
  setCwd(root)
  setCwdState(root)
  const initialSettings = getInitialSettings()
  const appState: AppState = {
    ...getDefaultAppState(),
    settings: initialSettings,
    provider: getActiveProviderSettings(initialSettings),
  }
  const store = createStore(appState)
  return { root, appStateStore: store }
}

export async function createSession(
  project: RuntimeProject,
  opts: { sessionId?: string; canUseTool?: import('src/hooks/useCanUseTool.js').CanUseToolFn } = {},
): Promise<RuntimeSession> {
  const sessionId = opts.sessionId ?? randomUUID()
  const appState = project.appStateStore.getState()
  const tools = getAllBaseTools()
  const engine = new QueryEngine({
    cwd: project.root,
    tools,
    commands: [],
    mcpClients: appState.mcp.clients,
    agents: appState.agentDefinitions.activeAgents,
    canUseTool: opts.canUseTool ?? (async () => ({ behavior: 'allow' } as import('src/types/permissions.js').PermissionDecision<Record<string, unknown>>)),
    getAppState: () => project.appStateStore.getState(),
    setAppState: fn => project.appStateStore.setState(fn),
    initialMessages: [],
    readFileCache: createFileStateCacheWithSizeLimit(100),
    userSpecifiedModel: appState.mainLoopModel ?? undefined,
  })
  return { engine, project, sessionId }
}

export async function* runPrompt(
  session: RuntimeSession,
  prompt: string | ContentBlockParam[],
  opts: RunPromptOptions = {},
): AsyncGenerator<RuntimeEvent> {
  const model = opts.model
    ? parseUserSpecifiedModel(opts.model)
    : getMainLoopModel()
  session.engine.setModel(model ?? undefined)
  yield* session.engine.submitMessage(prompt, {
    uuid: randomUUID(),
  })
}

export async function* streamRunEvents(
  session: RuntimeSession,
): AsyncGenerator<RuntimeEvent> {
  // Placeholder: in a full implementation this would subscribe to a shared
  // event bus. For Phase 1 the runPrompt generator already streams events.
  yield {
    type: 'system',
    subtype: 'ready',
    session_id: session.sessionId,
    uuid: randomUUID(),
  } as unknown as RuntimeEvent
}

export function stopRun(session: RuntimeSession): void {
  session.engine.interrupt()
}

export function pauseRun(_session: RuntimeSession): void {
  // Pause is not a first-class runtime primitive today; mapped to interrupt.
}

export function resumeRun(_session: RuntimeSession): void {
  // Resume is not a first-class runtime primitive today; no-op placeholder.
}

export interface RuntimeToolInfo {
  name: string
}

export function listTools(_project: RuntimeProject): RuntimeToolInfo[] {
  return getAllBaseTools()
    .filter(tool => tool.isEnabled())
    .map(tool => ({ name: tool.name }))
}

export async function requestToolCall(
  session: RuntimeSession,
  _toolName: string,
  _input: Record<string, unknown>,
): Promise<unknown> {
  // Placeholder for explicit tool-call API. Full implementation would route
  // through the tool executor with permission checks.
  return { ok: true, sessionId: session.sessionId }
}

export async function requestApproval(
  _project: RuntimeProject,
  _toolName: string,
  _input: Record<string, unknown>,
): Promise<{ approved: boolean }> {
  // Placeholder: desktop app will wire this to a native approval dialog.
  return { approved: false }
}

export function listProviders(project: RuntimeProject): RuntimeProviderInfo[] {
  const activeId = project.appStateStore.getState().provider.active
  return listProviderDefinitions({}).map(def => ({
    id: def.id,
    displayName: def.displayName,
    active: def.id === activeId,
  }))
}

export async function setProvider(
  project: RuntimeProject,
  providerId: ProviderId,
  model?: string,
): Promise<void> {
  const def = getProviderDefinition(providerId)
  if (!def) {
    throw new Error(`Unknown provider: ${providerId}`)
  }
  project.appStateStore.setState(prev => ({
    ...prev,
    provider: {
      ...prev.provider,
      active: providerId,
      model,
    },
  }))
}

export function listModels(_project: RuntimeProject): RuntimeModelInfo[] {
  // Phase 1 placeholder: returns the currently configured model only.
  const model = getMainLoopModel()
  return model ? [{ id: model, displayName: model }] : []
}

export async function createWorktree(
  _project: RuntimeProject,
  _branch: string,
): Promise<string> {
  // Placeholder: full implementation will use src/utils/worktree helpers.
  throw new Error('createWorktree not implemented in Phase 1')
}

export async function applyPatch(
  _project: RuntimeProject,
  _patch: string,
): Promise<void> {
  // Placeholder: full implementation will use src/tools/FileEditTool or
  // src/services/ideDiffs.
  throw new Error('applyPatch not implemented in Phase 1')
}

export async function* readHistory(
  _project: RuntimeProject,
  _sessionId?: string,
): AsyncGenerator<Message> {
  for await (const entry of makeHistoryReader()) {
    yield entry as unknown as Message
  }
}

export function makeSnapshot(session: RuntimeSession): void {
  const engine = session.engine
  const messages = engine.getMessages()
  if (messages.length === 0) return
  const lastUser = [...messages].reverse().find(m => m.type === 'user')
  if (!lastUser) return
  fileHistoryMakeSnapshot(
    updater => {
      session.project.appStateStore.setState(prev => {
        const next = updater(prev.fileHistory)
        return { ...prev, fileHistory: next }
      })
    },
    lastUser.uuid,
  )
}
