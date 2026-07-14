import {
  init_json,
  safeParseJSON
} from "./index-wxsgjqjk.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/modelPool.ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
function loadModelPool(cwd) {
  const file = join(cwd, ".ur", "model-pool.json");
  if (existsSync(file)) {
    const parsed = safeParseJSON(readFileSync(file, "utf-8"), false);
    if (parsed && typeof parsed === "object") {
      const object = parsed;
      return {
        cheap: readStringArray(object.cheap),
        strong: readStringArray(object.strong),
        default: readStringArray(object.default)
      };
    }
  }
  const env = process.env;
  return {
    cheap: readEnvList(env.UR_MODEL_POOL_CHEAP) ?? DEFAULT_POOL.cheap,
    strong: readEnvList(env.UR_MODEL_POOL_STRONG) ?? DEFAULT_POOL.strong,
    default: readEnvList(env.UR_MODEL_POOL_DEFAULT) ?? DEFAULT_POOL.default
  };
}
function readStringArray(value) {
  if (Array.isArray(value))
    return value.map(String).filter(Boolean);
  return;
}
function readEnvList(value) {
  if (!value)
    return;
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}
var DEFAULT_POOL;
var init_modelPool = __esm(() => {
  init_json();
  DEFAULT_POOL = {
    cheap: ["qwen2.5-coder:1.5b", "gemma2:2b"],
    strong: ["qwen2.5-coder:32b", "codex", "claude-3-5-sonnet", "gpt-4o"],
    default: ["qwen2.5-coder"]
  };
});

export { loadModelPool, init_modelPool };
