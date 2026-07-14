import {
  createAgentKernel,
  enforceNoPassWithoutProof,
  init_kernel,
  init_verificationProofs
} from "./index-kf3sds22.js";
import {
  approvePhase,
  createSpec,
  deleteSpec,
  formatSpecList,
  formatSpecStatus,
  generatePhase,
  init_spec,
  listSpecs,
  loadSpec,
  parseTasks,
  readPhase,
  runSpec
} from "./index-cdgd2d9b.js";
import"./index-jsv0rfb7.js";
import"./index-hakw7em9.js";
import {
  defaultHeadlessRunner,
  init_headlessAgent,
  makeDryHeadlessRunner
} from "./index-c6n1hema.js";
import {
  extractVerdict,
  init_cliStepRunner
} from "./index-rad7f2cp.js";
import {
  init_projectGates,
  loadVerifyConfig,
  runGateCommands
} from "./index-yqwh56at.js";
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
  __esm,
  __require
} from "./index-8rxa073f.js";

// src/services/agents/specVerifier.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
function recordPath(cwd, name) {
  return join(cwd, ".ur", "specs", name, RECORD_FILE);
}
function reportPath(cwd, name) {
  return join(cwd, ".ur", "specs", name, REPORT_FILE);
}
function loadVerificationRecord(cwd, name) {
  const path = recordPath(cwd, name);
  if (!existsSync(path))
    return null;
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  if (!parsed || typeof parsed !== "object")
    return null;
  return parsed;
}
function listVerificationRecords(cwd, name) {
  const records = [];
  let current = loadVerificationRecord(cwd, name);
  if (current)
    records.push(current);
  return records;
}
function saveVerificationRecord(cwd, name, record) {
  const path = recordPath(cwd, name);
  mkdirSync(join(cwd, ".ur", "specs", name), { recursive: true });
  writeFileSync(path, `${JSON.stringify(record, null, 2)}
`);
}
function writeVerificationReport(cwd, name, result) {
  const lines = [
    `# Verification: ${name}`,
    "",
    `- Verdict: **${result.verdict}**`,
    `- Generated: ${result.generatedAt}`,
    `- Command failures: ${result.commandFailures}`,
    "",
    "## Summary",
    "",
    result.summary,
    "",
    "## Gate results",
    "",
    ...result.gateResults.map((g) => g.ok ? `- ✓ \`${g.command}\` passed` : `- ✗ \`${g.command}\` failed (exit ${g.exitCode ?? "killed"})`),
    "",
    "## Subagent output",
    "",
    "```",
    result.subagentOutput,
    "```",
    ""
  ];
  writeFileSync(reportPath(cwd, name), lines.join(`
`));
}
async function captureDiff(cwd) {
  const result = await execFileNoThrowWithCwd("git", ["diff", "HEAD", "--stat"], { cwd, preserveOutputOnError: true });
  const statLines = result.stdout.trim().split(`
`).filter(Boolean);
  const changedFiles = statLines.slice(0, -1).map((line) => line.split("|")[0]?.trim()).filter(Boolean);
  const diffResult = await execFileNoThrowWithCwd("git", ["diff", "HEAD"], { cwd, preserveOutputOnError: true });
  const diff = diffResult.stdout.slice(0, MAX_DIFF_CHARS);
  return { diff, changedFiles };
}
function buildVerifierPrompt(evidence) {
  const incompleteTasks = evidence.tasks.filter((t) => !t.done).map((t) => `- ${t.id}: ${t.title}`).join(`
`) || "None (all tasks marked done)";
  const prior = evidence.priorVerifications.map((r) => `- ${r.generatedAt}: ${r.verdict} — ${r.summary}`).join(`
`) || "No prior verifications.";
  return [
    "You are verifying the implementation of a specced feature.",
    "",
    "=== CRITICAL ===",
    "You are STRICTLY PROHIBITED from modifying the project. Read, run commands, and inspect only.",
    "You must be stricter than the implementer. No proof = no PASS.",
    "",
    "=== REQUIRED PROOFS ===",
    "Before PASS, confirm ALL of the following with command-run evidence:",
    "1. Compile proof: the project builds (e.g., tsc --noEmit, build script).",
    "2. Test proof: the relevant test suite passes.",
    "3. Lint proof: configured linters/type-checkers pass.",
    "4. Diff proof: the changed files match the spec and do not include unrelated edits.",
    "5. Runtime proof: the feature behaves as required (run the code / hit the endpoint / exercise the CLI).",
    "",
    "=== SPEC ===",
    `Goal: ${evidence.spec.goal}`,
    "",
    "Requirements:",
    evidence.requirements || "(none written)",
    "",
    "Design:",
    evidence.design || "(none written)",
    "",
    "Tasks:",
    evidence.tasks.map((t) => `- [${t.done ? "x" : " "}] ${t.id}: ${t.title}`).join(`
`),
    "",
    "Incomplete tasks at time of verification:",
    incompleteTasks,
    "",
    "Changed files:",
    evidence.changedFiles.length ? evidence.changedFiles.map((f) => `- ${f}`).join(`
`) : "(none detected)",
    "",
    "Diff preview:",
    "```diff",
    evidence.diff || "(no diff)",
    "```",
    "",
    "Prior verifications:",
    prior,
    "",
    "=== OUTPUT FORMAT ===",
    "Each check MUST include the exact command you ran and the observed output.",
    "End with exactly one line: VERDICT: PASS, VERDICT: FAIL, or VERDICT: PARTIAL.",
    "Use PARTIAL only for missing tools or environment, never for uncertainty."
  ].join(`
`);
}
async function runDeterministicGates(cwd) {
  const config = await loadVerifyConfig(cwd);
  const results = [];
  if (!config)
    return { results, failed: false };
  const commands = config.afterEdit?.length ? config.afterEdit : [];
  if (commands.length === 0)
    return { results, failed: false };
  const gate = await runGateCommands(commands, cwd, config.timeoutMs);
  if (gate.ok) {
    results.push({ ok: true, command: commands.join(" && "), ranCommands: gate.ranCommands });
    return { results, failed: false };
  }
  const failed = gate;
  results.push({
    ok: false,
    command: failed.command,
    exitCode: failed.exitCode,
    stdout: failed.stdout,
    stderr: failed.stderr
  });
  return { results, failed: true };
}
function countCommandFailures(output) {
  const markers = ["[ERROR]", "Command failed", "exit code 1", "Error:", "FAILED"];
  let count = 0;
  const lower = output.toLowerCase();
  for (const marker of markers) {
    const re = new RegExp(marker.replace(/\[/g, "\\[").replace(/\]/g, "\\]").toLowerCase(), "g");
    const matches = lower.match(re);
    if (matches)
      count += matches.length;
  }
  return count;
}
async function runSpecVerification(cwd, name, options = {}) {
  if (options.kernel) {
    const { runSpecVerifyWithKernel } = await import("./kernelSpec-2ycrv7np.js");
    return runSpecVerifyWithKernel(cwd, name, options.kernel, {
      dryRun: options.dryRun,
      maxTurns: options.maxTurns,
      skipPermissions: options.skipPermissions,
      runner: options.runner
    });
  }
  const runner = options.runner ?? (options.dryRun ? makeDryHeadlessRunner() : defaultHeadlessRunner());
  const { readPhase: readPhase2, loadSpec: loadSpec2, parseTasks: parseTasks2 } = await import("./spec-ke0ewfdg.js");
  const spec = loadSpec2(cwd, name);
  if (!spec)
    throw new Error(`Spec not found: ${name}`);
  const gateRun = await runDeterministicGates(cwd);
  if (gateRun.failed) {
    const generatedAt2 = new Date().toISOString();
    const summary2 = `Verification failed at project gates: ${gateRun.results.filter((r) => !r.ok).map((r) => r.command).join(", ")}`;
    const result2 = {
      verdict: "FAIL",
      summary: summary2,
      commandFailures: gateRun.results.filter((r) => !r.ok).length,
      gateResults: gateRun.results,
      subagentOutput: "",
      generatedAt: generatedAt2
    };
    const record2 = {
      version: 1,
      verdict: "FAIL",
      summary: summary2,
      commandFailures: result2.commandFailures,
      generatedAt: generatedAt2
    };
    saveVerificationRecord(cwd, name, record2);
    writeVerificationReport(cwd, name, result2);
    return result2;
  }
  const requirements = readPhase2(cwd, name, "requirements") ?? "";
  const design = readPhase2(cwd, name, "design") ?? "";
  const tasksMd = readPhase2(cwd, name, "tasks") ?? "";
  const tasks = parseTasks2(tasksMd);
  const { diff, changedFiles } = await captureDiff(cwd);
  const priorVerifications = listVerificationRecords(cwd, name);
  const evidence = {
    spec,
    requirements,
    design,
    tasks,
    changedFiles,
    diff,
    priorVerifications
  };
  const prompt = buildVerifierPrompt(evidence);
  const out = await runner({
    cwd,
    prompt,
    maxTurns: options.maxTurns,
    skipPermissions: options.skipPermissions
  });
  const initialVerdict = extractVerdict(out.output) ?? "PARTIAL";
  const strict = enforceNoPassWithoutProof(initialVerdict, out.output);
  const verdict = strict.verdict;
  const commandFailures = countCommandFailures(strict.output) + (strict.proofFailure ? 1 : 0);
  const generatedAt = new Date().toISOString();
  const summary = verdict === "PASS" ? "All required proofs (compile, test, lint, diff, runtime) were demonstrated by the verifier." : verdict === "FAIL" ? "The verifier found failing evidence. See subagent output for details." : "The verifier could not reach a definitive PASS/FAIL verdict.";
  const result = {
    verdict,
    summary,
    commandFailures,
    gateResults: gateRun.results,
    subagentOutput: strict.output,
    generatedAt
  };
  const record = {
    version: 1,
    verdict,
    summary,
    commandFailures,
    generatedAt
  };
  if (!options.dryRun) {
    saveVerificationRecord(cwd, name, record);
    writeVerificationReport(cwd, name, result);
  }
  return result;
}
var RECORD_FILE = "verification.json", REPORT_FILE = "verification.md", MAX_DIFF_CHARS = 12000;
var init_specVerifier = __esm(() => {
  init_execFileNoThrow();
  init_json();
  init_cliStepRunner();
  init_headlessAgent();
  init_projectGates();
  init_verificationProofs();
});

// src/commands/spec/spec.ts
function usage() {
  return [
    "Usage:",
    "  ur spec list [--json]",
    '  ur spec init <name> --goal "..." [--json]',
    "  ur spec show <name> [requirements|design|tasks] [--json]",
    "  ur spec status <name> [--json]",
    "  ur spec approve <name> [requirements|design|tasks] [--json]",
    "  ur spec generate <name> [requirements|design|tasks] [--dry-run] [--max-turns N] [--json]",
    "  ur spec next <name> [--json]",
    "  ur spec run <name> [--all] [--dry-run] [--max-turns N] [--skip-permissions] [--kernel] [--json]",
    "  ur spec verify <name> [--dry-run] [--max-turns N] [--skip-permissions] [--kernel] [--json]",
    "  ur spec delete <name> [--json]"
  ].join(`
`);
}
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
function positionals(tokens) {
  const values = [];
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (VALUE_FLAGS.has(token)) {
      i++;
      continue;
    }
    if (token.startsWith("--"))
      continue;
    values.push(token);
  }
  return values;
}
function asPhase(value) {
  return PHASES.includes(value) ? value : undefined;
}
function notFound(name) {
  return `Spec not found: ${name}`;
}
var PHASES, VALUE_FLAGS, call = async (args) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const positional = positionals(tokens);
  const action = positional[0] ?? "list";
  const name = positional[1];
  if (action === "list") {
    return { type: "text", value: formatSpecList(listSpecs(cwd), json) };
  }
  if (action === "init" || action === "create") {
    const goal = option(tokens, "--goal");
    if (!name || !goal)
      return { type: "text", value: usage() };
    const meta = createSpec(cwd, name, goal);
    return {
      type: "text",
      value: json ? JSON.stringify(meta, null, 2) : `Created spec ${meta.name} in .ur/specs/${meta.name}.`
    };
  }
  if (!name)
    return { type: "text", value: usage() };
  if (action === "show") {
    const phase = asPhase(positional[2]) ?? "requirements";
    const body = readPhase(cwd, name, phase);
    if (body === null)
      return { type: "text", value: `Spec phase not found: ${name}/${phase}` };
    return {
      type: "text",
      value: json ? JSON.stringify({ name, phase, body }, null, 2) : body
    };
  }
  if (action === "status") {
    const meta = loadSpec(cwd, name);
    if (!meta)
      return { type: "text", value: notFound(name) };
    return { type: "text", value: formatSpecStatus(cwd, meta, json) };
  }
  if (action === "approve") {
    const meta = loadSpec(cwd, name);
    if (!meta)
      return { type: "text", value: notFound(name) };
    const phase = asPhase(positional[2]) ?? meta.phase;
    const approved = approvePhase(cwd, name, phase);
    if (!approved)
      return { type: "text", value: notFound(name) };
    return {
      type: "text",
      value: json ? JSON.stringify(approved, null, 2) : `Approved ${phase} for ${approved.name}. Current phase: ${approved.phase}.`
    };
  }
  if (action === "generate") {
    const meta = loadSpec(cwd, name);
    if (!meta)
      return { type: "text", value: notFound(name) };
    const phase = asPhase(positional[2]) ?? meta.phase;
    const maxTurnsRaw = option(tokens, "--max-turns");
    const body = await generatePhase(cwd, name, phase, {
      dryRun: tokens.includes("--dry-run"),
      maxTurns: maxTurnsRaw ? Number(maxTurnsRaw) : undefined
    });
    return {
      type: "text",
      value: json ? JSON.stringify({ name: meta.name, phase, body }, null, 2) : body
    };
  }
  if (action === "next") {
    const meta = loadSpec(cwd, name);
    if (!meta)
      return { type: "text", value: notFound(name) };
    const next = parseTasks(readPhase(cwd, name, "tasks") ?? "").find((task) => !task.done);
    return {
      type: "text",
      value: json ? JSON.stringify({ name: meta.name, next: next ?? null }, null, 2) : next ? `${next.id}: ${next.title}` : `No open tasks for ${meta.name}.`
    };
  }
  if (action === "run") {
    const maxTurnsRaw = option(tokens, "--max-turns");
    const events = [];
    const useKernel = tokens.includes("--kernel");
    try {
      const result = await runSpec(cwd, name, {
        cwd,
        all: tokens.includes("--all"),
        dryRun: tokens.includes("--dry-run"),
        skipPermissions: tokens.includes("--skip-permissions"),
        maxTurns: maxTurnsRaw ? Number(maxTurnsRaw) : undefined,
        kernel: useKernel ? createAgentKernel({ cwd, dryRun: tokens.includes("--dry-run"), maxTurns: maxTurnsRaw ? Number(maxTurnsRaw) : undefined, skipPermissions: tokens.includes("--skip-permissions") }) : undefined,
        onEvent: (event) => {
          events.push(`  ${event.id}: ${event.isError ? "error" : event.verdict ?? "no verdict"}`);
        }
      });
      if (json)
        return { type: "text", value: JSON.stringify(result, null, 2) };
      const ran = result.ran.length ? result.ran.map((task) => `  ${task.id}: ${task.status} - ${task.title}`).join(`
`) : "  No open tasks.";
      const trace = events.length ? `

Agent verdicts:
${events.join(`
`)}` : "";
      return {
        type: "text",
        value: `Spec ${result.name}: ${result.remaining} task(s) remaining.${result.stoppedOnFailure ? " Stopped on failure." : ""}

Ran:
${ran}${trace}`
      };
    } catch (error) {
      return { type: "text", value: error instanceof Error ? error.message : String(error) };
    }
  }
  if (action === "verify") {
    const meta = loadSpec(cwd, name);
    if (!meta)
      return { type: "text", value: notFound(name) };
    const maxTurnsRaw = option(tokens, "--max-turns");
    const useKernel = tokens.includes("--kernel");
    try {
      const result = await runSpecVerification(cwd, name, {
        dryRun: tokens.includes("--dry-run"),
        skipPermissions: tokens.includes("--skip-permissions"),
        maxTurns: maxTurnsRaw ? Number(maxTurnsRaw) : undefined,
        kernel: useKernel ? createAgentKernel({ cwd, dryRun: tokens.includes("--dry-run"), maxTurns: maxTurnsRaw ? Number(maxTurnsRaw) : undefined, skipPermissions: tokens.includes("--skip-permissions") }) : undefined
      });
      if (json)
        return { type: "text", value: JSON.stringify(result, null, 2) };
      const gateLines = result.gateResults.length ? result.gateResults.map((g) => `  ${g.ok ? "✓" : "✗"} ${g.command}`).join(`
`) : "  (no project gates configured)";
      return {
        type: "text",
        value: [
          `Spec ${name}: verification ${result.verdict}`,
          `Summary: ${result.summary}`,
          `Command failures: ${result.commandFailures}`,
          "",
          "Gates:",
          gateLines,
          "",
          "Report: .ur/specs/verification.md"
        ].join(`
`)
      };
    } catch (error) {
      return { type: "text", value: error instanceof Error ? error.message : String(error) };
    }
  }
  if (action === "delete" || action === "remove") {
    const deleted = deleteSpec(cwd, name);
    return {
      type: "text",
      value: json ? JSON.stringify({ name, deleted }, null, 2) : deleted ? `Deleted spec ${name}.` : notFound(name)
    };
  }
  return { type: "text", value: usage() };
};
var init_spec2 = __esm(() => {
  init_spec();
  init_kernel();
  init_specVerifier();
  init_argumentSubstitution();
  init_cwd();
  PHASES = ["requirements", "design", "tasks"];
  VALUE_FLAGS = new Set(["--goal", "--max-turns"]);
});
init_spec2();

export {
  call
};
