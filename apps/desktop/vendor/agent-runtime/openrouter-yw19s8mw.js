import {
  init_openaiCompatible,
  mapOpenAIToolChoice,
  parseOpenAICompatibleResponse,
  toOpenAIMessages,
  toOpenAITools
} from "./index-0g1a83d8.js";
import {
  axiosPostWithProviderReliability,
  createOpenAISSEMessageStream,
  init_providerHttp,
  init_streamingAdapters,
  mergeAbortSignals
} from "./index-d9nwsx95.js";
import"./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import"./index-mpmmtc93.js";
import"./index-s5dp14ed.js";
import"./index-6dy59xbm.js";
import"./index-0r3wd4mq.js";
import"./index-b5f4m7g4.js";
import"./index-h7h0j06f.js";
import"./index-7h9ddexs.js";
import"./index-f80dj2bz.js";
import"./index-q00jv0fc.js";
import"./index-cs7da0vv.js";
import"./index-ycnb0yeb.js";
import"./index-vpczjthp.js";
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/services/api/openrouter.ts
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
