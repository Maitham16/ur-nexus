import {
  indexWorkspace,
  init_fileops
} from "./index-e8m9vyf2.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/index/index.impl.ts
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
