import { APIConnectionError } from '@urhq-ai/sdk'
import { expect, test } from 'bun:test'
import { withRetry } from '../src/services/api/withRetry.js'

test('withRetry retries transient connection errors', async () => {
  let attempts = 0
  const generator = withRetry(
    async () => ({}) as any,
    async () => {
      attempts++
      if (attempts === 1) {
        throw new APIConnectionError({
          message: 'temporary provider connection failure',
        })
      }
      return 'ok'
    },
    {
      maxRetries: 1,
      model: 'qwen3-coder:480b-cloud',
      thinkingConfig: { type: 'disabled' },
    },
  )

  let next = await generator.next()
  while (!next.done) {
    next = await generator.next()
  }

  expect(next.value).toBe('ok')
  expect(attempts).toBe(2)
})
