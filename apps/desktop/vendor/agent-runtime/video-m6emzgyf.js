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
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
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

// ../../src/commands/video/video.ts
import { existsSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
var call = async (args) => {
  const target = (args ?? "").trim().split(/\s+/)[0] ?? "";
  if (!target)
    return { type: "text", value: "usage: /video <file|url> [task]" };
  const isUrl = /^https?:\/\//.test(target);
  if (isUrl) {
    const yd = commandExists("yt-dlp") ? "yt-dlp ✓ — use /youtube for metadata/transcript" : "install yt-dlp (brew install yt-dlp)";
    return { type: "text", value: `remote video: ${target}
${yd}` };
  }
  const abs = isAbsolute(target) ? target : resolve(getCwd(), target);
  if (!existsSync(abs))
    return { type: "text", value: `not found: ${target}` };
  if (!commandExists("ffprobe")) {
    return { type: "text", value: `local video: ${target}
Install ffmpeg for metadata/frames (brew install ffmpeg).` };
  }
  const r = runCapture("ffprobe", ["-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", abs], 20000);
  if (!r.ok)
    return { type: "text", value: `ffprobe failed: ${r.err || "unknown error"}` };
  try {
    const d = JSON.parse(r.out);
    const dur = d.format?.duration ? `${Number(d.format.duration).toFixed(1)}s` : "?";
    const streams = (d.streams ?? []).map((s) => s.codec_type === "video" ? `video ${s.codec_name} ${s.width}x${s.height}` : `${s.codec_type} ${s.codec_name}`).join(", ");
    return { type: "text", value: `video ${target}
format: ${d.format?.format_name ?? "?"} · duration: ${dur}
streams: ${streams}
(Ask UR to extract frames/audio with ffmpeg — writes require approval.)` };
  } catch {
    return { type: "text", value: r.out.slice(0, 2000) };
  }
};
var init_video = __esm(() => {
  init_cwd();
  init_sysinfo();
});
init_video();

export {
  call
};
