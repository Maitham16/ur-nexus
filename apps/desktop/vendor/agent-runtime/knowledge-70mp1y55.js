import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import {
  getOllamaBaseUrl,
  init_ollamaConfig
} from "./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import"./index-z5aeypvg.js";
import"./index-5jmh1e0k.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import {
  init_json,
  safeParseJSON
} from "./index-wxsgjqjk.js";
import"./index-s1a1wahe.js";
import"./index-wred0kdg.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-7bd814mt.js";
import"./index-m9qhxms7.js";
import"./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/embeddings.ts
function getOllamaEmbedBaseUrl(env = process.env) {
  return getOllamaBaseUrl(env);
}
function cosineSimilarity(a, b) {
  const length = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0;i < length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0)
    return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
function makeOllamaEmbedder(model = DEFAULT_EMBED_MODEL, baseUrl = getOllamaEmbedBaseUrl()) {
  return async (texts) => {
    if (texts.length === 0)
      return [];
    const response = await fetch(`${baseUrl}/api/embed`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model, input: texts })
    });
    if (!response.ok) {
      throw new Error(`Ollama embed failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (!Array.isArray(data.embeddings)) {
      throw new Error("Ollama embed response missing embeddings");
    }
    return data.embeddings;
  };
}
var DEFAULT_EMBED_MODEL = "nomic-embed-text";
var init_embeddings = __esm(() => {
  init_ollamaConfig();
});

// ../../src/services/agents/knowledge.ts
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "node:fs";
import { basename, join, relative, resolve } from "node:path";
function knowledgeDir(cwd) {
  return join(cwd, ".ur", "knowledge");
}
function sourcesPath(cwd) {
  return join(knowledgeDir(cwd), "sources.json");
}
function indexPath(cwd) {
  return join(knowledgeDir(cwd), "index", "index.json");
}
function tokenize(value) {
  return [...new Set(value.toLowerCase().match(/[a-z0-9_]{3,}/g) ?? [])];
}
function loadSources(cwd) {
  const path = sourcesPath(cwd);
  if (!existsSync(path))
    return [];
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  return Array.isArray(parsed) ? parsed : [];
}
function saveSources(cwd, sources) {
  mkdirSync(knowledgeDir(cwd), { recursive: true });
  writeFileSync(sourcesPath(cwd), `${JSON.stringify(sources, null, 2)}
`);
}
function makeSourceId(kind, ref) {
  const slug = ref.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  return `${kind}:${slug || "note"}`;
}
function addSource(cwd, rawRef, options = {}) {
  const ref = rawRef.trim();
  if (!ref)
    throw new Error("Provide a file, directory, or note to add");
  let kind;
  if (options.note) {
    kind = "note";
  } else {
    const abs = resolve(cwd, ref);
    if (!existsSync(abs)) {
      throw new Error(`Path not found: ${ref} (use --note to add inline text)`);
    }
    kind = statSync(abs).isDirectory() ? "dir" : "file";
  }
  const source = {
    id: makeSourceId(kind, ref),
    kind,
    ref,
    label: options.label,
    addedAt: new Date().toISOString()
  };
  const sources = loadSources(cwd);
  const existing = sources.find((item) => item.id === source.id);
  if (existing)
    return { source: existing, alreadyExists: true };
  sources.push(source);
  saveSources(cwd, sources);
  return { source, alreadyExists: false };
}
function removeSource(cwd, idOrRef) {
  const sources = loadSources(cwd);
  const next = sources.filter((item) => item.id !== idOrRef && item.ref !== idOrRef);
  if (next.length === sources.length)
    return false;
  saveSources(cwd, next);
  return true;
}
function collectFiles(cwd, source) {
  if (source.kind === "note")
    return [];
  const abs = resolve(cwd, source.ref);
  if (source.kind === "file")
    return [abs];
  const files = [];
  const walk = (dir) => {
    if (files.length >= MAX_DIR_FILES)
      return;
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.startsWith(".") || entry === "node_modules")
        continue;
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory())
        walk(full);
      else if (TEXT_EXT_RE.test(entry) && !SECRET_FILE_RE.test(full)) {
        files.push(full);
      }
      if (files.length >= MAX_DIR_FILES)
        return;
    }
  };
  walk(abs);
  return files;
}
function chunkFile(cwd, source, absPath) {
  if (SECRET_FILE_RE.test(absPath))
    return [];
  let content;
  try {
    content = readFileSync(absPath, "utf-8");
  } catch {
    return [];
  }
  const ref = relative(cwd, absPath) || absPath;
  const lines = content.split(`
`);
  const chunks = [];
  let buffer = [];
  let startLine = 1;
  const flush = (endLine) => {
    const text = buffer.join(`
`).trim();
    if (text) {
      chunks.push({
        id: `${basename(ref)}:${startLine}`,
        sourceId: source.id,
        ref,
        startLine,
        endLine,
        text: text.length > MAX_CHUNK_CHARS ? `${text.slice(0, MAX_CHUNK_CHARS)}…` : text,
        tokens: tokenize(text),
        addedAt: source.addedAt
      });
    }
    buffer = [];
  };
  for (let i = 0;i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") {
      if (buffer.length > 0)
        flush(i);
      startLine = i + 2;
    } else {
      if (buffer.length === 0)
        startLine = i + 1;
      buffer.push(line);
    }
  }
  if (buffer.length > 0)
    flush(lines.length);
  return chunks.slice(0, 500);
}
function chunkNote(source) {
  const text = source.ref.trim();
  if (!text)
    return [];
  return [
    {
      id: `${source.id}:1`,
      sourceId: source.id,
      ref: "note",
      startLine: 1,
      endLine: 1,
      text: text.length > MAX_CHUNK_CHARS ? `${text.slice(0, MAX_CHUNK_CHARS)}…` : text,
      tokens: tokenize(text),
      addedAt: source.addedAt
    }
  ];
}
async function buildIndex(cwd, options = {}) {
  const sources = loadSources(cwd);
  const chunks = [];
  for (const source of sources) {
    if (source.kind === "note") {
      chunks.push(...chunkNote(source));
      continue;
    }
    for (const file of collectFiles(cwd, source)) {
      chunks.push(...chunkFile(cwd, source, file));
    }
  }
  let mode = "lexical";
  let embedModel;
  if (options.embedder && chunks.length > 0) {
    const vectors = await options.embedder(chunks.map((chunk) => chunk.text));
    if (vectors.length === chunks.length) {
      chunks.forEach((chunk, index2) => {
        chunk.embedding = vectors[index2];
      });
      mode = "embedding";
      embedModel = options.embedModel;
    }
  }
  const index = {
    version: 1,
    mode,
    builtAt: new Date().toISOString(),
    embedModel,
    chunks
  };
  mkdirSync(join(knowledgeDir(cwd), "index"), { recursive: true });
  writeFileSync(indexPath(cwd), `${JSON.stringify(index, null, 2)}
`);
  return index;
}
function loadIndex(cwd) {
  const path = indexPath(cwd);
  if (!existsSync(path))
    return null;
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  return parsed && typeof parsed === "object" ? parsed : null;
}
async function searchKnowledge(cwd, query, options = {}) {
  const index = loadIndex(cwd) ?? await buildIndex(cwd);
  const limit = options.limit ?? 8;
  if (index.mode === "embedding" && options.embedder) {
    try {
      const [queryVector] = await options.embedder([query]);
      if (queryVector) {
        return index.chunks.filter((chunk) => Array.isArray(chunk.embedding)).map((chunk) => ({
          ...chunk,
          score: cosineSimilarity(queryVector, chunk.embedding)
        })).filter((chunk) => chunk.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
      }
    } catch {}
  }
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0)
    return [];
  return index.chunks.map((chunk) => {
    const tokenSet = new Set(chunk.tokens);
    const score = queryTokens.filter((token) => tokenSet.has(token)).length;
    return { ...chunk, score };
  }).filter((chunk) => chunk.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}
function pruneKnowledge(cwd, options) {
  const cutoff = Date.now() - options.olderThanDays * 24 * 60 * 60 * 1000;
  const sources = loadSources(cwd);
  const kept = sources.filter((item) => Date.parse(item.addedAt) >= cutoff);
  const removedSources = sources.length - kept.length;
  saveSources(cwd, kept);
  const index = loadIndex(cwd);
  let removedChunks = 0;
  if (index) {
    const keptIds = new Set(kept.map((item) => item.id));
    const before = index.chunks.length;
    index.chunks = index.chunks.filter((chunk) => keptIds.has(chunk.sourceId));
    removedChunks = before - index.chunks.length;
    index.builtAt = new Date().toISOString();
    mkdirSync(join(knowledgeDir(cwd), "index"), { recursive: true });
    writeFileSync(indexPath(cwd), `${JSON.stringify(index, null, 2)}
`);
  }
  return { removedSources, removedChunks };
}
function knowledgeStatus(cwd) {
  const sources = loadSources(cwd);
  const index = loadIndex(cwd);
  return {
    sources: sources.length,
    chunks: index?.chunks.length ?? 0,
    mode: index?.mode ?? null,
    embedModel: index?.embedModel ?? null,
    builtAt: index?.builtAt ?? null,
    indexPath: indexPath(cwd)
  };
}
function formatSources(sources, json) {
  if (json)
    return JSON.stringify({ sources }, null, 2);
  if (sources.length === 0) {
    return "No knowledge sources yet. Add one: ur knowledge add <file|dir>";
  }
  const lines = ["Knowledge sources", ""];
  for (const source of sources) {
    const label = source.label ? `  "${source.label}"` : "";
    const ref = source.kind === "note" ? `${source.ref.slice(0, 60)}…` : source.ref;
    lines.push(`${source.id}${label}`);
    lines.push(`  ${source.kind}: ${ref}   (added ${source.addedAt})`);
  }
  return lines.join(`
`);
}
function formatSearchResults(results, json) {
  if (json)
    return JSON.stringify({ results }, null, 2);
  if (results.length === 0)
    return "No knowledge matches.";
  return results.map((result) => `${result.ref}:${result.startLine}-${result.endLine}  (score ${result.score})
${result.text}`).join(`

`);
}
var TEXT_EXT_RE, SECRET_FILE_RE, MAX_DIR_FILES = 200, MAX_CHUNK_CHARS = 1600;
var init_knowledge = __esm(() => {
  init_json();
  init_embeddings();
  TEXT_EXT_RE = /\.(md|mdx|markdown|txt|rst|adoc)$/i;
  SECRET_FILE_RE = /(^|\/)\.env(\.|$)|secrets?\.|\.pem$|\.key$/i;
});

// ../../src/commands/knowledge/knowledge.ts
function optionValue(tokens, flag) {
  const index = tokens.indexOf(flag);
  return index >= 0 ? tokens[index + 1] : undefined;
}
var call = async (args) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const note = tokens.includes("--note");
  const label = optionValue(tokens, "--label");
  const olderThan = optionValue(tokens, "--older-than");
  const flagsWithValues = new Set(["--label", "--older-than", "--embed-model"]);
  const positional = [];
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (token.startsWith("--")) {
      if (flagsWithValues.has(token))
        i++;
      continue;
    }
    positional.push(token);
  }
  const command = positional[0] ?? "status";
  if (command === "add") {
    const ref = note ? positional.slice(1).join(" ") : positional[1];
    if (!ref) {
      return { type: "text", value: 'Usage: ur knowledge add <file|dir> [--label <l>]  |  ur knowledge add --note "<text>"' };
    }
    try {
      const result = addSource(cwd, ref, { label, note });
      if (json)
        return { type: "text", value: JSON.stringify(result, null, 2) };
      return {
        type: "text",
        value: result.alreadyExists ? `Source already registered: ${result.source.id}` : `Added ${result.source.kind} source ${result.source.id}. Run: ur knowledge build`
      };
    } catch (error) {
      return { type: "text", value: error instanceof Error ? error.message : String(error) };
    }
  }
  if (command === "remove") {
    const ref = positional[1];
    if (!ref)
      return { type: "text", value: "Usage: ur knowledge remove <id|ref>" };
    const removed = removeSource(cwd, ref);
    return {
      type: "text",
      value: removed ? `Removed source ${ref}. Run: ur knowledge build` : `No source matched ${ref}.`
    };
  }
  if (command === "list") {
    return { type: "text", value: formatSources(loadSources(cwd), json) };
  }
  if (command === "build") {
    const useEmbeddings = tokens.includes("--embeddings");
    const embedModel = optionValue(tokens, "--embed-model") ?? DEFAULT_EMBED_MODEL;
    const embedder = useEmbeddings ? makeOllamaEmbedder(embedModel) : undefined;
    let index;
    try {
      index = await buildIndex(cwd, embedder ? { embedder, embedModel } : {});
    } catch (error) {
      return {
        type: "text",
        value: `Embedding build failed (${error instanceof Error ? error.message : String(error)}). Run "ur knowledge build" for a lexical index.`
      };
    }
    if (json) {
      return {
        type: "text",
        value: JSON.stringify({ builtAt: index.builtAt, mode: index.mode, chunks: index.chunks.length }, null, 2)
      };
    }
    return {
      type: "text",
      value: `Built ${index.mode} knowledge index: ${index.chunks.length} chunks from ${loadSources(cwd).length} sources.`
    };
  }
  if (command === "search") {
    const query = positional.slice(1).join(" ");
    if (!query)
      return { type: "text", value: "Usage: ur knowledge search <query>" };
    const existing = loadIndex(cwd);
    const wantEmbeddings = tokens.includes("--embeddings") || existing?.mode === "embedding";
    const embedder = wantEmbeddings ? makeOllamaEmbedder(existing?.embedModel ?? optionValue(tokens, "--embed-model") ?? DEFAULT_EMBED_MODEL) : undefined;
    const results = await searchKnowledge(cwd, query, embedder ? { embedder } : {});
    return { type: "text", value: formatSearchResults(results, json) };
  }
  if (command === "prune") {
    const days = Number(olderThan ?? "30");
    if (!Number.isFinite(days) || days <= 0) {
      return { type: "text", value: "Usage: ur knowledge prune --older-than <days>" };
    }
    const result = pruneKnowledge(cwd, { olderThanDays: days });
    if (json)
      return { type: "text", value: JSON.stringify(result, null, 2) };
    return {
      type: "text",
      value: `Pruned ${result.removedSources} sources and ${result.removedChunks} chunks older than ${days} days.`
    };
  }
  if (command === "status") {
    const status = knowledgeStatus(cwd);
    return { type: "text", value: JSON.stringify(status, null, 2) };
  }
  return {
    type: "text",
    value: "Usage: ur knowledge add|remove|build|search|list|prune|status [...] [--json]"
  };
};
var init_knowledge2 = __esm(() => {
  init_embeddings();
  init_knowledge();
  init_argumentSubstitution();
  init_cwd();
});
init_knowledge2();

export {
  call
};
