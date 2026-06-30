import type { Command } from '../../types/command.js'

const repoEdit = {
  type: 'local',
  name: 'repo-edit',
  aliases: ['repoedit', 'reliable-edit'],
  description:
    'Reliable repo editing: indexed search, AST-aware rename plans, patch previews, and rollback-safe apply',
  argumentHint:
    'index|search <query>|plan rename <from> --to <to>|preview rename <from> --to <to>|apply rename <from> --to <to> [--check <cmd>] [--json]',
  supportsNonInteractive: true,
  load: () => import('./repo-edit.js'),
} satisfies Command

export default repoEdit
