import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import type {
  AgentApprovalPolicy,
  AgentPermissionSettingsDto,
  AgentSandboxMode,
} from '../shared/ipc.js'
import type { SafetyEvaluation } from './safety/safetyService.js'
import { getAppDataPath } from './utils/appDataPath.js'

export const DEFAULT_AGENT_PERMISSION_SETTINGS: AgentPermissionSettingsDto = {
  approvalPolicy: 'on-request',
  sandboxMode: 'workspace-write',
  networkAccess: false,
}

const APPROVAL_POLICIES = new Set<AgentApprovalPolicy>([
  'untrusted',
  'on-request',
  'never',
])

const SANDBOX_MODES = new Set<AgentSandboxMode>([
  'read-only',
  'workspace-write',
  'danger-full-access',
])

const WRITE_ACTIONS = new Set([
  'bash-command',
  'file-write',
  'file-delete',
  'network-command',
  'package-install',
  'git-push',
  'external-app',
])

async function settingsPath(): Promise<string> {
  return path.join(await getAppDataPath(), 'desktop', 'agent-permissions.json')
}

export function normalizeAgentPermissionSettings(
  value: unknown,
): AgentPermissionSettingsDto {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...DEFAULT_AGENT_PERMISSION_SETTINGS }
  }
  const candidate = value as Partial<AgentPermissionSettingsDto>
  return {
    approvalPolicy: APPROVAL_POLICIES.has(candidate.approvalPolicy as AgentApprovalPolicy)
      ? candidate.approvalPolicy as AgentApprovalPolicy
      : DEFAULT_AGENT_PERMISSION_SETTINGS.approvalPolicy,
    sandboxMode: SANDBOX_MODES.has(candidate.sandboxMode as AgentSandboxMode)
      ? candidate.sandboxMode as AgentSandboxMode
      : DEFAULT_AGENT_PERMISSION_SETTINGS.sandboxMode,
    networkAccess: candidate.networkAccess === true,
  }
}

export async function getAgentPermissionSettings(): Promise<AgentPermissionSettingsDto> {
  try {
    const raw = await fs.readFile(await settingsPath(), 'utf-8')
    return normalizeAgentPermissionSettings(JSON.parse(raw))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(
        `[permissions] Could not read settings: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
    return { ...DEFAULT_AGENT_PERMISSION_SETTINGS }
  }
}

export async function setAgentPermissionSettings(
  value: unknown,
): Promise<AgentPermissionSettingsDto> {
  const normalized = normalizeAgentPermissionSettings(value)
  const file = await settingsPath()
  const temp = `${file}.tmp`
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(temp, `${JSON.stringify(normalized, null, 2)}\n`, {
    encoding: 'utf-8',
    mode: 0o600,
  })
  await fs.rename(temp, file)
  return normalized
}

/**
 * Applies the user-facing permission profile after the core safety engine has
 * classified an action. Core denials remain denials in every mode.
 */
export function applyAgentPermissionSettings(
  evaluation: SafetyEvaluation,
  settings: AgentPermissionSettingsDto,
): SafetyEvaluation {
  if (evaluation.behavior === 'deny') return evaluation

  if (!settings.networkAccess && evaluation.actionType === 'network-command') {
    return {
      ...evaluation,
      behavior: 'deny',
      riskLevel: 'high',
      reason: 'Network access is disabled for this agent session.',
    }
  }

  const mutatesState =
    WRITE_ACTIONS.has(evaluation.actionType) ||
    (evaluation.actionType === 'builtin-tool' && evaluation.behavior === 'ask') ||
    (evaluation.actionType === 'mcp-tool' && evaluation.riskLevel !== 'none') ||
    evaluation.actionType === 'long-running'

  if (settings.sandboxMode === 'read-only' && mutatesState) {
    return {
      ...evaluation,
      behavior: 'deny',
      reason: 'This session is read-only. Switch workspace access to enable changes.',
    }
  }

  if (settings.approvalPolicy === 'untrusted' && mutatesState) {
    return {
      ...evaluation,
      behavior: 'ask',
      reason: evaluation.behavior === 'allow'
        ? 'Ask-every-time mode requires confirmation for this change.'
        : evaluation.reason,
    }
  }

  if (settings.approvalPolicy === 'never' && evaluation.behavior === 'ask') {
    return {
      ...evaluation,
      behavior: 'allow',
      reason: `Auto-approved by the active permission profile. ${evaluation.reason}`,
    }
  }

  return evaluation
}

export function toRuntimePermissionMode(
  settings: AgentPermissionSettingsDto,
): 'default' | 'plan' | 'acceptEdits' | 'autoApprove' | 'bypassPermissions' {
  if (settings.sandboxMode === 'read-only') return 'plan'
  if (settings.approvalPolicy === 'untrusted') return 'default'
  if (settings.approvalPolicy === 'on-request') return 'acceptEdits'
  return settings.sandboxMode === 'danger-full-access'
    ? 'bypassPermissions'
    : 'autoApprove'
}
