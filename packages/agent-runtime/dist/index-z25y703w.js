import {
  init_cliStepRunner,
  makeCliStepRunner,
  makeDryRunner
} from "./index-zn5x3nwj.js";
import {
  init_json,
  safeParseJSON
} from "./index-wxsgjqjk.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-wred0kdg.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/crew.ts
import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
function crewDir(cwd) {
  return join(cwd, ".ur", "crew");
}
function sanitizeCrewName(name) {
  return name.trim().replace(/[^a-zA-Z0-9_-]/g, "-");
}
function crewPath(cwd, name) {
  return join(crewDir(cwd), `${sanitizeCrewName(name)}.json`);
}
function isCrewSpec(value) {
  return !!value && typeof value === "object" && Array.isArray(value.tasks) && typeof value.goal === "string";
}
function listCrews(cwd) {
  const dir = crewDir(cwd);
  if (!existsSync(dir))
    return [];
  return readdirSync(dir).filter((file) => file.endsWith(".json")).map((file) => safeParseJSON(readFileSync(join(dir, file), "utf-8"), false)).filter(isCrewSpec);
}
function loadCrew(cwd, name) {
  const path = crewPath(cwd, name);
  if (!existsSync(path))
    return null;
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  return isCrewSpec(parsed) ? parsed : null;
}
function saveCrew(cwd, spec) {
  mkdirSync(crewDir(cwd), { recursive: true });
  writeFileSync(crewPath(cwd, spec.name), `${JSON.stringify(spec, null, 2)}
`);
}
function deleteCrew(cwd, name) {
  const path = crewPath(cwd, name);
  if (!existsSync(path))
    return false;
  unlinkSync(path);
  return true;
}
function decomposeGoal(goal) {
  const clean = goal.replace(/\\n/g, `
`).trim();
  if (!clean)
    return [];
  const numberMatches = clean.match(/\b\d+[.)]\s+/g);
  if (numberMatches && numberMatches.length >= 2) {
    const parts = clean.split(/\s*\b\d+[.)]\s+/).map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2)
      return parts;
  }
  const bulletMatches = clean.match(/(?:^|\n)\s*[-*]\s+/g);
  if (bulletMatches && bulletMatches.length >= 2) {
    const parts = clean.split(/(?:^|\n)\s*[-*]\s+/).map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2)
      return parts;
  }
  const lines = clean.split(`
`).map((line) => line.trim()).filter(Boolean);
  if (lines.length >= 2)
    return lines;
  const byConjunction = clean.split(/\s*(?:,?\s+(?:and then|then|and)\s+)\s*/i).map((part) => part.trim()).filter(Boolean);
  if (byConjunction.length >= 2 && byConjunction.length <= 6)
    return byConjunction;
  return [clean];
}
function makeTask(index, instruction, goal) {
  const title = instruction.length > 72 ? `${instruction.slice(0, 69)}...` : instruction;
  return {
    id: `t${index + 1}`,
    title,
    prompt: `Overall goal: ${goal}

Your subtask: ${instruction}

Complete only this subtask. End your reply with VERDICT: PASS if you finished it, or VERDICT: FAIL if you could not.`,
    status: "todo"
  };
}
function makeTaskFromDecomposed(task, goal) {
  const title = task.goal.length > 72 ? `${task.goal.slice(0, 69)}...` : task.goal;
  const files = task.filesTouched.length ? `
Files touched: ${task.filesTouched.join(", ")}` : "";
  const risk = `
Risk level: ${task.risk}`;
  const tests = `
Tests required: ${task.testsRequired.join(", ")}`;
  const rollback = `
Rollback point: ${task.rollbackPoint}`;
  return {
    id: task.id,
    title,
    prompt: `Overall goal: ${goal}

Your subtask: ${task.goal}${files}${risk}${tests}${rollback}

Complete only this subtask. End your reply with VERDICT: PASS if you finished it, or VERDICT: FAIL if you could not.`,
    status: "todo",
    filesTouched: task.filesTouched,
    risk: task.risk,
    testsRequired: task.testsRequired,
    rollbackPoint: task.rollbackPoint
  };
}
function createCrew(cwd, name, goal, options = {}) {
  const now = new Date().toISOString();
  let tasks;
  if (options.decomposed && options.decomposed.length > 0) {
    tasks = options.decomposed.map((task) => makeTaskFromDecomposed(task, goal));
  } else {
    const instructions = options.tasks && options.tasks.length > 0 ? options.tasks : decomposeGoal(goal);
    tasks = instructions.map((instruction, index) => makeTask(index, instruction, goal));
  }
  const spec = {
    version: 1,
    name: sanitizeCrewName(name),
    goal: goal.trim(),
    lead: options.lead ?? "general-purpose",
    createdAt: now,
    updatedAt: now,
    tasks
  };
  saveCrew(cwd, spec);
  return spec;
}
function addCrewTask(cwd, name, instruction) {
  const spec = loadCrew(cwd, name);
  if (!spec)
    return null;
  const task = makeTask(spec.tasks.length, instruction, spec.goal);
  const updated = { ...spec, updatedAt: new Date().toISOString(), tasks: [...spec.tasks, task] };
  saveCrew(cwd, updated);
  return updated;
}
function claimNextTask(cwd, name, worker) {
  const spec = loadCrew(cwd, name);
  if (!spec)
    return null;
  const task = spec.tasks.find((item) => item.status === "todo");
  if (!task)
    return null;
  task.status = "claimed";
  task.assignee = worker;
  task.claimedAt = new Date().toISOString();
  spec.updatedAt = task.claimedAt;
  saveCrew(cwd, spec);
  return task;
}
function completeTask(cwd, name, taskId, result) {
  const spec = loadCrew(cwd, name);
  if (!spec)
    return null;
  const task = spec.tasks.find((item) => item.id === taskId);
  if (!task)
    return null;
  task.status = result.status;
  task.result = result.output?.slice(0, 2000);
  task.verdict = result.verdict ?? null;
  if (result.worktree)
    task.worktree = result.worktree;
  task.finishedAt = new Date().toISOString();
  spec.updatedAt = task.finishedAt;
  saveCrew(cwd, spec);
  return spec;
}
function reopenClaimed(cwd, name) {
  const spec = loadCrew(cwd, name);
  if (!spec)
    return null;
  let changed = false;
  for (const task of spec.tasks) {
    if (task.status === "claimed") {
      task.status = "todo";
      task.assignee = undefined;
      changed = true;
    }
  }
  if (changed) {
    spec.updatedAt = new Date().toISOString();
    saveCrew(cwd, spec);
  }
  return spec;
}
function crewProgress(spec) {
  return {
    total: spec.tasks.length,
    done: spec.tasks.filter((t) => t.status === "done").length,
    failed: spec.tasks.filter((t) => t.status === "failed").length,
    todo: spec.tasks.filter((t) => t.status === "todo").length,
    claimed: spec.tasks.filter((t) => t.status === "claimed").length
  };
}
function taskToStep(task, lead) {
  return { id: task.id, name: task.title, agent: lead, prompt: task.prompt };
}
async function ensureWorktree(cwd, crew, worker) {
  const path = join(crewDir(cwd), ".worktrees", `${crew}-${worker}`);
  const branch = `ur/crew/${crew}/${worker}`;
  if (existsSync(path))
    return path;
  mkdirSync(join(crewDir(cwd), ".worktrees"), { recursive: true });
  const result = await execFileNoThrowWithCwd("git", ["worktree", "add", "-b", branch, path], { cwd, timeout: 60000, preserveOutputOnError: true });
  return result.code === 0 ? path : null;
}
async function runCrew(name, options) {
  const cwd = options.cwd;
  const baseSpec = loadCrew(cwd, name);
  if (!baseSpec)
    throw new Error(`Crew not found: ${name}`);
  reopenClaimed(cwd, name);
  const workerCount = Math.max(1, options.workers ?? 1);
  const lead = baseSpec.lead;
  const handled = [];
  const makeRunner = (workerCwd) => {
    if (options.runnerFor)
      return options.runnerFor(workerCwd);
    return options.dryRun ? makeDryRunner() : makeCliStepRunner({
      cwd: workerCwd,
      maxTurns: options.maxTurns,
      skipPermissions: options.skipPermissions
    });
  };
  async function worker(workerId) {
    let count = 0;
    let workerCwd = cwd;
    if (options.worktrees && !options.dryRun && !options.runnerFor) {
      const wt = await ensureWorktree(cwd, name, workerId);
      if (wt)
        workerCwd = wt;
    }
    const runner = makeRunner(workerCwd);
    for (;; ) {
      const task = claimNextTask(cwd, name, workerId);
      if (!task)
        break;
      options.onEvent?.({ kind: "claim", worker: workerId, taskId: task.id, title: task.title });
      const out = await runner({ step: taskToStep(task, lead), iteration: 1, priorOutputs: {} });
      const status = out.isError || out.verdict === "FAIL" ? "failed" : "done";
      completeTask(cwd, name, task.id, {
        status,
        output: out.output,
        verdict: out.verdict,
        worktree: workerCwd === cwd ? undefined : workerCwd
      });
      handled.push({ worker: workerId, taskId: task.id, status });
      options.onEvent?.({ kind: "done", worker: workerId, taskId: task.id, status, verdict: out.verdict });
      count += 1;
    }
    options.onEvent?.({ kind: "worker-exit", worker: workerId, handled: count });
    return count;
  }
  const workerIds = Array.from({ length: workerCount }, (_, i) => `w${i + 1}`);
  await Promise.all(workerIds.map(worker));
  const finalSpec = loadCrew(cwd, name) ?? baseSpec;
  return { name, workers: workerCount, progress: crewProgress(finalSpec), handled };
}
function formatCrewList(crews, json) {
  if (json)
    return JSON.stringify({ crews: crews.map((c) => ({ name: c.name, goal: c.goal, ...crewProgress(c) })) }, null, 2);
  if (crews.length === 0) {
    return 'No crews yet. Create one with `ur crew create <name> --goal "..."`.';
  }
  const lines = ["Crews", ""];
  for (const crew of crews) {
    const p = crewProgress(crew);
    lines.push(`${crew.name}  (${p.done}/${p.total} done${p.failed ? `, ${p.failed} failed` : ""})`);
    lines.push(`  ${crew.goal}`);
    lines.push("");
  }
  return lines.join(`
`);
}
function formatCrew(spec, json) {
  if (json)
    return JSON.stringify({ ...spec, progress: crewProgress(spec) }, null, 2);
  const p = crewProgress(spec);
  const mark = { todo: "○", claimed: "◐", done: "✓", failed: "✗" };
  const lines = [
    `Crew: ${spec.name}`,
    `Goal: ${spec.goal}`,
    `Lead: ${spec.lead}`,
    `Progress: ${p.done}/${p.total} done, ${p.todo} todo, ${p.claimed} in-progress, ${p.failed} failed`,
    "",
    "Tasks:"
  ];
  for (const task of spec.tasks) {
    lines.push(`  ${mark[task.status]} ${task.id} ${task.title}${task.assignee ? `  [${task.assignee}]` : ""}${task.verdict ? `  (${task.verdict})` : ""}`);
  }
  return lines.join(`
`);
}
function formatRunCrewResult(result, json) {
  if (json)
    return JSON.stringify(result, null, 2);
  const p = result.progress;
  const lines = [
    `Crew ${result.name} ran with ${result.workers} worker(s).`,
    `Handled ${result.handled.length} task(s); ${p.done}/${p.total} done${p.failed ? `, ${p.failed} failed` : ""}.`
  ];
  for (const item of result.handled) {
    lines.push(`  ${item.worker} → ${item.taskId}: ${item.status}`);
  }
  return lines.join(`
`);
}
var init_crew = __esm(() => {
  init_execFileNoThrow();
  init_json();
  init_cliStepRunner();
});

export { listCrews, loadCrew, deleteCrew, decomposeGoal, createCrew, addCrewTask, reopenClaimed, runCrew, formatCrewList, formatCrew, formatRunCrewResult, init_crew };
