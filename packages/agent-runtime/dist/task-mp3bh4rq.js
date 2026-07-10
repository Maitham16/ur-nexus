import {
  createBackgroundTask,
  getBackgroundTask,
  init_backgroundRunner,
  listBackgroundTasks,
  startExistingBackgroundTask
} from "./index-488yk5fy.js";
import"./index-eh0s6zsz.js";
import"./index-dadxay6x.js";
import"./index-7y1pnagk.js";
import"./index-801scn8g.js";
import"./index-5jrgxedg.js";
import"./index-j15w02ww.js";
import"./index-ad9qp29k.js";
import {
  init_offlineMode,
  isNetworkRestricted
} from "./index-8ssmkf1y.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-ke69cyc7.js";
import"./index-c2g52y43.js";
import"./index-cmw2ae5x.js";
import"./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import"./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import {
  findGitRoot,
  getDefaultBranch,
  gitExe,
  init_git
} from "./index-a9y6sg4d.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-dsy9thtk.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/prSummary.ts
import { existsSync, readFileSync } from "node:fs";
async function git(cwd, args) {
  return execFileNoThrowWithCwd(gitExe(), args, { cwd, timeout: 30000, preserveOutputOnError: true });
}
async function changedFiles(cwd, base) {
  if (!findGitRoot(cwd))
    return [];
  const baseRef = base ?? "HEAD";
  const [committed, uncommitted, untracked] = await Promise.all([
    git(cwd, ["diff", "--name-only", `${baseRef}...HEAD`]).catch(() => ({ stdout: "", code: 1 })),
    git(cwd, ["diff", "--name-only", "HEAD"]).catch(() => ({ stdout: "", code: 1 })),
    git(cwd, ["ls-files", "--others", "--exclude-standard"]).catch(() => ({ stdout: "", code: 1 }))
  ]);
  const all = new Set;
  for (const result of [committed, uncommitted, untracked]) {
    if (result.code !== 0)
      continue;
    for (const line of result.stdout.split(`
`)) {
      const file = line.trim();
      if (file)
        all.add(file);
    }
  }
  return [...all].sort();
}
async function diffStat(cwd, base) {
  if (!findGitRoot(cwd))
    return;
  const baseRef = base ?? "HEAD";
  const result = await git(cwd, ["diff", "--stat", `${baseRef}...HEAD`]).catch(() => ({ stdout: "", code: 1 }));
  if (result.code !== 0 || !result.stdout.trim())
    return;
  return result.stdout.trim();
}
function detectTests(cwd) {
  const tests = [];
  const pkgPath = `${cwd}/package.json`;
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      for (const name of Object.keys(pkg.scripts ?? {})) {
        if (/^(test|t|check|lint|typecheck|ci)$/.test(name) || /^(test|check|lint):/.test(name)) {
          tests.push(`bun run ${name}`);
        }
      }
    } catch {}
  }
  if (existsSync(`${cwd}/Cargo.toml`))
    tests.push("cargo test");
  if (existsSync(`${cwd}/go.mod`))
    tests.push("go test ./...");
  if (existsSync(`${cwd}/pyproject.toml`) || existsSync(`${cwd}/requirements.txt`)) {
    tests.push("pytest");
  }
  return tests;
}
function defaultRisks(cwd, changedFiles2) {
  const risks = [];
  const sensitive = new Set(["package.json", "bun.lock", "Cargo.lock", "yarn.lock", "pnpm-lock.yaml", "poetry.lock"]);
  for (const file of changedFiles2) {
    if (sensitive.has(file)) {
      risks.push(`Dependency/lockfile changed: ${file}`);
    }
    if (/\.(test|spec)\.(ts|tsx|js|jsx|py|rs|go)$/.test(file)) {
      risks.push(`Test file modified: ${file}`);
    }
  }
  if (!findGitRoot(cwd)) {
    risks.push("Not inside a git repository — no automatic rollback via git.");
  }
  return risks;
}
async function buildPrSummary(options) {
  const { cwd, title, description = "", base, rollbackCommand, testsRun = [], extraRisks = [], extraTodos = [] } = options;
  const files = await changedFiles(cwd, base);
  const stat = await diffStat(cwd, base);
  const detected = detectTests(cwd);
  const risks = [...defaultRisks(cwd, files), ...extraRisks];
  const todos = [];
  if (testsRun.length === 0) {
    todos.push(detected.length ? `Run and record verification: ${detected.join(", ")}.` : "No test command detected — verify manually.");
  }
  todos.push(...extraTodos);
  return {
    title,
    description,
    changedFiles: files,
    testsRun,
    detectedTestCommands: detected,
    risks,
    rollbackCommand: rollbackCommand ?? (findGitRoot(cwd) ? "git reset --hard HEAD" : "manual file restore"),
    remainingTodos: todos,
    diffStat: stat
  };
}
function formatPrSummary(summary, json = false) {
  if (json)
    return JSON.stringify(summary, null, 2);
  const lines = [
    `# ${summary.title}`,
    "",
    "## Summary",
    summary.description || "No summary provided.",
    "",
    "## Changed files",
    ...summary.changedFiles.length ? summary.changedFiles.map((f) => `- ${f}`) : ["- no tracked changes detected"],
    "",
    "## Tests run",
    ...summary.testsRun.length ? summary.testsRun.map((t) => `- ${t}`) : ["- none recorded by UR for this PR handoff"],
    "",
    "## Detected verification commands",
    ...summary.detectedTestCommands.length ? summary.detectedTestCommands.map((t) => `- ${t}`) : ["- no test commands detected"],
    "",
    "## Risks",
    ...summary.risks.length ? summary.risks.map((r) => `- ${r}`) : ["- no obvious risks flagged"],
    "",
    "## Rollback command",
    "```bash",
    summary.rollbackCommand,
    "```",
    "",
    "## Remaining TODOs",
    ...summary.remainingTodos.length ? summary.remainingTodos.map((t) => `- [ ] ${t}`) : ["- none"]
  ];
  if (summary.diffStat) {
    lines.push("", "## Diff stat", "```", summary.diffStat, "```");
  }
  return lines.join(`
`);
}
var init_prSummary = __esm(() => {
  init_execFileNoThrow();
  init_git();
});

// ../../src/commands/task/task.ts
function usage() {
  return [
    "Usage:",
    "  ur task start <name> [--worktree] [--base <branch>] [--model <model>] [--max-turns <n>] [--json]",
    "  ur task run <id> [--dry-run] [--json]",
    "  ur task pr <id> [--create] [--draft] [--base <branch>] [--title <text>] [--body <text>] [--dry-run] [--json]",
    "  ur task list [--json]",
    "  ur task status <id> [--json]"
  ].join(`
`);
}
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
function positionals(tokens) {
  const flagsWithValue = new Set(["--base", "--title", "--body", "--model", "--max-turns"]);
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
async function git2(cwd, args, timeout = 60000) {
  return execFileNoThrowWithCwd(gitExe(), args, { cwd, timeout, preserveOutputOnError: true });
}
async function resolveBase(cwd, explicit) {
  const head = (await git2(cwd, ["rev-parse", "--abbrev-ref", "HEAD"])).stdout.trim();
  const candidates = explicit ? [explicit] : [];
  const def = await getDefaultBranch().catch(() => {
    return;
  });
  if (def)
    candidates.push(def, `origin/${def}`);
  candidates.push("origin/HEAD", "main", "master", "origin/main", "origin/master");
  for (const ref of candidates) {
    if (!ref || ref === head)
      continue;
    const r = await git2(cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
    if (r.code === 0)
      return ref;
  }
  return;
}
function formatTask(task, json) {
  if (json)
    return JSON.stringify(task, null, 2);
  const lines = [
    `Task: ${task.id}`,
    `Status: ${task.status}`,
    `Branch: ${task.branch ?? "none"}`,
    `Worktree: ${task.worktree?.enabled ? task.worktree.path : "disabled"}`,
    `Model: ${task.model ?? "default"}`,
    `Offline: ${task.offline ? "yes" : "no"}`,
    `Log: ${task.logFile}`
  ];
  if (task.pr?.enabled) {
    lines.push(`PR: ${task.pr.created ? "created" : task.pr.error ? `failed (${task.pr.error})` : "pending"}`);
  }
  return lines.join(`
`);
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const pos = positionals(tokens);
  const action = pos[0] ?? "list";
  const cwd = getCwd();
  if (action === "start") {
    const name = pos[1];
    if (!name)
      return { type: "text", value: usage() };
    if (!findGitRoot(cwd)) {
      return { type: "text", value: "task start requires a git repository." };
    }
    const base = await resolveBase(cwd, option(tokens, "--base"));
    const worktree = tokens.includes("--worktree");
    const model = option(tokens, "--model");
    const maxTurns = option(tokens, "--max-turns");
    const offline = tokens.includes("--offline") || isNetworkRestricted();
    const task = createBackgroundTask({
      cwd,
      task: name,
      worktree,
      pr: worktree,
      base,
      title: `UR task: ${name}`,
      body: `This change was produced by \`ur task start ${name}\` running in an isolated UR worktree.`,
      model,
      maxTurns: maxTurns ? parseInt(maxTurns, 10) : undefined,
      offline
    });
    return { type: "text", value: formatTask(task, json) };
  }
  if (action === "run") {
    const id = pos[1];
    if (!id)
      return { type: "text", value: usage() };
    const existing = getBackgroundTask(cwd, id) ?? listBackgroundTasks(cwd).find((t) => t.id.startsWith(id));
    if (!existing)
      return { type: "text", value: `Task ${id} not found.` };
    if (tokens.includes("--offline") && !isNetworkRestricted()) {
      process.env.UR_OFFLINE = "1";
    }
    const result = await startExistingBackgroundTask(cwd, existing.id, {
      dryRun: tokens.includes("--dry-run")
    });
    if (!result)
      return { type: "text", value: `Task ${id} not found.` };
    const task = result.task;
    return {
      type: "text",
      value: json ? JSON.stringify({ task, command: result.command }, null, 2) : `${result.dryRun ? "Would start" : "Started"} task ${task.id}
Command: ${result.command.join(" ")}
Log: ${task.logFile}`
    };
  }
  if (action === "pr") {
    const id = pos[1];
    if (!id)
      return { type: "text", value: usage() };
    const task = getBackgroundTask(cwd, id);
    if (!task)
      return { type: "text", value: `Task ${id} not found.` };
    const worktreePath = task.worktree?.path;
    if (!worktreePath) {
      return { type: "text", value: `Task ${id} was not started with a worktree; cannot create PR.` };
    }
    const base = option(tokens, "--base") ?? task.pr?.base ?? "HEAD";
    const title = option(tokens, "--title") ?? task.pr?.title ?? `UR task: ${task.task}`;
    const body = option(tokens, "--body") ?? task.pr?.body ?? "";
    const draft = tokens.includes("--draft");
    if (tokens.includes("--create")) {
      const dryRun = tokens.includes("--dry-run");
      const args2 = ["pr", "create", "--title", title, "--body", body];
      if (base)
        args2.push("--base", base);
      if (draft)
        args2.push("--draft");
      if (dryRun) {
        const summary3 = await buildPrSummary({ cwd: worktreePath, title, description: body, base });
        return {
          type: "text",
          value: json ? JSON.stringify({ dryRun: true, command: ["gh", ...args2], summary: summary3 }, null, 2) : `Dry run: gh ${args2.map((a) => a.includes(" ") ? JSON.stringify(a) : a).join(" ")}

${formatPrSummary(summary3)}`
        };
      }
      const pr = await execFileNoThrowWithCwd("gh", args2, { cwd: worktreePath, timeout: 5 * 60 * 1000, preserveOutputOnError: true });
      const summary2 = await buildPrSummary({ cwd: worktreePath, title, description: body, base });
      const result = { pr, summary: summary2 };
      return {
        type: "text",
        value: json ? JSON.stringify(result, null, 2) : `${formatPrSummary(summary2)}

PR create ${pr.code === 0 ? "succeeded" : "failed"}:
${pr.stdout}
${pr.stderr || ""}`.trim()
      };
    }
    const summary = await buildPrSummary({ cwd: worktreePath, title, description: body, base });
    return { type: "text", value: json ? JSON.stringify(summary, null, 2) : formatPrSummary(summary) };
  }
  if (action === "list") {
    const tasks = listBackgroundTasks(cwd);
    if (json)
      return { type: "text", value: JSON.stringify({ tasks }, null, 2) };
    if (tasks.length === 0)
      return { type: "text", value: "No tasks." };
    return { type: "text", value: tasks.map((t) => `- ${t.id} [${t.status}] ${t.task}${t.branch ? ` (${t.branch})` : ""}`).join(`
`) };
  }
  if (action === "status") {
    const id = pos[1];
    if (!id)
      return { type: "text", value: usage() };
    const task = getBackgroundTask(cwd, id) ?? listBackgroundTasks(cwd).find((t) => t.id.startsWith(id));
    if (!task)
      return { type: "text", value: `Task ${id} not found.` };
    return { type: "text", value: formatTask(task, json) };
  }
  return { type: "text", value: usage() };
};
var init_task = __esm(() => {
  init_argumentSubstitution();
  init_cwd();
  init_execFileNoThrow();
  init_git();
  init_backgroundRunner();
  init_prSummary();
  init_offlineMode();
});
init_task();

export {
  call
};
