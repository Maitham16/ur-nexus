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

// ../../src/commands/read/read.ts
var call = async (args) => {
  const f = (args ?? "").trim();
  if (!f)
    return { type: "text", value: "usage: /read <file>" };
  const r = readFileSafe(getCwd(), f);
  return { type: "text", value: r.ok ? `# ${f}

${r.content}` : `cannot read ${f}: ${r.error}` };
};
var init_read = __esm(() => {
  init_cwd();
  init_fileops();
});
init_read();

export {
  call
};
