import {
  Dialog,
  Select,
  getCurrentSessionTag,
  getTranscriptPath,
  init_Dialog,
  init_sanitization,
  init_select,
  init_sessionStorage,
  recursivelySanitizeUnicode,
  saveTag
} from "./index-5wrehbeq.js";
import"./index-by2vmtsd.js";
import"./index-kkermbsd.js";
import"./index-v2hw7r4c.js";
import {
  ThemedBox_default,
  ThemedText,
  init_ink,
  require_compiler_runtime
} from "./index-xy62w38z.js";
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
  init_source,
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
import {
  getSessionId,
  init_state
} from "./index-nhjg91p1.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/commands/tag/tag.tsx
function ConfirmRemoveTag(t0) {
  const $ = import_compiler_runtime.c(11);
  const {
    tagName,
    onConfirm,
    onCancel
  } = t0;
  const t1 = `Current tag: #${tagName}`;
  let t2;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t2 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      children: "This will remove the tag from the current session."
    }, undefined, false, undefined, this);
    $[0] = t2;
  } else {
    t2 = $[0];
  }
  let t3;
  if ($[1] !== onCancel || $[2] !== onConfirm) {
    t3 = (value) => value === "yes" ? onConfirm() : onCancel();
    $[1] = onCancel;
    $[2] = onConfirm;
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  let t4;
  if ($[4] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = [{
      label: "Yes, remove tag",
      value: "yes"
    }, {
      label: "No, keep tag",
      value: "no"
    }];
    $[4] = t4;
  } else {
    t4 = $[4];
  }
  let t5;
  if ($[5] !== t3) {
    t5 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      gap: 1,
      children: [
        t2,
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Select, {
          onChange: t3,
          options: t4
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
    $[5] = t3;
    $[6] = t5;
  } else {
    t5 = $[6];
  }
  let t6;
  if ($[7] !== onCancel || $[8] !== t1 || $[9] !== t5) {
    t6 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Dialog, {
      title: "Remove tag?",
      subtitle: t1,
      onCancel,
      color: "warning",
      children: t5
    }, undefined, false, undefined, this);
    $[7] = onCancel;
    $[8] = t1;
    $[9] = t5;
    $[10] = t6;
  } else {
    t6 = $[10];
  }
  return t6;
}
function ToggleTagAndClose(t0) {
  const $ = import_compiler_runtime.c(17);
  const {
    tagName,
    onDone
  } = t0;
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [sessionId, setSessionId] = React.useState(null);
  let t1;
  if ($[0] !== tagName) {
    t1 = recursivelySanitizeUnicode(tagName).trim();
    $[0] = tagName;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const normalizedTag = t1;
  let t2;
  let t3;
  if ($[2] !== normalizedTag || $[3] !== onDone) {
    t2 = () => {
      const id = getSessionId();
      if (!id) {
        onDone("No active session to tag", {
          display: "system"
        });
        return;
      }
      if (!normalizedTag) {
        onDone("Tag name cannot be empty", {
          display: "system"
        });
        return;
      }
      setSessionId(id);
      const currentTag = getCurrentSessionTag(id);
      if (currentTag === normalizedTag) {
        logEvent("tengu_tag_command_remove_prompt", {});
        setShowConfirm(true);
      } else {
        const isReplacing = !!currentTag;
        logEvent("tengu_tag_command_add", {
          is_replacing: isReplacing
        });
        (async () => {
          const fullPath = getTranscriptPath();
          await saveTag(id, normalizedTag, fullPath);
          onDone(`Tagged session with ${source_default.cyan(`#${normalizedTag}`)}`, {
            display: "system"
          });
        })();
      }
    };
    t3 = [normalizedTag, onDone];
    $[2] = normalizedTag;
    $[3] = onDone;
    $[4] = t2;
    $[5] = t3;
  } else {
    t2 = $[4];
    t3 = $[5];
  }
  React.useEffect(t2, t3);
  if (showConfirm && sessionId) {
    let t4;
    if ($[6] !== normalizedTag || $[7] !== onDone || $[8] !== sessionId) {
      t4 = async () => {
        logEvent("tengu_tag_command_remove_confirmed", {});
        const fullPath_0 = getTranscriptPath();
        await saveTag(sessionId, "", fullPath_0);
        onDone(`Removed tag ${source_default.cyan(`#${normalizedTag}`)}`, {
          display: "system"
        });
      };
      $[6] = normalizedTag;
      $[7] = onDone;
      $[8] = sessionId;
      $[9] = t4;
    } else {
      t4 = $[9];
    }
    let t5;
    if ($[10] !== normalizedTag || $[11] !== onDone) {
      t5 = () => {
        logEvent("tengu_tag_command_remove_cancelled", {});
        onDone(`Kept tag ${source_default.cyan(`#${normalizedTag}`)}`, {
          display: "system"
        });
      };
      $[10] = normalizedTag;
      $[11] = onDone;
      $[12] = t5;
    } else {
      t5 = $[12];
    }
    let t6;
    if ($[13] !== normalizedTag || $[14] !== t4 || $[15] !== t5) {
      t6 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ConfirmRemoveTag, {
        tagName: normalizedTag,
        onConfirm: t4,
        onCancel: t5
      }, undefined, false, undefined, this);
      $[13] = normalizedTag;
      $[14] = t4;
      $[15] = t5;
      $[16] = t6;
    } else {
      t6 = $[16];
    }
    return t6;
  }
  return null;
}
function ShowHelp(t0) {
  const $ = import_compiler_runtime.c(3);
  const {
    onDone
  } = t0;
  let t1;
  let t2;
  if ($[0] !== onDone) {
    t1 = () => {
      onDone(`Usage: /tag <tag-name>

Toggle a searchable tag on the current session.
Run the same command again to remove the tag.
Tags are displayed after the branch name in /resume and can be searched with /.

Examples:
  /tag bugfix        # Add tag
  /tag bugfix        # Remove tag (toggle)
  /tag feature-auth
  /tag wip`, {
        display: "system"
      });
    };
    t2 = [onDone];
    $[0] = onDone;
    $[1] = t1;
    $[2] = t2;
  } else {
    t1 = $[1];
    t2 = $[2];
  }
  React.useEffect(t1, t2);
  return null;
}
async function call(onDone, _context, args) {
  args = args?.trim() || "";
  if (COMMON_INFO_ARGS.includes(args) || COMMON_HELP_ARGS.includes(args)) {
    return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ShowHelp, {
      onDone
    }, undefined, false, undefined, this);
  }
  if (!args) {
    return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ShowHelp, {
      onDone
    }, undefined, false, undefined, this);
  }
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ToggleTagAndClose, {
    tagName: args,
    onDone
  }, undefined, false, undefined, this);
}
var import_compiler_runtime, React, jsx_dev_runtime;
var init_tag = __esm(() => {
  init_source();
  init_state();
  init_select();
  init_Dialog();
  init_xml();
  init_ink();
  init_analytics();
  init_sanitization();
  init_sessionStorage();
  import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
  React = __toESM(require_react(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});
init_tag();

export {
  call
};
