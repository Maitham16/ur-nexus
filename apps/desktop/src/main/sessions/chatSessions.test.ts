import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdtempSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  archiveChatSession,
  bindChatSessionRun,
  createChatSession,
  getChatSession,
  listChatSessions,
  renameChatSession,
  reorderChatSessions,
  resetChatSessionCache,
} from './chatSessions.js'

const PROJECT = '/tmp/project-a'
const OTHER = '/tmp/project-b'
let dataDir: string

beforeEach(() => {
  dataDir = mkdtempSync(join(tmpdir(), 'ur-chat-sessions-'))
  process.env.UR_DESKTOP_DATA_DIR = dataDir
  resetChatSessionCache()
})

afterEach(() => {
  delete process.env.UR_DESKTOP_DATA_DIR
  resetChatSessionCache()
})

const storeFile = () => join(dataDir, 'chat-sessions.json')

describe('createChatSession', () => {
  test('numbers untitled chats per project', async () => {
    expect((await createChatSession(PROJECT)).title).toBe('Chat 1')
    expect((await createChatSession(PROJECT)).title).toBe('Chat 2')
    expect((await createChatSession(OTHER)).title).toBe('Chat 1')
  })

  test('accepts and trims an explicit title', async () => {
    expect((await createChatSession(PROJECT, '  Refactor auth  ')).title).toBe('Refactor auth')
  })

  test('falls back to a generated title when the supplied one is blank', async () => {
    expect((await createChatSession(PROJECT, '   ')).title).toBe('Chat 1')
  })

  test('caps very long titles', async () => {
    expect((await createChatSession(PROJECT, 'x'.repeat(500))).title.length).toBe(120)
  })

  test('assigns increasing order values', async () => {
    const first = await createChatSession(PROJECT)
    const second = await createChatSession(PROJECT)
    expect(second.order).toBeGreaterThan(first.order)
  })

  test('writes the store to disk with restrictive permissions', async () => {
    await createChatSession(PROJECT)
    expect(existsSync(storeFile())).toBe(true)
    const parsed = JSON.parse(readFileSync(storeFile(), 'utf8'))
    expect(parsed.sessions).toHaveLength(1)
  })
})

describe('listChatSessions', () => {
  test('scopes to a project and sorts by tab order', async () => {
    const a = await createChatSession(PROJECT, 'A')
    const b = await createChatSession(PROJECT, 'B')
    await createChatSession(OTHER, 'C')
    expect((await listChatSessions(PROJECT)).map(s => s.id)).toEqual([a.id, b.id])
  })

  test('hides archived sessions unless asked', async () => {
    const keep = await createChatSession(PROJECT, 'keep')
    const gone = await createChatSession(PROJECT, 'gone')
    await archiveChatSession(gone.id)
    expect((await listChatSessions(PROJECT)).map(s => s.id)).toEqual([keep.id])
    expect((await listChatSessions(PROJECT, true)).map(s => s.id)).toEqual([keep.id, gone.id])
  })

  test('returns nothing for an unknown project', async () => {
    expect(await listChatSessions('/nope')).toEqual([])
  })
})

describe('renameChatSession', () => {
  test('renames and bumps updatedAt', async () => {
    const session = await createChatSession(PROJECT)
    const renamed = await renameChatSession(session.id, 'New name')
    expect(renamed.title).toBe('New name')
    expect(renamed.updatedAt).toBeGreaterThanOrEqual(session.updatedAt)
  })

  test('rejects an empty title', async () => {
    const session = await createChatSession(PROJECT)
    await expect(renameChatSession(session.id, '  ')).rejects.toThrow('cannot be empty')
  })

  test('rejects an unknown id', async () => {
    await expect(renameChatSession('missing', 'x')).rejects.toThrow('not found')
  })
})

describe('bindChatSessionRun', () => {
  test('binds and detaches a run', async () => {
    const session = await createChatSession(PROJECT)
    expect((await bindChatSessionRun(session.id, 'run-1')).runId).toBe('run-1')
    expect((await bindChatSessionRun(session.id, undefined)).runId).toBeUndefined()
  })

  test('a run belongs to only one session at a time', async () => {
    const first = await createChatSession(PROJECT)
    const second = await createChatSession(PROJECT)
    await bindChatSessionRun(first.id, 'run-1')
    await bindChatSessionRun(second.id, 'run-1')
    expect((await getChatSession(first.id))?.runId).toBeUndefined()
    expect((await getChatSession(second.id))?.runId).toBe('run-1')
  })

  test('keeps distinct runs on distinct sessions', async () => {
    const first = await createChatSession(PROJECT)
    const second = await createChatSession(PROJECT)
    await bindChatSessionRun(first.id, 'run-1')
    await bindChatSessionRun(second.id, 'run-2')
    expect((await getChatSession(first.id))?.runId).toBe('run-1')
    expect((await getChatSession(second.id))?.runId).toBe('run-2')
  })
})

describe('archiveChatSession', () => {
  test('archiving detaches the live run', async () => {
    const session = await createChatSession(PROJECT)
    await bindChatSessionRun(session.id, 'run-1')
    const archived = await archiveChatSession(session.id)
    expect(archived.archived).toBe(true)
    expect(archived.runId).toBeUndefined()
  })

  test('archived titles do not block reusing the generated name', async () => {
    const first = await createChatSession(PROJECT)
    await archiveChatSession(first.id)
    // The archived record still exists, so numbering must skip past it rather
    // than produce a duplicate tab name.
    expect((await createChatSession(PROJECT)).title).toBe('Chat 2')
  })
})

describe('reorderChatSessions', () => {
  test('applies an explicit tab order', async () => {
    const a = await createChatSession(PROJECT, 'A')
    const b = await createChatSession(PROJECT, 'B')
    const c = await createChatSession(PROJECT, 'C')
    await reorderChatSessions(PROJECT, [c.id, a.id, b.id])
    expect((await listChatSessions(PROJECT)).map(s => s.title)).toEqual(['C', 'A', 'B'])
  })

  test('sessions omitted from the order land after the listed ones', async () => {
    const a = await createChatSession(PROJECT, 'A')
    const b = await createChatSession(PROJECT, 'B')
    await reorderChatSessions(PROJECT, [b.id])
    expect((await listChatSessions(PROJECT)).map(s => s.title)).toEqual(['B', 'A'])
    expect(a.id).toBeDefined()
  })
})

describe('persistence', () => {
  test('sessions survive a cache reset, which stands in for a restart', async () => {
    const session = await createChatSession(PROJECT, 'Durable')
    resetChatSessionCache()
    expect((await listChatSessions(PROJECT)).map(s => s.title)).toEqual(['Durable'])
    expect(session.id).toBeDefined()
  })

  test('a live runId does not survive a restart', async () => {
    const session = await createChatSession(PROJECT)
    await bindChatSessionRun(session.id, 'run-1')
    resetChatSessionCache()
    expect((await getChatSession(session.id))?.runId).toBeUndefined()
  })

  test('a corrupt store is quarantined instead of crashing the app', async () => {
    await createChatSession(PROJECT)
    resetChatSessionCache()
    writeFileSync(storeFile(), '{ not json')
    expect(await listChatSessions(PROJECT)).toEqual([])
    expect(readdirSync(dataDir).some(name => name.startsWith('chat-sessions.corrupt-'))).toBe(true)
  })

  test('a missing store reads as empty', async () => {
    expect(await listChatSessions(PROJECT)).toEqual([])
  })

  test('non-object entries in the store are discarded', async () => {
    writeFileSync(
      storeFile(),
      JSON.stringify({ version: 1, sessions: [null, 42, { id: 'x' }, { projectRoot: PROJECT }] }),
    )
    resetChatSessionCache()
    expect(await listChatSessions(PROJECT)).toEqual([])
  })
})
