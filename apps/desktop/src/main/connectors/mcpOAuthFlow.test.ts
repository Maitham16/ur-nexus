import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  authorizeConnector,
  registerClient,
  startLoopbackCapture,
} from './mcpOAuthFlow.js'
import { resetOAuthTokenCache } from './mcpOAuthStore.js'
import type { AuthorizationServerMetadata, FetchLike } from './mcpOAuth.js'

const RESOURCE = 'https://mcp.example/mcp'

beforeEach(() => {
  process.env.UR_DESKTOP_DATA_DIR = mkdtempSync(join(tmpdir(), 'ur-oauth-flow-'))
  resetOAuthTokenCache()
})

afterEach(() => {
  delete process.env.UR_DESKTOP_DATA_DIR
  resetOAuthTokenCache()
})

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
      text: async () => route.text ?? '',
    }
  }) as FetchLike & { calls: { url: string; body?: string }[] }
  impl.calls = calls
  return impl
}

const discovery = {
  'https://mcp.example/.well-known/oauth-protected-resource': {
    body: { authorization_servers: ['https://auth.example'] },
  },
  'https://auth.example/.well-known/oauth-authorization-server': {
    body: {
      authorization_endpoint: 'https://auth.example/authorize',
      token_endpoint: 'https://auth.example/token',
      registration_endpoint: 'https://auth.example/register',
    },
  },
}

describe('startLoopbackCapture', () => {
  test('binds loopback and exposes a callback URL on 127.0.0.1', async () => {
    const capture = await startLoopbackCapture(1000)
    expect(capture.redirectUri).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/oauth\/callback$/)
    capture.close()
  })

  test('resolves with the callback URL when the browser redirects', async () => {
    const capture = await startLoopbackCapture(5000)
    const url = new URL(capture.redirectUri)
    const response = await fetch(`${capture.redirectUri}?code=abc&state=xyz`)
    expect(response.status).toBe(200)
    const received = await capture.waitForCallback
    expect(received).toContain('code=abc')
    expect(received).toContain('state=xyz')
    expect(url.hostname).toBe('127.0.0.1')
  })

  test('answers 404 on any other path without resolving', async () => {
    const capture = await startLoopbackCapture(5000)
    const base = capture.redirectUri.replace('/oauth/callback', '')
    expect((await fetch(`${base}/nope`)).status).toBe(404)
    capture.close()
  })

  test('rejects when the user never completes authorization', async () => {
    const capture = await startLoopbackCapture(50)
    await expect(capture.waitForCallback).rejects.toThrow('timed out')
  })

  test('two captures do not collide on a port', async () => {
    const [a, b] = await Promise.all([startLoopbackCapture(500), startLoopbackCapture(500)])
    expect(a.redirectUri).not.toBe(b.redirectUri)
    a.close()
    b.close()
  })
})

describe('registerClient', () => {
  const metadata: AuthorizationServerMetadata = {
    authorizationEndpoint: 'https://auth.example/authorize',
    tokenEndpoint: 'https://auth.example/token',
    registrationEndpoint: 'https://auth.example/register',
  }

  test('registers a native public client and returns the id', async () => {
    const fetchImpl = fakeFetch({
      'https://auth.example/register': { body: { client_id: 'dyn-1' } },
    })
    const clientId = await registerClient(metadata, 'http://127.0.0.1:1/cb', fetchImpl)
    expect(clientId).toBe('dyn-1')
    const body = JSON.parse(fetchImpl.calls[0]?.body ?? '{}')
    expect(body.token_endpoint_auth_method).toBe('none')
    expect(body.application_type).toBe('native')
    expect(body.redirect_uris).toEqual(['http://127.0.0.1:1/cb'])
  })

  test('returns undefined when the server has no registration endpoint', async () => {
    expect(
      await registerClient(
        { authorizationEndpoint: 'a', tokenEndpoint: 'b' },
        'http://127.0.0.1:1/cb',
        fakeFetch({}),
      ),
    ).toBeUndefined()
  })

  test('returns undefined when registration is rejected', async () => {
    const fetchImpl = fakeFetch({
      'https://auth.example/register': { status: 400 },
    })
    expect(
      await registerClient(metadata, 'http://127.0.0.1:1/cb', fetchImpl),
    ).toBeUndefined()
  })
})

describe('authorizeConnector', () => {
  test('completes the full flow and stores a token', async () => {
    const fetchImpl = fakeFetch({
      ...discovery,
      'https://auth.example/register': { body: { client_id: 'dyn-1' } },
      'https://auth.example/token': {
        body: { access_token: 'at', token_type: 'Bearer', expires_in: 3600, scope: 'mcp:read' },
      },
    })

    const result = await authorizeConnector(
      { projectRoot: '/tmp/p', connectorName: 'remote', resourceUrl: RESOURCE },
      {
        fetchImpl,
        // Stand in for the browser: the user approves, so hit the redirect.
        openExternal: async url => {
          const redirectUri = new URL(url).searchParams.get('redirect_uri')
          const state = new URL(url).searchParams.get('state')
          await fetch(`${redirectUri}?code=the-code&state=${state}`)
        },
        timeoutMs: 5000,
      },
    )

    expect(result.ok).toBe(true)
    expect(result.token?.accessToken).toBe('at')
    expect(result.scope).toBe('mcp:read')
    const tokenCall = fetchImpl.calls.find(call => call.url === 'https://auth.example/token')
    expect(new URLSearchParams(tokenCall?.body ?? '').get('code')).toBe('the-code')
    expect(new URLSearchParams(tokenCall?.body ?? '').has('code_verifier')).toBe(true)
  })

  test('rejects a callback whose state does not match', async () => {
    const fetchImpl = fakeFetch({
      ...discovery,
      'https://auth.example/register': { body: { client_id: 'dyn-1' } },
    })
    const result = await authorizeConnector(
      { projectRoot: '/tmp/p', connectorName: 'remote', resourceUrl: RESOURCE },
      {
        fetchImpl,
        openExternal: async url => {
          const redirectUri = new URL(url).searchParams.get('redirect_uri')
          await fetch(`${redirectUri}?code=the-code&state=forged`)
        },
        timeoutMs: 5000,
      },
    )
    expect(result.ok).toBe(false)
    expect(result.error).toContain('state did not match')
  })

  test('surfaces a server that publishes no OAuth metadata', async () => {
    const result = await authorizeConnector(
      { projectRoot: '/tmp/p', connectorName: 'remote', resourceUrl: RESOURCE },
      { fetchImpl: fakeFetch({}), openExternal: async () => {}, timeoutMs: 500 },
    )
    expect(result.ok).toBe(false)
    expect(result.error).toContain('no OAuth metadata')
  })

  test('surfaces a server with neither a client id nor registration', async () => {
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
    const result = await authorizeConnector(
      { projectRoot: '/tmp/p', connectorName: 'remote', resourceUrl: RESOURCE },
      { fetchImpl, openExternal: async () => {}, timeoutMs: 500 },
    )
    expect(result.ok).toBe(false)
    expect(result.error).toContain('dynamic client registration')
  })

  test('reports the authorization server error when the user declines', async () => {
    const fetchImpl = fakeFetch({
      ...discovery,
      'https://auth.example/register': { body: { client_id: 'dyn-1' } },
    })
    const result = await authorizeConnector(
      { projectRoot: '/tmp/p', connectorName: 'remote', resourceUrl: RESOURCE },
      {
        fetchImpl,
        openExternal: async url => {
          const redirectUri = new URL(url).searchParams.get('redirect_uri')
          await fetch(`${redirectUri}?error=access_denied&error_description=Declined`)
        },
        timeoutMs: 5000,
      },
    )
    expect(result.ok).toBe(false)
    expect(result.error).toContain('access_denied')
  })

  test('binds the token to the resource with the RFC 8707 parameter', async () => {
    const fetchImpl = fakeFetch({
      ...discovery,
      'https://auth.example/register': { body: { client_id: 'dyn-1' } },
      'https://auth.example/token': { body: { access_token: 'at' } },
    })
    let authorizationUrl = ''
    await authorizeConnector(
      { projectRoot: '/tmp/p', connectorName: 'remote', resourceUrl: RESOURCE },
      {
        fetchImpl,
        openExternal: async url => {
          authorizationUrl = url
          const parsed = new URL(url)
          await fetch(
            `${parsed.searchParams.get('redirect_uri')}?code=c&state=${parsed.searchParams.get('state')}`,
          )
        },
        timeoutMs: 5000,
      },
    )
    expect(new URL(authorizationUrl).searchParams.get('resource')).toBe(RESOURCE)
  })
})
