import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'
import { checkForUpdates } from './autoUpdate.js'
import type {
  IpcChannel,
  RuntimeEvent,
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
} from '../shared/ipc.js'
import {
  openProjectAndCache,
  listProjects,
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
  listProjectTools,
  listProjectToolDefinitions,
  listProjectProviders,
  listProjectModels,
  updateProjectProvider,
  getProjectProviderConfig,
  setProjectProviderConfig,
  storeProjectProviderApiKey,
  clearProjectProviderApiKey,
  testProjectProviderConnection,
  listProjectProviderModels,
  listProjectMcpServers,
  addProjectMcpServer,
  removeProjectMcpServer,
  readProjectHistory,
  exportProjectReport,
  listProjectTasks,
  listProjectAgents,
  respondApproval,
  setRendererEmitter,
  updateMaxParallelAgents,
  getCurrentMaxParallelAgents,
  listProjectConnectors,
  addProjectConnector,
  updateProjectConnector,
  removeProjectConnector,
  testProjectConnector,
  listProjectConnectorTools,
  callProjectConnectorTool,
  getProjectSafetyPolicy,
  setProjectSafetyPolicy,
  listProjectRuns,
  getProjectRun,
  deleteProjectRun,
  exportRunReport,
  getRunReport,
} from './runtime.js'

const isDev = process.env.NODE_ENV === 'development'
const isSmokeTest = process.argv.includes('--smoke-test')

const windows = new Set<BrowserWindow>()
const pendingDeepLinks: string[] = []

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  win.webContents.once('dom-ready', () => {
    if (pendingDeepLinks.length > 0) {
      win.webContents.send('runtime:deepLink', pendingDeepLinks.shift())
    }
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    const { evaluateExternalAppOpen } = require('./safety/safetyService.js') as typeof import('./safety/safetyService.js')
    const { requestStandaloneApproval } = require('./runtime.js') as typeof import('./runtime.js')
    const evaluation = evaluateExternalAppOpen(url)
    if (evaluation.behavior === 'deny') {
      return { action: 'deny' }
    }
    // Block the default open and ask via a native approval dialog. Never open
    // an external app or URL silently.
    const projectRoot = ''
    void (async () => {
      const result = await requestStandaloneApproval(projectRoot, evaluation, win)
      if (result.approved) {
        await shell.openExternal(url)
      }
    })()
    return { action: 'deny' }
  })

  windows.add(win)
  win.on('closed', () => windows.delete(win))

  return win
}

if (!app.isDefaultProtocolClient('ur-desktop')) {
  app.setAsDefaultProtocolClient('ur-desktop')
}

app.whenReady().then(() => {
  if (isSmokeTest) {
    console.log('UR_DESKTOP_READY')
    setTimeout(() => app.quit(), 2000)
    return
  }

  // In headless CI environments without a display, skip window creation.
  if (process.env.SKIP_WINDOW_ON_NO_DISPLAY && !require('node:process').env.DISPLAY) {
    console.log('UR_DESKTOP_READY')
    setTimeout(() => app.quit(), 2000)
    return
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('open-url', (_event, url) => {
  pendingDeepLinks.push(url)
  for (const win of windows) {
    if (!win.isDestroyed()) {
      win.webContents.send('runtime:deepLink', url)
    }
  }
})

app.on('second-instance', (_event, argv) => {
  const deepLink = argv.find(arg => arg.startsWith('ur-desktop://'))
  if (deepLink) {
    pendingDeepLinks.push(deepLink)
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send('runtime:deepLink', deepLink)
      }
    }
  }
  const focused = BrowserWindow.getFocusedWindow() ?? Array.from(windows)[0]
  if (focused && !focused.isDestroyed()) {
    focused.focus()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('update:check' as IpcChannel, async () => {
  return checkForUpdates()
})

// Broadcast events to every renderer window that belongs to the project.
setRendererEmitter((projectRoot: string, event: unknown) => {
  for (const win of windows) {
    if (win.isDestroyed()) continue
    win.webContents.send('runtime:event', event)
  }
})

function assertString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${name} must be a non-empty string`)
  }
  return value
}

function assertObject<T extends Record<string, unknown>>(
  value: unknown,
  name: string,
): T {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${name} must be an object`)
  }
  return value as T
}

function assertBoolean(value: unknown, name: string): boolean {
  return value === true
}

// Projects
ipcMain.handle('project:open' as IpcChannel, async (_event, root: unknown) => {
  const validatedRoot = assertString(root, 'project root')
  return openProjectAndCache(validatedRoot)
})

ipcMain.handle('project:list' as IpcChannel, async () => {
  return listProjects()
})

ipcMain.handle(
  'project:inspect' as IpcChannel,
  async (_event, root: unknown) => {
    return getProjectInfo(assertString(root, 'project root'))
  },
)

// Worktrees
ipcMain.handle(
  'worktree:create' as IpcChannel,
  async (_event, projectRoot: unknown, branch?: unknown) => {
    return createRunWorktree(
      assertString(projectRoot, 'project root'),
      typeof branch === 'string' ? branch : undefined,
    )
  },
)

ipcMain.handle(
  'worktree:list' as IpcChannel,
  async (_event, projectRoot: unknown) => {
    return listWorktrees(assertString(projectRoot, 'project root'))
  },
)

// Runs / sessions
ipcMain.handle(
  'run:start' as IpcChannel,
  async (
    _event,
    projectRoot: unknown,
    options?: { useWorktree?: unknown; branch?: unknown },
  ) => {
    return startRun(assertString(projectRoot, 'project root'), {
      useWorktree: options ? options.useWorktree === true : false,
      branch: options && typeof options.branch === 'string' ? options.branch : undefined,
    })
  },
)

ipcMain.handle('run:stop' as IpcChannel, async (_event, runId: unknown) => {
  stopRunById(assertString(runId, 'run id'))
})

ipcMain.handle('run:pause' as IpcChannel, async (_event, runId: unknown) => {
  pauseRunById(assertString(runId, 'run id'))
})

ipcMain.handle('run:resume' as IpcChannel, async (_event, runId: unknown) => {
  resumeRunById(assertString(runId, 'run id'))
})

ipcMain.handle(
  'message:send' as IpcChannel,
  async (_event, runId: unknown, content: unknown) => {
    const validatedRunId = assertString(runId, 'run id')
    const validatedContent = assertString(content, 'message content')

    ;(async () => {
      try {
        for await (const event of runPromptStream(validatedRunId, validatedContent)) {
          for (const win of windows) {
            if (win.isDestroyed()) continue
            win.webContents.send('runtime:event', event)
          }
        }
      } catch (error) {
        for (const win of windows) {
          if (win.isDestroyed()) continue
          win.webContents.send('runtime:event', {
            type: 'run_failed',
            runId: validatedRunId,
            sessionId: validatedRunId,
            projectRoot: '',
            timestamp: Date.now(),
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }
    })()

    return { started: true }
  },
)

// Files
ipcMain.handle('file:read' as IpcChannel, async (_event, req: unknown) => {
  const { projectRoot, path: filePath, worktreeRoot } = assertObject<
    ReadFileRequestDto
  >(req, 'read file request')
  return readProjectFile(
    assertString(projectRoot, 'project root'),
    assertString(filePath, 'file path'),
    typeof worktreeRoot === 'string' ? worktreeRoot : undefined,
  )
})

ipcMain.handle('edit:propose' as IpcChannel, async (_event, req: unknown) => {
  const { projectRoot, path: filePath, newText, worktreeRoot } = assertObject<
    ProposeEditRequestDto
  >(req, 'propose edit request')
  return proposeEdit(
    assertString(projectRoot, 'project root'),
    assertString(filePath, 'file path'),
    assertString(newText, 'new text'),
    typeof worktreeRoot === 'string' ? worktreeRoot : undefined,
  )
})

ipcMain.handle('patch:apply' as IpcChannel, async (_event, req: unknown) => {
  const { projectRoot, patch, worktreeRoot } = assertObject<ApplyPatchRequestDto>(
    req,
    'apply patch request',
  )
  await applyProjectPatch(
    assertString(projectRoot, 'project root'),
    assertString(patch, 'patch'),
    typeof worktreeRoot === 'string' ? worktreeRoot : undefined,
  )
})

// Commands
ipcMain.handle(
  'command:run' as IpcChannel,
  async (_event, req: unknown) => {
    const { projectRoot, command, worktreeRoot, skipApproval } = assertObject<
      RunCommandRequestDto
    >(req, 'run command request')
    return runProjectCommand(
      assertString(projectRoot, 'project root'),
      assertString(command, 'command'),
      typeof worktreeRoot === 'string' ? worktreeRoot : undefined,
      skipApproval === true,
    )
  },
)

ipcMain.handle(
  'command:stop' as IpcChannel,
  async (_event, projectRoot: unknown, commandId: unknown, worktreeRoot?: unknown) => {
    return stopProjectCommand(
      assertString(projectRoot, 'project root'),
      assertString(commandId, 'command id'),
      typeof worktreeRoot === 'string' ? worktreeRoot : undefined,
    )
  },
)

ipcMain.handle(
  'commands:list' as IpcChannel,
  async (_event, projectRoot: unknown, worktreeRoot?: unknown) => {
    return listProjectTerminalCommands(
      assertString(projectRoot, 'project root'),
      typeof worktreeRoot === 'string' ? worktreeRoot : undefined,
    )
  },
)

// Tasks / agents
ipcMain.handle('tasks:list' as IpcChannel, async (_event, projectRoot: unknown) => {
  return listProjectTasks(assertString(projectRoot, 'project root'))
})

ipcMain.handle('agents:list' as IpcChannel, async (_event, projectRoot: unknown) => {
  return listProjectAgents(assertString(projectRoot, 'project root'))
})

ipcMain.handle(
  'settings:maxAgents' as IpcChannel,
  async (_event, value?: unknown) => {
    if (typeof value === 'number') {
      updateMaxParallelAgents(value)
    }
    return getCurrentMaxParallelAgents()
  },
)

// Providers / models
ipcMain.handle(
  'tools:list' as IpcChannel,
  async (_event, projectRoot: unknown) => {
    return listProjectToolDefinitions(assertString(projectRoot, 'project root'))
  },
)

ipcMain.handle(
  'providers:list' as IpcChannel,
  async (_event, projectRoot: unknown) => {
    return listProjectProviders(assertString(projectRoot, 'project root'))
  },
)

ipcMain.handle(
  'models:list' as IpcChannel,
  async (_event, projectRoot: unknown) => {
    return listProjectModels(assertString(projectRoot, 'project root'))
  },
)

ipcMain.handle(
  'provider:update' as IpcChannel,
  async (_event, projectRoot: unknown, providerId: unknown, model?: unknown) => {
    await updateProjectProvider(
      assertString(projectRoot, 'project root'),
      assertString(providerId, 'provider id'),
      typeof model === 'string' ? model : undefined,
    )
  },
)

ipcMain.handle(
  'provider:config:get' as IpcChannel,
  async (_event, projectRoot: unknown) => {
    return getProjectProviderConfig(assertString(projectRoot, 'project root'))
  },
)

ipcMain.handle(
  'provider:config:set' as IpcChannel,
  async (_event, projectRoot: unknown, patch: unknown) => {
    const config = assertObject<{
      providerId: string
      model?: string
      baseUrl?: string
      apiKey?: string
      preferences?: Record<string, string | number | boolean>
    }>(patch, 'provider config patch')
    await setProjectProviderConfig(assertString(projectRoot, 'project root'), {
      providerId: config.providerId as import('./providers/providerService.js').DesktopProviderKind,
      model: typeof config.model === 'string' ? config.model : undefined,
      baseUrl: typeof config.baseUrl === 'string' ? config.baseUrl : undefined,
      apiKey: typeof config.apiKey === 'string' ? config.apiKey : undefined,
      preferences:
        config.preferences && typeof config.preferences === 'object'
          ? (config.preferences as Record<string, string | number | boolean>)
          : undefined,
    })
  },
)

ipcMain.handle(
  'provider:key:store' as IpcChannel,
  async (_event, projectRoot: unknown, providerId: unknown, key: unknown) => {
    await storeProjectProviderApiKey(
      assertString(projectRoot, 'project root'),
      assertString(providerId, 'provider id'),
      assertString(key, 'api key'),
    )
  },
)

ipcMain.handle(
  'provider:key:clear' as IpcChannel,
  async (_event, projectRoot: unknown, providerId: unknown) => {
    await clearProjectProviderApiKey(
      assertString(projectRoot, 'project root'),
      assertString(providerId, 'provider id'),
    )
  },
)

ipcMain.handle(
  'provider:test' as IpcChannel,
  async (_event, projectRoot: unknown, providerId: unknown) => {
    return testProjectProviderConnection(
      assertString(projectRoot, 'project root'),
      assertString(providerId, 'provider id'),
    )
  },
)

ipcMain.handle(
  'provider:models:get' as IpcChannel,
  async (_event, projectRoot: unknown, providerId: unknown) => {
    return listProjectProviderModels(
      assertString(projectRoot, 'project root'),
      assertString(providerId, 'provider id'),
    )
  },
)

// MCP
ipcMain.handle('mcp:list' as IpcChannel, async (_event, projectRoot: unknown) => {
  return listProjectMcpServers(assertString(projectRoot, 'project root'))
})

ipcMain.handle('mcp:add' as IpcChannel, async (_event, req: unknown) => {
  const { projectRoot, name, command, args, env } = assertObject<
    AddMcpServerRequestDto
  >(req, 'add mcp server request')
  await addProjectMcpServer(
    assertString(projectRoot, 'project root'),
    assertString(name, 'server name'),
    assertString(command, 'command'),
    Array.isArray(args) ? args.map(String) : undefined,
    env && typeof env === 'object'
      ? Object.fromEntries(
          Object.entries(env as Record<string, unknown>).map(([k, v]) => [
            k,
            String(v),
          ]),
        )
      : undefined,
  )
})

ipcMain.handle(
  'mcp:remove' as IpcChannel,
  async (_event, projectRoot: unknown, name: unknown) => {
    await removeProjectMcpServer(
      assertString(projectRoot, 'project root'),
      assertString(name, 'server name'),
    )
  },
)

// Connectors
ipcMain.handle(
  'connectors:list' as IpcChannel,
  async (_event, projectRoot: unknown) => {
    return listProjectConnectors(assertString(projectRoot, 'project root'))
  },
)

ipcMain.handle(
  'connector:add' as IpcChannel,
  async (_event, req: unknown) => {
    const connector = assertObject<
      import('../shared/ipc.js').AddConnectorRequestDto
    >(req, 'add connector request')
    await addProjectConnector(assertString(connector.projectRoot, 'project root'), {
      name: assertString(connector.name, 'connector name'),
      transport: assertString(connector.transport, 'connector transport') as import('./connectors/connectorService.js').ConnectorTransport,
      command: typeof connector.command === 'string' ? connector.command : undefined,
      args: Array.isArray(connector.args) ? connector.args.map(String) : undefined,
      env: connector.env && typeof connector.env === 'object'
        ? Object.fromEntries(Object.entries(connector.env as Record<string, unknown>).map(([k, v]) => [k, String(v)]))
        : undefined,
      cwd: typeof connector.cwd === 'string' ? connector.cwd : undefined,
      url: typeof connector.url === 'string' ? connector.url : undefined,
      headers: connector.headers && typeof connector.headers === 'object'
        ? Object.fromEntries(Object.entries(connector.headers as Record<string, unknown>).map(([k, v]) => [k, String(v)]))
        : undefined,
      enabled: connector.enabled !== false,
    })
  },
)

ipcMain.handle(
  'connector:update' as IpcChannel,
  async (_event, req: unknown) => {
    const update = assertObject<
      import('../shared/ipc.js').UpdateConnectorRequestDto
    >(req, 'update connector request')
    const config = update.config
    await updateProjectConnector(
      assertString(update.projectRoot, 'project root'),
      assertString(update.name, 'connector name'),
      {
        enabled: typeof update.enabled === 'boolean' ? update.enabled : undefined,
        config: config
          ? {
              transport: typeof config.transport === 'string' ? (config.transport as import('./connectors/connectorService.js').ConnectorTransport) : undefined,
              command: typeof config.command === 'string' ? config.command : undefined,
              args: Array.isArray(config.args) ? config.args.map(String) : undefined,
              env: config.env && typeof config.env === 'object'
                ? Object.fromEntries(Object.entries(config.env as Record<string, unknown>).map(([k, v]) => [k, String(v)]))
                : undefined,
              cwd: typeof config.cwd === 'string' ? config.cwd : undefined,
              url: typeof config.url === 'string' ? config.url : undefined,
              headers: config.headers && typeof config.headers === 'object'
                ? Object.fromEntries(Object.entries(config.headers as Record<string, unknown>).map(([k, v]) => [k, String(v)]))
                : undefined,
            }
          : undefined,
      },
    )
  },
)

ipcMain.handle(
  'connector:remove' as IpcChannel,
  async (_event, projectRoot: unknown, name: unknown) => {
    await removeProjectConnector(
      assertString(projectRoot, 'project root'),
      assertString(name, 'connector name'),
    )
  },
)

ipcMain.handle(
  'connector:test' as IpcChannel,
  async (_event, projectRoot: unknown, name: unknown) => {
    return testProjectConnector(
      assertString(projectRoot, 'project root'),
      assertString(name, 'connector name'),
    )
  },
)

ipcMain.handle(
  'connector:tools' as IpcChannel,
  async (_event, projectRoot: unknown, name: unknown) => {
    return listProjectConnectorTools(
      assertString(projectRoot, 'project root'),
      assertString(name, 'connector name'),
    )
  },
)

ipcMain.handle(
  'connector:tool:call' as IpcChannel,
  async (_event, req: unknown) => {
    const call = assertObject<
      import('../shared/ipc.js').CallConnectorToolRequestDto
    >(req, 'call connector tool request')
    return callProjectConnectorTool(
      assertString(call.projectRoot, 'project root'),
      assertString(call.serverName, 'server name'),
      assertString(call.toolName, 'tool name'),
      call.input && typeof call.input === 'object' ? (call.input as Record<string, unknown>) : {},
    )
  },
)

// History / report
ipcMain.handle(
  'history:read' as IpcChannel,
  async (_event, projectRoot: unknown) => {
    const entries: unknown[] = []
    for await (const entry of readProjectHistory(
      assertString(projectRoot, 'project root'),
    )) {
      entries.push(entry)
    }
    return entries
  },
)

ipcMain.handle(
  'report:export' as IpcChannel,
  async (_event, projectRoot: unknown, worktreeRoot?: unknown) => {
    return exportProjectReport(
      assertString(projectRoot, 'project root'),
      typeof worktreeRoot === 'string' ? worktreeRoot : undefined,
    )
  },
)

// Approvals
ipcMain.handle(
  'approval:respond' as IpcChannel,
  async (_event, res: unknown) => {
    const { requestId, approved, scope } = assertObject<ApprovalResponseDto>(
      res,
      'approval response',
    )
    respondApproval(
      assertString(requestId, 'request id'),
      approved === true,
      scope && typeof scope === 'string' ? (scope as import('../shared/ipc.js').ApprovalScope) : 'once',
    )
  },
)

// Safety / policy
ipcMain.handle(
  'safety:policy:get' as IpcChannel,
  async (_event, req: unknown) => {
    const { projectRoot } = assertObject<GetSafetyPolicyRequestDto>(
      req,
      'get safety policy request',
    )
    return getProjectSafetyPolicy(assertString(projectRoot, 'project root'))
  },
)

ipcMain.handle(
  'safety:policy:set' as IpcChannel,
  async (_event, req: unknown) => {
    const { projectRoot, policy } = assertObject<SetSafetyPolicyRequestDto>(
      req,
      'set safety policy request',
    )
    return setProjectSafetyPolicy(
      assertString(projectRoot, 'project root'),
      policy as import('@ur/agent-runtime').ProjectSafetyPolicy,
    )
  },
)

// History / reports
ipcMain.handle(
  'history:list' as IpcChannel,
  async (_event, req: unknown) => {
    const { projectRoot, limit } = assertObject<ListRunsRequestDto>(
      req,
      'list runs request',
    )
    return listProjectRuns(
      assertString(projectRoot, 'project root'),
      typeof limit === 'number' ? limit : undefined,
    )
  },
)

ipcMain.handle(
  'history:get' as IpcChannel,
  async (_event, req: unknown) => {
    const { runId } = assertObject<GetRunRequestDto>(req, 'get run request')
    return getProjectRun(assertString(runId, 'run id'))
  },
)

ipcMain.handle(
  'history:delete' as IpcChannel,
  async (_event, req: unknown) => {
    const { runId } = assertObject<DeleteRunRequestDto>(req, 'delete run request')
    return deleteProjectRun(assertString(runId, 'run id'))
  },
)

ipcMain.handle(
  'report:markdown' as IpcChannel,
  async (_event, req: unknown) => {
    const { projectRoot, runId } = assertObject<ExportReportRequestDto>(
      req,
      'export report request',
    )
    return exportRunReport(
      assertString(projectRoot, 'project root'),
      assertString(runId, 'run id'),
      'markdown',
    )
  },
)

ipcMain.handle(
  'report:json' as IpcChannel,
  async (_event, req: unknown) => {
    const { projectRoot, runId } = assertObject<ExportReportRequestDto>(
      req,
      'export report request',
    )
    return exportRunReport(
      assertString(projectRoot, 'project root'),
      assertString(runId, 'run id'),
      'json',
    )
  },
)

ipcMain.handle(
  'report:get' as IpcChannel,
  async (_event, req: unknown) => {
    const { projectRoot, runId } = assertObject<GetReportRequestDto>(
      req,
      'get report request',
    )
    return getRunReport(
      assertString(projectRoot, 'project root'),
      assertString(runId, 'run id'),
    )
  },
)
