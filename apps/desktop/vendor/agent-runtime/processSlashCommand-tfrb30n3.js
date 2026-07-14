import {
  init_slashCommandParsing,
  parseSlashCommand
} from "./index-95j18myh.js";
import {
  NO_CONTENT_MESSAGE,
  addSessionHook,
  buildPluginCommandTelemetryFields,
  buildPostCompactMessages,
  builtInCommandNames,
  createAgentId,
  createAttachmentMessage,
  createCommandInputMessage,
  createSyntheticUserCaveatMessage,
  createSystemMessage,
  createUserInterruptionMessage,
  createUserMessage,
  extractResultText,
  findCommand,
  formatCommandInputTags,
  getAssistantMessageContentLength,
  getAttachmentMessages,
  getCommand,
  getCommandName,
  hasCommand,
  hasPermissionsToUseTool,
  init_UI,
  init_abortController,
  init_attachments,
  init_commands1 as init_commands,
  init_compact,
  init_dumpPrompts,
  init_events,
  init_forkedAgent,
  init_generators,
  init_messageQueueManager,
  init_messages,
  init_messages1 as init_messages2,
  init_microCompact,
  init_permissionSetup,
  init_permissions,
  init_pluginIdentifier,
  init_pluginOnlyPolicy,
  init_pluginTelemetry,
  init_runAgent,
  init_sessionHooks,
  init_skillUsageTracking,
  init_tokens,
  init_uuid,
  isCompactBoundaryMessage,
  isOfficialMarketplaceName,
  isRestrictedToPluginOnly,
  isSourceAdminTrusted,
  isSystemLocalCommandMessage,
  logOTelEvent,
  normalizeMessages,
  parsePluginIdentifier,
  parseToolListFromCLI,
  prepareForkedCommandContext,
  prepareUserContent,
  recordSkillUsage,
  redactIfDisabled,
  removeSessionHook,
  renderToolUseProgressMessage,
  resetMicrocompactState,
  runAgent,
  toArray
} from "./index-79vhy4mk.js";
import"./index-grma1d53.js";
import"./index-h3gckbec.js";
import"./index-e4qqkpaw.js";
import {
  init_fullscreen,
  isFullscreenEnvEnabled
} from "./index-4ywxxsys.js";
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
  HOOK_EVENTS,
  getAgentContext,
  init_agentContext,
  init_agentSdkTypes,
  init_file,
  init_sleep,
  init_workloadContext
} from "./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import {
  init_analytics,
  logEvent
} from "./index-mpmmtc93.js";
import"./index-s5dp14ed.js";
import"./index-6dy59xbm.js";
import"./index-0r3wd4mq.js";
import"./index-b5f4m7g4.js";
import"./index-h7h0j06f.js";
import"./index-7h9ddexs.js";
import {
  COMMAND_MESSAGE_TAG,
  COMMAND_NAME_TAG,
  init_log,
  init_xml,
  logError
} from "./index-f80dj2bz.js";
import"./index-q00jv0fc.js";
import"./index-cs7da0vv.js";
import"./index-ycnb0yeb.js";
import"./index-vpczjthp.js";
import {
  AbortError,
  MalformedCommandError,
  getFsImplementation,
  init_debug,
  init_envUtils,
  init_errors,
  init_fsOperations,
  logForDebugging
} from "./index-t784n9jz.js";
import {
  addInvokedSkill,
  getSessionId,
  init_state,
  setPromptId
} from "./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/utils/hooks/registerSkillHooks.ts
function registerSkillHooks(setAppState, sessionId, hooks, skillName, skillRoot) {
  let registeredCount = 0;
  for (const eventName of HOOK_EVENTS) {
    const matchers = hooks[eventName];
    if (!matchers)
      continue;
    for (const matcher of matchers) {
      for (const hook of matcher.hooks) {
        const onHookSuccess = hook.once ? () => {
          logForDebugging(`Removing one-shot hook for event ${eventName} in skill '${skillName}'`);
          removeSessionHook(setAppState, sessionId, eventName, hook);
        } : undefined;
        addSessionHook(setAppState, sessionId, eventName, matcher.matcher || "", hook, onHookSuccess, skillRoot);
        registeredCount++;
      }
    }
  }
  if (registeredCount > 0) {
    logForDebugging(`Registered ${registeredCount} hooks from skill '${skillName}'`);
  }
}
var init_registerSkillHooks = __esm(() => {
  init_agentSdkTypes();
  init_debug();
  init_sessionHooks();
});

// src/utils/processUserInput/processSlashCommand.tsx
import { randomUUID } from "crypto";
async function executeForkedSlashCommand(command, args, context, precedingInputBlocks, setToolJSX, canUseTool) {
  const agentId = createAgentId();
  const pluginMarketplace = command.pluginInfo ? parsePluginIdentifier(command.pluginInfo.repository).marketplace : undefined;
  logEvent("tengu_slash_command_forked", {
    command_name: command.name,
    invocation_trigger: "user-slash",
    ...command.pluginInfo && {
      _PROTO_plugin_name: command.pluginInfo.pluginManifest.name,
      ...pluginMarketplace && {
        _PROTO_marketplace_name: pluginMarketplace
      },
      ...buildPluginCommandTelemetryFields(command.pluginInfo)
    }
  });
  const {
    skillContent,
    modifiedGetAppState,
    baseAgent,
    promptMessages
  } = await prepareForkedCommandContext(command, args, context);
  const agentDefinition = command.effort !== undefined ? {
    ...baseAgent,
    effort: command.effort
  } : baseAgent;
  logForDebugging(`Executing forked slash command /${command.name} with agent ${agentDefinition.agentType}`);
  if (false) {}
  const agentMessages = [];
  const progressMessages = [];
  const parentToolUseID = `forked-command-${command.name}`;
  let toolUseCounter = 0;
  const createProgressMessage = (message) => {
    toolUseCounter++;
    return {
      type: "progress",
      data: {
        message,
        type: "agent_progress",
        prompt: skillContent,
        agentId
      },
      parentToolUseID,
      toolUseID: `${parentToolUseID}-${toolUseCounter}`,
      timestamp: new Date().toISOString(),
      uuid: randomUUID()
    };
  };
  const updateProgress = () => {
    setToolJSX({
      jsx: renderToolUseProgressMessage(progressMessages, {
        tools: context.options.tools,
        verbose: false
      }),
      shouldHidePromptInput: false,
      shouldContinueAnimation: true,
      showSpinner: true
    });
  };
  updateProgress();
  try {
    for await (const message of runAgent({
      agentDefinition,
      promptMessages,
      toolUseContext: {
        ...context,
        getAppState: modifiedGetAppState
      },
      canUseTool,
      isAsync: false,
      querySource: "agent:custom",
      model: command.model,
      availableTools: context.options.tools
    })) {
      agentMessages.push(message);
      const normalizedNew = normalizeMessages([message]);
      if (message.type === "assistant") {
        const contentLength = getAssistantMessageContentLength(message);
        if (contentLength > 0) {
          context.setResponseLength((len) => len + contentLength);
        }
        const normalizedMsg = normalizedNew[0];
        if (normalizedMsg && normalizedMsg.type === "assistant") {
          progressMessages.push(createProgressMessage(message));
          updateProgress();
        }
      }
      if (message.type === "user") {
        const normalizedMsg = normalizedNew[0];
        if (normalizedMsg && normalizedMsg.type === "user") {
          progressMessages.push(createProgressMessage(normalizedMsg));
          updateProgress();
        }
      }
    }
  } finally {
    setToolJSX(null);
  }
  let resultText = extractResultText(agentMessages, "Command completed");
  logForDebugging(`Forked slash command /${command.name} completed with agent ${agentId}`);
  if (false) {}
  const messages = [createUserMessage({
    content: prepareUserContent({
      inputString: `/${getCommandName(command)} ${args}`.trim(),
      precedingInputBlocks
    })
  }), createUserMessage({
    content: `<local-command-stdout>
${resultText}
</local-command-stdout>`
  })];
  return {
    messages,
    shouldQuery: false,
    command,
    resultText
  };
}
function looksLikeCommand(commandName) {
  return !/[^a-zA-Z0-9:\-_]/.test(commandName);
}
async function processSlashCommand(inputString, precedingInputBlocks, imageContentBlocks, attachmentMessages, context, setToolJSX, uuid, isAlreadyProcessing, canUseTool) {
  const parsed = parseSlashCommand(inputString);
  if (!parsed) {
    logEvent("tengu_input_slash_missing", {});
    const errorMessage = "Commands are in the form `/command [args]`";
    return {
      messages: [createSyntheticUserCaveatMessage(), ...attachmentMessages, createUserMessage({
        content: prepareUserContent({
          inputString: errorMessage,
          precedingInputBlocks
        })
      })],
      shouldQuery: false,
      resultText: errorMessage
    };
  }
  const {
    commandName,
    args: parsedArgs,
    isMcp
  } = parsed;
  const sanitizedCommandName = isMcp ? "mcp" : !builtInCommandNames().has(commandName) ? "custom" : commandName;
  if (!hasCommand(commandName, context.options.commands)) {
    let isFilePath = false;
    try {
      await getFsImplementation().stat(`/${commandName}`);
      isFilePath = true;
    } catch {}
    if (looksLikeCommand(commandName) && !isFilePath) {
      logEvent("tengu_input_slash_invalid", {
        input: commandName
      });
      const unknownMessage = `Unknown skill: ${commandName}`;
      return {
        messages: [
          createSyntheticUserCaveatMessage(),
          ...attachmentMessages,
          createUserMessage({
            content: prepareUserContent({
              inputString: unknownMessage,
              precedingInputBlocks
            })
          }),
          ...parsedArgs ? [createSystemMessage(`Args from unknown skill: ${parsedArgs}`, "warning")] : []
        ],
        shouldQuery: false,
        resultText: unknownMessage
      };
    }
    const promptId = randomUUID();
    setPromptId(promptId);
    logEvent("tengu_input_prompt", {});
    logOTelEvent("user_prompt", {
      prompt_length: String(inputString.length),
      prompt: redactIfDisabled(inputString),
      "prompt.id": promptId
    });
    return {
      messages: [createUserMessage({
        content: prepareUserContent({
          inputString,
          precedingInputBlocks
        }),
        uuid
      }), ...attachmentMessages],
      shouldQuery: true
    };
  }
  const {
    messages: newMessages,
    shouldQuery: messageShouldQuery,
    allowedTools,
    model,
    effort,
    command: returnedCommand,
    resultText,
    nextInput,
    submitNextInput
  } = await getMessagesForSlashCommand(commandName, parsedArgs, setToolJSX, context, precedingInputBlocks, imageContentBlocks, isAlreadyProcessing, canUseTool, uuid);
  if (newMessages.length === 0) {
    const eventData2 = {
      input: sanitizedCommandName
    };
    if (returnedCommand.type === "prompt" && returnedCommand.pluginInfo) {
      const {
        pluginManifest,
        repository
      } = returnedCommand.pluginInfo;
      const {
        marketplace
      } = parsePluginIdentifier(repository);
      const isOfficial = isOfficialMarketplaceName(marketplace);
      eventData2._PROTO_plugin_name = pluginManifest.name;
      if (marketplace) {
        eventData2._PROTO_marketplace_name = marketplace;
      }
      eventData2.plugin_repository = isOfficial ? repository : "third-party";
      eventData2.plugin_name = isOfficial ? pluginManifest.name : "third-party";
      if (isOfficial && pluginManifest.version) {
        eventData2.plugin_version = pluginManifest.version;
      }
      Object.assign(eventData2, buildPluginCommandTelemetryFields(returnedCommand.pluginInfo));
    }
    logEvent("tengu_input_command", {
      ...eventData2,
      invocation_trigger: "user-slash",
      ...{}
    });
    return {
      messages: [],
      shouldQuery: false,
      model,
      nextInput,
      submitNextInput
    };
  }
  if (newMessages.length === 2 && newMessages[1].type === "user" && typeof newMessages[1].message.content === "string" && newMessages[1].message.content.startsWith("Unknown command:")) {
    const looksLikeFilePath = inputString.startsWith("/var") || inputString.startsWith("/tmp") || inputString.startsWith("/private");
    if (!looksLikeFilePath) {
      logEvent("tengu_input_slash_invalid", {
        input: commandName
      });
    }
    return {
      messages: [createSyntheticUserCaveatMessage(), ...newMessages],
      shouldQuery: messageShouldQuery,
      allowedTools,
      model
    };
  }
  const eventData = {
    input: sanitizedCommandName
  };
  if (returnedCommand.type === "prompt" && returnedCommand.pluginInfo) {
    const {
      pluginManifest,
      repository
    } = returnedCommand.pluginInfo;
    const {
      marketplace
    } = parsePluginIdentifier(repository);
    const isOfficial = isOfficialMarketplaceName(marketplace);
    eventData._PROTO_plugin_name = pluginManifest.name;
    if (marketplace) {
      eventData._PROTO_marketplace_name = marketplace;
    }
    eventData.plugin_repository = isOfficial ? repository : "third-party";
    eventData.plugin_name = isOfficial ? pluginManifest.name : "third-party";
    if (isOfficial && pluginManifest.version) {
      eventData.plugin_version = pluginManifest.version;
    }
    Object.assign(eventData, buildPluginCommandTelemetryFields(returnedCommand.pluginInfo));
  }
  logEvent("tengu_input_command", {
    ...eventData,
    invocation_trigger: "user-slash",
    ...{}
  });
  const isCompactResult = newMessages.length > 0 && newMessages[0] && isCompactBoundaryMessage(newMessages[0]);
  return {
    messages: messageShouldQuery || newMessages.every(isSystemLocalCommandMessage) || isCompactResult ? newMessages : [createSyntheticUserCaveatMessage(), ...newMessages],
    shouldQuery: messageShouldQuery,
    allowedTools,
    model,
    effort,
    resultText,
    nextInput,
    submitNextInput
  };
}
async function getMessagesForSlashCommand(commandName, args, setToolJSX, context, precedingInputBlocks, imageContentBlocks, _isAlreadyProcessing, canUseTool, uuid) {
  const command = getCommand(commandName, context.options.commands);
  if (command.type === "prompt" && command.userInvocable !== false) {
    recordSkillUsage(commandName);
  }
  if (command.userInvocable === false) {
    return {
      messages: [createUserMessage({
        content: prepareUserContent({
          inputString: `/${commandName}`,
          precedingInputBlocks
        })
      }), createUserMessage({
        content: `This skill can only be invoked by UR, not directly by users. Ask UR to use the "${commandName}" skill for you.`
      })],
      shouldQuery: false,
      command
    };
  }
  try {
    switch (command.type) {
      case "local-jsx": {
        return new Promise((resolve) => {
          let doneWasCalled = false;
          const onDone = (result, options) => {
            doneWasCalled = true;
            if (options?.display === "skip") {
              resolve({
                messages: [],
                shouldQuery: false,
                command,
                nextInput: options?.nextInput,
                submitNextInput: options?.submitNextInput
              });
              return;
            }
            const metaMessages = (options?.metaMessages ?? []).map((content) => createUserMessage({
              content,
              isMeta: true
            }));
            const skipTranscript = isFullscreenEnvEnabled() && typeof result === "string" && result.endsWith(" dismissed");
            resolve({
              messages: options?.display === "system" ? skipTranscript ? metaMessages : [createCommandInputMessage(formatCommandInput(command, args)), createCommandInputMessage(`<local-command-stdout>${result}</local-command-stdout>`), ...metaMessages] : [createUserMessage({
                content: prepareUserContent({
                  inputString: formatCommandInput(command, args),
                  precedingInputBlocks
                })
              }), result ? createUserMessage({
                content: `<local-command-stdout>${result}</local-command-stdout>`
              }) : createUserMessage({
                content: `<local-command-stdout>${NO_CONTENT_MESSAGE}</local-command-stdout>`
              }), ...metaMessages],
              shouldQuery: options?.shouldQuery ?? false,
              command,
              nextInput: options?.nextInput,
              submitNextInput: options?.submitNextInput
            });
          };
          command.load().then((mod) => mod.call(onDone, {
            ...context,
            canUseTool
          }, args)).then((jsx) => {
            if (jsx == null)
              return;
            if (context.options.isNonInteractiveSession) {
              resolve({
                messages: [],
                shouldQuery: false,
                command
              });
              return;
            }
            if (doneWasCalled)
              return;
            setToolJSX({
              jsx,
              shouldHidePromptInput: true,
              showSpinner: false,
              isLocalJSXCommand: true,
              isImmediate: command.immediate === true
            });
          }).catch((e) => {
            logError(e);
            if (doneWasCalled)
              return;
            doneWasCalled = true;
            setToolJSX({
              jsx: null,
              shouldHidePromptInput: false,
              clearLocalJSX: true
            });
            resolve({
              messages: [],
              shouldQuery: false,
              command
            });
          });
        });
      }
      case "local": {
        const displayArgs = command.isSensitive && args.trim() ? "***" : args;
        const userMessage = createUserMessage({
          content: prepareUserContent({
            inputString: formatCommandInput(command, displayArgs),
            precedingInputBlocks
          })
        });
        try {
          const syntheticCaveatMessage = createSyntheticUserCaveatMessage();
          const mod = await command.load();
          const result = await mod.call(args, context);
          if (result.type === "skip") {
            return {
              messages: [],
              shouldQuery: false,
              command
            };
          }
          if (result.type === "compact") {
            const slashCommandMessages = [syntheticCaveatMessage, userMessage, ...result.displayText ? [createUserMessage({
              content: `<local-command-stdout>${result.displayText}</local-command-stdout>`,
              timestamp: new Date(Date.now() + 100).toISOString()
            })] : []];
            const compactionResultWithSlashMessages = {
              ...result.compactionResult,
              messagesToKeep: [...result.compactionResult.messagesToKeep ?? [], ...slashCommandMessages]
            };
            resetMicrocompactState();
            return {
              messages: buildPostCompactMessages(compactionResultWithSlashMessages),
              shouldQuery: false,
              command
            };
          }
          return {
            messages: [userMessage, createCommandInputMessage(`<local-command-stdout>${result.value}</local-command-stdout>`)],
            shouldQuery: false,
            command,
            resultText: result.value
          };
        } catch (e) {
          logError(e);
          return {
            messages: [userMessage, createCommandInputMessage(`<local-command-stderr>${String(e)}</local-command-stderr>`)],
            shouldQuery: false,
            command
          };
        }
      }
      case "prompt": {
        try {
          if (command.context === "fork") {
            return await executeForkedSlashCommand(command, args, context, precedingInputBlocks, setToolJSX, canUseTool ?? hasPermissionsToUseTool);
          }
          return await getMessagesForPromptSlashCommand(command, args, context, precedingInputBlocks, imageContentBlocks, uuid);
        } catch (e) {
          if (e instanceof AbortError) {
            return {
              messages: [createUserMessage({
                content: prepareUserContent({
                  inputString: formatCommandInput(command, args),
                  precedingInputBlocks
                })
              }), createUserInterruptionMessage({
                toolUse: false
              })],
              shouldQuery: false,
              command
            };
          }
          return {
            messages: [createUserMessage({
              content: prepareUserContent({
                inputString: formatCommandInput(command, args),
                precedingInputBlocks
              })
            }), createUserMessage({
              content: `<local-command-stderr>${String(e)}</local-command-stderr>`
            })],
            shouldQuery: false,
            command
          };
        }
      }
    }
  } catch (e) {
    if (e instanceof MalformedCommandError) {
      return {
        messages: [createUserMessage({
          content: prepareUserContent({
            inputString: e.message,
            precedingInputBlocks
          })
        })],
        shouldQuery: false,
        command
      };
    }
    throw e;
  }
}
function formatCommandInput(command, args) {
  return formatCommandInputTags(getCommandName(command), args);
}
function formatSkillLoadingMetadata(skillName, _progressMessage = "loading") {
  return [`<${COMMAND_MESSAGE_TAG}>${skillName}</${COMMAND_MESSAGE_TAG}>`, `<${COMMAND_NAME_TAG}>${skillName}</${COMMAND_NAME_TAG}>`, `<skill-format>true</skill-format>`].join(`
`);
}
function formatSlashCommandLoadingMetadata(commandName, args) {
  return [`<${COMMAND_MESSAGE_TAG}>${commandName}</${COMMAND_MESSAGE_TAG}>`, `<${COMMAND_NAME_TAG}>/${commandName}</${COMMAND_NAME_TAG}>`, args ? `<command-args>${args}</command-args>` : null].filter(Boolean).join(`
`);
}
function formatCommandLoadingMetadata(command, args) {
  if (command.userInvocable !== false) {
    return formatSlashCommandLoadingMetadata(command.name, args);
  }
  if (command.loadedFrom === "skills" || command.loadedFrom === "plugin" || command.loadedFrom === "mcp") {
    return formatSkillLoadingMetadata(command.name, command.progressMessage);
  }
  return formatSlashCommandLoadingMetadata(command.name, args);
}
async function processPromptSlashCommand(commandName, args, commands, context, imageContentBlocks = []) {
  const command = findCommand(commandName, commands);
  if (!command) {
    throw new MalformedCommandError(`Unknown command: ${commandName}`);
  }
  if (command.type !== "prompt") {
    throw new Error(`Unexpected ${command.type} command. Expected 'prompt' command. Use /${commandName} directly in the main conversation.`);
  }
  return getMessagesForPromptSlashCommand(command, args, context, [], imageContentBlocks);
}
async function getMessagesForPromptSlashCommand(command, args, context, precedingInputBlocks = [], imageContentBlocks = [], uuid) {
  if (false) {}
  const result = await command.getPromptForCommand(args, context);
  const hooksAllowedForThisSkill = !isRestrictedToPluginOnly("hooks") || isSourceAdminTrusted(command.source);
  if (command.hooks && hooksAllowedForThisSkill) {
    const sessionId = getSessionId();
    registerSkillHooks(context.setAppState, sessionId, command.hooks, command.name, command.type === "prompt" ? command.skillRoot : undefined);
  }
  const skillPath = command.source ? `${command.source}:${command.name}` : command.name;
  const skillContent = result.filter((b) => b.type === "text").map((b) => b.text).join(`

`);
  addInvokedSkill(command.name, skillPath, skillContent, getAgentContext()?.agentId ?? null);
  const metadata = formatCommandLoadingMetadata(command, args);
  const additionalAllowedTools = parseToolListFromCLI(command.allowedTools ?? []);
  const mainMessageContent = imageContentBlocks.length > 0 || precedingInputBlocks.length > 0 ? [...imageContentBlocks, ...precedingInputBlocks, ...result] : result;
  const attachmentMessages = await toArray(getAttachmentMessages(result.filter((block) => block.type === "text").map((block) => block.text).join(" "), context, null, [], context.messages, "repl_main_thread", {
    skipSkillDiscovery: true
  }));
  const messages = [createUserMessage({
    content: metadata,
    uuid
  }), createUserMessage({
    content: mainMessageContent,
    isMeta: true
  }), ...attachmentMessages, createAttachmentMessage({
    type: "command_permissions",
    allowedTools: additionalAllowedTools,
    model: command.model
  })];
  return {
    messages,
    shouldQuery: true,
    allowedTools: additionalAllowedTools,
    model: command.model,
    effort: command.effort,
    command
  };
}
var init_processSlashCommand = __esm(() => {
  init_state();
  init_commands();
  init_messages();
  init_state();
  init_xml();
  init_analytics();
  init_dumpPrompts();
  init_compact();
  init_microCompact();
  init_runAgent();
  init_UI();
  init_abortController();
  init_agentContext();
  init_attachments();
  init_debug();
  init_envUtils();
  init_errors();
  init_file();
  init_forkedAgent();
  init_fsOperations();
  init_fullscreen();
  init_generators();
  init_registerSkillHooks();
  init_log();
  init_messageQueueManager();
  init_messages2();
  init_permissionSetup();
  init_permissions();
  init_pluginIdentifier();
  init_pluginOnlyPolicy();
  init_slashCommandParsing();
  init_sleep();
  init_skillUsageTracking();
  init_events();
  init_pluginTelemetry();
  init_tokens();
  init_uuid();
  init_workloadContext();
});
init_processSlashCommand();

export {
  processSlashCommand,
  processPromptSlashCommand,
  looksLikeCommand,
  formatSkillLoadingMetadata
};
