import {
  SandboxManager,
  init_sandbox_adapter
} from "./index-ncjdg6tp.js";
import"./index-by2vmtsd.js";
import"./index-kkermbsd.js";
import"./index-v2hw7r4c.js";
import"./index-xy62w38z.js";
import"./index-cqtb7hz4.js";
import"./index-r9gwtga0.js";
import"./index-s87snjmt.js";
import"./index-ked7nkp4.js";
import"./index-vpn9zab9.js";
import"./index-pm2fs369.js";
import"./index-e7zhbfbk.js";
import {
  evaluateShellSafetyPolicy,
  formatApprovalLevel,
  formatShellSafetyEvaluation,
  init_projectSafety,
  loadProjectSafetyPolicy,
  writeProjectSafetyPolicy
} from "./index-1ckv14g7.js";
import"./index-43251g5q.js";
import"./index-1n2jp292.js";
import"./index-wxp81q89.js";
import"./index-0g63027x.js";
import"./index-na6pcvfj.js";
import"./index-8ssmkf1y.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-ke69cyc7.js";
import"./index-4k4gpxwy.js";
import"./index-1t11s6r8.js";
import"./index-j9j0h3gp.js";
import"./index-mpvjr5hg.js";
import"./index-ce74agn1.js";
import"./index-gtvyh4ft.js";
import"./index-vw0tpbas.js";
import"./index-ce1yxg5m.js";
import"./index-m1cwhfvd.js";
import"./index-a38sm3ww.js";
import"./index-t5r7sy2d.js";
import"./index-kkhap9s1.js";
import"./index-1f511qkg.js";
import"./index-kq80n9z5.js";
import"./index-c2g52y43.js";
import"./index-cmw2ae5x.js";
import"./index-v9qevprk.js";
import"./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import"./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import"./index-a9y6sg4d.js";
import"./index-dsy9thtk.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/sandbox/sandbox.ts
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
