import {
  getGlobalConfig,
  init_config,
  saveGlobalConfig
} from "./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import {
  init_analytics,
  logEvent
} from "./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import"./index-a9y6sg4d.js";
import"./index-dsy9thtk.js";
import"./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/vim/vim.ts
var call = async () => {
  const config = getGlobalConfig();
  let currentMode = config.editorMode || "normal";
  if (currentMode === "emacs") {
    currentMode = "normal";
  }
  const newMode = currentMode === "normal" ? "vim" : "normal";
  saveGlobalConfig((current) => ({
    ...current,
    editorMode: newMode
  }));
  logEvent("tengu_editor_mode_changed", {
    mode: newMode,
    source: "command"
  });
  return {
    type: "text",
    value: `Editor mode set to ${newMode}. ${newMode === "vim" ? "Use Escape key to toggle between INSERT and NORMAL modes." : "Using standard (readline) keyboard bindings."}`
  };
};
var init_vim = __esm(() => {
  init_analytics();
  init_config();
});
init_vim();

export {
  call
};
