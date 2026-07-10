import {
  asSystemPrompt,
  extractTextContent,
  getMessagesAfterCompactBoundary,
  getTranscriptPath,
  init_messages1 as init_messages,
  init_sessionStorage,
  init_systemPromptType,
  init_ur,
  querymodelH,
  saveAgentName,
  saveCustomTitle
} from "./index-qv8mzsdh.js";
import"./index-by2vmtsd.js";
import"./index-kkermbsd.js";
import"./index-v2hw7r4c.js";
import"./index-xy62w38z.js";
import"./index-cqtb7hz4.js";
import"./index-r9gwtga0.js";
import"./index-s87snjmt.js";
import"./index-ked7nkp4.js";
import"./index-xa1t0yjk.js";
import"./index-g9g95te9.js";
import"./index-e7zhbfbk.js";
import"./index-czqwk9v1.js";
import"./index-43251g5q.js";
import"./index-1n2jp292.js";
import"./index-wxp81q89.js";
import"./index-0g63027x.js";
import"./index-na6pcvfj.js";
import"./index-8ssmkf1y.js";
import"./index-ke69cyc7.js";
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
import {
  init_auth,
  init_oauth
} from "./index-nds05g02.js";
import"./index-f7bfe40r.js";
import {
  exports_external,
  init_lazySchema,
  init_teammate,
  init_v4,
  isTeammate,
  lazySchema
} from "./index-3stg8t86.js";
import {
  init_analytics
} from "./index-5jmh1e0k.js";
import {
  init_json,
  safeParseJSON
} from "./index-mwn5bkf6.js";
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
import {
  errorMessage,
  init_debug,
  init_errors,
  logForDebugging
} from "./index-bdb5pzbm.js";
import {
  getSessionId,
  init_state
} from "./index-nhjg91p1.js";
import {
  __esm,
  __require
} from "./index-8rxa073f.js";

// ../../src/bridge/bridgeConfig.ts
function getBridgeTokenOverride() {
  return process.env.USER_TYPE === "ant" && process.env.UR_BRIDGE_OAUTH_TOKEN || undefined;
}
function getBridgeBaseUrlOverride() {
  return process.env.USER_TYPE === "ant" && process.env.UR_BRIDGE_BASE_URL || undefined;
}
var init_bridgeConfig = __esm(() => {
  init_oauth();
  init_auth();
});

// ../../src/utils/sessionTitle.ts
function extractConversationText(messages) {
  const parts = [];
  for (const msg of messages) {
    if (msg.type !== "user" && msg.type !== "assistant")
      continue;
    if ("isMeta" in msg && msg.isMeta)
      continue;
    if ("origin" in msg && msg.origin && typeof msg.origin !== "string" && msg.origin.kind !== "human")
      continue;
    const content = msg.message.content;
    if (typeof content === "string") {
      parts.push(content);
    } else if (Array.isArray(content)) {
      for (const block of content) {
        if ("type" in block && block.type === "text" && "text" in block) {
          parts.push(block.text);
        }
      }
    }
  }
  const text = parts.join(`
`);
  return text.length > MAX_CONVERSATION_TEXT ? text.slice(-MAX_CONVERSATION_TEXT) : text;
}
var MAX_CONVERSATION_TEXT = 1000, titleSchema;
var init_sessionTitle = __esm(() => {
  init_v4();
  init_state();
  init_analytics();
  init_ur();
  init_debug();
  init_json();
  init_lazySchema();
  init_messages();
  init_systemPromptType();
  titleSchema = lazySchema(() => exports_external.object({ title: exports_external.string() }));
});

// ../../src/commands/rename/generateSessionName.ts
async function generateSessionName(messages, signal) {
  const conversationText = extractConversationText(messages);
  if (!conversationText) {
    return null;
  }
  try {
    const result = await querymodelH({
      systemPrompt: asSystemPrompt([
        'Generate a short kebab-case name (2-4 words) that captures the main topic of this conversation. Use lowercase words separated by hyphens. Examples: "fix-login-bug", "add-auth-feature", "refactor-api-client", "debug-test-failures". Return JSON with a "name" field.'
      ]),
      userPrompt: conversationText,
      outputFormat: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            name: { type: "string" }
          },
          required: ["name"],
          additionalProperties: false
        }
      },
      signal,
      options: {
        querySource: "rename_generate_name",
        agents: [],
        isNonInteractiveSession: false,
        hasAppendSystemPrompt: false,
        mcpTools: []
      }
    });
    const content = extractTextContent(result.message.content);
    const response = safeParseJSON(content);
    if (response && typeof response === "object" && "name" in response && typeof response.name === "string") {
      return response.name;
    }
    return null;
  } catch (error) {
    logForDebugging(`generateSessionName failed: ${errorMessage(error)}`, {
      level: "error"
    });
    return null;
  }
}
var init_generateSessionName = __esm(() => {
  init_ur();
  init_debug();
  init_errors();
  init_json();
  init_messages();
  init_sessionTitle();
  init_systemPromptType();
});

// ../../src/commands/rename/rename.ts
async function call(onDone, context, args) {
  if (isTeammate()) {
    onDone("Cannot rename: This session is a swarm teammate. Teammate names are set by the team leader.", { display: "system" });
    return null;
  }
  let newName;
  if (!args || args.trim() === "") {
    const generated = await generateSessionName(getMessagesAfterCompactBoundary(context.messages), context.abortController.signal);
    if (!generated) {
      onDone("Could not generate a name: no conversation context yet. Usage: /rename <name>", { display: "system" });
      return null;
    }
    newName = generated;
  } else {
    newName = args.trim();
  }
  const sessionId = getSessionId();
  const fullPath = getTranscriptPath();
  await saveCustomTitle(sessionId, newName, fullPath);
  const appState = context.getAppState();
  const bridgeSessionId = appState.replBridgeSessionId;
  if (bridgeSessionId) {
    const tokenOverride = getBridgeTokenOverride();
    import("./createSession-kkzjh5j2.js").then(({ updateBridgeSessionTitle }) => updateBridgeSessionTitle(bridgeSessionId, newName, {
      baseUrl: getBridgeBaseUrlOverride(),
      getAccessToken: tokenOverride ? () => tokenOverride : undefined
    }).catch(() => {}));
  }
  await saveAgentName(sessionId, newName, fullPath);
  context.setAppState((prev) => ({
    ...prev,
    standaloneAgentContext: {
      ...prev.standaloneAgentContext,
      name: newName
    }
  }));
  onDone(`Session renamed to: ${newName}`, { display: "system" });
  return null;
}
var init_rename = __esm(() => {
  init_state();
  init_bridgeConfig();
  init_messages();
  init_sessionStorage();
  init_teammate();
  init_generateSessionName();
});
init_rename();

export {
  call
};
