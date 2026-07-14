import { APP_VERSION } from './vendorGlobals.js'

type ReleaseResponse = {
  tag_name?: string
  html_url?: string
}

function versionParts(value: string): number[] | undefined {
  const match = value.trim().replace(/^v/, '').match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/)
  return match ? match.slice(1).map(Number) : undefined
}

export function isNewerVersion(candidate: string, current: string): boolean {
  const next = versionParts(candidate)
  const installed = versionParts(current)
  if (!next || !installed) return false
  for (let index = 0; index < 3; index += 1) {
    if (next[index] !== installed[index]) return next[index] > installed[index]
  }
  return false
}

export async function checkForUpdates(
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<{ updateAvailable: boolean; version?: string; url?: string; error?: string }> {
  try {
    const response = await fetchImpl(
      'https://api.github.com/repos/Maitham16/ur-nexus/releases/latest',
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': `ur-nexus-desktop/${APP_VERSION}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    )
    if (!response.ok) {
      throw new Error(`GitHub release check failed (${response.status})`)
    }
    const release = (await response.json()) as ReleaseResponse
    const version = release.tag_name?.replace(/^v/, '')
    return {
      updateAvailable: version ? isNewerVersion(version, APP_VERSION) : false,
      version,
      url: release.html_url,
    }
  } catch (err) {
    return { updateAvailable: false, error: err instanceof Error ? err.message : String(err) }
  }
}
