import { useEffect, useState } from 'react'
import { Card } from '../components/Card.js'
import { useDesktop, useRuntimeEvents } from '../hooks/useDesktop.js'
import type { TaskInfoDto, RuntimeEvent } from '../../shared/ipc.js'

const statusOrder: Record<TaskInfoDto['status'], number> = {
  running: 0,
  waiting_approval: 1,
  pending: 2,
  done: 3,
  failed: 4,
  skipped: 5,
}

function statusIcon(status: TaskInfoDto['status']): string {
  switch (status) {
    case 'done':
      return '✔'
    case 'running':
      return '■'
    case 'waiting_approval':
      return '⏸'
    case 'failed':
      return '✕'
    case 'skipped':
      return '⊘'
    default:
      return '□'
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function TasksPage() {
  const desktop = useDesktop()
  const [projectRoot, setProjectRoot] = useState('')
  const [tasks, setTasks] = useState<TaskInfoDto[]>([])

  const refresh = async () => {
    if (!desktop || !projectRoot) return
    const list = await desktop.listTasks(projectRoot)
    setTasks(list)
  }

  useEffect(() => {
    refresh()
  }, [projectRoot, desktop])

  useRuntimeEvents((event: RuntimeEvent) => {
    if (
      event.type.startsWith('task_') ||
      event.type.startsWith('agent_') ||
      event.type === 'changed_files' ||
      event.type === 'verification_completed' ||
      event.type === 'run_started' ||
      event.type === 'run_finished'
    ) {
      refresh()
    }
  })

  const sortedTasks = [...tasks].sort((a, b) => {
    const byStatus = statusOrder[a.status] - statusOrder[b.status]
    if (byStatus !== 0) return byStatus
    return a.index - b.index
  })

  return (
    <div className="page">
      <h1 className="page-title">Tasks</h1>
      <p className="page-subtitle">
        Live task board with dependencies, agents, and verification results.
      </p>

      <Card title="Project">
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            className="input"
            placeholder="Project root path..."
            value={projectRoot}
            onChange={e => setProjectRoot(e.target.value)}
          />
          <button className="button button-secondary" onClick={refresh} disabled={!projectRoot}>
            Refresh
          </button>
        </div>
      </Card>

      <div className="task-board">
        {sortedTasks.length === 0 && (
          <Card title="No tasks">
            <p className="card-body">Start a run to see tasks here.</p>
          </Card>
        )}
        {sortedTasks.map(task => (
          <div
            key={task.id}
            className={`task-card task-status-${task.status}`}
          >
            <div className="task-row">
              <span className="task-index">{task.index}</span>
              <span className="task-icon">{statusIcon(task.status)}</span>
              <div className="task-title-block">
                <div className="task-title">{task.title}</div>
                {task.description && (
                  <div className="task-description">{task.description}</div>
                )}
              </div>
              <span className={`task-status-badge ${task.status}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>

            <div className="task-meta-row">
              {task.assignedAgent && (
                <span className="task-meta">
                  🤖 {task.assignedAgent}
                </span>
              )}
              {task.dependencies && task.dependencies.length > 0 && (
                <span className="task-meta">
                  ⬇ depends on {task.dependencies.join(', ')}
                </span>
              )}
              {task.currentAction && (
                <span className="task-meta task-action">
                  ▶ {task.currentAction}
                </span>
              )}
              <span className="task-meta">⏱ {formatDuration(task.elapsedMs)}</span>
            </div>

            {task.changedFiles && task.changedFiles.length > 0 && (
              <div className="task-files">
                {task.changedFiles.map(file => (
                  <span key={file} className="changed-file-chip">
                    {file.split('/').pop() ?? file}
                  </span>
                ))}
              </div>
            )}

            {task.verification && (
              <div
                className={`task-verification ${
                  task.verification.passed ? 'passed' : 'failed'
                }`}
              >
                {task.verification.passed ? '✔' : '✕'} {task.verification.level?.toUpperCase() ?? 'L1'}
                {task.verification.message ? ` — ${task.verification.message}` : ''}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
