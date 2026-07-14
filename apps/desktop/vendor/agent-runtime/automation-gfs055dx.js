import {
  cronToHuman,
  init_cron,
  init_cronTasks,
  nextCronRunMs,
  parseCronExpression
} from "./index-hgk4djez.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
import {
  init_json,
  safeParseJSON
} from "./index-s5dp14ed.js";
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
import"./index-vpczjthp.js";
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/services/agents/scheduler.ts
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
function defaultBin() {
  return { file: process.execPath, args: [process.argv[1] ?? ""] };
}
function schedulerLabel(cwd) {
  const hash = createHash("sha1").update(cwd).digest("hex").slice(0, 8);
  return `com.ur.automation.${hash}`;
}
function detectPlatform() {
  if (process.platform === "darwin")
    return "launchd";
  if (process.platform === "linux")
    return "systemd";
  return "cron";
}
function runDueArgs(config) {
  const bin = config.bin ?? defaultBin();
  return [bin.file, ...bin.args.filter(Boolean), "automation", "run-due"];
}
function launchAgentsDir() {
  return join(homedir(), "Library", "LaunchAgents");
}
function launchdPlistPath(cwd) {
  return join(launchAgentsDir(), `${schedulerLabel(cwd)}.plist`);
}
function buildLaunchdPlist(config) {
  const label = schedulerLabel(config.cwd);
  const interval = config.intervalSec ?? 60;
  const args = runDueArgs(config);
  const programArgs = args.map((arg) => `    <string>${escapeXml(arg)}</string>`).join(`
`);
  const logPath = join(config.cwd, ".ur", "automations", "scheduler.log");
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  <key>ProgramArguments</key>
  <array>
${programArgs}
  </array>
  <key>WorkingDirectory</key>
  <string>${escapeXml(config.cwd)}</string>
  <key>StartInterval</key>
  <integer>${interval}</integer>
  <key>RunAtLoad</key>
  <true/>
  <key>StandardOutPath</key>
  <string>${escapeXml(logPath)}</string>
  <key>StandardErrorPath</key>
  <string>${escapeXml(logPath)}</string>
</dict>
</plist>
`;
}
function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function systemdUnitDir() {
  return join(homedir(), ".config", "systemd", "user");
}
function systemdServiceName(cwd) {
  return `${schedulerLabel(cwd)}.service`;
}
function systemdTimerName(cwd) {
  return `${schedulerLabel(cwd)}.timer`;
}
function buildSystemdService(config) {
  const args = runDueArgs(config).map((arg) => quoteArg(arg)).join(" ");
  return `[Unit]
Description=UR automation run-due (${config.cwd})

[Service]
Type=oneshot
WorkingDirectory=${config.cwd}
ExecStart=${args}
`;
}
function buildSystemdTimer(config) {
  const interval = config.intervalSec ?? 60;
  return `[Unit]
Description=UR automation scheduler timer (${config.cwd})

[Timer]
OnBootSec=${interval}
OnUnitActiveSec=${interval}
AccuracySec=15s
Persistent=true

[Install]
WantedBy=timers.target
`;
}
function buildCronLine(config) {
  const args = runDueArgs(config).map((arg) => quoteArg(arg)).join(" ");
  return `* * * * * cd ${quoteArg(config.cwd)} && ${args} >> ${quoteArg(join(config.cwd, ".ur", "automations", "scheduler.log"))} 2>&1`;
}
function quoteArg(value) {
  return /[\s"'$]/.test(value) ? `"${value.replaceAll('"', "\\\"")}"` : value;
}
function installScheduler(config, platform = detectPlatform()) {
  mkdirSync(join(config.cwd, ".ur", "automations"), { recursive: true });
  if (platform === "launchd") {
    const path = launchdPlistPath(config.cwd);
    mkdirSync(launchAgentsDir(), { recursive: true });
    writeFileSync(path, buildLaunchdPlist(config));
    return {
      platform,
      installed: true,
      path,
      instructions: [
        `Wrote LaunchAgent: ${path}`,
        `Load it now:  launchctl load ${path}`,
        `Stop it:      ur automation uninstall  (or: launchctl unload ${path})`
      ]
    };
  }
  if (platform === "systemd") {
    const dir = systemdUnitDir();
    mkdirSync(dir, { recursive: true });
    const servicePath = join(dir, systemdServiceName(config.cwd));
    const timerPath = join(dir, systemdTimerName(config.cwd));
    writeFileSync(servicePath, buildSystemdService(config));
    writeFileSync(timerPath, buildSystemdTimer(config));
    return {
      platform,
      installed: true,
      path: timerPath,
      instructions: [
        `Wrote service: ${servicePath}`,
        `Wrote timer:   ${timerPath}`,
        `Enable it:     systemctl --user daemon-reload && systemctl --user enable --now ${systemdTimerName(config.cwd)}`,
        `Stop it:       ur automation uninstall`
      ]
    };
  }
  return {
    platform: "cron",
    installed: false,
    instructions: [
      "Add this line to your crontab (run `crontab -e`):",
      "",
      buildCronLine(config)
    ]
  };
}
function uninstallScheduler(cwd, platform = detectPlatform()) {
  if (platform === "launchd") {
    const path = launchdPlistPath(cwd);
    const existed = existsSync(path);
    if (existed)
      unlinkSync(path);
    return {
      platform,
      installed: false,
      path: existed ? path : undefined,
      instructions: existed ? [`Removed ${path}.`, `If it was loaded: launchctl unload ${path}`] : ["No launchd scheduler was installed for this project."]
    };
  }
  if (platform === "systemd") {
    const dir = systemdUnitDir();
    const servicePath = join(dir, systemdServiceName(cwd));
    const timerPath = join(dir, systemdTimerName(cwd));
    const removed = [];
    for (const p of [servicePath, timerPath]) {
      if (existsSync(p)) {
        unlinkSync(p);
        removed.push(p);
      }
    }
    return {
      platform,
      installed: false,
      instructions: removed.length ? [`Removed: ${removed.join(", ")}`, `Reload: systemctl --user daemon-reload`] : ["No systemd scheduler was installed for this project."]
    };
  }
  return {
    platform: "cron",
    installed: false,
    instructions: ["Remove the `ur automation run-due` line from your crontab (`crontab -e`)."]
  };
}
function schedulerStatus(cwd) {
  const platform = detectPlatform();
  if (platform === "launchd") {
    const path = launchdPlistPath(cwd);
    return { platform, installed: existsSync(path), path: existsSync(path) ? path : undefined };
  }
  if (platform === "systemd") {
    const path = join(systemdUnitDir(), systemdTimerName(cwd));
    return { platform, installed: existsSync(path), path: existsSync(path) ? path : undefined };
  }
  return { platform, installed: false };
}
function formatInstallResult(result) {
  return [`Scheduler platform: ${result.platform}`, "", ...result.instructions].join(`
`);
}
async function runDaemon(options) {
  const intervalSec = Math.max(1, options.intervalSec ?? 60);
  const sleep = options.sleep ?? realSleep;
  let tick = 0;
  let stopped = false;
  const stop = () => {
    stopped = true;
  };
  if (!options.once && options.maxTicks === undefined) {
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
  }
  while (!stopped) {
    tick += 1;
    const results = await runDueAutomations({ dryRun: options.dryRun });
    options.onTick?.({ tick, ran: results.length, at: new Date().toISOString() });
    if (options.once)
      break;
    if (options.maxTicks !== undefined && tick >= options.maxTicks)
      break;
    await sleep(intervalSec * 1000);
  }
  return tick;
}
var realSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var init_scheduler = __esm(() => {
  init_automation();
});

// src/commands/automation/automation.ts
import {
  existsSync as existsSync2,
  mkdirSync as mkdirSync2,
  readdirSync,
  readFileSync as readFileSync2,
  unlinkSync as unlinkSync2,
  writeFileSync as writeFileSync2
} from "node:fs";
import { join as join2 } from "node:path";
function automationsDir() {
  return join2(getCwd(), ".ur", "automations");
}
function automationPath(name) {
  return join2(automationsDir(), `${sanitizeName(name)}.json`);
}
function sanitizeName(name) {
  return name.trim().replace(/[^a-zA-Z0-9_-]/g, "-");
}
function option(tokens, name) {
  const index = tokens.indexOf(name);
  if (index === -1)
    return;
  return tokens[index + 1];
}
function positionals(tokens) {
  const values = [];
  const flagsWithValue = new Set([
    "--schedule",
    "--prompt",
    "--now",
    "--platform",
    "--interval"
  ]);
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (flagsWithValue.has(token)) {
      i++;
      continue;
    }
    if (token.startsWith("--")) {
      continue;
    }
    values.push(token);
  }
  return values;
}
function hasFlag(tokens, name) {
  return tokens.includes(name);
}
function listSpecs() {
  const dir = automationsDir();
  if (!existsSync2(dir))
    return [];
  return readdirSync(dir).filter((file) => file.endsWith(".json")).map((file) => {
    const parsed = safeParseJSON(readFileSync2(join2(dir, file), "utf-8"), false);
    return parsed && typeof parsed === "object" ? parsed : null;
  }).filter((spec) => spec !== null);
}
function writeSpec(spec) {
  mkdirSync2(automationsDir(), { recursive: true });
  writeFileSync2(automationPath(spec.name), `${JSON.stringify(spec, null, 2)}
`);
}
function toMs(value) {
  if (!value)
    return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
}
function nextRunIso(spec, nowMs = Date.now()) {
  const anchor = toMs(spec.lastRunAt) ?? toMs(spec.createdAt) ?? nowMs;
  const next = nextCronRunMs(spec.schedule, anchor);
  return next === null ? null : new Date(next).toISOString();
}
function isDue(spec, nowMs) {
  if (spec.enabled === false)
    return false;
  const anchor = toMs(spec.lastRunAt) ?? toMs(spec.createdAt) ?? nowMs;
  const next = nextCronRunMs(spec.schedule, anchor);
  return next !== null && next <= nowMs;
}
function withRuntimeFields(spec, nowMs = Date.now()) {
  return {
    ...spec,
    enabled: spec.enabled !== false,
    due: isDue(spec, nowMs),
    humanSchedule: cronToHuman(spec.schedule),
    nextRunAt: nextRunIso(spec, nowMs)
  };
}
function formatSpecs(specs) {
  if (specs.length === 0) {
    return 'No project automations found. Create one with `ur automation create nightly --schedule "0 9 * * 1-5" --prompt "Review open tasks"`.';
  }
  const lines = ["Project automations", ""];
  for (const spec of specs) {
    const view = withRuntimeFields(spec);
    lines.push(`${view.name}${view.enabled === false ? " (disabled)" : ""}`);
    lines.push(`  Schedule: ${view.humanSchedule} (${view.schedule})`);
    lines.push(`  Next run: ${view.nextRunAt ?? "none in next year"}`);
    lines.push(`  Due now: ${view.due ? "yes" : "no"}`);
    if (view.lastRunAt) {
      lines.push(`  Last run: ${view.lastRunAt} (${view.lastStatus ?? "unknown"}, exit ${view.lastExitCode ?? "unknown"})`);
    }
    lines.push(`  Prompt: ${spec.prompt}`);
    lines.push(`  Runner: ${spec.runner.command} ${spec.runner.args.join(" ")}`);
    lines.push("");
  }
  return lines.join(`
`);
}
function formatRunResults(results) {
  if (results.length === 0)
    return "No automations ran.";
  return results.map((result) => {
    const lines = [
      `${result.name}: ${result.skipped ? `skipped (${result.skipped})` : result.dryRun ? "dry run" : `exit ${result.exitCode ?? "unknown"}`}`,
      `  Command: ${result.command.join(" ")}`
    ];
    if (result.stdout)
      lines.push(`  Stdout: ${result.stdout}`);
    if (result.stderr)
      lines.push(`  Stderr: ${result.stderr}`);
    return lines.join(`
`);
  }).join(`

`);
}
function preview(value) {
  const trimmed = value.trim();
  if (!trimmed)
    return;
  return trimmed.length > 1200 ? `${trimmed.slice(0, 1200)}...` : trimmed;
}
async function runSpec(spec, options) {
  const due = isDue(spec, options.nowMs);
  const command = [spec.runner.command, ...spec.runner.args, spec.prompt];
  if (spec.enabled === false) {
    return { name: spec.name, dryRun: options.dryRun, command, due, skipped: "disabled" };
  }
  if (options.dueOnly && !due) {
    return { name: spec.name, dryRun: options.dryRun, command, due, skipped: "not due" };
  }
  if (options.dryRun) {
    return { name: spec.name, dryRun: true, command, due };
  }
  const result = await execFileNoThrowWithCwd(spec.runner.command, [
    ...spec.runner.args,
    spec.prompt
  ], {
    cwd: getCwd(),
    timeout: 30 * 60 * 1000,
    preserveOutputOnError: true
  });
  const updated = {
    ...spec,
    lastRunAt: new Date(options.nowMs).toISOString(),
    lastExitCode: result.code,
    lastStatus: result.code === 0 ? "success" : "failed",
    lastOutputPreview: preview(result.stdout) ?? preview(result.stderr)
  };
  updated.nextRunAt = nextRunIso(updated, options.nowMs);
  writeSpec(updated);
  return {
    name: spec.name,
    dryRun: false,
    command,
    due,
    exitCode: result.code,
    stdout: preview(result.stdout),
    stderr: preview(result.stderr)
  };
}
async function runDueAutomations(options = {}) {
  const nowMs = options.nowMs ?? Date.now();
  const specs = listSpecs();
  const results = await Promise.all(specs.map((spec) => runSpec(spec, { dryRun: options.dryRun ?? false, dueOnly: true, nowMs })));
  return results.filter((result) => !result.skipped);
}
function usage() {
  return [
    "Usage:",
    "  ur automation list [--json]",
    '  ur automation create <name> --schedule "0 9 * * 1-5" --prompt "Review open tasks" [--disabled]',
    "  ur automation show <name> [--json]",
    "  ur automation run <name> [--dry-run]",
    "  ur automation run-due [--dry-run] [--now ISO_DATE]",
    "  ur automation enable <name>",
    "  ur automation disable <name>",
    "  ur automation delete <name>",
    "  ur automation install [--platform launchd|systemd|cron] [--interval SECONDS]",
    "  ur automation uninstall",
    "  ur automation status [--json]",
    "  ur automation daemon [--interval SECONDS] [--once] [--dry-run]"
  ].join(`
`);
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const positional = positionals(tokens);
  const command = positional[0] ?? "list";
  if (command === "list") {
    const specs = listSpecs();
    const views = specs.map((spec) => withRuntimeFields(spec));
    return {
      type: "text",
      value: json ? JSON.stringify({ automations: views }, null, 2) : formatSpecs(specs)
    };
  }
  if (command === "install") {
    const platform = option(tokens, "--platform");
    const intervalRaw = option(tokens, "--interval");
    const intervalSec = intervalRaw ? Number(intervalRaw) : undefined;
    const result = installScheduler({ cwd: getCwd(), intervalSec }, platform);
    return {
      type: "text",
      value: json ? JSON.stringify(result, null, 2) : formatInstallResult(result)
    };
  }
  if (command === "uninstall") {
    const platform = option(tokens, "--platform");
    const result = uninstallScheduler(getCwd(), platform);
    return {
      type: "text",
      value: json ? JSON.stringify(result, null, 2) : formatInstallResult(result)
    };
  }
  if (command === "status") {
    const status = schedulerStatus(getCwd());
    return {
      type: "text",
      value: json ? JSON.stringify(status, null, 2) : `Scheduler: ${status.installed ? "installed" : "not installed"} (${status.platform})${status.path ? `
  ${status.path}` : ""}`
    };
  }
  if (command === "daemon") {
    const intervalRaw = option(tokens, "--interval");
    const intervalSec = intervalRaw ? Number(intervalRaw) : 60;
    const once = hasFlag(tokens, "--once");
    const dryRun = hasFlag(tokens, "--dry-run");
    const ticks = [];
    await runDaemon({
      cwd: getCwd(),
      intervalSec,
      once,
      dryRun,
      onTick: (info) => {
        ticks.push(info);
        if (!json) {
          console.log(`[${info.at}] tick ${info.tick}: ran ${info.ran} due automation(s)`);
        }
      }
    });
    return {
      type: "text",
      value: json ? JSON.stringify({ ticks }, null, 2) : once ? `Ran one scheduler tick (${ticks[0]?.ran ?? 0} due automation(s)).` : "Scheduler daemon stopped."
    };
  }
  if (command === "create") {
    const name = positional[1];
    const schedule = option(tokens, "--schedule");
    const prompt = option(tokens, "--prompt");
    if (!name || !schedule || !prompt) {
      return { type: "text", value: usage() };
    }
    if (!parseCronExpression(schedule) || nextCronRunMs(schedule, Date.now()) === null) {
      return {
        type: "text",
        value: `Invalid automation schedule: ${schedule}
Expected a 5-field cron expression with a next run in the next year.`
      };
    }
    const spec = {
      version: 1,
      name: sanitizeName(name),
      schedule,
      prompt,
      runner: {
        command: "ur",
        args: ["-p", "--output-format", "json"]
      },
      createdAt: new Date().toISOString(),
      enabled: !hasFlag(tokens, "--disabled")
    };
    spec.nextRunAt = nextRunIso(spec);
    writeSpec(spec);
    return {
      type: "text",
      value: json ? JSON.stringify(withRuntimeFields(spec), null, 2) : `Created automation ${spec.name} at ${automationPath(name)}`
    };
  }
  if (command === "show") {
    const name = positional[1];
    if (!name)
      return { type: "text", value: usage() };
    const path = automationPath(name);
    if (!existsSync2(path)) {
      return { type: "text", value: `Automation not found: ${sanitizeName(name)}` };
    }
    const raw = readFileSync2(path, "utf-8");
    const parsed = safeParseJSON(raw, false);
    if (json) {
      return {
        type: "text",
        value: JSON.stringify(parsed ? withRuntimeFields(parsed) : raw, null, 2)
      };
    }
    return { type: "text", value: parsed ? formatSpecs([parsed]) : raw };
  }
  if (command === "enable" || command === "disable") {
    const name = positional[1];
    if (!name)
      return { type: "text", value: usage() };
    const path = automationPath(name);
    if (!existsSync2(path)) {
      return { type: "text", value: `Automation not found: ${sanitizeName(name)}` };
    }
    const parsed = safeParseJSON(readFileSync2(path, "utf-8"), false);
    if (!parsed)
      return { type: "text", value: `Automation file is invalid: ${path}` };
    const updated = { ...parsed, enabled: command === "enable" };
    updated.nextRunAt = nextRunIso(updated);
    writeSpec(updated);
    return {
      type: "text",
      value: `${command === "enable" ? "Enabled" : "Disabled"} automation ${updated.name}`
    };
  }
  if (command === "run" || command === "run-due") {
    const nowMs = toMs(option(tokens, "--now")) ?? Date.now();
    const dryRun = hasFlag(tokens, "--dry-run");
    const dueOnly = command === "run-due";
    const specs = command === "run" ? listSpecs().filter((spec) => spec.name === sanitizeName(positional[1] ?? "")) : listSpecs();
    if (command === "run" && specs.length === 0) {
      return { type: "text", value: `Automation not found: ${sanitizeName(positional[1] ?? "")}` };
    }
    const results = await Promise.all(specs.map((spec) => runSpec(spec, { dryRun, dueOnly, nowMs })));
    const runnable = results.filter((result) => !result.skipped);
    const output = dueOnly ? runnable : results;
    return {
      type: "text",
      value: json ? JSON.stringify({ results: output }, null, 2) : formatRunResults(output)
    };
  }
  if (command === "delete" || command === "remove") {
    const name = positional[1];
    if (!name)
      return { type: "text", value: usage() };
    const path = automationPath(name);
    if (!existsSync2(path)) {
      return { type: "text", value: `Automation not found: ${sanitizeName(name)}` };
    }
    unlinkSync2(path);
    return { type: "text", value: `Deleted automation ${sanitizeName(name)}` };
  }
  return { type: "text", value: usage() };
};
var init_automation = __esm(() => {
  init_argumentSubstitution();
  init_cron();
  init_cronTasks();
  init_cwd();
  init_execFileNoThrow();
  init_json();
  init_scheduler();
});
init_automation();

export {
  runDueAutomations,
  call
};
