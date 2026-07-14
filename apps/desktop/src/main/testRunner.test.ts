import { describe, it, expect } from 'bun:test'
import {
  detectFramework,
  parseTestOutput,
  buildRerunFailedCommand,
} from './testRunner.js'

const BUN_OUTPUT = `bun test v1.3.14 (d1632b29)

src/example.test.ts:
(pass) math > adds numbers [0.12ms]
(fail) math > divides by zero [1.02ms]
(fail) strings > trims whitespace

 5 pass
 2 fail
 1 skip
 12 expect() calls
Ran 8 tests across 2 files. [120.00ms]
`

const JEST_OUTPUT = `
 FAIL  src/sum.test.js
  ✓ adds 1 + 2 (3 ms)
  ✕ subtracts 5 - 3 (5 ms)

Tests:       1 failed, 2 skipped, 4 passed, 7 total
Snapshots:   0 total
Time:        1.2 s
`

const VITEST_OUTPUT = `
 ❯ src/math.test.ts (3)
   ✗ divides numbers
   ✓ multiplies numbers

 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 4 passed (5)
   Start at  10:00:00
   Duration  1.05s
`

const PYTEST_OUTPUT = `
========================= test session starts ==========================
collected 6 items

tests/test_app.py ..F.s.                                          [100%]

FAILED tests/test_app.py::test_divide - ZeroDivisionError: division by zero
==================== 1 failed, 4 passed, 1 skipped in 0.34s ====================
`

const GO_OUTPUT = `
--- PASS: TestAdd (0.00s)
--- FAIL: TestDivide (0.01s)
    math_test.go:22: expected 2, got 0
--- SKIP: TestSlow (0.00s)
FAIL
FAIL    example.com/math    0.015s
`

const MOCHA_OUTPUT = `
  math
    ✓ adds
    1) divides

  3 passing (25ms)
  1 pending
  1 failing

  1) math
       divides:
     AssertionError: expected 0 to equal 2
`

describe('detectFramework', () => {
  it('detects each supported framework', () => {
    expect(detectFramework('bun test', BUN_OUTPUT)).toBe('bun')
    expect(detectFramework('npx jest', JEST_OUTPUT)).toBe('jest')
    expect(detectFramework('npx vitest run', VITEST_OUTPUT)).toBe('vitest')
    expect(detectFramework('pytest', PYTEST_OUTPUT)).toBe('pytest')
    expect(detectFramework('go test ./...', GO_OUTPUT)).toBe('go')
    expect(detectFramework('npx mocha', MOCHA_OUTPUT)).toBe('mocha')
    expect(detectFramework('make check', 'no signature here')).toBe('unknown')
  })
})

describe('parseTestOutput', () => {
  it('parses bun test output', () => {
    const parsed = parseTestOutput('bun', BUN_OUTPUT)
    expect(parsed.recognized).toBe(true)
    expect(parsed.passed).toBe(5)
    expect(parsed.failed).toBe(2)
    expect(parsed.skipped).toBe(1)
    expect(parsed.failingTests.map(t => t.name)).toEqual([
      'math > divides by zero',
      'strings > trims whitespace',
    ])
  })

  it('parses jest output', () => {
    const parsed = parseTestOutput('jest', JEST_OUTPUT)
    expect(parsed.recognized).toBe(true)
    expect(parsed).toMatchObject({ passed: 4, failed: 1, skipped: 2 })
    expect(parsed.failingTests[0].name).toBe('subtracts 5 - 3')
  })

  it('parses vitest output', () => {
    const parsed = parseTestOutput('vitest', VITEST_OUTPUT)
    expect(parsed.recognized).toBe(true)
    expect(parsed).toMatchObject({ passed: 4, failed: 1 })
    expect(parsed.failingTests[0].name).toBe('divides numbers')
  })

  it('parses pytest output with file and message', () => {
    const parsed = parseTestOutput('pytest', PYTEST_OUTPUT)
    expect(parsed.recognized).toBe(true)
    expect(parsed).toMatchObject({ passed: 4, failed: 1, skipped: 1 })
    expect(parsed.failingTests[0]).toMatchObject({
      name: 'test_divide',
      file: 'tests/test_app.py',
    })
    expect(parsed.failingTests[0].message).toContain('ZeroDivisionError')
  })

  it('parses go test output', () => {
    const parsed = parseTestOutput('go', GO_OUTPUT)
    expect(parsed.recognized).toBe(true)
    expect(parsed).toMatchObject({ passed: 1, failed: 1, skipped: 1 })
    expect(parsed.failingTests[0].name).toBe('TestDivide')
  })

  it('parses mocha output', () => {
    const parsed = parseTestOutput('mocha', MOCHA_OUTPUT)
    expect(parsed.recognized).toBe(true)
    expect(parsed).toMatchObject({ passed: 3, failed: 1, skipped: 1 })
  })

  it('does not fake recognition for unknown output', () => {
    const parsed = parseTestOutput('unknown', 'error: command not found: foo')
    expect(parsed.recognized).toBe(false)
    expect(parsed.passed + parsed.failed + parsed.skipped).toBe(0)
  })
})

describe('buildRerunFailedCommand', () => {
  const failing = [
    { name: 'math > divides by zero' },
    { name: 'strings > trims whitespace' },
  ]

  it('builds bun/jest -t patterns', () => {
    expect(buildRerunFailedCommand('bun', 'bun test', failing)).toBe(
      "bun test -t 'math > divides by zero|strings > trims whitespace'",
    )
    expect(buildRerunFailedCommand('jest', 'npx jest', failing)).toContain('-t ')
  })

  it('builds pytest node ids', () => {
    const cmd = buildRerunFailedCommand('pytest', 'pytest tests', [
      { name: 'test_divide', file: 'tests/test_app.py' },
    ])
    expect(cmd).toBe("pytest 'tests/test_app.py::test_divide'")
  })

  it('builds go -run patterns', () => {
    expect(
      buildRerunFailedCommand('go', 'go test ./...', [{ name: 'TestDivide' }]),
    ).toBe("go test ./... -run 'TestDivide'")
  })

  it('returns null when unsupported or nothing failed', () => {
    expect(buildRerunFailedCommand('unknown', 'make check', failing)).toBeNull()
    expect(buildRerunFailedCommand('bun', 'bun test', [])).toBeNull()
  })
})
