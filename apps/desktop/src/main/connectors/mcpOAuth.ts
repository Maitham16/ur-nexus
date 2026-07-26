import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * OAuth 2.1 for remote MCP servers.
 *
 * Remote connectors previously supported only static headers, so any server
 * behind OAuth was unreachable without pasting a manually minted token that
 * then expired. This implements the flow the MCP spec calls for: metadata
 * discovery, authorization code with PKCE, and refresh.
 *
 * Two choices are load-bearing for security. PKCE is mandatory and S256-only —
 * a public client on a loopback redirect has no client secret, so the code
 * verifier is the only thing binding the redirect to this app, and accepting
 * `plain` would discard that. And the `state` parameter is compared in constant
 * time, because it is the CSRF defense for the callback.
 *
 * Network access is injected rather than imported so the flow is testable
 * without a live authorization server.
 */

export type FetchLike = (
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string },
) => Promise<{
  ok: boolean
  status: number
  json: () => Promise<unknown>
  text: () => Promise<string>
}>

export interface PkcePair {
  verifier: string
  challenge: string
  method: 'S256'
}

export interface AuthorizationServerMetadata {
  issuer?: string
  authorizationEndpoint: string
  tokenEndpoint: string
  registrationEndpoint?: string
  scopesSupported?: string[]
}

export interface OAuthToken {
  accessToken: string
  tokenType: string
  refreshToken?: string
  scope?: string
  /** Absolute epoch ms, derived from expires_in at issue time. */
  expiresAt?: number
  /**
   * Client id and token endpoint used to obtain this token. Stored alongside it
   * so a refresh can proceed without repeating discovery or dynamic
   * registration — re-registering would mint a second client on every refresh.
   */
  clientId?: string
  tokenEndpoint?: string
}

/** Base64url without padding, per RFC 7636. */
function base64url(input: Buffer): string {
  return input.toString('base64url')
}

/**
 * Generate a PKCE verifier and its S256 challenge. The verifier is 32 random
 * bytes, which encodes to 43 characters — the minimum RFC 7636 allows and
 * enough entropy that guessing is not a threat.
 */
export function generatePkcePair(): PkcePair {
  const verifier = base64url(randomBytes(32))
  const challenge = base64url(createHash('sha256').update(verifier).digest())
  return { verifier, challenge, method: 'S256' }
}

/** Opaque value binding the callback to this request. */
export function generateState(): string {
  return base64url(randomBytes(16))
}

/** Constant-time comparison so a mismatched state cannot be probed by timing. */
export function statesMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(received, 'utf8')
  if (a.length !== b.length || a.length === 0) return false
  return timingSafeEqual(a, b)
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined
  return value as Record<string, unknown>
}

function readString(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/** Origin-scoped well-known URL, discarding any path on the resource URL. */
export function wellKnownUrl(resourceUrl: string, suffix: string): string {
  const parsed = new URL(resourceUrl)
  return `${parsed.origin}/.well-known/${suffix}`
}

export function parseAuthorizationServerMetadata(
  payload: unknown,
): AuthorizationServerMetadata | undefined {
  const record = asRecord(payload)
  if (!record) return undefined
  const authorizationEndpoint = readString(record, 'authorization_endpoint')
  const tokenEndpoint = readString(record, 'token_endpoint')
  if (!authorizationEndpoint || !tokenEndpoint) return undefined
  const scopes = record.scopes_supported
  return {
    issuer: readString(record, 'issuer'),
    authorizationEndpoint,
    tokenEndpoint,
    registrationEndpoint: readString(record, 'registration_endpoint'),
    scopesSupported: Array.isArray(scopes)
      ? scopes.filter((scope): scope is string => typeof scope === 'string')
      : undefined,
  }
}

/**
 * Discover the authorization server for a remote MCP endpoint. Tries the
 * protected-resource document first (RFC 9728), which is what tells us *which*
 * authorization server to trust, then falls back to assuming the resource
 * origin is also the authorization server.
 */
export async function discoverAuthorizationServer(
  resourceUrl: string,
  fetchImpl: FetchLike,
): Promise<AuthorizationServerMetadata | undefined> {
  const protectedResource = await fetchJson(
    wellKnownUrl(resourceUrl, 'oauth-protected-resource'),
    fetchImpl,
  )
  const issuer = (() => {
    const record = asRecord(protectedResource)
    const servers = record?.authorization_servers
    if (Array.isArray(servers) && typeof servers[0] === 'string') return servers[0]
    return undefined
  })()

  const candidates = [
    issuer ? wellKnownUrl(issuer, 'oauth-authorization-server') : undefined,
    wellKnownUrl(resourceUrl, 'oauth-authorization-server'),
    wellKnownUrl(resourceUrl, 'openid-configuration'),
  ].filter((value): value is string => typeof value === 'string')

  for (const candidate of candidates) {
    const parsed = parseAuthorizationServerMetadata(await fetchJson(candidate, fetchImpl))
    if (parsed) return parsed
  }
  return undefined
}

async function fetchJson(url: string, fetchImpl: FetchLike): Promise<unknown> {
  try {
    const response = await fetchImpl(url, { headers: { accept: 'application/json' } })
    if (!response.ok) return undefined
    return await response.json()
  } catch {
    return undefined
  }
}

export interface AuthorizationUrlOptions {
  metadata: AuthorizationServerMetadata
  clientId: string
  redirectUri: string
  pkce: PkcePair
  state: string
  scopes?: string[]
  /** RFC 8707 audience binding, so the token is scoped to this MCP server. */
  resource?: string
}

export function buildAuthorizationUrl(options: AuthorizationUrlOptions): string {
  const url = new URL(options.metadata.authorizationEndpoint)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', options.clientId)
  url.searchParams.set('redirect_uri', options.redirectUri)
  url.searchParams.set('state', options.state)
  url.searchParams.set('code_challenge', options.pkce.challenge)
  url.searchParams.set('code_challenge_method', options.pkce.method)
  if (options.scopes?.length) url.searchParams.set('scope', options.scopes.join(' '))
  if (options.resource) url.searchParams.set('resource', options.resource)
  return url.toString()
}

function parseTokenResponse(payload: unknown, now: number): OAuthToken {
  const record = asRecord(payload)
  const accessToken = record ? readString(record, 'access_token') : undefined
  if (!record || !accessToken) {
    throw new Error('Authorization server returned no access token')
  }
  const expiresIn = record.expires_in
  return {
    accessToken,
    tokenType: readString(record, 'token_type') ?? 'Bearer',
    refreshToken: readString(record, 'refresh_token'),
    scope: readString(record, 'scope'),
    expiresAt:
      typeof expiresIn === 'number' && Number.isFinite(expiresIn) && expiresIn > 0
        ? now + expiresIn * 1000
        : undefined,
  }
}

async function postForm(
  endpoint: string,
  form: Record<string, string>,
  fetchImpl: FetchLike,
): Promise<unknown> {
  const body = new URLSearchParams(form).toString()
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json',
    },
    body,
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(
      `Token request failed with status ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`,
    )
  }
  return response.json()
}

export async function exchangeCodeForToken(options: {
  metadata: AuthorizationServerMetadata
  clientId: string
  clientSecret?: string
  redirectUri: string
  code: string
  codeVerifier: string
  resource?: string
  fetchImpl: FetchLike
  now?: number
}): Promise<OAuthToken> {
  const form: Record<string, string> = {
    grant_type: 'authorization_code',
    code: options.code,
    redirect_uri: options.redirectUri,
    client_id: options.clientId,
    code_verifier: options.codeVerifier,
  }
  if (options.clientSecret) form.client_secret = options.clientSecret
  if (options.resource) form.resource = options.resource
  const payload = await postForm(options.metadata.tokenEndpoint, form, options.fetchImpl)
  return parseTokenResponse(payload, options.now ?? Date.now())
}

export async function refreshAccessToken(options: {
  metadata: AuthorizationServerMetadata
  clientId: string
  clientSecret?: string
  refreshToken: string
  resource?: string
  fetchImpl: FetchLike
  now?: number
}): Promise<OAuthToken> {
  const form: Record<string, string> = {
    grant_type: 'refresh_token',
    refresh_token: options.refreshToken,
    client_id: options.clientId,
  }
  if (options.clientSecret) form.client_secret = options.clientSecret
  if (options.resource) form.resource = options.resource
  const payload = await postForm(options.metadata.tokenEndpoint, form, options.fetchImpl)
  const token = parseTokenResponse(payload, options.now ?? Date.now())
  // Rotation is optional: servers that omit a new refresh token expect the
  // existing one to keep working, so carry it forward rather than losing it.
  return token.refreshToken ? token : { ...token, refreshToken: options.refreshToken }
}

/**
 * Treat a token as expired slightly early so it is not sent in a request that
 * takes longer to arrive than the token has left.
 */
export function isTokenExpired(
  token: OAuthToken,
  now: number = Date.now(),
  skewMs = 60_000,
): boolean {
  if (token.expiresAt === undefined) return false
  return token.expiresAt - skewMs <= now
}

/** Authorization header for a token, or undefined when nothing is usable. */
export function authorizationHeader(
  token: OAuthToken | undefined,
): Record<string, string> | undefined {
  if (!token?.accessToken) return undefined
  const scheme = token.tokenType?.trim() || 'Bearer'
  const normalized = /^bearer$/i.test(scheme) ? 'Bearer' : scheme
  return { Authorization: `${normalized} ${token.accessToken}` }
}

/**
 * Parse the loopback redirect. Returns an error rather than throwing so the
 * caller can render the authorization server's own failure text.
 */
export function parseCallbackUrl(
  rawUrl: string,
): { code: string; state: string } | { error: string } {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return { error: 'Callback URL could not be parsed' }
  }
  const error = parsed.searchParams.get('error')
  if (error) {
    const description = parsed.searchParams.get('error_description')
    return { error: description ? `${error}: ${description}` : error }
  }
  const code = parsed.searchParams.get('code')
  const state = parsed.searchParams.get('state')
  if (!code || !state) return { error: 'Callback URL is missing code or state' }
  return { code, state }
}
