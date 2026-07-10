import {
  editFileInEditor,
  init_promptEditor
} from "./index-9e8dqvth.js";
import {
  DEFAULT_BINDINGS,
  NON_REBINDABLE,
  getKeybindingsPath,
  init_defaultBindings,
  init_loadUserBindings,
  init_reservedShortcuts,
  isKeybindingCustomizationEnabled,
  normalizeKeyForComparison
} from "./index-ncjdg6tp.js";
import"./index-by2vmtsd.js";
import"./index-kkermbsd.js";
import"./index-v2hw7r4c.js";
import"./index-xy62w38z.js";
import"./index-cqtb7hz4.js";
import"./index-r9gwtga0.js";
import"./index-s87snjmt.js";
import"./index-ked7nkp4.js";
import"./index-vpn9zab9.js";
import"./index-pm2fs369.js";
import"./index-e7zhbfbk.js";
import"./index-1ckv14g7.js";
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
import"./index-mpvjr5hg.js";
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
import"./index-nds05g02.js";
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
import {
  getErrnoCode,
  init_errors,
  init_slowOperations,
  jsonStringify
} from "./index-bdb5pzbm.js";
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
