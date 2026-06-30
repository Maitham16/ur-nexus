import type { Command } from '../../types/command.js'

const sandbox = {
  type: 'local',
  name: 'sandbox',
  description:
    'Inspect and manage the real sandbox / permission architecture: status, dependency check, policy init, and command approval levels',
  argumentHint:
    'status|check|init|eval <command> [--json]',
  supportsNonInteractive: true,
  load: () => import('./sandbox.js'),
} satisfies Command

export default sandbox
