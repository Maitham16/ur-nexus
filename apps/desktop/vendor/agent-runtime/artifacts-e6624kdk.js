import {
  appendBackgroundFeedback,
  init_backgroundRunner
} from "./index-zxm9dac1.js";
import"./index-kw2wxbby.js";
import"./index-fayv8cwb.js";
import"./index-j4g1j45r.js";
import {
  addFeedback,
  captureDiff,
  captureTestRun,
  deleteArtifact,
  formatArtifact,
  formatArtifactList,
  getArtifact,
  getWorkingDiff,
  init_artifacts,
  listArtifacts,
  readArtifactBody,
  recordArtifact,
  setStatus
} from "./index-qg6cjfb3.js";
import"./index-5jrgxedg.js";
import"./index-hp4vvv8v.js";
import"./index-zn5x3nwj.js";
import {
  escapeXmlAttr,
  init_xml
} from "./index-ked7nkp4.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import"./index-bdfn6xh6.js";
import"./index-60smdz72.js";
import"./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import"./index-z5aeypvg.js";
import"./index-5jmh1e0k.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-wxsgjqjk.js";
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
import {
  getIsNonInteractiveSession,
  init_state
} from "./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/artifactsServer.ts
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { createRequire } from "node:module";
function loadAsset(path) {
  if (assetCache.has(path))
    return assetCache.get(path) ?? null;
  let content = null;
  const entry = ASSET_SPECS[path];
  if (entry) {
    try {
      content = readFileSync(createRequire(import.meta.url).resolve(entry.spec), "utf-8");
    } catch {
      content = null;
    }
  }
  assetCache.set(path, content);
  return content;
}
function page(title, body, head = "") {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeXmlAttr(title)}</title>${head}
<style>
  :root { color-scheme: light dark; }
  body { font-family: ui-sans-serif, system-ui, sans-serif; max-width: 1200px; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
  a { color: #4078c0; text-decoration: none; }
  a:hover { text-decoration: underline; }
  table { border-collapse: collapse; width: 100%; }
  th, td { text-align: left; padding: .4rem .6rem; border-bottom: 1px solid #8884; }
  pre { background: #8881; padding: 1rem; border-radius: 6px; overflow-x: auto; }
  .badge { padding: .1rem .5rem; border-radius: 999px; color: #fff; font-size: .8rem; }
  .meta { color: #888; font-size: .9rem; }
  .feedback { border-left: 3px solid #8884; padding-left: .8rem; margin: .5rem 0; }
  .btn { display: inline-block; padding: .35rem .9rem; border: 1px solid #8886; border-radius: 6px; background: #8881; cursor: pointer; font-size: .9rem; color: inherit; }
  .btn:hover { background: #8882; }
  .toolbar { margin: .8rem 0; display: flex; gap: .5rem; align-items: center; }
</style>
</head>
<body>${body}</body>
</html>
`;
}
function badge(status) {
  return `<span class="badge" style="background:${STATUS_COLOR[status]}">${status}</span>`;
}
function jsString(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
function isDiffArtifact(artifact) {
  return artifact.kind === "diff" || (artifact.file?.endsWith(".patch") ?? false);
}
function renderDiffBlock(diff) {
  return `
<div class="toolbar" id="diff-toggle" style="display:none">
  <button class="btn" onclick="__drawDiff('side-by-side')">Side by side</button>
  <button class="btn" onclick="__drawDiff('line-by-line')">Inline</button>
</div>
<div id="diff-view"></div>
<pre id="diff-fallback">${escapeXmlAttr(diff)}</pre>
<script src="/assets/diff2html-ui.js"></script>
<script>
(function () {
  var diff = ${jsString(diff)};
  window.__drawDiff = function (fmt) {
    if (typeof Diff2HtmlUI === 'undefined' || !diff.trim()) return;
    var ui = new Diff2HtmlUI(document.getElementById('diff-view'), diff, {
      outputFormat: fmt,
      drawFileList: true,
      matching: 'lines',
      highlight: true,
      colorScheme: 'auto',
    });
    ui.draw();
    ui.highlightCode();
    document.getElementById('diff-fallback').style.display = 'none';
    document.getElementById('diff-toggle').style.display = 'flex';
  };
  window.__drawDiff('side-by-side');
})();
</script>`;
}
function renderArtifactList(artifacts) {
  const rows = artifacts.map((a) => `<tr><td><a href="/artifacts/${escapeXmlAttr(a.id)}">${escapeXmlAttr(a.id)}</a></td>` + `<td>${escapeXmlAttr(a.kind)}</td><td>${escapeXmlAttr(a.title)}</td>` + `<td>${badge(a.status)}</td><td>${escapeXmlAttr(a.summary ?? "")}</td></tr>`).join(`
`);
  const table = artifacts.length ? `<table><tr><th>ID</th><th>Kind</th><th>Title</th><th>Status</th><th>Summary</th></tr>${rows}</table>` : "<p>No artifacts yet. Capture one with <code>ur artifacts capture-diff</code> or <code>ur artifacts add ...</code>.</p>";
  return page("Artifacts", `<h1>Artifacts</h1><p><a class="btn" href="/diff">Current working-tree changes</a></p>${table}`);
}
function renderArtifactPage(artifact, body) {
  const feedback = artifact.feedback.map((f) => `<div class="feedback"><span class="meta">${escapeXmlAttr(f.at)}</span><br>${escapeXmlAttr(f.text)}</div>`).join(`
`);
  const diffView = body !== null && isDiffArtifact(artifact);
  const parts = [
    `<p><a href="/">&larr; all artifacts</a></p>`,
    `<h1>Artifact ${escapeXmlAttr(artifact.id)} <span class="meta">[${escapeXmlAttr(artifact.kind)}]</span> ${badge(artifact.status)}</h1>`,
    `<p><strong>${escapeXmlAttr(artifact.title)}</strong></p>`,
    artifact.summary ? `<p>${escapeXmlAttr(artifact.summary)}</p>` : "",
    `<p class="meta">created ${escapeXmlAttr(artifact.createdAt)} · updated ${escapeXmlAttr(artifact.updatedAt)}${artifact.file ? ` · <a href="/artifacts/${escapeXmlAttr(artifact.id)}/raw">raw</a>` : ""}</p>`,
    artifact.links?.claims?.length ? `<p class="meta">claims: ${artifact.links.claims.map(escapeXmlAttr).join(", ")}</p>` : "",
    feedback ? `<h2>Feedback</h2>${feedback}` : "",
    body !== null ? `<h2>Content</h2>${diffView ? renderDiffBlock(body) : `<pre>${escapeXmlAttr(body)}</pre>`}` : ""
  ];
  return page(`Artifact ${artifact.id} — ${artifact.title}`, parts.filter(Boolean).join(`
`), diffView ? DIFF_VIEWER_HEAD : "");
}
function renderLiveDiffPage(diff) {
  const hasDiff = diff.trim().length > 0;
  const content = hasDiff ? `${renderDiffBlock(diff)}
<script>
function __captureDiff() {
  fetch('/api/capture-diff', { method: 'POST' })
    .then(function (r) { return r.json() })
    .then(function (d) { if (d.id) location = '/artifacts/' + d.id; else alert(d.error || 'No changes to capture.') })
    .catch(function (e) { alert(String(e)) })
}
</script>` : "<p>No working-tree changes.</p>";
  const captureButton = hasDiff ? '<div class="toolbar"><button class="btn" onclick="__captureDiff()">Capture as artifact</button></div>' : "";
  return page("Working tree changes", `<p><a href="/">&larr; all artifacts</a></p><h1>Working tree changes</h1>${captureButton}${content}`, hasDiff ? DIFF_VIEWER_HEAD : "");
}
function notFound(id) {
  return page("Artifact not found", `<h1>Artifact not found: ${escapeXmlAttr(id)}</h1><p><a href="/">&larr; all artifacts</a></p>`);
}
async function handleArtifactsRequest(cwd, url, exec) {
  const path = decodeURIComponent(new URL(url, "http://localhost").pathname).replace(/\/+$/, "") || "/";
  if (path.startsWith("/assets/")) {
    const entry = ASSET_SPECS[path];
    const content = loadAsset(path);
    return content !== null && entry ? { status: 200, type: entry.type, body: content } : { status: 404, type: "text/plain", body: `Asset not found: ${path}` };
  }
  if (path === "/" || path === "/artifacts") {
    return { status: 200, type: "text/html", body: renderArtifactList(listArtifacts(cwd)) };
  }
  if (path === "/diff") {
    return { status: 200, type: "text/html", body: renderLiveDiffPage(await getWorkingDiff(cwd, exec)) };
  }
  if (path === "/api/diff") {
    return { status: 200, type: "text/plain", body: await getWorkingDiff(cwd, exec) };
  }
  if (path === "/api/artifacts") {
    return { status: 200, type: "application/json", body: JSON.stringify({ artifacts: listArtifacts(cwd) }, null, 2) };
  }
  let match = path.match(/^\/api\/artifacts\/([^/]+)$/);
  if (match) {
    const artifact = getArtifact(cwd, match[1]);
    return artifact ? { status: 200, type: "application/json", body: JSON.stringify(artifact, null, 2) } : { status: 404, type: "application/json", body: JSON.stringify({ error: `Artifact not found: ${match[1]}` }) };
  }
  match = path.match(/^\/artifacts\/([^/]+)\/raw$/);
  if (match) {
    const body = readArtifactBody(cwd, match[1]);
    return body !== null ? { status: 200, type: "text/plain", body } : { status: 404, type: "text/plain", body: `Artifact body not found: ${match[1]}` };
  }
  match = path.match(/^\/(?:artifacts\/)?([^/]+)$/);
  if (match) {
    const artifact = getArtifact(cwd, match[1]);
    if (artifact) {
      return { status: 200, type: "text/html", body: renderArtifactPage(artifact, readArtifactBody(cwd, artifact.id)) };
    }
    return { status: 404, type: "text/html", body: notFound(match[1]) };
  }
  return { status: 404, type: "text/html", body: notFound(path) };
}
async function handleArtifactsPost(cwd, url, exec) {
  const path = new URL(url, "http://localhost").pathname.replace(/\/+$/, "");
  if (path === "/api/capture-diff") {
    const artifact = await captureDiff(cwd, "Working tree diff", exec);
    return artifact ? { status: 200, type: "application/json", body: JSON.stringify({ id: artifact.id }) } : { status: 200, type: "application/json", body: JSON.stringify({ error: "No working-tree changes to capture." }) };
  }
  return { status: 404, type: "application/json", body: JSON.stringify({ error: `Unknown endpoint: ${path}` }) };
}
function activeArtifactsServer() {
  return active ? { port: active.port, url: `http://${ARTIFACTS_HOST}:${active.port}` } : null;
}
function startArtifactsServer(cwd, port = 4180, exec) {
  if (active) {
    return Promise.resolve({ port: active.port, url: `http://${ARTIFACTS_HOST}:${active.port}`, alreadyRunning: true });
  }
  return new Promise((resolvePromise, reject) => {
    const server = createServer((req, res) => {
      const respond = (r) => {
        res.writeHead(r.status, { "content-type": `${r.type}; charset=utf-8` });
        res.end(r.body);
      };
      const handler = req.method === "GET" ? handleArtifactsRequest(cwd, req.url ?? "/", exec) : req.method === "POST" ? handleArtifactsPost(cwd, req.url ?? "/", exec) : Promise.resolve({ status: 405, type: "text/plain", body: "Method not allowed" });
      handler.then(respond).catch((error) => respond({ status: 500, type: "text/plain", body: String(error) }));
    });
    server.once("error", reject);
    server.listen(port, ARTIFACTS_HOST, () => {
      const address = server.address();
      const boundPort = typeof address === "object" && address ? address.port : port;
      active = { server, port: boundPort };
      resolvePromise({ port: boundPort, url: `http://${ARTIFACTS_HOST}:${boundPort}`, alreadyRunning: false });
    });
  });
}
async function stopArtifactsServer() {
  if (!active)
    return false;
  const { server } = active;
  active = null;
  await new Promise((resolvePromise) => server.close(() => resolvePromise()));
  return true;
}
var STATUS_COLOR, DIFF_VIEWER_HEAD = `
<link rel="stylesheet" href="/assets/hljs.css">
<link rel="stylesheet" href="/assets/diff2html.css">`, ASSET_SPECS, assetCache, ARTIFACTS_HOST = "localhost", active = null;
var init_artifactsServer = __esm(() => {
  init_xml();
  init_artifacts();
  STATUS_COLOR = {
    pending: "#b58900",
    approved: "#2aa15f",
    rejected: "#d94f4f"
  };
  ASSET_SPECS = {
    "/assets/hljs.css": { spec: "highlight.js/styles/github.min.css", type: "text/css" },
    "/assets/diff2html.css": { spec: "diff2html/bundles/css/diff2html.min.css", type: "text/css" },
    "/assets/diff2html-ui.js": { spec: "diff2html/bundles/js/diff2html-ui.min.js", type: "text/javascript" }
  };
  assetCache = new Map;
});

// ../../src/commands/artifacts/artifacts.ts
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
function positionals(tokens) {
  const withValue = new Set(["--kind", "--title", "--body", "--file", "--summary", "--feedback", "--command", "--task", "--port"]);
  const values = [];
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (withValue.has(token)) {
      i++;
      continue;
    }
    if (token.startsWith("--"))
      continue;
    values.push(token);
  }
  return values;
}
function usage() {
  return [
    "Usage:",
    "  ur artifacts list [--json]",
    "  ur artifacts show <id> [--json]",
    '  ur artifacts add --kind plan --title "..." [--body "..."] [--file path] [--summary "..."]',
    '  ur artifacts capture-diff [--title "..."]',
    '  ur artifacts capture-tests --command "bun test"',
    "  ur artifacts serve [port] [--port 4180] | serve --stop",
    "  ur artifacts approve <id>",
    '  ur artifacts reject <id> --feedback "..."',
    '  ur artifacts feedback|comment <id> --feedback "..." [--task bg_id]',
    "  ur artifacts delete <id>"
  ].join(`
`);
}
function backgroundTaskIdFromTrace(trace) {
  return trace?.startsWith("bg:") ? trace.slice("bg:".length) : undefined;
}
var KINDS, call = async (args, context) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const positional = positionals(tokens);
  const action = positional[0] ?? "list";
  const id = positional[1];
  if (action === "list") {
    return { type: "text", value: formatArtifactList(listArtifacts(cwd), json) };
  }
  if (action === "add") {
    const kind = option(tokens, "--kind") ?? "note";
    const title = option(tokens, "--title");
    if (!title || !KINDS.has(kind))
      return { type: "text", value: usage() };
    const artifact = recordArtifact(cwd, {
      kind,
      title,
      body: option(tokens, "--body"),
      file: option(tokens, "--file"),
      summary: option(tokens, "--summary"),
      links: option(tokens, "--task") ? { trace: `bg:${option(tokens, "--task")}` } : undefined
    });
    return {
      type: "text",
      value: json ? JSON.stringify(artifact, null, 2) : `Recorded artifact ${artifact.id} [${artifact.kind}].`
    };
  }
  if (action === "capture-diff") {
    const artifact = await captureDiff(cwd, option(tokens, "--title") ?? "Working tree diff");
    return {
      type: "text",
      value: artifact ? json ? JSON.stringify(artifact, null, 2) : `Captured diff as artifact ${artifact.id} (${artifact.summary}).` : "No working-tree changes to capture."
    };
  }
  if (action === "capture-tests") {
    const command = option(tokens, "--command") ?? "bun test";
    const artifact = await captureTestRun(cwd, command);
    return {
      type: "text",
      value: json ? JSON.stringify(artifact, null, 2) : `Captured test run as artifact ${artifact.id} (${artifact.summary}).`
    };
  }
  if (action === "serve") {
    if (tokens.includes("--stop")) {
      return {
        type: "text",
        value: await stopArtifactsServer() ? "Artifacts server stopped." : "Artifacts server is not running."
      };
    }
    const running = activeArtifactsServer();
    if (running) {
      return { type: "text", value: `Artifacts page already running at ${running.url} — open ${running.url}/artifacts/<id>.` };
    }
    const portArg = option(tokens, "--port") ?? positional[1];
    const port = Number(portArg ?? 4180);
    if (!Number.isInteger(port) || port < 0 || port > 65535) {
      return { type: "text", value: `Invalid port: ${portArg}` };
    }
    try {
      const { url } = await startArtifactsServer(cwd, port);
      const message = `Artifacts page: ${url} — open ${url}/artifacts/<id> for a single artifact, ${url}/diff for live working-tree changes (VS Code-style diff). Stop with \`ur artifacts serve --stop\`.`;
      if (context?.options?.isNonInteractiveSession || getIsNonInteractiveSession()) {
        console.log(`${message}
Serving — press Ctrl+C to stop.`);
        await new Promise(() => {});
      }
      return { type: "text", value: message };
    } catch (error) {
      return { type: "text", value: `Failed to start artifacts server on port ${port}: ${error}` };
    }
  }
  if (!id)
    return { type: "text", value: usage() };
  if (action === "show") {
    const artifact = getArtifact(cwd, id);
    if (!artifact)
      return { type: "text", value: `Artifact not found: ${id}` };
    return { type: "text", value: formatArtifact(artifact, readArtifactBody(cwd, id), json) };
  }
  if (action === "approve") {
    const artifact = setStatus(cwd, id, "approved");
    return { type: "text", value: artifact ? `Approved artifact ${id}.` : `Artifact not found: ${id}` };
  }
  if (action === "reject") {
    const feedback = option(tokens, "--feedback");
    if (feedback)
      addFeedback(cwd, id, feedback);
    const artifact = setStatus(cwd, id, "rejected");
    return { type: "text", value: artifact ? `Rejected artifact ${id}.` : `Artifact not found: ${id}` };
  }
  if (action === "feedback" || action === "comment") {
    const feedback = option(tokens, "--feedback");
    if (!feedback)
      return { type: "text", value: 'Provide --feedback "...".' };
    const artifact = addFeedback(cwd, id, feedback);
    if (!artifact)
      return { type: "text", value: `Artifact not found: ${id}` };
    const taskId = option(tokens, "--task") ?? backgroundTaskIdFromTrace(artifact.links?.trace);
    const task = taskId ? appendBackgroundFeedback(cwd, taskId, feedback, { artifactId: id }) : null;
    return {
      type: "text",
      value: task ? `Added feedback to artifact ${id} and queued it for background task ${taskId}.` : `Added feedback to artifact ${id}.`
    };
  }
  if (action === "delete" || action === "remove") {
    return { type: "text", value: deleteArtifact(cwd, id) ? `Deleted artifact ${id}.` : `Artifact not found: ${id}` };
  }
  return { type: "text", value: usage() };
};
var init_artifacts2 = __esm(() => {
  init_artifacts();
  init_artifactsServer();
  init_backgroundRunner();
  init_state();
  init_argumentSubstitution();
  init_cwd();
  KINDS = new Set(["plan", "diff", "test-run", "screenshot", "browser-recording", "note"]);
});
init_artifacts2();

export {
  call
};
