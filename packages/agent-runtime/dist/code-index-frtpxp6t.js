import {
  buildCodeGraph,
  buildOrUpdateIndex,
  buildRepoIndex,
  dependenciesOf,
  docSearch,
  esm_default,
  findCallers,
  findTestsForFile,
  formatGraphStats,
  formatRepoStats,
  getEmbeddingModel,
  graphPath,
  graphSearch,
  impactOf,
  indexPath,
  init_codeIndex,
  init_esm,
  init_graph,
  init_indexer,
  init_repoIndex,
  loadCallIndex,
  loadConfigIndex,
  loadDocIndex,
  loadGraph,
  loadIndex,
  loadRepoIndex,
  loadSymbolIndex,
  loadTestIndex,
  repoIndexPath,
  repoSearch,
  searchCode,
  symbolSearch,
  whereDefined
} from "./index-cqtb7hz4.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-ke69cyc7.js";
import"./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import"./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import"./index-a9y6sg4d.js";
import"./index-dsy9thtk.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import {
  init_cleanupRegistry,
  init_debug,
  logForDebugging,
  registerCleanup
} from "./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/utils/codeIndex/watchPaths.ts
import { extname, relative, sep } from "node:path";
function toPosix(path) {
  return sep === "\\" ? path.replaceAll("\\", "/") : path;
}
function isCodeIndexWatchable(root, path) {
  const rel = toPosix(relative(root, path));
  if (!rel || rel.startsWith(".."))
    return false;
  const segments = rel.split("/");
  if (segments.some((segment) => SKIP_SEGMENTS.has(segment)))
    return false;
  if (rel.endsWith(".min.js") || rel.endsWith(".min.css"))
    return false;
  if (rel.endsWith(".lock") || rel.endsWith("lock.json"))
    return false;
  return WATCH_EXTENSIONS.has(extname(rel).toLowerCase());
}
function shouldIgnoreWatchPath(root, path) {
  const rel = toPosix(relative(root, path));
  if (!rel || rel.startsWith(".."))
    return false;
  const segments = rel.split("/");
  if (segments.some((segment) => SKIP_SEGMENTS.has(segment)))
    return true;
  const ext = extname(rel).toLowerCase();
  if (!ext)
    return false;
  return !isCodeIndexWatchable(root, path);
}
var WATCH_EXTENSIONS, SKIP_SEGMENTS;
var init_watchPaths = __esm(() => {
  WATCH_EXTENSIONS = new Set([
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
  SKIP_SEGMENTS = new Set(["node_modules", ".git", "dist", "build", ".ur"]);
});

// ../../src/utils/codeIndex/watcher.ts
async function rebuild(options) {
  if (running) {
    rerun = true;
    return;
  }
  running = true;
  try {
    const signal = new AbortController().signal;
    const { stats } = await buildOrUpdateIndex({ root: options.root, signal });
    if (options.graph)
      await buildCodeGraph({ root: options.root, signal });
    if (options.repo) {
      const repoStats = await buildRepoIndex({ root: options.root, signal });
      options.onStatus?.(`repo-index refreshed: ${repoStats.repo.files.length} files, ${repoStats.symbols.symbols.length} symbols`);
    }
    options.onStatus?.(`code-index refreshed: ${stats.filesIndexed} files, ${stats.chunksEmbedded} embedded`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    options.onError?.(message);
    logForDebugging(`code-index watcher failed: ${message}`, { level: "error" });
  } finally {
    running = false;
    if (rerun) {
      rerun = false;
      rebuild(options);
    }
  }
}
function schedule(options) {
  if (activeTimer)
    clearTimeout(activeTimer);
  activeTimer = setTimeout(() => {
    activeTimer = null;
    rebuild(options);
  }, options.debounceMs ?? 2000);
  activeTimer.unref?.();
}
function startCodeIndexWatcher(options) {
  if (activeWatcher && activeRoot === options.root) {
    return { close: closeCodeIndexWatcher };
  }
  closeCodeIndexWatcher();
  activeRoot = options.root;
  activeWatcher = esm_default.watch(options.root, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 200 },
    ignored: (path) => shouldIgnoreWatchPath(options.root, path),
    ignorePermissionErrors: true
  });
  activeWatcher.on("add", (path) => {
    options.onStatus?.(`code-index change: ${path}`);
    schedule(options);
  });
  activeWatcher.on("change", (path) => {
    options.onStatus?.(`code-index change: ${path}`);
    schedule(options);
  });
  activeWatcher.on("unlink", (path) => {
    options.onStatus?.(`code-index removed: ${path}`);
    schedule(options);
  });
  activeWatcher.on("error", (error) => {
    const message = error instanceof Error ? error.message : String(error);
    options.onError?.(message);
  });
  registerCleanup(closeCodeIndexWatcher);
  rebuild(options);
  return { close: closeCodeIndexWatcher };
}
async function closeCodeIndexWatcher() {
  if (activeTimer) {
    clearTimeout(activeTimer);
    activeTimer = null;
  }
  const watcher = activeWatcher;
  activeWatcher = null;
  activeRoot = null;
  if (watcher)
    await watcher.close();
}
var activeWatcher = null, activeRoot = null, activeTimer = null, running = false, rerun = false;
var init_watcher = __esm(() => {
  init_esm();
  init_cleanupRegistry();
  init_debug();
  init_graph();
  init_indexer();
  init_repoIndex();
  init_watchPaths();
  init_watchPaths();
});

// ../../src/commands/code-index/code-index.ts
function errorText(error) {
  return error instanceof Error ? error.message : String(error);
}
async function graphCommand(tokens, root, json, signal) {
  const sub = tokens.filter((t) => !t.startsWith("--") && t !== "graph")[0] ?? "stats";
  const arg = tokens.filter((t) => !t.startsWith("--") && t !== "graph" && t !== sub).join(" ");
  if (sub === "build") {
    const graph2 = await buildCodeGraph({ root, signal });
    return {
      type: "text",
      value: json ? JSON.stringify({ files: graph2.files.length }, null, 2) : formatGraphStats(graph2)
    };
  }
  const graph = loadGraph(root);
  if (!graph) {
    return {
      type: "text",
      value: "No code graph found. Build it first with `ur code-index graph build`."
    };
  }
  if (sub === "stats") {
    return { type: "text", value: json ? JSON.stringify(graph, null, 2) : formatGraphStats(graph) };
  }
  if (sub === "impact" || sub === "deps") {
    if (!arg)
      return { type: "text", value: `Usage: ur code-index graph ${sub} <file>` };
    const result = sub === "impact" ? impactOf(graph, arg) : dependenciesOf(graph, arg);
    if (json)
      return { type: "text", value: JSON.stringify({ file: arg, [sub]: result }, null, 2) };
    const label = sub === "impact" ? "Impacted by changes to" : "Dependencies of";
    return {
      type: "text",
      value: result.length ? `${label} ${arg} (${result.length}):
${result.map((f) => `  ${f}`).join(`
`)}` : `${label} ${arg}: none (or file not in graph).`
    };
  }
  if (sub === "where") {
    if (!arg)
      return { type: "text", value: "Usage: ur code-index graph where <symbol>" };
    const files = whereDefined(graph, arg);
    if (json)
      return { type: "text", value: JSON.stringify({ symbol: arg, files }, null, 2) };
    return {
      type: "text",
      value: files.length ? `${arg} defined in:
${files.map((f) => `  ${f}`).join(`
`)}` : `Symbol not found in graph: ${arg}`
    };
  }
  if (sub === "search") {
    if (!arg)
      return { type: "text", value: "Usage: ur code-index graph search <query>" };
    const hits = graphSearch(graph, arg);
    if (json)
      return { type: "text", value: JSON.stringify({ hits }, null, 2) };
    return {
      type: "text",
      value: hits.length ? hits.map((h) => `  ${h.file}  (${h.reason}, score ${h.degree})`).join(`
`) : "No structural matches."
    };
  }
  return {
    type: "text",
    value: "Usage: ur code-index graph build|stats|impact <file>|deps <file>|where <symbol>|search <query>"
  };
}
async function repoCommand(tokens, root, json, signal) {
  const sub = tokens.filter((t) => !t.startsWith("--") && t !== "repo")[0] ?? "status";
  const arg = tokens.filter((t) => !t.startsWith("--") && t !== "repo" && t !== sub).join(" ");
  if (sub === "build") {
    const { repo: repo2 } = await buildRepoIndex({ root, signal });
    return {
      type: "text",
      value: json ? JSON.stringify({ files: repo2.files.length, path: repoIndexPath(root) }, null, 2) : `Built repo index at ${repoIndexPath(root)}
${formatRepoStats(repo2)}`
    };
  }
  const repo = loadRepoIndex(root);
  if (!repo) {
    return {
      type: "text",
      value: "No repo index found. Build it first with `ur code-index repo build`."
    };
  }
  if (sub === "status") {
    return {
      type: "text",
      value: json ? JSON.stringify({
        builtAt: repo.builtAt,
        files: repo.files.length,
        path: repoIndexPath(root)
      }, null, 2) : formatRepoStats(repo)
    };
  }
  if (sub === "search") {
    if (!arg)
      return { type: "text", value: "Usage: ur code-index repo search <query>" };
    const hits = repoSearch(repo, arg);
    if (json)
      return { type: "text", value: JSON.stringify({ hits }, null, 2) };
    return {
      type: "text",
      value: hits.length ? hits.map((h) => `  ${h.path} (${h.kind})${h.symbols ? ` [${h.symbols.slice(0, 5).join(", ")}${h.symbols.length > 5 ? "..." : ""}]` : ""}`).join(`
`) : "No repo matches."
    };
  }
  if (sub === "symbols") {
    if (!arg)
      return { type: "text", value: "Usage: ur code-index repo symbols <query>" };
    const symbols = loadSymbolIndex(root);
    if (!symbols)
      return { type: "text", value: "No symbol index found." };
    const hits = symbolSearch(symbols, arg);
    if (json)
      return { type: "text", value: JSON.stringify({ hits }, null, 2) };
    return {
      type: "text",
      value: hits.length ? hits.map((s) => `  ${s.name} (${s.kind}) ${s.file}${s.line ? `:${s.line}` : ""}`).join(`
`) : "No symbol matches."
    };
  }
  if (sub === "callers") {
    if (!arg)
      return { type: "text", value: "Usage: ur code-index repo callers <symbol>" };
    const calls = loadCallIndex(root);
    if (!calls)
      return { type: "text", value: "No call index found." };
    const hits = findCallers(calls, arg);
    if (json)
      return { type: "text", value: JSON.stringify({ hits }, null, 2) };
    return {
      type: "text",
      value: hits.length ? hits.map((c) => `  ${c.caller} -> ${c.callee} in ${c.file}${c.line ? `:${c.line}` : ""}`).join(`
`) : `No callers found for ${arg}.`
    };
  }
  if (sub === "tests") {
    if (!arg)
      return { type: "text", value: "Usage: ur code-index repo tests <file>" };
    const tests = loadTestIndex(root);
    if (!tests)
      return { type: "text", value: "No test index found." };
    const hits = findTestsForFile(tests, arg);
    if (json)
      return { type: "text", value: JSON.stringify({ hits }, null, 2) };
    return {
      type: "text",
      value: hits.length ? hits.map((t) => `  ${t.file}${t.name ? ` — ${t.name}` : ""}`).join(`
`) : `No tests found for ${arg}.`
    };
  }
  if (sub === "docs") {
    if (!arg)
      return { type: "text", value: "Usage: ur code-index repo docs <query>" };
    const docs = loadDocIndex(root);
    if (!docs)
      return { type: "text", value: "No doc index found." };
    const hits = docSearch(docs, arg);
    if (json)
      return { type: "text", value: JSON.stringify({ hits }, null, 2) };
    return {
      type: "text",
      value: hits.length ? hits.map((d) => `  ${d.path}${d.title ? ` — ${d.title}` : ""}`).join(`
`) : "No doc matches."
    };
  }
  if (sub === "configs") {
    if (!arg)
      return { type: "text", value: "Usage: ur code-index repo configs <query>" };
    const configs = loadConfigIndex(root);
    if (!configs)
      return { type: "text", value: "No config index found." };
    const q = arg.toLowerCase();
    const hits = configs.configs.filter((c) => c.path.toLowerCase().includes(q) || c.kind.toLowerCase().includes(q) || c.keys?.some((k) => k.toLowerCase().includes(q)));
    if (json)
      return { type: "text", value: JSON.stringify({ hits }, null, 2) };
    return {
      type: "text",
      value: hits.length ? hits.map((c) => `  ${c.path} (${c.kind})${c.keys ? ` [${c.keys.slice(0, 5).join(", ")}${c.keys.length > 5 ? "..." : ""}]` : ""}`).join(`
`) : "No config matches."
    };
  }
  return {
    type: "text",
    value: "Usage: ur code-index repo build|status|search <query>|symbols <query>|callers <symbol>|tests <file>|docs <query>|configs <query> [--json]"
  };
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const command = tokens.find((token) => !token.startsWith("--")) ?? "status";
  const root = getCwd();
  const signal = new AbortController().signal;
  if (command === "graph") {
    return graphCommand(tokens, root, json, signal);
  }
  if (command === "repo") {
    return repoCommand(tokens, root, json, signal);
  }
  if (command === "build") {
    try {
      const { stats } = await buildOrUpdateIndex({ root, signal });
      let graphLine = "";
      if (tokens.includes("--graph")) {
        const graph = await buildCodeGraph({ root, signal });
        graphLine = `
  graph:    ${graph.files.length} files at ${graphPath(root)}`;
      }
      let repoLine = "";
      if (tokens.includes("--repo")) {
        const repoStats = await buildRepoIndex({ root, signal });
        repoLine = `
  repo:     ${repoStats.repo.files.length} files, ${repoStats.symbols.symbols.length} symbols at ${repoIndexPath(root)}`;
      }
      if (json) {
        return { type: "text", value: JSON.stringify(stats, null, 2) };
      }
      return {
        type: "text",
        value: `Built code index at ${indexPath(root)}
` + `  model:    ${stats.model} (dim ${stats.dim})
` + `  files:    ${stats.filesIndexed} indexed, ${stats.filesSkipped} skipped, ${stats.filesRemoved} removed
` + `  chunks:   ${stats.chunksTotal} total, ${stats.chunksEmbedded} (re)embedded
` + `  ${stats.reused ? "incremental update" : "full build"}` + graphLine + repoLine
      };
    } catch (error) {
      return {
        type: "text",
        value: `Failed to build code index: ${errorText(error)}
` + `Tip: make sure the local Ollama app is running and the embedding model is pulled ` + `(e.g. \`ollama pull ${getEmbeddingModel()}\`).`
      };
    }
  }
  if (command === "watch") {
    if (tokens.includes("--dry-run")) {
      return {
        type: "text",
        value: json ? JSON.stringify({ watching: root, graph: tokens.includes("--graph"), dryRun: true }, null, 2) : `Would watch ${root} and refresh the local code index on source changes.`
      };
    }
    const handle = startCodeIndexWatcher({
      root,
      graph: tokens.includes("--graph"),
      repo: tokens.includes("--repo"),
      onStatus: (message) => process.stderr.write(`${message}
`),
      onError: (message) => process.stderr.write(`code-index watcher error: ${message}
`)
    });
    process.stderr.write(`Watching ${root} for code-index changes. Press Ctrl+C to stop.
`);
    await new Promise((resolve) => {
      const stop = () => {
        handle.close().then(resolve);
      };
      process.once("SIGINT", stop);
      process.once("SIGTERM", stop);
    });
    return { type: "text", value: "Stopped code-index watcher." };
  }
  if (command === "status") {
    const index = await loadIndex(root);
    const status = index ? {
      builtAt: index.builtAt,
      model: index.model,
      dim: index.dim,
      files: Object.keys(index.files).length,
      chunks: Object.keys(index.chunks).length,
      path: indexPath(root)
    } : { missing: true, path: indexPath(root), model: getEmbeddingModel() };
    return { type: "text", value: JSON.stringify(status, null, 2) };
  }
  if (command === "search") {
    const query = tokens.filter((token) => !token.startsWith("--") && token !== "search").join(" ");
    if (!query) {
      return { type: "text", value: "Usage: ur code-index search <query> [--json]" };
    }
    try {
      const { hits, index } = await searchCode({ root, query, signal });
      if (!index) {
        return {
          type: "text",
          value: "No code index found. Build it first with `ur code-index build`."
        };
      }
      if (json) {
        return { type: "text", value: JSON.stringify({ hits }, null, 2) };
      }
      if (hits.length === 0) {
        return { type: "text", value: "No semantically similar code found." };
      }
      return {
        type: "text",
        value: hits.map((hit) => `${hit.file}:${hit.startLine}-${hit.endLine} (score ${hit.score.toFixed(3)})
${hit.preview}`).join(`

`)
      };
    } catch (error) {
      return {
        type: "text",
        value: `Code search failed: ${errorText(error)}
` + `Tip: ensure the local Ollama app is running and "${getEmbeddingModel()}" is pulled.`
      };
    }
  }
  return {
    type: "text",
    value: "Usage: ur code-index build [--graph] [--repo] | search <query> | status | " + "watch [--graph] [--repo] | graph build|impact <file>|deps <file>|where <symbol>|search <query> | " + "repo build|status|search <query>|symbols <query>|callers <symbol>|tests <file>|docs <query>|configs <query> [--json]"
  };
};
var init_code_index = __esm(() => {
  init_codeIndex();
  init_watcher();
  init_argumentSubstitution();
  init_cwd();
});
init_code_index();

export {
  call
};
