import {
  init_analytics
} from "./index-5jmh1e0k.js";
import {
  init_debug,
  init_errors,
  init_slowOperations
} from "./index-bdb5pzbm.js";
import {
  __esm,
  __export
} from "./index-8rxa073f.js";

// ../../src/bridge/sessionIdCompat.ts
var exports_sessionIdCompat = {};
__export(exports_sessionIdCompat, {
  toInfraSessionId: () => toInfraSessionId,
  toCompatSessionId: () => toCompatSessionId,
  setCseShimGate: () => setCseShimGate
});
function setCseShimGate(gate) {
  _isCseShimEnabled = gate;
}
function toCompatSessionId(id) {
  if (!id.startsWith("cse_"))
    return id;
  if (_isCseShimEnabled && !_isCseShimEnabled())
    return id;
  return "session_" + id.slice("cse_".length);
}
function toInfraSessionId(id) {
  if (!id.startsWith("session_"))
    return id;
  return "cse_" + id.slice("session_".length);
}
var _isCseShimEnabled;
var init_sessionIdCompat = () => {};

// ../../src/bridge/debugUtils.ts
function extractErrorDetail(data) {
  if (!data || typeof data !== "object")
    return;
  if ("message" in data && typeof data.message === "string") {
    return data.message;
  }
  if ("error" in data && data.error !== null && typeof data.error === "object" && "message" in data.error && typeof data.error.message === "string") {
    return data.error.message;
  }
  return;
}
var SECRET_FIELD_NAMES, SECRET_PATTERN;
var init_debugUtils = __esm(() => {
  init_analytics();
  init_debug();
  init_errors();
  init_slowOperations();
  SECRET_FIELD_NAMES = [
    "session_ingress_token",
    "environment_secret",
    "access_token",
    "secret",
    "token"
  ];
  SECRET_PATTERN = new RegExp(`"(${SECRET_FIELD_NAMES.join("|")})"\\s*:\\s*"([^"]*)"`, "g");
});

export { toCompatSessionId, exports_sessionIdCompat, init_sessionIdCompat, extractErrorDetail, init_debugUtils };
