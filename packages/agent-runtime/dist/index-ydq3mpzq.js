import {
  init_cliStepRunner,
  makeCliStepRunner,
  makeDryRunner
} from "./index-ad9qp29k.js";
import {
  require_dist
} from "./index-wxp81q89.js";
import {
  appendRunAction,
  init_runArtifacts,
  initializeResearchTrace,
  writeRunReport
} from "./index-cmw2ae5x.js";
import {
  init_json,
  safeParseJSON
} from "./index-mwn5bkf6.js";
import {
  getSessionId,
  init_state
} from "./index-nhjg91p1.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/services/agents/workflows.ts
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";
function slugifyWorkflowName(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}
function workflowsDir(cwd) {
  return join(cwd, ".ur", "workflows");
}
function stateDir(cwd) {
  return join(workflowsDir(cwd), ".state");
}
function workflowPath(cwd, name) {
  return join(workflowsDir(cwd), `${slugifyWorkflowName(name)}.yaml`);
}
function statePath(cwd, name) {
  return join(stateDir(cwd), `${slugifyWorkflowName(name)}.json`);
}
function parseWorkflowText(text) {
  const trimmed = text.trim();
  const parsed = trimmed.startsWith("{") ? safeParseJSON(trimmed, false) : import_yaml.parse(trimmed);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Workflow is not an object");
  }
  const spec = parsed;
  if (!spec.name || !Array.isArray(spec.steps)) {
    throw new Error("Workflow must have a name and a steps array");
  }
  return {
    version: 1,
    name: String(spec.name),
    description: spec.description ? String(spec.description) : undefined,
    pattern: spec.pattern ? String(spec.pattern) : undefined,
    steps: spec.steps.map(normalizeStep)
  };
}
function normalizeStep(raw, index) {
  const step = raw ?? {};
  const gate = step.gate === "approval" || step.gate === "verification" ? step.gate : undefined;
  return {
    id: String(step.id ?? `step-${index + 1}`),
    name: String(step.name ?? step.id ?? `Step ${index + 1}`),
    agent: String(step.agent ?? "general-purpose"),
    prompt: String(step.prompt ?? ""),
    dependsOn: Array.isArray(step.dependsOn) ? step.dependsOn.map(String) : [],
    gate,
    checkpoint: step.checkpoint === true
  };
}
function topoOrder(steps) {
  const ids = new Set(steps.map((step) => step.id));
  const indegree = new Map;
  const adjacency = new Map;
  for (const step of steps) {
    indegree.set(step.id, 0);
    adjacency.set(step.id, []);
  }
  for (const step of steps) {
    for (const dep of step.dependsOn ?? []) {
      if (!ids.has(dep))
        continue;
      adjacency.get(dep)?.push(step.id);
      indegree.set(step.id, (indegree.get(step.id) ?? 0) + 1);
    }
  }
  const queue = [...steps.map((s) => s.id)].filter((id) => indegree.get(id) === 0);
  queue.sort();
  const order = [];
  while (queue.length > 0) {
    const id = queue.shift();
    order.push(id);
    const next = [];
    for (const child of adjacency.get(id) ?? []) {
      indegree.set(child, (indegree.get(child) ?? 0) - 1);
      if (indegree.get(child) === 0)
        next.push(child);
    }
    next.sort();
    queue.push(...next);
  }
  if (order.length !== steps.length) {
    const cycle = steps.map((s) => s.id).filter((id) => !order.includes(id));
    return { cycle };
  }
  return { order };
}
function validateWorkflow(spec) {
  const errors = [];
  const warnings = [];
  if (!NAME_RE.test(spec.name)) {
    warnings.push(`name "${spec.name}" will be slugified to "${slugifyWorkflowName(spec.name)}"`);
  }
  if (spec.steps.length === 0) {
    errors.push("workflow has no steps");
  }
  const seen = new Set;
  for (const step of spec.steps) {
    if (seen.has(step.id))
      errors.push(`duplicate step id "${step.id}"`);
    seen.add(step.id);
    if (!NAME_RE.test(step.id))
      errors.push(`invalid step id "${step.id}"`);
    if (!step.prompt.trim())
      warnings.push(`step "${step.id}" has an empty prompt`);
    if (!KNOWN_AGENTS.includes(step.agent)) {
      warnings.push(`step "${step.id}" uses unknown agent "${step.agent}" (custom agents are allowed)`);
    }
  }
  for (const step of spec.steps) {
    for (const dep of step.dependsOn ?? []) {
      if (!seen.has(dep)) {
        errors.push(`step "${step.id}" depends on missing step "${dep}"`);
      }
      if (dep === step.id)
        errors.push(`step "${step.id}" depends on itself`);
    }
  }
  let order = [];
  if (errors.length === 0) {
    const result = topoOrder(spec.steps);
    if ("cycle" in result) {
      errors.push(`dependency cycle among: ${result.cycle.join(", ")}`);
    } else {
      order = result.order;
    }
  }
  return { valid: errors.length === 0, errors, warnings, order };
}
function renderWorkflowMermaid(spec) {
  const lines = ["flowchart TD"];
  for (const step of spec.steps) {
    const gate = step.gate ? `\\n⛓ ${GATE_LABEL[step.gate]}` : "";
    const check = step.checkpoint ? " \uD83D\uDCBE" : "";
    lines.push(`  ${step.id}["${step.name}${check}\\n(${step.agent})${gate}"]`);
  }
  for (const step of spec.steps) {
    const deps = step.dependsOn ?? [];
    if (deps.length === 0) {
      lines.push(`  start((•)) --> ${step.id}`);
      continue;
    }
    for (const dep of deps)
      lines.push(`  ${dep} --> ${step.id}`);
  }
  return lines.join(`
`);
}
function renderWorkflowAscii(spec) {
  const validation = validateWorkflow(spec);
  if (!validation.valid) {
    return `(cannot render: ${validation.errors.join("; ")})`;
  }
  const depth = new Map;
  const byId = new Map(spec.steps.map((step) => [step.id, step]));
  for (const id of validation.order) {
    const step = byId.get(id);
    const deps = step?.dependsOn ?? [];
    const d = deps.length === 0 ? 0 : Math.max(...deps.map((x) => depth.get(x) ?? 0)) + 1;
    depth.set(id, d);
  }
  const lines = [];
  for (const id of validation.order) {
    const step = byId.get(id);
    if (!step)
      continue;
    const indent = "  ".repeat(depth.get(id) ?? 0);
    const badges = [
      step.checkpoint ? "checkpoint" : null,
      step.gate ? GATE_LABEL[step.gate] : null
    ].filter(Boolean);
    const suffix = badges.length > 0 ? `  [${badges.join(", ")}]` : "";
    lines.push(`${indent}${depth.get(id) === 0 ? "●" : "└─▶"} ${step.name} (${step.agent})${suffix}`);
  }
  return lines.join(`
`);
}
function listWorkflows(cwd) {
  const dir = workflowsDir(cwd);
  if (!existsSync(dir))
    return [];
  return readdirSync(dir).filter((file) => /\.(ya?ml|json)$/i.test(file)).map((file) => file.replace(/\.(ya?ml|json)$/i, "")).sort();
}
function loadWorkflow(cwd, name) {
  const slug = slugifyWorkflowName(name);
  for (const ext of ["yaml", "yml", "json"]) {
    const path = join(workflowsDir(cwd), `${slug}.${ext}`);
    if (existsSync(path)) {
      try {
        return parseWorkflowText(readFileSync(path, "utf-8"));
      } catch {
        return null;
      }
    }
  }
  return null;
}
function saveWorkflow(cwd, spec, options = {}) {
  const path = workflowPath(cwd, spec.name);
  mkdirSync(workflowsDir(cwd), { recursive: true });
  if (existsSync(path) && options.force !== true) {
    return { path, created: false };
  }
  writeFileSync(path, `${import_yaml.stringify(spec)}`);
  return { path, created: true };
}
function loadRunState(cwd, name) {
  const path = statePath(cwd, name);
  if (!existsSync(path))
    return null;
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  return parsed && typeof parsed === "object" ? parsed : null;
}
function markStepComplete(cwd, name, stepId) {
  const now = new Date().toISOString();
  const existing = loadRunState(cwd, name);
  const state = existing ?? {
    version: 1,
    name: slugifyWorkflowName(name),
    startedAt: now,
    updatedAt: now,
    completed: []
  };
  if (!state.completed.includes(stepId))
    state.completed.push(stepId);
  state.updatedAt = now;
  mkdirSync(stateDir(cwd), { recursive: true });
  writeFileSync(statePath(cwd, name), `${JSON.stringify(state, null, 2)}
`);
  return state;
}
function resetRunState(cwd, name) {
  const path = statePath(cwd, name);
  if (existsSync(path)) {
    writeFileSync(path, `${JSON.stringify({
      version: 1,
      name: slugifyWorkflowName(name),
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completed: []
    }, null, 2)}
`);
  }
}
function buildRunPlan(spec, state) {
  const validation = validateWorkflow(spec);
  const done = new Set(state?.completed ?? []);
  const byId = new Map(spec.steps.map((step) => [step.id, step]));
  const order = validation.valid ? validation.order : spec.steps.map((step) => step.id);
  const steps = [];
  let nextStepId = null;
  for (const id of order) {
    const step = byId.get(id);
    if (!step)
      continue;
    const deps = step.dependsOn ?? [];
    let status;
    if (done.has(id)) {
      status = "done";
    } else if (deps.every((dep) => done.has(dep))) {
      status = "ready";
      if (nextStepId === null)
        nextStepId = id;
    } else {
      status = "blocked";
    }
    steps.push({
      id,
      name: step.name,
      agent: step.agent,
      status,
      dependsOn: deps,
      gate: step.gate,
      checkpoint: step.checkpoint === true
    });
  }
  return {
    name: spec.name,
    total: steps.length,
    completed: steps.filter((step) => step.status === "done").length,
    steps,
    nextStepId
  };
}
function formatValidation(spec, validation) {
  const lines = [
    `Workflow: ${spec.name} (${spec.steps.length} steps)`,
    validation.valid ? "Valid: yes" : "Valid: no"
  ];
  if (validation.errors.length > 0) {
    lines.push("Errors:");
    for (const error of validation.errors)
      lines.push(`  - ${error}`);
  }
  if (validation.warnings.length > 0) {
    lines.push("Warnings:");
    for (const warning of validation.warnings)
      lines.push(`  - ${warning}`);
  }
  if (validation.valid) {
    lines.push(`Order: ${validation.order.join(" -> ")}`);
  }
  return lines.join(`
`);
}
function formatRunPlan(plan) {
  const marker = {
    done: "[x]",
    ready: "[ ]",
    blocked: "[·]"
  };
  const lines = [
    `Run plan: ${plan.name} (${plan.completed}/${plan.total} complete)`,
    ""
  ];
  for (const step of plan.steps) {
    const badges = [
      step.gate ? GATE_LABEL[step.gate] : null,
      step.checkpoint ? "checkpoint" : null
    ].filter(Boolean);
    const suffix = badges.length > 0 ? `  [${badges.join(", ")}]` : "";
    const deps = step.dependsOn.length > 0 ? ` ← ${step.dependsOn.join(", ")}` : "";
    lines.push(`${marker[step.status]} ${step.id}: ${step.name} (${step.agent})${deps}${suffix}`);
  }
  lines.push("");
  lines.push(plan.nextStepId ? `Next ready step: ${plan.nextStepId}` : plan.completed === plan.total ? "All steps complete." : "No ready step (blocked on gates or cycle).");
  return lines.join(`
`);
}
var import_yaml, KNOWN_AGENTS, NAME_RE, GATE_LABEL;
var init_workflows = __esm(() => {
  init_json();
  import_yaml = __toESM(require_dist(), 1);
  KNOWN_AGENTS = [
    "general-purpose",
    "worker",
    "plan",
    "explore",
    "verification",
    "statusline-setup",
    "ur-code-guide",
    "reviewer",
    "test-runner",
    "browser-debugger",
    "docs-researcher",
    "security-auditor",
    "release-notes",
    "pr-fixer",
    "memory-curator"
  ];
  NAME_RE = /^[a-z0-9][a-z0-9-_]{0,63}$/i;
  GATE_LABEL = {
    approval: "human approval",
    verification: "verification gate"
  };
});

// ../../src/services/agents/patterns.ts
import { existsSync as existsSync2, mkdirSync as mkdirSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { join as join2 } from "node:path";
function listPatterns() {
  return AGENT_PATTERNS;
}
function getPattern(id) {
  return AGENT_PATTERNS.find((pattern) => pattern.id === id.toLowerCase());
}
function substitute(template, task, prior) {
  return template.replaceAll("{{task}}", task).replaceAll("{{prior}}", prior);
}
function stageDeps(pattern, index) {
  const stage = pattern.stages[index];
  if (stage.dependsOn)
    return stage.dependsOn;
  return index === 0 ? [] : [pattern.stages[index - 1].id];
}
function buildExecutionPlan(pattern, task) {
  const cleanTask = task.trim() || "<describe the task here>";
  const roleOf = (id) => pattern.stages.find((stage) => stage.id === id)?.role ?? id;
  const steps = pattern.stages.map((stage, index) => {
    const deps = stageDeps(pattern, index);
    const priorRef = deps.length === 0 ? "" : deps.length === 1 ? `output of the "${roleOf(deps[0])}" stage` : `combined outputs of the ${deps.map((id) => `"${roleOf(id)}"`).join(", ")} stages`;
    return {
      order: index + 1,
      stageId: stage.id,
      role: stage.role,
      agent: stage.agent,
      goal: stage.goal,
      prompt: substitute(stage.prompt, cleanTask, priorRef),
      parallelizable: stage.parallelizable === true,
      gate: stage.gate
    };
  });
  return {
    patternId: pattern.id,
    patternName: pattern.name,
    task: cleanTask,
    steps,
    loop: pattern.loop
  };
}
function compilePatternToWorkflow(pattern, task = "{{task}}") {
  const steps = pattern.stages.map((stage, index) => {
    const deps = stageDeps(pattern, index);
    const priorToken = deps.length === 0 ? "" : deps.length === 1 ? `{{${deps[0]}}}` : "{{prior}}";
    return {
      id: stage.id,
      name: stage.role,
      agent: stage.agent,
      prompt: substitute(stage.prompt, task, priorToken),
      dependsOn: deps,
      gate: stage.gate,
      checkpoint: stage.checkpoint === true
    };
  });
  const loopNote = pattern.loop ? ` Loop: if ${pattern.loop.condition}, return from "${pattern.loop.from}" to "${pattern.loop.to}" (max ${pattern.loop.maxIterations} iterations).` : "";
  return {
    version: 1,
    name: pattern.id,
    description: `${pattern.summary}${loopNote}`,
    pattern: pattern.id,
    steps
  };
}
function renderPatternMermaid(pattern) {
  return renderWorkflowMermaid(compilePatternToWorkflow(pattern));
}
function scaffoldPattern(cwd, id, options = {}) {
  const pattern = getPattern(id);
  const root = join2(cwd, ".ur", "patterns");
  const result = { root, created: [], skipped: [] };
  if (!pattern)
    return result;
  const force = options.force === true;
  mkdirSync2(root, { recursive: true });
  const specPath = join2(root, `${pattern.id}.json`);
  if (!force && existsSync2(specPath)) {
    result.skipped.push(`patterns/${pattern.id}.json`);
  } else {
    writeFileSync2(specPath, `${JSON.stringify(pattern, null, 2)}
`);
    result.created.push(`patterns/${pattern.id}.json`);
  }
  const workflow = compilePatternToWorkflow(pattern);
  const saved = saveWorkflow(cwd, workflow, { force });
  if (saved.created)
    result.created.push(`workflows/${pattern.id}.yaml`);
  else
    result.skipped.push(`workflows/${pattern.id}.yaml`);
  return result;
}
function formatPatternList(json) {
  if (json) {
    return JSON.stringify({ patterns: AGENT_PATTERNS }, null, 2);
  }
  const lines = ["Multi-agent collaboration patterns", ""];
  for (const pattern of AGENT_PATTERNS) {
    lines.push(`${pattern.acronym} — ${pattern.name}`);
    lines.push(`  ${pattern.summary}`);
    lines.push(`  Stages: ${pattern.stages.map((stage) => `${stage.role} (${stage.agent})`).join(" -> ")}`);
    if (pattern.loop) {
      lines.push(`  Loop: ${pattern.loop.from} -> ${pattern.loop.to} while ${pattern.loop.condition} (max ${pattern.loop.maxIterations})`);
    }
    lines.push("");
  }
  lines.push('Run: ur pattern run peer "your task"');
  lines.push("Install role agents + workflow: ur pattern install peer");
  return lines.join(`
`);
}
function formatPatternDetail(pattern, json) {
  if (json)
    return JSON.stringify(pattern, null, 2);
  const lines = [
    `${pattern.acronym} — ${pattern.name}`,
    "",
    pattern.summary,
    "",
    "Best for:",
    ...pattern.bestFor.map((item) => `  - ${item}`),
    "",
    "Stages:"
  ];
  for (const stage of pattern.stages) {
    const badges = [
      stage.parallelizable ? "parallelizable" : null,
      stage.gate ? `${stage.gate} gate` : null,
      stage.checkpoint ? "checkpoint" : null
    ].filter(Boolean);
    lines.push(`  ${stage.role} → ${stage.agent}${badges.length ? `  [${badges.join(", ")}]` : ""}`);
    lines.push(`    ${stage.goal}`);
  }
  if (pattern.loop) {
    lines.push("");
    lines.push(`Loop: when ${pattern.loop.condition}, return from "${pattern.loop.from}" to "${pattern.loop.to}" (max ${pattern.loop.maxIterations} iterations).`);
  }
  lines.push("");
  lines.push("Mermaid:");
  lines.push(renderPatternMermaid(pattern));
  return lines.join(`
`);
}
function formatExecutionPlan(plan, json) {
  if (json)
    return JSON.stringify(plan, null, 2);
  const lines = [
    `${plan.patternName}`,
    `Task: ${plan.task}`,
    "",
    "Orchestration plan (run each stage as a subagent; feed each result into the next):",
    ""
  ];
  for (const step of plan.steps) {
    const tags = [
      step.parallelizable ? "parallelizable" : null,
      step.gate ? `${step.gate} gate` : null
    ].filter(Boolean);
    lines.push(`${step.order}. ${step.role} → subagent_type: ${step.agent}${tags.length ? `  [${tags.join(", ")}]` : ""}`);
    lines.push(`   Goal: ${step.goal}`);
    lines.push(`   Agent({ subagent_type: "${step.agent}", description: "${step.role}: ${truncate(plan.task, 40)}", prompt: ${JSON.stringify(step.prompt)} })`);
    lines.push("");
  }
  if (plan.loop) {
    lines.push(`Review loop: if the Reviewer does not return VERDICT: PASS, return to "${plan.loop.to}" with the feedback and repeat (max ${plan.loop.maxIterations} iterations).`);
  }
  lines.push("");
  lines.push("Saved as a runnable workflow: ur workflow show " + plan.patternId);
  return lines.join(`
`);
}
function truncate(value, max) {
  return value.length <= max ? value : `${value.slice(0, max)}…`;
}
var AGENT_PATTERNS;
var init_patterns = __esm(() => {
  init_workflows();
  AGENT_PATTERNS = [
    {
      id: "peer",
      name: "PEER (Plan, Execute, Express, Review)",
      acronym: "PEER",
      summary: "Decompose a complex task, execute it step by step, synthesize the result, then critically review and iterate until it passes. Best for reasoning-heavy or multi-step work.",
      bestFor: [
        "multi-step features and refactors",
        "reasoning-intensive analysis",
        "work that benefits from an explicit critique loop"
      ],
      reference: "https://github.com/agentuniverse-ai/agentUniverse",
      loop: {
        from: "review",
        to: "plan",
        condition: "review verdict is not PASS",
        maxIterations: 3
      },
      stages: [
        {
          id: "plan",
          role: "Planner",
          agent: "plan",
          goal: "Break the task into an ordered, minimal set of concrete steps.",
          prompt: `Decompose this task into an ordered, minimal set of concrete steps. For each step give the goal and a crisp acceptance check. Surface unknowns and risks up front.

Task: {{task}}`,
          checkpoint: true
        },
        {
          id: "execute",
          role: "Executor",
          agent: "worker",
          goal: "Carry out the plan, verifying each step as you go.",
          prompt: `Execute the plan for the task below. Implement each step and run the smallest useful verification (tests, typecheck, lint, build) after each. Report exactly what you changed and the command results.

Task: {{task}}

Plan from the Planner:
{{prior}}`,
          parallelizable: true,
          checkpoint: true
        },
        {
          id: "express",
          role: "Expressor",
          agent: "general-purpose",
          goal: "Synthesize execution results into one coherent deliverable.",
          prompt: `Synthesize the execution results into a single coherent answer/deliverable for the task. Resolve contradictions, state assumptions, and present the final artifact clearly.

Task: {{task}}

Execution results:
{{prior}}`
        },
        {
          id: "review",
          role: "Reviewer",
          agent: "verification",
          goal: "Critique the result and decide whether to iterate.",
          prompt: `Critically review the result against the task. Check correctness, completeness, regressions, and missing verification. End with exactly one line "VERDICT: PASS" or "VERDICT: FAIL" followed by specific, actionable feedback.

Task: {{task}}

Result to review:
{{prior}}`,
          gate: "verification"
        }
      ]
    },
    {
      id: "doe",
      name: "DOE (Data-finding, Opinion-inject, Express)",
      acronym: "DOE",
      summary: "Gather grounded data, inject expert judgment, then express a precise result. Best for data-intensive, source-grounded, or domain-expertise tasks.",
      bestFor: [
        "research and source-grounded reports",
        "data-intensive analysis requiring precision",
        "tasks where domain/expert opinion shapes the answer"
      ],
      reference: "https://github.com/agentuniverse-ai/agentUniverse",
      loop: null,
      stages: [
        {
          id: "data",
          role: "Data finder",
          agent: "docs-researcher",
          goal: "Gather the data and primary sources the task needs.",
          prompt: `Gather the data and primary sources needed for this task. Prefer official/primary sources, keep each link with the fact it supports, and flag version/date sensitivity. Separate direct source facts from inference.

Task: {{task}}`,
          checkpoint: true
        },
        {
          id: "opinion",
          role: "Domain expert",
          agent: "general-purpose",
          goal: "Apply expert judgment and constraints to the gathered data.",
          prompt: `Apply domain-expert judgment to the gathered data: weigh trade-offs, apply constraints, and inject the expertise needed to turn data into a defensible recommendation. Call out where evidence is thin.

Task: {{task}}

Gathered data:
{{prior}}`
        },
        {
          id: "express",
          role: "Expressor",
          agent: "general-purpose",
          goal: "Express the final, precise result with sources attached.",
          prompt: `Express the final result precisely. Attach sources to each material claim, state confidence, and keep the output scoped to what the task asked for.

Task: {{task}}

Expert analysis:
{{prior}}`,
          gate: "verification"
        }
      ]
    },
    {
      id: "concurrent",
      name: "Concurrent (parallel analyses, then synthesize)",
      acronym: "CONC",
      summary: "Run several independent analyses in parallel from different expert angles, then merge them into one synthesized result. Best when the sub-analyses do not depend on each other and breadth matters.",
      bestFor: [
        "breadth-first investigation of an unfamiliar area",
        "gathering multiple independent expert perspectives at once",
        "work whose sub-analyses are independent and can run concurrently"
      ],
      reference: "https://openai.github.io/openai-agents-python/",
      loop: null,
      stages: [
        {
          id: "survey",
          role: "Code surveyor",
          agent: "explore",
          goal: "Map the parts of the codebase the task touches.",
          prompt: `Survey the codebase for everything relevant to this task: where the behavior lives, the key files, and how they connect. Report locations and structure, not opinions.

Task: {{task}}`,
          dependsOn: [],
          parallelizable: true
        },
        {
          id: "research",
          role: "External researcher",
          agent: "docs-researcher",
          goal: "Gather external/primary-source context the task needs.",
          prompt: `Gather external context for this task from primary/official sources: relevant docs, APIs, specs, or prior art. Keep each link with the fact it supports and flag version/date sensitivity.

Task: {{task}}`,
          dependsOn: [],
          parallelizable: true
        },
        {
          id: "risks",
          role: "Risk analyst",
          agent: "security-auditor",
          goal: "Identify risks, edge cases, and failure modes.",
          prompt: `Identify the risks, edge cases, security concerns, and failure modes relevant to this task. For each, note the realistic impact and what would have to be true for it to bite.

Task: {{task}}`,
          dependsOn: [],
          parallelizable: true
        },
        {
          id: "synthesize",
          role: "Synthesizer",
          agent: "general-purpose",
          goal: "Merge the parallel findings into one coherent answer.",
          prompt: `Merge the parallel findings below into a single coherent answer for the task. Resolve conflicts between sources, state assumptions, and call out remaining gaps explicitly.

Task: {{task}}

Parallel findings:
{{prior}}`,
          dependsOn: ["survey", "research", "risks"],
          gate: "verification",
          checkpoint: true
        }
      ]
    },
    {
      id: "handoff",
      name: "Handoff (triage, then delegate to a specialist)",
      acronym: "HND",
      summary: "A triage agent classifies the request, selects the right specialist, and writes a focused brief; the specialist executes it; a verifier confirms the original request was met. Best for routing mixed incoming work.",
      bestFor: [
        "routing mixed or ambiguous requests to the right specialist",
        "triage-then-execute support workflows",
        "tasks where choosing the right approach is half the work"
      ],
      reference: "https://openai.github.io/openai-agents-python/",
      loop: null,
      stages: [
        {
          id: "triage",
          role: "Triage",
          agent: "general-purpose",
          goal: "Classify the request and select the specialist to own it.",
          prompt: `Classify this request, decide which kind of specialist should own it (e.g. coding, testing, security, docs, browser), and write a focused brief for that specialist: the goal, the constraints, and the acceptance check.

Task: {{task}}`,
          dependsOn: [],
          checkpoint: true
        },
        {
          id: "handle",
          role: "Specialist",
          agent: "worker",
          goal: "Execute the task per the triage brief, verifying as you go.",
          prompt: `You are the specialist selected by triage. Execute the task according to the brief below, running the smallest useful verification after each meaningful change. Report exactly what you did and the results.

Task: {{task}}

Triage brief:
{{prior}}`,
          dependsOn: ["triage"]
        },
        {
          id: "verify",
          role: "Verifier",
          agent: "verification",
          goal: "Confirm the specialist satisfied the original request.",
          prompt: `Confirm the specialist work below satisfies the original request. Check correctness, completeness, and missing verification. End with exactly one line "VERDICT: PASS" or "VERDICT: FAIL" followed by specific feedback.

Task: {{task}}

Specialist result:
{{prior}}`,
          dependsOn: ["handle"],
          gate: "verification"
        }
      ]
    },
    {
      id: "parallel",
      name: "Parallel specialized subagents",
      acronym: "PAR",
      summary: "Run multiple specialist agents in parallel — bug finder, patch writer, test writer, security auditor, style reviewer — then synthesize their outputs into one coherent plan. Best for complex code changes that need independent expert scrutiny before integration.",
      bestFor: [
        "complex code changes needing independent expert review",
        "tasks where bug-finding, patching, testing, security, and style can be separated",
        "high-confidence patches that must survive multiple adversarial checks"
      ],
      reference: "https://openai.github.io/openai-agents-python/",
      loop: null,
      stages: [
        {
          id: "find-bugs",
          role: "Bug finder",
          agent: "reviewer",
          goal: "Find concrete bugs in the code relevant to the task.",
          prompt: "Find bugs in the code related to: {{task}}. List concrete issues with file paths and line numbers. Do not write fixes; only identify problems. End with VERDICT: PASS if no serious bugs were found, or VERDICT: FAIL with the bug list.",
          dependsOn: [],
          parallelizable: true
        },
        {
          id: "write-patch",
          role: "Patch writer",
          agent: "worker",
          goal: "Write the minimal correct patch for the task.",
          prompt: "Write the minimal patch for: {{task}}. Return only the code changes and a VERDICT line. Do not write tests or prose; focus on the implementation.",
          dependsOn: [],
          parallelizable: true
        },
        {
          id: "write-tests",
          role: "Test writer",
          agent: "test-runner",
          goal: "Write tests that exercise the expected behavior.",
          prompt: "Write tests for: {{task}}. Run them and report results. End with VERDICT: PASS if tests pass, or VERDICT: FAIL with failure output.",
          dependsOn: [],
          parallelizable: true
        },
        {
          id: "security-review",
          role: "Security auditor",
          agent: "security-auditor",
          goal: "Review the task for security vulnerabilities and unsafe patterns.",
          prompt: "Security review for: {{task}}. Report any vulnerabilities, unsafe patterns, or trust-boundary issues. End with VERDICT: PASS if no serious issues, or VERDICT: FAIL with specifics.",
          dependsOn: [],
          parallelizable: true
        },
        {
          id: "style-review",
          role: "Style reviewer",
          agent: "reviewer",
          goal: "Review maintainability, style, and clarity.",
          prompt: "Style/review for: {{task}}. Report maintainability, clarity, naming, and consistency issues. End with VERDICT: PASS if acceptable, or VERDICT: FAIL with a concise punch list.",
          dependsOn: [],
          parallelizable: true
        },
        {
          id: "synthesize",
          role: "Synthesizer",
          agent: "general-purpose",
          goal: "Merge parallel findings into one coherent, actionable plan.",
          prompt: "Synthesize the parallel reviews and patch above into a single coherent plan for: {{task}}. Resolve conflicts between findings. Produce a unified patch/test/security/style recommendation. End with VERDICT: PASS if ready to apply, or VERDICT: FAIL if more work is needed.",
          dependsOn: ["find-bugs", "write-patch", "write-tests", "security-review", "style-review"],
          gate: "verification",
          checkpoint: true
        }
      ]
    },
    {
      id: "debate",
      name: "Debate (propose, critique, moderate)",
      acronym: "DEB",
      summary: "One agent proposes a solution, an adversarial agent critiques it, and a moderator synthesizes the best answer — iterating until the moderator is satisfied. Best for high-stakes decisions that benefit from an explicit adversarial check.",
      bestFor: [
        "high-stakes decisions needing an adversarial check",
        "choosing between competing approaches or designs",
        "reducing single-agent blind spots on contested problems"
      ],
      reference: "https://github.com/agentuniverse-ai/agentUniverse",
      loop: {
        from: "moderate",
        to: "propose",
        condition: "moderator verdict is not PASS",
        maxIterations: 2
      },
      stages: [
        {
          id: "propose",
          role: "Proposer",
          agent: "general-purpose",
          goal: "Propose a concrete solution and argue why it is correct.",
          prompt: `Propose a concrete solution/answer to the task and argue why it is correct. Be specific and committal — state the approach, the key decisions, and the expected outcome.

Task: {{task}}`,
          dependsOn: [],
          checkpoint: true
        },
        {
          id: "critique",
          role: "Critic",
          agent: "reviewer",
          goal: "Adversarially challenge the proposal.",
          prompt: `Adversarially challenge the proposal below: find flaws, missing cases, hidden assumptions, and risks. Be specific and concrete; do not soften. Where you would do it differently, say exactly how.

Task: {{task}}

Proposal:
{{prior}}`,
          dependsOn: ["propose"]
        },
        {
          id: "moderate",
          role: "Moderator",
          agent: "verification",
          goal: "Synthesize the best answer and decide whether to iterate.",
          prompt: `Weigh the proposal and the critique and produce the best synthesized answer to the task. End with exactly one line "VERDICT: PASS" if the answer is sound and complete, otherwise "VERDICT: FAIL" followed by precisely what must change.

Task: {{task}}

Proposal and critique:
{{prior}}`,
          dependsOn: ["critique"],
          gate: "verification"
        }
      ]
    }
  ];
});

// ../../src/services/agents/executor.ts
async function executeWorkflow(spec, options) {
  const validation = validateWorkflow(spec);
  const emit = (event) => options.onEvent?.(event);
  if (!validation.valid) {
    emit({ kind: "finish", status: "cyclic" });
    return { name: spec.name, status: "cyclic", iterations: 0, steps: [] };
  }
  const order = validation.order;
  const byId = new Map(spec.steps.map((step) => [step.id, step]));
  const done = new Set(options.resumeCompleted ?? []);
  const outputs = {};
  const results = new Map;
  const loop = options.loop ?? null;
  let cycle = 1;
  let pendingFeedback;
  let pendingFeedbackFor;
  const recordResult = (step, patch) => {
    const prior = results.get(step.id);
    const next = {
      id: step.id,
      agent: step.agent,
      status: patch.status ?? prior?.status ?? "skipped",
      verdict: patch.verdict ?? prior?.verdict ?? null,
      iterations: (prior?.iterations ?? 0) + (patch.iterations ?? 0),
      output: patch.output ?? prior?.output ?? "",
      error: patch.error ?? prior?.error
    };
    results.set(step.id, next);
    return next;
  };
  const finish = (status) => {
    emit({ kind: "finish", status });
    const steps = order.map((id) => results.get(id) ?? {
      id,
      agent: byId.get(id)?.agent ?? "general-purpose",
      status: "skipped",
      verdict: null,
      iterations: 0,
      output: ""
    });
    return { name: spec.name, status, iterations: cycle, steps };
  };
  const hardCap = (loop?.maxIterations ?? 1) * order.length + order.length + 8;
  const maxConcurrency = Math.max(1, Math.floor(options.maxConcurrency ?? DEFAULT_MAX_CONCURRENCY));
  let safety = 0;
  const readyNow = () => order.filter((id) => !done.has(id) && (byId.get(id)?.dependsOn ?? []).every((dep) => done.has(dep)));
  const needsSequential = (id) => {
    const s = byId.get(id);
    if (!s)
      return true;
    if (s.gate === "approval")
      return true;
    if (loop != null && loop.from === id && s.gate === "verification")
      return true;
    return false;
  };
  const priorOutputsFor = (step) => {
    const collected = {};
    for (const dep of step.dependsOn ?? []) {
      if (outputs[dep] !== undefined)
        collected[dep] = outputs[dep];
    }
    return collected;
  };
  const runBatch = async (ids) => {
    emit({ kind: "wave", ids: [...ids], iteration: cycle });
    const launched = ids.map((id) => {
      const batchStep = byId.get(id);
      const stepFeedback = pendingFeedbackFor === id ? pendingFeedback : undefined;
      emit({
        kind: "step-start",
        id: batchStep.id,
        agent: batchStep.agent,
        iteration: cycle
      });
      return { step: batchStep, feedback: stepFeedback };
    });
    if (pendingFeedbackFor != null && ids.includes(pendingFeedbackFor)) {
      pendingFeedback = undefined;
      pendingFeedbackFor = undefined;
    }
    const settled = await Promise.allSettled(launched.map(({ step: batchStep, feedback: stepFeedback }) => options.runStep({
      step: batchStep,
      iteration: cycle,
      priorOutputs: priorOutputsFor(batchStep),
      feedback: stepFeedback
    })));
    for (let i = 0;i < ids.length; i++) {
      const batchStep = byId.get(ids[i]);
      const outcome = settled[i];
      if (outcome.status === "rejected") {
        const { reason } = outcome;
        recordResult(batchStep, {
          status: "failed",
          iterations: 1,
          error: reason instanceof Error ? reason.message : String(reason)
        });
        emit({ kind: "step-done", id: batchStep.id, isError: true });
        return finish("failed");
      }
      const run = outcome.value;
      outputs[batchStep.id] = run.output;
      recordResult(batchStep, {
        iterations: 1,
        output: run.output,
        verdict: run.verdict ?? null,
        error: run.isError ? run.output : undefined
      });
      emit({
        kind: "step-done",
        id: batchStep.id,
        verdict: run.verdict ?? null,
        isError: run.isError
      });
      if (run.isError && options.stopOnError) {
        recordResult(batchStep, { status: "failed" });
        return finish("failed");
      }
      if (batchStep.gate === "verification") {
        emit({
          kind: "gate",
          id: batchStep.id,
          gate: "verification",
          result: "advisory"
        });
      }
      recordResult(batchStep, { status: "done" });
      done.add(batchStep.id);
      options.onCheckpoint?.(batchStep.id, [...done]);
    }
    return null;
  };
  while (safety++ < hardCap) {
    const ready = readyNow();
    if (ready.length === 0)
      break;
    const batch = [];
    if (maxConcurrency > 1) {
      for (const id of ready) {
        if (needsSequential(id))
          break;
        batch.push(id);
        if (batch.length >= maxConcurrency)
          break;
      }
    }
    if (batch.length >= 2) {
      const stop = await runBatch(batch);
      if (stop)
        return stop;
      continue;
    }
    const nextId = ready[0];
    const step = byId.get(nextId);
    if (!step)
      break;
    emit({ kind: "step-start", id: step.id, agent: step.agent, iteration: cycle });
    const feedback = pendingFeedbackFor === step.id ? pendingFeedback : undefined;
    if (feedback !== undefined) {
      pendingFeedback = undefined;
      pendingFeedbackFor = undefined;
    }
    const priorOutputs = {};
    for (const dep of step.dependsOn ?? []) {
      if (outputs[dep] !== undefined)
        priorOutputs[dep] = outputs[dep];
    }
    let run;
    try {
      run = await options.runStep({
        step,
        iteration: cycle,
        priorOutputs,
        feedback
      });
    } catch (error) {
      recordResult(step, {
        status: "failed",
        iterations: 1,
        error: error instanceof Error ? error.message : String(error)
      });
      emit({ kind: "step-done", id: step.id, isError: true });
      return finish("failed");
    }
    outputs[step.id] = run.output;
    recordResult(step, {
      iterations: 1,
      output: run.output,
      verdict: run.verdict ?? null,
      error: run.isError ? run.output : undefined
    });
    emit({
      kind: "step-done",
      id: step.id,
      verdict: run.verdict ?? null,
      isError: run.isError
    });
    if (run.isError && options.stopOnError) {
      recordResult(step, { status: "failed" });
      return finish("failed");
    }
    if (step.gate === "approval") {
      const approved = options.approve ? await options.approve(step) : false;
      emit({
        kind: "gate",
        id: step.id,
        gate: "approval",
        result: approved ? "pass" : "hold"
      });
      if (!approved) {
        recordResult(step, { status: "held" });
        return finish("held");
      }
    }
    if (step.gate === "verification") {
      const enforcing = loop != null && loop.from === step.id;
      if (enforcing) {
        if (run.verdict === "PASS") {
          emit({ kind: "gate", id: step.id, gate: "verification", result: "pass" });
        } else {
          emit({ kind: "gate", id: step.id, gate: "verification", result: "fail" });
          if (cycle < loop.maxIterations) {
            const start = order.indexOf(loop.to);
            const end = order.indexOf(loop.from);
            for (const id of order.slice(start, end + 1))
              done.delete(id);
            pendingFeedback = run.output;
            pendingFeedbackFor = loop.to;
            cycle++;
            emit({
              kind: "loop",
              from: loop.from,
              to: loop.to,
              iteration: cycle
            });
            continue;
          }
          recordResult(step, { status: "failed" });
          return finish("max-iterations");
        }
      } else {
        emit({ kind: "gate", id: step.id, gate: "verification", result: "advisory" });
      }
    }
    recordResult(step, { status: "done" });
    done.add(step.id);
    options.onCheckpoint?.(step.id, [...done]);
  }
  return finish(done.size === order.length ? "completed" : "failed");
}
function formatExecResult(result) {
  const mark = {
    done: "✓",
    failed: "✗",
    held: "⏸",
    skipped: "·"
  };
  const lines = [
    `Execution: ${result.name}`,
    `Status: ${result.status}   Cycles: ${result.iterations}`,
    ""
  ];
  for (const step of result.steps) {
    const verdict = step.verdict ? `  VERDICT: ${step.verdict}` : "";
    const iters = step.iterations > 1 ? `  (${step.iterations} runs)` : "";
    lines.push(`${mark[step.status]} ${step.id} (${step.agent})${verdict}${iters}`);
    if (step.error)
      lines.push(`    error: ${step.error}`);
    else if (step.output)
      lines.push(`    ${preview(step.output)}`);
  }
  return lines.join(`
`);
}
function preview(text, max = 200) {
  const value = text.replace(/\s+/g, " ").trim();
  return value.length <= max ? value : `${value.slice(0, max)}…`;
}
var DEFAULT_MAX_CONCURRENCY = 4;
var init_executor = __esm(() => {
  init_workflows();
});

// ../../src/services/agents/runWorkflow.ts
function deriveLoop(spec) {
  if (!spec.pattern)
    return null;
  const pattern = getPattern(spec.pattern);
  if (!pattern?.loop)
    return null;
  return {
    from: pattern.loop.from,
    to: pattern.loop.to,
    maxIterations: pattern.loop.maxIterations
  };
}
async function runWorkflowSpec(spec, options) {
  const stateName = options.stateName ?? spec.name;
  const loop = options.loop ?? deriveLoop(spec);
  const runId = getSessionId();
  initializeResearchTrace(options.cwd, runId, {
    kind: "workflow",
    status: "planned",
    workflow: spec.name,
    pattern: spec.pattern,
    steps: spec.steps.map((step) => ({
      id: step.id,
      agent: step.agent,
      dependsOn: step.dependsOn ?? [],
      gate: step.gate
    })),
    loop
  });
  let resumeCompleted = [];
  if (options.resume) {
    resumeCompleted = loadRunState(options.cwd, stateName)?.completed ?? [];
  } else {
    resetRunState(options.cwd, stateName);
  }
  const runStep = options.dryRun ? makeDryRunner() : makeCliStepRunner({
    cwd: options.cwd,
    maxTurns: options.maxTurns,
    skipPermissions: options.skipPermissions
  });
  const result = await executeWorkflow(spec, {
    runStep,
    loop,
    resumeCompleted,
    maxConcurrency: options.maxConcurrency,
    onEvent: (event) => {
      options.onEvent?.(event);
      appendRunAction(options.cwd, runId, {
        kind: `workflow-${event.kind}`,
        title: event.kind,
        status: event.kind === "finish" ? event.status === "completed" ? "passed" : "failed" : "running",
        reason: "execute declarative UR workflow",
        nextAction: event.kind === "finish" ? "write workflow report" : "continue workflow execution",
        data: event
      });
    },
    onCheckpoint: (stepId) => {
      markStepComplete(options.cwd, stateName, stepId);
    }
  });
  writeRunReport(options.cwd, runId, formatWorkflowTraceReport(result));
  return result;
}
function formatWorkflowTraceReport(result) {
  return [
    `# Workflow ${result.name}`,
    "",
    `Status: ${result.status}`,
    `Iterations: ${result.iterations}`,
    "",
    "## Steps",
    ...result.steps.map((step) => [
      `- ${step.id} [${step.status}] agent=${step.agent}`,
      step.verdict ? `  verdict: ${step.verdict}` : null,
      step.error ? `  error: ${step.error}` : null
    ].filter(Boolean).join(`
`))
  ].join(`
`);
}
async function saveAndRunWorkflow(spec, options) {
  saveWorkflow(options.cwd, spec, { force: true });
  return runWorkflowSpec(spec, options);
}
var init_runWorkflow = __esm(() => {
  init_cliStepRunner();
  init_executor();
  init_patterns();
  init_workflows();
  init_state();
  init_runArtifacts();
});

export { validateWorkflow, renderWorkflowMermaid, renderWorkflowAscii, listWorkflows, loadWorkflow, saveWorkflow, loadRunState, markStepComplete, resetRunState, buildRunPlan, formatValidation, formatRunPlan, init_workflows, listPatterns, getPattern, buildExecutionPlan, compilePatternToWorkflow, scaffoldPattern, formatPatternList, formatPatternDetail, formatExecutionPlan, init_patterns, formatExecResult, init_executor, runWorkflowSpec, saveAndRunWorkflow, init_runWorkflow };
