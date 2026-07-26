import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon.js'
import { useDesktop, useRuntimeEvents } from '../hooks/useDesktop.js'
import { useProject } from '../state/ProjectContext.js'
import type {
  ArenaJudgeMode,
  MissionControlSnapshotDto,
  RuntimeEvent,
  SideChatDto,
} from '../../shared/ipc.js'

type MissionTab = 'operations' | 'knowledge' | 'workspaces' | 'quality' | 'sidechats'

const EMPTY_SNAPSHOT: MissionControlSnapshotDto = {
  agents: [],
  playbooks: [],
  memories: [],
  sideChats: [],
  workspaces: [],
  arenas: [],
  qualityProfiles: [],
  qualityRuns: [],
}

function shortDate(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusTone(status: string): string {
  if (['done', 'passed', 'evaluated', 'fresh'].includes(status)) return 'success'
  if (['failed', 'interrupted', 'missing', 'stale'].includes(status)) return 'danger'
  if (['running', 'queued', 'ready'].includes(status)) return 'active'
  return 'neutral'
}

export function MissionControlPage() {
  const desktop = useDesktop()
  const { projectRoot, recentProjects } = useProject()
  const [tab, setTab] = useState<MissionTab>('operations')
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const refreshGeneration = useRef(0)

  const refresh = useCallback(async () => {
    if (!desktop) return
    const generation = ++refreshGeneration.current
    try {
      const next = await desktop.getMissionControlSnapshot(projectRoot ?? undefined)
      if (generation === refreshGeneration.current) {
        setSnapshot(next)
        setError(null)
      }
    } catch (reason) {
      if (generation === refreshGeneration.current) {
        setError(reason instanceof Error ? reason.message : String(reason))
      }
    }
  }, [desktop, projectRoot])

  useEffect(() => {
    setSnapshot(EMPTY_SNAPSHOT)
    void refresh()
  }, [refresh])

  useRuntimeEvents((event: RuntimeEvent) => {
    if (
      event.type === 'background_agent_update' ||
      event.type === 'run_finished' ||
      event.type === 'run_failed'
    ) {
      void refresh()
    }
  })

  const act = useCallback(async (
    key: string,
    operation: () => Promise<unknown>,
  ) => {
    setBusy(key)
    setError(null)
    try {
      await operation()
      await refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setBusy(null)
    }
  }, [refresh])

  const activeAgents = snapshot.agents.filter(agent =>
    agent.status === 'running' || agent.status === 'queued',
  )
  const attentionCount =
    snapshot.agents.filter(agent =>
      agent.status === 'failed' || agent.status === 'interrupted',
    ).length +
    snapshot.memories.filter(memory => memory.freshness !== 'fresh').length +
    snapshot.qualityRuns.filter(run => run.status === 'failed').length

  return (
    <div className="page mission-page">
      <div className="mission-header">
        <div>
          <span className="mission-kicker"><i /> Local orchestration plane</span>
          <h1 className="page-title">Mission Control</h1>
          <p className="page-subtitle">
            Run, steer, compare, verify, and retain agent work across projects.
          </p>
        </div>
        <button className="button button-secondary" onClick={() => void refresh()}>
          <Icon name="history" size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="chat-error-banner mission-error">
          <span><Icon name="alert" size={14} /> {error}</span>
          <button className="link-button" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="mission-metrics">
        <Metric label="Active agents" value={activeAgents.length} detail={`${snapshot.agents.length} tracked`} tone={activeAgents.length ? 'active' : 'neutral'} />
        <Metric label="Playbooks" value={snapshot.playbooks.length} detail={`${snapshot.playbooks.reduce((sum, item) => sum + item.runCount, 0)} runs`} />
        <Metric label="Cited memory" value={snapshot.memories.length} detail={`${snapshot.memories.filter(item => item.freshness === 'fresh').length} fresh`} />
        <Metric label="Needs attention" value={attentionCount} detail={attentionCount ? 'Review recommended' : 'All clear'} tone={attentionCount ? 'danger' : 'success'} />
      </div>

      <nav className="mission-tabs" aria-label="Mission control sections">
        {([
          ['operations', 'Operations', 'agents'],
          ['knowledge', 'Knowledge', 'sparkles'],
          ['workspaces', 'Workspaces', 'folder'],
          ['quality', 'Quality', 'check'],
          ['sidechats', 'Side chats', 'chat'],
        ] as const).map(([value, label, icon]) => (
          <button
            key={value}
            className={tab === value ? 'active' : ''}
            onClick={() => setTab(value)}
          >
            <Icon name={icon} size={15} /> {label}
            {value === 'sidechats' && snapshot.sideChats.length > 0 && (
              <span>{snapshot.sideChats.filter(chat => chat.status === 'open').length}</span>
            )}
          </button>
        ))}
      </nav>

      {tab === 'operations' && (
        <OperationsPanel
          snapshot={snapshot}
          projectRoot={projectRoot}
          busy={busy}
          act={act}
        />
      )}
      {tab === 'knowledge' && (
        <KnowledgePanel
          snapshot={snapshot}
          projectRoot={projectRoot}
          busy={busy}
          act={act}
        />
      )}
      {tab === 'workspaces' && (
        <WorkspacesPanel
          snapshot={snapshot}
          projectRoot={projectRoot}
          recentRoots={recentProjects.map(project => project.root)}
          busy={busy}
          act={act}
        />
      )}
      {tab === 'quality' && (
        <QualityPanel
          snapshot={snapshot}
          projectRoot={projectRoot}
          busy={busy}
          act={act}
        />
      )}
      {tab === 'sidechats' && (
        <SideChatsPanel
          chats={snapshot.sideChats}
          projectRoot={projectRoot}
          busy={busy}
          act={act}
        />
      )}
    </div>
  )
}

function Metric({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string
  value: number
  detail: string
  tone?: 'neutral' | 'active' | 'danger' | 'success'
}) {
  return (
    <div className={`mission-metric tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  )
}

interface PanelProps {
  snapshot: MissionControlSnapshotDto
  projectRoot: string | null
  busy: string | null
  act: (key: string, operation: () => Promise<unknown>) => Promise<void>
}

function OperationsPanel({ snapshot, projectRoot, busy, act }: PanelProps) {
  const desktop = useDesktop()
  const [prompt, setPrompt] = useState('')
  const [operation, setOperation] = useState<'agent' | 'arena'>('agent')
  const [useWorktree, setUseWorktree] = useState(true)
  const [candidateCount, setCandidateCount] = useState(3)
  const [judgeMode, setJudgeMode] = useState<ArenaJudgeMode>('hybrid')

  const launch = async () => {
    if (!desktop || !projectRoot || !prompt.trim()) return
    await act('launch-operation', async () => {
      if (operation === 'arena') {
        await desktop.launchArena({
          projectRoot,
          prompt: prompt.trim(),
          candidates: candidateCount,
          mode: judgeMode,
          memoryIds: snapshot.memories
            .filter(memory => memory.freshness !== 'missing')
            .map(memory => memory.id),
        })
      } else {
        await desktop.launchBackgroundAgent({
          projectRoot,
          prompt: prompt.trim(),
          useWorktree,
          memoryIds: snapshot.memories
            .filter(memory => memory.freshness !== 'missing')
            .map(memory => memory.id),
        })
      }
      setPrompt('')
    })
  }

  return (
    <div className="mission-layout mission-operations">
      <section className="mission-panel mission-launcher">
        <div className="mission-panel-heading">
          <div><span>New operation</span><h2>Delegate serious work</h2></div>
          <span className="mission-project-pill"><Icon name="folder" size={13} /> {projectRoot?.split('/').pop() ?? 'No project'}</span>
        </div>
        <div className="mission-segmented">
          <button className={operation === 'agent' ? 'active' : ''} onClick={() => setOperation('agent')}>
            <Icon name="sparkles" size={14} /> Agent
          </button>
          <button className={operation === 'arena' ? 'active' : ''} onClick={() => setOperation('arena')}>
            <Icon name="agents" size={14} /> Arena
          </button>
        </div>
        <textarea
          className="mission-prompt"
          value={prompt}
          onChange={event => setPrompt(event.target.value)}
          placeholder={projectRoot ? 'Describe the outcome, constraints, and proof you expect…' : 'Open a project to launch an operation'}
          disabled={!projectRoot}
          rows={6}
        />
        <div className="mission-launch-footer">
          {operation === 'agent' ? (
            <label><input type="checkbox" checked={useWorktree} onChange={event => setUseWorktree(event.target.checked)} /> Isolated worktree</label>
          ) : (
            <div className="mission-inline-fields">
              <label>Candidates
                <select value={candidateCount} onChange={event => setCandidateCount(Number(event.target.value))}>
                  <option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
                </select>
              </label>
              <label>Judge
                <select value={judgeMode} onChange={event => setJudgeMode(event.target.value as ArenaJudgeMode)}>
                  <option value="hybrid">Hybrid</option>
                  <option value="deterministic">Evidence only</option>
                  <option value="model">Model judge</option>
                </select>
              </label>
            </div>
          )}
          <button className="button" disabled={!projectRoot || !prompt.trim() || busy === 'launch-operation'} onClick={() => void launch()}>
            <Icon name="send" size={14} /> {busy === 'launch-operation' ? 'Launching…' : operation === 'arena' ? 'Launch arena' : 'Launch agent'}
          </button>
        </div>
      </section>

      <section className="mission-panel">
        <div className="mission-panel-heading">
          <div><span>Fleet</span><h2>Agent activity</h2></div>
          <strong>{snapshot.agents.filter(agent => agent.status === 'running' || agent.status === 'queued').length} active</strong>
        </div>
        <div className="mission-agent-feed">
          {snapshot.agents.length === 0 && <Empty icon="agents" text="No managed agents yet." />}
          {snapshot.agents.slice(0, 10).map(agent => (
            <div className="mission-agent-item" key={agent.id}>
              <span className={`mission-status-dot tone-${statusTone(agent.status)}`} />
              <div>
                <strong>{agent.title}</strong>
                <small>{agent.id} · {shortDate(agent.lastActivityAt ?? agent.createdAt)}</small>
              </div>
              <span className={`mission-badge tone-${statusTone(agent.status)}`}>{agent.status}</span>
              <span className="mission-score">{agent.trajectory.score ?? '—'}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mission-panel mission-span">
        <div className="mission-panel-heading">
          <div><span>Competitive evaluation</span><h2>Arenas</h2></div>
          <small>Independent worktrees · anonymous evidence · deterministic/model/hybrid judge</small>
        </div>
        <div className="mission-card-grid">
          {snapshot.arenas.length === 0 && <Empty icon="layers" text="Launch an arena to compare independent solutions." />}
          {snapshot.arenas.map(arena => (
            <article className="mission-record-card" key={arena.id}>
              <header>
                <span className={`mission-badge tone-${statusTone(arena.status)}`}>{arena.status}</span>
                <small>{arena.mode} judge</small>
              </header>
              <h3>{arena.prompt}</h3>
              <div className="arena-candidates">
                {arena.candidates.map(candidate => (
                  <span key={candidate.id} className={arena.winnerAgentId === candidate.agentId ? 'winner' : ''}>
                    {candidate.agentId} {candidate.score !== undefined ? `· ${candidate.score}` : ''}
                  </span>
                ))}
              </div>
              {arena.verdict && <p>{arena.verdict}</p>}
              <footer>
                <span>{shortDate(arena.createdAt)}</span>
                {arena.status === 'ready' && (
                  <button
                    className="button button-secondary button-small"
                    disabled={busy === `arena-${arena.id}`}
                    onClick={() => void act(`arena-${arena.id}`, () => desktop!.evaluateArena(arena.id))}
                  >
                    <Icon name="check" size={13} /> Evaluate
                  </button>
                )}
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function KnowledgePanel({ snapshot, projectRoot, busy, act }: PanelProps) {
  const desktop = useDesktop()
  const [playbookName, setPlaybookName] = useState('')
  const [playbookPrompt, setPlaybookPrompt] = useState('')
  const [playbookContext, setPlaybookContext] = useState<Record<string, string>>({})
  const [memoryMode, setMemoryMode] = useState<'file' | 'note'>('file')
  const [memoryTitle, setMemoryTitle] = useState('')
  const [memorySource, setMemorySource] = useState('')
  const [memoryContent, setMemoryContent] = useState('')

  const createPlaybook = async () => {
    if (!desktop || !projectRoot || !playbookName.trim() || !playbookPrompt.trim()) return
    await act('save-playbook', async () => {
      await desktop.savePlaybook({
        projectRoot,
        name: playbookName,
        prompt: playbookPrompt,
        description: 'Reusable desktop mission-control playbook',
        tags: ['desktop'],
      })
      setPlaybookName('')
      setPlaybookPrompt('')
    })
  }

  const saveMemory = async () => {
    if (!desktop || !projectRoot || !memoryTitle.trim()) return
    await act('save-memory', async () => {
      if (memoryMode === 'file') {
        await desktop.captureFileMemory({
          projectRoot,
          path: memorySource,
          title: memoryTitle,
          content: memoryContent || undefined,
        })
      } else {
        await desktop.saveMemory({
          projectRoot,
          title: memoryTitle,
          content: memoryContent,
          source: memorySource || undefined,
        })
      }
      setMemoryTitle('')
      setMemorySource('')
      setMemoryContent('')
    })
  }

  return (
    <div className="mission-layout">
      <section className="mission-panel">
        <div className="mission-panel-heading"><div><span>Reusable expertise</span><h2>Learned playbooks</h2></div></div>
        <div className="mission-form">
          <input value={playbookName} onChange={event => setPlaybookName(event.target.value)} placeholder="Playbook name" />
          <textarea value={playbookPrompt} onChange={event => setPlaybookPrompt(event.target.value)} placeholder="A proven prompt or operating procedure…" rows={4} />
          <button className="button" disabled={!projectRoot || !playbookName.trim() || !playbookPrompt.trim() || busy === 'save-playbook'} onClick={() => void createPlaybook()}>
            <Icon name="plus" size={14} /> Save playbook
          </button>
        </div>
        <div className="mission-stack">
          {snapshot.playbooks.length === 0 && <Empty icon="sparkles" text="Save a successful agent run or create a playbook." />}
          {snapshot.playbooks.map(playbook => (
            <article className="knowledge-card" key={playbook.id}>
              <header><div><strong>{playbook.name}</strong><small>{playbook.runCount} runs · {playbook.successCount} successful completions</small></div><span>{playbook.status}</span></header>
              <p>{playbook.description || playbook.prompt}</p>
              <input
                value={playbookContext[playbook.id] ?? ''}
                onChange={event => setPlaybookContext(previous => ({ ...previous, [playbook.id]: event.target.value }))}
                placeholder="Optional task context"
              />
              <footer>
                <button className="link-button danger" onClick={() => void act(`delete-playbook-${playbook.id}`, () => desktop!.deletePlaybook(playbook.id))}>Delete</button>
                <button className="button button-secondary button-small" disabled={busy === `run-playbook-${playbook.id}`} onClick={() => void act(`run-playbook-${playbook.id}`, () => desktop!.runPlaybook({
                  id: playbook.id,
                  context: playbookContext[playbook.id],
                  useWorktree: true,
                  memoryIds: snapshot.memories
                    .filter(memory => memory.freshness !== 'missing')
                    .map(memory => memory.id),
                }))}>
                  <Icon name="send" size={13} /> Run
                </button>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="mission-panel">
        <div className="mission-panel-heading">
          <div><span>Grounded context</span><h2>Cited memory</h2></div>
          <button className="button button-secondary button-small" disabled={!projectRoot || busy === 'validate-memory'} onClick={() => projectRoot && void act('validate-memory', () => desktop!.validateMemories(projectRoot))}>
            Validate all
          </button>
        </div>
        <div className="mission-segmented compact">
          <button className={memoryMode === 'file' ? 'active' : ''} onClick={() => setMemoryMode('file')}>File citation</button>
          <button className={memoryMode === 'note' ? 'active' : ''} onClick={() => setMemoryMode('note')}>Research note</button>
        </div>
        <div className="mission-form">
          <input value={memoryTitle} onChange={event => setMemoryTitle(event.target.value)} placeholder="Memory title" />
          <input value={memorySource} onChange={event => setMemorySource(event.target.value)} placeholder={memoryMode === 'file' ? 'Relative file path, e.g. docs/architecture.md' : 'Source or provenance'} />
          <textarea value={memoryContent} onChange={event => setMemoryContent(event.target.value)} placeholder={memoryMode === 'file' ? 'Optional interpretation; cited lines are captured automatically' : 'Research note content'} rows={3} />
          <button className="button" disabled={!projectRoot || !memoryTitle.trim() || (memoryMode === 'file' && !memorySource.trim()) || (memoryMode === 'note' && !memoryContent.trim()) || busy === 'save-memory'} onClick={() => void saveMemory()}>
            <Icon name="plus" size={14} /> Capture memory
          </button>
        </div>
        <div className="mission-stack">
          {snapshot.memories.length === 0 && <Empty icon="file" text="Capture source-backed facts for future agents." />}
          {snapshot.memories.map(memory => (
            <article className="knowledge-card memory-card" key={memory.id}>
              <header>
                <div><strong>{memory.title}</strong><small>{memory.citation.kind}:{memory.citation.source}</small></div>
                <span className={`mission-badge tone-${statusTone(memory.freshness)}`}>{memory.freshness}</span>
              </header>
              <p>{memory.content}</p>
              <small>{memory.validationMessage}</small>
              <footer><span>{shortDate(memory.citation.capturedAt)}</span><button className="link-button danger" onClick={() => void act(`delete-memory-${memory.id}`, () => desktop!.deleteMemory(memory.id))}>Delete</button></footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function WorkspacesPanel({
  snapshot,
  projectRoot,
  recentRoots,
  busy,
  act,
}: PanelProps & { recentRoots: string[] }) {
  const desktop = useDesktop()
  const [name, setName] = useState('')
  const [roots, setRoots] = useState(() => projectRoot ?? recentRoots.slice(0, 2).join('\n'))
  const [prompts, setPrompts] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!roots && projectRoot) setRoots(projectRoot)
  }, [projectRoot, roots])

  const save = async () => {
    if (!desktop || !name.trim()) return
    const repositories = roots.split(/\r?\n/u).map(root => root.trim()).filter(Boolean)
    await act('save-workspace', async () => {
      await desktop.saveWorkspace({ name, repositories: repositories.map(root => ({ root })) })
      setName('')
    })
  }

  return (
    <div className="mission-layout mission-workspaces">
      <section className="mission-panel">
        <div className="mission-panel-heading"><div><span>Repository topology</span><h2>Create workspace</h2></div></div>
        <div className="mission-form">
          <input value={name} onChange={event => setName(event.target.value)} placeholder="Workspace name" />
          <textarea value={roots} onChange={event => setRoots(event.target.value)} rows={6} placeholder="One absolute repository path per line" />
          <small>Each repository gets an isolated agent and worktree. Instructions include an explicit cross-repository handoff contract.</small>
          <button className="button" disabled={!name.trim() || !roots.trim() || busy === 'save-workspace'} onClick={() => void save()}>
            <Icon name="plus" size={14} /> Save workspace
          </button>
        </div>
      </section>
      <section className="mission-panel mission-workspace-list">
        <div className="mission-panel-heading"><div><span>Managed fanout</span><h2>Multi-repo operations</h2></div></div>
        {snapshot.workspaces.length === 0 && <Empty icon="folder" text="Group repositories to coordinate one operation across all of them." />}
        {snapshot.workspaces.map(workspace => (
          <article className="workspace-card" key={workspace.id}>
            <header><div><strong>{workspace.name}</strong><small>{workspace.repositories.length} repositories</small></div><button className="link-button danger" onClick={() => void act(`delete-workspace-${workspace.id}`, () => desktop!.deleteWorkspace(workspace.id))}>Delete</button></header>
            <div className="workspace-repos">{workspace.repositories.map(repository => <span key={repository.root}><Icon name="folder" size={12} /> {repository.label}</span>)}</div>
            <textarea value={prompts[workspace.id] ?? ''} onChange={event => setPrompts(previous => ({ ...previous, [workspace.id]: event.target.value }))} rows={3} placeholder="Describe the coordinated outcome…" />
            <footer>
              <small>{workspace.lastRun ? `Last fanout ${shortDate(workspace.lastRun.launchedAt)} · ${workspace.lastRun.agentIds.length} agents` : 'No operation launched yet'}</small>
              <button className="button button-small" disabled={!prompts[workspace.id]?.trim() || busy === `launch-workspace-${workspace.id}`} onClick={() => void act(`launch-workspace-${workspace.id}`, () => desktop!.launchWorkspace({
                id: workspace.id,
                prompt: prompts[workspace.id]!,
                useWorktrees: true,
                memoryIds: snapshot.memories
                  .filter(memory => memory.freshness !== 'missing')
                  .map(memory => memory.id),
              }))}>
                <Icon name="agents" size={13} /> Fan out
              </button>
            </footer>
          </article>
        ))}
      </section>
    </div>
  )
}

function QualityPanel({ snapshot, projectRoot, busy, act }: PanelProps) {
  const desktop = useDesktop()
  const [name, setName] = useState('')
  const [command, setCommand] = useState('')
  const [autoFix, setAutoFix] = useState(true)

  const save = async () => {
    if (!desktop || !projectRoot || !name.trim() || !command.trim()) return
    await act('save-quality', async () => {
      await desktop.saveQualityProfile({ projectRoot, name, command, autoFix })
      setName('')
      setCommand('')
    })
  }

  return (
    <div className="mission-layout">
      <section className="mission-panel">
        <div className="mission-panel-heading"><div><span>Agentic CI</span><h2>Quality gates</h2></div></div>
        <div className="mission-form">
          <input value={name} onChange={event => setName(event.target.value)} placeholder="Gate name, e.g. Production test" />
          <input value={command} onChange={event => setCommand(event.target.value)} placeholder="Test command" />
          <label className="mission-check"><input type="checkbox" checked={autoFix} onChange={event => setAutoFix(event.target.checked)} /> Launch an isolated fix agent when the gate fails</label>
          <button className="button" disabled={!projectRoot || !name.trim() || !command.trim() || busy === 'save-quality'} onClick={() => void save()}>
            <Icon name="plus" size={14} /> Save gate
          </button>
        </div>
        <div className="quality-profiles">
          {snapshot.qualityProfiles.length === 0 && <Empty icon="check" text="Save a repeatable test, lint, build, or release gate." />}
          {snapshot.qualityProfiles.map(profile => (
            <article key={profile.id}>
              <div><strong>{profile.name}</strong><code>{profile.command}</code><small>{profile.autoFix ? 'Autofix handoff enabled' : 'Report only'}</small></div>
              <span>
                <button className="link-button danger" onClick={() => void act(`delete-quality-${profile.id}`, () => desktop!.deleteQualityProfile(profile.id))}>Delete</button>
                <button className="button button-secondary button-small" disabled={busy === `run-quality-${profile.id}`} onClick={() => void act(`run-quality-${profile.id}`, () => desktop!.runQualityProfile(profile.id))}>
                  <Icon name="terminal" size={13} /> Run
                </button>
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="mission-panel desktop-qa-panel">
        <div className="mission-panel-heading"><div><span>Native evidence</span><h2>Desktop production QA</h2></div><Icon name="shield" size={20} /></div>
        <p>Inspect the live Electron renderer, preload bridge, shell structure, DOM integrity, and accessible control names. A timestamped screenshot is retained as local evidence.</p>
        <button className="button" disabled={!projectRoot || busy === 'desktop-qa'} onClick={() => projectRoot && void act('desktop-qa', () => desktop!.runDesktopQa(projectRoot))}>
          <Icon name="sparkles" size={14} /> {busy === 'desktop-qa' ? 'Running QA…' : 'Run desktop QA'}
        </button>
      </section>

      <section className="mission-panel mission-span">
        <div className="mission-panel-heading"><div><span>Evidence ledger</span><h2>Quality runs</h2></div></div>
        <div className="quality-run-grid">
          {snapshot.qualityRuns.length === 0 && <Empty icon="history" text="Quality results and evidence will appear here." />}
          {snapshot.qualityRuns.map(run => (
            <article className="quality-run-card" key={run.id}>
              <header><span className={`mission-badge tone-${statusTone(run.status)}`}>{run.status}</span><small>{run.kind}</small></header>
              <h3>{run.name}</h3>
              <p>{run.summary ?? 'Run in progress…'}</p>
              {run.checks && <div className="quality-checks">{run.checks.map(check => <span key={check.label} className={check.passed ? 'passed' : 'failed'}><Icon name={check.passed ? 'check' : 'x'} size={12} /> {check.label}</span>)}</div>}
              <footer>
                <span>{shortDate(run.finishedAt ?? run.startedAt)}{run.durationMs !== undefined ? ` · ${(run.durationMs / 1000).toFixed(1)}s` : ''}</span>
                {run.evidencePath && <button className="link-button" onClick={() => void desktop?.revealInFinder(run.evidencePath!)}>Reveal evidence</button>}
                {run.fixAgentId && <span>Fix: {run.fixAgentId}</span>}
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function SideChatsPanel({
  chats,
  projectRoot,
  busy,
  act,
}: {
  chats: SideChatDto[]
  projectRoot: string | null
  busy: string | null
  act: (key: string, operation: () => Promise<unknown>) => Promise<void>
}) {
  const desktop = useDesktop()
  const [selectedId, setSelectedId] = useState<string | null>(chats.find(chat => chat.status === 'open')?.id ?? null)
  const [detail, setDetail] = useState<SideChatDto | null>(null)
  const [input, setInput] = useState('')

  useEffect(() => {
    if (!selectedId && chats.length) setSelectedId(chats[0]!.id)
    if (selectedId && !chats.some(chat => chat.id === selectedId)) setSelectedId(chats[0]?.id ?? null)
  }, [chats, selectedId])

  useEffect(() => {
    if (!desktop || !selectedId) {
      setDetail(null)
      return
    }
    void desktop.getSideChat(selectedId).then(setDetail)
  }, [desktop, selectedId, chats])

  const create = async () => {
    if (!desktop || !projectRoot) return
    let created: SideChatDto | null = null
    await act('create-sidechat', async () => {
      created = await desktop.createSideChat({ projectRoot })
    })
    if (created) setSelectedId((created as SideChatDto).id)
  }

  const send = async () => {
    if (!desktop || !detail || !input.trim()) return
    const content = input.trim()
    setInput('')
    await act(`send-sidechat-${detail.id}`, async () => {
      setDetail(await desktop.sendSideChatMessage({ id: detail.id, content }))
    })
  }

  return (
    <div className="sidechat-shell">
      <aside>
        <button className="button sidechat-new" disabled={!projectRoot || busy === 'create-sidechat'} onClick={() => void create()}>
          <Icon name="plus" size={14} /> New side chat
        </button>
        <div>
          {chats.length === 0 && <Empty icon="chat" text="Keep quick research out of the main agent thread." />}
          {chats.map(chat => (
            <button key={chat.id} className={selectedId === chat.id ? 'active' : ''} onClick={() => setSelectedId(chat.id)}>
              <Icon name="chat" size={14} />
              <span><strong>{chat.title}</strong><small>{chat.turns.length} turns · {shortDate(chat.updatedAt)}</small></span>
              {chat.status === 'closed' && <i>closed</i>}
            </button>
          ))}
        </div>
      </aside>
      <section className="sidechat-conversation">
        {!detail ? (
          <Empty icon="chat" text="Select or create a durable side chat." />
        ) : (
          <>
            <header>
              <div><span>Durable side thread</span><h2>{detail.title}</h2></div>
              {detail.status === 'open' && <button className="button button-secondary button-small" disabled={busy === `send-sidechat-${detail.id}`} onClick={() => void act(`close-sidechat-${detail.id}`, () => desktop!.closeSideChat(detail.id))}>Close</button>}
            </header>
            <div className="sidechat-turns">
              {detail.turns.length === 0 && <Empty icon="sparkles" text="Ask a quick question without interrupting the main run." />}
              {detail.turns.map(turn => (
                <article key={turn.id} className={turn.role}>
                  <span>{turn.role}</span>
                  <p>{turn.content}</p>
                  <small>{shortDate(turn.createdAt)}{turn.usage ? ` · ${turn.usage.inputTokens + turn.usage.outputTokens} tokens` : ''}</small>
                </article>
              ))}
              {busy === `send-sidechat-${detail.id}` && <div className="sidechat-thinking"><i /> Side agent is thinking…</div>}
            </div>
            <footer>
              <textarea value={input} onChange={event => setInput(event.target.value)} rows={3} disabled={detail.status === 'closed' || busy === `send-sidechat-${detail.id}`} placeholder={detail.status === 'closed' ? 'This side chat is closed' : 'Ask a focused question…'} onKeyDown={event => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault()
                  void send()
                }
              }} />
              <button className="button" disabled={detail.status === 'closed' || !input.trim() || busy === `send-sidechat-${detail.id}`} onClick={() => void send()}>
                <Icon name="send" size={14} /> Send
              </button>
            </footer>
          </>
        )}
      </section>
    </div>
  )
}

function Empty({ icon, text }: { icon: 'agents' | 'sparkles' | 'file' | 'folder' | 'check' | 'history' | 'chat' | 'layers'; text: string }) {
  return <div className="mission-empty"><Icon name={icon} size={18} /><span>{text}</span></div>
}
