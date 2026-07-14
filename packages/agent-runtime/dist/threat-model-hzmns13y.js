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

// src/commands/threat-model/threat-model.ts
var call = async (args) => {
  const toks = (args ?? "").trim().split(/\s+/).filter(Boolean);
  const value = await handleSecurityCommand(["threat-model", ...toks], getCwd());
  return { type: "text", value };
};
var init_threat_model = __esm(() => {
  init_security();
  init_cwd();
});
init_threat_model();

export {
  call
};
