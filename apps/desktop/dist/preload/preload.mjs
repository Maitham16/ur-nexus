// src/preload/index.ts
import { contextBridge, ipcRenderer } from "electron";
var api = {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  subscribe: (channel, callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on(channel, handler);
    return () => {
      ipcRenderer.removeListener(channel, handler);
    };
  },
  // Projects
  openProject: (root) => ipcRenderer.invoke("project:open", root),
  listProjects: () => ipcRenderer.invoke("project:list"),
  inspectProject: (root) => ipcRenderer.invoke("project:inspect", root),
  // Worktrees
  createWorktree: (projectRoot, branch) => ipcRenderer.invoke("worktree:create", projectRoot, branch),
  listWorktrees: (projectRoot) => ipcRenderer.invoke("worktree:list", projectRoot),
  // Runs
  startRun: (projectRoot, options) => ipcRenderer.invoke("run:start", projectRoot, options),
  stopRun: (sessionId) => ipcRenderer.invoke("run:stop", sessionId),
  pauseRun: (sessionId) => ipcRenderer.invoke("run:pause", sessionId),
  resumeRun: (sessionId) => ipcRenderer.invoke("run:resume", sessionId),
  sendMessage: (sessionId, content) => ipcRenderer.invoke("message:send", sessionId, content),
  // Files
  readFile: (req) => ipcRenderer.invoke("file:read", req),
  proposeEdit: (req) => ipcRenderer.invoke("edit:propose", req),
  applyPatch: (req) => ipcRenderer.invoke("patch:apply", req),
  // Commands
  runCommand: (req) => ipcRenderer.invoke("command:run", req),
  stopCommand: (projectRoot, commandId, worktreeRoot) => ipcRenderer.invoke("command:stop", projectRoot, commandId, worktreeRoot),
  listCommands: (projectRoot, worktreeRoot) => ipcRenderer.invoke("commands:list", projectRoot, worktreeRoot),
  // Tasks / agents
  listTasks: (projectRoot) => ipcRenderer.invoke("tasks:list", projectRoot),
  listAgents: (projectRoot) => ipcRenderer.invoke("agents:list", projectRoot),
  setMaxAgents: (value) => ipcRenderer.invoke("settings:maxAgents", value),
  getMaxAgents: () => ipcRenderer.invoke("settings:maxAgents"),
  // Providers / models / tools
  listProviders: (projectRoot) => ipcRenderer.invoke("providers:list", projectRoot),
  listModels: (projectRoot) => ipcRenderer.invoke("models:list", projectRoot),
  updateProvider: (projectRoot, providerId, model) => ipcRenderer.invoke("provider:update", projectRoot, providerId, model),
  getProviderConfig: (projectRoot) => ipcRenderer.invoke("provider:config:get", projectRoot),
  setProviderConfig: (projectRoot, patch) => ipcRenderer.invoke("provider:config:set", projectRoot, patch),
  storeProviderApiKey: (projectRoot, providerId, key) => ipcRenderer.invoke("provider:key:store", projectRoot, providerId, key),
  clearProviderApiKey: (projectRoot, providerId) => ipcRenderer.invoke("provider:key:clear", projectRoot, providerId),
  testProviderConnection: (projectRoot, providerId) => ipcRenderer.invoke("provider:test", projectRoot, providerId),
  listProviderModels: (projectRoot, providerId) => ipcRenderer.invoke("provider:models:get", projectRoot, providerId),
  listToolDefinitions: (projectRoot) => ipcRenderer.invoke("tools:list", projectRoot),
  // MCP
  listMcpServers: (projectRoot) => ipcRenderer.invoke("mcp:list", projectRoot),
  addMcpServer: (req) => ipcRenderer.invoke("mcp:add", req),
  removeMcpServer: (projectRoot, name) => ipcRenderer.invoke("mcp:remove", projectRoot, name),
  // Connectors
  listConnectors: (projectRoot) => ipcRenderer.invoke("connectors:list", projectRoot),
  addConnector: (req) => ipcRenderer.invoke("connector:add", req),
  updateConnector: (req) => ipcRenderer.invoke("connector:update", req),
  removeConnector: (projectRoot, name) => ipcRenderer.invoke("connector:remove", projectRoot, name),
  testConnector: (projectRoot, name) => ipcRenderer.invoke("connector:test", projectRoot, name),
  listConnectorTools: (projectRoot, name) => ipcRenderer.invoke("connector:tools", projectRoot, name),
  callConnectorTool: (req) => ipcRenderer.invoke("connector:tool:call", req),
  // History / report
  readHistory: (projectRoot) => ipcRenderer.invoke("history:read", projectRoot),
  exportReport: (projectRoot, worktreeRoot) => ipcRenderer.invoke("report:export", projectRoot, worktreeRoot),
  // Approvals
  respondApproval: (res) => ipcRenderer.invoke("approval:respond", res),
  // Safety / policy
  getSafetyPolicy: (req) => ipcRenderer.invoke("safety:policy:get", req),
  setSafetyPolicy: (req) => ipcRenderer.invoke("safety:policy:set", req),
  // History / reports
  listRuns: (req) => ipcRenderer.invoke("history:list", req),
  getRun: (req) => ipcRenderer.invoke("history:get", req),
  deleteRun: (req) => ipcRenderer.invoke("history:delete", req),
  exportReportMarkdown: (req) => ipcRenderer.invoke("report:markdown", req),
  exportReportJson: (req) => ipcRenderer.invoke("report:json", req),
  getReport: (req) => ipcRenderer.invoke("report:get", req),
  checkForUpdates: () => ipcRenderer.invoke("update:check")
};
contextBridge.exposeInMainWorld("urDesktop", api);
//# sourceMappingURL=preload.mjs.map
