import {
  formatLocalFirstProfile,
  init_offlineMode,
  localFirstProfile
} from "./index-b85xt2xy.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-f80dj2bz.js";
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/local-first/local-first.ts
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
