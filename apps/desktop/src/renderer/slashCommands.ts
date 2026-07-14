import type { RuntimeSlashCommandDto } from '../shared/ipc.js'

export type DesktopSlashCommand = {
  name: string
  description: string
  argumentHint?: string
  category: 'Workspace' | 'Agent' | 'Context' | 'Developer' | 'Terminal'
  action: 'local' | 'navigate' | 'prompt' | 'runtime' | 'agent'
  route?: string
  aliases?: string[]
}

// Native desktop counterparts override terminal commands whose CLI behavior
// is a TUI dialog or maps more naturally to an existing desktop page. The live
// terminal registry is merged with these entries at runtime, so this is not a
// reduced allow-list.
export const DESKTOP_SLASH_COMMANDS: readonly DesktopSlashCommand[] = [
  { name: 'help', description: 'Show all desktop slash commands', category: 'Workspace', action: 'local' },
  { name: 'new', description: 'Start a clean thread', category: 'Workspace', action: 'local' },
  { name: 'clear', description: 'Clear the current thread context', category: 'Workspace', action: 'local' },
  { name: 'compact', description: 'Compact the current thread into a clean context', category: 'Context', action: 'local' },
  { name: 'status', description: 'Show the active provider, model, and safety profile', category: 'Workspace', action: 'local' },
  { name: 'model', description: 'Choose or switch the active model', argumentHint: '[model]', category: 'Workspace', action: 'local' },
  { name: 'permissions', description: 'Open or change approval behavior', argumentHint: '[cautious|on-request|auto]', category: 'Workspace', action: 'local' },
  { name: 'config', description: 'Open desktop configuration', category: 'Workspace', action: 'navigate', route: '/settings' },
  { name: 'settings', description: 'Open desktop settings', category: 'Workspace', action: 'navigate', route: '/settings' },
  { name: 'projects', description: 'Browse recent projects', category: 'Workspace', action: 'navigate', route: '/projects' },
  { name: 'history', description: 'Open run and conversation history', category: 'Workspace', action: 'navigate', route: '/history' },
  { name: 'resume', description: 'Resume a previous conversation', category: 'Workspace', action: 'navigate', route: '/history' },
  { name: 'stats', description: 'Open run statistics and usage history', category: 'Workspace', action: 'navigate', route: '/history' },
  { name: 'terminal', description: 'Open the integrated terminal', category: 'Developer', action: 'navigate', route: '/terminal' },
  { name: 'terminal-setup', description: 'Open terminal setup and diagnostics', category: 'Developer', action: 'navigate', route: '/terminal' },
  { name: 'diff', description: 'Review pending workspace changes', category: 'Developer', action: 'navigate', route: '/diffs' },
  { name: 'tasks', description: 'Open the task execution board', category: 'Agent', action: 'navigate', route: '/tasks' },
  { name: 'agents', description: 'Open foreground and background agents', category: 'Agent', action: 'navigate', route: '/agents' },
  { name: 'skills', description: 'Browse available agent skills', category: 'Agent', action: 'navigate', route: '/tools' },
  { name: 'plugin', description: 'Browse installed plugins and skills', category: 'Agent', action: 'navigate', route: '/tools' },
  { name: 'connect', description: 'Configure model providers and credentials', category: 'Workspace', action: 'navigate', route: '/settings' },
  { name: 'provider', description: 'Configure the active provider', category: 'Workspace', action: 'navigate', route: '/settings' },
  { name: 'mcp', description: 'Manage MCP servers and connectors', category: 'Workspace', action: 'navigate', route: '/connectors' },
  { name: 'add-dir', description: 'Choose or add a project workspace', argumentHint: '[path]', category: 'Workspace', action: 'navigate', route: '/projects' },
  { name: 'theme', description: 'Toggle the desktop appearance', category: 'Workspace', action: 'local' },
  { name: 'copy', description: 'Copy the latest response', category: 'Workspace', action: 'local' },
  { name: 'exit', description: 'Close UR Nexus Desktop', category: 'Workspace', action: 'local' },
  { name: 'checkpoint', description: 'Create a workspace checkpoint', argumentHint: '[reason]', category: 'Developer', action: 'local' },
  { name: 'plan', description: 'Switch to Plan mode for a reviewable implementation plan', argumentHint: '[task]', category: 'Agent', action: 'local' },
  { name: 'review', description: 'Review code for correctness and maintainability', argumentHint: '[scope]', category: 'Agent', action: 'runtime' },
  { name: 'security-review', description: 'Run a focused security review', argumentHint: '[scope]', category: 'Agent', action: 'runtime' },
  { name: 'test-first', description: 'Implement with a test-first verification loop', argumentHint: '<task>', category: 'Agent', action: 'runtime' },
  { name: 'commit', description: 'Prepare a verified Git commit', argumentHint: '[message]', category: 'Developer', action: 'prompt' },
  { name: 'context', description: 'Analyze the active project context', category: 'Context', action: 'runtime' },
  { name: 'memory', description: 'Summarize relevant project memory', argumentHint: '[topic]', category: 'Context', action: 'prompt' },
  { name: 'remember', description: 'Remember a durable project fact', argumentHint: '<fact>', category: 'Context', action: 'runtime' },
  { name: 'doctor', description: 'Diagnose project and agent configuration', category: 'Developer', action: 'prompt' },
  { name: 'worktree', description: 'Inspect or create an isolated worktree', argumentHint: '[task]', category: 'Developer', action: 'runtime' },
] as const

export function mergeSlashCommands(
  runtimeCommands: readonly RuntimeSlashCommandDto[],
): DesktopSlashCommand[] {
  const desktopByName = new Map(
    DESKTOP_SLASH_COMMANDS.map(command => [command.name, command]),
  )
  const merged: DesktopSlashCommand[] = [...DESKTOP_SLASH_COMMANDS]

  for (const command of runtimeCommands) {
    const override = desktopByName.get(command.name)
    if (override) {
      const index = merged.findIndex(item => item.name === command.name)
      merged[index] = {
        ...override,
        aliases: command.aliases,
        argumentHint: override.argumentHint ?? command.argumentHint,
      }
      continue
    }
    merged.push({
      name: command.name,
      description: command.description,
      argumentHint: command.argumentHint,
      aliases: command.aliases,
      category:
        command.loadedFrom || command.commandType === 'prompt'
          ? 'Agent'
          : 'Terminal',
      // CLI JSX commands render terminal dialogs. When there is no native
      // desktop override, preserve the capability through an agent-backed
      // desktop equivalent instead of silently opening an invisible TUI.
      action: command.commandType === 'local-jsx' ? 'agent' : 'runtime',
    })
  }

  return merged
}

export function getSlashCommandQuery(input: string): string | null {
  const match = input.match(/^\/([a-zA-Z0-9:_-]*)$/)
  return match ? (match[1] ?? '').toLowerCase() : null
}

export function parseSlashCommand(input: string): { name: string; args: string } | null {
  const match = input.trim().match(/^\/([a-zA-Z0-9:_-]+)(?:\s+([\s\S]*))?$/)
  if (!match) return null
  return { name: (match[1] ?? '').toLowerCase(), args: (match[2] ?? '').trim() }
}

export function filterSlashCommands(
  query: string,
  commands: readonly DesktopSlashCommand[] = DESKTOP_SLASH_COMMANDS,
): DesktopSlashCommand[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return [...commands]
  return commands
    .filter(command =>
      command.name.includes(normalized) ||
      command.aliases?.some(alias => alias.toLowerCase().includes(normalized)) ||
      command.description.toLowerCase().includes(normalized) ||
      command.category.toLowerCase().includes(normalized),
    )
    .sort((a, b) => {
      const aPrefix = a.name.startsWith(normalized) ? 0 : 1
      const bPrefix = b.name.startsWith(normalized) ? 0 : 1
      return aPrefix - bPrefix || a.name.localeCompare(b.name)
    })
}

export function expandSlashPrompt(command: string, args: string): string {
  const scope = args || 'the current workspace changes'
  switch (command) {
    case 'review':
      return `Review ${scope} for correctness, regressions, maintainability, and missing tests. Report findings by severity and fix confirmed issues.`
    case 'security-review':
      return `Perform a focused security review of ${scope}. Check trust boundaries, secrets, injection, unsafe filesystem/network behavior, and dependency risks. Fix confirmed vulnerabilities and verify the result.`
    case 'test-first':
      return `Use a test-first workflow for this task: ${args || 'improve the current implementation'}. Add or update a failing test first, implement the change, then run the relevant verification.`
    case 'commit':
      return `Review the current changes, run the relevant tests, and prepare a clean Git commit${args ? ` with this intent: ${args}` : ''}. Do not push unless explicitly requested.`
    case 'context':
      return 'Analyze the active project context and summarize its architecture, important conventions, current changes, and the most relevant risks.'
    case 'memory':
      return `Summarize durable project memory${args ? ` related to: ${args}` : ''} and identify any stale or conflicting guidance.`
    case 'remember':
      return `Remember this as a durable project fact: ${args || 'ask me what should be remembered'}`
    case 'doctor':
      return 'Diagnose the project and agent configuration. Check providers, tools, permissions, build commands, and likely runtime issues, then report actionable fixes.'
    case 'worktree':
      return `Inspect the current Git worktree state${args ? ` and prepare an isolated worktree for: ${args}` : ''}. Preserve unrelated user changes.`
    default:
      return `/${command}${args ? ` ${args}` : ''}`
  }
}
