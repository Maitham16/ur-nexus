import {
  evaluateGuardrails,
  formatDecision,
  init_guardrails,
  loadGuardrails,
  scaffoldGuardrails,
  validateGuardrails
} from "./index-z4r5t36d.js";
import"./index-hp4vvv8v.js";
import"./index-zn5x3nwj.js";
import"./index-na6pcvfj.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import"./index-wxsgjqjk.js";
import"./index-wred0kdg.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-m9qhxms7.js";
import"./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/guardrails/guardrails.ts
import { existsSync, readFileSync } from "node:fs";
function optionValue(tokens, flag) {
  const index = tokens.indexOf(flag);
  return index >= 0 ? tokens[index + 1] : undefined;
}
function usage() {
  return [
    "Usage:",
    "  ur guardrails list [--json]",
    "  ur guardrails init [--force]",
    "  ur guardrails validate [--json]",
    '  ur guardrails check "<text>" [--phase input|output] [--tool <name>] [--dry-run] [--json]',
    "  ur guardrails check --file <path> [--phase ...] [--tool ...]",
    "",
    "Rules live in .ur/guardrails/*.json (regex | contains | pii | maxLength | jsonSchema | llm).",
    'A "block" rule trips the wire; it also layers into the `ur agent-task pr` self-review gate.'
  ].join(`
`);
}
var call = async (args) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const action = tokens.find((token) => !token.startsWith("--")) ?? "list";
  if (action === "help")
    return { type: "text", value: usage() };
  if (action === "init") {
    const result = scaffoldGuardrails(cwd, { force: tokens.includes("--force") });
    return {
      type: "text",
      value: result.created ? `Created ${result.path}` : `Kept existing ${result.path} (use --force to overwrite)`
    };
  }
  const config = loadGuardrails(cwd);
  if (action === "list") {
    if (json)
      return { type: "text", value: JSON.stringify(config, null, 2) };
    if (config.rules.length === 0) {
      return { type: "text", value: "No guardrails yet. Create the starter set: ur guardrails init" };
    }
    const lines = ["Guardrails", ""];
    for (const rule of config.rules) {
      lines.push(`  [${rule.action ?? "block"}] ${rule.id} (${rule.kind}, ${rule.phase ?? "both"})` + `${rule.tools?.length ? ` tools=${rule.tools.join(",")}` : ""}` + `${rule.description ? ` — ${rule.description}` : ""}`);
    }
    return { type: "text", value: lines.join(`
`) };
  }
  if (action === "validate") {
    const validation = validateGuardrails(config);
    if (json)
      return { type: "text", value: JSON.stringify(validation, null, 2) };
    const lines = [
      `Guardrails: ${config.rules.length} rule(s)`,
      validation.valid ? "Valid: yes" : "Valid: no"
    ];
    for (const error of validation.errors)
      lines.push(`  error: ${error}`);
    for (const warning of validation.warnings)
      lines.push(`  warn:  ${warning}`);
    return { type: "text", value: lines.join(`
`) };
  }
  if (action === "check") {
    const filePath = optionValue(tokens, "--file");
    let text;
    if (filePath) {
      if (!existsSync(filePath)) {
        return { type: "text", value: `File not found: ${filePath}` };
      }
      text = readFileSync(filePath, "utf-8");
    } else {
      text = tokens.filter((token) => !token.startsWith("--") && token !== "check").join(" ");
    }
    if (!text)
      return { type: "text", value: usage() };
    const phase = optionValue(tokens, "--phase") ?? "both";
    const decision = await evaluateGuardrails(config, text, {
      phase,
      toolName: optionValue(tokens, "--tool"),
      dryRun: tokens.includes("--dry-run")
    });
    return { type: "text", value: formatDecision(decision, json) };
  }
  return { type: "text", value: usage() };
};
var init_guardrails2 = __esm(() => {
  init_guardrails();
  init_argumentSubstitution();
  init_cwd();
});
init_guardrails2();

export {
  call
};
