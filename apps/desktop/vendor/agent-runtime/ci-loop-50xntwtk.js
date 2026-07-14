import {
  formatCiLoopResult,
  init_ciLoop,
  runCiLoop
} from "./index-qvav8zws.js";
import {
  init_execTarget,
  isContainerized,
  resolveExecTarget
} from "./index-39h57bv7.js";
import"./index-azhaz9ta.js";
import"./index-qg6cjfb3.js";
import"./index-5jrgxedg.js";
import"./index-hp4vvv8v.js";
import"./index-zn5x3nwj.js";
import"./index-6ykfn1n2.js";
import"./index-e7z6rkgj.js";
import"./index-e7zhbfbk.js";
import"./index-gkqe0rrq.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import"./index-60smdz72.js";
import"./index-wxsgjqjk.js";
import"./index-wred0kdg.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-m9qhxms7.js";
import"./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/ci-loop/ci-loop.ts
import { existsSync, readFileSync } from "node:fs";
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const command = option(tokens, "--command") ?? "bun test";
  const maxAttemptsRaw = option(tokens, "--max-attempts");
  const maxTurnsRaw = option(tokens, "--max-turns");
  const fromLog = option(tokens, "--from-log");
  const allowGenerated = tokens.includes("--allow-generated");
  const allowDeletion = tokens.includes("--allow-delete") || tokens.includes("--allow-deletion");
  let seedError;
  if (fromLog) {
    if (!existsSync(fromLog)) {
      return { type: "text", value: `Log file not found: ${fromLog}` };
    }
    seedError = readFileSync(fromLog, "utf-8");
  }
  const cwd = getCwd();
  const target = resolveExecTarget(cwd);
  const result = await runCiLoop({
    cwd,
    command,
    maxAttempts: maxAttemptsRaw ? Number(maxAttemptsRaw) : undefined,
    commit: tokens.includes("--commit") || tokens.includes("--push"),
    push: tokens.includes("--push"),
    dryRun: tokens.includes("--dry-run"),
    skipPermissions: tokens.includes("--skip-permissions"),
    maxTurns: maxTurnsRaw ? Number(maxTurnsRaw) : undefined,
    seedError,
    execTarget: isContainerized(target) ? target : undefined,
    allowGenerated,
    requireApprovalForDeletion: !allowDeletion
  });
  return { type: "text", value: formatCiLoopResult(result, json) };
};
var init_ci_loop = __esm(() => {
  init_ciLoop();
  init_execTarget();
  init_argumentSubstitution();
  init_cwd();
});
init_ci_loop();

export {
  call
};
