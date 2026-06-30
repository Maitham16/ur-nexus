import type { Command } from '../../types/command.js'

const task = {
  type: 'local',
  name: 'task',
  description:
    'Start, run, and hand off worktree-per-task sessions. Each task can run in its own git branch/worktree for safe parallel work.',
  argumentHint:
    'start <name> [--worktree] [--base <branch>] [--json]|run <id> [--json]|pr <id> [--create] [--draft] [--base <branch>] [--title <text>] [--body <text>] [--dry-run] [--json]|list [--json]|status <id> [--json]',
  supportsNonInteractive: true,
  load: () => import('./task.js'),
} satisfies Command

export default task
