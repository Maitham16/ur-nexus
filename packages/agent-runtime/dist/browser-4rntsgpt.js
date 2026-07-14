import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/browser/browser.ts
import { existsSync } from "node:fs";
import { join } from "node:path";
var call = async (args) => {
  const task = (args ?? "").trim();
  if (!task)
    return { type: "text", value: "usage: /browser <url|task>" };
  const hasPlaywright = existsSync(join(getCwd(), "node_modules", "playwright")) || existsSync(join(getCwd(), "node_modules", "playwright-core"));
  if (hasPlaywright) {
    return { type: "text", value: `Playwright detected — ask UR to drive the browser for: ${task}
Risky actions (form submit, downloads, login) require your approval.` };
  }
  return {
    type: "text",
    value: `Playwright not installed.
  • install: bun add -d playwright && bunx playwright install chromium
  • or use the built-in /chrome automation for: ${task}`
  };
};
var init_browser = __esm(() => {
  init_cwd();
});
init_browser();

export {
  call
};
