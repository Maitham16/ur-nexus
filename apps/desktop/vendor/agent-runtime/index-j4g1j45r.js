import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import {
  getOllamaBaseUrl,
  init_ollamaConfig
} from "./index-31dnhhm9.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/model-doctor/model-doctor.ts
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
async function fetchJson(path, options = {}) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled)
        return;
      settled = true;
      resolve(value);
    };
    const url = new URL(path, getOllamaBaseUrl());
    const request = url.protocol === "https:" ? httpsRequest : httpRequest;
    const req = request(url, {
      method: options.method ?? "GET",
      headers: {
        "content-type": "application/json",
        ...options.headers ?? {}
      },
      timeout: 2000
    }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      response.on("end", () => {
        if (!response.statusCode || response.statusCode >= 400) {
          finish(null);
          return;
        }
        try {
          finish(JSON.parse(Buffer.concat(chunks).toString("utf-8")));
        } catch {
          finish(null);
        }
      });
    });
    req.on("timeout", () => {
      req.destroy();
      finish(null);
    });
    req.on("error", () => finish(null));
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}
function findNumber(info, suffix) {
  for (const [key, value] of Object.entries(info)) {
    if (!key.endsWith(suffix))
      continue;
    if (typeof value === "number")
      return value;
  }
  return;
}
function normalizeName(model) {
  return model.name ?? model.model ?? "unknown";
}
function buildOllamaShowRequestBody(name) {
  return JSON.stringify({ model: name });
}
function inferVision(name, capabilities) {
  const lowered = name.toLowerCase();
  return capabilities.includes("vision") || lowered.includes("vision") || lowered.includes("llava") || lowered.includes("moondream") || lowered.includes("minicpm-v");
}
function inferCode(name, family) {
  const lowered = `${name} ${family ?? ""}`.toLowerCase();
  return lowered.includes("code") || lowered.includes("coder") || lowered.includes("deepseek") || lowered.includes("qwen") || lowered.includes("devstral");
}
async function inspectModel(model) {
  const name = normalizeName(model);
  const show = await fetchJson("/api/show", {
    method: "POST",
    body: buildOllamaShowRequestBody(name)
  });
  const info = show?.model_info ?? {};
  const capabilities = show?.capabilities ?? [];
  const family = typeof show?.details?.family === "string" ? show.details.family : typeof info["general.architecture"] === "string" ? info["general.architecture"] : undefined;
  return {
    name,
    size: model.size,
    modifiedAt: model.modified_at,
    advertisedCapabilities: capabilities,
    contextLength: findNumber(info, "context_length"),
    embeddingLength: findNumber(info, "embedding_length"),
    family,
    likelyVision: inferVision(name, capabilities),
    likelyCode: inferCode(name, family)
  };
}
function formatBytes(size) {
  if (!size)
    return "unknown size";
  const gib = size / 1024 / 1024 / 1024;
  return `${gib.toFixed(1)} GiB`;
}
function formatReport(models) {
  if (models.length === 0) {
    return `No Ollama models found at ${getOllamaBaseUrl()}. Start Ollama or pull a model, then run \`ur model-doctor\` again.`;
  }
  const lines = [`Ollama model capability report`, `Endpoint: ${getOllamaBaseUrl()}`, ""];
  for (const model of models) {
    lines.push(model.name);
    lines.push(`  Family: ${model.family ?? "unknown"}`);
    lines.push(`  Size: ${formatBytes(model.size)}`);
    lines.push(`  Context length: ${model.contextLength ?? "unknown"}`);
    lines.push(`  Embedding length: ${model.embeddingLength ?? "unknown"}`);
    lines.push(`  Advertised capabilities: ${model.advertisedCapabilities.length ? model.advertisedCapabilities.join(", ") : "not advertised by Ollama"}`);
    lines.push(`  Likely code-ready: ${model.likelyCode ? "yes" : "unknown"}`);
    lines.push(`  Likely vision-ready: ${model.likelyVision ? "yes" : "no/unknown"}`);
    lines.push("");
  }
  lines.push("Note: Ollama does not consistently advertise tool-use support in /api/tags. Treat tool support as model/provider dependent unless the model documentation says otherwise.");
  return lines.join(`
`);
}
async function listModelCapabilities(requestedModel) {
  const tags = await fetchJson("/api/tags");
  const modelTags = tags?.models ?? [];
  const selected = requestedModel ? modelTags.filter((model) => normalizeName(model) === requestedModel) : modelTags;
  const models = await Promise.all(selected.map(inspectModel));
  return { endpoint: getOllamaBaseUrl(), models };
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const requestedModel = tokens.find((token) => !token.startsWith("--"));
  const { endpoint, models } = await listModelCapabilities(requestedModel);
  return {
    type: "text",
    value: json ? JSON.stringify({ endpoint, models }, null, 2) : formatReport(models)
  };
};
var init_model_doctor = __esm(() => {
  init_argumentSubstitution();
  init_ollamaConfig();
});

export { buildOllamaShowRequestBody, listModelCapabilities, call, init_model_doctor };
