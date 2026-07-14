import * as path from 'node:path'
import { homedir } from 'node:os'
import { realpathSync } from 'node:fs'
import {
  evaluateShellSafetyPolicy,
  loadProjectSafetyPolicy,
  pathIsInsideWorkspace,
  type ProjectSafetyPolicy,
  type ShellSafetyEvaluation,
  checkPathSafetyForAutoEdit,
  DANGEROUS_FILES,
} from '@ur/agent-runtime'

export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical'

export type ActionType =
  | 'mcp-tool'
  | 'builtin-tool'
  | 'bash-command'
  | 'file-write'
  | 'file-delete'
  | 'file-read-sensitive'
  | 'file-read-outside-project'
  | 'network-command'
  | 'package-install'
  | 'git-push'
  | 'external-app'
  | 'long-running'

export interface SafetyEvaluation {
  behavior: 'allow' | 'ask' | 'deny'
  riskLevel: RiskLevel
  actionType: ActionType
  target: string
  reason: string
  message?: string
  policy?: ProjectSafetyPolicy
}

export interface RunContext {
  runId: string
  projectRoot: string
  worktreeRoot?: string
  additionalDirectories?: string[]
}

const READONLY_BUILTIN_TOOLS = new Set([
  'Read',
  'Glob',
  'Grep',
  'FileReadTool',
  'GetSystemContext',
  'GetUserContext',
  'GetGitStatus',
])

const SIDE_EFFECT_BUILTIN_TOOLS = new Set([
  'Write',
  'Edit',
  'ApplyPatch',
  'Bash',
  'Docker',
  'GitHub',
  'Api',
  'EnterWorktree',
  'ExitWorktree',
  'TaskCreate',
  'TaskUpdate',
  'TaskList',
])

const READONLY_MCP_TOOL_PATTERNS = [
  /^list/i,
  /^read/i,
  /^search/i,
  /^get/i,
  /^find/i,
  /^describe/i,
]

const DESTRUCTIVE_MCP_TOOL_PATTERNS = [
  /^(write|create|delete|remove|drop|insert|update|modify|patch|run|exec|shell|execute|deploy|publish|send|post|put|patch)\b/i,
]

const LONG_RUNNING_SECONDS = 300

const MACOS_SENSITIVE_DIRS = [
  path.join(homedir(), 'Desktop'),
  path.join(homedir(), 'Documents'),
  path.join(homedir(), 'Downloads'),
  path.join(homedir(), '.ssh'),
  path.join(homedir(), '.gnupg'),
  path.join(homedir(), 'Library'),
  path.join(homedir(), '.ur', 'settings.local.json'),
]

function resolveCwd(ctx: RunContext): string {
  const raw = ctx.worktreeRoot && ctx.worktreeRoot !== ctx.projectRoot
    ? ctx.worktreeRoot
    : ctx.projectRoot
  try {
    return realpathSync(raw)
  } catch {
    return raw
  }
}

function isMacOSSensitivePath(absolutePath: string): { sensitive: boolean; reason?: string } {
  const normalized = path.normalize(absolutePath)
  const home = homedir()

  // macOS Keychain access patterns
  if (/\b(keychain|security\s+find-generic-password|security\s+add-generic-password)\b/i.test(normalized)) {
    return { sensitive: true, reason: 'Accessing macOS Keychain requires approval.' }
  }

  // External drives: not under home and not a typical system temp
  const isExternalDrive =
    !normalized.startsWith(home) &&
    !normalized.startsWith('/tmp') &&
    !normalized.startsWith('/private/tmp') &&
    !normalized.startsWith('/var/folders') &&
    !normalized.startsWith('/private/var/folders')

  for (const sensitive of MACOS_SENSITIVE_DIRS) {
    if (normalized === sensitive || normalized.startsWith(sensitive + path.sep)) {
      return { sensitive: true, reason: `Path touches macOS-sensitive location: ${path.basename(sensitive)}.` }
    }
  }

  if (isExternalDrive) {
    return { sensitive: true, reason: 'Path is on an external drive outside the opened project.' }
  }

  return { sensitive: false }
}

function riskLevelFromEvaluation(evaluation: ShellSafetyEvaluation): RiskLevel {
  if (evaluation.behavior === 'deny') return 'critical'
  if (evaluation.approvalLevel === 'destructive-commands') return 'high'
  if (evaluation.permissions.includes('network')) return 'medium'
  if (evaluation.permissions.includes('execute')) return 'medium'
  if (evaluation.permissions.includes('write')) return 'medium'
  return 'low'
}

function actionTypeFromEvaluation(
  evaluation: ShellSafetyEvaluation,
  command: string,
): ActionType {
  if (evaluation.permissions.includes('network')) return 'network-command'
  const lower = command.toLowerCase()
  if (/\b(npm|pnpm|yarn|bun|pip|pip3|cargo|go)\s+(install|add|get)\b/.test(lower)) {
    return 'package-install'
  }
  if (/\bgit\s+push\b/.test(lower)) return 'git-push'
  if (evaluation.approvalLevel === 'destructive-commands') return 'bash-command'
  return 'bash-command'
}

export async function evaluateToolUse(
  ctx: RunContext,
  tool: { name: string; isMcp?: boolean; isReadOnly?: (input?: unknown) => boolean; isDestructive?: (input?: unknown) => boolean },
  input: Record<string, unknown>,
): Promise<SafetyEvaluation> {
  const isReadOnly = tool.isReadOnly?.(input) ?? false
  if (isReadOnly) {
    return {
      behavior: 'allow',
      riskLevel: 'none',
      actionType: tool.isMcp ? 'mcp-tool' : 'builtin-tool',
      target: tool.name,
      reason: 'Tool is read-only.',
    }
  }

  if (tool.isMcp) {
    const destructive = tool.isDestructive?.(input) ?? false
    return {
      behavior: 'ask',
      riskLevel: destructive ? 'high' : 'medium',
      actionType: 'mcp-tool',
      target: tool.name,
      reason: destructive
        ? 'MCP tool is marked destructive by the server.'
        : 'MCP tool may have side effects.',
    }
  }

  if (READONLY_BUILTIN_TOOLS.has(tool.name)) {
    return {
      behavior: 'allow',
      riskLevel: 'none',
      actionType: 'builtin-tool',
      target: tool.name,
      reason: 'Tool is on the read-only allowlist.',
    }
  }

  if (tool.name === 'Bash') {
    const command = String(input.command ?? '')
    return evaluateShellCommand(ctx, command)
  }

  if (SIDE_EFFECT_BUILTIN_TOOLS.has(tool.name)) {
    return {
      behavior: 'ask',
      riskLevel: 'medium',
      actionType: 'builtin-tool',
      target: tool.name,
      reason: `Built-in tool ${tool.name} can modify project state.`,
    }
  }

  return {
    behavior: 'ask',
    riskLevel: 'low',
    actionType: 'builtin-tool',
    target: tool.name,
    reason: `Tool ${tool.name} has not been classified as read-only.`,
  }
}

export function evaluateShellCommand(
  ctx: RunContext,
  command: string,
): SafetyEvaluation {
  const cwd = resolveCwd(ctx)
  const evaluation = evaluateShellSafetyPolicy(command, cwd)
  const policy = loadProjectSafetyPolicy(cwd)

  if (evaluation.behavior === 'deny') {
    return {
      behavior: 'deny',
      riskLevel: 'critical',
      actionType: actionTypeFromEvaluation(evaluation, command),
      target: command,
      reason: evaluation.reasons.join('; ') || 'Blocked by project safety policy.',
      policy,
    }
  }

  if (evaluation.behavior === 'ask' || evaluation.approvalLevel !== 'read-only') {
    return {
      behavior: 'ask',
      riskLevel: riskLevelFromEvaluation(evaluation),
      actionType: actionTypeFromEvaluation(evaluation, command),
      target: command,
      reason: evaluation.reasons.join('; ') || 'Command may affect project state.',
      policy,
    }
  }

  return {
    behavior: 'allow',
    riskLevel: 'none',
    actionType: 'bash-command',
    target: command,
    reason: 'Command is classified as read-only.',
    policy,
  }
}

export function evaluateFileWrite(
  ctx: RunContext,
  filePath: string,
): SafetyEvaluation {
  const cwd = resolveCwd(ctx)
  const policy = loadProjectSafetyPolicy(cwd)
  const absolute = path.resolve(cwd, filePath)

  const sensitive = isMacOSSensitivePath(absolute)
  if (sensitive.sensitive) {
    return {
      behavior: 'deny',
      riskLevel: 'critical',
      actionType: 'file-write',
      target: filePath,
      reason: sensitive.reason!,
      policy,
    }
  }

  const safety = checkPathSafetyForAutoEdit(absolute)
  if (!safety.safe) {
    return {
      behavior: 'deny',
      riskLevel: 'high',
      actionType: 'file-write',
      target: filePath,
      reason: safety.message,
      policy,
    }
  }

  if (!pathIsInsideWorkspace(absolute, cwd)) {
    return {
      behavior: 'deny',
      riskLevel: 'critical',
      actionType: 'file-write',
      target: filePath,
      reason: 'Writing outside the workspace is not allowed.',
      policy,
    }
  }

  return {
    behavior: 'allow',
    riskLevel: 'none',
    actionType: 'file-write',
    target: filePath,
    reason: 'Write target is inside the workspace and passes safety checks.',
    policy,
  }
}

export function evaluateFileDelete(
  ctx: RunContext,
  filePath: string,
): SafetyEvaluation {
  const cwd = resolveCwd(ctx)
  const policy = loadProjectSafetyPolicy(cwd)
  const absolute = path.resolve(cwd, filePath)

  const sensitive = isMacOSSensitivePath(absolute)
  if (sensitive.sensitive) {
    return {
      behavior: 'deny',
      riskLevel: 'critical',
      actionType: 'file-delete',
      target: filePath,
      reason: sensitive.reason!,
      policy,
    }
  }

  if (!pathIsInsideWorkspace(absolute, cwd)) {
    return {
      behavior: 'deny',
      riskLevel: 'critical',
      actionType: 'file-delete',
      target: filePath,
      reason: 'Deleting files outside the workspace is not allowed.',
      policy,
    }
  }

  return {
    behavior: 'ask',
    riskLevel: 'high',
    actionType: 'file-delete',
    target: filePath,
    reason: 'File deletion requires explicit approval.',
    policy,
  }
}

function pathIsInsideAny(absolutePath: string, roots: string[]): boolean {
  for (const root of roots) {
    if (pathIsInsideWorkspace(absolutePath, root)) {
      return true
    }
  }
  return false
}

export function evaluateFileRead(
  ctx: RunContext,
  filePath: string,
): SafetyEvaluation {
  const cwd = resolveCwd(ctx)
  const policy = loadProjectSafetyPolicy(cwd)
  const absolute = path.resolve(cwd, filePath)

  const sensitive = isMacOSSensitivePath(absolute)
  if (sensitive.sensitive) {
    return {
      behavior: 'ask',
      riskLevel: 'high',
      actionType: 'file-read-sensitive',
      target: filePath,
      reason: sensitive.reason!,
      policy,
    }
  }

  for (const secret of policy.secretFiles) {
    if (absolute.endsWith(path.sep + secret) || absolute.endsWith('/' + secret)) {
      return {
        behavior: 'ask',
        riskLevel: 'high',
        actionType: 'file-read-sensitive',
        target: filePath,
        reason: `Reading ${secret} may expose secrets.`,
        policy,
      }
    }
  }

  const safety = checkPathSafetyForAutoEdit(absolute)
  if (!safety.safe) {
    return {
      behavior: 'ask',
      riskLevel: 'medium',
      actionType: 'file-read-sensitive',
      target: filePath,
      reason: safety.message,
      policy,
    }
  }

  const approvedRoots = [cwd]
  if (ctx.additionalDirectories) {
    approvedRoots.push(...ctx.additionalDirectories)
  }
  if (!pathIsInsideAny(absolute, approvedRoots)) {
    return {
      behavior: 'ask',
      riskLevel: 'medium',
      actionType: 'file-read-outside-project',
      target: filePath,
      reason: 'Reading outside the project/worktree requires approval.',
      policy,
    }
  }

  return {
    behavior: 'allow',
    riskLevel: 'none',
    actionType: 'builtin-tool',
    target: filePath,
    reason: 'File read is not sensitive.',
    policy,
  }
}

export function evaluateConnectorToolUse(
  projectRoot: string,
  serverName: string,
  toolName: string,
  _input: Record<string, unknown>,
): SafetyEvaluation {
  const policy = loadProjectSafetyPolicy(projectRoot)
  const target = `${serverName}/${toolName}`

  if (READONLY_MCP_TOOL_PATTERNS.some(re => re.test(toolName))) {
    return {
      behavior: 'allow',
      riskLevel: 'none',
      actionType: 'mcp-tool',
      target,
      reason: 'MCP tool appears read-only.',
      policy,
    }
  }

  if (DESTRUCTIVE_MCP_TOOL_PATTERNS.some(re => re.test(toolName))) {
    return {
      behavior: 'ask',
      riskLevel: 'high',
      actionType: 'mcp-tool',
      target,
      reason: 'MCP tool name suggests destructive or side-effecting behavior.',
      policy,
    }
  }

  return {
    behavior: 'ask',
    riskLevel: 'medium',
    actionType: 'mcp-tool',
    target,
    reason: 'MCP tool may have side effects.',
    policy,
  }
}

export function evaluateLongRunningCommand(
  ctx: RunContext,
  command: string,
  expectedSeconds?: number,
): SafetyEvaluation {
  const evaluation = evaluateShellCommand(ctx, command)
  if (evaluation.behavior !== 'allow') {
    return evaluation
  }
  if (expectedSeconds && expectedSeconds > LONG_RUNNING_SECONDS) {
    return {
      behavior: 'ask',
      riskLevel: 'medium',
      actionType: 'long-running',
      target: command,
      reason: `Command is expected to run longer than ${LONG_RUNNING_SECONDS} seconds.`,
    }
  }
  return evaluation
}

export function evaluateExternalAppOpen(urlOrPath: string): SafetyEvaluation {
  const suspicious =
    /\b(keychain|password|secret|token)\b/i.test(urlOrPath) ||
    /\b(open\s+)?\/?(System|System Preferences|Security)\b/i.test(urlOrPath)
  return {
    behavior: 'ask',
    riskLevel: suspicious ? 'high' : 'medium',
    actionType: 'external-app',
    target: urlOrPath,
    reason: suspicious
      ? 'Opening an external app or URL that may access credentials or system settings requires approval.'
      : 'Opening an external app or URL requires approval.',
  }
}

export function evaluateProviderKeyReplacement(providerId: string): SafetyEvaluation {
  return {
    behavior: 'ask',
    riskLevel: 'high',
    actionType: 'builtin-tool',
    target: `provider:${providerId}`,
    reason: 'Replacing a provider API key affects how the agent accesses model APIs.',
  }
}

export { type ProjectSafetyPolicy, DANGEROUS_FILES }
