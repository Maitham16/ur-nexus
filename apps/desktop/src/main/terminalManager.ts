import * as path from 'node:path'
import { createShellRunner, ShellCommand } from './shellRunner.js'
import { resolveWorktreePath } from './worktreeManager.js'
import { emitToRenderer, findRunByWorktree } from './runtime.js'

export interface TerminalSession {
  projectRoot: string
  worktreeRoot?: string
  runner: ReturnType<typeof createShellRunner>
}

const sessions = new Map<string, TerminalSession>()

function getOrCreateSession(
  projectRoot: string,
  worktreeRoot?: string,
): TerminalSession {
  const key = `${projectRoot}|${worktreeRoot ?? ''}`
  if (!sessions.has(key)) {
    const session: TerminalSession = {
      projectRoot,
      worktreeRoot,
      runner: createShellRunner({
        cwd: resolveWorktreePath(projectRoot, worktreeRoot, '.'),
        onData: (id, data) => {
          emitToRenderer(projectRoot, {
            type: 'command_output',
            commandId: id,
            output: data,
            sessionId: '',
            runId: '',
            projectRoot,
            timestamp: Date.now(),
          } as import('../shared/ipc.js').RuntimeEvent)
        },
        onExit: (id, command) => {
          emitToRenderer(projectRoot, {
            type: 'command_finished',
            commandId: id,
            exitCode: command.exitCode ?? 0,
            output: command.stdout,
            sessionId: '',
            runId: '',
            projectRoot,
            timestamp: Date.now(),
          } as import('../shared/ipc.js').RuntimeEvent)
        },
      }),
    }
    sessions.set(key, session)
  }
  return sessions.get(key)!
}

const packageManagers = new Set([
  'npm',
  'yarn',
  'pnpm',
  'bun',
  'pip',
  'pip3',
  'gem',
  'bundle',
])

const destructivePatterns = [
  /\brm\s+-rf?\b/,
  /\bdd\s+if=/,
  /\bmkfs\./,
  /\bfdisk\b/,
  /\bdiskutil\b/,
  /\bsudo\b/,
  /\bchmod\s+777\b/,
  /\bchown\s+-R\b/,
  /\b>\s*[~/]/,
]

function isPackageInstall(command: string): boolean {
  const first = command.trim().split(/\s+/)[0]
  const base = first.replace(/\.exe$/i, '')
  if (packageManagers.has(base)) return true
  if (/\b(install|add|i)\b/i.test(command) && packageManagers.has(base)) return true
  return false
}

function isDestructive(command: string): boolean {
  return destructivePatterns.some(p => p.test(command))
}

function isNetworkCommand(command: string): boolean {
  return /\b(curl|wget|fetch|http|https|ftp|ssh|scp|rsync)\b/i.test(command)
}

function isOutsideWorkspace(command: string, cwd: string): boolean {
  const explicitPath = command.match(/(?:cd\s+|\s)([~\/][^\s]+)/)
  if (!explicitPath) return false
  const target = path.resolve(cwd, explicitPath[1].replace(/^~/, process.env.HOME || '/'))
  const relative = path.relative(cwd, target)
  return relative.startsWith('..') || path.isAbsolute(relative)
}

export function classifyCommand(command: string, cwd: string) {
  return {
    packageInstall: isPackageInstall(command),
    destructive: isDestructive(command),
    network: isNetworkCommand(command),
    outsideWorkspace: isOutsideWorkspace(command, cwd),
  }
}

export async function runTerminalCommand(
  projectRoot: string,
  command: string,
  options?: { worktreeRoot?: string; skipApproval?: boolean },
): Promise<{ commandId: string; status: string; requiresApproval?: boolean }> {
  const session = getOrCreateSession(projectRoot, options?.worktreeRoot)
  const cwd = session.runner.list()[0]?.cwd ?? resolveWorktreePath(projectRoot, options?.worktreeRoot, '.')

  const classification = classifyCommand(command, cwd)
  const risky =
    classification.packageInstall ||
    classification.destructive ||
    classification.network ||
    classification.outsideWorkspace

  if (!options?.skipApproval && risky) {
    return {
      commandId: '',
      status: 'pending_approval',
      requiresApproval: true,
    }
  }

  // Map the run to emit proper run-scoped events when possible.
  const run = findRunByWorktree(projectRoot, options?.worktreeRoot)
  if (run) {
    emitToRenderer(projectRoot, {
      ...makeRunEvent(run, { type: 'command_started', command }),
    })
  }

  const result = await session.runner.run(command)

  if (run) {
    emitToRenderer(projectRoot, {
      ...makeRunEvent(run, {
        type: 'command_finished',
        commandId: result.id,
        exitCode: result.exitCode ?? 0,
        output: result.stdout,
      }),
    })
  }

  return {
    commandId: result.id,
    status: result.status,
  }
}

export function stopTerminalCommand(
  projectRoot: string,
  commandId: string,
  worktreeRoot?: string,
): boolean {
  const session = getOrCreateSession(projectRoot, worktreeRoot)
  return session.runner.stop(commandId)
}

export function listTerminalCommands(
  projectRoot: string,
  worktreeRoot?: string,
): ShellCommand[] {
  const session = getOrCreateSession(projectRoot, worktreeRoot)
  return session.runner.list()
}

export function getTerminalCommand(
  projectRoot: string,
  commandId: string,
  worktreeRoot?: string,
): ShellCommand | undefined {
  const session = getOrCreateSession(projectRoot, worktreeRoot)
  return session.runner.get(commandId)
}

function makeRunEvent(
  run: { runId: string; session: { sessionId: string }; projectRoot: string },
  payload: Record<string, unknown> & { type: string },
) {
  return {
    ...payload,
    type: payload.type,
    runId: run.runId,
    sessionId: run.session.sessionId,
    projectRoot: run.projectRoot,
    timestamp: Date.now(),
  }
}
