import {
  init_learning,
  learnedModelForTask,
  loadStats
} from "./index-801scn8g.js";
import {
  init_intentRouter,
  routeIntent
} from "./index-5jrgxedg.js";
import {
  classifyTaskComplexity,
  init_ollamaRouter,
  pickBestCoderModel,
  pickSmallFastModel
} from "./index-f7bfe40r.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/modelRouter.ts
function deriveModelNeeds(task, category) {
  const needs = new Set;
  const clean = task.toLowerCase();
  if (category === "browser" || /\b(screenshot|image|photo|diagram|vision|visual|ui|chart|pixel|ocr)\b/.test(clean)) {
    needs.add("vision");
  }
  if (category === "coding" || category === "testing" || category === "review" || category === "security" || /\b(code|implement|refactor|function|class|bug|compile)\b/.test(clean)) {
    needs.add("code");
  }
  if (category === "memory" || /\b(embed|embedding|index|retriev|semantic search|vector)\b/.test(clean)) {
    needs.add("embeddings");
  }
  if (task.length > 2000 || /\b(whole (repo|codebase|file)|entire|long)\b/.test(clean)) {
    needs.add("long-context");
  }
  return [...needs];
}
function scoreModel(model, needs) {
  const reasons = [];
  let score = 0;
  for (const need of needs) {
    if (need === "vision") {
      if (model.likelyVision) {
        score += 5;
        reasons.push("vision-capable");
      } else {
        score -= 4;
        reasons.push("no vision support (penalized)");
      }
    }
    if (need === "code") {
      if (model.likelyCode) {
        score += 3;
        reasons.push("code-tuned");
      }
    }
    if (need === "embeddings") {
      if (model.embeddingLength && model.embeddingLength > 0) {
        score += 4;
        reasons.push(`embeddings (dim ${model.embeddingLength})`);
      } else {
        score -= 2;
      }
    }
    if (need === "long-context") {
      if (model.contextLength && model.contextLength >= LONG_CONTEXT_THRESHOLD) {
        score += 3;
        reasons.push(`large context (${model.contextLength})`);
      } else if (model.contextLength) {
        reasons.push(`context ${model.contextLength}`);
      }
    }
  }
  if (model.advertisedCapabilities.includes("tools")) {
    score += 1;
    reasons.push("advertises tools");
  }
  if (model.contextLength && model.contextLength >= LONG_CONTEXT_THRESHOLD) {
    score += 0.5;
  }
  return { name: model.name, score: Number(score.toFixed(2)), reasons };
}
function isCloudModelName(name) {
  const normalized = name.toLowerCase();
  if (/^gpt-oss([:_-]|$)/.test(normalized))
    return false;
  return /(^|[:_-])cloud($|[:_-])/.test(normalized) || /^(codex|claude|anthropic|openai)(:|-|$)/.test(normalized) || /^gpt-?(?:3(?:\.5)?|4o|4\.1|4|5)(?:[:_.-]|$)/.test(normalized) || /^(o1|o3|o4|o5)(:|-|$)/.test(normalized) || /^(gemini|mistral-large)(:|-|$)/.test(normalized);
}
function filterLocalOnlyModels(models, localOnly) {
  return localOnly ? models.filter((model) => !isCloudModelName(model.name)) : models;
}
function filterLocalOnlyNames(names, localOnly) {
  if (!names)
    return;
  return localOnly ? names.filter((name) => !isCloudModelName(name)) : names;
}
function filterModelPoolForLocalOnly(pool, localOnly) {
  if (!localOnly)
    return pool;
  return {
    ...pool.cheap ? { cheap: filterLocalOnlyNames(pool.cheap, true) ?? [] } : {},
    ...pool.strong ? { strong: filterLocalOnlyNames(pool.strong, true) ?? [] } : {},
    ...pool.default ? { default: filterLocalOnlyNames(pool.default, true) ?? [] } : {}
  };
}
function isCodeCapableModel(model) {
  return model.likelyCode || /\b(code|coder|codestral|codellama|starcoder)\b/i.test(model.name);
}
function recommendModel(task, models, options = {}) {
  const route = routeIntent(task);
  const needs = deriveModelNeeds(task, route.category);
  const routableModels = filterLocalOnlyModels(models, options.localOnly);
  const candidateModels = options.localOnly && needs.includes("code") ? routableModels.filter(isCodeCapableModel) : routableModels;
  const ranked = candidateModels.map((model) => scoreModel(model, needs)).sort((a, b) => b.score - a.score);
  const top = ranked[0] ?? null;
  const visionMissing = needs.includes("vision") && !routableModels.some((model) => model.likelyVision);
  let rationale;
  if (!top) {
    rationale = options.localOnly && needs.includes("code") ? "No local-only code-capable Ollama models found after filtering cloud and non-code models. Pull a local coding model, then re-run." : options.localOnly ? "No local-only Ollama models found after filtering cloud models. Pull a local model, then re-run." : "No local Ollama models found. Start Ollama or pull a model, then re-run.";
  } else if (needs.length === 0) {
    rationale = `No special capability needs detected for a "${route.category}" task; any installed model should work.`;
  } else if (visionMissing) {
    rationale = `This task needs vision but no installed model is vision-capable. Best available fallback is ${top.name}; consider pulling a vision model (e.g. llava, minicpm-v).`;
  } else {
    rationale = `Needs ${needs.join(", ")}; ${top.name} fits best (${top.reasons.join("; ") || "default"}).`;
  }
  return {
    task: task.trim(),
    category: route.category,
    needs,
    recommended: top?.name ?? null,
    rationale,
    ranked,
    localOnly: options.localOnly || undefined
  };
}
function shouldUseStrongModel(task) {
  const route = routeIntent(task);
  if (route.category === "planning" || route.category === "security" || route.category === "review") {
    return true;
  }
  if (/\b(plan|planning|design|architecture|strategy|roadmap|critical|risky|dangerous|debug|root cause|stack ?trace|security|vulnerab|auth|credential|secret|sandbox|permission|migrat|refactor|production|release)\b/i.test(task)) {
    return true;
  }
  return classifyTaskComplexity(task) === "complex";
}
function resolveModelForTask(task, strategy, pool, localModels, options = {}) {
  const localOnly = options.localOnly;
  if (strategy === "default")
    return filterLocalOnlyNames(pool.default, localOnly)?.[0];
  const taskNeedsCode = deriveModelNeeds(task, routeIntent(task).category).includes("code");
  const filteredLocalModels = localOnly && taskNeedsCode ? filterLocalOnlyModels(localModels, true).filter(isCodeCapableModel) : filterLocalOnlyModels(localModels, localOnly);
  const localNames = filteredLocalModels.map((m) => m.name);
  const effectivePool = filterModelPoolForLocalOnly(pool, localOnly);
  const cheapPool = effectivePool.cheap;
  const strongPool = effectivePool.strong;
  const defaultPool = effectivePool.default;
  if (strategy === "cheap") {
    return pickSmallFastModel(localNames, undefined) ?? cheapPool?.[0] ?? defaultPool?.[0];
  }
  if (strategy === "strong") {
    return pickBestCoderModel(localNames, undefined) ?? strongPool?.[0] ?? defaultPool?.[0];
  }
  if (options.cwd) {
    const learned = learnedModelForTask(loadStats(options.cwd), task);
    if (learned && (localNames.includes(learned) || cheapPool?.includes(learned) || strongPool?.includes(learned) || defaultPool?.includes(learned))) {
      return learned;
    }
  }
  return shouldUseStrongModel(task) === false ? resolveModelForTask(task, "cheap", pool, localModels, options) : resolveModelForTask(task, "strong", pool, localModels, options);
}
function formatModelRoute(result, json) {
  if (json)
    return JSON.stringify(result, null, 2);
  const lines = [
    `Task: ${result.task || "<empty>"}`,
    "",
    `Category:    ${result.category}`,
    `Capability needs: ${result.needs.length ? result.needs.join(", ") : "none detected"}`,
    `Recommended: ${result.recommended ?? "none (no local model)"}`,
    `Rationale:   ${result.rationale}`
  ];
  if (result.ranked.length > 0) {
    lines.push("");
    lines.push("Ranked models:");
    for (const model of result.ranked) {
      lines.push(`  ${model.name.padEnd(28)} ${String(model.score).padStart(6)}  ${model.reasons.join("; ")}`);
    }
  }
  if (result.recommended) {
    lines.push("");
    lines.push(`Suggested launch:
  UR_MODEL=${result.recommended} ur -p ${JSON.stringify(result.task || "your task")}`);
  }
  return lines.join(`
`);
}
var LONG_CONTEXT_THRESHOLD = 32000;
var init_modelRouter = __esm(() => {
  init_ollamaRouter();
  init_intentRouter();
  init_learning();
});

export { deriveModelNeeds, scoreModel, isCloudModelName, filterModelPoolForLocalOnly, recommendModel, shouldUseStrongModel, resolveModelForTask, formatModelRoute, init_modelRouter };
