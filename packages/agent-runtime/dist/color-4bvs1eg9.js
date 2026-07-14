import {
  AGENT_COLORS,
  getTranscriptPath,
  init_agentColorManager,
  init_sessionStorage,
  saveAgentColor
} from "./index-79vhy4mk.js";
import"./index-grma1d53.js";
import"./index-h3gckbec.js";
import"./index-e4qqkpaw.js";
import"./index-4ywxxsys.js";
import"./index-hq5et9ce.js";
import"./index-e6d6jy9m.js";
import"./index-f8sv7ymg.js";
import"./index-bkd049y5.js";
import"./index-q92gn3zb.js";
import"./index-hny2avst.js";
import"./index-0b2n9cdp.js";
import"./index-t4d29e3d.js";
import"./index-yqwh56at.js";
import"./index-hgk4djez.js";
import"./index-keaxkjg6.js";
import"./index-nn6db592.js";
import"./index-yw8ef0zj.js";
import"./index-b85xt2xy.js";
import"./index-skb7s3mf.js";
import"./index-k4smejj6.js";
import"./index-nx1e0qxk.js";
import"./index-g6p7fqb0.js";
import"./index-2krq0sbw.js";
import"./index-4pm7msm9.js";
import"./index-08vfk1s7.js";
import"./index-9zsppqmn.js";
import"./index-wpmv59x8.js";
import"./index-484d6yds.js";
import"./index-wx2fg0aa.js";
import"./index-qc0evn6c.js";
import"./index-rra3q270.js";
import"./index-2gbtdq3b.js";
import"./index-3tq38g6m.js";
import"./index-jmsjkkjh.js";
import"./index-y4htdtvj.js";
import"./index-racy6ymd.js";
import"./index-133awary.js";
import"./index-pnhq4694.js";
import {
  init_teammate,
  isTeammate
} from "./index-4mfpjpj0.js";
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
import {
  getSessionId,
  init_state
} from "./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/color/color.ts
async function call(onDone, context, args) {
  if (isTeammate()) {
    onDone("Cannot set color: This session is a swarm teammate. Teammate colors are assigned by the team leader.", { display: "system" });
    return null;
  }
  if (!args || args.trim() === "") {
    const colorList = AGENT_COLORS.join(", ");
    onDone(`Please provide a color. Available colors: ${colorList}, default`, {
      display: "system"
    });
    return null;
  }
  const colorArg = args.trim().toLowerCase();
  if (RESET_ALIASES.includes(colorArg)) {
    const sessionId2 = getSessionId();
    const fullPath2 = getTranscriptPath();
    await saveAgentColor(sessionId2, "default", fullPath2);
    context.setAppState((prev) => ({
      ...prev,
      standaloneAgentContext: {
        ...prev.standaloneAgentContext,
        name: prev.standaloneAgentContext?.name ?? "",
        color: undefined
      }
    }));
    onDone("Session color reset to default", { display: "system" });
    return null;
  }
  if (!AGENT_COLORS.includes(colorArg)) {
    const colorList = AGENT_COLORS.join(", ");
    onDone(`Invalid color "${colorArg}". Available colors: ${colorList}, default`, { display: "system" });
    return null;
  }
  const sessionId = getSessionId();
  const fullPath = getTranscriptPath();
  await saveAgentColor(sessionId, colorArg, fullPath);
  context.setAppState((prev) => ({
    ...prev,
    standaloneAgentContext: {
      ...prev.standaloneAgentContext,
      name: prev.standaloneAgentContext?.name ?? "",
      color: colorArg
    }
  }));
  onDone(`Session color set to: ${colorArg}`, { display: "system" });
  return null;
}
var RESET_ALIASES;
var init_color = __esm(() => {
  init_state();
  init_agentColorManager();
  init_sessionStorage();
  init_teammate();
  RESET_ALIASES = ["default", "reset", "none", "gray", "grey"];
});
init_color();

export {
  call
};
