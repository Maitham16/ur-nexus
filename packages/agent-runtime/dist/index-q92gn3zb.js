import {
  appendProjectMemory,
  init_projectContextManifest,
  readProjectMemoryByKind
} from "./index-hny2avst.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/utils/generatedFiles.ts
import { basename, extname, posix, sep } from "path";
function isGeneratedFile(filePath) {
  const normalizedPath = posix.sep + filePath.split(sep).join(posix.sep).replace(/^\/+/, "");
  const fileName = basename(filePath).toLowerCase();
  const ext = extname(filePath).toLowerCase();
  if (EXCLUDED_FILENAMES.has(fileName)) {
    return true;
  }
  if (EXCLUDED_EXTENSIONS.has(ext)) {
    return true;
  }
  const parts = fileName.split(".");
  if (parts.length > 2) {
    const compoundExt = "." + parts.slice(-2).join(".");
    if (EXCLUDED_EXTENSIONS.has(compoundExt)) {
      return true;
    }
  }
  for (const dir of EXCLUDED_DIRECTORIES) {
    if (normalizedPath.includes(dir)) {
      return true;
    }
  }
  for (const pattern of EXCLUDED_FILENAME_PATTERNS) {
    if (pattern.test(fileName)) {
      return true;
    }
  }
  return false;
}
var EXCLUDED_FILENAMES, EXCLUDED_EXTENSIONS, EXCLUDED_DIRECTORIES, EXCLUDED_FILENAME_PATTERNS;
var init_generatedFiles = __esm(() => {
  EXCLUDED_FILENAMES = new Set([
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "bun.lockb",
    "bun.lock",
    "composer.lock",
    "gemfile.lock",
    "cargo.lock",
    "poetry.lock",
    "pipfile.lock",
    "shrinkwrap.json",
    "npm-shrinkwrap.json"
  ]);
  EXCLUDED_EXTENSIONS = new Set([
    ".lock",
    ".min.js",
    ".min.css",
    ".min.html",
    ".bundle.js",
    ".bundle.css",
    ".generated.ts",
    ".generated.js",
    ".d.ts"
  ]);
  EXCLUDED_DIRECTORIES = [
    "/dist/",
    "/build/",
    "/out/",
    "/output/",
    "/node_modules/",
    "/vendor/",
    "/vendored/",
    "/third_party/",
    "/third-party/",
    "/external/",
    "/.next/",
    "/.nuxt/",
    "/.svelte-kit/",
    "/coverage/",
    "/__pycache__/",
    "/.tox/",
    "/venv/",
    "/.venv/",
    "/target/release/",
    "/target/debug/"
  ];
  EXCLUDED_FILENAME_PATTERNS = [
    /^.*\.min\.[a-z]+$/i,
    /^.*-min\.[a-z]+$/i,
    /^.*\.bundle\.[a-z]+$/i,
    /^.*\.generated\.[a-z]+$/i,
    /^.*\.gen\.[a-z]+$/i,
    /^.*\.auto\.[a-z]+$/i,
    /^.*_generated\.[a-z]+$/i,
    /^.*_gen\.[a-z]+$/i,
    /^.*\.pb\.(go|js|ts|py|rb)$/i,
    /^.*_pb2?\.py$/i,
    /^.*\.pb\.h$/i,
    /^.*\.grpc\.[a-z]+$/i,
    /^.*\.swagger\.[a-z]+$/i,
    /^.*\.openapi\.[a-z]+$/i
  ];
});

// src/services/agents/failureMemory.ts
function recordFailure(cwd, record) {
  const text = [
    `Failed command: ${record.failedCommand}`,
    `Error: ${record.errorTrace.slice(0, 2000)}`,
    record.attemptedFix ? `Attempted fix: ${record.attemptedFix}` : undefined,
    record.finalResolution ? `Resolution: ${record.finalResolution}` : undefined
  ].filter(Boolean).join(`
`);
  return appendProjectMemory(cwd, "attempt", text, {
    status: record.finalResolution ? "accepted" : "rejected",
    source: "failure-memory"
  });
}
function recordResolution(cwd, failedCommand, resolution) {
  const text = [
    `Failed command: ${failedCommand}`,
    "Error: see previous failure memory for the original trace",
    `Resolution: ${resolution}`
  ].join(`
`);
  return appendProjectMemory(cwd, "attempt", text, {
    status: "accepted",
    source: "failure-memory"
  });
}
function findSimilarFailures(cwd, command, error) {
  const attempts = readProjectMemoryByKind(cwd, ["attempt"]);
  const records = [];
  for (const entry of attempts) {
    const cmdMatch = entry.text.includes(`Failed command: ${command}`);
    const errMatch = error && entry.text.includes(error.slice(0, 200));
    if (cmdMatch || errMatch) {
      const lines = entry.text.split(`
`);
      const failedCommand = lines.find((l) => l.startsWith("Failed command: "))?.slice("Failed command: ".length) ?? "";
      const errorTrace = lines.find((l) => l.startsWith("Error: "))?.slice("Error: ".length) ?? "";
      const attemptedFix = lines.find((l) => l.startsWith("Attempted fix: "))?.slice("Attempted fix: ".length);
      const finalResolution = lines.find((l) => l.startsWith("Resolution: "))?.slice("Resolution: ".length);
      records.push({ failedCommand, errorTrace, attemptedFix, finalResolution, at: entry.at });
    }
  }
  return records.slice(-5);
}
function formatFailureHints(records) {
  if (records.length === 0)
    return "";
  const lines = ["", "## Previous similar failures", ""];
  for (const record of records) {
    lines.push(`- **${record.failedCommand}** (${record.at})`);
    if (record.attemptedFix)
      lines.push(`  - attempted fix: ${record.attemptedFix}`);
    if (record.finalResolution)
      lines.push(`  - resolution: ${record.finalResolution}`);
  }
  return lines.join(`
`);
}
var init_failureMemory = __esm(() => {
  init_projectContextManifest();
});

export { isGeneratedFile, init_generatedFiles, recordFailure, recordResolution, findSimilarFailures, formatFailureHints, init_failureMemory };
