import {
  getRunState,
  patchRunState,
  flushRunStates,
} from './runState.js'
import { readTranscript } from '../historyStore.js'
import { openProjectAndCache, startRun } from '../runtime.js'

/**
 * Build the continuation prompt for an interrupted run. Completed
 * side-effecting actions are listed explicitly so the model does not repeat
 * them; assistant progress is replayed as context.
 */
export function buildResumePrompt(state: {
  pendingPrompt?: string
  lastPrompt?: string
  completedToolCalls: Array<{ tool: string; target?: string }>
  interruptionNote?: string
  assistantProgress?: string
}): string {
  const original = state.pendingPrompt ?? state.lastPrompt ?? ''
  const completed = state.completedToolCalls
    .map(c => `- ${c.tool}${c.target ? ` ${c.target}` : ''}`)
    .join('\n')
  return [
    '<resume-context>',
    'This continues a run that was interrupted when the app closed.',
    completed
      ? `The following side-effecting actions ALREADY COMPLETED — do NOT repeat them:\n${completed}`
      : 'No side-effecting actions had completed yet.',
    state.interruptionNote ? `Note: ${state.interruptionNote}` : '',
    state.assistantProgress
      ? `Progress so far:\n${state.assistantProgress}`
      : '',
    '</resume-context>',
    '',
    '<original-request>',
    original,
    '</original-request>',
    '',
    'Continue the original request from where the run left off. Verify the state of already-completed actions instead of redoing them.',
  ]
    .filter(Boolean)
    .join('\n')
}

export interface ResumeResult {
  newRunId: string
  resumePrompt: string
  resumedFrom: string
}

/**
 * Resume an interrupted run: opens the project, starts a fresh session at a
 * safe boundary (a new prompt turn), and returns the continuation prompt for
 * the caller to stream. Links both run states for a traceable lineage.
 */
export async function prepareResume(runId: string): Promise<ResumeResult> {
  const state = await getRunState(runId)
  if (!state) {
    throw new Error(`No persisted state for run ${runId}`)
  }
  if (state.status !== 'interrupted') {
    throw new Error(
      `Run ${runId} is ${state.status}; only interrupted runs can be resumed`,
    )
  }

  // Recover the tail of assistant output from the persisted transcript.
  let assistantProgress = ''
  try {
    const transcript = await readTranscript(runId)
    const textParts: string[] = []
    for (const event of transcript) {
      if (event.type === 'model_stream' && typeof event.delta === 'string') {
        textParts.push(event.delta)
      }
    }
    assistantProgress = textParts.join('').slice(-2000)
  } catch {
    // Transcript may be missing for very early interruptions.
  }

  await openProjectAndCache(state.projectRoot)
  const { runId: newRunId } = await startRun(state.projectRoot, {
    // Resumed runs continue in the main workspace; the interrupted worktree
    // (if any) still exists on disk and is referenced in the run state.
  })

  const resumePrompt = buildResumePrompt({ ...state, assistantProgress })

  patchRunState(runId, { status: 'resumed', resumedBy: newRunId })
  patchRunState(newRunId, { resumedFrom: runId })
  await flushRunStates()

  return { newRunId, resumePrompt, resumedFrom: runId }
}
