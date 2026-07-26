import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execFileSync } from 'node:child_process'
import {
  setRendererEmitter,
  respondApproval,
  openProjectAndCache,
  openChatWorkspace,
  closeProject,
  startRun,
  runPromptStream,
  listProjectSlashCommands,
  executeTool,
  proposeEdit,
  applyProjectPatch,
  readProjectFile,
  exportProjectReport,
  listProjectRuns,
  runtimeResultErrorMessage,
} from './runtime.js'
import { gitStatus } from './explorer.js'

let repo: string
let dataDir: string
let emitted: Array<Record<string, unknown>> = []

beforeEach(async () => {
  repo = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-e2e-'))
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-e2e-data-'))
  process.env.UR_DESKTOP_DATA_DIR = dataDir
  process.env.UR_CONFIG_DIR = path.join(dataDir, 'runtime')
  execFileSync('git', ['init', '-q'], { cwd: repo })
  execFileSync('git', ['config', 'user.email', 't@e.st'], { cwd: repo })
  execFileSync('git', ['config', 'user.name', 'T'], { cwd: repo })
  fs.writeFileSync(path.join(repo, 'README.md'), '# e2e\n')
  execFileSync('git', ['add', '.'], { cwd: repo })
  execFileSync('git', ['commit', '-q', '-m', 'init'], { cwd: repo })

  emitted = []
  // Auto-approve any approval request, as a user clicking "Allow" would.
  setRendererEmitter((_root, event) => {
    const e = event as Record<string, unknown>
    emitted.push(e)
    if (e.type === 'approval_required' && typeof e.requestId === 'string') {
      setImmediate(() => respondApproval(e.requestId as string, true, 'run'))
    }
  })
  await openProjectAndCache(repo)
})

afterEach(() => {
  delete process.env.UR_DESKTOP_DATA_DIR
  delete process.env.UR_CONFIG_DIR
  closeProject(repo)
  fs.rmSync(repo, { recursive: true, force: true })
  fs.rmSync(dataDir, { recursive: true, force: true })
})

describe('desktop runtime end-to-end (no window)', () => {
  it('treats provider error results as terminal failures', () => {
    expect(runtimeResultErrorMessage({
      type: 'run_result',
      runId: 'run',
      sessionId: 'session',
      projectRoot: repo,
      timestamp: Date.now(),
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        requestCount: 1,
        estimated: true,
      },
      isError: true,
      resultText: 'Provider failed',
    })).toBe('Provider failed')
  })

  it('starts a sandboxed general chat without a user-selected project', async () => {
    const chat = await openChatWorkspace()
    expect(chat.root).toBe(path.join(dataDir, 'chat-workspace'))

    const { runId, projectRoot } = await startRun(chat.root)
    expect(projectRoot).toBe(chat.root)

    const writeResult = await executeTool(runId, 'Write', {
      path: 'general-chat.txt',
      content: 'private chat workspace\n',
    }) as { written?: boolean }
    expect(writeResult.written).toBe(true)
    expect(fs.readFileSync(path.join(chat.root, 'general-chat.txt'), 'utf-8')).toBe(
      'private chat workspace\n',
    )
    expect(fs.existsSync(path.join(repo, 'general-chat.txt'))).toBe(false)
    closeProject(chat.root)
  })

  it('runs Write/Read/Glob tools against the real project directory', async () => {
    const { runId } = await startRun(repo)

    const writeResult = (await executeTool(runId, 'Write', {
      path: 'src/hello.txt',
      content: 'hello desktop\n',
    })) as { written?: boolean; denied?: boolean }
    expect(writeResult.written).toBe(true)
    expect(
      fs.readFileSync(path.join(repo, 'src/hello.txt'), 'utf-8'),
    ).toBe('hello desktop\n')

    const readResult = (await executeTool(runId, 'Read', {
      path: 'src/hello.txt',
    })) as { content?: string }
    expect(readResult.content).toBe('hello desktop\n')

    const globResult = (await executeTool(runId, 'Glob', {
      pattern: 'src/*.txt',
    })) as { files?: unknown }
    expect(JSON.stringify(globResult.files)).toContain('hello.txt')

    // Tool lifecycle events reached the renderer.
    const types = emitted.map(e => e.type)
    expect(types).toContain('tool_call_started')
    expect(types).toContain('tool_call_finished')

    // Unsupported tools fail loudly instead of returning fake success.
    const bogus = (await executeTool(runId, 'NotARealTool', {})) as {
      error?: string
      unsupported?: boolean
    }
    expect(bogus.unsupported).toBe(true)
  })

  it('lists and executes the terminal agent slash-command registry', async () => {
    const commands = await listProjectSlashCommands(repo)
    expect(commands.length).toBeGreaterThan(100)
    expect(commands.some(command => command.name === 'workspace')).toBe(true)
    expect(commands.some(command => command.name === 'security-review')).toBe(true)

    const { runId } = await startRun(repo)
    const events = []
    for await (const event of runPromptStream(runId, '/workspace')) {
      events.push(event)
    }
    const output = events
      .filter(event => event.type === 'model_stream')
      .map(event => String((event as { delta?: string }).delta ?? ''))
      .join('')
    expect(output).toContain(repo)
  }, 15000)

  it('keeps concurrent runtime sessions in their own workspace', async () => {
    const secondRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-e2e-parallel-'))
    try {
      fs.writeFileSync(path.join(secondRepo, 'SECOND.md'), 'parallel workspace\n')
      await openProjectAndCache(secondRepo)
      const [first, second] = await Promise.all([
        startRun(repo),
        startRun(secondRepo),
      ])
      const collect = async (runId: string): Promise<string> => {
        const chunks: string[] = []
        for await (const event of runPromptStream(runId, '/workspace')) {
          if (event.type === 'model_stream') chunks.push(event.delta)
        }
        return chunks.join('')
      }
      const [firstOutput, secondOutput] = await Promise.all([
        collect(first.runId),
        collect(second.runId),
      ])
      expect(firstOutput).toContain(repo)
      expect(firstOutput).not.toContain(secondRepo)
      expect(secondOutput).toContain(secondRepo)
      expect(secondOutput).not.toContain(repo)
    } finally {
      closeProject(secondRepo)
      fs.rmSync(secondRepo, { recursive: true, force: true })
    }
  }, 15000)

  it('proposes a real unified diff and applies it via git apply', async () => {
    await startRun(repo)
    const original = fs.readFileSync(path.join(repo, 'README.md'), 'utf-8')
    const updated = `${original}\nMore content.\n`

    const { patch } = await proposeEdit(repo, 'README.md', updated)
    expect(patch).toContain('+++ b/README.md')
    expect(patch).toContain('+More content.')

    await applyProjectPatch(repo, patch)
    expect(await readProjectFile(repo, 'README.md')).toBe(updated)

    const status = await gitStatus(repo)
    expect(status.find(s => s.relPath === 'README.md')?.status).toBe('modified')
  })

  it('separates inherited dirty state from agent-authored workspace changes', async () => {
    fs.writeFileSync(path.join(repo, 'README.md'), '# user draft\n')
    const { runId } = await startRun(repo)
    const events = []
    for await (const event of runPromptStream(runId, '/workspace')) {
      events.push(event)
    }
    const verification = events.find(event => event.type === 'verification_completed') as
      | { passed?: boolean }
      | undefined
    expect(verification?.passed).toBe(true)
    expect(events.some(event => event.type === 'changed_files')).toBe(false)
  })

  it('detects files changed by runtime shell tools before verification', async () => {
    const { runId } = await startRun(repo)
    const result = await executeTool(runId, 'Bash', {
      command: "printf 'agent output\\n' > runtime-output.txt",
    }) as { exitCode?: number }
    expect(result.exitCode).toBe(0)
    expect(fs.existsSync(path.join(repo, 'runtime-output.txt'))).toBe(true)

    const events = []
    for await (const event of runPromptStream(runId, '/workspace')) {
      events.push(event)
    }
    const changed = events.find(event => event.type === 'changed_files') as
      | { files?: string[] }
      | undefined
    const verification = events.find(event => event.type === 'verification_completed') as
      | { passed?: boolean }
      | undefined
    expect(changed?.files).toContain('runtime-output.txt')
    expect(verification?.passed).toBe(false)
  })

  it('detects agent changes even when the agent commits them', async () => {
    const { runId } = await startRun(repo)
    fs.writeFileSync(path.join(repo, 'committed-output.txt'), 'committed by agent\n')
    execFileSync('git', ['add', 'committed-output.txt'], { cwd: repo })
    execFileSync('git', ['commit', '-q', '-m', 'agent change'], { cwd: repo })

    const events = []
    for await (const event of runPromptStream(runId, '/workspace')) {
      events.push(event)
    }
    const changed = events.find(event => event.type === 'changed_files') as
      | { files?: string[] }
      | undefined
    const verification = events.find(event => event.type === 'verification_completed') as
      | { passed?: boolean }
      | undefined
    expect(changed?.files).toContain('committed-output.txt')
    expect(verification?.passed).toBe(false)
  })

  it('records runs and exports a real report built from the transcript', async () => {
    await startRun(repo)
    const runs = await listProjectRuns(repo, 5)
    expect(runs.length).toBeGreaterThan(0)

    const { path: reportPath } = await exportProjectReport(repo)
    expect(fs.existsSync(reportPath)).toBe(true)
    const content = fs.readFileSync(reportPath, 'utf-8')
    expect(content.length).toBeGreaterThan(0)
  })

  it('enforces read-only and network-disabled profiles before tool execution', async () => {
    const readOnly = await startRun(repo, {
      permissions: {
        approvalPolicy: 'never',
        sandboxMode: 'read-only',
        networkAccess: false,
      },
    })
    const write = await executeTool(readOnly.runId, 'Write', {
      path: 'blocked.txt',
      content: 'must not be written',
    }) as { denied?: boolean }
    expect(write.denied).toBe(true)
    expect(fs.existsSync(path.join(repo, 'blocked.txt'))).toBe(false)

    const shellWrite = await executeTool(readOnly.runId, 'Bash', {
      command: 'printf blocked > shell-blocked.txt',
    }) as { denied?: boolean }
    expect(shellWrite.denied).toBe(true)
    expect(fs.existsSync(path.join(repo, 'shell-blocked.txt'))).toBe(false)

    const noNetwork = await startRun(repo, {
      permissions: {
        approvalPolicy: 'never',
        sandboxMode: 'workspace-write',
        networkAccess: false,
      },
    })
    const network = await executeTool(noNetwork.runId, 'Bash', {
      command: 'curl https://example.com',
    }) as { denied?: boolean }
    expect(network.denied).toBe(true)
  })
})
