import * as path from 'node:path'
import { app } from 'electron'

/**
 * Returns the macOS application support directory for UR Desktop.
 * Uses Electron's app.getPath('userData') when available; falls back to
 * ~/Library/Application Support/UR Desktop in non-Electron contexts.
 */
export function getAppDataPath(): string {
  try {
    return app.getPath('userData')
  } catch {
    return path.join(process.env.HOME ?? '/tmp', 'Library', 'Application Support', 'UR Desktop')
  }
}
