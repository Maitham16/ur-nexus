import {
  editFileInEditor,
  init_promptEditor
} from "./index-57yw8y3q.js";
import {
  DEFAULT_BINDINGS,
  NON_REBINDABLE,
  getKeybindingsPath,
  init_defaultBindings,
  init_loadUserBindings,
  init_reservedShortcuts,
  isKeybindingCustomizationEnabled,
  normalizeKeyForComparison
} from "./index-7fe5jn6w.js";
import"./index-kkermbsd.js";
import"./index-gph76kef.js";
import"./index-2j7c2ame.js";
import"./index-61fyyngt.js";
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
import"./index-mpvjr5hg.js";
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
import"./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import"./index-z5aeypvg.js";
import"./index-5jmh1e0k.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-wxsgjqjk.js";
import"./index-s1a1wahe.js";
import"./index-wred0kdg.js";
import"./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-7bd814mt.js";
import"./index-m9qhxms7.js";
import {
  getErrnoCode,
  init_errors,
  init_slowOperations,
  jsonStringify
} from "./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/keybindings/template.ts
function filterReservedShortcuts(blocks) {
  const reservedKeys = new Set(NON_REBINDABLE.map((r) => normalizeKeyForComparison(r.key)));
  return blocks.map((block) => {
    const filteredBindings = {};
    for (const [key, action] of Object.entries(block.bindings)) {
      if (!reservedKeys.has(normalizeKeyForComparison(key))) {
        filteredBindings[key] = action;
      }
    }
    return { context: block.context, bindings: filteredBindings };
  }).filter((block) => Object.keys(block.bindings).length > 0);
}
function generateKeybindingsTemplate() {
  const bindings = filterReservedShortcuts(DEFAULT_BINDINGS);
  const config = {
    $schema: "https://www.schemastore.org/ur-keybindings.json",
    $docs: "https://docs.ur.dev/docs/en/keybindings",
    bindings
  };
  return jsonStringify(config, null, 2) + `
`;
}
var init_template = __esm(() => {
  init_slowOperations();
  init_defaultBindings();
  init_reservedShortcuts();
});

// ../../src/commands/keybindings/keybindings.ts
import { mkdir, writeFile } from "fs/promises";
import { dirname } from "path";
async function call() {
  if (!isKeybindingCustomizationEnabled()) {
    return {
      type: "text",
      value: "Keybinding customization is not enabled. This feature is currently in preview."
    };
  }
  const keybindingsPath = getKeybindingsPath();
  let fileExists = false;
  await mkdir(dirname(keybindingsPath), { recursive: true });
  try {
    await writeFile(keybindingsPath, generateKeybindingsTemplate(), {
      encoding: "utf-8",
      flag: "wx"
    });
  } catch (e) {
    if (getErrnoCode(e) === "EEXIST") {
      fileExists = true;
    } else {
      throw e;
    }
  }
  const result = await editFileInEditor(keybindingsPath);
  if (result.error) {
    return {
      type: "text",
      value: `${fileExists ? "Opened" : "Created"} ${keybindingsPath}. Could not open in editor: ${result.error}`
    };
  }
  return {
    type: "text",
    value: fileExists ? `Opened ${keybindingsPath} in your editor.` : `Created ${keybindingsPath} with template. Opened in your editor.`
  };
}
var init_keybindings = __esm(() => {
  init_loadUserBindings();
  init_template();
  init_errors();
  init_promptEditor();
});
init_keybindings();

export {
  call
};
