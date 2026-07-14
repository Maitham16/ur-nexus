import {
  Dialog,
  init_AppState,
  init_Dialog,
  useAppState,
  useSetAppState
} from "./index-79vhy4mk.js";
import {
  init_useKeybinding,
  useKeybindings
} from "./index-grma1d53.js";
import"./index-h3gckbec.js";
import"./index-e4qqkpaw.js";
import {
  Link,
  ThemedBox_default,
  ThemedText,
  color,
  init_color,
  init_ink,
  init_systemTheme,
  require_compiler_runtime,
  resolveThemeSetting
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
  FAST_MODE_MODEL_DISPLAY,
  LIGHTNING_BOLT,
  clearFastModeCooldown,
  formatDuration,
  formatModelPricing,
  getFastModeModel,
  getFastModeRuntimeState,
  getFastModeUnavailableReason,
  getGlobalConfig,
  getmodelO46CostTier,
  init_config,
  init_fastMode,
  init_figures,
  init_format,
  init_modelCost,
  init_settings1 as init_settings,
  init_source,
  isFastModeEnabled,
  isFastModeSupportedByModel,
  prefetchFastModeStatus,
  source_default,
  updateSettingsForSource
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
import"./index-f80dj2bz.js";
import"./index-q00jv0fc.js";
import"./index-cs7da0vv.js";
import"./index-ycnb0yeb.js";
import"./index-vpczjthp.js";
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// src/components/FastIcon.tsx
function FastIcon(t0) {
  const $ = import_compiler_runtime.c(2);
  const {
    cooldown
  } = t0;
  if (cooldown) {
    let t12;
    if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
      t12 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        color: "promptBorder",
        dimColor: true,
        children: LIGHTNING_BOLT
      }, undefined, false, undefined, this);
      $[0] = t12;
    } else {
      t12 = $[0];
    }
    return t12;
  }
  let t1;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      color: "fastMode",
      children: LIGHTNING_BOLT
    }, undefined, false, undefined, this);
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  return t1;
}
function getFastIconString(applyColor = true, cooldown = false) {
  if (!applyColor) {
    return LIGHTNING_BOLT;
  }
  const themeName = resolveThemeSetting(getGlobalConfig().theme);
  if (cooldown) {
    return source_default.dim(color("promptBorder", themeName)(LIGHTNING_BOLT));
  }
  return color("fastMode", themeName)(LIGHTNING_BOLT);
}
var import_compiler_runtime, jsx_dev_runtime;
var init_FastIcon = __esm(() => {
  init_source();
  init_figures();
  init_ink();
  init_config();
  init_systemTheme();
  init_color();
  import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});

// src/commands/fast/fast.tsx
function applyFastMode(enable, setAppState) {
  clearFastModeCooldown();
  updateSettingsForSource("userSettings", {
    fastMode: enable ? true : undefined
  });
  if (enable) {
    setAppState((prev) => {
      const needsModelSwitch = !isFastModeSupportedByModel(prev.mainLoopModel);
      return {
        ...prev,
        ...needsModelSwitch ? {
          mainLoopModel: getFastModeModel(),
          mainLoopModelForSession: null
        } : {},
        fastMode: true
      };
    });
  } else {
    setAppState((prev) => ({
      ...prev,
      fastMode: false
    }));
  }
}
function FastModePicker(t0) {
  const $ = import_compiler_runtime2.c(30);
  const {
    onDone,
    unavailableReason
  } = t0;
  const model = useAppState(_temp);
  const initialFastMode = useAppState(_temp2);
  const setAppState = useSetAppState();
  const [enableFastMode, setEnableFastMode] = import_react.useState(initialFastMode ?? false);
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = getFastModeRuntimeState();
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const runtimeState = t1;
  const isCooldown = runtimeState.status === "cooldown";
  const isUnavailable = unavailableReason !== null;
  let t2;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = formatModelPricing(getmodelO46CostTier(true));
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  const pricing = t2;
  let t3;
  if ($[2] !== enableFastMode || $[3] !== isUnavailable || $[4] !== model || $[5] !== onDone || $[6] !== setAppState) {
    t3 = function handleConfirm2() {
      if (isUnavailable) {
        return;
      }
      applyFastMode(enableFastMode, setAppState);
      logEvent("tengu_fast_mode_toggled", {
        enabled: enableFastMode,
        source: "picker"
      });
      if (enableFastMode) {
        const fastIcon = getFastIconString(enableFastMode);
        const modelUpdated = !isFastModeSupportedByModel(model) ? ` · model set to ${FAST_MODE_MODEL_DISPLAY}` : "";
        onDone(`${fastIcon} Fast mode ON${modelUpdated} · ${pricing}`);
      } else {
        setAppState(_temp3);
        onDone("Fast mode OFF");
      }
    };
    $[2] = enableFastMode;
    $[3] = isUnavailable;
    $[4] = model;
    $[5] = onDone;
    $[6] = setAppState;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  const handleConfirm = t3;
  let t4;
  if ($[8] !== initialFastMode || $[9] !== isUnavailable || $[10] !== onDone || $[11] !== setAppState) {
    t4 = function handleCancel2() {
      if (isUnavailable) {
        if (initialFastMode) {
          applyFastMode(false, setAppState);
        }
        onDone("Fast mode OFF", {
          display: "system"
        });
        return;
      }
      const message = initialFastMode ? `${getFastIconString()} Kept Fast mode ON` : "Kept Fast mode OFF";
      onDone(message, {
        display: "system"
      });
    };
    $[8] = initialFastMode;
    $[9] = isUnavailable;
    $[10] = onDone;
    $[11] = setAppState;
    $[12] = t4;
  } else {
    t4 = $[12];
  }
  const handleCancel = t4;
  let t5;
  if ($[13] !== isUnavailable) {
    t5 = function handleToggle2() {
      if (isUnavailable) {
        return;
      }
      setEnableFastMode(_temp4);
    };
    $[13] = isUnavailable;
    $[14] = t5;
  } else {
    t5 = $[14];
  }
  const handleToggle = t5;
  let t6;
  if ($[15] !== handleConfirm || $[16] !== handleToggle) {
    t6 = {
      "confirm:yes": handleConfirm,
      "confirm:nextField": handleToggle,
      "confirm:next": handleToggle,
      "confirm:previous": handleToggle,
      "confirm:cycleMode": handleToggle,
      "confirm:toggle": handleToggle
    };
    $[15] = handleConfirm;
    $[16] = handleToggle;
    $[17] = t6;
  } else {
    t6 = $[17];
  }
  let t7;
  if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
    t7 = {
      context: "Confirmation"
    };
    $[18] = t7;
  } else {
    t7 = $[18];
  }
  useKeybindings(t6, t7);
  let t8;
  if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
    t8 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
      children: [
        /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(FastIcon, {
          cooldown: isCooldown
        }, undefined, false, undefined, this),
        " Fast mode (research preview)"
      ]
    }, undefined, true, undefined, this);
    $[19] = t8;
  } else {
    t8 = $[19];
  }
  const title = t8;
  let t9;
  if ($[20] !== isUnavailable) {
    t9 = (exitState) => exitState.pending ? /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
      children: [
        "Press ",
        exitState.keyName,
        " again to exit"
      ]
    }, undefined, true, undefined, this) : isUnavailable ? /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
      children: "Esc to cancel"
    }, undefined, false, undefined, this) : /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
      children: "Tab to toggle · Enter to confirm · Esc to cancel"
    }, undefined, false, undefined, this);
    $[20] = isUnavailable;
    $[21] = t9;
  } else {
    t9 = $[21];
  }
  let t10;
  if ($[22] !== enableFastMode || $[23] !== unavailableReason) {
    t10 = unavailableReason ? /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      marginLeft: 2,
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        color: "error",
        children: unavailableReason
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this) : /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(jsx_dev_runtime2.Fragment, {
      children: [
        /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
          flexDirection: "column",
          gap: 0,
          marginLeft: 2,
          children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
            flexDirection: "row",
            gap: 2,
            children: [
              /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
                bold: true,
                children: "Fast mode"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
                color: enableFastMode ? "fastMode" : undefined,
                bold: enableFastMode,
                children: enableFastMode ? "ON " : "OFF"
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
                dimColor: true,
                children: pricing
              }, undefined, false, undefined, this)
            ]
          }, undefined, true, undefined, this)
        }, undefined, false, undefined, this),
        isCooldown && runtimeState.status === "cooldown" && /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
          marginLeft: 2,
          children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
            color: "warning",
            children: [
              runtimeState.reason === "overloaded" ? "Fast mode overloaded and is temporarily unavailable" : "You've hit your fast limit",
              " · resets in ",
              formatDuration(runtimeState.resetAt - Date.now(), {
                hideTrailingZeros: true
              })
            ]
          }, undefined, true, undefined, this)
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
    $[22] = enableFastMode;
    $[23] = unavailableReason;
    $[24] = t10;
  } else {
    t10 = $[24];
  }
  let t11;
  if ($[25] === Symbol.for("react.memo_cache_sentinel")) {
    t11 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
      dimColor: true,
      children: [
        "Learn more:",
        " ",
        /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(Link, {
          url: "https://docs.ur.dev/docs/en/fast-mode",
          children: "https://docs.ur.dev/docs/en/fast-mode"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
    $[25] = t11;
  } else {
    t11 = $[25];
  }
  let t12;
  if ($[26] !== handleCancel || $[27] !== t10 || $[28] !== t9) {
    t12 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(Dialog, {
      title,
      subtitle: `High-speed mode for ${FAST_MODE_MODEL_DISPLAY}. Billed as extra usage at a premium rate. Separate rate limits apply.`,
      onCancel: handleCancel,
      color: "fastMode",
      inputGuide: t9,
      children: [
        t10,
        t11
      ]
    }, undefined, true, undefined, this);
    $[26] = handleCancel;
    $[27] = t10;
    $[28] = t9;
    $[29] = t12;
  } else {
    t12 = $[29];
  }
  return t12;
}
function _temp4(prev_0) {
  return !prev_0;
}
function _temp3(prev) {
  return {
    ...prev,
    fastMode: false
  };
}
function _temp2(s_0) {
  return s_0.fastMode;
}
function _temp(s) {
  return s.mainLoopModel;
}
async function handleFastModeShortcut(enable, getAppState, setAppState) {
  const unavailableReason = getFastModeUnavailableReason();
  if (unavailableReason) {
    return `Fast mode unavailable: ${unavailableReason}`;
  }
  const {
    mainLoopModel
  } = getAppState();
  applyFastMode(enable, setAppState);
  logEvent("tengu_fast_mode_toggled", {
    enabled: enable,
    source: "shortcut"
  });
  if (enable) {
    const fastIcon = getFastIconString(true);
    const modelUpdated = !isFastModeSupportedByModel(mainLoopModel) ? ` · model set to ${FAST_MODE_MODEL_DISPLAY}` : "";
    const pricing = formatModelPricing(getmodelO46CostTier(true));
    return `${fastIcon} Fast mode ON${modelUpdated} · ${pricing}`;
  } else {
    return `Fast mode OFF`;
  }
}
async function call(onDone, context, args) {
  if (!isFastModeEnabled()) {
    return null;
  }
  await prefetchFastModeStatus();
  const arg = args?.trim().toLowerCase();
  if (arg === "on" || arg === "off") {
    const result = await handleFastModeShortcut(arg === "on", context.getAppState, context.setAppState);
    onDone(result);
    return null;
  }
  const unavailableReason = getFastModeUnavailableReason();
  logEvent("tengu_fast_mode_picker_shown", {
    unavailable_reason: unavailableReason ?? ""
  });
  return /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(FastModePicker, {
    onDone,
    unavailableReason
  }, undefined, false, undefined, this);
}
var import_compiler_runtime2, import_react, jsx_dev_runtime2;
var init_fast = __esm(() => {
  init_Dialog();
  init_FastIcon();
  init_ink();
  init_useKeybinding();
  init_analytics();
  init_AppState();
  init_fastMode();
  init_format();
  init_modelCost();
  init_settings();
  import_compiler_runtime2 = __toESM(require_compiler_runtime(), 1);
  import_react = __toESM(require_react(), 1);
  jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
});
init_fast();

export {
  call,
  FastModePicker
};
