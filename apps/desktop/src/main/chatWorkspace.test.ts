import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtemp, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { ensureChatWorkspace } from './chatWorkspace.js'

const previousDataDir = process.env.UR_DESKTOP_DATA_DIR
const temporaryRoots: string[] = []

afterEach(async () => {
  if (previousDataDir === undefined) delete process.env.UR_DESKTOP_DATA_DIR
  else process.env.UR_DESKTOP_DATA_DIR = previousDataDir
  await Promise.all(temporaryRoots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

describe('general chat workspace', () => {
  test('creates a private runtime directory under application data', async () => {
    const dataRoot = await mkdtemp(path.join(tmpdir(), 'ur-chat-workspace-'))
    temporaryRoots.push(dataRoot)
    process.env.UR_DESKTOP_DATA_DIR = dataRoot

    const root = await ensureChatWorkspace()

    expect(root).toBe(path.join(dataRoot, 'chat-workspace'))
    expect((await stat(root)).isDirectory()).toBe(true)
    expect(await ensureChatWorkspace()).toBe(root)
  })
})
