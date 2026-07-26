import { describe, expect, test } from 'bun:test'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { adjudicateGates, detectVerificationGates } from './verification.js'
import type { VerificationGateDto } from '../shared/ipc.js'

function project(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'ur-verify-'))
  for (const [name, content] of Object.entries(files)) {
    const target = join(root, name)
    mkdirSync(join(target, '..'), { recursive: true })
    writeFileSync(target, content)
  }
  return root
}

function pkg(scripts: Record<string, string>): string {
  return JSON.stringify({ name: 'fixture', scripts })
}

function gate(overrides: Partial<VerificationGateDto>): VerificationGateDto {
  return {
    kind: 'tests',
    command: 'bun test',
    passed: true,
    exitCode: 0,
    durationMs: 1,
    summary: 'ok',
    ...overrides,
  }
}

describe('detectVerificationGates', () => {
  test('finds no gates in an empty project', () => {
    expect(detectVerificationGates(project({}))).toEqual([])
  })

  test('detects conventional node scripts in decisive order', () => {
    const root = project({
      'package.json': pkg({ build: 'x', lint: 'x', test: 'x', typecheck: 'x' }),
    })
    expect(detectVerificationGates(root).map(g => g.kind)).toEqual([
      'typecheck',
      'tests',
      'lint',
      'build',
    ])
  })

  test('ignores unrelated scripts rather than executing them as verification', () => {
    const root = project({
      'package.json': pkg({ deploy: 'ship-it', start: 'x', postinstall: 'x' }),
    })
    expect(detectVerificationGates(root)).toEqual([])
  })

  test('uses bun when a bun lockfile is present', () => {
    const root = project({ 'package.json': pkg({ test: 'x' }), 'bun.lock': '{}' })
    expect(detectVerificationGates(root)[0]?.command).toBe('bun run test')
  })

  test('uses pnpm, yarn, and npm according to the lockfile', () => {
    expect(
      detectVerificationGates(
        project({ 'package.json': pkg({ test: 'x' }), 'pnpm-lock.yaml': '' }),
      )[0]?.command,
    ).toBe('pnpm run test')
    expect(
      detectVerificationGates(
        project({ 'package.json': pkg({ test: 'x' }), 'yarn.lock': '' }),
      )[0]?.command,
    ).toBe('yarn test')
    expect(
      detectVerificationGates(project({ 'package.json': pkg({ test: 'x' }) }))[0]?.command,
    ).toBe('npm run test')
  })

  test('falls back to go tooling when there is no package.json', () => {
    const root = project({ 'go.mod': 'module fixture' })
    expect(detectVerificationGates(root).map(g => g.kind)).toEqual(['tests', 'build'])
  })

  test('falls back to pytest for python projects', () => {
    const root = project({ 'pyproject.toml': '[project]' })
    expect(detectVerificationGates(root)).toEqual([
      { kind: 'tests', command: 'pytest -q' },
    ])
  })

  test('does not add language fallbacks when node scripts already exist', () => {
    const root = project({
      'package.json': pkg({ test: 'x' }),
      'go.mod': 'module fixture',
      'pyproject.toml': '[project]',
    })
    expect(detectVerificationGates(root).map(g => g.command)).toEqual(['npm run test'])
  })

  test('survives a malformed package.json without throwing', () => {
    const root = project({ 'package.json': '{ not json' })
    expect(detectVerificationGates(root)).toEqual([])
  })

  test('ignores non-string script values', () => {
    const root = project({
      'package.json': JSON.stringify({ scripts: { test: { nested: true } } }),
    })
    expect(detectVerificationGates(root)).toEqual([])
  })
})

describe('adjudicateGates', () => {
  test('absence of gates is not a pass', () => {
    const result = adjudicateGates([])
    expect(result.passed).toBe(false)
    expect(result.outcome).toBe('no-gates')
    expect(result.message).toContain('could not be verified')
  })

  test('all gates passing verifies the run', () => {
    const result = adjudicateGates([
      gate({ kind: 'typecheck' }),
      gate({ kind: 'tests' }),
    ])
    expect(result).toMatchObject({ passed: true, outcome: 'verified' })
    expect(result.message).toBe('Verified by typecheck, tests')
  })

  test('a failing gate fails the run and names it', () => {
    const result = adjudicateGates([
      gate({ kind: 'typecheck' }),
      gate({ kind: 'tests', passed: false, exitCode: 1, summary: '3 passed, 1 failed, 0 skipped' }),
    ])
    expect(result).toMatchObject({ passed: false, outcome: 'failed' })
    expect(result.message).toContain('tests (3 passed, 1 failed, 0 skipped)')
  })

  test('a denied gate reports denied, not failed, and never passes', () => {
    const result = adjudicateGates([
      gate({ kind: 'tests', passed: false, denied: true, exitCode: null }),
    ])
    expect(result).toMatchObject({ passed: false, outcome: 'denied' })
    expect(result.message).toContain('safety policy blocked tests')
  })

  test('denial outranks an ordinary failure so the gap is not misreported', () => {
    const result = adjudicateGates([
      gate({ kind: 'typecheck', passed: false, exitCode: 2 }),
      gate({ kind: 'tests', passed: false, denied: true, exitCode: null }),
    ])
    expect(result.outcome).toBe('denied')
  })

  test('a passing gate set with one denied entry cannot report verified', () => {
    const result = adjudicateGates([
      gate({ kind: 'typecheck', passed: true }),
      gate({ kind: 'lint', passed: true }),
      gate({ kind: 'tests', passed: false, denied: true, exitCode: null }),
    ])
    expect(result.passed).toBe(false)
  })
})
