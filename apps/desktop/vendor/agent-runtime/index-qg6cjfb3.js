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
  init_json,
  safeParseJSON
} from "./index-wxsgjqjk.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-wred0kdg.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/artifacts.ts
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";
function artifactsDir(cwd) {
  return join(cwd, ".ur", "artifacts");
}
function manifestPath(cwd) {
  return join(artifactsDir(cwd), "manifest.json");
}
function loadManifest(cwd) {
  const path = manifestPath(cwd);
  if (!existsSync(path))
    return { version: 1, artifacts: [] };
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  return parsed && typeof parsed === "object" && Array.isArray(parsed.artifacts) ? parsed : { version: 1, artifacts: [] };
}
function saveManifest(cwd, manifest) {
  mkdirSync(artifactsDir(cwd), { recursive: true });
  writeFileSync(manifestPath(cwd), `${JSON.stringify(manifest, null, 2)}
`);
}
function nextId(manifest) {
  const max = manifest.artifacts.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0);
  return String(max + 1);
}
function slug(title) {
  return title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "artifact";
}
function recordArtifact(cwd, input) {
  const manifest = loadManifest(cwd);
  const id = nextId(manifest);
  const now = new Date().toISOString();
  let file = input.file;
  if (input.body !== undefined && !file) {
    const dir = join(artifactsDir(cwd), "files");
    mkdirSync(dir, { recursive: true });
    const rel = join("files", `${id}-${slug(input.title)}.${EXT[input.kind]}`);
    writeFileSync(join(artifactsDir(cwd), rel), input.body);
    file = rel;
  }
  const artifact = {
    id,
    kind: input.kind,
    title: input.title,
    file,
    summary: input.summary,
    status: "pending",
    feedback: [],
    links: input.links,
    createdAt: now,
    updatedAt: now
  };
  manifest.artifacts.push(artifact);
  saveManifest(cwd, manifest);
  return artifact;
}
function listArtifacts(cwd) {
  return loadManifest(cwd).artifacts;
}
function getArtifact(cwd, id) {
  return loadManifest(cwd).artifacts.find((a) => a.id === id) ?? null;
}
function readArtifactBody(cwd, id) {
  const artifact = getArtifact(cwd, id);
  if (!artifact?.file)
    return null;
  const path = join(artifactsDir(cwd), artifact.file);
  return existsSync(path) ? readFileSync(path, "utf-8") : null;
}
function mutate(cwd, id, fn) {
  const manifest = loadManifest(cwd);
  const artifact = manifest.artifacts.find((a) => a.id === id);
  if (!artifact)
    return null;
  fn(artifact);
  artifact.updatedAt = new Date().toISOString();
  saveManifest(cwd, manifest);
  return artifact;
}
function setStatus(cwd, id, status) {
  return mutate(cwd, id, (a) => {
    a.status = status;
  });
}
function addFeedback(cwd, id, text) {
  return mutate(cwd, id, (a) => {
    a.feedback.push({ at: new Date().toISOString(), text });
  });
}
function deleteArtifact(cwd, id) {
  const manifest = loadManifest(cwd);
  const artifact = manifest.artifacts.find((a) => a.id === id);
  if (!artifact)
    return false;
  if (artifact.file)
    rmSync(join(artifactsDir(cwd), artifact.file), { force: true });
  manifest.artifacts = manifest.artifacts.filter((a) => a.id !== id);
  saveManifest(cwd, manifest);
  return true;
}
async function getWorkingDiff(cwd, exec = defaultExec) {
  const diff = await exec("git", ["diff", "HEAD"], cwd);
  return diff.stdout;
}
async function captureDiff(cwd, title = "Working tree diff", exec = defaultExec) {
  const stdout = await getWorkingDiff(cwd, exec);
  if (!stdout.trim())
    return null;
  const files = (stdout.match(/^\+\+\+ /gm) ?? []).length;
  return recordArtifact(cwd, {
    kind: "diff",
    title,
    body: stdout,
    summary: `${files} file(s) changed`
  });
}
async function captureTestRun(cwd, command, exec = defaultExec) {
  const parts = (command.trim().match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) ?? []).map((p) => p.replace(/^["']|["']$/g, ""));
  const run = await exec(parts[0] ?? "", parts.slice(1), cwd);
  return recordArtifact(cwd, {
    kind: "test-run",
    title: `Test run: ${command}`,
    body: `$ ${command}

${run.stdout}
${run.stderr}`,
    summary: run.code === 0 ? "passed" : `failed (exit ${run.code})`
  });
}
function formatArtifactList(artifacts, json) {
  if (json)
    return JSON.stringify({ artifacts }, null, 2);
  if (artifacts.length === 0) {
    return "No artifacts yet. Capture one with `ur artifacts capture-diff` or `ur artifacts add ...`.";
  }
  const lines = ["Artifacts", ""];
  for (const a of artifacts) {
    lines.push(`${MARK[a.status]} ${a.id} [${a.kind}] ${a.title}${a.summary ? `  — ${a.summary}` : ""}${a.feedback.length ? `  (${a.feedback.length} note${a.feedback.length > 1 ? "s" : ""})` : ""}`);
  }
  return lines.join(`
`);
}
function formatArtifact(artifact, body, json) {
  if (json)
    return JSON.stringify(artifact, null, 2);
  const lines = [
    `Artifact ${artifact.id} [${artifact.kind}]`,
    `Title:  ${artifact.title}`,
    `Status: ${artifact.status}`
  ];
  if (artifact.summary)
    lines.push(`Summary: ${artifact.summary}`);
  if (artifact.file)
    lines.push(`File:   .ur/artifacts/${artifact.file}`);
  if (artifact.links?.claims?.length)
    lines.push(`Claims: ${artifact.links.claims.join(", ")}`);
  if (artifact.feedback.length) {
    lines.push("", "Feedback:");
    for (const f of artifact.feedback)
      lines.push(`  - ${f.text}`);
  }
  if (body) {
    lines.push("", "---", body.slice(0, 2000));
  }
  return lines.join(`
`);
}
var EXT, defaultExec = async (file, args, cwd) => {
  const r = await execFileNoThrowWithCwd(file, args, {
    cwd,
    timeout: 10 * 60 * 1000,
    preserveOutputOnError: true
  });
  return { code: r.code, stdout: r.stdout, stderr: r.stderr };
}, MARK;
var init_artifacts = __esm(() => {
  init_execFileNoThrow();
  init_json();
  EXT = {
    plan: "md",
    diff: "patch",
    "test-run": "log",
    screenshot: "txt",
    "browser-recording": "txt",
    note: "md"
  };
  MARK = { pending: "○", approved: "✓", rejected: "✗" };
});

// ../../src/services/agents/learning.ts
import { existsSync as existsSync2, mkdirSync as mkdirSync2, readFileSync as readFileSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { join as join2 } from "node:path";
function emptyStats() {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    seen: [],
    models: {},
    categories: {},
    modelByCategory: {},
    lessons: []
  };
}
function tally(record, key, pass) {
  const bucket = record[key] ??= { pass: 0, fail: 0 };
  if (pass)
    bucket.pass += 1;
  else
    bucket.fail += 1;
}
function foldOutcomes(stats, outcomes) {
  const next = {
    ...stats,
    seen: [...stats.seen],
    models: { ...stats.models },
    categories: { ...stats.categories },
    modelByCategory: { ...stats.modelByCategory },
    lessons: [...stats.lessons]
  };
  const seen = new Set(next.seen);
  for (const outcome of outcomes) {
    if (seen.has(outcome.key))
      continue;
    seen.add(outcome.key);
    next.seen.push(outcome.key);
    tally(next.categories, outcome.category, outcome.pass);
    if (outcome.model) {
      tally(next.models, outcome.model, outcome.pass);
      const perModel = next.modelByCategory[outcome.model] ??= {};
      tally(perModel, outcome.category, outcome.pass);
    }
  }
  next.updatedAt = new Date().toISOString();
  return next;
}
function mineArtifacts(artifacts) {
  const outcomes = [];
  for (const artifact of artifacts) {
    const category = categoryFromText(`${artifact.title} ${artifact.summary ?? ""}`);
    if (artifact.kind === "test-run" && artifact.summary) {
      if (TEST_PASS_RE.test(artifact.summary)) {
        outcomes.push({
          key: `artifact:${artifact.id}:${artifact.updatedAt}`,
          category,
          model: null,
          pass: true,
          detail: artifact.title
        });
      } else if (TEST_FAIL_RE.test(artifact.summary)) {
        outcomes.push({
          key: `artifact:${artifact.id}:${artifact.updatedAt}`,
          category,
          model: null,
          pass: false,
          detail: `${artifact.title} — ${artifact.summary}`
        });
      }
    }
    if ((artifact.kind === "diff" || artifact.kind === "plan") && artifact.status !== "pending") {
      outcomes.push({
        key: `artifact:${artifact.id}:${artifact.status}:${artifact.updatedAt}`,
        category,
        model: null,
        pass: artifact.status === "approved",
        detail: `${artifact.kind} ${artifact.title} ${artifact.status}`
      });
    }
  }
  return outcomes;
}
function outcomeFromRun(input) {
  return {
    key: `run:${input.id}`,
    category: categoryFromText(input.task),
    model: input.model,
    pass: input.pass,
    detail: input.detail ?? input.task.slice(0, 120)
  };
}
function categoryFromText(text) {
  return routeIntent(text).category || "general";
}
function taskDifficultyBias(stats, task) {
  return difficultyBias(stats, categoryFromText(task));
}
function bestModelForCategory(stats, category, minSamples = 3) {
  let best = null;
  for (const [model, byCat] of Object.entries(stats.modelByCategory)) {
    const t = byCat[category];
    if (!t || t.pass + t.fail < minSamples)
      continue;
    const r = t.pass / (t.pass + t.fail);
    if (!best || r > best.rate)
      best = { model, rate: r };
  }
  return best;
}
function difficultyBias(stats, category, minSamples = 3) {
  const t = stats.categories[category];
  if (!t || t.pass + t.fail < minSamples)
    return 0;
  const r = t.pass / (t.pass + t.fail);
  if (r >= 0.8)
    return 0;
  if (r >= 0.5)
    return 2;
  return 4;
}
function learningDir(cwd) {
  return join2(cwd, ".ur", "learning");
}
function statsPath(cwd) {
  return join2(learningDir(cwd), "stats.json");
}
function loadStats(cwd) {
  const path = statsPath(cwd);
  if (!existsSync2(path))
    return emptyStats();
  const parsed = safeParseJSON(readFileSync2(path, "utf-8"), false);
  if (!parsed || typeof parsed !== "object")
    return emptyStats();
  return { ...emptyStats(), ...parsed };
}
function saveStats(cwd, stats) {
  mkdirSync2(learningDir(cwd), { recursive: true });
  writeFileSync2(statsPath(cwd), `${JSON.stringify(stats, null, 2)}
`);
}
function recordOutcome(cwd, input) {
  if (/^(?:1|true|yes)$/i.test(process.env.UR_CODE_DISABLE_AUTO_LEARNING ?? "")) {
    return;
  }
  try {
    saveStats(cwd, foldOutcomes(loadStats(cwd), [outcomeFromRun(input)]));
  } catch {}
}
function learnedModelForTask(stats, task, options = {}) {
  const best = bestModelForCategory(stats, categoryFromText(task), options.minSamples ?? 3);
  if (!best)
    return null;
  return best.rate >= (options.minRate ?? 0.6) ? best.model : null;
}
async function reflectOnFailures(input) {
  if (input.failures.length === 0)
    return [];
  const runner = input.runner ?? (input.dryRun ? makeDryHeadlessRunner() : defaultHeadlessRunner());
  const max = input.maxLessons ?? 5;
  const prompt = `You are reviewing this project's recent agent failures to extract durable, ` + `reusable lessons. For each, write one imperative sentence (a rule the agent ` + `should follow next time). Output at most ${max} lines, each starting with "- ".

` + input.failures.map((f, i) => `${i + 1}. ${f}`).join(`
`);
  const out = await runner({ cwd: input.cwd, prompt, model: input.model, maxTurns: 1 });
  return out.output.split(`
`).map((line) => line.replace(/^\s*[-*]\s*/, "").trim()).filter((line) => line.length > 0 && line.length <= 200).slice(0, max);
}
async function runLearn(options) {
  const before = loadStats(options.cwd);
  const mined = [
    ...mineArtifacts(listArtifacts(options.cwd)),
    ...options.extraOutcomes ?? []
  ];
  const seen = new Set(before.seen);
  const fresh = mined.filter((outcome) => !seen.has(outcome.key));
  let stats = foldOutcomes(before, mined);
  let newLessons = [];
  if (options.reflect) {
    const failures = fresh.filter((o) => !o.pass).map((o) => o.detail);
    newLessons = await reflectOnFailures({
      cwd: options.cwd,
      failures,
      runner: options.runner,
      dryRun: options.dryRun
    });
    const existing = new Set(stats.lessons);
    stats = { ...stats, lessons: [...stats.lessons, ...newLessons.filter((l) => !existing.has(l))] };
  }
  if (!options.dryRun)
    saveStats(options.cwd, stats);
  return { stats, newOutcomes: fresh.length, newLessons };
}
function formatStats(stats, json) {
  if (json)
    return JSON.stringify(stats, null, 2);
  const fmt = (t) => {
    const total = t.pass + t.fail;
    return `${t.pass}/${total} (${total ? Math.round(t.pass / total * 100) : 0}%)`;
  };
  const lines = ["UR learned stats", `Updated: ${stats.updatedAt}`, ""];
  const cats = Object.entries(stats.categories).sort((a, b) => a[0].localeCompare(b[0]));
  if (cats.length) {
    lines.push("By category:");
    for (const [cat, t] of cats)
      lines.push(`  ${cat.padEnd(14)} ${fmt(t)}`);
    lines.push("");
  }
  const models = Object.entries(stats.models).sort((a, b) => a[0].localeCompare(b[0]));
  if (models.length) {
    lines.push("By model:");
    for (const [model, t] of models)
      lines.push(`  ${model.padEnd(28)} ${fmt(t)}`);
    lines.push("");
  }
  if (stats.lessons.length) {
    lines.push("Lessons:");
    for (const lesson of stats.lessons.slice(-10))
      lines.push(`  - ${lesson}`);
  }
  if (cats.length === 0 && models.length === 0) {
    lines.push("No outcomes yet. Capture work with `ur artifacts`, then run `ur learn`.");
  }
  return lines.join(`
`);
}
function formatLearnResult(result, json) {
  if (json) {
    return JSON.stringify({ newOutcomes: result.newOutcomes, newLessons: result.newLessons, stats: result.stats }, null, 2);
  }
  const lines = [
    `Learned from ${result.newOutcomes} new outcome(s).`
  ];
  if (result.newLessons.length) {
    lines.push("", "New lessons:");
    for (const lesson of result.newLessons)
      lines.push(`  - ${lesson}`);
  }
  lines.push("", formatStats(result.stats, false));
  return lines.join(`
`);
}
var TEST_PASS_RE, TEST_FAIL_RE;
var init_learning = __esm(() => {
  init_json();
  init_artifacts();
  init_headlessAgent();
  init_intentRouter();
  TEST_PASS_RE = /^passed$/i;
  TEST_FAIL_RE = /^failed/i;
});

export { recordArtifact, listArtifacts, getArtifact, readArtifactBody, setStatus, addFeedback, deleteArtifact, getWorkingDiff, captureDiff, captureTestRun, formatArtifactList, formatArtifact, init_artifacts, taskDifficultyBias, bestModelForCategory, loadStats, recordOutcome, learnedModelForTask, runLearn, formatStats, formatLearnResult, init_learning };
