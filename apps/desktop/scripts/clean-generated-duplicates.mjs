import { existsSync, readdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const desktopRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const generatedRoots = [
  path.join(desktopRoot, 'dist', 'main'),
  path.join(desktopRoot, 'dist', 'preload'),
  path.join(desktopRoot, 'dist', 'renderer'),
  path.join(desktopRoot, 'vendor', 'agent-runtime'),
  path.resolve(desktopRoot, '..', '..', 'packages', 'agent-runtime', 'dist'),
]
const conflictCopy = / \d+(?=\.|$)/
let removed = 0

function clean(directory) {
  if (!existsSync(directory)) return
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name)
    if (conflictCopy.test(entry.name)) {
      rmSync(target, { recursive: true, force: true })
      removed += 1
      continue
    }
    if (entry.isDirectory()) clean(target)
  }
}

for (const root of generatedRoots) clean(root)
if (removed > 0) {
  console.log(`Removed ${removed} generated conflict-copy artifact(s).`)
}
