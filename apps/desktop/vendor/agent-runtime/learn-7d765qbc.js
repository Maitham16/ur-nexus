import {
  init_escalation,
  loadPolicy,
  savePolicy
} from "./index-sm6sjxmf.js";
import {
  bestModelForCategory,
  formatLearnResult,
  formatStats,
  init_learning,
  loadStats,
  runLearn
} from "./index-qg6cjfb3.js";
import"./index-5jrgxedg.js";
import"./index-hp4vvv8v.js";
import"./index-zn5x3nwj.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import"./index-wxsgjqjk.js";
import"./index-wred0kdg.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-m9qhxms7.js";
import"./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/learn/learn.ts
function usage() {
  return [
    "Usage:",
    "  ur learn [run] [--reflect] [--dry-run] [--json]",
    "  ur learn stats [--json]",
    "  ur learn apply [--json]",
    "",
    "Mines verifiable artifacts (test runs, approved/rejected diffs) into a",
    "per-category / per-model success-rate store that escalate, arena, and",
    "model-route consult. `--reflect` distills lessons from new failures.",
    "`apply` pins the escalation oracle to the best-performing local model."
  ].join(`
`);
}
function bestOverallModel(stats, minSamples = 5) {
  let best = null;
  for (const [model, tally] of Object.entries(stats.models)) {
    const total = tally.pass + tally.fail;
    if (total < minSamples)
      continue;
    const rate = tally.pass / total;
    if (!best || rate > best.rate)
      best = { model, rate };
  }
  return best;
}
var call = async (args) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const action = tokens.find((token) => !token.startsWith("--")) ?? "run";
  if (action === "help")
    return { type: "text", value: usage() };
  if (action === "stats") {
    return { type: "text", value: formatStats(loadStats(cwd), json) };
  }
  if (action === "apply") {
    const stats = loadStats(cwd);
    const best = bestOverallModel(stats);
    if (!best) {
      return {
        type: "text",
        value: "Not enough evidence to tune yet. Capture more outcomes (`ur artifacts`, " + "`ur ci-loop`) and run `ur learn` a few times first."
      };
    }
    const policy = loadPolicy(cwd);
    const next = { ...policy, oracle: best.model };
    savePolicy(cwd, next);
    const codingBest = bestModelForCategory(stats, "coding");
    const payload = {
      appliedOracle: best.model,
      oracleSuccessRate: Number(best.rate.toFixed(2)),
      codingBest
    };
    if (json)
      return { type: "text", value: JSON.stringify(payload, null, 2) };
    return {
      type: "text",
      value: `Pinned escalation oracle to ${best.model} ` + `(${Math.round(best.rate * 100)}% success over learned runs).` + (codingBest ? `
Best for coding: ${codingBest.model} (${Math.round(codingBest.rate * 100)}%).` : "")
    };
  }
  if (action === "run") {
    const result = await runLearn({
      cwd,
      reflect: tokens.includes("--reflect"),
      dryRun: tokens.includes("--dry-run")
    });
    return { type: "text", value: formatLearnResult(result, json) };
  }
  return { type: "text", value: usage() };
};
var init_learn = __esm(() => {
  init_escalation();
  init_learning();
  init_argumentSubstitution();
  init_cwd();
});
init_learn();

export {
  call
};
