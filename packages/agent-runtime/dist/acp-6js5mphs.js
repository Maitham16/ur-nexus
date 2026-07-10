import {
  getAcpServerPort,
  init_acpServer,
  serveAcp,
  stopAcpServer
} from "./index-hxpf5cs4.js";
import"./index-c3xttk6a.js";
import"./index-gzdescg9.js";
import"./index-488yk5fy.js";
import"./index-eh0s6zsz.js";
import"./index-dadxay6x.js";
import"./index-7y1pnagk.js";
import"./index-801scn8g.js";
import"./index-5jrgxedg.js";
import"./index-j15w02ww.js";
import"./index-ad9qp29k.js";
import"./index-5wrehbeq.js";
import"./index-by2vmtsd.js";
import"./index-kkermbsd.js";
import"./index-v2hw7r4c.js";
import"./index-xy62w38z.js";
import"./index-cqtb7hz4.js";
import"./index-r9gwtga0.js";
import"./index-s87snjmt.js";
import"./index-ked7nkp4.js";
import"./index-vpn9zab9.js";
import"./index-pm2fs369.js";
import"./index-e7zhbfbk.js";
import"./index-1ckv14g7.js";
import"./index-43251g5q.js";
import"./index-1n2jp292.js";
import"./index-wxp81q89.js";
import"./index-0g63027x.js";
import"./index-na6pcvfj.js";
import"./index-8ssmkf1y.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-ke69cyc7.js";
import"./index-4k4gpxwy.js";
import"./index-1t11s6r8.js";
import"./index-j9j0h3gp.js";
import"./index-mpvjr5hg.js";
import"./index-ce74agn1.js";
import"./index-gtvyh4ft.js";
import"./index-vw0tpbas.js";
import"./index-ce1yxg5m.js";
import"./index-m1cwhfvd.js";
import"./index-a38sm3ww.js";
import"./index-t5r7sy2d.js";
import"./index-kkhap9s1.js";
import"./index-1f511qkg.js";
import"./index-kq80n9z5.js";
import"./index-c2g52y43.js";
import"./index-cmw2ae5x.js";
import"./index-v9qevprk.js";
import"./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import"./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import"./index-a9y6sg4d.js";
import"./index-dsy9thtk.js";
import"./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
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
    const { startAcpStdioAgent } = await import("./acpStdio-gm10xhvj.js");
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
