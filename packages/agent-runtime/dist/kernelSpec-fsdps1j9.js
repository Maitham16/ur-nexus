import {
  init_kernel,
  runKernelStage
} from "./index-xqtjgfp5.js";
import {
  init_spec,
  loadSpec,
  markTaskDone,
  parseTasks,
  readPhase,
  writePhase
} from "./index-bf24ntas.js";
import"./index-9jhyh4w5.js";
import"./index-5jrgxedg.js";
import"./index-j15w02ww.js";
import"./index-ad9qp29k.js";
import"./index-43251g5q.js";
import"./index-mwn5bkf6.js";
import"./index-dsy9thtk.js";
import"./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/kernelSpec.ts
function isSpecRunStage(stage) {
  return stage.role === "executor" && "meta" in stage && typeof stage.meta === "object";
}
function asSpecRunStage(stage) {
  return isSpecRunStage(stage) ? stage : null;
}
function stageSucceeded(result) {
  return result.verdict === "PASS" && !result.isError;
}
function planSpecRun(cwd, name) {
  const spec = loadSpec(cwd, name);
  if (!spec)
    throw new Error(`Spec not found: ${name}`);
  const requirements = readPhase(cwd, name, "requirements") ?? "";
  const design = readPhase(cwd, name, "design") ?? "";
  const tasks = parseTasks(readPhase(cwd, name, "tasks") ?? "");
  const context = {
    cwd,
    specName: spec.name,
    goal: spec.goal
  };
  const baseContext = `Requirements:
${requirements}

Design:
${design}`.slice(0, 6000);
  return tasks.filter((t) => !t.done).map((task) => ({
    name: `spec-${spec.name}-${task.id}`,
    role: "executor",
    goal: task.title,
    context,
    instructions: `You are implementing one task of a specced feature.

${baseContext}

Your task ${task.id}: ${task.title}

` + `Implement only this task, consistent with the requirements and design. End your reply with VERDICT: PASS if complete, or VERDICT: FAIL.`,
    meta: { taskId: task.id, taskTitle: task.title }
  }));
}
function mapStageResultsToSpecRunResult(spec, results) {
  const pairs = results.map((r) => ({ result: r, stage: asSpecRunStage(r.stage) })).filter((p) => p.stage !== null);
  const ran = pairs.map((p) => ({
    id: p.stage.meta.taskId,
    title: p.stage.meta.taskTitle,
    status: stageSucceeded(p.result) ? "done" : "failed"
  }));
  const stoppedOnFailure = pairs.some((p) => !stageSucceeded(p.result));
  return {
    name: spec.name,
    ran,
    remaining: 0,
    stoppedOnFailure
  };
}
async function runSpecWithKernel(cwd, name, kernel, options) {
  const spec = loadSpec(cwd, name);
  if (!spec)
    throw new Error(`Spec not found: ${name}`);
  const stages = planSpecRun(cwd, name);
  const results = [];
  for (const stage of stages) {
    const result = await runKernelStage(kernel, stage, {
      cwd,
      dryRun: options.dryRun,
      maxTurns: options.maxTurns,
      skipPermissions: options.skipPermissions,
      runner: options.runner
    });
    results.push(result);
    const succeeded = stageSucceeded(result);
    if (!succeeded && stage.context.stopOnError !== false)
      break;
    const specStage = asSpecRunStage(stage);
    if (succeeded && specStage && !options.dryRun) {
      const tasksMd = readPhase(cwd, name, "tasks") ?? "";
      writePhase(cwd, name, "tasks", markTaskDone(tasksMd, specStage.meta.taskId));
    }
    if (!options.all)
      break;
  }
  return mapStageResultsToSpecRunResult(spec, results);
}
function planSpecVerify(cwd, name) {
  const spec = loadSpec(cwd, name);
  if (!spec)
    throw new Error(`Spec not found: ${name}`);
  const requirements = readPhase(cwd, name, "requirements") ?? "";
  const design = readPhase(cwd, name, "design") ?? "";
  const tasks = parseTasks(readPhase(cwd, name, "tasks") ?? "");
  return {
    name: `spec-${spec.name}-verify`,
    role: "verifier",
    goal: `Verify spec ${spec.name}: ${spec.goal}`,
    context: {
      cwd,
      specName: spec.name,
      goal: spec.goal
    },
    instructions: [
      "You are verifying the implementation of a specced feature.",
      "",
      "=== CRITICAL ===",
      "You are STRICTLY PROHIBITED from modifying the project. Read, run commands, and inspect only.",
      "You must be stricter than the implementer. No proof = no PASS.",
      "",
      "=== REQUIRED PROOFS ===",
      "Before PASS, confirm ALL of the following with command-run evidence:",
      "1. Compile proof: the project builds.",
      "2. Test proof: the relevant test suite passes.",
      "3. Lint proof: configured linters/type-checkers pass.",
      "4. Diff proof: changed files match the spec.",
      "5. Runtime proof: the feature behaves as required.",
      "",
      "=== SPEC ===",
      `Goal: ${spec.goal}`,
      "",
      "Requirements:",
      requirements || "(none written)",
      "",
      "Design:",
      design || "(none written)",
      "",
      "Tasks:",
      tasks.map((t) => `- [${t.done ? "x" : " "}] ${t.id}: ${t.title}`).join(`
`),
      "",
      "=== OUTPUT FORMAT ===",
      "Each check MUST include the exact command you ran and the observed output.",
      "End with exactly one line: VERDICT: PASS, VERDICT: FAIL, or VERDICT: PARTIAL."
    ].join(`
`)
  };
}
function mapKernelResultToSpecVerifyResult(result) {
  return {
    verdict: result.verdict ?? "PARTIAL",
    summary: result.verdict === "PASS" ? "All required proofs (compile, test, lint, diff, runtime) were demonstrated by the verifier." : result.verdict === "FAIL" ? "The verifier found failing evidence. See subagent output for details." : "The verifier could not reach a definitive PASS/FAIL verdict.",
    commandFailures: result.artifacts.filter((a) => a.kind === "note" && a.text.startsWith("FAIL gate")).length,
    gateResults: [],
    subagentOutput: result.output,
    generatedAt: new Date().toISOString()
  };
}
async function runSpecVerifyWithKernel(cwd, name, kernel, options) {
  const stage = planSpecVerify(cwd, name);
  const result = await runKernelStage(kernel, stage, {
    cwd,
    dryRun: options.dryRun,
    maxTurns: options.maxTurns,
    skipPermissions: options.skipPermissions,
    runner: options.runner
  });
  return mapKernelResultToSpecVerifyResult(result);
}
var init_kernelSpec = __esm(() => {
  init_kernel();
  init_spec();
});
init_kernelSpec();

export {
  runSpecWithKernel,
  runSpecVerifyWithKernel,
  planSpecVerify,
  planSpecRun,
  mapStageResultsToSpecRunResult,
  mapKernelResultToSpecVerifyResult
};
