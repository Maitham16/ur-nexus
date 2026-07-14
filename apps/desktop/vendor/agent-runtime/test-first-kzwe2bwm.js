import {
  init_ciLoop,
  splitCommand,
  summarizeFailure
} from "./index-qvav8zws.js";
import"./index-39h57bv7.js";
import"./index-azhaz9ta.js";
import {
  init_learning,
  recordOutcome
} from "./index-qg6cjfb3.js";
import"./index-5jrgxedg.js";
import {
  defaultHeadlessRunner,
  init_headlessAgent,
  makeDryHeadlessRunner
} from "./index-hp4vvv8v.js";
import"./index-zn5x3nwj.js";
import {
  detectProjectQualityStack,
  init_projectQuality
} from "./index-s87snjmt.js";
import"./index-6ykfn1n2.js";
import"./index-e7z6rkgj.js";
import"./index-e7zhbfbk.js";
import"./index-gkqe0rrq.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import {
  appendRunAction,
  appendRunTestsLog,
  init_runArtifacts,
  initializeResearchTrace,
  writeRunDiff,
  writeRunReport
} from "./index-60smdz72.js";
import"./index-wxsgjqjk.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-wred0kdg.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-m9qhxms7.js";
import"./index-5h7w9qkc.js";
import {
  getSessionId,
  init_state
} from "./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/testFirstLoop.ts
import {
  mkdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { dirname, join, relative } from "node:path";
function defaultTraceDir(cwd) {
  return join(cwd, ".ur", "test-first", "traces");
}
function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72) || "command";
}
function writeFailureTrace(cwd, traceDir, run, result, now) {
  mkdirSync(traceDir, { recursive: true });
  const stamp = now.toISOString().replace(/[:.]/g, "-");
  const file = join(traceDir, `${stamp}-attempt-${run.attempt}-${run.phase}-${slug(run.command)}.log`);
  const body = [
    "# UR test-first failure trace",
    "",
    `timestamp: ${now.toISOString()}`,
    `cwd: ${cwd}`,
    `attempt: ${run.attempt}`,
    `phase: ${run.phase}`,
    `command: ${run.command}`,
    `exitCode: ${run.code}`,
    "",
    "## stdout",
    result.stdout.trimEnd(),
    "",
    "## stderr",
    result.stderr.trimEnd(),
    ""
  ].join(`
`);
  writeFileSync(file, body);
  return relative(cwd, file);
}
function readExistingVerifyConfig(path) {
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function mergeStringArray(existing, additions) {
  const out = new Set;
  if (Array.isArray(existing)) {
    for (const value of existing)
      if (typeof value === "string")
        out.add(value);
  }
  for (const value of additions)
    out.add(value);
  return [...out];
}
function installTestFirstGates(cwd, stack = detectTestFirstStack(cwd)) {
  const path = join(cwd, ".ur", "verify.json");
  mkdirSync(dirname(path), { recursive: true });
  const commands = stack.commands.map((command) => command.command);
  const existing = readExistingVerifyConfig(path);
  const next = {
    ...existing,
    afterEdit: mergeStringArray(existing.afterEdit, commands),
    timeoutMs: typeof existing.timeoutMs === "number" && existing.timeoutMs > 0 ? existing.timeoutMs : 600000
  };
  writeFileSync(path, `${JSON.stringify(next, null, 2)}
`);
  return { path: relative(cwd, path), commands };
}
async function runTestFirstLoop(options) {
  const cwd = options.cwd;
  const stack = detectTestFirstStack(cwd);
  const traceDir = options.traceDir ?? defaultTraceDir(cwd);
  const runId = getSessionId();
  initializeResearchTrace(cwd, runId, {
    kind: "test-first",
    status: "planned",
    goal: "Detect stack, run compile/test/lint commands, and fix until green.",
    commands: stack.commands,
    missingPhases: stack.missingPhases
  });
  appendRunAction(cwd, runId, {
    kind: "test-first-plan",
    title: "Detected test-first command plan",
    status: stack.commands.length > 0 ? "planned" : "skipped",
    data: {
      languages: stack.languages,
      packageManagers: stack.packageManagers,
      commands: stack.commands,
      missingPhases: stack.missingPhases
    }
  });
  const maxAttempts = Math.max(1, options.maxAttempts ?? 3);
  const exec = options.exec ?? defaultExec;
  const runner = options.runner ?? (options.dryRun ? makeDryHeadlessRunner() : defaultHeadlessRunner());
  let installedVerifyPath;
  const finish = (result) => {
    writeRunReport(cwd, runId, formatTestFirstResult(result, false));
    if (!options.dryRun && (result.status === "passed" || result.status === "exhausted")) {
      recordOutcome(cwd, {
        id: `tf-${runId}`,
        task: stack.commands.join(" && ") || "test-first loop",
        model: null,
        pass: result.status === "passed",
        detail: `test-first ${result.status}`
      });
    }
    return result;
  };
  if (options.installGates) {
    installedVerifyPath = installTestFirstGates(cwd, stack).path;
  }
  if (stack.commands.length === 0) {
    return finish({ status: "not-configured", stack, attempts: [], traceDir });
  }
  if (options.dryRun) {
    return finish({ status: "planned", stack, attempts: [], traceDir, installedVerifyPath });
  }
  const attempts = [];
  for (let attemptNumber = 1;attemptNumber <= maxAttempts; attemptNumber++) {
    const attempt = { attempt: attemptNumber, runs: [] };
    attempts.push(attempt);
    let failingRun = null;
    for (const qualityCommand of stack.commands) {
      const started = Date.now();
      const result = await exec(qualityCommand.command, cwd);
      const durationMs = Date.now() - started;
      appendRunTestsLog(cwd, runId, [
        `# attempt ${attemptNumber} ${qualityCommand.phase}: ${qualityCommand.command}`,
        `exitCode: ${result.code}`,
        `durationMs: ${durationMs}`,
        "",
        "## stdout",
        result.stdout.trimEnd(),
        "",
        "## stderr",
        result.stderr.trimEnd(),
        ""
      ].join(`
`));
      const baseRun = {
        attempt: attemptNumber,
        phase: qualityCommand.phase,
        command: qualityCommand.command,
        code: result.code,
        passed: result.code === 0,
        durationMs
      };
      const run = result.code === 0 ? baseRun : {
        ...baseRun,
        summary: summarizeFailure(`${result.stdout}
${result.stderr}`),
        tracePath: writeFailureTrace(cwd, traceDir, baseRun, result, options.now?.() ?? new Date)
      };
      attempt.runs.push(run);
      appendRunAction(cwd, runId, {
        kind: "test-first-command",
        title: `${qualityCommand.phase}: ${qualityCommand.command}`,
        status: run.passed ? "passed" : "failed",
        command: qualityCommand.command,
        exitCode: result.code,
        stdout: result.stdout,
        stderr: result.stderr,
        reason: `run detected ${qualityCommand.phase} command`,
        nextAction: run.passed ? "continue to the next detected quality command" : "capture failure trace and invoke fix agent if attempts remain",
        data: {
          attempt: attemptNumber,
          phase: qualityCommand.phase,
          durationMs,
          tracePath: run.tracePath,
          summary: run.summary
        }
      });
      if (!run.passed) {
        failingRun = run;
        break;
      }
    }
    if (!failingRun) {
      await captureCurrentDiff(cwd, runId);
      return finish({ status: "passed", stack, attempts, traceDir, installedVerifyPath });
    }
    if (attemptNumber === maxAttempts)
      break;
    const fix = await runner({
      cwd,
      prompt: [
        "The test-first execution loop failed.",
        "Fix the repository so every detected compile, test, and lint command passes.",
        "Do not weaken tests, skip checks, or claim success without command evidence.",
        "",
        `Failed command: ${failingRun.command}`,
        `Phase: ${failingRun.phase}`,
        `Exit code: ${failingRun.code}`,
        failingRun.tracePath ? `Failure trace: ${failingRun.tracePath}` : null,
        "",
        "Failure summary:",
        failingRun.summary ?? "",
        "",
        "After editing, rerun the failing command and the full detected command set.",
        "End with VERDICT: PASS only if the commands actually exit 0."
      ].filter(Boolean).join(`
`),
      maxTurns: options.maxTurns,
      skipPermissions: options.skipPermissions
    });
    attempt.fixVerdict = fix.verdict ?? null;
    attempt.fixOutput = String(fix.output ?? "").slice(-1000);
    appendRunAction(cwd, runId, {
      kind: "test-first-fix-agent",
      title: `Fix attempt ${attemptNumber}`,
      status: fix.isError ? "failed" : "running",
      reason: "invoke fix agent after failing quality command",
      nextAction: fix.isError ? "stop because the fix runner failed" : "rerun detected commands",
      data: {
        attempt: attemptNumber,
        verdict: fix.verdict ?? null,
        outputTail: attempt.fixOutput
      }
    });
    if (fix.isError) {
      attempt.blockedByRunner = true;
      await captureCurrentDiff(cwd, runId);
      return finish({ status: "blocked", stack, attempts, traceDir, installedVerifyPath });
    }
  }
  await captureCurrentDiff(cwd, runId);
  return finish({ status: "exhausted", stack, attempts, traceDir, installedVerifyPath });
}
async function captureCurrentDiff(cwd, runId) {
  const diff = await execFileNoThrowWithCwd("git", ["diff", "--no-ext-diff", "--"], {
    cwd,
    timeout: 30000,
    preserveOutputOnError: true,
    audit: {
      cwd,
      runId,
      reason: "capture research trace diff.patch"
    }
  });
  writeRunDiff(cwd, runId, diff.code === 0 ? diff.stdout : `${diff.stdout}
${diff.stderr}`.trim());
}
function formatTestFirstResult(result, json) {
  if (json)
    return JSON.stringify(result, null, 2);
  const lines = [
    `Test-first loop: ${result.status}`,
    `Stack: ${result.stack.languages.length ? result.stack.languages.join(", ") : "unknown"} via ${result.stack.packageManagers.length ? result.stack.packageManagers.join(", ") : "unknown package manager"}`,
    `Trace dir: ${relative(process.cwd(), result.traceDir) || "."}`
  ];
  if (result.installedVerifyPath) {
    lines.push(`Installed gates: ${result.installedVerifyPath}`);
  }
  lines.push("", "Detected commands:");
  for (const command of result.stack.commands) {
    lines.push(`  ${command.phase}: ${command.command} (${command.source})`);
  }
  if (result.stack.missingPhases.length > 0) {
    lines.push(`Missing phases: ${result.stack.missingPhases.join(", ")}`);
  }
  if (result.status === "planned") {
    lines.push("", "Dry run only; no commands were executed.");
    return lines.join(`
`);
  }
  if (result.status === "not-configured") {
    lines.push("", "No compile, test, or lint command was detected.");
    return lines.join(`
`);
  }
  lines.push("", "Command evidence:");
  for (const attempt of result.attempts) {
    for (const run of attempt.runs) {
      const tag = run.passed ? "PASS" : `FAIL exit ${run.code}`;
      lines.push(`  attempt ${run.attempt} ${run.phase}: ${tag} ${run.command} (${run.durationMs}ms)`);
      if (run.tracePath)
        lines.push(`    trace: ${run.tracePath}`);
      if (run.summary && !run.passed) {
        lines.push(`    ${run.summary.split(`
`).slice(-3).join(" / ").slice(0, 220)}`);
      }
    }
    if (attempt.fixVerdict || attempt.blockedByRunner) {
      lines.push(`  fix agent: ${attempt.blockedByRunner ? "blocked" : attempt.fixVerdict ?? "ran"}`);
    }
  }
  return lines.join(`
`);
}
var detectTestFirstStack, defaultExec = async (command, cwd) => {
  const { file, args } = splitCommand(command);
  const result = await execFileNoThrowWithCwd(file, args, {
    cwd,
    timeout: 10 * 60 * 1000,
    preserveOutputOnError: true,
    maxBuffer: 2000000,
    audit: {
      cwd,
      reason: `run test-first quality command: ${command}`
    }
  });
  return { code: result.code, stdout: result.stdout, stderr: result.stderr };
};
var init_testFirstLoop = __esm(() => {
  init_projectQuality();
  init_execFileNoThrow();
  init_headlessAgent();
  init_ciLoop();
  init_learning();
  init_state();
  init_runArtifacts();
  detectTestFirstStack = detectProjectQualityStack;
});

// ../../src/commands/test-first/test-first.ts
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
function actionToken(tokens) {
  const valueOptions = new Set(["--max-attempts", "--max-turns"]);
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (valueOptions.has(token)) {
      i += 1;
      continue;
    }
    if (token.startsWith("--"))
      continue;
    return token;
  }
  return "run";
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const action = actionToken(tokens);
  const cwd = getCwd();
  const maxAttemptsRaw = option(tokens, "--max-attempts");
  const maxTurnsRaw = option(tokens, "--max-turns");
  if (action === "detect") {
    const stack = detectTestFirstStack(cwd);
    return {
      type: "text",
      value: json ? JSON.stringify(stack, null, 2) : [
        "Detected test-first stack:",
        `Languages: ${stack.languages.join(", ") || "unknown"}`,
        `Package managers: ${stack.packageManagers.join(", ") || "unknown"}`,
        "Commands:",
        ...stack.commands.map((command) => `  ${command.phase}: ${command.command}`),
        `Missing phases: ${stack.missingPhases.join(", ") || "none"}`
      ].join(`
`)
    };
  }
  if (action === "install") {
    const stack = detectTestFirstStack(cwd);
    const installed = installTestFirstGates(cwd, stack);
    return {
      type: "text",
      value: json ? JSON.stringify(installed, null, 2) : [
        `Installed test-first gates: ${installed.path}`,
        ...installed.commands.map((command) => `  ${command}`)
      ].join(`
`)
    };
  }
  const result = await runTestFirstLoop({
    cwd,
    maxAttempts: maxAttemptsRaw ? Number(maxAttemptsRaw) : undefined,
    dryRun: tokens.includes("--dry-run"),
    skipPermissions: tokens.includes("--skip-permissions"),
    maxTurns: maxTurnsRaw ? Number(maxTurnsRaw) : undefined,
    installGates: tokens.includes("--install-gates")
  });
  return { type: "text", value: formatTestFirstResult(result, json) };
};
var init_test_first = __esm(() => {
  init_argumentSubstitution();
  init_cwd();
  init_testFirstLoop();
});
init_test_first();

export {
  call
};
