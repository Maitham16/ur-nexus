import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/utils/model/ollamaRouter.ts
function parseModelParamsB(name) {
  const lower = name.toLowerCase();
  const moe = lower.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*b/);
  if (moe)
    return Number(moe[2]);
  const single = lower.match(/(\d+(?:\.\d+)?)\s*b(?![a-z])/);
  return single ? Number(single[1]) : undefined;
}
function categorizeOllamaModels(names) {
  const all = names.filter((n) => typeof n === "string" && n.trim() !== "").map((n) => n.trim());
  const coder = all.filter((n) => CODER_PATTERN.test(n));
  const fast = all.filter((n) => {
    const params = parseModelParamsB(n);
    return FAST_NAME_PATTERN.test(n) || params !== undefined && params <= FAST_MAX_PARAMS_B;
  });
  return { all, coder, fast };
}
function pickBestCoderModel(names, fallback) {
  const { all, coder } = categorizeOllamaModels(names);
  if (all.length === 0)
    return fallback;
  const pool = coder.length > 0 ? coder : all;
  return [...pool].sort((a, b) => paramsOrZero(b) - paramsOrZero(a) || a.localeCompare(b))[0] ?? fallback;
}
function pickSmallFastModel(names, fallback) {
  const { all, fast } = categorizeOllamaModels(names);
  if (all.length === 0)
    return fallback;
  const pool = fast.length > 0 ? fast : all;
  return [...pool].sort((a, b) => paramsOrInfinity(a) - paramsOrInfinity(b) || a.localeCompare(b))[0] ?? fallback;
}
function classifyTaskComplexity(prompt) {
  const text = (prompt ?? "").trim();
  if (text.length === 0)
    return "simple";
  if (text.length > 280)
    return "complex";
  if (COMPLEX_SIGNALS.test(text))
    return "complex";
  if (text.length < 160 && SIMPLE_SIGNALS.test(text))
    return "simple";
  return "complex";
}
function recommendedCoderModelToPull(names) {
  return categorizeOllamaModels(names).coder.length > 0 ? undefined : "qwen2.5-coder";
}
function isOllamaAutoRouteEnabled(env = process.env) {
  const raw = env.UR_OLLAMA_AUTO_ROUTE;
  if (raw === undefined || raw.trim() === "")
    return true;
  return !["0", "false", "no", "off"].includes(raw.trim().toLowerCase());
}
function paramsOrZero(name) {
  return parseModelParamsB(name) ?? 0;
}
function paramsOrInfinity(name) {
  return parseModelParamsB(name) ?? Number.POSITIVE_INFINITY;
}
var CODER_PATTERN, FAST_NAME_PATTERN, FAST_MAX_PARAMS_B = 4, COMPLEX_SIGNALS, SIMPLE_SIGNALS;
var init_ollamaRouter = __esm(() => {
  CODER_PATTERN = /(coder|codellama|codestral|starcoder|deepseek-coder|granite-?code|codegemma|codeqwen|stable-?code|code-)/i;
  FAST_NAME_PATTERN = /(tinyllama|smollm|\bphi-?\d?|gemma2?:2b|qwen2\.5:(?:0\.5|1\.5|3)b|:mini|:small)/i;
  COMPLEX_SIGNALS = /```|\b(implement|refactor|debug|fix|bug|error|stack ?trace|optimi[sz]e|algorithm|migrat|compile|build|test|deploy|architecture|class|function|async|await|import|export)\b|\.(ts|tsx|js|jsx|py|go|rs|java|cpp|cc|c|h|hpp|rb|php|cs|swift|kt|sql)\b/i;
  SIMPLE_SIGNALS = /^(hi|hello|hey|thanks|thank you|yes|no|ok|okay|what is|who is|when |where |explain |define |summar|tl;?dr)/i;
});

export { pickBestCoderModel, pickSmallFastModel, classifyTaskComplexity, recommendedCoderModelToPull, isOllamaAutoRouteEnabled, init_ollamaRouter };
