import { randomUUID } from 'node:crypto'
import { promises as fs } from 'node:fs'
import * as path from 'node:path'
import type {
  ArenaJudgeMode,
  BackgroundAgentDto,
  CreateSideChatRequestDto,
  DesktopArenaDto,
  LaunchArenaRequestDto,
  LaunchWorkspaceRequestDto,
  MissionControlSnapshotDto,
  QualityRunDto,
  RunPlaybookRequestDto,
  SendSideChatRequestDto,
} from '../shared/ipc.js'
import {
  getBackgroundAgent,
  launchBackgroundAgent,
  listBackgroundAgents,
} from './agents/backgroundAgents.js'
import {
  openProjectAndCache,
  runPromptStream,
  startRun,
} from './runtime.js'
import { runStructuredTests } from './testRunner.js'
import { getElectron } from './electronModule.js'
import { getAppDataPath } from './utils/appDataPath.js'
import {
  appendSideChatTurn,
  buildMemoryContext,
  createSideChat,
  getArena,
  getMissionState,
  getPlaybook,
  getQualityProfile,
  getSideChat,
  getWorkspace,
  markPlaybookRun,
  markWorkspaceRun,
  reconcileQualityRuns,
  saveArena,
  saveQualityRun,
} from './missionControlStore.js'

const MAX_MODEL_JUDGE_CHARS = 28_000
const MAX_QUALITY_OUTPUT_CHARS = 32_000
const activeQualityRuns = new Set<string>()

function id(prefix: string): string {
  return `${prefix}-${randomUUID().slice(0, 10)}`
}

function requiredText(value: string, label: string, max = 32_000): string {
  const normalized = value.trim()
  if (!normalized) throw new Error(`${label} cannot be empty`)
  if (normalized.length > max) throw new Error(`${label} exceeds ${max} characters`)
  return normalized
}

function memoryPrompt(context: string): string {
  return context
    ? `\n\nUse the following cited project memory. Treat stale citations as context to verify, not fact:\n${context}`
    : ''
}

async function refreshArenaStatuses(
  arenas: DesktopArenaDto[],
): Promise<DesktopArenaDto[]> {
  return Promise.all(arenas.map(async arena => {
    if (arena.status !== 'running') return arena
    const agents = await Promise.all(
      arena.candidates.map(candidate => getBackgroundAgent(candidate.agentId)),
    )
    const active = agents.some(agent =>
      agent?.status === 'queued' || agent?.status === 'running',
    )
    if (active) return arena
    const next = {
      ...arena,
      status: agents.some(agent => agent?.status === 'done') ? 'ready' : 'failed',
    } as DesktopArenaDto
    await saveArena(next)
    return next
  }))
}

export async function missionControlSnapshot(
  projectRoot?: string,
): Promise<MissionControlSnapshotDto> {
  await reconcileQualityRuns([...activeQualityRuns])
  const [state, agents] = await Promise.all([
    getMissionState(projectRoot),
    listBackgroundAgents(projectRoot),
  ])
  return {
    agents,
    playbooks: state.playbooks,
    memories: state.memories,
    sideChats: state.sideChats,
    workspaces: state.workspaces,
    arenas: await refreshArenaStatuses(state.arenas),
    qualityProfiles: state.qualityProfiles,
    qualityRuns: state.qualityRuns,
  }
}

export async function runPlaybook(
  input: RunPlaybookRequestDto,
): Promise<BackgroundAgentDto> {
  const playbook = await getPlaybook(input.id)
  const context = input.context?.trim()
  const memory = await buildMemoryContext(playbook.projectRoot, input.memoryIds ?? [])
  const prompt = [
    playbook.prompt,
    context ? `\n\nAdditional task context:\n${context}` : '',
    memoryPrompt(memory),
  ].join('')
  const agent = await launchBackgroundAgent({
    projectRoot: playbook.projectRoot,
    prompt,
    useWorktree: input.useWorktree !== false,
    sourcePlaybookId: playbook.id,
  })
  await markPlaybookRun(playbook.id)
  return agent
}

export async function launchWorkspaceRun(
  input: LaunchWorkspaceRequestDto,
): Promise<BackgroundAgentDto[]> {
  const workspace = await getWorkspace(input.id)
  const prompt = requiredText(input.prompt, 'Workspace prompt')
  const agents: BackgroundAgentDto[] = []
  for (const repository of workspace.repositories) {
    const memory = await buildMemoryContext(repository.root, input.memoryIds ?? [])
    agents.push(await launchBackgroundAgent({
      projectRoot: repository.root,
      useWorktree: input.useWorktrees !== false,
      prompt: [
        `You are one member of the "${workspace.name}" multi-repository operation.`,
        `Your assigned repository is "${repository.label}" at ${repository.root}.`,
        'Work only in this repository. Report cross-repository dependencies explicitly.',
        `\nTask:\n${prompt}`,
        memoryPrompt(memory),
      ].join('\n'),
    }))
  }
  await markWorkspaceRun(workspace.id, prompt, agents.map(agent => agent.id))
  return agents
}

export async function launchArena(
  input: LaunchArenaRequestDto,
): Promise<DesktopArenaDto> {
  const projectRoot = path.resolve(requiredText(input.projectRoot, 'Project root', 4_096))
  const prompt = requiredText(input.prompt, 'Arena prompt')
  const count = Math.max(2, Math.min(4, Math.floor(input.candidates ?? 3)))
  const mode: ArenaJudgeMode = input.mode ?? 'hybrid'
  const roles = [
    'Primary implementer — favor a complete, maintainable solution.',
    'Reliability specialist — favor correctness, tests, and failure handling.',
    'Simplicity specialist — favor the smallest robust implementation.',
    'Adversarial reviewer — find hidden gaps, then implement a stronger solution.',
  ]
  const memory = await buildMemoryContext(projectRoot, input.memoryIds ?? [])
  const candidates = []
  for (let index = 0; index < count; index++) {
    const role = roles[index]!
    const agent = await launchBackgroundAgent({
      projectRoot,
      useWorktree: true,
      prompt: [
        'You are an independently evaluated arena candidate.',
        role,
        'Do not coordinate with other candidates. Implement and verify your answer in your isolated worktree.',
        `\nTask:\n${prompt}`,
        memoryPrompt(memory),
      ].join('\n'),
    })
    candidates.push({
      id: `candidate-${index + 1}`,
      agentId: agent.id,
      role,
    })
  }
  return saveArena({
    id: id('arena'),
    projectRoot,
    prompt,
    mode,
    status: 'running',
    createdAt: new Date().toISOString(),
    candidates,
  })
}

function deterministicCandidateScore(agent: BackgroundAgentDto): {
  score: number
  rationale: string
} {
  const completion = agent.status === 'done' ? 30 : 0
  const trajectory = Math.round((agent.trajectory.score ?? 0) * 0.5)
  const evidence = Math.min(15, agent.changedFiles.length * 3 + (agent.resultText ? 3 : 0))
  const penalty = agent.error ? 25 : 0
  const score = Math.max(0, Math.min(100, completion + trajectory + evidence - penalty))
  return {
    score,
    rationale: `${agent.status}; trajectory ${agent.trajectory.score ?? 0}; ${agent.changedFiles.length} changed file(s); ${agent.error ? 'runtime error' : 'no runtime error'}.`,
  }
}

function parseJudgeResponse(
  output: string,
  allowedAgentIds: Set<string>,
): { winnerAgentId: string; verdict: string } | null {
  const candidates = [
    output,
    output.match(/```(?:json)?\s*([\s\S]*?)```/iu)?.[1] ?? '',
    output.match(/\{[\s\S]*\}/u)?.[0] ?? '',
  ]
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate.trim()) as {
        winnerAgentId?: unknown
        verdict?: unknown
      }
      if (
        typeof parsed.winnerAgentId === 'string' &&
        allowedAgentIds.has(parsed.winnerAgentId)
      ) {
        return {
          winnerAgentId: parsed.winnerAgentId,
          verdict:
            typeof parsed.verdict === 'string'
              ? parsed.verdict.slice(0, 4_000)
              : 'Selected by the model judge.',
        }
      }
    } catch {
      // Try the next bounded representation.
    }
  }
  return null
}

async function modelJudgeArena(
  arena: DesktopArenaDto,
  agents: BackgroundAgentDto[],
): Promise<{ winnerAgentId: string; verdict: string }> {
  await openProjectAndCache(arena.projectRoot)
  const session = await startRun(arena.projectRoot, {
    ephemeral: true,
    permissions: {
      approvalPolicy: 'on-request',
      sandboxMode: 'read-only',
      networkAccess: false,
    },
  })
  const candidateText = agents.map(agent => {
    const result = (agent.resultText ?? '').slice(-6_000)
    return [
      `Candidate ${agent.id}`,
      `Status: ${agent.status}`,
      `Changed files: ${agent.changedFiles.join(', ') || 'none'}`,
      `Trajectory: ${agent.trajectory.score ?? 0}/100`,
      `Result:\n${result || '(no result text)'}`,
    ].join('\n')
  }).join('\n\n---\n\n').slice(0, MAX_MODEL_JUDGE_CHARS)
  const prompt = [
    'Act as an independent software-engineering arena judge.',
    'Compare only the supplied evidence. Reward correctness, verification, maintainability, and task coverage.',
    `Original task:\n${arena.prompt}`,
    `\nCandidates:\n${candidateText}`,
    '\nReturn strict JSON only: {"winnerAgentId":"bg-...","verdict":"concise evidence-based reason"}',
  ].join('\n')
  let output = ''
  let failure: string | null = null
  for await (const event of runPromptStream(session.runId, prompt)) {
    if (event.type === 'model_stream') output += event.delta
    if (event.type === 'run_failed') failure = event.error
  }
  if (failure) throw new Error(`Model judge failed: ${failure}`)
  const parsed = parseJudgeResponse(output, new Set(agents.map(agent => agent.id)))
  if (!parsed) throw new Error('Model judge did not return a valid candidate decision')
  return parsed
}

export async function evaluateArena(arenaId: string): Promise<DesktopArenaDto> {
  const arena = await getArena(arenaId)
  const agents = await Promise.all(
    arena.candidates.map(candidate => getBackgroundAgent(candidate.agentId)),
  )
  if (agents.some(agent => !agent)) throw new Error('An arena candidate record is missing')
  const present = agents as BackgroundAgentDto[]
  if (present.some(agent => agent.status === 'queued' || agent.status === 'running')) {
    throw new Error('Arena candidates are still running')
  }
  if (!present.some(agent => agent.status === 'done')) {
    throw new Error('No arena candidate completed successfully; retry the failed candidates first')
  }
  const scoredCandidates = arena.candidates.map(candidate => {
    const agent = present.find(item => item.id === candidate.agentId)!
    return { ...candidate, ...deterministicCandidateScore(agent) }
  }).sort((left, right) => (right.score ?? 0) - (left.score ?? 0))
  const deterministicWinner = scoredCandidates[0]!
  let decision = {
    winnerAgentId: deterministicWinner.agentId,
    verdict: `Deterministic evidence score ${deterministicWinner.score}/100. ${deterministicWinner.rationale}`,
  }
  if (arena.mode === 'model' || arena.mode === 'hybrid') {
    try {
      const model = await modelJudgeArena(arena, present)
      decision = {
        winnerAgentId: model.winnerAgentId,
        verdict:
          arena.mode === 'hybrid'
            ? `${model.verdict} Deterministic scores: ${scoredCandidates.map(candidate => `${candidate.agentId}=${candidate.score}`).join(', ')}.`
            : model.verdict,
      }
    } catch (error) {
      if (arena.mode === 'model') throw error
      decision.verdict += ` Hybrid model judge was unavailable: ${error instanceof Error ? error.message : String(error)}`
    }
  }
  return saveArena({
    ...arena,
    status: 'evaluated',
    evaluatedAt: new Date().toISOString(),
    candidates: scoredCandidates,
    winnerAgentId: decision.winnerAgentId,
    verdict: decision.verdict,
  })
}

export async function createDurableSideChat(
  input: CreateSideChatRequestDto,
) {
  return createSideChat(input.projectRoot, input.title)
}

export async function sendSideChatMessage(
  input: SendSideChatRequestDto,
) {
  const content = requiredText(input.content, 'Side-chat message')
  const previous = await getSideChat(input.id)
  if (previous.status !== 'open') throw new Error('Side chat is closed')
  await appendSideChatTurn(input.id, { role: 'user', content })
  await openProjectAndCache(previous.projectRoot)
  const history = previous.turns.slice(-16).map(turn =>
    `${turn.role === 'assistant' ? 'Assistant' : turn.role === 'error' ? 'System error' : 'User'}: ${turn.content}`,
  ).join('\n\n')
  const session = await startRun(previous.projectRoot, {
    ephemeral: true,
    permissions: {
      approvalPolicy: 'on-request',
      sandboxMode: 'read-only',
      networkAccess: false,
    },
  })
  const prompt = [
    'This is a durable side conversation for quick research and clarification.',
    'Answer the newest message directly. Do not modify files unless the user explicitly asks in this side chat.',
    history ? `Prior conversation:\n${history}` : '',
    `Newest user message:\n${content}`,
  ].filter(Boolean).join('\n\n')
  let response = ''
  let usage: BackgroundAgentDto['usage']
  let failure: string | null = null
  for await (const event of runPromptStream(session.runId, prompt)) {
    if (event.type === 'model_stream') response += event.delta
    if (event.type === 'run_result') usage = event.usage
    if (event.type === 'run_failed') failure = event.error
  }
  if (failure) {
    return appendSideChatTurn(input.id, {
      role: 'error',
      content: failure,
      runId: session.runId,
    }, true)
  }
  return appendSideChatTurn(input.id, {
    role: 'assistant',
    content: response.trim() || 'The side-chat run completed without response text.',
    runId: session.runId,
    usage,
  }, true)
}

export async function runQualityProfile(profileId: string): Promise<QualityRunDto> {
  const profile = await getQualityProfile(profileId)
  await openProjectAndCache(profile.projectRoot)
  const started = Date.now()
  let run: QualityRunDto = {
    id: id('quality-run'),
    profileId: profile.id,
    projectRoot: profile.projectRoot,
    name: profile.name,
    command: profile.command,
    kind: 'agentic-ci',
    status: 'running',
    startedAt: new Date(started).toISOString(),
  }
  activeQualityRuns.add(run.id)
  try {
    await saveQualityRun(run)
    const result = await runStructuredTests(profile.projectRoot, profile.command)
    const passed = result.exitCode === 0 && !result.denied && !result.runtimeFailure
    let fixAgentId: string | undefined
    if (!passed && profile.autoFix && !result.denied) {
      const agent = await launchBackgroundAgent({
        projectRoot: profile.projectRoot,
        useWorktree: true,
        prompt: [
          `The quality gate "${profile.name}" failed.`,
          `Command: ${profile.command}`,
          'Diagnose the root cause, implement a focused fix in this worktree, rerun the relevant checks, and report evidence.',
          `Failure output:\n${result.output.slice(-12_000)}`,
        ].join('\n\n'),
      })
      fixAgentId = agent.id
    }
    run = {
      ...run,
      status: passed ? 'passed' : 'failed',
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      summary: passed
        ? `${result.passed} passed, ${result.skipped} skipped`
        : result.denied
          ? 'Quality command was not approved'
          : `${result.failed} failed; exit ${result.exitCode}`,
      output: result.output.slice(-MAX_QUALITY_OUTPUT_CHARS),
      fixAgentId,
      checks: [
        {
          label: 'Command executed',
          passed: !result.runtimeFailure && !result.denied,
          detail: result.denied ? 'Execution was denied.' : `Exit code ${result.exitCode}.`,
        },
        {
          label: 'Tests passed',
          passed,
          detail: `${result.passed} passed, ${result.failed} failed, ${result.skipped} skipped.`,
        },
        {
          label: 'Autofix handoff',
          passed: passed || !profile.autoFix || !!fixAgentId,
          detail: fixAgentId ? `Fix agent ${fixAgentId} launched in a worktree.` : 'No fix handoff needed.',
        },
      ],
    }
  } catch (error) {
    run = {
      ...run,
      status: 'failed',
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      summary: error instanceof Error ? error.message : String(error),
    }
  }
  try {
    return await saveQualityRun(run)
  } finally {
    activeQualityRuns.delete(run.id)
  }
}

interface RendererDiagnostic {
  rootReady: boolean
  titlebarReady: boolean
  navigationReady: boolean
  mainReady: boolean
  preloadReady: boolean
  duplicateIds: number
  unnamedControls: number
}

export async function runDesktopSelfQa(projectRoot: string): Promise<QualityRunDto> {
  const root = path.resolve(requiredText(projectRoot, 'Project root', 4_096))
  const started = Date.now()
  const runId = id('desktop-qa')
  let run: QualityRunDto = {
    id: runId,
    projectRoot: root,
    name: 'UR Nexus desktop production QA',
    kind: 'desktop-qa',
    status: 'running',
    startedAt: new Date(started).toISOString(),
  }
  activeQualityRuns.add(run.id)
  try {
    await saveQualityRun(run)
    const electron = await getElectron()
    const window = electron.BrowserWindow.getAllWindows().find(candidate =>
      !candidate.isDestroyed() && candidate.webContents && !candidate.webContents.isDestroyed(),
    )
    if (!window) throw new Error('No live desktop window is available for QA')
    const diagnostic = await window.webContents.executeJavaScript(`
      (() => {
        const controls = [...document.querySelectorAll('button, a, input, textarea, select, [role="button"]')];
        const nameOf = (element) => (
          element.getAttribute('aria-label') ||
          element.getAttribute('title') ||
          element.getAttribute('placeholder') ||
          element.textContent ||
          ''
        ).trim();
        const ids = [...document.querySelectorAll('[id]')].map(element => element.id);
        return {
          rootReady: Boolean(document.querySelector('#root')?.children.length),
          titlebarReady: Boolean(document.querySelector('.titlebar')),
          navigationReady: document.querySelectorAll('.nav-item').length >= 6,
          mainReady: Boolean(document.querySelector('main.main')),
          preloadReady: Boolean(window.urDesktop && typeof window.urDesktop.invoke === 'function'),
          duplicateIds: ids.length - new Set(ids).size,
          unnamedControls: controls.filter(element => !nameOf(element)).length,
        };
      })()
    `, true) as RendererDiagnostic
    const evidenceDir = path.join(await getAppDataPath(), 'qa-evidence')
    await fs.mkdir(evidenceDir, { recursive: true, mode: 0o700 })
    const evidencePath = path.join(evidenceDir, `${runId}.png`)
    const image = await window.capturePage()
    await fs.writeFile(evidencePath, image.toPNG(), { mode: 0o600 })
    const checks = [
      { label: 'Renderer root', passed: diagnostic.rootReady, detail: 'React root rendered content.' },
      { label: 'Native shell', passed: diagnostic.titlebarReady && diagnostic.navigationReady && diagnostic.mainReady, detail: 'Title bar, navigation, and main workspace are present.' },
      { label: 'Preload bridge', passed: diagnostic.preloadReady, detail: 'Typed isolated IPC bridge is available.' },
      { label: 'Unique DOM ids', passed: diagnostic.duplicateIds === 0, detail: `${diagnostic.duplicateIds} duplicate id(s).` },
      { label: 'Accessible controls', passed: diagnostic.unnamedControls === 0, detail: `${diagnostic.unnamedControls} unnamed interactive control(s).` },
    ]
    const passed = checks.every(check => check.passed)
    run = {
      ...run,
      status: passed ? 'passed' : 'failed',
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      summary: `${checks.filter(check => check.passed).length}/${checks.length} desktop checks passed`,
      evidencePath,
      checks,
    }
  } catch (error) {
    run = {
      ...run,
      status: 'failed',
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      summary: error instanceof Error ? error.message : String(error),
    }
  }
  try {
    return await saveQualityRun(run)
  } finally {
    activeQualityRuns.delete(run.id)
  }
}
