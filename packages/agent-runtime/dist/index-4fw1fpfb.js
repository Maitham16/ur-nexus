import {
  init_json,
  safeParseJSON
} from "./index-s5dp14ed.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-0r3wd4mq.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/services/agents/ideDiffs.ts
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
function ideDir(cwd) {
  return join(cwd, ".ur", "ide");
}
function ideDiffsDir(cwd) {
  return join(ideDir(cwd), "diffs");
}
function patchesDir(cwd) {
  return join(ideDiffsDir(cwd), "patches");
}
function metadataDir(cwd) {
  return join(ideDiffsDir(cwd), "metadata");
}
function manifestPath(cwd) {
  return join(ideDiffsDir(cwd), "manifest.json");
}
function now() {
  return new Date().toISOString();
}
function ensureDirs(cwd) {
  mkdirSync(patchesDir(cwd), { recursive: true });
  mkdirSync(metadataDir(cwd), { recursive: true });
}
function loadManifest(cwd) {
  const path = manifestPath(cwd);
  if (!existsSync(path))
    return { version: 1, diffs: [] };
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  return parsed && typeof parsed === "object" && Array.isArray(parsed.diffs) ? parsed : { version: 1, diffs: [] };
}
function saveManifest(cwd, manifest) {
  ensureDirs(cwd);
  writeFileSync(manifestPath(cwd), `${JSON.stringify(manifest, null, 2)}
`);
}
function nextId(manifest) {
  const max = manifest.diffs.reduce((m, diff) => {
    const match = /^diff-(\d+)$/u.exec(diff.id);
    return Math.max(m, match ? Number(match[1]) : 0);
  }, 0);
  return `diff-${max + 1}`;
}
function parseHunkHeader(line) {
  const match = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/u.exec(line);
  if (!match)
    return null;
  return {
    oldStart: Number(match[1]),
    oldLines: Number(match[2] ?? "1"),
    newStart: Number(match[3]),
    newLines: Number(match[4] ?? "1")
  };
}
function parseUnifiedDiffFiles(diff) {
  const files = [];
  let current = null;
  for (const line of diff.split(`
`)) {
    if (line.startsWith("diff --git ")) {
      const match = /^diff --git a\/(.+?) b\/(.+)$/u.exec(line);
      current = {
        path: match?.[2] ?? line.replace(/^diff --git /u, ""),
        additions: 0,
        deletions: 0,
        hunks: []
      };
      files.push(current);
      continue;
    }
    if (!current)
      continue;
    const hunk = parseHunkHeader(line);
    if (hunk) {
      current.hunks.push(hunk);
      continue;
    }
    if (line.startsWith("+") && !line.startsWith("+++"))
      current.additions++;
    if (line.startsWith("-") && !line.startsWith("---"))
      current.deletions++;
  }
  return files;
}
async function gitDiff(cwd, options) {
  const args = ["diff"];
  if (options.staged)
    args.push("--cached");
  if (options.baseRef)
    args.push(`${options.baseRef}...HEAD`);
  else
    args.push("HEAD");
  const result = await execFileNoThrowWithCwd("git", args, {
    cwd,
    timeout: 60000,
    preserveOutputOnError: true
  });
  return {
    diff: result.stdout,
    command: ["git", ...args],
    error: result.code === 0 ? undefined : result.stderr || result.error
  };
}
async function createIdeDiffBundle(cwd, options = {}) {
  const manifest = loadManifest(cwd);
  const id = nextId(manifest);
  const captured = options.diff ? { diff: options.diff, command: undefined, error: undefined } : await gitDiff(cwd, options);
  if (captured.error)
    return { bundle: null, command: captured.command, error: captured.error };
  if (!captured.diff.trim())
    return { bundle: null, command: captured.command };
  ensureDirs(cwd);
  const createdAt = now();
  const patchFile = join("patches", `${id}.patch`);
  const metadataFile = join("metadata", `${id}.json`);
  const bundle = {
    id,
    title: options.title ?? "Working tree diff",
    status: "pending",
    baseRef: options.baseRef,
    staged: options.staged || undefined,
    patchFile,
    metadataFile,
    files: parseUnifiedDiffFiles(captured.diff),
    comments: [],
    createdAt,
    updatedAt: createdAt
  };
  writeFileSync(join(ideDiffsDir(cwd), patchFile), captured.diff);
  writeFileSync(join(ideDiffsDir(cwd), metadataFile), `${JSON.stringify(bundle, null, 2)}
`);
  manifest.diffs.push(bundle);
  saveManifest(cwd, manifest);
  return { bundle, command: captured.command };
}
function listIdeDiffBundles(cwd) {
  return loadManifest(cwd).diffs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
function getIdeDiffBundle(cwd, id) {
  return loadManifest(cwd).diffs.find((diff) => diff.id === id) ?? null;
}
function readIdeDiffPatch(cwd, id) {
  const bundle = getIdeDiffBundle(cwd, id);
  if (!bundle)
    return null;
  const path = join(ideDiffsDir(cwd), bundle.patchFile);
  return existsSync(path) ? readFileSync(path, "utf-8") : null;
}
function mutate(cwd, id, fn) {
  const manifest = loadManifest(cwd);
  const bundle = manifest.diffs.find((diff) => diff.id === id);
  if (!bundle)
    return null;
  fn(bundle);
  bundle.updatedAt = now();
  ensureDirs(cwd);
  writeFileSync(join(ideDiffsDir(cwd), bundle.metadataFile), `${JSON.stringify(bundle, null, 2)}
`);
  saveManifest(cwd, manifest);
  return bundle;
}
function addIdeDiffComment(cwd, id, comment) {
  return mutate(cwd, id, (bundle) => {
    bundle.status = "commented";
    bundle.comments.push({
      at: now(),
      file: comment.file,
      line: comment.line,
      text: comment.text
    });
  });
}
function setIdeDiffStatus(cwd, id, status) {
  return mutate(cwd, id, (bundle) => {
    bundle.status = status;
  });
}
function deleteIdeDiffBundle(cwd, id) {
  const manifest = loadManifest(cwd);
  const bundle = manifest.diffs.find((diff) => diff.id === id);
  if (!bundle)
    return false;
  rmSync(join(ideDiffsDir(cwd), bundle.patchFile), { force: true });
  rmSync(join(ideDiffsDir(cwd), bundle.metadataFile), { force: true });
  manifest.diffs = manifest.diffs.filter((diff) => diff.id !== id);
  saveManifest(cwd, manifest);
  return true;
}
function formatIdeDiffList(bundles, json) {
  if (json)
    return JSON.stringify({ diffs: bundles }, null, 2);
  if (bundles.length === 0)
    return "No IDE diff bundles yet. Capture one with `ur ide diff capture`.";
  return [
    "IDE inline diff bundles",
    "",
    ...bundles.map((diff) => {
      const files = `${diff.files.length} file${diff.files.length === 1 ? "" : "s"}`;
      const comments = diff.comments.length ? `, ${diff.comments.length} comment(s)` : "";
      return `- ${diff.id} [${diff.status}] ${diff.title} (${files}${comments})`;
    })
  ].join(`
`);
}
function formatIdeDiffBundle(cwd, bundle, json) {
  if (json) {
    return JSON.stringify({
      ...bundle,
      patch: readIdeDiffPatch(cwd, bundle.id)
    }, null, 2);
  }
  const lines = [
    `IDE diff ${bundle.id}`,
    `Title:  ${bundle.title}`,
    `Status: ${bundle.status}`,
    `Patch:  .ur/ide/diffs/${bundle.patchFile}`,
    `Meta:   .ur/ide/diffs/${bundle.metadataFile}`
  ];
  if (bundle.baseRef)
    lines.push(`Base:   ${bundle.baseRef}`);
  if (bundle.files.length) {
    lines.push("", "Files:");
    for (const file of bundle.files) {
      lines.push(`  - ${file.path} (+${file.additions}/-${file.deletions}, ${file.hunks.length} hunk(s))`);
    }
  }
  if (bundle.comments.length) {
    lines.push("", "Comments:");
    for (const comment of bundle.comments) {
      const where = comment.file ? `${comment.file}${comment.line ? `:${comment.line}` : ""}: ` : "";
      lines.push(`  - ${where}${comment.text}`);
    }
  }
  return lines.join(`
`);
}
function formatIdeDiffSchema() {
  return JSON.stringify({
    manifest: ".ur/ide/diffs/manifest.json",
    patchRoot: ".ur/ide/diffs/patches",
    metadataRoot: ".ur/ide/diffs/metadata",
    bundle: {
      id: "diff-1",
      title: "Working tree diff",
      status: "pending | commented | approved | rejected",
      patchFile: "patches/diff-1.patch",
      metadataFile: "metadata/diff-1.json",
      files: [{ path: "src/file.ts", additions: 1, deletions: 1, hunks: [] }],
      comments: [{ at: "ISO-8601", file: "src/file.ts", line: 12, text: "Review note" }]
    }
  }, null, 2);
}
var init_ideDiffs = __esm(() => {
  init_execFileNoThrow();
  init_json();
});

export { createIdeDiffBundle, listIdeDiffBundles, getIdeDiffBundle, readIdeDiffPatch, addIdeDiffComment, setIdeDiffStatus, deleteIdeDiffBundle, formatIdeDiffList, formatIdeDiffBundle, formatIdeDiffSchema, init_ideDiffs };
