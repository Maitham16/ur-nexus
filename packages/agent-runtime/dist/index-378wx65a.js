import {
  __esm
} from "./index-8rxa073f.js";

// src/ur/notes.ts
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
function readJsonl(file) {
  if (!existsSync(file))
    return [];
  const out = [];
  for (const line of readFileSync(file, "utf8").split(`
`).filter(Boolean)) {
    try {
      out.push(JSON.parse(line));
    } catch {}
  }
  return out;
}
function append(file, rec) {
  try {
    mkdirSync(dirname(file), { recursive: true });
    appendFileSync(file, JSON.stringify(rec) + `
`);
  } catch {}
}
function remember(cwd, text) {
  append(memFile(cwd), { ts: new Date().toISOString(), text, kind: "note" });
}
function listMemory(cwd) {
  return readJsonl(memFile(cwd));
}
function forget(cwd, needle) {
  const file = memFile(cwd);
  const all = readJsonl(file);
  const kept = all.filter((n) => !n.text.toLowerCase().includes(needle.toLowerCase()));
  const removed = all.length - kept.length;
  if (removed > 0) {
    try {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, kept.map((n) => JSON.stringify(n)).join(`
`) + (kept.length ? `
` : ""));
    } catch {}
  }
  return removed;
}
function addResearch(cwd, kind, text) {
  append(researchFile(cwd, kind), { ts: new Date().toISOString(), text, kind });
}
function listResearch(cwd, kind) {
  return readJsonl(researchFile(cwd, kind));
}
var memFile = (cwd) => join(cwd, ".ur", "memory", "notes.jsonl"), researchFile = (cwd, kind) => join(cwd, ".ur", "research", `${kind}.jsonl`);
var init_notes = () => {};

export { remember, listMemory, forget, addResearch, listResearch, init_notes };
