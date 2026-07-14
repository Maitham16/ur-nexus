import {
  consultOracle,
  formatEscalationResult,
  formatPlan,
  init_escalation,
  loadPolicy,
  planEscalation,
  runWithEscalation,
  savePolicy
} from "./index-vjanxfn6.js";
import {
  init_model_doctor,
  listModelCapabilities
} from "./index-h9kt1sj4.js";
import {
  init_learning,
  loadStats,
  taskDifficultyBias
} from "./index-df0wfzdw.js";
import"./index-hakw7em9.js";
import"./index-c6n1hema.js";
import"./index-rad7f2cp.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
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

// src/commands/escalate/escalate.ts
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
