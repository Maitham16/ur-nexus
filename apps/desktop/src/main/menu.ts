import type Electron from 'electron'
import { getElectron } from './electronModule.js'
import { listRecentProjects } from './projectStore.js'
import type { MenuAction } from '../shared/ipc.js'

const isDev = process.env.NODE_ENV === 'development'

function sendMenuAction(action: MenuAction, payload?: unknown): void {
  void (async () => {
    const electron = await getElectron()
    const win =
      electron.BrowserWindow.getFocusedWindow() ??
      electron.BrowserWindow.getAllWindows()[0]
    win?.webContents.send('menu:action', { action, payload })
  })()
}

export async function buildRecentProjectsSubmenu(): Promise<
  Electron.MenuItemConstructorOptions[]
> {
  const recent = await listRecentProjects()
  if (recent.length === 0) {
    return [{ label: 'No Recent Projects', enabled: false }]
  }
  return recent.slice(0, 10).map(project => ({
    label: project.name,
    sublabel: project.root,
    click: () => sendMenuAction('open-project', { root: project.root }),
  }))
}

export async function installApplicationMenu(): Promise<void> {
  const electron = await getElectron()
  const { app, Menu } = electron

  const recentSubmenu = await buildRecentProjectsSubmenu()

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Settings…',
          accelerator: 'Cmd+,',
          click: () => sendMenuAction('settings'),
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Chat',
          accelerator: 'Cmd+N',
          click: () => sendMenuAction('new-chat'),
        },
        { type: 'separator' },
        {
          label: 'Open Project…',
          accelerator: 'Cmd+O',
          click: () => sendMenuAction('open-project'),
        },
        {
          label: 'Open Recent',
          submenu: recentSubmenu,
        },
        {
          label: 'Attach File…',
          accelerator: 'Cmd+Shift+A',
          click: () => sendMenuAction('open-file'),
        },
        { type: 'separator' },
        { role: 'close' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'History',
          accelerator: 'Cmd+Y',
          click: () => sendMenuAction('history'),
        },
        {
          label: 'Toggle Terminal Drawer',
          accelerator: 'Cmd+J',
          click: () => sendMenuAction('toggle-terminal-drawer'),
        },
        {
          label: 'Toggle Context Panel',
          accelerator: 'Cmd+Shift+C',
          click: () => sendMenuAction('toggle-context-panel'),
        },
        { type: 'separator' },
        // Reload is a development affordance only; production reload would
        // drop live run state.
        ...(isDev
          ? ([
              { role: 'reload' },
              { role: 'forceReload' },
              { role: 'toggleDevTools' },
              { type: 'separator' },
            ] as Electron.MenuItemConstructorOptions[])
          : []),
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'UR-Nexus Documentation',
          click: () => {
            void electron.shell.openExternal('https://github.com/Maitham16/ur-nexus#readme')
          },
        },
      ],
    },
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

/** Rebuild the menu so Open Recent reflects newly opened projects. */
export async function refreshApplicationMenu(): Promise<void> {
  await installApplicationMenu()
}
