import type { LocalCommandCall } from '../../types/command.js'
import { parseArguments } from '../../utils/argumentSubstitution.js'
import { getCwd } from '../../utils/cwd.js'
import {
  appendProjectMemory,
  architectureSummaryPath,
  compressProjectMemory,
  compressedContextPath,
  contextStatus,
  TASK_MEMORY_KINDS,
  type TaskMemoryKind,
  projectManifestPath,
  writeProjectContextManifest,
} from '../../services/context/projectContextManifest.js'

const MEMORY_KINDS: TaskMemoryKind[] = [...TASK_MEMORY_KINDS]

function usage(): string {
  return [
    'Usage:',
    '  ur context-pack scan [--json]',
    '  ur context-pack remember --type architecture --text "Use repository-pattern for data access"',
    '  ur context-pack remember --preference "Prefer bun test over jest"',
    '  ur context-pack remember --accepted "Use p-map for concurrency" --rationale "Avoids Promise.all OOM"',
    '  ur context-pack remember --rejected "Switch to esbuild" --alternative-to "Keep bun bundle"',
    '  ur context-pack remember --attempt "Tried Deno runtime" --status superseded',
    '  ur context-pack compress [--json]',
    '  ur context-pack status',
  ].join('\n')
}

function option(tokens: string[], name: string): string | undefined {
  const index = tokens.indexOf(name)
  return index === -1 ? undefined : tokens[index + 1]
}

function positionals(tokens: string[]): string[] {
  const flagsWithValue = new Set([
    '--type',
    '--text',
    ...MEMORY_KINDS.map(k => `--${k}`),
    '--status',
    '--rationale',
    '--alternative-to',
    '--supersedes',
    '--scope',
    '--source',
  ])
  const values: string[] = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!
    if (flagsWithValue.has(token)) {
      i++
      continue
    }
    if (token.startsWith('--')) continue
    values.push(token)
  }
  return values
}

function rememberInput(
  tokens: string[],
): {
  kind: TaskMemoryKind
  text: string
  status?: 'proposed' | 'accepted' | 'rejected' | 'superseded'
  rationale?: string
  alternativeTo?: string
  supersedesId?: string
  scope?: 'project' | 'team' | 'personal'
  source?: string
} | null {
  for (const kind of MEMORY_KINDS) {
    const value = option(tokens, `--${kind}`)
    if (value) {
      const meta = collectMeta(tokens)
      return { kind, text: value, ...meta }
    }
  }
  const kind = option(tokens, '--type') as TaskMemoryKind | undefined
  const text = option(tokens, '--text')
  if (!kind || !text || !MEMORY_KINDS.includes(kind)) return null
  const meta = collectMeta(tokens)
  return { kind, text, ...meta }
}

function collectMeta(tokens: string[]): {
  status?: 'proposed' | 'accepted' | 'rejected' | 'superseded'
  rationale?: string
  alternativeTo?: string
  supersedesId?: string
  scope?: 'project' | 'team' | 'personal'
  source?: string
} {
  const status = option(tokens, '--status') as
    | 'proposed'
    | 'accepted'
    | 'rejected'
    | 'superseded'
    | undefined
  return {
    status,
    rationale: option(tokens, '--rationale'),
    alternativeTo: option(tokens, '--alternative-to'),
    supersedesId: option(tokens, '--supersedes'),
    scope: option(tokens, '--scope') as 'project' | 'team' | 'personal' | undefined,
    source: option(tokens, '--source'),
  }
}

export const call: LocalCommandCall = async (args: string) => {
  const tokens = parseArguments(args)
  const json = tokens.includes('--json')
  const action = positionals(tokens)[0] ?? 'scan'
  const cwd = getCwd()

  if (action === 'scan') {
    const manifest = writeProjectContextManifest(cwd)
    const result = {
      manifest: projectManifestPath(cwd),
      architecture: architectureSummaryPath(cwd),
      project: manifest.project.name,
      commands: manifest.commands,
      manifests: manifest.manifests,
    }
    return {
      type: 'text',
      value: json
        ? JSON.stringify(result, null, 2)
        : [
            `Wrote ${result.manifest}`,
            `Wrote ${result.architecture}`,
            `Project: ${result.project}`,
            `Commands: ${Object.values(result.commands).flat().length}`,
          ].join('\n'),
    }
  }

  if (action === 'remember') {
    const input = rememberInput(tokens)
    if (!input) return { type: 'text', value: usage() }
    const { kind, text, ...meta } = input
    const entry = appendProjectMemory(cwd, kind, text, meta)
    return {
      type: 'text',
      value: json
        ? JSON.stringify(entry, null, 2)
        : `Recorded ${entry.kind}: ${entry.text}`,
    }
  }

  if (action === 'compress') {
    const body = compressProjectMemory(cwd)
    return {
      type: 'text',
      value: json
        ? JSON.stringify({ path: compressedContextPath(cwd), bytes: body.length }, null, 2)
        : `Wrote ${compressedContextPath(cwd)}`,
    }
  }

  if (action === 'status') {
    return { type: 'text', value: contextStatus(cwd) }
  }

  return { type: 'text', value: usage() }
}
