import { describe, expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import {
  authorizationHeader,
  buildAuthorizationUrl,
  discoverAuthorizationServer,
  exchangeCodeForToken,
  generatePkcePair,
  generateState,
  isTokenExpired,
  parseAuthorizationServerMetadata,
  parseCallbackUrl,
  refreshAccessToken,
  statesMatch,
  wellKnownUrl,
  type AuthorizationServerMetadata,
  type FetchLike,
} from './mcpOAuth.js'

const metadata: AuthorizationServerMetadata = {
  authorizationEndpoint: 'https://auth.example/authorize',
  tokenEndpoint: 'https://auth.example/token',
}

/** Minimal fetch double: maps URL to status + JSON body, recording calls. */
function fakeFetch(
  routes: Record<string, { status?: number; body?: unknown; text?: string }>,
): FetchLike & { calls: { url: string; body?: string }[] } {
  const calls: { url: string; body?: string }[] = []
  const impl = (async (url: string, init?: { body?: string }) => {
    calls.push({ url, body: init?.body })
    const route = routes[url]
    if (!route) return { ok: false, status: 404, json: async () => ({}), text: async () => '' }
    const status = route.status ?? 200
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => route.body ?? {},
      text: async () => route.text ?? JSON.stringify(route.body ?? {}),
    }
  }) as FetchLike & { calls: { url: string; body?: string }[] }
  impl.calls = calls
  return impl
}

describe('generatePkcePair', () => {
  test('produces a 43-character verifier and a matching S256 challenge', () => {
    const pkce = generatePkcePair()
    expect(pkce.verifier).toHaveLength(43)
    expect(pkce.method).toBe('S256')
    expect(pkce.challenge).toBe(
      createHash('sha256').update(pkce.verifier).digest('base64url'),
    )
  })

  test('is base64url with no padding', () => {
    const pkce = generatePkcePair()
    expect(pkce.verifier).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(pkce.challenge).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  test('is unique per call', () => {
    expect(generatePkcePair().verifier).not.toBe(generatePkcePair().verifier)
  })
})

describe('state', () => {
  test('generates unique opaque values', () => {
    expect(generateState()).not.toBe(generateState())
  })

  test('matches only an identical state', () => {
    const state = generateState()
    expect(statesMatch(state, state)).toBe(true)
    expect(statesMatch(state, `${state}x`)).toBe(false)
    expect(statesMatch(state, generateState())).toBe(false)
  })

  test('an empty state never matches', () => {
    expect(statesMatch('', '')).toBe(false)
  })
})

describe('wellKnownUrl', () => {
  test('is origin-scoped and discards the resource path', () => {
    expect(wellKnownUrl('https://mcp.example/some/path?q=1', 'oauth-protected-resource')).toBe(
      'https://mcp.example/.well-known/oauth-protected-resource',
    )
  })

  test('preserves a non-default port', () => {
    expect(wellKnownUrl('https://mcp.example:8443/x', 'openid-configuration')).toBe(
      'https://mcp.example:8443/.well-known/openid-configuration',
    )
  })
})

describe('parseAuthorizationServerMetadata', () => {
  test('requires both endpoints', () => {
    expect(parseAuthorizationServerMetadata({ token_endpoint: 'https://a/t' })).toBeUndefined()
    expect(
      parseAuthorizationServerMetadata({ authorization_endpoint: 'https://a/a' }),
    ).toBeUndefined()
  })

  test('reads endpoints, issuer, and supported scopes', () => {
    expect(
      parseAuthorizationServerMetadata({
        issuer: 'https://auth.example',
        authorization_endpoint: 'https://auth.example/authorize',
        token_endpoint: 'https://auth.example/token',
        scopes_supported: ['mcp:read', 42, 'mcp:write'],
      }),
    ).toEqual({
      issuer: 'https://auth.example',
      authorizationEndpoint: 'https://auth.example/authorize',
      tokenEndpoint: 'https://auth.example/token',
      registrationEndpoint: undefined,
      scopesSupported: ['mcp:read', 'mcp:write'],
    })
  })

  test('rejects non-objects', () => {
    for (const value of [null, undefined, 'x', 5, []]) {
      expect(parseAuthorizationServerMetadata(value)).toBeUndefined()
    }
  })
})

describe('discoverAuthorizationServer', () => {
  test('follows the protected-resource document to the named issuer', async () => {
    const fetchImpl = fakeFetch({
      'https://mcp.example/.well-known/oauth-protected-resource': {
        body: { authorization_servers: ['https://auth.example'] },
      },
      'https://auth.example/.well-known/oauth-authorization-server': {
        body: {
          authorization_endpoint: 'https://auth.example/authorize',
          token_endpoint: 'https://auth.example/token',
        },
      },
    })
    const found = await discoverAuthorizationServer('https://mcp.example/mcp', fetchImpl)
    expect(found?.tokenEndpoint).toBe('https://auth.example/token')
  })

  test('falls back to the resource origin when no protected-resource doc exists', async () => {
    const fetchImpl = fakeFetch({
      'https://mcp.example/.well-known/oauth-authorization-server': {
        body: {
          authorization_endpoint: 'https://mcp.example/authorize',
          token_endpoint: 'https://mcp.example/token',
        },
      },
    })
    const found = await discoverAuthorizationServer('https://mcp.example/mcp', fetchImpl)
    expect(found?.authorizationEndpoint).toBe('https://mcp.example/authorize')
  })

  test('falls back to openid-configuration last', async () => {
    const fetchImpl = fakeFetch({
      'https://mcp.example/.well-known/openid-configuration': {
        body: {
          authorization_endpoint: 'https://mcp.example/oidc/authorize',
          token_endpoint: 'https://mcp.example/oidc/token',
        },
      },
    })
    const found = await discoverAuthorizationServer('https://mcp.example/mcp', fetchImpl)
    expect(found?.tokenEndpoint).toBe('https://mcp.example/oidc/token')
  })

  test('returns undefined when nothing is discoverable', async () => {
    expect(
      await discoverAuthorizationServer('https://mcp.example/mcp', fakeFetch({})),
    ).toBeUndefined()
  })

  test('a throwing fetch does not propagate', async () => {
    const throwing = (async () => {
      throw new Error('offline')
    }) as unknown as FetchLike
    expect(
      await discoverAuthorizationServer('https://mcp.example/mcp', throwing),
    ).toBeUndefined()
  })
})

describe('buildAuthorizationUrl', () => {
  const pkce = generatePkcePair()

  test('sets the PKCE and response parameters', () => {
    const url = new URL(
      buildAuthorizationUrl({
        metadata,
        clientId: 'client-1',
        redirectUri: 'http://127.0.0.1:7777/callback',
        pkce,
        state: 'state-1',
      }),
    )
    expect(url.searchParams.get('response_type')).toBe('code')
    expect(url.searchParams.get('client_id')).toBe('client-1')
    expect(url.searchParams.get('code_challenge')).toBe(pkce.challenge)
    expect(url.searchParams.get('code_challenge_method')).toBe('S256')
    expect(url.searchParams.get('state')).toBe('state-1')
  })

  test('includes scopes and the RFC 8707 resource when supplied', () => {
    const url = new URL(
      buildAuthorizationUrl({
        metadata,
        clientId: 'c',
        redirectUri: 'http://127.0.0.1/cb',
        pkce,
        state: 's',
        scopes: ['mcp:read', 'mcp:write'],
        resource: 'https://mcp.example/mcp',
      }),
    )
    expect(url.searchParams.get('scope')).toBe('mcp:read mcp:write')
    expect(url.searchParams.get('resource')).toBe('https://mcp.example/mcp')
  })

  test('omits scope when none are requested', () => {
    const url = new URL(
      buildAuthorizationUrl({
        metadata,
        clientId: 'c',
        redirectUri: 'http://127.0.0.1/cb',
        pkce,
        state: 's',
        scopes: [],
      }),
    )
    expect(url.searchParams.has('scope')).toBe(false)
  })
})

describe('exchangeCodeForToken', () => {
  test('posts the verifier and derives an absolute expiry', async () => {
    const fetchImpl = fakeFetch({
      'https://auth.example/token': {
        body: {
          access_token: 'at',
          token_type: 'Bearer',
          refresh_token: 'rt',
          expires_in: 3600,
          scope: 'mcp:read',
        },
      },
    })
    const token = await exchangeCodeForToken({
      metadata,
      clientId: 'c',
      redirectUri: 'http://127.0.0.1/cb',
      code: 'the-code',
      codeVerifier: 'the-verifier',
      fetchImpl,
      now: 1_000_000,
    })
    expect(token).toEqual({
      accessToken: 'at',
      tokenType: 'Bearer',
      refreshToken: 'rt',
      scope: 'mcp:read',
      expiresAt: 1_000_000 + 3_600_000,
    })
    const body = new URLSearchParams(fetchImpl.calls[0]?.body ?? '')
    expect(body.get('grant_type')).toBe('authorization_code')
    expect(body.get('code_verifier')).toBe('the-verifier')
    expect(body.get('code')).toBe('the-code')
    expect(body.has('client_secret')).toBe(false)
  })

  test('includes a client secret only for confidential clients', async () => {
    const fetchImpl = fakeFetch({
      'https://auth.example/token': { body: { access_token: 'at' } },
    })
    await exchangeCodeForToken({
      metadata,
      clientId: 'c',
      clientSecret: 'shh',
      redirectUri: 'http://127.0.0.1/cb',
      code: 'x',
      codeVerifier: 'v',
      fetchImpl,
    })
    expect(new URLSearchParams(fetchImpl.calls[0]?.body ?? '').get('client_secret')).toBe('shh')
  })

  test('defaults the token type and leaves expiry unset when absent', async () => {
    const fetchImpl = fakeFetch({
      'https://auth.example/token': { body: { access_token: 'at' } },
    })
    const token = await exchangeCodeForToken({
      metadata,
      clientId: 'c',
      redirectUri: 'http://127.0.0.1/cb',
      code: 'x',
      codeVerifier: 'v',
      fetchImpl,
    })
    expect(token.tokenType).toBe('Bearer')
    expect(token.expiresAt).toBeUndefined()
  })

  test('surfaces a server error with its status', async () => {
    const fetchImpl = fakeFetch({
      'https://auth.example/token': { status: 400, text: 'invalid_grant' },
    })
    await expect(
      exchangeCodeForToken({
        metadata,
        clientId: 'c',
        redirectUri: 'http://127.0.0.1/cb',
        code: 'x',
        codeVerifier: 'v',
        fetchImpl,
      }),
    ).rejects.toThrow(/status 400.*invalid_grant/)
  })

  test('rejects a 200 response with no access token', async () => {
    const fetchImpl = fakeFetch({
      'https://auth.example/token': { body: { token_type: 'Bearer' } },
    })
    await expect(
      exchangeCodeForToken({
        metadata,
        clientId: 'c',
        redirectUri: 'http://127.0.0.1/cb',
        code: 'x',
        codeVerifier: 'v',
        fetchImpl,
      }),
    ).rejects.toThrow('no access token')
  })
})

describe('refreshAccessToken', () => {
  test('carries the old refresh token forward when the server omits a new one', async () => {
    const fetchImpl = fakeFetch({
      'https://auth.example/token': { body: { access_token: 'at2' } },
    })
    const token = await refreshAccessToken({
      metadata,
      clientId: 'c',
      refreshToken: 'original',
      fetchImpl,
    })
    expect(token.refreshToken).toBe('original')
  })

  test('adopts a rotated refresh token', async () => {
    const fetchImpl = fakeFetch({
      'https://auth.example/token': {
        body: { access_token: 'at2', refresh_token: 'rotated' },
      },
    })
    const token = await refreshAccessToken({
      metadata,
      clientId: 'c',
      refreshToken: 'original',
      fetchImpl,
    })
    expect(token.refreshToken).toBe('rotated')
  })

  test('uses the refresh_token grant', async () => {
    const fetchImpl = fakeFetch({
      'https://auth.example/token': { body: { access_token: 'at' } },
    })
    await refreshAccessToken({ metadata, clientId: 'c', refreshToken: 'r', fetchImpl })
    expect(new URLSearchParams(fetchImpl.calls[0]?.body ?? '').get('grant_type')).toBe(
      'refresh_token',
    )
  })
})

describe('isTokenExpired', () => {
  test('a token with no expiry never expires', () => {
    expect(isTokenExpired({ accessToken: 'a', tokenType: 'Bearer' })).toBe(false)
  })

  test('expires early by the clock-skew margin', () => {
    const token = { accessToken: 'a', tokenType: 'Bearer', expiresAt: 100_000 }
    expect(isTokenExpired(token, 0)).toBe(false)
    expect(isTokenExpired(token, 39_000)).toBe(false)
    expect(isTokenExpired(token, 41_000)).toBe(true)
    expect(isTokenExpired(token, 200_000)).toBe(true)
  })
})

describe('authorizationHeader', () => {
  test('builds a bearer header', () => {
    expect(authorizationHeader({ accessToken: 'at', tokenType: 'Bearer' })).toEqual({
      Authorization: 'Bearer at',
    })
  })

  test('normalizes bearer casing but preserves other schemes', () => {
    expect(authorizationHeader({ accessToken: 'at', tokenType: 'bearer' })?.Authorization).toBe(
      'Bearer at',
    )
    expect(authorizationHeader({ accessToken: 'at', tokenType: 'DPoP' })?.Authorization).toBe(
      'DPoP at',
    )
  })

  test('returns nothing without a usable token', () => {
    expect(authorizationHeader(undefined)).toBeUndefined()
    expect(authorizationHeader({ accessToken: '', tokenType: 'Bearer' })).toBeUndefined()
  })
})

describe('parseCallbackUrl', () => {
  test('extracts code and state', () => {
    expect(parseCallbackUrl('http://127.0.0.1:7777/cb?code=abc&state=xyz')).toEqual({
      code: 'abc',
      state: 'xyz',
    })
  })

  test('reports the server error and description', () => {
    expect(
      parseCallbackUrl('http://127.0.0.1/cb?error=access_denied&error_description=User%20said%20no'),
    ).toEqual({ error: 'access_denied: User said no' })
  })

  test('reports a bare error without a description', () => {
    expect(parseCallbackUrl('http://127.0.0.1/cb?error=server_error')).toEqual({
      error: 'server_error',
    })
  })

  test('rejects a callback missing code or state', () => {
    expect(parseCallbackUrl('http://127.0.0.1/cb?code=only')).toEqual({
      error: 'Callback URL is missing code or state',
    })
  })

  test('rejects an unparseable URL', () => {
    expect(parseCallbackUrl('not a url')).toEqual({ error: 'Callback URL could not be parsed' })
  })
})
