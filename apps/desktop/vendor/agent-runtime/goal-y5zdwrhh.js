import {
  init_runWorkflow,
  init_workflows,
  loadWorkflow,
  runWorkflowSpec
} from "./index-zrfny9xn.js";
import"./index-zn5x3nwj.js";
import"./index-wxp81q89.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import"./index-60smdz72.js";
import {
  init_json,
  safeParseJSON
} from "./index-wxsgjqjk.js";
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

// ../../src/services/agents/goals.ts
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
function goalsDir(cwd) {
  return join(cwd, ".ur", "goals");
}
function sanitizeGoalName(name) {
  return name.trim().replace(/[^a-zA-Z0-9_-]/g, "-");
}
function goalPath(cwd, name) {
  return join(goalsDir(cwd), `${sanitizeGoalName(name)}.json`);
}
function listGoals(cwd) {
  const dir = goalsDir(cwd);
  if (!existsSync(dir))
    return [];
  return readdirSync(dir).filter((file) => file.endsWith(".json")).map((file) => safeParseJSON(readFileSync(join(dir, file), "utf-8"), false)).filter((spec) => isGoalSpec(spec)).sort((a, b) => a.updatedAt < b.updatedAt ? 1 : -1);
}
function isGoalSpec(value) {
  return !!value && typeof value === "object" && typeof value.name === "string" && typeof value.objective === "string";
}
function loadGoal(cwd, name) {
  const path = goalPath(cwd, name);
  if (!existsSync(path))
    return null;
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  return isGoalSpec(parsed) ? parsed : null;
}
function saveGoal(cwd, spec) {
  mkdirSync(goalsDir(cwd), { recursive: true });
  writeFileSync(goalPath(cwd, spec.name), `${JSON.stringify(spec, null, 2)}
`);
}
function createGoal(cwd, name, objective, options = {}) {
  const now = new Date().toISOString();
  const spec = {
    version: 1,
    name: sanitizeGoalName(name),
    objective: objective.trim(),
    status: "active",
    createdAt: now,
    updatedAt: now,
    ...options.workflow ? { workflow: options.workflow } : {},
    ...options.pattern ? { pattern: options.pattern } : {},
    notes: []
  };
  saveGoal(cwd, spec);
  return spec;
}
function setGoalStatus(cwd, name, status) {
  const spec = loadGoal(cwd, name);
  if (!spec)
    return null;
  const updated = { ...spec, status, updatedAt: new Date().toISOString() };
  saveGoal(cwd, updated);
  return updated;
}
function addGoalNote(cwd, name, text) {
  const spec = loadGoal(cwd, name);
  if (!spec)
    return null;
  const now = new Date().toISOString();
  const updated = {
    ...spec,
    updatedAt: now,
    notes: [...spec.notes, { at: now, text: text.trim() }]
  };
  saveGoal(cwd, updated);
  return updated;
}
function deleteGoal(cwd, name) {
  const path = goalPath(cwd, name);
  if (!existsSync(path))
    return false;
  unlinkSync(path);
  return true;
}
function formatGoalList(goals, json) {
  if (json)
    return JSON.stringify({ goals }, null, 2);
  if (goals.length === 0) {
    return 'No goals yet. Create one with `ur goal add <name> --objective "..."`.';
  }
  const lines = ["Goals", ""];
  for (const goal of goals) {
    lines.push(`${STATUS_MARK[goal.status]} ${goal.name} [${goal.status}]`);
    lines.push(`  ${goal.objective}`);
    if (goal.workflow)
      lines.push(`  Workflow: ${goal.workflow}`);
    if (goal.notes.length)
      lines.push(`  Progress notes: ${goal.notes.length} (latest: ${goal.notes[goal.notes.length - 1].text})`);
    lines.push("");
  }
  return lines.join(`
`);
}
function formatGoal(goal, json) {
  if (json)
    return JSON.stringify(goal, null, 2);
  const lines = [
    `Goal: ${goal.name}`,
    `Status: ${goal.status}`,
    `Objective: ${goal.objective}`,
    `Created: ${goal.createdAt}`,
    `Updated: ${goal.updatedAt}`
  ];
  if (goal.workflow)
    lines.push(`Workflow: ${goal.workflow}`);
  if (goal.pattern)
    lines.push(`Pattern: ${goal.pattern}`);
  if (goal.notes.length) {
    lines.push("", "Progress log:");
    for (const note of goal.notes)
      lines.push(`  ${note.at}  ${note.text}`);
  }
  return lines.join(`
`);
}
var STATUS_MARK;
var init_goals = __esm(() => {
  init_json();
  STATUS_MARK = {
    active: "●",
    paused: "◌",
    done: "✓",
    abandoned: "✗"
  };
});

// ../../src/commands/goal/goal.ts
function option(tokens, name) {
  const index = tokens.indexOf(name);
  if (index === -1)
    return;
  return tokens[index + 1];
}
function positionals(tokens) {
  const withValue = new Set(["--objective", "--workflow", "--pattern", "--note", "--max-turns"]);
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
    "  ur goal list [--json]",
    '  ur goal add <name> --objective "..." [--workflow <name>] [--pattern <id>] [--json]',
    "  ur goal show <name> [--json]",
    '  ur goal note <name> --note "progress update"',
    "  ur goal resume <name> [--dry-run] [--max-turns N]",
    "  ur goal pause|done|abandon <name>",
    "  ur goal delete <name>"
  ].join(`
`);
}
var call = async (args) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const positional = positionals(tokens);
  const action = positional[0] ?? "list";
  const name = positional[1];
  if (action === "list") {
    return { type: "text", value: formatGoalList(listGoals(cwd), json) };
  }
  if (action === "add" || action === "create") {
    const objective = option(tokens, "--objective");
    if (!name || !objective)
      return { type: "text", value: usage() };
    const spec = createGoal(cwd, name, objective, {
      workflow: option(tokens, "--workflow"),
      pattern: option(tokens, "--pattern")
    });
    return { type: "text", value: json ? formatGoal(spec, true) : `Created goal ${spec.name}.

${formatGoal(spec, false)}` };
  }
  if (!name)
    return { type: "text", value: usage() };
  if (action === "show") {
    const spec = loadGoal(cwd, name);
    if (!spec)
      return { type: "text", value: `Goal not found: ${name}` };
    return { type: "text", value: formatGoal(spec, json) };
  }
  if (action === "note") {
    const text = option(tokens, "--note");
    if (!text)
      return { type: "text", value: 'Provide --note "your progress update".' };
    const spec = addGoalNote(cwd, name, text);
    if (!spec)
      return { type: "text", value: `Goal not found: ${name}` };
    return { type: "text", value: json ? formatGoal(spec, true) : `Logged note on ${spec.name}.` };
  }
  if (action === "pause" || action === "done" || action === "abandon") {
    const status = action === "pause" ? "paused" : action === "done" ? "done" : "abandoned";
    const spec = setGoalStatus(cwd, name, status);
    if (!spec)
      return { type: "text", value: `Goal not found: ${name}` };
    return { type: "text", value: json ? formatGoal(spec, true) : `Goal ${spec.name} is now ${spec.status}.` };
  }
  if (action === "delete" || action === "remove") {
    return {
      type: "text",
      value: deleteGoal(cwd, name) ? `Deleted goal ${name}.` : `Goal not found: ${name}`
    };
  }
  if (action === "resume") {
    const spec = loadGoal(cwd, name);
    if (!spec)
      return { type: "text", value: `Goal not found: ${name}` };
    if (!spec.workflow) {
      return {
        type: "text",
        value: `Goal ${spec.name} has no linked workflow. Run \`ur route ${JSON.stringify(spec.objective)}\` to pick an approach, then add one with --workflow.`
      };
    }
    const workflow = loadWorkflow(cwd, spec.workflow);
    if (!workflow) {
      return { type: "text", value: `Linked workflow not found: ${spec.workflow}` };
    }
    const dryRun = tokens.includes("--dry-run");
    const maxTurnsRaw = option(tokens, "--max-turns");
    const result = await runWorkflowSpec(workflow, {
      cwd,
      dryRun,
      resume: true,
      maxTurns: maxTurnsRaw ? Number(maxTurnsRaw) : undefined
    });
    addGoalNote(cwd, name, `Resumed workflow ${spec.workflow}: ${result.status} (${result.steps.filter((s) => s.status === "done").length}/${result.steps.length} steps)`);
    if (result.status === "completed")
      setGoalStatus(cwd, name, "done");
    return {
      type: "text",
      value: json ? JSON.stringify({ goal: spec.name, run: result }, null, 2) : `Resumed goal ${spec.name} via workflow ${spec.workflow}: ${result.status} (${result.steps.filter((s) => s.status === "done").length}/${result.steps.length} steps done).`
    };
  }
  return { type: "text", value: usage() };
};
var init_goal = __esm(() => {
  init_goals();
  init_runWorkflow();
  init_workflows();
  init_argumentSubstitution();
  init_cwd();
});
init_goal();

export {
  call
};
