import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { execFileNoThrowWithCwd } from '../../utils/execFileNoThrow.js'
import { detectProjectDna } from '../../ur/projectDna.js'
import {
  defaultHeadlessRunner,
  makeDryHeadlessRunner,
  type HeadlessRunner,
} from './headlessAgent.js'
import { splitCommand, summarizeFailure, type CommandResult } from './ciLoop.js'

export type QualityPhase = 'compile' | 'test' | 'lint'

export type QualityCommand = {
  phase: QualityPhase
  command: string
  source: string
}

export type TestFirstStack = {
  languages: string[]
  packageManagers: string[]
  commands: QualityCommand[]
  missingPhases: QualityPhase[]
  readme: string | null
}

export type TestFirstCommandRun = {
  attempt: number
  phase: QualityPhase
  command: string
  code: number
  passed: boolean
  durationMs: number
  tracePath?: string
  summary?: string
}

export type TestFirstAttempt = {
  attempt: number
  runs: TestFirstCommandRun[]
  fixVerdict?: string | null
  fixOutput?: string
  blockedByRunner?: boolean
}

export type TestFirstLoopResult = {
  status: 'passed' | 'planned' | 'exhausted' | 'blocked' | 'not-configured'
  stack: TestFirstStack
  attempts: TestFirstAttempt[]
  traceDir: string
  installedVerifyPath?: string
}

export type TestFirstCommandExec = (
  command: string,
  cwd: string,
) => Promise<CommandResult>

export type TestFirstLoopOptions = {
  cwd: string
  maxAttempts?: number
  dryRun?: boolean
  skipPermissions?: boolean
  maxTurns?: number
  installGates?: boolean
  traceDir?: string
  exec?: TestFirstCommandExec
  runner?: HeadlessRunner
  now?: () => Date
}

export type InstalledTestFirstGates = {
  path: string
  commands: string[]
}

const PHASES: QualityPhase[] = ['compile', 'test', 'lint']

function uniqueCommands(commands: QualityCommand[]): QualityCommand[] {
  const seen = new Set<string>()
  const out: QualityCommand[] = []
  for (const command of commands) {
    const key = `${command.phase}:${command.command}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(command)
  }
  return out
}

function readPackageScripts(cwd: string): Record<string, string> {
  try {
    const parsed = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8')) as {
      scripts?: unknown
    }
    if (!parsed.scripts || typeof parsed.scripts !== 'object') return {}
    return parsed.scripts as Record<string, string>
  } catch {
    return {}
  }
}

function primaryNodePackageManager(packageManagers: string[]): string {
  for (const pm of ['bun', 'pnpm', 'yarn', 'npm']) {
    if (packageManagers.includes(pm)) return pm
  }
  return 'npm'
}

function runScript(pm: string, script: string): string {
  return pm === 'npm' ? `npm run ${script}` : `${pm} run ${script}`
}

function tscCommand(pm: string): string {
  if (pm === 'pnpm') return 'pnpm exec tsc --noEmit'
  if (pm === 'yarn') return 'yarn tsc --noEmit'
  if (pm === 'bun') return 'bun x tsc --noEmit'
  return 'npx tsc --noEmit'
}

export function detectTestFirstStack(cwd: string): TestFirstStack {
  const dna = detectProjectDna(cwd)
  const commands: QualityCommand[] = []

  for (const command of dna.buildCommands) {
    commands.push({ phase: 'compile', command, source: 'project-dna build' })
  }
  for (const command of dna.testCommands) {
    commands.push({ phase: 'test', command, source: 'project-dna test' })
  }
  for (const command of dna.lintCommands) {
    commands.push({ phase: 'lint', command, source: 'project-dna lint' })
  }

  if (existsSync(join(cwd, 'package.json'))) {
    const scripts = readPackageScripts(cwd)
    const pm = primaryNodePackageManager(dna.packageManagers)
    if (!commands.some(command => command.phase === 'compile')) {
      if (typeof scripts.typecheck === 'string') {
        commands.push({
          phase: 'compile',
          command: runScript(pm, 'typecheck'),
          source: 'package.json script:typecheck',
        })
      } else if (existsSync(join(cwd, 'tsconfig.json'))) {
        commands.push({
          phase: 'compile',
          command: tscCommand(pm),
          source: 'tsconfig.json',
        })
      }
    }
    if (!commands.some(command => command.phase === 'test')) {
      if (typeof scripts.test === 'string') {
        commands.push({
          phase: 'test',
          command: runScript(pm, 'test'),
          source: 'package.json script:test',
        })
      } else if (pm === 'bun') {
        commands.push({ phase: 'test', command: 'bun test', source: 'bun project' })
      }
    }
    if (!commands.some(command => command.phase === 'lint')) {
      for (const script of ['lint', 'biome', 'eslint']) {
        if (typeof scripts[script] === 'string') {
          commands.push({
            phase: 'lint',
            command: runScript(pm, script),
            source: `package.json script:${script}`,
          })
          break
        }
      }
    }
  }

  const ordered = uniqueCommands(commands).sort(
    (a, b) => PHASES.indexOf(a.phase) - PHASES.indexOf(b.phase),
  )
  return {
    languages: dna.languages,
    packageManagers: dna.packageManagers,
    commands: ordered,
    missingPhases: PHASES.filter(
      phase => !ordered.some(command => command.phase === phase),
    ),
    readme: dna.readme,
  }
}

function defaultTraceDir(cwd: string): string {
  return join(cwd, '.ur', 'test-first', 'traces')
}

const defaultExec: TestFirstCommandExec = async (command, cwd) => {
  const { file, args } = splitCommand(command)
  const result = await execFileNoThrowWithCwd(file, args, {
    cwd,
    timeout: 10 * 60 * 1000,
    preserveOutputOnError: true,
    maxBuffer: 2_000_000,
  })
  return { code: result.code, stdout: result.stdout, stderr: result.stderr }
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72) || 'command'
}

function writeFailureTrace(
  cwd: string,
  traceDir: string,
  run: Omit<TestFirstCommandRun, 'tracePath' | 'summary'>,
  result: CommandResult,
  now: Date,
): string {
  mkdirSync(traceDir, { recursive: true })
  const stamp = now.toISOString().replace(/[:.]/g, '-')
  const file = join(
    traceDir,
    `${stamp}-attempt-${run.attempt}-${run.phase}-${slug(run.command)}.log`,
  )
  const body = [
    '# UR test-first failure trace',
    '',
    `timestamp: ${now.toISOString()}`,
    `cwd: ${cwd}`,
    `attempt: ${run.attempt}`,
    `phase: ${run.phase}`,
    `command: ${run.command}`,
    `exitCode: ${run.code}`,
    '',
    '## stdout',
    result.stdout.trimEnd(),
    '',
    '## stderr',
    result.stderr.trimEnd(),
    '',
  ].join('\n')
  writeFileSync(file, body)
  return relative(cwd, file)
}

function readExistingVerifyConfig(path: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as unknown
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

function mergeStringArray(existing: unknown, additions: string[]): string[] {
  const out = new Set<string>()
  if (Array.isArray(existing)) {
    for (const value of existing) if (typeof value === 'string') out.add(value)
  }
  for (const value of additions) out.add(value)
  return [...out]
}

export function installTestFirstGates(
  cwd: string,
  stack = detectTestFirstStack(cwd),
): InstalledTestFirstGates {
  const path = join(cwd, '.ur', 'verify.json')
  mkdirSync(dirname(path), { recursive: true })
  const commands = stack.commands.map(command => command.command)
  const existing = readExistingVerifyConfig(path)
  const next = {
    ...existing,
    afterEdit: mergeStringArray(existing.afterEdit, commands),
    timeoutMs:
      typeof existing.timeoutMs === 'number' && existing.timeoutMs > 0
        ? existing.timeoutMs
        : 600_000,
  }
  writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`)
  return { path: relative(cwd, path), commands }
}

export async function runTestFirstLoop(
  options: TestFirstLoopOptions,
): Promise<TestFirstLoopResult> {
  const cwd = options.cwd
  const stack = detectTestFirstStack(cwd)
  const traceDir = options.traceDir ?? defaultTraceDir(cwd)
  const maxAttempts = Math.max(1, options.maxAttempts ?? 3)
  const exec = options.exec ?? defaultExec
  const runner =
    options.runner ?? (options.dryRun ? makeDryHeadlessRunner() : defaultHeadlessRunner())
  let installedVerifyPath: string | undefined

  if (options.installGates) {
    installedVerifyPath = installTestFirstGates(cwd, stack).path
  }

  if (stack.commands.length === 0) {
    return { status: 'not-configured', stack, attempts: [], traceDir }
  }

  if (options.dryRun) {
    return { status: 'planned', stack, attempts: [], traceDir, installedVerifyPath }
  }

  const attempts: TestFirstAttempt[] = []
  for (let attemptNumber = 1; attemptNumber <= maxAttempts; attemptNumber++) {
    const attempt: TestFirstAttempt = { attempt: attemptNumber, runs: [] }
    attempts.push(attempt)

    let failingRun: TestFirstCommandRun | null = null
    for (const qualityCommand of stack.commands) {
      const started = Date.now()
      const result = await exec(qualityCommand.command, cwd)
      const durationMs = Date.now() - started
      const baseRun = {
        attempt: attemptNumber,
        phase: qualityCommand.phase,
        command: qualityCommand.command,
        code: result.code,
        passed: result.code === 0,
        durationMs,
      }
      const run: TestFirstCommandRun =
        result.code === 0
          ? baseRun
          : {
              ...baseRun,
              summary: summarizeFailure(`${result.stdout}\n${result.stderr}`),
              tracePath: writeFailureTrace(
                cwd,
                traceDir,
                baseRun,
                result,
                options.now?.() ?? new Date(),
              ),
            }
      attempt.runs.push(run)
      if (!run.passed) {
        failingRun = run
        break
      }
    }

    if (!failingRun) {
      return { status: 'passed', stack, attempts, traceDir, installedVerifyPath }
    }

    if (attemptNumber === maxAttempts) break

    const fix = await runner({
      cwd,
      prompt: [
        'The test-first execution loop failed.',
        'Fix the repository so every detected compile, test, and lint command passes.',
        'Do not weaken tests, skip checks, or claim success without command evidence.',
        '',
        `Failed command: ${failingRun.command}`,
        `Phase: ${failingRun.phase}`,
        `Exit code: ${failingRun.code}`,
        failingRun.tracePath ? `Failure trace: ${failingRun.tracePath}` : null,
        '',
        'Failure summary:',
        failingRun.summary ?? '',
        '',
        'After editing, rerun the failing command and the full detected command set.',
        'End with VERDICT: PASS only if the commands actually exit 0.',
      ]
        .filter(Boolean)
        .join('\n'),
      maxTurns: options.maxTurns,
      skipPermissions: options.skipPermissions,
    })
    attempt.fixVerdict = fix.verdict ?? null
    attempt.fixOutput = String(fix.output ?? '').slice(-1000)
    if (fix.isError) {
      attempt.blockedByRunner = true
      return { status: 'blocked', stack, attempts, traceDir, installedVerifyPath }
    }
  }

  return { status: 'exhausted', stack, attempts, traceDir, installedVerifyPath }
}

export function formatTestFirstResult(
  result: TestFirstLoopResult,
  json: boolean,
): string {
  if (json) return JSON.stringify(result, null, 2)

  const lines = [
    `Test-first loop: ${result.status}`,
    `Stack: ${
      result.stack.languages.length ? result.stack.languages.join(', ') : 'unknown'
    } via ${
      result.stack.packageManagers.length
        ? result.stack.packageManagers.join(', ')
        : 'unknown package manager'
    }`,
    `Trace dir: ${relative(process.cwd(), result.traceDir) || '.'}`,
  ]
  if (result.installedVerifyPath) {
    lines.push(`Installed gates: ${result.installedVerifyPath}`)
  }
  lines.push('', 'Detected commands:')
  for (const command of result.stack.commands) {
    lines.push(`  ${command.phase}: ${command.command} (${command.source})`)
  }
  if (result.stack.missingPhases.length > 0) {
    lines.push(`Missing phases: ${result.stack.missingPhases.join(', ')}`)
  }

  if (result.status === 'planned') {
    lines.push('', 'Dry run only; no commands were executed.')
    return lines.join('\n')
  }
  if (result.status === 'not-configured') {
    lines.push('', 'No compile, test, or lint command was detected.')
    return lines.join('\n')
  }

  lines.push('', 'Command evidence:')
  for (const attempt of result.attempts) {
    for (const run of attempt.runs) {
      const tag = run.passed ? 'PASS' : `FAIL exit ${run.code}`
      lines.push(
        `  attempt ${run.attempt} ${run.phase}: ${tag} ${run.command} (${run.durationMs}ms)`,
      )
      if (run.tracePath) lines.push(`    trace: ${run.tracePath}`)
      if (run.summary && !run.passed) {
        lines.push(`    ${run.summary.split('\n').slice(-3).join(' / ').slice(0, 220)}`)
      }
    }
    if (attempt.fixVerdict || attempt.blockedByRunner) {
      lines.push(
        `  fix agent: ${attempt.blockedByRunner ? 'blocked' : attempt.fixVerdict ?? 'ran'}`,
      )
    }
  }
  return lines.join('\n')
}
