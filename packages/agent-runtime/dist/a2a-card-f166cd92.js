import {
  formatA2AAgentCard,
  init_trends
} from "./index-c3xttk6a.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/a2a-card/a2a-card.ts
var call = async (args) => {
  const tokens = (args ?? "").trim().split(/\s+/).filter(Boolean);
  const compact = tokens.includes("--compact");
  const baseUrl = tokens.find((token) => !token.startsWith("--"));
  return {
    type: "text",
    value: formatA2AAgentCard({ baseUrl }, !compact)
  };
};
var init_a2a_card = __esm(() => {
  init_trends();
});
init_a2a_card();

export {
  call
};
