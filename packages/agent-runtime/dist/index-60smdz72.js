import {
  init_json,
  safeParseJSON
} from "./index-wxsgjqjk.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/runArtifacts.ts
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
function runArtifactsDir(cwd, runId) {
  return join(cwd, ".ur", "runs", runId);
}
function runManifestPath(cwd, runId) {
  return join(runArtifactsDir(cwd, runId), "manifest.json");
}
function runPlanPath(cwd, runId) {
  return join(runArtifactsDir(cwd, runId), "plan.json");
}
function runActionsPath(cwd, runId) {
  return join(runArtifactsDir(cwd, runId), "actions.json");
}
function runDiffPath(cwd, runId) {
  return join(runArtifactsDir(cwd, runId), "diff.patch");
}
function runTestsLogPath(cwd, runId) {
  return join(runArtifactsDir(cwd, runId), "tests.log");
}
function runReportPath(cwd, runId) {
  return join(runArtifactsDir(cwd, runId), "report.md");
}
function now() {
  return new Date().toISOString();
}
function readRunManifest(cwd, runId) {
  const path = runManifestPath(cwd, runId);
  if (!existsSync(path))
    return null;
  try {
    const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
    if (parsed && typeof parsed === "object" && parsed.version === 1 && Array.isArray(parsed.artifacts)) {
      return parsed;
    }
  } catch {}
  return null;
}
function writeRunManifest(cwd, runId, manifest) {
  const dir = runArtifactsDir(cwd, runId);
  mkdirSync(dir, { recursive: true });
  const full = {
    version: 1,
    runId,
    cwd,
    startedAt: manifest.startedAt ?? now(),
    updatedAt: manifest.updatedAt ?? now(),
    artifacts: manifest.artifacts
  };
  writeFileSync(runManifestPath(cwd, runId), `${JSON.stringify(full, null, 2)}
`);
  return full;
}
function upsertRunManifest(cwd, runId, update) {
  const existing = readRunManifest(cwd, runId);
  const base = existing ?? {
    version: 1,
    runId,
    cwd,
    startedAt: now(),
    updatedAt: now(),
    artifacts: []
  };
  const updated = update(base);
  updated.updatedAt = now();
  return writeRunManifest(cwd, runId, updated);
}
function addRunArtifact(cwd, runId, artifact) {
  return upsertRunManifest(cwd, runId, (manifest) => {
    const next = manifest.artifacts.filter((a) => a.path !== artifact.path);
    next.push({ ...artifact, at: now() });
    return { ...manifest, artifacts: next };
  });
}
function writeJsonArtifact(cwd, runId, path, value, artifact) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}
`);
  addRunArtifact(cwd, runId, artifact);
}
function writeRunPlan(cwd, runId, plan) {
  const path = runPlanPath(cwd, runId);
  writeJsonArtifact(cwd, runId, path, {
    version: 1,
    runId,
    cwd,
    createdAt: now(),
    ...plan
  }, {
    kind: "plan",
    path: "plan.json",
    title: "plan.json"
  });
  return path;
}
function readRunActions(cwd, runId) {
  const path = runActionsPath(cwd, runId);
  if (!existsSync(path))
    return [];
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  return Array.isArray(parsed) ? parsed.filter((item) => {
    if (!item || typeof item !== "object")
      return false;
    const obj = item;
    return typeof obj.at === "string" && typeof obj.kind === "string";
  }) : [];
}
function appendRunAction(cwd, runId, action) {
  const path = runActionsPath(cwd, runId);
  mkdirSync(dirname(path), { recursive: true });
  const full = {
    ...action,
    at: action.at ?? now()
  };
  const actions = [...readRunActions(cwd, runId), full];
  writeFileSync(path, `${JSON.stringify(actions, null, 2)}
`);
  addRunArtifact(cwd, runId, {
    kind: "actions",
    path: "actions.json",
    title: "actions.json"
  });
  return full;
}
function writeRunDiff(cwd, runId, diff) {
  const path = runDiffPath(cwd, runId);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, diff);
  addRunArtifact(cwd, runId, {
    kind: "diff",
    path: "diff.patch",
    title: "diff.patch"
  });
  return path;
}
function appendRunTestsLog(cwd, runId, text) {
  const path = runTestsLogPath(cwd, runId);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text.endsWith(`
`) ? text : `${text}
`, { flag: "a" });
  addRunArtifact(cwd, runId, {
    kind: "tests-log",
    path: "tests.log",
    title: "tests.log"
  });
  return path;
}
function writeRunReport(cwd, runId, markdown) {
  const path = runReportPath(cwd, runId);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, markdown.endsWith(`
`) ? markdown : `${markdown}
`);
  addRunArtifact(cwd, runId, {
    kind: "report",
    path: "report.md",
    title: "report.md"
  });
  return path;
}
function initializeResearchTrace(cwd, runId, plan = {}) {
  if (!existsSync(runPlanPath(cwd, runId))) {
    writeRunPlan(cwd, runId, plan);
  }
  if (!existsSync(runActionsPath(cwd, runId))) {
    writeJsonArtifact(cwd, runId, runActionsPath(cwd, runId), [], {
      kind: "actions",
      path: "actions.json",
      title: "actions.json"
    });
  }
  if (!existsSync(runDiffPath(cwd, runId))) {
    writeRunDiff(cwd, runId, "");
  }
  if (!existsSync(runTestsLogPath(cwd, runId))) {
    appendRunTestsLog(cwd, runId, "");
  }
  if (!existsSync(runReportPath(cwd, runId))) {
    writeRunReport(cwd, runId, [
      `# UR Run ${runId}`,
      "",
      "Status: initialized",
      "",
      "This local research trace is stored under `.ur/runs/` and is not uploaded by UR."
    ].join(`
`));
  }
  return readRunManifest(cwd, runId) ?? upsertRunManifest(cwd, runId, (manifest) => manifest);
}
function listRunIds(cwd) {
  const runsDir = join(cwd, ".ur", "runs");
  if (!existsSync(runsDir))
    return [];
  return readdirSync(runsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
}
function loadRunManifests(cwd) {
  return listRunIds(cwd).map((id) => readRunManifest(cwd, id)).filter((m) => m !== null).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}
var init_runArtifacts = __esm(() => {
  init_json();
});

export { readRunManifest, addRunArtifact, appendRunAction, writeRunDiff, appendRunTestsLog, writeRunReport, initializeResearchTrace, loadRunManifests, init_runArtifacts };
