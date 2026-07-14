import {
  expandPastedTextRefs,
  formatPastedTextRef,
  generateTempFilePath,
  getPastedTextRefNumLines,
  init_history,
  init_ide,
  init_tempfile,
  toIDEDisplayName
} from "./index-79vhy4mk.js";
import {
  init_instances,
  instances_default
} from "./index-4ywxxsys.js";
import {
  execSync_DEPRECATED,
  init_execSyncWrapper,
  init_which,
  whichSync
} from "./index-ycnb0yeb.js";
import {
  getFsImplementation,
  init_debug,
  init_fsOperations,
  init_slowOperations,
  writeFileSync_DEPRECATED
} from "./index-t784n9jz.js";
import {
  init_memoize,
  memoize_default
} from "./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/utils/editor.ts
import { basename } from "path";
function isCommandAvailable(command) {
  return !!whichSync(command);
}
function classifyGuiEditor(editor) {
  const base = basename(editor.split(" ")[0] ?? "");
  return GUI_EDITORS.find((g) => base.includes(g));
}
var GUI_EDITORS, VSCODE_FAMILY, getExternalEditor;
var init_editor = __esm(() => {
  init_memoize();
  init_instances();
  init_debug();
  init_which();
  GUI_EDITORS = [
    "code",
    "cursor",
    "windsurf",
    "codium",
    "subl",
    "atom",
    "gedit",
    "notepad++",
    "notepad"
  ];
  VSCODE_FAMILY = new Set(["code", "cursor", "windsurf", "codium"]);
  getExternalEditor = memoize_default(() => {
    if (process.env.VISUAL?.trim()) {
      return process.env.VISUAL.trim();
    }
    if (process.env.EDITOR?.trim()) {
      return process.env.EDITOR.trim();
    }
    if (process.platform === "win32") {
      return "start /wait notepad";
    }
    const editors = ["code", "vi", "nano"];
    return editors.find((command) => isCommandAvailable(command));
  });
});

// src/utils/promptEditor.ts
function isGuiEditor(editor) {
  return classifyGuiEditor(editor) !== undefined;
}
function editFileInEditor(filePath) {
  const fs = getFsImplementation();
  const inkInstance = instances_default.get(process.stdout);
  if (!inkInstance) {
    throw new Error("Ink instance not found - cannot pause rendering");
  }
  const editor = getExternalEditor();
  if (!editor) {
    return { content: null };
  }
  try {
    fs.statSync(filePath);
  } catch {
    return { content: null };
  }
  const useAlternateScreen = !isGuiEditor(editor);
  if (useAlternateScreen) {
    inkInstance.enterAlternateScreen();
  } else {
    inkInstance.pause();
    inkInstance.suspendStdin();
  }
  try {
    const editorCommand = EDITOR_OVERRIDES[editor] ?? editor;
    execSync_DEPRECATED(`${editorCommand} "${filePath}"`, {
      stdio: "inherit"
    });
    const editedContent = fs.readFileSync(filePath, { encoding: "utf-8" });
    return { content: editedContent };
  } catch (err) {
    if (typeof err === "object" && err !== null && "status" in err && typeof err.status === "number") {
      const status = err.status;
      if (status !== 0) {
        const editorName = toIDEDisplayName(editor);
        return {
          content: null,
          error: `${editorName} exited with code ${status}`
        };
      }
    }
    return { content: null };
  } finally {
    if (useAlternateScreen) {
      inkInstance.exitAlternateScreen();
    } else {
      inkInstance.resumeStdin();
      inkInstance.resume();
    }
  }
}
function recollapsePastedContent(editedPrompt, originalPrompt, pastedContents) {
  let collapsed = editedPrompt;
  for (const [id, content] of Object.entries(pastedContents)) {
    if (content.type === "text") {
      const pasteId = parseInt(id);
      const contentStr = content.content;
      const contentIndex = collapsed.indexOf(contentStr);
      if (contentIndex !== -1) {
        const numLines = getPastedTextRefNumLines(contentStr);
        const ref = formatPastedTextRef(pasteId, numLines);
        collapsed = collapsed.slice(0, contentIndex) + ref + collapsed.slice(contentIndex + contentStr.length);
      }
    }
  }
  return collapsed;
}
function editPromptInEditor(currentPrompt, pastedContents) {
  const fs = getFsImplementation();
  const tempFile = generateTempFilePath();
  try {
    const expandedPrompt = pastedContents ? expandPastedTextRefs(currentPrompt, pastedContents) : currentPrompt;
    writeFileSync_DEPRECATED(tempFile, expandedPrompt, {
      encoding: "utf-8",
      flush: true
    });
    const result = editFileInEditor(tempFile);
    if (result.content === null) {
      return result;
    }
    let finalContent = result.content;
    if (finalContent.endsWith(`
`) && !finalContent.endsWith(`

`)) {
      finalContent = finalContent.slice(0, -1);
    }
    if (pastedContents) {
      finalContent = recollapsePastedContent(finalContent, currentPrompt, pastedContents);
    }
    return { content: finalContent };
  } finally {
    try {
      fs.unlinkSync(tempFile);
    } catch {}
  }
}
var EDITOR_OVERRIDES;
var init_promptEditor = __esm(() => {
  init_history();
  init_instances();
  init_editor();
  init_execSyncWrapper();
  init_fsOperations();
  init_ide();
  init_slowOperations();
  init_tempfile();
  EDITOR_OVERRIDES = {
    code: "code -w",
    subl: "subl --wait"
  };
});

export { getExternalEditor, init_editor, editFileInEditor, editPromptInEditor, init_promptEditor };
