/**
 * Redact sensitive values from objects/strings before logging or sending to the renderer.
 * Matches Authorization headers and values whose keys contain KEY, TOKEN, SECRET, or PASSWORD.
 */

const SENSITIVE_KEY_RE = /(key|token|secret|password|authorization|auth)/i
const SENSITIVE_PREFIX_RE = /^(sk-|sk_|sk-proj-|sk-ant-|xox[baprs]-|gh[pousr]_|AIza)/i

export function redactString(value: string): string {
  if (SENSITIVE_PREFIX_RE.test(value.trim())) {
    return '<redacted>'
  }
  return value
}

export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(headers)) {
    if (/^authorization$/i.test(k)) {
      out[k] = '<redacted>'
    } else {
      out[k] = redactString(v)
    }
  }
  return out
}

export function redactValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return redactString(value)
  }
  if (Array.isArray(value)) {
    return value.map(redactValue)
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY_RE.test(k)) {
        out[k] = typeof v === 'string' && v.length > 0 ? '<redacted>' : v
      } else {
        out[k] = redactValue(v)
      }
    }
    return out
  }
  return value
}
