import {
  detectProjectDna,
  formatDna,
  init_projectDna
} from "./index-e7zhbfbk.js";
import {
  getOllamaBaseUrl,
  init_ollamaConfig,
  init_ollamaModels,
  parseOllamaModelNames
} from "./index-nds05g02.js";
import {
  init_ollamaRouter,
  pickBestCoderModel,
  pickSmallFastModel,
  recommendedCoderModelToPull
} from "./index-f7bfe40r.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/ur/sysinfo.ts
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { arch, homedir, platform, release } from "node:os";
import { join } from "node:path";
function commandExists(bin) {
  try {
    const cmd = process.platform === "win32" ? "where" : "which";
    return spawnSync(cmd, [bin], { stdio: "ignore" }).status === 0;
  } catch {
    return false;
  }
}
function runCapture(bin, args, timeoutMs = 15000) {
  try {
    const r = spawnSync(bin, args, { timeout: timeoutMs, maxBuffer: 8000000, encoding: "utf8" });
    return { ok: r.status === 0, out: (r.stdout || "").trim(), err: (r.stderr || "").trim() };
  } catch (e) {
    return { ok: false, out: "", err: e.message };
  }
}
function osInfo() {
  const tools = ["git", "ollama", "node", "bun", "python3", "ffmpeg", "yt-dlp", "rg", "cargo", "go"];
  const present = tools.filter(commandExists);
  return [
    `platform:  ${platform()} (${release()})`,
    `arch:      ${arch()}`,
    `shell:     ${process.env.SHELL ?? process.env.ComSpec ?? "unknown"}`,
    `runtime:   ${typeof Bun !== "undefined" ? "bun " + Bun.version : "node " + process.version}`,
    `tools:     ${present.join(", ") || "none detected"}`,
    `missing:   ${tools.filter((t) => !present.includes(t)).join(", ") || "none"}`
  ].join(`
`);
}
function workspaceInfo(cwd) {
  let fileCount = 0;
  try {
    fileCount = readdirSync(cwd).length;
  } catch {}
  const git = existsSync(join(cwd, ".git")) ? "yes" : "no";
  const dna = formatDna(detectProjectDna(cwd));
  return [`workspace: ${cwd}`, `entries:   ${fileCount}`, `git:       ${git}`, "", dna].join(`
`);
}
async function urDoctor(cwd) {
  const lines = ["UR doctor", "", osInfo(), ""];
  const host = getOllamaBaseUrl();
  let ollama;
  let ollamaModels = [];
  try {
    const res = await fetch(`${host}/api/tags`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      ollamaModels = parseOllamaModelNames(await res.json());
      ollama = `ok — ${ollamaModels.length} model(s) @ ${host}`;
    } else
      ollama = `error ${res.status} @ ${host}`;
  } catch {
    ollama = `unreachable @ ${host} (start with: ollama serve)`;
  }
  lines.push(`ollama:     ${ollama}`);
  if (ollamaModels.length > 0) {
    lines.push(`  routing:  main=${pickBestCoderModel(ollamaModels) ?? "?"} · fast=${pickSmallFastModel(ollamaModels) ?? "?"}`);
    const pull = recommendedCoderModelToPull(ollamaModels);
    if (pull) {
      lines.push(`  tip:      no coder model found — consider: ollama pull ${pull}`);
    }
  }
  const urDir = join(cwd, ".ur");
  if (existsSync(urDir)) {
    const have = ["actions.jsonl", "project_dna.md", "mode", "graph", "tools", "research", "memory", "index"].filter((n) => existsSync(join(urDir, n)));
    lines.push(`.ur:        present — ${have.join(", ") || "(empty)"}`);
  } else {
    lines.push(".ur:        missing (run /ur-init)");
  }
  const mcp = [join(cwd, ".ur", "mcp", "servers.toml"), join(homedir(), ".ur", "mcp", "servers.toml")].filter(existsSync);
  lines.push(`mcp cfg:    ${mcp.length ? mcp.join(", ") : "none (.ur/mcp/servers.toml)"}`);
  lines.push(`playwright: ${existsSync(join(cwd, "node_modules", "playwright")) ? "installed" : "not installed"}`);
  return lines.join(`
`);
}
var init_sysinfo = __esm(() => {
  init_projectDna();
  init_ollamaModels();
  init_ollamaRouter();
  init_ollamaConfig();
});

export { commandExists, runCapture, osInfo, workspaceInfo, urDoctor, init_sysinfo };
