import type { Command } from '../../types/command.js'

const artifacts = {
  type: 'local',
  name: 'artifacts',
  aliases: ['artifact'],
  description:
    'Reviewable deliverables (plans, diffs, test runs, screenshots) under .ur/artifacts with approve/reject/feedback and a local web page (serve)',
  argumentHint:
    'list|show|serve|add|capture-diff|capture-tests|approve|reject|feedback|delete [id] [--kind ...] [--title ...] [--port ...] [--json]',
  supportsNonInteractive: true,
  load: () => import('./artifacts.js'),
} satisfies Command

export default artifacts
