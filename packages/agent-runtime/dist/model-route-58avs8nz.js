import {
  filterModelPoolForLocalOnly,
  formatModelRoute,
  init_modelRouter,
  recommendModel,
  resolveModelForTask
} from "./index-kw2wxbby.js";
import {
  init_modelPool,
  loadModelPool
} from "./index-fayv8cwb.js";
import {
  init_model_doctor,
  listModelCapabilities
} from "./index-j4g1j45r.js";
import"./index-qg6cjfb3.js";
import"./index-5jrgxedg.js";
import"./index-hp4vvv8v.js";
import"./index-zn5x3nwj.js";
import {
  init_offlineMode,
  isNetworkRestricted
} from "./index-98nws6xf.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
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

// ../../src/commands/model-route/model-route.ts
function optionValue(tokens, flag) {
  const index = tokens.indexOf(flag);
  return index >= 0 ? tokens[index + 1] : undefined;
}
function taskText(tokens) {
  const values = [];
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (token === "--strategy") {
      i++;
      continue;
    }
    if (token.startsWith("--"))
      continue;
    values.push(token);
  }
  return values.join(" ").trim();
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const strategy = optionValue(tokens, "--strategy") ?? "auto";
  const localOnly = tokens.includes("--offline") || isNetworkRestricted();
  const task = taskText(tokens);
  if (!task) {
    return {
      type: "text",
      value: 'Usage: ur model-route "<task>" [--strategy auto|cheap|strong|default] [--offline] [--json]'
    };
  }
  const { models } = await listModelCapabilities();
  const pool = loadModelPool(getCwd());
  const effectivePool = filterModelPoolForLocalOnly(pool, localOnly);
  const result = recommendModel(task, models, { localOnly });
  const resolved = resolveModelForTask(task, strategy, effectivePool, models, { localOnly, cwd: getCwd() });
  if (json) {
    return {
      type: "text",
      value: JSON.stringify({ ...result, strategy, localOnly, resolved: resolved ?? null, pool: effectivePool }, null, 2)
    };
  }
  return {
    type: "text",
    value: [
      formatModelRoute(result, false),
      "",
      `Routing strategy: ${strategy}`,
      `Local-only: ${localOnly ? "yes" : "no"}`,
      `Resolved launch model: ${resolved ?? "none"}`
    ].join(`
`)
  };
};
var init_model_route = __esm(() => {
  init_model_doctor();
  init_modelRouter();
  init_modelPool();
  init_argumentSubstitution();
  init_cwd();
  init_offlineMode();
});
init_model_route();

export {
  call
};
