import {
  getCwdState,
  getOriginalCwd,
  init_state
} from "./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/utils/cwd.ts
import { AsyncLocalStorage } from "async_hooks";
function runWithCwdOverride(cwd, fn) {
  return cwdOverrideStorage.run(cwd, fn);
}
function pwd() {
  return cwdOverrideStorage.getStore() ?? getCwdState();
}
function getCwd() {
  try {
    return pwd();
  } catch {
    return getOriginalCwd();
  }
}
var cwdOverrideStorage;
var init_cwd = __esm(() => {
  init_state();
  cwdOverrideStorage = new AsyncLocalStorage;
});

export { runWithCwdOverride, pwd, getCwd, init_cwd };
