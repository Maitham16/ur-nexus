import {
  handleStabilityCommand,
  init_stability
} from "./index-4k4gpxwy.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/stability/stability.ts
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
