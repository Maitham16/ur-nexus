import {
  addResearch,
  init_notes,
  listResearch
} from "./index-cefggmen.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/research/research.ts
var call = async (args) => {
  const text = (args ?? "").trim();
  if (!text) {
    const items = listResearch(getCwd(), "notes");
    return { type: "text", value: items.length ? items.map((i) => `- ${i.text}`).join(`
`) : "no notes recorded yet" };
  }
  addResearch(getCwd(), "notes", text);
  return { type: "text", value: `added to notes: ${text}` };
};
var init_research = __esm(() => {
  init_cwd();
  init_notes();
});
init_research();

export {
  call
};
