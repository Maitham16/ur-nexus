import {
  indexWorkspace,
  init_fileops
} from "./index-8kyykf0g.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/index/index.impl.ts
var call = async () => {
  const r = indexWorkspace(getCwd());
  return { type: "text", value: `indexed ${r.count} file(s) → .ur/index/files.txt

sample:
` + r.sample.map((s) => `  ${s}`).join(`
`) };
};
var init_index_impl = __esm(() => {
  init_cwd();
  init_fileops();
});
init_index_impl();

export {
  call
};
