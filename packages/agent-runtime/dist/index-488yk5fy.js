import {
  init_modelRouter,
  resolveModelForTask
} from "./index-eh0s6zsz.js";
import {
  init_modelPool,
  loadModelPool
} from "./index-dadxay6x.js";
import {
  init_model_doctor,
  listModelCapabilities
} from "./index-7y1pnagk.js";
import {
  appendCommandLog,
  init_commandLog
} from "./index-c2g52y43.js";
import {
  appendRunAction,
  init_runArtifacts,
  initializeResearchTrace,
  writeRunDiff,
  writeRunReport
} from "./index-cmw2ae5x.js";
import {
  init_json,
  safeParseJSON
} from "./index-mwn5bkf6.js";
import {
  findCanonicalGitRoot,
  findGitRoot,
  gitExe,
  init_git
} from "./index-a9y6sg4d.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-dsy9thtk.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/backgroundRunner.ts
import { spawn } from "node:child_process";
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
function now() {
  return new Date().toISOString();
}
function projectRoot(cwd) {
  return findCanonicalGitRoot(cwd) ?? findGitRoot(cwd) ?? cwd;
}
function backgroundDir(cwd) {
  return join(projectRoot(cwd), ".ur", "background");
}
function manifestPath(cwd) {
  return join(backgroundDir(cwd), "tasks.json");
}
function logsDir(cwd) {
  return join(backgroundDir(cwd), "logs");
}
function outputsDir(cwd) {
  return join(backgroundDir(cwd), "outputs");
}
function inboxDir(cwd) {
  return join(backgroundDir(cwd), "inbox");
}
function worktreesDir(cwd) {
  return join(projectRoot(cwd), ".ur", "worktrees");
}
function ensureDirs(cwd) {
  mkdirSync(backgroundDir(cwd), { recursive: true });
  mkdirSync(logsDir(cwd), { recursive: true });
  mkdirSync(outputsDir(cwd), { recursive: true });
  mkdirSync(inboxDir(cwd), { recursive: true });
}
function loadManifest(cwd) {
  const path = manifestPath(cwd);
  if (!existsSync(path))
    return { version: 1, tasks: [] };
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  return parsed && typeof parsed === "object" && Array.isArray(parsed.tasks) ? parsed : { version: 1, tasks: [] };
}
function saveManifest(cwd, manifest) {
  ensureDirs(cwd);
  writeFileSync(manifestPath(cwd), `${JSON.stringify(manifest, null, 2)}
`);
}
function updateTask(cwd, id, fn) {
  const manifest = loadManifest(cwd);
  const task = manifest.tasks.find((t) => t.id === id);
  if (!task)
    return null;
  fn(task);
  task.updatedAt = now();
  saveManifest(cwd, manifest);
  return task;
}
function makeId() {
  return `bg_${Date.now().toString(36)}_${randomUUID().slice(0, 8)}`;
}
function slug(input) {
  return input.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 36) || "task";
}
function cliEntry(bin) {
  return {
    file: bin?.file ?? process.execPath,
    baseArgs: bin?.baseArgs ?? [process.argv[1] ?? ""]
  };
}
function quote(arg) {
  return /^[a-zA-Z0-9_./:=@+-]+$/.test(arg) ? arg : JSON.stringify(arg);
}
function formatCommand(args) {
  return args.map(quote).join(" ");
}
function listBackgroundTasks(cwd) {
  return loadManifest(cwd).tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
function getBackgroundTask(cwd, id) {
  return loadManifest(cwd).tasks.find((t) => t.id === id) ?? null;
}
function readBackgroundLog(cwd, id, tailLines) {
  const task = getBackgroundTask(cwd, id);
  if (!task || !existsSync(task.logFile))
    return null;
  const text = readFileSync(task.logFile, "utf-8");
  if (!tailLines || tailLines <= 0)
    return text;
  return text.split(`
`).slice(-tailLines).join(`
`);
}
function appendBackgroundFeedback(cwd, id, text, source) {
  const task = getBackgroundTask(cwd, id);
  if (!task)
    return null;
  const at = now();
  const entry = {
    at,
    type: "artifact-feedback",
    artifactId: source?.artifactId,
    text
  };
  writeFileSync(task.inboxFile, `${JSON.stringify(entry)}
`, { flag: "a" });
  writeFileSync(task.logFile, `[${at}] steering feedback${source?.artifactId ? ` from artifact ${source.artifactId}` : ""}: ${text}
`, { flag: "a" });
  return updateTask(cwd, id, (t) => {
    t.updatedAt = at;
  });
}
function readBackgroundInbox(cwd, id) {
  const task = getBackgroundTask(cwd, id);
  if (!task || !existsSync(task.inboxFile))
    return null;
  return readFileSync(task.inboxFile, "utf-8");
}
function createBackgroundTask(options) {
  const root = projectRoot(options.cwd);
  ensureDirs(root);
  const id = makeId();
  const createdAt = now();
  const branch = options.worktree ? `ur/bg-${id}-${slug(options.task)}` : undefined;
  const task = {
    id,
    task: options.task,
    status: "queued",
    cwd: root,
    runCwd: root,
    model: options.model,
    routeStrategy: options.routeStrategy,
    maxTurns: options.maxTurns,
    skipPermissions: options.skipPermissions,
    logFile: join(logsDir(root), `${id}.log`),
    outputFile: join(outputsDir(root), `${id}.json`),
    inboxFile: join(inboxDir(root), `${id}.jsonl`),
    branch,
    worktree: options.worktree ? { enabled: true, branch, path: join(worktreesDir(root), branch ?? id) } : undefined,
    pr: options.pr ? {
      enabled: true,
      draft: options.draft,
      base: options.base,
      title: options.title,
      body: options.body,
      push: options.push ?? true
    } : undefined,
    offline: options.offline,
    createdAt,
    updatedAt: createdAt
  };
  const manifest = loadManifest(root);
  manifest.tasks.push(task);
  saveManifest(root, manifest);
  initializeResearchTrace(root, id, {
    kind: "background-task",
    status: "planned",
    task: options.task,
    worktree: options.worktree ?? false,
    pr: options.pr ?? false,
    model: options.model,
    routeStrategy: options.routeStrategy,
    offline: options.offline ?? false
  });
  appendRunAction(root, id, {
    kind: "background-task-created",
    title: options.task,
    status: "planned",
    reason: "create detached local UR background task",
    nextAction: options.dryRun ? "report planned worker command" : "spawn background worker",
    data: { task }
  });
  return task;
}
function buildWorkerCommand(task, bin) {
  const entry = cliEntry(bin);
  return {
    entry,
    command: [...entry.baseArgs, "bg", "worker", task.id]
  };
}
async function resolveTaskEnv(task) {
  const base = { ...process.env };
  const model = task.model ?? await resolveRouteStrategyModel(task);
  if (model) {
    base.UR_MODEL = model;
    base.OLLAMA_MODEL = model;
  }
  if (task.offline) {
    base.UR_OFFLINE = "1";
  }
  return base;
}
async function resolveRouteStrategyModel(task) {
  const strategy = task.routeStrategy;
  if (!strategy)
    return;
  const { models } = await listModelCapabilities();
  return resolveModelForTask(task.task, strategy, loadModelPool(task.cwd), models, {
    localOnly: task.offline ?? false,
    cwd: task.cwd
  });
}
async function spawnBackgroundWorker(task, bin) {
  const { entry, command } = buildWorkerCommand(task, bin);
  const out = openSync(task.logFile, "a");
  const err = openSync(task.logFile, "a");
  try {
    const env = await resolveTaskEnv(task);
    const child = spawn(entry.file, command, {
      cwd: task.cwd,
      detached: true,
      stdio: ["ignore", out, err],
      env
    });
    child.on("error", (error) => {
      appendCommandLog(task.cwd, task.id, {
        command: formatCommand([entry.file, ...command]),
        exitCode: 1,
        stdout: "",
        stderr: error.message,
        reason: "spawn detached background worker process",
        nextAction: "inspect worker spawn failure before retrying"
      });
      updateTask(task.cwd, task.id, (t) => {
        t.status = "failed";
        t.error = error.message;
        t.completedAt = now();
      });
    });
    child.unref();
    updateTask(task.cwd, task.id, (t) => {
      t.workerPid = child.pid;
    });
    appendCommandLog(task.cwd, task.id, {
      command: formatCommand([entry.file, ...command]),
      exitCode: 0,
      stdout: "",
      stderr: "",
      reason: "spawn detached background worker process",
      nextAction: "monitor background task log and output files"
    });
  } finally {
    closeSync(out);
    closeSync(err);
  }
  return [entry.file, ...command];
}
async function startBackgroundTask(options) {
  const task = createBackgroundTask(options);
  const { entry, command } = buildWorkerCommand(task, options.bin);
  if (options.dryRun) {
    return { task, command: [entry.file, ...command], dryRun: true };
  }
  await spawnBackgroundWorker(task, options.bin);
  return { task, command: [entry.file, ...command], dryRun: false };
}
async function startExistingBackgroundTask(cwd, id, options = {}) {
  const task = getBackgroundTask(cwd, id);
  if (!task)
    return null;
  const { entry, command } = buildWorkerCommand(task, options.bin);
  if (options.dryRun) {
    return { task, command: [entry.file, ...command], dryRun: true };
  }
  await spawnBackgroundWorker(task, options.bin);
  return { task, command: [entry.file, ...command], dryRun: false };
}
async function fanoutBackgroundTasks(options) {
  const count = Math.max(1, Math.min(32, Math.floor(options.agents || 1)));
  const results = [];
  for (let i = 1;i <= count; i++) {
    results.push(await startBackgroundTask({
      ...options,
      task: count === 1 ? options.task : `Candidate ${i}/${count}: ${options.task}`
    }));
  }
  return results;
}
async function git(cwd, args, timeout = 60000) {
  return execFileNoThrowWithCwd(gitExe(), args, {
    cwd,
    timeout,
    preserveOutputOnError: true
  });
}
async function setupWorktree(task) {
  if (!task.worktree?.enabled)
    return task.cwd;
  const path = resolve(task.worktree.path ?? join(worktreesDir(task.cwd), task.id));
  const branch = task.worktree.branch ?? `ur/bg-${task.id}`;
  mkdirSync(worktreesDir(task.cwd), { recursive: true });
  if (!existsSync(path)) {
    const result = await git(task.cwd, ["worktree", "add", "-b", branch, path, "HEAD"], 120000);
    if (result.code !== 0) {
      throw new Error(result.stderr || result.error || `git worktree add failed for ${path}`);
    }
  }
  updateTask(task.cwd, task.id, (t) => {
    t.runCwd = path;
    t.worktree = { enabled: true, path, branch };
    t.branch = branch;
  });
  return path;
}
function childPrompt(task) {
  const lines = [
    task.task,
    "",
    "UR background-agent instructions:",
    "- Work locally in this repository and keep UR identity intact.",
    "- Prefer small, reviewable commits and run relevant checks before finishing.",
    "- If this run has a worktree, do not touch the original checkout."
  ];
  if (task.pr?.enabled) {
    lines.push("- This run is expected to produce a pull request; leave the branch ready for PR creation.");
  }
  lines.push(`- Background task id: ${task.id}`);
  lines.push(`- Live steering inbox: ${task.inboxFile}. If it exists or changes, incorporate the latest feedback before finalizing.`);
  return lines.join(`
`);
}
function streamUserMessage(content, priority = "later") {
  return `${JSON.stringify({
    type: "user",
    session_id: "",
    message: { role: "user", content },
    parent_tool_use_id: null,
    uuid: randomUUID(),
    priority
  })}
`;
}
function formatInboxSteering(entry) {
  if (!entry.text?.trim())
    return null;
  const source = entry.artifactId ? ` on artifact ${entry.artifactId}` : "";
  return [
    `Live steering feedback${source}:`,
    entry.text.trim(),
    "",
    "Incorporate this feedback into the current background task. If you are in the middle of an approach that conflicts with this feedback, adjust course before finalizing."
  ].join(`
`);
}
function readInboxEntriesFromOffset(file, offset) {
  if (!existsSync(file))
    return { nextOffset: offset, entries: [] };
  const size = statSync(file).size;
  if (size <= offset)
    return { nextOffset: size, entries: [] };
  const text = readFileSync(file, "utf-8").slice(offset);
  const entries = [];
  for (const line of text.split(`
`)) {
    const trimmed = line.trim();
    if (!trimmed)
      continue;
    const parsed = safeParseJSON(trimmed, false);
    if (parsed && typeof parsed === "object")
      entries.push(parsed);
  }
  return { nextOffset: size, entries };
}
async function runHeadlessAgent(task, cwd) {
  const entry = cliEntry();
  const args = [
    ...entry.baseArgs,
    "-p",
    "--input-format",
    "stream-json",
    "--output-format",
    "stream-json",
    "--verbose"
  ];
  if (task.maxTurns && task.maxTurns > 0)
    args.push("--max-turns", String(task.maxTurns));
  if (task.skipPermissions)
    args.push("--dangerously-skip-permissions");
  const env = task.model ? { ...process.env, UR_MODEL: task.model, OLLAMA_MODEL: task.model } : process.env;
  return await new Promise((resolve2) => {
    const outputFd = openSync(task.outputFile, "a");
    const logFd = openSync(task.logFile, "a");
    let inboxOffset = existsSync(task.inboxFile) ? statSync(task.inboxFile).size : 0;
    let sawResult = false;
    let closedInput = false;
    let cleanedUp = false;
    let closeTimer;
    const closeInputSoon = () => {
      if (closedInput)
        return;
      if (closeTimer)
        clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        if (closedInput)
          return;
        closedInput = true;
        child.stdin.end();
      }, 1000);
    };
    const writeSteering = (text) => {
      if (closedInput || child.stdin.destroyed)
        return;
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = undefined;
      }
      child.stdin.write(streamUserMessage(text, "now"));
      writeFileSync(task.logFile, `[${now()}] injected live steering into agent stdin
`, {
        flag: "a"
      });
      sawResult = false;
    };
    const pumpInbox = () => {
      const read = readInboxEntriesFromOffset(task.inboxFile, inboxOffset);
      inboxOffset = read.nextOffset;
      for (const entry2 of read.entries) {
        const steering = formatInboxSteering(entry2);
        if (steering)
          writeSteering(steering);
      }
      if (sawResult)
        closeInputSoon();
    };
    const child = spawn(entry.file, args, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
      env
    });
    updateTask(task.cwd, task.id, (t) => {
      t.agentPid = child.pid;
    });
    child.stdin.write(streamUserMessage(childPrompt(task), "later"));
    const interval = setInterval(pumpInbox, 500);
    let stdoutBuffer = "";
    child.stdout.on("data", (chunk) => {
      const text = Buffer.from(chunk).toString("utf-8");
      writeFileSync(outputFd, text);
      stdoutBuffer += text;
      for (;; ) {
        const newline = stdoutBuffer.indexOf(`
`);
        if (newline === -1)
          break;
        const line = stdoutBuffer.slice(0, newline);
        stdoutBuffer = stdoutBuffer.slice(newline + 1);
        const parsed = safeParseJSON(line, false);
        if (parsed && typeof parsed === "object" && parsed.type === "result") {
          sawResult = true;
          pumpInbox();
        }
      }
    });
    child.stderr.on("data", (chunk) => {
      writeFileSync(logFd, Buffer.from(chunk).toString("utf-8"));
    });
    const cleanup = () => {
      if (cleanedUp)
        return;
      cleanedUp = true;
      clearInterval(interval);
      if (closeTimer)
        clearTimeout(closeTimer);
      closeSync(outputFd);
      closeSync(logFd);
    };
    child.on("error", (error) => {
      writeFileSync(task.logFile, `
[agent spawn error] ${error.message}
`, { flag: "a" });
      cleanup();
      appendCommandLog(task.cwd, task.id, {
        command: formatCommand([entry.file, ...args]),
        exitCode: 1,
        stdout: "",
        stderr: error.message,
        reason: "run background headless agent",
        nextAction: "mark task failed and inspect background spawn error"
      });
      resolve2(1);
    });
    child.on("close", (code) => {
      cleanup();
      appendCommandLog(task.cwd, task.id, {
        command: formatCommand([entry.file, ...args]),
        exitCode: code ?? 1,
        stdout: existsSync(task.outputFile) ? readFileSync(task.outputFile, "utf-8").slice(-16000) : "",
        stderr: existsSync(task.logFile) ? readFileSync(task.logFile, "utf-8").slice(-8000) : "",
        reason: "run background headless agent",
        nextAction: (code ?? 1) === 0 ? "create PR if requested and mark task completed" : "mark task failed and inspect background log"
      });
      resolve2(code ?? 1);
    });
  });
}
async function commitIfNeeded(task, cwd) {
  const status = await git(cwd, ["status", "--porcelain"]);
  if (status.code !== 0 || !status.stdout.trim())
    return;
  await git(cwd, ["add", "-A"]);
  const title = task.pr?.title ?? `UR background task ${task.id}`;
  const commit = await git(cwd, ["commit", "-m", title], 120000);
  if (commit.code !== 0) {
    throw new Error(commit.stderr || commit.error || "git commit failed");
  }
}
async function createPullRequest(task, cwd) {
  if (!task.pr?.enabled)
    return task.pr;
  const pr = { ...task.pr };
  await commitIfNeeded(task, cwd);
  if (pr.push && task.branch) {
    const push = await git(cwd, ["push", "--set-upstream", "origin", task.branch], 5 * 60000);
    if (push.code !== 0) {
      return {
        ...pr,
        created: false,
        error: push.stderr || push.error || "git push failed",
        stdout: push.stdout,
        stderr: push.stderr
      };
    }
  }
  const args = ["pr", "create"];
  if (pr.title)
    args.push("--title", pr.title);
  if (pr.body)
    args.push("--body", pr.body);
  if (pr.base)
    args.push("--base", pr.base);
  if (pr.draft)
    args.push("--draft");
  if (!pr.title && !pr.body)
    args.push("--fill");
  const gh = await execFileNoThrowWithCwd("gh", args, {
    cwd,
    timeout: 5 * 60000,
    preserveOutputOnError: true
  });
  return {
    ...pr,
    command: ["gh", ...args],
    created: gh.code === 0,
    stdout: gh.stdout,
    stderr: gh.stderr || gh.error,
    error: gh.code === 0 ? undefined : gh.stderr || gh.error || "gh pr create failed"
  };
}
async function runBackgroundWorker(cwd, id) {
  const task = getBackgroundTask(cwd, id);
  if (!task)
    throw new Error(`Background task not found: ${id}`);
  writeFileSync(task.logFile, `[${now()}] worker started for ${id}
`, { flag: "a" });
  updateTask(task.cwd, task.id, (t) => {
    t.status = "running";
    t.workerPid = process.pid;
    t.startedAt = t.startedAt ?? now();
  });
  try {
    const runCwd = await setupWorktree(task);
    writeFileSync(task.logFile, `[${now()}] running in ${runCwd}
`, { flag: "a" });
    appendRunAction(task.cwd, task.id, {
      kind: "background-worker-start",
      title: task.task,
      status: "running",
      reason: "start background worker in resolved run directory",
      nextAction: "run headless agent and collect output",
      data: { runCwd }
    });
    const exitCode = await runHeadlessAgent(task, runCwd);
    const pr = task.pr?.enabled ? await createPullRequest(task, runCwd) : task.pr;
    const completed = updateTask(task.cwd, task.id, (t) => {
      t.exitCode = exitCode;
      t.status = exitCode === 0 && (!pr?.enabled || pr.created !== false) ? "completed" : "failed";
      t.completedAt = now();
      if (pr)
        t.pr = pr;
    });
    writeFileSync(task.logFile, `[${now()}] worker finished with exit ${exitCode}
`, { flag: "a" });
    await captureBackgroundDiff(runCwd, task.cwd, task.id);
    writeRunReport(task.cwd, task.id, formatBackgroundTask(completed ?? task));
    return completed ?? task;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const failed = updateTask(task.cwd, task.id, (t) => {
      t.status = "failed";
      t.error = message;
      t.completedAt = now();
    });
    writeFileSync(task.logFile, `[${now()}] worker failed: ${message}
`, { flag: "a" });
    appendRunAction(task.cwd, task.id, {
      kind: "background-worker-failed",
      title: task.task,
      status: "failed",
      stderr: message,
      reason: "background worker threw before normal completion",
      nextAction: "inspect background log and retry or rollback"
    });
    writeRunReport(task.cwd, task.id, formatBackgroundTask(failed ?? task));
    return failed ?? task;
  }
}
async function captureBackgroundDiff(runCwd, rootCwd, runId) {
  const diff = await execFileNoThrowWithCwd(gitExe(), ["diff", "--no-ext-diff", "--"], {
    cwd: runCwd,
    timeout: 30000,
    preserveOutputOnError: true,
    audit: {
      cwd: rootCwd,
      runId,
      reason: "capture background task research trace diff.patch"
    }
  });
  writeRunDiff(rootCwd, runId, diff.code === 0 ? diff.stdout : `${diff.stdout}
${diff.stderr}`.trim());
}
function stopBackgroundTask(cwd, id) {
  const task = getBackgroundTask(cwd, id);
  if (!task)
    return null;
  const pid = task.agentPid ?? task.workerPid;
  if (pid) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {}
  }
  return updateTask(cwd, id, (t) => {
    t.status = "canceled";
    t.completedAt = now();
  });
}
function formatBackgroundTask(task) {
  const lines = [
    `${task.id} [${task.status}] ${task.task}`,
    `cwd: ${task.cwd}`,
    `run: ${task.runCwd}`,
    `log: ${task.logFile}`,
    `output: ${task.outputFile}`,
    `inbox: ${task.inboxFile}`
  ];
  if (task.workerPid)
    lines.push(`worker pid: ${task.workerPid}`);
  if (task.agentPid)
    lines.push(`agent pid: ${task.agentPid}`);
  if (task.worktree?.path)
    lines.push(`worktree: ${task.worktree.path}`);
  if (task.branch)
    lines.push(`branch: ${task.branch}`);
  if (task.pr?.enabled) {
    lines.push(`pr: ${task.pr.created ? "created" : task.pr.error ? `failed (${task.pr.error})` : "pending"}`);
    if (task.pr.command)
      lines.push(`pr command: ${task.pr.command.map(quote).join(" ")}`);
    if (task.pr.stdout?.trim())
      lines.push(`pr stdout: ${task.pr.stdout.trim()}`);
  }
  if (task.error)
    lines.push(`error: ${task.error}`);
  return lines.join(`
`);
}
function formatBackgroundList(tasks, json) {
  if (json)
    return JSON.stringify({ tasks }, null, 2);
  if (tasks.length === 0)
    return "No background agent runs yet.";
  return [
    "Background agent runs",
    "",
    ...tasks.map((t) => {
      const pr = t.pr?.enabled ? " pr" : "";
      const wt = t.worktree?.enabled ? " worktree" : "";
      return `- ${t.id} [${t.status}]${wt}${pr} ${t.task}`;
    })
  ].join(`
`);
}
var init_backgroundRunner = __esm(() => {
  init_execFileNoThrow();
  init_git();
  init_json();
  init_model_doctor();
  init_modelRouter();
  init_modelPool();
  init_commandLog();
  init_runArtifacts();
});

export { backgroundDir, listBackgroundTasks, getBackgroundTask, readBackgroundLog, appendBackgroundFeedback, readBackgroundInbox, createBackgroundTask, startBackgroundTask, startExistingBackgroundTask, fanoutBackgroundTasks, streamUserMessage, formatInboxSteering, readInboxEntriesFromOffset, commitIfNeeded, createPullRequest, runBackgroundWorker, stopBackgroundTask, formatBackgroundTask, formatBackgroundList, init_backgroundRunner };
