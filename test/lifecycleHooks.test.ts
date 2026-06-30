import { describe, expect, it } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  HOOK_EVENTS,
  BeforeEditHookInputSchema,
  AfterEditHookInputSchema,
  BeforeCommandHookInputSchema,
  AfterCommandHookInputSchema,
  BeforeCommitHookInputSchema,
  OnFailureHookInputSchema,
} from '../src/entrypoints/sdk/coreSchemas.js'
import type { ToolUseContext } from '../src/Tool.js'

describe('lifecycle hooks', () => {
  it('HOOK_EVENTS includes the six new lifecycle events', () => {
    for (const event of [
      'BeforeEdit',
      'AfterEdit',
      'BeforeCommand',
      'AfterCommand',
      'BeforeCommit',
      'OnFailure',
    ]) {
      expect(HOOK_EVENTS).toContain(event)
    }
  })

  it('schemas validate lifecycle hook inputs', () => {
    const base = {
      session_id: 's1',
      transcript_path: '/tmp/t.json',
      cwd: '/tmp',
    }
    expect(
      BeforeEditHookInputSchema().safeParse({
        ...base,
        hook_event_name: 'BeforeEdit',
        file_path: '/tmp/a.ts',
        old_string: 'a',
        new_string: 'b',
        replace_all: false,
        tool_use_id: 't1',
      }).success,
    ).toBe(true)

    expect(
      AfterEditHookInputSchema().safeParse({
        ...base,
        hook_event_name: 'AfterEdit',
        file_path: '/tmp/a.ts',
        success: true,
      }).success,
    ).toBe(true)

    expect(
      BeforeCommandHookInputSchema().safeParse({
        ...base,
        hook_event_name: 'BeforeCommand',
        command: 'bun test',
        shell_type: 'bash',
      }).success,
    ).toBe(true)

    expect(
      AfterCommandHookInputSchema().safeParse({
        ...base,
        hook_event_name: 'AfterCommand',
        command: 'bun test',
        exit_code: 0,
      }).success,
    ).toBe(true)

    expect(
      BeforeCommitHookInputSchema().safeParse({
        ...base,
        hook_event_name: 'BeforeCommit',
        command: 'git commit -m "x"',
      }).success,
    ).toBe(true)

    expect(
      OnFailureHookInputSchema().safeParse({
        ...base,
        hook_event_name: 'OnFailure',
        error: 'oops',
        stage: 'tool',
      }).success,
    ).toBe(true)
  })
})
