import {
  cacheOllamaModelMetadata,
  getOllamaBaseUrl,
  getOllamaContextLengthForModel,
  init_ollamaConfig,
  init_ollamaModels
} from "./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import"./index-z5aeypvg.js";
import"./index-5jmh1e0k.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import {
  init_json,
  parseToolInputJsonLenient
} from "./index-wxsgjqjk.js";
import"./index-s1a1wahe.js";
import"./index-wred0kdg.js";
import"./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-7bd814mt.js";
import"./index-m9qhxms7.js";
import {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIUserAbortError,
  init_debug,
  init_urhq_sdk,
  logForDebugging
} from "./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/utils/model/ollamaTuning.ts
function computeOllamaNumCtx(input) {
  const {
    modelContextLength,
    estimatedPromptTokens = 0,
    maxTokens = 0,
    override,
    minCtx = MIN_AGENT_NUM_CTX
  } = input;
  const cap = (n) => modelContextLength && modelContextLength > 0 ? Math.min(n, modelContextLength) : n;
  if (override !== undefined) {
    return override > 0 ? override : undefined;
  }
  const headroom = maxTokens > 0 ? maxTokens : OUTPUT_HEADROOM_TOKENS;
  const desired = Math.max(minCtx, estimatedPromptTokens + headroom);
  return cap(bucketize(desired));
}
function bucketize(n) {
  for (const bucket of NUM_CTX_BUCKETS) {
    if (bucket >= n)
      return bucket;
  }
  return n;
}
function getOllamaNumCtxOverride(env = process.env) {
  const raw = env.UR_OLLAMA_NUM_CTX;
  if (raw === undefined || raw.trim() === "")
    return;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}
function getOllamaKeepAlive(env = process.env) {
  const raw = env.UR_OLLAMA_KEEP_ALIVE;
  if (raw === undefined || raw.trim() === "")
    return DEFAULT_OLLAMA_KEEP_ALIVE;
  const trimmed = raw.trim();
  const asNumber = Number(trimmed);
  return Number.isFinite(asNumber) ? asNumber : trimmed;
}
var MIN_AGENT_NUM_CTX = 32768, DEFAULT_OLLAMA_KEEP_ALIVE = "30m", NUM_CTX_BUCKETS, OUTPUT_HEADROOM_TOKENS = 4096;
var init_ollamaTuning = __esm(() => {
  NUM_CTX_BUCKETS = [32768, 49152, 65536, 98304, 131072, 196608, 262144];
});

// ../../src/cli/transports/kimiToolCalls.ts
function parseArgs(raw) {
  const s = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    const v = JSON.parse(s);
    return v && typeof v === "object" ? v : {};
  } catch {
    const repaired = parseToolInputJsonLenient(s);
    return repaired && typeof repaired === "object" && !Array.isArray(repaired) ? repaired : {};
  }
}
function parseKimiToolCalls(text) {
  if (!text || !text.includes("<|tool_call"))
    return { text, toolCalls: [] };
  const toolCalls = [];
  let i = 0;
  CALL_RE.lastIndex = 0;
  let cleaned = text.replace(CALL_RE, (_full, rawName, rawArgs) => {
    const name = (rawName ?? "").trim().replace(/^functions\./, "").replace(/[:.]\d+\s*$/, "").trim();
    if (name)
      toolCalls.push({ id: `kimi_${Date.now().toString(36)}_${i++}`, name, input: parseArgs(rawArgs ?? "") });
    return "";
  });
  cleaned = cleaned.replace(SECTION_RE, "").replace(STRAY_RE, "").replace(/\n{3,}/g, `

`).trim();
  return { text: cleaned, toolCalls };
}
function hasTool(availableToolNames, name) {
  if (!availableToolNames)
    return false;
  return Array.isArray(availableToolNames) ? availableToolNames.includes(name) : availableToolNames.has(name);
}
function toolNameList(availableToolNames) {
  if (!availableToolNames)
    return [];
  return Array.isArray(availableToolNames) ? availableToolNames : Array.from(availableToolNames);
}
function bestAffixToolName(name, names) {
  const lower = name.toLowerCase();
  let best;
  for (const candidate of names) {
    const c = candidate.toLowerCase();
    if (c.length < 4 || c.length >= lower.length)
      continue;
    if (lower.endsWith(c)) {
      const before = name[name.length - candidate.length - 1] ?? "";
      const first = candidate[0] ?? "";
      const caseSeam = first !== "" && first === first.toUpperCase() && /[A-Za-z]/.test(first);
      if ((!/[A-Za-z0-9]/.test(before) || caseSeam) && (!best || candidate.length > best.length)) {
        best = candidate;
        continue;
      }
    }
    if (lower.startsWith(c)) {
      const after = name[candidate.length] ?? "";
      if (!/[a-z0-9]/.test(after) && (!best || candidate.length > best.length)) {
        best = candidate;
      }
    }
  }
  return best;
}
function reconcileToolName(rawName, availableToolNames) {
  const name = (rawName ?? "").trim();
  if (!name)
    return name;
  const names = toolNameList(availableToolNames);
  if (names.length === 0)
    return name;
  if (names.includes(name))
    return name;
  const cleaned = name.replace(/^functions\./, "").replace(/[:.]\d+\s*$/, "").trim();
  if (names.includes(cleaned))
    return cleaned;
  const lower = cleaned.toLowerCase();
  const ci = names.find((candidate) => candidate.toLowerCase() === lower);
  if (ci)
    return ci;
  return bestAffixToolName(cleaned, names) ?? cleaned;
}
function sameKeys(value, required, optional = []) {
  const allowed = new Set([...required, ...optional]);
  const keys = Object.keys(value);
  return required.every((key) => Object.prototype.hasOwnProperty.call(value, key)) && keys.every((key) => allowed.has(key));
}
function hasRequiredKeys(value, required, optional = [], maxExtra = 2) {
  if (!required.every((key) => Object.prototype.hasOwnProperty.call(value, key)))
    return false;
  const allowed = new Set([...required, ...optional]);
  const extras = Object.keys(value).filter((key) => !allowed.has(key));
  return extras.length <= maxExtra;
}
function pickKeys(value, required, optional = []) {
  const allowed = new Set([...required, ...optional]);
  const out = {};
  for (const [key, v] of Object.entries(value)) {
    if (allowed.has(key))
      out[key] = v;
  }
  return out;
}
function parseJsonishString(raw) {
  try {
    return JSON.parse(`"${raw}"`);
  } catch {
    return raw.replace(/\\n/g, `
`).replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
}
function parseLooseWriteObject(trimmed) {
  const match = trimmed.match(/^\{\s*"file_path"\s*:\s*"((?:\\.|[^"\\])*)"\s*,\s*"content"\s*:\s*"([\s\S]*)"\s*\}$/);
  if (!match)
    return null;
  return {
    file_path: parseJsonishString(match[1] ?? ""),
    content: parseJsonishString(match[2] ?? "")
  };
}
function parseLooseEditObject(trimmed) {
  const match = trimmed.match(/^\{\s*(?:"replace_all"\s*:\s*(true|false)\s*,\s*)?"file_path"\s*:\s*"((?:\\.|[^"\\])*)"\s*,\s*"old_string"\s*:\s*"([\s\S]*?)"\s*,\s*"new_string"\s*:\s*"([\s\S]*)"\s*(?:,\s*"replace_all"\s*:\s*(true|false))?\s*\}$/);
  if (!match)
    return null;
  return {
    file_path: parseJsonishString(match[2] ?? ""),
    old_string: parseJsonishString(match[3] ?? ""),
    new_string: parseJsonishString(match[4] ?? ""),
    ...match[1] !== undefined || match[5] !== undefined ? { replace_all: (match[1] ?? match[5]) === "true" } : {}
  };
}
function stripCodeFences(text) {
  return text.trim().replace(/^```(?:json|JSON)?\s*\n?/, "").replace(/\n?```$/, "").trim();
}
function parseJsonObject(text) {
  const trimmed = stripCodeFences(text);
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}"))
    return null;
  try {
    const value = JSON.parse(trimmed);
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    const end = findJsonObjectEnd(trimmed, 0);
    if (end !== null && trimmed.slice(end).trim())
      return null;
    const repaired = parseToolInputJsonLenient(trimmed);
    if (repaired && typeof repaired === "object" && !Array.isArray(repaired)) {
      return repaired;
    }
    return parseLooseWriteObject(trimmed) ?? parseLooseEditObject(trimmed);
  }
}
function findJsonObjectEnd(text, start) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start;i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0)
        return i + 1;
    }
  }
  return null;
}
function nextBareJsonObjectStart(text, from) {
  let index = text.indexOf("{", from);
  while (index !== -1) {
    if (looksLikeBareJsonToolCallPrefix(text.slice(index)))
      return index;
    index = text.indexOf("{", index + 1);
  }
  return -1;
}
function removableLineRange(text, start, end) {
  const lineStart = text.lastIndexOf(`
`, start - 1) + 1;
  if (!/^[ \t]*$/.test(text.slice(lineStart, start)))
    return null;
  const after = text.slice(end).match(/^[ \t]*(?:\r?\n)?/);
  if (!after)
    return null;
  if (!after[0].includes(`
`) && end + after[0].length !== text.length)
    return null;
  return { prefixEnd: lineStart, end: end + after[0].length };
}
function objectValue(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function headerFromQuestion(question, index) {
  const stopWords = new Set([
    "a",
    "about",
    "also",
    "an",
    "are",
    "be",
    "do",
    "does",
    "for",
    "is",
    "or",
    "should",
    "support",
    "that",
    "the",
    "this",
    "to",
    "want",
    "what",
    "which",
    "with",
    "without",
    "you"
  ]);
  const word = question.replace(/[^A-Za-z0-9]+/g, " ").split(/\s+/).find((part) => part && !stopWords.has(part.toLowerCase())) ?? `Question ${index + 1}`;
  return word.slice(0, 12);
}
function stringField(input, names) {
  for (const name of names) {
    const value = input[name];
    if (typeof value === "string" && value.trim())
      return value.trim();
  }
  return "";
}
function normalizeQuestionOption(value) {
  const option = objectValue(value);
  if (!option)
    return null;
  const label = typeof option.label === "string" && option.label.trim() ? option.label.trim() : typeof option.value === "string" && option.value.trim() ? option.value.trim() : "";
  const description = typeof option.description === "string" && option.description.trim() ? option.description.trim() : label;
  if (!label || !description)
    return null;
  return {
    label,
    description,
    ...typeof option.preview === "string" ? { preview: option.preview } : {}
  };
}
function normalizeQuestion(value, index) {
  const question = objectValue(value);
  if (!question)
    return null;
  const questionText = stringField(question, [
    "question",
    "questionText",
    "question_text",
    "prompt",
    "text",
    "title",
    "message",
    "body"
  ]);
  if (!questionText || !Array.isArray(question.options))
    return null;
  const options = question.options.map(normalizeQuestionOption).filter((option) => option !== null);
  if (options.length < 2 || options.length > 4)
    return null;
  const header = typeof question.header === "string" && question.header.trim() ? question.header.trim().slice(0, 12) : headerFromQuestion(questionText, index);
  return {
    question: questionText,
    header,
    options,
    ...typeof question.multiSelect === "boolean" ? { multiSelect: question.multiSelect } : {}
  };
}
function normalizeAskUserQuestionInput(input) {
  if (!Array.isArray(input.questions) || input.questions.length < 1 || input.questions.length > 4) {
    return null;
  }
  const questions = input.questions.map(normalizeQuestion);
  if (questions.some((question) => question === null))
    return null;
  return {
    questions,
    ...objectValue(input.metadata) ? { metadata: input.metadata } : {}
  };
}
function stringArray(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : null;
}
function numberish(value) {
  return typeof value === "number" || typeof value === "string";
}
function booleanish(value) {
  return typeof value === "boolean" || typeof value === "string";
}
function normalizeBashInput(input) {
  if (!sameKeys(input, ["command"], [
    "description",
    "timeout",
    "run_in_background",
    "dangerouslyDisableSandbox"
  ]) || typeof input.command !== "string" || input.description !== undefined && typeof input.description !== "string" || input.timeout !== undefined && !numberish(input.timeout) || input.run_in_background !== undefined && !booleanish(input.run_in_background) || input.dangerouslyDisableSandbox !== undefined && !booleanish(input.dangerouslyDisableSandbox)) {
    return null;
  }
  return input;
}
function normalizeReadInput(input) {
  if (!sameKeys(input, ["file_path"], ["offset", "limit", "pages"]) || typeof input.file_path !== "string" || input.offset !== undefined && !numberish(input.offset) || input.limit !== undefined && !numberish(input.limit) || input.pages !== undefined && typeof input.pages !== "string") {
    return null;
  }
  return input;
}
function normalizeGlobInput(input) {
  if (!sameKeys(input, ["pattern"], ["path"]) || typeof input.pattern !== "string" || input.path !== undefined && typeof input.path !== "string") {
    return null;
  }
  return input;
}
function normalizeGrepInput(input) {
  const optional = [
    "path",
    "glob",
    "type",
    "output_mode",
    "-i",
    "-n",
    "-A",
    "-B",
    "-C",
    "head_limit",
    "multiline"
  ];
  if (!sameKeys(input, ["pattern"], optional) || typeof input.pattern !== "string" || input.path !== undefined && typeof input.path !== "string" || input.glob !== undefined && typeof input.glob !== "string" || input.type !== undefined && typeof input.type !== "string" || input.output_mode !== undefined && typeof input.output_mode !== "string" || input["-i"] !== undefined && !booleanish(input["-i"]) || input["-n"] !== undefined && !booleanish(input["-n"]) || input["-A"] !== undefined && !numberish(input["-A"]) || input["-B"] !== undefined && !numberish(input["-B"]) || input["-C"] !== undefined && !numberish(input["-C"]) || input.head_limit !== undefined && !numberish(input.head_limit) || input.multiline !== undefined && !booleanish(input.multiline)) {
    return null;
  }
  return input;
}
function normalizeTaskUpdateInput(input) {
  const updateFields = [
    "subject",
    "description",
    "activeForm",
    "status",
    "addBlocks",
    "addBlockedBy",
    "owner",
    "metadata"
  ];
  const allowedStatuses = new Set(["pending", "in_progress", "completed", "deleted"]);
  if (!sameKeys(input, ["taskId"], updateFields) || typeof input.taskId !== "string" || !updateFields.some((field) => Object.prototype.hasOwnProperty.call(input, field)) || input.subject !== undefined && typeof input.subject !== "string" || input.description !== undefined && typeof input.description !== "string" || input.activeForm !== undefined && typeof input.activeForm !== "string" || input.status !== undefined && (typeof input.status !== "string" || !allowedStatuses.has(input.status)) || input.addBlocks !== undefined && !stringArray(input.addBlocks) || input.addBlockedBy !== undefined && !stringArray(input.addBlockedBy) || input.owner !== undefined && typeof input.owner !== "string" || input.metadata !== undefined && !objectValue(input.metadata)) {
    return null;
  }
  return input;
}
function maybeBareJsonToolCall(text, availableToolNames, index) {
  const input = parseJsonObject(text);
  if (!input)
    return null;
  if (hasTool(availableToolNames, "TaskCreate") && sameKeys(input, ["subject", "description"], ["activeForm", "metadata"]) && typeof input.subject === "string" && typeof input.description === "string" && (input.activeForm === undefined || typeof input.activeForm === "string") && (input.metadata === undefined || typeof input.metadata === "object" && input.metadata !== null && !Array.isArray(input.metadata))) {
    return { id: `bare_${Date.now().toString(36)}_${index}`, name: "TaskCreate", input };
  }
  if (hasTool(availableToolNames, "Write") && hasRequiredKeys(input, ["file_path", "content"]) && typeof input.file_path === "string" && typeof input.content === "string") {
    return {
      id: `bare_${Date.now().toString(36)}_${index}`,
      name: "Write",
      input: pickKeys(input, ["file_path", "content"])
    };
  }
  if (hasTool(availableToolNames, "Edit") && hasRequiredKeys(input, ["file_path", "old_string", "new_string"], ["replace_all"]) && typeof input.file_path === "string" && typeof input.old_string === "string" && typeof input.new_string === "string" && (input.replace_all === undefined || typeof input.replace_all === "boolean")) {
    return {
      id: `bare_${Date.now().toString(36)}_${index}`,
      name: "Edit",
      input: pickKeys(input, ["file_path", "old_string", "new_string"], ["replace_all"])
    };
  }
  if (hasTool(availableToolNames, "AskUserQuestion")) {
    const askInput = normalizeAskUserQuestionInput(input);
    if (askInput) {
      return {
        id: `bare_${Date.now().toString(36)}_${index}`,
        name: "AskUserQuestion",
        input: askInput
      };
    }
  }
  if (hasTool(availableToolNames, "Bash")) {
    const bashInput = normalizeBashInput(input);
    if (bashInput) {
      return {
        id: `bare_${Date.now().toString(36)}_${index}`,
        name: "Bash",
        input: bashInput
      };
    }
  }
  if (hasTool(availableToolNames, "Read")) {
    const readInput = normalizeReadInput(input);
    if (readInput) {
      return {
        id: `bare_${Date.now().toString(36)}_${index}`,
        name: "Read",
        input: readInput
      };
    }
  }
  if (hasTool(availableToolNames, "TaskUpdate")) {
    const taskUpdateInput = normalizeTaskUpdateInput(input);
    if (taskUpdateInput) {
      return {
        id: `bare_${Date.now().toString(36)}_${index}`,
        name: "TaskUpdate",
        input: taskUpdateInput
      };
    }
  }
  if (hasTool(availableToolNames, "Glob")) {
    const globInput = normalizeGlobInput(input);
    if (globInput) {
      return {
        id: `bare_${Date.now().toString(36)}_${index}`,
        name: "Glob",
        input: globInput
      };
    }
  }
  if (hasTool(availableToolNames, "Grep")) {
    const grepInput = normalizeGrepInput(input);
    if (grepInput) {
      return {
        id: `bare_${Date.now().toString(36)}_${index}`,
        name: "Grep",
        input: grepInput
      };
    }
  }
  return null;
}
function looksLikeBareJsonToolCallPrefix(text) {
  const trimmed = text.trimStart();
  if (trimmed.startsWith("```"))
    return true;
  if (!trimmed.startsWith("{"))
    return false;
  return /^\{\s*"(?:subject|description|file_path|content|old_string|new_string|replace_all|questions|command|taskId|status|pattern|path|glob)"\s*:/.test(trimmed);
}
function parseBareJsonToolCalls(text, options) {
  if (!text || !options.parseBareJsonToolCalls)
    return { text, toolCalls: [] };
  const wholeCall = maybeBareJsonToolCall(text, options.availableToolNames, 0);
  if (wholeCall) {
    return { text: "", toolCalls: [wholeCall] };
  }
  const toolCalls = [];
  let cleaned = "";
  let index = 0;
  let searchFrom = 0;
  while (searchFrom < text.length) {
    const start = nextBareJsonObjectStart(text, searchFrom);
    if (start === -1) {
      cleaned += text.slice(searchFrom);
      break;
    }
    const end = findJsonObjectEnd(text, start);
    if (end === null) {
      const tailCall = maybeBareJsonToolCall(text.slice(start), options.availableToolNames, index);
      if (!tailCall) {
        cleaned += text.slice(searchFrom);
        break;
      }
      const lineRange2 = removableLineRange(text, start, text.length);
      cleaned += text.slice(searchFrom, lineRange2?.prefixEnd ?? start);
      toolCalls.push(tailCall);
      index++;
      searchFrom = lineRange2?.end ?? text.length;
      continue;
    }
    const candidate = text.slice(start, end);
    const call = maybeBareJsonToolCall(candidate, options.availableToolNames, index);
    if (!call) {
      cleaned += text.slice(searchFrom, start + 1);
      searchFrom = start + 1;
      continue;
    }
    const lineRange = removableLineRange(text, start, end);
    cleaned += text.slice(searchFrom, lineRange?.prefixEnd ?? start);
    toolCalls.push(call);
    index++;
    searchFrom = lineRange?.end ?? end;
  }
  return { text: toolCalls.length > 0 ? cleaned.replace(/\n{3,}/g, `

`) : text, toolCalls };
}
function parseTextToolCalls(text, options = {}) {
  const kimi = parseKimiToolCalls(text);
  const bare = parseBareJsonToolCalls(kimi.text, options);
  return {
    text: bare.text,
    toolCalls: [...kimi.toolCalls, ...bare.toolCalls]
  };
}
function clarifyHeader(question) {
  const word = question.replace(/[^A-Za-z0-9]+/g, " ").split(/\s+/).find((part) => part && !CLARIFY_HEADER_STOP_WORDS.has(part.toLowerCase()));
  return (word ?? "Options").slice(0, 12);
}
function cleanOption(raw) {
  let opt = raw.trim();
  opt = opt.replace(/^[\s"'`*_\-–—]+/, "").replace(/[\s"'`*_.?!,;:]+$/g, "");
  for (let i = 0;i < 3; i++) {
    const before = opt;
    opt = opt.replace(OPTION_LEADIN_RE, "").replace(OPTION_QUESTION_LEADIN_RE, "");
    if (opt === before)
      break;
  }
  opt = opt.replace(OPTION_TRAILING_QUALIFIER_RE, "");
  opt = opt.replace(/\b(?:instead|please|etc\.?)$/i, "");
  return opt.replace(/[\s,;:]+$/g, "").trim();
}
function splitEnumeration(s) {
  if (!/\bor\b/i.test(s))
    return null;
  const parts = s.split(/\s*,?\s+or\s+|\s*,\s*/gi).map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2 ? parts : null;
}
function extractClarifyOptions(text) {
  const trimmed = text.trim();
  if (!trimmed)
    return [];
  const clauses = trimmed.split(/(?<=[?.!;])\s+/).map((c) => c.trim()).filter(Boolean);
  const options = [];
  for (const clause of clauses) {
    const stripped = clause.replace(OPTION_LEADIN_RE, "");
    const candidates = splitEnumeration(stripped) ?? [stripped];
    for (const candidate of candidates) {
      const cleaned = cleanOption(candidate);
      if (!cleaned || cleaned.length > 120)
        continue;
      if (OPTION_CATCHALL_RE.test(cleaned))
        continue;
      options.push(cleaned);
    }
  }
  const seen = new Set;
  const unique = [];
  for (const opt of options) {
    const key = opt.toLowerCase();
    if (seen.has(key))
      continue;
    seen.add(key);
    unique.push(opt);
    if (unique.length === 4)
      break;
  }
  return unique;
}
function buildClarifyQuestion(segment) {
  const s = segment.replace(/^\s*(?:\d+[.)]|[-*•])\s+/, "").replace(/\*\*/g, "").trim();
  const qEnd = s.indexOf("?");
  if (qEnd === -1)
    return null;
  const question = s.slice(0, qEnd + 1).trim();
  const remainder = s.slice(qEnd + 1).trim();
  let options = extractClarifyOptions(remainder);
  if (options.length < 2) {
    const inner = question.replace(/\?+$/, "");
    const lastClause = (inner.split(/(?<=[.!;])\s+/).pop() ?? inner).trim();
    if (/\bor\b/i.test(lastClause)) {
      const inline = extractClarifyOptions(lastClause + ".");
      if (inline.length >= 2)
        options = inline;
    }
  }
  if (options.length < 2)
    return null;
  return {
    question,
    header: clarifyHeader(question),
    options: options.map((label) => ({ label, description: label }))
  };
}
function parseClarifyingQuestions(text, options = {}) {
  if (!hasTool(options.availableToolNames, "AskUserQuestion"))
    return null;
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > CLARIFY_MAX_LEN)
    return null;
  if (trimmed.includes("```") || trimmed.includes("<|"))
    return null;
  const lines = trimmed.split(`
`).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0 || !lines[lines.length - 1].endsWith("?"))
    return null;
  const isListItem = (l) => /^(?:\d+[.)]|[-*•])\s+/.test(l);
  let segments;
  if (lines.some(isListItem)) {
    segments = [];
    for (const line of lines) {
      if (isListItem(line) || segments.length === 0)
        segments.push(line);
      else
        segments[segments.length - 1] += " " + line;
    }
  } else {
    segments = trimmed.split(/\n{2,}/).map((s) => s.replace(/\n/g, " ").trim()).filter((s) => s.includes("?"));
    if (segments.length === 0)
      segments = [trimmed.replace(/\n/g, " ")];
  }
  const questions = [];
  const seenQuestions = new Set;
  for (const segment of segments) {
    if (questions.length === 4)
      break;
    const built = buildClarifyQuestion(segment);
    if (!built)
      continue;
    const key = built.question.toLowerCase();
    if (seenQuestions.has(key))
      continue;
    seenQuestions.add(key);
    questions.push(built);
  }
  if (questions.length === 0)
    return null;
  return {
    id: `clarify_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    name: "AskUserQuestion",
    input: { questions }
  };
}
var SECTION_RE, CALL_RE, STRAY_RE, CLARIFY_MAX_LEN = 2000, OPTION_LEADIN_RE, OPTION_QUESTION_LEADIN_RE, OPTION_CATCHALL_RE, OPTION_TRAILING_QUALIFIER_RE, CLARIFY_HEADER_STOP_WORDS;
var init_kimiToolCalls = __esm(() => {
  init_json();
  SECTION_RE = /<\|tool_calls_section_begin\|>([\s\S]*?)<\|tool_calls_section_end\|>/g;
  CALL_RE = /<\|tool_call_begin\|>([\s\S]*?)<\|tool_call_argument_begin\|>([\s\S]*?)<\|tool_call_end\|>/g;
  STRAY_RE = /<\|tool_calls?_section_(?:begin|end)\|>|<\|tool_call_(?:begin|end|argument_begin)\|>/g;
  OPTION_LEADIN_RE = /^(?:and\s+)?(?:or|also|just|maybe|perhaps|either|alternatively|optionally|well)\b[\s,:]*/i;
  OPTION_QUESTION_LEADIN_RE = /^(?:(?:do|would|should|could|can|will)\s+(?:you|we|i)\s+(?:want|prefer|like|need|use|go\s+with|have)?|you\s+(?:could|can|might|may)|i\s+(?:could|can|would|might)|we\s+(?:could|can|might)|want|prefer|pick|choose|use|go\s+with|how\s+about|what\s+about)\b[\s,:]*/i;
  OPTION_CATCHALL_RE = /^(?:(?:or\s+)?(?:something|anything|someone)\s+else|other(?:\s+option)?|none(?:\s+of\s+(?:the\s+)?(?:above|these))?|no|nope|not\s+sure|any(?:thing)?|else|you\s+(?:choose|decide|pick)|your\s+(?:call|choice))$/i;
  OPTION_TRAILING_QUALIFIER_RE = /\s+(?:is|are|would\s+be|seems?|sounds?|looks?)\s+(?:the\s+)?(?:simplest|easiest|best|recommended|fastest|cleanest|most\s+\w+)(?:\s+(?:option|choice|approach))?$/i;
  CLARIFY_HEADER_STOP_WORDS = new Set([
    "a",
    "about",
    "also",
    "an",
    "and",
    "are",
    "be",
    "can",
    "could",
    "do",
    "does",
    "for",
    "i",
    "is",
    "or",
    "should",
    "support",
    "that",
    "the",
    "this",
    "to",
    "want",
    "we",
    "what",
    "which",
    "with",
    "without",
    "would",
    "you"
  ]);
});

// ../../src/services/api/ollama.ts
import { randomUUID } from "crypto";
function createOllamaURHQClient(options) {
  if (options?.baseUrlOverride) {
    ollamaBaseUrlOverride = options.baseUrlOverride;
  }
  return {
    beta: {
      messages: {
        create(params, options2) {
          if (params.stream) {
            return createStreamingRequest(params, options2);
          }
          return createNonStreamingRequest(params, options2);
        },
        async countTokens(params) {
          return {
            input_tokens: estimateInputTokens(params)
          };
        }
      }
    }
  };
}
function getEffectiveOllamaBaseUrl() {
  return ollamaBaseUrlOverride ?? getOllamaBaseUrl();
}
function createStreamingRequest(params, options) {
  const controller = createLinkedAbortController(options);
  const responsePromise = fetchOllamaChat(params, true, controller, options);
  return {
    async withResponse() {
      const response = await responsePromise;
      const requestId = `ollama-${randomUUID()}`;
      return {
        data: createURHQStream(response, params, controller, requestId, options),
        request_id: requestId,
        response
      };
    }
  };
}
async function createNonStreamingRequest(params, options) {
  const controller = createLinkedAbortController(options);
  const response = await fetchOllamaChat(params, false, controller, options);
  const json = await response.json();
  if (json.error) {
    throw new Error(json.error);
  }
  return ollamaResponseToURHQMessage(json, params);
}
async function fetchOllamaChat(params, stream, controller, options) {
  const timeout = getOllamaRequestTimeoutMs(options);
  const timeoutId = timeout > 0 ? setTimeout(() => controller.abort(), timeout) : undefined;
  try {
    const capabilities = await getOllamaModelCapabilities(params.model, controller.signal);
    const response = await fetch(`${getEffectiveOllamaBaseUrl()}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(toOllamaChatRequest(params, stream, capabilities)),
      signal: controller.signal
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw createOllamaHTTPError(response.status, body, response.statusText);
    }
    return response;
  } catch (error) {
    if (controller.signal.aborted) {
      if (options?.signal?.aborted) {
        throw new APIUserAbortError;
      }
      throw new APIConnectionTimeoutError({ message: "Ollama request timed out" });
    }
    if (error instanceof APIConnectionError || error instanceof APIConnectionTimeoutError || error instanceof APIUserAbortError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new APIConnectionError({ message: error.message, cause: error });
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
function createOllamaHTTPError(status, body, statusText) {
  const rawMessage = extractOllamaHTTPErrorMessage(body) || statusText;
  if (isOllamaGatewayTimeout(status, rawMessage)) {
    return new APIConnectionTimeoutError({
      message: OLLAMA_GATEWAY_TIMEOUT_MESSAGE,
      cause: new Error(`Ollama request failed (${status}): ${rawMessage}`)
    });
  }
  return new Error(`Ollama request failed (${status}): ${rawMessage}`);
}
function extractOllamaHTTPErrorMessage(body) {
  if (!body.trim()) {
    return "";
  }
  try {
    const parsed = JSON.parse(body);
    if (typeof parsed.error === "string") {
      return parsed.error;
    }
  } catch {}
  return body;
}
function isOllamaGatewayTimeout(status, message) {
  if (status !== 502 && status !== 504) {
    return false;
  }
  return /operation timed out|read:.*timed out|timeout|deadline exceeded/i.test(message);
}
function createLinkedAbortController(options) {
  const controller = new AbortController;
  const signal = options?.signal;
  if (!signal) {
    return controller;
  }
  if (signal.aborted) {
    controller.abort();
    return controller;
  }
  signal.addEventListener("abort", () => controller.abort(), { once: true });
  return controller;
}
function getOllamaRequestTimeoutMs(options, env = process.env) {
  if (options?.timeout !== undefined) {
    return options.timeout;
  }
  const override = parseInt(env.API_TIMEOUT_MS || "", 10);
  if (override > 0) {
    return override;
  }
  return isTruthyEnv(env.UR_CODE_REMOTE) ? REMOTE_OLLAMA_REQUEST_TIMEOUT_MS : DEFAULT_OLLAMA_REQUEST_TIMEOUT_MS;
}
function isTruthyEnv(value) {
  if (!value) {
    return false;
  }
  return !["0", "false", "no", "off"].includes(value.toLowerCase());
}
function toOllamaChatRequest(params, stream, capabilities) {
  const supportsTools = modelCapabilityEnabled(capabilities, "tools");
  const tools = supportsTools ? toOllamaTools(params.tools) : [];
  const toolsRequested = (params.tools?.length ?? 0) > 0;
  const toolsDropped = toolsRequested && !supportsTools;
  if (toolsDropped && !warnedToolsUnsupportedModels.has(params.model)) {
    warnedToolsUnsupportedModels.add(params.model);
    logForDebugging(`Ollama model "${params.model}" does not advertise the 'tools' capability; ` + "tool definitions are not sent and tool calls fall back to text parsing. " + "Expect degraded agent behavior — prefer a tools-capable model (check with: ollama show <model>).", { level: "warn" });
  }
  const systemMessage = {
    role: "system",
    content: systemToText(params.system) + (toolsDropped ? TEXT_TOOL_CALL_HINT : "")
  };
  const think = getOllamaThink(params, capabilities);
  const request = {
    model: params.model,
    messages: [
      systemMessage,
      ...messagesToOllama(params.messages, modelCapabilityEnabled(capabilities, "vision"))
    ].filter((message) => message.role === "tool" || message.content.trim() !== "" || (message.images?.length ?? 0) > 0 || (message.tool_calls?.length ?? 0) > 0),
    stream,
    ...tools.length > 0 ? { tools } : {},
    ...think !== undefined ? { think } : {}
  };
  const options = {};
  if (typeof params.temperature === "number") {
    options.temperature = params.temperature;
  }
  if (typeof params.max_tokens === "number") {
    options.num_predict = params.max_tokens;
  }
  const numCtx = computeOllamaNumCtx({
    modelContextLength: getOllamaContextLengthForModel(params.model),
    estimatedPromptTokens: estimateInputTokens(params),
    maxTokens: typeof params.max_tokens === "number" ? params.max_tokens : undefined,
    override: getOllamaNumCtxOverride()
  });
  if (numCtx !== undefined) {
    options.num_ctx = numCtx;
  }
  if (Object.keys(options).length > 0) {
    request.options = options;
  }
  const keepAlive = getOllamaKeepAlive();
  if (keepAlive !== undefined) {
    request.keep_alive = keepAlive;
  }
  const format = getOllamaFormat(params);
  if (format !== undefined) {
    request.format = format;
  }
  return request;
}
function systemToText(system) {
  if (!system) {
    return "";
  }
  if (typeof system === "string") {
    return system;
  }
  return system.map((block) => block.text).join(`

`);
}
function messagesToOllama(messages, supportsVision) {
  const result = [];
  const toolNamesById = new Map;
  for (const message of messages) {
    if (message.role === "assistant") {
      const textParts2 = [];
      const toolCalls = [];
      const content2 = message.content;
      if (typeof content2 === "string") {
        textParts2.push(content2);
      } else {
        for (const block of content2) {
          if (block.type === "text") {
            textParts2.push(block.text);
          } else if (block.type === "tool_use") {
            toolNamesById.set(block.id, block.name);
            toolCalls.push({
              function: {
                name: block.name,
                arguments: block.input
              }
            });
          }
        }
      }
      result.push({
        role: "assistant",
        content: textParts2.filter(Boolean).join(`

`),
        ...toolCalls.length > 0 ? { tool_calls: toolCalls } : {}
      });
      continue;
    }
    const content = message.content;
    if (typeof content === "string") {
      result.push({ role: "user", content });
      continue;
    }
    const textParts = [];
    const images = [];
    const toolMessages = [];
    for (const block of content) {
      switch (block.type) {
        case "text":
          textParts.push(block.text);
          break;
        case "tool_result": {
          const toolName = toolNamesById.get(block.tool_use_id) ?? block.tool_use_id;
          toolMessages.push({
            role: "tool",
            content: contentBlockToText(block.content),
            tool_name: toolName
          });
          break;
        }
        case "image":
          if (supportsVision && block.source.type === "base64") {
            images.push(block.source.data);
          } else if (!supportsVision) {
            textParts.push("[Image input omitted: selected Ollama model does not advertise vision support]");
          } else {
            textParts.push("[Image input omitted: unsupported image source]");
          }
          break;
        case "document":
          textParts.push("[Document input omitted: Ollama adapter does not support document blocks]");
          break;
      }
    }
    for (const toolMessage of toolMessages) {
      result.push(toolMessage);
    }
    const text = textParts.filter(Boolean).join(`

`);
    if (text || images.length > 0) {
      result.push({
        role: "user",
        content: text,
        ...images.length > 0 ? { images } : {}
      });
    }
  }
  return result;
}
function toOllamaTools(tools) {
  if (!tools) {
    return [];
  }
  const result = [];
  for (const tool of tools) {
    if (!("name" in tool) || !("input_schema" in tool)) {
      continue;
    }
    result.push({
      type: "function",
      function: {
        name: tool.name,
        description: "description" in tool ? tool.description : undefined,
        parameters: sanitizeJsonSchema(tool.input_schema)
      }
    });
  }
  return result;
}
function getAvailableToolNames(tools) {
  const names = new Set;
  for (const tool of tools ?? []) {
    if ("name" in tool && typeof tool.name === "string") {
      names.add(tool.name);
    }
  }
  return names;
}
function sanitizeJsonSchema(schema) {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) {
    return { type: "object", properties: {} };
  }
  const clone = JSON.parse(JSON.stringify(schema));
  delete clone.cache_control;
  delete clone.strict;
  delete clone.defer_loading;
  delete clone.eager_input_streaming;
  return clone;
}
function getOllamaFormat(params) {
  const outputConfig = params.output_config;
  const format = outputConfig?.format;
  if (!format) {
    return;
  }
  if (format.type === "json_schema" && format.schema) {
    return format.schema;
  }
  if (format.type === "json_object") {
    return "json";
  }
  return;
}
function getOllamaThink(params, capabilities) {
  const thinking = params.thinking;
  const supportsThinking = modelCapabilityEnabled(capabilities, "thinking");
  if (capabilities && !supportsThinking) {
    return;
  }
  if (thinking && thinking.type !== "disabled") {
    return true;
  }
  if (supportsThinking) {
    return false;
  }
  return;
}
function modelCapabilityEnabled(capabilities, capability) {
  return capabilities?.has(capability) ?? true;
}
async function getOllamaModelCapabilities(model, signal) {
  const normalizedModel = model.trim();
  if (!normalizedModel) {
    return null;
  }
  if (ollamaModelCapabilitiesCache.has(normalizedModel)) {
    return ollamaModelCapabilitiesCache.get(normalizedModel) ?? null;
  }
  try {
    const response = await fetch(`${getEffectiveOllamaBaseUrl()}/api/show`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: normalizedModel }),
      signal
    });
    if (!response.ok) {
      ollamaModelCapabilitiesCache.set(normalizedModel, null);
      return null;
    }
    const body = await response.json();
    cacheOllamaModelMetadata(normalizedModel, body);
    const capabilities = parseOllamaModelCapabilities(body);
    ollamaModelCapabilitiesCache.set(normalizedModel, capabilities);
    return capabilities;
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    ollamaModelCapabilitiesCache.set(normalizedModel, null);
    return null;
  }
}
function parseOllamaModelCapabilities(value) {
  if (!value || typeof value !== "object" || !("capabilities" in value)) {
    return null;
  }
  const capabilities = value.capabilities;
  if (!Array.isArray(capabilities)) {
    return null;
  }
  return new Set(capabilities.flatMap((capability) => typeof capability === "string" && capability.trim() ? [capability.trim()] : []));
}
function createURHQStream(response, params, controller, requestId, options) {
  const stream = {
    controller,
    async* [Symbol.asyncIterator]() {
      yield* streamURHQEvents(response, params, controller, requestId, options);
    }
  };
  return stream;
}
async function* streamURHQEvents(response, params, controller, requestId, options) {
  const usage = emptyUsage();
  yield {
    type: "message_start",
    message: {
      id: requestId,
      type: "message",
      role: "assistant",
      model: params.model,
      content: [],
      stop_reason: null,
      stop_sequence: null,
      usage
    }
  };
  let textStarted = false;
  let thinkingStarted = false;
  let text = "";
  let thinking = "";
  let emittedLen = 0;
  let inToolSection = false;
  let activeBlock = null;
  let blockIndex = 0;
  let finalChunk;
  const toolCalls = [];
  const availableToolNames = getAvailableToolNames(params.tools);
  const textToolCalls = [];
  let pendingVisibleText = "";
  const textEvents = (value) => {
    if (!value)
      return [];
    const events = [];
    stopActiveBlock(events, "thinking");
    if (activeBlock !== "text") {
      textStarted = true;
      activeBlock = "text";
      events.push({
        type: "content_block_start",
        index: blockIndex,
        content_block: { type: "text", text: "" }
      });
    }
    events.push({
      type: "content_block_delta",
      index: blockIndex,
      delta: { type: "text_delta", text: value }
    });
    return events;
  };
  const thinkingEvents = (value) => {
    if (!value)
      return [];
    const events = [];
    stopActiveBlock(events, "text");
    if (activeBlock !== "thinking") {
      thinkingStarted = true;
      activeBlock = "thinking";
      events.push({
        type: "content_block_start",
        index: blockIndex,
        content_block: { type: "thinking", thinking: "", signature: "" }
      });
    }
    events.push({
      type: "content_block_delta",
      index: blockIndex,
      delta: { type: "thinking_delta", thinking: value }
    });
    return events;
  };
  const stopActiveBlock = (events, expected) => {
    if (!activeBlock || expected && activeBlock !== expected) {
      return;
    }
    events.push({
      type: "content_block_stop",
      index: blockIndex
    });
    blockIndex++;
    activeBlock = null;
  };
  const drainPendingVisibleText = (final = false) => {
    const events = [];
    const options2 = {
      availableToolNames,
      parseBareJsonToolCalls: true
    };
    while (pendingVisibleText) {
      if (looksLikeBareJsonToolCallPrefix(pendingVisibleText)) {
        const parsed2 = parseBareJsonToolCalls(pendingVisibleText, options2);
        if (parsed2.toolCalls.length > 0) {
          textToolCalls.push(...parsed2.toolCalls);
          pendingVisibleText = parsed2.text;
          continue;
        }
        if (!final)
          break;
      }
      const newlineIdx = pendingVisibleText.indexOf(`
`);
      if (newlineIdx === -1)
        break;
      const line = pendingVisibleText.slice(0, newlineIdx + 1);
      pendingVisibleText = pendingVisibleText.slice(newlineIdx + 1);
      const parsed = parseBareJsonToolCalls(line, options2);
      textToolCalls.push(...parsed.toolCalls);
      events.push(...textEvents(parsed.text));
    }
    if (final && pendingVisibleText) {
      const parsed = parseBareJsonToolCalls(pendingVisibleText, options2);
      textToolCalls.push(...parsed.toolCalls);
      events.push(...textEvents(parsed.text));
      pendingVisibleText = "";
    } else if (pendingVisibleText && !looksLikeBareJsonToolCallPrefix(pendingVisibleText)) {
      events.push(...textEvents(pendingVisibleText));
      pendingVisibleText = "";
    }
    return events;
  };
  for await (const chunk of readOllamaChunks(response, controller, getOllamaRequestTimeoutMs(options), options)) {
    if (chunk.error) {
      throw new Error(chunk.error);
    }
    const thinkingDelta = chunk.message?.thinking ?? "";
    if (thinkingDelta) {
      thinking += thinkingDelta;
      for (const event of thinkingEvents(thinkingDelta)) {
        yield event;
      }
    }
    if (chunk.message?.tool_calls) {
      mergeToolCalls(toolCalls, chunk.message.tool_calls);
    }
    const deltaText = chunk.message?.content ?? "";
    if (deltaText) {
      text += deltaText;
      if (!inToolSection) {
        const markerIdx = text.indexOf("<|tool_call");
        if (markerIdx !== -1)
          inToolSection = true;
        const proseEnd = markerIdx === -1 ? text.length : markerIdx;
        const toEmit = text.slice(emittedLen, proseEnd);
        if (toEmit) {
          emittedLen += toEmit.length;
          pendingVisibleText += toEmit;
          for (const event of drainPendingVisibleText()) {
            yield event;
          }
        }
      }
    }
    if (chunk.done) {
      finalChunk = chunk;
    }
  }
  for (const event of drainPendingVisibleText(true)) {
    yield event;
  }
  if (activeBlock) {
    const events = [];
    stopActiveBlock(events);
    for (const event of events) {
      yield event;
    }
  }
  const kimiParsed = parseKimiToolCalls(text);
  textToolCalls.push(...kimiParsed.toolCalls);
  if (toolCalls.length > 0 && textToolCalls.length > 0) {
    const structuredKeys = new Set(toolCalls.filter((c) => c.function?.name).map((c) => `${reconcileToolName(c.function.name, availableToolNames)}\x00${toolArgsKey(typeof c.function?.arguments === "string" ? parseToolInput(c.function.arguments) : c.function?.arguments ?? {})}`));
    const deduped = textToolCalls.filter((tc) => !structuredKeys.has(`${reconcileToolName(tc.name, availableToolNames)}\x00${toolArgsKey(tc.input ?? {})}`));
    if (deduped.length !== textToolCalls.length) {
      logForDebugging(`Ollama: dropped ${textToolCalls.length - deduped.length} text-form tool call(s) duplicating native tool_calls`);
      textToolCalls.length = 0;
      textToolCalls.push(...deduped);
    }
  }
  if (toolCalls.length === 0 && textToolCalls.length === 0) {
    const clarify = parseClarifyingQuestions(text, { availableToolNames });
    if (clarify)
      textToolCalls.push(clarify);
  }
  for (const call of toolCalls) {
    const rawName = call.function?.name;
    if (!rawName) {
      continue;
    }
    const name = reconcileToolName(rawName, availableToolNames);
    const input = stringifyToolInput(call.function?.arguments ?? {});
    yield {
      type: "content_block_start",
      index: blockIndex,
      content_block: {
        type: "tool_use",
        id: `toolu_ollama_${randomUUID().replace(/-/g, "")}`,
        name,
        input: {}
      }
    };
    if (input) {
      yield {
        type: "content_block_delta",
        index: blockIndex,
        delta: { type: "input_json_delta", partial_json: input }
      };
    }
    yield {
      type: "content_block_stop",
      index: blockIndex
    };
    blockIndex++;
  }
  for (const tc of textToolCalls) {
    yield {
      type: "content_block_start",
      index: blockIndex,
      content_block: {
        type: "tool_use",
        id: tc.id,
        name: reconcileToolName(tc.name, availableToolNames),
        input: {}
      }
    };
    const inputJson = JSON.stringify(tc.input ?? {});
    if (inputJson && inputJson !== "{}") {
      yield {
        type: "content_block_delta",
        index: blockIndex,
        delta: { type: "input_json_delta", partial_json: inputJson }
      };
    }
    yield {
      type: "content_block_stop",
      index: blockIndex
    };
    blockIndex++;
  }
  if (!textStarted && !thinkingStarted && toolCalls.length === 0 && textToolCalls.length === 0) {
    yield {
      type: "content_block_start",
      index: blockIndex,
      content_block: { type: "text", text: "" }
    };
    yield {
      type: "content_block_stop",
      index: blockIndex
    };
  }
  yield {
    type: "message_delta",
    delta: {
      stop_reason: textToolCalls.length > 0 ? "tool_use" : getStopReason(finalChunk, toolCalls),
      stop_sequence: null
    },
    usage: usageFromOllama(finalChunk, text + thinking)
  };
  yield {
    type: "message_stop"
  };
}
async function* readOllamaChunks(response, controller, timeoutMs, options) {
  if (!response.body) {
    return;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder;
  let buffer = "";
  const deadline = timeoutMs > 0 ? Date.now() + timeoutMs : Infinity;
  try {
    while (true) {
      const { done, value } = await readWithDeadline(reader, deadline, controller, options);
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      let newlineIndex = buffer.indexOf(`
`);
      while (newlineIndex !== -1) {
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);
        if (line) {
          yield JSON.parse(line);
        }
        newlineIndex = buffer.indexOf(`
`);
      }
    }
    buffer += decoder.decode();
    const finalLine = buffer.trim();
    if (finalLine) {
      yield JSON.parse(finalLine);
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {}
  }
}
async function readWithDeadline(reader, deadline, controller, options) {
  if (!Number.isFinite(deadline)) {
    return reader.read();
  }
  if (controller.signal.aborted) {
    throw options?.signal?.aborted ? new APIUserAbortError : new APIConnectionTimeoutError({ message: "Ollama stream timed out" });
  }
  const remaining = deadline - Date.now();
  if (remaining <= 0) {
    controller.abort();
    throw new APIConnectionTimeoutError({ message: "Ollama stream timed out" });
  }
  let timeoutId;
  try {
    return await Promise.race([
      reader.read(),
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          const error = new APIConnectionTimeoutError({
            message: "Ollama stream timed out"
          });
          reject(error);
          controller.abort();
          reader.cancel(error).catch(() => {
            return;
          });
        }, remaining);
      })
    ]);
  } catch (error) {
    if (controller.signal.aborted && options?.signal?.aborted) {
      throw new APIUserAbortError;
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
function ollamaResponseToURHQMessage(response, params) {
  const content = [];
  const structured = response.message?.tool_calls ?? [];
  const thinking = response.message?.thinking ?? "";
  const availableToolNames = getAvailableToolNames(params.tools);
  const kimi = parseTextToolCalls(response.message?.content ?? "", {
    availableToolNames,
    parseBareJsonToolCalls: true
  });
  const text = kimi.text;
  const clarifyCall = structured.length === 0 && kimi.toolCalls.length === 0 ? parseClarifyingQuestions(text, { availableToolNames }) : null;
  if (thinking) {
    content.push({
      type: "thinking",
      thinking,
      signature: ""
    });
  }
  if (text || !structured.length && !kimi.toolCalls.length) {
    content.push({ type: "text", text });
  }
  for (const call of structured) {
    const rawName = call.function?.name;
    if (!rawName) {
      continue;
    }
    content.push({
      type: "tool_use",
      id: `toolu_ollama_${randomUUID().replace(/-/g, "")}`,
      name: reconcileToolName(rawName, availableToolNames),
      input: parseToolInput(call.function?.arguments ?? {})
    });
  }
  for (const tc of kimi.toolCalls) {
    content.push({
      type: "tool_use",
      id: tc.id,
      name: reconcileToolName(tc.name, availableToolNames),
      input: tc.input
    });
  }
  if (clarifyCall) {
    content.push({
      type: "tool_use",
      id: clarifyCall.id,
      name: clarifyCall.name,
      input: clarifyCall.input
    });
  }
  return {
    id: `ollama-${randomUUID()}`,
    type: "message",
    role: "assistant",
    model: response.model ?? params.model,
    content,
    stop_reason: kimi.toolCalls.length > 0 || clarifyCall ? "tool_use" : getStopReason(response, structured),
    stop_sequence: null,
    usage: usageFromOllama(response, text + thinking)
  };
}
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isEmptyToolArgs(value) {
  if (value === undefined || value === null)
    return true;
  if (typeof value === "string")
    return value.trim() === "";
  if (isPlainObject(value))
    return Object.keys(value).length === 0;
  return false;
}
function toolArgsKey(value) {
  if (typeof value === "string")
    return value;
  try {
    return JSON.stringify(sortKeysDeep(value ?? {}));
  } catch {
    return String(value);
  }
}
function sortKeysDeep(value) {
  if (Array.isArray(value))
    return value.map(sortKeysDeep);
  if (isPlainObject(value)) {
    const sorted = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortKeysDeep(value[key]);
    }
    return sorted;
  }
  return value;
}
function mergeToolCalls(target, incoming) {
  for (const current of incoming) {
    const fn = current?.function;
    if (!fn) {
      continue;
    }
    const name = fn.name;
    const args = fn.arguments;
    const last = target[target.length - 1];
    if (!name) {
      if (!last?.function) {
        continue;
      }
      const prev = last.function.arguments;
      if (typeof prev === "string" && typeof args === "string") {
        last.function.arguments = prev + args;
      } else if (isPlainObject(prev) && isPlainObject(args)) {
        last.function.arguments = { ...prev, ...args };
      } else if (isEmptyToolArgs(prev) && !isEmptyToolArgs(args)) {
        last.function.arguments = args;
      }
      continue;
    }
    if (last?.function?.name === name && typeof args === "string" && typeof last.function.arguments === "string") {
      last.function.arguments = last.function.arguments + args;
      continue;
    }
    const key = toolArgsKey(args);
    const duplicate = target.some((t) => t.function?.name === name && toolArgsKey(t.function?.arguments) === key);
    if (duplicate) {
      continue;
    }
    if (isEmptyToolArgs(args) && last?.function?.name === name && !isEmptyToolArgs(last.function.arguments)) {
      continue;
    }
    target.push({ function: { name, arguments: args ?? {} } });
  }
}
function getStopReason(response, toolCalls) {
  if (toolCalls.some((call) => call.function?.name)) {
    return "tool_use";
  }
  return response?.done_reason === "length" ? "max_tokens" : "end_turn";
}
function usageFromOllama(response, text) {
  const usage = emptyUsage();
  usage.input_tokens = response?.prompt_eval_count ?? 0;
  usage.output_tokens = response?.eval_count ?? Math.max(1, Math.ceil(text.length / 4));
  return usage;
}
function emptyUsage() {
  return {
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_input_tokens: 0,
    cache_read_input_tokens: 0,
    server_tool_use: { web_search_requests: 0, web_fetch_requests: 0 },
    service_tier: null,
    cache_creation: {
      ephemeral_1h_input_tokens: 0,
      ephemeral_5m_input_tokens: 0
    }
  };
}
function contentBlockToText(content) {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map((block) => {
      if (block && typeof block === "object" && "type" in block) {
        if (block.type === "text" && "text" in block) {
          return String(block.text);
        }
        if (block.type === "image") {
          return "[Image output omitted]";
        }
      }
      return stringifyToolInput(block);
    }).join(`
`);
  }
  return stringifyToolInput(content);
}
function estimateInputTokens(params) {
  const parts = [
    systemToText(params.system),
    ...(params.messages ?? []).map(messageToTokenText),
    JSON.stringify(toOllamaTools(params.tools))
  ].filter(Boolean);
  const chars = parts.join(`

`).length;
  return Math.max(1, Math.ceil(chars / 4));
}
function messageToTokenText(message) {
  const content = message.content;
  if (typeof content === "string") {
    return content;
  }
  return content.map((block) => {
    switch (block.type) {
      case "text":
        return block.text;
      case "tool_use":
        return `${block.name} ${stringifyToolInput(block.input)}`;
      case "tool_result":
        return contentBlockToText(block.content);
      case "image":
        return "[image]";
      case "document":
        return "[document]";
      default:
        return stringifyToolInput(block);
    }
  }).join(`
`);
}
function stringifyToolInput(input) {
  if (typeof input === "string") {
    return input;
  }
  return JSON.stringify(input ?? {});
}
function parseToolInput(input) {
  if (typeof input !== "string") {
    return input ?? {};
  }
  const parsed = parseToolInputJsonLenient(input);
  if (parsed === null && input.trim().length > 0) {
    logForDebugging(`Ollama tool call arguments failed to parse even after repair: ${input.slice(0, 200)}`, { level: "warn" });
  }
  return parsed ?? {};
}
var DEFAULT_OLLAMA_REQUEST_TIMEOUT_MS = 300000, REMOTE_OLLAMA_REQUEST_TIMEOUT_MS = 120000, OLLAMA_GATEWAY_TIMEOUT_MESSAGE = "Ollama gateway timed out while waiting for the model to respond. Check the selected Ollama endpoint or increase API_TIMEOUT_MS if the model needs more time.", ollamaModelCapabilitiesCache, ollamaBaseUrlOverride, warnedToolsUnsupportedModels, TEXT_TOOL_CALL_HINT;
var init_ollama = __esm(() => {
  init_urhq_sdk();
  init_ollamaModels();
  init_ollamaConfig();
  init_ollamaTuning();
  init_kimiToolCalls();
  init_json();
  init_debug();
  ollamaModelCapabilitiesCache = new Map;
  warnedToolsUnsupportedModels = new Set;
  TEXT_TOOL_CALL_HINT = [
    "",
    "IMPORTANT: This runtime could not register native tool-calling for the current model.",
    "To invoke a tool, output ONLY a single-line JSON object with that tool’s arguments, e.g.:",
    '{"file_path": "/abs/path/file.py", "content": "full file content"}   (Write)',
    '{"file_path": "/abs/path/file.py", "old_string": "before", "new_string": "after"}   (Edit)',
    '{"command": "ls -la"}   (Bash)',
    "Escape newlines inside JSON strings as \\n. Do not wrap the JSON in prose or code fences."
  ].join(`
`);
});
init_ollama();

export {
  mergeToolCalls,
  getOllamaRequestTimeoutMs,
  getEffectiveOllamaBaseUrl,
  createOllamaURHQClient
};
