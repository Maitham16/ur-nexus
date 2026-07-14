import * as path from 'node:path'
import { getElectron } from '../electronModule.js'

/**
 * Returns the macOS application support directory for UR Desktop.
 * Uses Electron's app.getPath('userData') when available; falls back to
 * ~/Library/Application Support/UR Desktop in non-Electron contexts.
 */
export async function getAppDataPath(): Promise<string> {
  // Explicit override wins: tests and headless tools point this at a
  // temporary directory so they never touch the real user store.
  if (process.env.UR_DESKTOP_DATA_DIR) {
    return process.env.UR_DESKTOP_DATA_DIR
  }
  try {
    const electron = await getElectron()
    return electron.app.getPath('userData')
  } catch {
    return path.join(process.env.HOME ?? '/tmp', 'Library', 'Application Support', 'UR Desktop')
  }
}
