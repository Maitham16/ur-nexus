import type { LocalCommandCall } from '../../types/command.js'
import { parseArguments } from '../../utils/argumentSubstitution.js'
import { getCwd } from '../../utils/cwd.js'
import {
  applyRename,
  buildRepoEditIndex,
  formatRenamePlan,
  formatSearchHits,
  loadRepoEditIndex,
  planRename,
  repoEditIndexPath,
  searchRepoEditIndex,
} from '../../services/repoEditing/reliableRepoEdit.js'

function usage(): string {
  return [
    'Usage:',
    '  ur repo-edit index [--json]',
    '  ur repo-edit search <query> [--json]',
    '  ur repo-edit plan rename <from> --to <to> [--json]',
    '  ur repo-edit preview rename <from> --to <to> [--json]',
    '  ur repo-edit apply rename <from> --to <to> [--check <cmd>] [--json]',
    '',
    'Rename operations are AST-aware for JavaScript and TypeScript files:',
    'identifier nodes are changed, while comments and strings are not.',
  ].join('\n')
}

function option(tokens: string[], name: string): string | undefined {
  const index = tokens.indexOf(name)
  return index === -1 ? undefined : tokens[index + 1]
}

function positionals(tokens: string[]): string[] {
  const values: string[] = []
  const flagsWithValue = new Set(['--to', '--check'])
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (flagsWithValue.has(token)) {
      i++
      continue
    }
    if (token.startsWith('--')) continue
    values.push(token)
  }
  return values
}

function renameArgs(tokens: string[]): { from: string; to: string } | null {
  const values = positionals(tokens)
  if (values[1] !== 'rename' || !values[2]) return null
  const to = option(tokens, '--to')
  if (!to) return null
  return { from: values[2], to }
}

export const call: LocalCommandCall = async (args: string) => {
  const tokens = parseArguments(args)
  const json = tokens.includes('--json')
  const action = positionals(tokens)[0] ?? 'status'
  const root = getCwd()

  try {
    if (action === 'index') {
      const index = buildRepoEditIndex(root)
      const summary = {
        path: repoEditIndexPath(root),
        files: index.files.length,
        codeFiles: index.files.filter(file => file.code).length,
        symbols: index.files.reduce(
          (total, file) => total + file.symbols.length,
          0,
        ),
        builtAt: index.builtAt,
      }
      return {
        type: 'text',
        value: json
          ? JSON.stringify({ index: summary }, null, 2)
          : `Built repo-edit index at ${summary.path}\n` +
            `  files:    ${summary.files}\n` +
            `  code:     ${summary.codeFiles}\n` +
            `  symbols:  ${summary.symbols}`,
      }
    }

    if (action === 'status') {
      const index = loadRepoEditIndex(root)
      const status = index
        ? {
            path: repoEditIndexPath(root),
            builtAt: index.builtAt,
            files: index.files.length,
            codeFiles: index.files.filter(file => file.code).length,
            symbols: index.files.reduce(
              (total, file) => total + file.symbols.length,
              0,
            ),
          }
        : { missing: true, path: repoEditIndexPath(root) }
      return { type: 'text', value: JSON.stringify(status, null, 2) }
    }

    if (action === 'search') {
      const query = positionals(tokens).slice(1).join(' ')
      if (!query) return { type: 'text', value: usage() }
      const hits = searchRepoEditIndex(root, query)
      return {
        type: 'text',
        value: json
          ? JSON.stringify({ hits }, null, 2)
          : formatSearchHits(hits),
      }
    }

    if (action === 'plan' || action === 'preview' || action === 'apply') {
      const rename = renameArgs(tokens)
      if (!rename) return { type: 'text', value: usage() }
      const plan = planRename(root, rename.from, rename.to)

      if (action === 'plan') {
        return {
          type: 'text',
          value: json ? JSON.stringify({ plan }, null, 2) : formatRenamePlan(plan),
        }
      }

      if (action === 'preview') {
        return {
          type: 'text',
          value: json
            ? JSON.stringify({ plan, patch: plan.patch }, null, 2)
            : plan.patch || formatRenamePlan(plan),
        }
      }

      const result = await applyRename(root, rename.from, rename.to, {
        checkCommand: option(tokens, '--check'),
      })
      if (json) {
        return { type: 'text', value: JSON.stringify(result, null, 2) }
      }
      if (!result.ok) {
        return {
          type: 'text',
          value:
            `Repo edit failed; rollback ${result.rolledBack ? 'completed' : 'not needed'}.\n` +
            `${result.error ?? 'Unknown error'}\n\nPatch preview:\n${result.plan.patch}`,
        }
      }
      return {
        type: 'text',
        value:
          `Applied AST rename ${rename.from} -> ${rename.to} across ${result.writtenFiles.length} file(s).\n\n` +
          `Patch preview:\n${result.plan.patch}`,
      }
    }
  } catch (error) {
    return {
      type: 'text',
      value: `repo-edit failed: ${error instanceof Error ? error.message : String(error)}`,
    }
  }

  return { type: 'text', value: usage() }
}
