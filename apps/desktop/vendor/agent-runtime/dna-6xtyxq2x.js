import {
  init_projectDna,
  writeDna
} from "./index-0b2n9cdp.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/dna/dna.ts
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
