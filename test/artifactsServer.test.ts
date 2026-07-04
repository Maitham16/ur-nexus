import { afterEach, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { recordArtifact, setStatus, addFeedback } from '../src/services/agents/artifacts.ts'
import {
  activeArtifactsServer,
  handleArtifactsRequest,
  startArtifactsServer,
  stopArtifactsServer,
} from '../src/services/agents/artifactsServer.ts'

afterEach(async () => {
  await stopArtifactsServer()
})

function seed(): string {
  const tmp = mkdtempSync(join(tmpdir(), 'ur-art-serve-'))
  recordArtifact(tmp, { kind: 'plan', title: 'My <Plan>', body: '# Plan\nstep 1 & 2', summary: '2 steps' })
  setStatus(tmp, '1', 'approved')
  addFeedback(tmp, '1', 'nice & clean')
  return tmp
}

test('handleArtifactsRequest renders list, detail, raw, json, and 404', () => {
  const tmp = seed()
  try {
    const list = handleArtifactsRequest(tmp, '/')
    expect(list.status).toBe(200)
    expect(list.body).toContain('My &lt;Plan&gt;')
    expect(list.body).toContain('/artifacts/1')

    const detail = handleArtifactsRequest(tmp, '/artifacts/1')
    expect(detail.status).toBe(200)
    expect(detail.type).toBe('text/html')
    expect(detail.body).toContain('Artifact 1')
    expect(detail.body).toContain('step 1 &amp; 2')
    expect(detail.body).toContain('nice &amp; clean')
    expect(detail.body).toContain('approved')

    const raw = handleArtifactsRequest(tmp, '/artifacts/1/raw')
    expect(raw.status).toBe(200)
    expect(raw.body).toContain('step 1 & 2')

    const json = handleArtifactsRequest(tmp, '/api/artifacts/1')
    expect(json.status).toBe(200)
    expect(JSON.parse(json.body).id).toBe('1')

    const all = handleArtifactsRequest(tmp, '/api/artifacts')
    expect(JSON.parse(all.body).artifacts.length).toBe(1)

    expect(handleArtifactsRequest(tmp, '/artifacts/99').status).toBe(404)
    expect(handleArtifactsRequest(tmp, '/api/artifacts/99').status).toBe(404)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})

test('short /<id> path serves the artifact page', () => {
  const tmp = seed()
  try {
    const detail = handleArtifactsRequest(tmp, '/1')
    expect(detail.status).toBe(200)
    expect(detail.body).toContain('Artifact 1')
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})

test('startArtifactsServer serves over HTTP and stops cleanly', async () => {
  const tmp = seed()
  try {
    const { url, alreadyRunning } = await startArtifactsServer(tmp, 0)
    expect(alreadyRunning).toBe(false)
    expect(activeArtifactsServer()?.url).toBe(url)

    const detail = await fetch(`${url}/artifacts/1`)
    expect(detail.status).toBe(200)
    expect(await detail.text()).toContain('Artifact 1')

    const missing = await fetch(`${url}/artifacts/99`)
    expect(missing.status).toBe(404)

    const second = await startArtifactsServer(tmp, 0)
    expect(second.alreadyRunning).toBe(true)
    expect(second.url).toBe(url)

    expect(await stopArtifactsServer()).toBe(true)
    expect(activeArtifactsServer()).toBeNull()
    expect(await stopArtifactsServer()).toBe(false)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
})
