import { readApprovalLog, type ApprovalLogEntry } from './safety/approvalLog.js'
import { getRunHistory } from './historyStore.js'
import { redactValue } from './utils/redactSecrets.js'

export interface RunReport {
  runId: string
  projectRoot: string
  projectName?: string
  title?: string
  startedAt?: string
  finishedAt?: string
  status?: string
  providerId?: string
  modelId?: string
  providerMode?: string
  costUsd?: number
  tokenUsage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number }
  completedTasks: { id: string; title: string }[]
  failedTasks: { id: string; title: string; error?: string }[]
  verifiedChanges: { file: string; description: string }[]
  unverifiedClaims: { claim: string; reason: string }[]
  testsRun: { command: string; passed: boolean; output?: string }[]
  failedChecks: { check: string; reason: string }[]
  remainingIssues: { issue: string; severity: string }[]
  approvals: ApprovalLogEntry[]
  changedFiles: string[]
  messages: { role: string; content?: string; toolName?: string }[]
}

const TEST_PATTERNS = [
  /\b(npm test|yarn test|pnpm test|bun test)\b/i,
  /\b(vitest|jest|pytest|mocha|tap|ava)\b/i,
  /\b(go test|rake test|bundle exec rspec)\b/i,
]

function isTestCommand(command: string): boolean {
  return TEST_PATTERNS.some(p => p.test(command))
}

export async function buildRunReport(
  projectRoot: string,
  runId: string,
  _events: Record<string, unknown>[],
  opts: {
    projectName?: string
    title?: string
    startedAt?: string
    finishedAt?: string
    status?: string
    providerId?: string
    modelId?: string
    providerMode?: string
    costUsd?: number
    tokenUsage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number }
    changedFiles?: string[]
  } = {},
): Promise<RunReport> {
  const history = await getRunHistory(runId)
  const events = history?.messages ?? []

  const completedTasks = (history?.tasks ?? [])
    .filter(t => t.status === 'done')
    .map(t => ({ id: t.id, title: t.title }))
  const failedTasks = (history?.tasks ?? [])
    .filter(t => t.status === 'failed')
    .map(t => ({ id: t.id, title: t.title }))

  const verifiedChanges: { file: string; description: string }[] = []
  const unverifiedClaims: { claim: string; reason: string }[] = []
  const testsRun: { command: string; passed: boolean; output?: string }[] = []
  const failedChecks: { check: string; reason: string }[] = []
  const remainingIssues: { issue: string; severity: string }[] = []

  let verificationPassed = false
  let changedFiles: string[] = opts.changedFiles ?? history?.changedFiles ?? []

  for (const event of events) {
    const raw = event as unknown as Record<string, unknown>
    const type = String(raw.type ?? '')
    switch (type) {
      case 'verification_completed': {
        const passed = raw.passed === true
        verificationPassed = passed
        if (passed) {
          verifiedChanges.push({
            file: changedFiles[0] ?? 'project',
            description: String(raw.message ?? 'Verification passed'),
          })
        } else {
          failedChecks.push({
            check: 'Verification',
            reason: String(raw.message ?? 'Verification failed'),
          })
        }
        break
      }
      case 'changed_files': {
        if (Array.isArray(raw.files)) {
          changedFiles = [...new Set([...changedFiles, ...(raw.files as string[])])]
        }
        break
      }
      case 'command_finished': {
        const command = String((raw as { command?: string }).command ?? '')
        const output = String(raw.output ?? '')
        const exitCode = Number(raw.exitCode ?? 0)
        if (command && isTestCommand(command)) {
          testsRun.push({ command, passed: exitCode === 0, output })
        }
        if (exitCode !== 0 && command) {
          failedChecks.push({ check: command, reason: `Exit code ${exitCode}` })
        }
        break
      }
      case 'task_failed': {
        remainingIssues.push({
          issue: String(raw.error ?? 'Task failed'),
          severity: 'high',
        })
        break
      }
      case 'run_failed': {
        remainingIssues.push({
          issue: String(raw.error ?? 'Run failed'),
          severity: 'critical',
        })
        break
      }
      case 'message_created': {
        if (raw.role === 'assistant') {
          const content = String(raw.content ?? '')
          if (
            /done|finished|completed|implemented/i.test(content) &&
            !verificationPassed
          ) {
            unverifiedClaims.push({
              claim: content.slice(0, 200),
              reason: 'No verification event was recorded for this claim.',
            })
          }
        }
        break
      }
    }
  }

  const approvals = await readApprovalLog(projectRoot).catch(() => [] as ApprovalLogEntry[])

  return {
    runId,
    projectRoot,
    projectName: opts.projectName ?? history?.projectName,
    title: opts.title ?? history?.title,
    startedAt: opts.startedAt ?? history?.startedAt,
    finishedAt: opts.finishedAt ?? history?.finishedAt,
    status: opts.status ?? history?.status,
    providerId: opts.providerId ?? history?.providerId,
    modelId: opts.modelId ?? history?.modelId,
    providerMode: opts.providerMode ?? history?.providerMode,
    costUsd: opts.costUsd ?? history?.costUsd,
    tokenUsage: opts.tokenUsage ?? history?.tokenUsage,
    completedTasks,
    failedTasks,
    verifiedChanges,
    unverifiedClaims,
    testsRun,
    failedChecks,
    remainingIssues,
    approvals,
    changedFiles,
    messages: events.map(e => {
      const raw = e as unknown as Record<string, unknown>
      return {
        role: String(raw.role ?? raw.type ?? ''),
        content: String(raw.content ?? ''),
        toolName: raw.toolName ? String(raw.toolName) : undefined,
      }
    }),
  }
}

export function buildReportMarkdown(report: RunReport): string {
  const lines: string[] = [
    `# Run Report`,
    '',
    `- **Run ID:** ${report.runId}`,
    `- **Project:** ${report.projectName ?? report.projectRoot}`,
    `- **Status:** ${report.status ?? 'unknown'}`,
    `- **Started:** ${report.startedAt ?? '-'}`,
    `- **Finished:** ${report.finishedAt ?? '-'}`,
    `- **Provider/model/mode:** ${report.providerId ?? '-'} / ${report.modelId ?? '-'} / ${report.providerMode ?? '-'}`,
    report.costUsd !== undefined ? `- **Cost:** $${report.costUsd.toFixed(6)}` : '',
    report.tokenUsage?.totalTokens !== undefined
      ? `- **Tokens:** ${report.tokenUsage.inputTokens ?? '-'} in / ${report.tokenUsage.outputTokens ?? '-'} out / ${report.tokenUsage.totalTokens} total`
      : '',
    '',
    `## Completed tasks`,
    ...(report.completedTasks.length
      ? report.completedTasks.map(t => `- ${t.id}: ${t.title}`)
      : ['_None_']),
    '',
    `## Failed tasks`,
    ...(report.failedTasks.length
      ? report.failedTasks.map(t => `- ${t.id}: ${t.title}${t.error ? ` — ${t.error}` : ''}`)
      : ['_None_']),
    '',
    `## Verified changes`,
    ...(report.verifiedChanges.length
      ? report.verifiedChanges.map(c => `- ${c.file}: ${c.description}`)
      : ['_None_']),
    '',
    `## Unverified claims`,
    ...(report.unverifiedClaims.length
      ? report.unverifiedClaims.map(c => `- ${c.claim}\n  - Reason: ${c.reason}`)
      : ['_None_']),
    '',
    `## Tests run`,
    ...(report.testsRun.length
      ? report.testsRun.map(t => `- \`${t.command}\` ${t.passed ? 'PASS' : 'FAIL'}`)
      : ['_None_']),
    '',
    `## Failed checks`,
    ...(report.failedChecks.length
      ? report.failedChecks.map(c => `- ${c.check}: ${c.reason}`)
      : ['_None_']),
    '',
    `## Remaining issues`,
    ...(report.remainingIssues.length
      ? report.remainingIssues.map(i => `- (${i.severity}) ${i.issue}`)
      : ['_None_']),
    '',
    `## Changed files`,
    ...(report.changedFiles.length ? report.changedFiles.map(f => `- ${f}`) : ['_None_']),
    '',
  ]
  return lines.filter(Boolean).join('\n')
}

export function buildReportJson(report: RunReport): string {
  return JSON.stringify(redactValue(report), null, 2)
}
