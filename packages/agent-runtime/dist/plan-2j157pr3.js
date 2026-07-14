import {
  editFileInEditor,
  getExternalEditor,
  init_editor,
  init_promptEditor
} from "./index-4btbx9mv.js";
import {
  init_staticRender,
  renderToString
} from "./index-pnx3j8wy.js";
import {
  applyPermissionUpdate,
  getPlan,
  getPlanFilePath,
  init_PermissionUpdate,
  init_ide,
  init_permissionSetup,
  init_plans,
  prepareContextForPlanMode,
  toIDEDisplayName
} from "./index-79vhy4mk.js";
import"./index-grma1d53.js";
import"./index-h3gckbec.js";
import"./index-e4qqkpaw.js";
import {
  ThemedBox_default,
  ThemedText,
  init_ink,
  require_compiler_runtime
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
  require_jsx_dev_runtime
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
import"./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import"./index-mpmmtc93.js";
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
import {
  handlePlanModeTransition,
  init_state
} from "./index-93rq225h.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// src/commands/plan/plan.tsx
function PlanDisplay(t0) {
  const $ = import_compiler_runtime.c(11);
  const {
    planContent,
    planPath,
    editorName
  } = t0;
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      bold: true,
      children: "Current Plan"
    }, undefined, false, undefined, this);
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  let t2;
  if ($[1] !== planPath) {
    t2 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      dimColor: true,
      children: planPath
    }, undefined, false, undefined, this);
    $[1] = planPath;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  let t3;
  if ($[3] !== planContent) {
    t3 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      marginTop: 1,
      children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        children: planContent
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[3] = planContent;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  let t4;
  if ($[5] !== editorName) {
    t4 = editorName && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      marginTop: 1,
      children: [
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          dimColor: true,
          children: '"/plan open"'
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          dimColor: true,
          children: " to edit this plan in "
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          bold: true,
          dimColor: true,
          children: editorName
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
    $[5] = editorName;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== t2 || $[8] !== t3 || $[9] !== t4) {
    t5 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      children: [
        t1,
        t2,
        t3,
        t4
      ]
    }, undefined, true, undefined, this);
    $[7] = t2;
    $[8] = t3;
    $[9] = t4;
    $[10] = t5;
  } else {
    t5 = $[10];
  }
  return t5;
}
async function call(onDone, context, args) {
  const {
    getAppState,
    setAppState
  } = context;
  const appState = getAppState();
  const currentMode = appState.toolPermissionContext.mode;
  if (currentMode !== "plan") {
    handlePlanModeTransition(currentMode, "plan");
    setAppState((prev) => ({
      ...prev,
      toolPermissionContext: applyPermissionUpdate(prepareContextForPlanMode(prev.toolPermissionContext), {
        type: "setMode",
        mode: "plan",
        destination: "session"
      })
    }));
    const description = args.trim();
    if (description && description !== "open") {
      onDone("Enabled plan mode", {
        shouldQuery: true
      });
    } else {
      onDone("Enabled plan mode");
    }
    return null;
  }
  const planContent = getPlan();
  const planPath = getPlanFilePath();
  if (!planContent) {
    onDone("Already in plan mode. No plan written yet.");
    return null;
  }
  const argList = args.trim().split(/\s+/);
  if (argList[0] === "open") {
    const result = await editFileInEditor(planPath);
    if (result.error) {
      onDone(`Failed to open plan in editor: ${result.error}`);
    } else {
      onDone(`Opened plan in editor: ${planPath}`);
    }
    return null;
  }
  const editor = getExternalEditor();
  const editorName = editor ? toIDEDisplayName(editor) : undefined;
  const display = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(PlanDisplay, {
    planContent,
    planPath,
    editorName
  }, undefined, false, undefined, this);
  const output = await renderToString(display);
  onDone(output);
  return null;
}
var import_compiler_runtime, jsx_dev_runtime;
var init_plan = __esm(() => {
  init_state();
  init_ink();
  init_editor();
  init_ide();
  init_PermissionUpdate();
  init_permissionSetup();
  init_plans();
  init_promptEditor();
  init_staticRender();
  import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});
init_plan();

export {
  call
};
