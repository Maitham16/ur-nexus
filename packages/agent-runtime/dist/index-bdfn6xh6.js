import {
  addRunArtifact,
  appendRunAction,
  init_runArtifacts
} from "./index-60smdz72.js";
import {
  init_json,
  safeParseJSON
} from "./index-wxsgjqjk.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/commandLog.ts
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
function commandLogDir(cwd, runId) {
  return join(cwd, ".ur", "runs", runId);
}
function commandLogPath(cwd, runId) {
  return join(commandLogDir(cwd, runId), "commands.jsonl");
}
function appendCommandLog(cwd, runId, entry) {
  const full = {
    ...entry,
    stdout: entry.stdout ?? "",
    stderr: entry.stderr ?? "",
    reason: entry.reason?.trim() || "unspecified command reason",
    nextAction: entry.nextAction?.trim() || defaultNextAction(entry.exitCode),
    at: new Date().toISOString()
  };
  const path = commandLogPath(cwd, runId);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(full)}
`, { flag: "a" });
  addRunArtifact(cwd, runId, {
    kind: "command-log",
    path: commandLogPath(cwd, runId),
    title: `commands.jsonl (${entry.command.slice(0, 60)})`
  });
  appendRunAction(cwd, runId, {
    kind: "command",
    title: entry.command.slice(0, 80),
    status: full.exitCode === 0 ? "passed" : "failed",
    command: full.command,
    exitCode: full.exitCode,
    stdout: full.stdout,
    stderr: full.stderr,
    reason: full.reason,
    nextAction: full.nextAction,
    data: {
      durationMs: full.durationMs,
      toolUseId: full.toolUseId
    }
  });
  return full;
}
function readCommandLog(cwd, runId) {
  const path = commandLogPath(cwd, runId);
  try {
    const text = readFileSync(path, "utf-8");
    return text.split(`
`).filter(Boolean).map((line) => safeParseJSON(line, false)).filter((item) => {
      if (!item || typeof item !== "object")
        return false;
      const obj = item;
      return typeof obj.command === "string" && typeof obj.exitCode === "number";
    }).map((entry) => ({
      ...entry,
      stdout: entry.stdout ?? "",
      stderr: entry.stderr ?? "",
      reason: entry.reason || "unspecified command reason",
      nextAction: entry.nextAction || defaultNextAction(entry.exitCode)
    }));
  } catch {
    return [];
  }
}
function defaultNextAction(exitCode) {
  return exitCode === 0 ? "continue; command completed successfully" : "inspect failure output and decide whether to fix, retry, or rollback";
}
var init_commandLog = __esm(() => {
  init_json();
  init_runArtifacts();
});

export { commandLogDir, commandLogPath, appendCommandLog, readCommandLog, defaultNextAction, init_commandLog };
