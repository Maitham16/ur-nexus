import {
  BENCHMARK_ADAPTERS,
  buildLeaderboard,
  evalsDir,
  formatCompareReport,
  formatEvalReport,
  formatReliabilityReport,
  formatSuiteValidation,
  importBenchmarkSuite,
  init_evals,
  listSuites,
  loadAllReports,
  loadReport,
  loadSuite,
  makeCliEvalRunner,
  makeCliJudgeRunner,
  makeDryEvalRunner,
  makeDryJudgeRunner,
  runSuite,
  runSuiteCompare,
  runSuiteReliability,
  saveReliabilityReport,
  saveReport,
  saveSuite,
  scaffoldEvals,
  suiteSlug,
  validateEvalSuite,
  writeDashboard
} from "./index-j7gbj6pk.js";
import"./index-rad7f2cp.js";
import {
  init_offlineMode,
  isNetworkRestricted
} from "./index-b85xt2xy.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
import {
  init_runArtifacts,
  loadRunManifests,
  readRunManifest
} from "./index-y4htdtvj.js";
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
import {
  getSessionId,
  init_state
} from "./index-93rq225h.js";
import {
  __esm,
  __require
} from "./index-8rxa073f.js";

// src/services/agents/benchmarkSuites.ts
import { join } from "node:path";
function listBuiltinSuiteIds() {
  return [...BUILTIN_SUITE_IDS];
}
function getBuiltinSuite(id) {
  return BUILTIN_SUITES[id];
}
function installBuiltinSuite(cwd, id, options = {}) {
  const suite = getBuiltinSuite(id);
  if (!suite) {
    return { path: join(evalsDir(cwd), `${id}.json`), created: false };
  }
  const saved = saveSuite(cwd, suite, { force: options.force });
  return { path: saved.path, created: saved.created, suite };
}
var BUILTIN_SUITE_IDS, BUILTIN_SUITES;
var init_benchmarkSuites = __esm(() => {
  init_evals();
  BUILTIN_SUITE_IDS = [
    "bug-fix",
    "refactor",
    "test-gen",
    "docker-repair",
    "ts-migrate",
    "py-package-repair"
  ];
  BUILTIN_SUITES = {
    "bug-fix": {
      version: 1,
      name: "builtin-bug-fix",
      description: "Small bug-fixing benchmark. Each case asks UR to fix a known defect in a fresh worktree and verify with a test command.",
      cases: [
        {
          id: "off-by-one",
          category: "bug-fix",
          prompt: "You are in a fresh TypeScript repo. Create src/findIndex.ts containing a function that returns the index of a target in an array. It currently returns -1 for the last element because the loop stops too early. Fix the off-by-one bug, add a test file src/findIndex.test.ts using your preferred runner, and run the tests. Finish with VERDICT: PASS if tests pass, otherwise VERDICT: FAIL.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "cd src && (ls findIndex.ts findIndex.test.ts && echo present)"
          }
        },
        {
          id: "null-guard",
          category: "bug-fix",
          prompt: "You are in a fresh JavaScript repo. Create src/greet.js with a greet(name) function. It currently crashes when name is null/undefined because it calls name.toUpperCase(). Add a null guard so it returns 'Hello, stranger' for missing input. Add a test file and run it. Finish with VERDICT: PASS if tests pass.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "cd src && (ls greet.js greet.test.js && echo present)"
          }
        },
        {
          id: "missing-await",
          category: "bug-fix",
          prompt: "You are in a fresh TypeScript repo. Create src/fetcher.ts with an async fetchData() function that forgets to await a Promise, returning the Promise object instead of the resolved value. Fix it, add a test using a mocked Promise, and run the tests. Finish with VERDICT: PASS if tests pass.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "cd src && (ls fetcher.ts fetcher.test.ts && echo present)"
          }
        }
      ]
    },
    refactor: {
      version: 1,
      name: "builtin-refactor",
      description: "Small refactoring benchmark. Each case asks UR to clean up code in a fresh worktree and keep tests green.",
      cases: [
        {
          id: "extract-function",
          category: "refactor",
          prompt: "You are in a fresh TypeScript repo. Create src/checkout.ts with a long calculateTotal(price, quantity, tax, discount) function that mixes subtotal, tax, and discount math inline. Refactor it by extracting helper functions (subtotal, taxAmount, discountAmount) while preserving behavior. Add tests and run them. Finish with VERDICT: PASS if tests pass.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "cd src && (ls checkout.ts checkout.test.ts && echo present)"
          }
        },
        {
          id: "rename-fields",
          category: "refactor",
          prompt: "You are in a fresh TypeScript repo. Create src/user.ts with an interface using abbreviated field names (fn, ln, em). Refactor to readable names (firstName, lastName, email) and update a small usage file. Add tests and run them. Finish with VERDICT: PASS if tests pass.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "cd src && (ls user.ts user.test.ts && echo present)"
          }
        },
        {
          id: "remove-duplication",
          category: "refactor",
          prompt: "You are in a fresh JavaScript repo. Create src/validators.js with three form validation functions that duplicate the same empty-check logic. Refactor to share a single isEmpty helper. Add tests and run them. Finish with VERDICT: PASS if tests pass.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "cd src && (ls validators.js validators.test.js && echo present)"
          }
        }
      ]
    },
    "test-gen": {
      version: 1,
      name: "builtin-test-gen",
      description: "Small test-generation benchmark. Each case asks UR to read existing code and add tests.",
      cases: [
        {
          id: "calc-tests",
          category: "test-gen",
          prompt: "You are in a fresh TypeScript repo. Create src/calc.ts with add(a,b), subtract(a,b), multiply(a,b), and divide(a,b). Ask UR to read the file and add tests in src/calc.test.ts that cover normal cases, division by zero, and at least one negative-number case. Run the tests. Finish with VERDICT: PASS if tests pass.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "cd src && (ls calc.ts calc.test.ts && echo present)"
          }
        },
        {
          id: "string-utils-tests",
          category: "test-gen",
          prompt: "You are in a fresh JavaScript repo. Create src/strings.js with slugify(text) and truncate(text, max). Ask UR to add tests in src/strings.test.js covering empty strings, long strings, and non-alphanumeric input. Run the tests. Finish with VERDICT: PASS if tests pass.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "cd src && (ls strings.js strings.test.js && echo present)"
          }
        },
        {
          id: "async-tests",
          category: "test-gen",
          prompt: "You are in a fresh TypeScript repo. Create src/cache.ts with an async getOrFetch(key, fetcher) cache. Ask UR to add tests in src/cache.test.ts using mocked fetchers and covering cache hits, misses, and errors. Run the tests. Finish with VERDICT: PASS if tests pass.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "cd src && (ls cache.ts cache.test.ts && echo present)"
          }
        }
      ]
    },
    "docker-repair": {
      version: 1,
      name: "builtin-docker-repair",
      description: "Small Docker repair benchmark. Each case asks UR to fix a broken Dockerfile in a fresh worktree.",
      cases: [
        {
          id: "base-image-typo",
          category: "docker-repair",
          prompt: "You are in a fresh repo with a broken Dockerfile that uses FROM node:22-sllm (typo). Fix the base image to node:22-slim, add a small src/index.js that prints 'ok', and make the image build. Run docker build -t test-repair . if Docker is available, otherwise check syntax with 'docker --version'. Finish with VERDICT: PASS if the Dockerfile is valid and index.js exists.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "cat Dockerfile | grep -q 'FROM node:22-slim' && ls src/index.js"
          }
        },
        {
          id: "missing-cmd",
          category: "docker-repair",
          prompt: "You are in a fresh repo with a Dockerfile that copies files but has no CMD or ENTRYPOINT, so the container exits immediately. Add a CMD that runs node src/server.js, create src/server.js that listens on port 3000 and responds with 'hello', and verify the files exist. Finish with VERDICT: PASS.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: 'cat Dockerfile | grep -qE "CMD|ENTRYPOINT" && ls src/server.js'
          }
        },
        {
          id: "cache-layer-order",
          category: "docker-repair",
          prompt: "You are in a fresh repo with a Dockerfile that copies package.json after copying the entire source tree, ruining Docker layer caching. Reorder the instructions so dependencies are installed before source code is copied. Create package.json with a single dependency (e.g., leftpad) and src/index.js. Finish with VERDICT: PASS if the Dockerfile copies package.json before src/.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "cat Dockerfile | awk '/COPY package\\.json/{a=NR}/COPY src\\//{b=NR} END{exit !(a && b && a < b)}' && ls package.json src/index.js"
          }
        }
      ]
    },
    "ts-migrate": {
      version: 1,
      name: "builtin-ts-migrate",
      description: "Small TypeScript migration benchmark. Each case asks UR to convert JavaScript to typed TypeScript.",
      cases: [
        {
          id: "add-types",
          category: "ts-migrate",
          prompt: "You are in a fresh repo. Create src/person.js with a function createPerson(name, age) that returns an object and a usage file. Ask UR to rename it to src/person.ts, add TypeScript interface Person { name: string; age: number }, annotate the function, and run npx tsc --noEmit (or a local tsc if available). Finish with VERDICT: PASS if no type errors are reported.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "ls src/person.ts"
          }
        },
        {
          id: "null-types",
          category: "ts-migrate",
          prompt: "You are in a fresh repo. Create src/config.js with getConfig(key) that may return undefined. Ask UR to migrate it to src/config.ts, add strict null checks via type annotations, and create a usage file that handles undefined. Run type check. Finish with VERDICT: PASS if types are sound.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "ls src/config.ts"
          }
        },
        {
          id: "module-types",
          category: "ts-migrate",
          prompt: "You are in a fresh repo. Create src/math.js with CommonJS exports (module.exports = { add, subtract }). Ask UR to migrate to src/math.ts using ESM exports, add TypeScript types, create src/math.test.ts, and run tests. Finish with VERDICT: PASS if tests pass.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "ls src/math.ts"
          }
        }
      ]
    },
    "py-package-repair": {
      version: 1,
      name: "builtin-py-package-repair",
      description: "Small Python package repair benchmark. Each case asks UR to fix packaging metadata in a fresh worktree.",
      cases: [
        {
          id: "missing-dep",
          category: "py-package-repair",
          prompt: "You are in a fresh Python repo with a setup.py that installs a package but forgets install_requires=['requests']. Create src/mypkg/__init__.py that imports requests. Ask UR to fix setup.py, install the package in editable mode (or write the fix), and verify the import would work. Finish with VERDICT: PASS if setup.py references requests.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "grep -q 'requests' setup.py"
          }
        },
        {
          id: "missing-pyproject",
          category: "py-package-repair",
          prompt: "You are in a fresh Python repo with only setup.py and no pyproject.toml. Ask UR to add a minimal pyproject.toml with build-system requires, project name, and version. Finish with VERDICT: PASS if pyproject.toml exists with [project] section.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "grep -q '\\[project\\]' pyproject.toml"
          }
        },
        {
          id: "entrypoint",
          category: "py-package-repair",
          prompt: "You are in a fresh Python repo with a CLI script src/mypkg/cli.py but no console_scripts entry point. Ask UR to fix setup.py or pyproject.toml so it exposes a 'mypkg' command, and create a minimal package structure. Finish with VERDICT: PASS if an entry point references mypkg.cli:main or similar.",
          expect: {
            contains: ["VERDICT:"],
            testCommand: "grep -qE 'console_scripts|mypkg.cli' setup.py pyproject.toml 2>/dev/null"
          }
        }
      ]
    }
  };
});

// src/commands/eval/eval.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join as join2 } from "node:path";
function optionValue(tokens, flag) {
  const index = tokens.indexOf(flag);
  return index >= 0 ? tokens[index + 1] : undefined;
}
function notFound(name) {
  const available = listSuites(getCwd());
  const hint = available.length > 0 ? `
Available: ${available.join(", ")}` : "";
  return {
    type: "text",
    value: `Eval suite not found: ${name}${hint}
Create the starter suite: ur eval init`
  };
}
function isBenchmarkAdapter(value) {
  return BENCHMARK_ADAPTERS.some((adapter) => adapter.id === value);
}
function formatBenchmarkAdapters(json) {
  if (json)
    return JSON.stringify({ adapters: BENCHMARK_ADAPTERS }, null, 2);
  return [
    "Benchmark adapters",
    "",
    ...BENCHMARK_ADAPTERS.map((adapter) => `- ${adapter.id}: ${adapter.description}
  fields: ${adapter.expectedFields.join(", ")}`)
  ].join(`
`);
}
function stripFlagValues(tokens) {
  const result = [];
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (EVAL_FLAGS_WITH_VALUES.has(token)) {
      i++;
      continue;
    }
    result.push(token);
  }
  return result;
}
var EVAL_FLAGS_WITH_VALUES, call = async (args) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const force = tokens.includes("--force");
  const positional = stripFlagValues(tokens).filter((token) => !token.startsWith("--"));
  const command = positional[0] ?? "list";
  const name = positional[1];
  if (command === "init") {
    const result = scaffoldEvals(cwd, { force });
    const created = result.created.length > 0 ? `created: ${result.created.join(", ")}` : "";
    const kept = result.skipped.length > 0 ? `kept existing: ${result.skipped.join(", ")}` : "";
    return {
      type: "text",
      value: [`Eval suites ready at ${result.root}`, created, kept].filter(Boolean).join(`
`)
    };
  }
  if (command === "list") {
    const names = listSuites(cwd);
    if (json)
      return { type: "text", value: JSON.stringify({ suites: names }, null, 2) };
    if (names.length === 0) {
      return { type: "text", value: "No eval suites yet. Create one: ur eval init" };
    }
    return { type: "text", value: `Eval suites:
${names.map((n) => `  - ${n}`).join(`
`)}` };
  }
  if (command === "dashboard") {
    const path = writeDashboard(cwd);
    return {
      type: "text",
      value: `Wrote eval dashboard to ${path}
Open it in a browser (local-first, no network).`
    };
  }
  if (command === "builtin" || command === "benchmarks") {
    if (!name || name === "list") {
      const ids = listBuiltinSuiteIds();
      if (json)
        return { type: "text", value: JSON.stringify({ suites: ids }, null, 2) };
      return {
        type: "text",
        value: `Built-in benchmark suites:
${ids.map((id) => `  - ${id}`).join(`
`)}`
      };
    }
    const suite2 = getBuiltinSuite(name);
    if (!suite2) {
      return {
        type: "text",
        value: `Unknown builtin suite: ${name}
Available: ${listBuiltinSuiteIds().join(", ")}`
      };
    }
    const { path, created } = installBuiltinSuite(cwd, name, { force });
    return {
      type: "text",
      value: `${created ? "Installed" : "Already exists"} builtin suite ${name} at ${path}
Run: ur eval run ${suite2.name}`
    };
  }
  if (command === "leaderboard") {
    const format = optionValue(tokens, "--format") ?? "html";
    const reports = name ? [loadReport(cwd, name)].filter((r) => r !== null) : loadAllReports(cwd);
    if (reports.length === 0) {
      return {
        type: "text",
        value: name ? `No saved report for ${name}. Run it first: ur eval run ${name}` : "No saved reports yet. Run an eval first."
      };
    }
    const outPath = buildLeaderboard(cwd, reports, { format, runId: getSessionId() });
    return { type: "text", value: `Wrote leaderboard to ${outPath}` };
  }
  if (command === "report") {
    const report = loadReport(cwd, name);
    if (!report) {
      return {
        type: "text",
        value: `No saved report for ${name}. Run it first: ur eval run ${name}`
      };
    }
    if (tokens.includes("--dashboard")) {
      const { buildDashboardHtml } = await import("./evals-038y8wrx.js");
      const html = buildDashboardHtml([report], []);
      const dir = join2(evalsDir(cwd), ".dashboards");
      mkdirSync(dir, { recursive: true });
      const path = join2(dir, `${suiteSlug(report.name)}.html`);
      writeFileSync(path, html);
      return { type: "text", value: `Wrote single-suite dashboard to ${path}` };
    }
    return { type: "text", value: formatEvalReport(report, json) };
  }
  if (command === "bench" || command === "benchmark") {
    if (!name || name === "list") {
      return { type: "text", value: formatBenchmarkAdapters(json) };
    }
    if (!isBenchmarkAdapter(name)) {
      return {
        type: "text",
        value: `Unknown benchmark adapter: ${name}
Available: ${BENCHMARK_ADAPTERS.map((adapter) => adapter.id).join(", ")}`
      };
    }
    const file = optionValue(tokens, "--file");
    if (!file) {
      return {
        type: "text",
        value: `Provide --file <local JSON or JSONL export> for ${name}.`
      };
    }
    const limitRaw = Number(optionValue(tokens, "--limit") ?? "0");
    const suiteName = optionValue(tokens, "--name") ?? name;
    try {
      const result = importBenchmarkSuite(cwd, name, file, {
        name: suiteName,
        limit: Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : undefined,
        force
      });
      if (json)
        return { type: "text", value: JSON.stringify(result, null, 2) };
      return {
        type: "text",
        value: `${BENCHMARK_ADAPTERS.find((adapter) => adapter.id === name)?.name ?? name} suite ready: ${result.suite.name}
records read: ${result.records}
cases written: ${result.suite.cases.length}
path: ${result.path}
Run it locally: ur eval run ${result.suite.name}`
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { type: "text", value: `Failed to import benchmark suite: ${message}` };
    }
  }
  if (!name) {
    return { type: "text", value: `Usage: ur eval ${command} <suite>` };
  }
  const suite = loadSuite(cwd, name);
  if (command === "validate") {
    if (!suite)
      return notFound(name);
    const validation = validateEvalSuite(suite);
    if (json)
      return { type: "text", value: JSON.stringify(validation, null, 2) };
    return { type: "text", value: formatSuiteValidation(suite, validation) };
  }
  if (command === "report") {
    const report = loadReport(cwd, name);
    if (!report) {
      return {
        type: "text",
        value: `No saved report for ${name}. Run it first: ur eval run ${name}`
      };
    }
    return { type: "text", value: formatEvalReport(report, json) };
  }
  if (command === "run") {
    if (!suite)
      return notFound(name);
    const validation = validateEvalSuite(suite);
    if (!validation.valid) {
      return { type: "text", value: formatSuiteValidation(suite, validation) };
    }
    const dryRun = tokens.includes("--dry-run");
    const skipPermissions = tokens.includes("--skip-permissions") || tokens.includes("--dangerously-skip-permissions");
    const category = optionValue(tokens, "--category");
    const maxTurnsValue = Number(optionValue(tokens, "--max-turns") ?? "20");
    const maxTurns = Number.isFinite(maxTurnsValue) && maxTurnsValue > 0 ? maxTurnsValue : 20;
    const model = optionValue(tokens, "--model");
    const offline = tokens.includes("--offline") || isNetworkRestricted();
    const runner = dryRun ? makeDryEvalRunner() : makeCliEvalRunner({ cwd, maxTurns, skipPermissions, model });
    if (offline && !dryRun) {
      process.env.UR_OFFLINE = "1";
    }
    const judge = dryRun ? makeDryJudgeRunner() : makeCliJudgeRunner({ cwd, maxTurns, skipPermissions });
    const repeatRaw = Number(optionValue(tokens, "--repeat") ?? "1");
    const repeat = Number.isFinite(repeatRaw) && repeatRaw > 1 ? Math.floor(repeatRaw) : 1;
    if (repeat > 1) {
      const reliability = await runSuiteReliability(suite, runner, {
        category,
        judge,
        trials: repeat
      });
      if (!dryRun)
        saveReliabilityReport(cwd, reliability);
      return { type: "text", value: formatReliabilityReport(reliability, json) };
    }
    const writeMetrics = tokens.includes("--metrics");
    const runId = getSessionId();
    process.env.UR_RUN_ID = runId;
    const report = await runSuite(suite, runner, { category, judge });
    if (!dryRun)
      saveReport(cwd, report, { runId });
    if (writeMetrics) {
      const { writeRunMetrics } = await import("./evals-038y8wrx.js");
      for (const item of report.cases) {
        if (item.metrics)
          writeRunMetrics(cwd, suite.name, item.id, item.metrics);
      }
    }
    if (json)
      return { type: "text", value: formatEvalReport(report, true) };
    const header = dryRun ? `(dry run — no model calls; grading exercised offline)

` : "";
    return { type: "text", value: `${header}${formatEvalReport(report, false)}` };
  }
  if (command === "route") {
    const task = positional.slice(1).join(" ") || name || "";
    if (!task) {
      return {
        type: "text",
        value: 'Usage: ur eval route "<task>" [--strategy auto|cheap|strong|default] [--json]'
      };
    }
    const { listModelCapabilities } = await import("./model-doctor-s60k13dc.js");
    const { resolveModelForTask } = await import("./modelRouter-y8g3v184.js");
    const { loadModelPool } = await import("./modelPool-tnjtn1fv.js");
    const strategy = optionValue(tokens, "--strategy") ?? "auto";
    const { models } = await listModelCapabilities();
    const pool = loadModelPool(cwd);
    const resolved = resolveModelForTask(task, strategy, pool, models, { cwd });
    const result = {
      task,
      strategy,
      resolved: resolved ?? null,
      pool: { cheap: pool.cheap, strong: pool.strong, default: pool.default }
    };
    return {
      type: "text",
      value: json ? JSON.stringify(result, null, 2) : `Task: ${task}
Strategy: ${strategy}
Resolved model: ${resolved ?? "none"}`
    };
  }
  if (command === "compare") {
    const suiteName = positional[1];
    const labelNames = positional.slice(2);
    if (!suite || labelNames.length < 2) {
      return {
        type: "text",
        value: `Usage: ur eval compare <suite> <label1> <label2> [...]
Labels are model/runner names (e.g., pool codex claude). Each label sets UR_MODEL for its run.`
      };
    }
    const dryRun = tokens.includes("--dry-run");
    const skipPermissions = tokens.includes("--skip-permissions") || tokens.includes("--dangerously-skip-permissions");
    const maxTurnsValue = Number(optionValue(tokens, "--max-turns") ?? "20");
    const maxTurns = Number.isFinite(maxTurnsValue) && maxTurnsValue > 0 ? maxTurnsValue : 20;
    const offline = tokens.includes("--offline") || isNetworkRestricted();
    const baseJudge = dryRun ? makeDryJudgeRunner() : makeCliJudgeRunner({ cwd, maxTurns, skipPermissions });
    const labels = labelNames.map((name2) => ({
      name: name2,
      model: name2,
      runnerFactory: () => {
        const base = dryRun ? makeDryEvalRunner() : makeCliEvalRunner({ cwd, maxTurns, skipPermissions, model: name2 });
        return async (evalCase) => {
          const oldModel = process.env.UR_MODEL;
          const oldOffline = process.env.UR_OFFLINE;
          process.env.UR_MODEL = name2;
          if (offline)
            process.env.UR_OFFLINE = "1";
          try {
            return await base(evalCase);
          } finally {
            process.env.UR_MODEL = oldModel;
            process.env.UR_OFFLINE = oldOffline;
          }
        };
      }
    }));
    const runId = getSessionId();
    process.env.UR_RUN_ID = runId;
    const report = await runSuiteCompare(suite, labels, { judge: baseJudge });
    return { type: "text", value: formatCompareReport(report, json) };
  }
  if (command === "runs" || command === "run-artifacts") {
    const runId = name;
    if (!runId) {
      const manifests = loadRunManifests(cwd);
      if (json)
        return { type: "text", value: JSON.stringify({ runs: manifests.map((m) => m.runId) }, null, 2) };
      if (manifests.length === 0)
        return { type: "text", value: "No run artifacts yet." };
      return {
        type: "text",
        value: manifests.map((m) => `- ${m.runId} (${m.artifacts.length} artifacts) — ${m.startedAt}`).join(`
`)
      };
    }
    const manifest = readRunManifest(cwd, runId);
    if (!manifest)
      return { type: "text", value: `No run manifest for ${runId}.` };
    if (json)
      return { type: "text", value: JSON.stringify(manifest, null, 2) };
    const lines = [
      `Run: ${manifest.runId}`,
      `Started: ${manifest.startedAt}`,
      `Artifacts: ${manifest.artifacts.length}`,
      "",
      ...manifest.artifacts.map((a) => `- ${a.kind}: ${a.path}${a.title ? ` — ${a.title}` : ""}`)
    ];
    return { type: "text", value: lines.join(`
`) };
  }
  return { type: "text", value: `Unknown eval command: ${command}` };
};
var init_eval = __esm(() => {
  init_evals();
  init_benchmarkSuites();
  init_argumentSubstitution();
  init_cwd();
  init_offlineMode();
  init_state();
  init_runArtifacts();
  EVAL_FLAGS_WITH_VALUES = new Set([
    "--file",
    "--name",
    "--limit",
    "--category",
    "--max-turns",
    "--model",
    "--repeat",
    "--strategy",
    "--format"
  ]);
});
init_eval();

export {
  call
};
