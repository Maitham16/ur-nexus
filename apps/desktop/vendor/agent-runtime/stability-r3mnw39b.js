import {
  handleStabilityCommand,
  init_stability
} from "./index-k4smejj6.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/stability/stability.ts
var call = async (args) => {
  const tokens = (args ?? "").trim().split(/\s+/).filter(Boolean);
  const value = await handleStabilityCommand(["stability", ...tokens], getCwd());
  return { type: "text", value };
};
var init_stability2 = __esm(() => {
  init_stability();
  init_cwd();
});
init_stability2();

export {
  call
};
