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
} from "./index-79vhy4mk.js";
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
import"./index-skb7s3mf.js";
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
import {
  init_auth,
  init_oauth
} from "./index-133awary.js";
import"./index-pnhq4694.js";
import {
  exports_external,
  init_lazySchema,
  init_teammate,
  init_v4,
  isTeammate,
  lazySchema
} from "./index-4mfpjpj0.js";
import {
  init_analytics
} from "./index-mpmmtc93.js";
import {
  init_json,
  safeParseJSON
} from "./index-s5dp14ed.js";
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
import {
  errorMessage,
  init_debug,
  init_errors,
  logForDebugging
} from "./index-t784n9jz.js";
import {
  getSessionId,
  init_state
} from "./index-93rq225h.js";
import {
  __esm,
  __require
} from "./index-8rxa073f.js";

// src/bridge/bridgeConfig.ts
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

// src/utils/sessionTitle.ts
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

// src/commands/rename/generateSessionName.ts
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

// src/commands/rename/rename.ts
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
    import("./createSession-g3fpp1vp.js").then(({ updateBridgeSessionTitle }) => updateBridgeSessionTitle(bridgeSessionId, newName, {
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
