import {
  buildRunPlan,
  formatExecResult,
  formatRunPlan,
  formatValidation,
  init_executor,
  init_runWorkflow,
  init_workflows,
  listWorkflows,
  loadRunState,
  loadWorkflow,
  markStepComplete,
  renderWorkflowAscii,
  renderWorkflowMermaid,
  resetRunState,
  runWorkflowSpec,
  saveWorkflow,
  validateWorkflow
} from "./index-ydq3mpzq.js";
import"./index-ad9qp29k.js";
import"./index-wxp81q89.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-ke69cyc7.js";
import"./index-cmw2ae5x.js";
import"./index-mwn5bkf6.js";
import"./index-dsy9thtk.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/liveBoard.ts
class LiveExecutionBoard {
  name;
  steps = new Map;
  order = [];
  iteration = 1;
  waves = 0;
  status = null;
  constructor(name, seed = []) {
    this.name = name;
    for (const step of seed)
      this.touch(step.id, step.agent);
  }
  touch(id, agent) {
    let step = this.steps.get(id);
    if (!step) {
      step = {
        id,
        agent: agent ?? "",
        state: "pending",
        verdict: null,
        iteration: this.iteration
      };
      this.steps.set(id, step);
      this.order.push(id);
    } else if (agent) {
      step.agent = agent;
    }
    return step;
  }
  apply(event) {
    switch (event.kind) {
      case "wave":
        this.waves += 1;
        this.iteration = event.iteration;
        for (const id of event.ids)
          this.touch(id);
        break;
      case "step-start": {
        const step = this.touch(event.id, event.agent);
        step.state = "running";
        step.iteration = event.iteration;
        break;
      }
      case "step-done": {
        const step = this.touch(event.id);
        step.state = event.isError ? "failed" : "done";
        if (event.verdict)
          step.verdict = event.verdict;
        break;
      }
      case "gate":
        if (event.result === "hold")
          this.touch(event.id).state = "held";
        break;
      case "loop":
        this.iteration = event.iteration;
        break;
      case "finish":
        this.status = event.status;
        break;
    }
  }
  snapshot() {
    return this.order.map((id) => this.steps.get(id));
  }
  counts() {
    const counts = {
      pending: 0,
      running: 0,
      done: 0,
      failed: 0,
      held: 0,
      total: 0
    };
    for (const id of this.order) {
      const step = this.steps.get(id);
      if (!step)
        continue;
      counts[step.state] += 1;
      counts.total += 1;
    }
    return counts;
  }
  renderBoard() {
    const counts = this.counts();
    const header = this.status ? `workflow ${this.name} — ${this.status} (${counts.done}/${counts.total} done` + `${counts.failed ? `, ${counts.failed} failed` : ""}` + `${counts.held ? `, ${counts.held} held` : ""})` : `workflow ${this.name} — iteration ${this.iteration} · ` + `▶ ${counts.running} running · ✓ ${counts.done}/${counts.total} done`;
    const width = Math.min(18, Math.max(8, ...this.order.map((id) => id.length)));
    const lines = [header];
    for (const step of this.snapshot()) {
      const verdict = step.verdict ? `  VERDICT: ${step.verdict}` : "";
      const note = step.state === "running" ? "  …" : "";
      lines.push(`  ${GLYPH[step.state]} ${step.id.padEnd(width)} (${step.agent})${note}${verdict}`);
    }
    return lines.join(`
`);
  }
}
function formatLiveEvent(event) {
  switch (event.kind) {
    case "wave":
      return event.ids.length > 1 ? `▶ running ${event.ids.length} in parallel: ${event.ids.join(", ")}` : null;
    case "step-start":
      return `▶ ${event.id} (${event.agent}) started`;
    case "step-done":
      return `${event.isError ? "✗" : "✓"} ${event.id} done${event.verdict ? ` — VERDICT: ${event.verdict}` : ""}`;
    case "gate":
      return `⛓ ${event.id} gate ${event.gate} → ${event.result}`;
    case "loop":
      return `↻ loop ${event.from} → ${event.to} (iteration ${event.iteration})`;
    case "finish":
      return `■ finished: ${event.status}`;
    default:
      return null;
  }
}
var GLYPH;
var init_liveBoard = __esm(() => {
  GLYPH = {
    pending: "·",
    running: "▶",
    done: "✓",
    failed: "✗",
    held: "⏸"
  };
});

// ../../src/commands/workflow/workflow.ts
function optionValue(tokens, flag) {
  const index = tokens.indexOf(flag);
  return index >= 0 ? tokens[index + 1] : undefined;
}
function sampleWorkflow(name) {
  return {
    version: 1,
    name: name || "example",
    description: "Example checkpointed agent workflow. Edit the steps freely.",
    steps: [
      {
        id: "research",
        name: "Research",
        agent: "docs-researcher",
        prompt: "Research the problem and gather primary sources.",
        dependsOn: [],
        checkpoint: true
      },
      {
        id: "implement",
        name: "Implement",
        agent: "worker",
        prompt: "Implement the change based on the research, verifying as you go.",
        dependsOn: ["research"],
        checkpoint: true
      },
      {
        id: "verify",
        name: "Verify",
        agent: "verification",
        prompt: "Verify the change end to end. End with VERDICT: PASS or VERDICT: FAIL.",
        dependsOn: ["implement"],
        gate: "verification"
      }
    ]
  };
}
function notFound(name) {
  const available = listWorkflows(getCwd());
  const hint = available.length > 0 ? `
Available: ${available.join(", ")}` : "";
  return {
    type: "text",
    value: `Workflow not found: ${name}${hint}
Create one: ur workflow init ${name}`
  };
}
var call = async (args) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const ascii = tokens.includes("--ascii");
  const force = tokens.includes("--force");
  const positional = tokens.filter((token) => !token.startsWith("--"));
  const command = positional[0] ?? "list";
  const name = positional[1];
  if (command === "list") {
    const names = listWorkflows(cwd);
    if (json)
      return { type: "text", value: JSON.stringify({ workflows: names }, null, 2) };
    if (names.length === 0) {
      return { type: "text", value: "No workflows yet. Create one: ur workflow init" };
    }
    return { type: "text", value: `Workflows:
${names.map((n) => `  - ${n}`).join(`
`)}` };
  }
  if (command === "init") {
    const spec2 = sampleWorkflow(name ?? "example");
    const result = saveWorkflow(cwd, spec2, { force });
    return {
      type: "text",
      value: result.created ? `Created workflow ${spec2.name} at ${result.path}` : `Workflow already exists at ${result.path} (use --force to overwrite)`
    };
  }
  if (!name) {
    return { type: "text", value: `Usage: ur workflow ${command} <name>` };
  }
  const spec = loadWorkflow(cwd, name);
  if (!spec)
    return notFound(name);
  if (command === "validate") {
    const validation = validateWorkflow(spec);
    if (json)
      return { type: "text", value: JSON.stringify(validation, null, 2) };
    return { type: "text", value: formatValidation(spec, validation) };
  }
  if (command === "graph") {
    const value = ascii ? renderWorkflowAscii(spec) : renderWorkflowMermaid(spec);
    return { type: "text", value };
  }
  if (command === "show") {
    const validation = validateWorkflow(spec);
    if (json) {
      return {
        type: "text",
        value: JSON.stringify({ spec, validation }, null, 2)
      };
    }
    const lines = [
      `Workflow: ${spec.name}`,
      spec.description ? spec.description : "",
      spec.pattern ? `Pattern: ${spec.pattern}` : "",
      "",
      renderWorkflowAscii(spec),
      "",
      formatValidation(spec, validation),
      "",
      "Mermaid:",
      renderWorkflowMermaid(spec)
    ].filter((line) => line !== "");
    return { type: "text", value: lines.join(`
`) };
  }
  if (command === "plan") {
    const plan = buildRunPlan(spec, loadRunState(cwd, name));
    if (json)
      return { type: "text", value: JSON.stringify(plan, null, 2) };
    return { type: "text", value: formatRunPlan(plan) };
  }
  if (command === "next") {
    const plan = buildRunPlan(spec, loadRunState(cwd, name));
    if (!plan.nextStepId) {
      return {
        type: "text",
        value: plan.completed === plan.total ? `Workflow ${name} is complete.` : `No ready step for ${name} (blocked or cyclic).`
      };
    }
    const step = spec.steps.find((s) => s.id === plan.nextStepId);
    if (!step)
      return { type: "text", value: `Next step ${plan.nextStepId} missing from spec.` };
    if (json)
      return { type: "text", value: JSON.stringify(step, null, 2) };
    return {
      type: "text",
      value: [
        `Next step: ${step.id} (${step.name})`,
        step.gate ? `Gate: ${step.gate}` : "",
        "",
        `Agent({ subagent_type: "${step.agent}", description: ${JSON.stringify(step.name)}, prompt: ${JSON.stringify(step.prompt)} })`,
        "",
        `Mark complete: ur workflow done ${name} ${step.id}`
      ].filter((line) => line !== "").join(`
`)
    };
  }
  if (command === "done") {
    const stepId = positional[2];
    if (!stepId)
      return { type: "text", value: `Usage: ur workflow done ${name} <stepId>` };
    if (!spec.steps.some((s) => s.id === stepId)) {
      return { type: "text", value: `No step "${stepId}" in workflow ${name}.` };
    }
    markStepComplete(cwd, name, stepId);
    const plan = buildRunPlan(spec, loadRunState(cwd, name));
    if (json)
      return { type: "text", value: JSON.stringify(plan, null, 2) };
    return { type: "text", value: `Marked ${stepId} complete.

${formatRunPlan(plan)}` };
  }
  if (command === "reset") {
    resetRunState(cwd, name);
    return { type: "text", value: `Reset run state for ${name}.` };
  }
  if (command === "run") {
    const validation = validateWorkflow(spec);
    if (!validation.valid) {
      return { type: "text", value: formatValidation(spec, validation) };
    }
    const dryRun = tokens.includes("--dry-run");
    const resume = tokens.includes("--resume");
    const skipPermissions = tokens.includes("--skip-permissions") || tokens.includes("--dangerously-skip-permissions");
    const maxTurnsValue = Number(optionValue(tokens, "--max-turns") ?? "30");
    const concurrencyValue = Number(optionValue(tokens, "--concurrency") ?? "");
    const maxConcurrency = Number.isFinite(concurrencyValue) && concurrencyValue >= 1 ? Math.floor(concurrencyValue) : undefined;
    const live = tokens.includes("--live") && !json;
    const board = live ? new LiveExecutionBoard(spec.name, validation.order.map((id) => {
      const step = spec.steps.find((s) => s.id === id);
      return { id, agent: step?.agent ?? "general-purpose" };
    })) : null;
    const result = await runWorkflowSpec(spec, {
      cwd,
      stateName: name,
      dryRun,
      resume,
      skipPermissions,
      maxTurns: Number.isFinite(maxTurnsValue) && maxTurnsValue > 0 ? maxTurnsValue : 30,
      maxConcurrency,
      onEvent: board ? (event) => {
        board.apply(event);
        const line = formatLiveEvent(event);
        if (line)
          process.stderr.write(`${line}
`);
      } : undefined
    });
    if (json)
      return { type: "text", value: JSON.stringify(result, null, 2) };
    const header = dryRun ? `(dry run — no model calls)

` : "";
    const liveBoard = board ? `${board.renderBoard()}

` : "";
    return { type: "text", value: `${header}${liveBoard}${formatExecResult(result)}` };
  }
  return { type: "text", value: `Unknown workflow command: ${command}` };
};
var init_workflow = __esm(() => {
  init_executor();
  init_liveBoard();
  init_runWorkflow();
  init_workflows();
  init_argumentSubstitution();
  init_cwd();
});
init_workflow();

export {
  call
};
