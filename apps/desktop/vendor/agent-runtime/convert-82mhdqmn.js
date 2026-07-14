import {
  commandExists,
  init_sysinfo
} from "./index-bn9g96g3.js";
import"./index-0b2n9cdp.js";
import"./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import"./index-mpmmtc93.js";
import"./index-s5dp14ed.js";
import"./index-6dy59xbm.js";
import"./index-0r3wd4mq.js";
import"./index-b5f4m7g4.js";
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

// src/commands/convert/convert.ts
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
