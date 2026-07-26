import { createHash, randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { realpathSync } from 'node:fs'
import * as path from 'node:path'
import { getAppDataPath } from './utils/appDataPath.js'
import type {
  CaptureFileMemoryRequestDto,
  DesktopArenaDto,
  DesktopMemoryDto,
  DesktopPlaybookDto,
  DesktopWorkspaceDto,
  QualityProfileDto,
  QualityRunDto,
  SaveMemoryRequestDto,
  SavePlaybookRequestDto,
  SaveQualityProfileRequestDto,
  SaveWorkspaceRequestDto,
  SideChatDto,
  SideChatTurnDto,
} from '../shared/ipc.js'

const MAX_STORE_BYTES = 16 * 1024 * 1024
const MAX_MEMORY_FILE_BYTES = 2 * 1024 * 1024
const MAX_SIDE_CHAT_TURNS = 200

interface MissionControlState {
  version: 1
  playbooks: DesktopPlaybookDto[]
  memories: DesktopMemoryDto[]
  sideChats: SideChatDto[]
  workspaces: DesktopWorkspaceDto[]
  arenas: DesktopArenaDto[]
  qualityProfiles: QualityProfileDto[]
  qualityRuns: QualityRunDto[]
}

const emptyState = (): MissionControlState => ({
  version: 1,
  playbooks: [],
  memories: [],
  sideChats: [],
  workspaces: [],
  arenas: [],
  qualityProfiles: [],
  qualityRuns: [],
})

let statePromise: Promise<MissionControlState> | null = null
let mutationQueue: Promise<void> = Promise.resolve()

async function statePath(): Promise<string> {
  return path.join(await getAppDataPath(), 'mission-control.json')
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : []
}

async function loadState(): Promise<MissionControlState> {
  if (statePromise) return statePromise
  statePromise = (async () => {
    const file = await statePath()
    try {
      const info = await fs.stat(file)
      if (info.size > MAX_STORE_BYTES) {
        throw new Error('Mission-control store exceeds the 16 MiB limit')
      }
      const parsed = JSON.parse(await fs.readFile(file, 'utf-8')) as Partial<MissionControlState>
      return {
        version: 1,
        playbooks: safeArray(parsed.playbooks),
        memories: safeArray(parsed.memories),
        sideChats: safeArray(parsed.sideChats),
        workspaces: safeArray(parsed.workspaces),
        arenas: safeArray(parsed.arenas),
        qualityProfiles: safeArray(parsed.qualityProfiles),
        qualityRuns: safeArray(parsed.qualityRuns),
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyState()
      if (
        error instanceof SyntaxError ||
        (error instanceof Error && error.message.includes('exceeds the 16 MiB limit'))
      ) {
        const quarantine = path.join(
          path.dirname(file),
          `mission-control.corrupt-${Date.now()}.json`,
        )
        await fs.rename(file, quarantine)
        return emptyState()
      }
      throw error
    }
  })()
  return statePromise
}

async function persist(state: MissionControlState): Promise<void> {
  const file = await statePath()
  await fs.mkdir(path.dirname(file), { recursive: true, mode: 0o700 })
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`
  const serialized = `${JSON.stringify(state, null, 2)}\n`
  if (Buffer.byteLength(serialized, 'utf-8') > MAX_STORE_BYTES) {
    throw new Error('Mission-control store exceeds the 16 MiB limit')
  }
  await fs.writeFile(temporary, serialized, {
    encoding: 'utf-8',
    mode: 0o600,
  })
  await fs.rename(temporary, file)
}

async function mutate<T>(operation: (state: MissionControlState) => T | Promise<T>): Promise<T> {
  let result!: T
  const next = mutationQueue.then(async () => {
    const current = await loadState()
    const draft = structuredClone(current)
    result = await operation(draft)
    await persist(draft)
    statePromise = Promise.resolve(draft)
  })
  mutationQueue = next.catch(() => undefined)
  await next
  return result
}

function requiredText(value: string, label: string, max: number): string {
  const normalized = value.trim()
  if (!normalized) throw new Error(`${label} cannot be empty`)
  if (normalized.length > max) throw new Error(`${label} exceeds ${max} characters`)
  return normalized
}

function normalizedRoot(root: string): string {
  const resolved = path.resolve(requiredText(root, 'Project root', 4_096))
  try {
    return realpathSync(resolved)
  } catch {
    return resolved
  }
}

function makeId(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 10)}`
}

function within(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate)
  return relative === '' || (
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  )
}

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex')
}

export async function getMissionState(projectRoot?: string): Promise<MissionControlState> {
  const state = await loadState()
  const root = projectRoot ? path.resolve(projectRoot) : undefined
  const scoped = <T extends { projectRoot: string }>(items: T[]): T[] =>
    root ? items.filter(item => normalizedRoot(item.projectRoot) === normalizedRoot(root)) : items
  return {
    version: 1,
    playbooks: scoped(state.playbooks).map(item => ({ ...item, tags: [...item.tags] })),
    memories: scoped(state.memories).map(item => ({ ...item, citation: { ...item.citation } })),
    sideChats: scoped(state.sideChats).map(item => ({
      ...item,
      turns: item.turns.map(turn => ({ ...turn })),
    })),
    workspaces: state.workspaces.map(item => ({
      ...item,
      repositories: item.repositories.map(repo => ({ ...repo })),
      lastRun: item.lastRun ? { ...item.lastRun, agentIds: [...item.lastRun.agentIds] } : undefined,
    })),
    arenas: scoped(state.arenas).map(item => ({
      ...item,
      candidates: item.candidates.map(candidate => ({ ...candidate })),
    })),
    qualityProfiles: scoped(state.qualityProfiles).map(item => ({ ...item })),
    qualityRuns: scoped(state.qualityRuns).map(item => ({
      ...item,
      checks: item.checks?.map(check => ({ ...check })),
    })),
  }
}

export async function savePlaybook(
  input: SavePlaybookRequestDto,
): Promise<DesktopPlaybookDto> {
  return mutate(state => {
    const now = new Date().toISOString()
    const root = normalizedRoot(input.projectRoot)
    const existing = input.id
      ? state.playbooks.find(item => item.id === input.id)
      : undefined
    if (input.id && !existing) throw new Error(`Playbook not found: ${input.id}`)
    const item: DesktopPlaybookDto = {
      id: existing?.id ?? makeId('playbook'),
      projectRoot: root,
      name: requiredText(input.name, 'Playbook name', 120),
      description: (input.description ?? '').trim().slice(0, 1_000),
      prompt: requiredText(input.prompt, 'Playbook prompt', 32_000),
      tags: [...new Set((input.tags ?? []).map(tag => tag.trim()).filter(Boolean))].slice(0, 12),
      status: input.status ?? existing?.status ?? 'approved',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      lastRunAt: existing?.lastRunAt,
      runCount: existing?.runCount ?? 0,
      successCount: existing?.successCount ?? 0,
      learnedFromAgentId: input.learnedFromAgentId ?? existing?.learnedFromAgentId,
    }
    if (existing) Object.assign(existing, item)
    else state.playbooks.unshift(item)
    return { ...item, tags: [...item.tags] }
  })
}

export async function deletePlaybook(id: string): Promise<boolean> {
  return mutate(state => {
    const previous = state.playbooks.length
    state.playbooks = state.playbooks.filter(item => item.id !== id)
    return state.playbooks.length !== previous
  })
}

export async function getPlaybook(id: string): Promise<DesktopPlaybookDto> {
  const item = (await loadState()).playbooks.find(playbook => playbook.id === id)
  if (!item) throw new Error(`Playbook not found: ${id}`)
  if (item.status === 'disabled') throw new Error(`Playbook is disabled: ${item.name}`)
  return { ...item, tags: [...item.tags] }
}

export async function markPlaybookRun(id: string, success?: boolean): Promise<void> {
  await mutate(state => {
    const item = state.playbooks.find(playbook => playbook.id === id)
    if (!item) return
    item.runCount += 1
    if (success === true) item.successCount += 1
    item.lastRunAt = new Date().toISOString()
    item.updatedAt = item.lastRunAt
  })
}

export async function recordPlaybookOutcome(
  id: string,
  success: boolean,
): Promise<void> {
  await mutate(state => {
    const item = state.playbooks.find(playbook => playbook.id === id)
    if (!item) return
    if (success) item.successCount += 1
    item.updatedAt = new Date().toISOString()
  })
}

export async function saveUserMemory(
  input: SaveMemoryRequestDto,
): Promise<DesktopMemoryDto> {
  return mutate(state => {
    const now = new Date().toISOString()
    const existing = input.id
      ? state.memories.find(memory => memory.id === input.id)
      : undefined
    if (input.id && !existing) throw new Error(`Memory not found: ${input.id}`)
    const item: DesktopMemoryDto = {
      id: existing?.id ?? makeId('memory'),
      projectRoot: normalizedRoot(input.projectRoot),
      title: requiredText(input.title, 'Memory title', 160),
      content: requiredText(input.content, 'Memory content', 16_000),
      citation: {
        kind: 'user',
        source: (input.source ?? 'User-authored research note').trim().slice(0, 1_000),
        capturedAt: existing?.citation.capturedAt ?? now,
      },
      freshness: 'fresh',
      validationMessage: 'User-authored citation; retained exactly as recorded.',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    if (existing) Object.assign(existing, item)
    else state.memories.unshift(item)
    return { ...item, citation: { ...item.citation } }
  })
}

export async function captureFileMemory(
  input: CaptureFileMemoryRequestDto,
): Promise<DesktopMemoryDto> {
  const root = await fs.realpath(normalizedRoot(input.projectRoot))
  const requested = path.isAbsolute(input.path)
    ? path.resolve(input.path)
    : path.resolve(root, input.path)
  const realFile = await fs.realpath(requested)
  if (!within(root, realFile)) throw new Error('Memory citation path escapes the project')
  const info = await fs.stat(realFile)
  if (!info.isFile()) throw new Error('Memory citation must point to a regular file')
  if (info.size > MAX_MEMORY_FILE_BYTES) {
    throw new Error('Memory citation file exceeds the 2 MiB limit')
  }
  const fileContent = await fs.readFile(realFile, 'utf-8')
  const lines = fileContent.split(/\r?\n/u)
  const lineStart = input.lineStart ?? 1
  const lineEnd = input.lineEnd ?? Math.min(lines.length, lineStart + 39)
  if (
    !Number.isInteger(lineStart) ||
    !Number.isInteger(lineEnd) ||
    lineStart < 1 ||
    lineEnd < lineStart ||
    lineEnd > lines.length
  ) {
    throw new Error(`Invalid memory citation line range: ${lineStart}-${lineEnd}`)
  }
  const excerpt = lines.slice(lineStart - 1, lineEnd).join('\n').slice(0, 16_000)
  return mutate(state => {
    const now = new Date().toISOString()
    const item: DesktopMemoryDto = {
      id: makeId('memory'),
      projectRoot: root,
      title: (input.title?.trim() || path.basename(realFile)).slice(0, 160),
      content: (input.content?.trim() || excerpt).slice(0, 16_000),
      citation: {
        kind: 'file',
        source: path.relative(root, realFile),
        capturedAt: now,
        sha256: sha256(fileContent),
        lineStart,
        lineEnd,
      },
      freshness: 'fresh',
      validationMessage: `Verified against ${path.relative(root, realFile)}.`,
      createdAt: now,
      updatedAt: now,
    }
    state.memories.unshift(item)
    return { ...item, citation: { ...item.citation } }
  })
}

async function validateMemoryItem(item: DesktopMemoryDto): Promise<DesktopMemoryDto> {
  if (item.citation.kind !== 'file') {
    return {
      ...item,
      freshness: item.citation.kind === 'web' ? 'unverifiable' : 'fresh',
      validationMessage:
        item.citation.kind === 'web'
          ? 'Web citations require an explicit refresh.'
          : 'Citation is immutable and remains available.',
    }
  }
  try {
    const root = await fs.realpath(item.projectRoot)
    const candidate = await fs.realpath(path.resolve(root, item.citation.source))
    if (!within(root, candidate)) {
      return { ...item, freshness: 'missing', validationMessage: 'Citation resolves outside the project.' }
    }
    const content = await fs.readFile(candidate)
    const current = sha256(content)
    return current === item.citation.sha256
      ? { ...item, freshness: 'fresh', validationMessage: 'File hash still matches the captured source.' }
      : { ...item, freshness: 'stale', validationMessage: 'Source file changed after this memory was captured.' }
  } catch {
    return { ...item, freshness: 'missing', validationMessage: 'Cited source file is no longer available.' }
  }
}

export async function validateMemories(projectRoot: string): Promise<DesktopMemoryDto[]> {
  const root = normalizedRoot(projectRoot)
  const state = await loadState()
  const selected = state.memories.filter(item => normalizedRoot(item.projectRoot) === root)
  const validated = await Promise.all(selected.map(validateMemoryItem))
  await mutate(current => {
    for (const item of validated) {
      const stored = current.memories.find(memory => memory.id === item.id)
      if (stored) Object.assign(stored, item, { updatedAt: new Date().toISOString() })
    }
  })
  return validated
}

export async function deleteMemory(id: string): Promise<boolean> {
  return mutate(state => {
    const previous = state.memories.length
    state.memories = state.memories.filter(item => item.id !== id)
    return state.memories.length !== previous
  })
}

export async function buildMemoryContext(
  projectRoot: string,
  ids: string[] = [],
): Promise<string> {
  const root = normalizedRoot(projectRoot)
  const state = await loadState()
  const selected = state.memories.filter(item =>
    normalizedRoot(item.projectRoot) === root && (ids.length === 0 || ids.includes(item.id)),
  )
  if (selected.length === 0) return ''
  const validated = await Promise.all(selected.map(validateMemoryItem))
  return validated
    .filter(item => item.freshness !== 'missing')
    .map(item => {
      const range = item.citation.lineStart
        ? `:${item.citation.lineStart}${item.citation.lineEnd ? `-${item.citation.lineEnd}` : ''}`
        : ''
      return `- ${item.title}: ${item.content}\n  Citation: ${item.citation.kind}:${item.citation.source}${range} (${item.freshness})`
    })
    .join('\n')
}

export async function createSideChat(
  projectRoot: string,
  title?: string,
): Promise<SideChatDto> {
  return mutate(state => {
    const now = new Date().toISOString()
    const chat: SideChatDto = {
      id: makeId('sidechat'),
      projectRoot: normalizedRoot(projectRoot),
      title: (title?.trim() || 'New side chat').slice(0, 120),
      status: 'open',
      createdAt: now,
      updatedAt: now,
      turns: [],
    }
    state.sideChats.unshift(chat)
    return { ...chat, turns: [] }
  })
}

export async function getSideChat(id: string): Promise<SideChatDto> {
  const chat = (await loadState()).sideChats.find(item => item.id === id)
  if (!chat) throw new Error(`Side chat not found: ${id}`)
  return { ...chat, turns: chat.turns.map(turn => ({ ...turn })) }
}

export async function appendSideChatTurn(
  id: string,
  turn: Omit<SideChatTurnDto, 'id' | 'createdAt'>,
  allowClosed = false,
): Promise<SideChatDto> {
  return mutate(state => {
    const chat = state.sideChats.find(item => item.id === id)
    if (!chat) throw new Error(`Side chat not found: ${id}`)
    if (chat.status !== 'open' && !allowClosed) throw new Error('Side chat is closed')
    chat.turns.push({
      ...turn,
      id: makeId('turn'),
      createdAt: new Date().toISOString(),
    })
    if (chat.turns.length > MAX_SIDE_CHAT_TURNS) {
      chat.turns.splice(0, chat.turns.length - MAX_SIDE_CHAT_TURNS)
    }
    const firstUserTurn = chat.turns.find(item => item.role === 'user')
    if (chat.title === 'New side chat' && firstUserTurn) {
      chat.title = firstUserTurn.content.slice(0, 72)
    }
    chat.updatedAt = new Date().toISOString()
    return { ...chat, turns: chat.turns.map(item => ({ ...item })) }
  })
}

export async function renameSideChat(id: string, title: string): Promise<SideChatDto> {
  return mutate(state => {
    const chat = state.sideChats.find(item => item.id === id)
    if (!chat) throw new Error(`Side chat not found: ${id}`)
    chat.title = requiredText(title, 'Side chat title', 120)
    chat.updatedAt = new Date().toISOString()
    return { ...chat, turns: chat.turns.map(turn => ({ ...turn })) }
  })
}

export async function closeSideChat(id: string): Promise<SideChatDto> {
  return mutate(state => {
    const chat = state.sideChats.find(item => item.id === id)
    if (!chat) throw new Error(`Side chat not found: ${id}`)
    chat.status = 'closed'
    chat.updatedAt = new Date().toISOString()
    return { ...chat, turns: chat.turns.map(turn => ({ ...turn })) }
  })
}

export async function saveWorkspace(
  input: SaveWorkspaceRequestDto,
): Promise<DesktopWorkspaceDto> {
  const repositories = await Promise.all(input.repositories.map(async repository => {
    const root = await fs.realpath(normalizedRoot(repository.root))
    const info = await fs.stat(root)
    if (!info.isDirectory()) throw new Error(`Workspace repository is not a directory: ${root}`)
    return { root, label: (repository.label?.trim() || path.basename(root)).slice(0, 120) }
  }))
  if (repositories.length === 0) throw new Error('A workspace needs at least one repository')
  if (repositories.length > 12) throw new Error('A workspace supports at most 12 repositories')
  return mutate(state => {
    const now = new Date().toISOString()
    const existing = input.id ? state.workspaces.find(item => item.id === input.id) : undefined
    if (input.id && !existing) throw new Error(`Workspace not found: ${input.id}`)
    const workspace: DesktopWorkspaceDto = {
      id: existing?.id ?? makeId('workspace'),
      name: requiredText(input.name, 'Workspace name', 120),
      repositories,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      lastRun: existing?.lastRun,
    }
    if (existing) Object.assign(existing, workspace)
    else state.workspaces.unshift(workspace)
    return { ...workspace, repositories: workspace.repositories.map(repo => ({ ...repo })) }
  })
}

export async function getWorkspace(id: string): Promise<DesktopWorkspaceDto> {
  const workspace = (await loadState()).workspaces.find(item => item.id === id)
  if (!workspace) throw new Error(`Workspace not found: ${id}`)
  return { ...workspace, repositories: workspace.repositories.map(repo => ({ ...repo })) }
}

export async function markWorkspaceRun(
  id: string,
  prompt: string,
  agentIds: string[],
): Promise<DesktopWorkspaceDto> {
  return mutate(state => {
    const workspace = state.workspaces.find(item => item.id === id)
    if (!workspace) throw new Error(`Workspace not found: ${id}`)
    workspace.lastRun = {
      prompt: prompt.slice(0, 32_000),
      launchedAt: new Date().toISOString(),
      agentIds: [...agentIds],
    }
    workspace.updatedAt = new Date().toISOString()
    return { ...workspace, repositories: workspace.repositories.map(repo => ({ ...repo })) }
  })
}

export async function deleteWorkspace(id: string): Promise<boolean> {
  return mutate(state => {
    const previous = state.workspaces.length
    state.workspaces = state.workspaces.filter(item => item.id !== id)
    return state.workspaces.length !== previous
  })
}

export async function saveArena(arena: DesktopArenaDto): Promise<DesktopArenaDto> {
  return mutate(state => {
    const existing = state.arenas.find(item => item.id === arena.id)
    if (existing) Object.assign(existing, arena)
    else state.arenas.unshift(arena)
    return { ...arena, candidates: arena.candidates.map(candidate => ({ ...candidate })) }
  })
}

export async function getArena(id: string): Promise<DesktopArenaDto> {
  const arena = (await loadState()).arenas.find(item => item.id === id)
  if (!arena) throw new Error(`Arena not found: ${id}`)
  return { ...arena, candidates: arena.candidates.map(candidate => ({ ...candidate })) }
}

export async function saveQualityProfile(
  input: SaveQualityProfileRequestDto,
): Promise<QualityProfileDto> {
  return mutate(state => {
    const now = new Date().toISOString()
    const existing = input.id
      ? state.qualityProfiles.find(item => item.id === input.id)
      : undefined
    if (input.id && !existing) throw new Error(`Quality profile not found: ${input.id}`)
    const profile: QualityProfileDto = {
      id: existing?.id ?? makeId('quality'),
      projectRoot: normalizedRoot(input.projectRoot),
      name: requiredText(input.name, 'Quality profile name', 120),
      command: requiredText(input.command, 'Quality command', 4_096),
      autoFix: input.autoFix === true,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    if (existing) Object.assign(existing, profile)
    else state.qualityProfiles.unshift(profile)
    return { ...profile }
  })
}

export async function getQualityProfile(id: string): Promise<QualityProfileDto> {
  const profile = (await loadState()).qualityProfiles.find(item => item.id === id)
  if (!profile) throw new Error(`Quality profile not found: ${id}`)
  return { ...profile }
}

export async function deleteQualityProfile(id: string): Promise<boolean> {
  return mutate(state => {
    const previous = state.qualityProfiles.length
    state.qualityProfiles = state.qualityProfiles.filter(item => item.id !== id)
    return state.qualityProfiles.length !== previous
  })
}

export async function saveQualityRun(run: QualityRunDto): Promise<QualityRunDto> {
  return mutate(state => {
    const existing = state.qualityRuns.find(item => item.id === run.id)
    if (existing) Object.assign(existing, run)
    else state.qualityRuns.unshift(run)
    state.qualityRuns = state.qualityRuns.slice(0, 100)
    return { ...run, checks: run.checks?.map(check => ({ ...check })) }
  })
}

export async function reconcileQualityRuns(
  activeRunIds: string[] = [],
): Promise<number> {
  const active = new Set(activeRunIds)
  const current = await loadState()
  if (!current.qualityRuns.some(run => run.status === 'running' && !active.has(run.id))) {
    return 0
  }
  return mutate(state => {
    let count = 0
    for (const run of state.qualityRuns) {
      if (run.status !== 'running' || active.has(run.id)) continue
      run.status = 'failed'
      run.finishedAt = new Date().toISOString()
      run.summary = 'The desktop exited while this quality run was active.'
      count += 1
    }
    return count
  })
}

export async function resetMissionControlStoreForTests(): Promise<void> {
  await mutationQueue.catch(() => undefined)
  statePromise = null
  mutationQueue = Promise.resolve()
}
