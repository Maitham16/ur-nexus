import { describe, expect, test } from 'bun:test'
import {
  DEFAULT_TERMINAL_SIZE,
  createShellRunner,
  normalizeTerminalSize,
} from './shellRunner.js'

describe('normalizeTerminalSize', () => {
  test('passes through a sane size', () => {
    expect(normalizeTerminalSize({ cols: 100, rows: 40 })).toEqual({ cols: 100, rows: 40 })
  })

  test('falls back to the default when a dimension is missing', () => {
    expect(normalizeTerminalSize(undefined)).toEqual(DEFAULT_TERMINAL_SIZE)
    expect(normalizeTerminalSize({})).toEqual(DEFAULT_TERMINAL_SIZE)
    expect(normalizeTerminalSize({ cols: 80 })).toEqual({
      cols: 80,
      rows: DEFAULT_TERMINAL_SIZE.rows,
    })
  })

  test('rejects zero and negative dimensions, which would fail the ioctl', () => {
    expect(normalizeTerminalSize({ cols: 0, rows: 0 })).toEqual(DEFAULT_TERMINAL_SIZE)
    expect(normalizeTerminalSize({ cols: -5, rows: -1 })).toEqual(DEFAULT_TERMINAL_SIZE)
  })

  test('rejects non-finite and non-numeric values', () => {
    expect(normalizeTerminalSize({ cols: Number.NaN, rows: Number.POSITIVE_INFINITY })).toEqual(
      DEFAULT_TERMINAL_SIZE,
    )
    expect(
      normalizeTerminalSize({ cols: '80' as unknown as number, rows: null as unknown as number }),
    ).toEqual(DEFAULT_TERMINAL_SIZE)
  })

  test('floors fractional dimensions from device-pixel measurement', () => {
    expect(normalizeTerminalSize({ cols: 99.7, rows: 30.9 })).toEqual({ cols: 99, rows: 30 })
  })

  test('caps absurd dimensions', () => {
    expect(normalizeTerminalSize({ cols: 99_999, rows: 99_999 })).toEqual({
      cols: 1000,
      rows: 1000,
    })
  })
})

describe('shell runner terminal controls', () => {
  test('starts at the default geometry', () => {
    const runner = createShellRunner({ cwd: process.cwd() })
    expect(runner.size()).toEqual(DEFAULT_TERMINAL_SIZE)
  })

  test('resize records geometry for later commands even with no live PTY', () => {
    const runner = createShellRunner({ cwd: process.cwd() })
    const applied = runner.resize('no-such-command', { cols: 90, rows: 24 })
    expect(applied).toBe(false)
    expect(runner.size()).toEqual({ cols: 90, rows: 24 })
  })

  test('resize normalizes an unusable size instead of storing it', () => {
    const runner = createShellRunner({ cwd: process.cwd() })
    runner.resize('x', { cols: 0, rows: -3 })
    expect(runner.size()).toEqual(DEFAULT_TERMINAL_SIZE)
  })

  test('size() returns a copy so callers cannot mutate runner state', () => {
    const runner = createShellRunner({ cwd: process.cwd() })
    const size = runner.size()
    size.cols = 1
    expect(runner.size().cols).toBe(DEFAULT_TERMINAL_SIZE.cols)
  })

  test('write reports failure for an unknown command', () => {
    const runner = createShellRunner({ cwd: process.cwd() })
    expect(runner.write('no-such-command', 'hello\n')).toBe(false)
  })

  test('write rejects empty and non-string input', () => {
    const runner = createShellRunner({ cwd: process.cwd() })
    expect(runner.write('any', '')).toBe(false)
    expect(runner.write('any', undefined as unknown as string)).toBe(false)
  })

  test('isInteractive is false for a command with no PTY', () => {
    const runner = createShellRunner({ cwd: process.cwd() })
    expect(runner.isInteractive('no-such-command')).toBe(false)
  })

  test('a completed non-PTY command is not interactive', async () => {
    const runner = createShellRunner({ cwd: process.cwd() })
    const result = await runner.run('echo hi')
    expect(result.status).toBe('done')
    // Under Bun the runner uses the child-process path, which has no terminal,
    // so input must be refused rather than silently dropped.
    expect(runner.isInteractive(result.id)).toBe(false)
    expect(runner.write(result.id, 'x')).toBe(false)
  })

  test('run adopts the geometry it is given', async () => {
    const runner = createShellRunner({ cwd: process.cwd() })
    await runner.run('echo hi', { cols: 70, rows: 20 })
    expect(runner.size()).toEqual({ cols: 70, rows: 20 })
  })
})
