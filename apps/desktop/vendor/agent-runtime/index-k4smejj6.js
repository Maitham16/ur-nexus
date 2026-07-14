import {
  __esm
} from "./index-8rxa073f.js";

// src/stability/types.ts
var DEFAULT_LIMITS;
var init_types = __esm(() => {
  DEFAULT_LIMITS = {
    maxFiles: 20,
    cooldownSteps: 2,
    maxRepeats: 3,
    latencyMs: 30000
  };
});

// src/stability/stability.ts
function stableStringify(value) {
  if (value === null || typeof value !== "object")
    return JSON.stringify(value) ?? "null";
  if (Array.isArray(value))
    return "[" + value.map(stableStringify).join(",") + "]";
  const obj = value;
  return "{" + Object.keys(obj).sort().map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k])).join(",") + "}";
}

class StabilityMonitor {
  lastStep = new Map;
  counts = new Map;
  files = new Set;
  step = 0;
  actions = 0;
  oscillations = 0;
  limits;
  constructor(limits = DEFAULT_LIMITS) {
    this.limits = limits;
  }
  signature(call) {
    return call.name + ":" + stableStringify(call.arguments);
  }
  tick() {
    this.step++;
  }
  check(call, mutates, filePath) {
    const sig = this.signature(call);
    const last = this.lastStep.get(sig);
    if (last !== undefined && this.step - last <= this.limits.cooldownSteps) {
      const repeats = (this.counts.get(sig) ?? 0) + 1;
      if (repeats >= this.limits.maxRepeats) {
        this.oscillations++;
        return { allow: false, reason: `oscillation suppressed: repeated ${call.name}`, containment: true };
      }
    }
    if (mutates && filePath && !this.files.has(filePath) && this.files.size + 1 > this.limits.maxFiles) {
      return { allow: false, reason: `blast-radius cap reached (${this.limits.maxFiles} files)`, containment: true };
    }
    return { allow: true };
  }
  record(call, mutates, filePath) {
    const sig = this.signature(call);
    this.actions++;
    this.lastStep.set(sig, this.step);
    this.counts.set(sig, (this.counts.get(sig) ?? 0) + 1);
    if (mutates && filePath)
      this.files.add(filePath);
  }
  signals() {
    return {
      step: this.step,
      actions: this.actions,
      filesTouched: this.files.size,
      recentSignatures: [...this.lastStep.keys()].slice(-5)
    };
  }
}
var init_stability = __esm(() => {
  init_types();
});

// src/stability/rootcause.ts
function detectSymptoms(text) {
  const out = [];
  for (const [name, re] of SYMPTOMS)
    if (re.test(text))
      out.push(name);
  return out;
}
function rankCauses(errorText, topN = 3) {
  const symptoms = detectSymptoms(errorText);
  const scored = CAUSES.map((c) => {
    let score = c.prior;
    for (const s of symptoms)
      score *= c.explains[s] ?? 0.5;
    return { id: c.id, label: c.label, score };
  });
  const total = scored.reduce((sum, c) => sum + c.score, 0) || 1;
  return scored.map((c) => ({ id: c.id, label: c.label, score: c.score / total })).sort((a, b) => b.score - a.score).slice(0, topN);
}
var CAUSES, SYMPTOMS;
var init_rootcause = __esm(() => {
  CAUSES = [
    { id: "missing_file", label: "file or path does not exist", prior: 0.2, explains: { not_found: 6, precondition: 3 } },
    { id: "bad_path", label: "path is wrong or outside the workspace", prior: 0.12, explains: { outside: 8, not_found: 2 } },
    { id: "permission", label: "insufficient permissions", prior: 0.1, explains: { permission: 8 } },
    { id: "syntax_error", label: "syntax or parse error", prior: 0.15, explains: { syntax: 6, exit: 2 } },
    { id: "missing_dependency", label: "missing command, module, or dependency", prior: 0.15, explains: { missing: 6, not_found: 3, exit: 2 } },
    { id: "timeout", label: "command timed out or hung", prior: 0.08, explains: { timeout: 8, killed: 6 } },
    { id: "guardrail", label: "blocked by a safety guardrail", prior: 0.1, explains: { guardrail: 9 } },
    { id: "runtime_error", label: "runtime error during execution", prior: 0.1, explains: { exit: 3, error: 2 } }
  ];
  SYMPTOMS = [
    ["not_found", /\b(no such file|not found|enoent|cannot find|does(n't| not) exist)\b/i],
    ["outside", /(outside|escapes) the workspace/i],
    ["permission", /\b(permission denied|eacces|not permitted|operation not permitted)\b/i],
    ["syntax", /\b(syntax error|unexpected token|parse error|unexpected end)\b/i],
    ["missing", /\b(command not found|module not found|cannot find module|no module named)\b/i],
    ["timeout", /\b(timed out|timeout)\b/i],
    ["killed", /\bkilled\b/i],
    ["guardrail", /\bguardrail\b/i],
    ["precondition", /precondition/i],
    ["exit", /\bexit\s+[1-9]/i],
    ["error", /\berror\b/i]
  ];
});

// src/stability/ledger.ts
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
function ledgerPath(cwd) {
  return join(cwd, ".ur", "actions.jsonl");
}
function markToolStart(id) {
  toolStarts.set(id, Date.now());
}
function takeToolDuration(id) {
  const start = toolStarts.get(id);
  if (start === undefined)
    return;
  toolStarts.delete(id);
  return Date.now() - start;
}
function filesFromArgs(args) {
  if (!args)
    return [];
  const out = [];
  for (const key of ["path", "file_path", "filePath", "notebook_path"]) {
    const v = args[key];
    if (typeof v === "string")
      out.push(v);
  }
  return out;
}
function recordAction(cwd, record) {
  try {
    const file = ledgerPath(cwd);
    mkdirSync(dirname(file), { recursive: true });
    appendFileSync(file, JSON.stringify(record) + `
`);
  } catch {}
}
function readActions(cwd, limit = 50) {
  const file = ledgerPath(cwd);
  if (!existsSync(file))
    return [];
  const lines = readFileSync(file, "utf8").split(`
`).filter(Boolean);
  const out = [];
  for (const line of lines.slice(-limit)) {
    try {
      out.push(JSON.parse(line));
    } catch {}
  }
  return out;
}
function summarize(records, limits = DEFAULT_LIMITS) {
  const total = records.length;
  const failures = records.filter((r) => !r.ok).length;
  const durations = records.map((r) => r.durationMs ?? 0);
  const sum = durations.reduce((a, b) => a + b, 0);
  const avgDurationMs = total ? Math.round(sum / total) : 0;
  const maxDurationMs = durations.length ? Math.max(...durations) : 0;
  const slowCalls = durations.filter((d) => d > limits.latencyMs).length;
  const files = new Set;
  for (const r of records) {
    const p = r.args?.path ?? r.args?.file_path;
    if (typeof p === "string")
      files.add(p);
  }
  const sigCounts = new Map;
  const failSigCounts = new Map;
  for (const r of records) {
    const sig = r.tool + ":" + JSON.stringify(r.args ?? {});
    sigCounts.set(sig, (sigCounts.get(sig) ?? 0) + 1);
    if (!r.ok)
      failSigCounts.set(sig, (failSigCounts.get(sig) ?? 0) + 1);
  }
  let oscillations = 0;
  for (const n of sigCounts.values())
    if (n >= limits.maxRepeats)
      oscillations++;
  let repeatedFailures = 0;
  for (const n of failSigCounts.values())
    if (n >= 2)
      repeatedFailures++;
  const failureRate = total ? failures / total : 0;
  const flags = [];
  if (repeatedFailures > 0)
    flags.push(`${repeatedFailures} repeatedly-failing action(s) (same call failed ≥2×)`);
  if (oscillations > 0)
    flags.push(`${oscillations} oscillating action(s) (identical call repeated ≥${limits.maxRepeats}×)`);
  if (failureRate >= 0.5 && total >= 4)
    flags.push(`high failure rate (${Math.round(failureRate * 100)}%)`);
  if (slowCalls > 0)
    flags.push(`${slowCalls} slow tool call(s) over ${limits.latencyMs}ms`);
  if (files.size > limits.maxFiles)
    flags.push(`blast radius exceeded (${files.size} > ${limits.maxFiles} files)`);
  return { total, failures, failureRate, avgDurationMs, maxDurationMs, slowCalls, filesTouched: files.size, oscillations, flags };
}
var toolStarts;
var init_ledger = __esm(() => {
  init_types();
  toolStarts = new Map;
});

// src/stability/index.ts
async function handleStabilityCommand(tokens, cwd) {
  const sub = tokens[1] ?? "";
  const rest = tokens.slice(2);
  switch (sub) {
    case "":
    case "help":
      return HELP;
    case "policy":
      return [
        "Stability policy (action budget intentionally disabled):",
        `  cooldown window:   ${DEFAULT_LIMITS.cooldownSteps} step(s)`,
        `  oscillation after: ${DEFAULT_LIMITS.maxRepeats} identical repeats`,
        `  blast radius cap:  ${DEFAULT_LIMITS.maxFiles} files`,
        `  latency threshold: ${DEFAULT_LIMITS.latencyMs} ms`
      ].join(`
`);
    case "why": {
      const text = rest.join(" ").trim();
      if (!text)
        return "usage: /stability why <error text>";
      const causes = rankCauses(text);
      if (!causes.length)
        return "no likely causes identified";
      return ["likely root causes:", ...causes.map((c) => `  ${fmtPct(c.score)}  ${c.label}`)].join(`
`);
    }
    case "metrics":
    case "status": {
      const s = summarize(readActions(cwd, 1000));
      if (s.total === 0)
        return "no actions recorded yet (ledger: .ur/actions.jsonl)";
      return [
        `actions ${s.total} · failures ${s.failures} (${fmtPct(s.failureRate)})`,
        `latency avg ${s.avgDurationMs}ms · max ${s.maxDurationMs}ms · slow ${s.slowCalls}`,
        `files touched ${s.filesTouched} · oscillations ${s.oscillations}`,
        s.flags.length ? `⚠ ${s.flags.join("; ")}` : "stable ✓"
      ].join(`
`);
    }
    case "firewall": {
      const s = summarize(readActions(cwd, 1000));
      if (s.total === 0)
        return "stability firewall: no actions recorded yet";
      return s.flags.length ? ["⚠ stability firewall tripped:", ...s.flags.map((f) => `  - ${f}`), "", "Consider pausing and proposing a safer plan."].join(`
`) : "stability firewall: stable ✓ (no instability detected)";
    }
    case "evidence": {
      const n = Number(rest[0]) || 10;
      const recs = readActions(cwd, n);
      if (!recs.length)
        return "no evidence records yet (.ur/actions.jsonl)";
      return recs.map((r) => {
        const meta = [r.durationMs ? `${r.durationMs}ms` : "", r.mode ? `mode:${r.mode}` : "", r.filesTouched?.length ? `files:${r.filesTouched.join(",")}` : ""].filter(Boolean).join(" · ");
        return `${r.ts} ${r.ok ? "✓" : "✗"} ${r.tool}${meta ? ` (${meta})` : ""}${r.error ? ` — ${r.error}` : ""}${r.evidence ? `
    ${r.evidence}` : ""}`;
      }).join(`
`);
    }
    case "actions": {
      const n = Number(rest[0]) || 20;
      const recs = readActions(cwd, n);
      if (!recs.length)
        return "no actions recorded yet (.ur/actions.jsonl)";
      return recs.map((r) => `${r.ok ? "✓" : "✗"} ${r.tool}`).join(`
`);
    }
    case "cooldown": {
      const recs = readActions(cwd, 1000);
      const counts = new Map;
      for (const r of recs) {
        const sig = r.tool + ":" + JSON.stringify(r.args ?? {});
        counts.set(sig, (counts.get(sig) ?? 0) + 1);
      }
      const repeated = [...counts.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]);
      if (!repeated.length)
        return "no repeated actions (cooldown clear)";
      return ["repeated actions (cooldown / oscillation watch):", ...repeated.slice(0, 10).map(([sig, n]) => `  ${n}×  ${sig.slice(0, 80)}`)].join(`
`);
    }
    default:
      return `unknown subcommand: ${sub}

${HELP}`;
  }
}
var HELP = `/stability — Stability-Aware MAPE-K controls (from the paper)

Subcommands:
  metrics            stability metrics from the action ledger
  firewall           detect instability (oscillation, failures, latency, blast radius)
  why <error text>   rank likely root causes (causal/Bayesian Analyze stage)
  policy             show the active stability limits (cooldown, blast radius, …)
  evidence [n]       recent evidence/action records (detailed)
  actions [n]        recent action log (compact)
  cooldown           repeated/oscillating action analysis

The ledger lives at .ur/actions.jsonl (run /ur-init to create the .ur folder).`, fmtPct = (n) => `${Math.round(n * 100)}%`;
var init_stability2 = __esm(() => {
  init_stability();
  init_rootcause();
  init_ledger();
  init_rootcause();
  init_ledger();
  init_types();
  init_types();
});

export { markToolStart, takeToolDuration, filesFromArgs, recordAction, init_ledger, handleStabilityCommand, init_stability2 as init_stability };
