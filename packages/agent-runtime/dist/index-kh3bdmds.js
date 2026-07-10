import {
  checkForReleaseNotesSync,
  getStoredChangelogFromMemory,
  init_releaseNotes,
  parseChangelog
} from "./index-k6d66rq6.js";
import {
  OverageCreditUpsell,
  incrementOverageCreditUpsellSeenCount,
  init_OverageCreditUpsell,
  useShowOverageCreditUpsell
} from "./index-j6vhhad9.js";
import {
  AGENT_DESCRIPTIONS_THRESHOLD,
  getAgentDescriptionsTotalTokens,
  init_statusNoticeHelpers
} from "./index-jme1jm53.js";
import {
  init_PromptInputFooterSuggestions
} from "./index-qt9p6wgj.js";
import {
  init_ScrollBox
} from "./index-a4t3z51q.js";
import {
  init_useMainLoopModel,
  useMainLoopModel
} from "./index-3kavz09j.js";
import {
  AssistantThinkingMessage,
  BACKGROUND_BASH_SUMMARY_PREFIX,
  EMPTY_STRING_SET,
  INTERRUPT_MESSAGE,
  INTERRUPT_MESSAGE_FOR_TOOL_USE,
  InVirtualListContext,
  MAX_MEMORY_CHARACTER_COUNT,
  Message,
  MessageActionsSelectedContext,
  OffscreenFreeze,
  SandboxManager,
  StreamingMarkdown,
  buildMessageLookups,
  collapseReadSearchGroups,
  createAssistantMessage,
  deriveUUID,
  extractTag,
  findToolByName,
  getDisplayMessageFromCollapsed,
  getEffortSuffix,
  getLargeMemoryFiles,
  getMemoryFiles,
  getMessagesAfterCompactBoundary,
  getProgressMessagesFromLookup,
  getSiblingToolUseIDsFromLookup,
  getTerminalIdeType,
  getToolSearchOrReadInfo,
  getToolUseID,
  getToolUseIDs,
  getToolUseIdsFromCollapsedGroup,
  hasAnyToolInProgress,
  hasThinkingContent,
  hasUnresolvedHooksFromLookup,
  init_AppState,
  init_AssistantThinkingMessage,
  init_LocalShellTask,
  init_Markdown,
  init_Message,
  init_OffscreenFreeze,
  init_Tool,
  init_advisor,
  init_agentmd,
  init_collapseReadSearch,
  init_dumpPrompts,
  init_effort,
  init_ide,
  init_jetbrains,
  init_messageActions,
  init_messages1 as init_messages,
  init_sandbox_adapter,
  init_sessionStorage,
  init_useShortcutDisplay,
  init_utils1 as init_utils,
  init_voiceModeEnabled,
  isAdvisorBlock,
  isJetBrainsPluginInstalledCachedSync,
  isNavigableMessage,
  isNotEmptyMessage,
  isSupportedJetBrainsTerminal,
  normalizeMessages,
  reorderMessagesInUI,
  shouldShowUserMessage,
  stripSystemReminders,
  toIDEDisplayName,
  toRGBColor,
  toolCallOf,
  useAppState,
  useShortcutDisplay
} from "./index-5wrehbeq.js";
import {
  Divider,
  checkCachedPassesEligibility,
  formatCreditAmount,
  getCachedReferrerReward,
  getCachedRemainingPasses,
  init_Divider,
  init_modalContext,
  init_referral,
  init_useTerminalSize,
  useTerminalSize
} from "./index-by2vmtsd.js";
import {
  incrementProjectOnboardingSeenCount,
  init_projectOnboardingState,
  shouldShowProjectOnboarding
} from "./index-v2hw7r4c.js";
import {
  TextHoverColorContext,
  ThemedBox_default,
  ThemedText,
  color,
  init_ThemedText,
  init_fullscreen,
  init_ink,
  init_instances,
  init_systemTheme,
  init_useTerminalNotification,
  isFullscreenEnvEnabled,
  require_compiler_runtime,
  resolveThemeSetting,
  useTerminalNotification
} from "./index-xy62w38z.js";
import {
  gt,
  init_semver
} from "./index-j9j0h3gp.js";
import {
  require_jsx_dev_runtime,
  require_react
} from "./index-mpvjr5hg.js";
import {
  init_browser
} from "./index-ce1yxg5m.js";
import {
  BLACK_CIRCLE,
  UR_HOUSE,
  formatNumber,
  getApiKeyFromConfigOrMacOSKeychain,
  getAuthTokenSource,
  getDisplayPath,
  getDynamicConfig_CACHED_MAY_BE_STALE,
  getGlobalConfig,
  getInitialSettings,
  getURHQApiKeyWithSource,
  init_auth,
  init_config,
  init_figures as init_figures2,
  init_file,
  init_format,
  init_growthbook,
  init_model,
  init_settings1 as init_settings,
  init_sleep,
  init_source,
  init_startupProfiler,
  init_stringUtils,
  init_stringWidth,
  isURAISubscriber,
  plural,
  renderModelSetting,
  saveGlobalConfig,
  sleep,
  source_default,
  stringWidth,
  truncate,
  truncateToWidth,
  truncateToWidthNoEllipsis
} from "./index-nds05g02.js";
import {
  init_analytics,
  logEvent
} from "./index-5jmh1e0k.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import {
  STATUS_TAG,
  SUMMARY_TAG,
  TASK_NOTIFICATION_TAG,
  init_xml
} from "./index-2g4gegqj.js";
import {
  figures_default,
  init_figures
} from "./index-m9qhxms7.js";
import {
  getDebugLogPath,
  init_debug,
  init_envUtils,
  isDebugMode,
  isDebugToStdErr,
  isEnvTruthy,
  logForDebugging
} from "./index-bdb5pzbm.js";
import {
  getDirectConnectServerUrl,
  getIsRemoteMode,
  init_state
} from "./index-nhjg91p1.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/utils/set.ts
function every(a, b) {
  for (const item of a) {
    if (!b.has(item)) {
      return false;
    }
  }
  return true;
}
var init_set = () => {};

// ../../src/utils/collapseBackgroundBashNotifications.ts
function isCompletedBackgroundBash(msg) {
  if (msg.type !== "user")
    return false;
  const content = msg.message.content[0];
  if (content?.type !== "text")
    return false;
  if (!content.text.includes(`<${TASK_NOTIFICATION_TAG}`))
    return false;
  if (extractTag(content.text, STATUS_TAG) !== "completed")
    return false;
  return extractTag(content.text, SUMMARY_TAG)?.startsWith(BACKGROUND_BASH_SUMMARY_PREFIX) ?? false;
}
function collapseBackgroundBashNotifications(messages, verbose) {
  if (!isFullscreenEnvEnabled())
    return messages;
  if (verbose)
    return messages;
  const result = [];
  let i = 0;
  while (i < messages.length) {
    const msg = messages[i];
    if (isCompletedBackgroundBash(msg)) {
      let count = 0;
      while (i < messages.length && isCompletedBackgroundBash(messages[i])) {
        count++;
        i++;
      }
      if (count === 1) {
        result.push(msg);
      } else {
        result.push({
          ...msg,
          message: {
            role: "user",
            content: [
              {
                type: "text",
                text: `<${TASK_NOTIFICATION_TAG}><${STATUS_TAG}>completed</${STATUS_TAG}><${SUMMARY_TAG}>${count} background commands completed</${SUMMARY_TAG}></${TASK_NOTIFICATION_TAG}>`
              }
            ]
          }
        });
      }
    } else {
      result.push(msg);
      i++;
    }
  }
  return result;
}
var init_collapseBackgroundBashNotifications = __esm(() => {
  init_xml();
  init_LocalShellTask();
  init_fullscreen();
  init_messages();
});

// ../../src/utils/collapseHookSummaries.ts
function isLabeledHookSummary(msg) {
  return msg.type === "system" && msg.subtype === "stop_hook_summary" && msg.hookLabel !== undefined;
}
function collapseHookSummaries(messages) {
  const result = [];
  let i = 0;
  while (i < messages.length) {
    const msg = messages[i];
    if (isLabeledHookSummary(msg)) {
      const label = msg.hookLabel;
      const group = [];
      while (i < messages.length) {
        const next = messages[i];
        if (!isLabeledHookSummary(next) || next.hookLabel !== label)
          break;
        group.push(next);
        i++;
      }
      if (group.length === 1) {
        result.push(msg);
      } else {
        result.push({
          ...msg,
          hookCount: group.reduce((sum, m) => sum + m.hookCount, 0),
          hookInfos: group.flatMap((m) => m.hookInfos),
          hookErrors: group.flatMap((m) => m.hookErrors),
          preventedContinuation: group.some((m) => m.preventedContinuation),
          hasOutput: group.some((m) => m.hasOutput),
          totalDurationMs: Math.max(...group.map((m) => m.totalDurationMs ?? 0))
        });
      }
    } else {
      result.push(msg);
      i++;
    }
  }
  return result;
}
var init_collapseHookSummaries = () => {};

// ../../src/utils/collapseTeammateShutdowns.ts
function isTeammateShutdownAttachment(msg) {
  return msg.type === "attachment" && msg.attachment.type === "task_status" && msg.attachment.taskType === "in_process_teammate" && msg.attachment.status === "completed";
}
function collapseTeammateShutdowns(messages) {
  const result = [];
  let i = 0;
  while (i < messages.length) {
    const msg = messages[i];
    if (isTeammateShutdownAttachment(msg)) {
      let count = 0;
      while (i < messages.length && isTeammateShutdownAttachment(messages[i])) {
        count++;
        i++;
      }
      if (count === 1) {
        result.push(msg);
      } else {
        result.push({
          type: "attachment",
          uuid: msg.uuid,
          timestamp: msg.timestamp,
          attachment: {
            type: "teammate_shutdown_batch",
            count
          }
        });
      }
    } else {
      result.push(msg);
      i++;
    }
  }
  return result;
}
var init_collapseTeammateShutdowns = () => {};

// ../../src/utils/groupToolUses.ts
function getToolsWithGrouping(tools) {
  let cached = GROUPING_CACHE.get(tools);
  if (!cached) {
    cached = new Set(tools.filter((t) => t.renderGroupedToolUse).map((t) => t.name));
    GROUPING_CACHE.set(tools, cached);
  }
  return cached;
}
function getToolUseInfo(msg) {
  if (msg.type === "assistant" && msg.message.content[0]?.type === "tool_use") {
    const content = msg.message.content[0];
    return {
      messageId: msg.message.id,
      toolUseId: content.id,
      toolName: content.name
    };
  }
  return null;
}
function applyGrouping(messages, tools, verbose = false) {
  if (verbose) {
    return {
      messages
    };
  }
  const toolsWithGrouping = getToolsWithGrouping(tools);
  const groups = new Map;
  for (const msg of messages) {
    const info = getToolUseInfo(msg);
    if (info && toolsWithGrouping.has(info.toolName)) {
      const key = `${info.messageId}:${info.toolName}`;
      const group = groups.get(key) ?? [];
      group.push(msg);
      groups.set(key, group);
    }
  }
  const validGroups = new Map;
  const groupedToolUseIds = new Set;
  for (const [key, group] of groups) {
    if (group.length >= 2) {
      validGroups.set(key, group);
      for (const msg of group) {
        const info = getToolUseInfo(msg);
        if (info) {
          groupedToolUseIds.add(info.toolUseId);
        }
      }
    }
  }
  const resultsByToolUseId = new Map;
  for (const msg of messages) {
    if (msg.type === "user") {
      for (const content of msg.message.content) {
        if (content.type === "tool_result" && groupedToolUseIds.has(content.tool_use_id)) {
          resultsByToolUseId.set(content.tool_use_id, msg);
        }
      }
    }
  }
  const result = [];
  const emittedGroups = new Set;
  for (const msg of messages) {
    const info = getToolUseInfo(msg);
    if (info) {
      const key = `${info.messageId}:${info.toolName}`;
      const group = validGroups.get(key);
      if (group) {
        if (!emittedGroups.has(key)) {
          emittedGroups.add(key);
          const firstMsg = group[0];
          const results = [];
          for (const assistantMsg of group) {
            const toolUseId = assistantMsg.message.content[0].id;
            const resultMsg = resultsByToolUseId.get(toolUseId);
            if (resultMsg) {
              results.push(resultMsg);
            }
          }
          const groupedMessage = {
            type: "grouped_tool_use",
            toolName: info.toolName,
            messages: group,
            results,
            displayMessage: firstMsg,
            uuid: `grouped-${firstMsg.uuid}`,
            timestamp: firstMsg.timestamp,
            messageId: info.messageId
          };
          result.push(groupedMessage);
        }
        continue;
      }
    }
    if (msg.type === "user") {
      const toolResults = msg.message.content.filter((c) => c.type === "tool_result");
      if (toolResults.length > 0) {
        const allGrouped = toolResults.every((tr) => groupedToolUseIds.has(tr.tool_use_id));
        if (allGrouped) {
          continue;
        }
      }
    }
    result.push(msg);
  }
  return { messages: result };
}
var GROUPING_CACHE;
var init_groupToolUses = __esm(() => {
  GROUPING_CACHE = new WeakMap;
});

// ../../src/utils/transcriptSearch.ts
function memoryContentSearchText(memories) {
  if (!Array.isArray(memories)) {
    return "";
  }
  return memories.flatMap((memory) => {
    if (memory && typeof memory === "object" && typeof memory.content === "string") {
      return [memory.content];
    }
    return [];
  }).join(`
`);
}
function renderableSearchText(msg) {
  const cached = searchTextCache.get(msg);
  if (cached !== undefined)
    return cached;
  const result = computeSearchText(msg).toLowerCase();
  searchTextCache.set(msg, result);
  return result;
}
function computeSearchText(msg) {
  let raw = "";
  switch (msg.type) {
    case "user": {
      const c = msg.message.content;
      if (typeof c === "string") {
        raw = RENDERED_AS_SENTINEL.has(c) ? "" : c;
      } else {
        const parts = [];
        for (const b of c) {
          if (b.type === "text") {
            if (!RENDERED_AS_SENTINEL.has(b.text))
              parts.push(b.text);
          } else if (b.type === "tool_result") {
            parts.push(toolResultSearchText(msg.toolUseResult));
          }
        }
        raw = parts.join(`
`);
      }
      break;
    }
    case "assistant": {
      const c = msg.message.content;
      if (Array.isArray(c)) {
        raw = c.flatMap((b) => {
          if (b.type === "text")
            return [b.text];
          if (b.type === "tool_use")
            return [toolUseSearchText(b.input)];
          return [];
        }).join(`
`);
      }
      break;
    }
    case "attachment": {
      if (msg.attachment.type === "relevant_memories") {
        raw = msg.attachment.memories.map((m) => m.content).join(`
`);
      } else if (msg.attachment.type === "queued_command" && msg.attachment.commandMode !== "task-notification" && !msg.attachment.isMeta) {
        const p = msg.attachment.prompt;
        raw = typeof p === "string" ? p : p.flatMap((b) => b.type === "text" ? [b.text] : []).join(`
`);
      }
      break;
    }
    case "collapsed_read_search": {
      raw = memoryContentSearchText(msg.relevantMemories);
      break;
    }
    default:
      break;
  }
  let t = raw;
  let open = t.indexOf("<system-reminder>");
  while (open >= 0) {
    const close = t.indexOf(SYSTEM_REMINDER_CLOSE, open);
    if (close < 0)
      break;
    t = t.slice(0, open) + t.slice(close + SYSTEM_REMINDER_CLOSE.length);
    open = t.indexOf("<system-reminder>");
  }
  return t;
}
function toolUseSearchText(input) {
  if (!input || typeof input !== "object")
    return "";
  const o = input;
  const parts = [];
  for (const k of [
    "command",
    "pattern",
    "file_path",
    "path",
    "prompt",
    "description",
    "query",
    "url",
    "skill"
  ]) {
    const v = o[k];
    if (typeof v === "string")
      parts.push(v);
  }
  for (const k of ["args", "files"]) {
    const v = o[k];
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
      parts.push(v.join(" "));
    }
  }
  return parts.join(`
`);
}
function toolResultSearchText(r) {
  if (!r || typeof r !== "object")
    return typeof r === "string" ? r : "";
  const o = r;
  if (typeof o.stdout === "string") {
    const err = typeof o.stderr === "string" ? o.stderr : "";
    return o.stdout + (err ? `
` + err : "");
  }
  if (o.file && typeof o.file === "object" && typeof o.file.content === "string") {
    return o.file.content;
  }
  const parts = [];
  for (const k of ["content", "output", "result", "text", "message"]) {
    const v = o[k];
    if (typeof v === "string")
      parts.push(v);
  }
  for (const k of ["filenames", "lines", "results"]) {
    const v = o[k];
    if (Array.isArray(v) && v.every((x) => typeof x === "string")) {
      parts.push(v.join(`
`));
    }
  }
  return parts.join(`
`);
}
var SYSTEM_REMINDER_CLOSE = "</system-reminder>", RENDERED_AS_SENTINEL, searchTextCache;
var init_transcriptSearch = __esm(() => {
  init_messages();
  RENDERED_AS_SENTINEL = new Set([
    INTERRUPT_MESSAGE,
    INTERRUPT_MESSAGE_FOR_TOOL_USE
  ]);
  searchTextCache = new WeakMap;
});

// ../../src/utils/logoV2Utils.ts
function getLayoutMode(columns) {
  if (columns >= 70)
    return "horizontal";
  return "compact";
}
function calculateLayoutDimensions(columns, layoutMode, optimalLeftWidth) {
  if (layoutMode === "horizontal") {
    const leftWidth = optimalLeftWidth;
    const usedSpace = BORDER_PADDING + CONTENT_PADDING + DIVIDER_WIDTH + leftWidth;
    const availableForRight = columns - usedSpace;
    let rightWidth = Math.max(30, availableForRight);
    const totalWidth2 = Math.min(leftWidth + rightWidth + DIVIDER_WIDTH + CONTENT_PADDING, columns - BORDER_PADDING);
    if (totalWidth2 < leftWidth + rightWidth + DIVIDER_WIDTH + CONTENT_PADDING) {
      rightWidth = totalWidth2 - leftWidth - DIVIDER_WIDTH - CONTENT_PADDING;
    }
    return { leftWidth, rightWidth, totalWidth: totalWidth2 };
  }
  const totalWidth = Math.min(columns - BORDER_PADDING, MAX_LEFT_WIDTH + 20);
  return {
    leftWidth: totalWidth,
    rightWidth: totalWidth,
    totalWidth
  };
}
function calculateOptimalLeftWidth(welcomeMessage, truncatedCwd, modelLine) {
  const contentWidth = Math.max(stringWidth(welcomeMessage), stringWidth(truncatedCwd), stringWidth(modelLine), 20);
  return Math.min(contentWidth + 4, MAX_LEFT_WIDTH);
}
function formatWelcomeMessage(username) {
  if (!username || username.length > MAX_USERNAME_LENGTH) {
    return "Welcome back!";
  }
  return `Welcome back ${username}!`;
}
function truncatePath(path, maxLength) {
  if (stringWidth(path) <= maxLength)
    return path;
  const separator = "/";
  const ellipsis = "…";
  const ellipsisWidth = 1;
  const separatorWidth = 1;
  const parts = path.split(separator);
  const first = parts[0] || "";
  const last = parts[parts.length - 1] || "";
  const firstWidth = stringWidth(first);
  const lastWidth = stringWidth(last);
  if (parts.length === 1) {
    return truncateToWidth(path, maxLength);
  }
  if (first === "" && ellipsisWidth + separatorWidth + lastWidth >= maxLength) {
    return `${separator}${truncateToWidth(last, Math.max(1, maxLength - separatorWidth))}`;
  }
  if (first !== "" && ellipsisWidth * 2 + separatorWidth + lastWidth >= maxLength) {
    return `${ellipsis}${separator}${truncateToWidth(last, Math.max(1, maxLength - ellipsisWidth - separatorWidth))}`;
  }
  if (parts.length === 2) {
    const availableForFirst = maxLength - ellipsisWidth - separatorWidth - lastWidth;
    return `${truncateToWidthNoEllipsis(first, availableForFirst)}${ellipsis}${separator}${last}`;
  }
  let available = maxLength - firstWidth - lastWidth - ellipsisWidth - 2 * separatorWidth;
  if (available <= 0) {
    const availableForFirst = Math.max(0, maxLength - lastWidth - ellipsisWidth - 2 * separatorWidth);
    const truncatedFirst = truncateToWidthNoEllipsis(first, availableForFirst);
    return `${truncatedFirst}${separator}${ellipsis}${separator}${last}`;
  }
  const middleParts = [];
  for (let i = parts.length - 2;i > 0; i--) {
    const part = parts[i];
    if (part && stringWidth(part) + separatorWidth <= available) {
      middleParts.unshift(part);
      available -= stringWidth(part) + separatorWidth;
    } else {
      break;
    }
  }
  if (middleParts.length === 0) {
    return `${first}${separator}${ellipsis}${separator}${last}`;
  }
  return `${first}${separator}${ellipsis}${separator}${middleParts.join(separator)}${separator}${last}`;
}
function getRecentActivitySync() {
  return cachedActivity;
}
function getLogoDisplayData() {
  const version = process.env.DEMO_VERSION ?? MACRO.VERSION;
  const serverUrl = getDirectConnectServerUrl();
  const displayPath = process.env.DEMO_VERSION ? "/code/ur" : getDisplayPath(getCwd());
  const cwd = serverUrl ? `${displayPath} in ${serverUrl.replace(/^https?:\/\//, "")}` : displayPath;
  const billingType = "UR-Nexus";
  const agentName = getInitialSettings().agent;
  return {
    version,
    cwd,
    billingType,
    agentName
  };
}
function formatModelAndBilling(modelName, billingType, availableWidth) {
  const separator = " · ";
  const combinedWidth = stringWidth(modelName) + separator.length + stringWidth(billingType);
  const shouldSplit = combinedWidth > availableWidth;
  if (shouldSplit) {
    return {
      shouldSplit: true,
      truncatedModel: truncate(modelName, availableWidth),
      truncatedBilling: truncate(billingType, availableWidth)
    };
  }
  return {
    shouldSplit: false,
    truncatedModel: truncate(modelName, Math.max(availableWidth - stringWidth(billingType) - separator.length, 10)),
    truncatedBilling: billingType
  };
}
function getRecentReleaseNotesSync(maxItems) {
  if (process.env.USER_TYPE === "ant") {
    const changelog2 = MACRO.VERSION_CHANGELOG;
    if (changelog2) {
      const commits = changelog2.trim().split(`
`).filter(Boolean);
      return commits.slice(0, maxItems);
    }
    return [];
  }
  const changelog = getStoredChangelogFromMemory();
  if (!changelog) {
    return [];
  }
  let parsed;
  try {
    parsed = parseChangelog(changelog);
  } catch {
    return [];
  }
  const allNotes = [];
  const versions = Object.keys(parsed).sort((a, b) => gt(a, b) ? -1 : 1).slice(0, 3);
  for (const version of versions) {
    const notes = parsed[version];
    if (notes) {
      allNotes.push(...notes);
    }
  }
  return allNotes.slice(0, maxItems);
}
var MAX_LEFT_WIDTH = 50, MAX_USERNAME_LENGTH = 20, BORDER_PADDING = 4, DIVIDER_WIDTH = 1, CONTENT_PADDING = 2, cachedActivity;
var init_logoV2Utils = __esm(() => {
  init_state();
  init_stringWidth();
  init_cwd();
  init_file();
  init_format();
  init_releaseNotes();
  init_semver();
  init_sessionStorage();
  init_settings();
  cachedActivity = [];
});

// ../../src/components/LogoV2/URBanner.tsx
function URBanner() {
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
    flexDirection: "column",
    alignItems: "center",
    children: [
      ROWS.map((row, i) => /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        color: "ur",
        bold: true,
        children: row
      }, i, false, undefined, this)),
      /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        color: "ur",
        dimColor: true,
        children: "the autonomous agent"
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}
var jsx_dev_runtime, ROWS;
var init_URBanner = __esm(() => {
  init_ink();
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
  ROWS = [
    "█   █   ████ ",
    "█   █   █   █",
    "█   █   ████ ",
    "█   █   █  █ ",
    " ███    █   █"
  ];
});

// ../../src/components/LogoV2/UrHouse.tsx
function UrHouse({ size = "large" }) {
  const rows = size === "small" ? SMALL : LARGE;
  return /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
    flexDirection: "column",
    alignItems: "center",
    children: rows.map((row, i) => /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
      color: "ur",
      children: row
    }, i, false, undefined, this))
  }, undefined, false, undefined, this);
}
var jsx_dev_runtime2, LARGE, SMALL;
var init_UrHouse = __esm(() => {
  init_ink();
  jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
  LARGE = [
    "    ╱╲    ",
    "   ╱  ╲   ",
    "  ╱    ╲  ",
    " ╱______╲ ",
    " │ ▣  ▣ │ ",
    " │      │ ",
    " │  ▢▢  │ ",
    " └──────┘ "
  ];
  SMALL = [
    " ╱╲ ",
    "╱──╲",
    "│▣▣│",
    "└▢▢┘"
  ];
});

// ../../src/components/LogoV2/GuestPassesUpsell.tsx
function resetIfPassesRefreshed() {
  const remaining = getCachedRemainingPasses();
  if (remaining == null || remaining <= 0)
    return;
  const config = getGlobalConfig();
  const lastSeen = config.passesLastSeenRemaining ?? 0;
  if (remaining > lastSeen) {
    saveGlobalConfig((prev) => ({
      ...prev,
      passesUpsellSeenCount: 0,
      hasVisitedPasses: false,
      passesLastSeenRemaining: remaining
    }));
  }
}
function shouldShowGuestPassesUpsell() {
  const {
    eligible,
    hasCache
  } = checkCachedPassesEligibility();
  if (!eligible || !hasCache)
    return false;
  resetIfPassesRefreshed();
  const config = getGlobalConfig();
  if ((config.passesUpsellSeenCount ?? 0) >= 3)
    return false;
  if (config.hasVisitedPasses)
    return false;
  return true;
}
function useShowGuestPassesUpsell() {
  const [show] = import_react.useState(_temp);
  return show;
}
function _temp() {
  return shouldShowGuestPassesUpsell();
}
function incrementGuestPassesSeenCount() {
  let newCount = 0;
  saveGlobalConfig((prev) => {
    newCount = (prev.passesUpsellSeenCount ?? 0) + 1;
    return {
      ...prev,
      passesUpsellSeenCount: newCount
    };
  });
  logEvent("tengu_guest_passes_upsell_shown", {
    seen_count: newCount
  });
}
function GuestPassesUpsell() {
  const $ = import_compiler_runtime.c(1);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    const reward = getCachedReferrerReward();
    t0 = /* @__PURE__ */ jsx_dev_runtime3.jsxDEV(ThemedText, {
      dimColor: true,
      children: [
        /* @__PURE__ */ jsx_dev_runtime3.jsxDEV(ThemedText, {
          color: "ur",
          children: "[✻]"
        }, undefined, false, undefined, this),
        " ",
        /* @__PURE__ */ jsx_dev_runtime3.jsxDEV(ThemedText, {
          color: "ur",
          children: "[✻]"
        }, undefined, false, undefined, this),
        " ",
        /* @__PURE__ */ jsx_dev_runtime3.jsxDEV(ThemedText, {
          color: "ur",
          children: "[✻]"
        }, undefined, false, undefined, this),
        " ·",
        " ",
        reward ? `Share UR and earn ${formatCreditAmount(reward)} of extra usage · /passes` : "3 guest passes at /passes"
      ]
    }, undefined, true, undefined, this);
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
}
var import_compiler_runtime, import_react, jsx_dev_runtime3;
var init_GuestPassesUpsell = __esm(() => {
  init_ink();
  init_analytics();
  init_referral();
  init_config();
  import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
  import_react = __toESM(require_react(), 1);
  jsx_dev_runtime3 = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/components/LogoV2/CondensedLogo.tsx
function CondensedLogo() {
  const $ = import_compiler_runtime2.c(29);
  const {
    columns
  } = useTerminalSize();
  const agent = useAppState(_temp3);
  const effortValue = useAppState(_temp2);
  const model = useMainLoopModel();
  const modelDisplayName = renderModelSetting(model);
  const {
    version,
    cwd,
    billingType,
    agentName: agentNameFromSettings
  } = getLogoDisplayData();
  const agentName = agent ?? agentNameFromSettings;
  const showGuestPassesUpsell = useShowGuestPassesUpsell();
  const showOverageCreditUpsell = useShowOverageCreditUpsell();
  let t0;
  let t1;
  if ($[0] !== showGuestPassesUpsell) {
    t0 = () => {
      if (showGuestPassesUpsell) {
        incrementGuestPassesSeenCount();
      }
    };
    t1 = [showGuestPassesUpsell];
    $[0] = showGuestPassesUpsell;
    $[1] = t0;
    $[2] = t1;
  } else {
    t0 = $[1];
    t1 = $[2];
  }
  import_react2.useEffect(t0, t1);
  let t2;
  let t3;
  if ($[3] !== showGuestPassesUpsell || $[4] !== showOverageCreditUpsell) {
    t2 = () => {
      if (showOverageCreditUpsell && !showGuestPassesUpsell) {
        incrementOverageCreditUpsellSeenCount();
      }
    };
    t3 = [showOverageCreditUpsell, showGuestPassesUpsell];
    $[3] = showGuestPassesUpsell;
    $[4] = showOverageCreditUpsell;
    $[5] = t2;
    $[6] = t3;
  } else {
    t2 = $[5];
    t3 = $[6];
  }
  import_react2.useEffect(t2, t3);
  const textWidth = Math.max(columns - 15, 20);
  const truncatedVersion = truncate(version, Math.max(textWidth - 13, 6));
  const effortSuffix = getEffortSuffix(model, effortValue);
  const {
    shouldSplit,
    truncatedModel,
    truncatedBilling
  } = formatModelAndBilling(modelDisplayName + effortSuffix, billingType, textWidth);
  const cwdAvailableWidth = agentName ? textWidth - 1 - stringWidth(agentName) - 3 : textWidth;
  const truncatedCwd = truncatePath(cwd, Math.max(cwdAvailableWidth, 10));
  let t4;
  if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = isFullscreenEnvEnabled() ? /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(UrHouse, {
      size: "small"
    }, undefined, false, undefined, this) : /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(UrHouse, {
      size: "small"
    }, undefined, false, undefined, this);
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  let t5;
  if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
    t5 = /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedText, {
      bold: true,
      children: "UR"
    }, undefined, false, undefined, this);
    $[8] = t5;
  } else {
    t5 = $[8];
  }
  let t6;
  if ($[9] !== truncatedVersion) {
    t6 = /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedText, {
      children: [
        t5,
        " ",
        /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedText, {
          dimColor: true,
          children: [
            "v",
            truncatedVersion
          ]
        }, undefined, true, undefined, this)
      ]
    }, undefined, true, undefined, this);
    $[9] = truncatedVersion;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  let t7;
  if ($[11] !== shouldSplit || $[12] !== truncatedBilling || $[13] !== truncatedModel) {
    t7 = shouldSplit ? /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(jsx_dev_runtime4.Fragment, {
      children: [
        /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedText, {
          dimColor: true,
          children: truncatedModel
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedText, {
          dimColor: true,
          children: truncatedBilling
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this) : /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedText, {
      dimColor: true,
      children: [
        truncatedModel,
        " · ",
        truncatedBilling
      ]
    }, undefined, true, undefined, this);
    $[11] = shouldSplit;
    $[12] = truncatedBilling;
    $[13] = truncatedModel;
    $[14] = t7;
  } else {
    t7 = $[14];
  }
  const t8 = agentName ? `@${agentName} · ${truncatedCwd}` : truncatedCwd;
  let t9;
  if ($[15] !== t8) {
    t9 = /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedText, {
      dimColor: true,
      children: t8
    }, undefined, false, undefined, this);
    $[15] = t8;
    $[16] = t9;
  } else {
    t9 = $[16];
  }
  let t10;
  if ($[17] !== showGuestPassesUpsell) {
    t10 = showGuestPassesUpsell && /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(GuestPassesUpsell, {}, undefined, false, undefined, this);
    $[17] = showGuestPassesUpsell;
    $[18] = t10;
  } else {
    t10 = $[18];
  }
  let t11;
  if ($[19] !== showGuestPassesUpsell || $[20] !== showOverageCreditUpsell || $[21] !== textWidth) {
    t11 = !showGuestPassesUpsell && showOverageCreditUpsell && /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(OverageCreditUpsell, {
      maxWidth: textWidth,
      twoLine: true
    }, undefined, false, undefined, this);
    $[19] = showGuestPassesUpsell;
    $[20] = showOverageCreditUpsell;
    $[21] = textWidth;
    $[22] = t11;
  } else {
    t11 = $[22];
  }
  let t12;
  if ($[23] !== t10 || $[24] !== t11 || $[25] !== t6 || $[26] !== t7 || $[27] !== t9) {
    t12 = /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(OffscreenFreeze, {
      children: /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedBox_default, {
        flexDirection: "row",
        gap: 2,
        alignItems: "center",
        children: [
          t4,
          /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedBox_default, {
            flexDirection: "column",
            children: [
              t6,
              t7,
              t9,
              t10,
              t11
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[23] = t10;
    $[24] = t11;
    $[25] = t6;
    $[26] = t7;
    $[27] = t9;
    $[28] = t12;
  } else {
    t12 = $[28];
  }
  return t12;
}
function _temp2(s_0) {
  return s_0.effortValue;
}
function _temp3(s) {
  return s.agent;
}
var import_compiler_runtime2, import_react2, jsx_dev_runtime4;
var init_CondensedLogo = __esm(() => {
  init_useMainLoopModel();
  init_useTerminalSize();
  init_stringWidth();
  init_ink();
  init_AppState();
  init_effort();
  init_format();
  init_fullscreen();
  init_logoV2Utils();
  init_model();
  init_OffscreenFreeze();
  init_UrHouse();
  init_GuestPassesUpsell();
  init_OverageCreditUpsell();
  import_compiler_runtime2 = __toESM(require_compiler_runtime(), 1);
  import_react2 = __toESM(require_react(), 1);
  jsx_dev_runtime4 = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/components/LogoV2/EmergencyTip.tsx
function EmergencyTip() {
  const tip = import_react3.useMemo(getTipOfFeed, []);
  const lastShownTip = import_react3.useMemo(() => getGlobalConfig().lastShownEmergencyTip, []);
  const shouldShow = tip.tip && tip.tip !== lastShownTip;
  import_react3.useEffect(() => {
    if (shouldShow) {
      saveGlobalConfig((current) => {
        if (current.lastShownEmergencyTip === tip.tip)
          return current;
        return {
          ...current,
          lastShownEmergencyTip: tip.tip
        };
      });
    }
  }, [shouldShow, tip.tip]);
  if (!shouldShow) {
    return null;
  }
  return /* @__PURE__ */ jsx_dev_runtime5.jsxDEV(ThemedBox_default, {
    paddingLeft: 2,
    flexDirection: "column",
    children: /* @__PURE__ */ jsx_dev_runtime5.jsxDEV(ThemedText, {
      ...tip.color === "warning" ? {
        color: "warning"
      } : tip.color === "error" ? {
        color: "error"
      } : {
        dimColor: true
      },
      children: tip.tip
    }, undefined, false, undefined, this)
  }, undefined, false, undefined, this);
}
function getTipOfFeed() {
  return getDynamicConfig_CACHED_MAY_BE_STALE(CONFIG_NAME, DEFAULT_TIP);
}
var import_react3, jsx_dev_runtime5, CONFIG_NAME = "tengu-top-of-feed-tip", DEFAULT_TIP;
var init_EmergencyTip = __esm(() => {
  init_ink();
  init_growthbook();
  init_config();
  import_react3 = __toESM(require_react(), 1);
  jsx_dev_runtime5 = __toESM(require_jsx_dev_runtime(), 1);
  DEFAULT_TIP = {
    tip: "",
    color: "dim"
  };
});

// ../../src/components/LogoV2/AnimatedUrHouse.tsx
var import_react4, jsx_dev_runtime6, BUILD_FRAMES, FRAME_MS = 220, TOTAL_ANIMATION_MS, SETTLED_GREY;
var init_AnimatedUrHouse = __esm(() => {
  init_ink();
  init_settings();
  init_utils();
  init_figures2();
  import_react4 = __toESM(require_react(), 1);
  jsx_dev_runtime6 = __toESM(require_jsx_dev_runtime(), 1);
  BUILD_FRAMES = ["·", "▖", "▃", "▆", "█", UR_HOUSE];
  TOTAL_ANIMATION_MS = FRAME_MS * BUILD_FRAMES.length;
  SETTLED_GREY = toRGBColor({ r: 153, g: 153, b: 153 });
});

// ../../src/components/LogoV2/modelO1mMergeNotice.tsx
var import_compiler_runtime3, import_react5, jsx_dev_runtime7;
var init_modelO1mMergeNotice = __esm(() => {
  init_figures2();
  init_ink();
  init_config();
  init_model();
  init_AnimatedUrHouse();
  import_compiler_runtime3 = __toESM(require_compiler_runtime(), 1);
  import_react5 = __toESM(require_react(), 1);
  jsx_dev_runtime7 = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/components/LogoV2/VoiceModeNotice.tsx
function VoiceModeNotice() {
  const $ = import_compiler_runtime4.c(1);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = null;
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  return t0;
}
var import_compiler_runtime4, import_react6, jsx_dev_runtime8;
var init_VoiceModeNotice = __esm(() => {
  init_ink();
  init_config();
  init_settings();
  init_voiceModeEnabled();
  init_AnimatedUrHouse();
  init_modelO1mMergeNotice();
  import_compiler_runtime4 = __toESM(require_compiler_runtime(), 1);
  import_react6 = __toESM(require_react(), 1);
  jsx_dev_runtime8 = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/components/LogoV2/LogoV2.tsx
function LogoV2() {
  const $ = import_compiler_runtime5.c(94);
  const activities = getRecentActivitySync();
  const username = getGlobalConfig().oauthAccount?.displayName ?? "";
  const {
    columns
  } = useTerminalSize();
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = shouldShowProjectOnboarding();
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  const showOnboarding = t0;
  let t1;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = SandboxManager.isSandboxingEnabled();
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const showSandboxStatus = t1;
  const showGuestPassesUpsell = useShowGuestPassesUpsell();
  const showOverageCreditUpsell = useShowOverageCreditUpsell();
  const agent = useAppState(_temp5);
  const effortValue = useAppState(_temp22);
  const config = getGlobalConfig();
  let changelog;
  try {
    changelog = getRecentReleaseNotesSync(3);
  } catch {
    changelog = [];
  }
  const [announcement] = import_react7.useState(() => {
    const announcements = getInitialSettings().companyAnnouncements;
    if (!announcements || announcements.length === 0) {
      return;
    }
    return config.numStartups === 1 ? announcements[0] : announcements[Math.floor(Math.random() * announcements.length)];
  });
  const {
    hasReleaseNotes
  } = checkForReleaseNotesSync(config.lastReleaseNotesSeen);
  let t2;
  if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = () => {
      const currentConfig = getGlobalConfig();
      if (currentConfig.lastReleaseNotesSeen === MACRO.VERSION) {
        return;
      }
      saveGlobalConfig(_temp32);
      if (showOnboarding) {
        incrementProjectOnboardingSeenCount();
      }
    };
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] !== config) {
    t3 = [config, showOnboarding];
    $[3] = config;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  import_react7.useEffect(t2, t3);
  let t4;
  if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = !hasReleaseNotes && !showOnboarding && !isEnvTruthy(process.env.UR_CODE_FORCE_FULL_LOGO);
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  const isCondensedMode = t4;
  let t5;
  let t6;
  if ($[6] !== showGuestPassesUpsell) {
    t5 = () => {
      if (showGuestPassesUpsell && !showOnboarding && !isCondensedMode) {
        incrementGuestPassesSeenCount();
      }
    };
    t6 = [showGuestPassesUpsell, showOnboarding, isCondensedMode];
    $[6] = showGuestPassesUpsell;
    $[7] = t5;
    $[8] = t6;
  } else {
    t5 = $[7];
    t6 = $[8];
  }
  import_react7.useEffect(t5, t6);
  let t7;
  let t8;
  if ($[9] !== showGuestPassesUpsell || $[10] !== showOverageCreditUpsell) {
    t7 = () => {
      if (showOverageCreditUpsell && !showOnboarding && !showGuestPassesUpsell && !isCondensedMode) {
        incrementOverageCreditUpsellSeenCount();
      }
    };
    t8 = [showOverageCreditUpsell, showOnboarding, showGuestPassesUpsell, isCondensedMode];
    $[9] = showGuestPassesUpsell;
    $[10] = showOverageCreditUpsell;
    $[11] = t7;
    $[12] = t8;
  } else {
    t7 = $[11];
    t8 = $[12];
  }
  import_react7.useEffect(t7, t8);
  const model = useMainLoopModel();
  const fullModelDisplayName = renderModelSetting(model);
  const {
    version,
    cwd,
    billingType,
    agentName: agentNameFromSettings
  } = getLogoDisplayData();
  const agentName = agent ?? agentNameFromSettings;
  const effortSuffix = getEffortSuffix(model, effortValue);
  const t9 = fullModelDisplayName + effortSuffix;
  let t10;
  if ($[13] !== t9) {
    t10 = truncate(t9, LEFT_PANEL_MAX_WIDTH - 20);
    $[13] = t9;
    $[14] = t10;
  } else {
    t10 = $[14];
  }
  const modelDisplayName = t10;
  if (!hasReleaseNotes && !showOnboarding && !isEnvTruthy(process.env.UR_CODE_FORCE_FULL_LOGO)) {
    let t112;
    let t122;
    let t132;
    let t142;
    let t152;
    let t162;
    let t172;
    if ($[15] === Symbol.for("react.memo_cache_sentinel")) {
      t112 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(CondensedLogo, {}, undefined, false, undefined, this);
      t122 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(VoiceModeNotice, {}, undefined, false, undefined, this);
      t132 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV("modelO1mMergeNotice", {}, undefined, false, undefined, this);
      t142 = ChannelsNoticeModule && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ChannelsNoticeModule.ChannelsNotice, {}, undefined, false, undefined, this);
      t152 = isDebugMode() && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
        paddingLeft: 2,
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
            color: "warning",
            children: "Debug mode enabled"
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
            dimColor: true,
            children: [
              "Logging to: ",
              isDebugToStdErr() ? "stderr" : getDebugLogPath()
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this);
      t162 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(EmergencyTip, {}, undefined, false, undefined, this);
      t172 = process.env.UR_CODE_TMUX_SESSION && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
        paddingLeft: 2,
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
            dimColor: true,
            children: [
              "tmux session: ",
              process.env.UR_CODE_TMUX_SESSION
            ]
          }, undefined, true, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
            dimColor: true,
            children: process.env.UR_CODE_TMUX_PREFIX_CONFLICTS ? `Detach: ${process.env.UR_CODE_TMUX_PREFIX} ${process.env.UR_CODE_TMUX_PREFIX} d (press prefix twice - UR uses ${process.env.UR_CODE_TMUX_PREFIX})` : `Detach: ${process.env.UR_CODE_TMUX_PREFIX} d`
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this);
      $[15] = t112;
      $[16] = t122;
      $[17] = t132;
      $[18] = t142;
      $[19] = t152;
      $[20] = t162;
      $[21] = t172;
    } else {
      t112 = $[15];
      t122 = $[16];
      t132 = $[17];
      t142 = $[18];
      t152 = $[19];
      t162 = $[20];
      t172 = $[21];
    }
    let t182;
    if ($[22] !== announcement || $[23] !== config) {
      t182 = announcement && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
        paddingLeft: 2,
        flexDirection: "column",
        children: [
          !process.env.IS_DEMO && config.oauthAccount?.organizationName && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
            dimColor: true,
            children: [
              "Message from ",
              config.oauthAccount.organizationName,
              ":"
            ]
          }, undefined, true, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
            children: announcement
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this);
      $[22] = announcement;
      $[23] = config;
      $[24] = t182;
    } else {
      t182 = $[24];
    }
    let t192;
    let t202;
    let t212;
    let t222;
    if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
      t192 = false;
      t202 = false;
      t212 = false;
      t222 = false;
      $[25] = t192;
      $[26] = t202;
      $[27] = t212;
      $[28] = t222;
    } else {
      t192 = $[25];
      t202 = $[26];
      t212 = $[27];
      t222 = $[28];
    }
    let t232;
    if ($[29] !== t182) {
      t232 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(jsx_dev_runtime9.Fragment, {
        children: [
          t112,
          t122,
          t132,
          t142,
          t152,
          t162,
          t172,
          t182,
          t192,
          t202,
          t212,
          t222
        ]
      }, undefined, true, undefined, this);
      $[29] = t182;
      $[30] = t232;
    } else {
      t232 = $[30];
    }
    return t232;
  }
  const layoutMode = getLayoutMode(columns);
  const userTheme = resolveThemeSetting(getGlobalConfig().theme);
  const borderTitle = ` ${color("ur", userTheme)("UR")} ${color("inactive", userTheme)(`v${version}`)} `;
  const compactBorderTitle = color("ur", userTheme)(" UR ");
  if (layoutMode === "compact") {
    let welcomeMessage = formatWelcomeMessage(username);
    if (stringWidth(welcomeMessage) > columns - 4) {
      let t113;
      if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
        t113 = formatWelcomeMessage(null);
        $[31] = t113;
      } else {
        t113 = $[31];
      }
      welcomeMessage = t113;
    }
    const cwdAvailableWidth = agentName ? columns - 4 - 1 - stringWidth(agentName) - 3 : columns - 4;
    const truncatedCwd = truncatePath(cwd, Math.max(cwdAvailableWidth, 10));
    let t112;
    if ($[32] !== compactBorderTitle) {
      t112 = {
        content: compactBorderTitle,
        position: "top",
        align: "start",
        offset: 1
      };
      $[32] = compactBorderTitle;
      $[33] = t112;
    } else {
      t112 = $[33];
    }
    let t122;
    if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
      t122 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
        marginY: 1,
        children: /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(UrHouse, {
          size: "small"
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this);
      $[34] = t122;
    } else {
      t122 = $[34];
    }
    let t132;
    if ($[35] !== modelDisplayName) {
      t132 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
        dimColor: true,
        children: modelDisplayName
      }, undefined, false, undefined, this);
      $[35] = modelDisplayName;
      $[36] = t132;
    } else {
      t132 = $[36];
    }
    let t142;
    let t152;
    let t162;
    if ($[37] === Symbol.for("react.memo_cache_sentinel")) {
      t142 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(VoiceModeNotice, {}, undefined, false, undefined, this);
      t152 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV("modelO1mMergeNotice", {}, undefined, false, undefined, this);
      t162 = ChannelsNoticeModule && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ChannelsNoticeModule.ChannelsNotice, {}, undefined, false, undefined, this);
      $[37] = t142;
      $[38] = t152;
      $[39] = t162;
    } else {
      t142 = $[37];
      t152 = $[38];
      t162 = $[39];
    }
    let t172;
    if ($[40] !== showSandboxStatus) {
      t172 = showSandboxStatus && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
        marginTop: 1,
        flexDirection: "column",
        children: /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
          color: "warning",
          children: "Your bash commands will be sandboxed. Disable with /sandbox."
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this);
      $[40] = showSandboxStatus;
      $[41] = t172;
    } else {
      t172 = $[41];
    }
    let t182;
    let t192;
    if ($[42] === Symbol.for("react.memo_cache_sentinel")) {
      t182 = false;
      t192 = false;
      $[42] = t182;
      $[43] = t192;
    } else {
      t182 = $[42];
      t192 = $[43];
    }
    return /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(jsx_dev_runtime9.Fragment, {
      children: [
        /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(OffscreenFreeze, {
          children: /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
            flexDirection: "column",
            borderStyle: "round",
            borderColor: "ur",
            borderText: t112,
            paddingX: 1,
            paddingY: 1,
            alignItems: "center",
            width: columns,
            children: [
              /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
                bold: true,
                children: welcomeMessage
              }, undefined, false, undefined, this),
              t122,
              t132,
              /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
                dimColor: true,
                children: billingType
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
                dimColor: true,
                children: agentName ? `@${agentName} · ${truncatedCwd}` : truncatedCwd
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this)
        }, undefined, false, undefined, this),
        t142,
        t152,
        t162,
        t172,
        t182,
        t192
      ]
    }, undefined, true, undefined, this);
  }
  const welcomeMessage_0 = formatWelcomeMessage(username);
  const modelLine = !process.env.IS_DEMO && config.oauthAccount?.organizationName ? `${modelDisplayName} · ${billingType} · ${config.oauthAccount.organizationName}` : `${modelDisplayName} · ${billingType}`;
  const cwdAvailableWidth_0 = agentName ? LEFT_PANEL_MAX_WIDTH - 1 - stringWidth(agentName) - 3 : LEFT_PANEL_MAX_WIDTH;
  const truncatedCwd_0 = truncatePath(cwd, Math.max(cwdAvailableWidth_0, 10));
  const cwdLine = agentName ? `@${agentName} · ${truncatedCwd_0}` : truncatedCwd_0;
  const optimalLeftWidth = calculateOptimalLeftWidth(welcomeMessage_0, cwdLine, modelLine);
  const {
    leftWidth,
    rightWidth
  } = calculateLayoutDimensions(columns, layoutMode, optimalLeftWidth);
  const T0 = OffscreenFreeze;
  const T1 = ThemedBox_default;
  const t11 = "column";
  const t12 = "round";
  const t13 = "ur";
  let t14;
  if ($[44] !== borderTitle) {
    t14 = {
      content: borderTitle,
      position: "top",
      align: "start",
      offset: 3
    };
    $[44] = borderTitle;
    $[45] = t14;
  } else {
    t14 = $[45];
  }
  const T2 = ThemedBox_default;
  const t15 = layoutMode === "horizontal" ? "row" : "column";
  const t16 = 1;
  const t17 = 1;
  let t18;
  if ($[46] !== welcomeMessage_0) {
    t18 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
      marginTop: 1,
      children: /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
        bold: true,
        children: welcomeMessage_0
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[46] = welcomeMessage_0;
    $[47] = t18;
  } else {
    t18 = $[47];
  }
  let t19;
  if ($[48] === Symbol.for("react.memo_cache_sentinel")) {
    t19 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
      marginY: 1,
      children: /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(UrHouse, {
        size: "large"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[48] = t19;
  } else {
    t19 = $[48];
  }
  let t20;
  if ($[49] !== modelLine) {
    t20 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
      dimColor: true,
      children: modelLine
    }, undefined, false, undefined, this);
    $[49] = modelLine;
    $[50] = t20;
  } else {
    t20 = $[50];
  }
  let t21;
  if ($[51] !== cwdLine) {
    t21 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
      dimColor: true,
      children: cwdLine
    }, undefined, false, undefined, this);
    $[51] = cwdLine;
    $[52] = t21;
  } else {
    t21 = $[52];
  }
  let t22;
  if ($[53] !== t20 || $[54] !== t21) {
    t22 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      alignItems: "center",
      children: [
        t20,
        t21
      ]
    }, undefined, true, undefined, this);
    $[53] = t20;
    $[54] = t21;
    $[55] = t22;
  } else {
    t22 = $[55];
  }
  let t23;
  if ($[56] !== leftWidth || $[57] !== t18 || $[58] !== t22) {
    t23 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      width: leftWidth,
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: 9,
      children: [
        t18,
        t19,
        t22
      ]
    }, undefined, true, undefined, this);
    $[56] = leftWidth;
    $[57] = t18;
    $[58] = t22;
    $[59] = t23;
  } else {
    t23 = $[59];
  }
  let t24;
  if ($[60] !== layoutMode) {
    t24 = layoutMode === "horizontal" && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
      height: "100%",
      borderStyle: "single",
      borderColor: "ur",
      borderDimColor: true,
      borderTop: false,
      borderBottom: false,
      borderLeft: false
    }, undefined, false, undefined, this);
    $[60] = layoutMode;
    $[61] = t24;
  } else {
    t24 = $[61];
  }
  const t25 = layoutMode === "horizontal" && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
    width: rightWidth,
    alignItems: "center",
    justifyContent: "center",
    children: /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(URBanner, {}, undefined, false, undefined, this)
  }, undefined, false, undefined, this);
  let t26;
  if ($[62] !== T2 || $[63] !== t15 || $[64] !== t23 || $[65] !== t24 || $[66] !== t25) {
    t26 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(T2, {
      flexDirection: t15,
      paddingX: t16,
      gap: t17,
      children: [
        t23,
        t24,
        t25
      ]
    }, undefined, true, undefined, this);
    $[62] = T2;
    $[63] = t15;
    $[64] = t23;
    $[65] = t24;
    $[66] = t25;
    $[67] = t26;
  } else {
    t26 = $[67];
  }
  let t27;
  if ($[68] !== T1 || $[69] !== t14 || $[70] !== t26) {
    t27 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(T1, {
      flexDirection: t11,
      borderStyle: t12,
      borderColor: t13,
      borderText: t14,
      children: t26
    }, undefined, false, undefined, this);
    $[68] = T1;
    $[69] = t14;
    $[70] = t26;
    $[71] = t27;
  } else {
    t27 = $[71];
  }
  let t28;
  if ($[72] !== T0 || $[73] !== t27) {
    t28 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(T0, {
      children: t27
    }, undefined, false, undefined, this);
    $[72] = T0;
    $[73] = t27;
    $[74] = t28;
  } else {
    t28 = $[74];
  }
  let t29;
  let t30;
  let t31;
  let t32;
  let t33;
  let t34;
  if ($[75] === Symbol.for("react.memo_cache_sentinel")) {
    t29 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(VoiceModeNotice, {}, undefined, false, undefined, this);
    t30 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV("modelO1mMergeNotice", {}, undefined, false, undefined, this);
    t31 = ChannelsNoticeModule && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ChannelsNoticeModule.ChannelsNotice, {}, undefined, false, undefined, this);
    t32 = isDebugMode() && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
      paddingLeft: 2,
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
          color: "warning",
          children: "Debug mode enabled"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
          dimColor: true,
          children: [
            "Logging to: ",
            isDebugToStdErr() ? "stderr" : getDebugLogPath()
          ]
        }, undefined, true, undefined, this)
      ]
    }, undefined, true, undefined, this);
    t33 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(EmergencyTip, {}, undefined, false, undefined, this);
    t34 = process.env.UR_CODE_TMUX_SESSION && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
      paddingLeft: 2,
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
          dimColor: true,
          children: [
            "tmux session: ",
            process.env.UR_CODE_TMUX_SESSION
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
          dimColor: true,
          children: process.env.UR_CODE_TMUX_PREFIX_CONFLICTS ? `Detach: ${process.env.UR_CODE_TMUX_PREFIX} ${process.env.UR_CODE_TMUX_PREFIX} d (press prefix twice - UR uses ${process.env.UR_CODE_TMUX_PREFIX})` : `Detach: ${process.env.UR_CODE_TMUX_PREFIX} d`
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
    $[75] = t29;
    $[76] = t30;
    $[77] = t31;
    $[78] = t32;
    $[79] = t33;
    $[80] = t34;
  } else {
    t29 = $[75];
    t30 = $[76];
    t31 = $[77];
    t32 = $[78];
    t33 = $[79];
    t34 = $[80];
  }
  let t35;
  if ($[81] !== announcement || $[82] !== config) {
    t35 = announcement && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
      paddingLeft: 2,
      flexDirection: "column",
      children: [
        !process.env.IS_DEMO && config.oauthAccount?.organizationName && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
          dimColor: true,
          children: [
            "Message from ",
            config.oauthAccount.organizationName,
            ":"
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
          children: announcement
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
    $[81] = announcement;
    $[82] = config;
    $[83] = t35;
  } else {
    t35 = $[83];
  }
  let t36;
  if ($[84] !== showSandboxStatus) {
    t36 = showSandboxStatus && /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedBox_default, {
      paddingLeft: 2,
      flexDirection: "column",
      children: /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(ThemedText, {
        color: "warning",
        children: "Your bash commands will be sandboxed. Disable with /sandbox."
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[84] = showSandboxStatus;
    $[85] = t36;
  } else {
    t36 = $[85];
  }
  let t37;
  let t38;
  let t39;
  let t40;
  if ($[86] === Symbol.for("react.memo_cache_sentinel")) {
    t37 = false;
    t38 = false;
    t39 = false;
    t40 = false;
    $[86] = t37;
    $[87] = t38;
    $[88] = t39;
    $[89] = t40;
  } else {
    t37 = $[86];
    t38 = $[87];
    t39 = $[88];
    t40 = $[89];
  }
  let t41;
  if ($[90] !== t28 || $[91] !== t35 || $[92] !== t36) {
    t41 = /* @__PURE__ */ jsx_dev_runtime9.jsxDEV(jsx_dev_runtime9.Fragment, {
      children: [
        t28,
        t29,
        t30,
        t31,
        t32,
        t33,
        t34,
        t35,
        t36,
        t37,
        t38,
        t39,
        t40
      ]
    }, undefined, true, undefined, this);
    $[90] = t28;
    $[91] = t35;
    $[92] = t36;
    $[93] = t41;
  } else {
    t41 = $[93];
  }
  return t41;
}
function _temp32(current) {
  if (current.lastReleaseNotesSeen === MACRO.VERSION) {
    return current;
  }
  return {
    ...current,
    lastReleaseNotesSeen: MACRO.VERSION
  };
}
function _temp22(s_0) {
  return s_0.effortValue;
}
function _temp5(s) {
  return s.agent;
}
var import_compiler_runtime5, import_react7, jsx_dev_runtime9, ChannelsNoticeModule = null, LEFT_PANEL_MAX_WIDTH = 50;
var init_LogoV2 = __esm(() => {
  init_ink();
  init_useTerminalSize();
  init_stringWidth();
  init_logoV2Utils();
  init_format();
  init_file();
  init_URBanner();
  init_UrHouse();
  init_config();
  init_systemTheme();
  init_settings();
  init_debug();
  init_projectOnboardingState();
  init_CondensedLogo();
  init_OffscreenFreeze();
  init_releaseNotes();
  init_dumpPrompts();
  init_envUtils();
  init_startupProfiler();
  init_EmergencyTip();
  init_VoiceModeNotice();
  init_sandbox_adapter();
  init_GuestPassesUpsell();
  init_OverageCreditUpsell();
  init_AppState();
  init_effort();
  init_useMainLoopModel();
  init_model();
  import_compiler_runtime5 = __toESM(require_compiler_runtime(), 1);
  import_react7 = __toESM(require_react(), 1);
  jsx_dev_runtime9 = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/components/MessageModel.tsx
function MessageModel(t0) {
  const $ = import_compiler_runtime6.c(5);
  const {
    message,
    isTranscriptMode
  } = t0;
  const shouldShowModel = isTranscriptMode && message.type === "assistant" && message.message.model && message.message.content.some(_temp6);
  if (!shouldShowModel) {
    return null;
  }
  const t1 = stringWidth(message.message.model) + 8;
  let t2;
  if ($[0] !== message.message.model) {
    t2 = /* @__PURE__ */ jsx_dev_runtime10.jsxDEV(ThemedText, {
      dimColor: true,
      children: message.message.model
    }, undefined, false, undefined, this);
    $[0] = message.message.model;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  let t3;
  if ($[2] !== t1 || $[3] !== t2) {
    t3 = /* @__PURE__ */ jsx_dev_runtime10.jsxDEV(ThemedBox_default, {
      minWidth: t1,
      children: t2
    }, undefined, false, undefined, this);
    $[2] = t1;
    $[3] = t2;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  return t3;
}
function _temp6(c) {
  return c.type === "text";
}
var import_compiler_runtime6, jsx_dev_runtime10;
var init_MessageModel = __esm(() => {
  init_stringWidth();
  init_ink();
  import_compiler_runtime6 = __toESM(require_compiler_runtime(), 1);
  jsx_dev_runtime10 = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/components/MessageTimestamp.tsx
function MessageTimestamp(t0) {
  const $ = import_compiler_runtime7.c(10);
  const {
    message,
    isTranscriptMode
  } = t0;
  const shouldShowTimestamp = isTranscriptMode && message.timestamp && message.type === "assistant" && message.message.content.some(_temp7);
  if (!shouldShowTimestamp) {
    return null;
  }
  let T0;
  let formattedTimestamp;
  let t1;
  if ($[0] !== message.timestamp) {
    formattedTimestamp = new Date(message.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    T0 = ThemedBox_default;
    t1 = stringWidth(formattedTimestamp);
    $[0] = message.timestamp;
    $[1] = T0;
    $[2] = formattedTimestamp;
    $[3] = t1;
  } else {
    T0 = $[1];
    formattedTimestamp = $[2];
    t1 = $[3];
  }
  let t2;
  if ($[4] !== formattedTimestamp) {
    t2 = /* @__PURE__ */ jsx_dev_runtime11.jsxDEV(ThemedText, {
      dimColor: true,
      children: formattedTimestamp
    }, undefined, false, undefined, this);
    $[4] = formattedTimestamp;
    $[5] = t2;
  } else {
    t2 = $[5];
  }
  let t3;
  if ($[6] !== T0 || $[7] !== t1 || $[8] !== t2) {
    t3 = /* @__PURE__ */ jsx_dev_runtime11.jsxDEV(T0, {
      minWidth: t1,
      children: t2
    }, undefined, false, undefined, this);
    $[6] = T0;
    $[7] = t1;
    $[8] = t2;
    $[9] = t3;
  } else {
    t3 = $[9];
  }
  return t3;
}
function _temp7(c) {
  return c.type === "text";
}
var import_compiler_runtime7, jsx_dev_runtime11;
var init_MessageTimestamp = __esm(() => {
  init_stringWidth();
  init_ink();
  import_compiler_runtime7 = __toESM(require_compiler_runtime(), 1);
  jsx_dev_runtime11 = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/components/MessageRow.tsx
function hasContentAfterIndex(messages, index, tools, streamingToolUseIDs) {
  for (let i = index + 1;i < messages.length; i++) {
    const msg = messages[i];
    if (msg?.type === "assistant") {
      const content = msg.message.content[0];
      if (content?.type === "thinking" || content?.type === "redacted_thinking") {
        continue;
      }
      if (content?.type === "tool_use") {
        if (getToolSearchOrReadInfo(content.name, content.input, tools).isCollapsible) {
          continue;
        }
        if (streamingToolUseIDs.has(content.id)) {
          continue;
        }
      }
      return true;
    }
    if (msg?.type === "system" || msg?.type === "attachment") {
      continue;
    }
    if (msg?.type === "user") {
      const content = msg.message.content[0];
      if (content?.type === "tool_result") {
        continue;
      }
    }
    if (msg?.type === "grouped_tool_use") {
      const firstInput = msg.messages[0]?.message.content[0]?.input;
      if (getToolSearchOrReadInfo(msg.toolName, firstInput, tools).isCollapsible) {
        continue;
      }
    }
    return true;
  }
  return false;
}
function MessageRowImpl(t0) {
  const $ = import_compiler_runtime8.c(64);
  const {
    message: msg,
    isUserContinuation,
    hasContentAfter,
    tools,
    commands,
    verbose,
    inProgressToolUseIDs,
    streamingToolUseIDs,
    screen,
    canAnimate,
    onOpenRateLimitOptions,
    lastThinkingBlockId,
    latestBashOutputUUID,
    columns,
    isLoading,
    lookups
  } = t0;
  const isTranscriptMode = screen === "transcript";
  const isGrouped = msg.type === "grouped_tool_use";
  const isCollapsed = msg.type === "collapsed_read_search";
  let t1;
  if ($[0] !== hasContentAfter || $[1] !== inProgressToolUseIDs || $[2] !== isCollapsed || $[3] !== isLoading || $[4] !== msg) {
    t1 = isCollapsed && (hasAnyToolInProgress(msg, inProgressToolUseIDs) || isLoading && !hasContentAfter);
    $[0] = hasContentAfter;
    $[1] = inProgressToolUseIDs;
    $[2] = isCollapsed;
    $[3] = isLoading;
    $[4] = msg;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  const isActiveCollapsedGroup = t1;
  let t2;
  if ($[6] !== isCollapsed || $[7] !== isGrouped || $[8] !== msg) {
    t2 = isGrouped ? msg.displayMessage : isCollapsed ? getDisplayMessageFromCollapsed(msg) : msg;
    $[6] = isCollapsed;
    $[7] = isGrouped;
    $[8] = msg;
    $[9] = t2;
  } else {
    t2 = $[9];
  }
  const displayMsg = t2;
  let t3;
  if ($[10] !== isCollapsed || $[11] !== isGrouped || $[12] !== lookups || $[13] !== msg) {
    t3 = isGrouped || isCollapsed ? [] : getProgressMessagesFromLookup(msg, lookups);
    $[10] = isCollapsed;
    $[11] = isGrouped;
    $[12] = lookups;
    $[13] = msg;
    $[14] = t3;
  } else {
    t3 = $[14];
  }
  const progressMessagesForMessage = t3;
  let t4;
  if ($[15] !== inProgressToolUseIDs || $[16] !== isCollapsed || $[17] !== isGrouped || $[18] !== lookups || $[19] !== msg || $[20] !== screen || $[21] !== streamingToolUseIDs) {
    const siblingToolUseIDs = isGrouped || isCollapsed ? EMPTY_STRING_SET : getSiblingToolUseIDsFromLookup(msg, lookups);
    t4 = shouldRenderStatically(msg, streamingToolUseIDs, inProgressToolUseIDs, siblingToolUseIDs, screen, lookups);
    $[15] = inProgressToolUseIDs;
    $[16] = isCollapsed;
    $[17] = isGrouped;
    $[18] = lookups;
    $[19] = msg;
    $[20] = screen;
    $[21] = streamingToolUseIDs;
    $[22] = t4;
  } else {
    t4 = $[22];
  }
  const isStatic = t4;
  let shouldAnimate = false;
  if (canAnimate) {
    if (isGrouped) {
      let t52;
      if ($[23] !== inProgressToolUseIDs || $[24] !== msg.messages) {
        let t62;
        if ($[26] !== inProgressToolUseIDs) {
          t62 = (m) => {
            const content = m.message.content[0];
            return content?.type === "tool_use" && inProgressToolUseIDs.has(content.id);
          };
          $[26] = inProgressToolUseIDs;
          $[27] = t62;
        } else {
          t62 = $[27];
        }
        t52 = msg.messages.some(t62);
        $[23] = inProgressToolUseIDs;
        $[24] = msg.messages;
        $[25] = t52;
      } else {
        t52 = $[25];
      }
      shouldAnimate = t52;
    } else {
      if (isCollapsed) {
        let t52;
        if ($[28] !== inProgressToolUseIDs || $[29] !== msg) {
          t52 = hasAnyToolInProgress(msg, inProgressToolUseIDs);
          $[28] = inProgressToolUseIDs;
          $[29] = msg;
          $[30] = t52;
        } else {
          t52 = $[30];
        }
        shouldAnimate = t52;
      } else {
        let t52;
        if ($[31] !== inProgressToolUseIDs || $[32] !== msg) {
          const toolUseID = getToolUseID(msg);
          t52 = !toolUseID || inProgressToolUseIDs.has(toolUseID);
          $[31] = inProgressToolUseIDs;
          $[32] = msg;
          $[33] = t52;
        } else {
          t52 = $[33];
        }
        shouldAnimate = t52;
      }
    }
  }
  let t5;
  if ($[34] !== displayMsg || $[35] !== isTranscriptMode) {
    t5 = isTranscriptMode && displayMsg.type === "assistant" && displayMsg.message.content.some(_temp8) && (displayMsg.timestamp || displayMsg.message.model);
    $[34] = displayMsg;
    $[35] = isTranscriptMode;
    $[36] = t5;
  } else {
    t5 = $[36];
  }
  const hasMetadata = t5;
  const t6 = !hasMetadata;
  const t7 = hasMetadata ? undefined : columns;
  let t8;
  if ($[37] !== commands || $[38] !== inProgressToolUseIDs || $[39] !== isActiveCollapsedGroup || $[40] !== isStatic || $[41] !== isTranscriptMode || $[42] !== isUserContinuation || $[43] !== lastThinkingBlockId || $[44] !== latestBashOutputUUID || $[45] !== lookups || $[46] !== msg || $[47] !== onOpenRateLimitOptions || $[48] !== progressMessagesForMessage || $[49] !== shouldAnimate || $[50] !== t6 || $[51] !== t7 || $[52] !== tools || $[53] !== verbose) {
    t8 = /* @__PURE__ */ jsx_dev_runtime12.jsxDEV(Message, {
      message: msg,
      lookups,
      addMargin: t6,
      containerWidth: t7,
      tools,
      commands,
      verbose,
      inProgressToolUseIDs,
      progressMessagesForMessage,
      shouldAnimate,
      shouldShowDot: true,
      isTranscriptMode,
      isStatic,
      onOpenRateLimitOptions,
      isActiveCollapsedGroup,
      isUserContinuation,
      lastThinkingBlockId,
      latestBashOutputUUID
    }, undefined, false, undefined, this);
    $[37] = commands;
    $[38] = inProgressToolUseIDs;
    $[39] = isActiveCollapsedGroup;
    $[40] = isStatic;
    $[41] = isTranscriptMode;
    $[42] = isUserContinuation;
    $[43] = lastThinkingBlockId;
    $[44] = latestBashOutputUUID;
    $[45] = lookups;
    $[46] = msg;
    $[47] = onOpenRateLimitOptions;
    $[48] = progressMessagesForMessage;
    $[49] = shouldAnimate;
    $[50] = t6;
    $[51] = t7;
    $[52] = tools;
    $[53] = verbose;
    $[54] = t8;
  } else {
    t8 = $[54];
  }
  const messageEl = t8;
  if (!hasMetadata) {
    let t92;
    if ($[55] !== messageEl) {
      t92 = /* @__PURE__ */ jsx_dev_runtime12.jsxDEV(OffscreenFreeze, {
        children: messageEl
      }, undefined, false, undefined, this);
      $[55] = messageEl;
      $[56] = t92;
    } else {
      t92 = $[56];
    }
    return t92;
  }
  let t9;
  if ($[57] !== displayMsg || $[58] !== isTranscriptMode) {
    t9 = /* @__PURE__ */ jsx_dev_runtime12.jsxDEV(ThemedBox_default, {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 1,
      marginTop: 1,
      children: [
        /* @__PURE__ */ jsx_dev_runtime12.jsxDEV(MessageTimestamp, {
          message: displayMsg,
          isTranscriptMode
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime12.jsxDEV(MessageModel, {
          message: displayMsg,
          isTranscriptMode
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
    $[57] = displayMsg;
    $[58] = isTranscriptMode;
    $[59] = t9;
  } else {
    t9 = $[59];
  }
  let t10;
  if ($[60] !== columns || $[61] !== messageEl || $[62] !== t9) {
    t10 = /* @__PURE__ */ jsx_dev_runtime12.jsxDEV(OffscreenFreeze, {
      children: /* @__PURE__ */ jsx_dev_runtime12.jsxDEV(ThemedBox_default, {
        width: columns,
        flexDirection: "column",
        children: [
          t9,
          messageEl
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[60] = columns;
    $[61] = messageEl;
    $[62] = t9;
    $[63] = t10;
  } else {
    t10 = $[63];
  }
  return t10;
}
function _temp8(c) {
  return c.type === "text";
}
function isMessageStreaming(msg, streamingToolUseIDs) {
  if (msg.type === "grouped_tool_use") {
    return msg.messages.some((m) => {
      const content = m.message.content[0];
      return content?.type === "tool_use" && streamingToolUseIDs.has(content.id);
    });
  }
  if (msg.type === "collapsed_read_search") {
    const toolIds = getToolUseIdsFromCollapsedGroup(msg);
    return toolIds.some((id) => streamingToolUseIDs.has(id));
  }
  const toolUseID = getToolUseID(msg);
  return !!toolUseID && streamingToolUseIDs.has(toolUseID);
}
function allToolsResolved(msg, resolvedToolUseIDs) {
  if (msg.type === "grouped_tool_use") {
    return msg.messages.every((m) => {
      const content = m.message.content[0];
      return content?.type === "tool_use" && resolvedToolUseIDs.has(content.id);
    });
  }
  if (msg.type === "collapsed_read_search") {
    const toolIds = getToolUseIdsFromCollapsedGroup(msg);
    return toolIds.every((id) => resolvedToolUseIDs.has(id));
  }
  if (msg.type === "assistant") {
    const block = msg.message.content[0];
    if (block?.type === "server_tool_use") {
      return resolvedToolUseIDs.has(block.id);
    }
  }
  const toolUseID = getToolUseID(msg);
  return !toolUseID || resolvedToolUseIDs.has(toolUseID);
}
function areMessageRowPropsEqual(prev, next) {
  if (prev.message !== next.message)
    return false;
  if (prev.screen !== next.screen)
    return false;
  if (prev.verbose !== next.verbose)
    return false;
  if (prev.message.type === "collapsed_read_search" && next.screen !== "transcript") {
    return false;
  }
  if (prev.columns !== next.columns)
    return false;
  const prevIsLatestBash = prev.latestBashOutputUUID === prev.message.uuid;
  const nextIsLatestBash = next.latestBashOutputUUID === next.message.uuid;
  if (prevIsLatestBash !== nextIsLatestBash)
    return false;
  if (prev.lastThinkingBlockId !== next.lastThinkingBlockId && hasThinkingContent(next.message)) {
    return false;
  }
  const isStreaming = isMessageStreaming(prev.message, prev.streamingToolUseIDs);
  const isResolved = allToolsResolved(prev.message, prev.lookups.resolvedToolUseIDs);
  if (isStreaming || !isResolved)
    return false;
  return true;
}
var import_compiler_runtime8, React, jsx_dev_runtime12, MessageRow;
var init_MessageRow = __esm(() => {
  init_ink();
  init_collapseReadSearch();
  init_messages();
  init_Message();
  init_MessageModel();
  init_Messages();
  init_MessageTimestamp();
  init_OffscreenFreeze();
  import_compiler_runtime8 = __toESM(require_compiler_runtime(), 1);
  React = __toESM(require_react(), 1);
  jsx_dev_runtime12 = __toESM(require_jsx_dev_runtime(), 1);
  MessageRow = React.memo(MessageRowImpl, areMessageRowPropsEqual);
});

// ../../src/components/messages/nullRenderingAttachments.ts
function isNullRenderingAttachment(msg) {
  return msg.type === "attachment" && NULL_RENDERING_ATTACHMENT_TYPES.has(msg.attachment.type);
}
var NULL_RENDERING_TYPES, NULL_RENDERING_ATTACHMENT_TYPES;
var init_nullRenderingAttachments = __esm(() => {
  NULL_RENDERING_TYPES = [
    "hook_success",
    "hook_additional_context",
    "hook_cancelled",
    "command_permissions",
    "agent_mention",
    "budget_usd",
    "critical_system_reminder",
    "edited_image_file",
    "edited_text_file",
    "opened_file_in_ide",
    "output_style",
    "plan_mode",
    "plan_mode_exit",
    "plan_mode_reentry",
    "structured_output",
    "team_context",
    "todo_reminder",
    "context_efficiency",
    "deferred_tools_delta",
    "mcp_instructions_delta",
    "companion_intro",
    "token_usage",
    "ultrathink_effort",
    "max_turns_reached",
    "task_reminder",
    "auto_mode",
    "auto_mode_exit",
    "output_token_usage",
    "pen_mode_enter",
    "pen_mode_exit",
    "verify_plan_reminder",
    "current_session_memory",
    "compaction_reminder",
    "date_change"
  ];
  NULL_RENDERING_ATTACHMENT_TYPES = new Set(NULL_RENDERING_TYPES);
});

// ../../src/utils/statusNoticeDefinitions.tsx
import { relative } from "path";
function getActiveNotices(context) {
  return statusNoticeDefinitions.filter((notice) => notice.isActive(context));
}
var jsx_dev_runtime13, largeMemoryFilesNotice, urAiSubscriberExternalTokenNotice, apiKeyConflictNotice, bothAuthMethodsNotice, largeAgentDescriptionsNotice, jetbrainsPluginNotice, statusNoticeDefinitions;
var init_statusNoticeDefinitions = __esm(() => {
  init_ink();
  init_agentmd();
  init_figures();
  init_cwd();
  init_format();
  init_auth();
  init_statusNoticeHelpers();
  init_ide();
  init_jetbrains();
  jsx_dev_runtime13 = __toESM(require_jsx_dev_runtime(), 1);
  largeMemoryFilesNotice = {
    id: "large-memory-files",
    type: "warning",
    isActive: (ctx) => getLargeMemoryFiles(ctx.memoryFiles).length > 0,
    render: (ctx) => {
      const largeMemoryFiles = getLargeMemoryFiles(ctx.memoryFiles);
      return /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(jsx_dev_runtime13.Fragment, {
        children: largeMemoryFiles.map((file) => {
          const displayPath = file.path.startsWith(getCwd()) ? relative(getCwd(), file.path) : file.path;
          return /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedBox_default, {
            flexDirection: "row",
            children: [
              /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
                color: "warning",
                children: figures_default.warning
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
                color: "warning",
                children: [
                  "Large ",
                  /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
                    bold: true,
                    children: displayPath
                  }, undefined, false, undefined, this),
                  " will impact performance (",
                  formatNumber(file.content.length),
                  " chars >",
                  " ",
                  formatNumber(MAX_MEMORY_CHARACTER_COUNT),
                  ")",
                  /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
                    dimColor: true,
                    children: " · /memory to edit"
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, file.path, true, undefined, this);
        })
      }, undefined, false, undefined, this);
    }
  };
  urAiSubscriberExternalTokenNotice = {
    id: "ur-ai-external-token",
    type: "warning",
    isActive: () => {
      const authTokenInfo = getAuthTokenSource();
      return isURAISubscriber() && (authTokenInfo.source === "URHQ_AUTH_TOKEN" || authTokenInfo.source === "apiKeyHelper");
    },
    render: () => {
      const authTokenInfo = getAuthTokenSource();
      return /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedBox_default, {
        flexDirection: "row",
        marginTop: 1,
        children: [
          /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
            color: "warning",
            children: figures_default.warning
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
            color: "warning",
            children: [
              "Auth conflict: Using ",
              authTokenInfo.source,
              " instead of UR account subscription token. Either unset ",
              authTokenInfo.source,
              ", or run `ur /logout`."
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this);
    }
  };
  apiKeyConflictNotice = {
    id: "api-key-conflict",
    type: "warning",
    isActive: () => {
      const {
        source: apiKeySource
      } = getURHQApiKeyWithSource({
        skipRetrievingKeyFromApiKeyHelper: true
      });
      return !!getApiKeyFromConfigOrMacOSKeychain() && (apiKeySource === "URHQ_API_KEY" || apiKeySource === "apiKeyHelper");
    },
    render: () => {
      const {
        source: apiKeySource
      } = getURHQApiKeyWithSource({
        skipRetrievingKeyFromApiKeyHelper: true
      });
      return /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedBox_default, {
        flexDirection: "row",
        marginTop: 1,
        children: [
          /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
            color: "warning",
            children: figures_default.warning
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
            color: "warning",
            children: [
              "Auth conflict: Using ",
              apiKeySource,
              " instead of URHQ Console key. Either unset ",
              apiKeySource,
              ", or run `ur /logout`."
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this);
    }
  };
  bothAuthMethodsNotice = {
    id: "both-auth-methods",
    type: "warning",
    isActive: () => {
      const {
        source: apiKeySource
      } = getURHQApiKeyWithSource({
        skipRetrievingKeyFromApiKeyHelper: true
      });
      const authTokenInfo = getAuthTokenSource();
      return apiKeySource !== "none" && authTokenInfo.source !== "none" && !(apiKeySource === "apiKeyHelper" && authTokenInfo.source === "apiKeyHelper");
    },
    render: () => {
      const {
        source: apiKeySource
      } = getURHQApiKeyWithSource({
        skipRetrievingKeyFromApiKeyHelper: true
      });
      const authTokenInfo = getAuthTokenSource();
      return /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedBox_default, {
        flexDirection: "column",
        marginTop: 1,
        children: [
          /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedBox_default, {
            flexDirection: "row",
            children: [
              /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
                color: "warning",
                children: figures_default.warning
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
                color: "warning",
                children: [
                  "Auth conflict: Both a token (",
                  authTokenInfo.source,
                  ") and an API key (",
                  apiKeySource,
                  ") are set. This may lead to unexpected behavior."
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedBox_default, {
            flexDirection: "column",
            marginLeft: 3,
            children: [
              /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
                color: "warning",
                children: [
                  "· Trying to use",
                  " ",
                  authTokenInfo.source === "ur.ai" ? "ur.ai" : authTokenInfo.source,
                  "?",
                  " ",
                  apiKeySource === "URHQ_API_KEY" ? 'Unset the URHQ_API_KEY environment variable, or ur /logout then say "No" to the API key approval before login.' : apiKeySource === "apiKeyHelper" ? "Unset the apiKeyHelper setting." : "ur /logout"
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
                color: "warning",
                children: [
                  "· Trying to use ",
                  apiKeySource,
                  "?",
                  " ",
                  authTokenInfo.source === "ur.ai" ? "ur /logout to sign out." : `Unset the ${authTokenInfo.source} environment variable.`
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this);
    }
  };
  largeAgentDescriptionsNotice = {
    id: "large-agent-descriptions",
    type: "warning",
    isActive: (context) => {
      const totalTokens = getAgentDescriptionsTotalTokens(context.agentDefinitions);
      return totalTokens > AGENT_DESCRIPTIONS_THRESHOLD;
    },
    render: (context) => {
      const totalTokens = getAgentDescriptionsTotalTokens(context.agentDefinitions);
      return /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedBox_default, {
        flexDirection: "row",
        children: [
          /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
            color: "warning",
            children: figures_default.warning
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
            color: "warning",
            children: [
              "Large cumulative agent descriptions will impact performance (~",
              formatNumber(totalTokens),
              " tokens >",
              " ",
              formatNumber(AGENT_DESCRIPTIONS_THRESHOLD),
              ")",
              /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
                dimColor: true,
                children: " · /agents to manage"
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this);
    }
  };
  jetbrainsPluginNotice = {
    id: "jetbrains-plugin-install",
    type: "info",
    isActive: (context) => {
      if (!isSupportedJetBrainsTerminal()) {
        return false;
      }
      const shouldAutoInstall = context.config.autoInstallIdeExtension ?? true;
      if (!shouldAutoInstall) {
        return false;
      }
      const ideType = getTerminalIdeType();
      return ideType !== null && !isJetBrainsPluginInstalledCachedSync(ideType);
    },
    render: () => {
      const ideType = getTerminalIdeType();
      const ideName = toIDEDisplayName(ideType);
      return /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedBox_default, {
        flexDirection: "row",
        gap: 1,
        marginLeft: 1,
        children: [
          /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
            color: "ide",
            children: figures_default.arrowUp
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
            children: [
              "Install the ",
              /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
                color: "ide",
                children: ideName
              }, undefined, false, undefined, this),
              " plugin from the JetBrains Marketplace:",
              " ",
              /* @__PURE__ */ jsx_dev_runtime13.jsxDEV(ThemedText, {
                bold: true,
                children: "https://docs.ur.com/s/ur-jetbrains"
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this);
    }
  };
  statusNoticeDefinitions = [largeMemoryFilesNotice, largeAgentDescriptionsNotice, urAiSubscriberExternalTokenNotice, apiKeyConflictNotice, bothAuthMethodsNotice, jetbrainsPluginNotice];
});

// ../../src/components/StatusNotices.tsx
function StatusNotices(t0) {
  const $ = import_compiler_runtime9.c(4);
  const {
    agentDefinitions
  } = t0 === undefined ? {} : t0;
  const t1 = getGlobalConfig();
  let t2;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = getMemoryFiles();
    $[0] = t2;
  } else {
    t2 = $[0];
  }
  const context = {
    config: t1,
    agentDefinitions,
    memoryFiles: import_react8.use(t2)
  };
  const activeNotices = getActiveNotices(context);
  if (activeNotices.length === 0) {
    return null;
  }
  const T0 = ThemedBox_default;
  const t3 = "column";
  const t4 = 1;
  const t5 = activeNotices.map((notice) => /* @__PURE__ */ jsx_dev_runtime14.jsxDEV(React2.Fragment, {
    children: notice.render(context)
  }, notice.id, false, undefined, this));
  let t6;
  if ($[1] !== T0 || $[2] !== t5) {
    t6 = /* @__PURE__ */ jsx_dev_runtime14.jsxDEV(T0, {
      flexDirection: t3,
      paddingLeft: t4,
      children: t5
    }, undefined, false, undefined, this);
    $[1] = T0;
    $[2] = t5;
    $[3] = t6;
  } else {
    t6 = $[3];
  }
  return t6;
}
var import_compiler_runtime9, React2, import_react8, jsx_dev_runtime14;
var init_StatusNotices = __esm(() => {
  init_ink();
  init_agentmd();
  init_config();
  init_statusNoticeDefinitions();
  import_compiler_runtime9 = __toESM(require_compiler_runtime(), 1);
  React2 = __toESM(require_react(), 1);
  import_react8 = __toESM(require_react(), 1);
  jsx_dev_runtime14 = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/hooks/useVirtualScroll.ts
function useVirtualScroll(scrollRef, itemKeys, columns) {
  const heightCache = import_react9.useRef(new Map);
  const offsetVersionRef = import_react9.useRef(0);
  const lastScrollTopRef = import_react9.useRef(0);
  const offsetsRef = import_react9.useRef({
    arr: new Float64Array(0),
    version: -1,
    n: -1
  });
  const itemRefs = import_react9.useRef(new Map);
  const refCache = import_react9.useRef(new Map);
  const prevColumns = import_react9.useRef(columns);
  const skipMeasurementRef = import_react9.useRef(false);
  const prevRangeRef = import_react9.useRef(null);
  const freezeRendersRef = import_react9.useRef(0);
  if (prevColumns.current !== columns) {
    const ratio = prevColumns.current / columns;
    prevColumns.current = columns;
    for (const [k, h] of heightCache.current) {
      heightCache.current.set(k, Math.max(1, Math.round(h * ratio)));
    }
    offsetVersionRef.current++;
    skipMeasurementRef.current = true;
    freezeRendersRef.current = 2;
  }
  const frozenRange = freezeRendersRef.current > 0 ? prevRangeRef.current : null;
  const listOriginRef = import_react9.useRef(0);
  const spacerRef = import_react9.useRef(null);
  const subscribe = import_react9.useCallback((listener) => scrollRef.current?.subscribe(listener) ?? NOOP_UNSUB, [scrollRef]);
  import_react9.useSyncExternalStore(subscribe, () => {
    const s = scrollRef.current;
    if (!s)
      return NaN;
    const target = s.getScrollTop() + s.getPendingDelta();
    const bin = Math.floor(target / SCROLL_QUANTUM);
    return s.isSticky() ? ~bin : bin;
  });
  const scrollTop = scrollRef.current?.getScrollTop() ?? -1;
  const pendingDelta = scrollRef.current?.getPendingDelta() ?? 0;
  const viewportH = scrollRef.current?.getViewportHeight() ?? 0;
  const isSticky = scrollRef.current?.isSticky() ?? true;
  import_react9.useMemo(() => {
    const live = new Set(itemKeys);
    let dirty = false;
    for (const k of heightCache.current.keys()) {
      if (!live.has(k)) {
        heightCache.current.delete(k);
        dirty = true;
      }
    }
    for (const k of refCache.current.keys()) {
      if (!live.has(k))
        refCache.current.delete(k);
    }
    if (dirty)
      offsetVersionRef.current++;
  }, [itemKeys]);
  const n = itemKeys.length;
  if (offsetsRef.current.version !== offsetVersionRef.current || offsetsRef.current.n !== n) {
    const arr = offsetsRef.current.arr.length >= n + 1 ? offsetsRef.current.arr : new Float64Array(n + 1);
    arr[0] = 0;
    for (let i = 0;i < n; i++) {
      arr[i + 1] = arr[i] + (heightCache.current.get(itemKeys[i]) ?? DEFAULT_ESTIMATE);
    }
    offsetsRef.current = { arr, version: offsetVersionRef.current, n };
  }
  const offsets = offsetsRef.current.arr;
  const totalHeight = offsets[n];
  let start;
  let end;
  if (frozenRange) {
    [start, end] = frozenRange;
    start = Math.min(start, n);
    end = Math.min(end, n);
  } else if (viewportH === 0 || scrollTop < 0) {
    start = Math.max(0, n - COLD_START_COUNT);
    end = n;
  } else {
    if (isSticky) {
      const budget = viewportH + OVERSCAN_ROWS;
      start = n;
      while (start > 0 && totalHeight - offsets[start - 1] < budget) {
        start--;
      }
      end = n;
    } else {
      const listOrigin2 = listOriginRef.current;
      const MAX_SPAN_ROWS = viewportH * 3;
      const rawLo = Math.min(scrollTop, scrollTop + pendingDelta);
      const rawHi = Math.max(scrollTop, scrollTop + pendingDelta);
      const span = rawHi - rawLo;
      const clampedLo = span > MAX_SPAN_ROWS ? pendingDelta < 0 ? rawHi - MAX_SPAN_ROWS : rawLo : rawLo;
      const clampedHi = clampedLo + Math.min(span, MAX_SPAN_ROWS);
      const effLo = Math.max(0, clampedLo - listOrigin2);
      const effHi = clampedHi - listOrigin2;
      const lo = effLo - OVERSCAN_ROWS;
      {
        let l = 0;
        let r = n;
        while (l < r) {
          const m = l + r >> 1;
          if (offsets[m + 1] <= lo)
            l = m + 1;
          else
            r = m;
        }
        start = l;
      }
      {
        const p = prevRangeRef.current;
        if (p && p[0] < start) {
          for (let i = p[0];i < Math.min(start, p[1]); i++) {
            const k = itemKeys[i];
            if (itemRefs.current.has(k) && !heightCache.current.has(k)) {
              start = i;
              break;
            }
          }
        }
      }
      const needed2 = viewportH + 2 * OVERSCAN_ROWS;
      const maxEnd = Math.min(n, start + MAX_MOUNTED_ITEMS);
      let coverage2 = 0;
      end = start;
      while (end < maxEnd && (coverage2 < needed2 || offsets[end] < effHi + viewportH + OVERSCAN_ROWS)) {
        coverage2 += heightCache.current.get(itemKeys[end]) ?? PESSIMISTIC_HEIGHT;
        end++;
      }
    }
    const needed = viewportH + 2 * OVERSCAN_ROWS;
    const minStart = Math.max(0, end - MAX_MOUNTED_ITEMS);
    let coverage = 0;
    for (let i = start;i < end; i++) {
      coverage += heightCache.current.get(itemKeys[i]) ?? PESSIMISTIC_HEIGHT;
    }
    while (start > minStart && coverage < needed) {
      start--;
      coverage += heightCache.current.get(itemKeys[start]) ?? PESSIMISTIC_HEIGHT;
    }
    const prev = prevRangeRef.current;
    const scrollVelocity = Math.abs(scrollTop - lastScrollTopRef.current) + Math.abs(pendingDelta);
    if (prev && scrollVelocity > viewportH * 2) {
      const [pS, pE] = prev;
      if (start < pS - SLIDE_STEP)
        start = pS - SLIDE_STEP;
      if (end > pE + SLIDE_STEP)
        end = pE + SLIDE_STEP;
      if (start > end)
        end = Math.min(start + SLIDE_STEP, n);
    }
    lastScrollTopRef.current = scrollTop;
  }
  if (freezeRendersRef.current > 0) {
    freezeRendersRef.current--;
  } else {
    prevRangeRef.current = [start, end];
  }
  const dStart = import_react9.useDeferredValue(start);
  const dEnd = import_react9.useDeferredValue(end);
  let effStart = start < dStart ? dStart : start;
  let effEnd = end > dEnd ? dEnd : end;
  if (effStart > effEnd || isSticky) {
    effStart = start;
    effEnd = end;
  }
  if (pendingDelta > 0) {
    effEnd = end;
  }
  if (effEnd - effStart > MAX_MOUNTED_ITEMS) {
    const mid = (offsets[effStart] + offsets[effEnd]) / 2;
    if (scrollTop - listOriginRef.current < mid) {
      effEnd = effStart + MAX_MOUNTED_ITEMS;
    } else {
      effStart = effEnd - MAX_MOUNTED_ITEMS;
    }
  }
  const listOrigin = listOriginRef.current;
  const effTopSpacer = offsets[effStart];
  const clampMin = effStart === 0 ? 0 : effTopSpacer + listOrigin;
  const clampMax = effEnd === n ? Infinity : Math.max(effTopSpacer, offsets[effEnd] - viewportH) + listOrigin;
  import_react9.useLayoutEffect(() => {
    if (isSticky) {
      scrollRef.current?.setClampBounds(undefined, undefined);
    } else {
      scrollRef.current?.setClampBounds(clampMin, clampMax);
    }
  });
  import_react9.useLayoutEffect(() => {
    const spacerYoga = spacerRef.current?.yogaNode;
    if (spacerYoga && spacerYoga.getComputedWidth() > 0) {
      listOriginRef.current = spacerYoga.getComputedTop();
    }
    if (skipMeasurementRef.current) {
      skipMeasurementRef.current = false;
      return;
    }
    let anyChanged = false;
    for (const [key, el] of itemRefs.current) {
      const yoga = el.yogaNode;
      if (!yoga)
        continue;
      const h = yoga.getComputedHeight();
      const prev = heightCache.current.get(key);
      if (h > 0) {
        if (prev !== h) {
          heightCache.current.set(key, h);
          anyChanged = true;
        }
      } else if (yoga.getComputedWidth() > 0 && prev !== 0) {
        heightCache.current.set(key, 0);
        anyChanged = true;
      }
    }
    if (anyChanged)
      offsetVersionRef.current++;
  });
  const measureRef = import_react9.useCallback((key) => {
    let fn = refCache.current.get(key);
    if (!fn) {
      fn = (el) => {
        if (el) {
          itemRefs.current.set(key, el);
        } else {
          const yoga = itemRefs.current.get(key)?.yogaNode;
          if (yoga && !skipMeasurementRef.current) {
            const h = yoga.getComputedHeight();
            if ((h > 0 || yoga.getComputedWidth() > 0) && heightCache.current.get(key) !== h) {
              heightCache.current.set(key, h);
              offsetVersionRef.current++;
            }
          }
          itemRefs.current.delete(key);
        }
      };
      refCache.current.set(key, fn);
    }
    return fn;
  }, []);
  const getItemTop = import_react9.useCallback((index) => {
    const yoga = itemRefs.current.get(itemKeys[index])?.yogaNode;
    if (!yoga || yoga.getComputedWidth() === 0)
      return -1;
    return yoga.getComputedTop();
  }, [itemKeys]);
  const getItemElement = import_react9.useCallback((index) => itemRefs.current.get(itemKeys[index]) ?? null, [itemKeys]);
  const getItemHeight = import_react9.useCallback((index) => heightCache.current.get(itemKeys[index]), [itemKeys]);
  const scrollToIndex = import_react9.useCallback((i) => {
    const o = offsetsRef.current;
    if (i < 0 || i >= o.n)
      return;
    scrollRef.current?.scrollTo(o.arr[i] + listOriginRef.current);
  }, [scrollRef]);
  const effBottomSpacer = totalHeight - offsets[effEnd];
  return {
    range: [effStart, effEnd],
    topSpacer: effTopSpacer,
    bottomSpacer: effBottomSpacer,
    measureRef,
    spacerRef,
    offsets,
    getItemTop,
    getItemElement,
    getItemHeight,
    scrollToIndex
  };
}
var import_react9, DEFAULT_ESTIMATE = 3, OVERSCAN_ROWS = 80, COLD_START_COUNT = 30, SCROLL_QUANTUM, PESSIMISTIC_HEIGHT = 1, MAX_MOUNTED_ITEMS = 300, SLIDE_STEP = 25, NOOP_UNSUB = () => {};
var init_useVirtualScroll = __esm(() => {
  import_react9 = __toESM(require_react(), 1);
  SCROLL_QUANTUM = OVERSCAN_ROWS >> 1;
});

// ../../src/context/promptOverlayContext.tsx
var import_compiler_runtime10, import_react10, jsx_dev_runtime15, DataContext, SetContext, DialogContext, SetDialogContext;
var init_promptOverlayContext = __esm(() => {
  import_compiler_runtime10 = __toESM(require_compiler_runtime(), 1);
  import_react10 = __toESM(require_react(), 1);
  jsx_dev_runtime15 = __toESM(require_jsx_dev_runtime(), 1);
  DataContext = import_react10.createContext(null);
  SetContext = import_react10.createContext(null);
  DialogContext = import_react10.createContext(null);
  SetDialogContext = import_react10.createContext(null);
});

// ../../src/components/FullscreenLayout.tsx
var import_compiler_runtime11, import_react11, jsx_dev_runtime16, ScrollChromeContext;
var init_FullscreenLayout = __esm(() => {
  init_modalContext();
  init_promptOverlayContext();
  init_useTerminalSize();
  init_ScrollBox();
  init_instances();
  init_ink();
  init_browser();
  init_fullscreen();
  init_stringUtils();
  init_nullRenderingAttachments();
  init_PromptInputFooterSuggestions();
  import_compiler_runtime11 = __toESM(require_compiler_runtime(), 1);
  import_react11 = __toESM(require_react(), 1);
  jsx_dev_runtime16 = __toESM(require_jsx_dev_runtime(), 1);
  ScrollChromeContext = import_react11.createContext({
    setStickyPrompt: () => {}
  });
});

// ../../src/components/VirtualMessageList.tsx
function defaultExtractSearchText(msg) {
  const cached = fallbackLowerCache.get(msg);
  if (cached !== undefined)
    return cached;
  const lowered = renderableSearchText(msg);
  fallbackLowerCache.set(msg, lowered);
  return lowered;
}
function stickyPromptText(msg) {
  const cached = promptTextCache.get(msg);
  if (cached !== undefined)
    return cached;
  const result = computeStickyPromptText(msg);
  promptTextCache.set(msg, result);
  return result;
}
function computeStickyPromptText(msg) {
  let raw = null;
  if (msg.type === "user") {
    if (msg.isMeta || msg.isVisibleInTranscriptOnly)
      return null;
    const block = msg.message.content[0];
    if (block?.type !== "text")
      return null;
    raw = block.text;
  } else if (msg.type === "attachment" && msg.attachment.type === "queued_command" && msg.attachment.commandMode !== "task-notification" && !msg.attachment.isMeta) {
    const p = msg.attachment.prompt;
    raw = typeof p === "string" ? p : p.flatMap((b) => b.type === "text" ? [b.text] : []).join(`
`);
  }
  if (raw === null)
    return null;
  const t = stripSystemReminders(raw);
  if (t.startsWith("<") || t === "")
    return null;
  return t;
}
function VirtualItem(t0) {
  const $ = import_compiler_runtime12.c(30);
  const {
    itemKey: k,
    msg,
    idx,
    measureRef,
    expanded,
    hovered,
    clickable,
    onClickK,
    onEnterK,
    onLeaveK,
    renderItem
  } = t0;
  let t1;
  if ($[0] !== k || $[1] !== measureRef) {
    t1 = measureRef(k);
    $[0] = k;
    $[1] = measureRef;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const t2 = expanded ? "userMessageBackgroundHover" : undefined;
  const t3 = expanded ? 1 : undefined;
  let t4;
  if ($[3] !== clickable || $[4] !== msg || $[5] !== onClickK) {
    t4 = clickable ? (e) => onClickK(msg, e.cellIsBlank) : undefined;
    $[3] = clickable;
    $[4] = msg;
    $[5] = onClickK;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== clickable || $[8] !== k || $[9] !== onEnterK) {
    t5 = clickable ? () => onEnterK(k) : undefined;
    $[7] = clickable;
    $[8] = k;
    $[9] = onEnterK;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  let t6;
  if ($[11] !== clickable || $[12] !== k || $[13] !== onLeaveK) {
    t6 = clickable ? () => onLeaveK(k) : undefined;
    $[11] = clickable;
    $[12] = k;
    $[13] = onLeaveK;
    $[14] = t6;
  } else {
    t6 = $[14];
  }
  const t7 = hovered && !expanded ? "text" : undefined;
  let t8;
  if ($[15] !== idx || $[16] !== msg || $[17] !== renderItem) {
    t8 = renderItem(msg, idx);
    $[15] = idx;
    $[16] = msg;
    $[17] = renderItem;
    $[18] = t8;
  } else {
    t8 = $[18];
  }
  let t9;
  if ($[19] !== t7 || $[20] !== t8) {
    t9 = /* @__PURE__ */ jsx_dev_runtime17.jsxDEV(TextHoverColorContext.Provider, {
      value: t7,
      children: t8
    }, undefined, false, undefined, this);
    $[19] = t7;
    $[20] = t8;
    $[21] = t9;
  } else {
    t9 = $[21];
  }
  let t10;
  if ($[22] !== t1 || $[23] !== t2 || $[24] !== t3 || $[25] !== t4 || $[26] !== t5 || $[27] !== t6 || $[28] !== t9) {
    t10 = /* @__PURE__ */ jsx_dev_runtime17.jsxDEV(ThemedBox_default, {
      ref: t1,
      flexDirection: "column",
      backgroundColor: t2,
      paddingBottom: t3,
      onClick: t4,
      onMouseEnter: t5,
      onMouseLeave: t6,
      children: t9
    }, undefined, false, undefined, this);
    $[22] = t1;
    $[23] = t2;
    $[24] = t3;
    $[25] = t4;
    $[26] = t5;
    $[27] = t6;
    $[28] = t9;
    $[29] = t10;
  } else {
    t10 = $[29];
  }
  return t10;
}
function VirtualMessageList({
  messages,
  scrollRef,
  columns,
  itemKey,
  renderItem,
  onItemClick,
  isItemClickable,
  isItemExpanded,
  extractSearchText = defaultExtractSearchText,
  trackStickyPrompt,
  selectedIndex,
  cursorNavRef,
  setCursor,
  jumpRef,
  onSearchMatchesChange,
  scanElement,
  setPositions
}) {
  const keysRef = import_react12.useRef([]);
  const prevMessagesRef = import_react12.useRef(messages);
  const prevItemKeyRef = import_react12.useRef(itemKey);
  if (prevItemKeyRef.current !== itemKey || messages.length < keysRef.current.length || messages[0] !== prevMessagesRef.current[0]) {
    keysRef.current = messages.map((m) => itemKey(m));
  } else {
    for (let i = keysRef.current.length;i < messages.length; i++) {
      keysRef.current.push(itemKey(messages[i]));
    }
  }
  prevMessagesRef.current = messages;
  prevItemKeyRef.current = itemKey;
  const keys = keysRef.current;
  const {
    range,
    topSpacer,
    bottomSpacer,
    measureRef,
    spacerRef,
    offsets,
    getItemTop,
    getItemElement,
    getItemHeight,
    scrollToIndex
  } = useVirtualScroll(scrollRef, keys, columns);
  const [start, end] = range;
  const isVisible = import_react12.useCallback((i) => {
    const h = getItemHeight(i);
    if (h === 0)
      return false;
    return isNavigableMessage(messages[i]);
  }, [getItemHeight, messages]);
  import_react12.useImperativeHandle(cursorNavRef, () => {
    const select = (m) => setCursor?.({
      uuid: m.uuid,
      msgType: m.type,
      expanded: false,
      toolName: toolCallOf(m)?.name
    });
    const selIdx = selectedIndex ?? -1;
    const scan = (from, dir, pred = isVisible) => {
      for (let i = from;i >= 0 && i < messages.length; i += dir) {
        if (pred(i)) {
          select(messages[i]);
          return true;
        }
      }
      return false;
    };
    const isUser = (i) => isVisible(i) && messages[i].type === "user";
    return {
      enterCursor: () => scan(messages.length - 1, -1, isUser),
      navigatePrev: () => scan(selIdx - 1, -1),
      navigateNext: () => {
        if (scan(selIdx + 1, 1))
          return;
        scrollRef.current?.scrollToBottom();
        setCursor?.(null);
      },
      navigatePrevUser: () => scan(selIdx - 1, -1, isUser),
      navigateNextUser: () => scan(selIdx + 1, 1, isUser),
      navigateTop: () => scan(0, 1),
      navigateBottom: () => scan(messages.length - 1, -1),
      getSelected: () => selIdx >= 0 ? messages[selIdx] ?? null : null
    };
  }, [messages, selectedIndex, setCursor, isVisible]);
  const jumpState = import_react12.useRef({
    offsets,
    start,
    getItemElement,
    getItemTop,
    messages,
    scrollToIndex
  });
  jumpState.current = {
    offsets,
    start,
    getItemElement,
    getItemTop,
    messages,
    scrollToIndex
  };
  import_react12.useEffect(() => {
    if (selectedIndex === undefined)
      return;
    const s = jumpState.current;
    const el = s.getItemElement(selectedIndex);
    if (el) {
      scrollRef.current?.scrollToElement(el, 1);
    } else {
      s.scrollToIndex(selectedIndex);
    }
  }, [selectedIndex, scrollRef]);
  const scanRequestRef = import_react12.useRef(null);
  const elementPositions = import_react12.useRef({
    msgIdx: -1,
    positions: []
  });
  const startPtrRef = import_react12.useRef(-1);
  const phantomBurstRef = import_react12.useRef(0);
  const pendingStepRef = import_react12.useRef(0);
  const stepRef = import_react12.useRef(() => {});
  const highlightRef = import_react12.useRef(() => {});
  const searchState = import_react12.useRef({
    matches: [],
    ptr: 0,
    screenOrd: 0,
    prefixSum: []
  });
  const searchAnchor = import_react12.useRef(-1);
  const indexWarmed = import_react12.useRef(false);
  function targetFor(i) {
    const top = jumpState.current.getItemTop(i);
    return Math.max(0, top - HEADROOM);
  }
  function highlight(ord) {
    const s = scrollRef.current;
    const {
      msgIdx,
      positions
    } = elementPositions.current;
    if (!s || positions.length === 0 || msgIdx < 0) {
      setPositions?.(null);
      return;
    }
    const idx = Math.max(0, Math.min(ord, positions.length - 1));
    const p = positions[idx];
    const top = jumpState.current.getItemTop(msgIdx);
    const vpTop = s.getViewportTop();
    let lo = top - s.getScrollTop();
    const vp = s.getViewportHeight();
    let screenRow = vpTop + lo + p.row;
    if (screenRow < vpTop || screenRow >= vpTop + vp) {
      s.scrollTo(Math.max(0, top + p.row - HEADROOM));
      lo = top - s.getScrollTop();
      screenRow = vpTop + lo + p.row;
    }
    setPositions?.({
      positions,
      rowOffset: vpTop + lo,
      currentIdx: idx
    });
    const st = searchState.current;
    const total = st.prefixSum.at(-1) ?? 0;
    const current = (st.prefixSum[st.ptr] ?? 0) + idx + 1;
    onSearchMatchesChange?.(total, current);
    logForDebugging(`highlight(i=${msgIdx}, ord=${idx}/${positions.length}): ` + `pos={row:${p.row},col:${p.col}} lo=${lo} screenRow=${screenRow} ` + `badge=${current}/${total}`);
  }
  highlightRef.current = highlight;
  const [seekGen, setSeekGen] = import_react12.useState(0);
  const bumpSeek = import_react12.useCallback(() => setSeekGen((g) => g + 1), []);
  import_react12.useEffect(() => {
    const req = scanRequestRef.current;
    if (!req)
      return;
    const {
      idx,
      wantLast,
      tries
    } = req;
    const s = scrollRef.current;
    if (!s)
      return;
    const {
      getItemElement: getItemElement2,
      getItemTop: getItemTop2,
      scrollToIndex: scrollToIndex2
    } = jumpState.current;
    const el = getItemElement2(idx);
    const h = el?.yogaNode?.getComputedHeight() ?? 0;
    if (!el || h === 0) {
      if (tries > 1) {
        scanRequestRef.current = null;
        logForDebugging(`seek(i=${idx}): no mount after scrollToIndex, skip`);
        stepRef.current(wantLast ? -1 : 1);
        return;
      }
      scanRequestRef.current = {
        idx,
        wantLast,
        tries: tries + 1
      };
      scrollToIndex2(idx);
      bumpSeek();
      return;
    }
    scanRequestRef.current = null;
    s.scrollTo(Math.max(0, getItemTop2(idx) - HEADROOM));
    const positions = scanElement?.(el) ?? [];
    elementPositions.current = {
      msgIdx: idx,
      positions
    };
    logForDebugging(`seek(i=${idx} t=${tries}): ${positions.length} positions`);
    if (positions.length === 0) {
      if (++phantomBurstRef.current > 20) {
        phantomBurstRef.current = 0;
        return;
      }
      stepRef.current(wantLast ? -1 : 1);
      return;
    }
    phantomBurstRef.current = 0;
    const ord = wantLast ? positions.length - 1 : 0;
    searchState.current.screenOrd = ord;
    startPtrRef.current = -1;
    highlightRef.current(ord);
    const pending = pendingStepRef.current;
    if (pending) {
      pendingStepRef.current = 0;
      stepRef.current(pending);
    }
  }, [seekGen]);
  function jump(i, wantLast) {
    const s = scrollRef.current;
    if (!s)
      return;
    const js = jumpState.current;
    const {
      getItemElement: getItemElement2,
      scrollToIndex: scrollToIndex2
    } = js;
    if (i < 0 || i >= js.messages.length)
      return;
    setPositions?.(null);
    elementPositions.current = {
      msgIdx: -1,
      positions: []
    };
    scanRequestRef.current = {
      idx: i,
      wantLast,
      tries: 0
    };
    const el = getItemElement2(i);
    const h = el?.yogaNode?.getComputedHeight() ?? 0;
    if (el && h > 0) {
      s.scrollTo(targetFor(i));
    } else {
      scrollToIndex2(i);
    }
    bumpSeek();
  }
  function step(delta) {
    const st = searchState.current;
    const {
      matches,
      prefixSum
    } = st;
    const total = prefixSum.at(-1) ?? 0;
    if (matches.length === 0)
      return;
    if (scanRequestRef.current) {
      pendingStepRef.current = delta;
      return;
    }
    if (startPtrRef.current < 0)
      startPtrRef.current = st.ptr;
    const {
      positions
    } = elementPositions.current;
    const newOrd = st.screenOrd + delta;
    if (newOrd >= 0 && newOrd < positions.length) {
      st.screenOrd = newOrd;
      highlight(newOrd);
      startPtrRef.current = -1;
      return;
    }
    const ptr = (st.ptr + delta + matches.length) % matches.length;
    if (ptr === startPtrRef.current) {
      setPositions?.(null);
      startPtrRef.current = -1;
      logForDebugging(`step: wraparound at ptr=${ptr}, all ${matches.length} msgs phantoms`);
      return;
    }
    st.ptr = ptr;
    st.screenOrd = 0;
    jump(matches[ptr], delta < 0);
    const placeholder = delta < 0 ? prefixSum[ptr + 1] ?? total : prefixSum[ptr] + 1;
    onSearchMatchesChange?.(total, placeholder);
  }
  stepRef.current = step;
  import_react12.useImperativeHandle(jumpRef, () => ({
    jumpToIndex: (i) => {
      const s = scrollRef.current;
      if (s)
        s.scrollTo(targetFor(i));
    },
    setSearchQuery: (q) => {
      scanRequestRef.current = null;
      elementPositions.current = {
        msgIdx: -1,
        positions: []
      };
      startPtrRef.current = -1;
      setPositions?.(null);
      const lq = q.toLowerCase();
      const matches = [];
      const prefixSum = [0];
      if (lq) {
        const msgs = jumpState.current.messages;
        for (let i = 0;i < msgs.length; i++) {
          const text = extractSearchText(msgs[i]);
          let pos = text.indexOf(lq);
          let cnt = 0;
          while (pos >= 0) {
            cnt++;
            pos = text.indexOf(lq, pos + lq.length);
          }
          if (cnt > 0) {
            matches.push(i);
            prefixSum.push(prefixSum.at(-1) + cnt);
          }
        }
      }
      const total = prefixSum.at(-1);
      let ptr = 0;
      const s = scrollRef.current;
      const {
        offsets: offsets2,
        start: start2,
        getItemTop: getItemTop2
      } = jumpState.current;
      const firstTop = getItemTop2(start2);
      const origin = firstTop >= 0 ? firstTop - offsets2[start2] : 0;
      if (matches.length > 0 && s) {
        const curTop = searchAnchor.current >= 0 ? searchAnchor.current : s.getScrollTop();
        let best = Infinity;
        for (let k = 0;k < matches.length; k++) {
          const d = Math.abs(origin + offsets2[matches[k]] - curTop);
          if (d <= best) {
            best = d;
            ptr = k;
          }
        }
        logForDebugging(`setSearchQuery('${q}'): ${matches.length} msgs · ptr=${ptr} ` + `msgIdx=${matches[ptr]} curTop=${curTop} origin=${origin}`);
      }
      searchState.current = {
        matches,
        ptr,
        screenOrd: 0,
        prefixSum
      };
      if (matches.length > 0) {
        jump(matches[ptr], true);
      } else if (searchAnchor.current >= 0 && s) {
        s.scrollTo(searchAnchor.current);
      }
      onSearchMatchesChange?.(total, matches.length > 0 ? prefixSum[ptr + 1] ?? total : 0);
    },
    nextMatch: () => step(1),
    prevMatch: () => step(-1),
    setAnchor: () => {
      const s = scrollRef.current;
      if (s)
        searchAnchor.current = s.getScrollTop();
    },
    disarmSearch: () => {
      setPositions?.(null);
      scanRequestRef.current = null;
      elementPositions.current = {
        msgIdx: -1,
        positions: []
      };
      startPtrRef.current = -1;
    },
    warmSearchIndex: async () => {
      if (indexWarmed.current)
        return 0;
      const msgs = jumpState.current.messages;
      const CHUNK = 500;
      let workMs = 0;
      const wallStart = performance.now();
      for (let i = 0;i < msgs.length; i += CHUNK) {
        await sleep(0);
        const t0 = performance.now();
        const end2 = Math.min(i + CHUNK, msgs.length);
        for (let j = i;j < end2; j++) {
          extractSearchText(msgs[j]);
        }
        workMs += performance.now() - t0;
      }
      const wallMs = Math.round(performance.now() - wallStart);
      logForDebugging(`warmSearchIndex: ${msgs.length} msgs · work=${Math.round(workMs)}ms wall=${wallMs}ms chunks=${Math.ceil(msgs.length / CHUNK)}`);
      indexWarmed.current = true;
      return Math.round(workMs);
    }
  }), [scrollRef]);
  const [hoveredKey, setHoveredKey] = import_react12.useState(null);
  const handlersRef = import_react12.useRef({
    onItemClick,
    setHoveredKey
  });
  handlersRef.current = {
    onItemClick,
    setHoveredKey
  };
  const onClickK = import_react12.useCallback((msg, cellIsBlank) => {
    const h = handlersRef.current;
    if (!cellIsBlank && h.onItemClick)
      h.onItemClick(msg);
  }, []);
  const onEnterK = import_react12.useCallback((k) => {
    handlersRef.current.setHoveredKey(k);
  }, []);
  const onLeaveK = import_react12.useCallback((k) => {
    handlersRef.current.setHoveredKey((prev) => prev === k ? null : prev);
  }, []);
  return /* @__PURE__ */ jsx_dev_runtime17.jsxDEV(jsx_dev_runtime17.Fragment, {
    children: [
      /* @__PURE__ */ jsx_dev_runtime17.jsxDEV(ThemedBox_default, {
        ref: spacerRef,
        height: topSpacer,
        flexShrink: 0
      }, undefined, false, undefined, this),
      messages.slice(start, end).map((msg, i) => {
        const idx = start + i;
        const k = keys[idx];
        const clickable = !!onItemClick && (isItemClickable?.(msg) ?? true);
        const hovered = clickable && hoveredKey === k;
        const expanded = isItemExpanded?.(msg);
        return /* @__PURE__ */ jsx_dev_runtime17.jsxDEV(VirtualItem, {
          itemKey: k,
          msg,
          idx,
          measureRef,
          expanded,
          hovered,
          clickable,
          onClickK,
          onEnterK,
          onLeaveK,
          renderItem
        }, k, false, undefined, this);
      }),
      bottomSpacer > 0 && /* @__PURE__ */ jsx_dev_runtime17.jsxDEV(ThemedBox_default, {
        height: bottomSpacer,
        flexShrink: 0
      }, undefined, false, undefined, this),
      trackStickyPrompt && /* @__PURE__ */ jsx_dev_runtime17.jsxDEV(StickyTracker, {
        messages,
        start,
        end,
        offsets,
        getItemTop,
        getItemElement,
        scrollRef
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}
function StickyTracker({
  messages,
  start,
  end,
  offsets,
  getItemTop,
  getItemElement,
  scrollRef
}) {
  const {
    setStickyPrompt
  } = import_react12.useContext(ScrollChromeContext);
  const subscribe = import_react12.useCallback((listener) => scrollRef.current?.subscribe(listener) ?? NOOP_UNSUB2, [scrollRef]);
  import_react12.useSyncExternalStore(subscribe, () => {
    const s = scrollRef.current;
    if (!s)
      return NaN;
    const t = s.getScrollTop() + s.getPendingDelta();
    return s.isSticky() ? -1 - t : t;
  });
  const isSticky = scrollRef.current?.isSticky() ?? true;
  const target = Math.max(0, (scrollRef.current?.getScrollTop() ?? 0) + (scrollRef.current?.getPendingDelta() ?? 0));
  let firstVisible = start;
  let firstVisibleTop = -1;
  for (let i = end - 1;i >= start; i--) {
    const top = getItemTop(i);
    if (top >= 0) {
      if (top < target)
        break;
      firstVisibleTop = top;
    }
    firstVisible = i;
  }
  let idx = -1;
  let text = null;
  if (firstVisible > 0 && !isSticky) {
    for (let i = firstVisible - 1;i >= 0; i--) {
      const t = stickyPromptText(messages[i]);
      if (t === null)
        continue;
      const top = getItemTop(i);
      if (top >= 0 && top + 1 >= target)
        continue;
      idx = i;
      text = t;
      break;
    }
  }
  const baseOffset = firstVisibleTop >= 0 ? firstVisibleTop - offsets[firstVisible] : 0;
  const estimate = idx >= 0 ? Math.max(0, baseOffset + offsets[idx]) : -1;
  const pending = import_react12.useRef({
    idx: -1,
    tries: 0
  });
  const suppress = import_react12.useRef("none");
  const lastIdx = import_react12.useRef(-1);
  import_react12.useEffect(() => {
    if (pending.current.idx >= 0)
      return;
    if (suppress.current === "armed") {
      suppress.current = "force";
      return;
    }
    const force = suppress.current === "force";
    suppress.current = "none";
    if (!force && lastIdx.current === idx)
      return;
    lastIdx.current = idx;
    if (text === null) {
      setStickyPrompt(null);
      return;
    }
    const trimmed = text.trimStart();
    const paraEnd = trimmed.search(/\n\s*\n/);
    const collapsed = (paraEnd >= 0 ? trimmed.slice(0, paraEnd) : trimmed).slice(0, STICKY_TEXT_CAP).replace(/\s+/g, " ").trim();
    if (collapsed === "") {
      setStickyPrompt(null);
      return;
    }
    const capturedIdx = idx;
    const capturedEstimate = estimate;
    setStickyPrompt({
      text: collapsed,
      scrollTo: () => {
        setStickyPrompt("clicked");
        suppress.current = "armed";
        const el = getItemElement(capturedIdx);
        if (el) {
          scrollRef.current?.scrollToElement(el, 1);
        } else {
          scrollRef.current?.scrollTo(capturedEstimate);
          pending.current = {
            idx: capturedIdx,
            tries: 0
          };
        }
      }
    });
  });
  import_react12.useEffect(() => {
    if (pending.current.idx < 0)
      return;
    const el = getItemElement(pending.current.idx);
    if (el) {
      scrollRef.current?.scrollToElement(el, 1);
      pending.current = {
        idx: -1,
        tries: 0
      };
    } else if (++pending.current.tries > 5) {
      pending.current = {
        idx: -1,
        tries: 0
      };
    }
  });
  return null;
}
var import_compiler_runtime12, import_react12, jsx_dev_runtime17, HEADROOM = 3, fallbackLowerCache, STICKY_TEXT_CAP = 500, promptTextCache, NOOP_UNSUB2 = () => {};
var init_VirtualMessageList = __esm(() => {
  init_useVirtualScroll();
  init_ink();
  init_ThemedText();
  init_FullscreenLayout();
  init_debug();
  init_sleep();
  init_transcriptSearch();
  init_messageActions();
  import_compiler_runtime12 = __toESM(require_compiler_runtime(), 1);
  import_react12 = __toESM(require_react(), 1);
  jsx_dev_runtime17 = __toESM(require_jsx_dev_runtime(), 1);
  fallbackLowerCache = new WeakMap;
  promptTextCache = new WeakMap;
});

// ../../src/components/Messages.tsx
function filterForBriefTool(messages, briefToolNames) {
  const nameSet = new Set(briefToolNames);
  const briefToolUseIDs = new Set;
  return messages.filter((msg) => {
    if (msg.type === "system")
      return msg.subtype !== "api_metrics";
    const block = msg.message?.content[0];
    if (msg.type === "assistant") {
      if (msg.isApiErrorMessage)
        return true;
      if (block?.type === "tool_use" && block.name && nameSet.has(block.name)) {
        if ("id" in block) {
          briefToolUseIDs.add(block.id);
        }
        return true;
      }
      return false;
    }
    if (msg.type === "user") {
      if (block?.type === "tool_result") {
        return block.tool_use_id !== undefined && briefToolUseIDs.has(block.tool_use_id);
      }
      return !msg.isMeta;
    }
    if (msg.type === "attachment") {
      const att = msg.attachment;
      return att?.type === "queued_command" && att.commandMode === "prompt" && !att.isMeta && att.origin === undefined;
    }
    return false;
  });
}
function dropTextInBriefTurns(messages, briefToolNames) {
  const nameSet = new Set(briefToolNames);
  const turnsWithBrief = new Set;
  const textIndexToTurn = [];
  let turn = 0;
  for (let i = 0;i < messages.length; i++) {
    const msg = messages[i];
    const block = msg.message?.content[0];
    if (msg.type === "user" && block?.type !== "tool_result" && !msg.isMeta) {
      turn++;
      continue;
    }
    if (msg.type === "assistant") {
      if (block?.type === "text") {
        textIndexToTurn[i] = turn;
      } else if (block?.type === "tool_use" && block.name && nameSet.has(block.name)) {
        turnsWithBrief.add(turn);
      }
    }
  }
  if (turnsWithBrief.size === 0)
    return messages;
  return messages.filter((_, i) => {
    const t = textIndexToTurn[i];
    return t === undefined || !turnsWithBrief.has(t);
  });
}
function computeSliceStart(collapsed, anchorRef, cap = MAX_MESSAGES_WITHOUT_VIRTUALIZATION, step = MESSAGE_CAP_STEP) {
  const anchor = anchorRef.current;
  const anchorIdx = anchor ? collapsed.findIndex((m) => m.uuid === anchor.uuid) : -1;
  let start = anchorIdx >= 0 ? anchorIdx : anchor ? Math.min(anchor.idx, Math.max(0, collapsed.length - cap)) : 0;
  if (collapsed.length - start > cap + step) {
    start = collapsed.length - cap;
  }
  const msgAtStart = collapsed[start];
  if (msgAtStart && (anchor?.uuid !== msgAtStart.uuid || anchor.idx !== start)) {
    anchorRef.current = {
      uuid: msgAtStart.uuid,
      idx: start
    };
  } else if (!msgAtStart && anchor) {
    anchorRef.current = null;
  }
  return start;
}
function expandKey(msg) {
  return (msg.type === "assistant" || msg.type === "user" ? getToolUseID(msg) : null) ?? msg.uuid;
}
function setsEqual(a, b) {
  if (a.size !== b.size)
    return false;
  for (const item of a) {
    if (!b.has(item))
      return false;
  }
  return true;
}
function shouldRenderStatically(message, streamingToolUseIDs, inProgressToolUseIDs, siblingToolUseIDs, screen, lookups) {
  if (screen === "transcript") {
    return true;
  }
  switch (message.type) {
    case "attachment":
    case "user":
    case "assistant": {
      if (message.type === "assistant") {
        const block = message.message.content[0];
        if (block?.type === "server_tool_use") {
          return lookups.resolvedToolUseIDs.has(block.id);
        }
      }
      const toolUseID = getToolUseID(message);
      if (!toolUseID) {
        return true;
      }
      if (streamingToolUseIDs.has(toolUseID)) {
        return false;
      }
      if (inProgressToolUseIDs.has(toolUseID)) {
        return false;
      }
      if (hasUnresolvedHooksFromLookup(toolUseID, "PostToolUse", lookups)) {
        return false;
      }
      return every(siblingToolUseIDs, lookups.resolvedToolUseIDs);
    }
    case "system": {
      return message.subtype !== "api_error";
    }
    case "grouped_tool_use": {
      const allResolved = message.messages.every((msg) => {
        const content = msg.message.content[0];
        return content?.type === "tool_use" && lookups.resolvedToolUseIDs.has(content.id);
      });
      return allResolved;
    }
    case "collapsed_read_search": {
      return false;
    }
  }
}
var import_compiler_runtime13, React5, import_react13, jsx_dev_runtime18, LogoHeader, proactiveModule = null, BRIEF_TOOL_NAME = null, SEND_USER_FILE_TOOL_NAME = null, MAX_MESSAGES_TO_SHOW_IN_TRANSCRIPT_MODE = 30, MAX_MESSAGES_WITHOUT_VIRTUALIZATION = 200, MESSAGE_CAP_STEP = 50, MessagesImpl = ({
  messages,
  tools,
  commands,
  verbose,
  toolJSX,
  toolUseConfirmQueue,
  inProgressToolUseIDs,
  isMessageSelectorVisible,
  conversationId,
  screen,
  streamingToolUses,
  showAllInTranscript = false,
  agentDefinitions,
  onOpenRateLimitOptions,
  hideLogo = false,
  isLoading,
  hidePastThinking = false,
  streamingThinking,
  streamingText,
  isBriefOnly = false,
  unseenDivider,
  scrollRef,
  trackStickyPrompt,
  jumpRef,
  onSearchMatchesChange,
  scanElement,
  setPositions,
  disableRenderCap = false,
  cursor = null,
  setCursor,
  cursorNavRef,
  renderRange
}) => {
  const {
    columns
  } = useTerminalSize();
  const toggleShowAllShortcut = useShortcutDisplay("transcript:toggleShowAll", "Transcript", "Ctrl+E");
  const normalizedMessages = import_react13.useMemo(() => normalizeMessages(messages).filter(isNotEmptyMessage), [messages]);
  const isStreamingThinkingVisible = import_react13.useMemo(() => {
    if (!streamingThinking)
      return false;
    if (streamingThinking.isStreaming)
      return true;
    if (streamingThinking.streamingEndedAt) {
      return Date.now() - streamingThinking.streamingEndedAt < 30000;
    }
    return false;
  }, [streamingThinking]);
  const lastThinkingBlockId = import_react13.useMemo(() => {
    if (!hidePastThinking)
      return null;
    if (isStreamingThinkingVisible)
      return "streaming";
    for (let i = normalizedMessages.length - 1;i >= 0; i--) {
      const msg = normalizedMessages[i];
      if (msg?.type === "assistant") {
        const content = msg.message.content;
        for (let j = content.length - 1;j >= 0; j--) {
          if (content[j]?.type === "thinking") {
            return `${msg.uuid}:${j}`;
          }
        }
      } else if (msg?.type === "user") {
        const hasToolResult = msg.message.content.some((block) => block.type === "tool_result");
        if (!hasToolResult) {
          return "no-thinking";
        }
      }
    }
    return null;
  }, [normalizedMessages, hidePastThinking, isStreamingThinkingVisible]);
  const latestBashOutputUUID = import_react13.useMemo(() => {
    for (let i_0 = normalizedMessages.length - 1;i_0 >= 0; i_0--) {
      const msg_0 = normalizedMessages[i_0];
      if (msg_0?.type === "user") {
        const content_0 = msg_0.message.content;
        for (const block_0 of content_0) {
          if (block_0.type === "text") {
            const text = block_0.text;
            if (text.startsWith("<bash-stdout") || text.startsWith("<bash-stderr")) {
              return msg_0.uuid;
            }
          }
        }
      }
    }
    return null;
  }, [normalizedMessages]);
  const normalizedToolUseIDs = import_react13.useMemo(() => getToolUseIDs(normalizedMessages), [normalizedMessages]);
  const streamingToolUsesWithoutInProgress = import_react13.useMemo(() => streamingToolUses.filter((stu) => !inProgressToolUseIDs.has(stu.contentBlock.id) && !normalizedToolUseIDs.has(stu.contentBlock.id)), [streamingToolUses, inProgressToolUseIDs, normalizedToolUseIDs]);
  const syntheticStreamingToolUseMessages = import_react13.useMemo(() => streamingToolUsesWithoutInProgress.flatMap((streamingToolUse) => {
    const msg_1 = createAssistantMessage({
      content: [streamingToolUse.contentBlock]
    });
    msg_1.uuid = deriveUUID(streamingToolUse.contentBlock.id, 0);
    return normalizeMessages([msg_1]);
  }), [streamingToolUsesWithoutInProgress]);
  const isTranscriptMode = screen === "transcript";
  const disableVirtualScroll = import_react13.useMemo(() => isEnvTruthy(process.env.UR_CODE_DISABLE_VIRTUAL_SCROLL), []);
  const virtualScrollRuntimeGate = scrollRef != null && !disableVirtualScroll;
  const shouldTruncate = isTranscriptMode && !showAllInTranscript && !virtualScrollRuntimeGate;
  const sliceAnchorRef = import_react13.useRef(null);
  const {
    collapsed: collapsed_0,
    lookups: lookups_0,
    hasTruncatedMessages: hasTruncatedMessages_0,
    hiddenMessageCount: hiddenMessageCount_0
  } = import_react13.useMemo(() => {
    const compactAwareMessages = verbose || isFullscreenEnvEnabled() ? normalizedMessages : getMessagesAfterCompactBoundary(normalizedMessages, {
      includeSnipped: true
    });
    const messagesToShowNotTruncated = reorderMessagesInUI(compactAwareMessages.filter((msg_2) => msg_2.type !== "progress").filter((msg_3) => !isNullRenderingAttachment(msg_3)).filter((_) => shouldShowUserMessage(_, isTranscriptMode)), syntheticStreamingToolUseMessages);
    const briefToolNames = [BRIEF_TOOL_NAME, SEND_USER_FILE_TOOL_NAME].filter((n) => n !== null);
    const dropTextToolNames = [BRIEF_TOOL_NAME].filter((n_0) => n_0 !== null);
    const briefFiltered = briefToolNames.length > 0 && !isTranscriptMode ? isBriefOnly ? filterForBriefTool(messagesToShowNotTruncated, briefToolNames) : dropTextToolNames.length > 0 ? dropTextInBriefTurns(messagesToShowNotTruncated, dropTextToolNames) : messagesToShowNotTruncated : messagesToShowNotTruncated;
    const messagesToShow = shouldTruncate ? briefFiltered.slice(-MAX_MESSAGES_TO_SHOW_IN_TRANSCRIPT_MODE) : briefFiltered;
    const hasTruncatedMessages = shouldTruncate && briefFiltered.length > MAX_MESSAGES_TO_SHOW_IN_TRANSCRIPT_MODE;
    const {
      messages: groupedMessages
    } = applyGrouping(messagesToShow, tools, verbose);
    const collapsed = collapseBackgroundBashNotifications(collapseHookSummaries(collapseTeammateShutdowns(collapseReadSearchGroups(groupedMessages, tools))), verbose);
    const lookups = buildMessageLookups(normalizedMessages, messagesToShow);
    const hiddenMessageCount = messagesToShowNotTruncated.length - MAX_MESSAGES_TO_SHOW_IN_TRANSCRIPT_MODE;
    return {
      collapsed,
      lookups,
      hasTruncatedMessages,
      hiddenMessageCount
    };
  }, [verbose, normalizedMessages, isTranscriptMode, syntheticStreamingToolUseMessages, shouldTruncate, tools, isBriefOnly]);
  const renderableMessages = import_react13.useMemo(() => {
    const capApplies = !virtualScrollRuntimeGate && !disableRenderCap;
    const sliceStart = capApplies ? computeSliceStart(collapsed_0, sliceAnchorRef) : 0;
    return renderRange ? collapsed_0.slice(renderRange[0], renderRange[1]) : sliceStart > 0 ? collapsed_0.slice(sliceStart) : collapsed_0;
  }, [collapsed_0, renderRange, virtualScrollRuntimeGate, disableRenderCap]);
  const streamingToolUseIDs = import_react13.useMemo(() => new Set(streamingToolUses.map((__0) => __0.contentBlock.id)), [streamingToolUses]);
  const dividerBeforeIndex = import_react13.useMemo(() => {
    if (!unseenDivider)
      return -1;
    const prefix = unseenDivider.firstUnseenUuid.slice(0, 24);
    return renderableMessages.findIndex((m) => m.uuid.slice(0, 24) === prefix);
  }, [unseenDivider, renderableMessages]);
  const selectedIdx = import_react13.useMemo(() => {
    if (!cursor)
      return -1;
    return renderableMessages.findIndex((m_0) => m_0.uuid === cursor.uuid);
  }, [cursor, renderableMessages]);
  const [expandedKeys, setExpandedKeys] = import_react13.useState(() => new Set);
  const onItemClick = import_react13.useCallback((msg_4) => {
    const k = expandKey(msg_4);
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(k))
        next.delete(k);
      else
        next.add(k);
      return next;
    });
  }, []);
  const isItemExpanded = import_react13.useCallback((msg_5) => expandedKeys.size > 0 && expandedKeys.has(expandKey(msg_5)), [expandedKeys]);
  const lookupsRef = import_react13.useRef(lookups_0);
  lookupsRef.current = lookups_0;
  const isItemClickable = import_react13.useCallback((msg_6) => {
    if (msg_6.type === "collapsed_read_search")
      return true;
    if (msg_6.type === "assistant") {
      const b = msg_6.message.content[0];
      return b != null && isAdvisorBlock(b) && b.type === "advisor_tool_result" && b.content.type === "advisor_result";
    }
    if (msg_6.type !== "user")
      return false;
    const b_0 = msg_6.message.content[0];
    if (b_0?.type !== "tool_result" || b_0.is_error || !msg_6.toolUseResult)
      return false;
    const name = lookupsRef.current.toolUseByToolUseID.get(b_0.tool_use_id)?.name;
    const tool = name ? findToolByName(tools, name) : undefined;
    return tool?.isResultTruncated?.(msg_6.toolUseResult) ?? false;
  }, [tools]);
  const canAnimate = (!toolJSX || !!toolJSX.shouldContinueAnimation) && !toolUseConfirmQueue.length && !isMessageSelectorVisible;
  const hasToolsInProgress = inProgressToolUseIDs.size > 0;
  const {
    progress
  } = useTerminalNotification();
  const prevProgressState = import_react13.useRef(null);
  const progressEnabled = getGlobalConfig().terminalProgressBarEnabled && !getIsRemoteMode() && !(proactiveModule?.isProactiveActive() ?? false);
  import_react13.useEffect(() => {
    const state = progressEnabled ? hasToolsInProgress ? "indeterminate" : "completed" : null;
    if (prevProgressState.current === state)
      return;
    prevProgressState.current = state;
    progress(state);
  }, [progress, progressEnabled, hasToolsInProgress]);
  import_react13.useEffect(() => {
    return () => progress(null);
  }, [progress]);
  const messageKey = import_react13.useCallback((msg_7) => `${msg_7.uuid}-${conversationId}`, [conversationId]);
  const renderMessageRow = (msg_8, index) => {
    const prevType = index > 0 ? renderableMessages[index - 1]?.type : undefined;
    const isUserContinuation = msg_8.type === "user" && prevType === "user";
    const hasContentAfter = msg_8.type === "collapsed_read_search" && (!!streamingText || hasContentAfterIndex(renderableMessages, index, tools, streamingToolUseIDs));
    const k_0 = messageKey(msg_8);
    const row = /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(MessageRow, {
      message: msg_8,
      isUserContinuation,
      hasContentAfter,
      tools,
      commands,
      verbose: verbose || isItemExpanded(msg_8) || cursor?.expanded === true && index === selectedIdx,
      inProgressToolUseIDs,
      streamingToolUseIDs,
      screen,
      canAnimate,
      onOpenRateLimitOptions,
      lastThinkingBlockId,
      latestBashOutputUUID,
      columns,
      isLoading,
      lookups: lookups_0
    }, k_0, false, undefined, this);
    const wrapped = /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(MessageActionsSelectedContext.Provider, {
      value: index === selectedIdx,
      children: row
    }, k_0, false, undefined, this);
    if (unseenDivider && index === dividerBeforeIndex) {
      return [/* @__PURE__ */ jsx_dev_runtime18.jsxDEV(ThemedBox_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(Divider, {
          title: `${unseenDivider.count} new ${plural(unseenDivider.count, "message")}`,
          width: columns,
          color: "inactive"
        }, undefined, false, undefined, this)
      }, "unseen-divider", false, undefined, this), wrapped];
    }
    return wrapped;
  };
  const searchTextCache2 = import_react13.useRef(new WeakMap);
  const extractSearchText = import_react13.useCallback((msg_9) => {
    const cached = searchTextCache2.current.get(msg_9);
    if (cached !== undefined)
      return cached;
    let text_0 = renderableSearchText(msg_9);
    if (msg_9.type === "user" && msg_9.toolUseResult && Array.isArray(msg_9.message.content)) {
      const tr = msg_9.message.content.find((b_1) => b_1.type === "tool_result");
      if (tr && "tool_use_id" in tr) {
        const tu = lookups_0.toolUseByToolUseID.get(tr.tool_use_id);
        const tool_0 = tu && findToolByName(tools, tu.name);
        const extracted = tool_0?.extractSearchText?.(msg_9.toolUseResult);
        if (extracted !== undefined)
          text_0 = extracted;
      }
    }
    const lowered = text_0.toLowerCase();
    searchTextCache2.current.set(msg_9, lowered);
    return lowered;
  }, [tools, lookups_0]);
  return /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(jsx_dev_runtime18.Fragment, {
    children: [
      !hideLogo && !(renderRange && renderRange[0] > 0) && /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(LogoHeader, {
        agentDefinitions
      }, undefined, false, undefined, this),
      hasTruncatedMessages_0 && /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(Divider, {
        title: `${toggleShowAllShortcut} to show ${source_default.bold(hiddenMessageCount_0)} previous messages`,
        width: columns
      }, undefined, false, undefined, this),
      isTranscriptMode && showAllInTranscript && hiddenMessageCount_0 > 0 && !disableRenderCap && /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(Divider, {
        title: `${toggleShowAllShortcut} to hide ${source_default.bold(hiddenMessageCount_0)} previous messages`,
        width: columns
      }, undefined, false, undefined, this),
      virtualScrollRuntimeGate ? /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(InVirtualListContext.Provider, {
        value: true,
        children: /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(VirtualMessageList, {
          messages: renderableMessages,
          scrollRef,
          columns,
          itemKey: messageKey,
          renderItem: renderMessageRow,
          onItemClick,
          isItemClickable,
          isItemExpanded,
          trackStickyPrompt,
          selectedIndex: selectedIdx >= 0 ? selectedIdx : undefined,
          cursorNavRef,
          setCursor,
          jumpRef,
          onSearchMatchesChange,
          scanElement,
          setPositions,
          extractSearchText
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this) : renderableMessages.flatMap(renderMessageRow),
      streamingText && !isBriefOnly && /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(ThemedBox_default, {
        alignItems: "flex-start",
        flexDirection: "row",
        marginTop: 1,
        width: "100%",
        children: /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(ThemedBox_default, {
          flexDirection: "row",
          children: [
            /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(ThemedBox_default, {
              minWidth: 2,
              children: /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(ThemedText, {
                color: "text",
                children: BLACK_CIRCLE
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(ThemedBox_default, {
              flexDirection: "column",
              children: /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(StreamingMarkdown, {
                children: streamingText
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this)
      }, undefined, false, undefined, this),
      isStreamingThinkingVisible && streamingThinking && !isBriefOnly && /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(ThemedBox_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(AssistantThinkingMessage, {
          param: {
            type: "thinking",
            thinking: streamingThinking.thinking
          },
          addMargin: false,
          isTranscriptMode: true,
          verbose,
          hideInTranscript: false
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}, Messages;
var init_Messages = __esm(() => {
  init_source();
  init_set();
  init_state();
  init_figures2();
  init_useTerminalSize();
  init_useTerminalNotification();
  init_ink();
  init_useShortcutDisplay();
  init_Tool();
  init_advisor();
  init_collapseBackgroundBashNotifications();
  init_collapseHookSummaries();
  init_collapseReadSearch();
  init_collapseTeammateShutdowns();
  init_config();
  init_envUtils();
  init_fullscreen();
  init_groupToolUses();
  init_messages();
  init_stringUtils();
  init_transcriptSearch();
  init_Divider();
  init_LogoV2();
  init_Markdown();
  init_MessageRow();
  init_messageActions();
  init_AssistantThinkingMessage();
  init_nullRenderingAttachments();
  init_OffscreenFreeze();
  init_StatusNotices();
  init_VirtualMessageList();
  import_compiler_runtime13 = __toESM(require_compiler_runtime(), 1);
  React5 = __toESM(require_react(), 1);
  import_react13 = __toESM(require_react(), 1);
  jsx_dev_runtime18 = __toESM(require_jsx_dev_runtime(), 1);
  LogoHeader = React5.memo(function LogoHeader2(t0) {
    const $ = import_compiler_runtime13.c(3);
    const {
      agentDefinitions
    } = t0;
    let t1;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
      t1 = /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(LogoV2, {}, undefined, false, undefined, this);
      $[0] = t1;
    } else {
      t1 = $[0];
    }
    let t2;
    if ($[1] !== agentDefinitions) {
      t2 = /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(OffscreenFreeze, {
        children: /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(ThemedBox_default, {
          flexDirection: "column",
          gap: 1,
          children: [
            t1,
            /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(React5.Suspense, {
              fallback: null,
              children: /* @__PURE__ */ jsx_dev_runtime18.jsxDEV(StatusNotices, {
                agentDefinitions
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this)
      }, undefined, false, undefined, this);
      $[1] = agentDefinitions;
      $[2] = t2;
    } else {
      t2 = $[2];
    }
    return t2;
  });
  Messages = React5.memo(MessagesImpl, (prev, next) => {
    const keys = Object.keys(prev);
    for (const key of keys) {
      if (key === "onOpenRateLimitOptions" || key === "scrollRef" || key === "trackStickyPrompt" || key === "setCursor" || key === "cursorNavRef" || key === "jumpRef" || key === "onSearchMatchesChange" || key === "scanElement" || key === "setPositions")
        continue;
      if (prev[key] !== next[key]) {
        if (key === "streamingToolUses") {
          const p = prev.streamingToolUses;
          const n = next.streamingToolUses;
          if (p.length === n.length && p.every((item, i) => item.contentBlock === n[i]?.contentBlock)) {
            continue;
          }
        }
        if (key === "inProgressToolUseIDs") {
          if (setsEqual(prev.inProgressToolUseIDs, next.inProgressToolUseIDs)) {
            continue;
          }
        }
        if (key === "unseenDivider") {
          const p = prev.unseenDivider;
          const n = next.unseenDivider;
          if (p?.firstUnseenUuid === n?.firstUnseenUuid && p?.count === n?.count) {
            continue;
          }
        }
        if (key === "tools") {
          const p = prev.tools;
          const n = next.tools;
          if (p.length === n.length && p.every((tool, i) => tool.name === n[i]?.name)) {
            continue;
          }
        }
        return false;
      }
    }
    return true;
  });
});

export { Messages, init_Messages };
