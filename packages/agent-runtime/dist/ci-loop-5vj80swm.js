import {
  formatCiLoopResult,
  init_ciLoop,
  runCiLoop
} from "./index-6wp4kbqm.js";
import {
  init_execTarget,
  isContainerized,
  resolveExecTarget
} from "./index-8fkth0c7.js";
import"./index-azhaz9ta.js";
import"./index-801scn8g.js";
import"./index-5jrgxedg.js";
import"./index-j15w02ww.js";
import"./index-ad9qp29k.js";
import"./index-vpn9zab9.js";
import"./index-pm2fs369.js";
import"./index-e7zhbfbk.js";
import"./index-1ckv14g7.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-ke69cyc7.js";
import"./index-cmw2ae5x.js";
import"./index-mwn5bkf6.js";
import"./index-dsy9thtk.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
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
