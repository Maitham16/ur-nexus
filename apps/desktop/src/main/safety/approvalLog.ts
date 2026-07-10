import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import { getAppDataPath } from '../utils/appDataPath.js'
import { redactValue } from '../utils/redactSecrets.js'

export type ApprovalScope = 'once' | 'run' | 'session' | 'permanent'

export interface ApprovalLogEntry {
  timestamp: string
  runId: string
  requestId: string
  actionType: string
  target: string
  reason: string
  riskLevel: string
  decision: 'allowed' | 'denied'
  scope: ApprovalScope
  projectRoot: string
  taskId?: string
  agentId?: string
}

const logDir = path.join(getAppDataPath(), 'desktop')
const logPath = path.join(logDir, 'approval-log.jsonl')

async function ensureDir(): Promise<void> {
  await fs.mkdir(logDir, { recursive: true })
}

export async function appendApprovalLog(
  projectRoot: string,
  entry: ApprovalLogEntry,
): Promise<void> {
  await ensureDir()
  const safeEntry: ApprovalLogEntry = {
    ...entry,
    target: String(redactValue(entry.target) ?? entry.target),
    reason: String(redactValue(entry.reason) ?? entry.reason),
    projectRoot,
  }
  await fs.appendFile(logPath, `${JSON.stringify(safeEntry)}\n`, 'utf-8')
}

export async function readApprovalLog(projectRoot: string): Promise<ApprovalLogEntry[]> {
  try {
    const content = await fs.readFile(logPath, 'utf-8')
    return content
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line) as ApprovalLogEntry)
      .filter(e => e.projectRoot === projectRoot)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw err
  }
}
