import * as path from 'node:path'
import { promises as fs, constants } from 'node:fs'
import { accessSync } from 'node:fs'
import type { ProjectInfoDto } from '../shared/ipc.js'

export async function inspectProject(root: string): Promise<ProjectInfoDto> {
  const normalized = path.resolve(root)
  const name = path.basename(normalized)

  const [isGit, branch, dirtyFiles] = await Promise.all([
    hasGitRoot(normalized),
    getCurrentBranch(normalized),
    getDirtyFiles(normalized),
  ])

  const packageManager = await detectPackageManager(normalized)
  const scripts = await detectScripts(normalized)
  const { language, framework } = detectLanguageAndFramework(normalized)

  const hasUrFolder = await exists(path.join(normalized, '.ur'))
  const hasUrMd = await exists(path.join(normalized, 'UR.md'))
  const hasUrLocalMd = await exists(path.join(normalized, 'UR.local.md'))

  return {
    root: normalized,
    name,
    isGit,
    branch,
    dirtyFiles,
    packageManager,
    scripts,
    language,
    framework,
    hasUrFolder,
    hasUrMd,
    hasUrLocalMd,
  }
}

async function exists(target: string): Promise<boolean> {
  try {
    await fs.access(target, constants.F_OK)
    return true
  } catch {
    return false
  }
}

async function hasGitRoot(root: string): Promise<boolean> {
  return exists(path.join(root, '.git'))
}

async function getCurrentBranch(root: string): Promise<string | undefined> {
  try {
    const head = await fs.readFile(path.join(root, '.git', 'HEAD'), 'utf-8')
    const ref = head.trim()
    if (ref.startsWith('ref: refs/heads/')) {
      return ref.replace('ref: refs/heads/', '')
    }
    return ref.slice(0, 8)
  } catch {
    return undefined
  }
}

async function getDirtyFiles(root: string): Promise<string[]> {
  const statusFile = path.join(root, '.git', 'index')
  try {
    await fs.access(statusFile)
  } catch {
    return []
  }
  // Phase 4: fast heuristic — list files newer than .git/index. Full git status
  // would require spawning git; we avoid that here and leave it for future work.
  return []
}

async function detectPackageManager(root: string): Promise<string | undefined> {
  if (await exists(path.join(root, 'bun.lockb')) || await exists(path.join(root, 'bun.lock'))) {
    return 'bun'
  }
  if (await exists(path.join(root, 'pnpm-lock.yaml'))) return 'pnpm'
  if (await exists(path.join(root, 'yarn.lock'))) return 'yarn'
  if (await exists(path.join(root, 'package-lock.json'))) return 'npm'
  if (await exists(path.join(root, 'Cargo.toml'))) return 'cargo'
  if (await exists(path.join(root, 'go.mod'))) return 'go'
  if (await exists(path.join(root, 'pyproject.toml')) || await exists(path.join(root, 'requirements.txt'))) {
    return 'python'
  }
  return undefined
}

async function detectScripts(root: string): Promise<string[]> {
  const packageJsonPath = path.join(root, 'package.json')
  try {
    const data = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8')) as {
      scripts?: Record<string, string>
    }
    return Object.keys(data.scripts ?? {})
  } catch {
    return []
  }
}

function detectLanguageAndFramework(
  root: string,
): { language?: string; framework?: string } {
  const signals: Record<string, { language?: string; framework?: string }> = {
    'package.json': { language: 'javascript' },
    'tsconfig.json': { language: 'typescript' },
    'Cargo.toml': { language: 'rust' },
    'go.mod': { language: 'go' },
    'pyproject.toml': { language: 'python' },
    'requirements.txt': { language: 'python' },
    'Gemfile': { language: 'ruby' },
    'composer.json': { language: 'php' },
  }
  // Synchronous basename checks are acceptable for this detector.
  for (const file of Object.keys(signals)) {
    if (existsSync(path.join(root, file))) {
      return signals[file]
    }
  }
  return {}
}

function existsSync(target: string): boolean {
  try {
    accessSync(target, constants.F_OK)
    return true
  } catch {
    return false
  }
}
