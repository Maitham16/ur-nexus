import { describe, expect, test } from 'bun:test'
import {
  DESKTOP_SLASH_COMMANDS,
  expandSlashPrompt,
  filterSlashCommands,
  getSlashCommandQuery,
  mergeSlashCommands,
  parseSlashCommand,
} from './slashCommands.js'

describe('desktop slash command palette', () => {
  test('opens only for an unfinished slash token at the start of the composer', () => {
    expect(getSlashCommandQuery('/')).toBe('')
    expect(getSlashCommandQuery('/mod')).toBe('mod')
    expect(getSlashCommandQuery('/model ')).toBeNull()
    expect(getSlashCommandQuery('explain /model')).toBeNull()
  })

  test('contains the terminal-parity commands expected in the desktop', () => {
    const names = new Set(DESKTOP_SLASH_COMMANDS.map(command => command.name))
    for (const name of ['help', 'model', 'permissions', 'plan', 'clear', 'status', 'agents', 'skills', 'mcp', 'worktree']) {
      expect(names.has(name)).toBe(true)
    }
  })

  test('filters names and descriptions while prioritizing prefix matches', () => {
    expect(filterSlashCommands('mod')[0]?.name).toBe('model')
    expect(filterSlashCommands('credential').map(command => command.name)).toContain('connect')
  })

  test('merges the complete terminal registry with native desktop overrides', () => {
    const terminal = Array.from({ length: 80 }, (_, index) => ({
      name: `terminal-${index}`,
      description: `Terminal command ${index}`,
      aliases: index === 0 ? ['t0'] : [],
      commandType: 'local' as const,
    }))
    terminal.push({
      name: 'model',
      description: 'Terminal model picker',
      aliases: [],
      commandType: 'local' as const,
    })
    terminal.push({
      name: 'terminal-dialog',
      description: 'Open a terminal-only dialog',
      aliases: [],
      commandType: 'local-jsx' as const,
    })

    const merged = mergeSlashCommands(terminal)
    expect(merged.length).toBeGreaterThan(80)
    expect(merged.filter(command => command.name === 'model')).toHaveLength(1)
    expect(filterSlashCommands('t0', merged)[0]?.name).toBe('terminal-0')
    expect(merged.find(command => command.name === 'terminal-dialog')?.action).toBe('agent')
  })

  test('parses arguments and expands agent-backed commands', () => {
    expect(parseSlashCommand('/review src/auth')).toEqual({ name: 'review', args: 'src/auth' })
    expect(expandSlashPrompt('review', 'src/auth')).toContain('src/auth')
    expect(parseSlashCommand('not a command')).toBeNull()
  })
})
