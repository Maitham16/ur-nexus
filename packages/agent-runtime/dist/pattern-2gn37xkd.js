import {
  buildExecutionPlan,
  compilePatternToWorkflow,
  formatExecResult,
  formatExecutionPlan,
  formatPatternDetail,
  formatPatternList,
  getPattern,
  init_executor,
  init_patterns,
  init_runWorkflow,
  init_workflows,
  listPatterns,
  saveAndRunWorkflow,
  saveWorkflow,
  scaffoldPattern
} from "./index-a4c9gaxt.js";
import"./index-rad7f2cp.js";
import"./index-keaxkjg6.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
import"./index-y4htdtvj.js";
import"./index-s5dp14ed.js";
import"./index-0r3wd4mq.js";
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

// src/commands/pattern/pattern.ts
function knownIds() {
  return listPatterns().map((pattern) => pattern.id).join(", ");
}
function optionValue(tokens, flag) {
  const index = tokens.indexOf(flag);
  return index >= 0 ? tokens[index + 1] : undefined;
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const force = tokens.includes("--force");
  const save = tokens.includes("--save");
  const positional = tokens.filter((token) => !token.startsWith("--"));
  const command = positional[0] ?? "list";
  if (command === "list") {
    return { type: "text", value: formatPatternList(json) };
  }
  const id = positional[1];
  if (!id) {
    return {
      type: "text",
      value: `Usage: ur pattern ${command} <${knownIds()}>`
    };
  }
  const pattern = getPattern(id);
  if (!pattern) {
    return {
      type: "text",
      value: `Unknown pattern: ${id}
Known patterns: ${knownIds()}`
    };
  }
  if (command === "show") {
    return { type: "text", value: formatPatternDetail(pattern, json) };
  }
  if (command === "run") {
    const task = positional.slice(2).join(" ");
    const execute = tokens.includes("--execute") || tokens.includes("--live");
    if (execute) {
      const workflow = compilePatternToWorkflow(pattern, task.trim() || "{{task}}");
      workflow.name = `${pattern.id}-run`;
      const dryRun = tokens.includes("--dry-run");
      const maxTurnsValue = Number(optionValue(tokens, "--max-turns") ?? "30");
      const parallelAgents = pattern.stages.filter((s) => s.parallelizable).length;
      const result = await saveAndRunWorkflow(workflow, {
        cwd: getCwd(),
        stateName: workflow.name,
        dryRun,
        resume: tokens.includes("--resume"),
        skipPermissions: tokens.includes("--skip-permissions") || tokens.includes("--dangerously-skip-permissions"),
        maxTurns: Number.isFinite(maxTurnsValue) && maxTurnsValue > 0 ? maxTurnsValue : 30,
        maxConcurrency: parallelAgents > 1 ? parallelAgents : undefined,
        loop: pattern.loop ? {
          from: pattern.loop.from,
          to: pattern.loop.to,
          maxIterations: pattern.loop.maxIterations
        } : null
      });
      if (json)
        return { type: "text", value: JSON.stringify(result, null, 2) };
      const header = dryRun ? `(dry run — no model calls)

` : "";
      return { type: "text", value: `${header}${formatExecResult(result)}` };
    }
    const plan = buildExecutionPlan(pattern, task);
    let savedNote = "";
    if (save) {
      const workflow = compilePatternToWorkflow(pattern, plan.task);
      workflow.name = `${pattern.id}-run`;
      const result = saveWorkflow(getCwd(), workflow, { force: true });
      savedNote = `

Saved workflow: ${result.path}`;
    }
    if (json) {
      return { type: "text", value: formatExecutionPlan(plan, true) };
    }
    return { type: "text", value: `${formatExecutionPlan(plan, false)}${savedNote}` };
  }
  if (command === "install") {
    const result = scaffoldPattern(getCwd(), pattern.id, { force });
    if (json)
      return { type: "text", value: JSON.stringify(result, null, 2) };
    const lines = [`Installed pattern ${pattern.id} under ${result.root}`];
    if (result.created.length > 0)
      lines.push(`created: ${result.created.join(", ")}`);
    if (result.skipped.length > 0)
      lines.push(`kept existing: ${result.skipped.join(", ")}`);
    return { type: "text", value: lines.join(`
`) };
  }
  return {
    type: "text",
    value: `Unknown pattern command: ${command}

${formatPatternList(false)}`
  };
};
var init_pattern = __esm(() => {
  init_patterns();
  init_executor();
  init_runWorkflow();
  init_workflows();
  init_argumentSubstitution();
  init_cwd();
});
init_pattern();

export {
  call
};
