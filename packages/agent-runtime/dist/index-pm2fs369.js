import {
  detectProjectDna,
  formatDna,
  init_projectDna
} from "./index-e7zhbfbk.js";
import {
  init_projectSafety,
  safetyPolicyPath
} from "./index-1ckv14g7.js";
import {
  init_json,
  safeParseJSON
} from "./index-mwn5bkf6.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/context/projectContextManifest.ts
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from "node:fs";
import { dirname, join, relative } from "node:path";
function contextDir(cwd) {
  return join(cwd, ".ur", "context");
}
function projectManifestPath(cwd) {
  return join(cwd, ".ur", "project-manifest.json");
}
function taskMemoryPath(cwd) {
  return join(contextDir(cwd), "task-memory.jsonl");
}
function compressedContextPath(cwd) {
  return join(contextDir(cwd), "compressed.md");
}
function architectureSummaryPath(cwd) {
  return join(contextDir(cwd), "architecture.md");
}
function readPackage(cwd) {
  const path = join(cwd, "package.json");
  if (!existsSync(path))
    return null;
  return safeParseJSON(readFileSync(path, "utf8"), false);
}
function existing(cwd, names) {
  return names.filter((name) => existsSync(join(cwd, name)));
}
function existingFilesInDir(cwd, dir, extensions) {
  const absoluteDir = join(cwd, dir);
  if (!existsSync(absoluteDir) || !statSync(absoluteDir).isDirectory())
    return [];
  return readdirSync(absoluteDir).filter((file) => extensions.some((extension) => file.endsWith(extension))).sort().map((file) => `${dir}/${file}`);
}
function instructionFiles(cwd) {
  return [
    ...existing(cwd, [
      "AGENTS.md",
      "UR.md",
      "UR.local.md",
      "CLAUDE.md",
      ".cursorrules",
      ".windsurfrules",
      ".github/copilot-instructions.md"
    ]),
    ...existingFilesInDir(cwd, ".cursor/rules", [".mdc", ".md"])
  ];
}
function manifestFiles(cwd) {
  return [
    ...existing(cwd, [
      "package.json",
      "bun.lock",
      "bunfig.toml",
      "tsconfig.json",
      "jsconfig.json",
      "biome.json",
      "eslint.config.js",
      "pyproject.toml",
      "requirements.txt",
      "Cargo.toml",
      "go.mod",
      "Dockerfile",
      "docker-compose.yml",
      "compose.yml",
      ".editorconfig",
      ".mcp.json",
      ".ur/verify.json",
      ".ur/safety-policy.json",
      ".vscode/settings.json",
      ".zed/settings.json"
    ]),
    ...existingFilesInDir(cwd, ".github/workflows", [".yml", ".yaml"])
  ];
}
function packageScripts(pkg, matcher) {
  const scripts = pkg?.scripts;
  if (!scripts || typeof scripts !== "object")
    return [];
  return Object.entries(scripts).filter(([name, value]) => matcher.test(name) && typeof value === "string").map(([name]) => `bun run ${name}`);
}
function buildProjectContextManifest(cwd) {
  const dna = detectProjectDna(cwd);
  const pkg = readPackage(cwd);
  const packageName = typeof pkg?.name === "string" ? pkg.name : "project";
  const release = packageScripts(pkg, /^(release|package|smoke|secrets|prepack)/);
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    project: {
      name: packageName,
      root: cwd,
      readme: dna.readme,
      languages: dna.languages,
      packageManagers: dna.packageManagers,
      importantFolders: dna.importantFolders
    },
    instructionFiles: instructionFiles(cwd),
    manifests: manifestFiles(cwd),
    commands: {
      compile: dna.buildCommands,
      test: dna.testCommands,
      lint: dna.lintCommands,
      run: dna.runCommands,
      release
    },
    architectureRules: [
      "Prefer package scripts and project manifests before inventing commands.",
      "Treat AGENTS.md, UR.md, Cursor rules, and other agent instruction files as shared architecture instructions when present.",
      "Use .ur/verify.json and .ur/safety-policy.json as executable project constraints.",
      "Use MCP, editor, package-manager, workflow, and language manifests to infer architecture rules and available commands.",
      "Keep generated runtime state under .ur/ unless a command documents another path."
    ],
    constraints: [
      existsSync(safetyPolicyPath(cwd)) ? "Project safety policy is configured." : "Default safety policy applies until .ur/safety-policy.json is written.",
      existsSync(join(cwd, ".ur", "verify.json")) ? "Project verify gates are configured." : "No project verify gate file detected.",
      "Do not expose secret-like files or environment values in command output."
    ]
  };
}
function writeProjectContextManifest(cwd) {
  const manifest = buildProjectContextManifest(cwd);
  mkdirSync(dirname(projectManifestPath(cwd)), { recursive: true });
  writeFileSync(projectManifestPath(cwd), `${JSON.stringify(manifest, null, 2)}
`);
  mkdirSync(contextDir(cwd), { recursive: true });
  writeFileSync(architectureSummaryPath(cwd), formatArchitectureSummary(manifest, cwd));
  return manifest;
}
function formatArchitectureSummary(manifest, cwd) {
  const dna = formatDna({
    languages: manifest.project.languages,
    packageManagers: manifest.project.packageManagers,
    buildCommands: manifest.commands.compile,
    testCommands: manifest.commands.test,
    lintCommands: manifest.commands.lint,
    runCommands: manifest.commands.run,
    importantFolders: manifest.project.importantFolders,
    ignoredFolders: [],
    readme: manifest.project.readme,
    hasGit: existsSync(join(cwd, ".git"))
  });
  return [
    "# Project Architecture Context",
    "",
    `Generated: ${manifest.generatedAt}`,
    `Project: ${manifest.project.name}`,
    "",
    dna,
    "",
    "## Architecture Rules",
    ...manifest.architectureRules.map((rule) => `- ${rule}`),
    "",
    "## Constraints",
    ...manifest.constraints.map((rule) => `- ${rule}`),
    "",
    "## Manifests",
    ...manifest.manifests.length ? manifest.manifests.map((file) => `- ${file}`) : ["- none detected"],
    ""
  ].join(`
`);
}
function appendTaskMemory(cwd, kind, text, meta) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    at: new Date().toISOString(),
    kind,
    text,
    status: meta?.status,
    rationale: meta?.rationale,
    alternativeTo: meta?.alternativeTo,
    supersedesId: meta?.supersedesId,
    scope: meta?.scope,
    source: meta?.source
  };
  mkdirSync(dirname(taskMemoryPath(cwd)), { recursive: true });
  writeFileSync(taskMemoryPath(cwd), `${JSON.stringify(entry)}
`, { flag: "a" });
  return entry;
}
function appendProjectMemory(cwd, kind, text, meta) {
  return appendTaskMemory(cwd, kind, text, meta);
}
function readTaskMemory(cwd) {
  const path = taskMemoryPath(cwd);
  if (!existsSync(path))
    return [];
  return readFileSync(path, "utf8").split(`
`).filter(Boolean).map((line) => safeParseJSON(line, false)).filter((entry) => Boolean(entry && typeof entry === "object" && typeof entry.kind === "string" && typeof entry.text === "string"));
}
function readProjectMemoryByKind(cwd, kinds) {
  return readTaskMemory(cwd).filter((entry) => kinds.includes(entry.kind));
}
function compressTaskMemory(cwd) {
  const entries = readTaskMemory(cwd);
  const allKinds = TASK_MEMORY_KINDS;
  const byKind = new Map;
  for (const kind of allKinds) {
    byKind.set(kind, entries.filter((entry) => entry.kind === kind));
  }
  const lines = [
    "# Compressed Task Context",
    "",
    `Entries: ${entries.length}`,
    `Updated: ${new Date().toISOString()}`
  ];
  for (const kind of allKinds) {
    lines.push("", `## ${kind[0].toUpperCase()}${kind.slice(1)}s`);
    const group = byKind.get(kind) ?? [];
    if (group.length === 0) {
      lines.push("- none");
      continue;
    }
    for (const entry of group.slice(-50)) {
      const meta = [
        entry.status ? `status=${entry.status}` : "",
        entry.scope ? `scope=${entry.scope}` : "",
        entry.source ? `source=${entry.source}` : "",
        entry.rationale ? `rationale=${entry.rationale}` : ""
      ].filter(Boolean).join(", ");
      lines.push(`- ${entry.at}: ${entry.text}${meta ? ` (${meta})` : ""}`);
    }
  }
  const body = `${lines.join(`
`)}
`;
  mkdirSync(dirname(compressedContextPath(cwd)), { recursive: true });
  writeFileSync(compressedContextPath(cwd), body);
  return body;
}
function compressProjectMemory(cwd) {
  return compressTaskMemory(cwd);
}
function contextStatus(cwd) {
  const files = [
    projectManifestPath(cwd),
    architectureSummaryPath(cwd),
    taskMemoryPath(cwd),
    compressedContextPath(cwd)
  ];
  const contextFiles = existsSync(contextDir(cwd)) ? readdirSync(contextDir(cwd)) : [];
  return [
    "Project context status:",
    ...files.map((path) => `  ${existsSync(path) ? "yes" : "no "} ${relative(cwd, path)}`),
    `  context files: ${contextFiles.length}`
  ].join(`
`);
}
var TASK_MEMORY_KINDS;
var init_projectContextManifest = __esm(() => {
  init_projectDna();
  init_json();
  init_projectSafety();
  TASK_MEMORY_KINDS = [
    "decision",
    "constraint",
    "command",
    "diff",
    "note",
    "architecture",
    "preference",
    "attempt",
    "accepted",
    "rejected"
  ];
});

export { TASK_MEMORY_KINDS, projectManifestPath, compressedContextPath, architectureSummaryPath, writeProjectContextManifest, appendProjectMemory, readProjectMemoryByKind, compressProjectMemory, contextStatus, init_projectContextManifest };
