import {
  createURForChromeMcpServer,
  init_chromeMcpCompat
} from "./index-0pz0p974.js";
import {
  ReadBuffer,
  getAllSocketPaths,
  getSecureSocketPath,
  init_common1 as init_common,
  init_datadog,
  init_sideQuery,
  init_stdio,
  serializeMessage,
  shutdownDatadog,
  sideQuery,
  trackDatadogEvent
} from "./index-3xrbnz6c.js";
import"./index-kkermbsd.js";
import"./index-gph76kef.js";
import"./index-2j7c2ame.js";
import"./index-61fyyngt.js";
import"./index-6hrfermc.js";
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
import"./index-5jrp51k1.js";
import {
  checkStatsigFeatureGate_CACHED_MAY_BE_STALE,
  enableConfigs,
  getFeatureValue_CACHED_MAY_BE_STALE,
  getGlobalConfig,
  getURAIOAuthTokens,
  init_auth,
  init_config,
  init_firstPartyEventLogger,
  init_growthbook,
  init_sinkKillswitch,
  isSinkKilled,
  logEventTo1P,
  saveGlobalConfig,
  shouldSampleEvent,
  shutdown1PEventLogging
} from "./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import"./index-z5aeypvg.js";
import {
  attachAnalyticsSink,
  init_analytics,
  logEvent,
  stripProtoFields
} from "./index-5jmh1e0k.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-wxsgjqjk.js";
import"./index-s1a1wahe.js";
import"./index-wred0kdg.js";
import"./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-7bd814mt.js";
import"./index-m9qhxms7.js";
import {
  init_debug,
  init_envUtils,
  isEnvTruthy,
  logForDebugging
} from "./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../node_modules/.bun/@modelcontextprotocol+sdk@1.29.0/node_modules/@modelcontextprotocol/sdk/dist/esm/server/stdio.js
import process2 from "node:process";

class StdioServerTransport {
  constructor(_stdin = process2.stdin, _stdout = process2.stdout) {
    this._stdin = _stdin;
    this._stdout = _stdout;
    this._readBuffer = new ReadBuffer;
    this._started = false;
    this._ondata = (chunk) => {
      this._readBuffer.append(chunk);
      this.processReadBuffer();
    };
    this._onerror = (error) => {
      this.onerror?.(error);
    };
  }
  async start() {
    if (this._started) {
      throw new Error("StdioServerTransport already started! If using Server class, note that connect() calls start() automatically.");
    }
    this._started = true;
    this._stdin.on("data", this._ondata);
    this._stdin.on("error", this._onerror);
  }
  processReadBuffer() {
    while (true) {
      try {
        const message = this._readBuffer.readMessage();
        if (message === null) {
          break;
        }
        this.onmessage?.(message);
      } catch (error) {
        this.onerror?.(error);
      }
    }
  }
  async close() {
    this._stdin.off("data", this._ondata);
    this._stdin.off("error", this._onerror);
    const remainingDataListeners = this._stdin.listenerCount("data");
    if (remainingDataListeners === 0) {
      this._stdin.pause();
    }
    this._readBuffer.clear();
    this.onclose?.();
  }
  send(message) {
    return new Promise((resolve) => {
      const json = serializeMessage(message);
      if (this._stdout.write(json)) {
        resolve();
      } else {
        this._stdout.once("drain", resolve);
      }
    });
  }
}
var init_stdio2 = __esm(() => {
  init_stdio();
});

// ../../src/services/analytics/sink.ts
function shouldTrackDatadog() {
  if (isSinkKilled("datadog")) {
    return false;
  }
  if (isDatadogGateEnabled !== undefined) {
    return isDatadogGateEnabled;
  }
  try {
    return checkStatsigFeatureGate_CACHED_MAY_BE_STALE(DATADOG_GATE_NAME);
  } catch {
    return false;
  }
}
function logEventImpl(eventName, metadata) {
  const sampleResult = shouldSampleEvent(eventName);
  if (sampleResult === 0) {
    return;
  }
  const metadataWithSampleRate = sampleResult !== null ? { ...metadata, sample_rate: sampleResult } : metadata;
  if (shouldTrackDatadog()) {
    trackDatadogEvent(eventName, stripProtoFields(metadataWithSampleRate));
  }
  logEventTo1P(eventName, metadataWithSampleRate);
}
function logEventAsyncImpl(eventName, metadata) {
  logEventImpl(eventName, metadata);
  return Promise.resolve();
}
function initializeAnalyticsSink() {
  attachAnalyticsSink({
    logEvent: logEventImpl,
    logEventAsync: logEventAsyncImpl
  });
}
var DATADOG_GATE_NAME = "tengu_log_datadog_events", isDatadogGateEnabled = undefined;
var init_sink = __esm(() => {
  init_datadog();
  init_firstPartyEventLogger();
  init_growthbook();
  init_analytics();
  init_sinkKillswitch();
});

// ../../src/utils/urInChrome/mcpServer.ts
import { format } from "util";
function isPermissionMode(raw) {
  return PERMISSION_MODES.some((m) => m === raw);
}
function getChromeBridgeUrl() {
  const bridgeEnabled = process.env.USER_TYPE === "ant" || getFeatureValue_CACHED_MAY_BE_STALE("tengu_copper_bridge", false);
  if (!bridgeEnabled) {
    return;
  }
  if (isEnvTruthy(process.env.USE_LOCAL_OAUTH) || isEnvTruthy(process.env.LOCAL_BRIDGE)) {
    return "ws://localhost:8765";
  }
  if (isEnvTruthy(process.env.USE_STAGING_OAUTH)) {
    return "wss://bridge-staging.urusercontent.com";
  }
  return "wss://bridge.urusercontent.com";
}
function isLocalBridge() {
  return isEnvTruthy(process.env.USE_LOCAL_OAUTH) || isEnvTruthy(process.env.LOCAL_BRIDGE);
}
function createChromeContext(env) {
  const logger = new DebugLogger;
  const chromeBridgeUrl = getChromeBridgeUrl();
  logger.info(`Bridge URL: ${chromeBridgeUrl ?? "none (using native socket)"}`);
  const rawPermissionMode = env?.UR_CHROME_PERMISSION_MODE ?? process.env.UR_CHROME_PERMISSION_MODE;
  let initialPermissionMode;
  if (rawPermissionMode) {
    if (isPermissionMode(rawPermissionMode)) {
      initialPermissionMode = rawPermissionMode;
    } else {
      logger.warn(`Invalid UR_CHROME_PERMISSION_MODE "${rawPermissionMode}". Valid values: ${PERMISSION_MODES.join(", ")}`);
    }
  }
  return {
    serverName: "UR in Chrome",
    logger,
    socketPath: getSecureSocketPath(),
    getSocketPaths: getAllSocketPaths,
    clientTypeId: "ur",
    onAuthenticationError: () => {
      logger.warn("Authentication error occurred. Please ensure you are logged into the UR browser extension with the same account as UR.");
    },
    onToolCallDisconnected: () => {
      return `Browser extension is not connected. Please ensure the UR browser extension is installed and running (${EXTENSION_DOWNLOAD_URL}), and that you are logged in with the same account as UR. If this is your first time connecting to Chrome, you may need to restart Chrome for the installation to take effect. If you continue to experience issues, please report a bug: ${BUG_REPORT_URL}`;
    },
    onExtensionPaired: (deviceId, name) => {
      saveGlobalConfig((config) => {
        if (config.chromeExtension?.pairedDeviceId === deviceId && config.chromeExtension?.pairedDeviceName === name) {
          return config;
        }
        return {
          ...config,
          chromeExtension: {
            pairedDeviceId: deviceId,
            pairedDeviceName: name
          }
        };
      });
      logger.info(`Paired with "${name}" (${deviceId.slice(0, 8)})`);
    },
    getPersistedDeviceId: () => {
      return getGlobalConfig().chromeExtension?.pairedDeviceId;
    },
    ...chromeBridgeUrl && {
      bridgeConfig: {
        url: chromeBridgeUrl,
        getUserId: async () => {
          return getGlobalConfig().oauthAccount?.accountUuid;
        },
        getOAuthToken: async () => {
          return getURAIOAuthTokens()?.accessToken ?? "";
        },
        ...isLocalBridge() && { devUserId: "dev_user_local" }
      }
    },
    ...initialPermissionMode && { initialPermissionMode },
    ...process.env.USER_TYPE === "ant" && {
      callURHQMessages: async (req) => {
        const response = await sideQuery({
          model: req.model,
          system: req.system,
          messages: req.messages,
          max_tokens: req.max_tokens,
          stop_sequences: req.stop_sequences,
          signal: req.signal,
          skipSystemPromptPrefix: true,
          tools: [],
          querySource: "chrome_mcp"
        });
        const textBlocks = [];
        for (const b of response.content) {
          if (b.type === "text") {
            textBlocks.push({ type: "text", text: b.text });
          }
        }
        return {
          content: textBlocks,
          stop_reason: response.stop_reason,
          usage: {
            input_tokens: response.usage.input_tokens,
            output_tokens: response.usage.output_tokens
          }
        };
      }
    },
    trackEvent: (eventName, metadata) => {
      const safeMetadata = {};
      if (metadata) {
        for (const [key, value] of Object.entries(metadata)) {
          const safeKey = key === "status" ? "bridge_status" : key;
          if (typeof value === "boolean" || typeof value === "number") {
            safeMetadata[safeKey] = value;
          } else if (typeof value === "string" && SAFE_BRIDGE_STRING_KEYS.has(safeKey)) {
            safeMetadata[safeKey] = value;
          }
        }
      }
      logEvent(eventName, safeMetadata);
    }
  };
}
async function runURInChromeMcpServer() {
  enableConfigs();
  initializeAnalyticsSink();
  const context = createChromeContext();
  const server = createURForChromeMcpServer(context);
  const transport = new StdioServerTransport;
  let exiting = false;
  const shutdownAndExit = async () => {
    if (exiting) {
      return;
    }
    exiting = true;
    await shutdown1PEventLogging();
    await shutdownDatadog();
    process.exit(0);
  };
  process.stdin.on("end", () => void shutdownAndExit());
  process.stdin.on("error", () => void shutdownAndExit());
  logForDebugging("[UR in Chrome] Starting MCP server");
  await server.connect(transport);
  logForDebugging("[UR in Chrome] MCP server started");
}

class DebugLogger {
  silly(message, ...args) {
    logForDebugging(format(message, ...args), { level: "debug" });
  }
  debug(message, ...args) {
    logForDebugging(format(message, ...args), { level: "debug" });
  }
  info(message, ...args) {
    logForDebugging(format(message, ...args), { level: "info" });
  }
  warn(message, ...args) {
    logForDebugging(format(message, ...args), { level: "warn" });
  }
  error(message, ...args) {
    logForDebugging(format(message, ...args), { level: "error" });
  }
}
var EXTENSION_DOWNLOAD_URL = "https://github.com/Maitham16/ur-nexus", BUG_REPORT_URL = "https://github.com/Maitham16/ur-nexus/issues/new", SAFE_BRIDGE_STRING_KEYS, PERMISSION_MODES;
var init_mcpServer = __esm(() => {
  init_chromeMcpCompat();
  init_stdio2();
  init_datadog();
  init_firstPartyEventLogger();
  init_growthbook();
  init_analytics();
  init_sink();
  init_auth();
  init_config();
  init_debug();
  init_envUtils();
  init_sideQuery();
  init_common();
  SAFE_BRIDGE_STRING_KEYS = new Set([
    "bridge_status",
    "error_type",
    "tool_name"
  ]);
  PERMISSION_MODES = [
    "ask",
    "skip_all_permission_checks",
    "follow_a_plan"
  ];
});
init_mcpServer();

export {
  runURInChromeMcpServer,
  createChromeContext
};
