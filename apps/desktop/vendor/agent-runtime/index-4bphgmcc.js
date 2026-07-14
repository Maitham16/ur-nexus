import {
  init_envUtils,
  init_errors,
  init_fsOperations,
  init_slowOperations,
  isEnvTruthy,
  toError
} from "./index-5h7w9qkc.js";
import {
  init_memoize,
  init_state,
  memoize_default,
  setLastAPIRequest,
  setLastAPIRequestMessages
} from "./index-nhjg91p1.js";
import {
  __esm,
  __require
} from "./index-8rxa073f.js";

// ../../src/constants/xml.ts
var COMMAND_NAME_TAG = "command-name", COMMAND_MESSAGE_TAG = "command-message", COMMAND_ARGS_TAG = "command-args", BASH_INPUT_TAG = "bash-input", BASH_STDOUT_TAG = "bash-stdout", BASH_STDERR_TAG = "bash-stderr", LOCAL_COMMAND_STDOUT_TAG = "local-command-stdout", LOCAL_COMMAND_STDERR_TAG = "local-command-stderr", LOCAL_COMMAND_CAVEAT_TAG = "local-command-caveat", TERMINAL_OUTPUT_TAGS, TICK_TAG = "tick", TASK_NOTIFICATION_TAG = "task-notification", TASK_ID_TAG = "task-id", TOOL_USE_ID_TAG = "tool-use-id", TASK_TYPE_TAG = "task-type", OUTPUT_FILE_TAG = "output-file", STATUS_TAG = "status", SUMMARY_TAG = "summary", WORKTREE_TAG = "worktree", WORKTREE_PATH_TAG = "worktreePath", WORKTREE_BRANCH_TAG = "worktreeBranch", REMOTE_REVIEW_TAG = "remote-review", REMOTE_REVIEW_PROGRESS_TAG = "remote-review-progress", TEAMMATE_MESSAGE_TAG = "teammate-message", FORK_BOILERPLATE_TAG = "fork-boilerplate", FORK_DIRECTIVE_PREFIX = "Your directive: ", COMMON_HELP_ARGS, COMMON_INFO_ARGS;
var init_xml = __esm(() => {
  TERMINAL_OUTPUT_TAGS = [
    BASH_INPUT_TAG,
    BASH_STDOUT_TAG,
    BASH_STDERR_TAG,
    LOCAL_COMMAND_STDOUT_TAG,
    LOCAL_COMMAND_STDERR_TAG,
    LOCAL_COMMAND_CAVEAT_TAG
  ];
  COMMON_HELP_ARGS = ["help", "-h", "--help"];
  COMMON_INFO_ARGS = [
    "list",
    "show",
    "display",
    "current",
    "view",
    "get",
    "check",
    "describe",
    "print",
    "version",
    "about",
    "status",
    "?"
  ];
});

// ../../src/types/logs.ts
function sortLogs(logs) {
  return logs.sort((a, b) => {
    const modifiedDiff = b.modified.getTime() - a.modified.getTime();
    if (modifiedDiff !== 0) {
      return modifiedDiff;
    }
    return b.created.getTime() - a.created.getTime();
  });
}
var init_logs = () => {};

// ../../node_modules/.bun/env-paths@3.0.0/node_modules/env-paths/index.js
import path from "node:path";
import os from "node:os";
import process2 from "node:process";
function envPaths(name, { suffix = "nodejs" } = {}) {
  if (typeof name !== "string") {
    throw new TypeError(`Expected a string, got ${typeof name}`);
  }
  if (suffix) {
    name += `-${suffix}`;
  }
  if (process2.platform === "darwin") {
    return macos(name);
  }
  if (process2.platform === "win32") {
    return windows(name);
  }
  return linux(name);
}
var homedir, tmpdir, env, macos = (name) => {
  const library = path.join(homedir, "Library");
  return {
    data: path.join(library, "Application Support", name),
    config: path.join(library, "Preferences", name),
    cache: path.join(library, "Caches", name),
    log: path.join(library, "Logs", name),
    temp: path.join(tmpdir, name)
  };
}, windows = (name) => {
  const appData = env.APPDATA || path.join(homedir, "AppData", "Roaming");
  const localAppData = env.LOCALAPPDATA || path.join(homedir, "AppData", "Local");
  return {
    data: path.join(localAppData, name, "Data"),
    config: path.join(appData, name, "Config"),
    cache: path.join(localAppData, name, "Cache"),
    log: path.join(localAppData, name, "Log"),
    temp: path.join(tmpdir, name)
  };
}, linux = (name) => {
  const username = path.basename(homedir);
  return {
    data: path.join(env.XDG_DATA_HOME || path.join(homedir, ".local", "share"), name),
    config: path.join(env.XDG_CONFIG_HOME || path.join(homedir, ".config"), name),
    cache: path.join(env.XDG_CACHE_HOME || path.join(homedir, ".cache"), name),
    log: path.join(env.XDG_STATE_HOME || path.join(homedir, ".local", "state"), name),
    temp: path.join(tmpdir, username, name)
  };
};
var init_env_paths = __esm(() => {
  homedir = os.homedir();
  tmpdir = os.tmpdir();
  ({ env } = process2);
});

// ../../src/utils/hash.ts
function djb2Hash(str) {
  let hash = 0;
  for (let i = 0;i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i) | 0;
  }
  return hash;
}
function hashContent(content) {
  if (typeof Bun !== "undefined") {
    return Bun.hash(content).toString();
  }
  const crypto = __require("crypto");
  return crypto.createHash("sha256").update(content).digest("hex");
}
function hashPair(a, b) {
  if (typeof Bun !== "undefined") {
    return Bun.hash(b, Bun.hash(a)).toString();
  }
  const crypto = __require("crypto");
  return crypto.createHash("sha256").update(a).update("\x00").update(b).digest("hex");
}
var init_hash = () => {};

// ../../src/utils/cachePaths.ts
var paths;
var init_cachePaths = __esm(() => {
  init_env_paths();
  init_fsOperations();
  init_hash();
  paths = envPaths("ur-cli");
});

// ../../src/utils/displayTags.ts
function stripDisplayTags(text) {
  const result = text.replace(XML_TAG_BLOCK_PATTERN, "").trim();
  return result || text;
}
function stripDisplayTagsAllowEmpty(text) {
  return text.replace(XML_TAG_BLOCK_PATTERN, "").trim();
}
var XML_TAG_BLOCK_PATTERN;
var init_displayTags = __esm(() => {
  XML_TAG_BLOCK_PATTERN = /<([a-z][\w-]*)(?:\s[^>]*)?>[\s\S]*?<\/\1>\n?/g;
});

// ../../src/utils/privacyLevel.ts
function getPrivacyLevel() {
  if (process.env.UR_CODE_DISABLE_NONESSENTIAL_TRAFFIC) {
    return "essential-traffic";
  }
  if (process.env.DISABLE_TELEMETRY) {
    return "no-telemetry";
  }
  if (isNetworkRestricted()) {
    return "essential-traffic";
  }
  return "default";
}
function isNetworkRestricted() {
  return process.env.UR_OFFLINE === "1" || process.env.UR_NO_CLOUD === "1" || ["1", "true", "yes", "on"].includes((process.env.UR_OFFLINE ?? "").toLowerCase().trim()) || ["1", "true", "yes", "on"].includes((process.env.UR_NO_CLOUD ?? "").toLowerCase().trim());
}
function isEssentialTrafficOnly() {
  return getPrivacyLevel() === "essential-traffic";
}
function isTelemetryDisabled() {
  return getPrivacyLevel() !== "default";
}
function getEssentialTrafficOnlyReason() {
  if (process.env.UR_CODE_DISABLE_NONESSENTIAL_TRAFFIC) {
    return "UR_CODE_DISABLE_NONESSENTIAL_TRAFFIC";
  }
  return null;
}
var init_privacyLevel = () => {};

// ../../src/utils/log.ts
function getLogDisplayTitle(log, defaultTitle) {
  const isAutonomousPrompt = log.firstPrompt?.startsWith(`<${TICK_TAG}>`);
  const strippedFirstPrompt = log.firstPrompt ? stripDisplayTagsAllowEmpty(log.firstPrompt) : "";
  const useFirstPrompt = strippedFirstPrompt && !isAutonomousPrompt;
  const title = log.agentName || log.customTitle || log.summary || (useFirstPrompt ? strippedFirstPrompt : undefined) || defaultTitle || (isAutonomousPrompt ? "Autonomous session" : undefined) || (log.sessionId ? log.sessionId.slice(0, 8) : "") || "";
  return stripDisplayTags(title).trim();
}
function addToInMemoryErrorLog(errorInfo) {
  if (inMemoryErrorLog.length >= MAX_IN_MEMORY_ERRORS) {
    inMemoryErrorLog.shift();
  }
  inMemoryErrorLog.push(errorInfo);
}
function logError(error) {
  const err = toError(error);
  if (false) {}
  try {
    if (isEnvTruthy(process.env.UR_CODE_USE_BEDROCK) || isEnvTruthy(process.env.UR_CODE_USE_VERTEX) || isEnvTruthy(process.env.UR_CODE_USE_FOUNDRY) || process.env.DISABLE_ERROR_REPORTING || isEssentialTrafficOnly()) {
      return;
    }
    const errorStr = err.stack || err.message;
    const errorInfo = {
      error: errorStr,
      timestamp: new Date().toISOString()
    };
    addToInMemoryErrorLog(errorInfo);
    if (errorLogSink === null) {
      errorQueue.push({ type: "error", error: err });
      return;
    }
    errorLogSink.logError(err);
  } catch {}
}
function getInMemoryErrors() {
  return [...inMemoryErrorLog];
}
function logMCPError(serverName, error) {
  try {
    if (errorLogSink === null) {
      errorQueue.push({ type: "mcpError", serverName, error });
      return;
    }
    errorLogSink.logMCPError(serverName, error);
  } catch {}
}
function logMCPDebug(serverName, message) {
  try {
    if (errorLogSink === null) {
      errorQueue.push({ type: "mcpDebug", serverName, message });
      return;
    }
    errorLogSink.logMCPDebug(serverName, message);
  } catch {}
}
function captureAPIRequest(params, querySource) {
  if (!querySource || !querySource.startsWith("repl_main_thread")) {
    return;
  }
  const { messages, ...paramsWithoutMessages } = params;
  setLastAPIRequest(paramsWithoutMessages);
  setLastAPIRequestMessages(process.env.USER_TYPE === "ant" ? messages : null);
}
var MAX_IN_MEMORY_ERRORS = 100, inMemoryErrorLog, errorQueue, errorLogSink = null, isHardFailMode;
var init_log = __esm(() => {
  init_memoize();
  init_state();
  init_xml();
  init_logs();
  init_cachePaths();
  init_displayTags();
  init_envUtils();
  init_errors();
  init_privacyLevel();
  init_slowOperations();
  inMemoryErrorLog = [];
  errorQueue = [];
  isHardFailMode = memoize_default(() => {
    return process.argv.includes("--hard-fail");
  });
});

export { COMMAND_NAME_TAG, COMMAND_MESSAGE_TAG, COMMAND_ARGS_TAG, BASH_STDOUT_TAG, BASH_STDERR_TAG, LOCAL_COMMAND_STDOUT_TAG, LOCAL_COMMAND_STDERR_TAG, LOCAL_COMMAND_CAVEAT_TAG, TERMINAL_OUTPUT_TAGS, TICK_TAG, TASK_NOTIFICATION_TAG, TASK_ID_TAG, TOOL_USE_ID_TAG, TASK_TYPE_TAG, OUTPUT_FILE_TAG, STATUS_TAG, SUMMARY_TAG, WORKTREE_TAG, WORKTREE_PATH_TAG, WORKTREE_BRANCH_TAG, REMOTE_REVIEW_TAG, REMOTE_REVIEW_PROGRESS_TAG, TEAMMATE_MESSAGE_TAG, FORK_BOILERPLATE_TAG, FORK_DIRECTIVE_PREFIX, COMMON_HELP_ARGS, COMMON_INFO_ARGS, init_xml, sortLogs, init_logs, djb2Hash, hashContent, hashPair, init_hash, stripDisplayTags, init_displayTags, isEssentialTrafficOnly, isTelemetryDisabled, getEssentialTrafficOnlyReason, init_privacyLevel, getLogDisplayTitle, logError, getInMemoryErrors, logMCPError, logMCPDebug, captureAPIRequest, init_log };
