import {
  Byline,
  ConfigurableShortcutHint,
  KeyboardShortcutHint,
  Select,
  capitalize_default,
  convertEffortValueToLevel,
  getDefaultEffortForModel,
  init_AppState,
  init_Byline,
  init_ConfigurableShortcutHint,
  init_CustomSelect,
  init_KeyboardShortcutHint,
  init_capitalize,
  init_effort,
  init_thinking,
  modelSupportsEffort,
  modelSupportsMaxEffort,
  modelSupportsThinking,
  resolvePickerEffortPersistence,
  shouldEnableThinkingByDefault,
  toPersistableEffort,
  useAppState,
  useSetAppState
} from "./index-79vhy4mk.js";
import {
  Pane,
  init_Pane,
  init_useExitOnCtrlCDWithKeybindings,
  init_useKeybinding,
  useExitOnCtrlCDWithKeybindings,
  useKeybindings
} from "./index-grma1d53.js";
import {
  ThemedBox_default,
  ThemedText,
  init_ink
} from "./index-4ywxxsys.js";
import {
  require_jsx_dev_runtime,
  require_react
} from "./index-2krq0sbw.js";
import {
  EFFORT_HIGH,
  EFFORT_LOW,
  EFFORT_MAX,
  EFFORT_MEDIUM,
  FAST_MODE_MODEL_DISPLAY,
  getActiveProviderSettings,
  getDefaultMainLoopModel,
  getInitialSettings,
  getSettingsForSource,
  has1mContext,
  init_auth,
  init_context,
  init_fastMode,
  init_figures,
  init_model,
  init_providerRegistry,
  init_settings1 as init_settings,
  isFastModeAvailable,
  isFastModeCooldown,
  isFastModeEnabled,
  isURAISubscriber,
  listModelsForProviderWithSource,
  modelDisplayString,
  parseUserSpecifiedModel,
  updateSettingsForSource,
  validateProviderModelPair
} from "./index-133awary.js";
import {
  init_analytics,
  logEvent
} from "./index-mpmmtc93.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// src/components/EffortIndicator.ts
function effortLevelToSymbol(level) {
  switch (level) {
    case "low":
      return EFFORT_LOW;
    case "medium":
      return EFFORT_MEDIUM;
    case "high":
      return EFFORT_HIGH;
    case "max":
      return EFFORT_MAX;
    default:
      return EFFORT_HIGH;
  }
}
var init_EffortIndicator = __esm(() => {
  init_figures();
  init_effort();
});

// src/components/ModelPicker.tsx
function ModelPicker({
  initial,
  sessionModel,
  onSelect,
  onCancel,
  isStandaloneCommand,
  showFastModeNotice,
  headerText,
  skipSettingsWrite
}) {
  const setAppState = useSetAppState();
  const exitState = useExitOnCtrlCDWithKeybindings();
  const initialValue = initial === null ? NO_PREFERENCE : initial;
  const [focusedValue, setFocusedValue] = import_react.useState(initialValue);
  const isFastMode = useAppState(selectFastMode);
  const [hasToggledEffort, setHasToggledEffort] = import_react.useState(false);
  const effortValue = useAppState(selectEffortValue);
  const [effort, setEffort] = import_react.useState(effortValue !== undefined ? convertEffortValueToLevel(effortValue) : undefined);
  const appThinkingEnabled = useAppState(selectThinkingEnabled);
  const [hasToggledThinking, setHasToggledThinking] = import_react.useState(false);
  const [thinkingEnabled, setThinkingEnabled] = import_react.useState(() => appThinkingEnabled ?? shouldEnableThinkingByDefault());
  const [providerModelOptions, setProviderModelOptions] = import_react.useState([]);
  const [pickerError, setPickerError] = import_react.useState(null);
  const effectiveSettings = getInitialSettings();
  const currentProvider = getActiveProviderSettings(effectiveSettings).active ?? "ollama";
  import_react.useEffect(() => {
    const controller = new AbortController;
    listModelsForProviderWithSource(currentProvider, {
      settings: effectiveSettings,
      signal: controller.signal
    }).then((result) => {
      if (controller.signal.aborted)
        return;
      setProviderModelOptions(result.models.map((model) => ({
        value: model.id,
        label: model.displayName,
        description: `${model.description} · ${result.source}`
      })));
      setPickerError(result.warning ?? null);
    }).catch((error) => {
      if (controller.signal.aborted)
        return;
      setProviderModelOptions([]);
      setPickerError(error instanceof Error ? error.message : String(error));
    });
    return () => controller.abort();
  }, [currentProvider, effectiveSettings]);
  const modelOptions = providerModelOptions;
  const optionsWithInitial = initial !== null && validateProviderModelPair(currentProvider, initial, {
    availableModels: modelOptions.map((option) => option.value)
  }).valid && !modelOptions.some((opt) => opt.value === initial) ? [
    ...modelOptions,
    {
      value: initial,
      label: modelDisplayString(initial),
      description: "Current model"
    }
  ] : modelOptions;
  const selectOptions = optionsWithInitial.map((opt) => ({
    ...opt,
    value: opt.value === null ? NO_PREFERENCE : opt.value
  }));
  const initialFocusValue = selectOptions.some((o) => o.value === initialValue) ? initialValue : selectOptions[0]?.value ?? undefined;
  const visibleCount = Math.min(10, selectOptions.length);
  const hiddenCount = Math.max(0, selectOptions.length - visibleCount);
  const focusedModelName = selectOptions.find((opt) => opt.value === focusedValue)?.label;
  const focusedModel = resolveOptionModel(focusedValue);
  const focusedSupportsEffort = focusedModel ? modelSupportsEffort(focusedModel) : false;
  const focusedSupportsMax = focusedModel ? modelSupportsMaxEffort(focusedModel) : false;
  const focusedSupportsThinking = focusedModel ? modelSupportsThinking(focusedModel) : false;
  const focusedDefaultEffort = getDefaultEffortLevelForOption(focusedValue);
  const displayEffort = effort === "max" && !focusedSupportsMax ? "high" : effort;
  const handleFocus = (value) => {
    setFocusedValue(value);
    if (!hasToggledEffort && effortValue === undefined) {
      setEffort(getDefaultEffortLevelForOption(value));
    }
  };
  const handleCycleEffort = (direction) => {
    if (!focusedSupportsEffort) {
      return;
    }
    setEffort((prev) => cycleEffortLevel(prev ?? focusedDefaultEffort, direction, focusedSupportsMax));
    setHasToggledEffort(true);
  };
  const handleToggleThinking = () => {
    if (!focusedSupportsThinking) {
      return;
    }
    setThinkingEnabled((prev) => !prev);
    setHasToggledThinking(true);
  };
  useKeybindings({
    "modelPicker:decreaseEffort": () => handleCycleEffort("left"),
    "modelPicker:increaseEffort": () => handleCycleEffort("right"),
    "modelPicker:toggleThinking": handleToggleThinking
  }, { context: "ModelPicker" });
  function handleSelect(value) {
    logEvent("tengu_model_command_menu_effort", {
      effort
    });
    if (value !== NO_PREFERENCE) {
      const validation = validateProviderModelPair(currentProvider, value, {
        availableModels: modelOptions.map((option) => option.value)
      });
      if (validation.valid === false) {
        setPickerError(validation.error);
        return;
      }
    }
    if (!skipSettingsWrite) {
      const effortLevel = resolvePickerEffortPersistence(effort, getDefaultEffortLevelForOption(value), getSettingsForSource("userSettings")?.effortLevel, hasToggledEffort);
      const persistable = toPersistableEffort(effortLevel);
      if (persistable !== undefined) {
        updateSettingsForSource("userSettings", {
          effortLevel: persistable
        });
      }
      if (hasToggledThinking) {
        updateSettingsForSource("userSettings", {
          alwaysThinkingEnabled: thinkingEnabled ? undefined : false
        });
      }
      setAppState((prev) => ({
        ...prev,
        effortValue: effortLevel,
        ...hasToggledThinking ? { thinkingEnabled } : {}
      }));
    }
    const selectedModel = resolveOptionModel(value);
    const selectedEffort = hasToggledEffort && selectedModel && modelSupportsEffort(selectedModel) ? effort : undefined;
    if (value === NO_PREFERENCE) {
      onSelect(null, selectedEffort);
      return;
    }
    onSelect(value, selectedEffort);
  }
  const fastModeNotice = isFastModeEnabled() ? showFastModeNotice ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
    marginBottom: 1,
    children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      dimColor: true,
      children: [
        "Fast mode is ",
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          bold: true,
          children: "ON"
        }, undefined, false, undefined, this),
        " and available with",
        " ",
        FAST_MODE_MODEL_DISPLAY,
        " only (/fast). Switching to other models turn off fast mode."
      ]
    }, undefined, true, undefined, this)
  }, undefined, false, undefined, this) : isFastModeAvailable() && !isFastModeCooldown() ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
    marginBottom: 1,
    children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      dimColor: true,
      children: [
        "Use ",
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          bold: true,
          children: "/fast"
        }, undefined, false, undefined, this),
        " to turn on Fast mode (",
        FAST_MODE_MODEL_DISPLAY,
        " only)."
      ]
    }, undefined, true, undefined, this)
  }, undefined, false, undefined, this) : null : null;
  const content = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
    flexDirection: "column",
    children: [
      /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
        flexDirection: "column",
        children: [
          /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
            marginBottom: 1,
            flexDirection: "column",
            children: [
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                color: "remember",
                bold: true,
                children: "Select model"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                dimColor: true,
                children: headerText ?? "Switch between models for the active provider. Applies to this session and future UR sessions. For other provider-scoped model names, specify with --model."
              }, undefined, false, undefined, this),
              sessionModel && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                dimColor: true,
                children: [
                  "Currently using ",
                  modelDisplayString(sessionModel),
                  " for this session (set by plan mode). Selecting a model will undo this."
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
            flexDirection: "column",
            marginBottom: 1,
            children: [
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                flexDirection: "column",
                children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Select, {
                  defaultValue: initialValue,
                  defaultFocusValue: initialFocusValue,
                  options: selectOptions,
                  onChange: handleSelect,
                  onFocus: handleFocus,
                  onCancel: onCancel ?? noop,
                  visibleOptionCount: visibleCount
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this),
              hiddenCount > 0 && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                paddingLeft: 3,
                children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                  dimColor: true,
                  children: [
                    "and ",
                    hiddenCount,
                    " more…"
                  ]
                }, undefined, true, undefined, this)
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
            marginBottom: 1,
            flexDirection: "column",
            children: [
              focusedSupportsEffort ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                dimColor: true,
                children: [
                  /* @__PURE__ */ jsx_dev_runtime.jsxDEV(EffortLevelIndicator, {
                    effort: displayEffort
                  }, undefined, false, undefined, this),
                  " ",
                  capitalize_default(displayEffort),
                  " effort",
                  displayEffort === focusedDefaultEffort ? " (default)" : "",
                  " ",
                  /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                    color: "subtle",
                    children: "← → to adjust"
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                color: "subtle",
                children: [
                  /* @__PURE__ */ jsx_dev_runtime.jsxDEV(EffortLevelIndicator, {
                    effort: undefined
                  }, undefined, false, undefined, this),
                  " Effort not supported",
                  focusedModelName ? ` for ${focusedModelName}` : ""
                ]
              }, undefined, true, undefined, this),
              focusedSupportsThinking ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                dimColor: true,
                children: [
                  /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                    color: thinkingEnabled ? "ur" : "subtle",
                    children: thinkingEnabled ? "◆" : "◇"
                  }, undefined, false, undefined, this),
                  " ",
                  "Thinking ",
                  thinkingEnabled ? "on" : "off",
                  " ",
                  /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                    color: "subtle",
                    children: "t to toggle"
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                color: "subtle",
                children: [
                  "◇ Thinking not supported",
                  focusedModelName ? ` for ${focusedModelName}` : ""
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this),
          pickerError && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
            marginBottom: 1,
            children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              color: "error",
              children: pickerError
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this),
          fastModeNotice
        ]
      }, undefined, true, undefined, this),
      isStandaloneCommand && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        dimColor: true,
        italic: true,
        children: exitState.pending ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
          children: [
            "Press ",
            exitState.keyName,
            " again to exit"
          ]
        }, undefined, true, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Byline, {
          children: [
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(KeyboardShortcutHint, {
              shortcut: "Enter",
              action: "confirm"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ConfigurableShortcutHint, {
              action: "select:cancel",
              context: "Select",
              fallback: "Esc",
              description: "exit"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this)
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
  if (!isStandaloneCommand) {
    return content;
  }
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Pane, {
    color: "permission",
    children: content
  }, undefined, false, undefined, this);
}
function noop() {}
function resolveOptionModel(value) {
  if (!value)
    return;
  return value === NO_PREFERENCE ? getDefaultMainLoopModel() : parseUserSpecifiedModel(value);
}
function EffortLevelIndicator({
  effort
}) {
  const color = effort ? "ur" : "subtle";
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
    color,
    children: effortLevelToSymbol(effort ?? "low")
  }, undefined, false, undefined, this);
}
function cycleEffortLevel(current, direction, includeMax) {
  const levels = includeMax ? ["low", "medium", "high", "max"] : ["low", "medium", "high"];
  const idx = levels.indexOf(current);
  const currentIndex = idx !== -1 ? idx : levels.indexOf("high");
  if (direction === "right") {
    return levels[(currentIndex + 1) % levels.length];
  }
  return levels[(currentIndex - 1 + levels.length) % levels.length];
}
function getDefaultEffortLevelForOption(value) {
  const resolved = resolveOptionModel(value) ?? getDefaultMainLoopModel();
  const defaultValue = getDefaultEffortForModel(resolved);
  return defaultValue !== undefined ? convertEffortValueToLevel(defaultValue) : "high";
}
var import_react, jsx_dev_runtime, NO_PREFERENCE = "__NO_PREFERENCE__", selectEffortValue = (s) => s.effortValue, selectFastMode = (s) => isFastModeEnabled() ? s.fastMode : false, selectThinkingEnabled = (s) => s.thinkingEnabled;
var init_ModelPicker = __esm(() => {
  init_capitalize();
  init_useExitOnCtrlCDWithKeybindings();
  init_analytics();
  init_fastMode();
  init_ink();
  init_useKeybinding();
  init_AppState();
  init_effort();
  init_model();
  init_settings();
  init_thinking();
  init_providerRegistry();
  init_ConfigurableShortcutHint();
  init_CustomSelect();
  init_Byline();
  init_KeyboardShortcutHint();
  init_Pane();
  init_EffortIndicator();
  import_react = __toESM(require_react(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});

// src/utils/extraUsage.ts
function isBilledAsExtraUsage(model, isFastMode, ismodelO1mMerged) {
  if (!isURAISubscriber())
    return false;
  if (isFastMode)
    return true;
  if (model === null || !has1mContext(model))
    return false;
  const m = model.toLowerCase().replace(/\[1m\]$/, "").trim();
  const ismodelO = m === "modelo";
  const ismodelS = m === "models";
  if (ismodelO && ismodelO1mMerged)
    return false;
  return ismodelO || ismodelS;
}
var init_extraUsage = __esm(() => {
  init_auth();
  init_context();
});

export { ModelPicker, init_ModelPicker, isBilledAsExtraUsage, init_extraUsage };
