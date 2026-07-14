import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-4bphgmcc.js";
import"./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/role-mode/modes.ts
function listModeNames() {
  return ROLE_MODES.map((m) => m.name);
}
function getMode(name) {
  return ROLE_MODES.find((m) => m.name === name.toLowerCase());
}
function renderModeAgent(mode) {
  const frontmatter = [
    "---",
    `name: ${mode.name}`,
    `description: ${mode.description}`,
    "model: inherit",
    `effort: ${mode.effort}`,
    `color: ${mode.color}`,
    ...mode.permissionMode ? [`permissionMode: ${mode.permissionMode}`] : [],
    ...mode.tools ? [`tools: ${mode.tools.join(", ")}`] : [],
    "---",
    ""
  ];
  return `${frontmatter.join(`
`)}${mode.body.trim()}
`;
}
var READ_TOOLS, WEB_TOOLS, ROLE_MODES;
var init_modes = __esm(() => {
  READ_TOOLS = ["Read", "Grep", "Glob", "CodeSearch"];
  WEB_TOOLS = ["WebSearch", "WebFetch"];
  ROLE_MODES = [
    {
      name: "architect",
      description: "Read-only design & planning role. Explores the codebase and produces an implementation plan without editing files.",
      color: "cyan",
      effort: "high",
      permissionMode: "plan",
      tools: [...READ_TOOLS, ...WEB_TOOLS, "TodoWrite"],
      body: `You are operating in **Architect** mode: a software architect and planning specialist.

This is a READ-ONLY role. You do not have edit, write, or shell tools — do not attempt to modify files or system state.

Your job:
1. Understand the requirement and the relevant parts of the codebase (use Read, Grep, Glob, and CodeSearch).
2. Identify the critical files, the data flow, and the architectural trade-offs.
3. Produce a concrete, step-by-step implementation plan: which files change, in what order, and why. Call out risks, edge cases, and the tests that should prove it.

Prefer a clear plan over prose. When the design is ambiguous, present the options with a recommendation rather than guessing.`
    },
    {
      name: "code",
      description: "Full implementation role. Reads, edits, and runs code to implement a change end to end.",
      color: "green",
      effort: "high",
      permissionMode: "default",
      body: `You are operating in **Code** mode: an implementation specialist.

Implement the requested change end to end. Match the surrounding code's conventions, naming, and idioms. Make the smallest coherent change that fully solves the task — do not broaden scope unless the change is incomplete without it.

After editing, run the closest useful verification (tests, typecheck, lint, or a quick run) and report the exact command and result. If something fails, say so with the output rather than claiming success.`
    },
    {
      name: "debug",
      description: "Investigation role. Reproduces and diagnoses a bug, then applies a minimal, verified fix.",
      color: "red",
      effort: "high",
      permissionMode: "default",
      tools: [...READ_TOOLS, "Bash", "Edit", "TodoWrite"],
      body: `You are operating in **Debug** mode: a debugging specialist.

Your process:
1. Reproduce the problem first — run the failing command/test and read the actual output and logs (Bash).
2. Form a hypothesis about the root cause and confirm it by reading the relevant code (Read, Grep, Glob, CodeSearch). Separate the symptom from the cause.
3. Apply the **smallest** fix that addresses the root cause (Edit), then re-run the reproduction to prove it is fixed.

Do not guess-and-check blindly. State your hypothesis and the evidence for it before changing code. Avoid unrelated refactors.`
    },
    {
      name: "ask",
      description: "Read-only Q&A role. Explains how the codebase works without changing anything.",
      color: "blue",
      effort: "medium",
      permissionMode: "default",
      tools: [...READ_TOOLS, ...WEB_TOOLS],
      body: `You are operating in **Ask** mode: a codebase question-answering role.

This is a READ-ONLY role — you have no edit, write, or shell tools. Answer questions about how the code works, where things live, and how to approach a change.

Ground answers in the actual code: cite concrete files and line ranges (use Read, Grep, Glob, CodeSearch). When you are inferring rather than quoting, say so. Do not propose to modify files in this mode — describe what a change would involve and let the user switch to Code or Debug mode to do it.`
    }
  ];
});

// ../../src/commands/role-mode/role-mode.ts
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
function formatList() {
  const lines = ["Built-in role modes:", ""];
  for (const mode of ROLE_MODES) {
    const scope = mode.tools ? mode.tools.join(", ") : "all tools";
    lines.push(`- ${mode.name} — ${mode.description}`);
    lines.push(`    tools: ${scope}`);
  }
  lines.push("");
  lines.push("Install with: ur role-mode install <name|all> [--force]");
  lines.push("Once installed they appear as agents (delegate to them via the Agent tool / /agents).");
  return lines.join(`
`);
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const force = tokens.includes("--force");
  const positional = tokens.filter((t) => !t.startsWith("--"));
  const command = positional[0] ?? "list";
  if (command === "list") {
    if (json) {
      return {
        type: "text",
        value: JSON.stringify(ROLE_MODES.map((m) => ({
          name: m.name,
          description: m.description,
          tools: m.tools ?? "*",
          permissionMode: m.permissionMode ?? "default"
        })), null, 2)
      };
    }
    return { type: "text", value: formatList() };
  }
  if (command === "show") {
    const name = positional[1];
    const mode = name ? getMode(name) : undefined;
    if (!mode) {
      return {
        type: "text",
        value: `Unknown role mode "${name ?? ""}". Available: ${listModeNames().join(", ")}`
      };
    }
    return { type: "text", value: renderModeAgent(mode) };
  }
  if (command === "install") {
    const target = positional[1] ?? "all";
    const modes = target === "all" ? ROLE_MODES : ROLE_MODES.filter((m) => m.name === target.toLowerCase());
    if (modes.length === 0) {
      return {
        type: "text",
        value: `Unknown role mode "${target}". Available: ${listModeNames().join(", ")}, or "all".`
      };
    }
    const agentsDir = join(getCwd(), ".ur", "agents");
    mkdirSync(agentsDir, { recursive: true });
    const created = [];
    const skipped = [];
    for (const mode of modes) {
      const path = join(agentsDir, `${mode.name}.md`);
      if (existsSync(path) && !force) {
        skipped.push(`${mode.name} (exists; use --force to overwrite)`);
        continue;
      }
      writeFileSync(path, renderModeAgent(mode), { encoding: "utf-8" });
      created.push(path);
    }
    if (json) {
      return { type: "text", value: JSON.stringify({ created, skipped }, null, 2) };
    }
    const lines = [];
    if (created.length > 0) {
      lines.push(`Installed ${created.length} role mode${created.length === 1 ? "" : "s"}:`);
      lines.push(...created.map((p) => `  ${p}`));
    }
    if (skipped.length > 0) {
      lines.push(`Skipped: ${skipped.join(", ")}`);
    }
    lines.push("");
    lines.push("These role modes are now available as agents (delegate to them via the Agent tool).");
    return { type: "text", value: lines.join(`
`) };
  }
  return {
    type: "text",
    value: "Usage: ur role-mode list|show <name>|install <name|all> [--force] [--json]"
  };
};
var init_role_mode = __esm(() => {
  init_argumentSubstitution();
  init_cwd();
  init_modes();
});
init_role_mode();

export {
  call
};
