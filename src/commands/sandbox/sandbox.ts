/**
 * `ur sandbox` command.
 *
 * Surfaces the real sandbox and permission architecture as a core first-class
 * command. Inspect current sandbox support, run dependency checks, and evaluate
 * what approval level a shell command needs (read-only, edit project, safe
 * commands, network, destructive).
 */

import type { LocalCommandCall } from '../../types/command.js'
import { parseArguments } from '../../utils/argumentSubstitution.js'
import { getCwd } from '../../utils/cwd.js'
import { SandboxManager } from '../../utils/sandbox/sandbox-adapter.js'
import {
  evaluateShellSafetyPolicy,
  formatShellSafetyEvaluation,
  loadProjectSafetyPolicy,
  writeProjectSafetyPolicy,
} from '../../services/safety/projectSafety.js'

function usage(): string {
  return [
    'Usage:',
    '  ur sandbox status [--json]',
    '  ur sandbox check',
    '  ur sandbox init',
    '  ur sandbox eval <command> [--json]',
    '',
    'Approval levels (from project safety policy):',
    '  read       inspect files and command output',
    '  write      create, edit, move, or delete files / repo state',
    '  execute    run code, scripts, package managers, build tools',
    '  network    send data to another host, API, or remote service',
    '',
    'Sandbox modes:',
    '  Docker, temporary worktree, and OS sandbox (macOS sandbox-exec / Linux bwrap)',
  ].join('\n')
}

function option(tokens: string[], name: string): string | undefined {
  const index = tokens.indexOf(name)
  return index === -1 ? undefined : tokens[index + 1]
}

function positionals(tokens: string[]): string[] {
  const flagsWithValue = new Set(['--base', '--title', '--body'])
  const values: string[] = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (flagsWithValue.has(token)) {
      i++
      continue
    }
    if (token.startsWith('--')) continue
    values.push(token)
  }
  return values
}

export const call: LocalCommandCall = async (args: string) => {
  const tokens = parseArguments(args)
  const json = tokens.includes('--json')
  const pos = positionals(tokens)
  const action = pos[0] ?? 'status'
  const cwd = getCwd()

  if (action === 'status' || action === 'st') {
    const supported = SandboxManager.isSupportedPlatform()
    const enabled = SandboxManager.isSandboxingEnabled()
    const required = SandboxManager.isSandboxRequired()
    const deps = SandboxManager.checkDependencies()
    const unavailableReason = SandboxManager.getSandboxUnavailableReason()
    const status = {
      supported,
      enabled,
      required,
      dependencies: deps,
      unavailableReason,
      autoAllowIfSandboxed: SandboxManager.isAutoAllowBashIfSandboxedEnabled(),
      allowUnsandboxed: SandboxManager.areUnsandboxedCommandsAllowed(),
    }
    if (json) return { type: 'text', value: JSON.stringify(status, null, 2) }
    const lines = [
      'Sandbox status',
      `  supported:  ${supported}`,
      `  enabled:    ${enabled}`,
      `  required:   ${required}`,
      `  autoAllowIfSandboxed: ${status.autoAllowIfSandboxed}`,
      `  allowUnsandboxed:     ${status.allowUnsandboxed}`,
    ]
    if (deps.errors.length) lines.push(`  dependency errors: ${deps.errors.join(', ')}`)
    if (deps.warnings.length) lines.push(`  dependency warnings: ${deps.warnings.join(', ')}`)
    if (unavailableReason) lines.push(`  unavailable reason: ${unavailableReason}`)
    return { type: 'text', value: lines.join('\n') }
  }

  if (action === 'check') {
    const deps = SandboxManager.checkDependencies()
    const ok = deps.errors.length === 0
    if (json) return { type: 'text', value: JSON.stringify({ ok, ...deps }, null, 2) }
    const lines = ['Sandbox dependency check', ok ? 'OK' : 'Missing dependencies:']
    for (const error of deps.errors) lines.push(`  error: ${error}`)
    for (const warning of deps.warnings) lines.push(`  warning: ${warning}`)
    return { type: 'text', value: lines.join('\n') }
  }

  if (action === 'init') {
    const path = writeProjectSafetyPolicy(cwd)
    return { type: 'text', value: `Wrote default project safety policy to ${path}` }
  }

  if (action === 'eval') {
    const command = pos.slice(1).join(' ')
    if (!command) return { type: 'text', value: usage() }
    const policy = loadProjectSafetyPolicy(cwd)
    const evaluation = evaluateShellSafetyPolicy(command, cwd)
    const level = evaluation.permissions.length ? evaluation.permissions.join('/') : 'read-only'
    const result = {
      command,
      level,
      ...evaluation,
      policy,
    }
    if (json) return { type: 'text', value: JSON.stringify(result, null, 2) }
    return {
      type: 'text',
      value: [
        `Command: ${command}`,
        `Approval level: ${level}`,
        formatShellSafetyEvaluation(evaluation),
      ].join('\n\n'),
    }
  }

  return { type: 'text', value: usage() }
}
