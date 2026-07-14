import {
  countCharInString,
  findExecutable,
  getOllamaBaseUrl,
  getPlatform,
  init_bundledMode,
  init_findExecutable,
  init_ollamaConfig,
  init_platform,
  init_stringUtils,
  isInBundledMode
} from "./index-31dnhhm9.js";
import {
  init_analytics,
  logEvent
} from "./index-5jmh1e0k.js";
import {
  init_json,
  safeParseJSON
} from "./index-wxsgjqjk.js";
import {
  execFileNoThrow,
  init_execFileNoThrow
} from "./index-wred0kdg.js";
import {
  init_log,
  logError
} from "./index-4bphgmcc.js";
import {
  init_debug,
  init_envUtils,
  isEnvDefinedFalsy,
  logForDebugging
} from "./index-5h7w9qkc.js";
import {
  init_memoize,
  memoize_default
} from "./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/utils/ripgrep.ts
import { execFile, spawn } from "child_process";
import { existsSync } from "fs";
import { homedir } from "os";
import * as path from "path";
import { fileURLToPath } from "url";
function ripgrepCommand() {
  const config = getRipgrepConfig();
  return {
    rgPath: config.command,
    rgArgs: config.args,
    argv0: config.argv0
  };
}
function isEagainError(stderr) {
  return stderr.includes("os error 11") || stderr.includes("Resource temporarily unavailable");
}
function ripGrepRaw(args, target, abortSignal, callback, singleThread = false) {
  const { rgPath, rgArgs, argv0 } = ripgrepCommand();
  const threadArgs = singleThread ? ["-j", "1"] : [];
  const fullArgs = [...rgArgs, ...threadArgs, ...args, target];
  const defaultTimeout = getPlatform() === "wsl" ? 60000 : 20000;
  const parsedSeconds = parseInt(process.env.UR_CODE_GLOB_TIMEOUT_SECONDS || "", 10) || 0;
  const timeout = parsedSeconds > 0 ? parsedSeconds * 1000 : defaultTimeout;
  if (argv0) {
    const child = spawn(rgPath, fullArgs, {
      argv0,
      signal: abortSignal,
      windowsHide: true
    });
    let stdout = "";
    let stderr = "";
    let stdoutTruncated = false;
    let stderrTruncated = false;
    child.stdout?.on("data", (data) => {
      if (!stdoutTruncated) {
        stdout += data.toString();
        if (stdout.length > MAX_BUFFER_SIZE) {
          stdout = stdout.slice(0, MAX_BUFFER_SIZE);
          stdoutTruncated = true;
        }
      }
    });
    child.stderr?.on("data", (data) => {
      if (!stderrTruncated) {
        stderr += data.toString();
        if (stderr.length > MAX_BUFFER_SIZE) {
          stderr = stderr.slice(0, MAX_BUFFER_SIZE);
          stderrTruncated = true;
        }
      }
    });
    let killTimeoutId;
    const timeoutId = setTimeout(() => {
      if (process.platform === "win32") {
        child.kill();
      } else {
        child.kill("SIGTERM");
        killTimeoutId = setTimeout((c) => c.kill("SIGKILL"), 5000, child);
      }
    }, timeout);
    let settled = false;
    child.on("close", (code, signal) => {
      if (settled)
        return;
      settled = true;
      clearTimeout(timeoutId);
      clearTimeout(killTimeoutId);
      if (code === 0 || code === 1) {
        callback(null, stdout, stderr);
      } else {
        const error = new Error(`ripgrep exited with code ${code}`);
        error.code = code ?? undefined;
        error.signal = signal ?? undefined;
        callback(error, stdout, stderr);
      }
    });
    child.on("error", (err) => {
      if (settled)
        return;
      settled = true;
      clearTimeout(timeoutId);
      clearTimeout(killTimeoutId);
      const error = err;
      callback(error, stdout, stderr);
    });
    return child;
  }
  return execFile(rgPath, fullArgs, {
    maxBuffer: MAX_BUFFER_SIZE,
    signal: abortSignal,
    timeout,
    killSignal: process.platform === "win32" ? undefined : "SIGKILL"
  }, callback);
}
async function ripGrepFileCount(args, target, abortSignal) {
  await codesignRipgrepIfNecessary();
  const { rgPath, rgArgs, argv0 } = ripgrepCommand();
  return new Promise((resolve2, reject) => {
    const child = spawn(rgPath, [...rgArgs, ...args, target], {
      argv0,
      signal: abortSignal,
      windowsHide: true,
      stdio: ["ignore", "pipe", "ignore"]
    });
    let lines = 0;
    child.stdout?.on("data", (chunk) => {
      lines += countCharInString(chunk, `
`);
    });
    let settled = false;
    child.on("close", (code) => {
      if (settled)
        return;
      settled = true;
      if (code === 0 || code === 1)
        resolve2(lines);
      else
        reject(new Error(`rg --files exited ${code}`));
    });
    child.on("error", (err) => {
      if (settled)
        return;
      settled = true;
      reject(err);
    });
  });
}
async function ripGrep(args, target, abortSignal) {
  await codesignRipgrepIfNecessary();
  testRipgrepOnFirstUse().catch((error) => {
    logError(error);
  });
  return new Promise((resolve2, reject) => {
    const handleResult = (error, stdout, stderr, isRetry) => {
      if (!error) {
        resolve2(stdout.trim().split(`
`).map((line) => line.replace(/\r$/, "")).filter(Boolean));
        return;
      }
      if (error.code === 1) {
        resolve2([]);
        return;
      }
      const CRITICAL_ERROR_CODES = ["ENOENT", "EACCES", "EPERM"];
      if (CRITICAL_ERROR_CODES.includes(error.code)) {
        reject(error);
        return;
      }
      if (!isRetry && isEagainError(stderr)) {
        logForDebugging(`rg EAGAIN error detected, retrying with single-threaded mode (-j 1)`);
        logEvent("tengu_ripgrep_eagain_retry", {});
        ripGrepRaw(args, target, abortSignal, (retryError, retryStdout, retryStderr) => {
          handleResult(retryError, retryStdout, retryStderr, true);
        }, true);
        return;
      }
      const hasOutput = stdout && stdout.trim().length > 0;
      const isTimeout = error.signal === "SIGTERM" || error.signal === "SIGKILL" || error.code === "ABORT_ERR";
      const isBufferOverflow = error.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER";
      let lines = [];
      if (hasOutput) {
        lines = stdout.trim().split(`
`).map((line) => line.replace(/\r$/, "")).filter(Boolean);
        if (lines.length > 0 && (isTimeout || isBufferOverflow)) {
          lines = lines.slice(0, -1);
        }
      }
      logForDebugging(`rg error (signal=${error.signal}, code=${error.code}, stderr: ${stderr}), ${lines.length} results`);
      if (error.code !== 2 && error.code !== "ABORT_ERR") {
        logError(error);
      }
      if (isTimeout && lines.length === 0) {
        reject(new RipgrepTimeoutError(`Ripgrep search timed out after ${getPlatform() === "wsl" ? 60 : 20} seconds. The search may have matched files but did not complete in time. Try searching a more specific path or pattern.`, lines));
        return;
      }
      resolve2(lines);
    };
    ripGrepRaw(args, target, abortSignal, (error, stdout, stderr) => {
      handleResult(error, stdout, stderr, false);
    });
  });
}
function getRipgrepStatus() {
  const config = getRipgrepConfig();
  return {
    mode: config.mode,
    path: config.command,
    working: ripgrepStatus?.working ?? null
  };
}
async function codesignRipgrepIfNecessary() {
  if (process.platform !== "darwin" || alreadyDoneSignCheck) {
    return;
  }
  alreadyDoneSignCheck = true;
  const config = getRipgrepConfig();
  if (config.mode !== "builtin") {
    return;
  }
  const builtinPath = config.command;
  const lines = (await execFileNoThrow("codesign", ["-vv", "-d", builtinPath], {
    preserveOutputOnError: false
  })).stdout.split(`
`);
  const needsSigned = lines.find((line) => line.includes("linker-signed"));
  if (!needsSigned) {
    return;
  }
  try {
    const signResult = await execFileNoThrow("codesign", [
      "--sign",
      "-",
      "--force",
      "--preserve-metadata=entitlements,requirements,flags,runtime",
      builtinPath
    ]);
    if (signResult.code !== 0) {
      logError(new Error(`Failed to sign ripgrep: ${signResult.stdout} ${signResult.stderr}`));
    }
    const quarantineResult = await execFileNoThrow("xattr", [
      "-d",
      "com.apple.quarantine",
      builtinPath
    ]);
    if (quarantineResult.code !== 0) {
      logError(new Error(`Failed to remove quarantine: ${quarantineResult.stdout} ${quarantineResult.stderr}`));
    }
  } catch (e) {
    logError(e);
  }
}
var __filename2, __dirname2, getRipgrepConfig, MAX_BUFFER_SIZE = 20000000, RipgrepTimeoutError, countFilesRoundedRg, ripgrepStatus = null, testRipgrepOnFirstUse, alreadyDoneSignCheck = false;
var init_ripgrep = __esm(() => {
  init_memoize();
  init_analytics();
  init_bundledMode();
  init_debug();
  init_envUtils();
  init_execFileNoThrow();
  init_findExecutable();
  init_log();
  init_platform();
  init_stringUtils();
  __filename2 = fileURLToPath(import.meta.url);
  __dirname2 = path.join(__filename2, "../");
  getRipgrepConfig = memoize_default(() => {
    const userWantsSystemRipgrep = isEnvDefinedFalsy(process.env.USE_BUILTIN_RIPGREP);
    if (userWantsSystemRipgrep) {
      const { cmd: systemPath } = findExecutable("rg", []);
      if (systemPath !== "rg") {
        return { mode: "system", command: "rg", args: [] };
      }
    }
    if (isInBundledMode()) {
      return {
        mode: "embedded",
        command: process.execPath,
        args: ["--no-config"],
        argv0: "rg"
      };
    }
    const rgRoot = path.resolve(__dirname2, "vendor", "ripgrep");
    const command = process.platform === "win32" ? path.resolve(rgRoot, `${process.arch}-win32`, "rg.exe") : path.resolve(rgRoot, `${process.arch}-${process.platform}`, "rg");
    if (!existsSync(command)) {
      logForDebugging(`[ripgrep] Builtin ripgrep not found at ${command}; falling back to system rg`);
      return { mode: "system", command: "rg", args: [] };
    }
    return { mode: "builtin", command, args: [] };
  });
  RipgrepTimeoutError = class RipgrepTimeoutError extends Error {
    partialResults;
    constructor(message, partialResults) {
      super(message);
      this.partialResults = partialResults;
      this.name = "RipgrepTimeoutError";
    }
  };
  countFilesRoundedRg = memoize_default(async (dirPath, abortSignal, ignorePatterns = []) => {
    if (path.resolve(dirPath) === path.resolve(homedir())) {
      return;
    }
    try {
      const args = ["--files", "--hidden"];
      ignorePatterns.forEach((pattern) => {
        args.push("--glob", `!${pattern}`);
      });
      const count = await ripGrepFileCount(args, dirPath, abortSignal);
      if (count === 0)
        return 0;
      const magnitude = Math.floor(Math.log10(count));
      const power = Math.pow(10, magnitude);
      return Math.round(count / power) * power;
    } catch (error) {
      if (error?.name !== "AbortError")
        logError(error);
    }
  }, (dirPath, _abortSignal, ignorePatterns = []) => `${dirPath}|${ignorePatterns.join(",")}`);
  testRipgrepOnFirstUse = memoize_default(async () => {
    if (ripgrepStatus !== null) {
      return;
    }
    const config = getRipgrepConfig();
    try {
      let test;
      if (config.argv0) {
        const proc = Bun.spawn([config.command, "--version"], {
          argv0: config.argv0,
          stderr: "ignore",
          stdout: "pipe"
        });
        const [stdout, code] = await Promise.all([
          proc.stdout.text(),
          proc.exited
        ]);
        test = {
          code,
          stdout
        };
      } else {
        test = await execFileNoThrow(config.command, [...config.args, "--version"], {
          timeout: 5000
        });
      }
      const working = test.code === 0 && !!test.stdout && test.stdout.startsWith("ripgrep ");
      ripgrepStatus = {
        working,
        lastTested: Date.now(),
        config
      };
      logForDebugging(`Ripgrep first use test: ${working ? "PASSED" : "FAILED"} (mode=${config.mode}, path=${config.command})`);
      logEvent("tengu_ripgrep_availability", {
        working: working ? 1 : 0,
        using_system: config.mode === "system" ? 1 : 0
      });
    } catch (error) {
      ripgrepStatus = {
        working: false,
        lastTested: Date.now(),
        config
      };
      logError(error);
    }
  });
});

// ../../src/utils/codeIndex/embeddings.ts
function getEmbeddingModel(env = process.env) {
  return (env.UR_CODE_INDEX_EMBED_MODEL || "").trim() || DEFAULT_EMBED_MODEL;
}
async function embedTexts(texts, options) {
  if (texts.length === 0) {
    return [];
  }
  let response;
  try {
    response = await fetch(`${getOllamaBaseUrl()}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: options.model, input: texts }),
      signal: options.signal
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not reach the Ollama app at ${getOllamaBaseUrl()} for embeddings: ${message}`);
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Ollama embedding request failed (${response.status}): ${body || response.statusText}. ` + `Make sure the embedding model "${options.model}" is pulled (e.g. \`ollama pull ${options.model}\`).`);
  }
  const json = await response.json();
  if (json.error) {
    throw new Error(`Ollama embedding error: ${json.error}`);
  }
  if (!Array.isArray(json.embeddings) || json.embeddings.length !== texts.length) {
    throw new Error(`Ollama returned ${json.embeddings?.length ?? 0} embeddings for ${texts.length} inputs`);
  }
  return json.embeddings;
}
async function embedQuery(query, options) {
  const [vector] = await embedTexts([query], options);
  if (!vector) {
    throw new Error("Ollama returned no embedding for the query");
  }
  return vector;
}
var DEFAULT_EMBED_MODEL = "nomic-embed-text";
var init_embeddings = __esm(() => {
  init_ollamaConfig();
});

// ../../src/utils/codeIndex/store.ts
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join as join2 } from "node:path";
function codeIndexDir(root) {
  return join2(root, ".ur", "code-index");
}
function indexPath(root) {
  return join2(codeIndexDir(root), "index.json");
}
function sha1(content) {
  return createHash("sha1").update(content).digest("hex");
}
function cosineSimilarity(a, b) {
  if (a.length === 0 || a.length !== b.length) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0;i < a.length; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
async function loadIndex(root) {
  let raw;
  try {
    raw = await readFile(indexPath(root), { encoding: "utf-8" });
  } catch {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1 || !parsed.chunks || !parsed.files) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
async function saveIndex(root, index) {
  const path2 = indexPath(root);
  await mkdir(dirname(path2), { recursive: true });
  await writeFile(path2, JSON.stringify(index), { encoding: "utf-8" });
}
var init_store = () => {};

// ../../src/utils/codeIndex/chunker.ts
function chunkText(content, options = {}) {
  const maxLines = Math.max(1, options.maxLines ?? DEFAULT_MAX_LINES);
  const overlap = Math.min(Math.max(0, options.overlap ?? DEFAULT_OVERLAP), maxLines - 1);
  const maxChunks = Math.max(1, options.maxChunks ?? DEFAULT_MAX_CHUNKS);
  const step = maxLines - overlap;
  if (!content.trim()) {
    return [];
  }
  const lines = content.split(`
`);
  const chunks = [];
  for (let start = 0;start < lines.length; start += step) {
    const end = Math.min(start + maxLines, lines.length);
    const slice = lines.slice(start, end);
    const text = slice.join(`
`);
    if (text.trim()) {
      chunks.push({ startLine: start + 1, endLine: end, text });
      if (chunks.length >= maxChunks) {
        break;
      }
    }
    if (end >= lines.length) {
      break;
    }
  }
  return chunks;
}
var DEFAULT_MAX_LINES = 60, DEFAULT_OVERLAP = 10, DEFAULT_MAX_CHUNKS = 200;
var init_chunker = () => {};

// ../../src/utils/codeIndex/indexer.ts
import { readdir, readFile as readFile2, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve as resolve2, sep } from "node:path";
function toPosix(p) {
  return sep === "\\" ? p.replaceAll("\\", "/") : p;
}
function hasIndexableExtension(file) {
  const dot = file.lastIndexOf(".");
  if (dot < 0)
    return false;
  return INDEXABLE_EXTENSIONS.has(file.slice(dot).toLowerCase());
}
function isSkipped(relPath) {
  const segments = relPath.split("/");
  if (segments.some((seg) => SKIP_SEGMENTS.includes(seg)))
    return true;
  if (relPath.endsWith(".min.js") || relPath.endsWith(".min.css"))
    return true;
  if (relPath.endsWith(".lock") || relPath.endsWith("lock.json"))
    return true;
  return false;
}
async function walkIndexableFiles(root) {
  const out = [];
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".") && entry.name !== ".github")
        continue;
      const abs = resolve2(dir, entry.name);
      const rel = toPosix(relative(root, abs));
      if (isSkipped(rel))
        continue;
      if (entry.isDirectory()) {
        await walk(abs);
      } else if (entry.isFile() && hasIndexableExtension(rel)) {
        out.push(rel);
      }
    }
  }
  await walk(root);
  return out.sort();
}
async function listIndexableFiles(root, signal) {
  let absFiles;
  try {
    absFiles = await ripGrep(["--files", "--hidden"], root, signal);
  } catch {
    absFiles = await walkIndexableFiles(root);
  }
  const result = [];
  for (const abs of absFiles) {
    const rel = toPosix(isAbsolute(abs) ? relative(root, abs) : abs);
    if (!rel || rel.startsWith(".."))
      continue;
    if (isSkipped(rel))
      continue;
    if (!hasIndexableExtension(rel))
      continue;
    result.push(rel);
  }
  return result.sort();
}
async function buildOrUpdateIndex(options) {
  const root = resolve2(options.root);
  const model = options.model ?? getEmbeddingModel();
  const maxFiles = options.maxFiles ?? DEFAULT_MAX_FILES;
  const existing = await loadIndex(root);
  const reusable = existing && existing.model === model ? existing : null;
  const files = (await listIndexableFiles(root, options.signal)).slice(0, maxFiles);
  const nextFiles = {};
  const nextChunks = {};
  const toEmbed = [];
  let filesIndexed = 0;
  let filesSkipped = 0;
  let dim = reusable?.dim ?? 0;
  for (const rel of files) {
    if (options.signal.aborted)
      throw new Error("aborted");
    const abs = resolve2(root, rel);
    let content;
    try {
      const info = await stat(abs);
      if (!info.isFile() || info.size > MAX_FILE_BYTES) {
        filesSkipped++;
        continue;
      }
      content = await readFile2(abs, { encoding: "utf-8" });
    } catch {
      filesSkipped++;
      continue;
    }
    const hash = sha1(content);
    const prior = reusable?.files[rel];
    if (prior && prior.hash === hash) {
      const reusedChunks = prior.chunkIds.map((id) => reusable?.chunks[id]).filter((c) => Boolean(c));
      if (reusedChunks.length === prior.chunkIds.length) {
        nextFiles[rel] = { hash, chunkIds: prior.chunkIds };
        for (const chunk of reusedChunks)
          nextChunks[chunk.id] = chunk;
        filesIndexed++;
        continue;
      }
    }
    const rawChunks = chunkText(content);
    const chunkIds = [];
    for (const raw of rawChunks) {
      const id = `${rel}#${raw.startLine}-${raw.endLine}`;
      chunkIds.push(id);
      toEmbed.push({
        id,
        chunk: {
          id,
          file: rel,
          startLine: raw.startLine,
          endLine: raw.endLine,
          text: raw.text
        }
      });
    }
    nextFiles[rel] = { hash, chunkIds };
    filesIndexed++;
  }
  let embedded = 0;
  for (let i = 0;i < toEmbed.length; i += EMBED_BATCH_SIZE) {
    if (options.signal.aborted)
      throw new Error("aborted");
    const batch = toEmbed.slice(i, i + EMBED_BATCH_SIZE);
    const vectors = await embedTexts(batch.map((b) => b.chunk.text), { model, signal: options.signal });
    for (let j = 0;j < batch.length; j++) {
      const entry = batch[j];
      const vector = vectors[j] ?? [];
      if (dim === 0 && vector.length > 0)
        dim = vector.length;
      nextChunks[entry.id] = { ...entry.chunk, vector };
    }
    embedded += batch.length;
    options.onProgress?.(embedded, toEmbed.length);
  }
  const filesRemoved = reusable ? Object.keys(reusable.files).filter((f) => !nextFiles[f]).length : 0;
  const index = {
    version: 1,
    model,
    dim,
    root,
    builtAt: new Date().toISOString(),
    files: nextFiles,
    chunks: nextChunks
  };
  await saveIndex(root, index);
  return {
    index,
    stats: {
      filesIndexed,
      filesSkipped,
      filesRemoved,
      chunksTotal: Object.keys(nextChunks).length,
      chunksEmbedded: embedded,
      reused: Boolean(reusable),
      model,
      dim
    }
  };
}
async function searchCode(options) {
  const root = resolve2(options.root);
  const index = await loadIndex(root);
  if (!index) {
    return { hits: [], index: null };
  }
  const model = options.model ?? index.model;
  const queryVector = await embedQuery(options.query, {
    model,
    signal: options.signal
  });
  const k = Math.max(1, options.k ?? 10);
  const scored = [];
  for (const chunk of Object.values(index.chunks)) {
    const score = cosineSimilarity(queryVector, chunk.vector);
    scored.push({
      file: chunk.file,
      startLine: chunk.startLine,
      endLine: chunk.endLine,
      score,
      preview: previewOf(chunk.text)
    });
  }
  scored.sort((a, b) => b.score - a.score);
  return { hits: scored.slice(0, k), index };
}
function previewOf(text, maxLines = 8) {
  const lines = text.split(`
`).slice(0, maxLines);
  return lines.join(`
`);
}
var INDEXABLE_EXTENSIONS, MAX_FILE_BYTES = 200000, DEFAULT_MAX_FILES = 5000, EMBED_BATCH_SIZE = 32, SKIP_SEGMENTS;
var init_indexer = __esm(() => {
  init_ripgrep();
  init_chunker();
  init_embeddings();
  init_store();
  INDEXABLE_EXTENSIONS = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".mts",
    ".cts",
    ".py",
    ".pyi",
    ".rb",
    ".go",
    ".rs",
    ".java",
    ".kt",
    ".kts",
    ".scala",
    ".c",
    ".cc",
    ".cpp",
    ".cxx",
    ".h",
    ".hpp",
    ".hxx",
    ".cs",
    ".swift",
    ".php",
    ".lua",
    ".dart",
    ".ex",
    ".exs",
    ".erl",
    ".clj",
    ".hs",
    ".ml",
    ".sh",
    ".bash",
    ".zsh",
    ".sql",
    ".graphql",
    ".gql",
    ".proto",
    ".vue",
    ".svelte",
    ".astro",
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".md",
    ".mdx",
    ".rst",
    ".adoc",
    ".txt",
    ".json",
    ".yaml",
    ".yml",
    ".toml"
  ]);
  SKIP_SEGMENTS = ["node_modules", ".git", "dist", "build", ".ur"];
});

// ../../src/utils/codeIndex/graph.ts
import { existsSync as existsSync2, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { posix, resolve as resolve3 } from "node:path";
import { join as join3 } from "node:path";
function matchAll(text, regexes) {
  const out = [];
  for (const re of regexes) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[1])
        out.push(m[1]);
    }
  }
  return out;
}
function extractImports(content) {
  return [...new Set(matchAll(content, IMPORT_RES))];
}
function extractSymbols(content) {
  return [...new Set(matchAll(content, SYMBOL_RES))];
}
function candidates(targetNoExt) {
  const list = [];
  for (const ext of SRC_EXT)
    list.push(`${targetNoExt}${ext}`);
  for (const ext of SRC_EXT)
    list.push(posix.join(targetNoExt, `index${ext}`));
  return list;
}
function resolveImport(fromFile, spec, fileSet) {
  let rel = null;
  if (spec.startsWith(".") && /[\\/]/.test(spec)) {
    rel = posix.normalize(posix.join(posix.dirname(fromFile), spec));
  } else if (spec.startsWith(".")) {
    const dots = spec.match(/^\.+/)?.[0].length ?? 1;
    const rest = spec.slice(dots).replace(/\./g, "/");
    let base = posix.dirname(fromFile);
    for (let i = 1;i < dots; i++)
      base = posix.dirname(base);
    rel = posix.normalize(posix.join(base, rest));
  } else {
    return null;
  }
  if (fileSet.has(rel))
    return rel;
  const noExt = rel.replace(/\.(?:m|c)?[jt]sx?$/, "").replace(/\.py$/, "");
  for (const candidate of candidates(noExt)) {
    if (fileSet.has(candidate))
      return candidate;
  }
  return null;
}
function buildGraphFromFiles(sources) {
  const files = sources.map((s) => s.path).sort();
  const fileSet = new Set(files);
  const imports = {};
  const importedBy = {};
  const symbols = {};
  for (const file of files)
    importedBy[file] = [];
  for (const source of sources) {
    const resolved = new Set;
    for (const spec of extractImports(source.content)) {
      const target = resolveImport(source.path, spec, fileSet);
      if (target && target !== source.path)
        resolved.add(target);
    }
    imports[source.path] = [...resolved].sort();
    for (const target of resolved) {
      (importedBy[target] ??= []).push(source.path);
    }
    for (const symbol of extractSymbols(source.content)) {
      (symbols[symbol] ??= []).push(source.path);
    }
  }
  for (const file of files)
    importedBy[file] = [...new Set(importedBy[file])].sort();
  for (const symbol of Object.keys(symbols)) {
    symbols[symbol] = [...new Set(symbols[symbol])].sort();
  }
  return {
    version: 1,
    builtAt: new Date().toISOString(),
    files,
    imports,
    importedBy,
    symbols
  };
}
function transitive(start, edges, maxDepth = Number.POSITIVE_INFINITY) {
  const seen = new Set;
  let frontier = [start];
  let depth = 0;
  while (frontier.length > 0 && depth < maxDepth) {
    const next = [];
    for (const node of frontier) {
      for (const neighbor of edges[node] ?? []) {
        if (neighbor !== start && !seen.has(neighbor)) {
          seen.add(neighbor);
          next.push(neighbor);
        }
      }
    }
    frontier = next;
    depth += 1;
  }
  return [...seen].sort();
}
function impactOf(graph, file, maxDepth) {
  return transitive(file, graph.importedBy, maxDepth);
}
function dependenciesOf(graph, file, maxDepth) {
  return transitive(file, graph.imports, maxDepth);
}
function whereDefined(graph, symbol) {
  return graph.symbols[symbol] ?? [];
}
function graphSearch(graph, query, limit = 15) {
  const tokens = query.toLowerCase().split(/[^a-z0-9_$]+/).filter((t) => t.length >= 3);
  if (tokens.length === 0)
    return [];
  const scored = new Map;
  const bump = (file, reason, weight) => {
    const existing = scored.get(file);
    if (existing)
      existing.degree += weight;
    else
      scored.set(file, { file, reason, degree: weight });
  };
  for (const [symbol, files] of Object.entries(graph.symbols)) {
    const lower = symbol.toLowerCase();
    if (!tokens.some((t) => lower.includes(t)))
      continue;
    for (const file of files) {
      bump(file, `defines ${symbol}`, 5);
      for (const neighbor of graph.imports[file] ?? [])
        bump(neighbor, `imported by match`, 1);
      for (const neighbor of graph.importedBy[file] ?? [])
        bump(neighbor, `imports match`, 1);
    }
  }
  return [...scored.values()].sort((a, b) => b.degree - a.degree).slice(0, limit);
}
function graphPath(root) {
  return join3(root, ".ur", "code-index", "graph.json");
}
async function buildCodeGraph(options) {
  const signal = options.signal ?? new AbortController().signal;
  const read = options.readFile ?? ((abs) => readFileSync(abs, "utf-8"));
  const rels = (await listIndexableFiles(options.root, signal)).slice(0, options.maxFiles ?? 5000);
  const sources = [];
  for (const rel of rels) {
    try {
      sources.push({ path: rel, content: read(resolve3(options.root, rel)) });
    } catch {}
  }
  const graph = buildGraphFromFiles(sources);
  mkdirSync(join3(options.root, ".ur", "code-index"), { recursive: true });
  writeFileSync(graphPath(options.root), `${JSON.stringify(graph, null, 2)}
`);
  return graph;
}
function loadGraph(root) {
  const path2 = graphPath(root);
  if (!existsSync2(path2))
    return null;
  const parsed = safeParseJSON(readFileSync(path2, "utf-8"), false);
  return parsed && typeof parsed === "object" ? parsed : null;
}
function formatGraphStats(graph) {
  const edges = Object.values(graph.imports).reduce((sum, list) => sum + list.length, 0);
  const symbols = Object.keys(graph.symbols).length;
  return [
    `Code graph (${graph.builtAt})`,
    `  files:   ${graph.files.length}`,
    `  imports: ${edges} internal edges`,
    `  symbols: ${symbols}`
  ].join(`
`);
}
var SRC_EXT, IMPORT_RES, SYMBOL_RES;
var init_graph = __esm(() => {
  init_json();
  init_indexer();
  SRC_EXT = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".mjs", ".cjs", ".py"];
  IMPORT_RES = [
    /\bimport\s+[^'"]*?from\s*['"]([^'"]+)['"]/g,
    /\bimport\s*['"]([^'"]+)['"]/g,
    /\bexport\s+[^'"]*?from\s*['"]([^'"]+)['"]/g,
    /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
    /^\s*from\s+([.\w]+)\s+import\b/gm,
    /^\s*import\s+([.\w]+)/gm
  ];
  SYMBOL_RES = [
    /\bexport\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
    /\bexport\s+(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/g,
    /\bexport\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g,
    /\bexport\s+(?:type|interface|enum)\s+([A-Za-z_$][\w$]*)/g,
    /\bexport\s+default\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g,
    /^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm,
    /^\s*class\s+([A-Za-z_$][\w$]*)/gm,
    /^\s*def\s+([A-Za-z_][\w]*)/gm,
    /^\s*class\s+([A-Za-z_][\w]*)\s*[:(]/gm
  ];
});

// ../../src/utils/codeIndex/repoIndex.ts
import { createHash as createHash2 } from "node:crypto";
import { existsSync as existsSync3, mkdirSync as mkdirSync2, readFileSync as readFileSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { join as join4, posix as posix2 } from "node:path";
function sha12(content) {
  return createHash2("sha1").update(content).digest("hex");
}
function posixExt(file) {
  const dot = file.lastIndexOf(".");
  return dot < 0 ? "" : file.slice(dot).toLowerCase();
}
function languageFromExt(ext) {
  const map = {
    ".ts": "typescript",
    ".tsx": "tsx",
    ".js": "javascript",
    ".jsx": "jsx",
    ".mjs": "javascript",
    ".cjs": "javascript",
    ".mts": "typescript",
    ".cts": "typescript",
    ".py": "python",
    ".pyi": "python",
    ".rb": "ruby",
    ".go": "go",
    ".rs": "rust",
    ".java": "java",
    ".kt": "kotlin",
    ".kts": "kotlin",
    ".swift": "swift",
    ".c": "c",
    ".cc": "cpp",
    ".cpp": "cpp",
    ".h": "c",
    ".hpp": "cpp",
    ".cs": "csharp",
    ".php": "php",
    ".lua": "lua",
    ".sh": "bash",
    ".bash": "bash",
    ".zsh": "zsh",
    ".sql": "sql",
    ".vue": "vue",
    ".svelte": "svelte",
    ".astro": "astro"
  };
  return map[ext];
}
function isTestFile(path2) {
  return TEST_SEGMENTS.some((re) => re.test(path2));
}
function isDocFile(path2, ext) {
  return ext === ".md" || ext === ".mdx" || ext === ".rst" || ext === ".adoc" || ext === ".txt";
}
function isConfigFile(path2, ext) {
  const basename = path2.split("/").pop() ?? "";
  if (CONFIG_NAMES.has(basename))
    return true;
  if (CONFIG_NAMES.has(path2))
    return true;
  if (CONFIG_EXTENSIONS.has(ext))
    return true;
  if (basename.startsWith(".") && ext === "")
    return true;
  return false;
}
function fileKind(path2, ext) {
  if (isTestFile(path2))
    return "test";
  if (isDocFile(path2, ext))
    return "doc";
  if (isConfigFile(path2, ext))
    return "config";
  if (SRC_EXTENSIONS.has(ext))
    return "source";
  return "other";
}
function matchAll2(text, regexes) {
  const out = [];
  for (const re of regexes) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m[1])
        out.push(m[1]);
    }
  }
  return out;
}
function extractImports2(content) {
  return [...new Set(matchAll2(content, IMPORT_RES2))];
}
function extractSymbolsDetailed(content) {
  const out = [];
  const lines = content.split(`
`);
  for (const { re, kind } of SYMBOL_RES2) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
      const name = m[1];
      if (!name)
        continue;
      const line = content.slice(0, m.index).split(`
`).length;
      const column = m.index - content.lastIndexOf(`
`, m.index);
      out.push({ name, kind, file: "", line, column });
    }
  }
  return out;
}
function extractCalls(content, localSymbols) {
  const calls = [];
  const seen = new Set;
  CALL_RE.lastIndex = 0;
  let m;
  while ((m = CALL_RE.exec(content)) !== null) {
    const callee = m[1];
    if (!callee || !localSymbols.has(callee))
      continue;
    const key = `${callee}:${m.index}`;
    if (seen.has(key))
      continue;
    seen.add(key);
    const line = content.slice(0, m.index).split(`
`).length;
    calls.push({ caller: "", callee, file: "", line });
  }
  return calls;
}
function extractTests(path2, content) {
  const ext = posixExt(path2);
  if (!isTestFile(path2) && ext !== ".ts" && ext !== ".tsx" && ext !== ".js" && ext !== ".jsx") {
    return [];
  }
  const tests = [];
  TEST_RE.lastIndex = 0;
  let m;
  while ((m = TEST_RE.exec(content)) !== null) {
    tests.push({ file: path2, name: m[1], kind: "test" });
  }
  if (tests.length === 0 && isTestFile(path2)) {
    tests.push({ file: path2, kind: "test-file" });
  }
  return tests;
}
function extractDocRefs(path2, content) {
  const refs = [];
  const re = /\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const ref = m[1];
    if (ref && !ref.startsWith("http") && !ref.startsWith("#")) {
      refs.push(ref.replace(/^\.\//, ""));
    }
  }
  return [...new Set(refs)];
}
function extractDocTitle(content) {
  const m = content.match(/^#\s+(.+)$/m);
  return m?.[1]?.trim();
}
function extractConfigKeys(path2, content) {
  const ext = posixExt(path2);
  if (ext === ".json") {
    try {
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return Object.keys(parsed).slice(0, 100);
      }
    } catch {}
  }
  return;
}
function configKind(path2, ext) {
  const basename = path2.split("/").pop() ?? "";
  if (basename === "package.json")
    return "package";
  if (basename.startsWith("tsconfig"))
    return "typescript";
  if (basename.startsWith("eslint"))
    return "eslint";
  if (basename.startsWith("jest") || basename.startsWith("vitest"))
    return "test";
  if (basename.startsWith("vite") || basename.startsWith("webpack") || basename.startsWith("rollup"))
    return "build";
  if (basename === "Dockerfile" || basename.startsWith("docker-compose"))
    return "docker";
  if (basename === "Makefile" || basename === "CMakeLists.txt")
    return "build";
  if (basename === "UR.md" || basename === "AGENTS.md" || basename === "UR.local.md")
    return "instructions";
  if (ext === ".json" || ext === ".yaml" || ext === ".yml" || ext === ".toml")
    return "config";
  return "config";
}
function resolveImport2(fromFile, spec, fileSet) {
  if (!spec.startsWith("."))
    return null;
  const dir = posix2.normalize(fromFile).split("/").slice(0, -1).join("/");
  let rel = posix2.normalize(`${dir}/${spec}`);
  if (rel.startsWith("/"))
    rel = rel.slice(1);
  if (fileSet.has(rel))
    return rel;
  const noExt = rel.replace(/\.(?:m|c)?[jt]sx?$/, "").replace(/\.py$/, "");
  for (const ext of [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts", ".mjs", ".cjs", ".py"]) {
    if (fileSet.has(`${noExt}${ext}`))
      return `${noExt}${ext}`;
    if (fileSet.has(`${noExt}/index${ext}`))
      return `${noExt}/index${ext}`;
  }
  return null;
}
async function buildRepoIndex(options) {
  const signal = options.signal ?? new AbortController().signal;
  const read = options.readFile ?? ((abs) => readFileSync2(abs, "utf-8"));
  const rels = (await listIndexableFiles(options.root, signal)).slice(0, options.maxFiles ?? 5000);
  const fileSet = new Set(rels);
  const files = [];
  const symbolEntries = [];
  const callEntries = [];
  const testEntries = [];
  const docEntries = [];
  const configEntries = [];
  for (const rel of rels) {
    let callerAt = function(index) {
      let last;
      for (const sym of fileSymbolRanges) {
        if (sym.start > index)
          break;
        last = sym;
      }
      return last?.name;
    };
    const abs = join4(options.root, rel);
    let content;
    try {
      content = read(abs);
    } catch {
      continue;
    }
    const ext = posixExt(rel);
    const hash = sha12(content);
    const kind = fileKind(rel, ext);
    const language = languageFromExt(ext);
    const imports = extractImports2(content).map((spec) => resolveImport2(rel, spec, fileSet)).filter((s) => Boolean(s));
    const importedBy = [];
    const fileSymbols = extractSymbolsDetailed(content);
    const localSymbolNames = new Set(fileSymbols.map((s) => s.name));
    const fileCalls = extractCalls(content, localSymbolNames);
    for (const s of fileSymbols) {
      s.file = rel;
      symbolEntries.push(s);
    }
    const fileSymbolRanges = fileSymbols.map((s) => {
      const idx = content.indexOf(s.name, 0);
      return { name: s.name, start: idx };
    }).filter((s) => s.start >= 0).sort((a, b) => a.start - b.start);
    for (const c of fileCalls) {
      c.file = rel;
      const callIndex = content.lastIndexOf(`${c.callee}(`, c.line ? content.split(`
`).slice(0, c.line - 1).join(`
`).length : content.length);
      c.caller = callerAt(callIndex) ?? "";
      callEntries.push(c);
    }
    files.push({
      path: rel,
      kind,
      language,
      hash,
      symbols: [...new Set(fileSymbols.map((s) => s.name))].sort(),
      imports: [...new Set(imports)].sort(),
      importedBy
    });
    if (isTestFile(rel) || kind === "test") {
      testEntries.push(...extractTests(rel, content));
    }
    if (kind === "doc") {
      docEntries.push({
        path: rel,
        title: extractDocTitle(content),
        refs: extractDocRefs(rel, content)
      });
    }
    if (kind === "config" || isConfigFile(rel, ext)) {
      configEntries.push({
        path: rel,
        kind: configKind(rel, ext),
        keys: extractConfigKeys(rel, content)
      });
    }
  }
  const byPath = new Map(files.map((f) => [f.path, f]));
  for (const file of files) {
    for (const imp of file.imports ?? []) {
      const target = byPath.get(imp);
      if (target) {
        (target.importedBy ??= []).push(file.path);
      }
    }
  }
  for (const file of files) {
    file.importedBy = [...new Set(file.importedBy ?? [])].sort();
  }
  const now = new Date().toISOString();
  const repo = { version: 1, builtAt: now, root: options.root, files };
  const symbols = { version: 1, builtAt: now, symbols: symbolEntries };
  const calls = { version: 1, builtAt: now, calls: callEntries };
  const tests = { version: 1, builtAt: now, tests: testEntries };
  const docs = { version: 1, builtAt: now, docs: docEntries };
  const configs = { version: 1, builtAt: now, configs: configEntries };
  mkdirSync2(repoIndexDir(options.root), { recursive: true });
  writeFileSync2(repoIndexPath(options.root), `${JSON.stringify(repo, null, 2)}
`);
  writeFileSync2(symbolIndexPath(options.root), `${JSON.stringify(symbols, null, 2)}
`);
  writeFileSync2(callIndexPath(options.root), `${JSON.stringify(calls, null, 2)}
`);
  writeFileSync2(testIndexPath(options.root), `${JSON.stringify(tests, null, 2)}
`);
  writeFileSync2(docIndexPath(options.root), `${JSON.stringify(docs, null, 2)}
`);
  writeFileSync2(configIndexPath(options.root), `${JSON.stringify(configs, null, 2)}
`);
  return { repo, symbols, calls, tests, docs, configs };
}
function repoIndexDir(root) {
  return join4(root, ".ur", "code-index");
}
function repoIndexPath(root) {
  return join4(repoIndexDir(root), "repo.json");
}
function symbolIndexPath(root) {
  return join4(repoIndexDir(root), "symbols.json");
}
function callIndexPath(root) {
  return join4(repoIndexDir(root), "calls.json");
}
function testIndexPath(root) {
  return join4(repoIndexDir(root), "tests.json");
}
function docIndexPath(root) {
  return join4(repoIndexDir(root), "docs.json");
}
function configIndexPath(root) {
  return join4(repoIndexDir(root), "configs.json");
}
function loadRepoIndex(root) {
  return loadJsonFile(repoIndexPath(root));
}
function loadSymbolIndex(root) {
  return loadJsonFile(symbolIndexPath(root));
}
function loadCallIndex(root) {
  return loadJsonFile(callIndexPath(root));
}
function loadTestIndex(root) {
  return loadJsonFile(testIndexPath(root));
}
function loadDocIndex(root) {
  return loadJsonFile(docIndexPath(root));
}
function loadConfigIndex(root) {
  return loadJsonFile(configIndexPath(root));
}
function loadJsonFile(path2) {
  if (!existsSync3(path2))
    return null;
  const parsed = safeParseJSON(readFileSync2(path2, "utf-8"), false);
  return parsed && typeof parsed === "object" ? parsed : null;
}
function repoSearch(repo, query) {
  const q = query.toLowerCase();
  return repo.files.filter((f) => f.path.toLowerCase().includes(q) || f.symbols?.some((s) => s.toLowerCase().includes(q)) || f.kind.includes(q));
}
function symbolSearch(symbols, query) {
  const q = query.toLowerCase();
  return symbols.symbols.filter((s) => s.name.toLowerCase().includes(q));
}
function findCallers(calls, symbol) {
  return calls.calls.filter((c) => c.callee === symbol);
}
function findTestsForFile(tests, file) {
  return tests.tests.filter((t) => {
    if (t.file === file)
      return true;
    const base = file.replace(/\.(?:[jt]sx?|[mc][jt]sx?)$/, "");
    return t.file.includes(base) || file.includes(t.file.replace(/\.[jt]sx?$/, ""));
  });
}
function docSearch(docs, query) {
  const q = query.toLowerCase();
  return docs.docs.filter((d) => d.path.toLowerCase().includes(q) || d.title?.toLowerCase().includes(q));
}
function formatRepoStats(repo) {
  const counts = repo.files.reduce((acc, f) => {
    acc[f.kind] = (acc[f.kind] ?? 0) + 1;
    return acc;
  }, {});
  const lines = [
    `Repo index: ${repo.files.length} files`,
    ...Object.entries(counts).map(([k, v]) => `  ${k}: ${v}`)
  ];
  return lines.join(`
`);
}
var SRC_EXTENSIONS, TEST_SEGMENTS, CONFIG_NAMES, CONFIG_EXTENSIONS, IMPORT_RES2, SYMBOL_RES2, CALL_RE, TEST_RE;
var init_repoIndex = __esm(() => {
  init_json();
  init_indexer();
  SRC_EXTENSIONS = new Set([
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
    ".mts",
    ".cts",
    ".py",
    ".pyi",
    ".rb",
    ".go",
    ".rs",
    ".java",
    ".kt",
    ".kts",
    ".c",
    ".cc",
    ".cpp",
    ".cxx",
    ".h",
    ".hpp",
    ".cs",
    ".swift",
    ".php",
    ".lua",
    ".dart",
    ".ex",
    ".exs",
    ".erl",
    ".clj",
    ".hs",
    ".sh",
    ".bash",
    ".zsh",
    ".sql",
    ".vue",
    ".svelte",
    ".astro"
  ]);
  TEST_SEGMENTS = [
    /[\._-](?:test|spec)\.[mc]?[jt]sx?$/i,
    /[\/_](?:tests?|__tests__|specs?)\//i,
    /\.(?:test|spec)\.(py|rb|go|rs|java|kt|swift|php)$/i
  ];
  CONFIG_NAMES = new Set([
    "package.json",
    "bunfig.toml",
    "tsconfig.json",
    "jsconfig.json",
    "vite.config.ts",
    "vite.config.js",
    "webpack.config.js",
    "rollup.config.js",
    "eslint.config.js",
    "eslint.config.mjs",
    "eslint.config.ts",
    ".eslintrc.json",
    ".prettierrc",
    "prettier.config.js",
    "prettier.config.mjs",
    "tailwind.config.js",
    "tailwind.config.ts",
    "next.config.js",
    "next.config.mjs",
    "jest.config.js",
    "jest.config.ts",
    "vitest.config.ts",
    "vitest.config.js",
    "dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
    "Makefile",
    "makefile",
    "CMakeLists.txt",
    ".github/workflows",
    ".ur",
    "AGENTS.md",
    "UR.md",
    "UR.local.md"
  ]);
  CONFIG_EXTENSIONS = new Set([
    ".json",
    ".yaml",
    ".yml",
    ".toml",
    ".ini",
    ".cfg",
    ".lock",
    ".config",
    ".conf"
  ]);
  IMPORT_RES2 = [
    /\bimport\s+[^'"]*?from\s*['"]([^'"]+)['"]/g,
    /\bimport\s*['"]([^'"]+)['"]/g,
    /\bexport\s+[^'"]*?from\s*['"]([^'"]+)['"]/g,
    /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
    /^\s*from\s+([.\w]+)\s+import\b/gm,
    /^\s*import\s+([.\w]+)/gm
  ];
  SYMBOL_RES2 = [
    { re: /\bexport\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g, kind: "function" },
    { re: /\bexport\s+(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/g, kind: "class" },
    { re: /\bexport\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g, kind: "variable" },
    { re: /\bexport\s+(?:type|interface|enum)\s+([A-Za-z_$][\w$]*)/g, kind: "type" },
    { re: /\bexport\s+default\s+(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g, kind: "function" },
    { re: /^\s*(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm, kind: "function" },
    { re: /^\s*class\s+([A-Za-z_$][\w$]*)/gm, kind: "class" },
    { re: /^\s*def\s+([A-Za-z_][\w]*)/gm, kind: "function" },
    { re: /^\s*class\s+([A-Za-z_][\w]*)\s*[:(]/gm, kind: "class" }
  ];
  CALL_RE = /\b([A-Za-z_$][\w$]*)\s*\(/g;
  TEST_RE = /\b(?:it|test|describe)\s*\(\s*['"`]([^'"`]+)['"`]/g;
});

// ../../src/utils/codeIndex/index.ts
function isCodeIndexEnabled(env = process.env) {
  const value = (env.UR_CODE_INDEX || "").trim().toLowerCase();
  return value !== "" && value !== "0" && value !== "false" && value !== "off";
}
var init_codeIndex = __esm(() => {
  init_embeddings();
  init_store();
  init_indexer();
  init_graph();
  init_repoIndex();
});

// ../../node_modules/.bun/readdirp@4.1.2/node_modules/readdirp/esm/index.js
import { stat as stat2, lstat, readdir as readdir2, realpath } from "node:fs/promises";
import { Readable } from "node:stream";
import { resolve as presolve, relative as prelative, join as pjoin, sep as psep } from "node:path";
function readdirp(root, options = {}) {
  let type = options.entryType || options.type;
  if (type === "both")
    type = EntryTypes.FILE_DIR_TYPE;
  if (type)
    options.type = type;
  if (!root) {
    throw new Error("readdirp: root argument is required. Usage: readdirp(root, options)");
  } else if (typeof root !== "string") {
    throw new TypeError("readdirp: root argument must be a string. Usage: readdirp(root, options)");
  } else if (type && !ALL_TYPES.includes(type)) {
    throw new Error(`readdirp: Invalid type passed. Use one of ${ALL_TYPES.join(", ")}`);
  }
  options.root = root;
  return new ReaddirpStream(options);
}
var EntryTypes, defaultOptions, RECURSIVE_ERROR_CODE = "READDIRP_RECURSIVE_ERROR", NORMAL_FLOW_ERRORS, ALL_TYPES, DIR_TYPES, FILE_TYPES, isNormalFlowError = (error) => NORMAL_FLOW_ERRORS.has(error.code), wantBigintFsStats, emptyFn = (_entryInfo) => true, normalizeFilter = (filter) => {
  if (filter === undefined)
    return emptyFn;
  if (typeof filter === "function")
    return filter;
  if (typeof filter === "string") {
    const fl = filter.trim();
    return (entry) => entry.basename === fl;
  }
  if (Array.isArray(filter)) {
    const trItems = filter.map((item) => item.trim());
    return (entry) => trItems.some((f) => entry.basename === f);
  }
  return emptyFn;
}, ReaddirpStream;
var init_esm = __esm(() => {
  EntryTypes = {
    FILE_TYPE: "files",
    DIR_TYPE: "directories",
    FILE_DIR_TYPE: "files_directories",
    EVERYTHING_TYPE: "all"
  };
  defaultOptions = {
    root: ".",
    fileFilter: (_entryInfo) => true,
    directoryFilter: (_entryInfo) => true,
    type: EntryTypes.FILE_TYPE,
    lstat: false,
    depth: 2147483648,
    alwaysStat: false,
    highWaterMark: 4096
  };
  Object.freeze(defaultOptions);
  NORMAL_FLOW_ERRORS = new Set(["ENOENT", "EPERM", "EACCES", "ELOOP", RECURSIVE_ERROR_CODE]);
  ALL_TYPES = [
    EntryTypes.DIR_TYPE,
    EntryTypes.EVERYTHING_TYPE,
    EntryTypes.FILE_DIR_TYPE,
    EntryTypes.FILE_TYPE
  ];
  DIR_TYPES = new Set([
    EntryTypes.DIR_TYPE,
    EntryTypes.EVERYTHING_TYPE,
    EntryTypes.FILE_DIR_TYPE
  ]);
  FILE_TYPES = new Set([
    EntryTypes.EVERYTHING_TYPE,
    EntryTypes.FILE_DIR_TYPE,
    EntryTypes.FILE_TYPE
  ]);
  wantBigintFsStats = process.platform === "win32";
  ReaddirpStream = class ReaddirpStream extends Readable {
    constructor(options = {}) {
      super({
        objectMode: true,
        autoDestroy: true,
        highWaterMark: options.highWaterMark
      });
      const opts = { ...defaultOptions, ...options };
      const { root, type } = opts;
      this._fileFilter = normalizeFilter(opts.fileFilter);
      this._directoryFilter = normalizeFilter(opts.directoryFilter);
      const statMethod = opts.lstat ? lstat : stat2;
      if (wantBigintFsStats) {
        this._stat = (path2) => statMethod(path2, { bigint: true });
      } else {
        this._stat = statMethod;
      }
      this._maxDepth = opts.depth ?? defaultOptions.depth;
      this._wantsDir = type ? DIR_TYPES.has(type) : false;
      this._wantsFile = type ? FILE_TYPES.has(type) : false;
      this._wantsEverything = type === EntryTypes.EVERYTHING_TYPE;
      this._root = presolve(root);
      this._isDirent = !opts.alwaysStat;
      this._statsProp = this._isDirent ? "dirent" : "stats";
      this._rdOptions = { encoding: "utf8", withFileTypes: this._isDirent };
      this.parents = [this._exploreDir(root, 1)];
      this.reading = false;
      this.parent = undefined;
    }
    async _read(batch) {
      if (this.reading)
        return;
      this.reading = true;
      try {
        while (!this.destroyed && batch > 0) {
          const par = this.parent;
          const fil = par && par.files;
          if (fil && fil.length > 0) {
            const { path: path2, depth } = par;
            const slice = fil.splice(0, batch).map((dirent) => this._formatEntry(dirent, path2));
            const awaited = await Promise.all(slice);
            for (const entry of awaited) {
              if (!entry)
                continue;
              if (this.destroyed)
                return;
              const entryType = await this._getEntryType(entry);
              if (entryType === "directory" && this._directoryFilter(entry)) {
                if (depth <= this._maxDepth) {
                  this.parents.push(this._exploreDir(entry.fullPath, depth + 1));
                }
                if (this._wantsDir) {
                  this.push(entry);
                  batch--;
                }
              } else if ((entryType === "file" || this._includeAsFile(entry)) && this._fileFilter(entry)) {
                if (this._wantsFile) {
                  this.push(entry);
                  batch--;
                }
              }
            }
          } else {
            const parent = this.parents.pop();
            if (!parent) {
              this.push(null);
              break;
            }
            this.parent = await parent;
            if (this.destroyed)
              return;
          }
        }
      } catch (error) {
        this.destroy(error);
      } finally {
        this.reading = false;
      }
    }
    async _exploreDir(path2, depth) {
      let files;
      try {
        files = await readdir2(path2, this._rdOptions);
      } catch (error) {
        this._onError(error);
      }
      return { files, depth, path: path2 };
    }
    async _formatEntry(dirent, path2) {
      let entry;
      const basename = this._isDirent ? dirent.name : dirent;
      try {
        const fullPath = presolve(pjoin(path2, basename));
        entry = { path: prelative(this._root, fullPath), fullPath, basename };
        entry[this._statsProp] = this._isDirent ? dirent : await this._stat(fullPath);
      } catch (err) {
        this._onError(err);
        return;
      }
      return entry;
    }
    _onError(err) {
      if (isNormalFlowError(err) && !this.destroyed) {
        this.emit("warn", err);
      } else {
        this.destroy(err);
      }
    }
    async _getEntryType(entry) {
      if (!entry && this._statsProp in entry) {
        return "";
      }
      const stats = entry[this._statsProp];
      if (stats.isFile())
        return "file";
      if (stats.isDirectory())
        return "directory";
      if (stats && stats.isSymbolicLink()) {
        const full = entry.fullPath;
        try {
          const entryRealPath = await realpath(full);
          const entryRealPathStats = await lstat(entryRealPath);
          if (entryRealPathStats.isFile()) {
            return "file";
          }
          if (entryRealPathStats.isDirectory()) {
            const len = entryRealPath.length;
            if (full.startsWith(entryRealPath) && full.substr(len, 1) === psep) {
              const recursiveError = new Error(`Circular symlink detected: "${full}" points to "${entryRealPath}"`);
              recursiveError.code = RECURSIVE_ERROR_CODE;
              return this._onError(recursiveError);
            }
            return "directory";
          }
        } catch (error) {
          this._onError(error);
          return "";
        }
      }
    }
    _includeAsFile(entry) {
      const stats = entry && entry[this._statsProp];
      return stats && this._wantsEverything && !stats.isDirectory();
    }
  };
});

// ../../node_modules/.bun/chokidar@4.0.3/node_modules/chokidar/esm/handler.js
import { watchFile, unwatchFile, watch as fs_watch } from "fs";
import { open, stat as stat3, lstat as lstat2, realpath as fsrealpath } from "fs/promises";
import * as sysPath from "path";
import { type as osType } from "os";
function createFsWatchInstance(path2, options, listener, errHandler, emitRaw) {
  const handleEvent = (rawEvent, evPath) => {
    listener(path2);
    emitRaw(rawEvent, evPath, { watchedPath: path2 });
    if (evPath && path2 !== evPath) {
      fsWatchBroadcast(sysPath.resolve(path2, evPath), KEY_LISTENERS, sysPath.join(path2, evPath));
    }
  };
  try {
    return fs_watch(path2, {
      persistent: options.persistent
    }, handleEvent);
  } catch (error) {
    errHandler(error);
    return;
  }
}

class NodeFsHandler {
  constructor(fsW) {
    this.fsw = fsW;
    this._boundHandleError = (error) => fsW._handleError(error);
  }
  _watchWithNodeFs(path2, listener) {
    const opts = this.fsw.options;
    const directory = sysPath.dirname(path2);
    const basename2 = sysPath.basename(path2);
    const parent = this.fsw._getWatchedDir(directory);
    parent.add(basename2);
    const absolutePath = sysPath.resolve(path2);
    const options = {
      persistent: opts.persistent
    };
    if (!listener)
      listener = EMPTY_FN;
    let closer;
    if (opts.usePolling) {
      const enableBin = opts.interval !== opts.binaryInterval;
      options.interval = enableBin && isBinaryPath(basename2) ? opts.binaryInterval : opts.interval;
      closer = setFsWatchFileListener(path2, absolutePath, options, {
        listener,
        rawEmitter: this.fsw._emitRaw
      });
    } else {
      closer = setFsWatchListener(path2, absolutePath, options, {
        listener,
        errHandler: this._boundHandleError,
        rawEmitter: this.fsw._emitRaw
      });
    }
    return closer;
  }
  _handleFile(file, stats, initialAdd) {
    if (this.fsw.closed) {
      return;
    }
    const dirname3 = sysPath.dirname(file);
    const basename2 = sysPath.basename(file);
    const parent = this.fsw._getWatchedDir(dirname3);
    let prevStats = stats;
    if (parent.has(basename2))
      return;
    const listener = async (path2, newStats) => {
      if (!this.fsw._throttle(THROTTLE_MODE_WATCH, file, 5))
        return;
      if (!newStats || newStats.mtimeMs === 0) {
        try {
          const newStats2 = await stat3(file);
          if (this.fsw.closed)
            return;
          const at = newStats2.atimeMs;
          const mt = newStats2.mtimeMs;
          if (!at || at <= mt || mt !== prevStats.mtimeMs) {
            this.fsw._emit(EV.CHANGE, file, newStats2);
          }
          if ((isMacos || isLinux || isFreeBSD) && prevStats.ino !== newStats2.ino) {
            this.fsw._closeFile(path2);
            prevStats = newStats2;
            const closer2 = this._watchWithNodeFs(file, listener);
            if (closer2)
              this.fsw._addPathCloser(path2, closer2);
          } else {
            prevStats = newStats2;
          }
        } catch (error) {
          this.fsw._remove(dirname3, basename2);
        }
      } else if (parent.has(basename2)) {
        const at = newStats.atimeMs;
        const mt = newStats.mtimeMs;
        if (!at || at <= mt || mt !== prevStats.mtimeMs) {
          this.fsw._emit(EV.CHANGE, file, newStats);
        }
        prevStats = newStats;
      }
    };
    const closer = this._watchWithNodeFs(file, listener);
    if (!(initialAdd && this.fsw.options.ignoreInitial) && this.fsw._isntIgnored(file)) {
      if (!this.fsw._throttle(EV.ADD, file, 0))
        return;
      this.fsw._emit(EV.ADD, file, stats);
    }
    return closer;
  }
  async _handleSymlink(entry, directory, path2, item) {
    if (this.fsw.closed) {
      return;
    }
    const full = entry.fullPath;
    const dir = this.fsw._getWatchedDir(directory);
    if (!this.fsw.options.followSymlinks) {
      this.fsw._incrReadyCount();
      let linkPath;
      try {
        linkPath = await fsrealpath(path2);
      } catch (e) {
        this.fsw._emitReady();
        return true;
      }
      if (this.fsw.closed)
        return;
      if (dir.has(item)) {
        if (this.fsw._symlinkPaths.get(full) !== linkPath) {
          this.fsw._symlinkPaths.set(full, linkPath);
          this.fsw._emit(EV.CHANGE, path2, entry.stats);
        }
      } else {
        dir.add(item);
        this.fsw._symlinkPaths.set(full, linkPath);
        this.fsw._emit(EV.ADD, path2, entry.stats);
      }
      this.fsw._emitReady();
      return true;
    }
    if (this.fsw._symlinkPaths.has(full)) {
      return true;
    }
    this.fsw._symlinkPaths.set(full, true);
  }
  _handleRead(directory, initialAdd, wh, target, dir, depth, throttler) {
    directory = sysPath.join(directory, "");
    throttler = this.fsw._throttle("readdir", directory, 1000);
    if (!throttler)
      return;
    const previous = this.fsw._getWatchedDir(wh.path);
    const current = new Set;
    let stream = this.fsw._readdirp(directory, {
      fileFilter: (entry) => wh.filterPath(entry),
      directoryFilter: (entry) => wh.filterDir(entry)
    });
    if (!stream)
      return;
    stream.on(STR_DATA, async (entry) => {
      if (this.fsw.closed) {
        stream = undefined;
        return;
      }
      const item = entry.path;
      let path2 = sysPath.join(directory, item);
      current.add(item);
      if (entry.stats.isSymbolicLink() && await this._handleSymlink(entry, directory, path2, item)) {
        return;
      }
      if (this.fsw.closed) {
        stream = undefined;
        return;
      }
      if (item === target || !target && !previous.has(item)) {
        this.fsw._incrReadyCount();
        path2 = sysPath.join(dir, sysPath.relative(dir, path2));
        this._addToNodeFs(path2, initialAdd, wh, depth + 1);
      }
    }).on(EV.ERROR, this._boundHandleError);
    return new Promise((resolve5, reject) => {
      if (!stream)
        return reject();
      stream.once(STR_END, () => {
        if (this.fsw.closed) {
          stream = undefined;
          return;
        }
        const wasThrottled = throttler ? throttler.clear() : false;
        resolve5(undefined);
        previous.getChildren().filter((item) => {
          return item !== directory && !current.has(item);
        }).forEach((item) => {
          this.fsw._remove(directory, item);
        });
        stream = undefined;
        if (wasThrottled)
          this._handleRead(directory, false, wh, target, dir, depth, throttler);
      });
    });
  }
  async _handleDir(dir, stats, initialAdd, depth, target, wh, realpath2) {
    const parentDir = this.fsw._getWatchedDir(sysPath.dirname(dir));
    const tracked = parentDir.has(sysPath.basename(dir));
    if (!(initialAdd && this.fsw.options.ignoreInitial) && !target && !tracked) {
      this.fsw._emit(EV.ADD_DIR, dir, stats);
    }
    parentDir.add(sysPath.basename(dir));
    this.fsw._getWatchedDir(dir);
    let throttler;
    let closer;
    const oDepth = this.fsw.options.depth;
    if ((oDepth == null || depth <= oDepth) && !this.fsw._symlinkPaths.has(realpath2)) {
      if (!target) {
        await this._handleRead(dir, initialAdd, wh, target, dir, depth, throttler);
        if (this.fsw.closed)
          return;
      }
      closer = this._watchWithNodeFs(dir, (dirPath, stats2) => {
        if (stats2 && stats2.mtimeMs === 0)
          return;
        this._handleRead(dirPath, false, wh, target, dir, depth, throttler);
      });
    }
    return closer;
  }
  async _addToNodeFs(path2, initialAdd, priorWh, depth, target) {
    const ready = this.fsw._emitReady;
    if (this.fsw._isIgnored(path2) || this.fsw.closed) {
      ready();
      return false;
    }
    const wh = this.fsw._getWatchHelpers(path2);
    if (priorWh) {
      wh.filterPath = (entry) => priorWh.filterPath(entry);
      wh.filterDir = (entry) => priorWh.filterDir(entry);
    }
    try {
      const stats = await statMethods[wh.statMethod](wh.watchPath);
      if (this.fsw.closed)
        return;
      if (this.fsw._isIgnored(wh.watchPath, stats)) {
        ready();
        return false;
      }
      const follow = this.fsw.options.followSymlinks;
      let closer;
      if (stats.isDirectory()) {
        const absPath = sysPath.resolve(path2);
        const targetPath = follow ? await fsrealpath(path2) : path2;
        if (this.fsw.closed)
          return;
        closer = await this._handleDir(wh.watchPath, stats, initialAdd, depth, target, wh, targetPath);
        if (this.fsw.closed)
          return;
        if (absPath !== targetPath && targetPath !== undefined) {
          this.fsw._symlinkPaths.set(absPath, targetPath);
        }
      } else if (stats.isSymbolicLink()) {
        const targetPath = follow ? await fsrealpath(path2) : path2;
        if (this.fsw.closed)
          return;
        const parent = sysPath.dirname(wh.watchPath);
        this.fsw._getWatchedDir(parent).add(wh.watchPath);
        this.fsw._emit(EV.ADD, wh.watchPath, stats);
        closer = await this._handleDir(parent, stats, initialAdd, depth, path2, wh, targetPath);
        if (this.fsw.closed)
          return;
        if (targetPath !== undefined) {
          this.fsw._symlinkPaths.set(sysPath.resolve(path2), targetPath);
        }
      } else {
        closer = this._handleFile(wh.watchPath, stats, initialAdd);
      }
      ready();
      if (closer)
        this.fsw._addPathCloser(path2, closer);
      return false;
    } catch (error) {
      if (this.fsw._handleError(error)) {
        ready();
        return path2;
      }
    }
  }
}
var STR_DATA = "data", STR_END = "end", STR_CLOSE = "close", EMPTY_FN = () => {}, pl, isWindows, isMacos, isLinux, isFreeBSD, isIBMi, EVENTS, EV, THROTTLE_MODE_WATCH = "watch", statMethods, KEY_LISTENERS = "listeners", KEY_ERR = "errHandlers", KEY_RAW = "rawEmitters", HANDLER_KEYS, binaryExtensions, isBinaryPath = (filePath) => binaryExtensions.has(sysPath.extname(filePath).slice(1).toLowerCase()), foreach = (val, fn) => {
  if (val instanceof Set) {
    val.forEach(fn);
  } else {
    fn(val);
  }
}, addAndConvert = (main, prop, item) => {
  let container = main[prop];
  if (!(container instanceof Set)) {
    main[prop] = container = new Set([container]);
  }
  container.add(item);
}, clearItem = (cont) => (key) => {
  const set = cont[key];
  if (set instanceof Set) {
    set.clear();
  } else {
    delete cont[key];
  }
}, delFromSet = (main, prop, item) => {
  const container = main[prop];
  if (container instanceof Set) {
    container.delete(item);
  } else if (container === item) {
    delete main[prop];
  }
}, isEmptySet = (val) => val instanceof Set ? val.size === 0 : !val, FsWatchInstances, fsWatchBroadcast = (fullPath, listenerType, val1, val2, val3) => {
  const cont = FsWatchInstances.get(fullPath);
  if (!cont)
    return;
  foreach(cont[listenerType], (listener) => {
    listener(val1, val2, val3);
  });
}, setFsWatchListener = (path2, fullPath, options, handlers) => {
  const { listener, errHandler, rawEmitter } = handlers;
  let cont = FsWatchInstances.get(fullPath);
  let watcher;
  if (!options.persistent) {
    watcher = createFsWatchInstance(path2, options, listener, errHandler, rawEmitter);
    if (!watcher)
      return;
    return watcher.close.bind(watcher);
  }
  if (cont) {
    addAndConvert(cont, KEY_LISTENERS, listener);
    addAndConvert(cont, KEY_ERR, errHandler);
    addAndConvert(cont, KEY_RAW, rawEmitter);
  } else {
    watcher = createFsWatchInstance(path2, options, fsWatchBroadcast.bind(null, fullPath, KEY_LISTENERS), errHandler, fsWatchBroadcast.bind(null, fullPath, KEY_RAW));
    if (!watcher)
      return;
    watcher.on(EV.ERROR, async (error) => {
      const broadcastErr = fsWatchBroadcast.bind(null, fullPath, KEY_ERR);
      if (cont)
        cont.watcherUnusable = true;
      if (isWindows && error.code === "EPERM") {
        try {
          const fd = await open(path2, "r");
          await fd.close();
          broadcastErr(error);
        } catch (err) {}
      } else {
        broadcastErr(error);
      }
    });
    cont = {
      listeners: listener,
      errHandlers: errHandler,
      rawEmitters: rawEmitter,
      watcher
    };
    FsWatchInstances.set(fullPath, cont);
  }
  return () => {
    delFromSet(cont, KEY_LISTENERS, listener);
    delFromSet(cont, KEY_ERR, errHandler);
    delFromSet(cont, KEY_RAW, rawEmitter);
    if (isEmptySet(cont.listeners)) {
      cont.watcher.close();
      FsWatchInstances.delete(fullPath);
      HANDLER_KEYS.forEach(clearItem(cont));
      cont.watcher = undefined;
      Object.freeze(cont);
    }
  };
}, FsWatchFileInstances, setFsWatchFileListener = (path2, fullPath, options, handlers) => {
  const { listener, rawEmitter } = handlers;
  let cont = FsWatchFileInstances.get(fullPath);
  const copts = cont && cont.options;
  if (copts && (copts.persistent < options.persistent || copts.interval > options.interval)) {
    unwatchFile(fullPath);
    cont = undefined;
  }
  if (cont) {
    addAndConvert(cont, KEY_LISTENERS, listener);
    addAndConvert(cont, KEY_RAW, rawEmitter);
  } else {
    cont = {
      listeners: listener,
      rawEmitters: rawEmitter,
      options,
      watcher: watchFile(fullPath, options, (curr, prev) => {
        foreach(cont.rawEmitters, (rawEmitter2) => {
          rawEmitter2(EV.CHANGE, fullPath, { curr, prev });
        });
        const currmtime = curr.mtimeMs;
        if (curr.size !== prev.size || currmtime > prev.mtimeMs || currmtime === 0) {
          foreach(cont.listeners, (listener2) => listener2(path2, curr));
        }
      })
    };
    FsWatchFileInstances.set(fullPath, cont);
  }
  return () => {
    delFromSet(cont, KEY_LISTENERS, listener);
    delFromSet(cont, KEY_RAW, rawEmitter);
    if (isEmptySet(cont.listeners)) {
      FsWatchFileInstances.delete(fullPath);
      unwatchFile(fullPath);
      cont.options = cont.watcher = undefined;
      Object.freeze(cont);
    }
  };
};
var init_handler = __esm(() => {
  pl = process.platform;
  isWindows = pl === "win32";
  isMacos = pl === "darwin";
  isLinux = pl === "linux";
  isFreeBSD = pl === "freebsd";
  isIBMi = osType() === "OS400";
  EVENTS = {
    ALL: "all",
    READY: "ready",
    ADD: "add",
    CHANGE: "change",
    ADD_DIR: "addDir",
    UNLINK: "unlink",
    UNLINK_DIR: "unlinkDir",
    RAW: "raw",
    ERROR: "error"
  };
  EV = EVENTS;
  statMethods = { lstat: lstat2, stat: stat3 };
  HANDLER_KEYS = [KEY_LISTENERS, KEY_ERR, KEY_RAW];
  binaryExtensions = new Set([
    "3dm",
    "3ds",
    "3g2",
    "3gp",
    "7z",
    "a",
    "aac",
    "adp",
    "afdesign",
    "afphoto",
    "afpub",
    "ai",
    "aif",
    "aiff",
    "alz",
    "ape",
    "apk",
    "appimage",
    "ar",
    "arj",
    "asf",
    "au",
    "avi",
    "bak",
    "baml",
    "bh",
    "bin",
    "bk",
    "bmp",
    "btif",
    "bz2",
    "bzip2",
    "cab",
    "caf",
    "cgm",
    "class",
    "cmx",
    "cpio",
    "cr2",
    "cur",
    "dat",
    "dcm",
    "deb",
    "dex",
    "djvu",
    "dll",
    "dmg",
    "dng",
    "doc",
    "docm",
    "docx",
    "dot",
    "dotm",
    "dra",
    "DS_Store",
    "dsk",
    "dts",
    "dtshd",
    "dvb",
    "dwg",
    "dxf",
    "ecelp4800",
    "ecelp7470",
    "ecelp9600",
    "egg",
    "eol",
    "eot",
    "epub",
    "exe",
    "f4v",
    "fbs",
    "fh",
    "fla",
    "flac",
    "flatpak",
    "fli",
    "flv",
    "fpx",
    "fst",
    "fvt",
    "g3",
    "gh",
    "gif",
    "graffle",
    "gz",
    "gzip",
    "h261",
    "h263",
    "h264",
    "icns",
    "ico",
    "ief",
    "img",
    "ipa",
    "iso",
    "jar",
    "jpeg",
    "jpg",
    "jpgv",
    "jpm",
    "jxr",
    "key",
    "ktx",
    "lha",
    "lib",
    "lvp",
    "lz",
    "lzh",
    "lzma",
    "lzo",
    "m3u",
    "m4a",
    "m4v",
    "mar",
    "mdi",
    "mht",
    "mid",
    "midi",
    "mj2",
    "mka",
    "mkv",
    "mmr",
    "mng",
    "mobi",
    "mov",
    "movie",
    "mp3",
    "mp4",
    "mp4a",
    "mpeg",
    "mpg",
    "mpga",
    "mxu",
    "nef",
    "npx",
    "numbers",
    "nupkg",
    "o",
    "odp",
    "ods",
    "odt",
    "oga",
    "ogg",
    "ogv",
    "otf",
    "ott",
    "pages",
    "pbm",
    "pcx",
    "pdb",
    "pdf",
    "pea",
    "pgm",
    "pic",
    "png",
    "pnm",
    "pot",
    "potm",
    "potx",
    "ppa",
    "ppam",
    "ppm",
    "pps",
    "ppsm",
    "ppsx",
    "ppt",
    "pptm",
    "pptx",
    "psd",
    "pya",
    "pyc",
    "pyo",
    "pyv",
    "qt",
    "rar",
    "ras",
    "raw",
    "resources",
    "rgb",
    "rip",
    "rlc",
    "rmf",
    "rmvb",
    "rpm",
    "rtf",
    "rz",
    "s3m",
    "s7z",
    "scpt",
    "sgi",
    "shar",
    "snap",
    "sil",
    "sketch",
    "slk",
    "smv",
    "snk",
    "so",
    "stl",
    "suo",
    "sub",
    "swf",
    "tar",
    "tbz",
    "tbz2",
    "tga",
    "tgz",
    "thmx",
    "tif",
    "tiff",
    "tlz",
    "ttc",
    "ttf",
    "txz",
    "udf",
    "uvh",
    "uvi",
    "uvm",
    "uvp",
    "uvs",
    "uvu",
    "viv",
    "vob",
    "war",
    "wav",
    "wax",
    "wbmp",
    "wdp",
    "weba",
    "webm",
    "webp",
    "whl",
    "wim",
    "wm",
    "wma",
    "wmv",
    "wmx",
    "woff",
    "woff2",
    "wrm",
    "wvx",
    "xbm",
    "xif",
    "xla",
    "xlam",
    "xls",
    "xlsb",
    "xlsm",
    "xlsx",
    "xlt",
    "xltm",
    "xltx",
    "xm",
    "xmind",
    "xpi",
    "xpm",
    "xwd",
    "xz",
    "z",
    "zip",
    "zipx"
  ]);
  FsWatchInstances = new Map;
  FsWatchFileInstances = new Map;
});

// ../../node_modules/.bun/chokidar@4.0.3/node_modules/chokidar/esm/index.js
import { stat as statcb } from "fs";
import { stat as stat4, readdir as readdir3 } from "fs/promises";
import { EventEmitter } from "events";
import * as sysPath2 from "path";
function arrify(item) {
  return Array.isArray(item) ? item : [item];
}
function createPattern(matcher) {
  if (typeof matcher === "function")
    return matcher;
  if (typeof matcher === "string")
    return (string) => matcher === string;
  if (matcher instanceof RegExp)
    return (string) => matcher.test(string);
  if (typeof matcher === "object" && matcher !== null) {
    return (string) => {
      if (matcher.path === string)
        return true;
      if (matcher.recursive) {
        const relative4 = sysPath2.relative(matcher.path, string);
        if (!relative4) {
          return false;
        }
        return !relative4.startsWith("..") && !sysPath2.isAbsolute(relative4);
      }
      return false;
    };
  }
  return () => false;
}
function normalizePath(path2) {
  if (typeof path2 !== "string")
    throw new Error("string expected");
  path2 = sysPath2.normalize(path2);
  path2 = path2.replace(/\\/g, "/");
  let prepend = false;
  if (path2.startsWith("//"))
    prepend = true;
  const DOUBLE_SLASH_RE2 = /\/\//;
  while (path2.match(DOUBLE_SLASH_RE2))
    path2 = path2.replace(DOUBLE_SLASH_RE2, "/");
  if (prepend)
    path2 = "/" + path2;
  return path2;
}
function matchPatterns(patterns, testString, stats) {
  const path2 = normalizePath(testString);
  for (let index = 0;index < patterns.length; index++) {
    const pattern = patterns[index];
    if (pattern(path2, stats)) {
      return true;
    }
  }
  return false;
}
function anymatch(matchers, testString) {
  if (matchers == null) {
    throw new TypeError("anymatch: specify first argument");
  }
  const matchersArray = arrify(matchers);
  const patterns = matchersArray.map((matcher) => createPattern(matcher));
  if (testString == null) {
    return (testString2, stats) => {
      return matchPatterns(patterns, testString2, stats);
    };
  }
  return matchPatterns(patterns, testString);
}

class DirEntry {
  constructor(dir, removeWatcher) {
    this.path = dir;
    this._removeWatcher = removeWatcher;
    this.items = new Set;
  }
  add(item) {
    const { items } = this;
    if (!items)
      return;
    if (item !== ONE_DOT && item !== TWO_DOTS)
      items.add(item);
  }
  async remove(item) {
    const { items } = this;
    if (!items)
      return;
    items.delete(item);
    if (items.size > 0)
      return;
    const dir = this.path;
    try {
      await readdir3(dir);
    } catch (err) {
      if (this._removeWatcher) {
        this._removeWatcher(sysPath2.dirname(dir), sysPath2.basename(dir));
      }
    }
  }
  has(item) {
    const { items } = this;
    if (!items)
      return;
    return items.has(item);
  }
  getChildren() {
    const { items } = this;
    if (!items)
      return [];
    return [...items.values()];
  }
  dispose() {
    this.items.clear();
    this.path = "";
    this._removeWatcher = EMPTY_FN;
    this.items = EMPTY_SET;
    Object.freeze(this);
  }
}

class WatchHelper {
  constructor(path2, follow, fsw) {
    this.fsw = fsw;
    const watchPath = path2;
    this.path = path2 = path2.replace(REPLACER_RE, "");
    this.watchPath = watchPath;
    this.fullWatchPath = sysPath2.resolve(watchPath);
    this.dirParts = [];
    this.dirParts.forEach((parts) => {
      if (parts.length > 1)
        parts.pop();
    });
    this.followSymlinks = follow;
    this.statMethod = follow ? STAT_METHOD_F : STAT_METHOD_L;
  }
  entryPath(entry) {
    return sysPath2.join(this.watchPath, sysPath2.relative(this.watchPath, entry.fullPath));
  }
  filterPath(entry) {
    const { stats } = entry;
    if (stats && stats.isSymbolicLink())
      return this.filterDir(entry);
    const resolvedPath = this.entryPath(entry);
    return this.fsw._isntIgnored(resolvedPath, stats) && this.fsw._hasReadPermissions(stats);
  }
  filterDir(entry) {
    return this.fsw._isntIgnored(this.entryPath(entry), entry.stats);
  }
}
function watch(paths, options = {}) {
  const watcher = new FSWatcher(options);
  watcher.add(paths);
  return watcher;
}
var SLASH = "/", SLASH_SLASH = "//", ONE_DOT = ".", TWO_DOTS = "..", STRING_TYPE = "string", BACK_SLASH_RE, DOUBLE_SLASH_RE, DOT_RE, REPLACER_RE, isMatcherObject = (matcher) => typeof matcher === "object" && matcher !== null && !(matcher instanceof RegExp), unifyPaths = (paths_) => {
  const paths = arrify(paths_).flat();
  if (!paths.every((p) => typeof p === STRING_TYPE)) {
    throw new TypeError(`Non-string provided as watch path: ${paths}`);
  }
  return paths.map(normalizePathToUnix);
}, toUnix = (string) => {
  let str = string.replace(BACK_SLASH_RE, SLASH);
  let prepend = false;
  if (str.startsWith(SLASH_SLASH)) {
    prepend = true;
  }
  while (str.match(DOUBLE_SLASH_RE)) {
    str = str.replace(DOUBLE_SLASH_RE, SLASH);
  }
  if (prepend) {
    str = SLASH + str;
  }
  return str;
}, normalizePathToUnix = (path2) => toUnix(sysPath2.normalize(toUnix(path2))), normalizeIgnored = (cwd = "") => (path2) => {
  if (typeof path2 === "string") {
    return normalizePathToUnix(sysPath2.isAbsolute(path2) ? path2 : sysPath2.join(cwd, path2));
  } else {
    return path2;
  }
}, getAbsolutePath = (path2, cwd) => {
  if (sysPath2.isAbsolute(path2)) {
    return path2;
  }
  return sysPath2.join(cwd, path2);
}, EMPTY_SET, STAT_METHOD_F = "stat", STAT_METHOD_L = "lstat", FSWatcher, esm_default;
var init_esm2 = __esm(() => {
  init_esm();
  init_handler();
  /*! chokidar - MIT License (c) 2012 Paul Miller (paulmillr.com) */
  BACK_SLASH_RE = /\\/g;
  DOUBLE_SLASH_RE = /\/\//;
  DOT_RE = /\..*\.(sw[px])$|~$|\.subl.*\.tmp/;
  REPLACER_RE = /^\.[/\\]/;
  EMPTY_SET = Object.freeze(new Set);
  FSWatcher = class FSWatcher extends EventEmitter {
    constructor(_opts = {}) {
      super();
      this.closed = false;
      this._closers = new Map;
      this._ignoredPaths = new Set;
      this._throttled = new Map;
      this._streams = new Set;
      this._symlinkPaths = new Map;
      this._watched = new Map;
      this._pendingWrites = new Map;
      this._pendingUnlinks = new Map;
      this._readyCount = 0;
      this._readyEmitted = false;
      const awf = _opts.awaitWriteFinish;
      const DEF_AWF = { stabilityThreshold: 2000, pollInterval: 100 };
      const opts = {
        persistent: true,
        ignoreInitial: false,
        ignorePermissionErrors: false,
        interval: 100,
        binaryInterval: 300,
        followSymlinks: true,
        usePolling: false,
        atomic: true,
        ..._opts,
        ignored: _opts.ignored ? arrify(_opts.ignored) : arrify([]),
        awaitWriteFinish: awf === true ? DEF_AWF : typeof awf === "object" ? { ...DEF_AWF, ...awf } : false
      };
      if (isIBMi)
        opts.usePolling = true;
      if (opts.atomic === undefined)
        opts.atomic = !opts.usePolling;
      const envPoll = process.env.CHOKIDAR_USEPOLLING;
      if (envPoll !== undefined) {
        const envLower = envPoll.toLowerCase();
        if (envLower === "false" || envLower === "0")
          opts.usePolling = false;
        else if (envLower === "true" || envLower === "1")
          opts.usePolling = true;
        else
          opts.usePolling = !!envLower;
      }
      const envInterval = process.env.CHOKIDAR_INTERVAL;
      if (envInterval)
        opts.interval = Number.parseInt(envInterval, 10);
      let readyCalls = 0;
      this._emitReady = () => {
        readyCalls++;
        if (readyCalls >= this._readyCount) {
          this._emitReady = EMPTY_FN;
          this._readyEmitted = true;
          process.nextTick(() => this.emit(EVENTS.READY));
        }
      };
      this._emitRaw = (...args) => this.emit(EVENTS.RAW, ...args);
      this._boundRemove = this._remove.bind(this);
      this.options = opts;
      this._nodeFsHandler = new NodeFsHandler(this);
      Object.freeze(opts);
    }
    _addIgnoredPath(matcher) {
      if (isMatcherObject(matcher)) {
        for (const ignored of this._ignoredPaths) {
          if (isMatcherObject(ignored) && ignored.path === matcher.path && ignored.recursive === matcher.recursive) {
            return;
          }
        }
      }
      this._ignoredPaths.add(matcher);
    }
    _removeIgnoredPath(matcher) {
      this._ignoredPaths.delete(matcher);
      if (typeof matcher === "string") {
        for (const ignored of this._ignoredPaths) {
          if (isMatcherObject(ignored) && ignored.path === matcher) {
            this._ignoredPaths.delete(ignored);
          }
        }
      }
    }
    add(paths_, _origAdd, _internal) {
      const { cwd } = this.options;
      this.closed = false;
      this._closePromise = undefined;
      let paths = unifyPaths(paths_);
      if (cwd) {
        paths = paths.map((path2) => {
          const absPath = getAbsolutePath(path2, cwd);
          return absPath;
        });
      }
      paths.forEach((path2) => {
        this._removeIgnoredPath(path2);
      });
      this._userIgnored = undefined;
      if (!this._readyCount)
        this._readyCount = 0;
      this._readyCount += paths.length;
      Promise.all(paths.map(async (path2) => {
        const res = await this._nodeFsHandler._addToNodeFs(path2, !_internal, undefined, 0, _origAdd);
        if (res)
          this._emitReady();
        return res;
      })).then((results) => {
        if (this.closed)
          return;
        results.forEach((item) => {
          if (item)
            this.add(sysPath2.dirname(item), sysPath2.basename(_origAdd || item));
        });
      });
      return this;
    }
    unwatch(paths_) {
      if (this.closed)
        return this;
      const paths = unifyPaths(paths_);
      const { cwd } = this.options;
      paths.forEach((path2) => {
        if (!sysPath2.isAbsolute(path2) && !this._closers.has(path2)) {
          if (cwd)
            path2 = sysPath2.join(cwd, path2);
          path2 = sysPath2.resolve(path2);
        }
        this._closePath(path2);
        this._addIgnoredPath(path2);
        if (this._watched.has(path2)) {
          this._addIgnoredPath({
            path: path2,
            recursive: true
          });
        }
        this._userIgnored = undefined;
      });
      return this;
    }
    close() {
      if (this._closePromise) {
        return this._closePromise;
      }
      this.closed = true;
      this.removeAllListeners();
      const closers = [];
      this._closers.forEach((closerList) => closerList.forEach((closer) => {
        const promise = closer();
        if (promise instanceof Promise)
          closers.push(promise);
      }));
      this._streams.forEach((stream) => stream.destroy());
      this._userIgnored = undefined;
      this._readyCount = 0;
      this._readyEmitted = false;
      this._watched.forEach((dirent) => dirent.dispose());
      this._closers.clear();
      this._watched.clear();
      this._streams.clear();
      this._symlinkPaths.clear();
      this._throttled.clear();
      this._closePromise = closers.length ? Promise.all(closers).then(() => {
        return;
      }) : Promise.resolve();
      return this._closePromise;
    }
    getWatched() {
      const watchList = {};
      this._watched.forEach((entry, dir) => {
        const key = this.options.cwd ? sysPath2.relative(this.options.cwd, dir) : dir;
        const index = key || ONE_DOT;
        watchList[index] = entry.getChildren().sort();
      });
      return watchList;
    }
    emitWithAll(event, args) {
      this.emit(event, ...args);
      if (event !== EVENTS.ERROR)
        this.emit(EVENTS.ALL, event, ...args);
    }
    async _emit(event, path2, stats) {
      if (this.closed)
        return;
      const opts = this.options;
      if (isWindows)
        path2 = sysPath2.normalize(path2);
      if (opts.cwd)
        path2 = sysPath2.relative(opts.cwd, path2);
      const args = [path2];
      if (stats != null)
        args.push(stats);
      const awf = opts.awaitWriteFinish;
      let pw;
      if (awf && (pw = this._pendingWrites.get(path2))) {
        pw.lastChange = new Date;
        return this;
      }
      if (opts.atomic) {
        if (event === EVENTS.UNLINK) {
          this._pendingUnlinks.set(path2, [event, ...args]);
          setTimeout(() => {
            this._pendingUnlinks.forEach((entry, path3) => {
              this.emit(...entry);
              this.emit(EVENTS.ALL, ...entry);
              this._pendingUnlinks.delete(path3);
            });
          }, typeof opts.atomic === "number" ? opts.atomic : 100);
          return this;
        }
        if (event === EVENTS.ADD && this._pendingUnlinks.has(path2)) {
          event = EVENTS.CHANGE;
          this._pendingUnlinks.delete(path2);
        }
      }
      if (awf && (event === EVENTS.ADD || event === EVENTS.CHANGE) && this._readyEmitted) {
        const awfEmit = (err, stats2) => {
          if (err) {
            event = EVENTS.ERROR;
            args[0] = err;
            this.emitWithAll(event, args);
          } else if (stats2) {
            if (args.length > 1) {
              args[1] = stats2;
            } else {
              args.push(stats2);
            }
            this.emitWithAll(event, args);
          }
        };
        this._awaitWriteFinish(path2, awf.stabilityThreshold, event, awfEmit);
        return this;
      }
      if (event === EVENTS.CHANGE) {
        const isThrottled = !this._throttle(EVENTS.CHANGE, path2, 50);
        if (isThrottled)
          return this;
      }
      if (opts.alwaysStat && stats === undefined && (event === EVENTS.ADD || event === EVENTS.ADD_DIR || event === EVENTS.CHANGE)) {
        const fullPath = opts.cwd ? sysPath2.join(opts.cwd, path2) : path2;
        let stats2;
        try {
          stats2 = await stat4(fullPath);
        } catch (err) {}
        if (!stats2 || this.closed)
          return;
        args.push(stats2);
      }
      this.emitWithAll(event, args);
      return this;
    }
    _handleError(error) {
      const code = error && error.code;
      if (error && code !== "ENOENT" && code !== "ENOTDIR" && (!this.options.ignorePermissionErrors || code !== "EPERM" && code !== "EACCES")) {
        this.emit(EVENTS.ERROR, error);
      }
      return error || this.closed;
    }
    _throttle(actionType, path2, timeout) {
      if (!this._throttled.has(actionType)) {
        this._throttled.set(actionType, new Map);
      }
      const action = this._throttled.get(actionType);
      if (!action)
        throw new Error("invalid throttle");
      const actionPath = action.get(path2);
      if (actionPath) {
        actionPath.count++;
        return false;
      }
      let timeoutObject;
      const clear = () => {
        const item = action.get(path2);
        const count = item ? item.count : 0;
        action.delete(path2);
        clearTimeout(timeoutObject);
        if (item)
          clearTimeout(item.timeoutObject);
        return count;
      };
      timeoutObject = setTimeout(clear, timeout);
      const thr = { timeoutObject, clear, count: 0 };
      action.set(path2, thr);
      return thr;
    }
    _incrReadyCount() {
      return this._readyCount++;
    }
    _awaitWriteFinish(path2, threshold, event, awfEmit) {
      const awf = this.options.awaitWriteFinish;
      if (typeof awf !== "object")
        return;
      const pollInterval = awf.pollInterval;
      let timeoutHandler;
      let fullPath = path2;
      if (this.options.cwd && !sysPath2.isAbsolute(path2)) {
        fullPath = sysPath2.join(this.options.cwd, path2);
      }
      const now = new Date;
      const writes = this._pendingWrites;
      function awaitWriteFinishFn(prevStat) {
        statcb(fullPath, (err, curStat) => {
          if (err || !writes.has(path2)) {
            if (err && err.code !== "ENOENT")
              awfEmit(err);
            return;
          }
          const now2 = Number(new Date);
          if (prevStat && curStat.size !== prevStat.size) {
            writes.get(path2).lastChange = now2;
          }
          const pw = writes.get(path2);
          const df = now2 - pw.lastChange;
          if (df >= threshold) {
            writes.delete(path2);
            awfEmit(undefined, curStat);
          } else {
            timeoutHandler = setTimeout(awaitWriteFinishFn, pollInterval, curStat);
          }
        });
      }
      if (!writes.has(path2)) {
        writes.set(path2, {
          lastChange: now,
          cancelWait: () => {
            writes.delete(path2);
            clearTimeout(timeoutHandler);
            return event;
          }
        });
        timeoutHandler = setTimeout(awaitWriteFinishFn, pollInterval);
      }
    }
    _isIgnored(path2, stats) {
      if (this.options.atomic && DOT_RE.test(path2))
        return true;
      if (!this._userIgnored) {
        const { cwd } = this.options;
        const ign = this.options.ignored;
        const ignored = (ign || []).map(normalizeIgnored(cwd));
        const ignoredPaths = [...this._ignoredPaths];
        const list = [...ignoredPaths.map(normalizeIgnored(cwd)), ...ignored];
        this._userIgnored = anymatch(list, undefined);
      }
      return this._userIgnored(path2, stats);
    }
    _isntIgnored(path2, stat5) {
      return !this._isIgnored(path2, stat5);
    }
    _getWatchHelpers(path2) {
      return new WatchHelper(path2, this.options.followSymlinks, this);
    }
    _getWatchedDir(directory) {
      const dir = sysPath2.resolve(directory);
      if (!this._watched.has(dir))
        this._watched.set(dir, new DirEntry(dir, this._boundRemove));
      return this._watched.get(dir);
    }
    _hasReadPermissions(stats) {
      if (this.options.ignorePermissionErrors)
        return true;
      return Boolean(Number(stats.mode) & 256);
    }
    _remove(directory, item, isDirectory) {
      const path2 = sysPath2.join(directory, item);
      const fullPath = sysPath2.resolve(path2);
      isDirectory = isDirectory != null ? isDirectory : this._watched.has(path2) || this._watched.has(fullPath);
      if (!this._throttle("remove", path2, 100))
        return;
      if (!isDirectory && this._watched.size === 1) {
        this.add(directory, item, true);
      }
      const wp = this._getWatchedDir(path2);
      const nestedDirectoryChildren = wp.getChildren();
      nestedDirectoryChildren.forEach((nested) => this._remove(path2, nested));
      const parent = this._getWatchedDir(directory);
      const wasTracked = parent.has(item);
      parent.remove(item);
      if (this._symlinkPaths.has(fullPath)) {
        this._symlinkPaths.delete(fullPath);
      }
      let relPath = path2;
      if (this.options.cwd)
        relPath = sysPath2.relative(this.options.cwd, path2);
      if (this.options.awaitWriteFinish && this._pendingWrites.has(relPath)) {
        const event = this._pendingWrites.get(relPath).cancelWait();
        if (event === EVENTS.ADD)
          return;
      }
      this._watched.delete(path2);
      this._watched.delete(fullPath);
      const eventName = isDirectory ? EVENTS.UNLINK_DIR : EVENTS.UNLINK;
      if (wasTracked && !this._isIgnored(path2))
        this._emit(eventName, path2);
      this._closePath(path2);
    }
    _closePath(path2) {
      this._closeFile(path2);
      const dir = sysPath2.dirname(path2);
      this._getWatchedDir(dir).remove(sysPath2.basename(path2));
    }
    _closeFile(path2) {
      const closers = this._closers.get(path2);
      if (!closers)
        return;
      closers.forEach((closer) => closer());
      this._closers.delete(path2);
    }
    _addPathCloser(path2, closer) {
      if (!closer)
        return;
      let list = this._closers.get(path2);
      if (!list) {
        list = [];
        this._closers.set(path2, list);
      }
      list.push(closer);
    }
    _readdirp(root, opts) {
      if (this.closed)
        return;
      const options = { type: EVENTS.ALL, alwaysStat: true, lstat: true, ...opts, depth: 0 };
      let stream = readdirp(root, options);
      this._streams.add(stream);
      stream.once(STR_CLOSE, () => {
        stream = undefined;
      });
      stream.once(STR_END, () => {
        if (stream) {
          this._streams.delete(stream);
          stream = undefined;
        }
      });
      return stream;
    }
  };
  esm_default = { watch, FSWatcher };
});

export { esm_default, init_esm2 as init_esm, ripgrepCommand, ripGrep, getRipgrepStatus, init_ripgrep, getEmbeddingModel, indexPath, loadIndex, buildOrUpdateIndex, searchCode, init_indexer, impactOf, dependenciesOf, whereDefined, graphSearch, graphPath, buildCodeGraph, loadGraph, formatGraphStats, init_graph, buildRepoIndex, repoIndexPath, loadRepoIndex, loadSymbolIndex, loadCallIndex, loadTestIndex, loadDocIndex, loadConfigIndex, repoSearch, symbolSearch, findCallers, findTestsForFile, docSearch, formatRepoStats, init_repoIndex, isCodeIndexEnabled, init_codeIndex };
