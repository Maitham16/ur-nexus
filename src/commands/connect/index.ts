import type { Command } from '../../types/command.js'

const connect = {
  type: 'local',
  name: 'connect',
  description: 'Connect a provider account: subscription login (Codex, Claude, Gemini) or store an API key',
  argumentHint: '[status|<provider>|logout <provider>] [--key <KEY>] [--json]',
  supportsNonInteractive: true,
  load: () => import('./connect.js'),
} satisfies Command

export default connect
