import {
  fetchUtilization,
  init_usage
} from "./index-e6z18q9j.js";
import {
  Dialog,
  Select,
  checkRemoteAgentEligibility,
  formatPreconditionError,
  getRemoteTaskSessionUrl,
  init_Dialog,
  init_RemoteAgentTask,
  init_select,
  init_teleport,
  registerRemoteAgentTask,
  teleportToRemote
} from "./index-3xrbnz6c.js";
import"./index-kkermbsd.js";
import"./index-gph76kef.js";
import"./index-2j7c2ame.js";
import {
  ThemedBox_default,
  ThemedText,
  init_ink,
  require_compiler_runtime
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
  require_jsx_dev_runtime,
  require_react
} from "./index-mpvjr5hg.js";
import"./index-gtvyh4ft.js";
import"./index-d6epqsmt.js";
import {
  getOAuthHeaders,
  init_api,
  prepareApiRequest
} from "./index-bwntnbyg.js";
import"./index-xvadh9a8.js";
import"./index-a38sm3ww.js";
import"./index-t5r7sy2d.js";
import"./index-ktb0kcww.js";
import"./index-tdkq0knn.js";
import"./index-kq80n9z5.js";
import"./index-1f511qkg.js";
import"./index-bdfn6xh6.js";
import"./index-60smdz72.js";
import {
  detectCurrentRepositoryWithHost,
  init_detectRepository
} from "./index-5jrp51k1.js";
import {
  getFeatureValue_CACHED_MAY_BE_STALE,
  getOauthConfig,
  init_auth,
  init_growthbook,
  init_oauth,
  isEnterpriseSubscriber,
  isTeamSubscriber,
  isURAISubscriber
} from "./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import"./index-z5aeypvg.js";
import {
  init_analytics,
  logEvent
} from "./index-5jmh1e0k.js";
import {
  axios_default,
  init_axios
} from "./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-wxsgjqjk.js";
import {
  getDefaultBranch,
  gitExe,
  init_git
} from "./index-s1a1wahe.js";
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
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/services/api/ultrareviewQuota.ts
async function fetchUltrareviewQuota() {
  if (!isURAISubscriber())
    return null;
  try {
    const { accessToken, orgUUID } = await prepareApiRequest();
    const response = await axios_default.get(`${getOauthConfig().BASE_API_URL}/v1/ultrareview/quota`, {
      headers: {
        ...getOAuthHeaders(accessToken),
        "x-organization-uuid": orgUUID
      },
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    logForDebugging(`fetchUltrareviewQuota failed: ${error}`);
    return null;
  }
}
var init_ultrareviewQuota = __esm(() => {
  init_axios();
  init_oauth();
  init_auth();
  init_debug();
  init_api();
});

// ../../src/commands/review/reviewRemote.ts
function confirmOverage() {
  sessionOverageConfirmed = true;
}
async function checkOverageGate() {
  if (isTeamSubscriber() || isEnterpriseSubscriber()) {
    return { kind: "proceed", billingNote: "" };
  }
  const [quota, utilization] = await Promise.all([
    fetchUltrareviewQuota(),
    fetchUtilization().catch(() => null)
  ]);
  if (!quota) {
    return { kind: "proceed", billingNote: "" };
  }
  if (quota.reviews_remaining > 0) {
    return {
      kind: "proceed",
      billingNote: ` This is free ultrareview ${quota.reviews_used + 1} of ${quota.reviews_limit}.`
    };
  }
  if (!utilization) {
    return { kind: "proceed", billingNote: "" };
  }
  const extraUsage = utilization.extra_usage;
  if (!extraUsage?.is_enabled) {
    logEvent("tengu_review_overage_not_enabled", {});
    return { kind: "not-enabled" };
  }
  const monthlyLimit = extraUsage.monthly_limit;
  const usedCredits = extraUsage.used_credits ?? 0;
  const available = monthlyLimit === null || monthlyLimit === undefined ? Infinity : monthlyLimit - usedCredits;
  if (available < 10) {
    logEvent("tengu_review_overage_low_balance", { available });
    return { kind: "low-balance", available };
  }
  if (!sessionOverageConfirmed) {
    logEvent("tengu_review_overage_dialog_shown", {});
    return { kind: "needs-confirm" };
  }
  return {
    kind: "proceed",
    billingNote: " This review bills as Extra Usage."
  };
}
async function launchRemoteReview(args, context, billingNote) {
  const eligibility = await checkRemoteAgentEligibility();
  if (!eligibility.eligible) {
    const blockers = eligibility.errors.filter((e) => e.type !== "no_remote_environment");
    if (blockers.length > 0) {
      logEvent("tengu_review_remote_precondition_failed", {
        precondition_errors: blockers.map((e) => e.type).join(",")
      });
      const reasons = blockers.map(formatPreconditionError).join(`
`);
      return [
        {
          type: "text",
          text: `Ultrareview cannot launch:
${reasons}`
        }
      ];
    }
  }
  const resolvedBillingNote = billingNote ?? "";
  const prNumber = args.trim();
  const isPrNumber = /^\d+$/.test(prNumber);
  const CODE_REVIEW_ENV_ID = "env_011111111111111111111113";
  const raw = getFeatureValue_CACHED_MAY_BE_STALE("tengu_review_bughunter_config", null);
  const posInt = (v, fallback, max) => {
    if (typeof v !== "number" || !Number.isFinite(v))
      return fallback;
    const n = Math.floor(v);
    if (n <= 0)
      return fallback;
    return max !== undefined && n > max ? fallback : n;
  };
  const commonEnvVars = {
    BUGHUNTER_DRY_RUN: "1",
    BUGHUNTER_FLEET_SIZE: String(posInt(raw?.fleet_size, 5, 20)),
    BUGHUNTER_MAX_DURATION: String(posInt(raw?.max_duration_minutes, 10, 25)),
    BUGHUNTER_AGENT_TIMEOUT: String(posInt(raw?.agent_timeout_seconds, 600, 1800)),
    BUGHUNTER_TOTAL_WALLCLOCK: String(posInt(raw?.total_wallclock_minutes, 22, 27)),
    ...process.env.BUGHUNTER_DEV_BUNDLE_B64 && {
      BUGHUNTER_DEV_BUNDLE_B64: process.env.BUGHUNTER_DEV_BUNDLE_B64
    }
  };
  let session;
  let command;
  let target;
  if (isPrNumber) {
    const repo = await detectCurrentRepositoryWithHost();
    if (!repo || repo.host !== "github.com") {
      logEvent("tengu_review_remote_precondition_failed", {});
      return null;
    }
    session = await teleportToRemote({
      initialMessage: null,
      description: `ultrareview: ${repo.owner}/${repo.name}#${prNumber}`,
      signal: context.abortController.signal,
      branchName: `refs/pull/${prNumber}/head`,
      environmentId: CODE_REVIEW_ENV_ID,
      environmentVariables: {
        BUGHUNTER_PR_NUMBER: prNumber,
        BUGHUNTER_REPOSITORY: `${repo.owner}/${repo.name}`,
        ...commonEnvVars
      }
    });
    command = `/ultrareview ${prNumber}`;
    target = `${repo.owner}/${repo.name}#${prNumber}`;
  } else {
    const baseBranch = await getDefaultBranch() || "main";
    const { stdout: mbOut, code: mbCode } = await execFileNoThrow(gitExe(), ["merge-base", baseBranch, "HEAD"], { preserveOutputOnError: false });
    const mergeBaseSha = mbOut.trim();
    if (mbCode !== 0 || !mergeBaseSha) {
      logEvent("tengu_review_remote_precondition_failed", {});
      return [
        {
          type: "text",
          text: `Could not find merge-base with ${baseBranch}. Make sure you're in a git repo with a ${baseBranch} branch.`
        }
      ];
    }
    const { stdout: diffStat, code: diffCode } = await execFileNoThrow(gitExe(), ["diff", "--shortstat", mergeBaseSha], { preserveOutputOnError: false });
    if (diffCode === 0 && !diffStat.trim()) {
      logEvent("tengu_review_remote_precondition_failed", {});
      return [
        {
          type: "text",
          text: `No changes against the ${baseBranch} fork point. Make some commits or stage files first.`
        }
      ];
    }
    session = await teleportToRemote({
      initialMessage: null,
      description: `ultrareview: ${baseBranch}`,
      signal: context.abortController.signal,
      useBundle: true,
      environmentId: CODE_REVIEW_ENV_ID,
      environmentVariables: {
        BUGHUNTER_BASE_BRANCH: mergeBaseSha,
        ...commonEnvVars
      }
    });
    if (!session) {
      logEvent("tengu_review_remote_teleport_failed", {});
      return [
        {
          type: "text",
          text: "Repo is too large. Push a PR and use `/ultrareview <PR#>` instead."
        }
      ];
    }
    command = "/ultrareview";
    target = baseBranch;
  }
  if (!session) {
    logEvent("tengu_review_remote_teleport_failed", {});
    return null;
  }
  registerRemoteAgentTask({
    remoteTaskType: "ultrareview",
    session,
    command,
    context,
    isRemoteReview: true
  });
  logEvent("tengu_review_remote_launched", {});
  const sessionUrl = getRemoteTaskSessionUrl(session.id);
  return [
    {
      type: "text",
      text: `Ultrareview launched for ${target} (~10–20 min, runs in the cloud). Track: ${sessionUrl}${resolvedBillingNote} Findings arrive via task-notification. Briefly acknowledge the launch to the user without repeating the target or URL — both are already visible in the tool output above.`
    }
  ];
}
var sessionOverageConfirmed = false;
var init_reviewRemote = __esm(() => {
  init_growthbook();
  init_analytics();
  init_ultrareviewQuota();
  init_usage();
  init_RemoteAgentTask();
  init_auth();
  init_detectRepository();
  init_execFileNoThrow();
  init_git();
  init_teleport();
});

// ../../src/commands/review/UltrareviewOverageDialog.tsx
function UltrareviewOverageDialog(t0) {
  const $ = import_compiler_runtime.c(15);
  const {
    onProceed,
    onCancel
  } = t0;
  const [isLaunching, setIsLaunching] = import_react.useState(false);
  let t1;
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = new AbortController;
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  const abortControllerRef = import_react.useRef(t1);
  let t2;
  if ($[1] !== onCancel || $[2] !== onProceed) {
    t2 = (value) => {
      if (value === "proceed") {
        setIsLaunching(true);
        onProceed(abortControllerRef.current.signal).catch(() => setIsLaunching(false));
      } else {
        onCancel();
      }
    };
    $[1] = onCancel;
    $[2] = onProceed;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  const handleSelect = t2;
  let t3;
  if ($[4] !== onCancel) {
    t3 = () => {
      abortControllerRef.current.abort();
      onCancel();
    };
    $[4] = onCancel;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  const handleCancel = t3;
  let t4;
  if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = [{
      label: "Proceed with Extra Usage billing",
      value: "proceed"
    }, {
      label: "Cancel",
      value: "cancel"
    }];
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  const options = t4;
  let t5;
  if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
    t5 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
      children: "Your free ultrareviews for this organization are used. Further reviews bill as Extra Usage (pay-per-use)."
    }, undefined, false, undefined, this);
    $[7] = t5;
  } else {
    t5 = $[7];
  }
  let t6;
  if ($[8] !== handleCancel || $[9] !== handleSelect || $[10] !== isLaunching) {
    t6 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedBox_default, {
      flexDirection: "column",
      gap: 1,
      children: [
        t5,
        isLaunching ? /* @__PURE__ */ jsx_dev_runtime.jsxDEV(ThemedText, {
          color: "background",
          children: "Launching…"
        }, undefined, false, undefined, this) : /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Select, {
          options,
          onChange: handleSelect,
          onCancel: handleCancel
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this);
    $[8] = handleCancel;
    $[9] = handleSelect;
    $[10] = isLaunching;
    $[11] = t6;
  } else {
    t6 = $[11];
  }
  let t7;
  if ($[12] !== handleCancel || $[13] !== t6) {
    t7 = /* @__PURE__ */ jsx_dev_runtime.jsxDEV(Dialog, {
      title: "Ultrareview billing",
      onCancel: handleCancel,
      color: "background",
      children: t6
    }, undefined, false, undefined, this);
    $[12] = handleCancel;
    $[13] = t6;
    $[14] = t7;
  } else {
    t7 = $[14];
  }
  return t7;
}
var import_compiler_runtime, import_react, jsx_dev_runtime;
var init_UltrareviewOverageDialog = __esm(() => {
  init_select();
  init_Dialog();
  init_ink();
  import_compiler_runtime = __toESM(require_compiler_runtime(), 1);
  import_react = __toESM(require_react(), 1);
  jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
});

// ../../src/commands/review/ultrareviewCommand.tsx
function contentBlocksToString(blocks) {
  return blocks.map((b) => b.type === "text" ? b.text : "").filter(Boolean).join(`
`);
}
async function launchAndDone(args, context, onDone, billingNote, signal) {
  const result = await launchRemoteReview(args, context, billingNote);
  if (signal?.aborted)
    return;
  if (result) {
    onDone(contentBlocksToString(result), {
      shouldQuery: true
    });
  } else {
    onDone("Ultrareview failed to launch the remote session. Check that this is a GitHub repo and try again.", {
      display: "system"
    });
  }
}
var jsx_dev_runtime2, call = async (onDone, context, args) => {
  const gate = await checkOverageGate();
  if (gate.kind === "not-enabled") {
    onDone("Free ultrareviews used. Enable Extra Usage at https://ur.ai/settings/billing to continue.", {
      display: "system"
    });
    return null;
  }
  if (gate.kind === "low-balance") {
    onDone(`Balance too low to launch ultrareview ($${gate.available.toFixed(2)} available, $10 minimum). Top up at https://ur.ai/settings/billing`, {
      display: "system"
    });
    return null;
  }
  if (gate.kind === "needs-confirm") {
    return /* @__PURE__ */ jsx_dev_runtime2.jsxDEV(UltrareviewOverageDialog, {
      onProceed: async (signal) => {
        await launchAndDone(args, context, onDone, " This review bills as Extra Usage.", signal);
        if (!signal.aborted)
          confirmOverage();
      },
      onCancel: () => onDone("Ultrareview cancelled.", {
        display: "system"
      })
    }, undefined, false, undefined, this);
  }
  await launchAndDone(args, context, onDone, gate.billingNote);
  return null;
};
var init_ultrareviewCommand = __esm(() => {
  init_reviewRemote();
  init_UltrareviewOverageDialog();
  jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
});
init_ultrareviewCommand();

export {
  call
};
