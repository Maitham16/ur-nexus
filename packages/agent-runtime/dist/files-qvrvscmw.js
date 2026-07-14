import {
  cacheKeys,
  init_fileStateCache
} from "./index-h3gckbec.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-7h9ddexs.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/files/files.ts
import { relative } from "path";
async function call(_args, context) {
  const files = context.readFileState ? cacheKeys(context.readFileState) : [];
  if (files.length === 0) {
    return { type: "text", value: "No files in context" };
  }
  const fileList = files.map((file) => relative(getCwd(), file)).join(`
`);
  return { type: "text", value: `Files in context:
${fileList}` };
}
var init_files = __esm(() => {
  init_cwd();
  init_fileStateCache();
});
init_files();

export {
  call
};
