import { describe, it, expect, beforeEach } from 'bun:test'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import {
  evaluateShellCommand,
  evaluateFileRead,
  evaluateFileWrite,
  evaluateFileDelete,
  evaluateExternalAppOpen,
  evaluateProviderKeyReplacement,
  evaluateLongRunningCommand,
  evaluateConnectorToolUse,
} from './safetyService.js'


const projectCtx = (projectRoot: string) => ({
  runId: 'run-1',
  projectRoot,
})

describe('evaluateShellCommand', () => {
  let tmp: string

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-desktop-safety-'))
  })

  it('asks for destructive rm commands', () => {
    const result = evaluateShellCommand(projectCtx(tmp), 'rm -rf node_modules')
    expect(result.behavior).toBe('ask')
    expect(result.riskLevel).toBeOneOf(['high', 'critical'])
  })

  it('classifies package installs as package-install', () => {
    const result = evaluateShellCommand(projectCtx(tmp), 'npm install')
    expect(result.behavior).toBe('ask')
    expect(result.actionType).toBe('package-install')
  })

  it('classifies git push as git-push', () => {
    const result = evaluateShellCommand(projectCtx(tmp), 'git push origin main')
    expect(result.behavior).toBe('ask')
    expect(result.actionType).toBe('git-push')
  })

  it('classifies curl as network-command', () => {
    const result = evaluateShellCommand(projectCtx(tmp), 'curl https://example.com')
    expect(result.behavior).toBe('ask')
    expect(result.actionType).toBe('network-command')
  })

  it('denies sudo', () => {
    const result = evaluateShellCommand(projectCtx(tmp), 'sudo rm -rf /')
    expect(result.behavior).toBe('deny')
    expect(result.riskLevel).toBe('critical')
  })
})

describe('evaluateFileWrite', () => {
  let tmp: string

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-desktop-safety-'))
  })

  it('allows writes inside workspace', () => {
    const result = evaluateFileWrite(projectCtx(tmp), 'src/foo.ts')
    expect(result.behavior).toBe('allow')
  })

  it('denies writes outside workspace', () => {
    const result = evaluateFileWrite(projectCtx(tmp), '/etc/passwd')
    expect(result.behavior).toBe('deny')
    expect(result.riskLevel).toBe('critical')
  })

  it('denies writes to macOS Desktop', () => {
    const result = evaluateFileWrite(projectCtx(tmp), path.join(os.homedir(), 'Desktop', 'file.txt'))
    expect(result.behavior).toBe('deny')
    expect(result.riskLevel).toBe('critical')
  })
})

describe('evaluateFileDelete', () => {
  let tmp: string

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-desktop-safety-'))
  })

  it('asks for deletes inside workspace', () => {
    const result = evaluateFileDelete(projectCtx(tmp), 'src/foo.ts')
    expect(result.behavior).toBe('ask')
    expect(result.riskLevel).toBe('high')
  })

  it('denies deletes outside workspace', () => {
    const result = evaluateFileDelete(projectCtx(tmp), '/etc/passwd')
    expect(result.behavior).toBe('deny')
    expect(result.riskLevel).toBe('critical')
  })
})

describe('evaluateFileRead', () => {
  let tmp: string

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-desktop-safety-'))
  })

  it('allows reads inside workspace', () => {
    const result = evaluateFileRead(projectCtx(tmp), 'README.md')
    expect(result.behavior).toBe('allow')
  })

  it('asks for reads outside workspace', () => {
    const result = evaluateFileRead(projectCtx(tmp), '/etc/hosts')
    expect(result.behavior).toBe('ask')
    expect(result.actionType).toBe('file-read-sensitive')
  })

  it('allows reads outside workspace when in additionalDirectories', () => {
    const extra = fs.realpathSync(fs.mkdtempSync('/tmp/ur-desktop-allowed-'))
    fs.mkdirSync(extra, { recursive: true })
    const result = evaluateFileRead(
      { ...projectCtx(tmp), additionalDirectories: [extra] },
      path.join(extra, 'config.json'),
    )
    expect(result.behavior).toBe('allow')
  })

  it('asks for sensitive macOS paths', () => {
    const result = evaluateFileRead(projectCtx(tmp), path.join(os.homedir(), '.ssh', 'id_rsa'))
    expect(result.behavior).toBe('ask')
    expect(result.actionType).toBe('file-read-sensitive')
  })
})

describe('evaluateExternalAppOpen', () => {
  it('asks for normal URLs', () => {
    const result = evaluateExternalAppOpen('https://example.com')
    expect(result.behavior).toBe('ask')
  })

  it('high risk for keychain-related URLs', () => {
    const result = evaluateExternalAppOpen('https://password.example.com')
    expect(result.behavior).toBe('ask')
    expect(result.riskLevel).toBe('high')
  })
})

describe('evaluateProviderKeyReplacement', () => {
  it('always asks with high risk', () => {
    const result = evaluateProviderKeyReplacement('openai-api')
    expect(result.behavior).toBe('ask')
    expect(result.riskLevel).toBe('high')
    expect(result.target).toBe('provider:openai-api')
  })
})

describe('evaluateLongRunningCommand', () => {
  let tmp: string

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-desktop-safety-'))
  })

  it('asks when expectedSeconds exceeds threshold', () => {
    const result = evaluateLongRunningCommand(projectCtx(tmp), 'sleep 1', 400)
    expect(result.behavior).toBe('ask')
    expect(result.actionType).toBe('bash-command')
    expect(result.reason).toContain('sandbox recommended')
  })

  it('allows short commands', () => {
    const result = evaluateLongRunningCommand(projectCtx(tmp), 'ls', 60)
    expect(result.behavior).toBe('allow')
  })
})

describe('evaluateConnectorToolUse', () => {
  let tmp: string

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ur-desktop-safety-'))
  })

  it('allows read-only MCP tool names', () => {
    const result = evaluateConnectorToolUse(tmp, 'fs', 'readFile', {})
    expect(result.behavior).toBe('allow')
  })

  it('asks for side-effecting MCP tool names', () => {
    const result = evaluateConnectorToolUse(tmp, 'fs', 'writeFile', {})
    expect(result.behavior).toBe('ask')
    expect(result.riskLevel).toBe('medium')
  })

  it('asks for unknown MCP tools', () => {
    const result = evaluateConnectorToolUse(tmp, 'db', 'query', {})
    expect(result.behavior).toBe('ask')
  })
})
