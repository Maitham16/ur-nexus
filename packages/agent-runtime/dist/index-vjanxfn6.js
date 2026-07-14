import {
  init_learning,
  recordOutcome
} from "./index-df0wfzdw.js";
import {
  init_intentRouter,
  routeIntent
} from "./index-hakw7em9.js";
import {
  defaultHeadlessRunner,
  init_headlessAgent,
  makeDryHeadlessRunner
} from "./index-c6n1hema.js";
import {
  init_json,
  safeParseJSON
} from "./index-s5dp14ed.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/services/agents/escalation.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
function scoreOracle(model) {
  let score = (model.contextLength ?? 0) / 1000;
  if (model.likelyCode)
    score += 6;
  if (/cloud/i.test(model.name))
    score += 10;
  if (model.size)
    score += model.size / 1e9;
  if (model.advertisedCapabilities.includes("tools"))
    score += 2;
  return score;
}
function scoreFast(model) {
  let score = 0;
  if (model.likelyCode)
    score += 4;
  if (/cloud/i.test(model.name))
    score -= 6;
  score -= (model.size ?? Number.MAX_SAFE_INTEGER) / 1e9;
  return score;
}
function selectTiers(models, policy = {}) {
  const reasons = [];
  const byName = (name) => name ? models.find((m) => m.name === name)?.name ?? name : null;
  if (models.length === 0 && !policy.fast && !policy.oracle) {
    return {
      fast: null,
      oracle: null,
      sameModel: false,
      reasons: ["No local Ollama models found; start Ollama or pull a model."]
    };
  }
  let oracle = byName(policy.oracle);
  if (oracle && policy.oracle)
    reasons.push(`oracle pinned to ${oracle} by policy`);
  if (!oracle && models.length > 0) {
    const ranked = [...models].sort((a, b) => scoreOracle(b) - scoreOracle(a));
    oracle = ranked[0].name;
    reasons.push(`oracle = ${oracle} (strongest reasoning/context fit)`);
  }
  let fast = byName(policy.fast);
  if (fast && policy.fast)
    reasons.push(`fast pinned to ${fast} by policy`);
  if (!fast && models.length > 0) {
    const ranked = [...models].filter((m) => m.name !== oracle || models.length === 1).sort((a, b) => scoreFast(b) - scoreFast(a));
    fast = (ranked[0] ?? models[0]).name;
    reasons.push(`fast = ${fast} (cheapest code-capable model)`);
  }
  const sameModel = !!fast && fast === oracle;
  if (sameModel) {
    reasons.push("only one model available: fast and oracle are the same; escalation is a no-op");
  }
  return { fast, oracle, sameModel, reasons };
}
function assessDifficulty(task, options = {}) {
  const route = routeIntent(task);
  const signals = [];
  let score = route.complexity;
  if (route.complexity > 0)
    signals.push(`complexity ${route.complexity}`);
  if (route.category === "review" || route.category === "security") {
    score += 4;
    signals.push(`${route.category} task`);
  }
  if (HARD_KEYWORDS.test(task)) {
    score += 5;
    signals.push("hard-reasoning keywords");
  }
  if (task.length > 600) {
    score += 2;
    signals.push("long prompt");
  }
  if (options.bias && options.bias > 0) {
    score += options.bias;
    signals.push(`learned bias +${options.bias}`);
  }
  return { hard: score >= 5, score, signals };
}
function planEscalation(task, models, policy = {}, options = {}) {
  const tiers = selectTiers(models, policy);
  const difficulty = assessDifficulty(task, options);
  const startTier = difficulty.hard && tiers.oracle ? "oracle" : "fast";
  let rationale;
  if (!tiers.fast && !tiers.oracle) {
    rationale = "No local models available; start Ollama or pull a model.";
  } else if (startTier === "oracle") {
    rationale = `Hard task (${difficulty.signals.join(", ") || "flagged"}): start on the oracle.`;
  } else if (difficulty.hard) {
    rationale = `Hard task, but no separate oracle is available: running on ${tiers.fast}.`;
  } else {
    rationale = `Routine task: start on the fast model${tiers.sameModel ? "" : "; escalate to the oracle only if it fails"}.`;
  }
  return { task: task.trim(), tiers, difficulty, startTier, rationale };
}
function needsEscalation(output) {
  if (output.isError)
    return true;
  if (output.verdict === "FAIL" || output.verdict === "PARTIAL")
    return true;
  if (!output.verdict && output.output.trim().length < 40)
    return true;
  return false;
}
async function runWithEscalation(task, options) {
  const plan = planEscalation(task, options.models, options.policy, {
    bias: options.bias
  });
  const runner = options.runner ?? (options.dryRun ? makeDryHeadlessRunner() : defaultHeadlessRunner());
  const autoEscalate = options.policy?.autoEscalate ?? true;
  const attempts = [];
  const run = async (tier) => {
    const model = tier === "oracle" ? plan.tiers.oracle : plan.tiers.fast;
    const prior = attempts.length ? `

The fast model already attempted this and was inconclusive:
${attempts[attempts.length - 1].output.slice(0, 1200)}

Provide a stronger, correct solution.` : "";
    const out = await runner({
      cwd: options.cwd,
      prompt: `${task}${prior}

End your reply with VERDICT: PASS or VERDICT: FAIL.`,
      model: model ?? undefined,
      maxTurns: options.maxTurns,
      skipPermissions: options.skipPermissions
    });
    const attempt = {
      tier,
      model,
      verdict: out.verdict ?? null,
      isError: !!out.isError,
      output: out.output
    };
    attempts.push(attempt);
    return attempt;
  };
  const forceOracle = options.forceOracle && plan.tiers.oracle;
  const startTier = forceOracle ? "oracle" : plan.startTier;
  const first = await run(startTier);
  let escalated = false;
  if (startTier === "fast" && !plan.tiers.sameModel && plan.tiers.oracle && autoEscalate && needsEscalation(first)) {
    escalated = true;
    await run("oracle");
  }
  const final = attempts[attempts.length - 1];
  if (!options.dryRun) {
    const escRunId = Date.now().toString(36);
    for (const attempt of attempts) {
      recordOutcome(options.cwd, {
        id: `esc-${escRunId}-${attempt.tier}`,
        task,
        model: attempt.model,
        pass: attempt.verdict === "PASS" && !attempt.isError,
        detail: `escalation ${attempt.tier} ${attempt.verdict ?? "no-verdict"}`
      });
    }
  }
  return {
    task: task.trim(),
    plan,
    attempts,
    escalated,
    finalTier: final.tier,
    output: final.output
  };
}
async function consultOracle(question, options) {
  const tiers = selectTiers(options.models, options.policy);
  const runner = options.runner ?? (options.dryRun ? makeDryHeadlessRunner() : defaultHeadlessRunner());
  const out = await runner({
    cwd: options.cwd,
    prompt: `Act as the Oracle: a careful second-opinion reviewer. Analyze the following and give the most rigorous, correct answer. Call out flaws, edge cases, and a concrete recommendation.

${question}`,
    model: tiers.oracle ?? undefined,
    maxTurns: options.maxTurns
  });
  return { model: tiers.oracle, output: out.output, verdict: out.verdict ?? null };
}
function policyPath(cwd) {
  return join(cwd, ".ur", "escalation.json");
}
function loadPolicy(cwd) {
  const path = policyPath(cwd);
  if (!existsSync(path))
    return {};
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  return parsed && typeof parsed === "object" ? parsed : {};
}
function savePolicy(cwd, policy) {
  mkdirSync(join(cwd, ".ur"), { recursive: true });
  writeFileSync(policyPath(cwd), `${JSON.stringify(policy, null, 2)}
`);
}
function formatPlan(plan, json) {
  if (json)
    return JSON.stringify(plan, null, 2);
  const lines = [
    `Task: ${plan.task || "<empty>"}`,
    "",
    `Fast model:   ${plan.tiers.fast ?? "none"}`,
    `Oracle model: ${plan.tiers.oracle ?? "none"}`,
    `Difficulty:   ${plan.difficulty.hard ? "hard" : "routine"} (score ${plan.difficulty.score})${plan.difficulty.signals.length ? ` — ${plan.difficulty.signals.join(", ")}` : ""}`,
    `Start tier:   ${plan.startTier}`,
    `Plan:         ${plan.rationale}`
  ];
  if (plan.tiers.reasons.length) {
    lines.push("", "Selection:");
    for (const r of plan.tiers.reasons)
      lines.push(`  - ${r}`);
  }
  return lines.join(`
`);
}
function formatEscalationResult(result, json) {
  if (json)
    return JSON.stringify(result, null, 2);
  const lines = [
    `Task: ${result.task}`,
    `Escalated: ${result.escalated ? "yes" : "no"}   Final tier: ${result.finalTier}`,
    ""
  ];
  for (const a of result.attempts) {
    lines.push(`${a.tier === "oracle" ? "◆" : "○"} ${a.tier} [${a.model ?? "auto"}] → ${a.isError ? "error" : a.verdict ?? "no verdict"}`);
    lines.push(`    ${a.output.replace(/\s+/g, " ").trim().slice(0, 200)}`);
  }
  return lines.join(`
`);
}
var HARD_KEYWORDS;
var init_escalation = __esm(() => {
  init_json();
  init_headlessAgent();
  init_intentRouter();
  init_learning();
  HARD_KEYWORDS = /\b(debug|race condition|deadlock|concurren|distributed|architect|redesign|refactor|optimi[sz]e|proof|prove|why does|root cause|security|vulnerab|migrat|algorithm|complex|trade[\s-]?off)\b/i;
});

export { planEscalation, runWithEscalation, consultOracle, loadPolicy, savePolicy, formatPlan, formatEscalationResult, init_escalation };
