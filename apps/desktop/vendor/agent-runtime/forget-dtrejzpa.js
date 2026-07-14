import {
  forget,
  init_notes
} from "./index-378wx65a.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/forget/forget.ts
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
