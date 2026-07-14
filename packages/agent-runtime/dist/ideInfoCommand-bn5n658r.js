import {
  getAcpServerPort,
  init_acpServer
} from "./index-rdcba7de.js";
import"./index-1zsbpc6x.js";
import"./index-2k3x04sj.js";
import"./index-zxm9dac1.js";
import"./index-kw2wxbby.js";
import"./index-fayv8cwb.js";
import"./index-j4g1j45r.js";
import"./index-qg6cjfb3.js";
import"./index-5jrgxedg.js";
import"./index-hp4vvv8v.js";
import"./index-zn5x3nwj.js";
import {
  SandboxManager,
  detectRunningIDEs,
  init_ide,
  init_installedPluginsManager,
  init_sandbox_adapter,
  loadInstalledPluginsV2,
  toIDEDisplayName
} from "./index-7fe5jn6w.js";
import"./index-kkermbsd.js";
import"./index-gph76kef.js";
import"./index-2j7c2ame.js";
import"./index-61fyyngt.js";
import"./index-6hrfermc.js";
import"./index-r9gwtga0.js";
import"./index-s87snjmt.js";
import"./index-6ykfn1n2.js";
import"./index-e7z6rkgj.js";
import"./index-e7zhbfbk.js";
import"./index-gkqe0rrq.js";
import"./index-ked7nkp4.js";
import"./index-43251g5q.js";
import"./index-33ph0x52.js";
import"./index-wxp81q89.js";
import"./index-efqwnst8.js";
import"./index-na6pcvfj.js";
import"./index-98nws6xf.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import"./index-4k4gpxwy.js";
import"./index-zh6q93c4.js";
import"./index-j9j0h3gp.js";
import"./index-mpvjr5hg.js";
import"./index-gtvyh4ft.js";
import"./index-d6epqsmt.js";
import"./index-bwntnbyg.js";
import"./index-xvadh9a8.js";
import"./index-a38sm3ww.js";
import"./index-t5r7sy2d.js";
import"./index-ktb0kcww.js";
import"./index-tdkq0knn.js";
import"./index-kq80n9z5.js";
import"./index-1f511qkg.js";
import"./index-bdfn6xh6.js";
import"./index-60smdz72.js";
import"./index-5jrp51k1.js";
import {
  getProviderRuntimeInfo,
  init_providerRegistry
} from "./index-31dnhhm9.js";
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
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/ideConfig.ts
function resolveIdeTarget(value) {
  const normalized = value.trim().toLowerCase().replace(/[\s_]+/g, "-");
  const aliases = {
    vscode: "vscode",
    "vs-code": "vscode",
    code: "vscode",
    cursor: "cursor",
    windsurf: "windsurf",
    zed: "zed",
    jetbrains: "jetbrains",
    intellij: "jetbrains",
    idea: "jetbrains",
    pycharm: "jetbrains",
    webstorm: "jetbrains",
    goland: "jetbrains",
    neovim: "neovim",
    nvim: "neovim",
    vim: "neovim",
    generic: "generic-acp",
    "generic-acp": "generic-acp",
    acp: "generic-acp"
  };
  const id = aliases[normalized];
  return id ? IDE_TARGETS.find((t) => t.id === id) ?? null : null;
}
function zedSettings(command) {
  return JSON.stringify({ agent_servers: { UR: { command, args: ["acp", "stdio"] } } }, null, 2);
}
function neovimSnippet(command) {
  return [
    "-- Requires an ACP-capable Neovim client (e.g. a plugin that speaks the",
    "-- Agent Client Protocol over stdio). Point it at the UR ACP agent:",
    'require("acp").setup({',
    "  servers = {",
    `    ur = { command = "${command}", args = { "acp", "stdio" } },`,
    "  },",
    "})"
  ].join(`
`);
}
function generateIdeConfig(target, options = {}) {
  const command = options.command ?? "ur";
  const meta = IDE_TARGETS.find((t) => t.id === target);
  switch (target) {
    case "zed":
      return {
        target,
        label: meta.label,
        kind: meta.kind,
        summary: "Zed connects to UR as an external agent over the stdio Agent Client Protocol.",
        steps: [
          "Add the agent server block below to your Zed settings.json.",
          "Restart Zed or reload settings.",
          'Open the Agent panel and select "UR".'
        ],
        files: [{ path: ".zed/settings.json", language: "json", content: zedSettings(command) }],
        limitations: [
          "Streaming is emitted as agent_message_chunk updates; token-level streaming depends on the active provider."
        ]
      };
    case "neovim":
      return {
        target,
        label: meta.label,
        kind: meta.kind,
        summary: "Neovim connects to UR over stdio ACP through an ACP-capable client plugin.",
        steps: [
          "Install a Neovim plugin that speaks ACP over stdio.",
          "Register the UR agent using the snippet below.",
          "Open the agent UI provided by that plugin."
        ],
        files: [{ path: "ur-acp.lua", language: "lua", content: neovimSnippet(command) }],
        limitations: [
          "UR does not ship a Neovim plugin; a third-party ACP client is required."
        ]
      };
    case "generic-acp":
      return {
        target,
        label: meta.label,
        kind: meta.kind,
        summary: "Any ACP-compatible client can launch UR as a stdio agent, or use the HTTP JSON-RPC server.",
        steps: [
          `Stdio ACP agent: run \`${command} acp stdio\` and speak JSON-RPC (initialize, session/new, session/prompt, session/cancel).`,
          `HTTP JSON-RPC: run \`${command} acp serve --host 127.0.0.1 --port 8123\` and POST to /acp.`
        ],
        files: [
          {
            path: "ur-acp.json",
            language: "json",
            content: JSON.stringify({ stdio: { command, args: ["acp", "stdio"] }, http: { url: "http://127.0.0.1:8123/acp" } }, null, 2)
          }
        ],
        limitations: [
          "The HTTP server is JSON-RPC over HTTP, not Zed-style stdio ACP; use the stdio agent for native ACP editors."
        ]
      };
    case "jetbrains":
      return {
        target,
        label: meta.label,
        kind: meta.kind,
        summary: "JetBrains IDEs integrate through the UR JetBrains plugin (manual install).",
        steps: [
          "Install the UR plugin for your JetBrains IDE.",
          "Restart the IDE.",
          "Run `/ide` inside a UR session to connect to the running IDE."
        ],
        files: [],
        limitations: [
          "No auto-generated config file; the plugin must be installed manually.",
          "Inline apply/reject requires the JetBrains plugin."
        ]
      };
    default: {
      return {
        target,
        label: meta.label,
        kind: meta.kind,
        summary: `${meta.label} integrates through the UR extension and the /ide connect flow.`,
        steps: [
          `Install the UR extension in ${meta.label} (\`${command} ide install\` offers the bundled VSIX).`,
          `Run \`${command}\` in your project, then \`/ide\` to connect to the running editor.`,
          "Use the UR Inline Diffs view to preview, apply, or reject proposed patches."
        ],
        files: [
          {
            path: ".vscode/settings.json",
            language: "json",
            content: JSON.stringify({ "ur.inlineDiffs.enabled": true }, null, 2)
          }
        ],
        limitations: [
          "Apply/reject and context sharing require the UR extension to be installed and the editor running."
        ]
      };
    }
  }
}
function formatIdeConfig(result, json = false) {
  if (json)
    return JSON.stringify(result, null, 2);
  const lines = [
    `${result.label} — ${result.kind}`,
    result.summary,
    "",
    "Steps:",
    ...result.steps.map((s, i) => `  ${i + 1}. ${s}`)
  ];
  for (const file of result.files) {
    lines.push("", `${file.path}:`, "```" + file.language, file.content, "```");
  }
  if (result.limitations.length > 0) {
    lines.push("", "Limitations:", ...result.limitations.map((l) => `  - ${l}`));
  }
  return lines.join(`
`);
}
function formatIdeStatus(status, json = false) {
  if (json)
    return JSON.stringify(status, null, 2);
  const ide = status.detectedIdes.length > 0 ? status.detectedIdes.map((i) => `${i.name}${i.connected ? " (connected)" : ""}`).join(", ") : "none detected";
  const lines = [
    `Workspace: ${status.workspaceRoot}`,
    `ACP server: ${status.acp.running ? `running on ${status.acp.host}:${status.acp.port}` : "not running"}`,
    `Provider: ${status.provider.label} (${status.provider.authLabel})`,
    `Model: ${status.provider.model ?? "(none selected)"}`,
    `Runtime backend: ${status.provider.runtimeBackend}`,
    `Plugins loaded: ${status.pluginCount}`,
    `Detected IDEs: ${ide}`
  ];
  if (status.sandboxMode)
    lines.push(`Sandbox mode: ${status.sandboxMode}`);
  if (status.verifierMode)
    lines.push(`Verifier mode: ${status.verifierMode}`);
  if (status.warnings.length > 0) {
    lines.push("Warnings:", ...status.warnings.map((w) => `  - ${w}`));
  }
  return lines.join(`
`);
}
function ideDoctorChecks(status) {
  const checks = [];
  checks.push(status.workspaceRoot ? { name: "workspace", status: "pass", message: `Workspace root: ${status.workspaceRoot}` } : { name: "workspace", status: "fail", message: "No workspace root detected. Run inside a project directory." });
  checks.push(status.acp.running ? { name: "acp", status: "pass", message: `ACP server running on ${status.acp.host}:${status.acp.port}` } : { name: "acp", status: "warn", message: "ACP server not running. Start it with: ur acp serve (HTTP) or ur acp stdio (ACP editors)." });
  checks.push(status.provider.ready ? { name: "provider", status: "pass", message: `${status.provider.label} ready with model ${status.provider.model ?? "(none)"}` } : { name: "provider", status: "warn", message: `${status.provider.label} not ready. Run: ur provider doctor` });
  checks.push(status.detectedIdes.length > 0 ? { name: "ide", status: "pass", message: `Detected: ${status.detectedIdes.map((i) => i.name).join(", ")}` } : { name: "ide", status: "warn", message: "No running IDE with the UR extension detected. Run: ur ide config <editor>." });
  for (const warning of status.warnings) {
    checks.push({ name: "warning", status: "warn", message: warning });
  }
  return checks;
}
function formatIdeDoctor(status, json = false) {
  const checks = ideDoctorChecks(status);
  if (json)
    return JSON.stringify({ ok: checks.every((c) => c.status !== "fail"), checks }, null, 2);
  const ok = checks.every((c) => c.status !== "fail");
  return [
    `IDE doctor: ${ok ? "ready" : "not ready"}`,
    ...checks.map((c) => `  ${c.status.toUpperCase()} ${c.name}: ${c.message}`)
  ].join(`
`);
}
var IDE_TARGETS;
var init_ideConfig = __esm(() => {
  IDE_TARGETS = [
    { id: "vscode", label: "VS Code", kind: "native-extension" },
    { id: "cursor", label: "Cursor", kind: "native-extension" },
    { id: "windsurf", label: "Windsurf", kind: "native-extension" },
    { id: "zed", label: "Zed", kind: "stdio-acp" },
    { id: "jetbrains", label: "JetBrains IDEs", kind: "manual" },
    { id: "neovim", label: "Neovim", kind: "stdio-acp" },
    { id: "generic-acp", label: "Generic ACP client", kind: "stdio-acp" }
  ];
});

// ../../src/commands/ide/ideInfoCommand.ts
function currentSandboxMode() {
  if (!SandboxManager.isSandboxingEnabled())
    return "disabled";
  return SandboxManager.isSandboxRequired() ? "required" : "recommended";
}
function currentVerifierMode() {
  const env = (process.env.UR_VERIFIER_MODE ?? "").toLowerCase();
  if (env === "off" || env === "loose" || env === "strict")
    return env;
  return "strict";
}
function pluginCount() {
  try {
    return Object.keys(loadInstalledPluginsV2().plugins ?? {}).length;
  } catch {
    return 0;
  }
}
async function detectedIdeNames() {
  try {
    const ides = await detectRunningIDEs();
    return { names: ides.map(toIDEDisplayName) };
  } catch (error) {
    return { names: [], warning: `IDE detection failed: ${error instanceof Error ? error.message : String(error)}` };
  }
}
async function collectIdeStatus(cwd) {
  const port = getAcpServerPort();
  const runtime = getProviderRuntimeInfo();
  const detected = await detectedIdeNames();
  const warnings = [];
  if (detected.warning)
    warnings.push(detected.warning);
  if (!runtime.model)
    warnings.push("No model selected. Run /model or: ur config set model <model>.");
  return {
    workspaceRoot: cwd,
    acp: { running: port !== null, port, host: "127.0.0.1" },
    provider: {
      label: runtime.providerLabel,
      model: runtime.model,
      runtimeBackend: runtime.runtimeBackend,
      authLabel: runtime.authLabel,
      ready: Boolean(runtime.model)
    },
    pluginCount: pluginCount(),
    detectedIdes: detected.names.map((name) => ({ name, connected: false })),
    warnings,
    sandboxMode: currentSandboxMode(),
    verifierMode: currentVerifierMode()
  };
}
function usage() {
  return [
    "Usage:",
    "  ur ide status [--json]",
    "  ur ide doctor [--json]",
    `  ur ide config <${IDE_TARGETS.map((t) => t.id).join("|")}> [--json]`
  ].join(`
`);
}
async function runIdeInfoCommand(args, cwd = getCwd()) {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const positional = tokens.filter((t) => !t.startsWith("--"));
  const action = positional[0] ?? "status";
  if (action === "status") {
    return formatIdeStatus(await collectIdeStatus(cwd), json);
  }
  if (action === "doctor") {
    return formatIdeDoctor(await collectIdeStatus(cwd), json);
  }
  if (action === "config") {
    const targetArg = positional[1];
    if (!targetArg) {
      return `Choose an IDE target: ${IDE_TARGETS.map((t) => t.id).join(", ")}
${usage()}`;
    }
    const target = resolveIdeTarget(targetArg);
    if (!target) {
      return `Unknown IDE "${targetArg}". Supported: ${IDE_TARGETS.map((t) => t.id).join(", ")}`;
    }
    return formatIdeConfig(generateIdeConfig(target.id), json);
  }
  return usage();
}
var init_ideInfoCommand = __esm(() => {
  init_acpServer();
  init_ideConfig();
  init_providerRegistry();
  init_argumentSubstitution();
  init_cwd();
  init_ide();
  init_installedPluginsManager();
  init_sandbox_adapter();
});
init_ideInfoCommand();

export {
  runIdeInfoCommand,
  collectIdeStatus
};
