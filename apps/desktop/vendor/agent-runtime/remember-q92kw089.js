import {
  init_notes,
  listMemory,
  remember
} from "./index-cefggmen.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/remember/remember.ts
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
