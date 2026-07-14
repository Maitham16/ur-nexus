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

// ../../src/commands/mode/mode.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
var MODES, SECURITY_MODES, file = (cwd) => join(cwd, ".ur", "mode"), call = async (args) => {
  const want = (args ?? "").trim().toLowerCase();
  const f = file(getCwd());
  if (!want) {
    const cur = existsSync(f) ? readFileSync(f, "utf8").trim() : "code";
    return { type: "text", value: `mode: ${cur}
available: ${MODES.join(", ")}
security: ${SECURITY_MODES.join(", ")}` };
  }
  if (SECURITY_MODES.includes(want)) {
    return { type: "text", value: await handleSecurityCommand(["mode", want], getCwd()) };
  }
  if (!MODES.includes(want)) {
    return { type: "text", value: `unknown mode "${want}"
available: ${MODES.join(", ")}
security: ${SECURITY_MODES.join(", ")}` };
  }
  try {
    mkdirSync(join(getCwd(), ".ur"), { recursive: true });
    writeFileSync(f, want + `
`);
  } catch {}
  return { type: "text", value: `mode → ${want} (UR will favor ${want}-oriented behavior; persisted to .ur/mode)` };
};
var init_mode = __esm(() => {
  init_security();
  init_cwd();
  MODES = ["code", "research", "debug", "browser", "image", "video", "data"];
  SECURITY_MODES = ["security", "audit", "blue-team", "purple-team", "pentest-lab", "hardening", "incident-response", "secure-code"];
});
init_mode();

export {
  call
};
