import {
  getAcpServerPort,
  init_acpServer,
  serveAcp,
  stopAcpServer
} from "./index-rdcba7de.js";
import"./index-1zsbpc6x.js";
import"./index-2k3x04sj.js";
import"./index-zxm9dac1.js";
import"./index-kw2wxbby.js";
import"./index-fayv8cwb.js";
import"./index-j4g1j45r.js";
import"./index-qg6cjfb3.js";
import"./index-5jrgxedg.js";
import"./index-hp4vvv8v.js";
import"./index-zn5x3nwj.js";
import"./index-7fe5jn6w.js";
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
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
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
import"./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import"./index-z5aeypvg.js";
import"./index-5jmh1e0k.js";
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
import"./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm,
  __require
} from "./index-8rxa073f.js";

// ../../src/commands/acp/acp.tsx
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
function positionals(tokens) {
  const flagsWithValue = new Set([
    "--host",
    "--port",
    "--token"
  ]);
  const values = [];
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (flagsWithValue.has(token)) {
      i++;
      continue;
    }
    if (token.startsWith("--"))
      continue;
    values.push(token);
  }
  return values;
}
function usage() {
  return [
    "Usage:",
    "  ur acp serve [--host 127.0.0.1] [--port 8123] [--token <secret>] [--dry-run] [--debug]",
    "  ur acp stdio            Run a stdio ACP agent for editors (Zed, ACP Neovim)",
    "  ur acp stop",
    "  ur acp status [--json]"
  ].join(`
`);
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const action = positionals(tokens)[0] ?? "status";
  const host = option(tokens, "--host") ?? "127.0.0.1";
  const port = Number(option(tokens, "--port") ?? "8123");
  const token = option(tokens, "--token");
  const dryRun = tokens.includes("--dry-run");
  const debug = tokens.includes("--debug");
  if (action === "serve" || action === "start") {
    await serveAcp({ host, port, token, cwd: process.cwd(), dryRun, debug });
    return { type: "text", value: "" };
  }
  if (action === "stdio") {
    const { startAcpStdioAgent } = await import("./acpStdio-ymptfmgz.js");
    await startAcpStdioAgent({ cwd: process.cwd() });
    return { type: "text", value: "" };
  }
  if (action === "stop") {
    await stopAcpServer();
    return { type: "text", value: json ? JSON.stringify({ stopped: true }) : "ACP server stopped" };
  }
  if (action === "status") {
    const runningPort = getAcpServerPort();
    const result = { running: runningPort !== null, port: runningPort };
    return {
      type: "text",
      value: json ? JSON.stringify(result, null, 2) : `ACP server: ${result.running ? `running on port ${result.port}` : "not running"}`
    };
  }
  return { type: "text", value: usage() };
};
var init_acp = __esm(() => {
  init_argumentSubstitution();
  init_acpServer();
});
init_acp();

export {
  call
};
