import {
  fanoutBackgroundTasks,
  formatBackgroundList,
  formatBackgroundTask,
  getBackgroundTask,
  init_backgroundRunner,
  listBackgroundTasks,
  readBackgroundLog,
  runBackgroundWorker,
  startBackgroundTask,
  stopBackgroundTask
} from "./index-zxm9dac1.js";
import"./index-kw2wxbby.js";
import"./index-fayv8cwb.js";
import"./index-j4g1j45r.js";
import"./index-qg6cjfb3.js";
import"./index-5jrgxedg.js";
import"./index-hp4vvv8v.js";
import"./index-zn5x3nwj.js";
import {
  init_offlineMode,
  isNetworkRestricted
} from "./index-98nws6xf.js";
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
import"./index-s1a1wahe.js";
import"./index-wred0kdg.js";
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
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/bg/bg.ts
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
function numberOption(tokens, name) {
  const raw = option(tokens, name);
  if (!raw)
    return;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}
function positionals(tokens) {
  const withValue = new Set([
    "--agents",
    "--max-turns",
    "--model",
    "--title",
    "--body",
    "--base",
    "--tail",
    "--route"
  ]);
  const values = [];
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (withValue.has(token)) {
      i++;
      continue;
    }
    if (!token.startsWith("--"))
      values.push(token);
  }
  return values;
}
function usage() {
  return [
    "Usage:",
    '  ur bg run "<task>" [--worktree] [--pr] [--title "..."] [--body "..."] [--base main] [--model m] [--route auto|cheap|strong|default] [--max-turns N] [--skip-permissions] [--dry-run] [--json]',
    '  ur bg fanout "<task>" --agents N [--worktree] [--pr] [--route auto|cheap|strong|default] [--dry-run] [--json]',
    "  ur bg list [--json]",
    "  ur bg status <id> [--json]",
    "  ur bg logs <id> [--tail N]",
    "  ur bg attach <id>",
    "  ur bg kill <id>"
  ].join(`
`);
}
function startOptions(tokens, task) {
  return {
    cwd: getCwd(),
    task,
    worktree: tokens.includes("--worktree"),
    pr: tokens.includes("--pr"),
    draft: tokens.includes("--draft"),
    base: option(tokens, "--base"),
    title: option(tokens, "--title"),
    body: option(tokens, "--body"),
    push: !tokens.includes("--no-push"),
    model: option(tokens, "--model"),
    routeStrategy: option(tokens, "--route"),
    maxTurns: numberOption(tokens, "--max-turns"),
    skipPermissions: tokens.includes("--skip-permissions"),
    dryRun: tokens.includes("--dry-run"),
    offline: tokens.includes("--offline")
  };
}
var call = async (args) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const pos = positionals(tokens);
  const action = pos[0] ?? "list";
  if (action === "list" || action === "ls") {
    return { type: "text", value: formatBackgroundList(listBackgroundTasks(cwd), json) };
  }
  if (action === "run") {
    const task = pos.slice(1).join(" ").trim();
    if (!task)
      return { type: "text", value: usage() };
    const options = startOptions(tokens, task);
    if (options.offline && isNetworkRestricted()) {
      return { type: "text", value: "Background task is already running in offline/local-first mode." };
    }
    if (options.offline) {
      process.env.UR_OFFLINE = "1";
    }
    const result = await startBackgroundTask(options);
    if (json)
      return { type: "text", value: JSON.stringify(result, null, 2) };
    return {
      type: "text",
      value: result.dryRun ? `Background dry run ${result.task.id}
Command: ${result.command.join(" ")}` : `Started background agent ${result.task.id}
Log: ${result.task.logFile}`
    };
  }
  if (action === "fanout") {
    const task = pos.slice(1).join(" ").trim();
    if (!task)
      return { type: "text", value: usage() };
    const results = await fanoutBackgroundTasks({
      ...startOptions(tokens, task),
      agents: numberOption(tokens, "--agents") ?? 3
    });
    if (json)
      return { type: "text", value: JSON.stringify({ results }, null, 2) };
    return {
      type: "text",
      value: results.map((r) => `${r.dryRun ? "Would start" : "Started"} ${r.task.id}: ${r.task.task}`).join(`
`)
    };
  }
  const id = pos[1];
  if (!id)
    return { type: "text", value: usage() };
  if (action === "status" || action === "show") {
    const task = getBackgroundTask(cwd, id);
    if (!task)
      return { type: "text", value: `Background task not found: ${id}` };
    return { type: "text", value: json ? JSON.stringify(task, null, 2) : formatBackgroundTask(task) };
  }
  if (action === "logs" || action === "log" || action === "attach") {
    const log = readBackgroundLog(cwd, id, numberOption(tokens, "--tail") ?? (action === "attach" ? 120 : undefined));
    return { type: "text", value: log ?? `No log found for background task: ${id}` };
  }
  if (action === "kill" || action === "stop" || action === "cancel") {
    const task = stopBackgroundTask(cwd, id);
    return { type: "text", value: task ? `Canceled background task ${id}.` : `Background task not found: ${id}` };
  }
  if (action === "worker") {
    const task = await runBackgroundWorker(cwd, id);
    return { type: "text", value: json ? JSON.stringify(task, null, 2) : formatBackgroundTask(task) };
  }
  return { type: "text", value: usage() };
};
var init_bg = __esm(() => {
  init_argumentSubstitution();
  init_cwd();
  init_backgroundRunner();
  init_offlineMode();
});
init_bg();

export {
  call
};
