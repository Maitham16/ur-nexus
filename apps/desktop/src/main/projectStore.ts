import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import * as os from 'node:os'

export interface RecentProject {
  root: string
  name: string
  lastOpenedAt: number
}

const storeDir = path.join(os.homedir(), '.ur', 'desktop')
const storePath = path.join(storeDir, 'projects.json')

async function loadStore(): Promise<{ recent: RecentProject[] }> {
  try {
    const data = await fs.readFile(storePath, 'utf-8')
    return JSON.parse(data) as { recent: RecentProject[] }
  } catch {
    return { recent: [] }
  }
}

async function saveStore(store: { recent: RecentProject[] }): Promise<void> {
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
