import {
  SandboxManager,
  init_sandbox_adapter
} from "./index-79vhy4mk.js";
import"./index-grma1d53.js";
import"./index-h3gckbec.js";
import"./index-e4qqkpaw.js";
import"./index-4ywxxsys.js";
import"./index-hq5et9ce.js";
import"./index-e6d6jy9m.js";
import"./index-f8sv7ymg.js";
import"./index-bkd049y5.js";
import"./index-q92gn3zb.js";
import"./index-hny2avst.js";
import"./index-0b2n9cdp.js";
import {
  evaluateShellSafetyPolicy,
  formatApprovalLevel,
  formatShellSafetyEvaluation,
  init_projectSafety,
  loadProjectSafetyPolicy,
  writeProjectSafetyPolicy
} from "./index-t4d29e3d.js";
import"./index-yqwh56at.js";
import"./index-hgk4djez.js";
import"./index-keaxkjg6.js";
import"./index-nn6db592.js";
import"./index-yw8ef0zj.js";
import"./index-b85xt2xy.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
import"./index-k4smejj6.js";
import"./index-nx1e0qxk.js";
import"./index-g6p7fqb0.js";
import"./index-2krq0sbw.js";
import"./index-4pm7msm9.js";
import"./index-08vfk1s7.js";
import"./index-9zsppqmn.js";
import"./index-wpmv59x8.js";
import"./index-484d6yds.js";
import"./index-wx2fg0aa.js";
import"./index-qc0evn6c.js";
import"./index-rra3q270.js";
import"./index-2gbtdq3b.js";
import"./index-3tq38g6m.js";
import"./index-jmsjkkjh.js";
import"./index-y4htdtvj.js";
import"./index-racy6ymd.js";
import"./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import"./index-mpmmtc93.js";
import"./index-s5dp14ed.js";
import"./index-6dy59xbm.js";
import"./index-0r3wd4mq.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-h7h0j06f.js";
import"./index-7h9ddexs.js";
import"./index-f80dj2bz.js";
import"./index-q00jv0fc.js";
import"./index-cs7da0vv.js";
import"./index-ycnb0yeb.js";
import"./index-vpczjthp.js";
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/sandbox/sandbox.ts
function usage() {
  return [
    "Usage:",
    "  ur sandbox status [--json]",
    "  ur sandbox check",
    "  ur sandbox init",
    "  ur sandbox eval <command> [--json]",
    "",
    "Approval levels (from project safety policy):",
    "  read-only             inspect files and command output",
    "  edit project          create, edit, move, or delete project files",
    "  run safe commands     run local builds, tests, scripts, and tools",
    "  run network commands  send data to another host, API, or remote service",
    "  destructive commands  remove data, rewrite history, or destroy resources",
    "",
    "Sandbox modes:",
    "  Docker, temporary worktree, and OS sandbox (macOS sandbox-exec / Linux bwrap)"
  ].join(`
`);
}
function positionals(tokens) {
  const flagsWithValue = new Set(["--base", "--title", "--body"]);
  const values = [];
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (flagsWithValue.has(token)) {
      i++;
      continue;
    }
    if (token.startsWith("--"))
      continue;
    values.push(token);
  }
  return values;
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const pos = positionals(tokens);
  const action = pos[0] ?? "status";
  const cwd = getCwd();
  if (action === "status" || action === "st") {
    const supported = SandboxManager.isSupportedPlatform();
    const enabled = SandboxManager.isSandboxingEnabled();
    const required = SandboxManager.isSandboxRequired();
    const deps = SandboxManager.checkDependencies();
    const unavailableReason = SandboxManager.getSandboxUnavailableReason();
    const status = {
      supported,
      enabled,
      required,
      dependencies: deps,
      unavailableReason,
      autoAllowIfSandboxed: SandboxManager.isAutoAllowBashIfSandboxedEnabled(),
      allowUnsandboxed: SandboxManager.areUnsandboxedCommandsAllowed()
    };
    if (json)
      return { type: "text", value: JSON.stringify(status, null, 2) };
    const lines = [
      "Sandbox status",
      `  supported:  ${supported}`,
      `  enabled:    ${enabled}`,
      `  required:   ${required}`,
      `  autoAllowIfSandboxed: ${status.autoAllowIfSandboxed}`,
      `  allowUnsandboxed:     ${status.allowUnsandboxed}`
    ];
    if (deps.errors.length)
      lines.push(`  dependency errors: ${deps.errors.join(", ")}`);
    if (deps.warnings.length)
      lines.push(`  dependency warnings: ${deps.warnings.join(", ")}`);
    if (unavailableReason)
      lines.push(`  unavailable reason: ${unavailableReason}`);
    return { type: "text", value: lines.join(`
`) };
  }
  if (action === "check") {
    const deps = SandboxManager.checkDependencies();
    const ok = deps.errors.length === 0;
    if (json)
      return { type: "text", value: JSON.stringify({ ok, ...deps }, null, 2) };
    const lines = ["Sandbox dependency check", ok ? "OK" : "Missing dependencies:"];
    for (const error of deps.errors)
      lines.push(`  error: ${error}`);
    for (const warning of deps.warnings)
      lines.push(`  warning: ${warning}`);
    return { type: "text", value: lines.join(`
`) };
  }
  if (action === "init") {
    const path = writeProjectSafetyPolicy(cwd);
    return { type: "text", value: `Wrote default project safety policy to ${path}` };
  }
  if (action === "eval") {
    const command = pos.slice(1).join(" ");
    if (!command)
      return { type: "text", value: usage() };
    const policy = loadProjectSafetyPolicy(cwd);
    const evaluation = evaluateShellSafetyPolicy(command, cwd);
    const result = {
      command,
      level: evaluation.approvalLevel,
      approvalLevel: evaluation.approvalLevel,
      approvalLabel: formatApprovalLevel(evaluation.approvalLevel),
      ...evaluation,
      policy
    };
    if (json)
      return { type: "text", value: JSON.stringify(result, null, 2) };
    return {
      type: "text",
      value: [
        `Command: ${command}`,
        `Approval level: ${formatApprovalLevel(evaluation.approvalLevel)}`,
        formatShellSafetyEvaluation(evaluation)
      ].join(`

`)
    };
  }
  return { type: "text", value: usage() };
};
var init_sandbox = __esm(() => {
  init_argumentSubstitution();
  init_cwd();
  init_sandbox_adapter();
  init_projectSafety();
});
init_sandbox();

export {
  call
};
