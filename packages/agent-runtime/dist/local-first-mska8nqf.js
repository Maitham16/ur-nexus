import {
  formatLocalFirstProfile,
  init_offlineMode,
  localFirstProfile
} from "./index-98nws6xf.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-4bphgmcc.js";
import"./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/local-first/local-first.ts
var call = async (args) => {
  const tokens = parseArguments(args);
  const profile = localFirstProfile(getCwd());
  return {
    type: "text",
    value: formatLocalFirstProfile(profile, tokens.includes("--json"))
  };
};
var init_local_first = __esm(() => {
  init_cwd();
  init_offlineMode();
  init_argumentSubstitution();
});
init_local_first();

export {
  call
};
