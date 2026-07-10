import {
  addResearch,
  init_notes,
  listResearch
} from "./index-gf2z4g2r.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/cite/cite.ts
var call = async (args) => {
  const text = (args ?? "").trim();
  if (!text) {
    const items = listResearch(getCwd(), "citations");
    return { type: "text", value: items.length ? items.map((i) => `- ${i.text}`).join(`
`) : "no citations recorded yet" };
  }
  addResearch(getCwd(), "citations", text);
  return { type: "text", value: `added to citations: ${text}` };
};
var init_cite = __esm(() => {
  init_cwd();
  init_notes();
});
init_cite();

export {
  call
};
