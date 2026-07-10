import {
  init_registry,
  registerTmuxBackend
} from "./index-5wrehbeq.js";
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
import {
  HIDDEN_SESSION_NAME,
  SWARM_SESSION_NAME,
  SWARM_VIEW_WINDOW_NAME,
  TMUX_COMMAND,
  getLeaderPaneId,
  getSwarmSocketName,
  init_constants,
  init_detection,
  isInsideTmux,
  isTmuxAvailable
} from "./index-vw0tpbas.js";
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
  init_sleep,
  sleep
} from "./index-nds05g02.js";
import"./index-f7bfe40r.js";
import {
  count,
  init_array
} from "./index-3stg8t86.js";
import"./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import"./index-a9y6sg4d.js";
import {
  execFileNoThrow,
  init_execFileNoThrow
} from "./index-dsy9thtk.js";
import"./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import {
  init_log,
  logError
} from "./index-2g4gegqj.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import {
  init_debug,
  logForDebugging
} from "./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/utils/swarm/backends/TmuxBackend.ts
function waitForPaneShellReady() {
  return sleep(PANE_SHELL_INIT_DELAY_MS);
}
function acquirePaneCreationLock() {
  let release;
  const newLock = new Promise((resolve) => {
    release = resolve;
  });
  const previousLock = paneCreationLock;
  paneCreationLock = newLock;
  return previousLock.then(() => release);
}
function getTmuxColorName(color) {
  const tmuxColors = {
    red: "red",
    blue: "blue",
    green: "green",
    yellow: "yellow",
    purple: "magenta",
    orange: "colour208",
    pink: "colour205",
    cyan: "cyan"
  };
  return tmuxColors[color];
}
function runTmuxInUserSession(args) {
  return execFileNoThrow(TMUX_COMMAND, args);
}
function runTmuxInSwarm(args) {
  return execFileNoThrow(TMUX_COMMAND, ["-L", getSwarmSocketName(), ...args]);
}

class TmuxBackend {
  type = "tmux";
  displayName = "tmux";
  supportsHideShow = true;
  async isAvailable() {
    return isTmuxAvailable();
  }
  async isRunningInside() {
    return isInsideTmux();
  }
  async createTeammatePaneInSwarmView(name, color) {
    const releaseLock = await acquirePaneCreationLock();
    try {
      const insideTmux = await this.isRunningInside();
      if (insideTmux) {
        return await this.createTeammatePaneWithLeader(name, color);
      }
      return await this.createTeammatePaneExternal(name, color);
    } finally {
      releaseLock();
    }
  }
  async sendCommandToPane(paneId, command, useExternalSession = false) {
    const runTmux = useExternalSession ? runTmuxInSwarm : runTmuxInUserSession;
    const result = await runTmux(["send-keys", "-t", paneId, command, "Enter"]);
    if (result.code !== 0) {
      throw new Error(`Failed to send command to pane ${paneId}: ${result.stderr}`);
    }
  }
  async setPaneBorderColor(paneId, color, useExternalSession = false) {
    const tmuxColor = getTmuxColorName(color);
    const runTmux = useExternalSession ? runTmuxInSwarm : runTmuxInUserSession;
    await runTmux([
      "select-pane",
      "-t",
      paneId,
      "-P",
      `bg=default,fg=${tmuxColor}`
    ]);
    await runTmux([
      "set-option",
      "-p",
      "-t",
      paneId,
      "pane-border-style",
      `fg=${tmuxColor}`
    ]);
    await runTmux([
      "set-option",
      "-p",
      "-t",
      paneId,
      "pane-active-border-style",
      `fg=${tmuxColor}`
    ]);
  }
  async setPaneTitle(paneId, name, color, useExternalSession = false) {
    const tmuxColor = getTmuxColorName(color);
    const runTmux = useExternalSession ? runTmuxInSwarm : runTmuxInUserSession;
    await runTmux(["select-pane", "-t", paneId, "-T", name]);
    await runTmux([
      "set-option",
      "-p",
      "-t",
      paneId,
      "pane-border-format",
      `#[fg=${tmuxColor},bold] #{pane_title} #[default]`
    ]);
  }
  async enablePaneBorderStatus(windowTarget, useExternalSession = false) {
    const target = windowTarget || await this.getCurrentWindowTarget();
    if (!target) {
      return;
    }
    const runTmux = useExternalSession ? runTmuxInSwarm : runTmuxInUserSession;
    await runTmux([
      "set-option",
      "-w",
      "-t",
      target,
      "pane-border-status",
      "top"
    ]);
  }
  async rebalancePanes(windowTarget, hasLeader) {
    if (hasLeader) {
      await this.rebalancePanesWithLeader(windowTarget);
    } else {
      await this.rebalancePanesTiled(windowTarget);
    }
  }
  async killPane(paneId, useExternalSession = false) {
    const runTmux = useExternalSession ? runTmuxInSwarm : runTmuxInUserSession;
    const result = await runTmux(["kill-pane", "-t", paneId]);
    return result.code === 0;
  }
  async hidePane(paneId, useExternalSession = false) {
    const runTmux = useExternalSession ? runTmuxInSwarm : runTmuxInUserSession;
    await runTmux(["new-session", "-d", "-s", HIDDEN_SESSION_NAME]);
    const result = await runTmux([
      "break-pane",
      "-d",
      "-s",
      paneId,
      "-t",
      `${HIDDEN_SESSION_NAME}:`
    ]);
    if (result.code === 0) {
      logForDebugging(`[TmuxBackend] Hidden pane ${paneId}`);
    } else {
      logForDebugging(`[TmuxBackend] Failed to hide pane ${paneId}: ${result.stderr}`);
    }
    return result.code === 0;
  }
  async showPane(paneId, targetWindowOrPane, useExternalSession = false) {
    const runTmux = useExternalSession ? runTmuxInSwarm : runTmuxInUserSession;
    const result = await runTmux([
      "join-pane",
      "-h",
      "-s",
      paneId,
      "-t",
      targetWindowOrPane
    ]);
    if (result.code !== 0) {
      logForDebugging(`[TmuxBackend] Failed to show pane ${paneId}: ${result.stderr}`);
      return false;
    }
    logForDebugging(`[TmuxBackend] Showed pane ${paneId} in ${targetWindowOrPane}`);
    await runTmux(["select-layout", "-t", targetWindowOrPane, "main-vertical"]);
    const panesResult = await runTmux([
      "list-panes",
      "-t",
      targetWindowOrPane,
      "-F",
      "#{pane_id}"
    ]);
    const panes = panesResult.stdout.trim().split(`
`).filter(Boolean);
    if (panes[0]) {
      await runTmux(["resize-pane", "-t", panes[0], "-x", "30%"]);
    }
    return true;
  }
  async getCurrentPaneId() {
    const leaderPane = getLeaderPaneId();
    if (leaderPane) {
      return leaderPane;
    }
    const result = await execFileNoThrow(TMUX_COMMAND, [
      "display-message",
      "-p",
      "#{pane_id}"
    ]);
    if (result.code !== 0) {
      logForDebugging(`[TmuxBackend] Failed to get current pane ID (exit ${result.code}): ${result.stderr}`);
      return null;
    }
    return result.stdout.trim();
  }
  async getCurrentWindowTarget() {
    if (cachedLeaderWindowTarget) {
      return cachedLeaderWindowTarget;
    }
    const leaderPane = getLeaderPaneId();
    const args = ["display-message"];
    if (leaderPane) {
      args.push("-t", leaderPane);
    }
    args.push("-p", "#{session_name}:#{window_index}");
    const result = await execFileNoThrow(TMUX_COMMAND, args);
    if (result.code !== 0) {
      logForDebugging(`[TmuxBackend] Failed to get current window target (exit ${result.code}): ${result.stderr}`);
      return null;
    }
    cachedLeaderWindowTarget = result.stdout.trim();
    return cachedLeaderWindowTarget;
  }
  async getCurrentWindowPaneCount(windowTarget, useSwarmSocket = false) {
    const target = windowTarget || await this.getCurrentWindowTarget();
    if (!target) {
      return null;
    }
    const args = ["list-panes", "-t", target, "-F", "#{pane_id}"];
    const result = useSwarmSocket ? await runTmuxInSwarm(args) : await runTmuxInUserSession(args);
    if (result.code !== 0) {
      logError(new Error(`[TmuxBackend] Failed to get pane count for ${target} (exit ${result.code}): ${result.stderr}`));
      return null;
    }
    return count(result.stdout.trim().split(`
`), Boolean);
  }
  async hasSessionInSwarm(sessionName) {
    const result = await runTmuxInSwarm(["has-session", "-t", sessionName]);
    return result.code === 0;
  }
  async createExternalSwarmSession() {
    const sessionExists = await this.hasSessionInSwarm(SWARM_SESSION_NAME);
    if (!sessionExists) {
      const result = await runTmuxInSwarm([
        "new-session",
        "-d",
        "-s",
        SWARM_SESSION_NAME,
        "-n",
        SWARM_VIEW_WINDOW_NAME,
        "-P",
        "-F",
        "#{pane_id}"
      ]);
      if (result.code !== 0) {
        throw new Error(`Failed to create swarm session: ${result.stderr || "Unknown error"}`);
      }
      const paneId = result.stdout.trim();
      const windowTarget2 = `${SWARM_SESSION_NAME}:${SWARM_VIEW_WINDOW_NAME}`;
      logForDebugging(`[TmuxBackend] Created external swarm session with window ${windowTarget2}, pane ${paneId}`);
      return { windowTarget: windowTarget2, paneId };
    }
    const listResult = await runTmuxInSwarm([
      "list-windows",
      "-t",
      SWARM_SESSION_NAME,
      "-F",
      "#{window_name}"
    ]);
    const windows = listResult.stdout.trim().split(`
`).filter(Boolean);
    const windowTarget = `${SWARM_SESSION_NAME}:${SWARM_VIEW_WINDOW_NAME}`;
    if (windows.includes(SWARM_VIEW_WINDOW_NAME)) {
      const paneResult = await runTmuxInSwarm([
        "list-panes",
        "-t",
        windowTarget,
        "-F",
        "#{pane_id}"
      ]);
      const panes = paneResult.stdout.trim().split(`
`).filter(Boolean);
      return { windowTarget, paneId: panes[0] || "" };
    }
    const createResult = await runTmuxInSwarm([
      "new-window",
      "-t",
      SWARM_SESSION_NAME,
      "-n",
      SWARM_VIEW_WINDOW_NAME,
      "-P",
      "-F",
      "#{pane_id}"
    ]);
    if (createResult.code !== 0) {
      throw new Error(`Failed to create swarm-view window: ${createResult.stderr || "Unknown error"}`);
    }
    return { windowTarget, paneId: createResult.stdout.trim() };
  }
  async createTeammatePaneWithLeader(teammateName, teammateColor) {
    const currentPaneId = await this.getCurrentPaneId();
    const windowTarget = await this.getCurrentWindowTarget();
    if (!currentPaneId || !windowTarget) {
      throw new Error("Could not determine current tmux pane/window");
    }
    const paneCount = await this.getCurrentWindowPaneCount(windowTarget);
    if (paneCount === null) {
      throw new Error("Could not determine pane count for current window");
    }
    const isFirstTeammate = paneCount === 1;
    let splitResult;
    if (isFirstTeammate) {
      splitResult = await execFileNoThrow(TMUX_COMMAND, [
        "split-window",
        "-t",
        currentPaneId,
        "-h",
        "-l",
        "70%",
        "-P",
        "-F",
        "#{pane_id}"
      ]);
    } else {
      const listResult = await execFileNoThrow(TMUX_COMMAND, [
        "list-panes",
        "-t",
        windowTarget,
        "-F",
        "#{pane_id}"
      ]);
      const panes = listResult.stdout.trim().split(`
`).filter(Boolean);
      const teammatePanes = panes.slice(1);
      const teammateCount = teammatePanes.length;
      const splitVertically = teammateCount % 2 === 1;
      const targetPaneIndex = Math.floor((teammateCount - 1) / 2);
      const targetPane = teammatePanes[targetPaneIndex] || teammatePanes[teammatePanes.length - 1];
      splitResult = await execFileNoThrow(TMUX_COMMAND, [
        "split-window",
        "-t",
        targetPane,
        splitVertically ? "-v" : "-h",
        "-P",
        "-F",
        "#{pane_id}"
      ]);
    }
    if (splitResult.code !== 0) {
      throw new Error(`Failed to create teammate pane: ${splitResult.stderr}`);
    }
    const paneId = splitResult.stdout.trim();
    logForDebugging(`[TmuxBackend] Created teammate pane for ${teammateName}: ${paneId}`);
    await this.setPaneBorderColor(paneId, teammateColor);
    await this.setPaneTitle(paneId, teammateName, teammateColor);
    await this.rebalancePanesWithLeader(windowTarget);
    await waitForPaneShellReady();
    return { paneId, isFirstTeammate };
  }
  async createTeammatePaneExternal(teammateName, teammateColor) {
    const { windowTarget, paneId: firstPaneId } = await this.createExternalSwarmSession();
    const paneCount = await this.getCurrentWindowPaneCount(windowTarget, true);
    if (paneCount === null) {
      throw new Error("Could not determine pane count for swarm window");
    }
    const isFirstTeammate = !firstPaneUsedForExternal && paneCount === 1;
    let paneId;
    if (isFirstTeammate) {
      paneId = firstPaneId;
      firstPaneUsedForExternal = true;
      logForDebugging(`[TmuxBackend] Using initial pane for first teammate ${teammateName}: ${paneId}`);
      await this.enablePaneBorderStatus(windowTarget, true);
    } else {
      const listResult = await runTmuxInSwarm([
        "list-panes",
        "-t",
        windowTarget,
        "-F",
        "#{pane_id}"
      ]);
      const panes = listResult.stdout.trim().split(`
`).filter(Boolean);
      const teammateCount = panes.length;
      const splitVertically = teammateCount % 2 === 1;
      const targetPaneIndex = Math.floor((teammateCount - 1) / 2);
      const targetPane = panes[targetPaneIndex] || panes[panes.length - 1];
      const splitResult = await runTmuxInSwarm([
        "split-window",
        "-t",
        targetPane,
        splitVertically ? "-v" : "-h",
        "-P",
        "-F",
        "#{pane_id}"
      ]);
      if (splitResult.code !== 0) {
        throw new Error(`Failed to create teammate pane: ${splitResult.stderr}`);
      }
      paneId = splitResult.stdout.trim();
      logForDebugging(`[TmuxBackend] Created teammate pane for ${teammateName}: ${paneId}`);
    }
    await this.setPaneBorderColor(paneId, teammateColor, true);
    await this.setPaneTitle(paneId, teammateName, teammateColor, true);
    await this.rebalancePanesTiled(windowTarget);
    await waitForPaneShellReady();
    return { paneId, isFirstTeammate };
  }
  async rebalancePanesWithLeader(windowTarget) {
    const listResult = await runTmuxInUserSession([
      "list-panes",
      "-t",
      windowTarget,
      "-F",
      "#{pane_id}"
    ]);
    const panes = listResult.stdout.trim().split(`
`).filter(Boolean);
    if (panes.length <= 2) {
      return;
    }
    await runTmuxInUserSession([
      "select-layout",
      "-t",
      windowTarget,
      "main-vertical"
    ]);
    const leaderPane = panes[0];
    await runTmuxInUserSession(["resize-pane", "-t", leaderPane, "-x", "30%"]);
    logForDebugging(`[TmuxBackend] Rebalanced ${panes.length - 1} teammate panes with leader`);
  }
  async rebalancePanesTiled(windowTarget) {
    const listResult = await runTmuxInSwarm([
      "list-panes",
      "-t",
      windowTarget,
      "-F",
      "#{pane_id}"
    ]);
    const panes = listResult.stdout.trim().split(`
`).filter(Boolean);
    if (panes.length <= 1) {
      return;
    }
    await runTmuxInSwarm(["select-layout", "-t", windowTarget, "tiled"]);
    logForDebugging(`[TmuxBackend] Rebalanced ${panes.length} teammate panes with tiled layout`);
  }
}
var firstPaneUsedForExternal = false, cachedLeaderWindowTarget = null, paneCreationLock, PANE_SHELL_INIT_DELAY_MS = 200;
var init_TmuxBackend = __esm(() => {
  init_debug();
  init_execFileNoThrow();
  init_log();
  init_array();
  init_sleep();
  init_constants();
  init_detection();
  init_registry();
  paneCreationLock = Promise.resolve();
  registerTmuxBackend(TmuxBackend);
});
init_TmuxBackend();

export {
  TmuxBackend
};
