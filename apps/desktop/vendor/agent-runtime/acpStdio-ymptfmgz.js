import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-wred0kdg.js";
import"./index-2p1fe0x7.js";
import"./index-4bphgmcc.js";
import"./index-m9qhxms7.js";
import"./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/acpStdio.ts
import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline";
function extractPromptText(prompt) {
  if (typeof prompt === "string")
    return prompt;
  if (!Array.isArray(prompt))
    return "";
  return prompt.map((block) => {
    if (typeof block === "string")
      return block;
    if (block && typeof block === "object") {
      const b = block;
      if (b.type === "text" || b.text)
        return b.text ?? "";
    }
    return "";
  }).filter(Boolean).join(`
`);
}
function createAcpStdioAgent(deps) {
  const sessions = new Map;
  const runPrompt = deps.runPrompt ?? defaultPromptRunner;
  const respond = (id, result) => deps.write({ jsonrpc: "2.0", id: id ?? null, result });
  const respondError = (id, code, message) => deps.write({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
  const notify = (method, params) => deps.write({ jsonrpc: "2.0", method, params });
  async function handle(message) {
    const { id, method, params } = message;
    if (typeof method !== "string")
      return;
    const hasId = id !== undefined && id !== null;
    try {
      switch (method) {
        case "initialize":
          respond(id, {
            protocolVersion: 1,
            agentCapabilities: {
              loadSession: false,
              promptCapabilities: { image: false, audio: false, embeddedContext: true }
            },
            authMethods: []
          });
          return;
        case "authenticate":
          respond(id, {});
          return;
        case "session/new": {
          const cwd = typeof params?.cwd === "string" ? params.cwd : deps.cwd;
          const sessionId = `sess_${randomUUID()}`;
          sessions.set(sessionId, { cwd, controller: new AbortController });
          respond(id, { sessionId });
          return;
        }
        case "session/prompt": {
          const sessionId = typeof params?.sessionId === "string" ? params.sessionId : "";
          const session = sessions.get(sessionId);
          if (!session) {
            respondError(id, -32602, `unknown session: ${sessionId}`);
            return;
          }
          const controller = new AbortController;
          session.controller = controller;
          const { stopReason } = await runPrompt(extractPromptText(params?.prompt), {
            sessionId,
            cwd: session.cwd,
            signal: controller.signal,
            onChunk: (text) => notify("session/update", {
              sessionId,
              update: { sessionUpdate: "agent_message_chunk", content: { type: "text", text } }
            })
          });
          respond(id, { stopReason: controller.signal.aborted ? "cancelled" : stopReason });
          return;
        }
        case "session/cancel": {
          const sessionId = typeof params?.sessionId === "string" ? params.sessionId : "";
          sessions.get(sessionId)?.controller.abort();
          if (hasId)
            respond(id, { cancelled: true });
          return;
        }
        case "shutdown":
          if (hasId)
            respond(id, null);
          return;
        default:
          if (hasId)
            respondError(id, -32601, `method not found: ${method}`);
      }
    } catch (error) {
      if (hasId)
        respondError(id, -32603, error instanceof Error ? error.message : String(error));
    }
  }
  return { handle, sessions };
}
async function startAcpStdioAgent(options) {
  const agent = createAcpStdioAgent({
    cwd: options.cwd,
    write: (message) => process.stdout.write(`${JSON.stringify(message)}
`)
  });
  const rl = createInterface({ input: process.stdin });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed)
      continue;
    try {
      await agent.handle(JSON.parse(trimmed));
    } catch {
      process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } })}
`);
    }
  }
}
var defaultPromptRunner = async (prompt, ctx) => {
  const result = await execFileNoThrowWithCwd(process.execPath, [process.argv[1] ?? "", "-p", "--output-format", "text", prompt], { cwd: ctx.cwd, timeout: 30 * 60 * 1000, preserveOutputOnError: true });
  const text = (result.stdout || result.stderr || result.error || "").trim();
  if (text)
    ctx.onChunk(text);
  return { stopReason: result.code === 0 ? "end_turn" : "refusal" };
};
var init_acpStdio = __esm(() => {
  init_execFileNoThrow();
});
init_acpStdio();

export {
  startAcpStdioAgent,
  createAcpStdioAgent
};
