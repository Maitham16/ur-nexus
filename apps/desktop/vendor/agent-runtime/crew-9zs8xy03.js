import {
  addCrewTask,
  createCrew,
  decomposeGoal,
  deleteCrew,
  formatCrew,
  formatCrewList,
  formatRunCrewResult,
  init_crew,
  listCrews,
  loadCrew,
  reopenClaimed,
  runCrew
} from "./index-jsv0rfb7.js";
import {
  defaultHeadlessRunner,
  init_headlessAgent
} from "./index-c6n1hema.js";
import"./index-rad7f2cp.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
import {
  init_json,
  safeParseJSON
} from "./index-s5dp14ed.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-0r3wd4mq.js";
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

// src/services/agents/decomposer.ts
function riskLevelFromKeywords(goal, files = []) {
  const text = `${goal} ${files.join(" ")}`.toLowerCase();
  if (HIGH_RISK_KEYWORDS.test(text))
    return "high";
  if (MEDIUM_RISK_KEYWORDS.test(text))
    return "medium";
  if (LOW_RISK_KEYWORDS.test(text))
    return "low";
  return "medium";
}
async function currentRollbackPoint(cwd) {
  const result = await execFileNoThrowWithCwd("git", ["rev-parse", "HEAD"], { cwd, preserveOutputOnError: true });
  if (result.code === 0 && result.stdout.trim())
    return result.stdout.trim();
  return "untracked";
}
function deterministicDecomposition(goal, rollbackPoint) {
  const items = decomposeGoal(goal);
  return items.map((item, index) => ({
    id: `t${index + 1}`,
    goal: item,
    filesTouched: [],
    risk: riskLevelFromKeywords(item),
    testsRequired: inferTests(item),
    rollbackPoint
  }));
}
function inferTests(goal) {
  const lower = goal.toLowerCase();
  const tests = [];
  if (/\b(test|spec|assert|coverage)\b/i.test(lower))
    tests.push("unit test");
  if (/\b(integration|e2e|end-to-end|api)\b/i.test(lower))
    tests.push("integration test");
  if (/\b(build|compile|typecheck|tsc)\b/i.test(lower))
    tests.push("compile/typecheck");
  if (/\b(lint|format|style)\b/i.test(lower))
    tests.push("lint");
  if (tests.length === 0)
    tests.push("existing test suite");
  return tests;
}
function decomposePrompt(goal) {
  return [
    "Decompose the following engineering goal into atomic subtasks.",
    "Return a JSON object with exactly this shape (no markdown, no commentary):",
    "",
    "{",
    '  "tasks": [',
    "    {",
    '      "id": "t1",',
    '      "goal": "concise subtask goal",',
    '      "filesTouched": ["src/example.ts"],',
    '      "risk": "low|medium|high",',
    '      "testsRequired": ["unit test"],',
    '      "rollbackPoint": "HEAD"',
    "    }",
    "  ]",
    "}",
    "",
    "Guidelines:",
    "- Each subtask should be small enough to implement and verify independently.",
    '- "filesTouched" should list the files likely to change.',
    '- "risk" should be high for auth/security/concurrency/destructive changes, medium for refactor/API changes, low for docs/style.',
    '- "testsRequired" should list the test categories that must pass.',
    '- "rollbackPoint" should be "HEAD".',
    "",
    "Goal:",
    goal
  ].join(`
`);
}
async function decomposeTask(goal, options) {
  const rollbackPoint = await currentRollbackPoint(options.cwd);
  if (options.dryRun) {
    return deterministicDecomposition(goal, rollbackPoint);
  }
  const runner = options.runner ?? defaultHeadlessRunner();
  const out = await runner({
    cwd: options.cwd,
    prompt: decomposePrompt(goal),
    maxTurns: 10
  });
  const parsed = safeParseJSON(out.output, false);
  if (parsed && typeof parsed === "object" && Array.isArray(parsed.tasks)) {
    const tasks = parsed.tasks;
    return tasks.map((t) => ({
      ...t,
      rollbackPoint: t.rollbackPoint ?? rollbackPoint,
      filesTouched: Array.isArray(t.filesTouched) ? t.filesTouched : [],
      testsRequired: Array.isArray(t.testsRequired) ? t.testsRequired : inferTests(t.goal),
      risk: ["low", "medium", "high"].includes(t.risk) ? t.risk : riskLevelFromKeywords(t.goal, t.filesTouched)
    }));
  }
  return deterministicDecomposition(goal, rollbackPoint);
}
function formatDecomposition(result, json) {
  if (json)
    return JSON.stringify(result, null, 2);
  const lines = [
    `Decomposition: ${result.goal}`,
    `Rollback point: ${result.rollbackPoint}`,
    `Generated: ${result.generatedAt}`,
    ""
  ];
  for (const task of result.tasks) {
    lines.push(`- ${task.id} [${task.risk.toUpperCase()}] ${task.goal}`);
    if (task.filesTouched.length)
      lines.push(`  files: ${task.filesTouched.join(", ")}`);
    if (task.testsRequired.length)
      lines.push(`  tests: ${task.testsRequired.join(", ")}`);
    lines.push(`  rollback: ${task.rollbackPoint}`);
    lines.push("");
  }
  return lines.join(`
`);
}
var HIGH_RISK_KEYWORDS, MEDIUM_RISK_KEYWORDS, LOW_RISK_KEYWORDS;
var init_decomposer = __esm(() => {
  init_execFileNoThrow();
  init_json();
  init_headlessAgent();
  init_crew();
  HIGH_RISK_KEYWORDS = /\b(auth|authoriz|credential|secret|token|password|encrypt|hash|ssl|tls|sandbox|shell|bash|rm\b|drop|delete|migrate|security|vulnerab|exploit|injection|race|deadlock|concurren|distributed)\b/i;
  MEDIUM_RISK_KEYWORDS = /\b(refactor|rename|move|restructure|extract|interface|api|contract|dependency|config|schema)\b/i;
  LOW_RISK_KEYWORDS = /\b(comment|doc|readme|changelog|typo|format|style|lint|naming|whitespace)\b/i;
});

// src/commands/crew/crew.ts
function option(tokens, name) {
  const index = tokens.indexOf(name);
  if (index === -1)
    return;
  return tokens[index + 1];
}
function positionals(tokens) {
  const withValue = new Set(["--goal", "--task", "--lead", "--workers", "--max-turns"]);
  const values = [];
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (withValue.has(token)) {
      i++;
      continue;
    }
    if (token.startsWith("--"))
      continue;
    values.push(token);
  }
  return values;
}
function usage() {
  return [
    "Usage:",
    "  ur crew list [--json]",
    '  ur crew create <name> --goal "..." [--lead <agent>] [--decompose] [--json]',
    '  ur crew plan <name> --goal "..." [--decompose] [--json]',
    "  ur crew show <name> [--json]",
    '  ur crew add <name> --task "another subtask"',
    "  ur crew run <name> [--workers N] [--worktrees] [--dry-run] [--resume] [--decompose] [--max-turns N] [--skip-permissions] [--json]",
    "  ur crew reset <name>",
    "  ur crew delete <name>",
    "",
    "A lead decomposes the goal into a shared task board; workers claim and run",
    "open tasks as headless `ur -p` subagents (optionally each in a git worktree)."
  ].join(`
`);
}
var call = async (args) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const positional = positionals(tokens);
  const action = positional[0] ?? "list";
  const name = positional[1];
  if (action === "list") {
    return { type: "text", value: formatCrewList(listCrews(cwd), json) };
  }
  if (action === "create") {
    const goal = option(tokens, "--goal");
    if (!name || !goal)
      return { type: "text", value: usage() };
    const decompose = tokens.includes("--decompose");
    const decomposed = decompose ? await decomposeTask(goal, { cwd, dryRun: tokens.includes("--dry-run") }) : undefined;
    const spec = createCrew(cwd, name, goal, { lead: option(tokens, "--lead"), decomposed });
    return {
      type: "text",
      value: json ? formatCrew(spec, true) : `Created crew ${spec.name} with ${spec.tasks.length} task(s).

${formatCrew(spec, false)}`
    };
  }
  if (action === "plan") {
    const goal = option(tokens, "--goal");
    if (!goal)
      return { type: "text", value: usage() };
    const tasks = await decomposeTask(goal, { cwd, dryRun: tokens.includes("--dry-run") });
    const result = {
      goal,
      tasks,
      rollbackPoint: tasks[0]?.rollbackPoint ?? "HEAD",
      generatedAt: new Date().toISOString()
    };
    return { type: "text", value: formatDecomposition(result, json) };
  }
  if (!name)
    return { type: "text", value: usage() };
  if (action === "show") {
    const spec = loadCrew(cwd, name);
    if (!spec)
      return { type: "text", value: `Crew not found: ${name}` };
    return { type: "text", value: formatCrew(spec, json) };
  }
  if (action === "add") {
    const task = option(tokens, "--task");
    if (!task)
      return { type: "text", value: 'Provide --task "subtask instruction".' };
    const spec = addCrewTask(cwd, name, task);
    if (!spec)
      return { type: "text", value: `Crew not found: ${name}` };
    return { type: "text", value: json ? formatCrew(spec, true) : `Added a task to ${spec.name} (now ${spec.tasks.length}).` };
  }
  if (action === "reset") {
    const spec = reopenClaimed(cwd, name);
    if (!spec)
      return { type: "text", value: `Crew not found: ${name}` };
    return { type: "text", value: json ? formatCrew(spec, true) : `Reopened in-progress tasks on ${spec.name}.` };
  }
  if (action === "delete" || action === "remove") {
    return { type: "text", value: deleteCrew(cwd, name) ? `Deleted crew ${name}.` : `Crew not found: ${name}` };
  }
  if (action === "run") {
    const spec = loadCrew(cwd, name);
    if (!spec) {
      const goal = option(tokens, "--goal");
      if (!goal)
        return { type: "text", value: `Crew not found: ${name}` };
      const decomposed = await decomposeTask(goal, { cwd, dryRun: tokens.includes("--dry-run") });
      createCrew(cwd, name, goal, { lead: option(tokens, "--lead"), decomposed });
    } else if (tokens.includes("--decompose") && spec.tasks.length === 0) {
      const decomposed = await decomposeTask(spec.goal, { cwd, dryRun: tokens.includes("--dry-run") });
      createCrew(cwd, name, spec.goal, { lead: spec.lead, decomposed });
    }
    const workersRaw = option(tokens, "--workers");
    const maxTurnsRaw = option(tokens, "--max-turns");
    const events = [];
    const result = await runCrew(name, {
      cwd,
      workers: workersRaw ? Number(workersRaw) : 1,
      dryRun: tokens.includes("--dry-run"),
      worktrees: tokens.includes("--worktrees"),
      resume: tokens.includes("--resume"),
      skipPermissions: tokens.includes("--skip-permissions"),
      maxTurns: maxTurnsRaw ? Number(maxTurnsRaw) : undefined,
      onEvent: (event) => {
        if (event.kind === "claim")
          events.push(`  ${event.worker} claimed ${event.taskId} (${event.title})`);
        else if (event.kind === "done")
          events.push(`  ${event.worker} finished ${event.taskId}: ${event.status}`);
      }
    });
    const trace = !json && events.length ? `

Timeline:
${events.join(`
`)}` : "";
    return { type: "text", value: `${formatRunCrewResult(result, json)}${trace}` };
  }
  return { type: "text", value: usage() };
};
var init_crew2 = __esm(() => {
  init_crew();
  init_decomposer();
  init_argumentSubstitution();
  init_cwd();
});
init_crew2();

export {
  call
};
