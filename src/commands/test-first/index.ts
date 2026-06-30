import type { Command } from '../../types/command.js'

const testFirst = {
  type: 'local',
  name: 'test-first',
  aliases: ['quality-loop', 'tf-loop'],
  description:
    'Detect project stack, run compile/test/lint loops, store failure traces, and install edit-time verify gates',
  argumentHint:
    '[run|detect|install] [--max-attempts 3] [--install-gates] [--dry-run] [--skip-permissions] [--max-turns n] [--json]',
  supportsNonInteractive: true,
  load: () => import('./test-first.js'),
} satisfies Command

export default testFirst
