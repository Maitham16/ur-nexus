/**
 * Desktop MCP connector service.
 *
 * Wraps the existing UR MCP client and config modules to provide a simplified
 * desktop-facing surface for stdio, SSE, HTTP, and WebSocket MCP servers.
 * Credentials/env stay in the main process; only non-secret metadata and tool
 * shapes are sent to the renderer.
 */

import {
  getAllMcpConfigs,
  type McpServerConfig,
  type McpStdioServerConfig,
  type McpSSEServerConfig,
  type McpHTTPServerConfig,
  type McpWebSocketServerConfig,
  type ConnectedMCPServer,
  type FailedMCPServer,
  WebSocketTransport,
  openProject,
  type RuntimeProject,
} from '@ur/agent-runtime'
import * as path from 'node:path'
import { redactValue } from '../utils/redactSecrets.js'
import { evaluateConnectorToolUse } from '../safety/safetyService.js'
import {
  screenUntrustedContent,
  type InjectionFinding,
  type InjectionRuleId,
  type InjectionSeverity,
} from '../safety/injectionScreen.js'
import { authorizationHeader, isTokenExpired } from './mcpOAuth.js'
import { clearOAuthToken, loadOAuthToken } from './mcpOAuthStore.js'
import { authorizeConnector, refreshStoredToken } from './mcpOAuthFlow.js'
import { requestStandaloneApproval } from '../runtime.js'

export type ConnectorTransport = 'stdio' | 'sse' | 'http' | 'ws'

export interface ConnectorConfig {
  name: string
  transport: ConnectorTransport
  command?: string
  args?: string[]
  env?: Record<string, string>
  cwd?: string
  url?: string
  headers?: Record<string, string>
  enabled: boolean
}

export interface ConnectorInfo {
  name: string
  transport: ConnectorTransport
  enabled: boolean
  command?: string
  args?: string[]
  cwd?: string
  url?: string
  status: 'connected' | 'failed' | 'disabled' | 'unknown'
  error?: string
}

export interface ConnectorToolInfo {
  name: string
  description?: string
  inputSchema?: Record<string, unknown>
  serverName: string
}

export interface ConnectorTestResult {
  ok: boolean
  error?: string
  tools?: ConnectorToolInfo[]
}

export interface ConnectorToolCallResult {
  ok: boolean
  result?: unknown
  error?: string
  /** Present only when injection screening matched something in the result. */
  injection?: {
    suspicious: boolean
    highestSeverity: InjectionSeverity | 'none'
    ruleIds: InjectionRuleId[]
    findings: InjectionFinding[]
  }
}

// In-process connected clients held for the lifetime of the main process.
const connections = new Map<string, ConnectedMCPServer | FailedMCPServer>()

function connectionKey(projectRoot: string, name: string): string {
  return `${path.resolve(projectRoot)}\u0000${name}`
}

async function invalidateConnection(projectRoot: string, name: string): Promise<void> {
  const key = connectionKey(projectRoot, name)
  const existing = connections.get(key)
  connections.delete(key)
  if (existing?.type === 'connected') {
    await existing.cleanup().catch(() => undefined)
  }
}

function mcpConfigToConnector(name: string, config: McpServerConfig): ConnectorConfig {
  if (config.type === 'stdio' || config.type === undefined) {
    const stdio = config as McpStdioServerConfig
    return {
      name,
      transport: 'stdio',
      command: stdio.command,
      args: stdio.args,
      env: stdio.env,
      enabled: true,
    }
  }
  if (config.type === 'sse') {
    const sse = config as McpSSEServerConfig
    return {
      name,
      transport: 'sse',
      url: sse.url,
      headers: sse.headers,
      enabled: true,
    }
  }
  if (config.type === 'http') {
    const http = config as McpHTTPServerConfig
    return {
      name,
      transport: 'http',
      url: http.url,
      headers: http.headers,
      enabled: true,
    }
  }
  if (config.type === 'ws') {
    const ws = config as McpWebSocketServerConfig
    return {
      name,
      transport: 'ws',
      url: ws.url,
      headers: ws.headers,
      enabled: true,
    }
  }
  return { name, transport: 'stdio', enabled: false }
}

function connectorToMcpConfig(connector: ConnectorConfig): McpServerConfig {
  switch (connector.transport) {
    case 'stdio':
      return {
        type: 'stdio',
        command: connector.command ?? '',
        args: connector.args ?? [],
        env: connector.env,
      }
    case 'sse':
      return {
        type: 'sse',
        url: connector.url ?? '',
        headers: connector.headers,
      }
    case 'http':
      return {
        type: 'http',
        url: connector.url ?? '',
        headers: connector.headers,
      }
    case 'ws':
      return {
        type: 'ws',
        url: connector.url ?? '',
        headers: connector.headers,
      }
    default:
      throw new Error(`Unsupported connector transport: ${connector.transport}`)
  }
}

async function openProjectStore(projectRoot: string): Promise<RuntimeProject> {
  return openProject(projectRoot)
}

export async function ensureConnectorClientsConnected(projectRoot: string): Promise<void> {
  const project = await openProjectStore(projectRoot)
  const { servers: configs } = await getAllMcpConfigs()
  const clientList: ConnectedMCPServer[] = []
  const toolList: import('@ur/agent-runtime').RuntimeTool[] = []
  const { fetchToolsForClient } = await import('@ur/agent-runtime')

  for (const [name, config] of Object.entries(configs)) {
    if ((config as { disabled?: boolean }).disabled) continue
    const server = await connectConnector(projectRoot, name)
    if (server.type !== 'connected') continue
    clientList.push(server)
    try {
      const tools = await fetchToolsForClient(server)
      toolList.push(...tools)
    } catch (error) {
      logForConnector('warn', 'fetch_tools_failed', { serverName: name, error: String(error) })
    }
  }

  project.appStateStore.setState(prev => {
    const mcp = { ...(prev.mcp ?? { clients: [], tools: [], commands: [], resources: {}, pluginReconnectKey: 0 }) }
    mcp.clients = clientList
    mcp.tools = toolList
    return { ...prev, mcp }
  })
}

export async function listConnectors(projectRoot: string): Promise<ConnectorInfo[]> {
  await openProjectStore(projectRoot)
  const { servers: configs } = await getAllMcpConfigs()
  return Object.entries(configs).map(([name, config]) => {
    const connector = mcpConfigToConnector(name, config as McpServerConfig)
    const status = getConnectionStatus(projectRoot, name)
    return {
      name: connector.name,
      transport: connector.transport,
      enabled: !(config as { disabled?: boolean }).disabled,
      command: connector.command,
      args: connector.args,
      cwd: connector.cwd,
      url: connector.url,
      status,
      error: status === 'failed' ? extractError(projectRoot, name) : undefined,
    }
  })
}

export async function addConnector(
  projectRoot: string,
  connector: ConnectorConfig,
): Promise<void> {
  const project = await openProjectStore(projectRoot)
  const config = connectorToMcpConfig(connector)
  project.appStateStore.setState(prev => {
    const mcp = { ...(prev.mcp ?? {}) }
    mcp.userServers = {
      ...mcp.userServers,
      [connector.name]: { ...config, disabled: !connector.enabled } as McpServerConfig,
    }
    return { ...prev, mcp }
  })
  await invalidateConnection(projectRoot, connector.name)
}

export async function updateConnector(
  projectRoot: string,
  name: string,
  updates: { enabled?: boolean; config?: Partial<ConnectorConfig> },
): Promise<void> {
  const project = await openProjectStore(projectRoot)
  project.appStateStore.setState(prev => {
    const mcp = { ...(prev.mcp ?? {}) }
    const existing = mcp.userServers?.[name]
    if (!existing) return prev
    const connector = mcpConfigToConnector(name, existing)
    const nextConfig: ConnectorConfig = {
      ...connector,
      ...(updates.enabled !== undefined ? { enabled: updates.enabled } : {}),
      ...(updates.config ?? {}),
    }
    mcp.userServers = {
      ...mcp.userServers,
      [name]: { ...connectorToMcpConfig(nextConfig), disabled: !nextConfig.enabled } as McpServerConfig,
    }
    return { ...prev, mcp }
  })
  await invalidateConnection(projectRoot, name)
}

export async function removeConnector(projectRoot: string, name: string): Promise<void> {
  const project = await openProjectStore(projectRoot)
  project.appStateStore.setState(prev => {
    const mcp = { ...(prev.mcp ?? {}) }
    if (mcp.userServers) {
      const { [name]: _, ...rest } = mcp.userServers
      mcp.userServers = rest
    }
    return { ...prev, mcp }
  })
  await invalidateConnection(projectRoot, name)
}

export async function testConnector(
  projectRoot: string,
  name: string,
): Promise<ConnectorTestResult> {
  try {
    const server = await connectConnector(projectRoot, name)
    if (server.type === 'failed') {
      return { ok: false, error: server.error ?? 'Connection failed' }
    }
    const tools = await listConnectorToolsFromServer(server)
    return { ok: true, tools }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function listConnectorTools(projectRoot: string, name: string): Promise<ConnectorToolInfo[]> {
  const server = await connectConnector(projectRoot, name)
  if (server.type === 'failed') return []
  return listConnectorToolsFromServer(server)
}

async function listConnectorToolsFromServer(server: ConnectedMCPServer): Promise<ConnectorToolInfo[]> {
  try {
    const result = await server.client.listTools()
    const tools = Array.isArray(result.tools) ? result.tools : []
    return tools.map((tool: { name: string; description?: string; inputSchema?: Record<string, unknown> }) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      serverName: server.name,
    }))
  } catch (error) {
    logForConnector('warn', 'list_tools_failed', { serverName: server.name, error: String(error) })
    return []
  }
}

export async function callConnectorTool(
  projectRoot: string,
  serverName: string,
  toolName: string,
  input: Record<string, unknown>,
): Promise<ConnectorToolCallResult> {
  try {
    const server = await connectConnector(projectRoot, serverName)
    if (server.type === 'failed') {
      return { ok: false, error: server.error ?? 'Connection failed' }
    }
    const evaluation = evaluateConnectorToolUse(projectRoot, serverName, toolName, input)
    if (evaluation.behavior === 'deny') {
      return { ok: false, error: evaluation.reason }
    }
    if (evaluation.behavior === 'ask') {
      const approved = await requestStandaloneApproval(projectRoot, evaluation)
      if (!approved.approved) {
        return { ok: false, error: 'User denied MCP tool call' }
      }
    }
    const result = await server.client.callTool({ name: toolName, arguments: input })
    // A tool result is third-party data on its way into the model's context.
    // Screen it so an injection attempt is recorded and surfaced rather than
    // depending on the model to notice; the result itself is never withheld.
    const screen = screenUntrustedContent(stringifyToolResult(result))
    return {
      ok: true,
      result,
      injection: screen.findings.length > 0
        ? {
            suspicious: screen.suspicious,
            highestSeverity: screen.highestSeverity,
            ruleIds: [...new Set(screen.findings.map(finding => finding.ruleId))],
            findings: screen.findings.slice(0, 10),
          }
        : undefined,
    }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

/**
 * Attach a stored OAuth bearer token to a remote connector's headers.
 *
 * Applies to sse and http only — stdio is a local subprocess and ws carries
 * its own handshake. An explicit header in the connector config wins, so a
 * manually configured Authorization is never silently replaced. A token past
 * its expiry is skipped rather than sent, so the failure the user sees is
 * "not authorized" instead of a confusing rejected-token error.
 */
export async function withOAuthHeaders(
  projectRoot: string,
  connectorName: string,
  config: McpServerConfig,
): Promise<McpServerConfig> {
  if (config.type !== 'sse' && config.type !== 'http') return config
  const existing = (config as McpSSEServerConfig | McpHTTPServerConfig).headers ?? {}
  if (Object.keys(existing).some(key => key.toLowerCase() === 'authorization')) {
    return config
  }
  const stored = await loadOAuthToken(projectRoot, connectorName)
  if (!stored) return config
  // An expired token is refreshed rather than sent: the server would reject it
  // and the user would see an auth error for a connector they did authorize.
  const token = isTokenExpired(stored)
    ? await refreshStoredToken(projectRoot, connectorName)
    : stored
  if (!token || isTokenExpired(token)) return config
  const header = authorizationHeader(token)
  if (!header) return config
  return { ...config, headers: { ...existing, ...header } } as McpServerConfig
}

export interface ConnectorOAuthStatus {
  /** False when the connector is stdio/ws, where OAuth does not apply. */
  supported: boolean
  authorized: boolean
  expired: boolean
  scope?: string
  expiresAt?: number
  /** Set when a static Authorization header already governs this connector. */
  staticHeader?: boolean
}

async function remoteConnectorUrl(
  projectRoot: string,
  name: string,
): Promise<{ url: string; headers: Record<string, string> } | undefined> {
  await openProjectStore(projectRoot)
  const { servers } = await getAllMcpConfigs()
  const config = servers[name]
  if (!config || (config.type !== 'sse' && config.type !== 'http')) return undefined
  const remote = config as McpSSEServerConfig | McpHTTPServerConfig
  return { url: remote.url, headers: remote.headers ?? {} }
}

export async function getConnectorOAuthStatus(
  projectRoot: string,
  name: string,
): Promise<ConnectorOAuthStatus> {
  const remote = await remoteConnectorUrl(projectRoot, name)
  if (!remote) return { supported: false, authorized: false, expired: false }
  if (Object.keys(remote.headers).some(key => key.toLowerCase() === 'authorization')) {
    return { supported: true, authorized: true, expired: false, staticHeader: true }
  }
  const token = await loadOAuthToken(projectRoot, name)
  if (!token) return { supported: true, authorized: false, expired: false }
  return {
    supported: true,
    authorized: true,
    expired: isTokenExpired(token),
    scope: token.scope,
    expiresAt: token.expiresAt,
  }
}

/** Begin interactive authorization for a remote connector. */
export async function authorizeConnectorOAuth(
  projectRoot: string,
  name: string,
  scopes?: string[],
): Promise<{ ok: boolean; error?: string; scope?: string }> {
  const remote = await remoteConnectorUrl(projectRoot, name)
  if (!remote) {
    return { ok: false, error: 'OAuth applies only to SSE and HTTP connectors.' }
  }
  // Dropping any cached connection forces the next call to reconnect with the
  // new bearer token instead of reusing the unauthenticated transport.
  await disconnectConnector(projectRoot, name)
  const result = await authorizeConnector({
    projectRoot,
    connectorName: name,
    resourceUrl: remote.url,
    scopes,
  })
  return { ok: result.ok, error: result.error, scope: result.scope }
}

export async function signOutConnectorOAuth(
  projectRoot: string,
  name: string,
): Promise<void> {
  await clearOAuthToken(projectRoot, name)
  await disconnectConnector(projectRoot, name)
}

/** Drop a cached connection so the next call rebuilds its transport. */
async function disconnectConnector(projectRoot: string, name: string): Promise<void> {
  const key = connectionKey(projectRoot, name)
  const existing = connections.get(key)
  connections.delete(key)
  if (existing && existing.type === 'connected') {
    await existing.cleanup?.().catch(() => undefined)
  }
}

/** Flatten a tool result to text so screening sees nested content too. */
function stringifyToolResult(result: unknown): string {
  if (typeof result === 'string') return result
  try {
    return JSON.stringify(result) ?? ''
  } catch {
    return ''
  }
}

async function connectConnector(
  projectRoot: string,
  name: string,
): Promise<ConnectedMCPServer | FailedMCPServer> {
  const key = connectionKey(projectRoot, name)
  const existing = connections.get(key)
  if (existing) return existing
  await openProjectStore(projectRoot)
  const { servers: configs } = await getAllMcpConfigs()
  const config = configs[name]
  if (!config) {
    const failed: FailedMCPServer = { name, type: 'failed', config: config as McpServerConfig, error: 'Connector not found' }
    connections.set(key, failed)
    return failed
  }
  if ((config as { disabled?: boolean }).disabled) {
    const failed: FailedMCPServer = { name, type: 'failed', config, error: 'Connector is disabled' }
    connections.set(key, failed)
    return failed
  }
  const { Client } = await import('@modelcontextprotocol/sdk/client/index.js')
  const client = new Client({ name: 'ur-desktop', version: '1.0.0' })
  const transport = await createTransport(
    await withOAuthHeaders(projectRoot, name, config as McpServerConfig),
  )
  try {
    await client.connect(transport)
    const connected: ConnectedMCPServer = {
      name,
      type: 'connected',
      client,
      capabilities: client.getServerCapabilities() ?? {},
      config: { ...config, scope: 'local' },
      cleanup: async () => { await client.close() },
    }
    connections.set(key, connected)
    return connected
  } catch (error) {
    const failed: FailedMCPServer = {
      name,
      type: 'failed',
      config,
      error: error instanceof Error ? error.message : String(error),
    }
    connections.set(key, failed)
    return failed
  }
}

async function createTransport(config: McpServerConfig): Promise<import('@modelcontextprotocol/sdk/shared/transport.js').Transport> {
  if (config.type === 'stdio' || config.type === undefined) {
    const { StdioClientTransport } = await import('@modelcontextprotocol/sdk/client/stdio.js')
    const stdio = config as McpStdioServerConfig
    return new StdioClientTransport({
      command: stdio.command,
      args: stdio.args ?? [],
      env: stdio.env,
    })
  }
  if (config.type === 'sse') {
    const { SSEClientTransport } = await import('@modelcontextprotocol/sdk/client/sse.js')
    const sse = config as McpSSEServerConfig
    return new SSEClientTransport(new URL(sse.url), {
      requestInit: { headers: sse.headers },
    })
  }
  if (config.type === 'http') {
    const { StreamableHTTPClientTransport } = await import('@modelcontextprotocol/sdk/client/streamableHttp.js')
    const http = config as McpHTTPServerConfig
    return new StreamableHTTPClientTransport(new URL(http.url), {
      requestInit: { headers: http.headers },
    })
  }
  if (config.type === 'ws') {
    const wsModule = await import('ws')
    const wsConfig = config as McpWebSocketServerConfig
    const ws = new wsModule.default(new URL(wsConfig.url), { headers: wsConfig.headers })
    return new WebSocketTransport(ws)
  }
  throw new Error(`Unsupported connector type: ${config.type}`)
}

function getConnectionStatus(
  projectRoot: string,
  name: string,
): ConnectorInfo['status'] {
  const conn = connections.get(connectionKey(projectRoot, name))
  if (!conn) return 'unknown'
  if (conn.type === 'failed') return 'failed'
  return 'connected'
}

function extractError(projectRoot: string, name: string): string | undefined {
  const conn = connections.get(connectionKey(projectRoot, name))
  if (conn?.type === 'failed') return conn.error
  return undefined
}

function logForConnector(
  level: 'info' | 'warn' | 'error',
  event: string,
  data: Record<string, unknown>,
): void {
  try {
    const { logForDebugging } = require('../../../../src/utils/debug.js') as {
      logForDebugging: (msg: string, opts?: { level: 'info' | 'warn' | 'error' }) => void
    }
    logForDebugging(`[desktop-connector] ${event} ${JSON.stringify(redactValue(data))}`, { level })
  } catch {
    // Logging failures must not break connector operations.
  }
}
