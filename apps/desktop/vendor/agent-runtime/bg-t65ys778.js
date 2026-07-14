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
} from "./index-wrrxw9xc.js";
import"./index-30hhb4zp.js";
import"./index-2pd4r2w9.js";
import"./index-h9kt1sj4.js";
import"./index-df0wfzdw.js";
import"./index-hakw7em9.js";
import"./index-c6n1hema.js";
import"./index-rad7f2cp.js";
import {
  init_offlineMode,
  isNetworkRestricted
} from "./index-b85xt2xy.js";
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
import"./index-6dy59xbm.js";
import"./index-0r3wd4mq.js";
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
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/bg/bg.ts
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
