import {
  init_notes,
  listMemory,
  remember
} from "./index-378wx65a.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/remember/remember.ts
var call = async (args) => {
  const text = (args ?? "").trim();
  if (!text) {
    const notes = listMemory(getCwd());
    return { type: "text", value: notes.length ? notes.map((n) => `- ${n.text}`).join(`
`) : "no memory notes yet" };
  }
  remember(getCwd(), text);
  return { type: "text", value: `remembered: ${text}` };
};
var init_remember = __esm(() => {
  init_cwd();
  init_notes();
});
init_remember();

export {
  call
};
