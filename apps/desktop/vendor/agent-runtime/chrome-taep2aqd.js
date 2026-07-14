import {
  init_chromeMcpCompat
} from "./index-14j0p9st.js";
import {
  Dialog,
  Select,
  UR_IN_CHROME_MCP_SERVER_NAME,
  getAllBrowserDataPaths,
  init_AppState,
  init_Dialog,
  init_common1 as init_common,
  init_prompt5 as init_prompt,
  init_select,
  openInChrome,
  useAppState
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
import {
  init_browser,
  openBrowser
} from "./index-wpmv59x8.js";
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
  env,
  getGlobalConfig,
  getPlatform,
  init_auth,
  init_bundledMode,
  init_config,
  init_env,
  init_growthbook,
  init_platform,
  isURAISubscriber,
  saveGlobalConfig
} from "./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import"./index-mpmmtc93.js";
import"./index-s5dp14ed.js";
import"./index-6dy59xbm.js";
import {
  init_execFileNoThrow
} from "./index-0r3wd4mq.js";
import"./index-b5f4m7g4.js";
import"./index-h7h0j06f.js";
import"./index-7h9ddexs.js";
import"./index-f80dj2bz.js";
import"./index-q00jv0fc.js";
import"./index-cs7da0vv.js";
import"./index-ycnb0yeb.js";
import"./index-vpczjthp.js";
import {
  init_debug,
  init_envUtils,
  init_errors,
  init_slowOperations,
  isFsInaccessible,
  logForDebugging
} from "./index-t784n9jz.js";
import {
  init_state
} from "./index-93rq225h.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// src/utils/urInChrome/setupPortable.ts
import { readdir } from "fs/promises";
import { join } from "path";
function getExtensionIds() {
  return process.env.USER_TYPE === "ant" ? [PROD_EXTENSION_ID, DEV_EXTENSION_ID, ANT_EXTENSION_ID] : [PROD_EXTENSION_ID];
}
async function detectExtensionInstallationPortable(browserPaths, log) {
  if (browserPaths.length === 0) {
    log?.(`[UR in Chrome] No browser paths to check`);
    return { isInstalled: false, browser: null };
  }
  const extensionIds = getExtensionIds();
  for (const { browser, path: browserBasePath } of browserPaths) {
    let browserProfileEntries = [];
    try {
      browserProfileEntries = await readdir(browserBasePath, {
        withFileTypes: true
      });
    } catch (e) {
      if (isFsInaccessible(e))
        continue;
      throw e;
    }
    const profileDirs = browserProfileEntries.filter((entry) => entry.isDirectory()).filter((entry) => entry.name === "Default" || entry.name.startsWith("Profile ")).map((entry) => entry.name);
    if (profileDirs.length > 0) {
      log?.(`[UR in Chrome] Found ${browser} profiles: ${profileDirs.join(", ")}`);
    }
    for (const profile of profileDirs) {
      for (const extensionId of extensionIds) {
        const extensionPath = join(browserBasePath, profile, "Extensions", extensionId);
        try {
          await readdir(extensionPath);
          log?.(`[UR in Chrome] Extension ${extensionId} found in ${browser} ${profile}`);
          return { isInstalled: true, browser };
        } catch {}
      }
    }
  }
  log?.(`[UR in Chrome] Extension not found in any browser`);
  return { isInstalled: false, browser: null };
}
async function isChromeExtensionInstalledPortable(browserPaths, log) {
  const result = await detectExtensionInstallationPortable(browserPaths, log);
  return result.isInstalled;
}
var PROD_EXTENSION_ID = "fcoeoabgfenejglbffodgkkbkcdhcgfn", DEV_EXTENSION_ID = "dihbgbndebgnbjfmelmegjepbnkhlgni", ANT_EXTENSION_ID = "dngcpimnedloihjnnfngkgjoidhnaolf";
var init_setupPortable = __esm(() => {
  init_errors();
});

// src/utils/urInChrome/setup.ts
async function isChromeExtensionInstalled() {
  const browserPaths = getAllBrowserDataPaths();
  if (browserPaths.length === 0) {
    logForDebugging(`[UR in Chrome] Unsupported platform for extension detection: ${getPlatform()}`);
    return false;
  }
  return isChromeExtensionInstalledPortable(browserPaths, logForDebugging);
}
var NATIVE_HOST_IDENTIFIER = "com.urhq.ur_browser_extension", NATIVE_HOST_MANIFEST_NAME;
var init_setup = __esm(() => {
  init_chromeMcpCompat();
  init_state();
  init_growthbook();
  init_bundledMode();
  init_config();
  init_debug();
  init_envUtils();
  init_execFileNoThrow();
  init_platform();
  init_slowOperations();
  init_common();
  init_prompt();
  init_setupPortable();
  NATIVE_HOST_MANIFEST_NAME = `${NATIVE_HOST_IDENTIFIER}.json`;
});

// src/commands/chrome/chrome.tsx
function URInChromeMenu(t0) {
  const $ = import_compiler_runtime.c(41);
  const {
    onDone,
    isExtensionInstalled: installed,
    configEnabled,
    isURAISubscriber: isURAISubscriber2,
    isWSL
  } = t0;
  const mcpClients = useAppState(_temp);
  const [selectKey, setSelectKey] = import_react.useState(0);
  const [enabledByDefault, setEnabledByDefault] = import_react.useState(configEnabled ?? false);
  const [showInstallHint, setShowInstallHint] = import_react.useState(false);
  const [isExtensionInstalled, setIsExtensionInstalled] = import_react.useState(installed);
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = false;
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const isHomespace = t1;
  let t2;
  if ($[1] !== mcpClients) {
    t2 = mcpClients.find(_temp2);
    $[1] = mcpClients;
    $[2] = t2;
  } else {
    t2 = $[2];
  }
  const chromeClient = t2;
  const isConnected = chromeClient?.type === "connected";
  let t3;
  if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
    t3 = function openUrl2(url) {
      if (isHomespace) {
        openBrowser(url);
      } else {
        openInChrome(url);
      }
    };
    $[3] = t3;
  } else {
    t3 = $[3];
  }
  const openUrl = t3;
  let t4;
  if ($[4] !== enabledByDefault) {
    t4 = function handleAction2(action) {
      bb22:
        switch (action) {
          case "install-extension": {
            setSelectKey(_temp3);
            setShowInstallHint(true);
            openUrl(CHROME_EXTENSION_URL);
            break bb22;
          }
          case "reconnect": {
            setSelectKey(_temp4);
            isChromeExtensionInstalled().then((installed_0) => {
              setIsExtensionInstalled(installed_0);
              if (installed_0) {
                setShowInstallHint(false);
              }
            });
            openUrl(CHROME_RECONNECT_URL);
            break bb22;
          }
          case "manage-permissions": {
            setSelectKey(_temp5);
            openUrl(CHROME_PERMISSIONS_URL);
            break bb22;
          }
          case "toggle-default": {
            const newValue = !enabledByDefault;
            saveGlobalConfig((current) => ({
              ...current,
              urInChromeDefaultEnabled: newValue
            }));
            setEnabledByDefault(newValue);
          }
        }
    };
    $[4] = enabledByDefault;
    $[5] = t4;
  } else {
    t4 = $[5];
  }
  const handleAction = t4;
  let options;
  if ($[6] !== enabledByDefault || $[7] !== isExtensionInstalled) {
    options = [];
    const requiresExtensionSuffix = isExtensionInstalled ? "" : " (requires extension)";
    if (!isExtensionInstalled && !isHomespace) {
      let t53;
      if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t53 = {
          label: "Install Chrome extension",
          value: "install-extension"
        };
        $[9] = t53;
      } else {
        t53 = $[9];
      }
      options.push(t53);
    }
    let t52;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
      t52 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        children: "Manage permissions"
      }, undefined, false, undefined, this);
      $[10] = t52;
    } else {
      t52 = $[10];
    }
    let t62;
    if ($[11] !== requiresExtensionSuffix) {
      t62 = {
        label: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
          children: [
            t52,
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              dimColor: true,
              children: requiresExtensionSuffix
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        value: "manage-permissions"
      };
      $[11] = requiresExtensionSuffix;
      $[12] = t62;
    } else {
      t62 = $[12];
    }
    let t72;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
      t72 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
        children: "Reconnect extension"
      }, undefined, false, undefined, this);
      $[13] = t72;
    } else {
      t72 = $[13];
    }
    let t82;
    if ($[14] !== requiresExtensionSuffix) {
      t82 = {
        label: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
          children: [
            t72,
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              dimColor: true,
              children: requiresExtensionSuffix
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        value: "reconnect"
      };
      $[14] = requiresExtensionSuffix;
      $[15] = t82;
    } else {
      t82 = $[15];
    }
    const t92 = `Enabled by default: ${enabledByDefault ? "Yes" : "No"}`;
    let t102;
    if ($[16] !== t92) {
      t102 = {
        label: t92,
        value: "toggle-default"
      };
      $[16] = t92;
      $[17] = t102;
    } else {
      t102 = $[17];
    }
    options.push(t62, t82, t102);
    $[6] = enabledByDefault;
    $[7] = isExtensionInstalled;
    $[8] = options;
  } else {
    options = $[8];
  }
  const isDisabled = isWSL || !isURAISubscriber2;
  let t5;
  if ($[18] !== onDone) {
    t5 = () => onDone();
    $[18] = onDone;
    $[19] = t5;
  } else {
    t5 = $[19];
  }
  let t6;
  if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
    t6 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      children: "UR in Chrome works with the Chrome extension to let you control your browser directly from UR. Navigate websites, fill forms, capture screenshots, record GIFs, and debug with console logs and network requests."
    }, undefined, false, undefined, this);
    $[20] = t6;
  } else {
    t6 = $[20];
  }
  let t7;
  if ($[21] !== isWSL) {
    t7 = isWSL && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      color: "error",
      children: "UR in Chrome is not supported in WSL at this time."
    }, undefined, false, undefined, this);
    $[21] = isWSL;
    $[22] = t7;
  } else {
    t7 = $[22];
  }
  let t8;
  if ($[23] !== isURAISubscriber2) {
    t8 = !isURAISubscriber2 && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      color: "error",
      children: "UR in Chrome requires a ur.ai subscription."
    }, undefined, false, undefined, this);
    $[23] = isURAISubscriber2;
    $[24] = t8;
  } else {
    t8 = $[24];
  }
  let t9;
  if ($[25] !== handleAction || $[26] !== isConnected || $[27] !== isDisabled || $[28] !== isExtensionInstalled || $[29] !== options || $[30] !== selectKey || $[31] !== showInstallHint) {
    t9 = !isDisabled && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(jsx_dev_runtime.Fragment, {
      children: [
        !isHomespace && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
          flexDirection: "column",
          children: [
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              children: [
                "Status:",
                " ",
                isConnected ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                  color: "success",
                  children: "Enabled"
                }, undefined, false, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                  color: "inactive",
                  children: "Disabled"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this),
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              children: [
                "Extension:",
                " ",
                isExtensionInstalled ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                  color: "success",
                  children: "Installed"
                }, undefined, false, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
                  color: "warning",
                  children: "Not detected"
                }, undefined, false, undefined, this)
              ]
            }, undefined, true, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Select, {
          options,
          onChange: handleAction,
          hideIndexes: true
        }, selectKey, false, undefined, this),
        showInstallHint && /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          color: "warning",
          children: [
            "Once installed, select ",
            '"Reconnect extension"',
            " to connect."
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          children: [
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              dimColor: true,
              children: "Usage: "
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              children: "ur --chrome"
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              dimColor: true,
              children: " or "
            }, undefined, false, undefined, this),
            /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
              children: "ur --no-chrome"
            }, undefined, false, undefined, this)
          ]
        }, undefined, true, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          dimColor: true,
          children: "Site-level permissions are inherited from the Chrome extension. Manage permissions in the Chrome extension settings to control which sites UR can browse, click, and type on."
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
    $[25] = handleAction;
    $[26] = isConnected;
    $[27] = isDisabled;
    $[28] = isExtensionInstalled;
    $[29] = options;
    $[30] = selectKey;
    $[31] = showInstallHint;
    $[32] = t9;
  } else {
    t9 = $[32];
  }
  let t10;
  if ($[33] === Symbol.for("react.memo_cache_sentinel")) {
    t10 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      dimColor: true,
      children: "Learn more: https://docs.ur.dev/docs/en/chrome"
    }, undefined, false, undefined, this);
    $[33] = t10;
  } else {
    t10 = $[33];
  }
  let t11;
  if ($[34] !== t7 || $[35] !== t8 || $[36] !== t9) {
    t11 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      gap: 1,
      children: [
        t6,
        t7,
        t8,
        t9,
        t10
      ]
    }, undefined, true, undefined, this);
    $[34] = t7;
    $[35] = t8;
    $[36] = t9;
    $[37] = t11;
  } else {
    t11 = $[37];
  }
  let t12;
  if ($[38] !== t11 || $[39] !== t5) {
    t12 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Dialog, {
      title: "UR in Chrome (Beta)",
      onCancel: t5,
      color: "chromeYellow",
      children: t11
    }, undefined, false, undefined, this);
    $[38] = t11;
    $[39] = t5;
    $[40] = t12;
  } else {
    t12 = $[40];
  }
  return t12;
}
function _temp5(k) {
  return k + 1;
}
function _temp4(k_0) {
  return k_0 + 1;
}
function _temp3(k_1) {
  return k_1 + 1;
}
function _temp2(c) {
  return c.name === UR_IN_CHROME_MCP_SERVER_NAME;
}
function _temp(s) {
  return s.mcp.clients;
}
var import_compiler_runtime, import_react, jsx_dev_runtime, CHROME_EXTENSION_URL = "https://ur.ai/chrome", CHROME_PERMISSIONS_URL = "https://ur.ai/chrome/permissions", CHROME_RECONNECT_URL = "https://ur.ai/chrome/reconnect", call = async function(onDone) {
  const isExtensionInstalled = await isChromeExtensionInstalled();
  const config = getGlobalConfig();
  const isSubscriber = isURAISubscriber();
  const isWSL = env.isWslEnvironment();
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(URInChromeMenu, {
    onDone,
    isExtensionInstalled,
    configEnabled: config.urInChromeDefaultEnabled,
    isURAISubscriber: isSubscriber,
    isWSL
  }, undefined, false, undefined, this);
};
var init_chrome = __esm(() => {
  init_select();
  init_Dialog();
  init_ink();
  init_AppState();
  init_auth();
  init_browser();
  init_common();
  init_setup();
  init_config();
  init_env();
  init_envUtils();
  import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
  import_react = __toESM(require_react(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});
init_chrome();

export {
  call
};
