import {
  commandExists,
  init_sysinfo,
  runCapture
} from "./index-xv6h67mx.js";
import"./index-e7zhbfbk.js";
import"./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import"./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import"./index-a9y6sg4d.js";
import"./index-dsy9thtk.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/image/image.ts
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
