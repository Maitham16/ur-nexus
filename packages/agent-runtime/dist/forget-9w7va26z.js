import {
  forget,
  init_notes
} from "./index-cefggmen.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/forget/forget.ts
var call = async (args) => {
  const text = (args ?? "").trim();
  if (!text)
    return { type: "text", value: "usage: /forget <text>" };
  const n = forget(getCwd(), text);
  return { type: "text", value: n > 0 ? `forgot ${n} note(s) matching "${text}"` : `no notes matched "${text}"` };
};
var init_forget = __esm(() => {
  init_cwd();
  init_notes();
});
init_forget();

export {
  call
};
