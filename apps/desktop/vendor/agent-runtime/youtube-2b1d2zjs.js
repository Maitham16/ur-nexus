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

// src/commands/youtube/youtube.ts
var call = async (args) => {
  const url = (args ?? "").trim().split(/\s+/)[0] ?? "";
  if (!url)
    return { type: "text", value: "usage: /youtube <url> [task]" };
  if (!commandExists("yt-dlp")) {
    return { type: "text", value: `yt-dlp not installed — install with: brew install yt-dlp (or pipx install yt-dlp)
Then /youtube fetches metadata + subtitles for ${url}.` };
  }
  const r = runCapture("yt-dlp", ["--dump-json", "--skip-download", "--no-warnings", url], 25000);
  if (!r.ok)
    return { type: "text", value: `yt-dlp failed: ${(r.err || "").split(`
`)[0] || "unknown error"}` };
  try {
    const d = JSON.parse(r.out.split(`
`)[0] || "{}");
    const mins = d.duration ? `${Math.floor(d.duration / 60)}m${d.duration % 60}s` : "?";
    const desc = (d.description ?? "").split(`
`).slice(0, 4).join(" ").slice(0, 400);
    return { type: "text", value: `title: ${d.title ?? "?"}
uploader: ${d.uploader ?? "?"} · duration: ${mins} · views: ${d.view_count ?? "?"}

${desc}

(Ask UR to fetch subtitles/transcript and summarize.)` };
  } catch {
    return { type: "text", value: r.out.slice(0, 2000) };
  }
};
var init_youtube = __esm(() => {
  init_sysinfo();
});
init_youtube();

export {
  call
};
