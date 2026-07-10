import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/utils/telemetry/instrumentation.ts
function bootstrapTelemetry() {}
function parseExporterTypes(value) {
  return (value || "").trim().split(",").filter(Boolean).map((t) => t.trim()).filter((t) => t !== "none");
}
function isTelemetryEnabled() {
  return false;
}
async function initializeTelemetry() {
  return null;
}
async function flushTelemetry() {}
var init_instrumentation = () => {};
init_instrumentation();

export {
  parseExporterTypes,
  isTelemetryEnabled,
  initializeTelemetry,
  flushTelemetry,
  bootstrapTelemetry
};
