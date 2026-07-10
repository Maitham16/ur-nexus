import {
  init_openaiCompatible,
  mapOpenAIToolChoice,
  parseOpenAICompatibleResponse,
  toOpenAIMessages,
  toOpenAITools
} from "./index-wj6ffjhk.js";
import {
  axiosPostWithProviderReliability,
  createOpenAISSEMessageStream,
  init_providerHttp,
  init_streamingAdapters,
  mergeAbortSignals
} from "./index-57ej790j.js";
import"./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import"./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import"./index-a9y6sg4d.js";
import"./index-dsy9thtk.js";
import"./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/api/openrouter.ts
import { randomUUID } from "crypto";
async function createOpenRouterClient(options) {
  const { apiKey, maxRetries } = options;
  const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
  async function doRequest(params, requestOptions) {
    const clientRequestId = params?.headers?.["x-client-request-id"];
    const tools = toOpenAITools(params.tools);
    const response = await axiosPostWithProviderReliability(`${OPENROUTER_BASE}/chat/completions`, {
      model: params.model,
      messages: toOpenAIMessages(params, "openrouter"),
      max_tokens: params.max_tokens,
      stream: Boolean(params.stream),
      ...tools.length > 0 ? { tools } : {},
      ...params.tool_choice !== undefined ? { tool_choice: mapOpenAIToolChoice(params.tool_choice) } : {}
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://ur-nexus.local",
        "X-Title": "UR-Nexus",
        ...clientRequestId && { "x-client-request-id": clientRequestId },
        ...requestOptions?.headers ?? {}
      }
    }, {
      maxRetries,
      timeoutMs: requestOptions?.timeoutMs,
      signal: requestOptions?.signal
    });
    const data = response.data;
    return {
      response,
      data: parseOpenAICompatibleResponse(data.id ? data : { ...data, id: `openrouter-${randomUUID()}` }, params.model, "openrouter")
    };
  }
  async function doStream(params, requestOptions, controller) {
    const clientRequestId = params?.headers?.["x-client-request-id"];
    const tools = toOpenAITools(params.tools);
    const streamController = controller ?? new AbortController;
    const signal = mergeAbortSignals([requestOptions?.signal, streamController.signal]);
    const response = await axiosPostWithProviderReliability(`${OPENROUTER_BASE}/chat/completions`, {
      model: params.model,
      messages: toOpenAIMessages(params, "openrouter"),
      max_tokens: params.max_tokens,
      stream: true,
      ...tools.length > 0 ? { tools } : {},
      ...params.tool_choice !== undefined ? { tool_choice: mapOpenAIToolChoice(params.tool_choice) } : {}
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://ur-nexus.local",
        "X-Title": "UR-Nexus",
        ...clientRequestId && { "x-client-request-id": clientRequestId },
        ...requestOptions?.headers ?? {}
      },
      responseType: "stream"
    }, {
      maxRetries,
      timeoutMs: requestOptions?.timeoutMs,
      signal
    });
    const requestId = response.headers?.["x-request-id"] ?? `openrouter-${randomUUID()}`;
    return {
      response,
      requestId,
      data: createOpenAISSEMessageStream(response.data, {
        controller: streamController,
        signal,
        model: params.model,
        requestId,
        providerName: "openrouter"
      })
    };
  }
  const messagesAPI = {
    create(params, options2) {
      if (params.stream) {
        const controller = new AbortController;
        const requestPromise = doStream(params, options2, controller);
        return {
          async withResponse() {
            const { response, data, requestId } = await requestPromise;
            return {
              data,
              response,
              request_id: requestId
            };
          },
          controller
        };
      }
      return doRequest(params, options2).then(({ response, data }) => ({
        ...data,
        withResponse: () => ({
          data,
          response,
          request_id: response.data?.id ?? response.headers?.["x-request-id"] ?? randomUUID()
        })
      }));
    },
    async countTokens(params) {
      return {
        input_tokens: estimateTokenCount(params)
      };
    }
  };
  return {
    beta: {
      messages: messagesAPI
    }
  };
}
function estimateTokenCount(params) {
  const text = JSON.stringify(params.messages ?? []);
  return Math.ceil(text.length / 4);
}
var init_openrouter = __esm(() => {
  init_openaiCompatible();
  init_streamingAdapters();
  init_providerHttp();
});
init_openrouter();

export {
  createOpenRouterClient
};
