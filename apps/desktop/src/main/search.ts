import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import type { SearchMatchDto, SearchResultDto } from '../shared/ipc.js'

export interface SearchOptions {
  projectRoot: string
  pattern: string
  /** Treat pattern as fixed text instead of a regular expression. */
  fixed?: boolean
  caseSensitive?: boolean
  /** Include globs (e.g. "src/**\/*.ts"). Empty = all files. */
  include?: string[]
  /** Exclude globs. */
  exclude?: string[]
  maxResults?: number
}

const DEFAULT_MAX_RESULTS = 500
const MAX_FILE_BYTES = 2 * 1024 * 1024
const SKIP_DIRS = new Set(['.git', 'node_modules'])

function validateOptions(options: SearchOptions): void {
  if (!options.pattern) {
    throw new Error('Search pattern must not be empty')
  }
  if (options.pattern.length > 2000) {
    throw new Error('Search pattern is too long')
  }
  for (const glob of [...(options.include ?? []), ...(options.exclude ?? [])]) {
    if (glob.startsWith('-')) {
      throw new Error(`Unsafe glob: ${glob}`)
    }
    if (path.isAbsolute(glob)) {
      throw new Error(`Globs must be relative to the project: ${glob}`)
    }
  }
}

/** Resolve the dependency-managed ripgrep binary, if installed. */
export function resolveRipgrepPath(): string | null {
  const binaryName = process.platform === 'win32' ? 'rg.exe' : 'rg'

  // Packaged apps ship the binary in Resources/bin via the afterPack hook.
  // process.resourcesPath is only defined inside a packaged Electron app.
  const resourcesPath = (process as NodeJS.Process & { resourcesPath?: string })
    .resourcesPath
  if (resourcesPath) {
    const packaged = path.join(resourcesPath, 'bin', binaryName)
    if (existsSync(packaged)) return packaged
  }

  const req = createRequire(import.meta.url)

  // Binaries cannot execute from inside app.asar; electron-builder unpacks
  // them next to it, so prefer the app.asar.unpacked twin of any hit.
  const usable = (candidate: string): string | null => {
    const unpacked = candidate.replace('app.asar', 'app.asar.unpacked')
    if (existsSync(unpacked)) return unpacked
    if (existsSync(candidate)) return candidate
    return null
  }

  let wrapperPkgJson: string
  try {
    wrapperPkgJson = req.resolve('@vscode/ripgrep/package.json')
  } catch {
    return null
  }

  // Modern layout (>=1.16): a platform-specific sibling package ships the
  // binary. Resolve it relative to the wrapper so isolated installers
  // (bun's .bun store) that don't hoist transitive deps still work.
  try {
    const wrapperRequire = createRequire(wrapperPkgJson)
    const resolved = wrapperRequire.resolve(
      `@vscode/ripgrep-${process.platform}-${process.arch}/bin/${binaryName}`,
    )
    const hit = usable(resolved)
    if (hit) return hit
  } catch {
    // Platform package absent; try the legacy layout below.
  }

  // Legacy layout (<=1.15): postinstall downloads into @vscode/ripgrep/bin.
  const hit = usable(path.join(path.dirname(wrapperPkgJson), 'bin', binaryName))
  if (hit) return hit
  return null
}

interface RgJsonMatch {
  type: string
  data: {
    path?: { text?: string }
    lines?: { text?: string }
    line_number?: number
    submatches?: Array<{ start: number }>
  }
}

async function searchWithRipgrep(
  rgPath: string,
  options: SearchOptions,
): Promise<SearchResultDto> {
  const max = options.maxResults ?? DEFAULT_MAX_RESULTS
  const args = ['--json', '--no-config', '--max-count', String(max)]
  if (options.fixed) args.push('--fixed-strings')
  if (options.caseSensitive === false) args.push('--ignore-case')
  for (const glob of options.include ?? []) args.push('--glob', glob)
  for (const glob of options.exclude ?? []) args.push('--glob', `!${glob}`)
  args.push('--regexp', options.pattern, '--', '.')

  return new Promise((resolve, reject) => {
    const child = spawn(rgPath, args, {
      cwd: options.projectRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', chunk => {
      stdout += String(chunk)
    })
    child.stderr.on('data', chunk => {
      stderr += String(chunk)
    })
    child.on('error', reject)
    child.on('close', code => {
      // rg exits 1 for "no matches", which is a valid empty result.
      if (code !== 0 && code !== 1) {
        reject(new Error(stderr.trim() || `ripgrep exited with code ${code}`))
        return
      }
      const matches: SearchMatchDto[] = []
      let truncated = false
      for (const line of stdout.split('\n')) {
        if (!line.trim()) continue
        let event: RgJsonMatch
        try {
          event = JSON.parse(line) as RgJsonMatch
        } catch {
          continue
        }
        if (event.type !== 'match') continue
        if (matches.length >= max) {
          truncated = true
          break
        }
        matches.push({
          file: (event.data.path?.text ?? '').replace(/^\.\//, ''),
          line: event.data.line_number ?? 0,
          column: (event.data.submatches?.[0]?.start ?? 0) + 1,
          text: (event.data.lines?.text ?? '').replace(/\n$/, ''),
        })
      }
      resolve({ matches, truncated, engine: 'ripgrep' })
    })
  })
}

function globToRegExp(pattern: string): RegExp {
  let regex = ''
  let i = 0
  while (i < pattern.length) {
    const ch = pattern[i]
    if (ch === '*') {
      if (pattern[i + 1] === '*') {
        if (pattern[i + 2] === '/') {
          regex += '(?:[^/]+/)*'
          i += 3
        } else {
          regex += '.*'
          i += 2
        }
      } else {
        regex += '[^/]*'
        i += 1
      }
    } else if (ch === '?') {
      regex += '[^/]'
      i += 1
    } else {
      regex += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&')
      i += 1
    }
  }
  return new RegExp(`^${regex}$`)
}

async function gitIgnoredSet(
  projectRoot: string,
  relPaths: string[],
): Promise<Set<string>> {
  if (relPaths.length === 0) return new Set()
  return new Promise(resolve => {
    const child = spawn('git', ['check-ignore', '--stdin'], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'ignore'],
    })
    let stdout = ''
    child.stdout.on('data', chunk => {
      stdout += String(chunk)
    })
    child.on('close', () =>
      resolve(new Set(stdout.split('\n').filter(Boolean))),
    )
    child.on('error', () => resolve(new Set()))
    child.stdin.write(relPaths.join('\n'))
    child.stdin.end()
  })
}

async function collectFiles(projectRoot: string): Promise<string[]> {
  const files: string[] = []
  async function walk(relDir: string): Promise<void> {
    const absDir = path.join(projectRoot, relDir)
    let entries
    try {
      entries = await fs.readdir(absDir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      // Match ripgrep defaults: hidden files are skipped.
      if (entry.name.startsWith('.')) continue
      const rel = relDir ? `${relDir}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) await walk(rel)
      } else if (entry.isFile()) {
        files.push(rel)
      }
    }
  }
  await walk('')
  return files
}

function looksBinary(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, Math.min(buffer.length, 4096))
  for (const byte of sample) {
    if (byte === 0) return true
  }
  return false
}

/**
 * Internal search engine used when the ripgrep binary is unavailable
 * (e.g. optional dependency download blocked). Mirrors ripgrep semantics:
 * skips hidden files, respects .gitignore, structured line/column matches.
 */
export async function searchInternal(
  options: SearchOptions,
): Promise<SearchResultDto> {
  const max = options.maxResults ?? DEFAULT_MAX_RESULTS
  const flags = options.caseSensitive === false ? 'gi' : 'g'
  const source = options.fixed
    ? options.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    : options.pattern
  let matcher: RegExp
  try {
    matcher = new RegExp(source, flags)
  } catch (err) {
    throw new Error(
      `Invalid search pattern: ${err instanceof Error ? err.message : String(err)}`,
    )
  }

  const includes = (options.include ?? []).map(globToRegExp)
  const excludes = (options.exclude ?? []).map(globToRegExp)

  let files = await collectFiles(options.projectRoot)
  const ignored = await gitIgnoredSet(options.projectRoot, files)
  files = files.filter(file => {
    if (ignored.has(file)) return false
    if (includes.length > 0 && !includes.some(re => re.test(file))) return false
    if (excludes.some(re => re.test(file))) return false
    return true
  })

  const matches: SearchMatchDto[] = []
  let truncated = false
  for (const file of files) {
    if (matches.length >= max) {
      truncated = true
      break
    }
    let buffer: Buffer
    try {
      buffer = await fs.readFile(path.join(options.projectRoot, file))
    } catch {
      continue
    }
    if (buffer.length > MAX_FILE_BYTES || looksBinary(buffer)) continue
    const lines = buffer.toString('utf-8').split('\n')
    for (let i = 0; i < lines.length; i++) {
      matcher.lastIndex = 0
      const match = matcher.exec(lines[i])
      if (match) {
        matches.push({
          file,
          line: i + 1,
          column: match.index + 1,
          text: lines[i],
        })
        if (matches.length >= max) {
          truncated = true
          break
        }
      }
    }
  }
  return { matches, truncated, engine: 'internal' }
}

export async function runSearch(options: SearchOptions): Promise<SearchResultDto> {
  validateOptions(options)
  const rgPath = resolveRipgrepPath()
  if (rgPath) {
    try {
      return await searchWithRipgrep(rgPath, options)
    } catch {
      // Broken binary or crash: degrade to the internal engine rather than
      // failing the search.
      return searchInternal(options)
    }
  }
  return searchInternal(options)
}
