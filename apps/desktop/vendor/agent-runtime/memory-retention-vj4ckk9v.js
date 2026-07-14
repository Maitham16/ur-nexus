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

// src/services/agents/memoryRetention.ts
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from "node:fs";
import { dirname, join } from "node:path";
function memoryDir(cwd) {
  return join(cwd, ".ur", "memory");
}
function policyPath(cwd) {
  return join(memoryDir(cwd), "retention.json");
}
function defaultMemoryRetentionPolicy() {
  return { version: 1, maxEntries: 1000, updatedAt: new Date().toISOString() };
}
function loadMemoryRetentionPolicy(cwd) {
  const path = policyPath(cwd);
  if (!existsSync(path))
    return defaultMemoryRetentionPolicy();
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  if (!parsed || typeof parsed !== "object")
    return defaultMemoryRetentionPolicy();
  const p = parsed;
  return {
    version: 1,
    ttlDays: validPositive(p.ttlDays),
    maxEntries: validPositive(p.maxEntries),
    decayDays: validPositive(p.decayDays),
    updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : new Date().toISOString()
  };
}
function saveMemoryRetentionPolicy(cwd, patch) {
  const current = loadMemoryRetentionPolicy(cwd);
  const next = {
    version: 1,
    ttlDays: patch.ttlDays === undefined ? current.ttlDays : validPositive(patch.ttlDays),
    maxEntries: patch.maxEntries === undefined ? current.maxEntries : validPositive(patch.maxEntries),
    decayDays: patch.decayDays === undefined ? current.decayDays : validPositive(patch.decayDays),
    updatedAt: new Date().toISOString()
  };
  mkdirSync(dirname(policyPath(cwd)), { recursive: true });
  writeFileSync(policyPath(cwd), `${JSON.stringify(next, null, 2)}
`);
  return next;
}
function validPositive(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
}
function timestamp(record) {
  const raw = record.ts ?? record.createdAt ?? record.at ?? record.updatedAt;
  if (typeof raw !== "string")
    return 0;
  const time = Date.parse(raw);
  return Number.isFinite(time) ? time : 0;
}
function readJsonl(file) {
  if (!existsSync(file))
    return [];
  const records = [];
  for (const line of readFileSync(file, "utf-8").split(`
`)) {
    if (!line.trim())
      continue;
    const parsed = safeParseJSON(line, false);
    if (parsed && typeof parsed === "object")
      records.push(parsed);
  }
  return records;
}
function writeJsonl(file, records) {
  writeFileSync(file, records.map((r) => JSON.stringify(r)).join(`
`) + (records.length ? `
` : ""));
}
function retentionScore(record, policy, nowMs) {
  const ts = timestamp(record);
  if (!policy.decayDays || ts <= 0)
    return ts;
  const ageDays = Math.max(0, (nowMs - ts) / 86400000);
  const decay = Math.exp(-ageDays / policy.decayDays);
  return ts * decay;
}
function applyPolicy(records, policy, nowMs) {
  let kept = records;
  if (policy.ttlDays) {
    const minTime = nowMs - policy.ttlDays * 86400000;
    kept = kept.filter((record) => {
      const ts = timestamp(record);
      return ts <= 0 || ts >= minTime;
    });
  }
  if (policy.maxEntries && kept.length > policy.maxEntries) {
    kept = [...kept].sort((a, b) => retentionScore(b, policy, nowMs) - retentionScore(a, policy, nowMs)).slice(0, policy.maxEntries).sort((a, b) => timestamp(a) - timestamp(b));
  }
  return kept;
}
function memoryJsonlFiles(cwd) {
  const dir = memoryDir(cwd);
  if (!existsSync(dir))
    return [];
  return readdirSync(dir).filter((name) => name.endsWith(".jsonl")).map((name) => join(dir, name));
}
function pruneMemoryRetention(cwd, policy = loadMemoryRetentionPolicy(cwd), nowMs = Date.now()) {
  const files = memoryJsonlFiles(cwd).map((file) => {
    const beforeRecords = readJsonl(file);
    const afterRecords = applyPolicy(beforeRecords, policy, nowMs);
    if (afterRecords.length !== beforeRecords.length)
      writeJsonl(file, afterRecords);
    return {
      file,
      before: beforeRecords.length,
      after: afterRecords.length,
      removed: beforeRecords.length - afterRecords.length
    };
  });
  return { policy, files };
}
function formatMemoryRetention(result, json) {
  if (json)
    return JSON.stringify(result, null, 2);
  const p = result.policy;
  const lines = [
    "Memory retention",
    `ttlDays: ${p.ttlDays ?? "unset"}`,
    `maxEntries: ${p.maxEntries ?? "unset"}`,
    `decayDays: ${p.decayDays ?? "unset"}`
  ];
  if (result.files.length) {
    lines.push("", "Files:");
    for (const f of result.files) {
      lines.push(`- ${f.file}: ${f.before} -> ${f.after} (${f.removed} removed)`);
    }
  }
  return lines.join(`
`);
}
var init_memoryRetention = __esm(() => {
  init_json();
});

// src/commands/memory-retention/memory-retention.ts
function option(tokens, name) {
  const index = tokens.indexOf(name);
  if (index === -1)
    return;
  const n = Number(tokens[index + 1]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
}
function positional(tokens) {
  return tokens.find((t) => !t.startsWith("--") && !/^\d+$/.test(t)) ?? "show";
}
function usage() {
  return [
    "Usage:",
    "  ur memory retention show [--json]",
    "  ur memory retention set [--ttl-days N] [--max-entries N] [--decay-days N] [--json]",
    "  ur memory retention prune [--json]",
    "Slash command: /memory-retention show|set|prune ..."
  ].join(`
`);
}
var call = async (args) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const action = positional(tokens);
  if (action === "show" || action === "status") {
    return {
      type: "text",
      value: formatMemoryRetention({ policy: loadMemoryRetentionPolicy(cwd), files: [] }, json)
    };
  }
  if (action === "set") {
    const policy = saveMemoryRetentionPolicy(cwd, {
      ttlDays: option(tokens, "--ttl-days"),
      maxEntries: option(tokens, "--max-entries"),
      decayDays: option(tokens, "--decay-days")
    });
    return {
      type: "text",
      value: formatMemoryRetention({ policy, files: [] }, json)
    };
  }
  if (action === "prune" || action === "apply") {
    return {
      type: "text",
      value: formatMemoryRetention(pruneMemoryRetention(cwd), json)
    };
  }
  return { type: "text", value: usage() };
};
var init_memory_retention = __esm(() => {
  init_argumentSubstitution();
  init_cwd();
  init_memoryRetention();
});
init_memory_retention();

export {
  call
};
