import {
  init_backgroundRunner,
  listBackgroundTasks
} from "./index-zxm9dac1.js";
import"./index-kw2wxbby.js";
import"./index-fayv8cwb.js";
import"./index-j4g1j45r.js";
import"./index-qg6cjfb3.js";
import"./index-5jrgxedg.js";
import"./index-hp4vvv8v.js";
import"./index-zn5x3nwj.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import"./index-bdfn6xh6.js";
import"./index-60smdz72.js";
import"./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import"./index-z5aeypvg.js";
import"./index-5jmh1e0k.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-wxsgjqjk.js";
import {
  findGitRoot,
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
import {
  errorMessage,
  init_errors
} from "./index-5h7w9qkc.js";
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
