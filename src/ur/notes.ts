// Lightweight persistent stores under .ur/: user memory notes and a research
// store (papers, citations, notes). JSONL, append-only, never throws.
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'

interface NoteRecord {
  ts: string
  text: string
  kind: string
}

function readJsonl(file: string): NoteRecord[] {
  if (!existsSync(file)) return []
  const out: NoteRecord[] = []
  for (const line of readFileSync(file, 'utf8').split('\n').filter(Boolean)) {
    try {
      out.push(JSON.parse(line) as NoteRecord)
    } catch {
      /* skip */
    }
  }
  return out
}

function append(file: string, rec: NoteRecord): void {
  try {
    mkdirSync(dirname(file), { recursive: true })
    appendFileSync(file, JSON.stringify(rec) + '\n')
  } catch {
    /* best-effort */
  }
}

const memFile = (cwd: string) => join(cwd, '.ur', 'memory', 'notes.jsonl')
const researchFile = (cwd: string, kind: string) => join(cwd, '.ur', 'research', `${kind}.jsonl`)

// ── User memory ────────────────────────────────────────────────────────────
export function remember(cwd: string, text: string): void {
  append(memFile(cwd), { ts: new Date().toISOString(), text, kind: 'note' })
}

export function listMemory(cwd: string): NoteRecord[] {
  return readJsonl(memFile(cwd))
}

/** Remove notes containing `needle` (case-insensitive). Returns count removed. */
export function forget(cwd: string, needle: string): number {
  const file = memFile(cwd)
  const all = readJsonl(file)
  const kept = all.filter((n) => !n.text.toLowerCase().includes(needle.toLowerCase()))
  const removed = all.length - kept.length
  if (removed > 0) {
    try {
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, kept.map((n) => JSON.stringify(n)).join('\n') + (kept.length ? '\n' : ''))
    } catch {
      /* best-effort */
    }
  }
  return removed
}

/**
 * Promote an explicit user preference into the typed auto-memory format used
 * by the runtime. The topic file is the source of truth; MEMORY.md remains a
 * compact, recallable index.
 */
export function rememberInAutoMemory(memoryDir: string, text: string): string {
  const normalized = text.trim()
  if (!normalized) throw new Error('Memory text must not be empty')

  const slug = normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'user-preference'
  const digest = createHash('sha256').update(normalized).digest('hex').slice(0, 8)
  const filename = `${slug}-${digest}.md`
  const filePath = join(memoryDir, filename)
  const description = normalized.length > 140
    ? `${normalized.slice(0, 137)}...`
    : normalized
  const body = [
    '---',
    'type: feedback',
    `description: ${JSON.stringify(description)}`,
    '---',
    '',
    normalized,
    '',
  ].join('\n')

  mkdirSync(memoryDir, { recursive: true })
  writeFileSync(filePath, body, { encoding: 'utf8', mode: 0o600 })

  const indexPath = join(memoryDir, 'MEMORY.md')
  const link = `- [${description}](${filename}) — explicit user preference`
  const existing = existsSync(indexPath) ? readFileSync(indexPath, 'utf8') : ''
  if (!existing.includes(`](${filename})`)) {
    appendFileSync(indexPath, `${existing && !existing.endsWith('\n') ? '\n' : ''}${link}\n`, {
      encoding: 'utf8',
      mode: 0o600,
    })
  }
  return filePath
}

// ── Research store ─────────────────────────────────────────────────────────
export function addResearch(cwd: string, kind: 'papers' | 'citations' | 'notes', text: string): void {
  append(researchFile(cwd, kind), { ts: new Date().toISOString(), text, kind })
}

export function listResearch(cwd: string, kind: 'papers' | 'citations' | 'notes'): NoteRecord[] {
  return readJsonl(researchFile(cwd, kind))
}
