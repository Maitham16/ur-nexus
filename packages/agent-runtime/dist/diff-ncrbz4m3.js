import {
  require_jsx_dev_runtime
} from "./index-mpvjr5hg.js";
import {
  __esm,
  __require,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/commands/diff/diff.tsx
var jsx_dev_runtime, call = async (onDone, context) => {
  const {
    DiffDialog
  } = await import("./DiffDialog-x485d469.js");
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(DiffDialog, {
    messages: context.messages,
    onDone
  }, undefined, false, undefined, this);
};
var init_diff = __esm(() => {
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});
init_diff();

export {
  call
};
