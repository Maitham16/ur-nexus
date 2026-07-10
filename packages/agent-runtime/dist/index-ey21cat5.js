import {
  init_useMainLoopModel,
  useMainLoopModel
} from "./index-e4fg7j7t.js";
import {
  ConfigurableShortcutHint,
  ConsoleOAuthFlow,
  Dialog,
  clearTrustedDeviceToken,
  createDisabledBypassPermissionsContext,
  enrollTrustedDevice,
  init_AppState,
  init_ConfigurableShortcutHint,
  init_ConsoleOAuthFlow,
  init_Dialog,
  init_messages1 as init_messages,
  init_permissionSetup,
  init_policyLimits,
  init_remoteManagedSettings,
  init_trustedDevice,
  refreshPolicyLimits,
  refreshRemoteManagedSettings,
  shouldDisableBypassPermissions,
  stripSignatureBlocks
} from "./index-qv8mzsdh.js";
import {
  ThemedText,
  init_ink,
  require_compiler_runtime
} from "./index-xy62w38z.js";
import {
  require_jsx_dev_runtime,
  require_react
} from "./index-mpvjr5hg.js";
import {
  init_growthbook,
  init_user,
  refreshGrowthBookAfterAuthChange,
  resetUserCache
} from "./index-nds05g02.js";
import {
  init_state,
  resetCostState
} from "./index-nhjg91p1.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/utils/permissions/bypassPermissionsKillswitch.ts
async function checkAndDisableBypassPermissionsIfNeeded(toolPermissionContext, setAppState) {
  if (bypassPermissionsCheckRan) {
    return;
  }
  bypassPermissionsCheckRan = true;
  if (!toolPermissionContext.isBypassPermissionsModeAvailable) {
    return;
  }
  const shouldDisable = await shouldDisableBypassPermissions();
  if (!shouldDisable) {
    return;
  }
  setAppState((prev) => {
    return {
      ...prev,
      toolPermissionContext: createDisabledBypassPermissionsContext(prev.toolPermissionContext)
    };
  });
}
function resetBypassPermissionsCheck() {
  bypassPermissionsCheckRan = false;
}
var import_react, bypassPermissionsCheckRan = false;
var init_bypassPermissionsKillswitch = __esm(() => {
  init_AppState();
  init_state();
  init_permissionSetup();
  import_react = __toESM(require_react(), 1);
});

// ../../src/commands/login/login.tsx
async function call(onDone, context) {
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Login, {
    onDone: async (success) => {
      context.onChangeAPIKey();
      context.setMessages(stripSignatureBlocks);
      if (success) {
        resetCostState();
        refreshRemoteManagedSettings();
        refreshPolicyLimits();
        resetUserCache();
        refreshGrowthBookAfterAuthChange();
        clearTrustedDeviceToken();
        enrollTrustedDevice();
        resetBypassPermissionsCheck();
        const appState = context.getAppState();
        checkAndDisableBypassPermissionsIfNeeded(appState.toolPermissionContext, context.setAppState);
        if (false) {}
        context.setAppState((prev) => ({
          ...prev,
          authVersion: prev.authVersion + 1
        }));
      }
      onDone(success ? "Login successful" : "Login interrupted");
    }
  }, undefined, false, undefined, this);
}
function Login(props) {
  const $ = import_compiler_runtime.c(12);
  const mainLoopModel = useMainLoopModel();
  let t0;
  if ($[0] !== mainLoopModel || $[1] !== props) {
    t0 = () => props.onDone(false, mainLoopModel);
    $[0] = mainLoopModel;
    $[1] = props;
    $[2] = t0;
  } else {
    t0 = $[2];
  }
  let t1;
  if ($[3] !== mainLoopModel || $[4] !== props) {
    t1 = () => props.onDone(true, mainLoopModel);
    $[3] = mainLoopModel;
    $[4] = props;
    $[5] = t1;
  } else {
    t1 = $[5];
  }
  let t2;
  if ($[6] !== props.startingMessage || $[7] !== t1) {
    t2 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ConsoleOAuthFlow, {
      onDone: t1,
      startingMessage: props.startingMessage
    }, undefined, false, undefined, this);
    $[6] = props.startingMessage;
    $[7] = t1;
    $[8] = t2;
  } else {
    t2 = $[8];
  }
  let t3;
  if ($[9] !== t0 || $[10] !== t2) {
    t3 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Dialog, {
      title: "Login",
      onCancel: t0,
      color: "permission",
      inputGuide: _temp,
      children: t2
    }, undefined, false, undefined, this);
    $[9] = t0;
    $[10] = t2;
    $[11] = t3;
  } else {
    t3 = $[11];
  }
  return t3;
}
function _temp(exitState) {
  return exitState.pending ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
    children: [
      "Press ",
      exitState.keyName,
      " again to exit"
    ]
  }, undefined, true, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ConfigurableShortcutHint, {
    action: "confirm:no",
    context: "Confirmation",
    fallback: "Esc",
    description: "cancel"
  }, undefined, false, undefined, this);
}
var import_compiler_runtime, jsx_dev_runtime;
var init_login = __esm(() => {
  init_state();
  init_trustedDevice();
  init_ConfigurableShortcutHint();
  init_ConsoleOAuthFlow();
  init_Dialog();
  init_useMainLoopModel();
  init_ink();
  init_growthbook();
  init_policyLimits();
  init_remoteManagedSettings();
  init_messages();
  init_bypassPermissionsKillswitch();
  init_user();
  import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});

export { call, Login, init_login };
