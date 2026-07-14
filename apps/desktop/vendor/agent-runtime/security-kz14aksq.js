import {
  handleSecurityCommand,
  init_security
} from "./index-446zkqnk.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/security/security.ts
var TOP_LEVEL, call = async (args) => {
  const tokens = (args ?? "").trim().split(/\s+/).filter(Boolean);
  const head = tokens[0] ?? "";
  const callTokens = TOP_LEVEL.has(head) ? tokens : ["security", ...tokens];
  const value = await handleSecurityCommand(callTokens, getCwd());
  return { type: "text", value };
};
var init_security2 = __esm(() => {
  init_security();
  init_cwd();
  TOP_LEVEL = new Set([
    "security",
    "mode",
    "scope",
    "net",
    "vuln",
    "ir",
    "attack",
    "threat-model",
    "compliance",
    "playbook",
    "playbooks",
    "lab",
    "doctor",
    "kali",
    "secure-design",
    "secure-api",
    "secure-ci",
    "secure-docker",
    "secure-deploy"
  ]);
});
init_security2();

export {
  call
};
