import {
  commandExists,
  init_sysinfo
} from "./index-pbs27mmg.js";
import"./index-e7zhbfbk.js";
import"./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import"./index-z5aeypvg.js";
import"./index-5jmh1e0k.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-wxsgjqjk.js";
import"./index-s1a1wahe.js";
import"./index-wred0kdg.js";
import"./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-7bd814mt.js";
import"./index-m9qhxms7.js";
import"./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/convert/convert.ts
var call = async (args) => {
  const parts = (args ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2)
    return { type: "text", value: "usage: /convert <file> <target-format>" };
  const tools = [["pandoc", "documents"], ["ffmpeg", "audio/video"], ["libreoffice", "office docs"]];
  const have = tools.filter(([t]) => commandExists(t)).map(([t, k]) => `${t} (${k})`);
  return {
    type: "text",
    value: `Conversion ${parts[0]} → ${parts[1]}.
Available converters: ${have.join(", ") || "none"}.
Ask UR to run the conversion with an available tool, or install one (e.g. brew install pandoc ffmpeg).`
  };
};
var init_convert = __esm(() => {
  init_sysinfo();
});
init_convert();

export {
  call
};
