import {
  Byline,
  ConfigurableShortcutHint,
  KeyboardShortcutHint,
  Select,
  init_AppState,
  init_Byline,
  init_ConfigurableShortcutHint,
  init_CustomSelect,
  init_KeyboardShortcutHint,
  init_useSettings,
  useAppState,
  useSetAppState,
  useSettings
} from "./index-qv8mzsdh.js";
import {
  Pane,
  init_Pane
} from "./index-by2vmtsd.js";
import"./index-kkermbsd.js";
import"./index-v2hw7r4c.js";
import {
  ThemedBox_default,
  ThemedText,
  init_ink
} from "./index-xy62w38z.js";
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
import {
  require_jsx_dev_runtime,
  require_react
} from "./index-mpvjr5hg.js";
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
  getActiveProviderSettings,
  getInitialSettings,
  getProviderAccessTypeLabel,
  getProviderRuntimeBlockReason,
  getProviderRuntimeInfo,
  init_providerRegistry,
  init_settings1 as init_settings,
  init_source,
  listProviders,
  setSafeProviderConfig,
  source_default
} from "./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import {
  init_analytics,
  logEvent
} from "./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import"./index-a9y6sg4d.js";
import"./index-dsy9thtk.js";
import"./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import {
  COMMON_HELP_ARGS,
  COMMON_INFO_ARGS,
  init_xml
} from "./index-2g4gegqj.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm,
  __require,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/components/ProviderPicker.tsx
function ProviderPicker({
  initial,
  onSelect,
  onCancel,
  isStandaloneCommand,
  headerText
}) {
  const setAppState = useSetAppState();
  const currentProvider = useAppState(selectCurrentProvider);
  const [focusedValue, setFocusedValue] = import_react.useState(initial ?? currentProvider);
  const providers = listProviders();
  const selectOptions = providers.map((provider) => ({
    value: provider.id,
    label: provider.displayName,
    description: `${getProviderAccessTypeLabel(provider)} · ${provider.credentialType} · ${provider.runtimeKind === "external-app" ? "external app bridge" : "UR-native"}`
  }));
  const visibleCount = Math.min(10, selectOptions.length);
  const hiddenCount = Math.max(0, selectOptions.length - visibleCount);
  const focusedProvider = providers.find((p) => p.id === focusedValue);
  const focusedBlockReason = focusedProvider ? getProviderRuntimeBlockReason(focusedProvider.id) : null;
  function handleFocus(value) {
    setFocusedValue(value);
  }
  function handleSelect(value) {
    logEvent("tengu_provider_command_menu", {
      action: value,
      from_provider: currentProvider,
      to_provider: value
    });
    const runtimeBlock = getProviderRuntimeBlockReason(value);
    if (runtimeBlock) {
      return;
    }
    const result = setSafeProviderConfig("provider", value);
    if (!result.ok) {
      return;
    }
    const saved = getActiveProviderSettings(getInitialSettings());
    setAppState((prev) => ({
      ...prev,
      provider: {
        ...prev.provider ?? {},
        active: saved.active ?? value,
        model: saved.model
      }
    }));
    onSelect(value);
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
                children: "Select provider"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                dimColor: true,
                children: headerText ?? "Choose a model provider. This will filter the available models to only those from the selected provider."
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
            flexDirection: "column",
            marginBottom: 1,
            children: [
              /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
                flexDirection: "column",
                children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Select, {
                  defaultValue: currentProvider,
                  defaultFocusValue: focusedValue,
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
              focusedProvider && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                dimColor: true,
                children: [
                  focusedProvider.displayName,
                  " (",
                  focusedProvider.id,
                  ") ·",
                  " ",
                  getProviderAccessTypeLabel(focusedProvider),
                  " ·",
                  " ",
                  focusedProvider.accessPathLabel
                ]
              }, undefined, true, undefined, this),
              focusedBlockReason && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                dimColor: true,
                color: "error",
                children: focusedBlockReason
              }, undefined, false, undefined, this)
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
    return content;
  }
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Pane, {
    color: "permission",
    children: content
  }, undefined, false, undefined, this);
}
function noop() {}
var import_react, jsx_dev_runtime, selectCurrentProvider = (s) => s.provider?.active ?? "ollama";
var init_ProviderPicker = __esm(() => {
  init_analytics();
  init_providerRegistry();
  init_AppState();
  init_settings();
  init_ink();
  init_AppState();
  init_ConfigurableShortcutHint();
  init_CustomSelect();
  init_Byline();
  init_KeyboardShortcutHint();
  init_Pane();
  import_react = __toESM(require_react(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/commands/provider/provider.tsx
function ApplyProviderAndClose({
  provider,
  message,
  onDone
}) {
  const setAppState = useSetAppState();
  React.useEffect(() => {
    setAppState((prev) => ({
      ...prev,
      provider: {
        ...prev.provider ?? {},
        ...provider
      }
    }));
    onDone(message);
  }, [message, onDone, provider, setAppState]);
  return null;
}
function ProviderPickerWrapper({
  onDone
}) {
  const settings = useSettings();
  const providerRuntime = getProviderRuntimeInfo(settings);
  const setAppState = useSetAppState();
  function handleCancel() {
    logEvent("tengu_provider_command_menu", {
      action: "cancel"
    });
    const displayProvider = providerRuntime.providerLabel;
    onDone(`Kept provider as ${source_default.bold(displayProvider)}`, {
      display: "system"
    });
  }
  function handleSelect(provider) {
    logEvent("tengu_provider_command_menu", {
      action: provider,
      from_provider: providerRuntime.provider,
      to_provider: provider
    });
    const newProviderRuntime = getProviderRuntimeInfo({
      provider: { active: provider }
    });
    let message = `Set provider to ${source_default.bold(newProviderRuntime.providerLabel)}`;
    if (newProviderRuntime.model) {
      message += ` · Model: ${source_default.bold(newProviderRuntime.model)}`;
    }
    if (newProviderRuntime.baseUrl) {
      message += ` · URL: ${newProviderRuntime.baseUrl}`;
    }
    onDone(message);
  }
  return /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ProviderPicker, {
    initial: providerRuntime.provider,
    onSelect: handleSelect,
    onCancel: handleCancel,
    isStandaloneCommand: true
  }, undefined, false, undefined, this);
}
function ShowProviderAndClose({
  onDone
}) {
  const settings = useSettings();
  const providerRuntime = getProviderRuntimeInfo(settings);
  let message = `Current provider: ${source_default.bold(providerRuntime.providerLabel)} (${providerRuntime.provider})`;
  message += `
Auth mode: ${providerRuntime.authLabel}`;
  message += `
Provider kind: ${providerRuntime.providerKind}`;
  message += `
Uses external CLI: ${providerRuntime.usesExternalCli ? "yes" : "no"}`;
  message += `
UR-native tool calls: ${providerRuntime.supportsNativeToolCalls ? "yes" : "no"}`;
  message += `
UR-native streaming: ${providerRuntime.supportsNativeStreaming ? "yes" : "no"}`;
  message += `
Runtime backend: ${providerRuntime.runtimeBackend}`;
  message += `
Safety boundary: ${providerRuntime.safetyBoundaryLabel}`;
  if (providerRuntime.model) {
    message += `
Model: ${source_default.bold(providerRuntime.model)}`;
  }
  if (providerRuntime.baseUrl) {
    message += `
Base URL: ${providerRuntime.baseUrl}`;
  }
  if (providerRuntime.fallback) {
    message += `
Fallback: ${providerRuntime.fallback}`;
  }
  onDone(message);
  return null;
}
var React, jsx_dev_runtime2, call = async (onDone, _context, args) => {
  args = args?.trim() || "";
  if (COMMON_INFO_ARGS.includes(args)) {
    logEvent("tengu_provider_command_inline_help", {
      args
    });
    return /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ShowProviderAndClose, {
      onDone
    }, undefined, false, undefined, this);
  }
  if (COMMON_HELP_ARGS.includes(args)) {
    onDone("Run /provider to open the provider selection menu, or /provider [providerId] to set the provider directly.", { display: "system" });
    return;
  }
  if (args) {
    logEvent("tengu_provider_command_inline", {
      args
    });
    const {
      resolveProviderId,
      setSafeProviderConfig: setSafeProviderConfig2,
      validateProviderModelCompatibility,
      getActiveProviderSettings: getActiveProviderSettings2
    } = await import("./providerRegistry-8xbkzars.js");
    const { getInitialSettings: getInitialSettings2 } = await import("./settings-b70pekjr.js");
    const resolvedProvider = resolveProviderId(args);
    if (!resolvedProvider) {
      onDone(`Unknown provider "${args}". Run: /provider to see available providers.`, {
        display: "system"
      });
      return;
    }
    const settings = getInitialSettings2();
    const currentModel = getActiveProviderSettings2(settings).model;
    if (currentModel) {
      const validation = validateProviderModelCompatibility(resolvedProvider, currentModel);
      if (validation.valid === false) {
        const validModelsStr = validation.validModels.join(", ") || "(uses dynamic discovery)";
        const suggestedModel = validation.suggestedModel ?? "see available models";
        onDone(`Provider changed to ${source_default.bold(resolvedProvider)}, but current model "${currentModel}" is not available.
Valid models for ${resolvedProvider}: ${validModelsStr}
Run: /model ${suggestedModel}`, { display: "system" });
      }
    }
    const result = setSafeProviderConfig2("provider", args);
    if (result.ok) {
      const saved = getActiveProviderSettings2(getInitialSettings2());
      return /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ApplyProviderAndClose, {
        provider: saved,
        message: result.message,
        onDone
      }, undefined, false, undefined, this);
    } else {
      onDone(result.message, { display: "system" });
    }
    return;
  }
  return /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ProviderPickerWrapper, {
    onDone
  }, undefined, false, undefined, this);
};
var init_provider = __esm(() => {
  init_source();
  init_ProviderPicker();
  init_xml();
  init_analytics();
  init_AppState();
  init_providerRegistry();
  init_useSettings();
  React = __toESM(require_react(), 1);
  jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
});
init_provider();

export {
  call
};
