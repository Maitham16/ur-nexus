import { describe, it, expect, beforeAll } from 'bun:test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import type Electron from 'electron'
import { registerIpcHandlers, getRegisteredChannels } from './ipcRegistry.js'

const projectDir = path.resolve(import.meta.dir, '../..')

type HandlerFn = (event: unknown, ...args: unknown[]) => Promise<unknown>

const registered = new Map<string, HandlerFn>()

const fakeIpcMain = {
  handle: (channel: string, handler: HandlerFn) => {
    registered.set(channel, handler)
  },
} as unknown as Electron.IpcMain

beforeAll(() => {
  registerIpcHandlers(fakeIpcMain, () => undefined)
})

function channelsDeclaredInContract(): string[] {
  const source = fs.readFileSync(
    path.join(projectDir, 'src/shared/ipc.ts'),
    'utf-8',
  )
  const union = source.match(
    /export type IpcChannel =([\s\S]*?)\n\n/,
  )
  if (!union) throw new Error('IpcChannel union not found in shared/ipc.ts')
  return [...union[1].matchAll(/\| '([^']+)'/g)].map(m => m[1])
}

function channelsInvokedByPreload(): string[] {
  const source = fs.readFileSync(
    path.join(projectDir, 'src/preload/index.ts'),
    'utf-8',
  )
  return [...source.matchAll(/ipcRenderer\.invoke\('([^']+)'/g)].map(m => m[1])
}

describe('IPC registry completeness', () => {
  it('registers every channel declared in the shared contract', () => {
    const declared = channelsDeclaredInContract()
    expect(declared.length).toBeGreaterThan(40)
    const missing = declared.filter(c => !registered.has(c))
    expect(missing).toEqual([])
  })

  it('registers a handler for every channel the preload invokes', () => {
    const invoked = channelsInvokedByPreload()
    expect(invoked.length).toBeGreaterThan(40)
    const missing = [...new Set(invoked)].filter(c => !registered.has(c))
    expect(missing).toEqual([])
  })

  it('reports registered channels for diagnostics', () => {
    expect(getRegisteredChannels().length).toBe(registered.size)
  })
})

describe('IPC input validation', () => {
  it('rejects non-string project roots', async () => {
    const handler = registered.get('project:open')!
    await expect(handler({}, 42)).rejects.toThrow(/non-empty string/)
    await expect(handler({}, '')).rejects.toThrow(/non-empty string/)
  })

  it('rejects malformed file read requests', async () => {
    const handler = registered.get('file:read')!
    await expect(handler({}, null)).rejects.toThrow(/must be an object/)
    await expect(handler({}, { projectRoot: '/tmp' })).rejects.toThrow(
      /path must be a non-empty string/,
    )
  })

  it('rejects malformed context file requests', async () => {
    const handler = registered.get('context:add-files')!
    await expect(
      handler({}, { projectRoot: '/tmp', paths: 'not-an-array' }),
    ).rejects.toThrow(/string array/)
  })

  it('rejects invalid maxAgents values', async () => {
    const handler = registered.get('settings:maxAgents')!
    await expect(handler({}, -1)).rejects.toThrow(/positive number/)
    await expect(handler({}, 'four')).rejects.toThrow(/positive number/)
  })

  it('rejects command runs without a command', async () => {
    const handler = registered.get('command:run')!
    await expect(handler({}, { projectRoot: '/tmp' })).rejects.toThrow(
      /command must be a non-empty string/,
    )
  })

  it('does not honor a renderer-supplied approval bypass', async () => {
    const handler = registered.get('command:run')!
    const result = await handler({}, {
      projectRoot: '/tmp',
      command: 'cat .env',
      skipApproval: true,
    }) as { denied?: boolean }
    expect(result.denied).toBe(true)
  })

  it('rejects unsupported providers and invalid approval scopes', async () => {
    const provider = registered.get('provider:config:get')!
    await expect(provider({}, '', 'not-a-provider')).rejects.toThrow(/Unsupported/)

    const approval = registered.get('approval:respond')!
    await expect(approval({}, {
      requestId: 'request-1',
      approved: true,
      scope: 'permanent',
    })).rejects.toThrow(/once, run, or session/)
  })

  it('opening a project that does not exist fails with a clear error', async () => {
    const handler = registered.get('project:open')!
    await expect(
      handler({}, '/nonexistent/path/for/ur-desktop-test'),
    ).rejects.toThrow(/Not a directory/)
  })
})
