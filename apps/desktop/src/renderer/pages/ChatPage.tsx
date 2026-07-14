import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDesktop, useRuntimeEvents } from '../hooks/useDesktop.js'
import { useProject } from '../state/ProjectContext.js'
import { Icon, type IconName } from '../components/Icon.js'
import {
  DESKTOP_SLASH_COMMANDS,
  expandSlashPrompt,
  filterSlashCommands,
  getSlashCommandQuery,
  parseSlashCommand,
  type DesktopSlashCommand,
} from '../slashCommands.js'
import type {
  RuntimeEvent,
  DesktopProviderInfoDto,
  DesktopModelInfoDto,
  RuntimeAgentInfoDto,
  RuntimeTaskInfoDto,
  ContextFileDto,
  ParsedDiffFileDto,
  RunUsageDto,
  PlanDto,
  PersistedRunStateDto,
  AgentPermissionSettingsDto,
  ApprovalScope,
} from '../../shared/ipc.js'

type Mode = 'ask' | 'edit' | 'agent' | 'plan'

const modeDetails: Record<Mode, { icon: IconName; label: string }> = {
  ask: { icon: 'chat', label: 'Ask' },
  edit: { icon: 'file', label: 'Edit' },
  agent: { icon: 'sparkles', label: 'Agent' },
  plan: { icon: 'plan', label: 'Plan' },
}

const starterPrompts: Array<{ icon: IconName; title: string; prompt: string; mode: Mode }> = [
  {
    icon: 'search',
    title: 'Understand this codebase',
    prompt: 'Analyze this codebase and give me a concise architecture overview, key risks, and the best next improvements.',
    mode: 'ask',
  },
  {
    icon: 'sparkles',
    title: 'Build a feature',
    prompt: 'Implement a production-ready feature in this project. Start by inspecting the existing patterns, then build and verify it end to end.',
    mode: 'agent',
  },
  {
    icon: 'shield',
    title: 'Review quality & security',
    prompt: 'Review this project for correctness, security, performance, and maintainability. Prioritize the findings and fix the highest-impact issues.',
    mode: 'agent',
  },
  {
    icon: 'plan',
    title: 'Plan complex work',
    prompt: 'Create an implementation plan for the next major improvement to this project, including dependencies, verification, and rollout risks.',
    mode: 'plan',
  },
]

const DEFAULT_PERMISSIONS: AgentPermissionSettingsDto = {
  approvalPolicy: 'on-request',
  sandboxMode: 'workspace-write',
  networkAccess: false,
}

type MessageRole =
  | 'user'
  | 'assistant'
  | 'system'
  | 'tool'
  | 'approval'
  | 'diff'
  | 'plan'
  | 'error'
  | 'final_report'

interface BaseMessage {
  id: string
  role: MessageRole
  runId?: string
  timestamp: number
}

interface UserMessage extends BaseMessage {
  role: 'user'
  content: string
  attachments?: string[]
}

interface AssistantMessage extends BaseMessage {
  role: 'assistant'
  content: string
}

interface SystemMessage extends BaseMessage {
  role: 'system'
  content: string
}

interface ToolMessage extends BaseMessage {
  role: 'tool'
  toolName: string
  input: Record<string, unknown>
  result?: unknown
  status: 'running' | 'done' | 'error'
}

interface ApprovalMessage extends BaseMessage {
  role: 'approval'
  requestId: string
  toolName: string
  input: Record<string, unknown>
  actionType?: string
  target?: string
  reason?: string
  riskLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical'
  approvalProjectRoot?: string
  responded?: boolean
  approved?: boolean
  scope?: ApprovalScope
}

interface DiffMessage extends BaseMessage {
  role: 'diff'
  diffId: string
  filePath: string
  patch: string
  baseHashes?: Record<string, string>
  applied?: boolean
  rejected?: boolean
  /** Per-hunk decisions, keyed by global hunk index. */
  hunkStates?: Record<number, 'applied' | 'rejected'>
  stale?: boolean
}

interface PlanMessage extends BaseMessage {
  role: 'plan'
  plan: PlanDto
  planStatus: 'draft' | 'running' | 'done' | 'failed'
  results?: Array<{ id: string; status: string; error?: string }>
}

interface ErrorMessage extends BaseMessage {
  role: 'error'
  content: string
}

interface FinalReportMessage extends BaseMessage {
  role: 'final_report'
  content: string
  path?: string
}

type ChatMessage =
  | UserMessage
  | AssistantMessage
  | SystemMessage
  | ToolMessage
  | ApprovalMessage
  | DiffMessage
  | PlanMessage
  | ErrorMessage
  | FinalReportMessage

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function formatTokens(count: number): string {
  if (count < 1000) return String(count)
  return `${(count / 1000).toFixed(1)}k`
}

function describeProgressEvent(event: RuntimeEvent): string | null {
  switch (event.type) {
    case 'task_started':
      return `Task started${(event as { assignedAgent?: string }).assignedAgent ? ` (agent ${(event as { assignedAgent?: string }).assignedAgent})` : ''}`
    case 'task_progress':
      return (event as { message?: string }).message ?? null
    case 'task_done':
      return 'Task completed'
    case 'task_failed':
      return `Task failed: ${(event as { error?: string }).error ?? 'unknown error'}`
    case 'agent_started':
      return `Agent ${(event as { name?: string }).name ?? ''} started`
    case 'agent_progress': {
      const e = event as { message?: string; currentTool?: string }
      return e.currentTool ? `${e.message} — ${e.currentTool}` : e.message ?? null
    }
    case 'agent_finished':
      return null // covered by task/run events; avoid duplicate noise
    case 'verification_completed': {
      const e = event as { passed?: boolean; message?: string }
      return `Verification ${e.passed ? 'passed' : 'failed'}${e.message ? `: ${e.message}` : ''}`
    }
    default:
      return null
  }
}

export function ChatPage() {
  const desktop = useDesktop()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    projectRoot,
    projectName,
    recentProjects,
    openProject,
    openProjectViaDialog,
  } = useProject()

  const [runId, setRunId] = useState<string | null>(null)
  const [worktreeRoot, setWorktreeRoot] = useState<string | undefined>(undefined)
  const [useWorktree, setUseWorktree] = useState(false)
  const [permissions, setPermissions] = useState<AgentPermissionSettingsDto>(DEFAULT_PERMISSIONS)
  const [status, setStatus] = useState<
    'idle' | 'starting' | 'running' | 'paused' | 'waiting_approval'
  >('idle')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [changedFiles, setChangedFiles] = useState<string[]>([])
  const [sendError, setSendError] = useState<string | null>(null)
  const [usage, setUsage] = useState<RunUsageDto | null>(null)

  const [mode, setMode] = useState<Mode>('agent')
  const [input, setInput] = useState('')
  const [planHint, setPlanHint] = useState(false)
  const [slashSelection, setSlashSelection] = useState(0)
  const [slashDismissed, setSlashDismissed] = useState(false)
  const slashQuery = useMemo(() => getSlashCommandQuery(input), [input])
  const slashSuggestions = useMemo(
    () => slashQuery === null ? [] : filterSlashCommands(slashQuery).slice(0, 9),
    [slashQuery],
  )
  const slashMenuOpen = !slashDismissed && slashQuery !== null && slashSuggestions.length > 0

  useEffect(() => {
    setSlashSelection(0)
  }, [slashQuery])

  useEffect(() => {
    if (!desktop) return
    desktop.getAgentPermissions().then(setPermissions).catch(() => {
      setPermissions(DEFAULT_PERMISSIONS)
    })
  }, [desktop])

  // Debounced planning-recommendation check against the real heuristic.
  useEffect(() => {
    if (!desktop || !input.trim()) {
      setPlanHint(false)
      return
    }
    const timer = setTimeout(() => {
      desktop
        .shouldPlan(input)
        .then(setPlanHint)
        .catch(() => setPlanHint(false))
    }, 400)
    return () => clearTimeout(timer)
  }, [desktop, input])
  const [attachments, setAttachments] = useState<ContextFileDto[]>([])
  const [attachmentErrors, setAttachmentErrors] = useState<string[]>([])
  const [lastUserPrompt, setLastUserPrompt] = useState<string | null>(null)

  const [providers, setProviders] = useState<DesktopProviderInfoDto[]>([])
  const [models, setModels] = useState<DesktopModelInfoDto[]>([])
  const [agents, setAgents] = useState<RuntimeAgentInfoDto[]>([])
  const [tasks, setTasks] = useState<RuntimeTaskInfoDto[]>([])
  const [selectedProvider, setSelectedProvider] = useState('')
  const [selectedModel, setSelectedModel] = useState('')

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [interruptedRuns, setInterruptedRuns] = useState<PersistedRunStateDto[]>([])
  const streamRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const runIdRef = useRef<string | null>(null)
  runIdRef.current = runId

  useEffect(() => {
    if (!startTime || status !== 'running') return
    const interval = setInterval(() => setElapsed(Date.now() - startTime), 1000)
    return () => clearInterval(interval)
  }, [startTime, status])

  const scrollToBottom = useCallback(() => {
    streamRef.current?.scrollTo({
      top: streamRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    const textarea = composerRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 72), 180)}px`
  }, [input])

  // A newly opened workspace always starts as a ready, focused thread.
  useEffect(() => {
    if (!projectRoot) return
    const frame = requestAnimationFrame(() => composerRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [projectRoot])

  const refreshProjectState = useCallback(async () => {
    if (!desktop || !projectRoot) return
    try {
      const [p, m, a, t] = await Promise.all([
        desktop.listProviders(projectRoot),
        desktop.listModels(projectRoot),
        desktop.listAgents(projectRoot),
        desktop.listTasks(projectRoot),
      ])
      setProviders(p)
      setModels(m)
      setAgents(a)
      setTasks(t)
      const active = p.find(x => x.active)
      const providerId = active?.id ?? p[0]?.id
      if (active) {
        setSelectedProvider(prev => prev || active.id)
      }
      if (m[0]) setSelectedModel(prev => prev || m[0].id)
      // Discover the live model list for the active provider so the dropdown
      // is populated on load (the static list is often minimal).
      if (providerId) {
        desktop
          .listProviderModels(projectRoot, providerId)
          .then(discovered => {
            if (discovered.length > 0) {
              setModels(discovered)
              setSelectedModel(prev => prev || discovered[0].id)
            }
          })
          .catch(() => {
            // Discovery is best-effort; the static list remains as fallback.
          })
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : String(err))
    }
  }, [desktop, projectRoot])

  useEffect(() => {
    void refreshProjectState()
  }, [refreshProjectState])

  const refreshInterrupted = useCallback(async () => {
    if (!desktop || !projectRoot) {
      setInterruptedRuns([])
      return
    }
    try {
      setInterruptedRuns(await desktop.listInterruptedRuns(projectRoot))
    } catch {
      setInterruptedRuns([])
    }
  }, [desktop, projectRoot])

  useEffect(() => {
    void refreshInterrupted()
  }, [refreshInterrupted])

  const resumeInterrupted = useCallback(
    async (state: PersistedRunStateDto) => {
      if (!desktop) return
      setSendError(null)
      // Restore the prior conversation from the persisted transcript so the
      // resumed run continues in context.
      try {
        const transcript = await desktop.getRunTranscript(state.runId)
        const restored: ChatMessage[] = []
        if (state.pendingPrompt) {
          restored.push({
            id: `restored-user-${state.runId}`,
            role: 'user',
            content: state.pendingPrompt,
            timestamp: Date.now(),
          })
        }
        let assistantText = ''
        for (const event of transcript) {
          if (event.type === 'model_stream' && typeof event.delta === 'string') {
            assistantText += event.delta
          }
        }
        if (assistantText) {
          restored.push({
            id: `restored-assistant-${state.runId}`,
            role: 'assistant',
            content: assistantText,
            timestamp: Date.now(),
          })
        }
        restored.push({
          id: `resume-note-${state.runId}`,
          role: 'system',
          content: `Resuming interrupted run ${state.runId}. ${state.interruptionNote ?? ''} Completed actions will not be repeated.`,
          timestamp: Date.now(),
        })
        setMessages(prev => [...prev, ...restored])
        setStatus('running')
        setStartTime(Date.now())
        const { newRunId } = await desktop.resumeInterruptedRun({ runId: state.runId })
        setRunId(newRunId)
        runIdRef.current = newRunId
      } catch (err) {
        setStatus('idle')
        setSendError(err instanceof Error ? err.message : String(err))
      } finally {
        await refreshInterrupted()
      }
    },
    [desktop, refreshInterrupted],
  )

  const pushSystem = useCallback((event: RuntimeEvent, content: string) => {
    setMessages(prev => [
      ...prev,
      {
        id: `sys-${event.timestamp}-${prev.length}`,
        role: 'system',
        content,
        runId: event.runId,
        timestamp: event.timestamp,
      },
    ])
  }, [])

  const handleEvent = useCallback(
    (event: RuntimeEvent) => {
      // Events are broadcast to all windows; only render those for the
      // active project (terminal-only events carry an empty projectRoot).
      if (projectRoot && event.projectRoot && event.projectRoot !== projectRoot) {
        return
      }
      switch (event.type) {
        case 'run_started': {
          const started = event as { worktreeRoot?: string }
          setStatus('running')
          setStartTime(Date.now())
          setElapsed(0)
          setWorktreeRoot(started.worktreeRoot)
          pushSystem(
            event,
            started.worktreeRoot
              ? `Run started in worktree ${started.worktreeRoot}`
              : 'Run started',
          )
          void refreshProjectState()
          break
        }

        case 'message_created': {
          const e = event as { role: 'user' | 'assistant'; content: string }
          if (e.role === 'assistant') {
            setMessages(prev => [
              ...prev,
              {
                id: `msg-${event.timestamp}`,
                role: 'assistant',
                content: e.content,
                runId: event.runId,
                timestamp: event.timestamp,
              },
            ])
          }
          break
        }

        case 'model_stream': {
          const e = event as { delta: string }
          setMessages(prev => {
            const last = prev[prev.length - 1]
            if (last && last.role === 'assistant') {
              const next = [...prev]
              next[next.length - 1] = {
                ...last,
                content: (last as AssistantMessage).content + e.delta,
              }
              return next
            }
            return [
              ...prev,
              {
                id: `stream-${event.timestamp}`,
                role: 'assistant',
                content: e.delta,
                runId: event.runId,
                timestamp: event.timestamp,
              },
            ]
          })
          break
        }

        case 'plan_created': {
          const e = event as { plan: string }
          pushSystem(event, `Plan:\n${e.plan}`)
          break
        }

        case 'task_created': {
          const e = event as { title: string }
          pushSystem(event, `Task created: ${e.title}`)
          void refreshProjectState()
          break
        }

        case 'task_started':
        case 'task_progress':
        case 'task_done':
        case 'task_failed':
        case 'agent_started':
        case 'agent_progress':
        case 'agent_finished':
        case 'verification_completed': {
          const text = describeProgressEvent(event)
          if (text) pushSystem(event, text)
          void refreshProjectState()
          break
        }

        case 'tool_call_started': {
          const e = event as {
            toolName: string
            input: Record<string, unknown>
          }
          setMessages(prev => [
            ...prev,
            {
              id: `tool-${event.timestamp}`,
              role: 'tool',
              toolName: e.toolName,
              input: e.input,
              status: 'running',
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          break
        }

        case 'tool_call_finished': {
          const e = event as { toolName: string; result: unknown }
          setMessages(prev => {
            const idx = prev.findLastIndex(
              m =>
                m.role === 'tool' &&
                m.toolName === e.toolName &&
                m.status === 'running',
            )
            if (idx === -1) return prev
            const next = [...prev]
            next[idx] = {
              ...next[idx],
              status: 'done',
              result: e.result,
            } as ToolMessage
            return next
          })
          break
        }

        case 'command_started': {
          const e = event as { command: string }
          setMessages(prev => [
            ...prev,
            {
              id: `cmd-${event.timestamp}`,
              role: 'tool',
              toolName: 'Bash',
              input: { command: e.command },
              status: 'running',
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          break
        }

        case 'command_output': {
          const e = event as { output: string }
          setMessages(prev => {
            const idx = prev.findLastIndex(
              m => m.role === 'tool' && m.toolName === 'Bash' && m.status === 'running',
            )
            if (idx === -1) return prev
            const next = [...prev]
            const existing = (next[idx] as ToolMessage).result
            next[idx] = {
              ...next[idx],
              result: `${typeof existing === 'string' ? existing : ''}${e.output}`,
            } as ToolMessage
            return next
          })
          break
        }

        case 'command_finished': {
          const e = event as { exitCode: number; output?: string }
          setMessages(prev => {
            const idx = prev.findLastIndex(
              m => m.role === 'tool' && m.toolName === 'Bash' && m.status === 'running',
            )
            if (idx === -1) return prev
            const next = [...prev]
            next[idx] = {
              ...next[idx],
              status: e.exitCode === 0 ? 'done' : 'error',
              result: e.output ?? (next[idx] as ToolMessage).result,
            } as ToolMessage
            return next
          })
          break
        }

        case 'approval_required': {
          const e = event as {
            requestId: string
            toolName: string
            input: Record<string, unknown>
            actionType?: string
            target?: string
            reason?: string
            riskLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical'
            approvalProjectRoot?: string
          }
          setStatus(prev => (prev === 'running' ? 'waiting_approval' : prev))
          setMessages(prev => [
            ...prev,
            {
              id: `approval-${e.requestId}`,
              role: 'approval',
              requestId: e.requestId,
              toolName: e.toolName,
              input: e.input,
              actionType: e.actionType,
              target: e.target,
              reason: e.reason,
              riskLevel: e.riskLevel,
              approvalProjectRoot: e.approvalProjectRoot,
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          break
        }

        case 'approval_responded': {
          setStatus(prev => (prev === 'waiting_approval' ? 'running' : prev))
          break
        }

        case 'diff_created': {
          const e = event as {
            diffId: string
            filePath: string
            patch: string
            baseHashes?: Record<string, string>
          }
          setMessages(prev => [
            ...prev,
            {
              id: `diff-${e.diffId}`,
              role: 'diff',
              diffId: e.diffId,
              filePath: e.filePath,
              patch: e.patch,
              baseHashes: e.baseHashes,
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          break
        }

        case 'patch_applied': {
          const e = event as { diffId: string; filePath: string }
          setMessages(prev => {
            const idx = prev.findIndex(
              m => m.role === 'diff' && (m as DiffMessage).filePath === e.filePath && !(m as DiffMessage).applied,
            )
            if (idx === -1) return prev
            const next = [...prev]
            next[idx] = { ...next[idx], applied: true } as DiffMessage
            return next
          })
          setChangedFiles(prev => (prev.includes(e.filePath) ? prev : [...prev, e.filePath]))
          break
        }

        case 'changed_files': {
          const e = event as { files: string[] }
          setChangedFiles(prev => Array.from(new Set([...prev, ...e.files])))
          break
        }

        case 'worktree_created': {
          const e = event as { worktreeRoot: string; branch: string }
          pushSystem(event, `Worktree created: ${e.branch}\n${e.worktreeRoot}`)
          break
        }

        case 'usage_updated': {
          const e = event as { usage: RunUsageDto }
          setUsage(e.usage)
          break
        }

        case 'run_result': {
          const e = event as { usage: RunUsageDto }
          setUsage(e.usage)
          break
        }

        case 'run_finished':
          setStatus('idle')
          pushSystem(event, `Run finished in ${formatElapsed(elapsed || 0)}`)
          break

        case 'run_failed': {
          const e = event as { error: string }
          setStatus('idle')
          setMessages(prev => [
            ...prev,
            {
              id: `fail-${event.timestamp}`,
              role: 'error',
              content: e.error,
              runId: event.runId,
              timestamp: event.timestamp,
            },
          ])
          break
        }
      }
    },
    [elapsed, projectRoot, pushSystem, refreshProjectState],
  )

  useRuntimeEvents(handleEvent)

  const ensureRun = useCallback(async (): Promise<string | null> => {
    if (!desktop || !projectRoot) return null
    if (runIdRef.current) return runIdRef.current
    setStatus('starting')
    try {
      // Activate the chosen provider/model first: the session snapshots
      // provider settings at creation time.
      if (selectedProvider) {
        await desktop.updateProvider(
          projectRoot,
          selectedProvider,
          selectedModel || undefined,
        )
      }
      const session = await desktop.startRun(projectRoot, { useWorktree, permissions })
      setRunId(session.sessionId)
      runIdRef.current = session.sessionId
      setWorktreeRoot(session.worktreeRoot)
      setChangedFiles([])
      return session.sessionId
    } catch (err) {
      setStatus('idle')
      setSendError(err instanceof Error ? err.message : String(err))
      return null
    }
  }, [desktop, projectRoot, useWorktree, permissions, selectedProvider, selectedModel])

  const sendPrompt = useCallback(
    async (content: string, files: ContextFileDto[]) => {
      if (!desktop || !content.trim()) return
      setSendError(null)
      const id = await ensureRun()
      if (!id) return
      setMessages(prev => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: 'user',
          content,
          attachments: files.map(f => f.relPath),
          timestamp: Date.now(),
        },
      ])
      setLastUserPrompt(content)
      setStatus('running')
      setStartTime(Date.now())
      setElapsed(0)
      try {
        await desktop.sendMessage(
          id,
          content,
          files.map(f => f.path),
        )
      } catch (err) {
        setStatus('idle')
        setMessages(prev => [
          ...prev,
          {
            id: `senderr-${Date.now()}`,
            role: 'error',
            content: err instanceof Error ? err.message : String(err),
            timestamp: Date.now(),
          },
        ])
      }
    },
    [desktop, ensureRun],
  )

  const generatePlanFromPrompt = useCallback(
    async (content: string) => {
      if (!desktop || !projectRoot) return
      setMessages(prev => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          role: 'user',
          content,
          timestamp: Date.now(),
        },
        {
          id: `plansys-${Date.now()}`,
          role: 'system',
          content: 'Generating a task plan…',
          timestamp: Date.now(),
        },
      ])
      setStatus('starting')
      try {
        const plan = await desktop.generatePlan({ projectRoot, prompt: content })
        setMessages(prev => [
          ...prev,
          {
            id: `plan-${plan.id}`,
            role: 'plan',
            plan,
            planStatus: 'draft',
            timestamp: Date.now(),
          },
        ])
      } catch (err) {
        setMessages(prev => [
          ...prev,
          {
            id: `planerr-${Date.now()}`,
            role: 'error',
            content: err instanceof Error ? err.message : String(err),
            timestamp: Date.now(),
          },
        ])
      } finally {
        setStatus('idle')
      }
    },
    [desktop, projectRoot],
  )

  const executePlanMessage = useCallback(
    async (msg: PlanMessage) => {
      if (!desktop || !projectRoot) return
      setMessages(prev =>
        prev.map(m =>
          m.id === msg.id ? ({ ...m, planStatus: 'running' } as PlanMessage) : m,
        ),
      )
      setStatus('running')
      setStartTime(Date.now())
      setElapsed(0)
      try {
        const result = await desktop.executePlan({ projectRoot, plan: msg.plan })
        const failed = result.tasks.some(t => t.status === 'failed')
        setMessages(prev =>
          prev.map(m =>
            m.id === msg.id
              ? ({
                  ...m,
                  planStatus: failed ? 'failed' : 'done',
                  results: result.tasks,
                } as PlanMessage)
              : m,
          ),
        )
      } catch (err) {
        setMessages(prev =>
          prev.map(m =>
            m.id === msg.id ? ({ ...m, planStatus: 'failed' } as PlanMessage) : m,
          ),
        )
        setSendError(err instanceof Error ? err.message : String(err))
      } finally {
        setStatus('idle')
      }
    },
    [desktop, projectRoot],
  )

  const updatePlanMessage = useCallback(
    (id: string, plan: PlanDto) => {
      setMessages(prev =>
        prev.map(m => (m.id === id ? ({ ...m, plan } as PlanMessage) : m)),
      )
    },
    [],
  )

  const stop = useCallback(async () => {
    if (!desktop || !runId) return
    try {
      await desktop.stopRun(runId)
    } finally {
      setStatus('idle')
    }
  }, [desktop, runId])

  const pause = useCallback(async () => {
    if (!desktop || !runId) return
    await desktop.pauseRun(runId)
    setStatus('paused')
  }, [desktop, runId])

  const resume = useCallback(async () => {
    if (!desktop || !runId) return
    await desktop.resumeRun(runId)
    setStatus('running')
  }, [desktop, runId])

  const regenerate = useCallback(async () => {
    if (!lastUserPrompt) return
    await sendPrompt(lastUserPrompt, [])
  }, [lastUserPrompt, sendPrompt])

  const editAndResend = useCallback(() => {
    if (lastUserPrompt) setInput(lastUserPrompt)
  }, [lastUserPrompt])

  const clearContext = useCallback(() => {
    setMessages([])
    setRunId(null)
    runIdRef.current = null
    setWorktreeRoot(undefined)
    setStatus('idle')
    setStartTime(null)
    setElapsed(0)
    setChangedFiles([])
    setSendError(null)
    setLastUserPrompt(null)
    setUsage(null)
  }, [])

  const selectSlashCommand = useCallback((command: DesktopSlashCommand) => {
    const next = `/${command.name} `
    setInput(next)
    setSlashDismissed(true)
    requestAnimationFrame(() => {
      composerRef.current?.focus()
      composerRef.current?.setSelectionRange(next.length, next.length)
    })
  }, [])

  const executeDesktopSlashCommand = useCallback(
    async (content: string, files: ContextFileDto[]): Promise<boolean> => {
      const parsed = parseSlashCommand(content)
      if (!parsed) return false
      const command = DESKTOP_SLASH_COMMANDS.find(item => item.name === parsed.name)
      if (!command) return false

      const addSystemMessage = (message: string) => {
        setMessages(prev => [
          ...prev,
          { id: `slash-${Date.now()}`, role: 'system', content: message, timestamp: Date.now() },
        ])
      }

      if (command.action === 'navigate' && command.route) {
        navigate(command.route)
        return true
      }

      if (command.action === 'prompt') {
        await sendPrompt(expandSlashPrompt(command.name, parsed.args), files)
        return true
      }

      switch (command.name) {
        case 'help':
          addSystemMessage(
            `Available desktop commands:\n\n${DESKTOP_SLASH_COMMANDS.map(item => `/${item.name}${item.argumentHint ? ` ${item.argumentHint}` : ''} — ${item.description}`).join('\n')}`,
          )
          return true
        case 'new':
        case 'clear':
        case 'compact':
          clearContext()
          return true
        case 'status': {
          const provider = providers.find(item => item.id === selectedProvider)
          const approval = permissions.approvalPolicy === 'never'
            ? 'auto-approve'
            : permissions.approvalPolicy
          addSystemMessage(
            `Provider: ${(provider?.displayName ?? selectedProvider) || 'not selected'}\nModel: ${selectedModel || 'not selected'}\nApproval: ${approval}\nSandbox: ${permissions.sandboxMode}\nNetwork: ${permissions.networkAccess ? 'enabled' : 'disabled'}`,
          )
          return true
        }
        case 'model': {
          if (!parsed.args) {
            navigate('/settings')
            return true
          }
          const wanted = parsed.args.toLowerCase()
          const model = models.find(item =>
            item.id.toLowerCase() === wanted || item.displayName?.toLowerCase() === wanted,
          )
          if (!model || !selectedProvider || !projectRoot) {
            addSystemMessage(`Model "${parsed.args}" is not available for the active provider. Use /model to open provider settings.`)
            return true
          }
          await desktop?.updateProvider(projectRoot, selectedProvider, model.id)
          setSelectedModel(model.id)
          addSystemMessage(`Active model changed to ${model.displayName || model.id}.`)
          return true
        }
        case 'permissions': {
          if (!parsed.args) {
            navigate('/settings')
            return true
          }
          const requested = parsed.args.toLowerCase()
          const approvalPolicy = requested === 'cautious' || requested === 'untrusted'
            ? 'untrusted'
            : requested === 'auto' || requested === 'auto-approve' || requested === 'never'
              ? 'never'
              : requested === 'on-request' || requested === 'request'
                ? 'on-request'
                : null
          if (!approvalPolicy) {
            addSystemMessage('Unknown permission profile. Use /permissions cautious, /permissions on-request, or /permissions auto.')
            return true
          }
          const next = { ...permissions, approvalPolicy } as AgentPermissionSettingsDto
          await desktop?.setAgentPermissions(next)
          setPermissions(next)
          addSystemMessage(`Approval behavior changed to ${requested}. Core denials and sandbox limits remain enforced.`)
          return true
        }
        case 'plan':
          setMode('plan')
          setInput(parsed.args)
          requestAnimationFrame(() => composerRef.current?.focus())
          return true
        case 'checkpoint': {
          if (!desktop || !projectRoot) return true
          const checkpoint = await desktop.createCheckpoint({
            projectRoot,
            reason: parsed.args || 'Created from /checkpoint',
          })
          addSystemMessage(`Checkpoint created: ${checkpoint.id}`)
          return true
        }
        default:
          return false
      }
    },
    [
      clearContext,
      desktop,
      models,
      navigate,
      permissions,
      projectRoot,
      providers,
      selectedModel,
      selectedProvider,
      sendPrompt,
    ],
  )

  const send = useCallback(async () => {
    const content = input.trim()
    if (!content) return
    const files = [...attachments]
    setInput('')
    setAttachments([])
    setAttachmentErrors([])
    setSlashDismissed(false)
    if (projectRoot) {
      for (const f of files) {
        void desktop?.removeContextFile(projectRoot, f.path)
      }
    }
    if (await executeDesktopSlashCommand(content, files)) return
    if (mode === 'plan') {
      await generatePlanFromPrompt(content)
      return
    }
    await sendPrompt(content, files)
  }, [
    attachments,
    desktop,
    executeDesktopSlashCommand,
    generatePlanFromPrompt,
    input,
    mode,
    projectRoot,
    sendPrompt,
  ])

  const addAttachmentPaths = useCallback(
    async (paths: string[]) => {
      if (!desktop || !projectRoot || paths.length === 0) return
      const results = await desktop.addContextFiles({ projectRoot, paths })
      const accepted = results.filter(r => r.ok)
      const rejected = results.filter(r => !r.ok)
      setAttachments(prev => {
        const existing = new Set(prev.map(p => p.path))
        return [...prev, ...accepted.filter(a => !existing.has(a.path))]
      })
      setAttachmentErrors(
        rejected.map(r => `${r.name}: ${r.reason ?? r.kind}`),
      )
    },
    [desktop, projectRoot],
  )

  const attachFiles = useCallback(async () => {
    if (!desktop || !projectRoot) return
    const result = await desktop.openFilesDialog({
      multi: true,
      defaultPath: projectRoot,
    })
    if (result.canceled) return
    await addAttachmentPaths(result.paths)
  }, [desktop, projectRoot, addAttachmentPaths])

  const removeAttachment = useCallback(
    (file: ContextFileDto) => {
      setAttachments(prev => prev.filter(f => f.path !== file.path))
      if (projectRoot) void desktop?.removeContextFile(projectRoot, file.path)
    },
    [desktop, projectRoot],
  )

  // Files dropped anywhere in the window route here via the app shell.
  useEffect(() => {
    const listener = (event: Event) => {
      const detail = (event as CustomEvent<{ paths: string[] }>).detail
      if (detail?.paths?.length) void addAttachmentPaths(detail.paths)
    }
    window.addEventListener('ur:attach-files', listener)
    return () => window.removeEventListener('ur:attach-files', listener)
  }, [addAttachmentPaths])

  // Native menu triggers routed through navigation state.
  useEffect(() => {
    const state = location.state as { newChat?: number; attach?: number; skillPrompt?: string } | null
    if (state?.newChat) clearContext()
    if (state?.attach) void attachFiles()
    if (state?.skillPrompt) {
      setMode('agent')
      setInput(state.skillPrompt)
      requestAnimationFrame(() => composerRef.current?.focus())
    }
  }, [location.state])

  const approve = async (
    msg: ApprovalMessage,
    approved: boolean,
    scope: ApprovalScope = 'once',
  ) => {
    if (!desktop) return
    await desktop.respondApproval({ requestId: msg.requestId, approved, scope })
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === msg.id)
      if (idx === -1) return prev
      const next = [...prev]
      next[idx] = {
        ...next[idx],
        responded: true,
        approved,
        scope,
      } as ApprovalMessage
      return next
    })
  }

  const updateDiffMessage = useCallback(
    (id: string, patch: Partial<DiffMessage>) => {
      setMessages(prev =>
        prev.map(m => (m.id === id ? ({ ...m, ...patch } as DiffMessage) : m)),
      )
      if (patch.applied) {
        const msg = messages.find(m => m.id === id) as DiffMessage | undefined
        if (msg) {
          setChangedFiles(prev =>
            prev.includes(msg.filePath) ? prev : [...prev, msg.filePath],
          )
        }
      }
    },
    [messages],
  )

  const exportReport = async () => {
    if (!desktop || !projectRoot) return
    try {
      const report = await desktop.exportReport(projectRoot, worktreeRoot)
      setMessages(prev => [
        ...prev,
        {
          id: `report-${Date.now()}`,
          role: 'final_report',
          content: `Report exported to ${report.path}`,
          path: report.path,
          timestamp: Date.now(),
        },
      ])
    } catch (err) {
      setSendError(err instanceof Error ? err.message : String(err))
    }
  }

  const changeProvider = async (providerId: string) => {
    setSelectedProvider(providerId)
    if (!providerId) return
    try {
      await desktop?.updateProvider(projectRoot ?? '', providerId, selectedModel || undefined)
      const discovered = await desktop?.listProviderModels(projectRoot ?? '', providerId)
      if (discovered) {
        setModels(discovered)
        if (discovered[0] && !discovered.some(model => model.id === selectedModel)) {
          setSelectedModel(discovered[0].id)
        }
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : String(err))
    }
  }

  const changeModel = async (modelId: string) => {
    setSelectedModel(modelId)
    if (selectedProvider && modelId && projectRoot) {
      await desktop
        ?.updateProvider(projectRoot, selectedProvider, modelId)
        .catch(err => setSendError(err instanceof Error ? err.message : String(err)))
    }
  }

  const activeTask = useMemo(
    () => tasks.find(t => t.status === 'running'),
    [tasks],
  )

  const busy = status === 'running' || status === 'starting' || status === 'waiting_approval'

  if (!projectRoot) {
    return (
      <div className="page chat-page welcome-page codex-welcome">
        <section className="welcome-shell">
          <div className="codex-welcome-mark"><Icon name="sparkles" size={22} /></div>
          <h1>What should we work on?</h1>
          <p className="welcome-lede">
            Open a local project to start a thread. UR can read the codebase, make changes, run commands, and verify the result.
          </p>
          <div className="welcome-actions">
            <button className="button" onClick={openProjectViaDialog}>
              <Icon name="folder" size={16} /> Open project
            </button>
          </div>
          {recentProjects.length > 0 && (
            <div className="welcome-recent" tabIndex={-1}>
              <div className="welcome-recent-heading"><span>Recent projects</span><button className="link-button" onClick={() => navigate('/projects')}>View all</button></div>
              <div className="welcome-recent-grid">
                {recentProjects.slice(0, 3).map(project => (
                  <button key={project.root} onClick={() => void openProject(project.root)}>
                    <span className="recent-project-icon"><Icon name="folder" size={17} /></span>
                    <span className="recent-project-copy"><strong>{project.name}</strong><small>{project.root}</small></span>
                    <span className="recent-project-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    )
  }

  const chooseStarter = (starter: (typeof starterPrompts)[number]) => {
    setMode(starter.mode)
    setInput(starter.prompt)
    requestAnimationFrame(() => composerRef.current?.focus())
  }

  return (
    <div className="page chat-page workspace-page">
      <header className="chat-header">
        <div className="chat-header-left">
          <div className="chat-project">{projectName}</div>
          <div className="chat-meta">
            {status === 'idle' && (
              <span className="workspace-ready"><i /> Agent ready</span>
            )}
            {activeTask && (
              <span className="badge badge-active"><span className="status-pulse" />{activeTask.title}</span>
            )}
            {worktreeRoot && (
              <span className="badge badge-worktree" title={worktreeRoot}>
                <Icon name="branch" size={12} /> worktree
              </span>
            )}
            {changedFiles.length > 0 && (
              <span className="badge badge-changed">
                {changedFiles.length} changed
              </span>
            )}
            {usage && (usage.inputTokens > 0 || usage.outputTokens > 0) && (
              <span
                className="badge badge-usage"
                title={`${usage.requests} requests · cache read ${usage.cacheReadTokens} · cache write ${usage.cacheCreationTokens}${usage.model ? ` · ${usage.model}` : ''}`}
              >
                {formatTokens(usage.inputTokens)} in / {formatTokens(usage.outputTokens)} out
                {usage.costUsd !== undefined &&
                  ` · $${usage.costUsd.toFixed(4)}${usage.costIsEstimate ? ' est.' : ''}`}
              </span>
            )}
            {status !== 'idle' && (
              <span className={`badge badge-running status-${status}`}>
                {status === 'waiting_approval'
                  ? 'Waiting for approval'
                  : status === 'paused'
                    ? 'Paused'
                    : <><Icon name="clock" size={12} />{formatElapsed(elapsed)}</>}
              </span>
            )}
          </div>
        </div>

        <div className="chat-header-right">
          <button className="button button-secondary button-small" onClick={() => navigate('/explorer')}>
            Open
          </button>
          <button className="button button-secondary button-small" onClick={() => navigate('/diffs')}>
            Changes{changedFiles.length > 0 ? ` ${changedFiles.length}` : ''}
          </button>
          <button
            className="icon-button toolbar-icon-button"
            onClick={() => navigate('/history')}
            title="Checkpoints and run history"
          >
            <Icon name="history" size={16} />
          </button>
          <button
            className="icon-button toolbar-icon-button"
            onClick={exportReport}
            title="Export the latest run report as Markdown"
          >
            <Icon name="download" size={16} />
          </button>
        </div>
      </header>

      {sendError && (
        <div className="chat-error-banner">
          <span><Icon name="alert" size={14} /> {sendError}</span>
          <button className="link-button" onClick={() => setSendError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {interruptedRuns.map(state => (
        <div key={state.runId} className="notice-banner interrupted-banner">
          <span>
            <Icon name="pause" size={14} /> Interrupted run from {new Date(state.updatedAt).toLocaleString()}
            {state.pendingPrompt ? ` — “${state.pendingPrompt.slice(0, 60)}…”` : ''}
            {' '}({state.completedToolCalls.length} completed action(s))
          </span>
          <div>
            <button className="link-button" onClick={() => resumeInterrupted(state)}>
              Resume
            </button>
            <button
              className="link-button"
              onClick={async () => {
                await desktop?.markInterruptedRunFailed({ runId: state.runId })
                await refreshInterrupted()
              }}
            >
              Mark failed
            </button>
            <button
              className="link-button"
              onClick={async () => {
                await desktop?.archiveInterruptedRun({ runId: state.runId })
                await refreshInterrupted()
              }}
            >
              Archive
            </button>
          </div>
        </div>
      ))}

      <div className="chat-stream" ref={streamRef}>
        {messages.length === 0 && (
          <div className="chat-starter">
            <div className="chat-starter-project"><Icon name="folder" size={14} /> {projectName}</div>
            <h2>Let’s build</h2>
            <p>Ask UR to build a feature, fix a bug, review the code, or make a plan.</p>
            <div className="starter-grid">
              {starterPrompts.slice(0, 3).map(starter => (
                <button key={starter.title} className="starter-card" onClick={() => chooseStarter(starter)}>
                  <span className="starter-card-icon"><Icon name={starter.icon} size={17} /></span>
                  <span><strong>{starter.title}</strong><small>{starter.prompt.split('.')[0]}</small></span>
                  <span className="starter-card-arrow">↗</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(message =>
          message.role === 'diff' ? (
            <DiffCard
              key={message.id}
              message={message as DiffMessage}
              projectRoot={projectRoot}
              worktreeRoot={worktreeRoot}
              onUpdate={updateDiffMessage}
              onError={setSendError}
            />
          ) : message.role === 'plan' ? (
            <PlanCard
              key={message.id}
              message={message as PlanMessage}
              onUpdatePlan={updatePlanMessage}
              onExecute={executePlanMessage}
              onDiscard={id =>
                setMessages(prev => prev.filter(m => m.id !== id))
              }
            />
          ) : (
            <MessageView key={message.id} message={message} onApprove={approve} />
          ),
        )}
      </div>

      <div className="composer-card">
        <div className="composer-toolbar">
          <div className="composer-modes">
            {(['ask', 'edit', 'agent', 'plan'] as Mode[]).map(m => (
              <button
                key={m}
                className={`mode-button ${mode === m ? 'active' : ''}`}
                onClick={() => setMode(m)}
                title={
                  m === 'ask'
                    ? 'Ask questions about the project'
                    : m === 'edit'
                      ? 'Request a specific edit'
                      : m === 'agent'
                        ? 'Let the agent execute directly'
                        : 'Generate a reviewable task plan before executing'
                }
              >
                <Icon name={modeDetails[m].icon} size={13} />
                {modeDetails[m].label}
              </button>
            ))}
            {planHint && mode !== 'plan' && (
              <button
                className="link-button plan-hint"
                onClick={() => setMode('plan')}
                title="This prompt looks multi-step; Plan mode lets you review tasks first"
              >
                planning recommended
              </button>
            )}
          </div>
          <div className="composer-tools">
            <button
              className="button button-secondary composer-action-button"
              onClick={attachFiles}
              title="Attach files as context (⌘⇧A)"
            >
              <Icon name="paperclip" size={14} /> Attach
            </button>
            {status === 'paused' ? (
              <button className="button" onClick={resume}>
                <Icon name="send" size={14} /> Resume
              </button>
            ) : busy ? (
              <button className="button button-secondary" onClick={pause}>
                <Icon name="pause" size={14} /> Pause
              </button>
            ) : null}
            {busy && (
              <button className="button button-danger" onClick={stop}>
                <Icon name="stop" size={14} /> Stop
              </button>
            )}
            {!busy && lastUserPrompt && (
              <>
                <button
                  className="button button-secondary"
                  onClick={regenerate}
                  title="Send the last prompt again"
                >
                  Regenerate
                </button>
                <button
                  className="button button-secondary"
                  onClick={editAndResend}
                  title="Load the last prompt into the composer"
                >
                  Edit last
                </button>
              </>
            )}
            <button
              className="button button-secondary"
              onClick={clearContext}
              disabled={messages.length === 0}
              title="Clear the conversation and start a new session"
            >
              New thread
            </button>
          </div>
        </div>

        {attachments.length > 0 && (
          <div className="attachment-list">
            {attachments.map(file => (
              <span key={file.path} className="attachment-chip" title={file.path}>
                <Icon name="paperclip" size={12} /> {file.name}
                <span className="attachment-size">{formatBytes(file.sizeBytes)}</span>
                <button
                  className="attachment-remove"
                  onClick={() => removeAttachment(file)}
                  title="Remove attachment"
                >
                  <Icon name="x" size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
        {attachmentErrors.length > 0 && (
          <div className="attachment-errors">
            {attachmentErrors.map(err => (
              <div key={err} className="attachment-error">
                <Icon name="alert" size={12} /> {err}
              </div>
            ))}
          </div>
        )}

        {slashMenuOpen && (
          <div className="slash-command-menu" role="listbox" aria-label="Slash commands">
            <div className="slash-command-heading">
              <span>Commands</span>
              <small>↑↓ navigate · Tab select · Esc close</small>
            </div>
            <div className="slash-command-results">
              {slashSuggestions.map((command, index) => (
                <button
                  key={command.name}
                  type="button"
                  role="option"
                  aria-selected={index === slashSelection}
                  className={`slash-command-item${index === slashSelection ? ' is-selected' : ''}`}
                  onMouseEnter={() => setSlashSelection(index)}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => selectSlashCommand(command)}
                >
                  <span className="slash-command-icon"><Icon name="command" size={14} /></span>
                  <span className="slash-command-copy">
                    <strong>/{command.name}</strong>
                    <small>{command.description}</small>
                  </span>
                  <span className="slash-command-meta">
                    {command.argumentHint && <code>{command.argumentHint}</code>}
                    <em>{command.category}</em>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="composer-input-row">
          <textarea
            ref={composerRef}
            className="composer-textarea"
            placeholder={`${mode === 'edit' ? 'Describe the change you want' : mode === 'agent' ? 'Describe the outcome you want' : mode === 'plan' ? 'Describe the project to plan' : 'Ask anything about this project'}…`}
            value={input}
            onChange={e => {
              setInput(e.target.value)
              setSlashDismissed(false)
            }}
            onKeyDown={e => {
              if (slashMenuOpen) {
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setSlashSelection(current => (current + 1) % slashSuggestions.length)
                  return
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setSlashSelection(current => (current - 1 + slashSuggestions.length) % slashSuggestions.length)
                  return
                }
                if ((e.key === 'Enter' || e.key === 'Tab') && slashSuggestions[slashSelection]) {
                  e.preventDefault()
                  selectSlashCommand(slashSuggestions[slashSelection])
                  return
                }
                if (e.key === 'Escape') {
                  e.preventDefault()
                  setSlashDismissed(true)
                  return
                }
              }
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                void send()
              }
            }}
            rows={3}
          />
          <button
            className="button send-button"
            onClick={send}
            disabled={!input.trim() || status === 'starting'}
            title="Send (Enter)"
          >
            {status === 'starting' ? <span className="button-spinner" /> : <Icon name="send" size={17} />}
          </button>
        </div>

        <div className="composer-footer">
          <div className="composer-model-controls">
            <select
              value={selectedModel}
              title="Select model"
              onChange={event => void changeModel(event.target.value)}
            >
              <option value="">Choose model</option>
              {models.map(model => (
                <option key={model.id} value={model.id}>{model.displayName || model.id}</option>
              ))}
            </select>
            <select
              value={selectedProvider}
              title="Select provider"
              onChange={event => void changeProvider(event.target.value)}
            >
              <option value="">Provider</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>{provider.displayName}</option>
              ))}
            </select>
          </div>
          <span className="composer-context-label"><i /> Local</span>
          <label
            className="composer-permission-control"
            title="Approval profile for the next thread"
          >
            <Icon name="shield" size={12} />
            <select
              value={permissions.approvalPolicy}
              disabled={runId !== null}
              onChange={event => setPermissions(current => ({
                ...current,
                approvalPolicy: event.target.value as AgentPermissionSettingsDto['approvalPolicy'],
              }))}
            >
              <option value="untrusted">Ask every time</option>
              <option value="on-request">Auto-approve edits</option>
              <option value="never">Auto approve</option>
            </select>
          </label>
          <label className="worktree-toggle" title="Run in an isolated git worktree">
            <input
              type="checkbox"
              checked={useWorktree}
              onChange={e => setUseWorktree(e.target.checked)}
              disabled={runId !== null}
            />
            <Icon name="branch" size={13} /> Isolated worktree
          </label>
          <span className="composer-privacy">
            {permissions.sandboxMode === 'read-only'
              ? 'Read only'
              : permissions.sandboxMode === 'danger-full-access'
                ? 'Full access'
                : 'Workspace access'}
          </span>
          <span className="composer-footer-spacer" />
          <span className="composer-footer-agents"><i /> {agents.length} agent{agents.length === 1 ? '' : 's'} available</span>
        </div>

        {changedFiles.length > 0 && (
          <div className="changed-files-bar">
            <span className="changed-files-label">Changed files:</span>
            <div className="changed-files-list">
              {changedFiles.map(f => (
                <span key={f} className="changed-file-chip">{f.split('/').pop() ?? f}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      className="link-button message-copy"
      title="Copy to clipboard"
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function DiffCard({
  message,
  projectRoot,
  worktreeRoot,
  onUpdate,
  onError,
}: {
  message: DiffMessage
  projectRoot: string | null
  worktreeRoot?: string
  onUpdate: (id: string, patch: Partial<DiffMessage>) => void
  onError: (message: string) => void
}) {
  const desktop = useDesktop()
  const [files, setFiles] = useState<ParsedDiffFileDto[] | null>(null)

  useEffect(() => {
    let cancelled = false
    desktop
      ?.parseDiff({ patch: message.patch })
      .then(parsed => {
        if (!cancelled) setFiles(parsed)
      })
      .catch(() => {
        if (!cancelled) setFiles([])
      })
    return () => {
      cancelled = true
    }
  }, [desktop, message.patch])

  const hunkStates = message.hunkStates ?? {}
  const allHunks = (files ?? []).flatMap(f => f.hunks)
  const pendingHunks = allHunks.filter(h => hunkStates[h.index] === undefined)
  const appliedHunks = allHunks.filter(h => hunkStates[h.index] === 'applied')

  const runHunks = async (indexes: number[], reverse: boolean) => {
    if (!desktop || !projectRoot || indexes.length === 0) return
    try {
      await desktop.applyHunks({
        projectRoot,
        patch: message.patch,
        hunkIndexes: indexes,
        worktreeRoot,
        baseHashes: reverse ? undefined : message.baseHashes,
        reverse,
      })
      const next = { ...hunkStates }
      for (const i of indexes) {
        if (reverse) delete next[i]
        else next[i] = 'applied'
      }
      const applied =
        allHunks.length > 0 &&
        allHunks.every(h => next[h.index] === 'applied')
      onUpdate(message.id, { hunkStates: next, applied, stale: false })
    } catch (err) {
      const text = err instanceof Error ? err.message : String(err)
      if (text.includes('changed since this diff was generated')) {
        onUpdate(message.id, { stale: true })
      }
      onError(text)
    }
  }

  const rejectHunks = (indexes: number[]) => {
    const next = { ...hunkStates }
    for (const i of indexes) next[i] = 'rejected'
    const allDecided = allHunks.every(h => next[h.index] !== undefined)
    const anyApplied = allHunks.some(h => next[h.index] === 'applied')
    onUpdate(message.id, {
      hunkStates: next,
      rejected: allDecided && !anyApplied,
    })
  }

  return (
    <div className="message diff">
      <div className="message-meta">
        <Icon name="file" size={13} /> {message.filePath}
        {message.stale && <span className="diff-stale">source changed — regenerate</span>}
        <CopyButton text={message.patch} />
        <button
          className="link-button"
          onClick={() => projectRoot && desktop?.openInDefaultApp(`${projectRoot}/${message.filePath}`)}
          title="Open source file"
        >
          Open file
        </button>
      </div>

      {files === null ? (
        <div className="system-body">Parsing diff…</div>
      ) : (
        <>
          {allHunks.length > 1 && (
            <div className="approval-actions diff-bulk-actions">
              <button
                className="button button-small"
                disabled={pendingHunks.length === 0 || message.stale}
                onClick={() => runHunks(pendingHunks.map(h => h.index), false)}
              >
                Accept all ({pendingHunks.length})
              </button>
              <button
                className="button button-secondary button-small"
                disabled={pendingHunks.length === 0}
                onClick={() => rejectHunks(pendingHunks.map(h => h.index))}
              >
                Reject all
              </button>
              <button
                className="button button-secondary button-small"
                disabled={appliedHunks.length === 0}
                onClick={() => runHunks(appliedHunks.map(h => h.index), true)}
                title="Reverse-apply the hunks accepted from this card"
              >
                Revert applied
              </button>
            </div>
          )}
          {allHunks.map(hunkItem => {
            const state = hunkStates[hunkItem.index]
            return (
              <div key={hunkItem.index} className={`diff-hunk diff-hunk-${state ?? 'pending'}`}>
                <div className="diff-hunk-header">
                  <span className="diff-hunk-range">
                    @@ -{hunkItem.oldStart},{hunkItem.oldCount} +{hunkItem.newStart},{hunkItem.newCount} @@ {hunkItem.context}
                  </span>
                  <span className="diff-hunk-actions">
                    {state === 'applied' ? (
                      <>
                        <span className="diff-applied">Applied</span>
                        <button
                          className="link-button"
                          onClick={() => runHunks([hunkItem.index], true)}
                        >
                          Revert
                        </button>
                      </>
                    ) : state === 'rejected' ? (
                      <span className="diff-rejected">Rejected</span>
                    ) : (
                      <>
                        <button
                          className="button button-small"
                          disabled={message.stale}
                          onClick={() => runHunks([hunkItem.index], false)}
                        >
                          Accept
                        </button>
                        <button
                          className="button button-secondary button-small"
                          onClick={() => rejectHunks([hunkItem.index])}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </span>
                </div>
                <pre className="code-block diff-block">
                  {hunkItem.lines.map((line, i) => (
                    <span
                      key={i}
                      className={
                        line.startsWith('+')
                          ? 'diff-line-add'
                          : line.startsWith('-')
                            ? 'diff-line-del'
                            : undefined
                      }
                    >
                      {line}
                      {'\n'}
                    </span>
                  ))}
                </pre>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

function PlanCard({
  message,
  onUpdatePlan,
  onExecute,
  onDiscard,
}: {
  message: PlanMessage
  onUpdatePlan: (id: string, plan: PlanDto) => void
  onExecute: (msg: PlanMessage) => void
  onDiscard: (id: string) => void
}) {
  const editable = message.planStatus === 'draft'
  const resultsById = new Map((message.results ?? []).map(r => [r.id, r]))

  const updateTask = (taskId: string, patch: Partial<PlanDto['tasks'][number]>) => {
    onUpdatePlan(message.id, {
      ...message.plan,
      tasks: message.plan.tasks.map(t =>
        t.id === taskId ? { ...t, ...patch } : t,
      ),
    })
  }

  const removeTask = (taskId: string) => {
    onUpdatePlan(message.id, {
      ...message.plan,
      tasks: message.plan.tasks
        .filter(t => t.id !== taskId)
        .map(t => ({
          ...t,
          dependencies: t.dependencies.filter(d => d !== taskId),
        })),
    })
  }

  return (
    <div className="message plan">
      <div className="message-meta">
        <Icon name="plan" size={13} /> Plan — {message.plan.tasks.length} task(s)
        <span className={`plan-status plan-status-${message.planStatus}`}>
          {message.planStatus}
        </span>
      </div>
      {message.plan.tasks.map(task => {
        const result = resultsById.get(task.id)
        return (
          <div key={task.id} className="plan-task">
            <div className="plan-task-header">
              <span className="task-index">{task.id}</span>
              {editable ? (
                <input
                  className="input plan-task-title"
                  value={task.title}
                  onChange={e => updateTask(task.id, { title: e.target.value })}
                />
              ) : (
                <span className="plan-task-title-text">{task.title}</span>
              )}
              {result && (
                <span className={`task-status-badge ${result.status}`}>
                  {result.status}
                </span>
              )}
              {editable && message.plan.tasks.length > 1 && (
                <button
                  className="link-button danger"
                  onClick={() => removeTask(task.id)}
                  title="Remove this task from the plan"
                >
                  remove
                </button>
              )}
            </div>
            {editable ? (
              <textarea
                className="composer-textarea plan-task-description"
                rows={2}
                value={task.description}
                onChange={e => updateTask(task.id, { description: e.target.value })}
              />
            ) : (
              task.description && (
                <div className="plan-task-description-text">{task.description}</div>
              )
            )}
            <div className="plan-task-meta">
              <span>role: {task.role}</span>
              {task.dependencies.length > 0 && (
                <span>after: {task.dependencies.join(', ')}</span>
              )}
              {task.fileTargets.length > 0 && (
                <span>files: {task.fileTargets.join(', ')}</span>
              )}
              {task.verification && <span>verify: {task.verification}</span>}
              {result?.error && (
                <span className="plan-task-error">error: {result.error}</span>
              )}
            </div>
          </div>
        )
      })}
      {editable && (
        <div className="approval-actions">
          <button className="button" onClick={() => onExecute(message)}>
            Start plan
          </button>
          <button
            className="button button-secondary"
            onClick={() => onDiscard(message.id)}
          >
            Discard
          </button>
        </div>
      )}
    </div>
  )
}

function MessageView({
  message,
  onApprove,
}: {
  message: ChatMessage
  onApprove: (
    msg: ApprovalMessage,
    approved: boolean,
    scope?: ApprovalScope,
  ) => void
}) {
  switch (message.role) {
    case 'user':
      return (
        <div className="message user">
          <div className="message-meta">You</div>
          <div className="message-body">{(message as UserMessage).content}</div>
          {(message as UserMessage).attachments &&
            (message as UserMessage).attachments!.length > 0 && (
              <div className="message-attachments">
                {(message as UserMessage).attachments!.map(a => (
                  <span key={a} className="attachment-chip">
                    <Icon name="paperclip" size={12} /> {a}
                  </span>
                ))}
              </div>
            )}
        </div>
      )

    case 'assistant':
      return (
        <div className="message assistant">
          <div className="message-meta">
            <span className="assistant-dot" /> UR
            <CopyButton text={(message as AssistantMessage).content} />
          </div>
          <div className="message-body">{(message as AssistantMessage).content}</div>
        </div>
      )

    case 'system':
      return (
        <div className="message system">
          <div className="message-body system-body">
            {(message as SystemMessage).content}
          </div>
        </div>
      )

    case 'tool': {
      const m = message as ToolMessage
      return (
        <div className="message tool">
          <div className="message-meta">
            <Icon name="tool" size={13} /> {m.toolName}
            <span className={`tool-status tool-status-${m.status}`}>{m.status}</span>
          </div>
          <pre className="code-block">{JSON.stringify(m.input, null, 2)}</pre>
          {m.result !== undefined && (
            <pre className="code-block result">
              {typeof m.result === 'string'
                ? m.result
                : JSON.stringify(m.result, null, 2)}
            </pre>
          )}
        </div>
      )
    }

    case 'approval': {
      const m = message as ApprovalMessage
      const riskClass = `risk-${m.riskLevel ?? 'low'}`
      return (
        <div className={`message approval ${riskClass}`}>
          <div className="message-meta"><Icon name="shield" size={13} /> Approval required — {m.actionType ?? m.toolName}</div>
          {m.target && m.target !== m.toolName && (
            <div className="approval-target">{m.target}</div>
          )}
          {m.reason && <div className="approval-reason">{m.reason}</div>}
          {m.riskLevel && (
            <div className={`approval-risk ${riskClass}`}>Risk: {m.riskLevel}</div>
          )}
          <pre className="code-block">{JSON.stringify(m.input, null, 2)}</pre>
          {m.responded ? (
            <div className={`approval-result ${m.approved ? 'approved' : 'denied'}`}>
              {m.approved ? `Approved (${m.scope ?? 'once'})` : 'Denied'}
            </div>
          ) : (
            <div className="approval-actions">
              <button className="button" onClick={() => onApprove(m, true, 'once')}>
                Allow once
              </button>
              <button className="button" onClick={() => onApprove(m, true, 'run')}>
                Allow for this run
              </button>
              <button className="button button-secondary" onClick={() => onApprove(m, true, 'session')}>
                Allow for app session
              </button>
              <button
                className="button button-secondary"
                onClick={() => onApprove(m, false)}
              >
                Deny
              </button>
            </div>
          )}
        </div>
      )
    }

    case 'error':
      return (
        <div className="message error">
          <div className="message-meta">Error</div>
          <div className="message-body">{(message as ErrorMessage).content}</div>
        </div>
      )

    case 'final_report': {
      const m = message as FinalReportMessage
      return (
        <div className="message final-report">
          <div className="message-meta"><Icon name="check" size={13} /> Final report</div>
          <div className="message-body">{m.content}</div>
        </div>
      )
    }
  }
}
