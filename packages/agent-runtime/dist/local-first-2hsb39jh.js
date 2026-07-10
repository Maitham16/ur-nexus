import {
  formatLocalFirstProfile,
  init_offlineMode,
  localFirstProfile
} from "./index-8ssmkf1y.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-ke69cyc7.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-2g4gegqj.js";
import"./index-bdb5pzbm.js";
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
