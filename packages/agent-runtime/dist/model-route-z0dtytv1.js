import {
  filterModelPoolForLocalOnly,
  formatModelRoute,
  init_modelRouter,
  recommendModel,
  resolveModelForTask
} from "./index-30hhb4zp.js";
import {
  init_modelPool,
  loadModelPool
} from "./index-2pd4r2w9.js";
import {
  init_model_doctor,
  listModelCapabilities
} from "./index-h9kt1sj4.js";
import"./index-df0wfzdw.js";
import"./index-hakw7em9.js";
import"./index-c6n1hema.js";
import"./index-rad7f2cp.js";
import {
  init_offlineMode,
  isNetworkRestricted
} from "./index-b85xt2xy.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
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

// src/commands/model-route/model-route.ts
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
