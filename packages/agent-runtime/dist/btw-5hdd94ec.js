import {
  ScrollBox_default,
  init_ScrollBox
} from "./index-vs69a08w.js";
import {
  Markdown,
  SpinnerGlyph,
  asSystemPrompt,
  createAbortController,
  createUserMessage,
  extractTextContent,
  formatAPIError,
  getLastCacheSafeParams,
  getMessagesAfterCompactBoundary,
  getSystemContext,
  getSystemPrompt,
  getUserContext,
  init_Markdown,
  init_SpinnerGlyph,
  init_abortController,
  init_context,
  init_errorUtils,
  init_forkedAgent,
  init_messages1 as init_messages,
  init_prompts,
  init_systemPromptType,
  runForkedAgent
} from "./index-3xrbnz6c.js";
import"./index-kkermbsd.js";
import {
  init_modalContext,
  init_useTerminalSize,
  useModalOrTerminalSize,
  useTerminalSize
} from "./index-gph76kef.js";
import"./index-2j7c2ame.js";
import {
  ThemedBox_default,
  ThemedText,
  init_dist,
  init_ink,
  require_compiler_runtime,
  useInterval
} from "./index-61fyyngt.js";
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
import"./index-f6z7dc9t.js";
import"./index-4k4gpxwy.js";
import"./index-zh6q93c4.js";
import"./index-j9j0h3gp.js";
import {
  require_jsx_dev_runtime,
  require_react
} from "./index-mpvjr5hg.js";
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
import {
  DOWN_ARROW,
  UP_ARROW,
  init_config,
  init_figures,
  saveGlobalConfig
} from "./index-31dnhhm9.js";
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
import {
  errorMessage,
  init_errors
} from "./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/utils/sideQuestion.ts
async function runSideQuestion({
  question,
  cacheSafeParams
}) {
  const wrappedQuestion = `<system-reminder>This is a side question from the user. You must answer this question directly in a single response.

IMPORTANT CONTEXT:
- You are a separate, lightweight agent spawned to answer this one question
- The main agent is NOT interrupted - it continues working independently in the background
- You share the conversation context but are a completely separate instance
- Do NOT reference being interrupted or what you were "previously doing" - that framing is incorrect

CRITICAL CONSTRAINTS:
- You have NO tools available - you cannot read files, run commands, search, or take any actions
- This is a one-off response - there will be no follow-up turns
- You can ONLY provide information based on what you already know from the conversation context
- NEVER say things like "Let me try...", "I'll now...", "Let me check...", or promise to take any action
- If you don't know the answer, say so - do not offer to look it up or investigate

Simply answer the question with the information you have.</system-reminder>

${question}`;
  const agentResult = await runForkedAgent({
    promptMessages: [createUserMessage({ content: wrappedQuestion })],
    cacheSafeParams,
    canUseTool: async () => ({
      behavior: "deny",
      message: "Side questions cannot use tools",
      decisionReason: { type: "other", reason: "side_question" }
    }),
    querySource: "side_question",
    forkLabel: "side_question",
    maxTurns: 1,
    skipCacheWrite: true
  });
  return {
    response: extractSideQuestionResponse(agentResult.messages),
    usage: agentResult.totalUsage
  };
}
function extractSideQuestionResponse(messages) {
  const assistantBlocks = messages.flatMap((m) => m.type === "assistant" ? m.message.content : []);
  if (assistantBlocks.length > 0) {
    const text = extractTextContent(assistantBlocks, `

`).trim();
    if (text)
      return text;
    const toolUse = assistantBlocks.find((b) => b.type === "tool_use");
    if (toolUse) {
      const toolName = "name" in toolUse ? toolUse.name : "a tool";
      return `(The model tried to call ${toolName} instead of answering directly. Try rephrasing or ask in the main conversation.)`;
    }
  }
  const apiErr = messages.find((m) => m.type === "system" && ("subtype" in m) && m.subtype === "api_error");
  if (apiErr) {
    return `(API error: ${formatAPIError(apiErr.error)})`;
  }
  return null;
}
var init_sideQuestion = __esm(() => {
  init_errorUtils();
  init_forkedAgent();
  init_messages();
});

// ../../src/commands/btw/btw.tsx
function BtwSideQuestion(t0) {
  const $ = import_compiler_runtime.c(25);
  const {
    question,
    context,
    onDone
  } = t0;
  const [response, setResponse] = import_react.useState(null);
  const [error, setError] = import_react.useState(null);
  const [frame, setFrame] = import_react.useState(0);
  const scrollRef = import_react.useRef(null);
  const {
    rows
  } = useModalOrTerminalSize(useTerminalSize());
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = () => setFrame(_temp);
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  useInterval(t1, response || error ? null : 80);
  let t2;
  if ($[1] !== onDone) {
    t2 = function handleKeyDown2(e) {
      if (e.key === "escape" || e.key === "return" || e.key === " " || e.ctrl && (e.key === "c" || e.key === "d")) {
        e.preventDefault();
        onDone(undefined, {
          display: "skip"
        });
        return;
      }
      if (e.key === "up" || e.ctrl && e.key === "p") {
        e.preventDefault();
        scrollRef.current?.scrollBy(-SCROLL_LINES);
      }
      if (e.key === "down" || e.ctrl && e.key === "n") {
        e.preventDefault();
        scrollRef.current?.scrollBy(SCROLL_LINES);
      }
    };
    $[1] = onDone;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  const handleKeyDown = t2;
  let t3;
  let t4;
  if ($[3] !== context || $[4] !== question) {
    t3 = () => {
      const abortController = createAbortController();
      const fetchResponse = async function fetchResponse2() {
        try {
          const cacheSafeParams = await buildCacheSafeParams(context);
          const result = await runSideQuestion({
            question,
            cacheSafeParams
          });
          if (!abortController.signal.aborted) {
            if (result.response) {
              setResponse(result.response);
            } else {
              setError("No response received");
            }
          }
        } catch (t52) {
          const err = t52;
          if (!abortController.signal.aborted) {
            setError(errorMessage(err) || "Failed to get response");
          }
        }
      };
      fetchResponse();
      return () => {
        abortController.abort();
      };
    };
    t4 = [question, context];
    $[3] = context;
    $[4] = question;
    $[5] = t3;
    $[6] = t4;
  } else {
    t3 = $[5];
    t4 = $[6];
  }
  import_react.useEffect(t3, t4);
  const maxContentHeight = Math.max(5, rows - CHROME_ROWS - OUTER_CHROME_ROWS);
  let t5;
  if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
    t5 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      color: "warning",
      bold: true,
      children: [
        "/btw",
        " "
      ]
    }, undefined, true, undefined, this);
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== question) {
    t6 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      children: [
        t5,
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          dimColor: true,
          children: question
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
    $[8] = question;
    $[9] = t6;
  } else {
    t6 = $[9];
  }
  let t7;
  if ($[10] !== error || $[11] !== frame || $[12] !== response) {
    t7 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ScrollBox_default, {
      ref: scrollRef,
      flexDirection: "column",
      flexGrow: 1,
      children: error ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        color: "error",
        children: error
      }, undefined, false, undefined, this) : response ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Markdown, {
        children: response
      }, undefined, false, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
        children: [
          /* @__PURE__ */ jsx_dev_runtime.jsxDEV(SpinnerGlyph, {
            frame,
            messageColor: "warning"
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
            color: "warning",
            children: "Answering..."
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[10] = error;
    $[11] = frame;
    $[12] = response;
    $[13] = t7;
  } else {
    t7 = $[13];
  }
  let t8;
  if ($[14] !== maxContentHeight || $[15] !== t7) {
    t8 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      marginTop: 1,
      marginLeft: 2,
      maxHeight: maxContentHeight,
      children: t7
    }, undefined, false, undefined, this);
    $[14] = maxContentHeight;
    $[15] = t7;
    $[16] = t8;
  } else {
    t8 = $[16];
  }
  let t9;
  if ($[17] !== error || $[18] !== response) {
    t9 = (response || error) && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      marginTop: 1,
      children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        dimColor: true,
        children: [
          UP_ARROW,
          "/",
          DOWN_ARROW,
          " to scroll · Space, Enter, or Escape to dismiss"
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[17] = error;
    $[18] = response;
    $[19] = t9;
  } else {
    t9 = $[19];
  }
  let t10;
  if ($[20] !== handleKeyDown || $[21] !== t6 || $[22] !== t8 || $[23] !== t9) {
    t10 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      paddingLeft: 2,
      marginTop: 1,
      tabIndex: 0,
      autoFocus: true,
      onKeyDown: handleKeyDown,
      children: [
        t6,
        t8,
        t9
      ]
    }, undefined, true, undefined, this);
    $[20] = handleKeyDown;
    $[21] = t6;
    $[22] = t8;
    $[23] = t9;
    $[24] = t10;
  } else {
    t10 = $[24];
  }
  return t10;
}
function _temp(f) {
  return f + 1;
}
function stripInProgressAssistantMessage(messages) {
  const last = messages.at(-1);
  if (last?.type === "assistant" && last.message.stop_reason === null) {
    return messages.slice(0, -1);
  }
  return messages;
}
async function buildCacheSafeParams(context) {
  const forkContextMessages = getMessagesAfterCompactBoundary(stripInProgressAssistantMessage(context.messages));
  const saved = getLastCacheSafeParams();
  if (saved) {
    return {
      systemPrompt: saved.systemPrompt,
      userContext: saved.userContext,
      systemContext: saved.systemContext,
      toolUseContext: context,
      forkContextMessages
    };
  }
  const [rawSystemPrompt, userContext, systemContext] = await Promise.all([getSystemPrompt(context.options.tools, context.options.mainLoopModel, [], context.options.mcpClients), getUserContext(), getSystemContext()]);
  return {
    systemPrompt: asSystemPrompt(rawSystemPrompt),
    userContext,
    systemContext,
    toolUseContext: context,
    forkContextMessages
  };
}
async function call(onDone, context, args) {
  const question = args?.trim();
  if (!question) {
    onDone("Usage: /btw <your question>", {
      display: "system"
    });
    return null;
  }
  saveGlobalConfig((current) => ({
    ...current,
    btwUseCount: current.btwUseCount + 1
  }));
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(BtwSideQuestion, {
    question,
    context,
    onDone
  }, undefined, false, undefined, this);
}
var import_compiler_runtime, import_react, jsx_dev_runtime, CHROME_ROWS = 5, OUTER_CHROME_ROWS = 6, SCROLL_LINES = 3;
var init_btw = __esm(() => {
  init_dist();
  init_Markdown();
  init_SpinnerGlyph();
  init_figures();
  init_prompts();
  init_modalContext();
  init_context();
  init_useTerminalSize();
  init_ScrollBox();
  init_ink();
  init_abortController();
  init_config();
  init_errors();
  init_forkedAgent();
  init_messages();
  init_sideQuestion();
  init_systemPromptType();
  import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
  import_react = __toESM(require_react(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});
init_btw();

export {
  call
};
