import {
  addResearch,
  init_notes,
  listResearch
} from "./index-378wx65a.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/paper/paper.ts
var call = async (args) => {
  const text = (args ?? "").trim();
  if (!text) {
    const items = listResearch(getCwd(), "papers");
    return { type: "text", value: items.length ? items.map((i) => `- ${i.text}`).join(`
`) : "no papers recorded yet" };
  }
  addResearch(getCwd(), "papers", text);
  return { type: "text", value: `added to papers: ${text}` };
};
var init_paper = __esm(() => {
  init_cwd();
  init_notes();
});
init_paper();

export {
  call
};
