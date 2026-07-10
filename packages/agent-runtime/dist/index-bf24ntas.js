import {
  decomposeGoal,
  init_crew
} from "./index-9jhyh4w5.js";
import {
  defaultHeadlessRunner,
  init_headlessAgent,
  makeDryHeadlessRunner
} from "./index-j15w02ww.js";
import {
  init_json,
  safeParseJSON
} from "./index-mwn5bkf6.js";
import {
  __esm,
  __require
} from "./index-8rxa073f.js";

// ../../src/services/agents/spec.ts
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";
function specsDir(cwd) {
  return join(cwd, ".ur", "specs");
}
function slugifySpecName(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "spec";
}
function specDir(cwd, name) {
  return join(specsDir(cwd), slugifySpecName(name));
}
function metaPath(cwd, name) {
  return join(specDir(cwd, name), "spec.json");
}
function phaseFile(phase) {
  return `${phase}.md`;
}
function listSpecs(cwd) {
  const dir = specsDir(cwd);
  if (!existsSync(dir))
    return [];
  return readdirSync(dir).filter((entry) => existsSync(join(dir, entry, "spec.json"))).map((entry) => safeParseJSON(readFileSync(join(dir, entry, "spec.json"), "utf-8"), false)).filter((m) => !!m && typeof m === "object" && ("goal" in m));
}
function loadSpec(cwd, name) {
  const path = metaPath(cwd, name);
  if (!existsSync(path))
    return null;
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  return parsed && typeof parsed === "object" ? parsed : null;
}
function saveMeta(cwd, meta) {
  mkdirSync(specDir(cwd, meta.name), { recursive: true });
  writeFileSync(metaPath(cwd, meta.name), `${JSON.stringify(meta, null, 2)}
`);
}
function readPhase(cwd, name, phase) {
  const path = join(specDir(cwd, name), phaseFile(phase));
  return existsSync(path) ? readFileSync(path, "utf-8") : null;
}
function writePhase(cwd, name, phase, body) {
  mkdirSync(specDir(cwd, name), { recursive: true });
  writeFileSync(join(specDir(cwd, name), phaseFile(phase)), body.endsWith(`
`) ? body : `${body}
`);
}
function requirementsTemplate(name, goal) {
  return [
    `# Requirements: ${name}`,
    "",
    `## Goal`,
    goal,
    "",
    `## User stories`,
    `- As a user, I want ${goal.toLowerCase()} so that the outcome is reliable.`,
    "",
    `## Acceptance criteria (EARS)`,
    `1. WHEN the feature is invoked THEN the system SHALL fulfil the goal above.`,
    `2. WHEN an input is invalid THEN the system SHALL fail safely with a clear message.`,
    "",
    `## Non-functional`,
    `- Local-first: no required network calls beyond the local model endpoint.`,
    `- Deterministic, testable core logic.`,
    ""
  ].join(`
`);
}
function designTemplate(name, goal) {
  return [
    `# Design: ${name}`,
    "",
    `## Overview`,
    `Technical approach for: ${goal}`,
    "",
    `## Components`,
    `- Entry point / command surface`,
    `- Core logic (pure, unit-tested)`,
    `- Persistence / state (if any)`,
    "",
    `## Data model`,
    `Describe the key types and state files here.`,
    "",
    `## Risks & trade-offs`,
    `List the main risks and the chosen trade-offs.`,
    ""
  ].join(`
`);
}
function tasksTemplate(name, goal) {
  const subtasks = decomposeGoal(goal);
  const lines = [`# Tasks: ${name}`, "", `Derived from the goal. Check off as each is completed.`, ""];
  subtasks.forEach((task, index) => {
    lines.push(`- [ ] T${index + 1}: ${task}`);
  });
  lines.push("");
  return lines.join(`
`);
}
function createSpec(cwd, name, goal) {
  const now = new Date().toISOString();
  const meta = {
    version: 1,
    name: slugifySpecName(name),
    goal: goal.trim(),
    phase: "requirements",
    approvals: { requirements: false, design: false, tasks: false },
    createdAt: now,
    updatedAt: now
  };
  saveMeta(cwd, meta);
  writePhase(cwd, meta.name, "requirements", requirementsTemplate(meta.name, meta.goal));
  writePhase(cwd, meta.name, "design", designTemplate(meta.name, meta.goal));
  writePhase(cwd, meta.name, "tasks", tasksTemplate(meta.name, meta.goal));
  return meta;
}
function deleteSpec(cwd, name) {
  const dir = specDir(cwd, name);
  if (!existsSync(dir))
    return false;
  rmSync(dir, { recursive: true, force: true });
  return true;
}
function approvePhase(cwd, name, phase) {
  const meta = loadSpec(cwd, name);
  if (!meta)
    return null;
  meta.approvals[phase] = true;
  const next = {
    requirements: "design",
    design: "tasks",
    tasks: "tasks"
  };
  meta.phase = next[phase];
  meta.updatedAt = new Date().toISOString();
  saveMeta(cwd, meta);
  return meta;
}
function parseTasks(markdown) {
  const tasks = [];
  let auto = 0;
  for (const line of markdown.split(`
`)) {
    const match = TASK_RE.exec(line);
    if (!match)
      continue;
    auto++;
    tasks.push({
      id: match[2] ?? `T${auto}`,
      title: match[3].trim(),
      done: match[1].toLowerCase() === "x"
    });
  }
  return tasks;
}
function markTaskDone(markdown, id) {
  return markdown.split(`
`).map((line) => {
    const match = TASK_RE.exec(line);
    if (!match)
      return line;
    const taskId = match[2] ?? null;
    if (taskId === id)
      return line.replace(/\[( )\]/, "[x]");
    return line;
  }).join(`
`);
}
async function runSpec(cwd, name, options) {
  const meta = loadSpec(cwd, name);
  if (!meta)
    throw new Error(`Spec not found: ${name}`);
  if (options.kernel) {
    const { runSpecWithKernel } = await import("./kernelSpec-fsdps1j9.js");
    const kernelResult = await runSpecWithKernel(cwd, name, options.kernel, {
      dryRun: options.dryRun,
      maxTurns: options.maxTurns,
      skipPermissions: options.skipPermissions,
      all: options.all,
      runner: options.runner
    });
    const tasksMd = readPhase(cwd, name, "tasks") ?? "";
    const remaining2 = parseTasks(tasksMd).filter((t) => !t.done).length;
    return { ...kernelResult, remaining: remaining2 };
  }
  const runner = options.runner ?? (options.dryRun ? makeDryHeadlessRunner() : defaultHeadlessRunner());
  const requirements = readPhase(cwd, name, "requirements") ?? "";
  const design = readPhase(cwd, name, "design") ?? "";
  const context = `Requirements:
${requirements}

Design:
${design}`.slice(0, 6000);
  const ran = [];
  let stoppedOnFailure = false;
  for (;; ) {
    const tasksMd = readPhase(cwd, name, "tasks") ?? "";
    const tasks = parseTasks(tasksMd);
    const next = tasks.find((t) => !t.done);
    if (!next)
      break;
    const out = await runner({
      cwd,
      prompt: `You are implementing one task of a specced feature.

${context}

Your task ${next.id}: ${next.title}

Implement only this task, consistent with the requirements and design. End your reply with VERDICT: PASS if complete, or VERDICT: FAIL.`,
      maxTurns: options.maxTurns,
      skipPermissions: options.skipPermissions
    });
    const ok = !out.isError && out.verdict === "PASS";
    options.onEvent?.({ id: next.id, title: next.title, verdict: out.verdict ?? null, isError: !!out.isError });
    ran.push({ id: next.id, title: next.title, status: ok ? "done" : "failed" });
    if (ok && !options.dryRun) {
      writePhase(cwd, name, "tasks", markTaskDone(tasksMd, next.id));
    } else if (ok && options.dryRun) {
      break;
    } else {
      stoppedOnFailure = true;
      break;
    }
    if (!options.all)
      break;
  }
  const remaining = parseTasks(readPhase(cwd, name, "tasks") ?? "").filter((t) => !t.done).length;
  return { name: slugifySpecName(name), ran, remaining, stoppedOnFailure };
}
async function generatePhase(cwd, name, phase, options) {
  const meta = loadSpec(cwd, name);
  if (!meta)
    throw new Error(`Spec not found: ${name}`);
  const runner = options.runner ?? (options.dryRun ? makeDryHeadlessRunner() : defaultHeadlessRunner());
  const priorReq = readPhase(cwd, name, "requirements") ?? "";
  const priorDesign = phase === "tasks" ? readPhase(cwd, name, "design") ?? "" : "";
  const instruction = phase === "requirements" ? `Write a precise requirements.md (goal, user stories, EARS acceptance criteria, non-functional) for: ${meta.goal}` : phase === "design" ? `Write a design.md (overview, components, data model, risks) implementing these requirements:
${priorReq}` : `Write tasks.md as a checkbox list "- [ ] T1: ..." of atomic, ordered implementation tasks for:
${priorReq}
${priorDesign}`;
  const out = await runner({
    cwd,
    prompt: `${instruction}

Return only the markdown document body.`,
    maxTurns: options.maxTurns
  });
  if (!options.dryRun && out.output.trim()) {
    writePhase(cwd, name, phase, out.output.trim());
  }
  return out.output;
}
function formatSpecList(specs, json) {
  if (json)
    return JSON.stringify({ specs }, null, 2);
  if (specs.length === 0)
    return 'No specs yet. Create one with `ur spec init <name> --goal "..."`.';
  const lines = ["Specs", ""];
  for (const spec of specs) {
    lines.push(`${spec.name}  [phase: ${spec.phase}]`);
    lines.push(`  ${spec.goal}`);
    lines.push("");
  }
  return lines.join(`
`);
}
function formatSpecStatus(cwd, meta, json) {
  const tasks = parseTasks(readPhase(cwd, meta.name, "tasks") ?? "");
  const done = tasks.filter((t) => t.done).length;
  if (json) {
    return JSON.stringify({ ...meta, tasks: { total: tasks.length, done } }, null, 2);
  }
  const mark = (ok) => ok ? "✓" : "○";
  const v = meta.verification;
  const vMark = v ? v.verdict === "PASS" ? "✓" : v.verdict === "FAIL" ? "✗" : "◐" : "○";
  const lines = [
    `Spec: ${meta.name}`,
    `Goal: ${meta.goal}`,
    `Phase: ${meta.phase}`,
    `Approvals: ${mark(meta.approvals.requirements)} requirements  ${mark(meta.approvals.design)} design  ${mark(meta.approvals.tasks)} tasks`,
    `Tasks: ${done}/${tasks.length} done`,
    `Verification: ${vMark} ${v ? `${v.verdict} (${v.generatedAt})` : "not run"}`,
    ""
  ];
  for (const task of tasks) {
    lines.push(`  ${task.done ? "✓" : "○"} ${task.id} ${task.title}`);
  }
  return lines.join(`
`);
}
var TASK_RE;
var init_spec = __esm(() => {
  init_json();
  init_crew();
  init_headlessAgent();
  TASK_RE = /^\s*-\s*\[( |x|X)\]\s*(?:(T\d+)\s*:?\s*)?(.*)$/;
});

export { specsDir, slugifySpecName, specDir, phaseFile, listSpecs, loadSpec, readPhase, writePhase, createSpec, deleteSpec, approvePhase, parseTasks, markTaskDone, runSpec, generatePhase, formatSpecList, formatSpecStatus, init_spec };
