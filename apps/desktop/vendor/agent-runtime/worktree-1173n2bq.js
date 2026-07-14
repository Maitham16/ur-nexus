import {
  init_backgroundRunner,
  listBackgroundTasks
} from "./index-wrrxw9xc.js";
import"./index-30hhb4zp.js";
import"./index-2pd4r2w9.js";
import"./index-h9kt1sj4.js";
import"./index-df0wfzdw.js";
import"./index-hakw7em9.js";
import"./index-c6n1hema.js";
import"./index-rad7f2cp.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
import"./index-jmsjkkjh.js";
import"./index-y4htdtvj.js";
import"./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import"./index-mpmmtc93.js";
import"./index-s5dp14ed.js";
import {
  findGitRoot,
  gitExe,
  init_git
} from "./index-6dy59xbm.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-0r3wd4mq.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-h7h0j06f.js";
import"./index-7h9ddexs.js";
import"./index-f80dj2bz.js";
import"./index-q00jv0fc.js";
import"./index-cs7da0vv.js";
import"./index-ycnb0yeb.js";
import"./index-vpczjthp.js";
import {
  errorMessage,
  init_errors
} from "./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/worktree/worktree.ts
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
