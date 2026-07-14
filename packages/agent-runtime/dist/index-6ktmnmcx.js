import {
  init_trends
} from "./index-g1qjbar5.js";
import {
  createIdeDiffBundle,
  getIdeDiffBundle,
  init_ideDiffs,
  readIdeDiffPatch
} from "./index-4fw1fpfb.js";
import {
  getBackgroundTask,
  init_backgroundRunner,
  listBackgroundTasks,
  readBackgroundLog,
  startBackgroundTask,
  stopBackgroundTask
} from "./index-wrrxw9xc.js";
import {
  createAbortController,
  createAssistantMessage,
  findToolByName,
  getDefaultAppState,
  getEmptyToolPermissionContext,
  getTools,
  hasPermissionsToUseTool,
  init_AppStateStore,
  init_Tool,
  init_abortController,
  init_messages1 as init_messages,
  init_permissions,
  init_tools1 as init_tools,
  init_zodToJsonSchema,
  zodToJsonSchema
} from "./index-79vhy4mk.js";
import {
  createFileStateCacheWithSizeLimit,
  init_fileStateCache
} from "./index-h3gckbec.js";
import {
  getMainLoopModel,
  init_model
} from "./index-133awary.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-0r3wd4mq.js";
import {
  init_log,
  logError
} from "./index-f80dj2bz.js";
import {
  getErrnoCode,
  init_errors,
  init_slowOperations,
  jsonStringify
} from "./index-t784n9jz.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/services/agents/delegation.ts
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}
function decodeJson(encoded) {
  return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
}
function sign(secret, payload) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}
function constantTimeEqual(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length)
    return false;
  return timingSafeEqual(left, right);
}
function scopeAllows(scope, skill) {
  return scope.includes("*") || scope.includes(skill);
}
function verifyDelegationToken(secret, token, options = {}) {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, reason: "malformed token" };
  }
  const [payload, signature] = parts;
  if (!constantTimeEqual(signature, sign(secret, payload))) {
    return { valid: false, reason: "bad signature" };
  }
  let claims;
  try {
    claims = decodeJson(payload);
  } catch {
    return { valid: false, reason: "unparseable payload" };
  }
  if (!claims || claims.v !== 1 || !Array.isArray(claims.scope)) {
    return { valid: false, reason: "unsupported token version" };
  }
  const now = options.now ?? nowSeconds();
  if (typeof claims.exp !== "number" || now >= claims.exp) {
    return { valid: false, reason: "token expired", claims };
  }
  const acceptedAudiences = options.audience ? [options.audience, ...options.audienceAliases ?? []] : [];
  if (acceptedAudiences.length > 0 && !acceptedAudiences.includes(claims.aud)) {
    return {
      valid: false,
      reason: `audience mismatch (token issued for "${claims.aud}")`,
      claims
    };
  }
  if (options.requiredScope && !scopeAllows(claims.scope, options.requiredScope)) {
    return {
      valid: false,
      reason: `scope "${options.requiredScope}" not granted`,
      claims
    };
  }
  return { valid: true, claims };
}
var init_delegation = () => {};

// src/services/agents/a2aServer.ts
function bearerValue(request) {
  const header = request.headers.get("authorization");
  if (!header)
    return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1].trim() : null;
}
function authorizeRequest(request, options, requiredScope) {
  const hasStatic = Boolean(options.token);
  const hasDelegation = Boolean(options.delegationSecret);
  if (!hasStatic && !hasDelegation)
    return { ok: true };
  const bearer = bearerValue(request);
  if (!bearer)
    return { ok: false, reason: "missing bearer token" };
  if (hasStatic && bearer === options.token)
    return { ok: true };
  if (hasDelegation) {
    const audienceAliases = !options.audience || options.audience === "UR" ? ["ur-agent", "ur-nexus"] : [];
    const result = verifyDelegationToken(options.delegationSecret, bearer, {
      audience: options.audience,
      audienceAliases,
      requiredScope
    });
    if (result.valid)
      return { ok: true };
    return { ok: false, reason: result.reason };
  }
  return { ok: false, reason: "invalid token" };
}
var init_a2aServer = __esm(() => {
  init_execFileNoThrow();
  init_backgroundRunner();
  init_delegation();
  init_trends();
});

// src/services/agents/acpServer.ts
import { randomUUID as randomUUID2 } from "node:crypto";
function jsonResponse(status, body) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { "content-type": "application/json" }
  });
}
function rpcResponse(id, result, error) {
  if (error) {
    return { jsonrpc: "2.0", id, error };
  }
  return { jsonrpc: "2.0", id, result };
}
function rpcError(id, code, message, data) {
  return { jsonrpc: "2.0", id, error: { code, message, data } };
}
function createAcpId() {
  return `acp_${Date.now().toString(36)}_${randomUUID2().slice(0, 8)}`;
}
function now() {
  return new Date().toISOString();
}
function isLoopback(host) {
  return host === "127.0.0.1" || host === "localhost" || host === "::1";
}
function authorizeAcp(request, options) {
  return authorizeRequest(request, { token: options.token });
}
function mapBackgroundStatus(status) {
  switch (status) {
    case "queued":
      return "submitted";
    case "running":
      return "working";
    case "completed":
      return "completed";
    case "failed":
      return "failed";
    case "canceled":
      return "canceled";
  }
}
function buildToolUseContext(tools, readFileStateCache) {
  return {
    abortController: createAbortController(),
    options: {
      commands: MCP_COMMANDS,
      tools,
      mainLoopModel: getMainLoopModel(),
      thinkingConfig: { type: "disabled" },
      mcpClients: [],
      mcpResources: {},
      isNonInteractiveSession: true,
      debug: false,
      verbose: false,
      agentDefinitions: { activeAgents: [], allAgents: [] }
    },
    getAppState: () => getDefaultAppState(),
    setAppState: () => {},
    messages: [],
    readFileState: readFileStateCache,
    setInProgressToolUseIDs: () => {},
    setResponseLength: () => {},
    updateFileHistoryState: () => {},
    updateAttributionState: () => {}
  };
}
async function handleInitialize(options) {
  return {
    name: "UR",
    version: "1.0.2",
    protocolVersion: "0.1.0",
    workspaceRoot: options.cwd,
    capabilities: {
      tools: true,
      tasks: true,
      sessions: true,
      ide: true,
      streaming: false,
      cancellation: true
    }
  };
}
async function handleSessionNew(params, options) {
  const cwd = typeof params?.cwd === "string" ? params.cwd : options.cwd;
  const session = { id: `sess_${randomUUID2()}`, cwd, createdAt: now() };
  acpSessions.set(session.id, session);
  return { sessionId: session.id, workspaceRoot: session.cwd };
}
async function handleSessionPrompt(params, options) {
  const sessionId = typeof params?.sessionId === "string" ? params.sessionId : undefined;
  if (sessionId && !acpSessions.has(sessionId)) {
    throw new Error(`unknown session: ${sessionId}`);
  }
  const sent = await handleTasksSend(params, options);
  return { sessionId: sessionId ?? null, ...sent };
}
async function handleSessionCancel(params, options) {
  const taskId = typeof params?.taskId === "string" ? params.taskId : undefined;
  if (taskId) {
    return handleTasksCancel({ id: taskId }, options);
  }
  const sessionId = typeof params?.sessionId === "string" ? params.sessionId : "";
  acpSessions.delete(sessionId);
  return { sessionId, canceled: true };
}
async function handleToolsList() {
  const toolPermissionContext = getEmptyToolPermissionContext();
  const tools = getTools(toolPermissionContext);
  return {
    tools: tools.filter((tool) => tool.isEnabled()).map((tool) => ({
      name: tool.name,
      description: tool.searchHint ?? tool.name,
      inputSchema: zodToJsonSchema(tool.inputSchema)
    }))
  };
}
async function handleToolsCall(params, options) {
  const name = typeof params?.name === "string" ? params.name : "";
  const args = params?.arguments ?? {};
  if (!name) {
    throw new Error("missing tool name");
  }
  const toolPermissionContext = getEmptyToolPermissionContext();
  const readFileStateCache = createFileStateCacheWithSizeLimit(100, 25 * 1024 * 1024);
  const tools = getTools(toolPermissionContext);
  const tool = findToolByName(tools, name);
  if (!tool) {
    throw new Error(`tool not found: ${name}`);
  }
  if (!tool.isEnabled()) {
    throw new Error(`tool not enabled: ${name}`);
  }
  const context = buildToolUseContext(tools, readFileStateCache);
  const validationResult = await tool.validateInput?.(args, context);
  if (validationResult?.result === false) {
    throw new Error(`invalid input: ${validationResult.message}`);
  }
  const result = await tool.call(args, context, hasPermissionsToUseTool, createAssistantMessage({ content: [] }));
  return { result: result.data };
}
async function handleIdeDiffCapture(params, options) {
  const result = await createIdeDiffBundle(options.cwd, {
    title: typeof params?.title === "string" ? params.title : undefined,
    baseRef: typeof params?.baseRef === "string" ? params.baseRef : undefined,
    staged: params?.staged === true,
    diff: typeof params?.diff === "string" ? params.diff : undefined
  });
  if (result.error) {
    throw new Error(result.error);
  }
  return {
    bundle: result.bundle,
    command: result.command,
    empty: !result.bundle
  };
}
async function handleIdeSelect(params, options) {
  const id = typeof params?.id === "string" ? params.id : "";
  if (!id) {
    throw new Error("missing diff id");
  }
  const bundle = getIdeDiffBundle(options.cwd, id);
  if (!bundle) {
    throw new Error("IDE diff not found");
  }
  return { bundle, patch: readIdeDiffPatch(options.cwd, id) };
}
function headlessCommand(prompt) {
  return [
    process.execPath,
    process.argv[1] ?? "",
    "-p",
    "--output-format",
    "json",
    prompt
  ];
}
async function runSynchronousTask(options, prompt) {
  const command = headlessCommand(prompt);
  const createdAt = now();
  const record = {
    id: createAcpId(),
    prompt,
    status: "working",
    mode: "sync",
    createdAt,
    updatedAt: createdAt
  };
  if (options.dryRun) {
    record.status = "completed";
    record.result = { dryRun: true, command };
    return record;
  }
  const result = await execFileNoThrowWithCwd(command[0], command.slice(1), {
    cwd: options.cwd,
    timeout: 30 * 60 * 1000,
    preserveOutputOnError: true
  });
  record.updatedAt = now();
  record.status = result.code === 0 ? "completed" : "failed";
  record.result = {
    code: result.code,
    stdout: result.stdout,
    stderr: result.stderr || result.error
  };
  return record;
}
function rememberTask(task) {
  acpTasks.set(task.id, task);
  return task;
}
async function startAsynchronousTask(options, prompt) {
  const background = await startBackgroundTask({
    cwd: options.cwd,
    task: `ACP delegated task: ${prompt}`,
    dryRun: options.dryRun
  });
  const createdAt = now();
  return {
    id: createAcpId(),
    prompt,
    backgroundTaskId: background.task.id,
    status: options.dryRun ? "submitted" : mapBackgroundStatus(background.task.status),
    mode: "async",
    createdAt,
    updatedAt: createdAt,
    result: options.dryRun ? { dryRun: true, command: background.command } : undefined
  };
}
async function handleTasksSend(params, options) {
  const prompt = typeof params?.prompt === "string" ? params.prompt : "";
  if (!prompt.trim()) {
    throw new Error("missing prompt");
  }
  const mode = params?.mode === "sync" ? "sync" : "async";
  if (mode === "sync") {
    const task2 = await runSynchronousTask(options, prompt);
    return { task: rememberTask(task2) };
  }
  const task = rememberTask(await startAsynchronousTask(options, prompt));
  return { task, statusUrl: `/acp/tasks/${encodeURIComponent(task.id)}` };
}
function hydrateTask(cwd, record) {
  if (!record.backgroundTaskId)
    return record;
  const background = getBackgroundTask(cwd, record.backgroundTaskId);
  if (!background) {
    return {
      ...record,
      status: record.status === "canceled" ? "canceled" : "failed",
      error: record.error ?? `background task not found: ${record.backgroundTaskId}`
    };
  }
  return {
    ...record,
    status: mapBackgroundStatus(background.status),
    updatedAt: background.updatedAt,
    result: {
      ...typeof record.result === "object" && record.result !== null ? record.result : {},
      exitCode: background.exitCode
    }
  };
}
function listTasks(options) {
  const knownBackgroundIds = new Set([...acpTasks.values()].map((task) => task.backgroundTaskId).filter((id) => typeof id === "string"));
  const persisted = listBackgroundTasks(options.cwd).filter((bg) => bg.task.startsWith("ACP delegated task:")).filter((bg) => !knownBackgroundIds.has(bg.id)).map((bg) => {
    const createdAt = bg.createdAt ?? now();
    return hydrateTask(options.cwd, {
      id: createAcpId(),
      prompt: bg.task.replace(/^ACP delegated task:\s*/u, ""),
      backgroundTaskId: bg.id,
      status: mapBackgroundStatus(bg.status),
      mode: "async",
      createdAt,
      updatedAt: bg.updatedAt ?? createdAt
    });
  });
  return [
    ...[...acpTasks.values()].map((task) => hydrateTask(options.cwd, task)),
    ...persisted
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
async function handleTasksGet(params, options) {
  const id = typeof params?.id === "string" ? params.id : "";
  const tasks = listTasks(options);
  if (!id) {
    return { tasks };
  }
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    throw new Error("task not found");
  }
  const log = task.backgroundTaskId ? readBackgroundLog(options.cwd, task.backgroundTaskId) : null;
  return { task, log };
}
async function handleTasksCancel(params, options) {
  const id = typeof params?.id === "string" ? params.id : "";
  const task = listTasks(options).find((t) => t.id === id);
  if (!task) {
    throw new Error("task not found");
  }
  if (task.backgroundTaskId) {
    stopBackgroundTask(options.cwd, task.backgroundTaskId);
  }
  const canceled = { ...task, status: "canceled", updatedAt: now() };
  acpTasks.set(canceled.id, canceled);
  return { task: canceled };
}
async function dispatchMethod(method, params, options) {
  switch (method) {
    case "initialize":
      return handleInitialize(options);
    case "session/new":
      return handleSessionNew(params, options);
    case "session/prompt":
      return handleSessionPrompt(params, options);
    case "session/cancel":
      return handleSessionCancel(params, options);
    case "tools/list":
      return handleToolsList();
    case "tools/call":
      return handleToolsCall(params, options);
    case "tasks/send":
      return handleTasksSend(params, options);
    case "tasks/get":
      return handleTasksGet(params, options);
    case "tasks/cancel":
      return handleTasksCancel(params, options);
    case "ide/diffCapture":
      return handleIdeDiffCapture(params, options);
    case "ide/select":
      return handleIdeSelect(params, options);
    case "shutdown":
      setTimeout(() => {
        stopAcpServer();
      }, 10);
      return { ok: true };
    default:
      throw new Error(`unknown method: ${method}`);
  }
}
async function handleAcpRequest(request, options) {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === "/healthz") {
    return jsonResponse(200, rpcResponse(null, { ok: true }));
  }
  if (url.pathname !== "/acp") {
    return jsonResponse(404, { error: "not found" });
  }
  const auth = authorizeAcp(request, options);
  if (!auth.ok) {
    return jsonResponse(401, rpcError(null, -32001, auth.reason ?? "unauthorized"));
  }
  let body = null;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, rpcError(null, -32700, "parse error"));
  }
  const id = body?.id ?? null;
  const method = body?.method;
  if (typeof method !== "string") {
    return jsonResponse(400, rpcError(id, -32600, "invalid request"));
  }
  if (options.debug) {
    console.error(`[acp] ${method} ${jsonStringify(body.params ?? {})}`);
  }
  try {
    const result = await dispatchMethod(method, body.params, options);
    if (options.debug) {
      console.error(`[acp] ${method} -> ok`);
    }
    return jsonResponse(200, rpcResponse(id, result));
  } catch (error) {
    logError(error);
    const message = error instanceof Error ? error.message : String(error);
    if (options.debug) {
      console.error(`[acp] ${method} -> error: ${message}`);
    }
    return jsonResponse(500, rpcError(id, -32603, message));
  }
}
function getAcpServerPort() {
  return acpServer?.port ?? null;
}
async function stopAcpServer() {
  if (acpServer) {
    acpServer.stop();
    acpServer = null;
  }
  acpTasks.clear();
  acpSessions.clear();
}
function pickFallbackPort() {
  return 49152 + Math.floor(Math.random() * 16384);
}
function startAcpHttpServer(options) {
  const ports = options.port === 0 ? [0, ...Array.from({ length: 10 }, () => pickFallbackPort())] : [options.port];
  let lastError;
  for (const port of ports) {
    try {
      return Bun.serve({
        hostname: options.host,
        port,
        fetch: (request) => handleAcpRequest(request, options)
      });
    } catch (error) {
      lastError = error;
      if (options.port !== 0 || getErrnoCode(error) !== "EADDRINUSE") {
        throw error;
      }
    }
  }
  throw lastError;
}
async function serveAcp(options) {
  if (!isLoopback(options.host) && !options.token) {
    throw new Error("Refusing to bind ACP server off-loopback without --token");
  }
  if (typeof Bun === "undefined" || typeof Bun.serve !== "function") {
    throw new Error("ACP server requires the Bun runtime");
  }
  await stopAcpServer();
  acpTasks.clear();
  acpServer = startAcpHttpServer(options);
  console.log(`ACP server listening on http://${options.host}:${acpServer.port}`);
  await new Promise(() => {});
}
var MCP_COMMANDS, acpTasks, acpSessions, acpServer = null;
var init_acpServer = __esm(() => {
  init_AppStateStore();
  init_Tool();
  init_messages();
  init_permissions();
  init_tools();
  init_abortController();
  init_fileStateCache();
  init_execFileNoThrow();
  init_errors();
  init_model();
  init_log();
  init_slowOperations();
  init_zodToJsonSchema();
  init_ideDiffs();
  init_backgroundRunner();
  init_a2aServer();
  MCP_COMMANDS = [];
  acpTasks = new Map;
  acpSessions = new Map;
});

export { getAcpServerPort, stopAcpServer, serveAcp, init_acpServer };
