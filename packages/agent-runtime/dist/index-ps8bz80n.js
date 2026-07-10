import {
  init_cliStepRunner,
  parseHeadlessOutput
} from "./index-ad9qp29k.js";
import {
  addRunArtifact,
  init_runArtifacts
} from "./index-cmw2ae5x.js";
import {
  init_json,
  safeParseJSON
} from "./index-mwn5bkf6.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-dsy9thtk.js";
import {
  getModelUsage,
  getTotalCostUSD,
  getTotalInputTokens,
  getTotalLinesAdded,
  getTotalLinesRemoved,
  getTotalOutputTokens,
  init_state,
  resetCostState
} from "./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/evals.ts
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";
function hasAnyExpectation(expect) {
  return Boolean(expect.contains?.length || expect.notContains?.length || expect.regex?.length || expect.verdict || typeof expect.maxOutputChars === "number" || Boolean(expect.judge?.trim()) || Boolean(expect.testCommand?.trim()));
}
function validateEvalSuite(suite) {
  const errors = [];
  const warnings = [];
  if (!suite.name || !suite.name.trim())
    errors.push("suite has no name");
  if (!Array.isArray(suite.cases) || suite.cases.length === 0) {
    errors.push("suite has no cases");
  }
  const seen = new Set;
  for (const evalCase of suite.cases ?? []) {
    if (!ID_RE.test(evalCase.id ?? "")) {
      errors.push(`invalid case id "${evalCase.id}"`);
    }
    if (seen.has(evalCase.id))
      errors.push(`duplicate case id "${evalCase.id}"`);
    seen.add(evalCase.id);
    if (!evalCase.prompt?.trim()) {
      errors.push(`case "${evalCase.id}" has an empty prompt`);
    }
    if (!evalCase.category?.trim()) {
      warnings.push(`case "${evalCase.id}" has no category`);
    }
    const expect = evalCase.expect ?? {};
    if (!hasAnyExpectation(expect)) {
      warnings.push(`case "${evalCase.id}" has no expectations (it will always pass)`);
    }
    for (const pattern of expect.regex ?? []) {
      try {
        new RegExp(pattern);
      } catch {
        errors.push(`case "${evalCase.id}" has an invalid regex: ${pattern}`);
      }
    }
  }
  return { valid: errors.length === 0, errors, warnings };
}
function gradeOutput(output, expect) {
  const checks = [];
  const haystack = output.toLowerCase();
  for (const needle of expect.contains ?? []) {
    checks.push({
      name: `contains "${needle}"`,
      passed: haystack.includes(needle.toLowerCase())
    });
  }
  for (const needle of expect.notContains ?? []) {
    const present = haystack.includes(needle.toLowerCase());
    checks.push({
      name: `excludes "${needle}"`,
      passed: !present,
      detail: present ? "found forbidden text" : undefined
    });
  }
  for (const pattern of expect.regex ?? []) {
    let matched = false;
    try {
      matched = new RegExp(pattern, "i").test(output);
    } catch {
      matched = false;
    }
    checks.push({ name: `matches /${pattern}/`, passed: matched });
  }
  if (expect.verdict) {
    const match = VERDICT_RE.exec(output);
    const got = match ? match[1].toUpperCase() : null;
    checks.push({
      name: `verdict ${expect.verdict}`,
      passed: got === expect.verdict,
      detail: got ? `got ${got}` : "no verdict found"
    });
  }
  if (typeof expect.maxOutputChars === "number") {
    checks.push({
      name: `≤ ${expect.maxOutputChars} chars`,
      passed: output.length <= expect.maxOutputChars,
      detail: `${output.length} chars`
    });
  }
  return checks;
}
function isSubsequence(needle, haystack) {
  let i = 0;
  for (const item of haystack) {
    if (i < needle.length && item === needle[i])
      i += 1;
  }
  return i === needle.length;
}
function gradeTrajectory(trajectory, expect) {
  const checks = [];
  const wantsTrajectory = expect.toolsUsed?.length || expect.toolOrder?.length || typeof expect.maxSteps === "number";
  if (!wantsTrajectory)
    return checks;
  if (!trajectory) {
    checks.push({
      name: "trajectory available",
      passed: false,
      detail: "runner did not capture a tool-call trajectory"
    });
    return checks;
  }
  for (const tool of expect.toolsUsed ?? []) {
    checks.push({ name: `uses ${tool}`, passed: trajectory.includes(tool) });
  }
  if (expect.toolOrder?.length) {
    checks.push({
      name: `tool order ${expect.toolOrder.join(" → ")}`,
      passed: isSubsequence(expect.toolOrder, trajectory)
    });
  }
  if (typeof expect.maxSteps === "number") {
    checks.push({
      name: `≤ ${expect.maxSteps} steps`,
      passed: trajectory.length <= expect.maxSteps,
      detail: `${trajectory.length} tool calls`
    });
  }
  return checks;
}
function preview(text, max = 160) {
  const value = text.replace(/\s+/g, " ").trim();
  return value.length <= max ? value : `${value.slice(0, max)}…`;
}
function sum(nums) {
  return nums.reduce((acc, n) => acc + (n ?? 0), 0);
}
function buildReport(name, cases) {
  const passed = cases.filter((item) => item.passed).length;
  const byCategory = {};
  for (const item of cases) {
    const bucket = byCategory[item.category] ??= { passed: 0, total: 0 };
    bucket.total += 1;
    if (item.passed)
      bucket.passed += 1;
  }
  const metrics = cases.map((c) => c.metrics);
  const testRuns = metrics.filter((m) => m?.testPassed !== undefined);
  const testsPassed = testRuns.filter((m) => m?.testPassed).length;
  const testsFailed = testRuns.filter((m) => m?.testPassed === false).length;
  const editCount = sum(metrics.map((m) => m?.editCount ?? (m?.insertions ?? 0) + (m?.deletions ?? 0)));
  const humanInterventions = sum(metrics.map((m) => m?.humanInterventions ?? m?.humanEditsNeeded));
  return {
    name,
    generatedAt: new Date().toISOString(),
    total: cases.length,
    passed,
    failed: cases.length - passed,
    passRate: cases.length > 0 ? Number((passed / cases.length).toFixed(2)) : 0,
    byCategory,
    totalDurationMs: sum(cases.map((c) => c.metrics?.durationMs ?? c.durationMs)),
    totalCostUSD: metrics.length > 0 ? Number(sum(metrics.map((m) => m?.costUSD)).toFixed(6)) : undefined,
    totalInputTokens: sum(metrics.map((m) => m?.inputTokens)) || undefined,
    totalOutputTokens: sum(metrics.map((m) => m?.outputTokens)) || undefined,
    totalFilesChanged: sum(metrics.map((m) => m?.filesChanged)) || undefined,
    totalEditCount: editCount || undefined,
    totalCommandFailures: sum(metrics.map((m) => m?.commandFailures)) || undefined,
    totalHumanEditsNeeded: sum(metrics.map((m) => m?.humanEditsNeeded)) || undefined,
    totalHumanInterventions: humanInterventions || undefined,
    totalRollbacks: sum(metrics.map((m) => m?.rollbacks)) || undefined,
    testsPassed: testRuns.length > 0 ? testsPassed : undefined,
    testsFailed: testRuns.length > 0 ? testsFailed : undefined,
    testPassRate: testRuns.length > 0 ? Number((testRuns.filter((m) => m?.testPassed).length / testRuns.length).toFixed(2)) : undefined,
    cases
  };
}
async function runSuite(suite, runner, options = {}) {
  const cases = options.category ? suite.cases.filter((item) => item.category === options.category) : suite.cases;
  const results = [];
  for (const evalCase of cases) {
    const started = Date.now();
    let output = "";
    let isError = false;
    let trajectory;
    let metrics;
    try {
      const run = await runner(evalCase);
      output = run.output;
      isError = run.isError === true;
      trajectory = run.trajectory;
      metrics = run.metrics;
    } catch (error) {
      output = error instanceof Error ? error.message : String(error);
      isError = true;
    }
    const expect = evalCase.expect ?? {};
    const checks = [
      ...gradeOutput(output, expect),
      ...gradeTrajectory(trajectory, expect)
    ];
    if (expect.judge && options.judge) {
      const verdict = await options.judge({ evalCase, rubric: expect.judge, output });
      checks.push({
        name: `judge: ${expect.judge.slice(0, 48)}`,
        passed: verdict.pass,
        detail: verdict.detail
      });
    } else if (expect.judge && !options.judge) {
      checks.push({
        name: "judge available",
        passed: false,
        detail: "case needs a judge but none was provided (run without --dry-run)"
      });
    }
    if (expect.testCommand) {
      if (metrics?.testPassed !== undefined) {
        checks.push({
          name: `test command: ${expect.testCommand}`,
          passed: metrics.testPassed,
          detail: metrics.testPassed ? undefined : "test command failed"
        });
      } else {
        checks.push({
          name: `test command: ${expect.testCommand}`,
          passed: false,
          detail: "runner did not execute the test command"
        });
      }
    }
    const passed = !isError && checks.every((check) => check.passed);
    const measuredDurationMs = Date.now() - started;
    const normalizedMetrics = metrics ? {
      ...metrics,
      durationMs: metrics.durationMs > 0 ? metrics.durationMs : measuredDurationMs
    } : undefined;
    results.push({
      id: evalCase.id,
      category: evalCase.category,
      passed,
      isError,
      durationMs: measuredDurationMs,
      checks,
      outputPreview: preview(output),
      metrics: normalizedMetrics
    });
  }
  return buildReport(suite.name, results);
}
async function runSuiteCompare(suite, labels, options = {}) {
  const perLabelReports = {};
  for (const label of labels) {
    const report = await runSuite(suite, label.runnerFactory(), options);
    perLabelReports[label.name] = report;
  }
  const caseMap = new Map;
  for (const label of labels) {
    const report = perLabelReports[label.name];
    for (const item of report.cases) {
      let row = caseMap.get(item.id);
      if (!row) {
        row = { caseId: item.id, category: item.category };
        caseMap.set(item.id, row);
      }
      row[label.name] = {
        passed: item.passed,
        durationMs: item.durationMs,
        costUSD: item.metrics?.costUSD,
        editCount: item.metrics?.editCount ?? (item.metrics?.insertions ?? 0) + (item.metrics?.deletions ?? 0),
        rollbacks: item.metrics?.rollbacks,
        commandFailures: item.metrics?.commandFailures,
        humanEditsNeeded: item.metrics?.humanEditsNeeded,
        humanInterventions: item.metrics?.humanInterventions ?? item.metrics?.humanEditsNeeded,
        testPassed: item.metrics?.testPassed
      };
    }
  }
  const rows = [...caseMap.values()].sort((a, b) => a.caseId.localeCompare(b.caseId));
  const byLabel = {};
  for (const label of labels) {
    const report = perLabelReports[label.name];
    const testRuns = report.cases.filter((c) => c.metrics?.testPassed !== undefined);
    byLabel[label.name] = {
      passed: report.passed,
      passRate: report.passRate,
      totalCostUSD: report.totalCostUSD,
      totalDurationMs: report.totalDurationMs,
      totalEditCount: report.totalEditCount ?? 0,
      totalRollbacks: report.totalRollbacks ?? 0,
      totalCommandFailures: report.totalCommandFailures ?? 0,
      totalHumanEditsNeeded: report.totalHumanEditsNeeded ?? 0,
      totalHumanInterventions: report.totalHumanInterventions ?? report.totalHumanEditsNeeded ?? 0,
      testsPassed: report.testsPassed,
      testsFailed: report.testsFailed,
      testPassRate: testRuns.length > 0 ? Number((testRuns.filter((c) => c.metrics?.testPassed).length / testRuns.length).toFixed(2)) : undefined
    };
  }
  return {
    suiteName: suite.name,
    generatedAt: new Date().toISOString(),
    labels: labels.map((l) => l.name),
    totalCases: rows.length,
    byLabel,
    rows
  };
}
function formatCompareReport(report, json) {
  if (json)
    return JSON.stringify(report, null, 2);
  const lines = [
    `Eval comparison: ${report.suiteName}`,
    `Cases: ${report.totalCases} | Labels: ${report.labels.join(", ")}`,
    ""
  ];
  const totalsHeader = ["Label", "Pass rate", "Tests", "Edits", "Cost", "Time", "Rollbacks", "Cmd failures", "Human intervention"];
  const totalsRows = [totalsHeader, ...report.labels.map((name) => {
    const b = report.byLabel[name];
    return [
      name,
      `${Math.round(b.passRate * 100)}%`,
      b.testsPassed !== undefined || b.testsFailed !== undefined ? `${b.testsPassed ?? 0}/${(b.testsPassed ?? 0) + (b.testsFailed ?? 0)}` : b.testPassRate !== undefined ? `${Math.round(b.testPassRate * 100)}%` : "—",
      String(b.totalEditCount),
      typeof b.totalCostUSD === "number" ? `$${b.totalCostUSD.toFixed(6)}` : "—",
      `${b.totalDurationMs}ms`,
      String(b.totalRollbacks),
      String(b.totalCommandFailures),
      String(b.totalHumanInterventions)
    ];
  })];
  lines.push(formatTable(totalsRows));
  lines.push("");
  const caseHeader = ["Case", "Category", ...report.labels.flatMap((name) => [
    `${name} pass`,
    `${name} time`,
    `${name} rollbacks`
  ])];
  const caseRows = [caseHeader, ...report.rows.map((row) => {
    const cells = [row.caseId, row.category];
    for (const label of report.labels) {
      const cell = row[label];
      cells.push(cell?.passed ? "✓" : "✗");
      cells.push(cell ? `${cell.durationMs}ms` : "—");
      cells.push(cell?.rollbacks !== undefined ? String(cell.rollbacks) : "—");
    }
    return cells;
  })];
  lines.push(formatTable(caseRows));
  return lines.join(`
`);
}
function formatTable(rows) {
  const widths = rows[0].map((_, i) => Math.max(...rows.map((r) => r[i]?.length ?? 0)));
  return rows.map((r) => r.map((cell, i) => (cell ?? "").padEnd(widths[i])).join("  ")).join(`
`);
}
async function runSuiteReliability(suite, runner, options) {
  const trials = Math.max(1, Math.floor(options.trials));
  const cases = options.category ? suite.cases.filter((item) => item.category === options.category) : suite.cases;
  const perCase = new Map;
  for (const evalCase of cases) {
    perCase.set(evalCase.id, {
      id: evalCase.id,
      category: evalCase.category,
      trials,
      passes: 0,
      passRate: 0,
      solvedAll: true
    });
  }
  for (let trial = 0;trial < trials; trial++) {
    const report = await runSuite(suite, runner, options);
    for (const result of report.cases) {
      const bucket = perCase.get(result.id);
      if (!bucket)
        continue;
      if (result.passed)
        bucket.passes += 1;
      else
        bucket.solvedAll = false;
    }
  }
  const caseResults = [...perCase.values()].map((bucket) => ({
    ...bucket,
    passRate: Number((bucket.passes / trials).toFixed(2))
  }));
  const solvedAll = caseResults.filter((c) => c.solvedAll).length;
  const meanPassRate = caseResults.length > 0 ? caseResults.reduce((sum2, c) => sum2 + c.passRate, 0) / caseResults.length : 0;
  return {
    name: suite.name,
    generatedAt: new Date().toISOString(),
    trials,
    total: caseResults.length,
    passHatK: caseResults.length > 0 ? Number((solvedAll / caseResults.length).toFixed(2)) : 0,
    meanPassRate: Number(meanPassRate.toFixed(2)),
    cases: caseResults
  };
}
function metricsFile() {
  return join(process.env.UR_EVAL_METRICS_DIR ?? process.cwd(), `.ur-eval-metrics-${process.pid}.json`);
}
function readChildMetricsFile(path) {
  if (!existsSync(path))
    return;
  try {
    const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
    if (parsed && typeof parsed === "object")
      return parsed;
  } catch {}
  return;
}
function deleteChildMetricsFile(path) {
  try {
    rmSync(path, { force: true });
  } catch {}
}
async function gitDiffStats(cwd) {
  const result = await execFileNoThrowWithCwd("git", ["diff", "--stat"], { cwd, timeout: 30000, preserveOutputOnError: true });
  if (result.code !== 0 || !result.stdout.trim()) {
    return { filesChanged: 0, insertions: 0, deletions: 0 };
  }
  let filesChanged = 0;
  let insertions = 0;
  let deletions = 0;
  for (const line of result.stdout.trim().split(`
`)) {
    if (line.includes("|")) {
      filesChanged += 1;
      const match = line.match(/(\d+)\s*insertion|\+(\d+)|(\d+)\s*deletion|-(\d+)/g);
      if (match) {
        for (const token of match) {
          const num = Number(token.replace(/[^0-9]/g, ""));
          if (Number.isNaN(num))
            continue;
          if (token.includes("insertion") || token.includes("+"))
            insertions += num;
          if (token.includes("deletion") || token.includes("-"))
            deletions += num;
        }
      }
    }
  }
  return { filesChanged, insertions, deletions };
}
async function runTestCommand(cwd, command) {
  const result = await execFileNoThrowWithCwd("sh", ["-c", command], {
    cwd,
    timeout: 5 * 60000,
    preserveOutputOnError: true
  });
  return {
    testPassed: result.code === 0,
    testStdout: result.stdout,
    testStderr: result.stderr || result.error || ""
  };
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
function countHumanEdits(output) {
  const markers = ["human edit", "manual edit", "needs edit", "needs human", "human intervention", "cannot proceed"];
  let count = 0;
  const lower = output.toLowerCase();
  for (const marker of markers) {
    const re = new RegExp(marker.toLowerCase(), "g");
    const matches = lower.match(re);
    if (matches)
      count += matches.length;
  }
  return count;
}
function countRollbacks(output) {
  const markers = ["rolled back", "rolledback", "rollback", "roll back", "reverted", "revert"];
  let count = 0;
  const lower = output.toLowerCase();
  for (const marker of markers) {
    const re = new RegExp(`\\b${marker.toLowerCase().replace(/\s+/g, "\\s*")}\\b`, "g");
    const matches = lower.match(re);
    if (matches)
      count += matches.length;
  }
  return count;
}
function firstModelName(modelUsage) {
  const names = Object.keys(modelUsage);
  return names.length > 0 ? names[0] : undefined;
}
function makeCliEvalRunner(options) {
  return async (evalCase) => {
    const started = Date.now();
    resetCostState();
    const file = process.execPath;
    const baseArgs = [process.argv[1] ?? ""];
    const args = [...baseArgs, "-p", "--output-format", "json"];
    if (options.maxTurns && options.maxTurns > 0) {
      args.push("--max-turns", String(options.maxTurns));
    }
    if (options.skipPermissions) {
      args.push("--dangerously-skip-permissions");
    }
    args.push(evalCase.prompt);
    const childMetricsPath = metricsFile();
    const childEnv = {
      ...process.env,
      UR_EVAL_METRICS_FILE: childMetricsPath
    };
    if (options.model) {
      childEnv.UR_MODEL = options.model;
      childEnv.OLLAMA_MODEL = options.model;
    }
    const result = await execFileNoThrowWithCwd(file, args, {
      cwd: options.cwd,
      timeout: options.timeoutMs ?? 30 * 60 * 1000,
      preserveOutputOnError: true,
      env: childEnv
    });
    const output = parseHeadlessOutput(result.stdout) || result.stderr || result.error || "";
    const childMetrics = readChildMetricsFile(childMetricsPath);
    deleteChildMetricsFile(childMetricsPath);
    const diffStats = await gitDiffStats(options.cwd);
    let testResult;
    if (evalCase.expect.testCommand) {
      const ran = await runTestCommand(options.cwd, evalCase.expect.testCommand);
      testResult = { ...ran, testCommand: evalCase.expect.testCommand };
    }
    const modelUsage = getModelUsage();
    const metrics = {
      durationMs: Date.now() - started,
      costUSD: childMetrics?.costUSD ?? getTotalCostUSD(),
      inputTokens: childMetrics?.inputTokens ?? getTotalInputTokens(),
      outputTokens: childMetrics?.outputTokens ?? getTotalOutputTokens(),
      model: options.model ?? childMetrics?.model ?? firstModelName(modelUsage),
      filesChanged: diffStats.filesChanged,
      editCount: diffStats.insertions + diffStats.deletions + (childMetrics?.linesAdded ?? getTotalLinesAdded()) + (childMetrics?.linesRemoved ?? getTotalLinesRemoved()),
      insertions: diffStats.insertions + (childMetrics?.linesAdded ?? getTotalLinesAdded()),
      deletions: diffStats.deletions + (childMetrics?.linesRemoved ?? getTotalLinesRemoved()),
      testPassed: testResult?.testPassed,
      testsPassed: testResult ? testResult.testPassed ? 1 : 0 : undefined,
      testsFailed: testResult ? testResult.testPassed ? 0 : 1 : undefined,
      testCommand: testResult?.testCommand,
      testStdout: testResult?.testStdout,
      testStderr: testResult?.testStderr,
      commandFailures: countCommandFailures(output) + (result.code !== 0 ? 1 : 0) + (testResult && !testResult.testPassed ? 1 : 0),
      humanEditsNeeded: countHumanEdits(output),
      humanInterventions: countHumanEdits(output),
      rollbacks: countRollbacks(output)
    };
    return { output, isError: result.code !== 0, metrics };
  };
}
function makeDryEvalRunner() {
  return async (evalCase) => ({
    output: `[dry-run] would run: ${evalCase.prompt}`,
    isError: false
  });
}
function makeCliJudgeRunner(options) {
  return async ({ evalCase, rubric, output }) => {
    const file = process.execPath;
    const baseArgs = [process.argv[1] ?? ""];
    const prompt = `You are grading an AI agent's answer against a rubric. Be strict.

` + `Task: ${evalCase.prompt}

Rubric: ${rubric}

Answer:
${output.slice(0, 4000)}

` + `Reply with exactly one line: "VERDICT: PASS" or "VERDICT: FAIL", then a brief reason.`;
    const args = [...baseArgs, "-p", "--output-format", "json", prompt];
    const result = await execFileNoThrowWithCwd(file, args, {
      cwd: options.cwd,
      timeout: options.timeoutMs ?? 10 * 60 * 1000,
      preserveOutputOnError: true
    });
    const text = parseHeadlessOutput(result.stdout) || result.stderr || "";
    const match = /\bVERDICT:\s*(PASS|FAIL|PARTIAL)\b/i.exec(text);
    const got = match ? match[1].toUpperCase() : null;
    return { pass: got === "PASS", detail: preview(text, 120) };
  };
}
function makeDryJudgeRunner(pass = true) {
  return async () => ({ pass, detail: "[dry-run] judge not invoked" });
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function num(n, fallback = "—") {
  return typeof n === "number" ? String(n) : fallback;
}
function fmtUsd(n) {
  return typeof n === "number" ? `$${n.toFixed(6)}` : "—";
}
function buildDashboardHtml(reports, reliability = []) {
  const generatedAt = new Date().toISOString();
  const summaryCards = (report) => {
    const cards = [
      ["Pass rate", `${Math.round(report.passRate * 100)}%`],
      ["Test pass rate", report.testPassRate !== undefined ? `${Math.round(report.testPassRate * 100)}%` : "—"],
      ["Cost", fmtUsd(report.totalCostUSD)],
      ["Tokens", `${num(report.totalInputTokens)} / ${num(report.totalOutputTokens)}`],
      ["Files changed", num(report.totalFilesChanged)],
      ["Edit count", num(report.totalEditCount)],
      ["Tests passed", report.testsPassed !== undefined || report.testsFailed !== undefined ? `${report.testsPassed ?? 0}/${(report.testsPassed ?? 0) + (report.testsFailed ?? 0)}` : "—"],
      ["Command failures", num(report.totalCommandFailures)],
      ["Human intervention", num(report.totalHumanInterventions ?? report.totalHumanEditsNeeded)],
      ["Rollbacks", num(report.totalRollbacks)],
      ["Duration", `${num(report.totalDurationMs, "0")}ms`]
    ];
    return `<div class="cards">${cards.map(([label, value]) => `<div class="card"><div class="val">${escapeHtml(value)}</div><div class="label">${escapeHtml(label)}</div></div>`).join("")}</div>`;
  };
  const timelineRow = (c) => {
    const m = c.metrics;
    const testBadge = m?.testPassed === true ? '<span class="badge ok">test pass</span>' : m?.testPassed === false ? '<span class="badge bad">test fail</span>' : "";
    const commandsRun = [m?.testCommand].filter(Boolean).join(", ");
    return `<tr class="${c.passed ? "ok" : "bad"}">` + `<td>${c.passed ? "✓" : "✗"}</td>` + `<td>${escapeHtml(c.id)}</td>` + `<td>${escapeHtml(c.category)}</td>` + `<td>${escapeHtml(m?.model ?? "—")}</td>` + `<td>${num(c.durationMs)}ms</td>` + `<td>${fmtUsd(m?.costUSD)}</td>` + `<td>${num(m?.inputTokens)} / ${num(m?.outputTokens)}</td>` + `<td>${num(m?.filesChanged)} <span class="muted">+${num(m?.insertions)} −${num(m?.deletions)}</span></td>` + `<td>${num(m?.editCount ?? (m?.insertions ?? 0) + (m?.deletions ?? 0))}</td>` + `<td>${testBadge}</td>` + `<td><code>${escapeHtml(commandsRun || "—")}</code></td>` + `<td>${num(m?.commandFailures)}</td>` + `<td>${m?.humanInterventions || m?.humanEditsNeeded ? `<span class="badge warn">${m.humanInterventions ?? m.humanEditsNeeded}</span>` : "—"}</td>` + `<td>${num(m?.rollbacks)}</td>` + `<td><code>${escapeHtml(c.outputPreview.slice(0, 60))}</code></td>` + `</tr>`;
  };
  const card = (report) => {
    const pct = Math.round(report.passRate * 100);
    const cats = Object.entries(report.byCategory).sort((a, b) => a[0].localeCompare(b[0])).map(([cat, b]) => `<tr><td>${escapeHtml(cat)}</td><td>${b.passed}/${b.total}</td></tr>`).join("");
    const rows = report.cases.map(timelineRow).join("");
    return `<section><h2>${escapeHtml(report.name)} — ${report.passed}/${report.total} (${pct}%)</h2>` + `<p class="muted">generated ${escapeHtml(report.generatedAt)}</p>` + `${summaryCards(report)}` + `<table class="cats"><thead><tr><th>category</th><th>pass</th></tr></thead><tbody>${cats}</tbody></table>` + `<h3>Task timeline</h3>` + `<table class="cases timeline"><thead><tr><th></th><th>case</th><th>category</th><th>model used</th><th>time</th><th>cost</th><th>tokens</th><th>diffs produced</th><th>edit count</th><th>tests passed/failed</th><th>commands run</th><th>command failures</th><th>human intervention</th><th>rollbacks</th><th>output</th></tr></thead>` + `<tbody>${rows}</tbody></table></section>`;
  };
  const relCard = (rel) => {
    const rows = rel.cases.map((c) => `<tr class="${c.solvedAll ? "ok" : "bad"}"><td>${c.solvedAll ? "✓" : "✗"}</td>` + `<td>${escapeHtml(c.id)}</td><td>${c.passes}/${c.trials}</td><td>${Math.round(c.passRate * 100)}%</td></tr>`).join("");
    return `<section><h2>Reliability: ${escapeHtml(rel.name)} — pass^${rel.trials} = ${Math.round(rel.passHatK * 100)}%</h2>` + `<p class="muted">mean pass rate ${Math.round(rel.meanPassRate * 100)}% over ${rel.trials} trials</p>` + `<table class="cases"><thead><tr><th></th><th>case</th><th>passes</th><th>rate</th></tr></thead>` + `<tbody>${rows}</tbody></table></section>`;
  };
  const body = reports.length === 0 && reliability.length === 0 ? '<p class="muted">No eval reports yet. Run <code>ur eval run &lt;suite&gt;</code>.</p>' : reports.map(card).join("") + reliability.map(relCard).join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>UR Eval Dashboard</title>
<style>
  :root { color-scheme: light dark; }
  body { font: 14px/1.5 ui-sans-serif, system-ui, sans-serif; margin: 2rem; max-width: 1100px; }
  h1, h2, h3 { margin: 0 0 .25rem; } h3 { margin-top: 1.25rem; font-size: 1rem; } .muted { color: #888; font-size: 12px; }
  section { margin: 1.5rem 0; padding: 1rem; border: 1px solid #8884; border-radius: 8px; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: .75rem; margin: .75rem 0 1rem; }
  .card { padding: .75rem; border: 1px solid #8883; border-radius: 6px; text-align: center; }
  .card .val { font-size: 1.15rem; font-weight: 600; }
  .card .label { font-size: .75rem; color: #888; text-transform: uppercase; letter-spacing: .02em; }
  table { border-collapse: collapse; width: 100%; margin-top: .5rem; }
  th, td { text-align: left; padding: .25rem .5rem; border-bottom: 1px solid #8882; vertical-align: top; }
  table.cats { width: auto; } td:last-child { color: #777; }
  tr.bad td:first-child { color: #c0392b; } tr.ok td:first-child { color: #27ae60; }
  .badge { font-size: .75rem; padding: .1rem .35rem; border-radius: 4px; }
  .badge.ok { background: #27ae601a; color: #27ae60; }
  .badge.bad { background: #c0392b1a; color: #c0392b; }
  .badge.warn { background: #f1c40f1a; color: #bfa30b; }
  code { background: #8881; padding: 0 .25rem; border-radius: 4px; }
</style></head>
<body><h1>UR Eval Dashboard</h1><p class="muted">generated ${escapeHtml(generatedAt)} · local-first, no network</p>
${body}</body></html>
`;
}
function loadAllReports(cwd) {
  const dir = resultsDir(cwd);
  if (!existsSync(dir))
    return [];
  const reports = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".json") || file.startsWith("reliability-"))
      continue;
    const parsed = safeParseJSON(readFileSync(join(dir, file), "utf-8"), false);
    if (parsed && typeof parsed === "object")
      reports.push(parsed);
  }
  return reports.sort((a, b) => a.name.localeCompare(b.name));
}
function loadAllReliability(cwd) {
  const dir = resultsDir(cwd);
  if (!existsSync(dir))
    return [];
  const reports = [];
  for (const file of readdirSync(dir)) {
    if (!file.startsWith("reliability-") || !file.endsWith(".json"))
      continue;
    const parsed = safeParseJSON(readFileSync(join(dir, file), "utf-8"), false);
    if (parsed && typeof parsed === "object")
      reports.push(parsed);
  }
  return reports.sort((a, b) => a.name.localeCompare(b.name));
}
function saveReliabilityReport(cwd, report) {
  mkdirSync(resultsDir(cwd), { recursive: true });
  const path = join(resultsDir(cwd), `reliability-${suiteSlug(report.name)}.json`);
  writeFileSync(path, `${JSON.stringify(report, null, 2)}
`);
  return path;
}
function writeDashboard(cwd) {
  const html = buildDashboardHtml(loadAllReports(cwd), loadAllReliability(cwd));
  mkdirSync(evalsDir(cwd), { recursive: true });
  const path = join(evalsDir(cwd), "dashboard.html");
  writeFileSync(path, html);
  return path;
}
function buildLeaderboard(cwd, reports, options = {}) {
  const format = options.format ?? "html";
  const title = options.title ?? "UR Public Leaderboard";
  const runId = options.runId ?? process.env.UR_RUN_ID;
  if (format === "json") {
    const dir2 = resultsDir(cwd);
    mkdirSync(dir2, { recursive: true });
    const path2 = join(dir2, "leaderboard.json");
    writeFileSync(path2, JSON.stringify({ title, generatedAt: new Date().toISOString(), reports }, null, 2) + `
`);
    if (runId) {
      addRunArtifact(cwd, runId, { kind: "leaderboard", path: path2, title });
    }
    return path2;
  }
  if (format === "md") {
    const dir2 = resultsDir(cwd);
    mkdirSync(dir2, { recursive: true });
    const path2 = join(dir2, "leaderboard.md");
    writeFileSync(path2, formatLeaderboardMarkdown(title, reports));
    if (runId) {
      addRunArtifact(cwd, runId, { kind: "leaderboard", path: path2, title });
    }
    return path2;
  }
  const dir = evalsDir(cwd);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "leaderboard.html");
  const html = buildDashboardHtml(reports, []);
  writeFileSync(path, html.replace("<title>UR Eval Dashboard</title>", `<title>${escapeHtml(title)}</title>`).replace("<h1>UR Eval Dashboard</h1>", `<h1>${escapeHtml(title)}</h1>`));
  if (runId) {
    addRunArtifact(cwd, runId, { kind: "leaderboard", path, title });
  }
  return path;
}
function formatLeaderboardMarkdown(title, reports) {
  const lines = [
    `# ${title}`,
    `generated ${new Date().toISOString()}`,
    "",
    "| Suite | Pass rate | Tests passed | Edit count | Cost | Tokens | Files | Failures | Rollbacks | Human intervention |",
    "|---|---|---|---|---|---|---|---|---|---|"
  ];
  for (const r of reports) {
    lines.push(`| ${r.name} | ${Math.round(r.passRate * 100)}% | ${r.testsPassed !== undefined || r.testsFailed !== undefined ? `${r.testsPassed ?? 0}/${(r.testsPassed ?? 0) + (r.testsFailed ?? 0)}` : r.testPassRate !== undefined ? `${Math.round(r.testPassRate * 100)}%` : "—"} | ${r.totalEditCount ?? "—"} | ${r.totalCostUSD !== undefined ? `$${r.totalCostUSD.toFixed(6)}` : "—"} | ${r.totalInputTokens ?? "—"} / ${r.totalOutputTokens ?? "—"} | ${r.totalFilesChanged ?? "—"} | ${r.totalCommandFailures ?? "—"} | ${r.totalRollbacks ?? "—"} | ${r.totalHumanInterventions ?? r.totalHumanEditsNeeded ?? "—"} |`);
  }
  return lines.join(`
`) + `
`;
}
function runsDir(cwd, suiteName) {
  return join(evalsDir(cwd), ".runs", suiteSlug(suiteName));
}
function writeRunMetrics(cwd, suiteName, caseId, metrics) {
  const dir = runsDir(cwd, suiteName);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${caseId}.json`);
  writeFileSync(path, `${JSON.stringify(metrics, null, 2)}
`);
  return path;
}
function loadRunMetrics(cwd, suiteName, caseId) {
  const path = join(runsDir(cwd, suiteName), `${caseId}.json`);
  if (!existsSync(path))
    return null;
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  if (!parsed || typeof parsed !== "object")
    return null;
  return parsed;
}
function formatReliabilityReport(report, json) {
  if (json)
    return JSON.stringify(report, null, 2);
  const lines = [
    `Reliability: ${report.name}`,
    `pass^${report.trials}: ${Math.round(report.passHatK * 100)}% (cases solved in every trial)`,
    `mean pass rate: ${Math.round(report.meanPassRate * 100)}%`,
    ""
  ];
  for (const c of report.cases) {
    const mark = c.solvedAll ? "✓" : "✗";
    lines.push(`${mark} ${c.id} (${c.category}) — ${c.passes}/${c.trials} (${Math.round(c.passRate * 100)}%)`);
  }
  return lines.join(`
`);
}
function evalsDir(cwd) {
  return join(cwd, ".ur", "evals");
}
function resultsDir(cwd) {
  return join(evalsDir(cwd), ".results");
}
function suiteSlug(name) {
  return name.trim().toLowerCase().replace(/[^a-z0-9-_]+/g, "-").slice(0, 64);
}
function parseSuiteText(text) {
  const parsed = safeParseJSON(text, false);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Eval suite is not a JSON object");
  }
  const suite = parsed;
  if (!suite.name || !Array.isArray(suite.cases)) {
    throw new Error("Eval suite must have a name and a cases array");
  }
  return {
    version: 1,
    name: String(suite.name),
    description: suite.description ? String(suite.description) : undefined,
    cases: suite.cases.map((raw, index) => {
      const item = raw ?? {};
      return {
        id: String(item.id ?? `case-${index + 1}`),
        category: String(item.category ?? "general"),
        prompt: String(item.prompt ?? ""),
        expect: item.expect ?? {}
      };
    })
  };
}
function listSuites(cwd) {
  const dir = evalsDir(cwd);
  if (!existsSync(dir))
    return [];
  return readdirSync(dir).filter((file) => file.endsWith(".json")).map((file) => file.replace(/\.json$/, "")).sort();
}
function loadSuite(cwd, name) {
  const path = join(evalsDir(cwd), `${suiteSlug(name)}.json`);
  if (!existsSync(path))
    return null;
  try {
    return parseSuiteText(readFileSync(path, "utf-8"));
  } catch {
    return null;
  }
}
function saveSuite(cwd, suite, options = {}) {
  const path = join(evalsDir(cwd), `${suiteSlug(suite.name)}.json`);
  mkdirSync(evalsDir(cwd), { recursive: true });
  if (existsSync(path) && options.force !== true) {
    return { path, created: false };
  }
  writeFileSync(path, `${JSON.stringify(suite, null, 2)}
`);
  return { path, created: true };
}
function asString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
function asStringArray(value) {
  if (Array.isArray(value))
    return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === "string" && value.trim())
    return [value.trim()];
  return [];
}
function recordId(record, fallback) {
  const id = asString(record.instance_id) ?? asString(record.task_id) ?? asString(record.id) ?? asString(record.name) ?? fallback;
  return id.toLowerCase().replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64) || fallback;
}
function parseBenchmarkRecords(text) {
  const trimmed = text.trim();
  if (!trimmed)
    return [];
  const parsed = safeParseJSON(trimmed, false);
  if (Array.isArray(parsed))
    return parsed.filter((item) => item && typeof item === "object");
  if (parsed && typeof parsed === "object") {
    const object = parsed;
    if (Array.isArray(object.instances))
      return object.instances.filter((item) => item && typeof item === "object");
    if (Array.isArray(object.tasks))
      return object.tasks.filter((item) => item && typeof item === "object");
    if (Array.isArray(object.cases))
      return object.cases.filter((item) => item && typeof item === "object");
    return [object];
  }
  const records = [];
  for (const line of trimmed.split(`
`)) {
    const item = safeParseJSON(line, false);
    if (item && typeof item === "object")
      records.push(item);
  }
  return records;
}
function sweBenchCase(record, index) {
  const id = recordId(record, `swe-${index + 1}`);
  const repo = asString(record.repo) ?? asString(record.repository) ?? "the target repository";
  const problem = asString(record.problem_statement) ?? asString(record.issue) ?? asString(record.prompt) ?? "";
  const failToPass = asStringArray(record.FAIL_TO_PASS ?? record.fail_to_pass);
  const passToPass = asStringArray(record.PASS_TO_PASS ?? record.pass_to_pass);
  const tests = [...failToPass, ...passToPass];
  return {
    id,
    category: "swe-bench",
    prompt: [
      `You are UR running locally on a SWE-bench style task for ${repo}.`,
      asString(record.base_commit) ? `Base commit: ${asString(record.base_commit)}` : undefined,
      "",
      "Problem statement:",
      problem,
      "",
      tests.length ? `Relevant tests:
${tests.map((test) => `- ${test}`).join(`
`)}` : "No explicit test list was provided in this record.",
      "",
      "Fix the issue in the local checkout. Prefer a minimal patch and run the relevant tests before finalizing."
    ].filter(Boolean).join(`
`),
    expect: {
      notContains: ["I cannot"],
      judge: "Pass if the answer describes a concrete code fix, relevant tests, and does not refuse the software-engineering task. For full benchmark scoring, apply the produced patch and run the benchmark harness tests."
    }
  };
}
function terminalBenchCase(record, index) {
  const id = recordId(record, `terminal-${index + 1}`);
  const instruction = asString(record.instruction) ?? asString(record.prompt) ?? asString(record.task) ?? asString(record.description) ?? "";
  const setup = asString(record.setup) ?? asString(record.setup_script);
  const verification = asString(record.verification) ?? asString(record.test_command) ?? asString(record.oracle) ?? asString(record.expected);
  return {
    id,
    category: "terminal-bench",
    prompt: [
      "You are UR running a Terminal-Bench style task in a local shell workspace.",
      setup ? `Setup context:
${setup}` : undefined,
      "",
      "Task:",
      instruction,
      "",
      verification ? `Verification:
${verification}` : "State the commands you would run to verify the result.",
      "",
      "Use terminal-safe, local commands and finish with a short result summary."
    ].filter(Boolean).join(`
`),
    expect: {
      notContains: ["I cannot"],
      judge: "Pass if the answer gives a plausible terminal workflow, performs or names verification, and stays within the local task constraints."
    }
  };
}
function aiderPolyglotCase(record, index) {
  const id = recordId(record, `aider-${index + 1}`);
  const language = asString(record.language) ?? asString(record.lang);
  const prompt = asString(record.prompt) ?? asString(record.instruction) ?? asString(record.problem_statement) ?? "";
  const tests = asStringArray(record.tests ?? record.test_commands ?? record.test_command);
  return {
    id,
    category: "aider-polyglot",
    prompt: [
      `You are UR running an Aider Polyglot style coding task${language ? ` in ${language}` : ""}.`,
      "",
      "Task:",
      prompt,
      "",
      tests.length ? `Expected verification:
${tests.map((test) => `- ${test}`).join(`
`)}` : "Identify and run the narrowest relevant verification for this language.",
      "",
      "Edit locally, keep the patch minimal, and summarize changed files and test results."
    ].filter(Boolean).join(`
`),
    expect: {
      notContains: ["I cannot"],
      judge: "Pass if the answer targets the requested language task, identifies changed files or patch intent, and includes relevant verification."
    }
  };
}
function buildBenchmarkSuite(adapter, records, options = {}) {
  const limited = options.limit && options.limit > 0 ? records.slice(0, Math.floor(options.limit)) : records;
  const cases = limited.map((record, index) => {
    if (adapter === "swe-bench")
      return sweBenchCase(record, index);
    if (adapter === "terminal-bench")
      return terminalBenchCase(record, index);
    return aiderPolyglotCase(record, index);
  });
  const info = BENCHMARK_ADAPTERS.find((item) => item.id === adapter);
  return {
    version: 1,
    name: options.name ?? adapter,
    description: `${info?.name ?? adapter} adapter suite generated from a local benchmark export. Runs through UR's local/Ollama eval harness; no provider API is required.`,
    cases
  };
}
function importBenchmarkSuite(cwd, adapter, file, options = {}) {
  const records = parseBenchmarkRecords(readFileSync(file, "utf-8"));
  if (records.length === 0) {
    throw new Error(`No benchmark records found in ${file}`);
  }
  const suite = buildBenchmarkSuite(adapter, records, options);
  const saved = saveSuite(cwd, suite, { force: options.force });
  return { suite, path: saved.path, created: saved.created, records: records.length };
}
function saveReport(cwd, report, options = {}) {
  mkdirSync(resultsDir(cwd), { recursive: true });
  const path = join(resultsDir(cwd), `${suiteSlug(report.name)}.json`);
  writeFileSync(path, `${JSON.stringify(report, null, 2)}
`);
  if (options.runId) {
    addRunArtifact(cwd, options.runId, {
      kind: "eval-report",
      path,
      title: `${report.name} — ${report.passed}/${report.total} passed`
    });
  }
  return path;
}
function loadReport(cwd, name) {
  const path = join(resultsDir(cwd), `${suiteSlug(name)}.json`);
  if (!existsSync(path))
    return null;
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  return parsed && typeof parsed === "object" ? parsed : null;
}
function defaultEvalSuite() {
  return {
    version: 1,
    name: "starter",
    description: "Starter UR eval suite covering coding, research, browser, MCP, memory, and verification. Edit the cases and expectations freely.",
    cases: [
      {
        id: "coding-add",
        category: "coding",
        prompt: "Write a TypeScript function named add that takes two numbers and returns their sum. Output only the code in a single code block.",
        expect: { contains: ["function add", "return"], notContains: ["I cannot"] }
      },
      {
        id: "research-mcp",
        category: "research",
        prompt: "In one sentence, what does the acronym MCP stand for in the agent-tooling ecosystem? Include a source URL.",
        expect: { contains: ["Model Context Protocol"], regex: ["https?://"] }
      },
      {
        id: "browser-smoke",
        category: "browser",
        prompt: "List three deterministic assertions you would check to verify a web page rendered correctly. Output a numbered list and mention console errors.",
        expect: { contains: ["console"], regex: ["1\\."] }
      },
      {
        id: "mcp-permission",
        category: "mcp",
        prompt: "In one sentence, explain how UR routes MCP tool calls through its permission system.",
        expect: { contains: ["permission"] }
      },
      {
        id: "memory-curate",
        category: "memory",
        prompt: 'State the single most durable fact worth remembering about this project in one short sentence prefixed with "FACT:".',
        expect: { regex: ["FACT:"] }
      },
      {
        id: "verify-gate",
        category: "verification",
        prompt: 'Decide whether 2 + 2 equals 4. End with exactly one line "VERDICT: PASS" if correct, otherwise "VERDICT: FAIL".',
        expect: { verdict: "PASS" }
      }
    ]
  };
}
function scaffoldEvals(cwd, options = {}) {
  const root = evalsDir(cwd);
  const result = { root, created: [], skipped: [] };
  mkdirSync(root, { recursive: true });
  const readmePath = join(root, "README.md");
  if (existsSync(readmePath) && options.force !== true) {
    result.skipped.push("evals/README.md");
  } else {
    writeFileSync(readmePath, EVALS_README);
    result.created.push("evals/README.md");
  }
  const saved = saveSuite(cwd, defaultEvalSuite(), { force: options.force });
  if (saved.created)
    result.created.push("evals/starter.json");
  else
    result.skipped.push("evals/starter.json");
  return result;
}
function formatSuiteValidation(suite, validation) {
  const lines = [
    `Eval suite: ${suite.name} (${suite.cases.length} cases)`,
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
  return lines.join(`
`);
}
function formatEvalReport(report, json) {
  if (json)
    return JSON.stringify(report, null, 2);
  const pct = Math.round(report.passRate * 100);
  const lines = [
    `Eval report: ${report.name}`,
    `Pass rate: ${report.passed}/${report.total} (${pct}%)`,
    report.testPassRate !== undefined ? `Test pass rate: ${Math.round(report.testPassRate * 100)}%` : null,
    report.totalCostUSD !== undefined ? `Cost: $${report.totalCostUSD.toFixed(6)}` : null,
    report.totalInputTokens !== undefined || report.totalOutputTokens !== undefined ? `Tokens: ${report.totalInputTokens ?? 0} in / ${report.totalOutputTokens ?? 0} out` : null,
    report.totalFilesChanged !== undefined ? `Files changed: ${report.totalFilesChanged}` : null,
    report.totalEditCount !== undefined ? `Edit count: ${report.totalEditCount}` : null,
    report.testsPassed !== undefined || report.testsFailed !== undefined ? `Tests passed: ${report.testsPassed ?? 0}/${(report.testsPassed ?? 0) + (report.testsFailed ?? 0)}` : null,
    report.totalCommandFailures !== undefined ? `Command failures: ${report.totalCommandFailures}` : null,
    report.totalHumanEditsNeeded !== undefined ? `Human edits needed: ${report.totalHumanEditsNeeded}` : null,
    report.totalHumanInterventions !== undefined ? `Human interventions: ${report.totalHumanInterventions}` : null,
    report.totalRollbacks !== undefined ? `Rollbacks: ${report.totalRollbacks}` : null,
    report.totalDurationMs > 0 ? `Duration: ${report.totalDurationMs}ms` : null,
    ""
  ].filter((line) => line !== null);
  const categories = Object.entries(report.byCategory).sort((a, b) => a[0].localeCompare(b[0]));
  if (categories.length > 0) {
    lines.push("By category:");
    for (const [category, bucket] of categories) {
      lines.push(`  ${category.padEnd(14)} ${bucket.passed}/${bucket.total}`);
    }
    lines.push("");
  }
  for (const item of report.cases) {
    const mark = item.passed ? "✓" : "✗";
    lines.push(`${mark} ${item.id} (${item.category})`);
    for (const check of item.checks) {
      if (!check.passed) {
        const detail = check.detail ? ` — ${check.detail}` : "";
        lines.push(`    ✗ ${check.name}${detail}`);
      }
    }
    if (item.isError)
      lines.push("    ✗ runner reported an error");
  }
  return lines.join(`
`);
}
var BENCHMARK_ADAPTERS, ID_RE, VERDICT_RE, EVALS_README = `# UR Eval Harness

Replayable agent evals — the terminal-native analogue of SWE-bench / Terminal-Bench.

Each suite is a JSON file with cases: a prompt plus machine-checkable
expectations (contains / notContains / regex / verdict / maxOutputChars),
grouped by category.

Commands:

- \`ur eval list\` — list suites
- \`ur eval validate <suite>\` — validate a suite file
- \`ur eval run <suite>\` — run every case through a headless \`ur -p\` and grade it
- \`ur eval run <suite> --metrics\` — persist cost, tokens, model, time, diffs, test results, command failures, and human-edit heuristics
- \`ur eval run <suite> --dry-run\` — exercise the suite offline (no model calls)
- \`ur eval run <suite> --category coding\` — run only one category
- \`ur eval report <suite>\` — re-print the last run's report
- \`ur eval compare <suite> pool codex claude\` — compare one suite across model/runner labels
- \`ur eval dashboard\` — render the local task timeline with commands, diffs, tests, model, tokens, time, and cost
- \`ur eval builtin list\` — show small public benchmark suites
- \`ur eval builtin bug-fix\` — install a built-in suite
- \`ur eval leaderboard --format md\` — render a publishable local leaderboard
- \`ur eval route "fix this auth bug"\` — show model routing for a task
- \`ur eval bench list\` — show supported benchmark adapters
- \`ur eval bench swe-bench --file local.jsonl --name local-swe\` — import a local benchmark export as a UR suite

Reports are written to \`.ur/evals/.results/\` (keep them out of Git if you prefer).
`;
var init_evals = __esm(() => {
  init_execFileNoThrow();
  init_json();
  init_runArtifacts();
  init_cliStepRunner();
  init_state();
  BENCHMARK_ADAPTERS = [
    {
      id: "swe-bench",
      name: "SWE-bench",
      description: "Converts software-engineering issue records into patch-oriented UR eval cases.",
      expectedFields: ["instance_id", "repo", "problem_statement", "FAIL_TO_PASS"]
    },
    {
      id: "terminal-bench",
      name: "Terminal-Bench",
      description: "Converts terminal task records into shell-workflow UR eval cases.",
      expectedFields: ["id", "instruction", "setup", "verification"]
    },
    {
      id: "aider-polyglot",
      name: "Aider Polyglot",
      description: "Converts multi-language coding task records into edit-and-test UR eval cases.",
      expectedFields: ["id", "language", "prompt", "tests"]
    }
  ];
  ID_RE = /^[a-z0-9][a-z0-9-_]{0,63}$/i;
  VERDICT_RE = /\bVERDICT:\s*(PASS|FAIL|PARTIAL)\b/i;
});

export { BENCHMARK_ADAPTERS, validateEvalSuite, gradeOutput, gradeTrajectory, runSuite, runSuiteCompare, formatCompareReport, runSuiteReliability, makeCliEvalRunner, makeDryEvalRunner, makeCliJudgeRunner, makeDryJudgeRunner, buildDashboardHtml, loadAllReports, loadAllReliability, saveReliabilityReport, writeDashboard, buildLeaderboard, writeRunMetrics, loadRunMetrics, formatReliabilityReport, evalsDir, suiteSlug, parseSuiteText, listSuites, loadSuite, saveSuite, buildBenchmarkSuite, importBenchmarkSuite, saveReport, loadReport, defaultEvalSuite, scaffoldEvals, formatSuiteValidation, formatEvalReport, init_evals };
