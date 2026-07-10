import {
  ERROR_MESSAGE_INCOMPLETE_RESPONSE,
  ERROR_MESSAGE_NOT_ENOUGH_MESSAGES,
  ERROR_MESSAGE_USER_ABORT,
  buildEffectiveSystemPrompt,
  compactConversation,
  executePreCompactHooks,
  getMessagesAfterCompactBoundary,
  getShortcutDisplay,
  getSystemContext,
  getSystemPrompt,
  getUpgradeMessage,
  getUserContext,
  init_compact,
  init_compactWarningState,
  init_context,
  init_contextWindowUpgradeCheck,
  init_hooks,
  init_messages1 as init_messages,
  init_microCompact,
  init_postCompactCleanup,
  init_promptCacheBreakDetection,
  init_prompts,
  init_sessionMemoryCompact,
  init_sessionMemoryUtils,
  init_shortcutFormat,
  init_systemPrompt,
  mergeHookInstructions,
  microcompactMessages,
  runPostCompactCleanup,
  setLastSummarizedMessageId,
  suppressCompactWarning,
  trySessionMemoryCompaction
} from "./index-ncjdg6tp.js";
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
  init_source,
  source_default
} from "./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import"./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import"./index-a9y6sg4d.js";
import"./index-dsy9thtk.js";
import"./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import {
  init_log,
  logError
} from "./index-2g4gegqj.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import {
  hasExactErrorMessage,
  init_errors
} from "./index-bdb5pzbm.js";
import {
  init_state,
  markPostCompaction
} from "./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/compact/compact.ts
async function compactViaReactive(messages, context, customInstructions, reactive) {
  context.onCompactProgress?.({
    type: "hooks_start",
    hookType: "pre_compact"
  });
  context.setSDKStatus?.("compacting");
  try {
    const [hookResult, cacheSafeParams] = await Promise.all([
      executePreCompactHooks({ trigger: "manual", customInstructions: customInstructions || null }, context.abortController.signal),
      getCacheSharingParams(context, messages)
    ]);
    const mergedInstructions = mergeHookInstructions(customInstructions, hookResult.newCustomInstructions);
    context.setStreamMode?.("requesting");
    context.setResponseLength?.(() => 0);
    context.onCompactProgress?.({ type: "compact_start" });
    const outcome = await reactive.reactiveCompactOnPromptTooLong(messages, cacheSafeParams, { customInstructions: mergedInstructions, trigger: "manual" });
    if (!outcome.ok) {
      switch (outcome.reason) {
        case "too_few_groups":
          throw new Error(ERROR_MESSAGE_NOT_ENOUGH_MESSAGES);
        case "aborted":
          throw new Error(ERROR_MESSAGE_USER_ABORT);
        case "exhausted":
        case "error":
        case "media_unstrippable":
          throw new Error(ERROR_MESSAGE_INCOMPLETE_RESPONSE);
      }
    }
    setLastSummarizedMessageId(undefined);
    runPostCompactCleanup();
    suppressCompactWarning();
    getUserContext.cache.clear?.();
    const combinedMessage = [hookResult.userDisplayMessage, outcome.result.userDisplayMessage].filter(Boolean).join(`
`) || undefined;
    return {
      type: "compact",
      compactionResult: {
        ...outcome.result,
        userDisplayMessage: combinedMessage
      },
      displayText: buildDisplayText(context, combinedMessage)
    };
  } finally {
    context.setStreamMode?.("requesting");
    context.setResponseLength?.(() => 0);
    context.onCompactProgress?.({ type: "compact_end" });
    context.setSDKStatus?.(null);
  }
}
function buildDisplayText(context, userDisplayMessage) {
  const upgradeMessage = getUpgradeMessage("tip");
  const expandShortcut = getShortcutDisplay("app:toggleTranscript", "Global", "ctrl+o");
  const dimmed = [
    ...context.options.verbose ? [] : [`(${expandShortcut} to see full summary)`],
    ...userDisplayMessage ? [userDisplayMessage] : [],
    ...upgradeMessage ? [upgradeMessage] : []
  ];
  return source_default.dim("Compacted " + dimmed.join(`
`));
}
async function getCacheSharingParams(context, forkContextMessages) {
  const appState = context.getAppState();
  const defaultSysPrompt = await getSystemPrompt(context.options.tools, context.options.mainLoopModel, Array.from(appState.toolPermissionContext.additionalWorkingDirectories.keys()), context.options.mcpClients);
  const systemPrompt = buildEffectiveSystemPrompt({
    mainThreadAgentDefinition: undefined,
    toolUseContext: context,
    customSystemPrompt: context.options.customSystemPrompt,
    defaultSystemPrompt: defaultSysPrompt,
    appendSystemPrompt: context.options.appendSystemPrompt
  });
  const [userContext, systemContext] = await Promise.all([
    getUserContext(),
    getSystemContext()
  ]);
  return {
    systemPrompt,
    userContext,
    systemContext,
    toolUseContext: context,
    forkContextMessages
  };
}
var reactiveCompact = null, call = async (args, context) => {
  const { abortController } = context;
  let { messages } = context;
  messages = getMessagesAfterCompactBoundary(messages);
  if (messages.length === 0) {
    throw new Error("No messages to compact");
  }
  const customInstructions = args.trim();
  try {
    if (!customInstructions) {
      const sessionMemoryResult = await trySessionMemoryCompaction(messages, context.agentId);
      if (sessionMemoryResult) {
        getUserContext.cache.clear?.();
        runPostCompactCleanup();
        if (false) {}
        markPostCompaction();
        suppressCompactWarning();
        return {
          type: "compact",
          compactionResult: sessionMemoryResult,
          displayText: buildDisplayText(context)
        };
      }
    }
    if (reactiveCompact?.isReactiveOnlyMode()) {
      return await compactViaReactive(messages, context, customInstructions, reactiveCompact);
    }
    const microcompactResult = await microcompactMessages(messages, context);
    const messagesForCompact = microcompactResult.messages;
    const result = await compactConversation(messagesForCompact, context, await getCacheSharingParams(context, messagesForCompact), false, customInstructions, false);
    setLastSummarizedMessageId(undefined);
    suppressCompactWarning();
    getUserContext.cache.clear?.();
    runPostCompactCleanup();
    return {
      type: "compact",
      compactionResult: result,
      displayText: buildDisplayText(context, result.userDisplayMessage)
    };
  } catch (error) {
    if (abortController.signal.aborted) {
      throw new Error("Compaction canceled.");
    } else if (hasExactErrorMessage(error, ERROR_MESSAGE_NOT_ENOUGH_MESSAGES)) {
      throw new Error(ERROR_MESSAGE_NOT_ENOUGH_MESSAGES);
    } else if (hasExactErrorMessage(error, ERROR_MESSAGE_INCOMPLETE_RESPONSE)) {
      throw new Error(ERROR_MESSAGE_INCOMPLETE_RESPONSE);
    } else {
      logError(error);
      throw new Error(`Error during compaction: ${error}`);
    }
  }
};
var init_compact2 = __esm(() => {
  init_source();
  init_state();
  init_prompts();
  init_context();
  init_shortcutFormat();
  init_promptCacheBreakDetection();
  init_compact();
  init_compactWarningState();
  init_microCompact();
  init_postCompactCleanup();
  init_sessionMemoryCompact();
  init_sessionMemoryUtils();
  init_errors();
  init_hooks();
  init_log();
  init_messages();
  init_contextWindowUpgradeCheck();
  init_systemPrompt();
});
init_compact2();

export {
  call
};
