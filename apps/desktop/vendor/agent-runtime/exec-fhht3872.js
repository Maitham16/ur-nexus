import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import {
  gitExe,
  init_git
} from "./index-s1a1wahe.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-wred0kdg.js";
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
  __esm,
  __require
} from "./index-8rxa073f.js";

// ../../src/services/promptPlanning/config.ts
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function bool(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}
function maxAgents(value, fallback) {
  if (typeof value !== "number" || !Number.isFinite(value))
    return fallback;
  return Math.max(1, Math.min(16, Math.floor(value)));
}
function resolvePromptPlanningConfig(settings) {
  const root = asRecord(settings) ?? {};
  const nested = asRecord(root.taskPlanningConfig) ?? asRecord(root.promptPlanning) ?? asRecord(root.nexus) ?? asRecord(root.urAgent) ?? {};
  const value = (key) => nested[key] ?? root[key];
  return {
    taskPlanning: bool(value("taskPlanning"), DEFAULT_PROMPT_PLANNING_CONFIG.taskPlanning),
    parallelAgents: bool(value("parallelAgents"), DEFAULT_PROMPT_PLANNING_CONFIG.parallelAgents),
    maxAgents: maxAgents(value("maxAgents"), DEFAULT_PROMPT_PLANNING_CONFIG.maxAgents),
    showTaskBoard: bool(value("showTaskBoard"), DEFAULT_PROMPT_PLANNING_CONFIG.showTaskBoard),
    strictVerification: bool(value("strictVerification"), DEFAULT_PROMPT_PLANNING_CONFIG.strictVerification)
  };
}
var DEFAULT_PROMPT_PLANNING_CONFIG;
var init_config = __esm(() => {
  DEFAULT_PROMPT_PLANNING_CONFIG = {
    taskPlanning: true,
    parallelAgents: true,
    maxAgents: 3,
    showTaskBoard: true,
    strictVerification: true
  };
});

// ../../src/services/promptPlanning/evidence.ts
import { lstatSync, readdirSync, readlinkSync } from "node:fs";
import { join, relative, sep } from "node:path";
function normalizePath(value) {
  return value.split(sep).join("/");
}
function shouldSkipDir(name) {
  return SKIPPED_DIRS.has(name);
}
function fingerprint(path) {
  try {
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) {
      return `link:${readlinkSync(path)}`;
    }
    if (!stat.isFile())
      return null;
    return `${stat.size}:${Math.round(stat.mtimeMs)}:${stat.mode}`;
  } catch {
    return null;
  }
}
function walk(cwd, dir, files) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.isDirectory() && shouldSkipDir(entry.name))
      continue;
    const absolute = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(cwd, absolute, files);
      continue;
    }
    const value = fingerprint(absolute);
    if (value === null)
      continue;
    files.set(normalizePath(relative(cwd, absolute)), value);
  }
}
function captureWorkspaceFileState(cwd) {
  const files = new Map;
  walk(cwd, cwd, files);
  return { cwd, files };
}
function diffWorkspaceFileState(before, after) {
  const changed = new Set;
  for (const [file, value] of after.files) {
    if (before.files.get(file) !== value)
      changed.add(file);
  }
  for (const file of before.files.keys()) {
    if (!after.files.has(file))
      changed.add(file);
  }
  return [...changed].sort();
}
var SKIPPED_DIRS;
var init_evidence = __esm(() => {
  SKIPPED_DIRS = new Set([
    ".git",
    "node_modules",
    ".turbo",
    ".cache",
    ".next",
    ".vite"
  ]);
});

// ../../src/services/promptPlanning/taskBoard.ts
function pad(value, width) {
  return value.padEnd(width, " ");
}
function publicStatus(task) {
  if (task.status === "pending" || task.status === "ready")
    return "queued";
  if (task.status === "blocked" || task.status === "needs-context") {
    return "needs context";
  }
  if (task.status === "needs-scope")
    return "needs scope";
  if (task.status === "waiting-approval")
    return "waiting approval";
  if (task.status === "paused-review")
    return "paused for review";
  if (task.status === "skipped")
    return "skipped";
  if (task.status === "failed")
    return "failed";
  if (task.status === "finished")
    return "completed";
  return task.status;
}
function isWaiting(task) {
  return [
    "blocked",
    "waiting-approval",
    "needs-scope",
    "needs-context",
    "paused-review"
  ].includes(task.status);
}
function progressSummary(tasks) {
  const finished = tasks.filter((task) => task.status === "finished").length;
  const running = tasks.filter((task) => task.status === "running").length;
  const queued = tasks.filter((task) => task.status === "pending" || task.status === "ready").length;
  const waiting = tasks.filter(isWaiting).length;
  const failed = tasks.filter((task) => task.status === "failed").length;
  const skipped = tasks.filter((task) => task.status === "skipped").length;
  return `Progress: ${finished}/${tasks.length} finished, ${running} running, ${queued} queued, ${waiting} waiting, ${failed} failed, ${skipped} skipped`;
}
function isFinished(task) {
  return task.status === "finished" || task.status === "failed" || task.status === "skipped";
}
function renderTaskBoard(planOrTasks, options = {}) {
  const tasks = Array.isArray(planOrTasks) ? planOrTasks : planOrTasks.tasks;
  const activeAgents = options.activeAgents ?? tasks.filter((task) => task.status === "running").length;
  const maxAgents2 = options.maxAgents ?? (Array.isArray(planOrTasks) ? activeAgents || 1 : planOrTasks.config.maxAgents);
  const orderedTasks = [...tasks].sort((a, b) => a.order - b.order);
  const rows = orderedTasks.map((task) => {
    const status = pad(publicStatus(task), 18);
    const agent = pad(String(task.assignedAgent), 8);
    const check = isFinished(task) ? "[✓]" : "[ ]";
    return `${check} ${task.order}. ${status} | ${agent} | ${task.title}`;
  });
  return [
    "[UR-Nexus Task Board]",
    `Agents: ${activeAgents} active / ${maxAgents2} max`,
    ...rows,
    "",
    progressSummary(tasks)
  ].join(`
`);
}
var init_taskBoard = () => {};

// ../../src/services/promptPlanning/validation.ts
import { existsSync } from "node:fs";
import { isAbsolute, join as join2 } from "node:path";
function issue(code, message, severity = "error", value) {
  return value ? { code, message, severity, value } : { code, message, severity };
}
function normalizeSet(values) {
  return new Set([...values ?? []].map((value) => value.trim()).filter(Boolean));
}
function unique(values) {
  return [...new Set([...values].map((value) => value.trim()).filter(Boolean))];
}
function fileExists(cwd, file, knownFiles) {
  if (knownFiles.has(file))
    return true;
  return existsSync(isAbsolute(file) ? file : join2(cwd, file));
}
function extractClaims(output) {
  const claims = [];
  const filePattern = /\b(?:changed|updated|edited|created|wrote|modified)\s+`?([A-Za-z0-9_./-]+\.[A-Za-z0-9]+)`?/gi;
  for (const match of output.matchAll(filePattern)) {
    if (match[1])
      claims.push({ type: "fileChanged", value: match[1] });
  }
  const commandPattern = /\b(?:ran|executed)\s+`([^`]+)`/gi;
  for (const match of output.matchAll(commandPattern)) {
    if (match[1])
      claims.push({ type: "commandRun", value: match[1] });
  }
  return claims;
}
function validateBeforeExecution(task, context) {
  const issues = [];
  const knownFiles = normalizeSet(context.existingFiles);
  if (task.approvalRequired) {
    issues.push(issue("approval_required", `${task.id} cannot continue safely without approval: ${task.approvalReason ?? "explicit approval is required"}`));
  }
  if (task.status === "blocked" || task.status === "needs-context") {
    issues.push(issue("needs_context", `${task.id} needs context before execution.`));
  }
  if (task.status === "needs-scope") {
    issues.push(issue("needs_scope", `${task.id} needs target scope and authorization confirmation before execution.`));
  }
  if (task.status === "paused-review") {
    issues.push(issue("paused_for_review", `${task.id} is paused for review.`));
  }
  if (task.status === "skipped") {
    issues.push(issue("skipped_by_policy", `${task.id} was skipped by policy.`));
  }
  if (task.input.assumptions.length === 0) {
    issues.push(issue("missing_assumptions", `${task.id} has no explicit assumptions.`));
  }
  for (const file of task.input.requiredFiles) {
    if (!fileExists(context.cwd, file, knownFiles)) {
      issues.push(issue("missing_required_file", `${task.id} references missing required file: ${file}`));
    }
  }
  const errors = issues.filter((entry) => entry.severity === "error");
  return { ok: errors.length === 0, blocked: errors.length > 0, issues };
}
function commandWasRun(claimed, commandsRun) {
  if (commandsRun.has(claimed))
    return true;
  for (const command of commandsRun) {
    if (command.includes(claimed) || claimed.includes(command))
      return true;
  }
  return false;
}
function validateAfterExecution(task, result, context) {
  const issues = [];
  const strict = context.strict !== false;
  const hasObservedFileEvidence = context.actualChangedFiles !== undefined || result.observedChangedFiles !== undefined;
  const actualChangedFiles = normalizeSet(hasObservedFileEvidence ? [
    ...context.actualChangedFiles ?? [],
    ...result.observedChangedFiles ?? []
  ] : [
    ...result.changedFiles ?? [],
    ...result.observedChangedFiles ?? []
  ]);
  const commandsRun = normalizeSet([
    ...context.commandsRun ?? [],
    ...result.commandsRun ?? [],
    ...result.observedCommands ?? []
  ]);
  const output = result.output ?? context.output ?? "";
  const claims = [...result.claims ?? [], ...extractClaims(output)];
  const reportedChangedFiles = unique([
    ...result.reportedChangedFiles ?? [],
    ...hasObservedFileEvidence ? result.changedFiles ?? [] : [],
    ...claims.filter((claim) => claim.type === "fileChanged").map((claim) => claim.value)
  ]);
  const reportedCommands = unique([
    ...result.reportedCommands ?? [],
    ...claims.filter((claim) => claim.type === "commandRun").map((claim) => claim.value)
  ]);
  const unsupportedSeverity = strict ? "error" : "warning";
  if (!result.ok) {
    issues.push(issue("execution_failed", result.error ? `${task.id} execution failed: ${result.error}` : `${task.id} execution failed.`));
  }
  for (const file of reportedChangedFiles) {
    if (!actualChangedFiles.has(file)) {
      issues.push(issue("unsupported_file_change_claim", `${task.id} reported a file change that was not observed: ${file}`, unsupportedSeverity, file));
    }
  }
  for (const file of actualChangedFiles) {
    if (!reportedChangedFiles.includes(file)) {
      issues.push(issue("unreported_file_change", `${task.id} changed a file without reporting it: ${file}`, "warning", file));
    }
  }
  for (const command of reportedCommands) {
    if (!commandWasRun(command, commandsRun)) {
      issues.push(issue("unsupported_command_claim", `${task.id} claimed a command that was not observed: ${command}`, unsupportedSeverity, command));
    }
  }
  if (strict && result.ok && output.trim().length === 0 && actualChangedFiles.size === 0 && commandsRun.size === 0) {
    issues.push(issue("empty_verified_output", `${task.id} produced no output, file changes, or command evidence.`));
  }
  const errors = issues.filter((entry) => entry.severity === "error");
  return { ok: errors.length === 0, blocked: false, issues };
}
var init_validation = () => {};

// ../../src/services/promptPlanning/executor.ts
function cloneTasks(tasks) {
  return tasks.map((task) => ({
    ...task,
    dependencies: [...task.dependencies],
    input: {
      ...task.input,
      assumptions: [...task.input.assumptions],
      requiredFiles: [...task.input.requiredFiles],
      targetFiles: [...task.input.targetFiles],
      resources: [...task.input.resources]
    },
    verificationCriteria: [...task.verificationCriteria],
    fileTargets: [...task.fileTargets],
    approvalPaths: [...task.approvalPaths],
    outsideWorkspacePaths: [...task.outsideWorkspacePaths]
  }));
}
function lockKeys(task) {
  return [...new Set([...task.input.requiredFiles, ...task.input.targetFiles])];
}
function dependenciesFinished(task, tasksById) {
  return task.dependencies.every((id) => tasksById.get(id)?.status === "finished");
}
function dependenciesFailed(task, tasksById) {
  return task.dependencies.some((id) => {
    const status = tasksById.get(id)?.status;
    return [
      "failed",
      "blocked",
      "waiting-approval",
      "needs-scope",
      "needs-context",
      "paused-review",
      "skipped"
    ].includes(status ?? "");
  });
}
function isLocked(task, activeLocks) {
  return lockKeys(task).some((key) => activeLocks.has(key));
}
function acquireLocks(task, activeLocks) {
  for (const key of lockKeys(task))
    activeLocks.add(key);
}
function releaseLocks(task, activeLocks) {
  for (const key of lockKeys(task))
    activeLocks.delete(key);
}
function summary(tasks, records, maxAgentsAllowed, maxAgentsUsed) {
  const taskResults = tasks.map((task) => {
    const record = records.get(task.id);
    if (record)
      return record;
    return {
      taskId: task.id,
      task,
      actualChangedFiles: [],
      reportedChangedFiles: [],
      unreportedChangedFiles: [],
      observedCommands: [],
      reportedCommands: [],
      unverifiedCommandClaims: [],
      outsideWorkspaceReads: [],
      outsideWorkspaceWrites: [],
      approvalDecisions: approvalDecisionFor(task) ? [approvalDecisionFor(task)] : [],
      preVerification: { ok: true, blocked: false, issues: [] }
    };
  });
  return {
    tasks,
    finished: tasks.filter((task) => task.status === "finished").length,
    failed: tasks.filter((task) => task.status === "failed").length,
    blocked: tasks.filter((task) => task.status === "blocked").length,
    waitingApproval: tasks.filter((task) => [
      "waiting-approval",
      "needs-scope",
      "needs-context",
      "paused-review"
    ].includes(task.status)).length,
    skipped: tasks.filter((task) => task.status === "skipped").length,
    maxAgentsAllowed,
    maxAgentsUsed,
    approvalDecisions: uniqueApprovalDecisions(taskResults.flatMap((record) => record.approvalDecisions)),
    outsideWorkspaceReads: unique2(taskResults.flatMap((record) => record.outsideWorkspaceReads)),
    outsideWorkspaceWrites: unique2(taskResults.flatMap((record) => record.outsideWorkspaceWrites)),
    taskResults
  };
}
function unique2(values) {
  return [...new Set([...values].map((value) => value.trim()).filter(Boolean))];
}
function uniqueApprovalDecisions(values) {
  const seen = new Set;
  const decisions = [];
  for (const value of values) {
    const key = `${value.taskId}:${value.status}:${value.action}`;
    if (seen.has(key))
      continue;
    seen.add(key);
    decisions.push(value);
  }
  return decisions;
}
function approvalDecisionFor(task) {
  if (!task.approvalRequired)
    return null;
  return {
    taskId: task.id,
    taskTitle: task.title,
    status: task.status === "skipped" ? "skipped-by-policy" : "waiting-approval",
    reason: task.approvalReason ?? "Explicit approval is required before this action can run.",
    action: task.approvalAction ?? task.description,
    command: task.approvalCommand,
    paths: task.approvalPaths
  };
}
function reportedChangedFiles(result) {
  return unique2([
    ...result?.reportedChangedFiles ?? [],
    ...result?.changedFiles ?? []
  ]);
}
function observedCommands(result) {
  return unique2([
    ...result?.commandsRun ?? [],
    ...result?.observedCommands ?? []
  ]);
}
function reportedCommands(result) {
  return unique2(result?.reportedCommands ?? []);
}
function issueValues(issues, code) {
  return unique2(issues.filter((issue2) => issue2.code === code && issue2.value).map((issue2) => issue2.value));
}
function emitBoard(options, tasks, maxAgents2) {
  const config = {
    ...DEFAULT_PROMPT_PLANNING_CONFIG,
    ...resolvePromptPlanningConfig(options.config)
  };
  if (!config.showTaskBoard)
    return;
  const board = renderTaskBoard(tasks, { maxAgents: maxAgents2 });
  const lastBoard = lastBoardByRun.get(options);
  if (lastBoard === board)
    return;
  lastBoardByRun.set(options, board);
  options.onEvent?.({
    type: "board",
    board,
    tasks
  });
}
function emitStatus(options, task, tasks, lastStatuses, maxAgents2) {
  if (lastStatuses.get(task.id) === task.status)
    return;
  lastStatuses.set(task.id, task.status);
  options.onEvent?.({ type: "status", task, tasks });
  emitBoard(options, tasks, maxAgents2);
}
function waitingStatusFor(task) {
  if (task.status === "needs-scope")
    return "needs-scope";
  if (task.status === "needs-context")
    return "needs-context";
  if (task.status === "paused-review")
    return "paused-review";
  if (task.status === "skipped")
    return "skipped";
  if (task.approvalRequired)
    return "waiting-approval";
  return "needs-context";
}
function runnablePlanningTasks(tasks) {
  return tasks.filter((task) => ["pending", "ready"].includes(task.status));
}
function independentWidth(tasks) {
  const selectedLocks = new Set;
  let width = 0;
  for (const task of runnablePlanningTasks(tasks)) {
    if (task.dependencies.length > 0)
      continue;
    const keys = lockKeys(task);
    if (keys.length > 0 && keys.some((key) => selectedLocks.has(key)))
      continue;
    for (const key of keys)
      selectedLocks.add(key);
    width += 1;
  }
  return width;
}
function usefulAgentCount(tasks, config) {
  if (!config.parallelAgents)
    return 1;
  const runnable = runnablePlanningTasks(tasks);
  if (runnable.length <= 1)
    return 1;
  const width = Math.max(1, independentWidth(tasks));
  if (runnable.length <= 4) {
    return Math.max(1, Math.min(config.maxAgents, 3, width));
  }
  return Math.max(1, Math.min(config.maxAgents, width));
}
async function runOneTask(task, tasks, options, records, lastStatuses, maxAgents2) {
  const config = {
    ...DEFAULT_PROMPT_PLANNING_CONFIG,
    ...resolvePromptPlanningConfig(options.config)
  };
  const before = validateBeforeExecution(task, {
    cwd: options.cwd,
    strict: config.strictVerification
  });
  const record = {
    taskId: task.id,
    task,
    startedAt: new Date().toISOString(),
    actualChangedFiles: [],
    reportedChangedFiles: [],
    unreportedChangedFiles: [],
    observedCommands: [],
    reportedCommands: [],
    unverifiedCommandClaims: [],
    outsideWorkspaceReads: [],
    outsideWorkspaceWrites: [],
    approvalDecisions: approvalDecisionFor(task) ? [approvalDecisionFor(task)] : [],
    preVerification: before
  };
  records.set(task.id, record);
  if (!before.ok) {
    task.status = waitingStatusFor(task);
    record.task = task;
    record.finishedAt = new Date().toISOString();
    emitStatus(options, task, tasks, lastStatuses, maxAgents2);
    return;
  }
  task.status = "running";
  emitStatus(options, task, tasks, lastStatuses, maxAgents2);
  const workspaceBefore = captureWorkspaceFileState(options.cwd);
  let result;
  try {
    result = await options.executeTask(task);
  } catch (error) {
    result = {
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
  const workspaceAfter = captureWorkspaceFileState(options.cwd);
  const actualChangedFiles = unique2([
    ...diffWorkspaceFileState(workspaceBefore, workspaceAfter),
    ...result.observedChangedFiles ?? []
  ]);
  const observed = observedCommands(result);
  const reportedFiles = reportedChangedFiles(result);
  const reportedCommandClaims = reportedCommands(result);
  const outsideWorkspaceReads = unique2(result.outsideWorkspaceReads ?? []);
  const outsideWorkspaceWrites = unique2(result.outsideWorkspaceWrites ?? []);
  const after = validateAfterExecution(task, result, {
    cwd: options.cwd,
    strict: config.strictVerification,
    actualChangedFiles,
    commandsRun: observed,
    output: result.output
  });
  record.execution = result;
  record.actualChangedFiles = actualChangedFiles;
  record.reportedChangedFiles = reportedFiles;
  record.unreportedChangedFiles = issueValues(after.issues, "unreported_file_change");
  record.observedCommands = observed;
  record.reportedCommands = reportedCommandClaims;
  record.unverifiedCommandClaims = issueValues(after.issues, "unsupported_command_claim");
  record.outsideWorkspaceReads = outsideWorkspaceReads;
  record.outsideWorkspaceWrites = outsideWorkspaceWrites;
  record.approvalDecisions = uniqueApprovalDecisions([
    ...record.approvalDecisions,
    ...result.approvalDecisions ?? []
  ]);
  record.postVerification = after;
  record.finishedAt = new Date().toISOString();
  task.status = result.ok && after.ok ? "finished" : "failed";
  emitStatus(options, task, tasks, lastStatuses, maxAgents2);
}
async function runPromptPlan(plan, options) {
  const config = {
    ...DEFAULT_PROMPT_PLANNING_CONFIG,
    ...resolvePromptPlanningConfig(options.config ?? plan.config)
  };
  const tasks = cloneTasks(plan.tasks);
  const tasksById = new Map(tasks.map((task) => [task.id, task]));
  const records = new Map;
  const activeLocks = new Set;
  const running = new Set;
  const lastStatuses = new Map;
  const maxAgentsAllowed = config.parallelAgents ? config.maxAgents : 1;
  const maxAgents2 = usefulAgentCount(tasks, {
    parallelAgents: config.parallelAgents,
    maxAgents: maxAgentsAllowed
  });
  let maxAgentsUsed = 0;
  emitBoard(options, tasks, maxAgentsAllowed);
  while (true) {
    for (const task of tasks) {
      if (task.status === "pending" && dependenciesFailed(task, tasksById)) {
        task.status = "needs-context";
        emitStatus(options, task, tasks, lastStatuses, maxAgentsAllowed);
      }
      if (task.status === "pending" && dependenciesFinished(task, tasksById)) {
        task.status = "ready";
        emitStatus(options, task, tasks, lastStatuses, maxAgentsAllowed);
      }
    }
    const ready = tasks.filter((task) => task.status === "ready" && running.size < maxAgents2 && !isLocked(task, activeLocks));
    for (const task of ready) {
      if (running.size >= maxAgents2)
        break;
      if (isLocked(task, activeLocks))
        continue;
      acquireLocks(task, activeLocks);
      const promise = runOneTask(task, tasks, options, records, lastStatuses, maxAgentsAllowed).finally(() => {
        releaseLocks(task, activeLocks);
        running.delete(promise);
      });
      running.add(promise);
      maxAgentsUsed = Math.max(maxAgentsUsed, running.size);
    }
    if (running.size === 0) {
      const open = tasks.some((task) => ["pending", "ready", "running"].includes(task.status));
      if (!open) {
        return summary(tasks, records, maxAgentsAllowed, maxAgentsUsed);
      }
      for (const task of tasks) {
        if (task.status === "pending" || task.status === "ready") {
          task.status = "needs-context";
          records.set(task.id, {
            taskId: task.id,
            task,
            finishedAt: new Date().toISOString(),
            actualChangedFiles: [],
            reportedChangedFiles: [],
            unreportedChangedFiles: [],
            observedCommands: [],
            reportedCommands: [],
            unverifiedCommandClaims: [],
            outsideWorkspaceReads: [],
            outsideWorkspaceWrites: [],
            approvalDecisions: approvalDecisionFor(task) ? [approvalDecisionFor(task)] : [],
            preVerification: {
              ok: false,
              blocked: true,
              issues: [
                {
                  code: "unsatisfied_dependencies",
                  message: `${task.id} cannot continue because dependencies did not finish.`,
                  severity: "error"
                }
              ]
            }
          });
          emitStatus(options, task, tasks, lastStatuses, maxAgentsAllowed);
        }
      }
      return summary(tasks, records, maxAgentsAllowed, maxAgentsUsed);
    }
    await Promise.race(running);
  }
}
var lastBoardByRun;
var init_executor = __esm(() => {
  init_config();
  init_evidence();
  init_taskBoard();
  init_validation();
  lastBoardByRun = new WeakMap;
});

// ../../src/services/promptPlanning/planner.ts
import { isAbsolute as isAbsolute2 } from "node:path";
function compact(value) {
  return value.replace(/\s+/g, " ").trim();
}
function unique3(values) {
  return [...new Set(values.filter(Boolean))];
}
function titleFromSegment(segment) {
  const cleaned = compact(segment).replace(/^please\s+/i, "").replace(/[.?!]+$/g, "");
  if (cleaned.length <= 64)
    return cleaned || "Clarify requested work";
  return `${cleaned.slice(0, 61).trim()}...`;
}
function extractUrls(text) {
  return unique3([...text.matchAll(URL_PATTERN)].map((match) => match[0]));
}
function extractReferencedFiles(text) {
  const paths = [];
  for (const match of text.matchAll(PATH_PATTERN)) {
    const value = match[1];
    if (!value)
      continue;
    if (value.includes("://"))
      continue;
    paths.push(value.replace(/[),.;:]+$/g, ""));
  }
  for (const match of text.matchAll(ABSOLUTE_PATH_PATTERN)) {
    const value = match[1];
    if (!value)
      continue;
    paths.push(value.replace(/[),.;:]+$/g, ""));
  }
  return unique3(paths);
}
function splitNumberedOrBulletedLines(prompt) {
  const segments = [];
  for (const line of prompt.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:[-*]|\d+[.)])\s+(.+)$/);
    if (match?.[1])
      segments.push(match[1]);
  }
  return segments.length >= 2 ? segments.map(compact) : [];
}
function splitLongPrompt(prompt) {
  const bulletSegments = splitNumberedOrBulletedLines(prompt);
  if (bulletSegments.length > 0)
    return bulletSegments;
  const trimmed = compact(prompt);
  if (trimmed.length < 220 && !/[;\n]/.test(prompt))
    return [trimmed];
  const lines = prompt.split(/\r?\n+/).map(compact).filter(Boolean);
  if (lines.length >= 2)
    return lines;
  const sentenceSegments = trimmed.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map(compact).filter(Boolean);
  if (sentenceSegments.length >= 2)
    return sentenceSegments;
  const directiveSegments = trimmed.split(/\s+(?:then|also|next|finally)\s+/i).map(compact).filter(Boolean);
  return directiveSegments.length >= 2 ? directiveSegments : [trimmed];
}
function needsPreviousTask(segment) {
  return /^(then|after|next|finally|verify|validate|test|run tests|summari[sz]e|report)\b/i.test(segment);
}
function inferRole(segment) {
  if (/\b(plan|analy[sz]e|decompose)\b/i.test(segment))
    return "planner";
  if (/\b(verify|validate|test|check|prove)\b/i.test(segment))
    return "verifier";
  if (/\b(report|summari[sz]e|release notes|changelog)\b/i.test(segment)) {
    return "reporter";
  }
  return "executor";
}
function isCriticallyAmbiguous(segment) {
  const text = compact(segment).toLowerCase();
  if (!text)
    return true;
  return /^(do|fix|update|improve|change|make|handle|clean up)(\s+(it|this|that|things?|stuff|everything))?\.?$/.test(text);
}
function extractCommand(segment) {
  const backtickCommand = segment.match(/`([^`]+)`/)?.[1];
  if (backtickCommand)
    return compact(backtickCommand);
  const runCommand = segment.match(/\b(?:run|execute)\s+(.+)$/i)?.[1];
  if (runCommand && /(?:\s|^)(?:rm|curl|wget|nmap|sqlmap|git|npm|bun|ssh|scp|kubectl|terraform)\b/.test(runCommand)) {
    return compact(runCommand);
  }
  if (DESTRUCTIVE_PATTERN.test(segment) || NETWORK_PATTERN.test(segment) || SECURITY_PATTERN.test(segment)) {
    return compact(segment);
  }
  return;
}
function isOutsideReadOnly(segment, outsidePaths) {
  return outsidePaths.length > 0 && READ_PATTERN.test(segment) && !WRITE_PATTERN.test(segment);
}
function riskSignals(segment, outsidePaths) {
  const signals = [];
  if (DESTRUCTIVE_PATTERN.test(segment))
    signals.push("destructive command");
  if (NETWORK_PATTERN.test(segment))
    signals.push("network or external-system action");
  if (CREDENTIAL_PATTERN.test(segment))
    signals.push("credential-sensitive access");
  if (SECURITY_PATTERN.test(segment))
    signals.push("security research scope");
  if (outsidePaths.length > 0 && !isOutsideReadOnly(segment, outsidePaths)) {
    signals.push("outside-workspace modification");
  }
  return signals;
}
function riskLevel(signals, files) {
  if (signals.length > 0)
    return "high";
  if (files.length > 3)
    return "medium";
  return "low";
}
function approvalReasonFor(segment, signals, outsidePaths) {
  if (signals.length === 0)
    return;
  if (SECURITY_PATTERN.test(segment) && !AUTHORIZED_SECURITY_PATTERN.test(segment)) {
    return "Security research needs target scope and authorization confirmation before execution.";
  }
  if (outsidePaths.length > 0 && !isOutsideReadOnly(segment, outsidePaths)) {
    return "Modifying or deleting outside-workspace paths requires explicit approval.";
  }
  if (DESTRUCTIVE_PATTERN.test(segment)) {
    return "Destructive commands require explicit approval before execution.";
  }
  if (NETWORK_PATTERN.test(segment)) {
    return "Network or external-system actions require explicit approval before execution.";
  }
  if (CREDENTIAL_PATTERN.test(segment)) {
    return "Credential-sensitive access requires explicit approval before execution.";
  }
  return "This task requires explicit approval before execution.";
}
function verificationCriteria(segment, files) {
  const criteria = [
    `Result directly addresses: ${compact(segment)}`,
    "Assumptions are stated before execution when context is incomplete.",
    "Unsupported claims are rejected during verification.",
    "Approval-required actions are not executed before approval evidence exists."
  ];
  if (files.length > 0) {
    criteria.push("Referenced files exist before file-specific work starts.");
    criteria.push("Any claimed file changes are backed by actual changed files.");
  }
  return criteria;
}
function makeTask(segment, index, previousTaskId) {
  const files = extractReferencedFiles(segment);
  const outsidePaths = files.filter((file) => isAbsolute2(file));
  const signals = riskSignals(segment, outsidePaths);
  const approvalRequired = signals.length > 0;
  const approvalReason = approvalReasonFor(segment, signals, outsidePaths);
  const command = extractCommand(segment);
  const needsScope = SECURITY_PATTERN.test(segment) && !AUTHORIZED_SECURITY_PATTERN.test(segment);
  const needsContext = isCriticallyAmbiguous(segment);
  const dependencies = previousTaskId && needsPreviousTask(segment) ? [previousTaskId] : [];
  const assumptions = needsContext ? ["Critical target/context is missing; ask for clarification before execution."] : [
    "Use the current workspace as the source of truth.",
    files.length === 0 ? "No specific files were named; discover relevant files before changing code." : "Only touch referenced files unless repository inspection proves another file is required."
  ];
  return {
    id: `task-${index + 1}`,
    order: index + 1,
    title: titleFromSegment(segment),
    description: compact(segment) || "Clarify the requested work.",
    status: needsContext ? "needs-context" : needsScope ? "needs-scope" : approvalRequired ? "waiting-approval" : dependencies.length > 0 ? "pending" : "ready",
    dependencies,
    assignedAgent: inferRole(segment),
    input: {
      prompt: segment,
      assumptions,
      requiredFiles: files,
      targetFiles: files,
      resources: extractUrls(segment)
    },
    expectedOutput: needsContext ? "A clarification request naming the missing target or context." : `Completed work for: ${compact(segment)}`,
    verificationCriteria: verificationCriteria(segment, files),
    fileTargets: files,
    riskLevel: riskLevel(signals, files),
    approvalRequired,
    approvalReason,
    approvalAction: approvalRequired ? compact(segment) || "Approval-required task" : undefined,
    approvalCommand: command,
    approvalPaths: outsidePaths,
    outsideWorkspacePaths: outsidePaths
  };
}
function decomposePrompt(prompt, config) {
  const resolvedConfig = {
    ...DEFAULT_PROMPT_PLANNING_CONFIG,
    ...resolvePromptPlanningConfig(config)
  };
  const originalPrompt = prompt;
  const segments = splitLongPrompt(prompt).filter(Boolean);
  const sourceSegments = segments.length > 0 ? segments : [""];
  let previousTaskId = null;
  const tasks = sourceSegments.map((segment, index) => {
    const task = makeTask(segment, index, previousTaskId);
    previousTaskId = task.id;
    return task;
  });
  return {
    id: `plan-${Date.now().toString(36)}`,
    originalPrompt,
    tasks,
    assumptions: unique3(tasks.flatMap((task) => task.input.assumptions)),
    createdAt: new Date().toISOString(),
    config: resolvedConfig
  };
}
var URL_PATTERN, PATH_PATTERN, ABSOLUTE_PATH_PATTERN, DESTRUCTIVE_PATTERN, WRITE_PATTERN, READ_PATTERN, NETWORK_PATTERN, CREDENTIAL_PATTERN, SECURITY_PATTERN, AUTHORIZED_SECURITY_PATTERN;
var init_planner = __esm(() => {
  init_config();
  URL_PATTERN = /\bhttps?:\/\/[^\s)]+/gi;
  PATH_PATTERN = /(?:^|[\s"'`(])((?:\.{0,2}\/)?(?:[A-Za-z0-9_.@-]+\/)+[A-Za-z0-9_.@/-]+|(?:README|CHANGELOG|RELEASE|SECURITY|CONTRIBUTING|QUALITY|LICENSE)(?:\.[A-Za-z0-9]+)?)\b/g;
  ABSOLUTE_PATH_PATTERN = /(?:^|[\s"'`(])((?:\/[A-Za-z0-9_.@-]+)+\/?)(?=$|[\s"',.;:)])/g;
  DESTRUCTIVE_PATTERN = /\b(rm\s+-[A-Za-z]*r|rm\s+-[A-Za-z]*f|delete|remove|wipe|destroy|drop\s+(?:database|table)|git\s+reset\s+--hard|mkfs|chmod\s+-R\s+777|chown\s+-R)\b/i;
  WRITE_PATTERN = /\b(write|modify|edit|update|delete|remove|rm|move|rename|chmod|chown|overwrite)\b/i;
  READ_PATTERN = /\b(read|inspect|view|cat|open|list|show)\b/i;
  NETWORK_PATTERN = /\b(curl|wget|ssh|scp|rsync|git\s+push|npm\s+(?:publish|install)|bun\s+add|kubectl|terraform\s+apply|deploy|production|cloud)\b/i;
  CREDENTIAL_PATTERN = /\b(credential|api\s*key|secret|token|password|oauth|\.env)\b/i;
  SECURITY_PATTERN = /\b(pentest|penetration\s+test|exploit|sqlmap|nmap|metasploit|payload|vulnerabilit(?:y|ies)|cve|xss|csrf|rce|security\s+scan|attack)\b/i;
  AUTHORIZED_SECURITY_PATTERN = /\b(authorized|authorization|owned|own\s+system|my\s+(?:app|site|server|service)|localhost|127\.0\.0\.1|::1|lab|sandbox|ctf|test\s+target)\b/i;
});

// ../../src/services/promptPlanning/index.ts
var init_promptPlanning = __esm(() => {
  init_config();
  init_evidence();
  init_executor();
  init_planner();
  init_taskBoard();
  init_validation();
});

// ../../src/commands/exec/exec.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join as join3 } from "node:path";
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
function positionals(tokens) {
  const flagsWithValue = new Set([
    "--concurrency",
    "--max-turns",
    "--max-agents",
    "--model",
    "--output-dir"
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
function usage() {
  return [
    "Usage:",
    '  ur exec "prompt" [--concurrency 1] [--max-turns 10] [--model qwen3-coder:480b-cloud] [--output-dir ./outputs]',
    `  echo '{"prompt": "add tests"}' | ur exec --concurrency 4`,
    "  ur exec --file prompts.jsonl --concurrency 2",
    '  ur exec "update docs" --dry-run --max-agents 3',
    '  ur exec "single direct prompt" --no-task-planning',
    '  ur exec "quiet planned prompt" --quiet',
    '  ur exec "warn on unsupported claims" --no-strict-verification'
  ].join(`
`);
}
async function readPrompts(tokens) {
  const file = option(tokens, "--file");
  if (file) {
    const text = await Bun.file(file).text();
    return text.split(`
`).filter(Boolean).map((line) => {
      try {
        const parsed = JSON.parse(line);
        return typeof parsed.prompt === "string" ? parsed.prompt : line;
      } catch {
        return line;
      }
    });
  }
  const args = positionals(tokens);
  if (args.length > 0)
    return args;
  if (!process.stdin.isTTY) {
    const text = await new Promise((resolve) => {
      let data = "";
      process.stdin.on("data", (chunk) => {
        data += chunk;
      });
      process.stdin.on("end", () => resolve(data));
    });
    return text.split(`
`).filter(Boolean).map((line) => {
      try {
        const parsed = JSON.parse(line);
        return typeof parsed.prompt === "string" ? parsed.prompt : line;
      } catch {
        return line;
      }
    });
  }
  return [];
}
function execCommandForPrompt(prompt, opts) {
  const args = ["-p", "--output-format", "json"];
  if (opts.maxTurns !== undefined) {
    args.push("--max-turns", String(opts.maxTurns));
  }
  if (opts.model) {
    args.push("--model", opts.model);
  }
  if (opts.worktree) {
    args.push("--worktree");
  }
  args.push(prompt);
  return [process.execPath, process.argv[1] ?? "", ...args];
}
function planPrompt(prompt, options) {
  const config = resolvePromptPlanningConfig(options);
  if (!config.taskPlanning)
    return {};
  const plan = decomposePrompt(prompt, config);
  return {
    plan,
    taskBoard: config.showTaskBoard ? renderTaskBoard(plan) : undefined
  };
}
function quoteCommandArg(arg) {
  return /^[a-zA-Z0-9_./:=@+-]+$/.test(arg) ? arg : JSON.stringify(arg);
}
function formatCommand(args) {
  return args.map(quoteCommandArg).join(" ");
}
function parseGitStatusFiles(output) {
  const files = [];
  for (const line of output.split(`
`)) {
    if (!line.trim())
      continue;
    const raw = line.slice(3).trim();
    if (!raw)
      continue;
    const renamed = raw.includes(" -> ") ? raw.split(" -> ").at(-1) : raw;
    if (renamed)
      files.push(renamed);
  }
  return [...new Set(files)];
}
async function currentChangedFiles(cwd) {
  const result = await execFileNoThrowWithCwd(gitExe(), ["status", "--porcelain"], {
    cwd,
    timeout: 30000,
    preserveOutputOnError: true,
    audit: false
  });
  return result.code === 0 ? parseGitStatusFiles(result.stdout) : [];
}
function changedFilesSinceBefore(beforeFiles, afterFiles) {
  const before = new Set(beforeFiles);
  return [...afterFiles].filter((file) => !before.has(file));
}
function plannedTaskPrompt(task) {
  return [
    `UR-Nexus planned task ${task.id}: ${task.title}`,
    `Order: ${task.order}`,
    `Risk level: ${task.riskLevel}`,
    `Approval required: ${task.approvalRequired ? "yes" : "not required"}`,
    ...task.approvalReason ? [`Approval reason: ${task.approvalReason}`] : [],
    "",
    task.description,
    "",
    `Assigned role: ${task.assignedAgent}`,
    `File targets: ${task.fileTargets.length > 0 ? task.fileTargets.join(", ") : "not specified"}`,
    "",
    "Assumptions:",
    ...task.input.assumptions.map((value) => `- ${value}`),
    "",
    `Expected output: ${task.expectedOutput}`,
    "",
    "Verification criteria:",
    ...task.verificationCriteria.map((value) => `- ${value}`)
  ].join(`
`);
}
function defaultPlannedTaskExecutor(opts) {
  return async (task) => {
    const command = execCommandForPrompt(plannedTaskPrompt(task), opts);
    const before = await currentChangedFiles(opts.cwd);
    const result = await execFileNoThrowWithCwd(command[0], command.slice(1), {
      cwd: opts.cwd,
      timeout: 10 * 60000,
      preserveOutputOnError: true,
      maxBuffer: 1e7,
      audit: {
        cwd: opts.cwd,
        reason: `execute UR-Nexus planned task ${task.id}`,
        nextAction: "verify task output against planning criteria"
      }
    });
    const after = await currentChangedFiles(opts.cwd);
    const changedFiles = changedFilesSinceBefore(before, after);
    const output = [result.stdout, result.stderr].filter(Boolean).join(`
`);
    return {
      ok: result.code === 0,
      output,
      changedFiles,
      commandsRun: [formatCommand(command)],
      error: result.code === 0 ? undefined : result.error ?? result.stderr
    };
  };
}
function unique4(values) {
  return [...new Set(values.filter(Boolean))];
}
function writeTaskBoardUpdate(opts, board) {
  const writer = opts.writeTaskBoard ?? ((text) => process.stdout.write(text));
  writer(`${board}

`);
}
function taskLine(task) {
  return {
    id: task.id,
    title: task.title,
    agent: String(task.assignedAgent)
  };
}
function isWaitingTask(task) {
  return [
    "blocked",
    "waiting-approval",
    "needs-scope",
    "needs-context",
    "paused-review"
  ].includes(task.status);
}
function buildExecFinalReport(run) {
  const issues = run.taskResults.flatMap((record) => {
    const issues2 = [
      ...record.preVerification.issues,
      ...record.postVerification?.issues ?? []
    ];
    return issues2.map((issue2) => ({
      taskId: record.taskId,
      taskTitle: record.task.title,
      code: issue2.code,
      message: issue2.message,
      severity: issue2.severity
    }));
  });
  const verificationFailures = issues.filter((issue2) => issue2.severity === "error");
  const warnings = issues.filter((issue2) => issue2.severity === "warning");
  const actualChangedFiles = unique4(run.taskResults.flatMap((record) => record.actualChangedFiles));
  const verifiedCommands = unique4(run.taskResults.flatMap((record) => record.observedCommands));
  return {
    summary: {
      total: run.tasks.length,
      finished: run.finished,
      failed: run.failed,
      waitingApproval: run.waitingApproval,
      skipped: run.skipped
    },
    activeAgentsUsed: run.maxAgentsUsed,
    maxAgentsAllowed: run.maxAgentsAllowed,
    finishedTasks: run.tasks.filter((task) => task.status === "finished").map(taskLine),
    failedTasks: run.tasks.filter((task) => task.status === "failed").map(taskLine),
    waitingApprovalTasks: run.tasks.filter(isWaitingTask).map(taskLine),
    skippedTasks: run.tasks.filter((task) => task.status === "skipped").map(taskLine),
    actualChangedFiles,
    unreportedChangedFiles: unique4(run.taskResults.flatMap((record) => record.unreportedChangedFiles)),
    outsideWorkspaceFilesAccessed: run.outsideWorkspaceReads,
    outsideWorkspaceFilesModified: run.outsideWorkspaceWrites,
    verifiedCommands,
    unverifiedCommandClaims: unique4(run.taskResults.flatMap((record) => record.unverifiedCommandClaims)),
    approvalDecisions: run.approvalDecisions,
    filesChanged: actualChangedFiles,
    commandsRun: verifiedCommands,
    verificationFailures,
    warnings,
    remainingLimitations: [
      "File evidence is based on workspace snapshots before and after each task.",
      "Command evidence is confirmed only when the task runner surfaces observed commands.",
      "Detached or provider-internal tool activity is reported as unverified unless surfaced in task execution results."
    ]
  };
}
function formatList(items, empty, render) {
  return items.length > 0 ? items.map(render) : [`- ${empty}`];
}
function formatApprovalDecision(decision) {
  const details = [
    decision.command ? `command: ${decision.command}` : "",
    decision.paths.length > 0 ? `paths: ${decision.paths.join(", ")}` : ""
  ].filter(Boolean);
  return [
    `- ${decision.taskId} | ${decision.status} | ${decision.action}`,
    `  reason: ${decision.reason}`,
    ...details.length > 0 ? [`  ${details.join(" | ")}`] : []
  ].join(`
`);
}
function formatExecFinalReport(report) {
  return [
    "UR-Nexus task summary",
    `Total: ${report.summary.total}`,
    `Finished: ${report.summary.finished}`,
    `Failed: ${report.summary.failed}`,
    `Waiting approval/input: ${report.summary.waitingApproval}`,
    `Skipped: ${report.summary.skipped}`,
    `Agents used: ${report.activeAgentsUsed} active / ${report.maxAgentsAllowed} max`,
    "",
    "Finished tasks:",
    ...formatList(report.finishedTasks, "none", (task) => `- ${task.id} | ${task.agent} | ${task.title}`),
    "",
    "Failed tasks:",
    ...formatList(report.failedTasks, "none", (task) => `- ${task.id} | ${task.agent} | ${task.title}`),
    "",
    "Waiting approval/input tasks:",
    ...formatList(report.waitingApprovalTasks, "none", (task) => `- ${task.id} | ${task.agent} | ${task.title}`),
    "",
    "Skipped tasks:",
    ...formatList(report.skippedTasks, "none", (task) => `- ${task.id} | ${task.agent} | ${task.title}`),
    "",
    "Actual changed files:",
    ...formatList(report.actualChangedFiles, "none observed", (file) => `- ${file}`),
    "",
    "Outside-workspace files accessed:",
    ...formatList(report.outsideWorkspaceFilesAccessed, "none observed", (file) => `- ${file}`),
    "",
    "Outside-workspace files modified:",
    ...formatList(report.outsideWorkspaceFilesModified, "none observed", (file) => `- ${file}`),
    "",
    "Unreported changed files:",
    ...formatList(report.unreportedChangedFiles, "none", (file) => `- ${file}`),
    "",
    "Verified commands:",
    ...formatList(report.verifiedCommands, "none observed", (command) => `- ${command}`),
    "",
    "Unverified command claims:",
    ...formatList(report.unverifiedCommandClaims, "none", (command) => `- ${command}`),
    "",
    "Approval decisions:",
    ...formatList(report.approvalDecisions, "none", formatApprovalDecision),
    "",
    "Verification failures:",
    ...formatList(report.verificationFailures, "none", (failure) => `- ${failure.taskId} | ${failure.code} | ${failure.message}`),
    "",
    "Warnings:",
    ...formatList(report.warnings, "none", (warning) => `- ${warning.taskId} | ${warning.code} | ${warning.message}`),
    "",
    "Remaining limitations:",
    ...report.remainingLimitations.map((item) => `- ${item}`)
  ].join(`
`);
}
function aggregateTask(prompt, plan, run, cwd) {
  const failed = run.failed > 0 || run.blocked > 0 || run.waitingApproval > 0 || run.skipped > 0;
  const now = new Date().toISOString();
  return {
    id: plan.id,
    task: prompt,
    status: failed ? "failed" : "completed",
    cwd,
    runCwd: cwd,
    logFile: "",
    outputFile: "",
    inboxFile: "",
    createdAt: plan.createdAt,
    updatedAt: now,
    completedAt: now
  };
}
async function runPromptPlans(prompts, opts) {
  const config = resolvePromptPlanningConfig(opts.planning);
  const executeTask = opts.executePlannedTask ?? defaultPlannedTaskExecutor(opts);
  const results = new Array(prompts.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(Math.max(1, opts.concurrency), prompts.length) }, async () => {
    for (;; ) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= prompts.length)
        return;
      const prompt = prompts[index];
      const plan = decomposePrompt(prompt, config);
      const boardHistory = [];
      const run = await runPromptPlan(plan, {
        cwd: opts.cwd,
        config,
        executeTask,
        onEvent: (event) => {
          if (event.type === "board") {
            boardHistory.push(event.board);
            if (opts.streamTaskBoard)
              writeTaskBoardUpdate(opts, event.board);
          }
          opts.onPlanningEvent?.(event);
        }
      });
      const completedPlan = { ...plan, tasks: run.tasks };
      const taskBoard = config.showTaskBoard ? renderTaskBoard(completedPlan, { maxAgents: run.maxAgentsAllowed }) : undefined;
      const finalReport = buildExecFinalReport(run);
      const command = finalReport.commandsRun;
      results[index] = {
        task: aggregateTask(prompt, completedPlan, run, opts.cwd),
        command,
        dryRun: false,
        plan: completedPlan,
        taskBoard,
        boardHistory,
        plannedRun: run,
        finalReport,
        finalReportText: formatExecFinalReport(finalReport),
        commandsRun: finalReport.commandsRun,
        changedFiles: finalReport.filesChanged,
        verificationFailures: finalReport.verificationFailures,
        warnings: finalReport.warnings
      };
    }
  });
  await Promise.all(workers);
  return results;
}
async function runExecPool(prompts, opts) {
  const planning = resolvePromptPlanningConfig(opts.planning);
  if (opts.dryRun) {
    return prompts.map((prompt, index) => ({
      task: {
        id: `dry-run-${index}`,
        task: prompt,
        status: "queued",
        cwd: opts.cwd,
        runCwd: opts.cwd,
        logFile: "",
        outputFile: "",
        inboxFile: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      command: execCommandForPrompt(prompt, opts),
      dryRun: true,
      ...planPrompt(prompt, planning)
    }));
  }
  if (planning.taskPlanning) {
    return await runPromptPlans(prompts, { ...opts, planning });
  }
  if (opts.legacyRunner) {
    return await opts.legacyRunner(prompts, opts);
  }
  const {
    fanoutBackgroundTasks,
    startBackgroundTask
  } = await import("./backgroundRunner-8pd5y63y.js");
  if (opts.concurrency === 1 && prompts.length === 1) {
    const command = execCommandForPrompt(prompts[0], opts);
    return [
      await startBackgroundTask({
        cwd: opts.cwd,
        task: prompts[0],
        worktree: opts.worktree,
        model: opts.model,
        maxTurns: opts.maxTurns,
        bin: { file: command[0], baseArgs: command.slice(1, -1) }
      })
    ];
  }
  return await fanoutBackgroundTasks({
    cwd: opts.cwd,
    task: prompts[0],
    agents: Math.min(prompts.length, opts.concurrency),
    worktree: opts.worktree,
    model: opts.model,
    maxTurns: opts.maxTurns
  });
}
function writeOutputFile(outputDir, prompt, content) {
  mkdirSync(outputDir, { recursive: true });
  const slug = prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "task";
  writeFileSync(join3(outputDir, `${slug}.txt`), content);
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const concurrency = Math.max(1, Math.min(32, Number(option(tokens, "--concurrency") ?? "1")));
  const maxTurns = option(tokens, "--max-turns") ? Number(option(tokens, "--max-turns")) : undefined;
  const model = option(tokens, "--model");
  const outputDir = option(tokens, "--output-dir");
  const worktree = tokens.includes("--worktree");
  const dryRun = tokens.includes("--dry-run");
  const quiet = tokens.includes("--quiet");
  const planning = resolvePromptPlanningConfig({
    taskPlanning: !tokens.includes("--no-task-planning"),
    parallelAgents: !tokens.includes("--no-parallel-agents"),
    maxAgents: option(tokens, "--max-agents") ? Number(option(tokens, "--max-agents")) : undefined,
    showTaskBoard: !tokens.includes("--no-task-board"),
    strictVerification: !tokens.includes("--no-strict-verification")
  });
  const prompts = await readPrompts(tokens);
  if (prompts.length === 0) {
    return { type: "text", value: usage() };
  }
  const results = await runExecPool(prompts, {
    cwd: getCwd(),
    concurrency,
    maxTurns,
    model,
    outputDir,
    worktree,
    dryRun,
    planning,
    streamTaskBoard: planning.showTaskBoard && !json && !quiet && !dryRun
  });
  const background = results.some((result) => !result.dryRun) ? await import("./backgroundRunner-8pd5y63y.js") : null;
  const outputs = results.map((result, index) => {
    const prompt = prompts[index] ?? prompts[0];
    const task = result.dryRun ? undefined : background?.getBackgroundTask(getCwd(), result.task.id);
    const log = task ? background.readBackgroundLog(getCwd(), result.task.id) : null;
    const content = result.finalReportText ?? log ?? "";
    if (outputDir && !result.dryRun) {
      writeOutputFile(outputDir, prompt, content);
    }
    return {
      index,
      prompt,
      taskId: result.task.id,
      command: result.command,
      status: task?.status ?? result.task.status,
      output: content || undefined,
      plan: result.plan,
      taskBoard: result.taskBoard,
      boardHistory: result.boardHistory,
      finalReport: result.finalReport,
      commandsRun: result.commandsRun,
      changedFiles: result.changedFiles,
      verificationFailures: result.verificationFailures,
      warnings: result.warnings
    };
  });
  return {
    type: "text",
    value: json ? JSON.stringify(outputs, null, 2) : outputs.map((o) => [
      ...o.taskBoard ? [o.taskBoard, ""] : [],
      ...o.finalReport ? [formatExecFinalReport(o.finalReport), ""] : [],
      `${o.index}: ${o.prompt} -> ${o.status}`
    ].join(`
`)).join(`
`)
  };
};
var init_exec = __esm(() => {
  init_argumentSubstitution();
  init_cwd();
  init_promptPlanning();
  init_execFileNoThrow();
  init_git();
});
init_exec();

export {
  runExecPool,
  readPrompts,
  formatExecFinalReport,
  execCommandForPrompt,
  changedFilesSinceBefore,
  call,
  buildExecFinalReport
};
