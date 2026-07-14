import {
  BashTool,
  ShellProgressMessage,
  UserBashInputMessage,
  createSyntheticUserCaveatMessage,
  createUserInterruptionMessage,
  createUserMessage,
  exports_PowerShellTool,
  init_BashTool,
  init_PowerShellTool,
  init_ShellProgressMessage,
  init_UserBashInputMessage,
  init_messages1 as init_messages,
  init_shellToolUtils,
  init_toolResultStorage,
  isPowerShellToolEnabled,
  prepareUserContent,
  processToolResultBlock
} from "./index-79vhy4mk.js";
import"./index-grma1d53.js";
import"./index-h3gckbec.js";
import"./index-e4qqkpaw.js";
import {
  ThemedBox_default,
  init_ink,
  require_compiler_runtime
} from "./index-4ywxxsys.js";
import"./index-hq5et9ce.js";
import"./index-e6d6jy9m.js";
import"./index-f8sv7ymg.js";
import {
  escapeXml,
  init_xml
} from "./index-bkd049y5.js";
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
import {
  getInitialSettings,
  init_settings1 as init_settings
} from "./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import {
  init_analytics,
  logEvent
} from "./index-mpmmtc93.js";
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
import {
  ShellError,
  errorMessage,
  init_errors
} from "./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __toCommonJS,
  __toESM
} from "./index-8rxa073f.js";

// src/utils/processUserInput/processBashCommand.tsx
import { randomUUID } from "crypto";

// src/components/BashModeProgress.tsx
init_ink();
init_BashTool();
init_UserBashInputMessage();
init_ShellProgressMessage();
var import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
var jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
function BashModeProgress(t0) {
  const $ = import_compiler_runtime.c(8);
  const {
    input,
    progress,
    verbose
  } = t0;
  const t1 = `<bash-input>${input}</bash-input>`;
  let t2;
  if ($[0] !== t1) {
    t2 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(UserBashInputMessage, {
      addMargin: false,
      param: {
        text: t1,
        type: "text"
      }
    }, undefined, false, undefined, this);
    $[0] = t1;
    $[1] = t2;
  } else {
    t2 = $[1];
  }
  let t3;
  if ($[2] !== progress || $[3] !== verbose) {
    t3 = progress ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ShellProgressMessage, {
      fullOutput: progress.fullOutput,
      output: progress.output,
      elapsedTimeSeconds: progress.elapsedTimeSeconds,
      totalLines: progress.totalLines,
      verbose
    }, undefined, false, undefined, this) : BashTool.renderToolUseProgressMessage?.([], {
      verbose,
      tools: [],
      terminalSize: undefined
    });
    $[2] = progress;
    $[3] = verbose;
    $[4] = t3;
  } else {
    t3 = $[4];
  }
  let t4;
  if ($[5] !== t2 || $[6] !== t3) {
    t4 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      marginTop: 1,
      children: [
        t2,
        t3
      ]
    }, undefined, true, undefined, this);
    $[5] = t2;
    $[6] = t3;
    $[7] = t4;
  } else {
    t4 = $[7];
  }
  return t4;
}

// src/utils/processUserInput/processBashCommand.tsx
init_BashTool();
init_analytics();
init_errors();
init_messages();

// src/utils/shell/resolveDefaultShell.ts
init_settings();
function resolveDefaultShell() {
  return getInitialSettings().defaultShell ?? "bash";
}

// src/utils/processUserInput/processBashCommand.tsx
init_shellToolUtils();
init_toolResultStorage();
init_xml();
var jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
async function processBashCommand(inputString, precedingInputBlocks, attachmentMessages, context, setToolJSX) {
  const usePowerShell = isPowerShellToolEnabled() && resolveDefaultShell() === "powershell";
  logEvent("tengu_input_bash", {
    powershell: usePowerShell
  });
  const userMessage = createUserMessage({
    content: prepareUserContent({
      inputString: `<bash-input>${inputString}</bash-input>`,
      precedingInputBlocks
    })
  });
  let jsx;
  setToolJSX({
    jsx: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(BashModeProgress, {
      input: inputString,
      progress: null,
      verbose: context.options.verbose
    }, undefined, false, undefined, this),
    shouldHidePromptInput: false
  });
  try {
    const bashModeContext = {
      ...context,
      setToolJSX: (_) => {
        jsx = _?.jsx;
      }
    };
    const onProgress = (progress) => {
      setToolJSX({
        jsx: /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(jsx_dev_runtime2.Fragment, {
          children: [
            /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(BashModeProgress, {
              input: inputString,
              progress: progress.data,
              verbose: context.options.verbose
            }, undefined, false, undefined, this),
            jsx
          ]
        }, undefined, true, undefined, this),
        shouldHidePromptInput: false,
        showSpinner: false
      });
    };
    let PowerShellTool = null;
    if (usePowerShell) {
      PowerShellTool = (init_PowerShellTool(), __toCommonJS(exports_PowerShellTool)).PowerShellTool;
    }
    const shellTool = PowerShellTool ?? BashTool;
    const response = PowerShellTool ? await PowerShellTool.call({
      command: inputString,
      dangerouslyDisableSandbox: true
    }, bashModeContext, undefined, undefined, onProgress) : await BashTool.call({
      command: inputString,
      dangerouslyDisableSandbox: true
    }, bashModeContext, undefined, undefined, onProgress);
    const data = response.data;
    if (!data) {
      throw new Error("No result received from shell command");
    }
    const stderr = data.stderr;
    const mapped = await processToolResultBlock(shellTool, {
      ...data,
      stderr: ""
    }, randomUUID());
    const stdout = typeof mapped.content === "string" ? mapped.content : escapeXml(data.stdout);
    return {
      messages: [createSyntheticUserCaveatMessage(), userMessage, ...attachmentMessages, createUserMessage({
        content: `<bash-stdout>${stdout}</bash-stdout><bash-stderr>${escapeXml(stderr)}</bash-stderr>`
      })],
      shouldQuery: false
    };
  } catch (e) {
    if (e instanceof ShellError) {
      if (e.interrupted) {
        return {
          messages: [createSyntheticUserCaveatMessage(), userMessage, createUserInterruptionMessage({
            toolUse: false
          }), ...attachmentMessages],
          shouldQuery: false
        };
      }
      return {
        messages: [createSyntheticUserCaveatMessage(), userMessage, ...attachmentMessages, createUserMessage({
          content: `<bash-stdout>${escapeXml(e.stdout)}</bash-stdout><bash-stderr>${escapeXml(e.stderr)}</bash-stderr>`
        })],
        shouldQuery: false
      };
    }
    return {
      messages: [createSyntheticUserCaveatMessage(), userMessage, ...attachmentMessages, createUserMessage({
        content: `<bash-stderr>Command failed: ${escapeXml(errorMessage(e))}</bash-stderr>`
      })],
      shouldQuery: false
    };
  } finally {
    setToolJSX(null);
  }
}
export {
  processBashCommand
};
