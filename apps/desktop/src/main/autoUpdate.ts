export async function checkForUpdates(): Promise<{ updateAvailable: boolean; version?: string; error?: string }> {
  try {
    const { autoUpdater } = await import('electron-updater')
    const result = await autoUpdater.checkForUpdates()
    const info = result?.updateInfo
    return {
      updateAvailable: info?.version !== undefined,
      version: info?.version,
    }
  } catch (err) {
    return { updateAvailable: false, error: err instanceof Error ? err.message : String(err) }
  }
}
