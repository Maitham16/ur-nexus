import {
  commandExists,
  init_sysinfo,
  runCapture
} from "./index-bn9g96g3.js";
import"./index-0b2n9cdp.js";
import"./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import"./index-mpmmtc93.js";
import"./index-s5dp14ed.js";
import"./index-6dy59xbm.js";
import"./index-0r3wd4mq.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-h7h0j06f.js";
import"./index-7h9ddexs.js";
import"./index-f80dj2bz.js";
import"./index-q00jv0fc.js";
import"./index-cs7da0vv.js";
import"./index-ycnb0yeb.js";
import"./index-vpczjthp.js";
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/image/image.ts
import { existsSync, statSync } from "node:fs";
import { extname, isAbsolute, resolve } from "node:path";
var call = async (args) => {
  const f = (args ?? "").trim().split(/\s+/)[0] ?? "";
  if (!f)
    return { type: "text", value: "usage: /image <file> [task]" };
  const abs = isAbsolute(f) ? f : resolve(getCwd(), f);
  if (!existsSync(abs))
    return { type: "text", value: `not found: ${f}` };
  const kb = Math.round(statSync(abs).size / 1024);
  const lines = [`image ${f} — ${extname(abs) || "?"}, ${kb} KB`];
  if (commandExists("tesseract")) {
    const r = runCapture("tesseract", [abs, "stdout", "--psm", "3"], 20000);
    if (r.ok && r.out)
      lines.push("", "OCR text:", r.out.length > 4000 ? r.out.slice(0, 4000) + `
… [truncated]` : r.out);
    else
      lines.push("", "OCR: no text detected.");
  } else {
    lines.push("", "OCR needs tesseract (brew install tesseract). For visual description, paste with Ctrl+V or use a vision model.");
  }
  return { type: "text", value: lines.join(`
`) };
};
var init_image = __esm(() => {
  init_cwd();
  init_sysinfo();
});
init_image();

export {
  call
};
