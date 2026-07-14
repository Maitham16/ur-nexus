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

// src/commands/video/video.ts
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
