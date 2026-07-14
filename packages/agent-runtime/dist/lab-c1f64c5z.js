import {
  handleSecurityCommand,
  init_security
} from "./index-6cbmj9ba.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/lab/lab.ts
var call = async (args) => {
  const toks = (args ?? "").trim().split(/\s+/).filter(Boolean);
  const value = await handleSecurityCommand(["lab", ...toks], getCwd());
  return { type: "text", value };
};
var init_lab = __esm(() => {
  init_security();
  init_cwd();
});
init_lab();

export {
  call
};
