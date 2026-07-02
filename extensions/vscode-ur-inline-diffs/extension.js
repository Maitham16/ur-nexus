const fs = require('node:fs')
const path = require('node:path')
const { execFile } = require('node:child_process')
const { promisify } = require('node:util')
const vscode = require('vscode')

const execFileAsync = promisify(execFile)

function workspaceRoot() {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
}

function diffsRoot(root) {
  return path.join(root, '.ur', 'ide', 'diffs')
}

function manifestPath(root) {
  return path.join(diffsRoot(root), 'manifest.json')
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function loadManifest(root) {
  const manifest = readJson(manifestPath(root), { version: 1, diffs: [] })
  return Array.isArray(manifest.diffs) ? manifest : { version: 1, diffs: [] }
}

function patchPath(root, bundle) {
  return path.join(diffsRoot(root), bundle.patchFile)
}

function metadataPath(root, bundle) {
  return path.join(diffsRoot(root), bundle.metadataFile)
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatCount(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

function formatRelativeTime(value) {
  if (!value) return 'unknown time'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const deltaMs = Date.now() - date.getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  if (deltaMs < minute) return 'just now'
  if (deltaMs < hour) return `${Math.max(1, Math.floor(deltaMs / minute))}m ago`
  if (deltaMs < day) return `${Math.floor(deltaMs / hour)}h ago`
  if (deltaMs < 7 * day) return `${Math.floor(deltaMs / day)}d ago`
  return date.toLocaleDateString()
}

function statusIcon(status) {
  switch (status) {
    case 'applied':
      return new vscode.ThemeIcon('check', new vscode.ThemeColor('testing.iconPassed'))
    case 'rejected':
      return new vscode.ThemeIcon('circle-slash', new vscode.ThemeColor('testing.iconFailed'))
    case 'commented':
      return new vscode.ThemeIcon('comment-discussion', new vscode.ThemeColor('charts.yellow'))
    default:
      return new vscode.ThemeIcon('diff', new vscode.ThemeColor('charts.blue'))
  }
}

class DiffItem extends vscode.TreeItem {
  constructor(bundle) {
    const title = bundle.title || bundle.id
    super(title, vscode.TreeItemCollapsibleState.None)
    this.bundle = bundle
    this.contextValue = 'diff'
    const fileCount = bundle.files?.length ?? 0
    const changedAt = bundle.updatedAt ?? bundle.createdAt
    this.description = `${bundle.status ?? 'captured'} · ${formatCount(fileCount, 'file')} · ${formatRelativeTime(changedAt)}`
    this.iconPath = statusIcon(bundle.status)
    this.tooltip = new vscode.MarkdownString(
      [
        `**${escapeHtml(title)}**`,
        '',
        `- ID: \`${escapeHtml(bundle.id)}\``,
        `- Status: ${escapeHtml(bundle.status ?? 'captured')}`,
        `- Files: ${fileCount}`,
        `- Patch: \`${escapeHtml(bundle.patchFile)}\``,
      ].join('\n'),
    )
    this.command = {
      command: 'urInlineDiffs.open',
      title: 'Open Inline Diff',
      arguments: [this],
    }
  }
}

class ActionItem extends vscode.TreeItem {
  constructor(label, description, icon, command, tooltip) {
    super(label, vscode.TreeItemCollapsibleState.None)
    this.contextValue = 'urAction'
    this.description = description
    this.iconPath = new vscode.ThemeIcon(icon)
    this.tooltip = tooltip ?? `${label}${description ? ` — ${description}` : ''}`
    this.command = command
  }
}

class InfoItem extends vscode.TreeItem {
  constructor(label, description, icon = 'info') {
    super(label, vscode.TreeItemCollapsibleState.None)
    this.contextValue = 'urInfo'
    this.description = description
    this.iconPath = new vscode.ThemeIcon(icon)
    this.tooltip = `${label}${description ? ` — ${description}` : ''}`
  }
}

class DiffProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter()
    this.onDidChangeTreeData = this._onDidChangeTreeData.event
  }

  refresh() {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(item) {
    return item
  }

  getChildren() {
    const root = workspaceRoot()
    if (!root) {
      return [
        new InfoItem('Open a workspace folder', 'UR inline diffs are scoped to the active project', 'folder-opened'),
      ]
    }

    const manifest = loadManifest(root)
    const diffs = manifest
      .diffs
      .slice()
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))

    if (diffs.length === 0) {
      return [
        new InfoItem(
          'Ready for inline review',
          fs.existsSync(manifestPath(root)) ? 'No pending diff bundles' : 'No diff bundles captured yet',
          'pass',
        ),
        new ActionItem(
          'Show UR status',
          'Provider, model, plugins',
          'pulse',
          { command: 'urInlineDiffs.status', title: 'Show UR Status' },
        ),
        new ActionItem(
          'Refresh',
          path.relative(root, manifestPath(root)),
          'refresh',
          { command: 'urInlineDiffs.refresh', title: 'Refresh Inline Diffs' },
        ),
      ]
    }

    return diffs.map(bundle => new DiffItem(bundle))
  }
}

function renderDiffHtml(root, bundle) {
  const patch = fs.existsSync(patchPath(root, bundle))
    ? fs.readFileSync(patchPath(root, bundle), 'utf8')
    : ''
  const comments = bundle.comments ?? []
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    :root { color-scheme: light dark; }
    body { font: 13px/1.5 var(--vscode-font-family); color: var(--vscode-foreground); padding: 20px; margin: 0; }
    header { border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 14px; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 600; margin: 0 0 6px; }
    h2 { font-size: 14px; margin: 20px 0 10px; }
    .meta, .where { color: var(--vscode-descriptionForeground); }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .chip { border: 1px solid var(--vscode-panel-border); border-radius: 4px; padding: 3px 8px; background: var(--vscode-sideBar-background); }
    pre { background: var(--vscode-editor-background); border: 1px solid var(--vscode-panel-border); border-radius: 6px; padding: 14px; overflow: auto; font-family: var(--vscode-editor-font-family); }
    .comments { margin-top: 18px; }
    .comment { border: 1px solid var(--vscode-panel-border); border-radius: 6px; padding: 10px 12px; margin-bottom: 10px; background: var(--vscode-sideBar-background); }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(bundle.title)}</h1>
    <div class="meta">${escapeHtml(bundle.id)} · ${escapeHtml(formatRelativeTime(bundle.updatedAt ?? bundle.createdAt))}</div>
    <div class="chips">
      <span class="chip">${escapeHtml(bundle.status ?? 'captured')}</span>
      <span class="chip">${escapeHtml(formatCount(bundle.files?.length ?? 0, 'file'))}</span>
      <span class="chip">${escapeHtml(formatCount(comments.length, 'comment'))}</span>
    </div>
  </header>
  <pre>${escapeHtml(patch)}</pre>
  <section class="comments">
    <h2>Comments</h2>
    ${comments.length === 0 ? '<p class="meta">No comments yet.</p>' : comments.map(comment => {
      const where = comment.file ? `${comment.file}${comment.line ? `:${comment.line}` : ''}` : 'General'
      return `<div class="comment"><div class="where">${escapeHtml(where)} · ${escapeHtml(comment.at ?? '')}</div><div>${escapeHtml(comment.text)}</div></div>`
    }).join('')}
  </section>
</body>
</html>`
}

async function openDiff(item) {
  const root = workspaceRoot()
  const bundle = item?.bundle
  if (!root || !bundle) {
    vscode.window.showWarningMessage('No UR inline diff selected.')
    return
  }
  const panel = vscode.window.createWebviewPanel(
    'urInlineDiff',
    `UR ${bundle.id}`,
    vscode.ViewColumn.Active,
    { enableScripts: false },
  )
  const latest = readJson(metadataPath(root, bundle), bundle)
  panel.webview.html = renderDiffHtml(root, latest)
}

async function commentDiff(item, provider) {
  const root = workspaceRoot()
  const bundle = item?.bundle
  if (!root || !bundle) {
    vscode.window.showWarningMessage('No UR inline diff selected.')
    return
  }
  const text = await vscode.window.showInputBox({
    title: `Comment on ${bundle.id}`,
    prompt: 'Comment text',
    ignoreFocusOut: true,
  })
  if (!text?.trim()) return

  const manifest = loadManifest(root)
  const manifestBundle = manifest.diffs.find(diff => diff.id === bundle.id)
  if (!manifestBundle) {
    vscode.window.showErrorMessage(`UR inline diff not found: ${bundle.id}`)
    return
  }
  const at = new Date().toISOString()
  const comment = { at, text: text.trim() }
  manifestBundle.status = 'commented'
  manifestBundle.updatedAt = at
  manifestBundle.comments = [...(manifestBundle.comments ?? []), comment]
  writeJson(manifestPath(root), manifest)
  writeJson(metadataPath(root, manifestBundle), manifestBundle)
  provider.refresh()
  vscode.window.showInformationMessage(`Added UR comment to ${bundle.id}.`)
}

function setBundleStatus(root, bundleId, status) {
  const manifest = loadManifest(root)
  const bundle = manifest.diffs.find(diff => diff.id === bundleId)
  if (!bundle) return null
  bundle.status = status
  bundle.updatedAt = new Date().toISOString()
  writeJson(manifestPath(root), manifest)
  writeJson(metadataPath(root, bundle), bundle)
  return bundle
}

// Apply the captured patch to the working tree. Never silent: the user is asked
// to confirm, and the result is reported. Uses `git apply` from the repo root.
async function applyDiff(item, provider) {
  const root = workspaceRoot()
  const bundle = item?.bundle
  if (!root || !bundle) {
    vscode.window.showWarningMessage('No UR inline diff selected.')
    return
  }
  const patch = patchPath(root, bundle)
  if (!fs.existsSync(patch)) {
    vscode.window.showErrorMessage(`UR patch file missing for ${bundle.id}.`)
    return
  }
  const choice = await vscode.window.showWarningMessage(
    `Apply UR patch ${bundle.id} to your working tree? This modifies ${bundle.files?.length ?? 0} file(s).`,
    { modal: true },
    'Apply',
  )
  if (choice !== 'Apply') return
  try {
    await execFileAsync('git', ['apply', '--whitespace=nowarn', patch], { cwd: root })
    setBundleStatus(root, bundle.id, 'applied')
    provider.refresh()
    vscode.window.showInformationMessage(`Applied UR patch ${bundle.id}.`)
  } catch (error) {
    const message = error?.stderr || error?.message || String(error)
    vscode.window.showErrorMessage(`Failed to apply UR patch ${bundle.id}: ${message}`)
  }
}

async function rejectDiff(item, provider) {
  const root = workspaceRoot()
  const bundle = item?.bundle
  if (!root || !bundle) {
    vscode.window.showWarningMessage('No UR inline diff selected.')
    return
  }
  const updated = setBundleStatus(root, bundle.id, 'rejected')
  if (!updated) {
    vscode.window.showErrorMessage(`UR inline diff not found: ${bundle.id}`)
    return
  }
  provider.refresh()
  vscode.window.showInformationMessage(`Rejected UR patch ${bundle.id} (no files changed).`)
}

async function showStatus(channel) {
  const root = workspaceRoot()
  if (!root) {
    vscode.window.showWarningMessage('Open a workspace folder to query UR status.')
    return
  }
  channel.clear()
  channel.show(true)
  channel.appendLine('Running: ur ide status')
  try {
    const { stdout } = await execFileAsync('ur', ['ide', 'status'], { cwd: root })
    channel.appendLine(stdout.trim())
  } catch (error) {
    channel.appendLine(
      `Could not run \`ur ide status\`: ${error?.message || String(error)}\n` +
        'Ensure the UR CLI is installed and on PATH.',
    )
  }
}

function activate(context) {
  const provider = new DiffProvider()
  const channel = vscode.window.createOutputChannel('UR')
  const tree = vscode.window.createTreeView('urInlineDiffs', {
    treeDataProvider: provider,
    showCollapseAll: false,
  })
  context.subscriptions.push(
    channel,
    tree,
    vscode.commands.registerCommand('urInlineDiffs.refresh', () => provider.refresh()),
    vscode.commands.registerCommand('urInlineDiffs.open', item => openDiff(item)),
    vscode.commands.registerCommand('urInlineDiffs.comment', item => commentDiff(item, provider)),
    vscode.commands.registerCommand('urInlineDiffs.apply', item => applyDiff(item, provider)),
    vscode.commands.registerCommand('urInlineDiffs.reject', item => rejectDiff(item, provider)),
    vscode.commands.registerCommand('urInlineDiffs.status', () => showStatus(channel)),
  )
}

function deactivate() {}

module.exports = { activate, deactivate }
