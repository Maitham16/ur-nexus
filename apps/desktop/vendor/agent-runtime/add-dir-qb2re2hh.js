import {
  AddWorkspaceDirectory,
  init_AddWorkspaceDirectory
} from "./index-7gzg427t.js";
import"./index-vpn0z3cm.js";
import {
  MessageResponse,
  SandboxManager,
  addDirHelpMessage,
  applyPermissionUpdate,
  init_MessageResponse,
  init_PermissionUpdate,
  init_sandbox_adapter,
  init_validation,
  persistPermissionUpdate,
  validateDirectoryForWorkspace
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
  init_source,
  source_default
} from "./index-133awary.js";
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
import {
  figures_default,
  init_figures
} from "./index-vpczjthp.js";
import"./index-t784n9jz.js";
import {
  getAdditionalDirectoriesForAgentMd,
  init_state,
  setAdditionalDirectoriesForAgentMd
} from "./index-93rq225h.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// src/commands/add-dir/add-dir.tsx
function AddDirError(t0) {
  const $ = import_compiler_runtime.c(10);
  const {
    message,
    args,
    onDone
  } = t0;
  let t1;
  let t2;
  if ($[0] !== onDone) {
    t1 = () => {
      const timer = setTimeout(onDone, 0);
      return () => clearTimeout(timer);
    };
    t2 = [onDone];
    $[0] = onDone;
    $[1] = t1;
    $[2] = t2;
  } else {
    t1 = $[1];
    t2 = $[2];
  }
  import_react.useEffect(t1, t2);
  let t3;
  if ($[3] !== args) {
    t3 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      dimColor: true,
      children: [
        figures_default.pointer,
        " /add-dir ",
        args
      ]
    }, undefined, true, undefined, this);
    $[3] = args;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  let t4;
  if ($[5] !== message) {
    t4 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(MessageResponse, {
      children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        children: message
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[5] = message;
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== t3 || $[8] !== t4) {
    t5 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      children: [
        t3,
        t4
      ]
    }, undefined, true, undefined, this);
    $[7] = t3;
    $[8] = t4;
    $[9] = t5;
  } else {
    t5 = $[9];
  }
  return t5;
}
async function call(onDone, context, args) {
  const directoryPath = (args ?? "").trim();
  const appState = context.getAppState();
  const handleAddDirectory = async (path, remember = false) => {
    const destination = remember ? "localSettings" : "session";
    const permissionUpdate = {
      type: "addDirectories",
      directories: [path],
      destination
    };
    const latestAppState = context.getAppState();
    const updatedContext = applyPermissionUpdate(latestAppState.toolPermissionContext, permissionUpdate);
    context.setAppState((prev) => ({
      ...prev,
      toolPermissionContext: updatedContext
    }));
    const currentDirs = getAdditionalDirectoriesForAgentMd();
    if (!currentDirs.includes(path)) {
      setAdditionalDirectoriesForAgentMd([...currentDirs, path]);
    }
    SandboxManager.refreshConfig();
    let message;
    if (remember) {
      try {
        persistPermissionUpdate(permissionUpdate);
        message = `Added ${source_default.bold(path)} as a working directory and saved to local settings`;
      } catch (error) {
        message = `Added ${source_default.bold(path)} as a working directory. Failed to save to local settings: ${error instanceof Error ? error.message : "Unknown error"}`;
      }
    } else {
      message = `Added ${source_default.bold(path)} as a working directory for this session`;
    }
    const messageWithHint = `${message} ${source_default.dim("· /permissions to manage")}`;
    onDone(messageWithHint);
  };
  if (!directoryPath) {
    return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(AddWorkspaceDirectory, {
      permissionContext: appState.toolPermissionContext,
      onAddDirectory: handleAddDirectory,
      onCancel: () => {
        onDone("Did not add a working directory.");
      }
    }, undefined, false, undefined, this);
  }
  const result = await validateDirectoryForWorkspace(directoryPath, appState.toolPermissionContext);
  if (result.resultType !== "success") {
    const message = addDirHelpMessage(result);
    return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(AddDirError, {
      message,
      args: args ?? "",
      onDone: () => onDone(message)
    }, undefined, false, undefined, this);
  }
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(AddWorkspaceDirectory, {
    directoryPath: result.absolutePath,
    permissionContext: appState.toolPermissionContext,
    onAddDirectory: handleAddDirectory,
    onCancel: () => {
      onDone(`Did not add ${source_default.bold(result.absolutePath)} as a working directory.`);
    }
  }, undefined, false, undefined, this);
}
var import_compiler_runtime, import_react, jsx_dev_runtime;
var init_add_dir = __esm(() => {
  init_source();
  init_figures();
  init_state();
  init_MessageResponse();
  init_AddWorkspaceDirectory();
  init_ink();
  init_PermissionUpdate();
  init_sandbox_adapter();
  init_validation();
  import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
  import_react = __toESM(require_react(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});
init_add_dir();

export {
  call
};
