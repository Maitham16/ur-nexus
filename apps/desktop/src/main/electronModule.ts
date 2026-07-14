/**
 * Lazy, testable wrapper around the Electron module.
 *
 * The desktop main process imports this module and resolves Electron APIs
 * lazily so that unit tests under Bun can stub them without requiring a real
 * Electron runtime at import time.
 */

import type Electron from 'electron'

let electronModule: typeof Electron | null = null

export async function getElectron(): Promise<typeof Electron> {
  if (!electronModule) {
    electronModule = await import('electron')
  }
  return electronModule
}

export function setElectronModule(module: typeof Electron): void {
  electronModule = module
}

export function clearElectronModule(): void {
  electronModule = null
}
