import {
  init_thinkback,
  playAnimation
} from "./index-zrjz5a0t.js";
import"./index-a67qfeh1.js";
import {
  OFFICIAL_MARKETPLACE_NAME,
  init_installedPluginsManager,
  init_officialMarketplace,
  loadInstalledPluginsV2
} from "./index-qv8mzsdh.js";
import"./index-by2vmtsd.js";
import"./index-kkermbsd.js";
import"./index-v2hw7r4c.js";
import"./index-xy62w38z.js";
import"./index-cqtb7hz4.js";
import"./index-r9gwtga0.js";
import"./index-s87snjmt.js";
import"./index-ked7nkp4.js";
import"./index-xa1t0yjk.js";
import"./index-g9g95te9.js";
import"./index-e7zhbfbk.js";
import"./index-czqwk9v1.js";
import"./index-43251g5q.js";
import"./index-1n2jp292.js";
import"./index-wxp81q89.js";
import"./index-0g63027x.js";
import"./index-na6pcvfj.js";
import"./index-8ssmkf1y.js";
import"./index-ke69cyc7.js";
import"./index-4k4gpxwy.js";
import"./index-1t11s6r8.js";
import"./index-j9j0h3gp.js";
import"./index-mpvjr5hg.js";
import"./index-ce74agn1.js";
import"./index-gtvyh4ft.js";
import"./index-vw0tpbas.js";
import"./index-ce1yxg5m.js";
import"./index-m1cwhfvd.js";
import"./index-a38sm3ww.js";
import"./index-t5r7sy2d.js";
import"./index-kkhap9s1.js";
import"./index-1f511qkg.js";
import"./index-kq80n9z5.js";
import"./index-c2g52y43.js";
import"./index-cmw2ae5x.js";
import"./index-v9qevprk.js";
import"./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import"./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import"./index-a9y6sg4d.js";
import"./index-dsy9thtk.js";
import"./index-2p1fe0x7.js";
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

// ../../src/commands/thinkback-play/thinkback-play.ts
import { join } from "path";
function getPluginId() {
  const marketplaceName = process.env.USER_TYPE === "ant" ? INTERNAL_MARKETPLACE_NAME : OFFICIAL_MARKETPLACE_NAME;
  return `thinkback@${marketplaceName}`;
}
async function call() {
  const v2Data = loadInstalledPluginsV2();
  const pluginId = getPluginId();
  const installations = v2Data.plugins[pluginId];
  if (!installations || installations.length === 0) {
    return {
      type: "text",
      value: "Thinkback plugin not installed. Run /think-back first to install it."
    };
  }
  const firstInstall = installations[0];
  if (!firstInstall?.installPath) {
    return {
      type: "text",
      value: "Thinkback plugin installation path not found."
    };
  }
  const skillDir = join(firstInstall.installPath, "skills", SKILL_NAME);
  const result = await playAnimation(skillDir);
  return { type: "text", value: result.message };
}
var INTERNAL_MARKETPLACE_NAME = "ur-marketplace", SKILL_NAME = "thinkback";
var init_thinkback_play = __esm(() => {
  init_installedPluginsManager();
  init_officialMarketplace();
  init_thinkback();
});
init_thinkback_play();

export {
  call
};
