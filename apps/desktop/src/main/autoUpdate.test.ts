import { describe, expect, test } from 'bun:test'

import { checkForUpdates, isNewerVersion } from './autoUpdate.js'

describe('desktop release updates', () => {
  test('compares semantic release versions', () => {
    expect(isNewerVersion('v1.0.4', '1.0.3')).toBe(true)
    expect(isNewerVersion('1.0.3', '1.0.3')).toBe(false)
    expect(isNewerVersion('1.0.2', '1.0.3')).toBe(false)
    expect(isNewerVersion('not-a-version', '1.0.3')).toBe(false)
  })

  test('checks the public GitHub release without a deprecated updater dependency', async () => {
    const fetchMock = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.headers).toMatchObject({
        Accept: 'application/vnd.github+json',
      })
      return new Response(
        JSON.stringify({
          tag_name: 'v1.0.4',
          html_url: 'https://github.com/Maitham16/ur-nexus/releases/tag/v1.0.4',
        }),
        { status: 200 },
      )
    }) as typeof fetch

    await expect(checkForUpdates(fetchMock)).resolves.toEqual({
      updateAvailable: true,
      version: '1.0.4',
      url: 'https://github.com/Maitham16/ur-nexus/releases/tag/v1.0.4',
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
