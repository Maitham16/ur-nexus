import {
  formatCiLoopResult,
  init_ciLoop,
  runCiLoop
} from "./index-1hzedb7a.js";
import {
  init_execTarget,
  isContainerized,
  resolveExecTarget
} from "./index-tq3vvaz3.js";
import"./index-21badqzm.js";
import"./index-df0wfzdw.js";
import"./index-hakw7em9.js";
import"./index-c6n1hema.js";
import"./index-rad7f2cp.js";
import"./index-q92gn3zb.js";
import"./index-hny2avst.js";
import"./index-0b2n9cdp.js";
import"./index-t4d29e3d.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
import"./index-y4htdtvj.js";
import"./index-s5dp14ed.js";
import"./index-0r3wd4mq.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-h7h0j06f.js";
import"./index-7h9ddexs.js";
import"./index-f80dj2bz.js";
import"./index-vpczjthp.js";
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/ci-loop/ci-loop.ts
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
