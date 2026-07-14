import {
  ThemePicker,
  init_ThemePicker
} from "./index-v43rwcqm.js";
import"./index-7fe5jn6w.js";
import"./index-kkermbsd.js";
import {
  Pane,
  init_Pane
} from "./index-gph76kef.js";
import"./index-2j7c2ame.js";
import {
  init_ink,
  require_compiler_runtime,
  useTheme
} from "./index-61fyyngt.js";
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
import {
  require_jsx_dev_runtime
} from "./index-mpvjr5hg.js";
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
import"./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/commands/theme/theme.tsx
function ThemePickerCommand(t0) {
  const $ = import_compiler_runtime.c(8);
  const {
    onDone
  } = t0;
  const [, setTheme] = useTheme();
  let t1;
  if ($[0] !== onDone || $[1] !== setTheme) {
    t1 = (setting) => {
      setTheme(setting);
      onDone(`Theme set to ${setting}`);
    };
    $[0] = onDone;
    $[1] = setTheme;
    $[2] = t1;
  } else {
    t1 = $[2];
  }
  let t2;
  if ($[3] !== onDone) {
    t2 = () => {
      onDone("Theme picker dismissed", {
        display: "system"
      });
    };
    $[3] = onDone;
    $[4] = t2;
  } else {
    t2 = $[4];
  }
  let t3;
  if ($[5] !== t1 || $[6] !== t2) {
    t3 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Pane, {
      color: "permission",
      children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemePicker, {
        onThemeSelect: t1,
        onCancel: t2,
        skipExitHandling: true
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this);
    $[5] = t1;
    $[6] = t2;
    $[7] = t3;
  } else {
    t3 = $[7];
  }
  return t3;
}
var import_compiler_runtime, jsx_dev_runtime, call = async (onDone, _context) => {
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemePickerCommand, {
    onDone
  }, undefined, false, undefined, this);
};
var init_theme = __esm(() => {
  init_Pane();
  init_ThemePicker();
  init_ink();
  import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});
init_theme();

export {
  call
};
