import {
  getFeatureValue_CACHED_MAY_BE_STALE,
  init_constants1 as init_constants,
  init_growthbook
} from "./index-nds05g02.js";
import {
  init_state
} from "./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/tools/ToolSearchTool/constants.ts
var TOOL_SEARCH_TOOL_NAME = "ToolSearch";
var init_constants2 = () => {};

// ../../src/tools/ToolSearchTool/prompt.ts
function getToolLocationHint() {
  const deltaEnabled = process.env.USER_TYPE === "ant" || getFeatureValue_CACHED_MAY_BE_STALE("tengu_glacier_2xr", false);
  return deltaEnabled ? "Deferred tools appear by name in <system-reminder> messages." : "Deferred tools appear by name in <available-deferred-tools> messages.";
}
function isDeferredTool(tool) {
  if (tool.alwaysLoad === true)
    return false;
  if (tool.isMcp === true)
    return true;
  if (tool.name === TOOL_SEARCH_TOOL_NAME)
    return false;
  if (false) {}
  if (false) {}
  if (false) {}
  return tool.shouldDefer === true;
}
function formatDeferredToolLine(tool) {
  return tool.name;
}
function getPrompt() {
  return PROMPT_HEAD + getToolLocationHint() + PROMPT_TAIL;
}
var PROMPT_HEAD = `Fetches full schema definitions for deferred tools so they can be called.

`, PROMPT_TAIL = ` Until fetched, only the name is known — there is no parameter schema, so the tool cannot be invoked. This tool takes a query, matches it against the deferred tool list, and returns the matched tools' complete JSONSchema definitions inside a <functions> block. Once a tool's schema appears in that result, it is callable exactly like any tool defined at the top of the prompt.

Result format: each matched tool appears as one <function>{"description": "...", "name": "...", "parameters": {...}}</function> line inside the <functions> block — the same encoding as the tool list at the top of this prompt.

Query forms:
- "select:Read,Edit,Grep" — fetch these exact tools by name
- "notebook jupyter" — keyword search, up to max_results best matches
- "+slack send" — require "slack" in the name, rank by remaining terms`;
var init_prompt = __esm(() => {
  init_state();
  init_growthbook();
  init_constants();
  init_constants2();
  init_constants2();
});

export { TOOL_SEARCH_TOOL_NAME, isDeferredTool, formatDeferredToolLine, getPrompt, init_prompt };
