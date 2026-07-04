/**
 * Local web page for artifacts: `ur artifacts serve` starts an HTTP server on
 * 127.0.0.1 that renders `.ur/artifacts/` — GET /artifacts/<id> shows one
 * artifact, / lists all, plus JSON and raw-body endpoints.
 */

import { createServer, type Server } from 'node:http'
import { escapeXmlAttr as escapeHtml } from '../../utils/xml.js'
import {
  getArtifact,
  listArtifacts,
  readArtifactBody,
  type Artifact,
} from './artifacts.js'

const STATUS_COLOR: Record<Artifact['status'], string> = {
  pending: '#b58900',
  approved: '#2aa15f',
  rejected: '#d94f4f',
}

function page(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: ui-sans-serif, system-ui, sans-serif; max-width: 880px; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
  a { color: #4078c0; text-decoration: none; }
  a:hover { text-decoration: underline; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: .4rem .6rem; border-bottom: 1px solid #8884; }
  pre { background: #8881; padding: 1rem; border-radius: 6px; overflow-x: auto; }
  .badge { padding: .1rem .5rem; border-radius: 999px; color: #fff; font-size: .8rem; }
  .meta { color: #888; font-size: .9rem; }
  .feedback { border-left: 3px solid #8884; padding-left: .8rem; margin: .5rem 0; }
</style>
</head>
<body>${body}</body>
</html>
`
}

function badge(status: Artifact['status']): string {
  return `<span class="badge" style="background:${STATUS_COLOR[status]}">${status}</span>`
}

export function renderArtifactList(artifacts: Artifact[]): string {
  const rows = artifacts
    .map(
      a =>
        `<tr><td><a href="/artifacts/${escapeHtml(a.id)}">${escapeHtml(a.id)}</a></td>` +
        `<td>${escapeHtml(a.kind)}</td><td>${escapeHtml(a.title)}</td>` +
        `<td>${badge(a.status)}</td><td>${escapeHtml(a.summary ?? '')}</td></tr>`,
    )
    .join('\n')
  const table = artifacts.length
    ? `<table><tr><th>ID</th><th>Kind</th><th>Title</th><th>Status</th><th>Summary</th></tr>${rows}</table>`
    : '<p>No artifacts yet. Capture one with <code>ur artifacts capture-diff</code> or <code>ur artifacts add ...</code>.</p>'
  return page('Artifacts', `<h1>Artifacts</h1>${table}`)
}

export function renderArtifactPage(artifact: Artifact, body: string | null): string {
  const feedback = artifact.feedback
    .map(f => `<div class="feedback"><span class="meta">${escapeHtml(f.at)}</span><br>${escapeHtml(f.text)}</div>`)
    .join('\n')
  const parts = [
    `<p><a href="/">&larr; all artifacts</a></p>`,
    `<h1>Artifact ${escapeHtml(artifact.id)} <span class="meta">[${escapeHtml(artifact.kind)}]</span> ${badge(artifact.status)}</h1>`,
    `<p><strong>${escapeHtml(artifact.title)}</strong></p>`,
    artifact.summary ? `<p>${escapeHtml(artifact.summary)}</p>` : '',
    `<p class="meta">created ${escapeHtml(artifact.createdAt)} · updated ${escapeHtml(artifact.updatedAt)}${
      artifact.file ? ` · <a href="/artifacts/${escapeHtml(artifact.id)}/raw">raw</a>` : ''
    }</p>`,
    artifact.links?.claims?.length
      ? `<p class="meta">claims: ${artifact.links.claims.map(escapeHtml).join(', ')}</p>`
      : '',
    feedback ? `<h2>Feedback</h2>${feedback}` : '',
    body !== null ? `<h2>Content</h2><pre>${escapeHtml(body)}</pre>` : '',
  ]
  return page(`Artifact ${artifact.id} — ${artifact.title}`, parts.filter(Boolean).join('\n'))
}

function notFound(id: string): string {
  return page('Artifact not found', `<h1>Artifact not found: ${escapeHtml(id)}</h1><p><a href="/">&larr; all artifacts</a></p>`)
}

function respond(res: import('node:http').ServerResponse, status: number, type: string, body: string): void {
  res.writeHead(status, { 'content-type': `${type}; charset=utf-8` })
  res.end(body)
}

export function handleArtifactsRequest(cwd: string, url: string): { status: number; type: string; body: string } {
  const path = decodeURIComponent(new URL(url, 'http://localhost').pathname).replace(/\/+$/, '') || '/'
  if (path === '/' || path === '/artifacts') {
    return { status: 200, type: 'text/html', body: renderArtifactList(listArtifacts(cwd)) }
  }
  if (path === '/api/artifacts') {
    return { status: 200, type: 'application/json', body: JSON.stringify({ artifacts: listArtifacts(cwd) }, null, 2) }
  }
  let match = path.match(/^\/api\/artifacts\/([^/]+)$/)
  if (match) {
    const artifact = getArtifact(cwd, match[1]!)
    return artifact
      ? { status: 200, type: 'application/json', body: JSON.stringify(artifact, null, 2) }
      : { status: 404, type: 'application/json', body: JSON.stringify({ error: `Artifact not found: ${match[1]}` }) }
  }
  match = path.match(/^\/artifacts\/([^/]+)\/raw$/)
  if (match) {
    const body = readArtifactBody(cwd, match[1]!)
    return body !== null
      ? { status: 200, type: 'text/plain', body }
      : { status: 404, type: 'text/plain', body: `Artifact body not found: ${match[1]}` }
  }
  match = path.match(/^\/(?:artifacts\/)?([^/]+)$/)
  if (match) {
    const artifact = getArtifact(cwd, match[1]!)
    if (artifact) {
      return { status: 200, type: 'text/html', body: renderArtifactPage(artifact, readArtifactBody(cwd, artifact.id)) }
    }
    return { status: 404, type: 'text/html', body: notFound(match[1]!) }
  }
  return { status: 404, type: 'text/html', body: notFound(path) }
}

let active: { server: Server; port: number } | null = null

export function activeArtifactsServer(): { port: number; url: string } | null {
  return active ? { port: active.port, url: `http://127.0.0.1:${active.port}` } : null
}

export function startArtifactsServer(
  cwd: string,
  port = 4180,
): Promise<{ port: number; url: string; alreadyRunning: boolean }> {
  if (active) {
    return Promise.resolve({ port: active.port, url: `http://127.0.0.1:${active.port}`, alreadyRunning: true })
  }
  return new Promise((resolvePromise, reject) => {
    const server = createServer((req, res) => {
      if (req.method !== 'GET') {
        respond(res, 405, 'text/plain', 'Method not allowed')
        return
      }
      try {
        const r = handleArtifactsRequest(cwd, req.url ?? '/')
        respond(res, r.status, r.type, r.body)
      } catch (error) {
        respond(res, 500, 'text/plain', String(error))
      }
    })
    server.once('error', reject)
    server.listen(port, '127.0.0.1', () => {
      const address = server.address()
      const boundPort = typeof address === 'object' && address ? address.port : port
      active = { server, port: boundPort }
      resolvePromise({ port: boundPort, url: `http://127.0.0.1:${boundPort}`, alreadyRunning: false })
    })
  })
}

export async function stopArtifactsServer(): Promise<boolean> {
  if (!active) return false
  const { server } = active
  active = null
  await new Promise<void>(resolvePromise => server.close(() => resolvePromise()))
  return true
}
