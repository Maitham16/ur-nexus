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
} from "./index-79vhy4mk.js";
import {
  Pane,
  init_Pane
} from "./index-grma1d53.js";
import"./index-h3gckbec.js";
import"./index-e4qqkpaw.js";
import {
  ThemedBox_default,
  ThemedText,
  init_ink
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
import {
  require_jsx_dev_runtime,
  require_react
} from "./index-2krq0sbw.js";
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
  COMMON_HELP_ARGS,
  COMMON_INFO_ARGS,
  init_xml
} from "./index-f80dj2bz.js";
import"./index-q00jv0fc.js";
import"./index-cs7da0vv.js";
import"./index-ycnb0yeb.js";
import"./index-vpczjthp.js";
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm,
  __require,
  __toESM
} from "./index-8rxa073f.js";

// src/components/ProviderPicker.tsx
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

// src/commands/provider/provider.tsx
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
    } = await import("./providerRegistry-cvbfwh48.js");
    const { getInitialSettings: getInitialSettings2 } = await import("./settings-qfm5xwhr.js");
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
