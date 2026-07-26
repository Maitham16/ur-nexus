import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  appendSideChatTurn,
  buildMemoryContext,
  captureFileMemory,
  closeSideChat,
  createSideChat,
  getMissionState,
  getSideChat,
  markPlaybookRun,
  reconcileQualityRuns,
  recordPlaybookOutcome,
  resetMissionControlStoreForTests,
  savePlaybook,
  saveQualityProfile,
  saveQualityRun,
  saveUserMemory,
  saveWorkspace,
  validateMemories,
} from './missionControlStore.js'

let dataDir: string
let projectDir: string

beforeEach(async () => {
  dataDir = await mkdtemp(join(tmpdir(), 'ur-mission-data-'))
  projectDir = await mkdtemp(join(tmpdir(), 'ur-mission-project-'))
  process.env.UR_DESKTOP_DATA_DIR = dataDir
  await resetMissionControlStoreForTests()
})

afterEach(async () => {
  await resetMissionControlStoreForTests()
  delete process.env.UR_DESKTOP_DATA_DIR
  await rm(dataDir, { recursive: true, force: true })
  await rm(projectDir, { recursive: true, force: true })
})

describe('mission control store', () => {
  it('persists playbooks, side chats, workspaces, and quality profiles', async () => {
    const secondProject = await mkdtemp(join(tmpdir(), 'ur-mission-repo-'))
    try {
      const playbook = await savePlaybook({
        projectRoot: projectDir,
        name: 'Release readiness',
        prompt: 'Run the release checks and report evidence.',
        tags: ['release', 'quality'],
      })
      const chat = await createSideChat(projectDir, 'Quick research')
      await appendSideChatTurn(chat.id, { role: 'user', content: 'What changed?' })
      const workspace = await saveWorkspace({
        name: 'Product',
        repositories: [{ root: projectDir }, { root: secondProject }],
      })
      const profile = await saveQualityProfile({
        projectRoot: projectDir,
        name: 'Production',
        command: 'bun test',
        autoFix: true,
      })

      await resetMissionControlStoreForTests()
      const snapshot = await getMissionState(projectDir)
      expect(snapshot.playbooks[0]?.id).toBe(playbook.id)
      expect(snapshot.playbooks[0]?.tags).toEqual(['release', 'quality'])
      expect(snapshot.sideChats[0]?.turns[0]?.content).toBe('What changed?')
      expect(snapshot.workspaces[0]?.id).toBe(workspace.id)
      expect(snapshot.qualityProfiles[0]?.id).toBe(profile.id)

      const stored = JSON.parse(
        await readFile(join(dataDir, 'mission-control.json'), 'utf-8'),
      ) as { version: number }
      expect(stored.version).toBe(1)
    } finally {
      await rm(secondProject, { recursive: true, force: true })
    }
  })

  it('captures file citations and marks them stale after source changes', async () => {
    await mkdir(join(projectDir, 'docs'), { recursive: true })
    await writeFile(
      join(projectDir, 'docs', 'architecture.md'),
      ['# Architecture', 'The runtime is local-first.', 'Evidence is retained.'].join('\n'),
    )
    const memory = await captureFileMemory({
      projectRoot: projectDir,
      path: 'docs/architecture.md',
      title: 'Architecture contract',
      lineStart: 2,
      lineEnd: 3,
    })
    expect(memory.freshness).toBe('fresh')
    expect(memory.content).toContain('local-first')
    expect(await buildMemoryContext(projectDir, [memory.id])).toContain(
      'file:docs/architecture.md:2-3 (fresh)',
    )

    await writeFile(
      join(projectDir, 'docs', 'architecture.md'),
      '# Architecture\nThe runtime changed.\n',
    )
    const validated = await validateMemories(projectDir)
    expect(validated[0]?.freshness).toBe('stale')
  })

  it('keeps user-authored research memory cited and scoped to its project', async () => {
    await saveUserMemory({
      projectRoot: projectDir,
      title: 'Research decision',
      content: 'Prefer evidence-scored hybrid judging.',
      source: 'User decision on 2026-07-26',
    })
    const otherProject = await mkdtemp(join(tmpdir(), 'ur-mission-other-'))
    try {
      expect((await getMissionState(projectDir)).memories).toHaveLength(1)
      expect((await getMissionState(otherProject)).memories).toHaveLength(0)
    } finally {
      await rm(otherProject, { recursive: true, force: true })
    }
  })

  it('quarantines a corrupt store instead of blocking the desktop', async () => {
    await writeFile(join(dataDir, 'mission-control.json'), '{broken')
    await resetMissionControlStoreForTests()

    const snapshot = await getMissionState(projectDir)
    expect(snapshot.playbooks).toEqual([])
    expect(
      (await readdir(dataDir)).some(name =>
        name.startsWith('mission-control.corrupt-') && name.endsWith('.json'),
      ),
    ).toBe(true)
  })

  it('records playbook outcomes and reconciles interrupted quality runs', async () => {
    const playbook = await savePlaybook({
      projectRoot: projectDir,
      name: 'Verified release',
      prompt: 'Run the release checks.',
    })
    await markPlaybookRun(playbook.id)
    await recordPlaybookOutcome(playbook.id, true)
    await saveQualityRun({
      id: 'quality-running',
      projectRoot: projectDir,
      name: 'Production',
      kind: 'agentic-ci',
      status: 'running',
      startedAt: new Date().toISOString(),
    })

    expect(await reconcileQualityRuns()).toBe(1)
    const snapshot = await getMissionState(projectDir)
    expect(snapshot.playbooks[0]?.runCount).toBe(1)
    expect(snapshot.playbooks[0]?.successCount).toBe(1)
    expect(snapshot.qualityRuns[0]?.status).toBe('failed')
    expect(snapshot.qualityRuns[0]?.summary).toContain('desktop exited')
  })

  it('retains an in-flight side-chat answer when the chat closes', async () => {
    const chat = await createSideChat(projectDir)
    await appendSideChatTurn(chat.id, { role: 'user', content: 'Question' })
    await closeSideChat(chat.id)
    await appendSideChatTurn(
      chat.id,
      { role: 'assistant', content: 'Completed answer' },
      true,
    )

    const stored = await getSideChat(chat.id)
    expect(stored.status).toBe('closed')
    expect(stored.turns.at(-1)?.content).toBe('Completed answer')
  })

  it('rejects oversized mutations without corrupting in-memory state', async () => {
    const chat = await createSideChat(projectDir)
    await expect(
      appendSideChatTurn(chat.id, {
        role: 'assistant',
        content: 'x'.repeat(17 * 1024 * 1024),
      }),
    ).rejects.toThrow(/16 MiB limit/)
    expect((await getSideChat(chat.id)).turns).toHaveLength(0)
  })
})
