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
  type MCPServerConnection,
  WebSocketTransport,
  openProject,
  type RuntimeProject,
} from '@ur/agent-runtime'
import { redactValue } from '../utils/redactSecrets.js'
import { evaluateConnectorToolUse } from '../safety/safetyService.js'
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
}

// In-process connected clients held for the lifetime of the main process.
const connections = new Map<string, ConnectedMCPServer | FailedMCPServer>()

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
  const project = await openProjectStore(projectRoot)
  const { servers: configs } = await getAllMcpConfigs()
  return Object.entries(configs).map(([name, config]) => {
    const connector = mcpConfigToConnector(name, config as McpServerConfig)
    const status = getConnectionStatus(name)
    return {
      name: connector.name,
      transport: connector.transport,
      enabled: !(config as { disabled?: boolean }).disabled,
      command: connector.command,
      args: connector.args,
      env: connector.env,
      cwd: connector.cwd,
      url: connector.url,
      headers: (config as { headers?: Record<string, string> }).headers,
      status,
      error: status === 'failed' ? extractError(name) : undefined,
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
  connections.delete(name)
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
    return { ok: true, result }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

async function connectConnector(
  projectRoot: string,
  name: string,
): Promise<ConnectedMCPServer | FailedMCPServer> {
  const existing = connections.get(name)
  if (existing) return existing
  await openProjectStore(projectRoot)
  const { servers: configs } = await getAllMcpConfigs()
  const config = configs[name]
  if (!config) {
    const failed: FailedMCPServer = { name, type: 'failed', config: config as McpServerConfig, error: 'Connector not found' }
    connections.set(name, failed)
    return failed
  }
  if ((config as { disabled?: boolean }).disabled) {
    const failed: FailedMCPServer = { name, type: 'failed', config, error: 'Connector is disabled' }
    connections.set(name, failed)
    return failed
  }
  const { Client } = await import('@modelcontextprotocol/sdk/client/index.js')
  const client = new Client({ name: 'ur-desktop', version: '1.0.0' })
  const transport = await createTransport(config as McpServerConfig)
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
    connections.set(name, connected)
    return connected
  } catch (error) {
    const failed: FailedMCPServer = {
      name,
      type: 'failed',
      config,
      error: error instanceof Error ? error.message : String(error),
    }
    connections.set(name, failed)
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

function getConnectionStatus(name: string): ConnectorInfo['status'] {
  const conn = connections.get(name)
  if (!conn) return 'unknown'
  if (conn.type === 'failed') return 'failed'
  return 'connected'
}

function extractError(name: string): string | undefined {
  const conn = connections.get(name)
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
