import {
  TASK_MEMORY_KINDS,
  appendProjectMemory,
  architectureSummaryPath,
  compressProjectMemory,
  compressedContextPath,
  contextStatus,
  init_projectContextManifest,
  projectManifestPath,
  writeProjectContextManifest
} from "./index-pm2fs369.js";
import"./index-e7zhbfbk.js";
import"./index-1ckv14g7.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-ke69cyc7.js";
import"./index-mwn5bkf6.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/context-pack/context-pack.ts
function usage() {
  return [
    "Usage:",
    "  ur context-pack scan [--json]",
    '  ur context-pack remember --type architecture --text "Use repository-pattern for data access"',
    '  ur context-pack remember --preference "Prefer bun test over jest"',
    '  ur context-pack remember --accepted "Use p-map for concurrency" --rationale "Avoids Promise.all OOM"',
    '  ur context-pack remember --rejected "Switch to esbuild" --alternative-to "Keep bun bundle"',
    '  ur context-pack remember --attempt "Tried Deno runtime" --status superseded',
    "  ur context-pack compress [--json]",
    "  ur context-pack status"
  ].join(`
`);
}
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
function positionals(tokens) {
  const flagsWithValue = new Set([
    "--type",
    "--text",
    ...MEMORY_KINDS.map((k) => `--${k}`),
    "--status",
    "--rationale",
    "--alternative-to",
    "--supersedes",
    "--scope",
    "--source"
  ]);
  const values = [];
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (flagsWithValue.has(token)) {
      i++;
      continue;
    }
    if (token.startsWith("--"))
      continue;
    values.push(token);
  }
  return values;
}
function rememberInput(tokens) {
  for (const kind2 of MEMORY_KINDS) {
    const value = option(tokens, `--${kind2}`);
    if (value) {
      const meta2 = collectMeta(tokens);
      return { kind: kind2, text: value, ...meta2 };
    }
  }
  const kind = option(tokens, "--type");
  const text = option(tokens, "--text");
  if (!kind || !text || !MEMORY_KINDS.includes(kind))
    return null;
  const meta = collectMeta(tokens);
  return { kind, text, ...meta };
}
function collectMeta(tokens) {
  const status = option(tokens, "--status");
  return {
    status,
    rationale: option(tokens, "--rationale"),
    alternativeTo: option(tokens, "--alternative-to"),
    supersedesId: option(tokens, "--supersedes"),
    scope: option(tokens, "--scope"),
    source: option(tokens, "--source")
  };
}
var MEMORY_KINDS, call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const action = positionals(tokens)[0] ?? "scan";
  const cwd = getCwd();
  if (action === "scan") {
    const manifest = writeProjectContextManifest(cwd);
    const result = {
      manifest: projectManifestPath(cwd),
      architecture: architectureSummaryPath(cwd),
      project: manifest.project.name,
      commands: manifest.commands,
      manifests: manifest.manifests
    };
    return {
      type: "text",
      value: json ? JSON.stringify(result, null, 2) : [
        `Wrote ${result.manifest}`,
        `Wrote ${result.architecture}`,
        `Project: ${result.project}`,
        `Commands: ${Object.values(result.commands).flat().length}`
      ].join(`
`)
    };
  }
  if (action === "remember") {
    const input = rememberInput(tokens);
    if (!input)
      return { type: "text", value: usage() };
    const { kind, text, ...meta } = input;
    const entry = appendProjectMemory(cwd, kind, text, meta);
    return {
      type: "text",
      value: json ? JSON.stringify(entry, null, 2) : `Recorded ${entry.kind}: ${entry.text}`
    };
  }
  if (action === "compress") {
    const body = compressProjectMemory(cwd);
    return {
      type: "text",
      value: json ? JSON.stringify({ path: compressedContextPath(cwd), bytes: body.length }, null, 2) : `Wrote ${compressedContextPath(cwd)}`
    };
  }
  if (action === "status") {
    return { type: "text", value: contextStatus(cwd) };
  }
  return { type: "text", value: usage() };
};
var init_context_pack = __esm(() => {
  init_argumentSubstitution();
  init_cwd();
  init_projectContextManifest();
  MEMORY_KINDS = [...TASK_MEMORY_KINDS];
});
init_context_pack();

export {
  call
};
