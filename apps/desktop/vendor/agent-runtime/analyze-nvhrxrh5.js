import {
  init_fileops,
  readFileSafe
} from "./index-8kyykf0g.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/analyze/analyze.ts
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
