import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createShellRunner } from './shellRunner.js'

let workspace: string

beforeEach(async () => {
  workspace = await mkdtemp(join(tmpdir(), 'ur-shell-runner-'))
})

afterEach(async () => {
  await rm(workspace, { recursive: true, force: true })
})

describe('shell runner', () => {
  it('executes commands in the requested workspace and captures output', async () => {
    const runner = createShellRunner({ cwd: workspace })
    const result = await runner.run(
      "printf 'workspace output\\n' > result.txt && printf 'complete\\n'",
    )

    expect(result.status).toBe('done')
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('complete')
    expect(await readFile(join(workspace, 'result.txt'), 'utf-8')).toBe(
      'workspace output\n',
    )
  })

  it('does not report failed commands as successful', async () => {
    const runner = createShellRunner({ cwd: workspace })
    const result = await runner.run('exit 7')

    expect(result.status).toBe('error')
    expect(result.exitCode).toBe(7)
  })
})
