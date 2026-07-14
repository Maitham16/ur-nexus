import type Electron from 'electron'
import { getElectron } from './electronModule.js'
import type {
  OpenProjectDialogResultDto,
  OpenFilesDialogResultDto,
  SaveFileDialogRequestDto,
  SaveFileDialogResultDto,
} from '../shared/ipc.js'

async function focusedWindow(): Promise<Electron.BrowserWindow | undefined> {
  const electron = await getElectron()
  return (
    electron.BrowserWindow.getFocusedWindow() ??
    electron.BrowserWindow.getAllWindows()[0] ??
    undefined
  )
}

export async function openProjectDialog(): Promise<OpenProjectDialogResultDto> {
  const electron = await getElectron()
  const win = await focusedWindow()
  const result = await (win
    ? electron.dialog.showOpenDialog(win, {
        title: 'Open Project',
        properties: ['openDirectory', 'createDirectory'],
        buttonLabel: 'Open Project',
      })
    : electron.dialog.showOpenDialog({
        title: 'Open Project',
        properties: ['openDirectory', 'createDirectory'],
        buttonLabel: 'Open Project',
      }))
  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true }
  }
  return { canceled: false, root: result.filePaths[0] }
}

export async function openFilesDialog(options?: {
  multi?: boolean
  defaultPath?: string
}): Promise<OpenFilesDialogResultDto> {
  const electron = await getElectron()
  const win = await focusedWindow()
  const properties: Array<'openFile' | 'multiSelections'> = ['openFile']
  if (options?.multi !== false) properties.push('multiSelections')
  const dialogOptions: Electron.OpenDialogOptions = {
    title: 'Attach Files',
    properties,
    defaultPath: options?.defaultPath,
    buttonLabel: 'Attach',
  }
  const result = await (win
    ? electron.dialog.showOpenDialog(win, dialogOptions)
    : electron.dialog.showOpenDialog(dialogOptions))
  if (result.canceled) {
    return { canceled: true, paths: [] }
  }
  return { canceled: false, paths: result.filePaths }
}

export async function saveFileDialog(
  req: SaveFileDialogRequestDto,
): Promise<SaveFileDialogResultDto> {
  const electron = await getElectron()
  const win = await focusedWindow()
  const dialogOptions: Electron.SaveDialogOptions = {
    title: req.title ?? 'Save',
    defaultPath: req.defaultPath,
    filters: req.filters,
  }
  const result = await (win
    ? electron.dialog.showSaveDialog(win, dialogOptions)
    : electron.dialog.showSaveDialog(dialogOptions))
  if (result.canceled || !result.filePath) {
    return { canceled: true }
  }
  return { canceled: false, path: result.filePath }
}
