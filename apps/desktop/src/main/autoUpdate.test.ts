import { describe, expect, test } from 'bun:test'

import { checkForUpdates, isNewerVersion } from './autoUpdate.js'
import { APP_VERSION } from './vendorGlobals.js'

/**
 * The "update available" fixture is derived from APP_VERSION rather than
 * hardcoded. A literal tag stops being newer the moment the app passes it, so a
 * pinned fixture turns every release into a spurious test failure.
 */
function versionAbove(version: string): string {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number)
  return `${major}.${minor}.${patch + 1}`
}

describe('desktop release updates', () => {
  test('compares semantic release versions', () => {
    expect(isNewerVersion('v1.0.8', '1.0.7')).toBe(true)
    expect(isNewerVersion('1.0.7', '1.0.7')).toBe(false)
    expect(isNewerVersion('1.0.6', '1.0.7')).toBe(false)
    expect(isNewerVersion('not-a-version', '1.0.7')).toBe(false)
  })

  test('compares across minor and major boundaries', () => {
    expect(isNewerVersion('1.1.0', '1.0.9')).toBe(true)
    expect(isNewerVersion('1.0.9', '1.1.0')).toBe(false)
    expect(isNewerVersion('2.0.0', '1.99.99')).toBe(true)
  })

  test('checks the public GitHub release without a deprecated updater dependency', async () => {
    const next = versionAbove(APP_VERSION)
    const url = `https://github.com/Maitham16/ur-nexus/releases/tag/v${next}`
    const fetchMock = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.headers).toMatchObject({
        Accept: 'application/vnd.github+json',
      })
      return new Response(
        JSON.stringify({ tag_name: `v${next}`, html_url: url }),
        { status: 200 },
      )
    }) as typeof fetch

    await expect(checkForUpdates(fetchMock)).resolves.toEqual({
      updateAvailable: true,
      version: next,
      url,
    })
  })

  test('reports no update when the published release matches the running app', async () => {
    const url = `https://github.com/Maitham16/ur-nexus/releases/tag/v${APP_VERSION}`
    const fetchMock = (async () =>
      new Response(
        JSON.stringify({ tag_name: `v${APP_VERSION}`, html_url: url }),
        { status: 200 },
      )) as typeof fetch

    await expect(checkForUpdates(fetchMock)).resolves.toMatchObject({
      updateAvailable: false,
    })
  })

  test('returns a useful error when GitHub is unavailable', async () => {
    const fetchMock = (async () => new Response('', { status: 503 })) as typeof fetch
    await expect(checkForUpdates(fetchMock)).resolves.toEqual({
      updateAvailable: false,
      error: 'GitHub release check failed (503)',
    })
  })
})
