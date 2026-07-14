import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
import {
  init_json,
  safeParseJSON
} from "./index-s5dp14ed.js";
import"./index-h7h0j06f.js";
import"./index-7h9ddexs.js";
import"./index-f80dj2bz.js";
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/services/agents/inspector.ts
import { existsSync, readFileSync } from "node:fs";
function preview(value, max = PREVIEW_CHARS) {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max)
    return text;
  return `${text.slice(0, max)}… [+${text.length - max} chars]`;
}
function blockText(content) {
  if (typeof content === "string")
    return content;
  if (Array.isArray(content)) {
    return content.map((block) => typeof block.text === "string" ? block.text : "").join("");
  }
  return "";
}
function extractVerdict(text) {
  const match = VERDICT_RE.exec(text);
  return match ? match[1].toUpperCase() : null;
}
function inspectMessages(messages) {
  const summary = {
    messages: messages.length,
    assistantTurns: 0,
    toolCalls: 0,
    agentRuns: 0,
    errors: 0,
    verdicts: { pass: 0, fail: 0, partial: 0 },
    tokens: { input: 0, output: 0 },
    toolUsage: {}
  };
  const agents = [];
  const pendingById = new Map;
  for (const message of messages) {
    const role = message.message?.role ?? message.type;
    if (role === "assistant")
      summary.assistantTurns++;
    const usage = message.message?.usage;
    if (usage) {
      summary.tokens.input += usage.input_tokens ?? 0;
      summary.tokens.output += usage.output_tokens ?? 0;
    }
    const content = message.message?.content;
    if (!Array.isArray(content)) {
      if (typeof content === "string") {
        const verdict = extractVerdict(content);
        if (verdict)
          tallyVerdict(summary, verdict);
      }
      continue;
    }
    for (const raw of content) {
      if (raw.type === "text" && typeof raw.text === "string") {
        const verdict = extractVerdict(raw.text);
        if (verdict)
          tallyVerdict(summary, verdict);
      } else if (raw.type === "tool_use") {
        summary.toolCalls++;
        const toolName = raw.name ?? "?";
        summary.toolUsage[toolName] = (summary.toolUsage[toolName] ?? 0) + 1;
        if (AGENT_TOOL_NAMES.has(toolName)) {
          summary.agentRuns++;
          const input = raw.input ?? {};
          const run = {
            index: summary.agentRuns,
            subagentType: String(input.subagent_type ?? "general-purpose"),
            description: String(input.description ?? ""),
            promptPreview: preview(String(input.prompt ?? "")),
            resultPreview: "",
            status: "pending",
            verdict: null
          };
          agents.push(run);
          if (raw.id)
            pendingById.set(raw.id, run);
        }
      } else if (raw.type === "tool_result") {
        if (raw.is_error)
          summary.errors++;
        const id = raw.tool_use_id;
        const run = id ? pendingById.get(id) : undefined;
        if (run) {
          const body = blockText(raw.content);
          run.resultPreview = preview(body);
          run.status = raw.is_error ? "error" : "ok";
          run.verdict = extractVerdict(body);
          if (id)
            pendingById.delete(id);
        }
      }
    }
  }
  return { summary, agents };
}
function tallyVerdict(summary, verdict) {
  if (verdict === "PASS")
    summary.verdicts.pass++;
  else if (verdict === "FAIL")
    summary.verdicts.fail++;
  else if (verdict === "PARTIAL")
    summary.verdicts.partial++;
}
function loadTranscript(path) {
  if (!existsSync(path)) {
    throw new Error(`Transcript not found: ${path}`);
  }
  const raw = readFileSync(path, "utf-8").trim();
  if (!raw)
    return [];
  if (raw.startsWith("[")) {
    const parsed = safeParseJSON(raw, false);
    return Array.isArray(parsed) ? parsed : [];
  }
  const out = [];
  for (const line of raw.split(`
`)) {
    const trimmed = line.trim();
    if (!trimmed)
      continue;
    const parsed = safeParseJSON(trimmed, false);
    if (parsed && typeof parsed === "object")
      out.push(parsed);
  }
  return out;
}
function formatInspection(report, json) {
  if (json)
    return JSON.stringify(report, null, 2);
  const { summary, agents } = report;
  const lines = [
    "=== Agent run inspector ===",
    `Messages: ${summary.messages}   Assistant turns: ${summary.assistantTurns}`,
    `Tool calls: ${summary.toolCalls}   Subagent runs: ${summary.agentRuns}   Errors: ${summary.errors}`,
    `Verdicts: PASS ${summary.verdicts.pass} / FAIL ${summary.verdicts.fail} / PARTIAL ${summary.verdicts.partial}`,
    `Tokens: ${summary.tokens.input} in / ${summary.tokens.output} out`
  ];
  const tools = Object.entries(summary.toolUsage).sort((a, b) => b[1] - a[1]).map(([name, count]) => `${name}×${count}`);
  if (tools.length > 0)
    lines.push(`Tool usage: ${tools.join(", ")}`);
  lines.push("");
  if (agents.length === 0) {
    lines.push("No subagent runs found in this transcript.");
    return lines.join(`
`);
  }
  lines.push("Subagent timeline:");
  for (const run of agents) {
    const statusMark = run.status === "ok" ? "✓" : run.status === "error" ? "✗" : "…";
    const verdict = run.verdict ? `  VERDICT: ${run.verdict}` : "";
    lines.push("");
    lines.push(`[${run.index}] ${statusMark} ${run.subagentType}: ${run.description}${verdict}`);
    if (run.promptPreview)
      lines.push(`     prompt: ${run.promptPreview}`);
    if (run.resultPreview)
      lines.push(`     result: ${run.resultPreview}`);
  }
  return lines.join(`
`);
}
var AGENT_TOOL_NAMES, PREVIEW_CHARS = 160, VERDICT_RE;
var init_inspector = __esm(() => {
  init_json();
  AGENT_TOOL_NAMES = new Set(["Agent", "Task"]);
  VERDICT_RE = /\bVERDICT:\s*(PASS|FAIL|PARTIAL)\b/i;
});

// src/commands/agent-inspect/agent-inspect.ts
var call = async (args, context) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const fileIndex = tokens.indexOf("--file");
  const filePath = fileIndex >= 0 ? tokens[fileIndex + 1] : undefined;
  let messages;
  if (filePath) {
    try {
      messages = loadTranscript(filePath);
    } catch (error) {
      return {
        type: "text",
        value: error instanceof Error ? error.message : String(error)
      };
    }
  } else {
    const ctx = context;
    messages = ctx?.messages ?? [];
    if (messages.length === 0) {
      return {
        type: "text",
        value: "No in-session messages available. Run inside a session, or pass a transcript: ur agent-inspect --file <path.jsonl>"
      };
    }
  }
  const report = inspectMessages(messages);
  return { type: "text", value: formatInspection(report, json) };
};
var init_agent_inspect = __esm(() => {
  init_inspector();
  init_argumentSubstitution();
});
init_agent_inspect();

export {
  call
};
