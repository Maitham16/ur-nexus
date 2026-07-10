import {
  DEFAULT_PROJECT_SAFETY_POLICY,
  evaluateShellSafetyPolicy,
  formatShellSafetyEvaluation,
  init_projectSafety,
  loadProjectSafetyPolicy,
  safetyPolicyPath,
  writeProjectSafetyPolicy
} from "./index-czqwk9v1.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-ke69cyc7.js";
import"./index-mwn5bkf6.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/safety/safety.ts
function usage() {
  return [
    "Usage:",
    "  ur safety status [--json]",
    "  ur safety init",
    '  ur safety check --command "<cmd>" [--json]',
    "",
    "The default policy maps commands to approval levels: read-only,",
    "edit project, run safe commands, run network commands, and",
    "destructive commands. It asks before destructive operations,",
    "recommends sandboxing for risky operations, and blocks common secret",
    "exfiltration paths."
  ].join(`
`);
}
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
function positionals(tokens) {
  const flagsWithValue = new Set(["--command"]);
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
  const action = positionals(tokens)[0] ?? "status";
  const cwd = getCwd();
  if (action === "init") {
    const path = writeProjectSafetyPolicy(cwd);
    return {
      type: "text",
      value: json ? JSON.stringify({ path }, null, 2) : `Wrote ${path}`
    };
  }
  if (action === "check") {
    const command = option(tokens, "--command") ?? positionals(tokens).slice(1).join(" ");
    if (!command)
      return { type: "text", value: usage() };
    return {
      type: "text",
      value: formatShellSafetyEvaluation(evaluateShellSafetyPolicy(command, cwd), json)
    };
  }
  if (action === "status") {
    const policy = loadProjectSafetyPolicy(cwd);
    const status = {
      path: safetyPolicyPath(cwd),
      configured: policy !== DEFAULT_PROJECT_SAFETY_POLICY,
      permissionClasses: policy.permissionClasses,
      askBeforeRules: policy.askBefore.length,
      denyRules: policy.deny.length,
      sandboxRequiredFor: policy.sandboxRequiredFor
    };
    return {
      type: "text",
      value: json ? JSON.stringify(status, null, 2) : [
        "Project safety policy:",
        `  configured: ${status.configured ? "yes" : "default"}`,
        `  path: ${status.path}`,
        `  permission classes: ${Object.keys(status.permissionClasses).join(", ")}`,
        `  ask-before rules: ${status.askBeforeRules}`,
        `  deny rules: ${status.denyRules}`,
        `  sandbox for: ${status.sandboxRequiredFor.join(", ")}`
      ].join(`
`)
    };
  }
  return { type: "text", value: usage() };
};
var init_safety = __esm(() => {
  init_argumentSubstitution();
  init_cwd();
  init_projectSafety();
});
init_safety();

export {
  call
};
