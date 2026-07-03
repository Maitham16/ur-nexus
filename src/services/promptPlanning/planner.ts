import {
  DEFAULT_PROMPT_PLANNING_CONFIG,
  resolvePromptPlanningConfig,
} from './config.js'
import type {
  NexusAgentRole,
  NexusTask,
  PromptPlan,
  PromptPlanningConfig,
} from './types.js'

const URL_PATTERN = /\bhttps?:\/\/[^\s)]+/gi
const PATH_PATTERN =
  /(?:^|[\s"'`(])((?:\.{0,2}\/)?(?:[A-Za-z0-9_.@-]+\/)+[A-Za-z0-9_.@/-]+|(?:README|CHANGELOG|RELEASE|SECURITY|CONTRIBUTING|QUALITY|LICENSE)(?:\.[A-Za-z0-9]+)?)\b/g

function compact(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function titleFromSegment(segment: string): string {
  const cleaned = compact(segment)
    .replace(/^please\s+/i, '')
    .replace(/[.?!]+$/g, '')
  if (cleaned.length <= 64) return cleaned || 'Clarify requested work'
  return `${cleaned.slice(0, 61).trim()}...`
}

function extractUrls(text: string): string[] {
  return unique([...text.matchAll(URL_PATTERN)].map(match => match[0]))
}

export function extractReferencedFiles(text: string): string[] {
  const paths: string[] = []
  for (const match of text.matchAll(PATH_PATTERN)) {
    const value = match[1]
    if (!value) continue
    if (value.includes('://')) continue
    paths.push(value.replace(/[),.;:]+$/g, ''))
  }
  return unique(paths)
}

function splitNumberedOrBulletedLines(prompt: string): string[] {
  const segments: string[] = []
  for (const line of prompt.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:[-*]|\d+[.)])\s+(.+)$/)
    if (match?.[1]) segments.push(match[1])
  }
  return segments.length >= 2 ? segments.map(compact) : []
}

function splitLongPrompt(prompt: string): string[] {
  const bulletSegments = splitNumberedOrBulletedLines(prompt)
  if (bulletSegments.length > 0) return bulletSegments

  const trimmed = compact(prompt)
  if (trimmed.length < 220 && !/[;\n]/.test(prompt)) return [trimmed]

  const lines = prompt
    .split(/\r?\n+/)
    .map(compact)
    .filter(Boolean)
  if (lines.length >= 2) return lines

  const sentenceSegments = trimmed
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(compact)
    .filter(Boolean)
  if (sentenceSegments.length >= 2) return sentenceSegments

  const directiveSegments = trimmed
    .split(/\s+(?:then|also|next|finally)\s+/i)
    .map(compact)
    .filter(Boolean)
  return directiveSegments.length >= 2 ? directiveSegments : [trimmed]
}

function needsPreviousTask(segment: string): boolean {
  return /^(then|after|next|finally|verify|validate|test|run tests|summari[sz]e|report)\b/i.test(
    segment,
  )
}

function inferRole(segment: string): NexusAgentRole {
  if (/\b(plan|analy[sz]e|decompose)\b/i.test(segment)) return 'planner'
  if (/\b(verify|validate|test|check|prove)\b/i.test(segment)) return 'verifier'
  if (/\b(report|summari[sz]e|release notes|changelog)\b/i.test(segment)) {
    return 'reporter'
  }
  return 'executor'
}

function isCriticallyAmbiguous(segment: string): boolean {
  const text = compact(segment).toLowerCase()
  if (!text) return true
  return /^(do|fix|update|improve|change|make|handle|clean up)(\s+(it|this|that|things?|stuff|everything))?\.?$/.test(
    text,
  )
}

function verificationCriteria(segment: string, files: string[]): string[] {
  const criteria = [
    `Result directly addresses: ${compact(segment)}`,
    'Assumptions are stated before execution when context is incomplete.',
    'Unsupported claims are rejected during verification.',
  ]
  if (files.length > 0) {
    criteria.push('Referenced files exist before file-specific work starts.')
    criteria.push('Any claimed file changes are backed by actual changed files.')
  }
  return criteria
}

function makeTask(
  segment: string,
  index: number,
  previousTaskId: string | null,
): NexusTask {
  const files = extractReferencedFiles(segment)
  const blocked = isCriticallyAmbiguous(segment)
  const dependencies =
    previousTaskId && needsPreviousTask(segment) ? [previousTaskId] : []
  const assumptions = blocked
    ? ['Critical target/context is missing; ask for clarification before execution.']
    : [
        'Use the current workspace as the source of truth.',
        files.length === 0
          ? 'No specific files were named; discover relevant files before changing code.'
          : 'Only touch referenced files unless repository inspection proves another file is required.',
      ]

  return {
    id: `task-${index + 1}`,
    title: titleFromSegment(segment),
    description: compact(segment) || 'Clarify the requested work.',
    status: blocked ? 'blocked' : dependencies.length > 0 ? 'pending' : 'ready',
    dependencies,
    assignedAgent: inferRole(segment),
    input: {
      prompt: segment,
      assumptions,
      requiredFiles: files,
      targetFiles: files,
      resources: extractUrls(segment),
    },
    expectedOutput: blocked
      ? 'A clarification request naming the missing target or context.'
      : `Completed work for: ${compact(segment)}`,
    verificationCriteria: verificationCriteria(segment, files),
  }
}

export function decomposePrompt(
  prompt: string,
  config?: Partial<PromptPlanningConfig>,
): PromptPlan {
  const resolvedConfig = {
    ...DEFAULT_PROMPT_PLANNING_CONFIG,
    ...resolvePromptPlanningConfig(config),
  }
  const originalPrompt = prompt
  const segments = splitLongPrompt(prompt).filter(Boolean)
  const sourceSegments = segments.length > 0 ? segments : ['']
  let previousTaskId: string | null = null
  const tasks = sourceSegments.map((segment, index) => {
    const task = makeTask(segment, index, previousTaskId)
    previousTaskId = task.id
    return task
  })

  return {
    id: `plan-${Date.now().toString(36)}`,
    originalPrompt,
    tasks,
    assumptions: unique(tasks.flatMap(task => task.input.assumptions)),
    createdAt: new Date().toISOString(),
    config: resolvedConfig,
  }
}
