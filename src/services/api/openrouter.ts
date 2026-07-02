/**
 * OpenRouter API client.
 * OpenRouter provides access to multiple models through a single API.
 */

import axios from 'axios'
import { randomUUID } from 'crypto'
import {
  mapOpenAIToolChoice,
  parseOpenAICompatibleResponse,
  toOpenAIMessages,
  toOpenAITools,
} from './openaiCompatible.js'
import { createOneShotMessageStream } from './streamingAdapters.js'

type URHQClient = {
  beta: { messages: any }
}

export async function createOpenRouterClient(
  options: {
    apiKey?: string
    maxRetries: number
    model?: string
  },
): Promise<URHQClient> {
  const { apiKey, maxRetries } = options
  const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

  async function doRequest(params: any, extraHeaders?: Record<string, string>) {
    const clientRequestId = params?.headers?.['x-client-request-id']
    const tools = toOpenAITools(params.tools)

    const response = await axios.post(
      `${OPENROUTER_BASE}/chat/completions`,
      {
        model: params.model,
        messages: toOpenAIMessages(params),
        max_tokens: params.max_tokens,
        stream: false,
        ...(tools.length > 0 ? { tools } : {}),
        ...(params.tool_choice !== undefined
          ? { tool_choice: mapOpenAIToolChoice(params.tool_choice) }
          : {}),
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://ur-agent.local',
          'X-Title': 'UR-AGENT',
          ...(clientRequestId && { 'x-client-request-id': clientRequestId }),
          ...extraHeaders,
        },
        timeout: 60000,
      }
    )

    const data = response.data
    return {
      response,
      data: parseOpenAICompatibleResponse(
        data.id ? data : { ...data, id: `openrouter-${randomUUID()}` },
        params.model,
        'openrouter',
      ),
    }
  }

  const messagesAPI = {
    create(params: any, options?: any) {
      // Handle streaming requests - return object with withResponse method
      if (params.stream) {
        const requestPromise = doRequest(params, options?.headers)
        return {
          async withResponse() {
            const { response, data } = await requestPromise
            return {
              data: createOneShotMessageStream(data),
              response,
              request_id: response.data?.id ?? response.headers?.['x-request-id'] ?? randomUUID(),
            }
          },
        }
      }

      // Non-streaming: return data directly with withResponse method attached
      return doRequest(params, options?.headers).then(({ response, data }) => ({
        ...data,
        withResponse: () => ({
          data,
          response,
          request_id: response.data?.id ?? response.headers?.['x-request-id'] ?? randomUUID(),
        }),
      }))
    },
    async countTokens(params: any) {
      return {
        input_tokens: estimateTokenCount(params),
      }
    },
  }

  return {
    beta: {
      messages: messagesAPI,
    },
  } as URHQClient
}

function estimateTokenCount(params: any): number {
  const text = JSON.stringify(params.messages ?? [])
  return Math.ceil(text.length / 4)
}
