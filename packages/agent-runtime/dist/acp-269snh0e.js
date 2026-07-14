import {
  getAcpServerPort,
  init_acpServer,
  serveAcp,
  stopAcpServer
} from "./index-6ktmnmcx.js";
import"./index-g1qjbar5.js";
import"./index-4fw1fpfb.js";
import"./index-wrrxw9xc.js";
import"./index-30hhb4zp.js";
import"./index-2pd4r2w9.js";
import"./index-h9kt1sj4.js";
import"./index-df0wfzdw.js";
import"./index-hakw7em9.js";
import"./index-c6n1hema.js";
import"./index-rad7f2cp.js";
import"./index-79vhy4mk.js";
import"./index-grma1d53.js";
import"./index-h3gckbec.js";
import"./index-e4qqkpaw.js";
import"./index-4ywxxsys.js";
import"./index-hq5et9ce.js";
import"./index-e6d6jy9m.js";
import"./index-f8sv7ymg.js";
import"./index-bkd049y5.js";
import"./index-q92gn3zb.js";
import"./index-hny2avst.js";
import"./index-0b2n9cdp.js";
import"./index-t4d29e3d.js";
import"./index-yqwh56at.js";
import"./index-hgk4djez.js";
import"./index-keaxkjg6.js";
import"./index-nn6db592.js";
import"./index-yw8ef0zj.js";
import"./index-b85xt2xy.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
import"./index-k4smejj6.js";
import"./index-nx1e0qxk.js";
import"./index-g6p7fqb0.js";
import"./index-2krq0sbw.js";
import"./index-4pm7msm9.js";
import"./index-08vfk1s7.js";
import"./index-9zsppqmn.js";
import"./index-wpmv59x8.js";
import"./index-484d6yds.js";
import"./index-wx2fg0aa.js";
import"./index-qc0evn6c.js";
import"./index-rra3q270.js";
import"./index-2gbtdq3b.js";
import"./index-3tq38g6m.js";
import"./index-jmsjkkjh.js";
import"./index-y4htdtvj.js";
import"./index-racy6ymd.js";
import"./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import"./index-mpmmtc93.js";
import"./index-s5dp14ed.js";
import"./index-6dy59xbm.js";
import"./index-0r3wd4mq.js";
import"./index-b5f4m7g4.js";
import"./index-h7h0j06f.js";
import"./index-7h9ddexs.js";
import"./index-f80dj2bz.js";
import"./index-q00jv0fc.js";
import"./index-cs7da0vv.js";
import"./index-ycnb0yeb.js";
import"./index-vpczjthp.js";
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm,
  __require
} from "./index-8rxa073f.js";

// src/commands/acp/acp.tsx
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
    const { startAcpStdioAgent } = await import("./acpStdio-crzjxqbt.js");
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
