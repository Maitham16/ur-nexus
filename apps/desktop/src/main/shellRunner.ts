import { randomUUID } from 'node:crypto'

export interface ShellCommand {
  id: string
  command: string
  cwd: string
  startTime: number
  endTime?: number
  durationMs?: number
  exitCode?: number
  stdout: string
  stderr: string
  status: 'running' | 'done' | 'error' | 'stopped'
}

export interface ShellRunnerOptions {
  cwd: string
  onData?: (id: string, data: string) => void
  onExit?: (id: string, command: ShellCommand) => void
}

let ptyModule: typeof import('node-pty') | undefined
function getPty(): typeof import('node-pty') {
  if (!ptyModule) {
    ptyModule = require('node-pty')
  }
  return ptyModule as typeof import('node-pty')
}

const running = new Map<string, import('node-pty').IPty>()
const commands = new Map<string, ShellCommand>()

const shell = process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash'

export function createShellRunner(opts: ShellRunnerOptions) {
  function run(command: string): Promise<ShellCommand> {
    return new Promise(resolve => {
      const id = randomUUID()
      const startTime = Date.now()
      const record: ShellCommand = {
        id,
        command,
        cwd: opts.cwd,
        startTime,
        stdout: '',
        stderr: '',
        status: 'running',
      }
      commands.set(id, record)

      // On Unix we pass the command as the single argument to bash -c.
      // On Windows we pass it as the single argument to powershell.
      const args = process.platform === 'win32' ? ['-Command', command] : [command]

      let ptyProcess: import('node-pty').IPty
      try {
        ptyProcess = getPty().spawn(shell, args, {
          name: 'xterm-color',
          cols: 120,
          rows: 30,
          cwd: opts.cwd,
          env: process.env as { [key: string]: string | undefined },
        })
      } catch (err) {
        record.status = 'error'
        record.endTime = Date.now()
        record.durationMs = record.endTime - startTime
        record.stdout = err instanceof Error ? err.message : String(err)
        opts.onExit?.(id, record)
        return resolve(record)
      }

      running.set(id, ptyProcess)

      const dataHandler = ptyProcess.onData((data: string) => {
        record.stdout += data
        opts.onData?.(id, data)
      })

      const exitHandler = ptyProcess.onExit(({ exitCode, signal }) => {
        dataHandler.dispose()
        exitHandler.dispose()
        running.delete(id)
        const endTime = Date.now()
        record.endTime = endTime
        record.durationMs = endTime - startTime
        record.exitCode = signal !== undefined ? 128 + signal : (exitCode ?? 0)
        record.status = record.exitCode === 0 ? 'done' : 'error'
        opts.onExit?.(id, record)
      })

      // Safety net: resolve the promise when process exits.
      ptyProcess.onExit(() => resolve(record))
    })
  }

  function stop(id: string): boolean {
    const proc = running.get(id)
    if (!proc) return false
    try {
      proc.kill('SIGTERM')
      return true
    } catch {
      return false
    }
  }

  function get(id: string): ShellCommand | undefined {
    return commands.get(id)
  }

  function list(): ShellCommand[] {
    return [...commands.values()].sort((a, b) => b.startTime - a.startTime)
  }

  return { run, stop, get, list }
}

export type ShellRunner = ReturnType<typeof createShellRunner>
