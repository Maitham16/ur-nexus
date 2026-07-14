import {
  init_mappers,
  localCommandOutputToSDKAssistantMessage,
  toSDKCompactMetadata
} from "./index-42rf7s5m.js";
import {
  backgroundDir,
  init_backgroundRunner,
  listBackgroundTasks,
  startBackgroundTask
} from "./index-zxm9dac1.js";
import"./index-kw2wxbby.js";
import"./index-fayv8cwb.js";
import"./index-j4g1j45r.js";
import"./index-qg6cjfb3.js";
import"./index-5jrgxedg.js";
import"./index-hp4vvv8v.js";
import"./index-zn5x3nwj.js";
import {
  init_slashCommandParsing,
  parseSlashCommand
} from "./index-x50xy1hv.js";
import {
  DANGEROUS_DIRECTORIES,
  DANGEROUS_FILES,
  DEFAULT_OUTPUT_STYLE_NAME,
  EMPTY_USAGE,
  SYNTHETIC_MESSAGES,
  SYNTHETIC_OUTPUT_TOOL_NAME,
  Select,
  Spinner,
  Verifier,
  WebSocketTransport,
  accumulateUsage,
  asSystemPrompt,
  categorizeRetryableAPIError,
  checkPathSafetyForAutoEdit,
  countToolCalls,
  createAbortController,
  createAttachmentMessage,
  createCommandInputMessage,
  createImageMetadataText,
  createPermissionRequestMessage,
  createStore,
  createSystemMessage,
  createUserMessage,
  executeUserPromptSubmitHooks,
  extractTag,
  fetchToolsForClient,
  fileHistoryCanRestore,
  fileHistoryEnabled,
  fileHistoryGetDiffStats,
  fileHistoryMakeSnapshot,
  findCommand,
  flushSessionStorage,
  getAllBaseTools,
  getAllMcpConfigs,
  getAllowRules,
  getAskRules,
  getAttachmentMessages,
  getCommandName,
  getCommands,
  getContentText,
  getDefaultAppState,
  getDenyRules,
  getEmptyToolPermissionContext,
  getHistory,
  getRuleByContentsForToolName,
  getScratchpadDir,
  getSlashCommandToolSkills,
  getSystemContext,
  getSystemPrompt,
  getTimestampedHistory,
  getToolsForDefaultPreset,
  getUserContext,
  getUserPromptSubmitHookBlockingMessage,
  handleOrphanedPermission,
  hasPermissionsToUseTool,
  headlessProfilerCheckpoint,
  init_AppState,
  init_AppStateStore,
  init_Shell,
  init_Spinner,
  init_SyntheticOutputTool,
  init_Tool,
  init_abortController,
  init_attachments,
  init_client,
  init_commands1 as init_commands,
  init_config as init_config2,
  init_context,
  init_cost_tracker,
  init_errors,
  init_events,
  init_fileHistory,
  init_filesystem,
  init_generators,
  init_headlessProfiler,
  init_history,
  init_hookHelpers,
  init_hooks,
  init_imageResizer,
  init_imageStore,
  init_last,
  init_logging,
  init_mcpWebSocketTransport,
  init_memdir,
  init_messages1 as init_messages,
  init_outputStyles,
  init_permissionLogging,
  init_permissions,
  init_pluginLoader,
  init_prompts,
  init_query,
  init_queryHelpers,
  init_queryProfiler,
  init_select,
  init_sessionStorage,
  init_sessionTracing,
  init_shouldUseSandbox,
  init_store,
  init_systemPromptType,
  init_textInputTypes,
  init_thinking,
  init_tools1 as init_tools,
  init_ur,
  init_verifier,
  isBridgeSafeCommand,
  isEmptyMessageText,
  isMcpServerDisabled,
  isResultSuccessful,
  isScratchpadEnabled,
  isSyntheticMessage,
  isToolUseResultMessage,
  isValidImagePaste,
  last_default,
  loadAllPluginsCacheOnly,
  loadMemoryPrompt,
  logOTelEvent,
  logPermissionDecision,
  makeHistoryReader,
  maybeResizeAndDownsampleImageBlock,
  normalizeMessage,
  normalizeMessagesForAPI,
  parseToolPreset,
  pathInWorkingPath,
  query,
  queryCheckpoint,
  recordTranscript,
  redactIfDisabled,
  registerStructuredOutputEnforcement,
  setCwd,
  shouldEnableThinkingByDefault,
  shouldUseSandbox,
  startInteractionSpan,
  storeImages,
  toArray,
  toolMatchesName,
  updateUsage,
  useAppState
} from "./index-7fe5jn6w.js";
import {
  cloneFileStateCache,
  createFileStateCacheWithSizeLimit,
  init_fileStateCache
} from "./index-kkermbsd.js";
import {
  Divider,
  init_Divider,
  init_useExitOnCtrlCDWithKeybindings,
  init_useKeybinding,
  init_useTerminalSize,
  useExitOnCtrlCDWithKeybindings,
  useKeybinding,
  useKeybindings,
  useTerminalSize
} from "./index-gph76kef.js";
import"./index-2j7c2ame.js";
import {
  ThemedBox_default,
  ThemedText,
  init_ink,
  init_systemTheme,
  require_compiler_runtime,
  resolveThemeSetting
} from "./index-61fyyngt.js";
import"./index-6hrfermc.js";
import"./index-r9gwtga0.js";
import"./index-s87snjmt.js";
import"./index-6ykfn1n2.js";
import"./index-e7z6rkgj.js";
import"./index-e7zhbfbk.js";
import {
  DEFAULT_PROJECT_SAFETY_POLICY,
  approvalLevelForEvaluation,
  evaluateShellSafetyPolicy,
  formatShellSafetyEvaluation,
  init_projectSafety,
  loadProjectSafetyPolicy,
  pathIsInsideWorkspace,
  writeProjectSafetyPolicy
} from "./index-gkqe0rrq.js";
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
  AGENT_TOOL_NAME,
  DEFAULT_PROVIDER_ID,
  EXTERNAL_PERMISSION_MODES,
  LEGACY_AGENT_TOOL_NAME,
  PERMISSION_MODES,
  PROVIDER_IDS,
  clearProviderApiKey,
  enableConfigs,
  formatRelativeTimeAgo,
  getActiveProviderSettings,
  getFastModeState,
  getGlobalConfig,
  getInitialSettings,
  getMainLoopModel,
  getProviderApiKey,
  getProviderApiKeySource,
  getProviderDefinition as getProviderDefinition2,
  getProviderFamily,
  getProviderRuntimeInfo,
  getProviderStatus,
  getSettings_DEPRECATED,
  getURHQApiKeyWithSource,
  hasAutoMemPathOverride,
  init_PermissionMode,
  init_auth,
  init_config,
  init_constants1 as init_constants,
  init_fastMode,
  init_format,
  init_model,
  init_paths,
  init_providerCredentials,
  init_providerRegistry,
  init_settings1 as init_settings,
  init_strip_ansi,
  isExternalPermissionMode,
  listModelsForProviderWithSource,
  listProviders,
  parseUserSpecifiedModel,
  setProviderApiKey,
  setProviderModel,
  setSafeProviderConfig,
  stripAnsi,
  truncate,
  updateSettingsForSource
} from "./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import {
  count,
  init_array
} from "./index-z5aeypvg.js";
import {
  init_analytics,
  logEvent
} from "./index-5jmh1e0k.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-wxsgjqjk.js";
import {
  findCanonicalGitRoot,
  findGitRoot,
  init_git
} from "./index-s1a1wahe.js";
import"./index-wred0kdg.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import {
  BASH_STDERR_TAG,
  BASH_STDOUT_TAG,
  COMMAND_MESSAGE_TAG,
  LOCAL_COMMAND_STDERR_TAG,
  LOCAL_COMMAND_STDOUT_TAG,
  TASK_NOTIFICATION_TAG,
  TEAMMATE_MESSAGE_TAG,
  TICK_TAG,
  getInMemoryErrors,
  init_displayTags,
  init_log,
  init_xml,
  logError,
  stripDisplayTags
} from "./index-4bphgmcc.js";
import"./index-7bd814mt.js";
import {
  figures_default,
  init_figures
} from "./index-m9qhxms7.js";
import {
  init_envUtils,
  isBareMode,
  isEnvTruthy
} from "./index-5h7w9qkc.js";
import {
  getModelUsage,
  getProjectRoot,
  getSdkBetas,
  getSessionId,
  getTotalAPIDuration,
  getTotalCostUSD,
  init_state,
  isSessionPersistenceDisabled,
  setCwdState,
  setPromptId
} from "./index-nhjg91p1.js";
import {
  __esm,
  __export,
  __require,
  __toCommonJS,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/components/MessageSelector.tsx
var exports_MessageSelector = {};
__export(exports_MessageSelector, {
  selectableUserMessagesFilter: () => selectableUserMessagesFilter,
  messagesAfterAreOnlySynthetic: () => messagesAfterAreOnlySynthetic,
  MessageSelector: () => MessageSelector
});
import { randomUUID as randomUUID4 } from "crypto";
import * as path from "path";
function isTextBlock(block) {
  return block.type === "text";
}
function isSummarizeOption(option) {
  return option === "summarize" || option === "summarize_up_to";
}
function MessageSelector({
  messages,
  onPreRestore,
  onRestoreMessage,
  onRestoreCode,
  onSummarize,
  onClose,
  preselectedMessage
}) {
  const fileHistory = useAppState((s) => s.fileHistory);
  const [error, setError] = import_react.useState(undefined);
  const isFileHistoryEnabled = fileHistoryEnabled();
  const currentUUID = import_react.useMemo(randomUUID4, []);
  const messageOptions = import_react.useMemo(() => [...messages.filter(selectableUserMessagesFilter), {
    ...createUserMessage({
      content: ""
    }),
    uuid: currentUUID
  }], [messages, currentUUID]);
  const [selectedIndex, setSelectedIndex] = import_react.useState(messageOptions.length - 1);
  const firstVisibleIndex = Math.max(0, Math.min(selectedIndex - Math.floor(MAX_VISIBLE_MESSAGES / 2), messageOptions.length - MAX_VISIBLE_MESSAGES));
  const hasMessagesToSelect = messageOptions.length > 1;
  const [messageToRestore, setMessageToRestore] = import_react.useState(preselectedMessage);
  const [diffStatsForRestore, setDiffStatsForRestore] = import_react.useState(undefined);
  import_react.useEffect(() => {
    if (!preselectedMessage || !isFileHistoryEnabled)
      return;
    let cancelled = false;
    fileHistoryGetDiffStats(fileHistory, preselectedMessage.uuid).then((stats) => {
      if (!cancelled)
        setDiffStatsForRestore(stats);
    });
    return () => {
      cancelled = true;
    };
  }, [preselectedMessage, isFileHistoryEnabled, fileHistory]);
  const [isRestoring, setIsRestoring] = import_react.useState(false);
  const [restoringOption, setRestoringOption] = import_react.useState(null);
  const [selectedRestoreOption, setSelectedRestoreOption] = import_react.useState("both");
  const [summarizeFromFeedback, setSummarizeFromFeedback] = import_react.useState("");
  const [summarizeUpToFeedback, setSummarizeUpToFeedback] = import_react.useState("");
  function getRestoreOptions(canRestoreCode) {
    const baseOptions = canRestoreCode ? [{
      value: "both",
      label: "Restore code and conversation"
    }, {
      value: "conversation",
      label: "Restore conversation"
    }, {
      value: "code",
      label: "Restore code"
    }] : [{
      value: "conversation",
      label: "Restore conversation"
    }];
    const summarizeInputProps = {
      type: "input",
      placeholder: "add context (optional)",
      initialValue: "",
      allowEmptySubmitToCancel: true,
      showLabelWithValue: true,
      labelValueSeparator: ": "
    };
    baseOptions.push({
      value: "summarize",
      label: "Summarize from here",
      ...summarizeInputProps,
      onChange: setSummarizeFromFeedback
    });
    if (false) {}
    baseOptions.push({
      value: "nevermind",
      label: "Never mind"
    });
    return baseOptions;
  }
  import_react.useEffect(() => {
    logEvent("tengu_message_selector_opened", {});
  }, []);
  async function restoreConversationDirectly(message) {
    onPreRestore();
    setIsRestoring(true);
    try {
      await onRestoreMessage(message);
      setIsRestoring(false);
      onClose();
    } catch (error_0) {
      logError(error_0);
      setIsRestoring(false);
      setError(`Failed to restore the conversation:
${error_0}`);
    }
  }
  async function handleSelect(message_0) {
    const index = messages.indexOf(message_0);
    const indexFromEnd = messages.length - 1 - index;
    logEvent("tengu_message_selector_selected", {
      index_from_end: indexFromEnd,
      message_type: message_0.type,
      is_current_prompt: false
    });
    if (!messages.includes(message_0)) {
      onClose();
      return;
    }
    if (!isFileHistoryEnabled) {
      await restoreConversationDirectly(message_0);
      return;
    }
    const diffStats = await fileHistoryGetDiffStats(fileHistory, message_0.uuid);
    setMessageToRestore(message_0);
    setDiffStatsForRestore(diffStats);
  }
  async function onSelectRestoreOption(option) {
    logEvent("tengu_message_selector_restore_option_selected", {
      option
    });
    if (!messageToRestore) {
      setError("Message not found.");
      return;
    }
    if (option === "nevermind") {
      if (preselectedMessage)
        onClose();
      else
        setMessageToRestore(undefined);
      return;
    }
    if (isSummarizeOption(option)) {
      onPreRestore();
      setIsRestoring(true);
      setRestoringOption(option);
      setError(undefined);
      try {
        const direction = option === "summarize_up_to" ? "up_to" : "from";
        const feedback = (direction === "up_to" ? summarizeUpToFeedback : summarizeFromFeedback).trim() || undefined;
        await onSummarize(messageToRestore, feedback, direction);
        setIsRestoring(false);
        setRestoringOption(null);
        setMessageToRestore(undefined);
        onClose();
      } catch (error_1) {
        logError(error_1);
        setIsRestoring(false);
        setRestoringOption(null);
        setMessageToRestore(undefined);
        setError(`Failed to summarize:
${error_1}`);
      }
      return;
    }
    onPreRestore();
    setIsRestoring(true);
    setError(undefined);
    let codeError = null;
    let conversationError = null;
    if (option === "code" || option === "both") {
      try {
        await onRestoreCode(messageToRestore);
      } catch (error_2) {
        codeError = error_2;
        logError(codeError);
      }
    }
    if (option === "conversation" || option === "both") {
      try {
        await onRestoreMessage(messageToRestore);
      } catch (error_3) {
        conversationError = error_3;
        logError(conversationError);
      }
    }
    setIsRestoring(false);
    setMessageToRestore(undefined);
    if (conversationError && codeError) {
      setError(`Failed to restore the conversation and code:
${conversationError}
${codeError}`);
    } else if (conversationError) {
      setError(`Failed to restore the conversation:
${conversationError}`);
    } else if (codeError) {
      setError(`Failed to restore the code:
${codeError}`);
    } else {
      onClose();
    }
  }
  const exitState = useExitOnCtrlCDWithKeybindings();
  const handleEscape = import_react.useCallback(() => {
    if (messageToRestore && !preselectedMessage) {
      setMessageToRestore(undefined);
      return;
    }
    logEvent("tengu_message_selector_cancelled", {});
    onClose();
  }, [onClose, messageToRestore, preselectedMessage]);
  const moveUp = import_react.useCallback(() => setSelectedIndex((prev) => Math.max(0, prev - 1)), []);
  const moveDown = import_react.useCallback(() => setSelectedIndex((prev_0) => Math.min(messageOptions.length - 1, prev_0 + 1)), [messageOptions.length]);
  const jumpToTop = import_react.useCallback(() => setSelectedIndex(0), []);
  const jumpToBottom = import_react.useCallback(() => setSelectedIndex(messageOptions.length - 1), [messageOptions.length]);
  const handleSelectCurrent = import_react.useCallback(() => {
    const selected = messageOptions[selectedIndex];
    if (selected) {
      handleSelect(selected);
    }
  }, [messageOptions, selectedIndex, handleSelect]);
  useKeybinding("confirm:no", handleEscape, {
    context: "Confirmation",
    isActive: !messageToRestore
  });
  useKeybindings({
    "messageSelector:up": moveUp,
    "messageSelector:down": moveDown,
    "messageSelector:top": jumpToTop,
    "messageSelector:bottom": jumpToBottom,
    "messageSelector:select": handleSelectCurrent
  }, {
    context: "MessageSelector",
    isActive: !isRestoring && !error && !messageToRestore && hasMessagesToSelect
  });
  const [fileHistoryMetadata, setFileHistoryMetadata] = import_react.useState({});
  import_react.useEffect(() => {
    async function loadFileHistoryMetadata() {
      if (!isFileHistoryEnabled) {
        return;
      }
      Promise.all(messageOptions.map(async (userMessage, itemIndex) => {
        if (userMessage.uuid !== currentUUID) {
          const canRestore = fileHistoryCanRestore(fileHistory, userMessage.uuid);
          const nextUserMessage = messageOptions.at(itemIndex + 1);
          const diffStats_0 = canRestore ? computeDiffStatsBetweenMessages(messages, userMessage.uuid, nextUserMessage?.uuid !== currentUUID ? nextUserMessage?.uuid : undefined) : undefined;
          if (diffStats_0 !== undefined) {
            setFileHistoryMetadata((prev_1) => ({
              ...prev_1,
              [itemIndex]: diffStats_0
            }));
          } else {
            setFileHistoryMetadata((prev_2) => ({
              ...prev_2,
              [itemIndex]: undefined
            }));
          }
        }
      }));
    }
    loadFileHistoryMetadata();
  }, [messageOptions, messages, currentUUID, fileHistory, isFileHistoryEnabled]);
  const canRestoreCode_0 = isFileHistoryEnabled && diffStatsForRestore?.filesChanged && diffStatsForRestore.filesChanged.length > 0;
  const showPickList = !error && !messageToRestore && !preselectedMessage && hasMessagesToSelect;
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
    flexDirection: "column",
    width: "100%",
    children: [
      /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Divider, {
        color: "suggestion"
      }, undefined, false, undefined, this),
      /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
        flexDirection: "column",
        marginX: 1,
        gap: 1,
        children: [
          /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
            bold: true,
            color: "suggestion",
            children: "Rewind"
          }, undefined, false, undefined, this),
          error && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
            children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              color: "error",
              children: [
                "Error: ",
                error
              ]
            }, undefined, true, undefined, this)
          }, undefined, false, undefined, this),
          !hasMessagesToSelect && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
            children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              children: "Nothing to rewind to yet."
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this),
          !error && messageToRestore && hasMessagesToSelect && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
            children: [
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                children: [
                  "Confirm you want to restore",
                  " ",
                  !diffStatsForRestore && "the conversation ",
                  "to the point before you sent this message:"
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                flexDirection: "column",
                paddingLeft: 1,
                borderStyle: "single",
                borderRight: false,
                borderTop: false,
                borderBottom: false,
                borderLeft: true,
                borderLeftDimColor: true,
                children: [
                  /* @__PURE__ */ jsx_dev_runtime.jsxDEV(UserMessageOption, {
                    userMessage: messageToRestore,
                    color: "text",
                    isCurrent: false
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                    dimColor: true,
                    children: [
                      "(",
                      formatRelativeTimeAgo(new Date(messageToRestore.timestamp)),
                      ")"
                    ]
                  }, undefined, true, undefined, this)
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(RestoreOptionDescription, {
                selectedRestoreOption,
                canRestoreCode: !!canRestoreCode_0,
                diffStatsForRestore
              }, undefined, false, undefined, this),
              isRestoring && isSummarizeOption(restoringOption) ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                flexDirection: "row",
                gap: 1,
                children: [
                  /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Spinner, {}, undefined, false, undefined, this),
                  /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                    children: "Summarizing…"
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Select, {
                isDisabled: isRestoring,
                options: getRestoreOptions(!!canRestoreCode_0),
                defaultFocusValue: canRestoreCode_0 ? "both" : "conversation",
                onFocus: (value) => setSelectedRestoreOption(value),
                onChange: (value_0) => onSelectRestoreOption(value_0),
                onCancel: () => preselectedMessage ? onClose() : setMessageToRestore(undefined)
              }, undefined, false, undefined, this),
              canRestoreCode_0 && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                marginBottom: 1,
                children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                  dimColor: true,
                  children: [
                    figures_default.warning,
                    " Rewinding does not affect files edited manually or via bash."
                  ]
                }, undefined, true, undefined, this)
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this),
          showPickList && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
            children: [
              isFileHistoryEnabled ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                children: "Restore the code and/or conversation to the point before…"
              }, undefined, false, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                children: "Restore and fork the conversation to the point before…"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                width: "100%",
                flexDirection: "column",
                children: messageOptions.slice(firstVisibleIndex, firstVisibleIndex + MAX_VISIBLE_MESSAGES).map((msg, visibleOptionIndex) => {
                  const optionIndex = firstVisibleIndex + visibleOptionIndex;
                  const isSelected = optionIndex === selectedIndex;
                  const isCurrent = msg.uuid === currentUUID;
                  const metadataLoaded = optionIndex in fileHistoryMetadata;
                  const metadata = fileHistoryMetadata[optionIndex];
                  const numFilesChanged = metadata?.filesChanged && metadata.filesChanged.length;
                  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                    height: isFileHistoryEnabled ? 3 : 2,
                    overflow: "hidden",
                    width: "100%",
                    flexDirection: "row",
                    children: [
                      /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                        width: 2,
                        minWidth: 2,
                        children: isSelected ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                          color: "permission",
                          bold: true,
                          children: [
                            figures_default.pointer,
                            " "
                          ]
                        }, undefined, true, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                          children: "  "
                        }, undefined, false, undefined, this)
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                        flexDirection: "column",
                        children: [
                          /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                            flexShrink: 1,
                            height: 1,
                            overflow: "hidden",
                            children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(UserMessageOption, {
                              userMessage: msg,
                              color: isSelected ? "suggestion" : undefined,
                              isCurrent,
                              paddingRight: 10
                            }, undefined, false, undefined, this)
                          }, undefined, false, undefined, this),
                          isFileHistoryEnabled && metadataLoaded && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                            height: 1,
                            flexDirection: "row",
                            children: metadata ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
                              children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                                dimColor: !isSelected,
                                color: "inactive",
                                children: numFilesChanged ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
                                  children: [
                                    numFilesChanged === 1 && metadata.filesChanged[0] ? `${path.basename(metadata.filesChanged[0])} ` : `${numFilesChanged} files changed `,
                                    /* @__PURE__ */ jsx_dev_runtime.jsxDEV(DiffStatsText, {
                                      diffStats: metadata
                                    }, undefined, false, undefined, this)
                                  ]
                                }, undefined, true, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
                                  children: "No code changes"
                                }, undefined, false, undefined, this)
                              }, undefined, false, undefined, this)
                            }, undefined, false, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                              dimColor: true,
                              color: "warning",
                              children: [
                                figures_default.warning,
                                " No code restore"
                              ]
                            }, undefined, true, undefined, this)
                          }, undefined, false, undefined, this)
                        ]
                      }, undefined, true, undefined, this)
                    ]
                  }, msg.uuid, true, undefined, this);
                })
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this),
          !messageToRestore && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
            dimColor: true,
            italic: true,
            children: exitState.pending ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
              children: [
                "Press ",
                exitState.keyName,
                " again to exit"
              ]
            }, undefined, true, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
              children: [
                !error && hasMessagesToSelect && "Enter to continue · ",
                "Esc to exit"
              ]
            }, undefined, true, undefined, this)
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this)
    ]
  }, undefined, true, undefined, this);
}
function getRestoreOptionConversationText(option) {
  switch (option) {
    case "summarize":
      return "Messages after this point will be summarized.";
    case "summarize_up_to":
      return "Preceding messages will be summarized. This and subsequent messages will remain unchanged — you will stay at the end of the conversation.";
    case "both":
    case "conversation":
      return "The conversation will be forked.";
    case "code":
    case "nevermind":
      return "The conversation will be unchanged.";
  }
}
function RestoreOptionDescription(t0) {
  const $ = import_compiler_runtime.c(11);
  const {
    selectedRestoreOption,
    canRestoreCode,
    diffStatsForRestore
  } = t0;
  const showCodeRestore = canRestoreCode && (selectedRestoreOption === "both" || selectedRestoreOption === "code");
  let t1;
  if ($[0] !== selectedRestoreOption) {
    t1 = getRestoreOptionConversationText(selectedRestoreOption);
    $[0] = selectedRestoreOption;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] !== t1) {
    t2 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      dimColor: true,
      children: t1
    }, undefined, false, undefined, this);
    $[2] = t1;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  let t3;
  if ($[4] !== diffStatsForRestore || $[5] !== selectedRestoreOption || $[6] !== showCodeRestore) {
    t3 = !isSummarizeOption(selectedRestoreOption) && (showCodeRestore ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(RestoreCodeConfirmation, {
      diffStatsForRestore
    }, undefined, false, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      dimColor: true,
      children: "The code will be unchanged."
    }, undefined, false, undefined, this));
    $[4] = diffStatsForRestore;
    $[5] = selectedRestoreOption;
    $[6] = showCodeRestore;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  let t4;
  if ($[8] !== t2 || $[9] !== t3) {
    t4 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      children: [
        t2,
        t3
      ]
    }, undefined, true, undefined, this);
    $[8] = t2;
    $[9] = t3;
    $[10] = t4;
  } else {
    t4 = $[10];
  }
  return t4;
}
function RestoreCodeConfirmation(t0) {
  const $ = import_compiler_runtime.c(14);
  const {
    diffStatsForRestore
  } = t0;
  if (diffStatsForRestore === undefined) {
    return;
  }
  if (!diffStatsForRestore.filesChanged || !diffStatsForRestore.filesChanged[0]) {
    let t12;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
      t12 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        dimColor: true,
        children: "The code has not changed (nothing will be restored)."
      }, undefined, false, undefined, this);
      $[0] = t12;
    } else {
      t12 = $[0];
    }
    return t12;
  }
  const numFilesChanged = diffStatsForRestore.filesChanged.length;
  let fileLabel;
  if (numFilesChanged === 1) {
    let t12;
    if ($[1] !== diffStatsForRestore.filesChanged[0]) {
      t12 = path.basename(diffStatsForRestore.filesChanged[0] || "");
      $[1] = diffStatsForRestore.filesChanged[0];
      $[2] = t12;
    } else {
      t12 = $[2];
    }
    fileLabel = t12;
  } else {
    if (numFilesChanged === 2) {
      let t12;
      if ($[3] !== diffStatsForRestore.filesChanged[0]) {
        t12 = path.basename(diffStatsForRestore.filesChanged[0] || "");
        $[3] = diffStatsForRestore.filesChanged[0];
        $[4] = t12;
      } else {
        t12 = $[4];
      }
      const file1 = t12;
      let t22;
      if ($[5] !== diffStatsForRestore.filesChanged[1]) {
        t22 = path.basename(diffStatsForRestore.filesChanged[1] || "");
        $[5] = diffStatsForRestore.filesChanged[1];
        $[6] = t22;
      } else {
        t22 = $[6];
      }
      const file2 = t22;
      fileLabel = `${file1} and ${file2}`;
    } else {
      let t12;
      if ($[7] !== diffStatsForRestore.filesChanged[0]) {
        t12 = path.basename(diffStatsForRestore.filesChanged[0] || "");
        $[7] = diffStatsForRestore.filesChanged[0];
        $[8] = t12;
      } else {
        t12 = $[8];
      }
      const file1_0 = t12;
      fileLabel = `${file1_0} and ${diffStatsForRestore.filesChanged.length - 1} other files`;
    }
  }
  let t1;
  if ($[9] !== diffStatsForRestore) {
    t1 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(DiffStatsText, {
      diffStats: diffStatsForRestore
    }, undefined, false, undefined, this);
    $[9] = diffStatsForRestore;
    $[10] = t1;
  } else {
    t1 = $[10];
  }
  let t2;
  if ($[11] !== fileLabel || $[12] !== t1) {
    t2 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
      children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        dimColor: true,
        children: [
          "The code will be restored",
          " ",
          t1,
          " in ",
          fileLabel,
          "."
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[11] = fileLabel;
    $[12] = t1;
    $[13] = t2;
  } else {
    t2 = $[13];
  }
  return t2;
}
function DiffStatsText(t0) {
  const $ = import_compiler_runtime.c(7);
  const {
    diffStats
  } = t0;
  if (!diffStats || !diffStats.filesChanged) {
    return;
  }
  let t1;
  if ($[0] !== diffStats.insertions) {
    t1 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      color: "diffAddedWord",
      children: [
        "+",
        diffStats.insertions,
        " "
      ]
    }, undefined, true, undefined, this);
    $[0] = diffStats.insertions;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  let t2;
  if ($[2] !== diffStats.deletions) {
    t2 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      color: "diffRemovedWord",
      children: [
        "-",
        diffStats.deletions
      ]
    }, undefined, true, undefined, this);
    $[2] = diffStats.deletions;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  let t3;
  if ($[4] !== t1 || $[5] !== t2) {
    t3 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
      children: [
        t1,
        t2
      ]
    }, undefined, true, undefined, this);
    $[4] = t1;
    $[5] = t2;
    $[6] = t3;
  } else {
    t3 = $[6];
  }
  return t3;
}
function UserMessageOption(t0) {
  const $ = import_compiler_runtime.c(31);
  const {
    userMessage,
    color,
    dimColor,
    isCurrent,
    paddingRight
  } = t0;
  const {
    columns
  } = useTerminalSize();
  if (isCurrent) {
    let t12;
    if ($[0] !== color || $[1] !== dimColor) {
      t12 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
        width: "100%",
        children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          italic: true,
          color,
          dimColor,
          children: "(current)"
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this);
      $[0] = color;
      $[1] = dimColor;
      $[2] = t12;
    } else {
      t12 = $[2];
    }
    return t12;
  }
  const content = userMessage.message.content;
  const lastBlock = typeof content === "string" ? null : content[content.length - 1];
  let T0;
  let T1;
  let t1;
  let t2;
  let t3;
  let t4;
  let t5;
  let t6;
  if ($[3] !== color || $[4] !== columns || $[5] !== content || $[6] !== dimColor || $[7] !== lastBlock || $[8] !== paddingRight) {
    t6 = Symbol.for("react.early_return_sentinel");
    bb0: {
      const rawMessageText = typeof content === "string" ? content.trim() : lastBlock && isTextBlock(lastBlock) ? lastBlock.text.trim() : "(no prompt)";
      const messageText = stripDisplayTags(rawMessageText);
      if (isEmptyMessageText(messageText)) {
        let t72;
        if ($[17] !== color || $[18] !== dimColor) {
          t72 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
            flexDirection: "row",
            width: "100%",
            children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              italic: true,
              color,
              dimColor,
              children: "((empty message))"
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this);
          $[17] = color;
          $[18] = dimColor;
          $[19] = t72;
        } else {
          t72 = $[19];
        }
        t6 = t72;
        break bb0;
      }
      if (messageText.includes("<bash-input>")) {
        const input = extractTag(messageText, "bash-input");
        if (input) {
          let t72;
          if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
            t72 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              color: "bashBorder",
              children: "!"
            }, undefined, false, undefined, this);
            $[20] = t72;
          } else {
            t72 = $[20];
          }
          t6 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
            flexDirection: "row",
            width: "100%",
            children: [
              t72,
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                color,
                dimColor,
                children: [
                  " ",
                  input
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this);
          break bb0;
        }
      }
      if (messageText.includes(`<${COMMAND_MESSAGE_TAG}>`)) {
        const commandMessage = extractTag(messageText, COMMAND_MESSAGE_TAG);
        const args = extractTag(messageText, "command-args");
        const isSkillFormat = extractTag(messageText, "skill-format") === "true";
        if (commandMessage) {
          if (isSkillFormat) {
            t6 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
              flexDirection: "row",
              width: "100%",
              children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                color,
                dimColor,
                children: [
                  "Skill(",
                  commandMessage,
                  ")"
                ]
              }, undefined, true, undefined, this)
            }, undefined, false, undefined, this);
            break bb0;
          } else {
            t6 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
              flexDirection: "row",
              width: "100%",
              children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                color,
                dimColor,
                children: [
                  "/",
                  commandMessage,
                  " ",
                  args
                ]
              }, undefined, true, undefined, this)
            }, undefined, false, undefined, this);
            break bb0;
          }
        }
      }
      T1 = ThemedBox_default;
      t4 = "row";
      t5 = "100%";
      T0 = ThemedText;
      t1 = color;
      t2 = dimColor;
      t3 = paddingRight ? truncate(messageText, columns - paddingRight, true) : messageText.slice(0, 500).split(`
`).slice(0, 4).join(`
`);
    }
    $[3] = color;
    $[4] = columns;
    $[5] = content;
    $[6] = dimColor;
    $[7] = lastBlock;
    $[8] = paddingRight;
    $[9] = T0;
    $[10] = T1;
    $[11] = t1;
    $[12] = t2;
    $[13] = t3;
    $[14] = t4;
    $[15] = t5;
    $[16] = t6;
  } else {
    T0 = $[9];
    T1 = $[10];
    t1 = $[11];
    t2 = $[12];
    t3 = $[13];
    t4 = $[14];
    t5 = $[15];
    t6 = $[16];
  }
  if (t6 !== Symbol.for("react.early_return_sentinel")) {
    return t6;
  }
  let t7;
  if ($[21] !== T0 || $[22] !== t1 || $[23] !== t2 || $[24] !== t3) {
    t7 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(T0, {
      color: t1,
      dimColor: t2,
      children: t3
    }, undefined, false, undefined, this);
    $[21] = T0;
    $[22] = t1;
    $[23] = t2;
    $[24] = t3;
    $[25] = t7;
  } else {
    t7 = $[25];
  }
  let t8;
  if ($[26] !== T1 || $[27] !== t4 || $[28] !== t5 || $[29] !== t7) {
    t8 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(T1, {
      flexDirection: t4,
      width: t5,
      children: t7
    }, undefined, false, undefined, this);
    $[26] = T1;
    $[27] = t4;
    $[28] = t5;
    $[29] = t7;
    $[30] = t8;
  } else {
    t8 = $[30];
  }
  return t8;
}
function computeDiffStatsBetweenMessages(messages, fromMessageId, toMessageId) {
  const startIndex = messages.findIndex((msg) => msg.uuid === fromMessageId);
  if (startIndex === -1) {
    return;
  }
  let endIndex = toMessageId ? messages.findIndex((msg) => msg.uuid === toMessageId) : messages.length;
  if (endIndex === -1) {
    endIndex = messages.length;
  }
  const filesChanged = [];
  let insertions = 0;
  let deletions = 0;
  for (let i = startIndex + 1;i < endIndex; i++) {
    const msg = messages[i];
    if (!msg || !isToolUseResultMessage(msg)) {
      continue;
    }
    const result = msg.toolUseResult;
    if (!result || !result.filePath || !result.structuredPatch) {
      continue;
    }
    if (!filesChanged.includes(result.filePath)) {
      filesChanged.push(result.filePath);
    }
    try {
      if ("type" in result && result.type === "create") {
        insertions += result.content.split(/\r?\n/).length;
      } else {
        for (const hunk of result.structuredPatch) {
          const additions = count(hunk.lines, (line) => line.startsWith("+"));
          const removals = count(hunk.lines, (line) => line.startsWith("-"));
          insertions += additions;
          deletions += removals;
        }
      }
    } catch {
      continue;
    }
  }
  return {
    filesChanged,
    insertions,
    deletions
  };
}
function selectableUserMessagesFilter(message) {
  if (message.type !== "user") {
    return false;
  }
  if (Array.isArray(message.message.content) && message.message.content[0]?.type === "tool_result") {
    return false;
  }
  if (isSyntheticMessage(message)) {
    return false;
  }
  if (message.isMeta) {
    return false;
  }
  if (message.isCompactSummary || message.isVisibleInTranscriptOnly) {
    return false;
  }
  const content = message.message.content;
  const lastBlock = typeof content === "string" ? null : content[content.length - 1];
  const messageText = typeof content === "string" ? content.trim() : lastBlock && isTextBlock(lastBlock) ? lastBlock.text.trim() : "";
  if (messageText.indexOf(`<${LOCAL_COMMAND_STDOUT_TAG}>`) !== -1 || messageText.indexOf(`<${LOCAL_COMMAND_STDERR_TAG}>`) !== -1 || messageText.indexOf(`<${BASH_STDOUT_TAG}>`) !== -1 || messageText.indexOf(`<${BASH_STDERR_TAG}>`) !== -1 || messageText.indexOf(`<${TASK_NOTIFICATION_TAG}>`) !== -1 || messageText.indexOf(`<${TICK_TAG}>`) !== -1 || messageText.indexOf(`<${TEAMMATE_MESSAGE_TAG}`) !== -1) {
    return false;
  }
  return true;
}
function messagesAfterAreOnlySynthetic(messages, fromIndex) {
  for (let i = fromIndex + 1;i < messages.length; i++) {
    const msg = messages[i];
    if (!msg)
      continue;
    if (isSyntheticMessage(msg))
      continue;
    if (isToolUseResultMessage(msg))
      continue;
    if (msg.type === "progress")
      continue;
    if (msg.type === "system")
      continue;
    if (msg.type === "attachment")
      continue;
    if (msg.type === "user" && msg.isMeta)
      continue;
    if (msg.type === "assistant") {
      const content = msg.message.content;
      if (Array.isArray(content)) {
        const hasMeaningfulContent = content.some((block) => block.type === "text" && block.text.trim() || block.type === "tool_use");
        if (hasMeaningfulContent)
          return false;
      }
      continue;
    }
    if (msg.type === "user") {
      return false;
    }
  }
  return true;
}
var import_compiler_runtime, import_react, jsx_dev_runtime, MAX_VISIBLE_MESSAGES = 7;
var init_MessageSelector = __esm(() => {
  init_figures();
  init_analytics();
  init_AppState();
  init_fileHistory();
  init_log();
  init_useExitOnCtrlCDWithKeybindings();
  init_ink();
  init_useKeybinding();
  init_displayTags();
  init_messages();
  init_select();
  init_Spinner();
  init_useTerminalSize();
  init_xml();
  init_array();
  init_format();
  init_Divider();
  import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
  import_react = __toESM(require_react(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});

// src/index.ts
init_commands();

// ../../src/QueryEngine.ts
init_last();
init_state();
init_ur();
init_logging();
init_strip_ansi();
init_commands();
init_xml();
init_cost_tracker();
init_memdir();
init_paths();
init_query();
init_errors();
init_Tool();
init_SyntheticOutputTool();
init_abortController();
init_config();
init_cwd();
init_envUtils();
init_fastMode();
init_fileHistory();
init_fileStateCache();
init_headlessProfiler();
init_hookHelpers();
init_log();
init_messages();
init_model();
init_pluginLoader();
import { randomUUID as randomUUID5 } from "crypto";

// ../../src/utils/processUserInput/processUserInput.ts
init_analytics();
init_messages();
init_commands();
init_textInputTypes();
init_attachments();
init_generators();
init_hooks();
init_imageResizer();
init_imageStore();
init_messages();
init_queryProfiler();
init_slashCommandParsing();
import { randomUUID as randomUUID2 } from "crypto";

// ../../src/utils/processUserInput/processTextPrompt.ts
init_state();
init_analytics();
init_messages();
init_events();
init_sessionTracing();
import { randomUUID } from "crypto";

// ../../src/utils/userPromptKeywords.ts
function matchesNegativeKeyword(input) {
  const lowerInput = input.toLowerCase();
  const negativePattern = /\b(wtf|wth|ffs|omfg|shit(ty|tiest)?|dumbass|horrible|awful|piss(ed|ing)? off|piece of (shit|crap|junk)|what the (fuck|hell)|fucking? (broken|useless|terrible|awful|horrible)|fuck you|screw (this|you)|so frustrating|this sucks|damn it)\b/;
  return negativePattern.test(lowerInput);
}
function matchesKeepGoingKeyword(input) {
  const lowerInput = input.toLowerCase().trim();
  if (lowerInput === "continue") {
    return true;
  }
  const keepGoingPattern = /\b(keep going|go on)\b/;
  return keepGoingPattern.test(lowerInput);
}

// ../../src/utils/processUserInput/processTextPrompt.ts
function processTextPrompt(input, imageContentBlocks, imagePasteIds, attachmentMessages, uuid, permissionMode, isMeta) {
  const promptId = randomUUID();
  setPromptId(promptId);
  const userPromptText = typeof input === "string" ? input : input.find((block) => block.type === "text")?.text || "";
  startInteractionSpan(userPromptText);
  const otelPromptText = typeof input === "string" ? input : input.findLast((block) => block.type === "text")?.text || "";
  if (otelPromptText) {
    logOTelEvent("user_prompt", {
      prompt_length: String(otelPromptText.length),
      prompt: redactIfDisabled(otelPromptText),
      "prompt.id": promptId
    });
  }
  const isNegative = matchesNegativeKeyword(userPromptText);
  const isKeepGoing = matchesKeepGoingKeyword(userPromptText);
  logEvent("tengu_input_prompt", {
    is_negative: isNegative,
    is_keep_going: isKeepGoing
  });
  if (imageContentBlocks.length > 0) {
    const textContent = typeof input === "string" ? input.trim() ? [{ type: "text", text: input }] : [] : input;
    const userMessage2 = createUserMessage({
      content: [...textContent, ...imageContentBlocks],
      uuid,
      imagePasteIds: imagePasteIds.length > 0 ? imagePasteIds : undefined,
      permissionMode,
      isMeta: isMeta || undefined
    });
    return {
      messages: [userMessage2, ...attachmentMessages],
      shouldQuery: true
    };
  }
  const userMessage = createUserMessage({
    content: input,
    uuid,
    permissionMode,
    isMeta: isMeta || undefined
  });
  return {
    messages: [userMessage, ...attachmentMessages],
    shouldQuery: true
  };
}

// ../../src/utils/processUserInput/processUserInput.ts
async function processUserInput({
  input,
  preExpansionInput,
  mode,
  setToolJSX,
  context,
  pastedContents,
  ideSelection,
  messages,
  setUserInputOnProcessing,
  uuid,
  isAlreadyProcessing,
  querySource,
  canUseTool,
  skipSlashCommands,
  bridgeOrigin,
  isMeta,
  skipAttachments
}) {
  const inputString = typeof input === "string" ? input : null;
  if (mode === "prompt" && inputString !== null && !isMeta) {
    setUserInputOnProcessing?.(inputString);
  }
  queryCheckpoint("query_process_user_input_base_start");
  const appState = context.getAppState();
  const result = await processUserInputBase(input, mode, setToolJSX, context, pastedContents, ideSelection, messages, uuid, isAlreadyProcessing, querySource, canUseTool, appState.toolPermissionContext.mode, skipSlashCommands, bridgeOrigin, isMeta, skipAttachments, preExpansionInput);
  queryCheckpoint("query_process_user_input_base_end");
  if (!result.shouldQuery) {
    return result;
  }
  queryCheckpoint("query_hooks_start");
  const inputMessage = getContentText(input) || "";
  for await (const hookResult of executeUserPromptSubmitHooks(inputMessage, appState.toolPermissionContext.mode, context, context.requestPrompt)) {
    if (hookResult.message?.type === "progress") {
      continue;
    }
    if (hookResult.blockingError) {
      const blockingMessage = getUserPromptSubmitHookBlockingMessage(hookResult.blockingError);
      return {
        messages: [
          createSystemMessage(`${blockingMessage}

Original prompt: ${input}`, "warning")
        ],
        shouldQuery: false,
        allowedTools: result.allowedTools
      };
    }
    if (hookResult.preventContinuation) {
      const message = hookResult.stopReason ? `Operation stopped by hook: ${hookResult.stopReason}` : "Operation stopped by hook";
      result.messages.push(createUserMessage({
        content: message
      }));
      result.shouldQuery = false;
      return result;
    }
    if (hookResult.additionalContexts && hookResult.additionalContexts.length > 0) {
      result.messages.push(createAttachmentMessage({
        type: "hook_additional_context",
        content: hookResult.additionalContexts.map(applyTruncation),
        hookName: "UserPromptSubmit",
        toolUseID: `hook-${randomUUID2()}`,
        hookEvent: "UserPromptSubmit"
      }));
    }
    if (hookResult.message) {
      switch (hookResult.message.attachment.type) {
        case "hook_success":
          if (!hookResult.message.attachment.content) {
            break;
          }
          result.messages.push({
            ...hookResult.message,
            attachment: {
              ...hookResult.message.attachment,
              content: applyTruncation(hookResult.message.attachment.content)
            }
          });
          break;
        default:
          result.messages.push(hookResult.message);
          break;
      }
    }
  }
  queryCheckpoint("query_hooks_end");
  return result;
}
var MAX_HOOK_OUTPUT_LENGTH = 1e4;
function applyTruncation(content) {
  if (content.length > MAX_HOOK_OUTPUT_LENGTH) {
    return `${content.substring(0, MAX_HOOK_OUTPUT_LENGTH)}… [output truncated - exceeded ${MAX_HOOK_OUTPUT_LENGTH} characters]`;
  }
  return content;
}
async function processUserInputBase(input, mode, setToolJSX, context, pastedContents, ideSelection, messages, uuid, isAlreadyProcessing, querySource, canUseTool, permissionMode, skipSlashCommands, bridgeOrigin, isMeta, skipAttachments, preExpansionInput) {
  let inputString = null;
  let precedingInputBlocks = [];
  const imageMetadataTexts = [];
  let normalizedInput = input;
  if (typeof input === "string") {
    inputString = input;
  } else if (input.length > 0) {
    queryCheckpoint("query_image_processing_start");
    const processedBlocks = [];
    for (const block of input) {
      if (block.type === "image") {
        const resized = await maybeResizeAndDownsampleImageBlock(block);
        if (resized.dimensions) {
          const metadataText = createImageMetadataText(resized.dimensions);
          if (metadataText) {
            imageMetadataTexts.push(metadataText);
          }
        }
        processedBlocks.push(resized.block);
      } else {
        processedBlocks.push(block);
      }
    }
    normalizedInput = processedBlocks;
    queryCheckpoint("query_image_processing_end");
    const lastBlock = processedBlocks[processedBlocks.length - 1];
    if (lastBlock?.type === "text") {
      inputString = lastBlock.text;
      precedingInputBlocks = processedBlocks.slice(0, -1);
    } else {
      precedingInputBlocks = processedBlocks;
    }
  }
  if (inputString === null && mode !== "prompt") {
    throw new Error(`Mode: ${mode} requires a string input.`);
  }
  const imageContents = pastedContents ? Object.values(pastedContents).filter(isValidImagePaste) : [];
  const imagePasteIds = imageContents.map((img) => img.id);
  const storedImagePaths = pastedContents ? await storeImages(pastedContents) : new Map;
  queryCheckpoint("query_pasted_image_processing_start");
  const imageProcessingResults = await Promise.all(imageContents.map(async (pastedImage) => {
    const imageBlock = {
      type: "image",
      source: {
        type: "base64",
        media_type: pastedImage.mediaType || "image/png",
        data: pastedImage.content
      }
    };
    logEvent("tengu_pasted_image_resize_attempt", {
      original_size_bytes: pastedImage.content.length
    });
    const resized = await maybeResizeAndDownsampleImageBlock(imageBlock);
    return {
      resized,
      originalDimensions: pastedImage.dimensions,
      sourcePath: pastedImage.sourcePath ?? storedImagePaths.get(pastedImage.id)
    };
  }));
  const imageContentBlocks = [];
  for (const {
    resized,
    originalDimensions,
    sourcePath
  } of imageProcessingResults) {
    if (resized.dimensions) {
      const metadataText = createImageMetadataText(resized.dimensions, sourcePath);
      if (metadataText) {
        imageMetadataTexts.push(metadataText);
      }
    } else if (originalDimensions) {
      const metadataText = createImageMetadataText(originalDimensions, sourcePath);
      if (metadataText) {
        imageMetadataTexts.push(metadataText);
      }
    } else if (sourcePath) {
      imageMetadataTexts.push(`[Image source: ${sourcePath}]`);
    }
    imageContentBlocks.push(resized.block);
  }
  queryCheckpoint("query_pasted_image_processing_end");
  let effectiveSkipSlash = skipSlashCommands;
  if (bridgeOrigin && inputString !== null && inputString.startsWith("/")) {
    const parsed = parseSlashCommand(inputString);
    const cmd = parsed ? findCommand(parsed.commandName, context.options.commands) : undefined;
    if (cmd) {
      if (isBridgeSafeCommand(cmd)) {
        effectiveSkipSlash = false;
      } else {
        const msg = `/${getCommandName(cmd)} isn't available over Remote Control.`;
        return {
          messages: [
            createUserMessage({ content: inputString, uuid }),
            createCommandInputMessage(`<local-command-stdout>${msg}</local-command-stdout>`)
          ],
          shouldQuery: false,
          resultText: msg
        };
      }
    }
  }
  if (false) {}
  const shouldExtractAttachments = !skipAttachments && inputString !== null && (mode !== "prompt" || effectiveSkipSlash || !inputString.startsWith("/"));
  queryCheckpoint("query_attachment_loading_start");
  const attachmentMessages = shouldExtractAttachments ? await toArray(getAttachmentMessages(inputString, context, ideSelection ?? null, [], messages, querySource)) : [];
  queryCheckpoint("query_attachment_loading_end");
  if (inputString !== null && mode === "bash") {
    const { processBashCommand } = await import("./processBashCommand-x4aey1rc.js");
    return addImageMetadataMessage(await processBashCommand(inputString, precedingInputBlocks, attachmentMessages, context, setToolJSX), imageMetadataTexts);
  }
  if (inputString !== null && !effectiveSkipSlash && inputString.startsWith("/")) {
    const { processSlashCommand } = await import("./processSlashCommand-mxhgh548.js");
    const slashResult = await processSlashCommand(inputString, precedingInputBlocks, imageContentBlocks, attachmentMessages, context, setToolJSX, uuid, isAlreadyProcessing, canUseTool);
    return addImageMetadataMessage(slashResult, imageMetadataTexts);
  }
  if (inputString !== null && mode === "prompt") {
    const trimmedInput = inputString.trim();
    const agentMention = attachmentMessages.find((m) => m.attachment.type === "agent_mention");
    if (agentMention) {
      const agentMentionString = `@agent-${agentMention.attachment.agentType}`;
      const isSubagentOnly = trimmedInput === agentMentionString;
      const isPrefix = trimmedInput.startsWith(agentMentionString) && !isSubagentOnly;
      logEvent("tengu_subagent_at_mention", {
        is_subagent_only: isSubagentOnly,
        is_prefix: isPrefix
      });
    }
  }
  return addImageMetadataMessage(processTextPrompt(normalizedInput, imageContentBlocks, imagePasteIds, attachmentMessages, uuid, permissionMode, isMeta), imageMetadataTexts);
}
function addImageMetadataMessage(result, imageMetadataTexts) {
  if (imageMetadataTexts.length > 0) {
    result.messages.push(createUserMessage({
      content: imageMetadataTexts.map((text) => ({ type: "text", text })),
      isMeta: true
    }));
  }
  return result;
}

// ../../src/utils/queryContext.ts
init_prompts();
init_context();
init_abortController();
init_model();
init_systemPromptType();
init_thinking();
async function fetchSystemPromptParts({
  tools,
  mainLoopModel,
  additionalWorkingDirectories,
  mcpClients,
  customSystemPrompt
}) {
  const [defaultSystemPrompt, userContext, systemContext] = await Promise.all([
    customSystemPrompt !== undefined ? Promise.resolve([]) : getSystemPrompt(tools, mainLoopModel, additionalWorkingDirectories, mcpClients),
    getUserContext(),
    customSystemPrompt !== undefined ? Promise.resolve({}) : getSystemContext()
  ]);
  return { defaultSystemPrompt, userContext, systemContext };
}

// ../../src/QueryEngine.ts
init_Shell();
init_sessionStorage();
init_systemPromptType();
init_systemTheme();
init_thinking();
init_mappers();

// ../../src/utils/messages/systemInit.ts
init_state();
init_outputStyles();
init_constants();
init_auth();
init_cwd();
init_fastMode();
init_settings();
import { randomUUID as randomUUID3 } from "crypto";
function sdkCompatToolName(name) {
  return name === AGENT_TOOL_NAME ? LEGACY_AGENT_TOOL_NAME : name;
}
function buildSystemInitMessage(inputs) {
  const settings = getSettings_DEPRECATED();
  const outputStyle = settings?.outputStyle ?? DEFAULT_OUTPUT_STYLE_NAME;
  const initMessage = {
    type: "system",
    subtype: "init",
    cwd: getCwd(),
    session_id: getSessionId(),
    tools: inputs.tools.map((tool) => sdkCompatToolName(tool.name)),
    mcp_servers: inputs.mcpClients.map((client) => ({
      name: client.name,
      status: client.type
    })),
    model: inputs.model,
    permissionMode: inputs.permissionMode,
    slash_commands: inputs.commands.filter((c) => c.userInvocable !== false).map((c) => c.name),
    apiKeySource: getURHQApiKeyWithSource().source,
    betas: getSdkBetas(),
    ur_version: MACRO.VERSION,
    output_style: outputStyle,
    agents: inputs.agents.map((agent) => agent.agentType),
    skills: inputs.skills.filter((s) => s.userInvocable !== false).map((skill) => skill.name),
    plugins: inputs.plugins.map((plugin) => ({
      name: plugin.name,
      path: plugin.path,
      source: plugin.source
    })),
    uuid: randomUUID3()
  };
  if (false) {}
  initMessage.fast_mode_state = getFastModeState(inputs.model, inputs.fastMode);
  return initMessage;
}

// ../../src/QueryEngine.ts
init_filesystem();
init_queryHelpers();
var messageSelector = () => (init_MessageSelector(), __toCommonJS(exports_MessageSelector));
var getCoordinatorUserContext = () => ({});

class QueryEngine {
  config;
  mutableMessages;
  abortController;
  permissionDenials;
  totalUsage;
  hasHandledOrphanedPermission = false;
  readFileState;
  discoveredSkillNames = new Set;
  loadedNestedMemoryPaths = new Set;
  constructor(config) {
    this.config = config;
    this.mutableMessages = config.initialMessages ?? [];
    this.abortController = config.abortController ?? createAbortController();
    this.permissionDenials = [];
    this.readFileState = config.readFileCache;
    this.totalUsage = EMPTY_USAGE;
  }
  async* submitMessage(prompt, options) {
    const {
      cwd,
      commands,
      tools,
      mcpClients,
      verbose = false,
      thinkingConfig,
      maxTurns,
      maxBudgetUsd,
      taskBudget,
      canUseTool,
      customSystemPrompt,
      appendSystemPrompt,
      userSpecifiedModel,
      fallbackModel,
      jsonSchema,
      getAppState,
      setAppState,
      replayUserMessages = false,
      includePartialMessages = false,
      agents = [],
      setSDKStatus,
      orphanedPermission
    } = this.config;
    this.discoveredSkillNames.clear();
    setCwd(cwd);
    const persistSession = !isSessionPersistenceDisabled();
    const startTime = Date.now();
    const wrappedCanUseTool = async (tool, input, toolUseContext, assistantMessage, toolUseID, forceDecision) => {
      const result2 = await canUseTool(tool, input, toolUseContext, assistantMessage, toolUseID, forceDecision);
      if (result2.behavior !== "allow") {
        this.permissionDenials.push({
          tool_name: sdkCompatToolName(tool.name),
          tool_use_id: toolUseID,
          tool_input: input
        });
      }
      return result2;
    };
    const initialAppState = getAppState();
    const initialMainLoopModel = userSpecifiedModel ? parseUserSpecifiedModel(userSpecifiedModel) : getMainLoopModel();
    const initialThinkingConfig = thinkingConfig ? thinkingConfig : shouldEnableThinkingByDefault() !== false ? { type: "adaptive" } : { type: "disabled" };
    headlessProfilerCheckpoint("before_getSystemPrompt");
    const customPrompt = typeof customSystemPrompt === "string" ? customSystemPrompt : undefined;
    const {
      defaultSystemPrompt,
      userContext: baseUserContext,
      systemContext
    } = await fetchSystemPromptParts({
      tools,
      mainLoopModel: initialMainLoopModel,
      additionalWorkingDirectories: Array.from(initialAppState.toolPermissionContext.additionalWorkingDirectories.keys()),
      mcpClients,
      customSystemPrompt: customPrompt
    });
    headlessProfilerCheckpoint("after_getSystemPrompt");
    const userContext = {
      ...baseUserContext,
      ...getCoordinatorUserContext(mcpClients, isScratchpadEnabled() ? getScratchpadDir() : undefined)
    };
    const memoryMechanicsPrompt = customPrompt !== undefined && hasAutoMemPathOverride() ? await loadMemoryPrompt() : null;
    const systemPrompt = asSystemPrompt([
      ...customPrompt !== undefined ? [customPrompt] : defaultSystemPrompt,
      ...memoryMechanicsPrompt ? [memoryMechanicsPrompt] : [],
      ...appendSystemPrompt ? [appendSystemPrompt] : []
    ]);
    const hasStructuredOutputTool = tools.some((t) => toolMatchesName(t, SYNTHETIC_OUTPUT_TOOL_NAME));
    if (jsonSchema && hasStructuredOutputTool) {
      registerStructuredOutputEnforcement(setAppState, getSessionId());
    }
    let processUserInputContext = {
      messages: this.mutableMessages,
      setMessages: (fn) => {
        this.mutableMessages = fn(this.mutableMessages);
      },
      onChangeAPIKey: () => {},
      handleElicitation: this.config.handleElicitation,
      options: {
        commands,
        debug: false,
        tools,
        verbose,
        mainLoopModel: initialMainLoopModel,
        thinkingConfig: initialThinkingConfig,
        mcpClients,
        mcpResources: {},
        ideInstallationStatus: null,
        isNonInteractiveSession: true,
        customSystemPrompt,
        appendSystemPrompt,
        agentDefinitions: { activeAgents: agents, allAgents: [] },
        theme: resolveThemeSetting(getGlobalConfig().theme),
        maxBudgetUsd
      },
      getAppState,
      setAppState,
      abortController: this.abortController,
      readFileState: this.readFileState,
      nestedMemoryAttachmentTriggers: new Set,
      loadedNestedMemoryPaths: this.loadedNestedMemoryPaths,
      dynamicSkillDirTriggers: new Set,
      discoveredSkillNames: this.discoveredSkillNames,
      setInProgressToolUseIDs: () => {},
      setResponseLength: () => {},
      updateFileHistoryState: (updater) => {
        setAppState((prev) => {
          const updated = updater(prev.fileHistory);
          if (updated === prev.fileHistory)
            return prev;
          return { ...prev, fileHistory: updated };
        });
      },
      updateAttributionState: (updater) => {
        setAppState((prev) => {
          const updated = updater(prev.attribution);
          if (updated === prev.attribution)
            return prev;
          return { ...prev, attribution: updated };
        });
      },
      setSDKStatus
    };
    if (orphanedPermission && !this.hasHandledOrphanedPermission) {
      this.hasHandledOrphanedPermission = true;
      for await (const message of handleOrphanedPermission(orphanedPermission, tools, this.mutableMessages, processUserInputContext)) {
        yield message;
      }
    }
    const {
      messages: messagesFromUserInput,
      shouldQuery,
      allowedTools,
      model: modelFromUserInput,
      resultText
    } = await processUserInput({
      input: prompt,
      mode: "prompt",
      setToolJSX: () => {},
      context: {
        ...processUserInputContext,
        messages: this.mutableMessages
      },
      messages: this.mutableMessages,
      uuid: options?.uuid,
      isMeta: options?.isMeta,
      querySource: "sdk"
    });
    this.mutableMessages.push(...messagesFromUserInput);
    const messages = [...this.mutableMessages];
    if (persistSession && messagesFromUserInput.length > 0) {
      const transcriptPromise = recordTranscript(messages);
      if (isBareMode()) {} else {
        await transcriptPromise;
        if (isEnvTruthy(process.env.UR_CODE_EAGER_FLUSH) || isEnvTruthy(process.env.UR_CODE_IS_COWORK)) {
          await flushSessionStorage();
        }
      }
    }
    const replayableMessages = messagesFromUserInput.filter((msg) => msg.type === "user" && !msg.isMeta && !msg.toolUseResult && messageSelector().selectableUserMessagesFilter(msg) || msg.type === "system" && msg.subtype === "compact_boundary");
    const messagesToAck = replayUserMessages ? replayableMessages : [];
    setAppState((prev) => ({
      ...prev,
      toolPermissionContext: {
        ...prev.toolPermissionContext,
        alwaysAllowRules: {
          ...prev.toolPermissionContext.alwaysAllowRules,
          command: allowedTools
        }
      }
    }));
    const mainLoopModel = modelFromUserInput ?? initialMainLoopModel;
    processUserInputContext = {
      messages,
      setMessages: () => {},
      onChangeAPIKey: () => {},
      handleElicitation: this.config.handleElicitation,
      options: {
        commands,
        debug: false,
        tools,
        verbose,
        mainLoopModel,
        thinkingConfig: initialThinkingConfig,
        mcpClients,
        mcpResources: {},
        ideInstallationStatus: null,
        isNonInteractiveSession: true,
        customSystemPrompt,
        appendSystemPrompt,
        theme: resolveThemeSetting(getGlobalConfig().theme),
        agentDefinitions: { activeAgents: agents, allAgents: [] },
        maxBudgetUsd
      },
      getAppState,
      setAppState,
      abortController: this.abortController,
      readFileState: this.readFileState,
      nestedMemoryAttachmentTriggers: new Set,
      loadedNestedMemoryPaths: this.loadedNestedMemoryPaths,
      dynamicSkillDirTriggers: new Set,
      discoveredSkillNames: this.discoveredSkillNames,
      setInProgressToolUseIDs: () => {},
      setResponseLength: () => {},
      updateFileHistoryState: processUserInputContext.updateFileHistoryState,
      updateAttributionState: processUserInputContext.updateAttributionState,
      setSDKStatus
    };
    headlessProfilerCheckpoint("before_skills_plugins");
    const [skills, { enabled: enabledPlugins }] = await Promise.all([
      getSlashCommandToolSkills(getCwd()),
      loadAllPluginsCacheOnly()
    ]);
    headlessProfilerCheckpoint("after_skills_plugins");
    yield buildSystemInitMessage({
      tools,
      mcpClients,
      model: mainLoopModel,
      permissionMode: initialAppState.toolPermissionContext.mode,
      commands,
      agents,
      skills,
      plugins: enabledPlugins,
      fastMode: initialAppState.fastMode
    });
    headlessProfilerCheckpoint("system_message_yielded");
    if (!shouldQuery) {
      for (const msg of messagesFromUserInput) {
        if (msg.type === "user" && typeof msg.message.content === "string" && (msg.message.content.includes(`<${LOCAL_COMMAND_STDOUT_TAG}>`) || msg.message.content.includes(`<${LOCAL_COMMAND_STDERR_TAG}>`) || msg.isCompactSummary)) {
          yield {
            type: "user",
            message: {
              ...msg.message,
              content: stripAnsi(msg.message.content)
            },
            session_id: getSessionId(),
            parent_tool_use_id: null,
            uuid: msg.uuid,
            timestamp: msg.timestamp,
            isReplay: !msg.isCompactSummary,
            isSynthetic: msg.isMeta || msg.isVisibleInTranscriptOnly
          };
        }
        if (msg.type === "system" && msg.subtype === "local_command" && typeof msg.content === "string" && (msg.content.includes(`<${LOCAL_COMMAND_STDOUT_TAG}>`) || msg.content.includes(`<${LOCAL_COMMAND_STDERR_TAG}>`))) {
          yield localCommandOutputToSDKAssistantMessage(msg.content, msg.uuid);
        }
        if (msg.type === "system" && msg.subtype === "compact_boundary") {
          yield {
            type: "system",
            subtype: "compact_boundary",
            session_id: getSessionId(),
            uuid: msg.uuid,
            compact_metadata: toSDKCompactMetadata(msg.compactMetadata)
          };
        }
      }
      if (persistSession) {
        await recordTranscript(messages);
        if (isEnvTruthy(process.env.UR_CODE_EAGER_FLUSH) || isEnvTruthy(process.env.UR_CODE_IS_COWORK)) {
          await flushSessionStorage();
        }
      }
      yield {
        type: "result",
        subtype: "success",
        is_error: false,
        duration_ms: Date.now() - startTime,
        duration_api_ms: getTotalAPIDuration(),
        num_turns: messages.length - 1,
        result: resultText ?? "",
        stop_reason: null,
        session_id: getSessionId(),
        total_cost_usd: getTotalCostUSD(),
        usage: this.totalUsage,
        modelUsage: getModelUsage(),
        permission_denials: this.permissionDenials,
        fast_mode_state: getFastModeState(mainLoopModel, initialAppState.fastMode),
        uuid: randomUUID5()
      };
      return;
    }
    if (fileHistoryEnabled() && persistSession) {
      messagesFromUserInput.filter(messageSelector().selectableUserMessagesFilter).forEach((message) => {
        fileHistoryMakeSnapshot((updater) => {
          setAppState((prev) => ({
            ...prev,
            fileHistory: updater(prev.fileHistory)
          }));
        }, message.uuid);
      });
    }
    let currentMessageUsage = EMPTY_USAGE;
    let turnCount = 1;
    let hasAcknowledgedInitialMessages = false;
    let structuredOutputFromTool;
    let lastStopReason = null;
    const errorLogWatermark = getInMemoryErrors().at(-1);
    const initialStructuredOutputCalls = jsonSchema ? countToolCalls(this.mutableMessages, SYNTHETIC_OUTPUT_TOOL_NAME) : 0;
    for await (const message of query({
      messages,
      systemPrompt,
      userContext,
      systemContext,
      canUseTool: wrappedCanUseTool,
      toolUseContext: processUserInputContext,
      fallbackModel,
      querySource: "sdk",
      maxTurns,
      taskBudget
    })) {
      if (message.type === "assistant" || message.type === "user" || message.type === "system" && message.subtype === "compact_boundary") {
        if (persistSession && message.type === "system" && message.subtype === "compact_boundary") {
          const tailUuid = message.compactMetadata?.preservedSegment?.tailUuid;
          if (tailUuid) {
            const tailIdx = this.mutableMessages.findLastIndex((m) => m.uuid === tailUuid);
            if (tailIdx !== -1) {
              await recordTranscript(this.mutableMessages.slice(0, tailIdx + 1));
            }
          }
        }
        messages.push(message);
        if (persistSession) {
          if (message.type === "assistant") {
            recordTranscript(messages);
          } else {
            await recordTranscript(messages);
          }
        }
        if (!hasAcknowledgedInitialMessages && messagesToAck.length > 0) {
          hasAcknowledgedInitialMessages = true;
          for (const msgToAck of messagesToAck) {
            if (msgToAck.type === "user") {
              yield {
                type: "user",
                message: msgToAck.message,
                session_id: getSessionId(),
                parent_tool_use_id: null,
                uuid: msgToAck.uuid,
                timestamp: msgToAck.timestamp,
                isReplay: true
              };
            }
          }
        }
      }
      if (message.type === "user") {
        turnCount++;
      }
      switch (message.type) {
        case "tombstone":
          break;
        case "assistant":
          if (message.message.stop_reason != null) {
            lastStopReason = message.message.stop_reason;
          }
          this.mutableMessages.push(message);
          yield* normalizeMessage(message);
          break;
        case "progress":
          this.mutableMessages.push(message);
          if (persistSession) {
            messages.push(message);
            recordTranscript(messages);
          }
          yield* normalizeMessage(message);
          break;
        case "user":
          this.mutableMessages.push(message);
          yield* normalizeMessage(message);
          break;
        case "stream_event":
          if (message.event.type === "message_start") {
            currentMessageUsage = EMPTY_USAGE;
            currentMessageUsage = updateUsage(currentMessageUsage, message.event.message.usage);
          }
          if (message.event.type === "message_delta") {
            currentMessageUsage = updateUsage(currentMessageUsage, message.event.usage);
            if (message.event.delta.stop_reason != null) {
              lastStopReason = message.event.delta.stop_reason;
            }
          }
          if (message.event.type === "message_stop") {
            this.totalUsage = accumulateUsage(this.totalUsage, currentMessageUsage);
          }
          if (includePartialMessages) {
            yield {
              type: "stream_event",
              event: message.event,
              session_id: getSessionId(),
              parent_tool_use_id: null,
              uuid: randomUUID5()
            };
          }
          break;
        case "attachment":
          this.mutableMessages.push(message);
          if (persistSession) {
            messages.push(message);
            recordTranscript(messages);
          }
          if (message.attachment.type === "structured_output") {
            structuredOutputFromTool = message.attachment.data;
          } else if (message.attachment.type === "max_turns_reached") {
            if (persistSession) {
              if (isEnvTruthy(process.env.UR_CODE_EAGER_FLUSH) || isEnvTruthy(process.env.UR_CODE_IS_COWORK)) {
                await flushSessionStorage();
              }
            }
            yield {
              type: "result",
              subtype: "error_max_turns",
              duration_ms: Date.now() - startTime,
              duration_api_ms: getTotalAPIDuration(),
              is_error: true,
              num_turns: message.attachment.turnCount,
              stop_reason: lastStopReason,
              session_id: getSessionId(),
              total_cost_usd: getTotalCostUSD(),
              usage: this.totalUsage,
              modelUsage: getModelUsage(),
              permission_denials: this.permissionDenials,
              fast_mode_state: getFastModeState(mainLoopModel, initialAppState.fastMode),
              uuid: randomUUID5(),
              errors: [
                `Reached maximum number of turns (${message.attachment.maxTurns})`
              ]
            };
            return;
          } else if (replayUserMessages && message.attachment.type === "queued_command") {
            yield {
              type: "user",
              message: {
                role: "user",
                content: message.attachment.prompt
              },
              session_id: getSessionId(),
              parent_tool_use_id: null,
              uuid: message.attachment.source_uuid || message.uuid,
              timestamp: message.timestamp,
              isReplay: true
            };
          }
          break;
        case "stream_request_start":
          break;
        case "system": {
          const snipResult = this.config.snipReplay?.(message, this.mutableMessages);
          if (snipResult !== undefined) {
            if (snipResult.executed) {
              this.mutableMessages.length = 0;
              this.mutableMessages.push(...snipResult.messages);
            }
            break;
          }
          this.mutableMessages.push(message);
          if (message.subtype === "compact_boundary" && message.compactMetadata) {
            const mutableBoundaryIdx = this.mutableMessages.length - 1;
            if (mutableBoundaryIdx > 0) {
              this.mutableMessages.splice(0, mutableBoundaryIdx);
            }
            const localBoundaryIdx = messages.length - 1;
            if (localBoundaryIdx > 0) {
              messages.splice(0, localBoundaryIdx);
            }
            yield {
              type: "system",
              subtype: "compact_boundary",
              session_id: getSessionId(),
              uuid: message.uuid,
              compact_metadata: toSDKCompactMetadata(message.compactMetadata)
            };
          }
          if (message.subtype === "api_error") {
            yield {
              type: "system",
              subtype: "api_retry",
              attempt: message.retryAttempt,
              max_retries: message.maxRetries,
              retry_delay_ms: message.retryInMs,
              error_status: message.error.status ?? null,
              error: categorizeRetryableAPIError(message.error),
              session_id: getSessionId(),
              uuid: message.uuid
            };
          }
          break;
        }
        case "tool_use_summary":
          yield {
            type: "tool_use_summary",
            summary: message.summary,
            preceding_tool_use_ids: message.precedingToolUseIds,
            session_id: getSessionId(),
            uuid: message.uuid
          };
          break;
      }
      if (maxBudgetUsd !== undefined && getTotalCostUSD() >= maxBudgetUsd) {
        if (persistSession) {
          if (isEnvTruthy(process.env.UR_CODE_EAGER_FLUSH) || isEnvTruthy(process.env.UR_CODE_IS_COWORK)) {
            await flushSessionStorage();
          }
        }
        yield {
          type: "result",
          subtype: "error_max_budget_usd",
          duration_ms: Date.now() - startTime,
          duration_api_ms: getTotalAPIDuration(),
          is_error: true,
          num_turns: turnCount,
          stop_reason: lastStopReason,
          session_id: getSessionId(),
          total_cost_usd: getTotalCostUSD(),
          usage: this.totalUsage,
          modelUsage: getModelUsage(),
          permission_denials: this.permissionDenials,
          fast_mode_state: getFastModeState(mainLoopModel, initialAppState.fastMode),
          uuid: randomUUID5(),
          errors: [`Reached maximum budget ($${maxBudgetUsd})`]
        };
        return;
      }
      if (message.type === "user" && jsonSchema) {
        const currentCalls = countToolCalls(this.mutableMessages, SYNTHETIC_OUTPUT_TOOL_NAME);
        const callsThisQuery = currentCalls - initialStructuredOutputCalls;
        const maxRetries = parseInt(process.env.MAX_STRUCTURED_OUTPUT_RETRIES || "5", 10);
        if (callsThisQuery >= maxRetries) {
          if (persistSession) {
            if (isEnvTruthy(process.env.UR_CODE_EAGER_FLUSH) || isEnvTruthy(process.env.UR_CODE_IS_COWORK)) {
              await flushSessionStorage();
            }
          }
          yield {
            type: "result",
            subtype: "error_max_structured_output_retries",
            duration_ms: Date.now() - startTime,
            duration_api_ms: getTotalAPIDuration(),
            is_error: true,
            num_turns: turnCount,
            stop_reason: lastStopReason,
            session_id: getSessionId(),
            total_cost_usd: getTotalCostUSD(),
            usage: this.totalUsage,
            modelUsage: getModelUsage(),
            permission_denials: this.permissionDenials,
            fast_mode_state: getFastModeState(mainLoopModel, initialAppState.fastMode),
            uuid: randomUUID5(),
            errors: [
              `Failed to provide valid structured output after ${maxRetries} attempts`
            ]
          };
          return;
        }
      }
    }
    const result = messages.findLast((m) => m.type === "assistant" || m.type === "user");
    const edeResultType = result?.type ?? "undefined";
    const edeLastContentType = result?.type === "assistant" ? last_default(result.message.content)?.type ?? "none" : "n/a";
    if (persistSession) {
      if (isEnvTruthy(process.env.UR_CODE_EAGER_FLUSH) || isEnvTruthy(process.env.UR_CODE_IS_COWORK)) {
        await flushSessionStorage();
      }
    }
    if (!isResultSuccessful(result, lastStopReason)) {
      yield {
        type: "result",
        subtype: "error_during_execution",
        duration_ms: Date.now() - startTime,
        duration_api_ms: getTotalAPIDuration(),
        is_error: true,
        num_turns: turnCount,
        stop_reason: lastStopReason,
        session_id: getSessionId(),
        total_cost_usd: getTotalCostUSD(),
        usage: this.totalUsage,
        modelUsage: getModelUsage(),
        permission_denials: this.permissionDenials,
        fast_mode_state: getFastModeState(mainLoopModel, initialAppState.fastMode),
        uuid: randomUUID5(),
        errors: (() => {
          const all = getInMemoryErrors();
          const start = errorLogWatermark ? all.lastIndexOf(errorLogWatermark) + 1 : 0;
          return [
            `[ede_diagnostic] result_type=${edeResultType} last_content_type=${edeLastContentType} stop_reason=${lastStopReason}`,
            ...all.slice(start).map((_) => _.error)
          ];
        })()
      };
      return;
    }
    let textResult = "";
    let isApiError = false;
    if (result.type === "assistant") {
      const lastContent = last_default(result.message.content);
      if (lastContent?.type === "text" && lastContent.text !== undefined && !SYNTHETIC_MESSAGES.has(lastContent.text)) {
        textResult = lastContent.text;
      }
      isApiError = Boolean(result.isApiErrorMessage);
    }
    yield {
      type: "result",
      subtype: "success",
      is_error: isApiError,
      duration_ms: Date.now() - startTime,
      duration_api_ms: getTotalAPIDuration(),
      num_turns: turnCount,
      result: textResult,
      stop_reason: lastStopReason,
      session_id: getSessionId(),
      total_cost_usd: getTotalCostUSD(),
      usage: this.totalUsage,
      modelUsage: getModelUsage(),
      permission_denials: this.permissionDenials,
      structured_output: structuredOutputFromTool,
      fast_mode_state: getFastModeState(mainLoopModel, initialAppState.fastMode),
      uuid: randomUUID5()
    };
  }
  interrupt() {
    this.abortController.abort();
  }
  getMessages() {
    return this.mutableMessages;
  }
  getReadFileState() {
    return this.readFileState;
  }
  getSessionId() {
    return getSessionId();
  }
  setModel(model) {
    this.config.userSpecifiedModel = model;
  }
}
async function* ask({
  commands,
  prompt,
  promptUuid,
  isMeta,
  cwd,
  tools,
  mcpClients,
  verbose = false,
  thinkingConfig,
  maxTurns,
  maxBudgetUsd,
  taskBudget,
  canUseTool,
  mutableMessages = [],
  getReadFileCache,
  setReadFileCache,
  customSystemPrompt,
  appendSystemPrompt,
  userSpecifiedModel,
  fallbackModel,
  jsonSchema,
  getAppState,
  setAppState,
  abortController,
  replayUserMessages = false,
  includePartialMessages = false,
  handleElicitation,
  agents = [],
  setSDKStatus,
  orphanedPermission
}) {
  const engine = new QueryEngine({
    cwd,
    tools,
    commands,
    mcpClients,
    agents,
    canUseTool,
    getAppState,
    setAppState,
    initialMessages: mutableMessages,
    readFileCache: cloneFileStateCache(getReadFileCache()),
    customSystemPrompt,
    appendSystemPrompt,
    userSpecifiedModel,
    fallbackModel,
    thinkingConfig,
    maxTurns,
    maxBudgetUsd,
    taskBudget,
    jsonSchema,
    verbose,
    handleElicitation,
    replayUserMessages,
    includePartialMessages,
    setSDKStatus,
    abortController,
    orphanedPermission
  });
  try {
    yield* engine.submitMessage(prompt, {
      uuid: promptUuid,
      isMeta
    });
  } finally {
    setReadFileCache(engine.getReadFileState());
  }
}

// src/index.ts
init_query();
init_tools();
init_providerRegistry();
init_Tool();
init_permissions();
init_AppStateStore();
init_store();
init_state();
init_fileHistory();
init_backgroundRunner();
init_messages();
init_systemPromptType();
init_settings();
init_config();
init_providerCredentials();
init_providerRegistry();
init_commands();
init_history();
init_sessionStorage();
init_config2();
init_client();
init_mcpWebSocketTransport();
init_verifier();
init_model();
init_cwd();
init_Shell();
init_git();
init_projectSafety();
init_filesystem();
init_permissions();
init_PermissionMode();
init_shouldUseSandbox();
init_permissionLogging();
import { randomUUID as randomUUID6 } from "crypto";
init_AppStateStore();
init_store();
init_state();
init_fileStateCache();
init_model();
init_settings();
init_providerRegistry();
init_tools();
init_history();
init_Shell();
init_fileHistory();
async function openProject(root) {
  setCwd(root);
  setCwdState(root);
  const initialSettings = getInitialSettings();
  const appState = {
    ...getDefaultAppState(),
    settings: initialSettings,
    provider: getActiveProviderSettings(initialSettings)
  };
  const store = createStore(appState);
  return { root, appStateStore: store };
}
async function createSession(project, opts = {}) {
  const sessionId = opts.sessionId ?? randomUUID6();
  const appState = project.appStateStore.getState();
  const tools = getAllBaseTools();
  const commands = await getCommands(project.root);
  const engine = new QueryEngine({
    cwd: project.root,
    tools,
    commands,
    mcpClients: appState.mcp.clients,
    agents: appState.agentDefinitions.activeAgents,
    canUseTool: opts.canUseTool ?? (async () => ({ behavior: "allow" })),
    getAppState: () => project.appStateStore.getState(),
    setAppState: (fn) => project.appStateStore.setState(fn),
    initialMessages: [],
    readFileCache: createFileStateCacheWithSizeLimit(100),
    userSpecifiedModel: appState.mainLoopModel ?? undefined
  });
  return { engine, project, sessionId };
}
async function* runPrompt(session, prompt, opts = {}) {
  const model = opts.model ? parseUserSpecifiedModel(opts.model) : getMainLoopModel();
  session.engine.setModel(model ?? undefined);
  yield* session.engine.submitMessage(prompt, {
    uuid: randomUUID6()
  });
}
async function* streamRunEvents(session) {
  yield {
    type: "system",
    subtype: "ready",
    session_id: session.sessionId,
    uuid: randomUUID6()
  };
}
function stopRun(session) {
  session.engine.interrupt();
}
function pauseRun(_session) {}
function resumeRun(_session) {}
function listTools(_project) {
  return getAllBaseTools().filter((tool) => tool.isEnabled()).map((tool) => ({ name: tool.name }));
}
async function requestToolCall(session, _toolName, _input) {
  return { ok: true, sessionId: session.sessionId };
}
async function requestApproval(_project, _toolName, _input) {
  return { approved: false };
}
function listProviders2(project) {
  const activeId = project.appStateStore.getState().provider.active;
  return listProviders({}).map((def) => ({
    id: def.id,
    displayName: def.displayName,
    active: def.id === activeId
  }));
}
async function setProvider(project, providerId, model) {
  const def = getProviderDefinition(providerId);
  if (!def) {
    throw new Error(`Unknown provider: ${providerId}`);
  }
  project.appStateStore.setState((prev) => ({
    ...prev,
    provider: {
      ...prev.provider,
      active: providerId,
      model
    }
  }));
}
function listModels(_project) {
  const model = getMainLoopModel();
  return model ? [{ id: model, displayName: model }] : [];
}
async function createWorktree(_project, _branch) {
  throw new Error("createWorktree not implemented in Phase 1");
}
async function applyPatch(_project, _patch) {
  throw new Error("applyPatch not implemented in Phase 1");
}
async function* readHistory(_project, _sessionId) {
  for await (const entry of makeHistoryReader()) {
    yield entry;
  }
}
function makeSnapshot(session) {
  const engine = session.engine;
  const messages = engine.getMessages();
  if (messages.length === 0)
    return;
  const lastUser = [...messages].reverse().find((m) => m.type === "user");
  if (!lastUser)
    return;
  fileHistoryMakeSnapshot((updater) => {
    session.project.appStateStore.setState((prev) => {
      const next = updater(prev.fileHistory);
      return { ...prev, fileHistory: next };
    });
  }, lastUser.uuid);
}
export {
  writeProjectSafetyPolicy,
  updateSettingsForSource,
  toolMatchesName,
  streamRunEvents,
  stopRun,
  startBackgroundTask,
  shouldUseSandbox,
  setSafeProviderConfig,
  setProviderModel,
  setProviderApiKey,
  setProvider,
  setCwd,
  runPrompt,
  resumeRun,
  requestToolCall,
  requestApproval,
  recordTranscript,
  readHistory,
  query,
  pauseRun,
  pathIsInsideWorkspace,
  pathInWorkingPath,
  parseUserSpecifiedModel,
  parseToolPreset,
  openProject,
  normalizeMessagesForAPI,
  makeSnapshot,
  makeHistoryReader,
  logPermissionDecision,
  loadProjectSafetyPolicy,
  listTools,
  listProviders2 as listProviders,
  listProviders as listProviderDefinitions,
  listModelsForProviderWithSource,
  listModels,
  listBackgroundTasks,
  isSessionPersistenceDisabled,
  isMcpServerDisabled,
  isExternalPermissionMode,
  hasPermissionsToUseTool,
  getToolsForDefaultPreset,
  getTimestampedHistory,
  getSlashCommandToolSkills,
  getSessionId,
  getRuleByContentsForToolName,
  getProviderStatus,
  getProviderRuntimeInfo,
  getProviderFamily,
  getProviderDefinition2 as getProviderDefinition,
  getProviderApiKeySource,
  getProviderApiKey,
  getProjectRoot,
  getMainLoopModel,
  getInitialSettings,
  getHistory,
  getEmptyToolPermissionContext,
  getDenyRules,
  getDefaultAppState,
  getCwd,
  getCommands,
  getCommandName,
  getAskRules,
  getAllowRules,
  getAllMcpConfigs,
  getAllBaseTools,
  getActiveProviderSettings,
  formatShellSafetyEvaluation,
  flushSessionStorage,
  findGitRoot,
  findCanonicalGitRoot,
  fileHistoryMakeSnapshot,
  fileHistoryEnabled,
  fetchToolsForClient,
  fetchSystemPromptParts,
  evaluateShellSafetyPolicy,
  enableConfigs,
  createWorktree,
  createUserMessage,
  createSystemMessage,
  createStore,
  createSession,
  createPermissionRequestMessage,
  clearProviderApiKey,
  checkPathSafetyForAutoEdit,
  backgroundDir,
  ask,
  asSystemPrompt,
  approvalLevelForEvaluation,
  applyPatch,
  WebSocketTransport,
  Verifier,
  QueryEngine,
  PROVIDER_IDS,
  PERMISSION_MODES,
  EXTERNAL_PERMISSION_MODES,
  DEFAULT_PROVIDER_ID,
  DEFAULT_PROJECT_SAFETY_POLICY,
  DANGEROUS_FILES,
  DANGEROUS_DIRECTORIES
};
