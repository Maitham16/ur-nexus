import {
  init_AppState,
  useAppState
} from "./index-79vhy4mk.js";
import {
  Pane,
  init_Pane,
  init_useKeybinding,
  useKeybinding
} from "./index-grma1d53.js";
import"./index-h3gckbec.js";
import"./index-e4qqkpaw.js";
import {
  ThemedBox_default,
  ThemedText,
  init_ink
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
import"./index-93rq225h.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// src/commands/session/session.tsx
function SessionInfo({ onDone }) {
  const remoteSessionUrl = useAppState((s) => s.remoteSessionUrl);
  useKeybinding("confirm:no", onDone, { context: "Confirmation" });
  if (!remoteSessionUrl) {
    return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Pane, {
      children: [
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          color: "warning",
          children: "Not in remote mode. Start with `ur --remote` to use this command."
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          dimColor: true,
          children: "(press esc to close)"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Pane, {
    children: [
      /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
        marginBottom: 1,
        children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          bold: true,
          children: "Remote session"
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this),
      /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
        marginTop: 1,
        children: [
          /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
            dimColor: true,
            children: "Open in browser: "
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
            color: "ide",
            children: remoteSessionUrl
          }, undefined, false, undefined, this)
        ]
      }, undefined, true, undefined, this),
      /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
        marginTop: 1,
        children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          dimColor: true,
          children: "(press esc to close)"
        }, undefined, false, undefined, this)
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}
var jsx_dev_runtime, call = async (onDone) => {
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(SessionInfo, {
    onDone
  }, undefined, false, undefined, this);
};
var init_session = __esm(() => {
  init_Pane();
  init_ink();
  init_useKeybinding();
  init_AppState();
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});
init_session();

export {
  call
};
