import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { runProjectCommand } from './runtime.js'
import { detectFramework, parseTestOutput } from './testRunner.js'
import type {
  VerificationGateDto,
  VerificationGateKind,
  VerificationOutcome,
  VerificationResultDto,
} from '../shared/ipc.js'

/**
 * L2 deep verification.
 *
 * L1 only observes whether a run touched files; it cannot tell a correct edit
 * from a broken one, so it reports any change as unverified. L2 answers the
 * question L1 cannot: it discovers the quality gates the project actually
 * defines, runs them, and adjudicates the run against their real exit codes.
 *
 * Two rules shape the design. First, a gate that does not exist is never
 * invented — a project with no test script yields `no-gates`, not a pass,
 * because "nothing failed" and "nothing was checked" are different claims and
 * the report builder must be able to tell them apart. Second, gates run
 * through `runProjectCommand`, so the safety layer still evaluates them and a
 * denied gate surfaces as `denied` rather than silently counting as success.
 */

export type VerificationGate = {
  kind: VerificationGateKind
  command: string
}

type PackageJson = {
  scripts?: Record<string, unknown>
}

/** Gate execution order: cheapest and most decisive signal first. */
const GATE_ORDER: VerificationGateKind[] = ['typecheck', 'tests', 'lint', 'build']

function readPackageJson(root: string): PackageJson | undefined {
  const path = join(root, 'package.json')
  if (!existsSync(path)) return undefined
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'))
    if (!parsed || typeof parsed !== 'object') return undefined
    return parsed as PackageJson
  } catch {
    return undefined
  }
}

function scriptRunner(root: string): string {
  if (existsSync(join(root, 'bun.lock')) || existsSync(join(root, 'bun.lockb'))) {
    return 'bun run'
  }
  if (existsSync(join(root, 'pnpm-lock.yaml'))) return 'pnpm run'
  if (existsSync(join(root, 'yarn.lock'))) return 'yarn'
  return 'npm run'
}

function hasScript(pkg: PackageJson | undefined, name: string): boolean {
  return typeof pkg?.scripts?.[name] === 'string'
}

/**
 * Discover the gates a project defines. Node script names are matched against
 * the conventional set rather than guessed from arbitrary scripts, so an
 * unrelated script named e.g. `deploy` is never executed as verification.
 */
export function detectVerificationGates(root: string): VerificationGate[] {
  const gates: VerificationGate[] = []
  const pkg = readPackageJson(root)

  if (pkg) {
    const run = scriptRunner(root)
    if (hasScript(pkg, 'typecheck')) {
      gates.push({ kind: 'typecheck', command: `${run} typecheck` })
    }
    if (hasScript(pkg, 'test')) {
      gates.push({ kind: 'tests', command: `${run} test` })
    }
    if (hasScript(pkg, 'lint')) {
      gates.push({ kind: 'lint', command: `${run} lint` })
    }
    if (hasScript(pkg, 'build')) {
      gates.push({ kind: 'build', command: `${run} build` })
    }
  }

  if (gates.length === 0 && existsSync(join(root, 'go.mod'))) {
    gates.push({ kind: 'build', command: 'go build ./...' })
    gates.push({ kind: 'tests', command: 'go test ./...' })
  }

  if (
    gates.length === 0 &&
    (existsSync(join(root, 'pyproject.toml')) ||
      existsSync(join(root, 'pytest.ini')) ||
      existsSync(join(root, 'tox.ini')))
  ) {
    gates.push({ kind: 'tests', command: 'pytest -q' })
  }

  return gates.sort(
    (a, b) => GATE_ORDER.indexOf(a.kind) - GATE_ORDER.indexOf(b.kind),
  )
}

function summarizeTests(output: string, command: string): {
  summary: string
  failingTests: VerificationGateDto['failingTests']
} {
  const framework = detectFramework(command, output)
  const counts = parseTestOutput(framework, output)
  if (!counts.recognized) {
    return { summary: 'Test command produced no recognizable results', failingTests: [] }
  }
  return {
    summary: `${counts.passed} passed, ${counts.failed} failed, ${counts.skipped} skipped`,
    failingTests: counts.failingTests,
  }
}

async function runGate(
  gate: VerificationGate,
  projectRoot: string,
  worktreeRoot: string | undefined,
): Promise<VerificationGateDto> {
  const startedAt = Date.now()
  let output = ''
  let exitCode: number | null = null
  let denied = false

  try {
    const result = await runProjectCommand(projectRoot, gate.command, worktreeRoot)
    output = result.output
    exitCode = result.exitCode
    denied = result.denied === true
  } catch (error) {
    return {
      kind: gate.kind,
      command: gate.command,
      passed: false,
      exitCode: null,
      durationMs: Date.now() - startedAt,
      summary: `Gate could not run: ${error instanceof Error ? error.message : String(error)}`,
    }
  }

  const durationMs = Date.now() - startedAt

  if (denied) {
    return {
      kind: gate.kind,
      command: gate.command,
      passed: false,
      exitCode: null,
      durationMs,
      denied: true,
      summary: 'Blocked by the safety policy before execution',
    }
  }

  const passed = exitCode === 0

  if (gate.kind === 'tests') {
    const { summary, failingTests } = summarizeTests(output, gate.command)
    return {
      kind: gate.kind,
      command: gate.command,
      passed,
      exitCode,
      durationMs,
      summary,
      failingTests,
    }
  }

  return {
    kind: gate.kind,
    command: gate.command,
    passed,
    exitCode,
    durationMs,
    summary: passed
      ? `${gate.kind} passed`
      : `${gate.kind} failed with exit code ${exitCode}${tail(output)}`,
  }
}

function tail(output: string): string {
  const trimmed = output.trim()
  if (!trimmed) return ''
  const lastLine = trimmed.split('\n').filter(Boolean).slice(-1)[0] ?? ''
  return lastLine ? `: ${lastLine.slice(0, 200)}` : ''
}

export function adjudicateGates(gates: VerificationGateDto[]): {
  outcome: VerificationOutcome
  passed: boolean
  message: string
} {
  if (gates.length === 0) {
    return {
      outcome: 'no-gates',
      passed: false,
      message:
        'No test, typecheck, lint, or build gate is defined for this project, so the changes could not be verified',
    }
  }
  if (gates.some(gate => gate.denied)) {
    const blocked = gates.filter(gate => gate.denied).map(gate => gate.kind)
    return {
      outcome: 'denied',
      passed: false,
      message: `Verification incomplete: the safety policy blocked ${blocked.join(', ')}`,
    }
  }
  const failed = gates.filter(gate => !gate.passed)
  if (failed.length > 0) {
    return {
      outcome: 'failed',
      passed: false,
      message: `Verification failed: ${failed
        .map(gate => `${gate.kind} (${gate.summary})`)
        .join('; ')}`,
    }
  }
  return {
    outcome: 'verified',
    passed: true,
    message: `Verified by ${gates.map(gate => gate.kind).join(', ')}`,
  }
}

export type DeepVerificationOptions = {
  projectRoot: string
  worktreeRoot?: string
  /**
   * Stop at the first failing gate. On by default: once a gate fails the run
   * is already unverified, and continuing spends minutes of model-idle time
   * to reach the same verdict.
   */
  stopOnFirstFailure?: boolean
  /** Override discovery, e.g. with plan-declared verification commands. */
  gates?: VerificationGate[]
}

/**
 * Run the project's quality gates and adjudicate the result. Always reports
 * level `l2`, including when no gate exists — the level describes the pipeline
 * that ran, and `outcome` carries whether it could reach a verdict.
 */
export async function runDeepVerification(
  options: DeepVerificationOptions,
): Promise<VerificationResultDto> {
  const { projectRoot, worktreeRoot, stopOnFirstFailure = true } = options
  const root = worktreeRoot ?? projectRoot
  const gates = options.gates ?? detectVerificationGates(root)

  const executed: VerificationGateDto[] = []
  for (const gate of gates) {
    const result = await runGate(gate, projectRoot, worktreeRoot)
    executed.push(result)
    if (stopOnFirstFailure && !result.passed) break
  }

  const { outcome, passed, message } = adjudicateGates(executed)
  return { passed, level: 'l2', message, outcome, gates: executed }
}
