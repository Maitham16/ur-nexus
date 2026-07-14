import {
  getSessionId,
  init_memoize,
  init_state,
  memoize_default
} from "./index-nhjg91p1.js";
import {
  __callDispose,
  __esm,
  __using
} from "./index-8rxa073f.js";

// ../../src/utils/envUtils.ts
import { homedir } from "os";
import { join } from "path";
function getTeamsDir() {
  return join(getURConfigHomeDir(), "teams");
}
function hasNodeOption(flag) {
  const nodeOptions = process.env.NODE_OPTIONS;
  if (!nodeOptions) {
    return false;
  }
  return nodeOptions.split(/\s+/).includes(flag);
}
function isEnvTruthy(envVar) {
  if (!envVar)
    return false;
  if (typeof envVar === "boolean")
    return envVar;
  const normalizedValue = envVar.toLowerCase().trim();
  return ["1", "true", "yes", "on"].includes(normalizedValue);
}
function isEnvDefinedFalsy(envVar) {
  if (envVar === undefined)
    return false;
  if (typeof envVar === "boolean")
    return !envVar;
  if (!envVar)
    return false;
  const normalizedValue = envVar.toLowerCase().trim();
  return ["0", "false", "no", "off"].includes(normalizedValue);
}
function isBareMode() {
  return isEnvTruthy(process.env.UR_CODE_SIMPLE) || process.argv.includes("--bare");
}
function getAWSRegion() {
  return process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "us-east-1";
}
function getDefaultVertexRegion() {
  return process.env.CLOUD_ML_REGION || "us-east5";
}
function shouldMaintainProjectWorkingDir() {
  return isEnvTruthy(process.env.UR_BASH_MAINTAIN_PROJECT_WORKING_DIR);
}
function isRunningOnHomespace() {
  return process.env.USER_TYPE === "ant" && isEnvTruthy(process.env.COO_RUNNING_ON_HOMESPACE);
}
function getVertexRegionForModel(_model) {
  return getDefaultVertexRegion();
}
var getURConfigHomeDir;
var init_envUtils = __esm(() => {
  init_memoize();
  getURConfigHomeDir = memoize_default(() => {
    return (process.env.UR_CONFIG_DIR ?? join(homedir(), ".ur")).normalize("NFC");
  }, () => process.env.UR_CONFIG_DIR);
});

// ../../src/utils/cleanupRegistry.ts
function registerCleanup(cleanupFn) {
  cleanupFunctions.add(cleanupFn);
  return () => cleanupFunctions.delete(cleanupFn);
}
async function runCleanupFunctions() {
  await Promise.all(Array.from(cleanupFunctions).map((fn) => fn()));
}
var cleanupFunctions;
var init_cleanupRegistry = __esm(() => {
  cleanupFunctions = new Set;
});

// ../../src/urhq-sdk.ts
function errorMessage(error) {
  if (!error || typeof error !== "object") {
    return;
  }
  const value = error;
  if (typeof value.message === "string") {
    return value.message;
  }
  if (typeof value.error?.message === "string") {
    return value.error.message;
  }
  return;
}
function requestIdFrom(headers, error) {
  return headers?.get?.("request-id") ?? headers?.get?.("x-request-id") ?? error?.request_id;
}
var APIError, AuthenticationError, NotFoundError, APIConnectionError, APIConnectionTimeoutError, APIUserAbortError;
var init_urhq_sdk = __esm(() => {
  APIError = class APIError extends Error {
    status;
    headers;
    error;
    request_id;
    requestID;
    constructor(status, error, message, headers) {
      super(message ?? errorMessage(error) ?? `API error ${status}`);
      this.name = "APIError";
      this.status = status;
      this.error = error;
      this.headers = headers;
      const requestId = requestIdFrom(headers, error);
      this.request_id = requestId;
      this.requestID = requestId;
    }
  };
  AuthenticationError = class AuthenticationError extends APIError {
    constructor(error, message, headers) {
      super(401, error, message, headers);
      this.name = "AuthenticationError";
    }
  };
  NotFoundError = class NotFoundError extends APIError {
    constructor(error, message, headers) {
      super(404, error, message, headers);
      this.name = "NotFoundError";
    }
  };
  APIConnectionError = class APIConnectionError extends Error {
    cause;
    constructor(messageOrOptions = "Connection error", options) {
      const message = typeof messageOrOptions === "string" ? messageOrOptions : messageOrOptions.message;
      super(message ?? "Connection error");
      this.name = "APIConnectionError";
      this.cause = typeof messageOrOptions === "string" ? options?.cause : messageOrOptions.cause;
    }
  };
  APIConnectionTimeoutError = class APIConnectionTimeoutError extends APIConnectionError {
    constructor(messageOrOptions = "Request timed out", options) {
      if (typeof messageOrOptions === "string") {
        super(messageOrOptions, options);
      } else {
        super({
          message: messageOrOptions.message ?? "Request timed out",
          cause: messageOrOptions.cause
        });
      }
      this.name = "APIConnectionTimeoutError";
    }
  };
  APIUserAbortError = class APIUserAbortError extends Error {
    constructor(message = "Request aborted") {
      super(message);
      this.name = "APIUserAbortError";
    }
  };
});

// ../../src/utils/errors.ts
function isAbortError(e) {
  return e instanceof AbortError || e instanceof APIUserAbortError || e instanceof Error && e.name === "AbortError";
}
function hasExactErrorMessage(error, message) {
  return error instanceof Error && error.message === message;
}
function toError(e) {
  return e instanceof Error ? e : new Error(String(e));
}
function errorMessage2(e) {
  return e instanceof Error ? e.message : String(e);
}
function getErrnoCode(e) {
  if (e && typeof e === "object" && "code" in e && typeof e.code === "string") {
    return e.code;
  }
  return;
}
function isENOENT(e) {
  return getErrnoCode(e) === "ENOENT";
}
function getErrnoPath(e) {
  if (e && typeof e === "object" && "path" in e && typeof e.path === "string") {
    return e.path;
  }
  return;
}
function isFsInaccessible(e) {
  const code = getErrnoCode(e);
  return code === "ENOENT" || code === "EACCES" || code === "EPERM" || code === "ENOTDIR" || code === "ELOOP";
}
function classifyAxiosError(e) {
  const message = errorMessage2(e);
  if (!e || typeof e !== "object" || !("isAxiosError" in e) || !e.isAxiosError) {
    return { kind: "other", message };
  }
  const err = e;
  const status = err.response?.status;
  if (status === 401 || status === 403)
    return { kind: "auth", status, message };
  if (err.code === "ECONNABORTED")
    return { kind: "timeout", status, message };
  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
    return { kind: "network", status, message };
  }
  return { kind: "http", status, message };
}
var URError, MalformedCommandError, AbortError, ConfigParseError, ShellError, TeleportOperationError, TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS;
var init_errors = __esm(() => {
  init_urhq_sdk();
  URError = class URError extends Error {
    constructor(message) {
      super(message);
      this.name = this.constructor.name;
    }
  };
  MalformedCommandError = class MalformedCommandError extends Error {
  };
  AbortError = class AbortError extends Error {
    constructor(message) {
      super(message);
      this.name = "AbortError";
    }
  };
  ConfigParseError = class ConfigParseError extends Error {
    filePath;
    defaultConfig;
    constructor(message, filePath, defaultConfig) {
      super(message);
      this.name = "ConfigParseError";
      this.filePath = filePath;
      this.defaultConfig = defaultConfig;
    }
  };
  ShellError = class ShellError extends Error {
    stdout;
    stderr;
    code;
    interrupted;
    constructor(stdout, stderr, code, interrupted) {
      super("Shell command failed");
      this.stdout = stdout;
      this.stderr = stderr;
      this.code = code;
      this.interrupted = interrupted;
      this.name = "ShellError";
    }
  };
  TeleportOperationError = class TeleportOperationError extends Error {
    formattedMessage;
    constructor(message, formattedMessage) {
      super(message);
      this.formattedMessage = formattedMessage;
      this.name = "TeleportOperationError";
    }
  };
  TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS = class TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS extends Error {
    telemetryMessage;
    constructor(message, telemetryMessage) {
      super(message);
      this.name = "TelemetrySafeError";
      this.telemetryMessage = telemetryMessage ?? message;
    }
  };
});

// ../../src/utils/bufferedWriter.ts
function createBufferedWriter({
  writeFn,
  flushIntervalMs = 1000,
  maxBufferSize = 100,
  maxBufferBytes = Infinity,
  immediateMode = false
}) {
  let buffer = [];
  let bufferBytes = 0;
  let flushTimer = null;
  let pendingOverflow = null;
  function clearTimer() {
    if (flushTimer) {
      clearTimeout(flushTimer);
      flushTimer = null;
    }
  }
  function flush() {
    if (pendingOverflow) {
      writeFn(pendingOverflow.join(""));
      pendingOverflow = null;
    }
    if (buffer.length === 0)
      return;
    writeFn(buffer.join(""));
    buffer = [];
    bufferBytes = 0;
    clearTimer();
  }
  function scheduleFlush() {
    if (!flushTimer) {
      flushTimer = setTimeout(flush, flushIntervalMs);
    }
  }
  function flushDeferred() {
    if (pendingOverflow) {
      pendingOverflow.push(...buffer);
      buffer = [];
      bufferBytes = 0;
      clearTimer();
      return;
    }
    const detached = buffer;
    buffer = [];
    bufferBytes = 0;
    clearTimer();
    pendingOverflow = detached;
    setImmediate(() => {
      const toWrite = pendingOverflow;
      pendingOverflow = null;
      if (toWrite)
        writeFn(toWrite.join(""));
    });
  }
  return {
    write(content) {
      if (immediateMode) {
        writeFn(content);
        return;
      }
      buffer.push(content);
      bufferBytes += content.length;
      scheduleFlush();
      if (buffer.length >= maxBufferSize || bufferBytes >= maxBufferBytes) {
        flushDeferred();
      }
    },
    flush,
    dispose() {
      flush();
    }
  };
}
var init_bufferedWriter = () => {};

// ../../src/utils/debugFilter.ts
function extractDebugCategories(message) {
  const categories = [];
  const mcpMatch = message.match(/^MCP server ["']([^"']+)["']/);
  if (mcpMatch && mcpMatch[1]) {
    categories.push("mcp");
    categories.push(mcpMatch[1].toLowerCase());
  } else {
    const prefixMatch = message.match(/^([^:[]+):/);
    if (prefixMatch && prefixMatch[1]) {
      categories.push(prefixMatch[1].trim().toLowerCase());
    }
  }
  const bracketMatch = message.match(/^\[([^\]]+)]/);
  if (bracketMatch && bracketMatch[1]) {
    categories.push(bracketMatch[1].trim().toLowerCase());
  }
  if (message.toLowerCase().includes("1p event:")) {
    categories.push("1p");
  }
  const secondaryMatch = message.match(/:\s*([^:]+?)(?:\s+(?:type|mode|status|event))?:/);
  if (secondaryMatch && secondaryMatch[1]) {
    const secondary = secondaryMatch[1].trim().toLowerCase();
    if (secondary.length < 30 && !secondary.includes(" ")) {
      categories.push(secondary);
    }
  }
  return Array.from(new Set(categories));
}
function shouldShowDebugCategories(categories, filter) {
  if (!filter) {
    return true;
  }
  if (categories.length === 0) {
    return false;
  }
  if (filter.isExclusive) {
    return !categories.some((cat) => filter.exclude.includes(cat));
  } else {
    return categories.some((cat) => filter.include.includes(cat));
  }
}
function shouldShowDebugMessage(message, filter) {
  if (!filter) {
    return true;
  }
  const categories = extractDebugCategories(message);
  return shouldShowDebugCategories(categories, filter);
}
var parseDebugFilter;
var init_debugFilter = __esm(() => {
  init_memoize();
  parseDebugFilter = memoize_default((filterString) => {
    if (!filterString || filterString.trim() === "") {
      return null;
    }
    const filters = filterString.split(",").map((f) => f.trim()).filter(Boolean);
    if (filters.length === 0) {
      return null;
    }
    const hasExclusive = filters.some((f) => f.startsWith("!"));
    const hasInclusive = filters.some((f) => !f.startsWith("!"));
    if (hasExclusive && hasInclusive) {
      return null;
    }
    const cleanFilters = filters.map((f) => f.replace(/^!/, "").toLowerCase());
    return {
      include: hasExclusive ? [] : cleanFilters,
      exclude: hasExclusive ? cleanFilters : [],
      isExclusive: hasExclusive
    };
  });
});

// ../../src/utils/fsOperations.ts
import * as fs from "fs";
import {
  mkdir as mkdirPromise,
  open,
  readdir as readdirPromise,
  readFile as readFilePromise,
  rename as renamePromise,
  rmdir as rmdirPromise,
  rm as rmPromise,
  stat as statPromise,
  unlink as unlinkPromise
} from "fs/promises";
import { homedir as homedir2 } from "os";
import * as nodePath from "path";
function safeResolvePath(fs2, filePath) {
  if (filePath.startsWith("//") || filePath.startsWith("\\\\")) {
    return { resolvedPath: filePath, isSymlink: false, isCanonical: false };
  }
  try {
    const stats = fs2.lstatSync(filePath);
    if (stats.isFIFO() || stats.isSocket() || stats.isCharacterDevice() || stats.isBlockDevice()) {
      return { resolvedPath: filePath, isSymlink: false, isCanonical: false };
    }
    const resolvedPath = fs2.realpathSync(filePath);
    return {
      resolvedPath,
      isSymlink: resolvedPath !== filePath,
      isCanonical: true
    };
  } catch (_error) {
    return { resolvedPath: filePath, isSymlink: false, isCanonical: false };
  }
}
function isDuplicatePath(fs2, filePath, loadedPaths) {
  const { resolvedPath } = safeResolvePath(fs2, filePath);
  if (loadedPaths.has(resolvedPath)) {
    return true;
  }
  loadedPaths.add(resolvedPath);
  return false;
}
function resolveDeepestExistingAncestorSync(fs2, absolutePath) {
  let dir = absolutePath;
  const segments = [];
  while (dir !== nodePath.dirname(dir)) {
    let st;
    try {
      st = fs2.lstatSync(dir);
    } catch {
      segments.unshift(nodePath.basename(dir));
      dir = nodePath.dirname(dir);
      continue;
    }
    if (st.isSymbolicLink()) {
      try {
        const resolved = fs2.realpathSync(dir);
        return segments.length === 0 ? resolved : nodePath.join(resolved, ...segments);
      } catch {
        const target = fs2.readlinkSync(dir);
        const absTarget = nodePath.isAbsolute(target) ? target : nodePath.resolve(nodePath.dirname(dir), target);
        return segments.length === 0 ? absTarget : nodePath.join(absTarget, ...segments);
      }
    }
    try {
      const resolved = fs2.realpathSync(dir);
      if (resolved !== dir) {
        return segments.length === 0 ? resolved : nodePath.join(resolved, ...segments);
      }
    } catch {}
    return;
  }
  return;
}
function getPathsForPermissionCheck(inputPath) {
  let path = inputPath;
  if (path === "~") {
    path = homedir2().normalize("NFC");
  } else if (path.startsWith("~/")) {
    path = nodePath.join(homedir2().normalize("NFC"), path.slice(2));
  }
  const pathSet = new Set;
  const fsImpl = getFsImplementation();
  pathSet.add(path);
  if (path.startsWith("//") || path.startsWith("\\\\")) {
    return Array.from(pathSet);
  }
  try {
    let currentPath = path;
    const visited = new Set;
    const maxDepth = 40;
    for (let depth = 0;depth < maxDepth; depth++) {
      if (visited.has(currentPath)) {
        break;
      }
      visited.add(currentPath);
      if (!fsImpl.existsSync(currentPath)) {
        if (currentPath === path) {
          const resolved = resolveDeepestExistingAncestorSync(fsImpl, path);
          if (resolved !== undefined) {
            pathSet.add(resolved);
          }
        }
        break;
      }
      const stats = fsImpl.lstatSync(currentPath);
      if (stats.isFIFO() || stats.isSocket() || stats.isCharacterDevice() || stats.isBlockDevice()) {
        break;
      }
      if (!stats.isSymbolicLink()) {
        break;
      }
      const target = fsImpl.readlinkSync(currentPath);
      const absoluteTarget = nodePath.isAbsolute(target) ? target : nodePath.resolve(nodePath.dirname(currentPath), target);
      pathSet.add(absoluteTarget);
      currentPath = absoluteTarget;
    }
  } catch {}
  const { resolvedPath, isSymlink } = safeResolvePath(fsImpl, path);
  if (isSymlink && resolvedPath !== path) {
    pathSet.add(resolvedPath);
  }
  return Array.from(pathSet);
}
function getFsImplementation() {
  return activeFs;
}
async function readFileRange(path, offset, maxBytes) {
  let __stack = [];
  try {
    const fh = __using(__stack, await open(path, "r"), 1);
    const size = (await fh.stat()).size;
    if (size <= offset) {
      return null;
    }
    const bytesToRead = Math.min(size - offset, maxBytes);
    const buffer = Buffer.allocUnsafe(bytesToRead);
    let totalRead = 0;
    while (totalRead < bytesToRead) {
      const { bytesRead } = await fh.read(buffer, totalRead, bytesToRead - totalRead, offset + totalRead);
      if (bytesRead === 0) {
        break;
      }
      totalRead += bytesRead;
    }
    return {
      content: buffer.toString("utf8", 0, totalRead),
      bytesRead: totalRead,
      bytesTotal: size
    };
  } catch (_catch) {
    var _err = _catch, _hasErr = 1;
  } finally {
    var _promise = __callDispose(__stack, _err, _hasErr);
    _promise && await _promise;
  }
}
async function tailFile(path, maxBytes) {
  let __stack = [];
  try {
    const fh = __using(__stack, await open(path, "r"), 1);
    const size = (await fh.stat()).size;
    if (size === 0) {
      return { content: "", bytesRead: 0, bytesTotal: 0 };
    }
    const offset = Math.max(0, size - maxBytes);
    const bytesToRead = size - offset;
    const buffer = Buffer.allocUnsafe(bytesToRead);
    let totalRead = 0;
    while (totalRead < bytesToRead) {
      const { bytesRead } = await fh.read(buffer, totalRead, bytesToRead - totalRead, offset + totalRead);
      if (bytesRead === 0) {
        break;
      }
      totalRead += bytesRead;
    }
    return {
      content: buffer.toString("utf8", 0, totalRead),
      bytesRead: totalRead,
      bytesTotal: size
    };
  } catch (_catch) {
    var _err = _catch, _hasErr = 1;
  } finally {
    var _promise = __callDispose(__stack, _err, _hasErr);
    _promise && await _promise;
  }
}
async function* readLinesReverse(path) {
  const CHUNK_SIZE = 1024 * 4;
  const fileHandle = await open(path, "r");
  try {
    const stats = await fileHandle.stat();
    let position = stats.size;
    let remainder = Buffer.alloc(0);
    const buffer = Buffer.alloc(CHUNK_SIZE);
    while (position > 0) {
      const currentChunkSize = Math.min(CHUNK_SIZE, position);
      position -= currentChunkSize;
      await fileHandle.read(buffer, 0, currentChunkSize, position);
      const combined = Buffer.concat([
        buffer.subarray(0, currentChunkSize),
        remainder
      ]);
      const firstNewline = combined.indexOf(10);
      if (firstNewline === -1) {
        remainder = combined;
        continue;
      }
      remainder = Buffer.from(combined.subarray(0, firstNewline));
      const lines = combined.toString("utf8", firstNewline + 1).split(`
`);
      for (let i = lines.length - 1;i >= 0; i--) {
        const line = lines[i];
        if (line) {
          yield line;
        }
      }
    }
    if (remainder.length > 0) {
      yield remainder.toString("utf8");
    }
  } finally {
    await fileHandle.close();
  }
}
var NodeFsOperations, activeFs;
var init_fsOperations = __esm(() => {
  init_errors();
  init_slowOperations();
  NodeFsOperations = {
    cwd() {
      return process.cwd();
    },
    existsSync(fsPath) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.existsSync(${fsPath})`, 0);
        return fs.existsSync(fsPath);
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    async stat(fsPath) {
      return statPromise(fsPath);
    },
    async readdir(fsPath) {
      return readdirPromise(fsPath, { withFileTypes: true });
    },
    async unlink(fsPath) {
      return unlinkPromise(fsPath);
    },
    async rmdir(fsPath) {
      return rmdirPromise(fsPath);
    },
    async rm(fsPath, options) {
      return rmPromise(fsPath, options);
    },
    async mkdir(dirPath, options) {
      try {
        await mkdirPromise(dirPath, { recursive: true, ...options });
      } catch (e) {
        if (getErrnoCode(e) !== "EEXIST")
          throw e;
      }
    },
    async readFile(fsPath, options) {
      return readFilePromise(fsPath, { encoding: options.encoding });
    },
    async rename(oldPath, newPath) {
      return renamePromise(oldPath, newPath);
    },
    statSync(fsPath) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.statSync(${fsPath})`, 0);
        return fs.statSync(fsPath);
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    lstatSync(fsPath) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.lstatSync(${fsPath})`, 0);
        return fs.lstatSync(fsPath);
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    readFileSync(fsPath, options) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.readFileSync(${fsPath})`, 0);
        return fs.readFileSync(fsPath, { encoding: options.encoding });
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    readFileBytesSync(fsPath) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.readFileBytesSync(${fsPath})`, 0);
        return fs.readFileSync(fsPath);
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    readSync(fsPath, options) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.readSync(${fsPath}, ${options.length} bytes)`, 0);
        let fd = undefined;
        try {
          fd = fs.openSync(fsPath, "r");
          const buffer = Buffer.alloc(options.length);
          const bytesRead = fs.readSync(fd, buffer, 0, options.length, 0);
          return { buffer, bytesRead };
        } finally {
          if (fd)
            fs.closeSync(fd);
        }
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    appendFileSync(path, data, options) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.appendFileSync(${path}, ${data.length} chars)`, 0);
        if (options?.mode !== undefined) {
          try {
            const fd = fs.openSync(path, "ax", options.mode);
            try {
              fs.appendFileSync(fd, data);
            } finally {
              fs.closeSync(fd);
            }
            return;
          } catch (e) {
            if (getErrnoCode(e) !== "EEXIST")
              throw e;
          }
        }
        fs.appendFileSync(path, data);
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    copyFileSync(src, dest) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.copyFileSync(${src} → ${dest})`, 0);
        fs.copyFileSync(src, dest);
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    unlinkSync(path) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.unlinkSync(${path})`, 0);
        fs.unlinkSync(path);
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    renameSync(oldPath, newPath) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.renameSync(${oldPath} → ${newPath})`, 0);
        fs.renameSync(oldPath, newPath);
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    linkSync(target, path) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.linkSync(${target} → ${path})`, 0);
        fs.linkSync(target, path);
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    symlinkSync(target, path, type) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.symlinkSync(${target} → ${path})`, 0);
        fs.symlinkSync(target, path, type);
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    readlinkSync(path) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.readlinkSync(${path})`, 0);
        return fs.readlinkSync(path);
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    realpathSync(path) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.realpathSync(${path})`, 0);
        return fs.realpathSync(path).normalize("NFC");
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    mkdirSync(dirPath, options) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.mkdirSync(${dirPath})`, 0);
        const mkdirOptions = {
          recursive: true
        };
        if (options?.mode !== undefined) {
          mkdirOptions.mode = options.mode;
        }
        try {
          fs.mkdirSync(dirPath, mkdirOptions);
        } catch (e) {
          if (getErrnoCode(e) !== "EEXIST")
            throw e;
        }
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    readdirSync(dirPath) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.readdirSync(${dirPath})`, 0);
        return fs.readdirSync(dirPath, { withFileTypes: true });
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    readdirStringSync(dirPath) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.readdirStringSync(${dirPath})`, 0);
        return fs.readdirSync(dirPath);
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    isDirEmptySync(dirPath) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.isDirEmptySync(${dirPath})`, 0);
        const files = this.readdirSync(dirPath);
        return files.length === 0;
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    rmdirSync(dirPath) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.rmdirSync(${dirPath})`, 0);
        fs.rmdirSync(dirPath);
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    rmSync(path, options) {
      let __stack = [];
      try {
        const _ = __using(__stack, slowLogging`fs.rmSync(${path})`, 0);
        fs.rmSync(path, options);
      } catch (_catch) {
        var _err = _catch, _hasErr = 1;
      } finally {
        __callDispose(__stack, _err, _hasErr);
      }
    },
    createWriteStream(path) {
      return fs.createWriteStream(path);
    },
    async readFileBytes(fsPath, maxBytes) {
      if (maxBytes === undefined) {
        return readFilePromise(fsPath);
      }
      const handle = await open(fsPath, "r");
      try {
        const { size } = await handle.stat();
        const readSize = Math.min(size, maxBytes);
        const buffer = Buffer.allocUnsafe(readSize);
        let offset = 0;
        while (offset < readSize) {
          const { bytesRead } = await handle.read(buffer, offset, readSize - offset, offset);
          if (bytesRead === 0)
            break;
          offset += bytesRead;
        }
        return offset < readSize ? buffer.subarray(0, offset) : buffer;
      } finally {
        await handle.close();
      }
    }
  };
  activeFs = NodeFsOperations;
});

// ../../src/utils/process.ts
function writeOut(stream, data) {
  if (stream.destroyed) {
    return;
  }
  stream.write(data);
}
function writeToStderr(data) {
  writeOut(process.stderr, data);
}
var init_process = () => {};

// ../../src/utils/debug.ts
import { appendFile, mkdir, symlink, unlink } from "fs/promises";
import { dirname as dirname2, join as join3 } from "path";
function shouldLogDebugMessage(message) {
  if (false) {}
  if (process.env.USER_TYPE !== "ant" && !isDebugMode()) {
    return false;
  }
  if (typeof process === "undefined" || typeof process.versions === "undefined" || typeof process.versions.node === "undefined") {
    return false;
  }
  const filter = getDebugFilter();
  return shouldShowDebugMessage(message, filter);
}
async function appendAsync(needMkdir, dir, path, content) {
  if (needMkdir) {
    await mkdir(dir, { recursive: true }).catch(() => {});
  }
  await appendFile(path, content);
  updateLatestDebugLogSymlink();
}
function noop() {}
function getDebugWriter() {
  if (!debugWriter) {
    let ensuredDir = null;
    debugWriter = createBufferedWriter({
      writeFn: (content) => {
        const path = getDebugLogPath();
        const dir = dirname2(path);
        const needMkdir = ensuredDir !== dir;
        ensuredDir = dir;
        if (isDebugMode()) {
          if (needMkdir) {
            try {
              getFsImplementation().mkdirSync(dir);
            } catch {}
          }
          getFsImplementation().appendFileSync(path, content);
          updateLatestDebugLogSymlink();
          return;
        }
        pendingWrite = pendingWrite.then(appendAsync.bind(null, needMkdir, dir, path, content)).catch(noop);
      },
      flushIntervalMs: 1000,
      maxBufferSize: 100,
      immediateMode: isDebugMode()
    });
    registerCleanup(async () => {
      debugWriter?.dispose();
      await pendingWrite;
    });
  }
  return debugWriter;
}
function logForDebugging(message, { level } = {
  level: "debug"
}) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[getMinDebugLogLevel()]) {
    return;
  }
  if (!shouldLogDebugMessage(message)) {
    return;
  }
  if (hasFormattedOutput && message.includes(`
`)) {
    message = jsonStringify(message);
  }
  const timestamp = new Date().toISOString();
  const output = `${timestamp} [${level.toUpperCase()}] ${message.trim()}
`;
  if (isDebugToStdErr()) {
    writeToStderr(output);
    return;
  }
  getDebugWriter().write(output);
}
function getDebugLogPath() {
  return getDebugFilePath() ?? process.env.UR_CODE_DEBUG_LOGS_DIR ?? join3(getURConfigHomeDir(), "debug", `${getSessionId()}.txt`);
}
function logAntError(context, error) {
  if (process.env.USER_TYPE !== "ant") {
    return;
  }
  if (error instanceof Error && error.stack) {
    logForDebugging(`[ANT-ONLY] ${context} stack trace:
${error.stack}`, {
      level: "error"
    });
  }
}
var LEVEL_ORDER, getMinDebugLogLevel, runtimeDebugEnabled = false, isDebugMode, getDebugFilter, isDebugToStdErr, getDebugFilePath, hasFormattedOutput = false, debugWriter = null, pendingWrite, updateLatestDebugLogSymlink;
var init_debug = __esm(() => {
  init_memoize();
  init_state();
  init_bufferedWriter();
  init_cleanupRegistry();
  init_debugFilter();
  init_envUtils();
  init_fsOperations();
  init_process();
  init_slowOperations();
  LEVEL_ORDER = {
    verbose: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4
  };
  getMinDebugLogLevel = memoize_default(() => {
    const raw = process.env.UR_CODE_DEBUG_LOG_LEVEL?.toLowerCase().trim();
    if (raw && Object.hasOwn(LEVEL_ORDER, raw)) {
      return raw;
    }
    return "debug";
  });
  isDebugMode = memoize_default(() => {
    return runtimeDebugEnabled || isEnvTruthy(process.env.DEBUG) || isEnvTruthy(process.env.DEBUG_SDK) || process.argv.includes("--debug") || process.argv.includes("-d") || isDebugToStdErr() || process.argv.some((arg) => arg.startsWith("--debug=")) || getDebugFilePath() !== null;
  });
  getDebugFilter = memoize_default(() => {
    const debugArg = process.argv.find((arg) => arg.startsWith("--debug="));
    if (!debugArg) {
      return null;
    }
    const filterPattern = debugArg.substring("--debug=".length);
    return parseDebugFilter(filterPattern);
  });
  isDebugToStdErr = memoize_default(() => {
    return process.argv.includes("--debug-to-stderr") || process.argv.includes("-d2e");
  });
  getDebugFilePath = memoize_default(() => {
    for (let i = 0;i < process.argv.length; i++) {
      const arg = process.argv[i];
      if (arg.startsWith("--debug-file=")) {
        return arg.substring("--debug-file=".length);
      }
      if (arg === "--debug-file" && i + 1 < process.argv.length) {
        return process.argv[i + 1];
      }
    }
    return null;
  });
  pendingWrite = Promise.resolve();
  updateLatestDebugLogSymlink = memoize_default(async () => {
    try {
      const debugLogPath = getDebugLogPath();
      const debugLogsDir = dirname2(debugLogPath);
      const latestSymlinkPath = join3(debugLogsDir, "latest");
      await unlink(latestSymlinkPath).catch(() => {});
      await symlink(debugLogPath, latestSymlinkPath);
    } catch {}
  });
});

// ../../src/utils/slowOperations.ts
import {
  closeSync as closeSync2,
  writeFileSync as fsWriteFileSync,
  fsyncSync,
  openSync as openSync2
} from "fs";
function slowLoggingExternal() {
  return NOOP_LOGGER;
}
function jsonStringify(value, replacer, space) {
  let __stack = [];
  try {
    const _ = __using(__stack, slowLogging`JSON.stringify(${value})`, 0);
    return JSON.stringify(value, replacer, space);
  } catch (_catch) {
    var _err = _catch, _hasErr = 1;
  } finally {
    __callDispose(__stack, _err, _hasErr);
  }
}
function clone(value, options) {
  let __stack = [];
  try {
    const _ = __using(__stack, slowLogging`structuredClone(${value})`, 0);
    return structuredClone(value, options);
  } catch (_catch) {
    var _err = _catch, _hasErr = 1;
  } finally {
    __callDispose(__stack, _err, _hasErr);
  }
}
function writeFileSync_DEPRECATED(filePath, data, options) {
  let __stack = [];
  try {
    const _ = __using(__stack, slowLogging`fs.writeFileSync(${filePath}, ${data})`, 0);
    const needsFlush = options !== null && typeof options === "object" && "flush" in options && options.flush === true;
    if (needsFlush) {
      const encoding = typeof options === "object" && "encoding" in options ? options.encoding : undefined;
      const mode = typeof options === "object" && "mode" in options ? options.mode : undefined;
      let fd;
      try {
        fd = openSync2(filePath, "w", mode);
        fsWriteFileSync(fd, data, { encoding: encoding ?? undefined });
        fsyncSync(fd);
      } finally {
        if (fd !== undefined) {
          closeSync2(fd);
        }
      }
    } else {
      fsWriteFileSync(filePath, data, options);
    }
  } catch (_catch) {
    var _err = _catch, _hasErr = 1;
  } finally {
    __callDispose(__stack, _err, _hasErr);
  }
}
var SLOW_OPERATION_THRESHOLD_MS, NOOP_LOGGER, slowLogging, jsonParse = (text, reviver) => {
  let __stack = [];
  try {
    const _ = __using(__stack, slowLogging`JSON.parse(${text})`, 0);
    return typeof reviver === "undefined" ? JSON.parse(text) : JSON.parse(text, reviver);
  } catch (_catch) {
    var _err = _catch, _hasErr = 1;
  } finally {
    __callDispose(__stack, _err, _hasErr);
  }
};
var init_slowOperations = __esm(() => {
  init_state();
  init_debug();
  SLOW_OPERATION_THRESHOLD_MS = (() => {
    const envValue = process.env.UR_CODE_SLOW_OPERATION_THRESHOLD_MS;
    if (envValue !== undefined) {
      const parsed = Number(envValue);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
    if (true) {
      return 20;
    }
    if (process.env.USER_TYPE === "ant") {
      return 300;
    }
    return Infinity;
  })();
  NOOP_LOGGER = { [Symbol.dispose]() {} };
  slowLogging = slowLoggingExternal;
});

export { getURConfigHomeDir, getTeamsDir, hasNodeOption, isEnvTruthy, isEnvDefinedFalsy, isBareMode, getAWSRegion, getDefaultVertexRegion, shouldMaintainProjectWorkingDir, isRunningOnHomespace, getVertexRegionForModel, init_envUtils, registerCleanup, runCleanupFunctions, init_cleanupRegistry, APIError, AuthenticationError, NotFoundError, APIConnectionError, APIConnectionTimeoutError, APIUserAbortError, init_urhq_sdk, URError, MalformedCommandError, AbortError, isAbortError, ConfigParseError, ShellError, TeleportOperationError, TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS, hasExactErrorMessage, toError, errorMessage2 as errorMessage, getErrnoCode, isENOENT, getErrnoPath, isFsInaccessible, classifyAxiosError, init_errors, slowLogging, jsonStringify, jsonParse, clone, writeFileSync_DEPRECATED, init_slowOperations, safeResolvePath, isDuplicatePath, getPathsForPermissionCheck, getFsImplementation, readFileRange, tailFile, readLinesReverse, init_fsOperations, init_process, isDebugMode, isDebugToStdErr, logForDebugging, getDebugLogPath, logAntError, init_debug };
