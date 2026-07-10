import {
  init_envUtils,
  isEnvTruthy
} from "./index-bdb5pzbm.js";
import {
  getOfflineMode,
  init_state
} from "./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/utils/offlineMode.ts
import { existsSync } from "node:fs";
import { join } from "node:path";
function isNetworkRestricted() {
  return getOfflineMode() || isEnvTruthy(process.env.UR_OFFLINE) || isEnvTruthy(process.env.UR_NO_CLOUD);
}
function offlineModeSummary() {
  const envTriggers = [];
  if (isEnvTruthy(process.env.UR_OFFLINE))
    envTriggers.push("UR_OFFLINE");
  if (isEnvTruthy(process.env.UR_NO_CLOUD))
    envTriggers.push("UR_NO_CLOUD");
  return {
    offline: isNetworkRestricted(),
    envTriggers,
    blockedCategories: [
      "cloud model APIs",
      "telemetry",
      "auto-updates",
      "remote control",
      "web browser automation",
      "OAuth login"
    ]
  };
}
function localFirstProfile(cwd = process.cwd()) {
  const summary = offlineModeSummary();
  const hasUrDir = existsSync(join(cwd, ".ur"));
  const hasGit = existsSync(join(cwd, ".git"));
  const hasVerify = existsSync(join(cwd, ".ur", "verify.json"));
  const hasModelPool = existsSync(join(cwd, ".ur", "model-pool.json"));
  const hasCodeIndex = existsSync(join(cwd, ".ur", "code-index")) || existsSync(join(cwd, ".ur", "index"));
  return {
    offline: summary.offline,
    envTriggers: summary.envTriggers,
    posture: [
      "no cloud required",
      "private codebase friendly",
      "research lab / airgapped workflow ready",
      "offline environment compatible",
      "edge and server development oriented"
    ],
    strengths: [
      "local Ollama model routing for cheap/simple and strong/local coding tasks",
      "project-local memory, specs, verification config, and run traces under .ur/",
      "filesystem, git, terminal, Docker, test-runner, and code-index workflows can run without SaaS upload",
      "offline mode blocks telemetry, auto-update, OAuth/login, browser automation, remote control, and cloud API surfaces"
    ],
    localCapabilities: [
      {
        name: "project .ur directory",
        available: hasUrDir,
        detail: hasUrDir ? ".ur exists for project-local state" : "run ur init or a UR agent command to create .ur"
      },
      {
        name: "git repository",
        available: hasGit,
        detail: hasGit ? "git metadata is local and available" : "no .git directory detected at cwd"
      },
      {
        name: "verification gates",
        available: hasVerify,
        detail: hasVerify ? ".ur/verify.json configured" : "run ur test-first install to create .ur/verify.json"
      },
      {
        name: "model pool",
        available: hasModelPool,
        detail: hasModelPool ? ".ur/model-pool.json configured" : "using built-in/env local model pools"
      },
      {
        name: "semantic/code index",
        available: hasCodeIndex,
        detail: hasCodeIndex ? "local index artifacts detected" : "run ur code-index build --repo to build local repo knowledge"
      }
    ],
    blockedCloudSurfaces: summary.blockedCategories,
    recommendedCommands: [
      "ur --offline",
      'UR_OFFLINE=1 ur -p "your task"',
      'ur model-route "your task" --strategy auto',
      "ur test-first run --dry-run",
      "ur code-index build --repo",
      "ur eval run <suite> --offline --dry-run"
    ]
  };
}
function formatLocalFirstProfile(profile, json) {
  if (json)
    return JSON.stringify(profile, null, 2);
  const lines = [
    `Local-first mode: ${profile.offline ? "active" : "available"}`,
    profile.envTriggers.length ? `Env triggers: ${profile.envTriggers.join(", ")}` : "Env triggers: none",
    "",
    "Posture:",
    ...profile.posture.map((item) => `  - ${item}`),
    "",
    "Strengths:",
    ...profile.strengths.map((item) => `  - ${item}`),
    "",
    "Local capabilities:",
    ...profile.localCapabilities.map((capability) => `  - ${capability.available ? "yes" : "no "} ${capability.name}: ${capability.detail}`),
    "",
    "Cloud surfaces blocked in offline mode:",
    ...profile.blockedCloudSurfaces.map((item) => `  - ${item}`),
    "",
    "Recommended local-first commands:",
    ...profile.recommendedCommands.map((command) => `  ${command}`)
  ];
  return lines.join(`
`);
}
var init_offlineMode = __esm(() => {
  init_state();
  init_envUtils();
});

export { isNetworkRestricted, localFirstProfile, formatLocalFirstProfile, init_offlineMode };
