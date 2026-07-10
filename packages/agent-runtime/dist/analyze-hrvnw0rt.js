import {
  init_fileops,
  readFileSafe
} from "./index-e8m9vyf2.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/analyze/analyze.ts
var call = async (args) => {
  const f = (args ?? "").trim();
  if (!f)
    return { type: "text", value: "usage: /analyze <file>" };
  const r = readFileSafe(getCwd(), f);
  if (!r.ok)
    return { type: "text", value: `cannot read ${f}: ${r.error}` };
  return { type: "text", value: `Analyze this file (${f}):

${r.content}` };
};
var init_analyze = __esm(() => {
  init_cwd();
  init_fileops();
});
init_analyze();

export {
  call
};
