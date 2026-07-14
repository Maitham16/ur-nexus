import {
  init_thinkback,
  playAnimation
} from "./index-0emx8a6w.js";
import"./index-x926vph8.js";
import {
  OFFICIAL_MARKETPLACE_NAME,
  init_installedPluginsManager,
  init_officialMarketplace,
  loadInstalledPluginsV2
} from "./index-7fe5jn6w.js";
import"./index-kkermbsd.js";
import"./index-gph76kef.js";
import"./index-2j7c2ame.js";
import"./index-61fyyngt.js";
import"./index-6hrfermc.js";
import"./index-r9gwtga0.js";
import"./index-s87snjmt.js";
import"./index-6ykfn1n2.js";
import"./index-e7z6rkgj.js";
import"./index-e7zhbfbk.js";
import"./index-gkqe0rrq.js";
import"./index-ked7nkp4.js";
import"./index-43251g5q.js";
import"./index-33ph0x52.js";
import"./index-wxp81q89.js";
import"./index-efqwnst8.js";
import"./index-na6pcvfj.js";
import"./index-98nws6xf.js";
import"./index-f6z7dc9t.js";
import"./index-4k4gpxwy.js";
import"./index-zh6q93c4.js";
import"./index-j9j0h3gp.js";
import"./index-mpvjr5hg.js";
import"./index-gtvyh4ft.js";
import"./index-d6epqsmt.js";
import"./index-bwntnbyg.js";
import"./index-xvadh9a8.js";
import"./index-a38sm3ww.js";
import"./index-t5r7sy2d.js";
import"./index-ktb0kcww.js";
import"./index-tdkq0knn.js";
import"./index-kq80n9z5.js";
import"./index-1f511qkg.js";
import"./index-bdfn6xh6.js";
import"./index-60smdz72.js";
import"./index-5jrp51k1.js";
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
