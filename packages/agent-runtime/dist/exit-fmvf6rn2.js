import {
  Dialog,
  Select,
  Spinner,
  cleanupWorktree,
  exports_sessionStorage,
  getCurrentWorktreeSession,
  getPlansDirectory,
  gracefulShutdown,
  init_Dialog,
  init_Shell,
  init_Spinner,
  init_concurrentSessions,
  init_gracefulShutdown,
  init_plans,
  init_sample,
  init_select,
  init_sessionStorage,
  init_worktree,
  keepWorktree,
  killTmuxSession,
  sample_default,
  setCwd
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
import"./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import {
  init_analytics,
  logEvent
} from "./index-mpmmtc93.js";
import"./index-s5dp14ed.js";
import"./index-6dy59xbm.js";
import {
  execFileNoThrow,
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
  logForDebugging
} from "./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm,
  __toCommonJS,
  __toESM
} from "./index-8rxa073f.js";

// src/components/WorktreeExitDialog.tsx
function recordWorktreeExit() {
  (init_sessionStorage(), __toCommonJS(exports_sessionStorage)).saveWorktreeState(null);
}
function WorktreeExitDialog({
  onDone,
  onCancel
}) {
  const [status, setStatus] = import_react.useState("loading");
  const [changes, setChanges] = import_react.useState([]);
  const [commitCount, setCommitCount] = import_react.useState(0);
  const [resultMessage, setResultMessage] = import_react.useState();
  const worktreeSession = getCurrentWorktreeSession();
  import_react.useEffect(() => {
    async function loadChanges() {
      let changeLines = [];
      const gitStatus = await execFileNoThrow("git", ["status", "--porcelain"]);
      if (gitStatus.stdout) {
        changeLines = gitStatus.stdout.split(`
`).filter((_) => _.trim() !== "");
        setChanges(changeLines);
      }
      if (worktreeSession) {
        const {
          stdout: commitsStr
        } = await execFileNoThrow("git", ["rev-list", "--count", `${worktreeSession.originalHeadCommit}..HEAD`]);
        const count = parseInt(commitsStr.trim()) || 0;
        setCommitCount(count);
        if (changeLines.length === 0 && count === 0) {
          setStatus("removing");
          cleanupWorktree().then(() => {
            process.chdir(worktreeSession.originalCwd);
            setCwd(worktreeSession.originalCwd);
            recordWorktreeExit();
            getPlansDirectory.cache.clear?.();
            setResultMessage("Worktree removed (no changes)");
          }).catch((error) => {
            logForDebugging(`Failed to clean up worktree: ${error}`, {
              level: "error"
            });
            setResultMessage("Worktree cleanup failed, exiting anyway");
          }).then(() => {
            setStatus("done");
          });
          return;
        } else {
          setStatus("asking");
        }
      }
    }
    loadChanges();
  }, [worktreeSession]);
  import_react.useEffect(() => {
    if (status === "done") {
      onDone(resultMessage);
    }
  }, [status, onDone, resultMessage]);
  if (!worktreeSession) {
    onDone("No active worktree session found", {
      display: "system"
    });
    return null;
  }
  if (status === "loading" || status === "done") {
    return null;
  }
  async function handleSelect(value) {
    if (!worktreeSession)
      return;
    const hasTmux = Boolean(worktreeSession.tmuxSessionName);
    if (value === "keep" || value === "keep-with-tmux") {
      setStatus("keeping");
      logEvent("tengu_worktree_kept", {
        commits: commitCount,
        changed_files: changes.length
      });
      await keepWorktree();
      process.chdir(worktreeSession.originalCwd);
      setCwd(worktreeSession.originalCwd);
      recordWorktreeExit();
      getPlansDirectory.cache.clear?.();
      if (hasTmux) {
        setResultMessage(`Worktree kept. Your work is saved at ${worktreeSession.worktreePath} on branch ${worktreeSession.worktreeBranch}. Reattach to tmux session with: tmux attach -t ${worktreeSession.tmuxSessionName}`);
      } else {
        setResultMessage(`Worktree kept. Your work is saved at ${worktreeSession.worktreePath} on branch ${worktreeSession.worktreeBranch}`);
      }
      setStatus("done");
    } else if (value === "keep-kill-tmux") {
      setStatus("keeping");
      logEvent("tengu_worktree_kept", {
        commits: commitCount,
        changed_files: changes.length
      });
      if (worktreeSession.tmuxSessionName) {
        await killTmuxSession(worktreeSession.tmuxSessionName);
      }
      await keepWorktree();
      process.chdir(worktreeSession.originalCwd);
      setCwd(worktreeSession.originalCwd);
      recordWorktreeExit();
      getPlansDirectory.cache.clear?.();
      setResultMessage(`Worktree kept at ${worktreeSession.worktreePath} on branch ${worktreeSession.worktreeBranch}. Tmux session terminated.`);
      setStatus("done");
    } else if (value === "remove" || value === "remove-with-tmux") {
      setStatus("removing");
      logEvent("tengu_worktree_removed", {
        commits: commitCount,
        changed_files: changes.length
      });
      if (worktreeSession.tmuxSessionName) {
        await killTmuxSession(worktreeSession.tmuxSessionName);
      }
      try {
        await cleanupWorktree();
        process.chdir(worktreeSession.originalCwd);
        setCwd(worktreeSession.originalCwd);
        recordWorktreeExit();
        getPlansDirectory.cache.clear?.();
      } catch (error) {
        logForDebugging(`Failed to clean up worktree: ${error}`, {
          level: "error"
        });
        setResultMessage("Worktree cleanup failed, exiting anyway");
        setStatus("done");
        return;
      }
      const tmuxNote = hasTmux ? " Tmux session terminated." : "";
      if (commitCount > 0 && changes.length > 0) {
        setResultMessage(`Worktree removed. ${commitCount} ${commitCount === 1 ? "commit" : "commits"} and uncommitted changes were discarded.${tmuxNote}`);
      } else if (commitCount > 0) {
        setResultMessage(`Worktree removed. ${commitCount} ${commitCount === 1 ? "commit" : "commits"} on ${worktreeSession.worktreeBranch} ${commitCount === 1 ? "was" : "were"} discarded.${tmuxNote}`);
      } else if (changes.length > 0) {
        setResultMessage(`Worktree removed. Uncommitted changes were discarded.${tmuxNote}`);
      } else {
        setResultMessage(`Worktree removed.${tmuxNote}`);
      }
      setStatus("done");
    }
  }
  if (status === "keeping") {
    return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      flexDirection: "row",
      marginY: 1,
      children: [
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Spinner, {}, undefined, false, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          children: "Keeping worktree…"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  if (status === "removing") {
    return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      flexDirection: "row",
      marginY: 1,
      children: [
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Spinner, {}, undefined, false, undefined, this),
        /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          children: "Removing worktree…"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
  }
  const branchName = worktreeSession.worktreeBranch;
  const hasUncommitted = changes.length > 0;
  const hasCommits = commitCount > 0;
  let subtitle = "";
  if (hasUncommitted && hasCommits) {
    subtitle = `You have ${changes.length} uncommitted ${changes.length === 1 ? "file" : "files"} and ${commitCount} ${commitCount === 1 ? "commit" : "commits"} on ${branchName}. All will be lost if you remove.`;
  } else if (hasUncommitted) {
    subtitle = `You have ${changes.length} uncommitted ${changes.length === 1 ? "file" : "files"}. These will be lost if you remove the worktree.`;
  } else if (hasCommits) {
    subtitle = `You have ${commitCount} ${commitCount === 1 ? "commit" : "commits"} on ${branchName}. The branch will be deleted if you remove the worktree.`;
  } else {
    subtitle = "You are working in a worktree. Keep it to continue working there, or remove it to clean up.";
  }
  function handleCancel() {
    if (onCancel) {
      onCancel();
      return;
    }
    handleSelect("keep");
  }
  const removeDescription = hasUncommitted || hasCommits ? "All changes and commits will be lost." : "Clean up the worktree directory.";
  const hasTmuxSession = Boolean(worktreeSession.tmuxSessionName);
  const options = hasTmuxSession ? [{
    label: "Keep worktree and tmux session",
    value: "keep-with-tmux",
    description: `Stays at ${worktreeSession.worktreePath}. Reattach with: tmux attach -t ${worktreeSession.tmuxSessionName}`
  }, {
    label: "Keep worktree, kill tmux session",
    value: "keep-kill-tmux",
    description: `Keeps worktree at ${worktreeSession.worktreePath}, terminates tmux session.`
  }, {
    label: "Remove worktree and tmux session",
    value: "remove-with-tmux",
    description: removeDescription
  }] : [{
    label: "Keep worktree",
    value: "keep",
    description: `Stays at ${worktreeSession.worktreePath}`
  }, {
    label: "Remove worktree",
    value: "remove",
    description: removeDescription
  }];
  const defaultValue = hasTmuxSession ? "keep-with-tmux" : "keep";
  return /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Dialog, {
    title: "Exiting worktree session",
    subtitle,
    onCancel: handleCancel,
    children: /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Select, {
      defaultFocusValue: defaultValue,
      options,
      onChange: handleSelect
    }, undefined, false, undefined, this)
  }, undefined, false, undefined, this);
}
var import_react, jsx_dev_runtime;
var init_WorktreeExitDialog = __esm(() => {
  init_analytics();
  init_debug();
  init_ink();
  init_execFileNoThrow();
  init_plans();
  init_Shell();
  init_worktree();
  init_select();
  init_Dialog();
  init_Spinner();
  import_react = __toESM(require_react(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});

// src/components/ExitFlow.tsx
function getRandomGoodbyeMessage() {
  return sample_default(GOODBYE_MESSAGES) ?? "Goodbye!";
}
function ExitFlow(t0) {
  const $ = import_compiler_runtime.c(5);
  const {
    showWorktree,
    onDone,
    onCancel
  } = t0;
  let t1;
  if ($[0] !== onDone) {
    t1 = async function onExit2(resultMessage) {
      onDone(resultMessage ?? getRandomGoodbyeMessage());
      await gracefulShutdown(0, "prompt_input_exit");
    };
    $[0] = onDone;
    $[1] = t1;
  } else {
    t1 = $[1];
  }
  const onExit = t1;
  if (showWorktree) {
    let t2;
    if ($[2] !== onCancel || $[3] !== onExit) {
      t2 = /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(WorktreeExitDialog, {
        onDone: onExit,
        onCancel
      }, undefined, false, undefined, this);
      $[2] = onCancel;
      $[3] = onExit;
      $[4] = t2;
    } else {
      t2 = $[4];
    }
    return t2;
  }
  return null;
}
var import_compiler_runtime, jsx_dev_runtime2, GOODBYE_MESSAGES;
var init_ExitFlow = __esm(() => {
  init_sample();
  init_gracefulShutdown();
  init_WorktreeExitDialog();
  import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
  jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
  GOODBYE_MESSAGES = ["Goodbye!", "See ya!", "Bye!", "Catch you later!"];
});

// src/commands/exit/exit.tsx
function getRandomGoodbyeMessage2() {
  return sample_default(GOODBYE_MESSAGES2) ?? "Goodbye!";
}
async function call(onDone) {
  if (false) {}
  const showWorktree = getCurrentWorktreeSession() !== null;
  if (showWorktree) {
    return /* @__PURE__ */ jsx_dev_runtime3.jsxDEV(ExitFlow, {
      showWorktree,
      onDone,
      onCancel: () => onDone()
    }, undefined, false, undefined, this);
  }
  onDone(getRandomGoodbyeMessage2());
  await gracefulShutdown(0, "prompt_input_exit");
  return null;
}
var jsx_dev_runtime3, GOODBYE_MESSAGES2;
var init_exit = __esm(() => {
  init_sample();
  init_ExitFlow();
  init_concurrentSessions();
  init_gracefulShutdown();
  init_worktree();
  jsx_dev_runtime3 = __toESM(require_jsx_dev_runtime(), 1);
  GOODBYE_MESSAGES2 = ["Goodbye!", "See ya!", "Bye!", "Catch you later!"];
});
init_exit();

export {
  call
};
