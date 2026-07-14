import {
  init_projectDna,
  writeDna
} from "./index-e7zhbfbk.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/dna/dna.ts
var call = async () => {
  return { type: "text", value: writeDna(getCwd()) + `

(saved to .ur/project_dna.md)` };
};
var init_dna = __esm(() => {
  init_cwd();
  init_projectDna();
});
init_dna();

export {
  call
};
