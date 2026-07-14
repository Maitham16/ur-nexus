import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {
  DEFAULT_AGENT_PERMISSION_SETTINGS,
  applyAgentPermissionSettings,
  getAgentPermissionSettings,
  normalizeAgentPermissionSettings,
  setAgentPermissionSettings,
  toRuntimePermissionMode,
} from './permissionSettings.js'

let dataDir: string

beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-desktop-permissions-'))
  process.env.UR_DESKTOP_DATA_DIR = dataDir
})

afterEach(() => {
  delete process.env.UR_DESKTOP_DATA_DIR
  fs.rmSync(dataDir, { recursive: true, force: true })
})

describe('agent permission settings', () => {
  it('uses professional safe defaults', async () => {
    expect(await getAgentPermissionSettings()).toEqual(DEFAULT_AGENT_PERMISSION_SETTINGS)
  })

  it('normalizes invalid renderer input', () => {
    expect(normalizeAgentPermissionSettings({
      approvalPolicy: 'anything',
      sandboxMode: 'root',
      networkAccess: 'yes',
    })).toEqual(DEFAULT_AGENT_PERMISSION_SETTINGS)
  })

  it('persists a validated user profile', async () => {
    const saved = await setAgentPermissionSettings({
      approvalPolicy: 'never',
      sandboxMode: 'workspace-write',
      networkAccess: true,
    })
    expect(await getAgentPermissionSettings()).toEqual(saved)
  })

  it('never lets auto approval override a core denial', () => {
    const result = applyAgentPermissionSettings({
      behavior: 'deny',
      riskLevel: 'critical',
      actionType: 'bash-command',
      target: 'sudo rm -rf /',
      reason: 'Blocked by safety policy.',
    }, {
      approvalPolicy: 'never',
      sandboxMode: 'danger-full-access',
      networkAccess: true,
    })
    expect(result.behavior).toBe('deny')
  })

  it('auto approves prompts but respects disabled network access', () => {
    const base = {
      behavior: 'ask' as const,
      riskLevel: 'medium' as const,
      actionType: 'network-command' as const,
      target: 'curl https://example.com',
      reason: 'Uses network.',
    }
    expect(applyAgentPermissionSettings(base, {
      approvalPolicy: 'never',
      sandboxMode: 'workspace-write',
      networkAccess: false,
    }).behavior).toBe('deny')
    expect(applyAgentPermissionSettings(base, {
      approvalPolicy: 'never',
      sandboxMode: 'workspace-write',
      networkAccess: true,
    }).behavior).toBe('allow')
  })

  it('blocks shell commands in read-only mode', () => {
    const result = applyAgentPermissionSettings({
      behavior: 'ask',
      riskLevel: 'medium',
      actionType: 'bash-command',
      target: 'printf changed > file.txt',
      reason: 'Command changes project state.',
    }, {
      approvalPolicy: 'never',
      sandboxMode: 'read-only',
      networkAccess: false,
    })
    expect(result.behavior).toBe('deny')
  })

  it('maps profiles into the vendored runtime permission modes', () => {
    expect(toRuntimePermissionMode({
      approvalPolicy: 'on-request',
      sandboxMode: 'workspace-write',
      networkAccess: false,
    })).toBe('acceptEdits')
    expect(toRuntimePermissionMode({
      approvalPolicy: 'never',
      sandboxMode: 'danger-full-access',
      networkAccess: true,
    })).toBe('bypassPermissions')
  })
})
