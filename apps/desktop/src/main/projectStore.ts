import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import * as os from 'node:os'

export interface RecentProject {
  root: string
  name: string
  lastOpenedAt: number
}

function storePaths(): { storeDir: string; storePath: string } {
  // Keep the established production location for backward compatibility,
  // while allowing tests and headless embeds to remain fully isolated.
  const storeDir = process.env.UR_DESKTOP_DATA_DIR
    ? path.join(process.env.UR_DESKTOP_DATA_DIR, 'desktop')
    : path.join(os.homedir(), '.ur', 'desktop')
  return { storeDir, storePath: path.join(storeDir, 'projects.json') }
}

async function loadStore(): Promise<{ recent: RecentProject[] }> {
  try {
    const { storePath } = storePaths()
    const data = await fs.readFile(storePath, 'utf-8')
    return JSON.parse(data) as { recent: RecentProject[] }
  } catch {
    return { recent: [] }
  }
}

async function saveStore(store: { recent: RecentProject[] }): Promise<void> {
  const { storeDir, storePath } = storePaths()
  await fs.mkdir(storeDir, { recursive: true })
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), 'utf-8')
}

export async function addRecentProject(root: string): Promise<void> {
  const name = path.basename(root)
  const store = await loadStore()
  const filtered = store.recent.filter(p => p.root !== root)
  filtered.unshift({ root, name, lastOpenedAt: Date.now() })
  store.recent = filtered.slice(0, 20)
  await saveStore(store)
}

export async function listRecentProjects(): Promise<RecentProject[]> {
  const store = await loadStore()
  return store.recent
}

/** Remove a project from desktop recents. This never touches the project directory. */
export async function removeRecentProject(root: string): Promise<void> {
  const normalized = path.resolve(root)
  const store = await loadStore()
  store.recent = store.recent.filter(
    project => path.resolve(project.root) !== normalized,
  )
  await saveStore(store)
}
