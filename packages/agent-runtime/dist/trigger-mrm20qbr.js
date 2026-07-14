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

// src/services/agents/triggerBridge.ts
function asRecord(value) {
  return value && typeof value === "object" ? value : {};
}
function asString(value) {
  return typeof value === "string" ? value : undefined;
}
function asNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
function detectTriggerSource(payload) {
  const root = asRecord(payload);
  if (asRecord(root.comment).body !== undefined || root.issue !== undefined || root.pull_request !== undefined) {
    return "github";
  }
  if (root.event !== undefined || root.type === "event_callback" || asString(root.token) !== undefined) {
    return "slack";
  }
  if (asString(root.prompt) !== undefined || asString(root.text) !== undefined) {
    return "generic";
  }
  return "unknown";
}
function extractPrompt(body, keyword) {
  const idx = body.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1)
    return;
  const after = body.slice(idx + keyword.length).trim();
  return after.replace(/^<@[^>]+>\s*/, "").trim() || undefined;
}
function parseGithub(root, keyword) {
  const comment = asRecord(root.comment);
  const issue = asRecord(root.issue);
  const pull = asRecord(root.pull_request);
  const repo = asRecord(root.repository);
  const sender = asRecord(root.sender);
  const body = asString(comment.body) ?? asString(issue.body) ?? asString(pull.body) ?? "";
  const prompt = extractPrompt(body, keyword);
  const context = {
    repo: asString(repo.full_name),
    issue: asNumber(issue.number),
    pr: asNumber(pull.number) ?? (issue.pull_request ? asNumber(issue.number) : undefined)
  };
  return {
    triggered: prompt !== undefined,
    reason: prompt ? `GitHub comment contains "${keyword}"` : `no "${keyword}" mention in GitHub payload`,
    prompt,
    actor: asString(sender.login) ?? asString(asRecord(comment.user).login),
    context
  };
}
function parseSlack(root, keyword) {
  const event = asRecord(root.event);
  const text = asString(event.text) ?? asString(root.text) ?? "";
  const prompt = extractPrompt(text, keyword);
  const context = {
    channel: asString(event.channel) ?? asString(root.channel),
    threadTs: asString(event.thread_ts) ?? asString(event.ts)
  };
  return {
    triggered: prompt !== undefined,
    reason: prompt ? `Slack message contains "${keyword}"` : `no "${keyword}" mention in Slack payload`,
    prompt,
    actor: asString(event.user) ?? asString(root.user),
    context
  };
}
function parseGeneric(root, keyword) {
  const direct = asString(root.prompt);
  if (direct) {
    return { triggered: true, reason: "generic payload carried an explicit prompt", prompt: direct.trim(), context: {} };
  }
  const text = asString(root.text) ?? "";
  const prompt = extractPrompt(text, keyword);
  return {
    triggered: prompt !== undefined,
    reason: prompt ? `generic text contains "${keyword}"` : "generic payload had no prompt and no keyword match",
    prompt,
    actor: asString(root.actor) ?? asString(root.user),
    context: {}
  };
}
function parseTriggerPayload(payload, options = {}) {
  const keyword = options.keyword?.trim() || "/ur";
  const source = options.source && options.source !== "unknown" ? options.source : detectTriggerSource(payload);
  const root = asRecord(payload);
  let partial;
  if (source === "github")
    partial = parseGithub(root, keyword);
  else if (source === "slack")
    partial = parseSlack(root, keyword);
  else if (source === "generic")
    partial = parseGeneric(root, keyword);
  else {
    partial = { triggered: false, reason: "could not detect a known payload shape", context: {} };
  }
  return { source, keyword, ...partial };
}
function buildTriggerCommand(prompt, options = {}) {
  const file = options.bin?.file ?? process.execPath;
  const baseArgs = options.bin?.baseArgs ?? [process.argv[1] ?? ""];
  const args = [...baseArgs, "-p", "--output-format", options.outputFormat ?? "json"];
  if (options.maxTurns && options.maxTurns > 0)
    args.push("--max-turns", String(options.maxTurns));
  if (options.skipPermissions)
    args.push("--dangerously-skip-permissions");
  args.push(prompt);
  return { file, args };
}
function formatTriggerDecision(decision, command, json) {
  if (json)
    return JSON.stringify({ decision, command }, null, 2);
  const lines = [
    `Source:    ${decision.source}`,
    `Keyword:   ${decision.keyword}`,
    `Triggered: ${decision.triggered ? "yes" : "no"}`,
    `Reason:    ${decision.reason}`
  ];
  if (decision.actor)
    lines.push(`Actor:     ${decision.actor}`);
  const ctx = decision.context;
  const ctxParts = [
    ctx.repo ? `repo=${ctx.repo}` : null,
    ctx.issue ? `issue=#${ctx.issue}` : null,
    ctx.pr ? `pr=#${ctx.pr}` : null,
    ctx.channel ? `channel=${ctx.channel}` : null
  ].filter(Boolean);
  if (ctxParts.length)
    lines.push(`Context:   ${ctxParts.join(" ")}`);
  if (decision.prompt)
    lines.push(`Prompt:    ${decision.prompt}`);
  if (command)
    lines.push("", `Command:   ${command.file} ${command.args.join(" ")}`);
  return lines.join(`
`);
}
var init_triggerBridge = () => {};

// src/commands/trigger/trigger.ts
import { existsSync, readFileSync } from "node:fs";
function option(tokens, name) {
  const index = tokens.indexOf(name);
  if (index === -1)
    return;
  return tokens[index + 1];
}
function usage() {
  return [
    "Usage:",
    "  ur trigger parse --file payload.json [--source github|slack|generic] [--keyword /ur] [--json]",
    "  ur trigger run   --file payload.json [--keyword /ur] [--dry-run] [--max-turns N] [--json]",
    "",
    "Reads a webhook payload, decides whether it should dispatch UR, and (for run)",
    "launches a headless `ur -p` with the extracted prompt."
  ].join(`
`);
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const action = tokens.find((token) => !token.startsWith("--")) ?? "parse";
  const file = option(tokens, "--file");
  const source = option(tokens, "--source");
  const keyword = option(tokens, "--keyword");
  const dryRun = tokens.includes("--dry-run");
  const maxTurnsRaw = option(tokens, "--max-turns");
  const maxTurns = maxTurnsRaw ? Number(maxTurnsRaw) : undefined;
  if (action !== "parse" && action !== "run") {
    return { type: "text", value: usage() };
  }
  if (!file) {
    return { type: "text", value: `Missing --file <payload.json>.

${usage()}` };
  }
  if (!existsSync(file)) {
    return { type: "text", value: `Payload file not found: ${file}` };
  }
  const payload = safeParseJSON(readFileSync(file, "utf-8"), false);
  if (payload === null || typeof payload !== "object") {
    return { type: "text", value: `Payload is not valid JSON: ${file}` };
  }
  const decision = parseTriggerPayload(payload, { source, keyword });
  if (action === "parse" || !decision.triggered) {
    const command2 = decision.triggered && decision.prompt ? buildTriggerCommand(decision.prompt, { maxTurns }) : null;
    return { type: "text", value: formatTriggerDecision(decision, command2, json) };
  }
  const command = buildTriggerCommand(decision.prompt, { maxTurns });
  if (dryRun) {
    return {
      type: "text",
      value: json ? JSON.stringify({ decision, command, dryRun: true }, null, 2) : `${formatTriggerDecision(decision, command, false)}

(dry run — not executed)`
    };
  }
  const result = await execFileNoThrowWithCwd(command.file, command.args, {
    cwd: getCwd(),
    timeout: 30 * 60 * 1000,
    preserveOutputOnError: true
  });
  const output = (result.stdout || result.stderr || "").trim();
  return {
    type: "text",
    value: json ? JSON.stringify({ decision, command, exitCode: result.code, output }, null, 2) : `${formatTriggerDecision(decision, command, false)}

Exit: ${result.code}
${output}`
  };
};
var init_trigger = __esm(() => {
  init_triggerBridge();
  init_argumentSubstitution();
  init_cwd();
  init_execFileNoThrow();
  init_json();
});
init_trigger();

export {
  call
};
