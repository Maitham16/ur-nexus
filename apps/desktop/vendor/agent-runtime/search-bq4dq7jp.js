import {
  init_fileops,
  searchFiles
} from "./index-8kyykf0g.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/search/search.ts
var call = async (args) => {
  const q = (args ?? "").trim();
  if (!q)
    return { type: "text", value: "usage: /search <query>" };
  const hits = searchFiles(getCwd(), q);
  if (!hits.length)
    return { type: "text", value: `no matches for "${q}"` };
  return { type: "text", value: `${hits.length} match(es) for "${q}":
` + hits.map((h) => `  ${h.file}:${h.line}  ${h.text}`).join(`
`) };
};
var init_search = __esm(() => {
  init_cwd();
  init_fileops();
});
init_search();

export {
  call
};
