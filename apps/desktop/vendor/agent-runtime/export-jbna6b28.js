import {
  Messages,
  init_Messages
} from "./index-j2jt2wwx.js";
import"./index-ptd8wggq.js";
import"./index-6f42hkx2.js";
import"./index-z22b7ee7.js";
import {
  init_staticRender,
  renderToAnsiString
} from "./index-r7pn3s01.js";
import"./index-pgbq9mrt.js";
import"./index-vs69a08w.js";
import"./index-66wghzzw.js";
import"./index-n8wt1s5m.js";
import {
  AppStateProvider,
  Byline,
  ConfigurableShortcutHint,
  Dialog,
  KeyboardShortcutHint,
  Select,
  TextInput,
  init_AppState,
  init_Byline,
  init_ConfigurableShortcutHint,
  init_Dialog,
  init_KeyboardShortcutHint,
  init_TextInput,
  init_loadUserBindings,
  init_select,
  loadKeybindingsSyncWithWarnings
} from "./index-7fe5jn6w.js";
import"./index-kkermbsd.js";
import {
  KeybindingProvider,
  init_KeybindingContext,
  init_useKeybinding,
  init_useTerminalSize,
  useKeybinding,
  useTerminalSize
} from "./index-gph76kef.js";
import"./index-2j7c2ame.js";
import {
  ThemedBox_default,
  ThemedText,
  init_ink,
  init_osc,
  setClipboard
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
  init_strip_ansi,
  stripAnsi
} from "./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import"./index-z5aeypvg.js";
import"./index-5jmh1e0k.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-wxsgjqjk.js";
import"./index-s1a1wahe.js";
import"./index-wred0kdg.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-7bd814mt.js";
import"./index-m9qhxms7.js";
import {
  init_slowOperations,
  writeFileSync_DEPRECATED
} from "./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/components/ExportDialog.tsx
import { join } from "path";
function ExportDialog({
  content,
  defaultFilename,
  onDone
}) {
  const [, setSelectedOption] = import_react.useState(null);
  const [filename, setFilename] = import_react.useState(defaultFilename);
  const [cursorOffset, setCursorOffset] = import_react.useState(defaultFilename.length);
  const [showFilenameInput, setShowFilenameInput] = import_react.useState(false);
  const {
    columns
  } = useTerminalSize();
  const handleGoBack = import_react.useCallback(() => {
    setShowFilenameInput(false);
    setSelectedOption(null);
  }, []);
  const handleSelectOption = async (value) => {
    if (value === "clipboard") {
      const raw = await setClipboard(content);
      if (raw)
        process.stdout.write(raw);
      onDone({
        success: true,
        message: "Conversation copied to clipboard"
      });
    } else if (value === "file") {
      setSelectedOption("file");
      setShowFilenameInput(true);
    }
  };
  const handleFilenameSubmit = () => {
    const finalFilename = filename.endsWith(".txt") ? filename : filename.replace(/\.[^.]+$/, "") + ".txt";
    const filepath = join(getCwd(), finalFilename);
    try {
      writeFileSync_DEPRECATED(filepath, content, {
        encoding: "utf-8",
        flush: true
      });
      onDone({
        success: true,
        message: `Conversation exported to: ${filepath}`
      });
    } catch (error) {
      onDone({
        success: false,
        message: `Failed to export conversation: ${error instanceof Error ? error.message : "Unknown error"}`
      });
    }
  };
  const handleCancel = import_react.useCallback(() => {
    if (showFilenameInput) {
      handleGoBack();
    } else {
      onDone({
        success: false,
        message: "Export cancelled"
      });
    }
  }, [showFilenameInput, handleGoBack, onDone]);
  const options = [{
    label: "Copy to clipboard",
    value: "clipboard",
    description: "Copy the conversation to your system clipboard"
  }, {
    label: "Save to file",
    value: "file",
    description: "Save the conversation to a file in the current directory"
  }];
  function renderInputGuide(exitState) {
    if (showFilenameInput) {
      return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Byline, {
        children: [
          /* @__PURE__ */ jsx_dev_runtime.jsxDEV(KeyboardShortcutHint, {
            shortcut: "Enter",
            action: "save"
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ConfigurableShortcutHint, {
            action: "confirm:no",
            context: "Confirmation",
            fallback: "Esc",
            description: "go back"
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this);
    }
    if (exitState.pending) {
      return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        children: [
          "Press ",
          exitState.keyName,
          " again to exit"
        ]
      }, undefined, true, undefined, this);
    }
    return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ConfigurableShortcutHint, {
      action: "confirm:no",
      context: "Confirmation",
      fallback: "Esc",
      description: "cancel"
    }, undefined, false, undefined, this);
  }
  useKeybinding("confirm:no", handleCancel, {
    context: "Settings",
    isActive: showFilenameInput
  });
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Dialog, {
    title: "Export Conversation",
    subtitle: "Select export method:",
    color: "permission",
    onCancel: handleCancel,
    inputGuide: renderInputGuide,
    isCancelActive: !showFilenameInput,
    children: !showFilenameInput ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Select, {
      options,
      onChange: handleSelectOption,
      onCancel: handleCancel
    }, undefined, false, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      children: [
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          children: "Enter filename:"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
          flexDirection: "row",
          gap: 1,
          marginTop: 1,
          children: [
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              children: ">"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(TextInput, {
              value: filename,
              onChange: setFilename,
              onSubmit: handleFilenameSubmit,
              focus: true,
              showCursor: true,
              columns,
              cursorOffset,
              onChangeCursorOffset: setCursorOffset
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this)
      ]
    }, undefined, true, undefined, this)
  }, undefined, false, undefined, this);
}
var import_react, jsx_dev_runtime;
var init_ExportDialog = __esm(() => {
  init_useTerminalSize();
  init_osc();
  init_ink();
  init_useKeybinding();
  init_cwd();
  init_slowOperations();
  init_ConfigurableShortcutHint();
  init_select();
  init_Byline();
  init_Dialog();
  init_KeyboardShortcutHint();
  init_TextInput();
  import_react = __toESM(require_react(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/utils/exportRenderer.tsx
function StaticKeybindingProvider({
  children
}) {
  const {
    bindings
  } = loadKeybindingsSyncWithWarnings();
  const pendingChordRef = import_react2.useRef(null);
  const handlerRegistryRef = import_react2.useRef(new Map);
  const activeContexts = import_react2.useRef(new Set).current;
  return /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(KeybindingProvider, {
    bindings,
    pendingChordRef,
    pendingChord: null,
    setPendingChord: () => {},
    activeContexts,
    registerActiveContext: () => {},
    unregisterActiveContext: () => {},
    handlerRegistryRef,
    children
  }, undefined, false, undefined, this);
}
function normalizedUpperBound(m) {
  if (!("message" in m))
    return 1;
  const c = m.message.content;
  return Array.isArray(c) ? c.length : 1;
}
async function streamRenderedMessages(messages, tools, sink, {
  columns,
  verbose = false,
  chunkSize = 40,
  onProgress
} = {}) {
  const renderChunk = (range) => renderToAnsiString(/* @__PURE__ */ jsx_dev_runtime2.jsxDEV(AppStateProvider, {
    children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(StaticKeybindingProvider, {
      children: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(Messages, {
        messages,
        tools,
        commands: [],
        verbose,
        toolJSX: null,
        toolUseConfirmQueue: [],
        inProgressToolUseIDs: new Set,
        isMessageSelectorVisible: false,
        conversationId: "export",
        screen: "prompt",
        streamingToolUses: [],
        showAllInTranscript: true,
        isLoading: false,
        renderRange: range
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this)
  }, undefined, false, undefined, this), columns);
  let ceiling = chunkSize;
  for (const m of messages)
    ceiling += normalizedUpperBound(m);
  for (let offset = 0;offset < ceiling; offset += chunkSize) {
    const ansi = await renderChunk([offset, offset + chunkSize]);
    if (stripAnsi(ansi).trim() === "")
      break;
    await sink(ansi);
    onProgress?.(offset + chunkSize);
  }
}
async function renderMessagesToPlainText(messages, tools = [], columns) {
  const parts = [];
  await streamRenderedMessages(messages, tools, (chunk) => void parts.push(stripAnsi(chunk)), {
    columns
  });
  return parts.join("");
}
var import_react2, jsx_dev_runtime2;
var init_exportRenderer = __esm(() => {
  init_strip_ansi();
  init_Messages();
  init_KeybindingContext();
  init_loadUserBindings();
  init_AppState();
  init_staticRender();
  import_react2 = __toESM(require_react(), 1);
  jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/commands/export/export.tsx
import { join as join2 } from "path";
function formatTimestamp(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}-${hours}${minutes}${seconds}`;
}
function extractFirstPrompt(messages) {
  const firstUserMessage = messages.find((msg) => msg.type === "user");
  if (!firstUserMessage || firstUserMessage.type !== "user") {
    return "";
  }
  const content = firstUserMessage.message?.content;
  let result = "";
  if (typeof content === "string") {
    result = content.trim();
  } else if (Array.isArray(content)) {
    const textContent = content.find((item) => item.type === "text");
    if (textContent && "text" in textContent) {
      result = textContent.text.trim();
    }
  }
  result = result.split(`
`)[0] || "";
  if (result.length > 50) {
    result = result.substring(0, 49) + "…";
  }
  return result;
}
function sanitizeFilename(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}
async function exportWithReactRenderer(context) {
  const tools = context.options.tools || [];
  return renderMessagesToPlainText(context.messages, tools);
}
async function call(onDone, context, args) {
  const content = await exportWithReactRenderer(context);
  const filename = args.trim();
  if (filename) {
    const finalFilename = filename.endsWith(".txt") ? filename : filename.replace(/\.[^.]+$/, "") + ".txt";
    const filepath = join2(getCwd(), finalFilename);
    try {
      writeFileSync_DEPRECATED(filepath, content, {
        encoding: "utf-8",
        flush: true
      });
      onDone(`Conversation exported to: ${filepath}`);
      return null;
    } catch (error) {
      onDone(`Failed to export conversation: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    }
  }
  const firstPrompt = extractFirstPrompt(context.messages);
  const timestamp = formatTimestamp(new Date);
  let defaultFilename;
  if (firstPrompt) {
    const sanitized = sanitizeFilename(firstPrompt);
    defaultFilename = sanitized ? `${timestamp}-${sanitized}.txt` : `conversation-${timestamp}.txt`;
  } else {
    defaultFilename = `conversation-${timestamp}.txt`;
  }
  return /* @__PURE__ */ jsx_dev_runtime3.jsxDEV(ExportDialog, {
    content,
    defaultFilename,
    onDone: (result) => {
      onDone(result.message);
    }
  }, undefined, false, undefined, this);
}
var jsx_dev_runtime3;
var init_export = __esm(() => {
  init_ExportDialog();
  init_cwd();
  init_exportRenderer();
  init_slowOperations();
  jsx_dev_runtime3 = __toESM(require_jsx_dev_runtime(), 1);
});
init_export();

export {
  sanitizeFilename,
  extractFirstPrompt,
  call
};
