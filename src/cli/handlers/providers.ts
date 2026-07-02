/* eslint-disable custom-rules/no-process-exit -- CLI subcommand handlers intentionally exit */

import type { Writable } from 'node:stream'
import {
  formatProviderDoctor,
  formatProviderList,
  formatProviderStatus,
  getActiveProviderSettings,
  launchProviderAuth,
  type ProviderId,
  resolveProviderId,
  setSafeProviderConfig,
  doctorProvider,
  validateProviderModelCompatibility,
} from '../../services/providers/providerRegistry.js'
import { getInitialSettings } from '../../utils/settings/settings.js'

type JsonOption = {
  json?: boolean
}

async function writeStream(stream: Writable, text: string): Promise<void> {
  const output = text.endsWith('\n') ? text : `${text}\n`
  await new Promise<void>((resolve, reject) => {
    stream.write(output, error => {
      if (error) reject(error)
      else resolve()
    })
  })
}

function writeOutput(text: string): Promise<void> {
  return writeStream(process.stdout, text)
}

function writeError(text: string): Promise<void> {
  return writeStream(process.stderr, text)
}

export async function providerListHandler(options: JsonOption = {}): Promise<void> {
  await writeOutput(formatProviderList(Boolean(options.json)))
  process.exit(0)
}

export async function providerStatusHandler(options: JsonOption = {}): Promise<void> {
  const settings = getInitialSettings()
  const active = getActiveProviderSettings(settings).active ?? 'ollama'
  const result = await doctorProvider(active, { settings })
  await writeOutput(formatProviderStatus(result, Boolean(options.json)))
  process.exit(result.ok ? 0 : 1)
}

export async function providerDoctorHandler(
  providerArg: string | undefined,
  options: JsonOption = {},
): Promise<void> {
  let provider: ProviderId | undefined
  if (providerArg) {
    const resolved = resolveProviderId(providerArg)
    if (!resolved) {
      await writeError(`Unknown provider "${providerArg}". Run: ur provider list`)
      process.exit(1)
    }
    provider = resolved
  }

  const settings = getInitialSettings()
  const active = getActiveProviderSettings(settings).active ?? 'ollama'
  const result = await doctorProvider(provider ?? active, { settings })
  await writeOutput(formatProviderDoctor(result, Boolean(options.json)))
  process.exit(result.ok ? 0 : 1)
}

export async function providerAuthHandler(
  alias: 'chatgpt' | 'claude' | 'gemini' | 'antigravity',
  options: {
    deviceAuth?: boolean
    dryRun?: boolean
    json?: boolean
  } = {},
): Promise<void> {
  const result = await launchProviderAuth(alias, {
    deviceAuth: options.deviceAuth,
    dryRun: options.dryRun,
  })

  if (options.json) {
    await writeOutput(JSON.stringify(result, null, 2))
  } else if (result.ok) {
    await writeOutput(result.message)
  } else {
    await writeError(result.message)
  }
  process.exit(result.ok ? 0 : 1)
}

export async function configSetHandler(
  key: string,
  values: string | string[],
): Promise<void> {
  const value = Array.isArray(values) ? values.join(' ') : values
  if (
    key !== 'provider' &&
    key !== 'provider.fallback' &&
    key !== 'provider.command_path' &&
    key !== 'model' &&
    key !== 'base_url'
  ) {
    await writeError(
      `Unsupported config key "${key}". Supported: provider, provider.fallback, provider.command_path, model, base_url`,
    )
    process.exit(1)
  }

  // Validate provider/model compatibility when setting model
  if (key === 'model') {
    const settings = getInitialSettings()
    const currentProvider = getActiveProviderSettings(settings).active ?? 'ollama'
    const validation = validateProviderModelCompatibility(currentProvider, value)
    if (validation.valid === false) {
      await writeError(`Invalid model for current provider:
  Selected provider: ${currentProvider}
  Selected model: ${value}
  Valid models for ${currentProvider}: ${validation.validModels.join(', ') || '(no models discovered)'}
  Suggested action: Run /model and choose a model from ${currentProvider}${validation.suggestedModel ? `, or run: ur config set model ${validation.suggestedModel}` : ''}
  Error: ${validation.error}`)
      process.exit(1)
    }
  }

  // When setting provider, validate that current model is compatible
  if (key === 'provider') {
    const settings = getInitialSettings()
    const currentModel = getActiveProviderSettings(settings).model
    if (currentModel) {
      const newProvider = resolveProviderId(value)
      if (newProvider) {
        const validation = validateProviderModelCompatibility(newProvider, currentModel)
        if (validation.valid === false) {
          const validModelsStr = validation.validModels.join(', ') || '(uses dynamic discovery)'
          const suggestedModel = validation.suggestedModel ?? '<model-name>'
          await writeError(`Warning: Current model "${currentModel}" is not available for provider "${newProvider}" and will be cleared.
  Valid models for ${newProvider}: ${validModelsStr}
  After changing provider, run /model or: ur config set model ${suggestedModel}`)
          // Continue with provider change, but warn user
        }
      }
    }
  }

  const result = setSafeProviderConfig(key, value)
  if (result.ok) {
    await writeOutput(result.message)
    process.exit(0)
  }
  await writeError(result.message)
  process.exit(1)
}
