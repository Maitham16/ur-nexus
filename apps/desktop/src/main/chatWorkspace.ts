import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import { getAppDataPath } from './utils/appDataPath.js'

/**
 * Return a private workspace for conversations that are not attached to a
 * user-selected project. The runtime still needs a real directory for its
 * sandbox and tool cwd; keeping it inside application data avoids granting a
 * general chat access to the user's home directory.
 */
export async function ensureChatWorkspace(): Promise<string> {
  const root = path.join(await getAppDataPath(), 'chat-workspace')
  await fs.mkdir(root, { recursive: true, mode: 0o700 })
  return root
}
