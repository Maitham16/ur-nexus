import { describe, expect, it } from 'bun:test'
import {
  openProject,
  createSession,
  listTools,
  listProviders,
  listModels,
  QueryEngine,
} from '../src/index.js'

describe('@ur/agent-runtime', () => {
  it('can open a project and create a session without invoking ur', async () => {
    const project = await openProject(process.cwd())
    expect(project.root).toBe(process.cwd())
    expect(project.appStateStore.getState()).toBeDefined()

    const session = await createSession(project)
    expect(session.sessionId).toBeDefined()
    expect(session.engine).toBeInstanceOf(QueryEngine)
  })

  it('exposes listTools without shelling out', async () => {
    const project = await openProject(process.cwd())
    const tools = listTools(project)
    expect(tools.length).toBeGreaterThan(0)
    expect(tools.some(t => t.name === 'Read')).toBe(true)
    expect(tools.some(t => t.name === 'Bash')).toBe(true)
  })

  it('exposes listProviders without shelling out', async () => {
    const project = await openProject(process.cwd())
    const providers = listProviders(project)
    expect(providers.length).toBeGreaterThan(0)
    expect(providers.some(p => p.id === 'ollama')).toBe(true)
  })

  it('exposes listModels without shelling out', async () => {
    const project = await openProject(process.cwd())
    const models = listModels(project)
    expect(Array.isArray(models)).toBe(true)
  })
})
