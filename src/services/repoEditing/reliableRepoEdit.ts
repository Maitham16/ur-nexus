import { exec } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path'
import { promisify } from 'node:util'
import { createTwoFilesPatch } from 'diff'
import ts from 'typescript'
import { safeParseJSON } from '../../utils/json.js'

const execAsync = promisify(exec)

const SKIP_DIRS = new Set([
  '.git',
  '.next',
  '.turbo',
  '.ur/cache',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'vendor',
])

const TEXT_EXTENSIONS = new Set([
  '.c',
  '.conf',
  '.cpp',
  '.css',
  '.go',
  '.h',
  '.hpp',
  '.html',
  '.java',
  '.js',
  '.json',
  '.jsx',
  '.kt',
  '.md',
  '.mjs',
  '.mts',
  '.py',
  '.rb',
  '.rs',
  '.sh',
  '.sql',
  '.swift',
  '.toml',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
])

const CODE_EXTENSIONS = new Set([
  '.cjs',
  '.cts',
  '.js',
  '.jsx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
])

export type RepoEditSymbol = {
  name: string
  kind: string
  line: number
  column: number
}

export type RepoEditIndexedFile = {
  path: string
  ext: string
  size: number
  mtimeMs: number
  text: boolean
  code: boolean
  tokens: string[]
  symbols: RepoEditSymbol[]
}

export type RepoEditIndex = {
  version: 1
  builtAt: string
  files: RepoEditIndexedFile[]
}

export type RepoEditSearchHit = {
  file: string
  score: number
  reasons: string[]
  lines: Array<{ line: number; text: string }>
}

export type RenameOccurrence = {
  start: number
  end: number
  line: number
  column: number
}

export type RenameFileChange = {
  file: string
  occurrences: RenameOccurrence[]
  oldContent: string
  newContent: string
  patch: string
}

export type RenamePlan = {
  kind: 'rename'
  from: string
  to: string
  files: RenameFileChange[]
  totalOccurrences: number
  patch: string
}

export type ApplyRenameResult = {
  ok: boolean
  plan: RenamePlan
  writtenFiles: string[]
  rolledBack: boolean
  error?: string
  checkCommand?: string
  checkStdout?: string
  checkStderr?: string
}

export function repoEditIndexPath(root: string): string {
  return join(root, '.ur', 'repo-edit', 'index.json')
}

function isSkippedDir(pathFromRoot: string, name: string): boolean {
  if (SKIP_DIRS.has(name)) return true
  return SKIP_DIRS.has(pathFromRoot)
}

function isTextPath(file: string): boolean {
  const ext = extname(file).toLowerCase()
  return (
    TEXT_EXTENSIONS.has(ext) ||
    /(^|\/)(Dockerfile|Makefile|CMakeLists\.txt)$/.test(file)
  )
}

function isCodePath(file: string): boolean {
  return CODE_EXTENSIONS.has(extname(file).toLowerCase())
}

function normalizeRelPath(path: string): string {
  return path.split('\\').join('/')
}

export function listRepoFiles(root: string, maxFiles = 25_000): string[] {
  const files: string[] = []
  const walk = (dir: string): void => {
    if (files.length >= maxFiles) return
    let entries: import('node:fs').Dirent[]
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      if (files.length >= maxFiles) return
      const full = join(dir, entry.name)
      const rel = normalizeRelPath(relative(root, full))
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') && entry.name !== '.ur') continue
        if (isSkippedDir(rel, entry.name)) continue
        walk(full)
      } else if (entry.isFile()) {
        files.push(rel)
      }
    }
  }
  walk(root)
  return files.sort()
}

function tokenize(value: string): string[] {
  return [
    ...new Set(
      value
        .toLowerCase()
        .match(/[a-z0-9_$-]{2,}/g)
        ?.slice(0, 500) ?? [],
    ),
  ]
}

function scriptKind(file: string): ts.ScriptKind {
  switch (extname(file).toLowerCase()) {
    case '.tsx':
      return ts.ScriptKind.TSX
    case '.jsx':
      return ts.ScriptKind.JSX
    case '.js':
    case '.mjs':
    case '.cjs':
      return ts.ScriptKind.JS
    case '.json':
      return ts.ScriptKind.JSON
    default:
      return ts.ScriptKind.TS
  }
}

function parseSource(file: string, content: string): ts.SourceFile {
  return ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(file),
  )
}

function location(source: ts.SourceFile, pos: number): { line: number; column: number } {
  const loc = source.getLineAndCharacterOfPosition(pos)
  return { line: loc.line + 1, column: loc.character + 1 }
}

function collectSymbols(file: string, content: string): RepoEditSymbol[] {
  if (!isCodePath(file)) return []
  const source = parseSource(file, content)
  const symbols: RepoEditSymbol[] = []
  const add = (name: ts.Identifier | undefined, kind: string): void => {
    if (!name) return
    const loc = location(source, name.getStart(source))
    symbols.push({ name: name.text, kind, ...loc })
  }
  const visit = (node: ts.Node): void => {
    if (ts.isFunctionDeclaration(node)) add(node.name, 'function')
    else if (ts.isClassDeclaration(node)) add(node.name, 'class')
    else if (ts.isInterfaceDeclaration(node)) add(node.name, 'interface')
    else if (ts.isTypeAliasDeclaration(node)) add(node.name, 'type')
    else if (ts.isEnumDeclaration(node)) add(node.name, 'enum')
    else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      add(node.name, 'variable')
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return symbols
}

export function buildRepoEditIndex(root: string): RepoEditIndex {
  const files = listRepoFiles(root).map(path => {
    const abs = join(root, path)
    const stat = statSync(abs)
    const ext = extname(path).toLowerCase()
    const text = isTextPath(path)
    const code = isCodePath(path)
    let content = ''
    if (text && stat.size <= 1_000_000) {
      try {
        content = readFileSync(abs, 'utf-8')
      } catch {
        content = ''
      }
    }
    return {
      path,
      ext,
      size: stat.size,
      mtimeMs: stat.mtimeMs,
      text,
      code,
      tokens: tokenize(`${path}\n${content}`),
      symbols: code ? collectSymbols(path, content) : [],
    }
  })
  const index: RepoEditIndex = {
    version: 1,
    builtAt: new Date().toISOString(),
    files,
  }
  mkdirSync(dirname(repoEditIndexPath(root)), { recursive: true })
  writeFileSync(repoEditIndexPath(root), `${JSON.stringify(index, null, 2)}\n`)
  return index
}

export function loadRepoEditIndex(root: string): RepoEditIndex | null {
  const path = repoEditIndexPath(root)
  if (!existsSync(path)) return null
  const parsed = safeParseJSON(readFileSync(path, 'utf-8'), false)
  return parsed && typeof parsed === 'object' ? (parsed as RepoEditIndex) : null
}

export function searchRepoEditIndex(
  root: string,
  query: string,
  index = loadRepoEditIndex(root) ?? buildRepoEditIndex(root),
): RepoEditSearchHit[] {
  const queryTokens = tokenize(query)
  const lowerQuery = query.toLowerCase()
  const hits: RepoEditSearchHit[] = []
  for (const file of index.files) {
    const reasons: string[] = []
    let score = 0
    if (file.path.toLowerCase().includes(lowerQuery)) {
      score += 8
      reasons.push('path')
    }
    for (const token of queryTokens) {
      if (file.tokens.includes(token)) score += 1
    }
    const symbolMatches = file.symbols.filter(symbol =>
      symbol.name.toLowerCase().includes(lowerQuery),
    )
    if (symbolMatches.length > 0) {
      score += symbolMatches.length * 6
      reasons.push(
        ...symbolMatches.slice(0, 5).map(symbol => `symbol:${symbol.name}`),
      )
    }
    const lines: Array<{ line: number; text: string }> = []
    if (file.text && score > 0) {
      try {
        const content = readFileSync(join(root, file.path), 'utf-8')
        const split = content.split('\n')
        for (let i = 0; i < split.length && lines.length < 4; i++) {
          if (split[i]!.toLowerCase().includes(lowerQuery)) {
            lines.push({
              line: i + 1,
              text: split[i]!.trim().slice(0, 180),
            })
          }
        }
      } catch {
        // Ignore files that disappeared after index build.
      }
    }
    if (score > 0) {
      hits.push({ file: file.path, score, reasons: [...new Set(reasons)], lines })
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 30)
}

function assertIdentifier(value: string, label: string): void {
  if (!/^[A-Za-z_$][\w$]*$/.test(value)) {
    throw new Error(`${label} must be a valid JavaScript/TypeScript identifier: ${value}`)
  }
}

function collectRenameOccurrences(
  file: string,
  content: string,
  from: string,
): RenameOccurrence[] {
  const source = parseSource(file, content)
  const occurrences: RenameOccurrence[] = []
  const visit = (node: ts.Node): void => {
    if (ts.isIdentifier(node) && node.text === from) {
      const start = node.getStart(source)
      const end = node.getEnd()
      occurrences.push({ start, end, ...location(source, start) })
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return occurrences.sort((a, b) => a.start - b.start)
}

function applyRanges(
  content: string,
  ranges: RenameOccurrence[],
  replacement: string,
): string {
  let next = content
  for (const range of [...ranges].sort((a, b) => b.start - a.start)) {
    next = `${next.slice(0, range.start)}${replacement}${next.slice(range.end)}`
  }
  return next
}

function unifiedPatch(file: string, oldContent: string, newContent: string): string {
  return createTwoFilesPatch(
    `a/${file}`,
    `b/${file}`,
    oldContent,
    newContent,
    undefined,
    undefined,
    { context: 3 },
  )
}

export function planRename(root: string, from: string, to: string): RenamePlan {
  assertIdentifier(from, 'from')
  assertIdentifier(to, 'to')
  if (from === to) throw new Error('from and to must be different identifiers')

  const files = listRepoFiles(root)
    .filter(isCodePath)
    .flatMap(file => {
      const abs = join(root, file)
      let oldContent: string
      try {
        oldContent = readFileSync(abs, 'utf-8')
      } catch {
        return []
      }
      const occurrences = collectRenameOccurrences(file, oldContent, from)
      if (occurrences.length === 0) return []
      const newContent = applyRanges(oldContent, occurrences, to)
      return [
        {
          file,
          occurrences,
          oldContent,
          newContent,
          patch: unifiedPatch(file, oldContent, newContent),
        },
      ]
    })

  return {
    kind: 'rename',
    from,
    to,
    files,
    totalOccurrences: files.reduce(
      (total, file) => total + file.occurrences.length,
      0,
    ),
    patch: files.map(file => file.patch).join('\n'),
  }
}

function syntaxErrors(file: string, content: string): string[] {
  const source = parseSource(file, content)
  const diagnostics =
    (source as ts.SourceFile & {
      parseDiagnostics?: readonly ts.DiagnosticWithLocation[]
    }).parseDiagnostics ?? []
  return diagnostics.map(diagnostic => {
    const loc = diagnostic.start === undefined
      ? { line: 0, column: 0 }
      : location(source, diagnostic.start)
    return `${file}:${loc.line}:${loc.column} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`
  })
}

async function runCheck(
  command: string,
  cwd: string,
): Promise<{ ok: boolean; stdout: string; stderr: string; error?: string }> {
  try {
    const result = await execAsync(command, {
      cwd,
      timeout: 10 * 60 * 1000,
      maxBuffer: 10 * 1024 * 1024,
    })
    return { ok: true, stdout: result.stdout, stderr: result.stderr }
  } catch (error) {
    const e = error as Error & {
      stdout?: string
      stderr?: string
      code?: number | string
    }
    return {
      ok: false,
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? '',
      error: e.message,
    }
  }
}

function rollback(root: string, snapshots: Map<string, string>): void {
  for (const [file, content] of snapshots) {
    writeFileSync(join(root, file), content)
  }
}

export async function applyRename(
  root: string,
  from: string,
  to: string,
  options: { checkCommand?: string } = {},
): Promise<ApplyRenameResult> {
  const plan = planRename(root, from, to)
  const snapshots = new Map<string, string>()
  const writtenFiles: string[] = []
  if (plan.files.length === 0) {
    return { ok: true, plan, writtenFiles, rolledBack: false }
  }

  try {
    for (const file of plan.files) {
      snapshots.set(file.file, file.oldContent)
      writeFileSync(join(root, file.file), file.newContent)
      writtenFiles.push(file.file)
    }

    const syntax = plan.files.flatMap(file => syntaxErrors(file.file, file.newContent))
    if (syntax.length > 0) {
      rollback(root, snapshots)
      return {
        ok: false,
        plan,
        writtenFiles,
        rolledBack: true,
        error: `Syntax validation failed after rename:\n${syntax.join('\n')}`,
      }
    }

    if (options.checkCommand) {
      const check = await runCheck(options.checkCommand, root)
      if (!check.ok) {
        rollback(root, snapshots)
        return {
          ok: false,
          plan,
          writtenFiles,
          rolledBack: true,
          error: check.error ?? `Check failed: ${options.checkCommand}`,
          checkCommand: options.checkCommand,
          checkStdout: check.stdout,
          checkStderr: check.stderr,
        }
      }
      return {
        ok: true,
        plan,
        writtenFiles,
        rolledBack: false,
        checkCommand: options.checkCommand,
        checkStdout: check.stdout,
        checkStderr: check.stderr,
      }
    }

    return { ok: true, plan, writtenFiles, rolledBack: false }
  } catch (error) {
    rollback(root, snapshots)
    return {
      ok: false,
      plan,
      writtenFiles,
      rolledBack: true,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export function formatRenamePlan(plan: RenamePlan): string {
  if (plan.files.length === 0) {
    return `No AST identifier matches for "${plan.from}".`
  }
  const lines = [
    `Rename plan: ${plan.from} -> ${plan.to}`,
    `${plan.totalOccurrences} identifier occurrence(s) across ${plan.files.length} file(s).`,
    '',
  ]
  for (const file of plan.files) {
    lines.push(`${file.file}`)
    for (const occurrence of file.occurrences.slice(0, 10)) {
      lines.push(`  ${occurrence.line}:${occurrence.column}`)
    }
    if (file.occurrences.length > 10) {
      lines.push(`  ... ${file.occurrences.length - 10} more`)
    }
  }
  return lines.join('\n')
}

export function formatSearchHits(hits: RepoEditSearchHit[]): string {
  if (hits.length === 0) return 'No repo-edit search matches.'
  return hits
    .map(hit => {
      const lines = [
        `${hit.file}  score=${hit.score}${hit.reasons.length ? ` (${hit.reasons.join(', ')})` : ''}`,
      ]
      for (const line of hit.lines) {
        lines.push(`  ${line.line}: ${line.text}`)
      }
      return lines.join('\n')
    })
    .join('\n\n')
}

export function resolveRepoPath(root: string, maybePath: string): string {
  const resolved = isAbsolute(maybePath) ? maybePath : resolve(root, maybePath)
  const rel = relative(root, resolved)
  if (rel.startsWith('..')) {
    throw new Error(`Path escapes repository root: ${maybePath}`)
  }
  return resolved
}
