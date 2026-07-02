import { getGlobalConfig, saveGlobalConfig } from '../utils/config.js'

export function migratemodelS1mTomodelS45(): void {
  const config = getGlobalConfig()
  if (config.modelS1m45MigrationComplete) {
    return
  }

  saveGlobalConfig(current => ({
    ...current,
    modelS1m45MigrationComplete: true,
  }))
}
