import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { getElectron } from '../electronModule.js'
import {
  buildAuthorizationUrl,
  discoverAuthorizationServer,
  exchangeCodeForToken,
  generatePkcePair,
  generateState,
  parseCallbackUrl,
  refreshAccessToken,
  statesMatch,
  type AuthorizationServerMetadata,
  type FetchLike,
  type OAuthToken,
} from './mcpOAuth.js'
import { loadOAuthToken, saveOAuthToken } from './mcpOAuthStore.js'

/**
 * Interactive OAuth for remote MCP connectors.
 *
 * The desktop app is a public client, so it uses the loopback redirect of
 * RFC 8252: authorization happens in the user's real browser, where they can
 * see the address bar and their existing session, and the code comes back to a
 * short-lived HTTP listener on 127.0.0.1. An embedded webview would be easier
 * but strips exactly the trust signals that make consent meaningful.
 *
 * The listener binds 127.0.0.1 on an ephemeral port and exists only for the
 * duration of one authorization. It answers exactly one callback path, checks
 * `state` in constant time, and shuts down on completion, timeout, or cancel,
 * so nothing keeps listening after the flow ends.
 */

const CALLBACK_PATH = '/oauth/callback'
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000
/** Client name presented to servers that support dynamic registration. */
const CLIENT_NAME = 'UR Nexus Desktop'

export interface AuthorizeResult {
  ok: boolean
  error?: string
  token?: OAuthToken
  /** Scopes the server actually granted, when it reported them. */
  scope?: string
}

type Deps = {
  fetchImpl?: FetchLike
  openExternal?: (url: string) => Promise<void>
  timeoutMs?: number
  /** Injected for tests; production binds a real loopback listener. */
  now?: () => number
}

async function defaultFetch(): Promise<FetchLike> {
  return globalThis.fetch as unknown as FetchLike
}

async function defaultOpenExternal(url: string): Promise<void> {
  const electron = await getElectron()
  await electron.shell.openExternal(url)
}

function html(title: string, body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font:15px -apple-system,system-ui,sans-serif;padding:3rem;color:#1d1d1f;background:#fff}main{max-width:32rem;margin:0 auto}h1{font-size:1.15rem}p{color:#4b4b50;line-height:1.5}</style></head><body><main><h1>${title}</h1><p>${body}</p></main></body></html>`
}

interface LoopbackCapture {
  redirectUri: string
  /** Resolves with the raw callback URL, or rejects on timeout/cancel. */
  waitForCallback: Promise<string>
  close: () => void
}

/**
 * Start a one-shot loopback listener. Port 0 lets the OS pick a free port,
 * which avoids colliding with whatever else the user is running.
 */
export async function startLoopbackCapture(
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<LoopbackCapture> {
  let server: Server | undefined
  let settle: ((value: string) => void) | undefined
  let fail: ((error: Error) => void) | undefined
  let closed = false

  const timers: NodeJS.Timeout[] = []
  const close = (): void => {
    if (closed) return
    closed = true
    for (const timer of timers) clearTimeout(timer)
    server?.close()
  }

  const waitForCallback = new Promise<string>((resolve, reject) => {
    settle = value => {
      resolve(value)
      close()
    }
    fail = error => {
      reject(error)
      close()
    }
  })

  const handler = (request: IncomingMessage, response: ServerResponse): void => {
    const url = request.url ?? '/'
    if (!url.startsWith(CALLBACK_PATH)) {
      response.writeHead(404, { 'content-type': 'text/plain' })
      response.end('Not found')
      return
    }
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end(
      html(
        'Authorization received',
        'You can close this tab and return to UR Nexus Desktop.',
      ),
    )
    settle?.(`http://127.0.0.1${url}`)
  }

  const address = await new Promise<{ port: number }>((resolve, reject) => {
    server = createServer(handler)
    server.once('error', reject)
    // Bind the loopback interface explicitly: 0.0.0.0 would expose the
    // callback, and with it an authorization code, to the local network.
    server.listen(0, '127.0.0.1', () => {
      const info = server?.address()
      if (info && typeof info === 'object') resolve({ port: info.port })
      else reject(new Error('Loopback listener reported no port'))
    })
  })

  const timeout = setTimeout(() => {
    fail?.(new Error('Authorization timed out'))
  }, timeoutMs)
  timeout.unref?.()
  timers.push(timeout)

  return {
    redirectUri: `http://127.0.0.1:${address.port}${CALLBACK_PATH}`,
    waitForCallback,
    close,
  }
}

/**
 * Register this app with the authorization server (RFC 7591).
 *
 * Most MCP servers publish no pre-provisioned client id, so dynamic
 * registration is the normal path rather than a fallback. `token_endpoint_auth_method`
 * is `none` because a desktop app cannot hold a client secret — PKCE is what
 * protects the exchange.
 */
export async function registerClient(
  metadata: AuthorizationServerMetadata,
  redirectUri: string,
  fetchImpl: FetchLike,
): Promise<string | undefined> {
  if (!metadata.registrationEndpoint) return undefined
  try {
    const response = await fetchImpl(metadata.registrationEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        client_name: CLIENT_NAME,
        redirect_uris: [redirectUri],
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none',
        application_type: 'native',
      }),
    })
    if (!response.ok) return undefined
    const payload = (await response.json()) as Record<string, unknown>
    const clientId = payload?.client_id
    return typeof clientId === 'string' && clientId.length > 0 ? clientId : undefined
  } catch {
    return undefined
  }
}

export interface AuthorizeOptions {
  projectRoot: string
  connectorName: string
  /** The remote MCP endpoint being authorized. */
  resourceUrl: string
  clientId?: string
  scopes?: string[]
}

/**
 * Run the full authorization flow and persist the resulting token.
 *
 * Returns a structured failure instead of throwing: every step here can fail
 * for an ordinary reason — the user closing the browser, a server without
 * discovery metadata — and the Connectors page needs to render the cause.
 */
export async function authorizeConnector(
  options: AuthorizeOptions,
  deps: Deps = {},
): Promise<AuthorizeResult> {
  const fetchImpl = deps.fetchImpl ?? (await defaultFetch())
  const openExternal = deps.openExternal ?? defaultOpenExternal
  let capture: LoopbackCapture | undefined

  try {
    const metadata = await discoverAuthorizationServer(options.resourceUrl, fetchImpl)
    if (!metadata) {
      return {
        ok: false,
        error:
          'This server publishes no OAuth metadata, so it cannot be authorized automatically. Add a static Authorization header instead.',
      }
    }

    capture = await startLoopbackCapture(deps.timeoutMs ?? DEFAULT_TIMEOUT_MS)

    const clientId =
      options.clientId ??
      (await registerClient(metadata, capture.redirectUri, fetchImpl))
    if (!clientId) {
      return {
        ok: false,
        error:
          'The server supports neither a configured client id nor dynamic client registration.',
      }
    }

    const pkce = generatePkcePair()
    const state = generateState()
    const authorizationUrl = buildAuthorizationUrl({
      metadata,
      clientId,
      redirectUri: capture.redirectUri,
      pkce,
      state,
      scopes: options.scopes ?? metadata.scopesSupported,
      resource: options.resourceUrl,
    })

    await openExternal(authorizationUrl)

    const callbackUrl = await capture.waitForCallback
    const parsed = parseCallbackUrl(callbackUrl)
    if ('error' in parsed) return { ok: false, error: parsed.error }
    if (!statesMatch(state, parsed.state)) {
      return { ok: false, error: 'Authorization state did not match; the callback was rejected.' }
    }

    const token = await exchangeCodeForToken({
      metadata,
      clientId,
      redirectUri: capture.redirectUri,
      code: parsed.code,
      codeVerifier: pkce.verifier,
      resource: options.resourceUrl,
      fetchImpl,
      now: deps.now?.(),
    })

    // Remember the client id and token endpoint so a later refresh does not
    // need to re-discover or, worse, register a second client.
    await saveOAuthToken(options.projectRoot, options.connectorName, {
      ...token,
      clientId,
      tokenEndpoint: metadata.tokenEndpoint,
    })

    return { ok: true, token, scope: token.scope }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  } finally {
    capture?.close()
  }
}

/**
 * Refresh a stored token in place. Returns the refreshed token, or undefined
 * when there is nothing usable to refresh with — the caller then treats the
 * connector as unauthorized rather than retrying forever.
 */
export async function refreshStoredToken(
  projectRoot: string,
  connectorName: string,
  deps: Deps = {},
): Promise<OAuthToken | undefined> {
  const existing = await loadOAuthToken(projectRoot, connectorName)
  if (!existing?.refreshToken) return undefined

  if (!existing.clientId || !existing.tokenEndpoint) return undefined

  try {
    const refreshed = await refreshAccessToken({
      metadata: { authorizationEndpoint: '', tokenEndpoint: existing.tokenEndpoint },
      clientId: existing.clientId,
      refreshToken: existing.refreshToken,
      fetchImpl: deps.fetchImpl ?? (await defaultFetch()),
      now: deps.now?.(),
    })
    const persisted: OAuthToken = {
      ...refreshed,
      clientId: existing.clientId,
      tokenEndpoint: existing.tokenEndpoint,
    }
    await saveOAuthToken(projectRoot, connectorName, persisted)
    return persisted
  } catch {
    return undefined
  }
}
