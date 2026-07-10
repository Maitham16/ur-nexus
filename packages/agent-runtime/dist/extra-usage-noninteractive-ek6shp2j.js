import {
  init_extra_usage_core,
  runExtraUsage
} from "./index-d2wvsqfk.js";
import"./index-x1d92c1v.js";
import"./index-dx2eja69.js";
import"./index-ce1yxg5m.js";
import"./index-m1cwhfvd.js";
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

// ../../src/commands/extra-usage/extra-usage-noninteractive.ts
async function call() {
  const result = await runExtraUsage();
  if (result.type === "message") {
    return { type: "text", value: result.value };
  }
  return {
    type: "text",
    value: result.opened ? `Browser opened to manage extra usage. If it didn't open, visit: ${result.url}` : `Please visit ${result.url} to manage extra usage.`
  };
}
var init_extra_usage_noninteractive = __esm(() => {
  init_extra_usage_core();
});
init_extra_usage_noninteractive();

export {
  call
};
