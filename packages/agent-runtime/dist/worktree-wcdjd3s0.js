import {
  init_backgroundRunner,
  listBackgroundTasks
} from "./index-488yk5fy.js";
import"./index-eh0s6zsz.js";
import"./index-dadxay6x.js";
import"./index-7y1pnagk.js";
import"./index-801scn8g.js";
import"./index-5jrgxedg.js";
import"./index-j15w02ww.js";
import"./index-ad9qp29k.js";
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
import {
  errorMessage,
  init_errors
} from "./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/worktree/worktree.ts
import { rm } from "fs/promises";
function usage() {
  return [
    "Usage:",
    "  ur worktree list [--json]",
    "  ur worktree status <id> [--json]",
    "  ur worktree clean [--dry-run]"
  ].join(`
`);
}
function formatWorktreeList(tasks, json) {
  const worktrees = tasks.filter((t) => t.worktree?.enabled && t.worktree?.path).map((t) => ({
    id: t.id,
    status: t.status,
    branch: t.branch,
    path: t.worktree.path,
    pr: t.pr?.enabled ? t.pr.created ? "created" : t.pr.error ? `failed (${t.pr.error})` : "pending" : undefined
  }));
  if (json)
    return JSON.stringify({ worktrees }, null, 2);
  if (worktrees.length === 0)
    return "No active agent worktrees.";
  return [
    "UR agent worktrees",
    "",
    ...worktrees.map((w) => `- ${w.id} [${w.status}] ${w.branch}
  ${w.path}${w.pr ? `
  pr: ${w.pr}` : ""}`)
  ].join(`
`);
}
async function git(cwd, args, timeout = 60000) {
  return execFileNoThrowWithCwd(gitExe(), args, { cwd, timeout, preserveOutputOnError: true });
}
async function removeWorktreePath(cwd, path) {
  const root = findGitRoot(cwd);
  if (!root)
    return "Not inside a git repository.";
  const remove = await git(root, ["worktree", "remove", path], 120000);
  if (remove.code !== 0) {
    const force = await git(root, ["worktree", "remove", "--force", path], 120000);
    if (force.code !== 0)
      return `Failed to remove worktree ${path}: ${force.stderr || force.error}`;
  }
  return `Removed worktree ${path}`;
}
var call = async (args) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const dryRun = tokens.includes("--dry-run");
  const pos = tokens.filter((t) => !t.startsWith("--"));
  const action = pos[0] ?? "list";
  if (action === "list" || action === "ls") {
    return { type: "text", value: formatWorktreeList(listBackgroundTasks(cwd), json) };
  }
  if (action === "status" || action === "show") {
    const id = pos[1];
    if (!id)
      return { type: "text", value: usage() };
    const tasks = listBackgroundTasks(cwd);
    const task = tasks.find((t) => t.id === id || t.worktree?.path?.includes(id));
    if (!task)
      return { type: "text", value: `No worktree found matching "${id}".` };
    if (json)
      return { type: "text", value: JSON.stringify(task, null, 2) };
    return {
      type: "text",
      value: [
        `Task: ${task.id} [${task.status}]`,
        `Branch: ${task.branch ?? "none"}`,
        `Worktree: ${task.worktree?.path ?? "none"}`,
        `Log: ${task.logFile}`,
        task.pr?.enabled ? `PR: ${task.pr.created ? "created" : task.pr.error ? `failed (${task.pr.error})` : "pending"}` : "PR: disabled"
      ].join(`
`)
    };
  }
  if (action === "clean") {
    const tasks = listBackgroundTasks(cwd);
    const removable = tasks.filter((t) => t.worktree?.path && (t.status === "completed" || t.status === "failed" || t.status === "canceled"));
    if (removable.length === 0)
      return { type: "text", value: "No completed/failed/canceled worktrees to clean." };
    if (dryRun) {
      return {
        type: "text",
        value: ["Would clean worktrees:", ...removable.map((t) => `- ${t.id}: ${t.worktree.path}`)].join(`
`)
      };
    }
    const results = [];
    for (const task of removable) {
      try {
        const path = task.worktree.path;
        const gitRemove = await removeWorktreePath(cwd, path);
        results.push(gitRemove);
        try {
          await rm(path, { recursive: true, force: true });
        } catch {}
      } catch (e) {
        results.push(`Failed to clean ${task.id}: ${errorMessage(e)}`);
      }
    }
    return { type: "text", value: ["Cleaned worktrees:", ...results].join(`
`) };
  }
  return { type: "text", value: usage() };
};
var init_worktree = __esm(() => {
  init_argumentSubstitution();
  init_cwd();
  init_errors();
  init_backgroundRunner();
  init_git();
  init_execFileNoThrow();
});
init_worktree();

export {
  call
};
