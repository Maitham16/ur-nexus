import {
  createBufferedMessageReplayStream,
  init_streamingAdapters
} from "./index-d9nwsx95.js";
import {
  ProviderCapabilityError,
  SUBSCRIPTION_CLI_PROVIDER_BOUNDARY,
  init_providerClient,
  init_providerRegistry
} from "./index-133awary.js";
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

// src/services/api/urhqSubscription.ts
import { spawn } from "node:child_process";
import { randomUUID } from "crypto";
function createURHQSubscriptionClient(providerId, options) {
  const spec = CLI_SPECS[providerId];
  if (!spec) {
    throw new Error(`No subscription CLI dispatch is configured for provider "${providerId}".`);
  }
  const run = options.runner ?? defaultRunner;
  async function doRequest(params, requestOptions) {
    const model = cliModelName(params.model ?? options.model ?? "");
    if (!model) {
      throw new Error(`Provider "${providerId}" requires a model to dispatch to its CLI.`);
    }
    const prompt = messagesToPrompt(params, providerId);
    const result = await run(options.commandPath, spec.args(model, prompt), {
      stdinMode: spec.stdinMode,
      signal: requestOptions?.signal,
      timeoutMs: options.timeoutMs ?? 120000
    });
    const failure = formatCliFailure(providerId, options.commandPath, model, result);
    if (failure) {
      throw new Error(failure);
    }
    const text = extractText(result.stdout);
    if (!text) {
      throw new Error(`Subscription CLI "${options.commandPath}" for ${providerId} produced no output. Boundary: ${SUBSCRIPTION_CLI_PROVIDER_BOUNDARY}`);
    }
    const data = {
      id: `${providerId}-${randomUUID()}`,
      type: "message",
      role: "assistant",
      model: params.model ?? options.model,
      content: [{ type: "text", text }],
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: {
        input_tokens: estimateTokens(prompt),
        output_tokens: estimateTokens(text),
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0
      }
    };
    const clientRequestId = params?.headers?.["x-client-request-id"];
    return {
      data,
      response: { headers: clientRequestId ? { "x-client-request-id": clientRequestId } : {} }
    };
  }
  const messagesAPI = {
    create(params, requestOptions) {
      if (params.stream) {
        const pending = doRequest(params, requestOptions);
        return {
          async withResponse() {
            const { response, data } = await pending;
            return {
              data: createBufferedMessageReplayStream(data),
              response,
              request_id: data.id
            };
          }
        };
      }
      return doRequest(params, requestOptions).then(({ response, data }) => ({
        ...data,
        withResponse: () => ({ data, response, request_id: data.id })
      }));
    },
    async countTokens(params) {
      return { input_tokens: estimateTokens(messagesToPrompt(params, providerId)) };
    }
  };
  return { beta: { messages: messagesAPI } };
}
function getSubscriptionCliStdinMode(input, mode) {
  if (mode)
    return mode;
  return input === undefined ? "ignore" : "pipe";
}
function cliModelName(model) {
  const slash = model.indexOf("/");
  return slash >= 0 ? model.slice(slash + 1) : model;
}
function formatCliFailure(providerId, commandPath, model, result) {
  const parsed = parseCliJsonFailure(result.stdout);
  if (result.code === 0 && !parsed?.isError) {
    return null;
  }
  const rawStderr = result.stderr.trim();
  const rawStdout = result.stdout.trim();
  const summary = summarizeKnownCliFailure(rawStderr) ?? parsed?.message ?? summarizeKnownCliFailure(rawStdout) ?? firstUsefulLine(rawStderr) ?? firstUsefulLine(rawStdout) ?? "no output";
  const status = parsed?.status ? ` (status ${parsed.status})` : "";
  const exit = result.code === 0 ? "reported an error" : `exited ${result.code}`;
  return `Subscription CLI "${commandPath}" for ${providerId} ${exit}${status} with model "${model}": ${summary}. Suggested action: run /model and choose a valid model for ${providerId}, or run: ur provider doctor ${providerId}. UR did not fall back to another provider. Boundary: ${SUBSCRIPTION_CLI_PROVIDER_BOUNDARY}`;
}
function parseCliJsonFailure(stdout) {
  const raw = stdout.trim();
  if (!raw)
    return null;
  try {
    const parsed = JSON.parse(raw);
    if (!isParsedCliObject(parsed))
      return null;
    const entry = parsed;
    const isError = entry.is_error === true || entry.error !== undefined;
    if (!isError)
      return null;
    const message = [entry.result, entry.message, entry.error, entry.response].find((value) => typeof value === "string" && value.trim());
    const status = typeof entry.api_error_status === "number" || typeof entry.api_error_status === "string" ? entry.api_error_status : undefined;
    return { isError, status, message: message?.trim() };
  } catch {
    return null;
  }
}
function summarizeKnownCliFailure(text) {
  if (!text)
    return null;
  const reasonMessage = text.match(/reasonMessage:\s*'([^']+)'/)?.[1];
  if (reasonMessage)
    return reasonMessage;
  if (/IneligibleTierError|UNSUPPORTED_CLIENT/i.test(text)) {
    return "The selected Gemini CLI account/client is not eligible for this Gemini Code Assist runtime.";
  }
  if (/There's an issue with the selected model/i.test(text)) {
    return firstUsefulLine(text);
  }
  return null;
}
function firstUsefulLine(text) {
  const line = text.split(/\r?\n/).map((value) => value.trim()).find((value) => value && !value.startsWith("at ") && !value.startsWith("file://"));
  return line ? truncate(line, 800) : null;
}
function truncate(value, max) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}
function extractText(stdout) {
  const raw = stdout.trim();
  if (!raw)
    return "";
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "string")
      return parsed;
    if (!isParsedCliObject(parsed))
      return raw;
    const candidate = cliTextCandidate(parsed);
    if (typeof candidate === "string" && candidate.trim())
      return candidate;
  } catch {}
  return raw;
}
function isParsedCliObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function cliTextCandidate(parsed) {
  return parsed.result ?? parsed.response ?? parsed.text ?? parsed.output ?? nestedMessageContent(parsed.message) ?? firstChoiceContent(parsed.choices) ?? contentArrayText(parsed.content);
}
function nestedMessageContent(message) {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return;
  }
  return message.content;
}
function firstChoiceContent(choices) {
  if (!Array.isArray(choices))
    return;
  const first = choices[0];
  if (!first || typeof first !== "object" || Array.isArray(first)) {
    return;
  }
  const message = first.message;
  return nestedMessageContent(message);
}
function contentArrayText(content) {
  if (!Array.isArray(content))
    return;
  return content.map((block) => block && typeof block === "object" && !Array.isArray(block) ? block.text ?? "" : "").join("");
}
function messagesToPrompt(params, providerId) {
  const parts = [];
  const system = systemToText(params.system, providerId);
  if (system)
    parts.push(system);
  const messages = params.messages ?? [];
  const label = messages.length > 1;
  for (const message of messages) {
    const text = contentToText(message.content, providerId);
    if (!text)
      continue;
    parts.push(label ? `${capitalize(message.role)}: ${text}` : text);
  }
  return parts.join(`

`);
}
function systemToText(system, providerId) {
  if (!system)
    return "";
  if (typeof system === "string")
    return system;
  if (Array.isArray(system)) {
    return system.map((block) => {
      assertNoImageBlock(block, providerId, "the system prompt");
      return isTextBlock(block) ? block.text ?? "" : typeof block === "string" ? block : "";
    }).join(`

`);
  }
  return "";
}
function contentToText(content, providerId) {
  if (typeof content === "string")
    return content;
  if (!Array.isArray(content))
    return "";
  return content.map((block) => {
    if (typeof block === "string")
      return block;
    assertNoImageBlock(block, providerId, "message content");
    if (isTextBlock(block))
      return block.text ?? "";
    if (isToolResultBlock(block))
      return contentToText(block.content, providerId);
    return "";
  }).join(`
`);
}
function isTextBlock(block) {
  return Boolean(block && typeof block === "object" && !Array.isArray(block) && block.type === "text");
}
function isToolResultBlock(block) {
  return Boolean(block && typeof block === "object" && !Array.isArray(block) && block.type === "tool_result");
}
function isImageBlock(block) {
  return Boolean(block && typeof block === "object" && !Array.isArray(block) && block.type === "image");
}
function assertNoImageBlock(block, providerId, context) {
  if (!isImageBlock(block))
    return;
  throw new ProviderCapabilityError(`Subscription CLI provider "${providerId}" does not support image/multimodal input in ${context}. ` + `Switch to a UR-native multimodal API or local provider (OpenAI, Anthropic, Gemini, or an OpenAI-compatible local endpoint) to send images. ` + `Boundary: ${SUBSCRIPTION_CLI_PROVIDER_BOUNDARY}`, { providerId, capability: "multimodal_input", context });
}
function capitalize(value) {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}
function estimateTokens(text) {
  return Math.ceil((text?.length ?? 0) / 4);
}
var CLI_SPECS, defaultRunner = (command, args, options) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    stdio: [getSubscriptionCliStdinMode(options.input, options.stdinMode), "pipe", "pipe"],
    signal: options.signal
  });
  let stdout = "";
  let stderr = "";
  const timer = options.timeoutMs ? setTimeout(() => child.kill("SIGKILL"), options.timeoutMs) : undefined;
  child.stdout?.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr?.on("data", (chunk) => {
    stderr += chunk;
  });
  child.on("error", (error) => {
    if (timer)
      clearTimeout(timer);
    reject(error);
  });
  child.on("close", (code) => {
    if (timer)
      clearTimeout(timer);
    resolve({ code: code ?? 1, stdout, stderr });
  });
  if (options.input !== undefined && child.stdin) {
    child.stdin?.write(options.input);
    child.stdin?.end();
  }
});
var init_urhqSubscription = __esm(() => {
  init_providerRegistry();
  init_providerClient();
  init_streamingAdapters();
  CLI_SPECS = {
    "codex-cli": { args: (model, prompt) => ["exec", "--model", model, prompt], stdinMode: "inherit" },
    "claude-code-cli": {
      args: (model, prompt) => ["-p", prompt, "--model", model, "--output-format", "json"]
    },
    "gemini-cli": { args: (model, prompt) => ["-p", prompt, "-m", model] },
    "antigravity-cli": { args: (model, prompt) => ["-p", prompt, "--model", model] }
  };
});
init_urhqSubscription();

export {
  getSubscriptionCliStdinMode,
  createURHQSubscriptionClient
};
