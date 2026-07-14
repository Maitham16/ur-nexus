import {
  buildAgentTrendReport,
  formatAgentTrendReport,
  init_trends
} from "./index-g1qjbar5.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/agent-trends/agent-trends.ts
var call = async (args) => {
  const tokens = (args ?? "").trim().split(/\s+/).filter(Boolean);
  const json = tokens.includes("--json");
  const baseUrlIndex = tokens.indexOf("--a2a-base-url");
  const baseUrl = baseUrlIndex >= 0 ? tokens[baseUrlIndex + 1] : undefined;
  const report = buildAgentTrendReport({ baseUrl });
  return {
    type: "text",
    value: json ? JSON.stringify(report, null, 2) : formatAgentTrendReport(report)
  };
};
var init_agent_trends = __esm(() => {
  init_trends();
});
init_agent_trends();

export {
  call
};
