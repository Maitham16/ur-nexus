import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/utils/urInChrome/chromeMcpCompat.ts
function handleChromeToolCall() {
  return null;
}
function createChromeServer() {
  return createURForChromeMcpServer();
}
function createURForChromeMcpServer(_context) {
  return {
    async connect() {}
  };
}
var BROWSER_TOOLS, CHROME_TOOL_DEFINITIONS;
var init_chromeMcpCompat = __esm(() => {
  BROWSER_TOOLS = [];
  CHROME_TOOL_DEFINITIONS = [];
});

export { BROWSER_TOOLS, CHROME_TOOL_DEFINITIONS, handleChromeToolCall, createChromeServer, createURForChromeMcpServer, init_chromeMcpCompat };
