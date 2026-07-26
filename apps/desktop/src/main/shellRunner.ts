import { randomUUID } from 'node:crypto'
import { constants as osConstants } from 'node:os'

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

const running = new Map<string, () => void>()
const commands = new Map<string, ShellCommand>()

const shell = process.platform === 'win32' ? 'powershell.exe' : process.env.SHELL || '/bin/bash'

function childSignalExitCode(signal: NodeJS.Signals | null): number {
  if (!signal) return 0
  const signalNumber = (osConstants.signals as Record<string, number>)[signal]
  return signalNumber ? 128 + signalNumber : 1
}

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
      const args =
        process.platform === 'win32'
          ? ['-Command', command]
          : ['-c', command]
      const environment = Object.fromEntries(
        Object.entries(process.env).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string',
        ),
      )
      let stopRequested = false

      const runWithoutPty = (): void => {
        const { spawn } = require('node:child_process') as typeof import('node:child_process')
        let settled = false
        const finish = (exitCode: number, error?: string): void => {
          if (settled) return
          settled = true
          running.delete(id)
          record.endTime = Date.now()
          record.durationMs = record.endTime - startTime
          record.exitCode = exitCode
          record.status = stopRequested ? 'stopped' : exitCode === 0 ? 'done' : 'error'
          if (error) {
            record.stderr += error
            opts.onData?.(id, error)
          }
          opts.onExit?.(id, record)
          resolve(record)
        }
        try {
          const child = spawn(shell, args, {
            cwd: opts.cwd,
            env: environment,
            stdio: ['ignore', 'pipe', 'pipe'],
          })
          running.set(id, () => {
            stopRequested = true
            child.kill('SIGTERM')
          })
          child.stdout?.on('data', chunk => {
            const data = chunk.toString()
            record.stdout += data
            opts.onData?.(id, data)
          })
          child.stderr?.on('data', chunk => {
            const data = chunk.toString()
            record.stderr += data
            opts.onData?.(id, data)
          })
          child.once('error', error => finish(1, error.message))
          child.once('close', (code, signal) => {
            finish(code ?? childSignalExitCode(signal))
          })
        } catch (error) {
          finish(1, error instanceof Error ? error.message : String(error))
        }
      }

      // Bun 1.3.x can close node-pty's caller-owned master fd on Linux,
      // delivering SIGHUP before output and the real shell status are read.
      // This runner is non-interactive, so Bun uses the reliable child-process
      // path; packaged Electron/Node builds retain PTY behavior.
      if (process.versions.bun) {
        runWithoutPty()
        return
      }

      let ptyProcess: import('node-pty').IPty
      try {
        ptyProcess = getPty().spawn(shell, args, {
          name: 'xterm-color',
          cols: 120,
          rows: 30,
          cwd: opts.cwd,
          env: environment,
        })
      } catch {
        runWithoutPty()
        return
      }

      running.set(id, () => {
        stopRequested = true
        ptyProcess.kill('SIGTERM')
      })

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
        record.exitCode = signal ? 128 + signal : (exitCode ?? 0)
        record.status = stopRequested ? 'stopped' : record.exitCode === 0 ? 'done' : 'error'
        opts.onExit?.(id, record)
        resolve(record)
      })
    })
  }

  function stop(id: string): boolean {
    const stopProcess = running.get(id)
    if (!stopProcess) return false
    try {
      stopProcess()
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
