import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { getAppDataPath } from '../utils/appDataPath.js'
import { getElectron } from '../electronModule.js'
import type { OAuthToken } from './mcpOAuth.js'

/**
 * Storage for MCP OAuth tokens.
 *
 * Access and refresh tokens are bearer credentials, so they are encrypted with
 * Electron's safeStorage — backed by the macOS Keychain — before touching disk.
 * When safeStorage is unavailable (headless tests, a non-Electron context) the
 * token is held in memory for the process lifetime and never written, because
 * writing it in cleartext would be worse than losing it on restart.
 */

interface StoredEntry {
  /** Base64 of the safeStorage ciphertext. */
  ciphertext: string
}

type StoreFile = {
  version: 1
  tokens: Record<string, StoredEntry>
}

const memoryTokens = new Map<string, OAuthToken>()

/** Connectors are per-project, so the key must include the project. */
export function tokenKey(projectRoot: string, connectorName: string): string {
  return `${projectRoot}::${connectorName}`
}

async function storePath(): Promise<string> {
  return path.join(await getAppDataPath(), 'mcp-oauth.json')
}

async function safeStorage(): Promise<Electron.SafeStorage | undefined> {
  try {
    const electron = await getElectron()
    const candidate = electron.safeStorage
    return candidate?.isEncryptionAvailable?.() ? candidate : undefined
  } catch {
    return undefined
  }
}

async function readFileState(): Promise<StoreFile> {
  try {
    const parsed = JSON.parse(
      await fs.readFile(await storePath(), 'utf-8'),
    ) as Partial<StoreFile>
    return {
      version: 1,
      tokens:
        parsed.tokens && typeof parsed.tokens === 'object' && !Array.isArray(parsed.tokens)
          ? (parsed.tokens as Record<string, StoredEntry>)
          : {},
    }
  } catch {
    return { version: 1, tokens: {} }
  }
}

async function writeFileState(state: StoreFile): Promise<void> {
  const file = await storePath()
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 })
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`
  await fs.writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, {
    encoding: 'utf-8',
    mode: 0o600,
  })
  await fs.rename(temporary, file)
}

export async function saveOAuthToken(
  projectRoot: string,
  connectorName: string,
  token: OAuthToken,
): Promise<{ persisted: boolean }> {
  const key = tokenKey(projectRoot, connectorName)
  memoryTokens.set(key, token)

  const storage = await safeStorage()
  if (!storage) return { persisted: false }

  const state = await readFileState()
  state.tokens[key] = {
    ciphertext: storage.encryptString(JSON.stringify(token)).toString('base64'),
  }
  await writeFileState(state)
  return { persisted: true }
}

export async function loadOAuthToken(
  projectRoot: string,
  connectorName: string,
): Promise<OAuthToken | undefined> {
  const key = tokenKey(projectRoot, connectorName)
  const cached = memoryTokens.get(key)
  if (cached) return cached

  const storage = await safeStorage()
  if (!storage) return undefined

  const state = await readFileState()
  const entry = state.tokens[key]
  if (!entry?.ciphertext) return undefined
  try {
    const decrypted = storage.decryptString(Buffer.from(entry.ciphertext, 'base64'))
    const parsed = JSON.parse(decrypted) as OAuthToken
    if (typeof parsed?.accessToken !== 'string') return undefined
    memoryTokens.set(key, parsed)
    return parsed
  } catch {
    // A token encrypted under a key we no longer hold is unusable; treat it as
    // absent so the connector re-authorizes instead of failing every call.
    return undefined
  }
}

export async function clearOAuthToken(
  projectRoot: string,
  connectorName: string,
): Promise<void> {
  const key = tokenKey(projectRoot, connectorName)
  memoryTokens.delete(key)
  const storage = await safeStorage()
  if (!storage) return
  const state = await readFileState()
  if (state.tokens[key]) {
    delete state.tokens[key]
    await writeFileState(state)
  }
}

/** Test seam: forget in-memory tokens without touching the encrypted file. */
export function resetOAuthTokenCache(): void {
  memoryTokens.clear()
}
