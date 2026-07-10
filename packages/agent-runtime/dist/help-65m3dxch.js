import {
  Tab,
  Tabs,
  init_Tabs,
  useTabHeaderFocus
} from "./index-tn06d7z2.js";
import"./index-a4t3z51q.js";
import {
  Select,
  builtInCommandNames,
  formatDescriptionWithSource,
  init_commands1 as init_commands,
  init_loadUserBindings,
  init_select,
  init_useShortcutDisplay,
  isKeybindingCustomizationEnabled,
  useShortcutDisplay
} from "./index-qv8mzsdh.js";
import {
  Pane,
  init_Pane,
  init_modalContext,
  init_useExitOnCtrlCDWithKeybindings,
  init_useKeybinding,
  init_useTerminalSize,
  useExitOnCtrlCDWithKeybindings,
  useIsInsideModal,
  useKeybinding,
  useTerminalSize
} from "./index-by2vmtsd.js";
import"./index-kkermbsd.js";
import {
  hasUsedBackslashReturn,
  init_terminalSetup,
  isShiftEnterKeyBindingInstalled
} from "./index-v2hw7r4c.js";
import {
  Link,
  ThemedBox_default,
  ThemedText,
  init_ink,
  require_compiler_runtime
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
  require_jsx_dev_runtime
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
  env,
  getPlatform,
  init_config,
  init_env,
  init_fastMode,
  init_format,
  init_growthbook,
  init_platform,
  isFastModeAvailable,
  isFastModeEnabled,
  truncate
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
import"./index-2g4gegqj.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/components/HelpV2/Commands.tsx
function Commands(t0) {
  const $ = import_compiler_runtime.c(14);
  const {
    commands,
    maxHeight,
    columns,
    title,
    onCancel,
    emptyMessage
  } = t0;
  const {
    headerFocused,
    focusHeader
  } = useTabHeaderFocus();
  const maxWidth = Math.max(1, columns - 10);
  const visibleCount = Math.max(1, Math.floor((maxHeight - 10) / 2));
  let t1;
  if ($[0] !== commands || $[1] !== maxWidth) {
    const seen = new Set;
    let t22;
    if ($[3] !== maxWidth) {
      t22 = (cmd_0) => ({
        label: `/${cmd_0.name}`,
        value: cmd_0.name,
        description: truncate(formatDescriptionWithSource(cmd_0), maxWidth, true)
      });
      $[3] = maxWidth;
      $[4] = t22;
    } else {
      t22 = $[4];
    }
    t1 = commands.filter((cmd) => {
      if (seen.has(cmd.name)) {
        return false;
      }
      seen.add(cmd.name);
      return true;
    }).sort(_temp).map(t22);
    $[0] = commands;
    $[1] = maxWidth;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  const options = t1;
  let t2;
  if ($[5] !== commands.length || $[6] !== emptyMessage || $[7] !== focusHeader || $[8] !== headerFocused || $[9] !== onCancel || $[10] !== options || $[11] !== title || $[12] !== visibleCount) {
    t2 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      paddingY: 1,
      children: commands.length === 0 && emptyMessage ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        dimColor: true,
        children: emptyMessage
      }, undefined, false, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
        children: [
          /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
            children: title
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
            marginTop: 1,
            children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Select, {
              options,
              visibleOptionCount: visibleCount,
              onCancel,
              disableSelection: true,
              hideIndexes: true,
              layout: "compact-vertical",
              onUpFromFirstItem: focusHeader,
              isDisabled: headerFocused
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[5] = commands.length;
    $[6] = emptyMessage;
    $[7] = focusHeader;
    $[8] = headerFocused;
    $[9] = onCancel;
    $[10] = options;
    $[11] = title;
    $[12] = visibleCount;
    $[13] = t2;
  } else {
    t2 = $[13];
  }
  return t2;
}
function _temp(a, b) {
  return a.name.localeCompare(b.name);
}
var import_compiler_runtime, jsx_dev_runtime;
var init_Commands = __esm(() => {
  init_commands();
  init_ink();
  init_format();
  init_select();
  init_Tabs();
  import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/components/PromptInput/utils.ts
function getNewlineInstructions() {
  if (env.terminal === "Apple_Terminal" && process.platform === "darwin") {
    return "option + ⏎ for newline";
  }
  if (isShiftEnterKeyBindingInstalled()) {
    return "shift + ⏎ for newline";
  }
  return hasUsedBackslashReturn() ? "\\⏎ for newline" : "backslash (\\) + return (⏎) for newline";
}
var init_utils = __esm(() => {
  init_terminalSetup();
  init_config();
  init_env();
});

// ../../src/components/PromptInput/PromptInputHelpMenu.tsx
function formatShortcut(shortcut) {
  return shortcut.replace(/\+/g, " + ");
}
function PromptInputHelpMenu(props) {
  const $ = import_compiler_runtime2.c(99);
  const {
    dimColor,
    fixedWidth,
    gap,
    paddingX
  } = props;
  const t0 = useShortcutDisplay("app:toggleTranscript", "Global", "ctrl+o");
  let t1;
  if ($[0] !== t0) {
    t1 = formatShortcut(t0);
    $[0] = t0;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const transcriptShortcut = t1;
  const t2 = useShortcutDisplay("app:toggleTodos", "Global", "ctrl+t");
  let t3;
  if ($[2] !== t2) {
    t3 = formatShortcut(t2);
    $[2] = t2;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  const todosShortcut = t3;
  const t4 = useShortcutDisplay("chat:undo", "Chat", "ctrl+_");
  let t5;
  if ($[4] !== t4) {
    t5 = formatShortcut(t4);
    $[4] = t4;
    $[5] = t5;
  } else {
    t5 = $[5];
  }
  const undoShortcut = t5;
  const t6 = useShortcutDisplay("chat:stash", "Chat", "ctrl+s");
  let t7;
  if ($[6] !== t6) {
    t7 = formatShortcut(t6);
    $[6] = t6;
    $[7] = t7;
  } else {
    t7 = $[7];
  }
  const stashShortcut = t7;
  const t8 = useShortcutDisplay("chat:cycleMode", "Chat", "shift+tab");
  let t9;
  if ($[8] !== t8) {
    t9 = formatShortcut(t8);
    $[8] = t8;
    $[9] = t9;
  } else {
    t9 = $[9];
  }
  const cycleModeShortcut = t9;
  const t10 = useShortcutDisplay("chat:modelPicker", "Chat", "alt+p");
  let t11;
  if ($[10] !== t10) {
    t11 = formatShortcut(t10);
    $[10] = t10;
    $[11] = t11;
  } else {
    t11 = $[11];
  }
  const modelPickerShortcut = t11;
  const t12 = useShortcutDisplay("chat:fastMode", "Chat", "alt+o");
  let t13;
  if ($[12] !== t12) {
    t13 = formatShortcut(t12);
    $[12] = t12;
    $[13] = t13;
  } else {
    t13 = $[13];
  }
  const fastModeShortcut = t13;
  const t14 = useShortcutDisplay("chat:externalEditor", "Chat", "ctrl+g");
  let t15;
  if ($[14] !== t14) {
    t15 = formatShortcut(t14);
    $[14] = t14;
    $[15] = t15;
  } else {
    t15 = $[15];
  }
  const externalEditorShortcut = t15;
  const t16 = useShortcutDisplay("app:toggleTerminal", "Global", "meta+j");
  let t17;
  if ($[16] !== t16) {
    t17 = formatShortcut(t16);
    $[16] = t16;
    $[17] = t17;
  } else {
    t17 = $[17];
  }
  const terminalShortcut = t17;
  const t18 = useShortcutDisplay("chat:imagePaste", "Chat", "ctrl+v");
  let t19;
  if ($[18] !== t18) {
    t19 = formatShortcut(t18);
    $[18] = t18;
    $[19] = t19;
  } else {
    t19 = $[19];
  }
  const imagePasteShortcut = t19;
  let t20;
  if ($[20] !== dimColor || $[21] !== terminalShortcut) {
    t20 = null;
    $[20] = dimColor;
    $[21] = terminalShortcut;
    $[22] = t20;
  } else {
    t20 = $[22];
  }
  const terminalShortcutElement = t20;
  const t21 = fixedWidth ? 24 : undefined;
  let t22;
  if ($[23] !== dimColor) {
    t22 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: "! for bash mode"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[23] = dimColor;
    $[24] = t22;
  } else {
    t22 = $[24];
  }
  let t23;
  if ($[25] !== dimColor) {
    t23 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: "/ for commands"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[25] = dimColor;
    $[26] = t23;
  } else {
    t23 = $[26];
  }
  let t24;
  if ($[27] !== dimColor) {
    t24 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: "@ for file paths"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[27] = dimColor;
    $[28] = t24;
  } else {
    t24 = $[28];
  }
  let t25;
  if ($[29] !== dimColor) {
    t25 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: "& for background"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[29] = dimColor;
    $[30] = t25;
  } else {
    t25 = $[30];
  }
  let t26;
  if ($[31] !== dimColor) {
    t26 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: "/btw for side question"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[31] = dimColor;
    $[32] = t26;
  } else {
    t26 = $[32];
  }
  let t27;
  if ($[33] !== t21 || $[34] !== t22 || $[35] !== t23 || $[36] !== t24 || $[37] !== t25 || $[38] !== t26) {
    t27 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      width: t21,
      children: [
        t22,
        t23,
        t24,
        t25,
        t26
      ]
    }, undefined, true, undefined, this);
    $[33] = t21;
    $[34] = t22;
    $[35] = t23;
    $[36] = t24;
    $[37] = t25;
    $[38] = t26;
    $[39] = t27;
  } else {
    t27 = $[39];
  }
  const t28 = fixedWidth ? 35 : undefined;
  let t29;
  if ($[40] !== dimColor) {
    t29 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: "double tap esc to clear input"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[40] = dimColor;
    $[41] = t29;
  } else {
    t29 = $[41];
  }
  let t30;
  if ($[42] !== cycleModeShortcut || $[43] !== dimColor) {
    t30 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: [
          cycleModeShortcut,
          " ",
          "to auto-accept edits"
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[42] = cycleModeShortcut;
    $[43] = dimColor;
    $[44] = t30;
  } else {
    t30 = $[44];
  }
  let t31;
  if ($[45] !== dimColor || $[46] !== transcriptShortcut) {
    t31 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: [
          transcriptShortcut,
          " for verbose output"
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[45] = dimColor;
    $[46] = transcriptShortcut;
    $[47] = t31;
  } else {
    t31 = $[47];
  }
  let t32;
  if ($[48] !== dimColor || $[49] !== todosShortcut) {
    t32 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: [
          todosShortcut,
          " to toggle tasks"
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[48] = dimColor;
    $[49] = todosShortcut;
    $[50] = t32;
  } else {
    t32 = $[50];
  }
  let t33;
  if ($[51] === Symbol.for("react.memo_cache_sentinel")) {
    t33 = getNewlineInstructions();
    $[51] = t33;
  } else {
    t33 = $[51];
  }
  let t34;
  if ($[52] !== dimColor) {
    t34 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: t33
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[52] = dimColor;
    $[53] = t34;
  } else {
    t34 = $[53];
  }
  let t35;
  if ($[54] !== t28 || $[55] !== t29 || $[56] !== t30 || $[57] !== t31 || $[58] !== t32 || $[59] !== t34 || $[60] !== terminalShortcutElement) {
    t35 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      width: t28,
      children: [
        t29,
        t30,
        t31,
        t32,
        terminalShortcutElement,
        t34
      ]
    }, undefined, true, undefined, this);
    $[54] = t28;
    $[55] = t29;
    $[56] = t30;
    $[57] = t31;
    $[58] = t32;
    $[59] = t34;
    $[60] = terminalShortcutElement;
    $[61] = t35;
  } else {
    t35 = $[61];
  }
  let t36;
  if ($[62] !== dimColor || $[63] !== undoShortcut) {
    t36 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: [
          undoShortcut,
          " to undo"
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[62] = dimColor;
    $[63] = undoShortcut;
    $[64] = t36;
  } else {
    t36 = $[64];
  }
  let t37;
  if ($[65] !== dimColor) {
    t37 = getPlatform() !== "windows" && /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: "ctrl + z to suspend"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[65] = dimColor;
    $[66] = t37;
  } else {
    t37 = $[66];
  }
  let t38;
  if ($[67] !== dimColor || $[68] !== imagePasteShortcut) {
    t38 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: [
          imagePasteShortcut,
          " to paste images"
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[67] = dimColor;
    $[68] = imagePasteShortcut;
    $[69] = t38;
  } else {
    t38 = $[69];
  }
  let t39;
  if ($[70] !== dimColor || $[71] !== modelPickerShortcut) {
    t39 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: [
          modelPickerShortcut,
          " to switch model"
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[70] = dimColor;
    $[71] = modelPickerShortcut;
    $[72] = t39;
  } else {
    t39 = $[72];
  }
  let t40;
  if ($[73] !== dimColor || $[74] !== fastModeShortcut) {
    t40 = isFastModeEnabled() && isFastModeAvailable() && /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: [
          fastModeShortcut,
          " to toggle fast mode"
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[73] = dimColor;
    $[74] = fastModeShortcut;
    $[75] = t40;
  } else {
    t40 = $[75];
  }
  let t41;
  if ($[76] !== dimColor || $[77] !== stashShortcut) {
    t41 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: [
          stashShortcut,
          " to stash prompt"
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[76] = dimColor;
    $[77] = stashShortcut;
    $[78] = t41;
  } else {
    t41 = $[78];
  }
  let t42;
  if ($[79] !== dimColor || $[80] !== externalEditorShortcut) {
    t42 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: [
          externalEditorShortcut,
          " to edit in $EDITOR"
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[79] = dimColor;
    $[80] = externalEditorShortcut;
    $[81] = t42;
  } else {
    t42 = $[81];
  }
  let t43;
  if ($[82] !== dimColor) {
    t43 = isKeybindingCustomizationEnabled() && /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedText, {
        dimColor,
        children: "/keybindings to customize"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[82] = dimColor;
    $[83] = t43;
  } else {
    t43 = $[83];
  }
  let t44;
  if ($[84] !== t36 || $[85] !== t37 || $[86] !== t38 || $[87] !== t39 || $[88] !== t40 || $[89] !== t41 || $[90] !== t42 || $[91] !== t43) {
    t44 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      children: [
        t36,
        t37,
        t38,
        t39,
        t40,
        t41,
        t42,
        t43
      ]
    }, undefined, true, undefined, this);
    $[84] = t36;
    $[85] = t37;
    $[86] = t38;
    $[87] = t39;
    $[88] = t40;
    $[89] = t41;
    $[90] = t42;
    $[91] = t43;
    $[92] = t44;
  } else {
    t44 = $[92];
  }
  let t45;
  if ($[93] !== gap || $[94] !== paddingX || $[95] !== t27 || $[96] !== t35 || $[97] !== t44) {
    t45 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(ThemedBox_default, {
      paddingX,
      flexDirection: "row",
      gap,
      children: [
        t27,
        t35,
        t44
      ]
    }, undefined, true, undefined, this);
    $[93] = gap;
    $[94] = paddingX;
    $[95] = t27;
    $[96] = t35;
    $[97] = t44;
    $[98] = t45;
  } else {
    t45 = $[98];
  }
  return t45;
}
var import_compiler_runtime2, jsx_dev_runtime2;
var init_PromptInputHelpMenu = __esm(() => {
  init_ink();
  init_platform();
  init_loadUserBindings();
  init_useShortcutDisplay();
  init_growthbook();
  init_fastMode();
  init_utils();
  import_compiler_runtime2 = __toESM(require_compiler_runtime(), 1);
  jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/components/HelpV2/General.tsx
function General() {
  const $ = import_compiler_runtime3.c(2);
  let t0;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t0 = /* @__PURE__ */ jsx_dev_runtime3.jsxDEV(ThemedBox_default, {
      children: /* @__PURE__ */ jsx_dev_runtime3.jsxDEV(ThemedText, {
        children: "UR understands your codebase, makes edits with your permission, and executes commands — right from your terminal."
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[0] = t0;
  } else {
    t0 = $[0];
  }
  let t1;
  if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = /* @__PURE__ */ jsx_dev_runtime3.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      paddingY: 1,
      gap: 1,
      children: [
        t0,
        /* @__PURE__ */ jsx_dev_runtime3.jsxDEV(ThemedBox_default, {
          flexDirection: "column",
          children: [
            /* @__PURE__ */ jsx_dev_runtime3.jsxDEV(ThemedBox_default, {
              children: /* @__PURE__ */ jsx_dev_runtime3.jsxDEV(ThemedText, {
                bold: true,
                children: "Shortcuts"
              }, undefined, false, undefined, this)
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsx_dev_runtime3.jsxDEV(PromptInputHelpMenu, {
              gap: 2,
              fixedWidth: true
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this)
      ]
    }, undefined, true, undefined, this);
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  return t1;
}
var import_compiler_runtime3, jsx_dev_runtime3;
var init_General = __esm(() => {
  init_ink();
  init_PromptInputHelpMenu();
  import_compiler_runtime3 = __toESM(require_compiler_runtime(), 1);
  jsx_dev_runtime3 = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/components/HelpV2/HelpV2.tsx
function HelpV2(t0) {
  const $ = import_compiler_runtime4.c(44);
  const {
    onClose,
    commands
  } = t0;
  const {
    rows,
    columns
  } = useTerminalSize();
  const maxHeight = Math.floor(rows / 2);
  const insideModal = useIsInsideModal();
  let t1;
  if ($[0] !== onClose) {
    t1 = () => onClose("Help dialog dismissed", {
      display: "system"
    });
    $[0] = onClose;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const close = t1;
  let t2;
  if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = {
      context: "Help"
    };
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  useKeybinding("help:dismiss", close, t2);
  const exitState = useExitOnCtrlCDWithKeybindings(close);
  const dismissShortcut = useShortcutDisplay("help:dismiss", "Help", "esc");
  let antOnlyCommands;
  let builtinCommands;
  let t3;
  if ($[3] !== commands) {
    const builtinNames = builtInCommandNames();
    builtinCommands = commands.filter((cmd) => builtinNames.has(cmd.name) && !cmd.isHidden);
    let t42;
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
      t42 = [];
      $[7] = t42;
    } else {
      t42 = $[7];
    }
    antOnlyCommands = t42;
    t3 = commands.filter((cmd_2) => !builtinNames.has(cmd_2.name) && !cmd_2.isHidden);
    $[3] = commands;
    $[4] = antOnlyCommands;
    $[5] = builtinCommands;
    $[6] = t3;
  } else {
    antOnlyCommands = $[4];
    builtinCommands = $[5];
    t3 = $[6];
  }
  const customCommands = t3;
  let t4;
  if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(Tab, {
      title: "general",
      children: /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(General, {}, undefined, false, undefined, this)
    }, "general", false, undefined, this);
    $[8] = t4;
  } else {
    t4 = $[8];
  }
  let tabs;
  if ($[9] !== antOnlyCommands || $[10] !== builtinCommands || $[11] !== close || $[12] !== columns || $[13] !== customCommands || $[14] !== maxHeight) {
    tabs = [t4];
    let t52;
    if ($[16] !== builtinCommands || $[17] !== close || $[18] !== columns || $[19] !== maxHeight) {
      t52 = /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(Tab, {
        title: "commands",
        children: /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(Commands, {
          commands: builtinCommands,
          maxHeight,
          columns,
          title: "Browse default commands:",
          onCancel: close
        }, undefined, false, undefined, this)
      }, "commands", false, undefined, this);
      $[16] = builtinCommands;
      $[17] = close;
      $[18] = columns;
      $[19] = maxHeight;
      $[20] = t52;
    } else {
      t52 = $[20];
    }
    tabs.push(t52);
    let t62;
    if ($[21] !== close || $[22] !== columns || $[23] !== customCommands || $[24] !== maxHeight) {
      t62 = /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(Tab, {
        title: "custom-commands",
        children: /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(Commands, {
          commands: customCommands,
          maxHeight,
          columns,
          title: "Browse custom commands:",
          emptyMessage: "No custom commands found",
          onCancel: close
        }, undefined, false, undefined, this)
      }, "custom", false, undefined, this);
      $[21] = close;
      $[22] = columns;
      $[23] = customCommands;
      $[24] = maxHeight;
      $[25] = t62;
    } else {
      t62 = $[25];
    }
    tabs.push(t62);
    if (false) {}
    $[9] = antOnlyCommands;
    $[10] = builtinCommands;
    $[11] = close;
    $[12] = columns;
    $[13] = customCommands;
    $[14] = maxHeight;
    $[15] = tabs;
  } else {
    tabs = $[15];
  }
  const t5 = insideModal ? undefined : maxHeight;
  let t6;
  if ($[31] !== tabs) {
    t6 = /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(Tabs, {
      title: `UR v${MACRO.VERSION}`,
      color: "professionalBlue",
      defaultTab: "general",
      children: tabs
    }, undefined, false, undefined, this);
    $[31] = tabs;
    $[32] = t6;
  } else {
    t6 = $[32];
  }
  let t7;
  if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
    t7 = /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedBox_default, {
      marginTop: 1,
      children: /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedText, {
        children: [
          "For more help:",
          " ",
          /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(Link, {
            url: "https://docs.ur.dev/docs/en/overview"
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this)
    }, undefined, false, undefined, this);
    $[33] = t7;
  } else {
    t7 = $[33];
  }
  let t8;
  if ($[34] !== dismissShortcut || $[35] !== exitState.keyName || $[36] !== exitState.pending) {
    t8 = /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedBox_default, {
      marginTop: 1,
      children: /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedText, {
        dimColor: true,
        children: exitState.pending ? /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(jsx_dev_runtime4.Fragment, {
          children: [
            "Press ",
            exitState.keyName,
            " again to exit"
          ]
        }, undefined, true, undefined, this) : /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedText, {
          italic: true,
          children: [
            dismissShortcut,
            " to cancel"
          ]
        }, undefined, true, undefined, this)
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[34] = dismissShortcut;
    $[35] = exitState.keyName;
    $[36] = exitState.pending;
    $[37] = t8;
  } else {
    t8 = $[37];
  }
  let t9;
  if ($[38] !== t6 || $[39] !== t8) {
    t9 = /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(Pane, {
      color: "professionalBlue",
      children: [
        t6,
        t7,
        t8
      ]
    }, undefined, true, undefined, this);
    $[38] = t6;
    $[39] = t8;
    $[40] = t9;
  } else {
    t9 = $[40];
  }
  let t10;
  if ($[41] !== t5 || $[42] !== t9) {
    t10 = /* @__PURE__ */ jsx_dev_runtime4.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      height: t5,
      children: t9
    }, undefined, false, undefined, this);
    $[41] = t5;
    $[42] = t9;
    $[43] = t10;
  } else {
    t10 = $[43];
  }
  return t10;
}
var import_compiler_runtime4, jsx_dev_runtime4;
var init_HelpV2 = __esm(() => {
  init_useExitOnCtrlCDWithKeybindings();
  init_useShortcutDisplay();
  init_commands();
  init_modalContext();
  init_useTerminalSize();
  init_ink();
  init_useKeybinding();
  init_Pane();
  init_Tabs();
  init_Commands();
  init_General();
  import_compiler_runtime4 = __toESM(require_compiler_runtime(), 1);
  jsx_dev_runtime4 = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/commands/help/help.tsx
var jsx_dev_runtime5, call = async (onDone, {
  options: {
    commands
  }
}) => {
  return /* @__PURE__ */ jsx_dev_runtime5.jsxDEV(HelpV2, {
    commands,
    onClose: onDone
  }, undefined, false, undefined, this);
};
var init_help = __esm(() => {
  init_HelpV2();
  jsx_dev_runtime5 = __toESM(require_jsx_dev_runtime(), 1);
});
init_help();

export {
  call
};
