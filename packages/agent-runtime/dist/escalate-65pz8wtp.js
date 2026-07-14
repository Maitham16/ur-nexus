import {
  consultOracle,
  formatEscalationResult,
  formatPlan,
  init_escalation,
  loadPolicy,
  planEscalation,
  runWithEscalation,
  savePolicy
} from "./index-sm6sjxmf.js";
import {
  init_model_doctor,
  listModelCapabilities
} from "./index-j4g1j45r.js";
import {
  init_learning,
  loadStats,
  taskDifficultyBias
} from "./index-qg6cjfb3.js";
import"./index-5jrgxedg.js";
import"./index-hp4vvv8v.js";
import"./index-zn5x3nwj.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
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

// ../../src/commands/escalate/escalate.ts
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
function freeText(tokens, valueFlags) {
  const withValue = new Set(valueFlags);
  const parts = [];
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (withValue.has(token)) {
      i++;
      continue;
    }
    if (token.startsWith("--"))
      continue;
    parts.push(token);
  }
  return parts.slice(1).join(" ").trim();
}
function usage() {
  return [
    "Usage:",
    '  ur escalate plan "<task>" [--json]',
    '  ur escalate run "<task>" [--dry-run] [--force-oracle] [--max-turns N] [--skip-permissions] [--json]',
    '  ur escalate oracle "<question>" [--dry-run] [--json]',
    "  ur escalate policy [--fast <model>] [--oracle <model>] [--auto on|off] [--json]",
    "",
    "Routine work runs on the fast model; hard reasoning/debug/review auto-escalates",
    "to the strongest local model. Tiers come from `ur model-doctor`."
  ].join(`
`);
}
var VALUE_FLAGS, call = async (args) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const action = tokens.find((t) => !t.startsWith("--")) ?? "plan";
  const policy = loadPolicy(cwd);
  if (action === "policy") {
    const next = { ...policy };
    const fast = option(tokens, "--fast");
    const oracle = option(tokens, "--oracle");
    const auto = option(tokens, "--auto");
    if (fast)
      next.fast = fast;
    if (oracle)
      next.oracle = oracle;
    if (auto)
      next.autoEscalate = auto !== "off" && auto !== "false";
    if (fast || oracle || auto)
      savePolicy(cwd, next);
    return {
      type: "text",
      value: json ? JSON.stringify(next, null, 2) : `Escalation policy:
  fast:   ${next.fast ?? "(auto)"}
  oracle: ${next.oracle ?? "(auto)"}
  auto:   ${next.autoEscalate ?? true}`
    };
  }
  const task = freeText(tokens, VALUE_FLAGS);
  if (!task)
    return { type: "text", value: usage() };
  const { models } = await listModelCapabilities();
  const maxTurnsRaw = option(tokens, "--max-turns");
  const maxTurns = maxTurnsRaw ? Number(maxTurnsRaw) : undefined;
  const bias = taskDifficultyBias(loadStats(cwd), task);
  if (action === "oracle") {
    const result = await consultOracle(task, {
      cwd,
      models,
      policy,
      dryRun: tokens.includes("--dry-run"),
      maxTurns
    });
    return {
      type: "text",
      value: json ? JSON.stringify(result, null, 2) : `Oracle [${result.model ?? "none"}]${result.verdict ? ` (${result.verdict})` : ""}:

${result.output}`
    };
  }
  if (action === "run") {
    const result = await runWithEscalation(task, {
      cwd,
      models,
      policy,
      dryRun: tokens.includes("--dry-run"),
      forceOracle: tokens.includes("--force-oracle"),
      skipPermissions: tokens.includes("--skip-permissions"),
      maxTurns,
      bias
    });
    return { type: "text", value: formatEscalationResult(result, json) };
  }
  const plan = planEscalation(task, models, policy, { bias });
  return { type: "text", value: formatPlan(plan, json) };
};
var init_escalate = __esm(() => {
  init_model_doctor();
  init_escalation();
  init_learning();
  init_argumentSubstitution();
  init_cwd();
  VALUE_FLAGS = ["--fast", "--oracle", "--max-turns", "--auto"];
});
init_escalate();

export {
  call
};
