import { runProjectCommand } from './runtime.js'
import type { TestRunResultDto, FailingTestDto, TestFramework } from '../shared/ipc.js'

function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\[[\d;?]*[A-Za-z]/g, '')
}

export function detectFramework(command: string, output: string): TestFramework {
  const cmd = command.toLowerCase()
  if (/\bbun\s+test\b/.test(cmd) || /bun test v\d/.test(output)) return 'bun'
  if (/\bvitest\b/.test(cmd) || /Test Files\s+\d/.test(output)) return 'vitest'
  if (/\bjest\b/.test(cmd) || /Tests:\s+.*total/.test(output)) return 'jest'
  if (/\bpytest\b/.test(cmd) || /=+ .*(passed|failed).* =+/.test(output)) return 'pytest'
  if (/\bgo\s+test\b/.test(cmd) || /^--- (FAIL|PASS): /m.test(output)) return 'go'
  if (/\bmocha\b/.test(cmd) || /\d+ passing/.test(output)) return 'mocha'
  return 'unknown'
}

export interface ParsedCounts {
  passed: number
  failed: number
  skipped: number
  failingTests: FailingTestDto[]
  /** True when the output carries a recognizable test-run signature. */
  recognized: boolean
}

export function parseTestOutput(framework: TestFramework, rawOutput: string): ParsedCounts {
  const output = stripAnsi(rawOutput)
  const result: ParsedCounts = {
    passed: 0,
    failed: 0,
    skipped: 0,
    failingTests: [],
    recognized: false,
  }

  switch (framework) {
    case 'bun': {
      const pass = output.match(/^\s*(\d+) pass\b/m)
      const fail = output.match(/^\s*(\d+) fail\b/m)
      const skip = output.match(/^\s*(\d+) skip\b/m)
      if (pass || fail) {
        result.recognized = true
        result.passed = pass ? Number(pass[1]) : 0
        result.failed = fail ? Number(fail[1]) : 0
        result.skipped = skip ? Number(skip[1]) : 0
      }
      for (const m of output.matchAll(/^\(fail\)\s+(.+?)(?:\s+\[[\d.]+m?s\])?$/gm)) {
        result.failingTests.push({ name: m[1].trim() })
      }
      break
    }
    case 'jest': {
      const line = output.match(
        /^Tests:\s+(?:(\d+) failed, )?(?:(\d+) skipped, )?(?:(\d+) passed, )?(\d+) total/m,
      )
      if (line) {
        result.recognized = true
        result.failed = Number(line[1] ?? 0)
        result.skipped = Number(line[2] ?? 0)
        result.passed = Number(line[3] ?? 0)
      }
      for (const m of output.matchAll(/^\s*[✕✗]\s+(.+?)(?:\s+\(\d+\s*m?s\))?$/gm)) {
        result.failingTests.push({ name: m[1].trim() })
      }
      break
    }
    case 'vitest': {
      const line = output.match(
        /^\s*Tests\s+(?:(\d+) failed \| )?(?:(\d+) passed)?(?:.*?\((\d+)\))?/m,
      )
      if (line && (line[1] !== undefined || line[2] !== undefined)) {
        result.recognized = true
        result.failed = Number(line[1] ?? 0)
        result.passed = Number(line[2] ?? 0)
      }
      const skipLine = output.match(/(\d+) skipped/)
      if (skipLine) result.skipped = Number(skipLine[1])
      for (const m of output.matchAll(/^\s*[✗×]\s+(.+?)(?:\s+\d+m?s)?$/gm)) {
        result.failingTests.push({ name: m[1].trim() })
      }
      break
    }
    case 'pytest': {
      const line = output.match(
        /=+ (?:(\d+) failed)?(?:, )?(?:(\d+) passed)?(?:, )?(?:(\d+) skipped)?.* in [\d.]+s.* =+/,
      )
      if (line && (line[1] !== undefined || line[2] !== undefined)) {
        result.recognized = true
        result.failed = Number(line[1] ?? 0)
        result.passed = Number(line[2] ?? 0)
        result.skipped = Number(line[3] ?? 0)
      }
      for (const m of output.matchAll(/^FAILED\s+(\S+?)(?:\s+-\s+(.*))?$/gm)) {
        const [file, name] = m[1].split('::')
        result.failingTests.push({
          name: name ?? m[1],
          file,
          message: m[2]?.trim(),
        })
      }
      break
    }
    case 'go': {
      const failures = [...output.matchAll(/^--- FAIL: (\S+)/gm)]
      const passes = [...output.matchAll(/^--- PASS: (\S+)/gm)]
      const skips = [...output.matchAll(/^--- SKIP: (\S+)/gm)]
      if (failures.length + passes.length + skips.length > 0 || /^(ok|FAIL)\s+\S+/m.test(output)) {
        result.recognized = true
      }
      result.failed = failures.length
      result.passed = passes.length
      result.skipped = skips.length
      for (const m of failures) {
        result.failingTests.push({ name: m[1] })
      }
      break
    }
    case 'mocha': {
      const passing = output.match(/(\d+) passing/)
      const failing = output.match(/(\d+) failing/)
      const pending = output.match(/(\d+) pending/)
      if (passing || failing) {
        result.recognized = true
        result.passed = passing ? Number(passing[1]) : 0
        result.failed = failing ? Number(failing[1]) : 0
        result.skipped = pending ? Number(pending[1]) : 0
      }
      for (const m of output.matchAll(/^\s+\d+\)\s+(.+)$/gm)) {
        result.failingTests.push({ name: m[1].trim() })
      }
      break
    }
    case 'unknown':
      break
  }
  return result
}

/** Framework-specific command that re-runs only the failing tests. */
export function buildRerunFailedCommand(
  framework: TestFramework,
  baseCommand: string,
  failingTests: FailingTestDto[],
): string | null {
  if (failingTests.length === 0) return null
  const names = failingTests.map(t => t.name)
  const escape = (value: string) => value.replace(/'/g, "'\\''")
  switch (framework) {
    case 'bun': {
      const pattern = names.map(n => escape(n)).join('|')
      return `${baseCommand} -t '${pattern}'`
    }
    case 'jest':
    case 'vitest': {
      const pattern = names.map(n => escape(n)).join('|')
      return `${baseCommand} -t '${pattern}'`
    }
    case 'pytest': {
      const targets = failingTests
        .map(t => (t.file ? `${t.file}::${t.name}` : t.name))
        .map(t => `'${escape(t)}'`)
        .join(' ')
      return `${baseCommand.split(/\s+/)[0]} ${targets}`
    }
    case 'go': {
      const pattern = names.map(n => escape(n)).join('|')
      return `${baseCommand} -run '${pattern}'`
    }
    default:
      return null
  }
}

export async function runStructuredTests(
  projectRoot: string,
  command: string,
  worktreeRoot?: string,
): Promise<TestRunResultDto> {
  const startedAt = Date.now()
  const { output, exitCode, denied } = await runProjectCommand(
    projectRoot,
    command,
    worktreeRoot,
  )
  const finishedAt = Date.now()

  if (denied) {
    return {
      command,
      framework: 'unknown',
      startedAt,
      finishedAt,
      durationMs: finishedAt - startedAt,
      exitCode,
      passed: 0,
      failed: 0,
      skipped: 0,
      failingTests: [],
      output,
      stderrTail: output.slice(-2000),
      runtimeFailure: true,
      denied: true,
    }
  }

  const framework = detectFramework(command, output)
  const counts = parseTestOutput(framework, output)

  return {
    command,
    framework,
    startedAt,
    finishedAt,
    durationMs: finishedAt - startedAt,
    exitCode,
    passed: counts.passed,
    failed: counts.failed,
    skipped: counts.skipped,
    failingTests: counts.failingTests,
    output,
    stderrTail: output.slice(-2000),
    // Non-zero exit without a recognizable test summary means the command
    // itself failed (missing binary, syntax error), not the tests.
    runtimeFailure: exitCode !== 0 && !counts.recognized,
  }
}
