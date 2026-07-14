import {
  execa,
  init_execa
} from "./index-m9qhxms7.js";
import {
  init_slowOperations,
  slowLogging
} from "./index-5h7w9qkc.js";
import {
  __callDispose,
  __esm,
  __using
} from "./index-8rxa073f.js";

// ../../src/utils/execSyncWrapper.ts
import {
  execSync as nodeExecSync
} from "child_process";
function execSync_DEPRECATED(command, options) {
  let __stack = [];
  try {
    const _ = __using(__stack, slowLogging`execSync: ${command.slice(0, 100)}`, 0);
    return nodeExecSync(command, options);
  } catch (_catch) {
    var _err = _catch, _hasErr = 1;
  } finally {
    __callDispose(__stack, _err, _hasErr);
  }
}
var init_execSyncWrapper = __esm(() => {
  init_slowOperations();
});

// ../../src/utils/which.ts
async function whichNodeAsync(command) {
  if (process.platform === "win32") {
    const result2 = await execa(`where.exe ${command}`, {
      shell: true,
      stderr: "ignore",
      reject: false
    });
    if (result2.exitCode !== 0 || !result2.stdout) {
      return null;
    }
    return result2.stdout.trim().split(/\r?\n/)[0] || null;
  }
  const result = await execa(`which ${command}`, {
    shell: true,
    stderr: "ignore",
    reject: false
  });
  if (result.exitCode !== 0 || !result.stdout) {
    return null;
  }
  return result.stdout.trim();
}
function whichNodeSync(command) {
  if (process.platform === "win32") {
    try {
      const result = execSync_DEPRECATED(`where.exe ${command}`, {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "ignore"]
      });
      const output = result.toString().trim();
      return output.split(/\r?\n/)[0] || null;
    } catch {
      return null;
    }
  }
  try {
    const result = execSync_DEPRECATED(`which ${command}`, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"]
    });
    return result.toString().trim() || null;
  } catch {
    return null;
  }
}
var bunWhich, which, whichSync;
var init_which = __esm(() => {
  init_execa();
  init_execSyncWrapper();
  bunWhich = typeof Bun !== "undefined" && typeof Bun.which === "function" ? Bun.which : null;
  which = bunWhich ? async (command) => bunWhich(command) : whichNodeAsync;
  whichSync = bunWhich ?? whichNodeSync;
});

export { execSync_DEPRECATED, init_execSyncWrapper, which, whichSync, init_which };
