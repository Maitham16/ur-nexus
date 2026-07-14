import * as path from 'node:path'
import { promises as fs } from 'node:fs'
import type { ContextFileDto } from '../shared/ipc.js'

/**
 * Context files attached to the next prompt, tracked per project root.
 * Validation happens on add so the renderer can show precise errors before
 * submission; attachments are re-read at send time so stale files fail loudly.
 */

export const MAX_CONTEXT_FILE_BYTES = 512 * 1024

const contextFiles = new Map<string, Map<string, ContextFileDto>>()

function bucket(projectRoot: string): Map<string, ContextFileDto> {
  const key = path.resolve(projectRoot)
  let map = contextFiles.get(key)
  if (!map) {
    map = new Map()
    contextFiles.set(key, map)
  }
  return map
}

function looksBinary(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192))
  if (sample.length === 0) return false
  let suspicious = 0
  for (const byte of sample) {
    if (byte === 0) return true
    if (byte < 7 || (byte > 14 && byte < 32 && byte !== 27)) suspicious++
  }
  return suspicious / sample.length > 0.3
}

export async function validateContextFile(
  projectRoot: string,
  filePath: string,
): Promise<ContextFileDto> {
  const absPath = path.resolve(filePath)
  const relPath = path.relative(path.resolve(projectRoot), absPath)
  const insideProject = !relPath.startsWith('..') && !path.isAbsolute(relPath)
  const base: Omit<ContextFileDto, 'kind' | 'ok'> = {
    path: absPath,
    relPath: insideProject ? relPath : absPath,
    name: path.basename(absPath),
    sizeBytes: 0,
  }

  let stat
  try {
    stat = await fs.stat(absPath)
  } catch {
    return { ...base, kind: 'missing', ok: false, reason: 'File does not exist' }
  }
  if (stat.isDirectory()) {
    return {
      ...base,
      kind: 'directory',
      ok: false,
      reason: 'Directories cannot be attached; pick files inside it',
    }
  }
  if (stat.size > MAX_CONTEXT_FILE_BYTES) {
    return {
      ...base,
      sizeBytes: stat.size,
      kind: 'too-large',
      ok: false,
      reason: `File is ${Math.round(stat.size / 1024)} KB (limit ${MAX_CONTEXT_FILE_BYTES / 1024} KB)`,
    }
  }

  let buffer: Buffer
  try {
    buffer = await fs.readFile(absPath)
  } catch {
    return {
      ...base,
      sizeBytes: stat.size,
      kind: 'unreadable',
      ok: false,
      reason: 'File exists but cannot be read (permissions?)',
    }
  }
  if (looksBinary(buffer)) {
    return {
      ...base,
      sizeBytes: stat.size,
      kind: 'binary',
      ok: false,
      reason: 'Binary files are not supported as prompt context',
    }
  }
  return { ...base, sizeBytes: stat.size, kind: 'text', ok: true }
}

export async function addContextFiles(
  projectRoot: string,
  paths: string[],
): Promise<ContextFileDto[]> {
  const map = bucket(projectRoot)
  const results: ContextFileDto[] = []
  for (const filePath of paths) {
    const validated = await validateContextFile(projectRoot, filePath)
    if (validated.ok) {
      map.set(validated.path, validated)
    }
    results.push(validated)
  }
  return results
}

export function removeContextFile(projectRoot: string, filePath: string): boolean {
  return bucket(projectRoot).delete(path.resolve(filePath))
}

export function listContextFiles(projectRoot: string): ContextFileDto[] {
  return [...bucket(projectRoot).values()]
}

export function clearContextFiles(projectRoot: string): void {
  bucket(projectRoot).clear()
}

/**
 * Read the attached files fresh from disk and render them as fenced context
 * blocks for the prompt. Files that disappeared or grew past the limit are
 * reported instead of silently dropped.
 */
export async function buildPromptContext(
  projectRoot: string,
  paths?: string[],
): Promise<{ context: string; failures: ContextFileDto[] }> {
  const wanted =
    paths && paths.length > 0
      ? paths.map(p => path.resolve(p))
      : [...bucket(projectRoot).keys()]
  const blocks: string[] = []
  const failures: ContextFileDto[] = []
  for (const filePath of wanted) {
    const validated = await validateContextFile(projectRoot, filePath)
    if (!validated.ok) {
      failures.push(validated)
      continue
    }
    const content = await fs.readFile(validated.path, 'utf-8')
    blocks.push(
      `<attached-file path="${validated.relPath}">\n${content}\n</attached-file>`,
    )
  }
  return { context: blocks.join('\n\n'), failures }
}
