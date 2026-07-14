import {
  init_extraUsage,
  isBilledAsExtraUsage
} from "./index-rq7tb9kv.js";
import {
  Byline,
  ConfigurableShortcutHint,
  KeyboardShortcutHint,
  Select,
  TextInput,
  checkmodelO1mAccess,
  checkmodelS1mAccess,
  convertEffortValueToLevel,
  init_AppState,
  init_Byline,
  init_ConfigurableShortcutHint,
  init_CustomSelect,
  init_KeyboardShortcutHint,
  init_TextInput,
  init_check1mAccess,
  init_effort,
  init_thinking,
  modelSupportsEffort,
  shouldEnableThinkingByDefault,
  useAppState,
  useSetAppState
} from "./index-3xrbnz6c.js";
import"./index-kkermbsd.js";
import {
  Pane,
  init_Pane
} from "./index-gph76kef.js";
import"./index-2j7c2ame.js";
import {
  ThemedBox_default,
  ThemedText,
  init_ink,
  require_compiler_runtime
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
  authAliasForProvider,
  clearFastModeCooldown,
  getActiveProviderSettings,
  getDefaultMainLoopModelSetting,
  getInitialSettings,
  getProviderAccessTypeLabel,
  getProviderRuntimeBlockReason,
  getProviderStatus,
  getSettingsForSource,
  init_aliases,
  init_fastMode,
  init_model,
  init_modelAllowlist,
  init_providerClient,
  init_providerCredentials,
  init_providerRegistry,
  init_settings1 as init_settings,
  init_source,
  isFastModeAvailable,
  isFastModeEnabled,
  isFastModeSupportedByModel,
  isModelAllowed,
  ismodelO1mMergeEnabled,
  listModelsForProviderWithSource,
  listProviders,
  parseUserSpecifiedModel,
  renderDefaultModelSetting,
  resolveActiveProviderModel,
  setProviderApiKey,
  setProviderModel,
  source_default,
  updateSettingsForSource,
  validateProviderModelPair
} from "./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import"./index-z5aeypvg.js";
import {
  init_analytics,
  logEvent
} from "./index-5jmh1e0k.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-wxsgjqjk.js";
import"./index-s1a1wahe.js";
import"./index-wred0kdg.js";
import"./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import {
  COMMON_HELP_ARGS,
  COMMON_INFO_ARGS,
  init_xml
} from "./index-4bphgmcc.js";
import"./index-7bd814mt.js";
import"./index-m9qhxms7.js";
import"./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/components/ProviderFirstModelPicker.tsx
function ProviderFirstModelPicker({
  initial,
  onSelect,
  onCancel,
  isStandaloneCommand,
  headerText
}) {
  const setAppState = useSetAppState();
  const currentProvider = useAppState(selectCurrentProvider);
  const [step, setStep] = import_react.useState("provider");
  const [focusedProviderValue, setFocusedProviderValue] = import_react.useState(null);
  const [focusedModelValue, setFocusedModelValue] = import_react.useState(null);
  const [providerOptions, setProviderOptions] = import_react.useState([]);
  const [modelOptions, setModelOptions] = import_react.useState([]);
  const [loadingProviders, setLoadingProviders] = import_react.useState(true);
  const [loadingModels, setLoadingModels] = import_react.useState(false);
  const [selectedProvider, setSelectedProvider] = import_react.useState(null);
  const [modelSource, setModelSource] = import_react.useState("static");
  const [modelWarning, setModelWarning] = import_react.useState(null);
  const [providerWarning, setProviderWarning] = import_react.useState(null);
  const [connectingProvider, setConnectingProvider] = import_react.useState(null);
  const [apiKeyInput, setApiKeyInput] = import_react.useState("");
  const [connectError, setConnectError] = import_react.useState(null);
  const effortValue = useAppState(selectEffortValue);
  const [effort] = import_react.useState(effortValue !== undefined ? convertEffortValueToLevel(effortValue) : undefined);
  const appThinkingEnabled = useAppState(selectThinkingEnabled);
  const hasToggledThinking = false;
  const [thinkingEnabled] = import_react.useState(() => appThinkingEnabled ?? shouldEnableThinkingByDefault());
  import_react.useEffect(() => {
    async function loadProviderStatus() {
      setLoadingProviders(true);
      const providers = listProviders({ includeExternalAppBridges: true });
      const settings = getSettingsForSource("userSettings");
      const options = await Promise.all(providers.map(async (provider) => {
        const status = await getProviderStatus(provider.id, {
          settings: settings ?? undefined
        });
        const accessType = getProviderAccessTypeLabel(provider);
        return {
          value: provider.id,
          label: provider.displayName,
          description: `${accessType} · ${provider.credentialType} · ${provider.runtimeKind === "external-app" ? "external app bridge" : status.label}`,
          status: status.status,
          statusLabel: status.label,
          accessType,
          credentialType: provider.credentialType,
          runtimeBlockedReason: getProviderRuntimeBlockReason(provider.id),
          provider
        };
      }));
      setProviderOptions(options);
      setLoadingProviders(false);
    }
    loadProviderStatus();
  }, []);
  import_react.useEffect(() => {
    if (!selectedProvider)
      return;
    async function loadModels() {
      setLoadingModels(true);
      setModelWarning(null);
      const providerId = selectedProvider.value;
      const controller = new AbortController;
      const result = await listModelsForProviderWithSource(providerId, {
        settings: getSettingsForSource("userSettings") ?? undefined,
        signal: controller.signal
      });
      controller.abort();
      const options = result.models.map((model) => ({
        value: model.id,
        label: model.displayName,
        description: `${model.description} · ${result.source}`
      }));
      setModelOptions(options);
      setModelSource(result.source);
      setModelWarning(result.warning ?? null);
      setLoadingModels(false);
    }
    loadModels();
  }, [selectedProvider]);
  const providerSelectOptions = providerOptions.map((opt) => ({
    value: opt.value,
    label: opt.label,
    description: opt.description
  }));
  const modelSelectOptions = modelOptions.map((opt) => ({
    ...opt,
    value: opt.value
  }));
  const providerVisibleCount = Math.min(10, providerSelectOptions.length);
  const modelVisibleCount = Math.min(10, modelSelectOptions.length);
  const focusedProvider = providerOptions.find((p) => p.value === focusedProviderValue);
  const focusedModel = modelOptions.find((m) => m.value === focusedModelValue);
  function handleProviderFocus(value) {
    setFocusedProviderValue(value);
    setProviderWarning(null);
  }
  function handleModelFocus(value) {
    setFocusedModelValue(value);
  }
  function handleProviderSelect(value) {
    const provider = providerOptions.find((p) => p.value === value);
    if (provider) {
      if (provider.runtimeBlockedReason) {
        setProviderWarning(provider.runtimeBlockedReason);
        return;
      }
      if (provider.status !== "connected") {
        if (provider.credentialType === "api-key") {
          setConnectingProvider(provider);
          setApiKeyInput("");
          setConnectError(null);
          setStep("connect");
          return;
        }
        if (provider.provider.accessType === "subscription") {
          setProviderWarning(`${provider.label} is not logged in. Sign in with \`ur auth ${authAliasForProvider(provider.value)}\` (uses your own subscription), then reselect.`);
          return;
        }
        setProviderWarning(`Provider "${provider.value}" is ${provider.status}: ${provider.statusLabel}. Run \`ur provider doctor ${provider.value}\`, or choose a connected API/local/server provider.`);
        return;
      }
      setSelectedProvider(provider);
      setStep("model");
      setFocusedModelValue(null);
    }
  }
  function handleModelSelect(value) {
    logEvent("tengu_model_command_menu_effort", {
      effort,
      provider: selectedProvider?.value,
      model: value,
      source: modelSource
    });
    if (selectedProvider) {
      const validation = validateProviderModelPair(selectedProvider.value, value, {
        availableModels: modelOptions.map((option) => option.value)
      });
      if (validation.valid === false) {
        setModelWarning(validation.error);
        return;
      }
    }
    let runtimeBackend;
    if (selectedProvider) {
      try {
        const runtime = resolveActiveProviderModel({
          settings: {
            provider: {
              active: selectedProvider.value,
              model: value
            },
            model: value
          },
          model: value,
          source: "/model"
        });
        runtimeBackend = runtime.runtimeBackend;
      } catch (error) {
        setModelWarning(error instanceof Error ? error.message : String(error));
        return;
      }
      const saveResult = setProviderModel(selectedProvider.value, value, {
        availableModels: modelOptions.map((option) => option.value),
        modelSource
      });
      if (!saveResult.ok) {
        setModelWarning(saveResult.message);
        return;
      }
    }
    setAppState((prev) => ({
      ...prev,
      provider: {
        ...prev.provider ?? {},
        active: selectedProvider?.value,
        model: value
      },
      effortValue: effort,
      ...hasToggledThinking ? { thinkingEnabled } : {}
    }));
    onSelect(value, effort, selectedProvider ? {
      providerId: selectedProvider.value,
      providerName: selectedProvider.label,
      accessType: selectedProvider.accessType,
      modelSource,
      runtimeBackend: runtimeBackend ?? "unknown"
    } : undefined);
  }
  function handleBack() {
    setStep("provider");
    setSelectedProvider(null);
    setModelOptions([]);
    setModelWarning(null);
  }
  function handleKeySubmit() {
    if (!connectingProvider)
      return;
    const key = apiKeyInput.trim();
    if (!key) {
      setConnectError("Enter your API key (or press Esc to go back).");
      return;
    }
    const saved = setProviderApiKey(connectingProvider.value, key);
    if (!saved.ok) {
      setConnectError(saved.message);
      return;
    }
    setApiKeyInput("");
    setConnectError(null);
    setSelectedProvider(connectingProvider);
    setStep("model");
  }
  function handleKeyCancel() {
    setApiKeyInput("");
    setConnectingProvider(null);
    setConnectError(null);
    setStep("provider");
  }
  if (step === "connect" && connectingProvider) {
    const envKey = connectingProvider.provider.envKey;
    const content2 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
          marginBottom: 1,
          flexDirection: "column",
          children: [
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              color: "remember",
              bold: true,
              children: [
                "Connect ",
                connectingProvider.label
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              dimColor: true,
              children: "Paste your API key to use your own account. It is stored securely in your OS keychain and reused automatically — you only do this once."
            }, undefined, false, undefined, this),
            envKey && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              dimColor: true,
              color: "subtle",
              children: [
                "Equivalent to setting ",
                envKey,
                ". Get a key from the provider's dashboard."
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
          children: [
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              children: "API key: "
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(TextInput, {
              value: apiKeyInput,
              onChange: setApiKeyInput,
              onSubmit: handleKeySubmit,
              mask: "*",
              placeholder: "paste key, then Enter"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        connectError && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
          marginTop: 1,
          children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
            color: "error",
            children: connectError
          }, undefined, false, undefined, this)
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
          marginTop: 1,
          children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Byline, {
            children: [
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(KeyboardShortcutHint, {
                shortcut: "Enter",
                action: "store key & load models"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(KeyboardShortcutHint, {
                shortcut: "Esc",
                action: "back"
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this)
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
    return isStandaloneCommand ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Pane, {
      color: "permission",
      children: content2
    }, undefined, false, undefined, this) : content2;
  }
  if (step === "provider") {
    const content2 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
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
                  children: "Select provider"
                }, undefined, false, undefined, this),
                /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                  dimColor: true,
                  children: headerText ?? "Choose a model provider. Each provider has its own set of models. After selection, you will choose a model from that provider only."
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            loadingProviders ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
              marginBottom: 1,
              children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                dimColor: true,
                children: "Loading provider status..."
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
              children: [
                /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                  flexDirection: "column",
                  marginBottom: 1,
                  children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                    flexDirection: "column",
                    children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Select, {
                      defaultValue: currentProvider,
                      defaultFocusValue: focusedProviderValue ?? currentProvider,
                      options: providerSelectOptions,
                      onChange: handleProviderSelect,
                      onFocus: handleProviderFocus,
                      onCancel: onCancel ?? noop,
                      visibleOptionCount: providerVisibleCount
                    }, undefined, false, undefined, this)
                  }, undefined, false, undefined, this)
                }, undefined, false, undefined, this),
                focusedProvider && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                  marginBottom: 1,
                  flexDirection: "column",
                  children: [
                    /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                      marginBottom: 1,
                      children: [
                        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                          bold: true,
                          children: focusedProvider.label
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                          dimColor: true,
                          children: [
                            " · ",
                            focusedProvider.accessType,
                            " · ",
                            focusedProvider.credentialType
                          ]
                        }, undefined, true, undefined, this)
                      ]
                    }, undefined, true, undefined, this),
                    /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                      dimColor: true,
                      children: [
                        "Status: ",
                        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                          color: focusedProvider.status === "connected" ? "success" : "error",
                          children: focusedProvider.status
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                          dimColor: true,
                          children: [
                            " · ",
                            focusedProvider.statusLabel
                          ]
                        }, undefined, true, undefined, this)
                      ]
                    }, undefined, true, undefined, this),
                    /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                      dimColor: true,
                      children: focusedProvider.provider.accessPathLabel
                    }, undefined, false, undefined, this),
                    /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                      dimColor: true,
                      color: focusedProvider.runtimeBlockedReason ? "error" : "subtle",
                      children: [
                        "Runtime: ",
                        focusedProvider.provider.runtimeKind === "external-app" ? "external app bridge (disabled for independent UR runtime)" : "UR-native"
                      ]
                    }, undefined, true, undefined, this),
                    focusedProvider.status !== "connected" && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                      dimColor: true,
                      color: "subtle",
                      children: [
                        "Not connected — run `ur connect ",
                        focusedProvider.value,
                        "` (subscription login or API key), then reselect. Troubleshoot: `ur provider doctor ",
                        focusedProvider.value,
                        "`"
                      ]
                    }, undefined, true, undefined, this),
                    providerWarning && focusedProvider.value === focusedProviderValue && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                      dimColor: true,
                      color: "error",
                      children: providerWarning
                    }, undefined, false, undefined, this)
                  ]
                }, undefined, true, undefined, this)
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this),
        isStandaloneCommand && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          dimColor: true,
          italic: true,
          children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Byline, {
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
      return content2;
    }
    return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Pane, {
      color: "permission",
      children: content2
    }, undefined, false, undefined, this);
  }
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
                children: [
                  "Showing models for ",
                  selectedProvider?.label,
                  " (",
                  selectedProvider?.accessType,
                  ")"
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                dimColor: true,
                color: "subtle",
                children: [
                  "Model source: ",
                  modelSource
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                dimColor: true,
                color: "subtle",
                children: "Press Esc to change provider"
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this),
          loadingModels ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
            marginBottom: 1,
            children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              dimColor: true,
              children: "Loading models..."
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
            children: [
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                flexDirection: "column",
                marginBottom: 1,
                children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                  flexDirection: "column",
                  children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Select, {
                    defaultValue: null,
                    defaultFocusValue: focusedModelValue ?? undefined,
                    options: modelSelectOptions,
                    onChange: handleModelSelect,
                    onFocus: handleModelFocus,
                    onCancel: handleBack,
                    visibleOptionCount: modelVisibleCount
                  }, undefined, false, undefined, this)
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this),
              focusedModel && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                marginBottom: 1,
                flexDirection: "column",
                children: [
                  /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                    dimColor: true,
                    children: [
                      focusedModel.label,
                      " · ",
                      focusedModel.description
                    ]
                  }, undefined, true, undefined, this),
                  /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                    dimColor: true,
                    color: "subtle",
                    children: [
                      "Source: ",
                      modelSource
                    ]
                  }, undefined, true, undefined, this),
                  modelSupportsEffort(parseUserSpecifiedModel(focusedModel.value)) && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                    dimColor: true,
                    children: "← → to adjust effort"
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this),
              modelWarning && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                marginBottom: 1,
                flexDirection: "column",
                children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                  dimColor: true,
                  color: "error",
                  children: modelWarning
                }, undefined, false, undefined, this)
              }, undefined, false, undefined, this),
              modelOptions.length === 0 && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                marginBottom: 1,
                flexDirection: "column",
                children: [
                  /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                    dimColor: true,
                    color: "error",
                    children: "No models available for this provider."
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                    dimColor: true,
                    color: "subtle",
                    children: [
                      "Run `ur provider doctor ",
                      selectedProvider?.value,
                      "` to troubleshoot."
                    ]
                  }, undefined, true, undefined, this)
                ]
              }, undefined, true, undefined, this)
            ]
          }, undefined, true, undefined, this)
        ]
      }, undefined, true, undefined, this),
      isStandaloneCommand && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        dimColor: true,
        italic: true,
        children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Byline, {
          children: [
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(KeyboardShortcutHint, {
              shortcut: "Enter",
              action: "confirm"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(KeyboardShortcutHint, {
              shortcut: "Esc",
              action: "back"
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
var import_react, jsx_dev_runtime, selectCurrentProvider = (s) => s.provider?.active ?? "ollama", selectEffortValue = (s) => s.effortValue, selectThinkingEnabled = (s) => s.thinkingEnabled;
var init_ProviderFirstModelPicker = __esm(() => {
  init_analytics();
  init_providerRegistry();
  init_providerCredentials();
  init_AppState();
  init_settings();
  init_ink();
  init_AppState();
  init_ConfigurableShortcutHint();
  init_CustomSelect();
  init_TextInput();
  init_Byline();
  init_KeyboardShortcutHint();
  init_Pane();
  init_effort();
  init_model();
  init_thinking();
  init_providerClient();
  import_react = __toESM(require_react(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/commands/model/model.tsx
function ModelPickerWrapper(t0) {
  const $ = import_compiler_runtime.c(17);
  const {
    onDone
  } = t0;
  const mainLoopModel = useAppState(_temp);
  const mainLoopModelForSession = useAppState(_temp2);
  const isFastMode = useAppState(_temp3);
  const setAppState = useSetAppState();
  let t1;
  if ($[0] !== mainLoopModel || $[1] !== onDone) {
    t1 = function handleCancel2() {
      logEvent("tengu_model_command_menu", {
        action: "cancel"
      });
      const displayModel = renderModelLabel(mainLoopModel);
      onDone(`Kept model as ${source_default.bold(displayModel)}`, {
        display: "system"
      });
    };
    $[0] = mainLoopModel;
    $[1] = onDone;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const handleCancel = t1;
  let t2;
  if ($[3] !== isFastMode || $[4] !== mainLoopModel || $[5] !== onDone || $[6] !== setAppState) {
    t2 = function handleSelect2(model, effort, metadata) {
      logEvent("tengu_model_command_menu", {
        action: model,
        from_model: mainLoopModel,
        to_model: model
      });
      setAppState((prev) => ({
        ...prev,
        mainLoopModel: model,
        mainLoopModelForSession: null
      }));
      if (model && metadata) {
        setProviderModel(metadata.providerId, model, {
          modelSource: metadata.modelSource
        });
      }
      let message = metadata ? `Selected provider: ${source_default.bold(metadata.providerName)} (${metadata.accessType})
Selected model: ${source_default.bold(renderModelLabel(model))}
Model source: ${metadata.modelSource}
Runtime backend: ${metadata.runtimeBackend}` : `Set model to ${source_default.bold(renderModelLabel(model))}`;
      if (effort !== undefined) {
        message = message + ` with ${source_default.bold(effort)} effort`;
      }
      let wasFastModeToggledOn = undefined;
      if (isFastModeEnabled()) {
        clearFastModeCooldown();
        if (!isFastModeSupportedByModel(model) && isFastMode) {
          setAppState(_temp4);
          wasFastModeToggledOn = false;
        } else {
          if (isFastModeSupportedByModel(model) && isFastModeAvailable() && isFastMode) {
            message = message + " · Fast mode ON";
            wasFastModeToggledOn = true;
          }
        }
      }
      if (isBilledAsExtraUsage(model, wasFastModeToggledOn === true, ismodelO1mMergeEnabled())) {
        message = message + " · Billed as extra usage";
      }
      if (wasFastModeToggledOn === false) {
        message = message + " · Fast mode OFF";
      }
      onDone(message);
    };
    $[3] = isFastMode;
    $[4] = mainLoopModel;
    $[5] = onDone;
    $[6] = setAppState;
    $[7] = t2;
  } else {
    t2 = $[7];
  }
  const handleSelect = t2;
  let t3;
  if ($[8] !== isFastMode || $[9] !== mainLoopModel) {
    t3 = isFastModeEnabled() && isFastMode && isFastModeSupportedByModel(mainLoopModel) && isFastModeAvailable();
    $[8] = isFastMode;
    $[9] = mainLoopModel;
    $[10] = t3;
  } else {
    t3 = $[10];
  }
  let t4;
  if ($[11] !== handleCancel || $[12] !== handleSelect || $[13] !== mainLoopModel || $[14] !== mainLoopModelForSession || $[15] !== t3) {
    t4 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ProviderFirstModelPicker, {
      initial: mainLoopModel,
      onSelect: handleSelect,
      onCancel: handleCancel,
      isStandaloneCommand: true
    }, undefined, false, undefined, this);
    $[11] = handleCancel;
    $[12] = handleSelect;
    $[13] = mainLoopModel;
    $[14] = mainLoopModelForSession;
    $[15] = t3;
    $[16] = t4;
  } else {
    t4 = $[16];
  }
  return t4;
}
function _temp4(prev_0) {
  return {
    ...prev_0,
    fastMode: false
  };
}
function _temp3(s_1) {
  return s_1.fastMode;
}
function _temp2(s_0) {
  return s_0.mainLoopModelForSession;
}
function _temp(s) {
  return s.mainLoopModel;
}
function SetModelAndClose({
  args,
  onDone
}) {
  const isFastMode = useAppState((s) => s.fastMode);
  const providerSelection = useAppState((s) => s.provider);
  const setAppState = useSetAppState();
  const model = args === "default" ? null : args;
  React.useEffect(() => {
    async function handleModelChange() {
      if (model && !isModelAllowed(model)) {
        onDone(`Model '${model}' is not available. Your organization restricts model selection.`, {
          display: "system"
        });
        return;
      }
      if (model && ismodelO1mUnavailable(model)) {
        onDone(`The selected 1M-context model is not available for your account. Choose another model with /model.`, {
          display: "system"
        });
        return;
      }
      if (model && ismodelS1mUnavailable(model)) {
        onDone(`The selected 1M-context model is not available for your account. Choose another model with /model.`, {
          display: "system"
        });
        return;
      }
      const currentProvider = providerSelection?.active ?? getActiveProviderSettings(getInitialSettings()).active ?? "ollama";
      if (!model) {
        setModel(null, currentProvider);
        return;
      }
      const providerValidation = validateProviderModelPair(currentProvider, model);
      if (providerValidation.valid === false) {
        onDone(`Invalid model for current provider:
  Selected provider: ${currentProvider}
  Selected model: ${model}
  Valid models for ${currentProvider}: ${providerValidation.validModels.join(", ") || "(no models discovered)"}
  Suggested action: Run /model and choose a model from ${currentProvider}${providerValidation.suggestedModel ? `, or run: ur config set model ${providerValidation.suggestedModel}` : ""}
  Error: ${providerValidation.error}`, {
          display: "system"
        });
        return;
      }
      const saved = setProviderModel(currentProvider, model);
      if (!saved.ok) {
        onDone(saved.message, {
          display: "system"
        });
        return;
      }
      setModel(model, currentProvider);
      return;
    }
    function setModel(modelValue, provider) {
      setAppState((prev) => ({
        ...prev,
        mainLoopModel: modelValue,
        mainLoopModelForSession: null,
        ...provider ? {
          provider: {
            ...prev.provider ?? {},
            active: provider,
            model: modelValue ?? undefined
          }
        } : {}
      }));
      if (modelValue === null) {
        updateSettingsForSource("localSettings", {
          model: undefined,
          provider: {
            model: undefined
          }
        });
      }
      let message = `Set model to ${source_default.bold(renderModelLabel(modelValue))}`;
      let wasFastModeToggledOn = undefined;
      if (isFastModeEnabled()) {
        clearFastModeCooldown();
        if (!isFastModeSupportedByModel(modelValue) && isFastMode) {
          setAppState((prev_0) => ({
            ...prev_0,
            fastMode: false
          }));
          wasFastModeToggledOn = false;
        } else if (isFastModeSupportedByModel(modelValue) && isFastMode) {
          message += ` · Fast mode ON`;
          wasFastModeToggledOn = true;
        }
      }
      if (isBilledAsExtraUsage(modelValue, wasFastModeToggledOn === true, ismodelO1mMergeEnabled())) {
        message += ` · Billed as extra usage`;
      }
      if (wasFastModeToggledOn === false) {
        message += ` · Fast mode OFF`;
      }
      onDone(message);
    }
    handleModelChange();
  }, [model, onDone, providerSelection?.active, setAppState]);
  return null;
}
function ismodelO1mUnavailable(model) {
  const m = model.toLowerCase();
  return !checkmodelO1mAccess() && !ismodelO1mMergeEnabled() && m.includes("modelo") && m.includes("[1m]");
}
function ismodelS1mUnavailable(model) {
  const m = model.toLowerCase();
  return !checkmodelS1mAccess() && m.includes("models") && m.includes("[1m]");
}
function ShowModelAndClose(t0) {
  const {
    onDone
  } = t0;
  const mainLoopModel = useAppState(_temp7);
  const mainLoopModelForSession = useAppState(_temp8);
  const effortValue = useAppState(_temp9);
  const displayModel = renderModelLabel(mainLoopModel);
  const effortInfo = effortValue !== undefined ? ` (effort: ${effortValue})` : "";
  if (mainLoopModelForSession) {
    onDone(`Current model: ${source_default.bold(renderModelLabel(mainLoopModelForSession))} (session override from plan mode)
Base model: ${displayModel}${effortInfo}`);
  } else {
    onDone(`Current model: ${displayModel}${effortInfo}`);
  }
  return null;
}
function _temp9(s_1) {
  return s_1.effortValue;
}
function _temp8(s_0) {
  return s_0.mainLoopModelForSession;
}
function _temp7(s) {
  return s.mainLoopModel;
}
function renderModelLabel(model) {
  const rendered = renderDefaultModelSetting(model ?? getDefaultMainLoopModelSetting());
  return model === null ? `${rendered} (default)` : rendered;
}
var import_compiler_runtime, React, jsx_dev_runtime2, call = async (onDone, _context, args) => {
  args = args?.trim() || "";
  if (COMMON_INFO_ARGS.includes(args)) {
    logEvent("tengu_model_command_inline_help", {
      args
    });
    return /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ShowModelAndClose, {
      onDone
    }, undefined, false, undefined, this);
  }
  if (COMMON_HELP_ARGS.includes(args)) {
    onDone("Run /model to open the model selection menu, or /model [modelName] to set the model.", {
      display: "system"
    });
    return;
  }
  if (args) {
    logEvent("tengu_model_command_inline", {
      args
    });
    return /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(SetModelAndClose, {
      args,
      onDone
    }, undefined, false, undefined, this);
  }
  return /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ModelPickerWrapper, {
    onDone
  }, undefined, false, undefined, this);
};
var init_model2 = __esm(() => {
  init_source();
  init_ProviderFirstModelPicker();
  init_xml();
  init_analytics();
  init_AppState();
  init_extraUsage();
  init_fastMode();
  init_aliases();
  init_check1mAccess();
  init_model();
  init_modelAllowlist();
  init_providerRegistry();
  init_settings();
  import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
  React = __toESM(require_react(), 1);
  jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
});
init_model2();

export {
  call
};
