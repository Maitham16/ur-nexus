import {
  FILE_EDIT_TOOL_NAME,
  FileReadTool,
  asAgentId,
  clearAllDumpState,
  clearAllPendingCallbacks,
  clearAllPlanSlugs,
  clearAllSessions,
  clearCommandPrefixCaches,
  clearCommandsCache,
  clearDynamicSkills,
  clearSessionEnvVars,
  clearSessionMetadata,
  clearStoredImagePaths,
  createEmptyAttributionState,
  createUserMessage,
  evictTaskOutput,
  executeSessionEndHooks,
  getAgentTranscriptPath,
  getCurrentWorktreeSession,
  getGitStatus,
  getSessionEndHookTimeoutMs,
  getSessionStartDate,
  getSystemContext,
  getUserContext,
  hasToolCallsInLastAssistantTurn,
  initTaskOutputAsSymlink,
  init_FileReadTool,
  init_LSPDiagnosticRegistry,
  init_LocalAgentTask,
  init_Shell,
  init_agentmd,
  init_attachments,
  init_commands,
  init_commands1 as init_commands2,
  init_commitAttribution,
  init_common,
  init_constants,
  init_context,
  init_diskOutput,
  init_dumpPrompts,
  init_guards,
  init_hooks,
  init_ids,
  init_imageStore,
  init_loadSkillsDir,
  init_markdownConfigLoader,
  init_messages1 as init_messages,
  init_plans,
  init_postCompactCleanup,
  init_postSamplingHooks,
  init_promptCacheBreakDetection,
  init_runAgent,
  init_sessionEnvVars,
  init_sessionIngress,
  init_sessionStart,
  init_sessionStorage,
  init_types1 as init_types,
  init_useSwarmPermissionPoller,
  init_worktree,
  isInProcessTeammateTask,
  isLocalAgentTask,
  isLocalShellTask,
  processSessionStartHooks,
  require_ignore,
  resetAllLSPDiagnosticState,
  resetGetMemoryFilesCache,
  resetPromptCacheBreakDetection,
  resetSentSkillNames,
  resetSessionFilePointer,
  runAgent,
  runPostCompactCleanup,
  saveWorktreeState,
  setCwd,
  setSystemPromptInjection
} from "./index-3xrbnz6c.js";
import {
  cloneFileStateCache,
  init_fileStateCache
} from "./index-kkermbsd.js";
import"./index-gph76kef.js";
import"./index-2j7c2ame.js";
import"./index-61fyyngt.js";
import {
  init_ripgrep
} from "./index-6hrfermc.js";
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
import {
  clearRepositoryCaches,
  init_detectRepository
} from "./index-5jrp51k1.js";
import {
  init_config,
  init_path,
  init_sequential,
  init_settings1 as init_settings,
  sequential
} from "./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import"./index-z5aeypvg.js";
import {
  init_analytics,
  logEvent
} from "./index-5jmh1e0k.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-wxsgjqjk.js";
import {
  clearResolveGitDirCache,
  init_git,
  init_gitFilesystem
} from "./index-s1a1wahe.js";
import {
  init_execFileNoThrow
} from "./index-wred0kdg.js";
import {
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import {
  init_log,
  logError
} from "./index-4bphgmcc.js";
import"./index-7bd814mt.js";
import"./index-m9qhxms7.js";
import {
  getFsImplementation,
  getURConfigHomeDir,
  init_debug,
  init_envUtils,
  init_errors,
  init_fsOperations,
  isFsInaccessible
} from "./index-5h7w9qkc.js";
import {
  clearInvokedSkills,
  createSignal,
  getLastMainRequestId,
  getOriginalCwd,
  getSessionId,
  init_signal,
  init_state,
  regenerateSessionId,
  setLastEmittedDate
} from "./index-nhjg91p1.js";
import {
  __esm,
  __require,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/native-ts/file-index/index.ts
class FileIndex {
  paths = [];
  lowerPaths = [];
  charBits = new Int32Array(0);
  pathLens = new Uint16Array(0);
  topLevelCache = null;
  readyCount = 0;
  loadFromFileList(fileList) {
    const seen = new Set;
    const paths = [];
    for (const line of fileList) {
      if (line.length > 0 && !seen.has(line)) {
        seen.add(line);
        paths.push(line);
      }
    }
    this.buildIndex(paths);
  }
  loadFromFileListAsync(fileList) {
    let markQueryable = () => {};
    const queryable = new Promise((resolve) => {
      markQueryable = resolve;
    });
    const done = this.buildAsync(fileList, markQueryable);
    return { queryable, done };
  }
  async buildAsync(fileList, markQueryable) {
    const seen = new Set;
    const paths = [];
    let chunkStart = performance.now();
    for (let i = 0;i < fileList.length; i++) {
      const line = fileList[i];
      if (line.length > 0 && !seen.has(line)) {
        seen.add(line);
        paths.push(line);
      }
      if ((i & 255) === 255 && performance.now() - chunkStart > CHUNK_MS) {
        await yieldToEventLoop();
        chunkStart = performance.now();
      }
    }
    this.resetArrays(paths);
    chunkStart = performance.now();
    let firstChunk = true;
    for (let i = 0;i < paths.length; i++) {
      this.indexPath(i);
      if ((i & 255) === 255 && performance.now() - chunkStart > CHUNK_MS) {
        this.readyCount = i + 1;
        if (firstChunk) {
          markQueryable();
          firstChunk = false;
        }
        await yieldToEventLoop();
        chunkStart = performance.now();
      }
    }
    this.readyCount = paths.length;
    markQueryable();
  }
  buildIndex(paths) {
    this.resetArrays(paths);
    for (let i = 0;i < paths.length; i++) {
      this.indexPath(i);
    }
    this.readyCount = paths.length;
  }
  resetArrays(paths) {
    const n = paths.length;
    this.paths = paths;
    this.lowerPaths = new Array(n);
    this.charBits = new Int32Array(n);
    this.pathLens = new Uint16Array(n);
    this.readyCount = 0;
    this.topLevelCache = computeTopLevelEntries(paths, TOP_LEVEL_CACHE_LIMIT);
  }
  indexPath(i) {
    const lp = this.paths[i].toLowerCase();
    this.lowerPaths[i] = lp;
    const len = lp.length;
    this.pathLens[i] = len;
    let bits = 0;
    for (let j = 0;j < len; j++) {
      const c = lp.charCodeAt(j);
      if (c >= 97 && c <= 122)
        bits |= 1 << c - 97;
    }
    this.charBits[i] = bits;
  }
  search(query, limit) {
    if (limit <= 0)
      return [];
    if (query.length === 0) {
      if (this.topLevelCache) {
        return this.topLevelCache.slice(0, limit);
      }
      return [];
    }
    const caseSensitive = query !== query.toLowerCase();
    const needle = caseSensitive ? query : query.toLowerCase();
    const nLen = Math.min(needle.length, MAX_QUERY_LEN);
    const needleChars = new Array(nLen);
    let needleBitmap = 0;
    for (let j = 0;j < nLen; j++) {
      const ch = needle.charAt(j);
      needleChars[j] = ch;
      const cc = ch.charCodeAt(0);
      if (cc >= 97 && cc <= 122)
        needleBitmap |= 1 << cc - 97;
    }
    const scoreCeiling = nLen * (SCORE_MATCH + BONUS_BOUNDARY) + BONUS_FIRST_CHAR + 32;
    const topK = [];
    let threshold = -Infinity;
    const { paths, lowerPaths, charBits, pathLens, readyCount } = this;
    outer:
      for (let i = 0;i < readyCount; i++) {
        if ((charBits[i] & needleBitmap) !== needleBitmap)
          continue;
        const haystack = caseSensitive ? paths[i] : lowerPaths[i];
        let pos = haystack.indexOf(needleChars[0]);
        if (pos === -1)
          continue;
        posBuf[0] = pos;
        let gapPenalty = 0;
        let consecBonus = 0;
        let prev = pos;
        for (let j = 1;j < nLen; j++) {
          pos = haystack.indexOf(needleChars[j], prev + 1);
          if (pos === -1)
            continue outer;
          posBuf[j] = pos;
          const gap = pos - prev - 1;
          if (gap === 0)
            consecBonus += BONUS_CONSECUTIVE;
          else
            gapPenalty += PENALTY_GAP_START + gap * PENALTY_GAP_EXTENSION;
          prev = pos;
        }
        if (topK.length === limit && scoreCeiling + consecBonus - gapPenalty <= threshold) {
          continue;
        }
        const path = paths[i];
        const hLen = pathLens[i];
        let score = nLen * SCORE_MATCH + consecBonus - gapPenalty;
        score += scoreBonusAt(path, posBuf[0], true);
        for (let j = 1;j < nLen; j++) {
          score += scoreBonusAt(path, posBuf[j], false);
        }
        score += Math.max(0, 32 - (hLen >> 2));
        if (topK.length < limit) {
          topK.push({ path, fuzzScore: score });
          if (topK.length === limit) {
            topK.sort((a, b) => a.fuzzScore - b.fuzzScore);
            threshold = topK[0].fuzzScore;
          }
        } else if (score > threshold) {
          let lo = 0;
          let hi = topK.length;
          while (lo < hi) {
            const mid = lo + hi >> 1;
            if (topK[mid].fuzzScore < score)
              lo = mid + 1;
            else
              hi = mid;
          }
          topK.splice(lo, 0, { path, fuzzScore: score });
          topK.shift();
          threshold = topK[0].fuzzScore;
        }
      }
    topK.sort((a, b) => b.fuzzScore - a.fuzzScore);
    const matchCount = topK.length;
    const denom = Math.max(matchCount, 1);
    const results = new Array(matchCount);
    for (let i = 0;i < matchCount; i++) {
      const path = topK[i].path;
      const positionScore = i / denom;
      const finalScore = path.includes("test") ? Math.min(positionScore * 1.05, 1) : positionScore;
      results[i] = { path, score: finalScore };
    }
    return results;
  }
}
function scoreBonusAt(path, pos, first) {
  if (pos === 0)
    return first ? BONUS_FIRST_CHAR : 0;
  const prevCh = path.charCodeAt(pos - 1);
  if (isBoundary(prevCh))
    return BONUS_BOUNDARY;
  if (isLower(prevCh) && isUpper(path.charCodeAt(pos)))
    return BONUS_CAMEL;
  return 0;
}
function isBoundary(code) {
  return code === 47 || code === 92 || code === 45 || code === 95 || code === 46 || code === 32;
}
function isLower(code) {
  return code >= 97 && code <= 122;
}
function isUpper(code) {
  return code >= 65 && code <= 90;
}
function yieldToEventLoop() {
  return new Promise((resolve) => setImmediate(resolve));
}
function computeTopLevelEntries(paths, limit) {
  const topLevel = new Set;
  for (const p of paths) {
    let end = p.length;
    for (let i = 0;i < p.length; i++) {
      const c = p.charCodeAt(i);
      if (c === 47 || c === 92) {
        end = i;
        break;
      }
    }
    const segment = p.slice(0, end);
    if (segment.length > 0) {
      topLevel.add(segment);
      if (topLevel.size >= limit)
        break;
    }
  }
  const sorted = Array.from(topLevel);
  sorted.sort((a, b) => {
    const lenDiff = a.length - b.length;
    if (lenDiff !== 0)
      return lenDiff;
    return a < b ? -1 : a > b ? 1 : 0;
  });
  return sorted.slice(0, limit).map((path) => ({ path, score: 0 }));
}
var SCORE_MATCH = 16, BONUS_BOUNDARY = 8, BONUS_CAMEL = 6, BONUS_CONSECUTIVE = 4, BONUS_FIRST_CHAR = 8, PENALTY_GAP_START = 3, PENALTY_GAP_EXTENSION = 1, TOP_LEVEL_CACHE_LIMIT = 100, MAX_QUERY_LEN = 64, CHUNK_MS = 4, posBuf;
var init_file_index = __esm(() => {
  posBuf = new Int32Array(MAX_QUERY_LEN);
});

// ../../src/hooks/fileSuggestions.ts
function clearFileSuggestionCaches() {
  fileIndex = null;
  fileListRefreshPromise = null;
  cacheGeneration++;
  untrackedFetchPromise = null;
  cachedTrackedFiles = [];
  cachedConfigFiles = [];
  cachedTrackedDirs = [];
  indexBuildComplete.clear();
  ignorePatternsCache = null;
  ignorePatternsCacheKey = null;
  lastRefreshMs = 0;
  lastGitIndexMtime = null;
  loadedTrackedSignature = null;
  loadedMergedSignature = null;
}
var import_ignore, fileIndex = null, fileListRefreshPromise = null, indexBuildComplete, onIndexBuildComplete, cacheGeneration = 0, untrackedFetchPromise = null, cachedTrackedFiles, cachedConfigFiles, cachedTrackedDirs, ignorePatternsCache = null, ignorePatternsCacheKey = null, lastRefreshMs = 0, lastGitIndexMtime = null, loadedTrackedSignature = null, loadedMergedSignature = null;
var init_fileSuggestions = __esm(() => {
  init_markdownConfigLoader();
  init_file_index();
  init_analytics();
  init_config();
  init_cwd();
  init_debug();
  init_errors();
  init_execFileNoThrow();
  init_fsOperations();
  init_git();
  init_hooks();
  init_log();
  init_path();
  init_ripgrep();
  init_settings();
  init_signal();
  import_ignore = __toESM(require_ignore(), 1);
  indexBuildComplete = createSignal();
  onIndexBuildComplete = indexBuildComplete.subscribe;
  cachedTrackedFiles = [];
  cachedConfigFiles = [];
  cachedTrackedDirs = [];
});

// ../../src/services/MagicDocs/prompts.ts
import { join } from "path";
function getUpdatePromptTemplate() {
  return `IMPORTANT: This message and these instructions are NOT part of the actual user conversation. Do NOT include any references to "documentation updates", "magic docs", or these update instructions in the document content.

Based on the user conversation above (EXCLUDING this documentation update instruction message), update the Magic Doc file to incorporate any NEW learnings, insights, or information that would be valuable to preserve.

The file {{docPath}} has already been read for you. Here are its current contents:
<current_doc_content>
{{docContents}}
</current_doc_content>

Document title: {{docTitle}}
{{customInstructions}}

Your ONLY task is to use the Edit tool to update the documentation file if there is substantial new information to add, then stop. You can make multiple edits (update multiple sections as needed) - make all Edit tool calls in parallel in a single message. If there's nothing substantial to add, simply respond with a brief explanation and do not call any tools.

CRITICAL RULES FOR EDITING:
- Preserve the Magic Doc header exactly as-is: # MAGIC DOC: {{docTitle}}
- If there's an italicized line immediately after the header, preserve it exactly as-is
- Keep the document CURRENT with the latest state of the codebase - this is NOT a changelog or history
- Update information IN-PLACE to reflect the current state - do NOT append historical notes or track changes over time
- Remove or replace outdated information rather than adding "Previously..." or "Updated to..." notes
- Clean up or DELETE sections that are no longer relevant or don't align with the document's purpose
- Fix obvious errors: typos, grammar mistakes, broken formatting, incorrect information, or confusing statements
- Keep the document well organized: use clear headings, logical section order, consistent formatting, and proper nesting

DOCUMENTATION PHILOSOPHY - READ CAREFULLY:
- BE TERSE. High signal only. No filler words or unnecessary elaboration.
- Documentation is for OVERVIEWS, ARCHITECTURE, and ENTRY POINTS - not detailed code walkthroughs
- Do NOT duplicate information that's already obvious from reading the source code
- Do NOT document every function, parameter, or line number reference
- Focus on: WHY things exist, HOW components connect, WHERE to start reading, WHAT patterns are used
- Skip: detailed implementation steps, exhaustive API docs, play-by-play narratives

What TO document:
- High-level architecture and system design
- Non-obvious patterns, conventions, or gotchas
- Key entry points and where to start reading code
- Important design decisions and their rationale
- Critical dependencies or integration points
- References to related files, docs, or code (like a wiki) - help readers navigate to relevant context

What NOT to document:
- Anything obvious from reading the code itself
- Exhaustive lists of files, functions, or parameters
- Step-by-step implementation details
- Low-level code mechanics
- Information already in UR.md or other project docs

Use the Edit tool with file_path: {{docPath}}

REMEMBER: Only update if there is substantial new information. The Magic Doc header (# MAGIC DOC: {{docTitle}}) must remain unchanged.`;
}
async function loadMagicDocsPrompt() {
  const fs = getFsImplementation();
  const promptPath = join(getURConfigHomeDir(), "magic-docs", "prompt.md");
  try {
    return await fs.readFile(promptPath, { encoding: "utf-8" });
  } catch {
    return getUpdatePromptTemplate();
  }
}
function substituteVariables(template, variables) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => Object.prototype.hasOwnProperty.call(variables, key) ? variables[key] : match);
}
async function buildMagicDocsUpdatePrompt(docContents, docPath, docTitle, instructions) {
  const promptTemplate = await loadMagicDocsPrompt();
  const customInstructions = instructions ? `

DOCUMENT-SPECIFIC UPDATE INSTRUCTIONS:
The document author has provided specific instructions for how this file should be updated. Pay extra attention to these instructions and follow them carefully:

"${instructions}"

These instructions take priority over the general rules below. Make sure your updates align with these specific guidelines.` : "";
  const variables = {
    docContents,
    docPath,
    docTitle,
    customInstructions
  };
  return substituteVariables(promptTemplate, variables);
}
var init_prompts = __esm(() => {
  init_envUtils();
  init_fsOperations();
});

// ../../src/services/MagicDocs/magicDocs.ts
function clearTrackedMagicDocs() {
  trackedMagicDocs.clear();
}
function detectMagicDocHeader(content) {
  const match = content.match(MAGIC_DOC_HEADER_PATTERN);
  if (!match || !match[1]) {
    return null;
  }
  const title = match[1].trim();
  const headerEndIndex = match.index + match[0].length;
  const afterHeader = content.slice(headerEndIndex);
  const nextLineMatch = afterHeader.match(/^\s*\n(?:\s*\n)?(.+?)(?:\n|$)/);
  if (nextLineMatch && nextLineMatch[1]) {
    const nextLine = nextLineMatch[1];
    const italicsMatch = nextLine.match(ITALICS_PATTERN);
    if (italicsMatch && italicsMatch[1]) {
      const instructions = italicsMatch[1].trim();
      return {
        title,
        instructions
      };
    }
  }
  return { title };
}
function getMagicDocsAgent() {
  return {
    agentType: "magic-docs",
    whenToUse: "Update Magic Docs",
    tools: [FILE_EDIT_TOOL_NAME],
    model: "modelS",
    source: "built-in",
    baseDir: "built-in",
    getSystemPrompt: () => ""
  };
}
async function updateMagicDoc(docInfo, context) {
  const { messages, systemPrompt, userContext, systemContext, toolUseContext } = context;
  const clonedReadFileState = cloneFileStateCache(toolUseContext.readFileState);
  clonedReadFileState.delete(docInfo.path);
  const clonedToolUseContext = {
    ...toolUseContext,
    readFileState: clonedReadFileState
  };
  let currentDoc = "";
  try {
    const result = await FileReadTool.call({ file_path: docInfo.path }, clonedToolUseContext);
    const output = result.data;
    if (output.type === "text") {
      currentDoc = output.file.content;
    }
  } catch (e) {
    if (isFsInaccessible(e) || e instanceof Error && e.message.startsWith("File does not exist")) {
      trackedMagicDocs.delete(docInfo.path);
      return;
    }
    throw e;
  }
  const detected = detectMagicDocHeader(currentDoc);
  if (!detected) {
    trackedMagicDocs.delete(docInfo.path);
    return;
  }
  const userPrompt = await buildMagicDocsUpdatePrompt(currentDoc, docInfo.path, detected.title, detected.instructions);
  const canUseTool = async (tool, input) => {
    if (tool.name === FILE_EDIT_TOOL_NAME && typeof input === "object" && input !== null && "file_path" in input) {
      const filePath = input.file_path;
      if (typeof filePath === "string" && filePath === docInfo.path) {
        return { behavior: "allow", updatedInput: input };
      }
    }
    return {
      behavior: "deny",
      message: `only ${FILE_EDIT_TOOL_NAME} is allowed for ${docInfo.path}`,
      decisionReason: {
        type: "other",
        reason: `only ${FILE_EDIT_TOOL_NAME} is allowed`
      }
    };
  };
  for await (const _message of runAgent({
    agentDefinition: getMagicDocsAgent(),
    promptMessages: [createUserMessage({ content: userPrompt })],
    toolUseContext: clonedToolUseContext,
    canUseTool,
    isAsync: true,
    forkContextMessages: messages,
    querySource: "magic_docs",
    override: {
      systemPrompt,
      userContext,
      systemContext
    },
    availableTools: clonedToolUseContext.options.tools
  })) {}
}
var MAGIC_DOC_HEADER_PATTERN, ITALICS_PATTERN, trackedMagicDocs, updateMagicDocs;
var init_magicDocs = __esm(() => {
  init_runAgent();
  init_constants();
  init_FileReadTool();
  init_errors();
  init_fileStateCache();
  init_postSamplingHooks();
  init_messages();
  init_sequential();
  init_prompts();
  MAGIC_DOC_HEADER_PATTERN = /^#\s*MAGIC\s+DOC:\s*(.+)$/im;
  ITALICS_PATTERN = /^[_*](.+?)[_*]\s*$/m;
  trackedMagicDocs = new Map;
  updateMagicDocs = sequential(async function(context) {
    const { messages, querySource } = context;
    if (querySource !== "repl_main_thread") {
      return;
    }
    const hasToolCalls = hasToolCallsInLastAssistantTurn(messages);
    if (hasToolCalls) {
      return;
    }
    const docCount = trackedMagicDocs.size;
    if (docCount === 0) {
      return;
    }
    for (const docInfo of Array.from(trackedMagicDocs.values())) {
      await updateMagicDoc(docInfo, context);
    }
  });
});

// ../../src/commands/clear/caches.ts
function clearSessionCaches(preservedAgentIds = new Set) {
  const hasPreserved = preservedAgentIds.size > 0;
  getUserContext.cache.clear?.();
  getSystemContext.cache.clear?.();
  getGitStatus.cache.clear?.();
  getSessionStartDate.cache.clear?.();
  clearFileSuggestionCaches();
  clearCommandsCache();
  if (!hasPreserved)
    resetPromptCacheBreakDetection();
  setSystemPromptInjection(null);
  setLastEmittedDate(null);
  runPostCompactCleanup();
  resetSentSkillNames();
  resetGetMemoryFilesCache("session_start");
  clearStoredImagePaths();
  clearAllSessions();
  if (!hasPreserved)
    clearAllPendingCallbacks();
  if (process.env.USER_TYPE === "ant") {
    import("./TungstenTool-8f5965xm.js").then(({ clearSessionsWithTungstenUsage, resetInitializationState }) => {
      clearSessionsWithTungstenUsage();
      resetInitializationState();
    });
  }
  if (false) {}
  clearRepositoryCaches();
  clearCommandPrefixCaches();
  if (!hasPreserved)
    clearAllDumpState();
  clearInvokedSkills(preservedAgentIds);
  clearResolveGitDirCache();
  clearDynamicSkills();
  resetAllLSPDiagnosticState();
  clearTrackedMagicDocs();
  clearSessionEnvVars();
  import("./utils-r93e1zp4.js").then(({ clearWebFetchCache }) => clearWebFetchCache());
  import("./ToolSearchTool-re4s8y5b.js").then(({ clearToolSearchDescriptionCache }) => clearToolSearchDescriptionCache());
  import("./loadAgentsDir-vr10ey2q.js").then(({ clearAgentDefinitionsCache }) => clearAgentDefinitionsCache());
  import("./prompt-hrssjqjz.js").then(({ clearPromptCache }) => clearPromptCache());
}
var init_caches = __esm(() => {
  init_state();
  init_commands2();
  init_common();
  init_context();
  init_fileSuggestions();
  init_useSwarmPermissionPoller();
  init_dumpPrompts();
  init_promptCacheBreakDetection();
  init_sessionIngress();
  init_postCompactCleanup();
  init_LSPDiagnosticRegistry();
  init_magicDocs();
  init_loadSkillsDir();
  init_attachments();
  init_commands();
  init_agentmd();
  init_detectRepository();
  init_gitFilesystem();
  init_imageStore();
  init_sessionEnvVars();
});

// ../../src/commands/clear/conversation.ts
import { randomUUID } from "crypto";
async function clearConversation({
  setMessages,
  readFileState,
  discoveredSkillNames,
  loadedNestedMemoryPaths,
  getAppState,
  setAppState,
  setConversationId
}) {
  const sessionEndTimeoutMs = getSessionEndHookTimeoutMs();
  await executeSessionEndHooks("clear", {
    getAppState,
    setAppState,
    signal: AbortSignal.timeout(sessionEndTimeoutMs),
    timeoutMs: sessionEndTimeoutMs
  });
  const lastRequestId = getLastMainRequestId();
  if (lastRequestId) {
    logEvent("tengu_cache_eviction_hint", {
      scope: "conversation_clear",
      last_request_id: lastRequestId
    });
  }
  const preservedAgentIds = new Set;
  const preservedLocalAgents = [];
  const shouldKillTask = (task) => ("isBackgrounded" in task) && task.isBackgrounded === false;
  if (getAppState) {
    for (const task of Object.values(getAppState().tasks)) {
      if (shouldKillTask(task))
        continue;
      if (isLocalAgentTask(task)) {
        preservedAgentIds.add(task.agentId);
        preservedLocalAgents.push(task);
      } else if (isInProcessTeammateTask(task)) {
        preservedAgentIds.add(task.identity.agentId);
      }
    }
  }
  setMessages(() => []);
  if (false) {}
  if (setConversationId) {
    setConversationId(randomUUID());
  }
  clearSessionCaches(preservedAgentIds);
  setCwd(getOriginalCwd());
  readFileState.clear();
  discoveredSkillNames?.clear();
  loadedNestedMemoryPaths?.clear();
  if (setAppState) {
    setAppState((prev) => {
      const nextTasks = {};
      for (const [taskId, task] of Object.entries(prev.tasks)) {
        if (!shouldKillTask(task)) {
          nextTasks[taskId] = task;
          continue;
        }
        try {
          if (task.status === "running") {
            if (isLocalShellTask(task)) {
              task.shellCommand?.kill();
              task.shellCommand?.cleanup();
              if (task.cleanupTimeoutId) {
                clearTimeout(task.cleanupTimeoutId);
              }
            }
            if ("abortController" in task) {
              task.abortController?.abort();
            }
            if ("unregisterCleanup" in task) {
              task.unregisterCleanup?.();
            }
          }
        } catch (error) {
          logError(error);
        }
        evictTaskOutput(taskId);
      }
      return {
        ...prev,
        tasks: nextTasks,
        attribution: createEmptyAttributionState(),
        standaloneAgentContext: undefined,
        fileHistory: {
          snapshots: [],
          trackedFiles: new Set,
          snapshotSequence: 0
        },
        mcp: {
          clients: [],
          tools: [],
          commands: [],
          resources: {},
          pluginReconnectKey: prev.mcp.pluginReconnectKey
        }
      };
    });
  }
  clearAllPlanSlugs();
  clearSessionMetadata();
  regenerateSessionId({ setCurrentAsParent: true });
  if (process.env.USER_TYPE === "ant" && process.env.UR_CODE_SESSION_ID) {
    process.env.UR_CODE_SESSION_ID = getSessionId();
  }
  await resetSessionFilePointer();
  for (const task of preservedLocalAgents) {
    if (task.status !== "running")
      continue;
    initTaskOutputAsSymlink(task.id, getAgentTranscriptPath(asAgentId(task.agentId)));
  }
  if (false) {}
  const worktreeSession = getCurrentWorktreeSession();
  if (worktreeSession) {
    saveWorktreeState(worktreeSession);
  }
  const hookMessages = await processSessionStartHooks("clear");
  if (hookMessages.length > 0) {
    setMessages(() => hookMessages);
  }
}
var init_conversation = __esm(() => {
  init_state();
  init_analytics();
  init_types();
  init_LocalAgentTask();
  init_guards();
  init_ids();
  init_commitAttribution();
  init_hooks();
  init_log();
  init_plans();
  init_Shell();
  init_sessionStart();
  init_sessionStorage();
  init_diskOutput();
  init_worktree();
  init_caches();
});

// ../../src/commands/clear/clear.ts
var call = async (_, context) => {
  await clearConversation(context);
  return { type: "text", value: "" };
};
var init_clear = __esm(() => {
  init_conversation();
});
init_clear();

export {
  call
};
