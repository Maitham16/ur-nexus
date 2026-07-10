import {
  gt,
  init_semver
} from "./index-j9j0h3gp.js";
import {
  require_semver
} from "./index-a38sm3ww.js";
import {
  init_config,
  saveGlobalConfig
} from "./index-nds05g02.js";
import {
  init_log,
  init_privacyLevel,
  isEssentialTrafficOnly,
  logError
} from "./index-2g4gegqj.js";
import {
  axios_default,
  init_axios
} from "./index-r54kbd6k.js";
import {
  getURConfigHomeDir,
  init_envUtils,
  init_errors,
  toError
} from "./index-bdb5pzbm.js";
import {
  getIsNonInteractiveSession,
  init_state
} from "./index-nhjg91p1.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/utils/releaseNotes.ts
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
function getChangelogCachePath() {
  return join(getURConfigHomeDir(), "cache", "changelog.md");
}
async function fetchAndStoreChangelog() {
  if (getIsNonInteractiveSession()) {
    return;
  }
  if (isEssentialTrafficOnly()) {
    return;
  }
  const response = await axios_default.get(RAW_CHANGELOG_URL);
  if (response.status === 200) {
    const changelogContent = response.data;
    if (changelogContent === changelogMemoryCache) {
      return;
    }
    const cachePath = getChangelogCachePath();
    await mkdir(dirname(cachePath), { recursive: true });
    await writeFile(cachePath, changelogContent, { encoding: "utf-8" });
    changelogMemoryCache = changelogContent;
    const changelogLastFetched = Date.now();
    saveGlobalConfig((current) => ({
      ...current,
      changelogLastFetched
    }));
  }
}
async function getStoredChangelog() {
  if (changelogMemoryCache !== null) {
    return changelogMemoryCache;
  }
  const cachePath = getChangelogCachePath();
  try {
    const content = await readFile(cachePath, "utf-8");
    changelogMemoryCache = content;
    return content;
  } catch {
    changelogMemoryCache = "";
    return "";
  }
}
function getStoredChangelogFromMemory() {
  return changelogMemoryCache ?? "";
}
function parseChangelog(content) {
  try {
    if (!content)
      return {};
    const releaseNotes = {};
    const sections = content.split(/^## /gm).slice(1);
    for (const section of sections) {
      const lines = section.trim().split(`
`);
      if (lines.length === 0)
        continue;
      const versionLine = lines[0];
      if (!versionLine)
        continue;
      const version = versionLine.split(" - ")[0]?.trim() || "";
      if (!version)
        continue;
      const notes = lines.slice(1).filter((line) => line.trim().startsWith("- ")).map((line) => line.trim().substring(2).trim()).filter(Boolean);
      if (notes.length > 0) {
        releaseNotes[version] = notes;
      }
    }
    return releaseNotes;
  } catch (error) {
    logError(toError(error));
    return {};
  }
}
function getRecentReleaseNotes(currentVersion, previousVersion, changelogContent = getStoredChangelogFromMemory()) {
  try {
    const releaseNotes = parseChangelog(changelogContent);
    const baseCurrentVersion = import_semver.coerce(currentVersion);
    const basePreviousVersion = previousVersion ? import_semver.coerce(previousVersion) : null;
    if (!basePreviousVersion || baseCurrentVersion && gt(baseCurrentVersion.version, basePreviousVersion.version)) {
      return Object.entries(releaseNotes).filter(([version]) => !basePreviousVersion || gt(version, basePreviousVersion.version)).sort(([versionA], [versionB]) => gt(versionA, versionB) ? -1 : 1).flatMap(([_, notes]) => notes).filter(Boolean).slice(0, MAX_RELEASE_NOTES_SHOWN);
    }
  } catch (error) {
    logError(toError(error));
    return [];
  }
  return [];
}
function getAllReleaseNotes(changelogContent = getStoredChangelogFromMemory()) {
  try {
    const releaseNotes = parseChangelog(changelogContent);
    const sortedVersions = Object.keys(releaseNotes).sort((a, b) => gt(a, b) ? 1 : -1);
    return sortedVersions.map((version) => {
      const versionNotes = releaseNotes[version];
      if (!versionNotes || versionNotes.length === 0)
        return null;
      const notes = versionNotes.filter(Boolean);
      if (notes.length === 0)
        return null;
      return [version, notes];
    }).filter((item) => item !== null);
  } catch (error) {
    logError(toError(error));
    return [];
  }
}
function checkForReleaseNotesSync(lastSeenVersion, currentVersion = MACRO.VERSION) {
  if (process.env.USER_TYPE === "ant") {
    const changelog = MACRO.VERSION_CHANGELOG;
    if (changelog) {
      const commits = changelog.trim().split(`
`).filter(Boolean);
      return {
        hasReleaseNotes: commits.length > 0,
        releaseNotes: commits
      };
    }
    return {
      hasReleaseNotes: false,
      releaseNotes: []
    };
  }
  const releaseNotes = getRecentReleaseNotes(currentVersion, lastSeenVersion);
  return {
    hasReleaseNotes: releaseNotes.length > 0,
    releaseNotes
  };
}
var import_semver, MAX_RELEASE_NOTES_SHOWN = 5, CHANGELOG_URL = "https://github.com/Maitham16/UR", RAW_CHANGELOG_URL = "https://raw.githubusercontent.com/Maitham16/UR/refs/heads/master/CHANGELOG.md", changelogMemoryCache = null;
var init_releaseNotes = __esm(() => {
  init_axios();
  init_state();
  init_config();
  init_envUtils();
  init_errors();
  init_log();
  init_privacyLevel();
  init_semver();
  import_semver = __toESM(require_semver(), 1);
});

export { CHANGELOG_URL, fetchAndStoreChangelog, getStoredChangelog, getStoredChangelogFromMemory, parseChangelog, getAllReleaseNotes, checkForReleaseNotesSync, init_releaseNotes };
