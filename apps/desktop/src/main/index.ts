import './vendorGlobals.js'
import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { registerIpcHandlers } from './ipcRegistry.js'
import { installApplicationMenu } from './menu.js'
import { setRendererEmitter } from './runtime.js'
import { loadConfig } from './config.js'

const isDev = process.env.NODE_ENV === 'development'
// Packaged Electron apps can normalize or consume command-line arguments on
// launch. Keep the flag for local use and provide an explicit test-only env
// signal so release smoke tests exercise the packaged main process reliably.
const isSmokeTest =
  process.argv.includes('--smoke-test') || process.env.UR_DESKTOP_SMOKE_TEST === '1'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load application configuration
const config = loadConfig()

const windows = new Set<BrowserWindow>()
const pendingDeepLinks: string[] = []

function broadcast(channel: string, payload: unknown): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, payload)
    }
  }
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: config.debug ? 1400 : 1280,
    height: config.debug ? 900 : 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 14 },
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.cjs'),
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

  // The renderer is local application UI, never a general-purpose browser.
  // Block in-place navigation and embedded webviews even if renderer content
  // is compromised; approved external links are handled below in the OS browser.
  win.webContents.on('will-navigate', event => {
    event.preventDefault()
  })
  win.webContents.on('will-attach-webview', event => {
    event.preventDefault()
  })
  win.webContents.session.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false)
  })
  win.webContents.session.setPermissionCheckHandler(() => false)

  win.webContents.once('dom-ready', () => {
    if (pendingDeepLinks.length > 0) {
      win.webContents.send('runtime:deepLink', pendingDeepLinks.shift())
    }
  })

  win.webContents.setWindowOpenHandler(({ url }) => {
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return { action: 'deny' }
    }
    if (!['https:', 'http:', 'mailto:'].includes(parsed.protocol)) {
      return { action: 'deny' }
    }
    const { evaluateExternalAppOpen } = require('./safety/safetyService.js') as typeof import('./safety/safetyService.js')
    const { requestStandaloneApproval } = require('./runtime.js') as typeof import('./runtime.js')
    const evaluation = evaluateExternalAppOpen(url)
    if (evaluation.behavior === 'deny') {
      return { action: 'deny' }
    }
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

function restoreOrCreateWindow(): BrowserWindow {
  const existing = BrowserWindow.getAllWindows()[0]
  if (existing && !existing.isDestroyed()) {
    if (existing.isMinimized()) existing.restore()
    if (existing.isVisible()) existing.focus()
    else existing.show()
    return existing
  }
  return createWindow()
}

function handleDeepLink(url: string): void {
  pendingDeepLinks.push(url)
  const win = BrowserWindow.getAllWindows()[0]
  if (win && !win.isDestroyed()) {
    win.webContents.send('runtime:deepLink', url)
  }
}

if (!app.isDefaultProtocolClient('ur-desktop')) {
  app.setAsDefaultProtocolClient('ur-desktop')
}

app.on('open-url', (_event, url) => {
  handleDeepLink(url)
})

function startApplication(): void {
  // Runtime events (streaming, approvals, task/agent updates) reach every
  // window; the renderer filters by projectRoot/runId.
  setRendererEmitter((_projectRoot, event) => {
    broadcast('runtime:event', event)
  })
  registerIpcHandlers(ipcMain, broadcast)
  void installApplicationMenu()

  // Smoke runs exit on a timer; the single-instance test lengthens the
  // linger so the second launch races against a still-running instance.
  const smokeLingerMs = Number(process.env.UR_SMOKE_LINGER_MS ?? 2000)

  if (isSmokeTest) {
    console.log('UR_DESKTOP_READY')
    setTimeout(() => app.quit(), smokeLingerMs)
    return
  }

  if (process.env.SKIP_WINDOW_ON_NO_DISPLAY && !process.env.DISPLAY) {
    console.log('UR_DESKTOP_READY')
    setTimeout(() => app.quit(), smokeLingerMs)
    return
  }

  createWindow()

  // Signal that the app is ready for tests
  console.log('UR_DESKTOP_READY')

  app.on('activate', () => {
    restoreOrCreateWindow()
  })
}

const hasSingleInstanceLock = app.requestSingleInstanceLock()

if (!hasSingleInstanceLock) {
  app.quit()
  process.exit(0)
}

app.on('second-instance', (_event, argv) => {
  const deepLink = argv.find(arg => arg.startsWith('ur-desktop://'))
  if (deepLink) {
    handleDeepLink(deepLink)
  }
  restoreOrCreateWindow()
})

app.whenReady().then(startApplication)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
