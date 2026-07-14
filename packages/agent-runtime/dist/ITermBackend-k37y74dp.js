import {
  init_registry,
  registerITermBackend
} from "./index-79vhy4mk.js";
import"./index-grma1d53.js";
import"./index-h3gckbec.js";
import"./index-e4qqkpaw.js";
import"./index-4ywxxsys.js";
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
import"./index-2krq0sbw.js";
import"./index-4pm7msm9.js";
import"./index-08vfk1s7.js";
import {
  IT2_COMMAND,
  init_detection,
  isInITerm2,
  isIt2CliAvailable
} from "./index-9zsppqmn.js";
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
  __esm
} from "./index-8rxa073f.js";

// src/utils/swarm/backends/ITermBackend.ts
function acquirePaneCreationLock() {
  let release;
  const newLock = new Promise((resolve) => {
    release = resolve;
  });
  const previousLock = paneCreationLock;
  paneCreationLock = newLock;
  return previousLock.then(() => release);
}
function runIt2(args) {
  return execFileNoThrow(IT2_COMMAND, args);
}
function parseSplitOutput(output) {
  const match = output.match(/Created new pane:\s*(.+)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return "";
}
function getLeaderSessionId() {
  const itermSessionId = process.env.ITERM_SESSION_ID;
  if (!itermSessionId) {
    return null;
  }
  const colonIndex = itermSessionId.indexOf(":");
  if (colonIndex === -1) {
    return null;
  }
  return itermSessionId.slice(colonIndex + 1);
}

class ITermBackend {
  type = "iterm2";
  displayName = "iTerm2";
  supportsHideShow = false;
  async isAvailable() {
    const inITerm2 = isInITerm2();
    logForDebugging(`[ITermBackend] isAvailable check: inITerm2=${inITerm2}`);
    if (!inITerm2) {
      logForDebugging("[ITermBackend] isAvailable: false (not in iTerm2)");
      return false;
    }
    const it2Available = await isIt2CliAvailable();
    logForDebugging(`[ITermBackend] isAvailable: ${it2Available} (it2 CLI ${it2Available ? "found" : "not found"})`);
    return it2Available;
  }
  async isRunningInside() {
    const result = isInITerm2();
    logForDebugging(`[ITermBackend] isRunningInside: ${result}`);
    return result;
  }
  async createTeammatePaneInSwarmView(name, color) {
    logForDebugging(`[ITermBackend] createTeammatePaneInSwarmView called for ${name} with color ${color}`);
    const releaseLock = await acquirePaneCreationLock();
    try {
      while (true) {
        const isFirstTeammate = !firstPaneUsed;
        logForDebugging(`[ITermBackend] Creating pane: isFirstTeammate=${isFirstTeammate}, existingPanes=${teammateSessionIds.length}`);
        let splitArgs;
        let targetedTeammateId;
        if (isFirstTeammate) {
          const leaderSessionId = getLeaderSessionId();
          if (leaderSessionId) {
            splitArgs = ["session", "split", "-v", "-s", leaderSessionId];
            logForDebugging(`[ITermBackend] First split from leader session: ${leaderSessionId}`);
          } else {
            splitArgs = ["session", "split", "-v"];
            logForDebugging("[ITermBackend] First split from active session (no leader ID)");
          }
        } else {
          targetedTeammateId = teammateSessionIds[teammateSessionIds.length - 1];
          if (targetedTeammateId) {
            splitArgs = ["session", "split", "-s", targetedTeammateId];
            logForDebugging(`[ITermBackend] Subsequent split from teammate session: ${targetedTeammateId}`);
          } else {
            splitArgs = ["session", "split"];
            logForDebugging("[ITermBackend] Subsequent split from active session (no teammate ID)");
          }
        }
        const splitResult = await runIt2(splitArgs);
        if (splitResult.code !== 0) {
          if (targetedTeammateId) {
            const listResult = await runIt2(["session", "list"]);
            if (listResult.code === 0 && !listResult.stdout.includes(targetedTeammateId)) {
              logForDebugging(`[ITermBackend] Split failed targeting dead session ${targetedTeammateId}, pruning and retrying: ${splitResult.stderr}`);
              const idx = teammateSessionIds.indexOf(targetedTeammateId);
              if (idx !== -1) {
                teammateSessionIds.splice(idx, 1);
              }
              if (teammateSessionIds.length === 0) {
                firstPaneUsed = false;
              }
              continue;
            }
          }
          throw new Error(`Failed to create iTerm2 split pane: ${splitResult.stderr}`);
        }
        if (isFirstTeammate) {
          firstPaneUsed = true;
        }
        const paneId = parseSplitOutput(splitResult.stdout);
        if (!paneId) {
          throw new Error(`Failed to parse session ID from split output: ${splitResult.stdout}`);
        }
        logForDebugging(`[ITermBackend] Created teammate pane for ${name}: ${paneId}`);
        teammateSessionIds.push(paneId);
        return { paneId, isFirstTeammate };
      }
    } finally {
      releaseLock();
    }
  }
  async sendCommandToPane(paneId, command, _useExternalSession) {
    const args = paneId ? ["session", "run", "-s", paneId, command] : ["session", "run", command];
    const result = await runIt2(args);
    if (result.code !== 0) {
      throw new Error(`Failed to send command to iTerm2 pane ${paneId}: ${result.stderr}`);
    }
  }
  async setPaneBorderColor(_paneId, _color, _useExternalSession) {}
  async setPaneTitle(_paneId, _name, _color, _useExternalSession) {}
  async enablePaneBorderStatus(_windowTarget, _useExternalSession) {}
  async rebalancePanes(_windowTarget, _hasLeader) {
    logForDebugging("[ITermBackend] Pane rebalancing not implemented for iTerm2");
  }
  async killPane(paneId, _useExternalSession) {
    const result = await runIt2(["session", "close", "-f", "-s", paneId]);
    const idx = teammateSessionIds.indexOf(paneId);
    if (idx !== -1) {
      teammateSessionIds.splice(idx, 1);
    }
    if (teammateSessionIds.length === 0) {
      firstPaneUsed = false;
    }
    return result.code === 0;
  }
  async hidePane(_paneId, _useExternalSession) {
    logForDebugging("[ITermBackend] hidePane not supported in iTerm2");
    return false;
  }
  async showPane(_paneId, _targetWindowOrPane, _useExternalSession) {
    logForDebugging("[ITermBackend] showPane not supported in iTerm2");
    return false;
  }
}
var teammateSessionIds, firstPaneUsed = false, paneCreationLock;
var init_ITermBackend = __esm(() => {
  init_debug();
  init_execFileNoThrow();
  init_detection();
  init_registry();
  teammateSessionIds = [];
  paneCreationLock = Promise.resolve();
  registerITermBackend(ITermBackend);
});
init_ITermBackend();

export {
  ITermBackend
};
