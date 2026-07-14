import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
import {
  init_json,
  safeParseJSON
} from "./index-s5dp14ed.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-h7h0j06f.js";
import"./index-7h9ddexs.js";
import"./index-f80dj2bz.js";
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/browser-qa/browser-qa.ts
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
function fixturesDir() {
  return join(getCwd(), ".ur", "browser-qa");
}
function fixtures() {
  if (!existsSync(fixturesDir()))
    return [];
  return readdirSync(fixturesDir()).filter((file) => file.endsWith(".json")).map((file) => {
    const parsed = safeParseJSON(readFileSync(join(fixturesDir(), file), "utf-8"), false);
    return { file, fixture: parsed && typeof parsed === "object" ? parsed : null };
  });
}
function validateFixture(fixture) {
  const errors = [];
  if (!fixture)
    return ["invalid JSON fixture"];
  if (!fixture.name)
    errors.push("missing name");
  if (!fixture.target)
    errors.push("missing target");
  try {
    if (fixture.target)
      new URL(fixture.target);
  } catch {
    errors.push("target must be an absolute URL");
  }
  if (!Array.isArray(fixture.assertions) || fixture.assertions.length === 0) {
    errors.push("missing assertions");
  }
  return errors;
}
async function smoke(fixture, dryRun) {
  if (dryRun) {
    return { name: fixture.name, target: fixture.target, dryRun: true };
  }
  try {
    const response = await fetch(fixture.target, { signal: AbortSignal.timeout(5000) });
    const text = await response.text();
    return {
      name: fixture.name,
      target: fixture.target,
      ok: response.ok && text.trim().length > 0,
      status: response.status,
      bytes: text.length
    };
  } catch (error) {
    return {
      name: fixture.name,
      target: fixture.target,
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const dryRun = tokens.includes("--dry-run");
  const command = tokens.find((token) => !token.startsWith("--")) ?? "list";
  const all = fixtures();
  if (command === "list") {
    const list = all.map((item) => ({ file: item.file, name: item.fixture?.name, target: item.fixture?.target }));
    return { type: "text", value: json ? JSON.stringify({ fixtures: list }, null, 2) : JSON.stringify({ fixtures: list }, null, 2) };
  }
  if (command === "validate") {
    const results = all.map((item) => ({ file: item.file, errors: validateFixture(item.fixture) }));
    return { type: "text", value: json ? JSON.stringify({ results }, null, 2) : JSON.stringify({ results }, null, 2) };
  }
  if (command === "run") {
    const name = tokens.find((token) => !token.startsWith("--") && token !== "run");
    const selected = all.find((item) => item.file === name || item.fixture?.name === name);
    if (!selected?.fixture)
      return { type: "text", value: `Browser QA fixture not found: ${name ?? ""}` };
    const errors = validateFixture(selected.fixture);
    if (errors.length > 0)
      return { type: "text", value: `Invalid fixture: ${errors.join(", ")}` };
    const result = await smoke(selected.fixture, dryRun);
    return { type: "text", value: json ? JSON.stringify(result, null, 2) : JSON.stringify(result, null, 2) };
  }
  return { type: "text", value: "Usage: ur browser-qa list|validate|run [fixture] [--dry-run] [--json]" };
};
var init_browser_qa = __esm(() => {
  init_argumentSubstitution();
  init_cwd();
  init_json();
});
init_browser_qa();

export {
  call
};
