import {
  init_intentRouter,
  routeIntent
} from "./index-5jrgxedg.js";
import {
  defaultHeadlessRunner,
  init_headlessAgent,
  makeDryHeadlessRunner
} from "./index-hp4vvv8v.js";
import {
  extractVerdict,
  init_cliStepRunner
} from "./index-zn5x3nwj.js";
import {
  init_projectGates,
  loadVerifyConfig,
  runGateCommands
} from "./index-43251g5q.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/verificationProofs.ts
function proofBlocks(output) {
  const lines = output.split(`
`);
  const blocks = [];
  let current = [];
  for (const line of lines) {
    const startsProof = REQUIRED_VERIFICATION_PROOFS.some((kind) => PROOF_PATTERNS[kind].some((pattern) => pattern.test(line)));
    if (startsProof && current.length > 0) {
      blocks.push(current.join(`
`));
      current = [];
    }
    if (startsProof || current.length > 0) {
      current.push(line);
    }
  }
  if (current.length > 0)
    blocks.push(current.join(`
`));
  return blocks;
}
function hasProof(output, kind) {
  return proofBlocks(output).some((block) => PROOF_PATTERNS[kind].some((pattern) => pattern.test(block)) && COMMAND_EVIDENCE_RE.test(block) && OBSERVATION_EVIDENCE_RE.test(block));
}
function evaluateVerificationProofs(output) {
  const present = REQUIRED_VERIFICATION_PROOFS.filter((kind) => hasProof(output, kind));
  const missing = REQUIRED_VERIFICATION_PROOFS.filter((kind) => !present.includes(kind));
  return { ok: missing.length === 0, present, missing };
}
function enforceNoPassWithoutProof(verdict, output) {
  const proofCheck = evaluateVerificationProofs(output);
  if (verdict !== "PASS" || proofCheck.ok) {
    return { verdict, output, proofCheck, proofFailure: false };
  }
  return {
    verdict: "FAIL",
    output: [
      output,
      "",
      "[deterministic proof check]",
      `VERDICT: FAIL because PASS was claimed without required proof: ${proofCheck.missing.join(", ")}`
    ].join(`
`),
    proofCheck,
    proofFailure: true
  };
}
var REQUIRED_VERIFICATION_PROOFS, PROOF_PATTERNS, COMMAND_EVIDENCE_RE, OBSERVATION_EVIDENCE_RE;
var init_verificationProofs = __esm(() => {
  REQUIRED_VERIFICATION_PROOFS = [
    "compile",
    "test",
    "lint",
    "diff",
    "runtime"
  ];
  PROOF_PATTERNS = {
    compile: [/\bcompile proof\b/i, /\bbuild proof\b/i],
    test: [/\btest proof\b/i],
    lint: [/\blint proof\b/i],
    diff: [/\bdiff proof\b/i],
    runtime: [/\bruntime proof\b/i]
  };
  COMMAND_EVIDENCE_RE = /\b(command|ran|run)\b|`[^`]+`/i;
  OBSERVATION_EVIDENCE_RE = /\b(output|stdout|stderr|exit(?:ed| code)?|passed|failed|succeeded|ok|reviewed|showed)\b/i;
});

// ../../src/services/agents/kernel.ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
function defaultGuard(skipPermissions) {
  return {
    canUseTool: (_toolName, _input) => ({
      allowed: skipPermissions === true,
      reason: skipPermissions ? "permissions skipped" : "interactive ask treated as deny in kernel"
    })
  };
}
function defaultRouter() {
  return {
    routeTask: (task) => routeIntent(task),
    recommendModel: () => null
  };
}
function defaultMemory(cwd) {
  return {
    loadMemorySnippet: (scope, agentType) => {
      const base = scope === "project" ? join(cwd, ".ur", "memory") : join(cwd, ".ur", "memory");
      const path = join(base, `${agentType}.md`);
      return existsSync(path) ? readFileSync(path, "utf-8") : null;
    }
  };
}
function defaultExecutor() {
  return {
    execute: async (stage, options) => {
      const runner = options.runner ?? defaultHeadlessRunner();
      const out = await runner({
        cwd: stage.context.cwd,
        prompt: stage.instructions ?? stage.goal,
        maxTurns: options.maxTurns,
        skipPermissions: options.skipPermissions
      });
      return {
        stage,
        verdict: out.verdict ?? extractVerdict(out.output),
        output: out.output,
        isError: out.isError ?? false,
        artifacts: []
      };
    }
  };
}
function defaultVerifier() {
  return {
    verify: async (stage, options) => {
      const config = await loadVerifyConfig(stage.context.cwd);
      const gateResults = [];
      const emitGate = (command, ok) => {
        gateResults.push({ kind: "note", text: `${ok ? "PASS" : "FAIL"} gate: ${command}` });
      };
      if (config?.afterEdit && config.afterEdit.length > 0) {
        const gate = await runGateCommands(config.afterEdit, stage.context.cwd, config.timeoutMs);
        if (!gate.ok) {
          const failed = gate;
          emitGate(failed.command, false);
          return {
            stage,
            verdict: "FAIL",
            output: failed.reminder,
            isError: true,
            artifacts: gateResults
          };
        }
        for (const cmd of config.afterEdit)
          emitGate(cmd, true);
      }
      const runner = options.runner ?? defaultHeadlessRunner();
      const out = await runner({
        cwd: stage.context.cwd,
        prompt: stage.instructions ?? stage.goal,
        maxTurns: options.maxTurns,
        skipPermissions: options.skipPermissions
      });
      const initialVerdict = out.verdict ?? extractVerdict(out.output) ?? "PARTIAL";
      const strict = enforceNoPassWithoutProof(initialVerdict, out.output);
      if (strict.proofFailure) {
        gateResults.push({
          kind: "note",
          text: `FAIL proof: missing ${strict.proofCheck.missing.join(", ")}`
        });
      }
      return {
        stage,
        verdict: strict.verdict,
        output: strict.output,
        isError: (out.isError ?? false) || strict.proofFailure,
        artifacts: gateResults
      };
    }
  };
}
function defaultCritic() {
  return {
    review: async (stage, previousOutput, options) => {
      const runner = options.runner ?? defaultHeadlessRunner();
      const prompt = [
        "You are a critic reviewing another agent's work.",
        "Original task:",
        stage.goal,
        "",
        "Agent output:",
        previousOutput.slice(0, 4000),
        "",
        "Identify gaps, risks, or better approaches. End with VERDICT: PASS if satisfactory, VERDICT: FAIL if material issues remain, or VERDICT: PARTIAL if limited by environment."
      ].join(`
`);
      const out = await runner({ cwd: stage.context.cwd, prompt, maxTurns: options.maxTurns });
      return {
        stage: { ...stage, name: `${stage.name}:critic`, role: "critic" },
        verdict: out.verdict ?? extractVerdict(out.output),
        output: out.output,
        isError: out.isError ?? false,
        artifacts: []
      };
    }
  };
}
function createAgentKernel(options) {
  return {
    guard: defaultGuard(options.skipPermissions),
    router: defaultRouter(),
    memory: defaultMemory(options.cwd),
    planner: { planStages: () => [] },
    executor: defaultExecutor(),
    verifier: defaultVerifier(),
    critic: defaultCritic()
  };
}
async function runKernelStage(kernel, stage, options) {
  options.onEvent?.({ kind: "stage-start", stage: stage.name, role: stage.role });
  const runner = options.runner ?? (options.dryRun ? makeDryHeadlessRunner() : defaultHeadlessRunner());
  const runOptions = {
    runner,
    maxTurns: options.maxTurns,
    skipPermissions: options.skipPermissions
  };
  let result;
  switch (stage.role) {
    case "executor":
      result = await kernel.executor.execute(stage, runOptions);
      break;
    case "verifier":
      result = await kernel.verifier.verify(stage, runOptions);
      break;
    case "critic":
      result = await kernel.critic.review(stage, stage.context.priorOutputs?.previous ?? "", runOptions);
      break;
    case "planner":
      result = {
        stage,
        verdict: null,
        output: "Planner role: stage list produced.",
        isError: false,
        artifacts: [],
        nextStages: kernel.planner.planStages(stage.context)
      };
      break;
    case "memory": {
      const snippet = kernel.memory.loadMemorySnippet("project", stage.name);
      result = {
        stage,
        verdict: null,
        output: snippet ?? "(no memory snippet)",
        isError: false,
        artifacts: snippet ? [{ kind: "note", text: snippet }] : []
      };
      break;
    }
    case "router": {
      const route = kernel.router.routeTask(stage.goal);
      result = {
        stage,
        verdict: null,
        output: `Routed to ${route.agent} (${route.category}) with pattern ${route.pattern ?? "single"}.`,
        isError: false,
        artifacts: [{ kind: "note", text: JSON.stringify(route) }]
      };
      break;
    }
    case "guard": {
      const check = kernel.guard.canUseTool(stage.name, stage.goal);
      result = {
        stage,
        verdict: check.allowed ? "PASS" : "FAIL",
        output: check.reason ?? (check.allowed ? "allowed" : "denied"),
        isError: !check.allowed,
        artifacts: []
      };
      break;
    }
    default:
      result = {
        stage,
        verdict: "PARTIAL",
        output: `Unsupported kernel role: ${stage.role}`,
        isError: true,
        artifacts: []
      };
  }
  options.onEvent?.({ kind: "stage-done", stage: stage.name, verdict: result.verdict, isError: result.isError });
  for (const artifact of result.artifacts) {
    options.onEvent?.({ kind: "artifact", stage: stage.name, artifact });
  }
  return result;
}
var init_kernel = __esm(() => {
  init_intentRouter();
  init_headlessAgent();
  init_cliStepRunner();
  init_projectGates();
  init_verificationProofs();
});

export { enforceNoPassWithoutProof, init_verificationProofs, createAgentKernel, runKernelStage, init_kernel };
