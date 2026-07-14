import {
  commandExists,
  init_sysinfo,
  runCapture
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

// ../../src/commands/youtube/youtube.ts
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
