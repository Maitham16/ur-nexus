import {
  init_registry,
  registerITermBackend
} from "./index-7fe5jn6w.js";
import"./index-kkermbsd.js";
import"./index-gph76kef.js";
import"./index-2j7c2ame.js";
import"./index-61fyyngt.js";
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
import"./index-mpvjr5hg.js";
import"./index-gtvyh4ft.js";
import"./index-d6epqsmt.js";
import"./index-bwntnbyg.js";
import"./index-xvadh9a8.js";
import"./index-a38sm3ww.js";
import"./index-t5r7sy2d.js";
import"./index-ktb0kcww.js";
import {
  IT2_COMMAND,
  init_detection,
  isInITerm2,
  isIt2CliAvailable
} from "./index-tdkq0knn.js";
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
import {
  execFileNoThrow,
  init_execFileNoThrow
} from "./index-wred0kdg.js";
import"./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-7bd814mt.js";
import"./index-m9qhxms7.js";
import {
  init_debug,
  logForDebugging
} from "./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/utils/swarm/backends/ITermBackend.ts
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
