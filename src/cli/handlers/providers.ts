/* eslint-disable custom-rules/no-process-exit -- CLI subcommand handlers intentionally exit */

import {
  formatProviderDoctor,
  formatProviderList,
  formatProviderStatus,
  getActiveProviderSettings,
  isProviderId,
  launchProviderAuth,
  type ProviderId,
  setSafeProviderConfig,
  doctorProvider,
} from '../../services/providers/providerRegistry.js'
import { getInitialSettings } from '../../utils/settings/settings.js'

type JsonOption = {
  json?: boolean
}

function writeOutput(text: string): void {
  process.stdout.write(text.endsWith('\n') ? text : `${text}\n`)
}

function writeError(text: string): void {
  process.stderr.write(text.endsWith('\n') ? text : `${text}\n`)
}

export async function providerListHandler(options: JsonOption = {}): Promise<void> {
  writeOutput(formatProviderList(Boolean(options.json)))
  process.exit(0)
}

export async function providerStatusHandler(options: JsonOption = {}): Promise<void> {
  const settings = getInitialSettings()
  const active = getActiveProviderSettings(settings).active ?? 'ollama'
  const result = await doctorProvider(active, { settings })
  writeOutput(formatProviderStatus(result, Boolean(options.json)))
  process.exit(result.ok ? 0 : 1)
}

export async function providerDoctorHandler(
  providerArg: string | undefined,
  options: JsonOption = {},
): Promise<void> {
  let provider: ProviderId | undefined
  if (providerArg) {
    if (!isProviderId(providerArg)) {
      writeError(`Unknown provider "${providerArg}". Run: ur provider list`)
      process.exit(1)
    }
    provider = providerArg
  }

  const settings = getInitialSettings()
  const active = getActiveProviderSettings(settings).active ?? 'ollama'
  const result = await doctorProvider(provider ?? active, { settings })
  writeOutput(formatProviderDoctor(result, Boolean(options.json)))
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
    writeOutput(JSON.stringify(result, null, 2))
  } else if (result.ok) {
    writeOutput(result.message)
  } else {
    writeError(result.message)
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
    writeError(
      `Unsupported config key "${key}". Supported: provider, provider.fallback, provider.command_path, model, base_url`,
    )
    process.exit(1)
  }

  const result = setSafeProviderConfig(key, value)
  if (result.ok) {
    writeOutput(result.message)
    process.exit(0)
  }
  writeError(result.message)
  process.exit(1)
}
