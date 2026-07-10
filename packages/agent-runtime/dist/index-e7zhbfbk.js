import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/ur/projectDna.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
function readGitignoreDirs(cwd) {
  try {
    return readFileSync(join(cwd, ".gitignore"), "utf8").split(`
`).map((l) => l.trim()).filter((l) => l && !l.startsWith("#")).map((l) => l.replace(/^\//, "").replace(/\/$/, "")).filter((l) => l && !l.includes("*") && !l.includes(".")).slice(0, 12);
  } catch {
    return [];
  }
}
function findReadme(cwd) {
  for (const n of ["README.md", "README.rst", "README.txt", "README"])
    if (existsSync(join(cwd, n)))
      return n;
  return null;
}
function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}
function detectProjectDna(cwd) {
  const languages = new Set;
  const packageManagers = new Set;
  const buildCommands = new Set;
  const testCommands = new Set;
  const lintCommands = new Set;
  const runCommands = new Set;
  if (has(cwd, "package.json")) {
    languages.add("JavaScript/TypeScript");
    if (has(cwd, "bun.lock", "bun.lockb"))
      packageManagers.add("bun");
    if (has(cwd, "pnpm-lock.yaml"))
      packageManagers.add("pnpm");
    if (has(cwd, "yarn.lock"))
      packageManagers.add("yarn");
    if (has(cwd, "package-lock.json"))
      packageManagers.add("npm");
    if (packageManagers.size === 0)
      packageManagers.add("npm");
    const pkg = readJson(join(cwd, "package.json"));
    const scripts = pkg?.scripts ?? {};
    const pm = [...packageManagers][0] ?? "npm";
    const run = (s) => pm === "npm" ? `npm run ${s}` : `${pm} run ${s}`;
    if (scripts.build)
      buildCommands.add(run("build"));
    if (scripts.typecheck)
      buildCommands.add(run("typecheck"));
    if (scripts.test)
      testCommands.add(run("test"));
    for (const k of Object.keys(scripts))
      if (/lint|biome|eslint/.test(k))
        lintCommands.add(run(k));
    for (const k of ["start", "dev", "serve"])
      if (scripts[k])
        runCommands.add(run(k));
  }
  if (has(cwd, "pyproject.toml", "requirements.txt", "setup.py")) {
    languages.add("Python");
    if (has(cwd, "poetry.lock"))
      packageManagers.add("poetry");
    else if (has(cwd, "pyproject.toml"))
      packageManagers.add("pip/pyproject");
    else
      packageManagers.add("pip");
    testCommands.add("pytest");
    lintCommands.add("ruff check .");
  }
  if (has(cwd, "Cargo.toml")) {
    languages.add("Rust");
    packageManagers.add("cargo");
    buildCommands.add("cargo build");
    testCommands.add("cargo test");
    lintCommands.add("cargo clippy");
    runCommands.add("cargo run");
  }
  if (has(cwd, "go.mod")) {
    languages.add("Go");
    packageManagers.add("go modules");
    buildCommands.add("go build ./...");
    testCommands.add("go test ./...");
    runCommands.add("go run .");
  }
  if (has(cwd, "main.py"))
    runCommands.add("python main.py");
  if (has(cwd, "Makefile"))
    buildCommands.add("make");
  const importantFolders = ["src", "lib", "tests", "test", "app", "packages"].filter((d) => existsSync(join(cwd, d)));
  return {
    languages: [...languages],
    packageManagers: [...packageManagers],
    buildCommands: [...buildCommands],
    testCommands: [...testCommands],
    lintCommands: [...lintCommands],
    runCommands: [...runCommands],
    importantFolders,
    ignoredFolders: readGitignoreDirs(cwd),
    readme: findReadme(cwd),
    hasGit: existsSync(join(cwd, ".git"))
  };
}
function formatDna(dna) {
  const line = (label, vals) => `- ${label}: ${vals.length ? vals.join(", ") : "—"}`;
  return [
    "# Project DNA",
    line("Languages", dna.languages),
    line("Package managers", dna.packageManagers),
    line("Build", dna.buildCommands),
    line("Test", dna.testCommands),
    line("Lint", dna.lintCommands),
    line("Run", dna.runCommands),
    line("Key folders", dna.importantFolders),
    line("Ignored folders", dna.ignoredFolders),
    `- README: ${dna.readme ?? "—"}`,
    `- Git: ${dna.hasGit ? "yes" : "no"}`
  ].join(`
`);
}
function writeDna(cwd) {
  const md = formatDna(detectProjectDna(cwd));
  try {
    mkdirSync(join(cwd, ".ur"), { recursive: true });
    writeFileSync(join(cwd, ".ur", "project_dna.md"), md + `
`);
  } catch {}
  return md;
}
var has = (cwd, ...names) => names.some((n) => existsSync(join(cwd, n)));
var init_projectDna = () => {};

export { detectProjectDna, formatDna, writeDna, init_projectDna };
