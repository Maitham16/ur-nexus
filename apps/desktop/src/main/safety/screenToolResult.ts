import { screenUntrustedContent } from './injectionScreen.js'
import type { InjectionScreenSummaryDto } from '../../shared/ipc.js'

/**
 * Injection screening for runtime tool results.
 *
 * Only tools that return third-party content are screened. A `Read` of a file
 * the user chose, or a `Bash` command they approved, is not content from an
 * outside party — screening those would flag the user's own repository whenever
 * it happened to contain the word "ignore previous instructions", which is
 * exactly what this project's own test fixtures contain.
 *
 * MCP tool names are unbounded, so any `mcp__`-prefixed tool counts: its output
 * comes from a server the agent does not control.
 */

/** Tools whose output originates outside the workspace. */
const CONTENT_TOOLS = new Set([
  'WebFetch',
  'WebFetchTool',
  'WebSearch',
  'WebSearchTool',
  'Fetch',
  'fetch',
  'BrowserTool',
  'Browser',
])

export function isUntrustedContentTool(toolName: string): boolean {
  if (CONTENT_TOOLS.has(toolName)) return true
  return toolName.startsWith('mcp__')
}

function toText(value: unknown): string {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value) ?? ''
  } catch {
    return ''
  }
}

/**
 * Screen a tool result, returning a summary only when something matched.
 * Returning undefined for clean results keeps the event payload unchanged in
 * the overwhelmingly common case.
 */
export function screenToolResult(
  toolName: string,
  result: unknown,
): InjectionScreenSummaryDto | undefined {
  if (!isUntrustedContentTool(toolName)) return undefined
  const text = toText(result)
  if (!text) return undefined

  const screen = screenUntrustedContent(text)
  if (screen.findings.length === 0) return undefined

  return {
    suspicious: screen.suspicious,
    highestSeverity: screen.highestSeverity,
    ruleIds: [...new Set(screen.findings.map(finding => finding.ruleId))],
    findings: screen.findings.slice(0, 10).map(finding => ({
      ruleId: finding.ruleId,
      severity: finding.severity,
      excerpt: finding.excerpt,
      index: finding.index,
    })),
  }
}
