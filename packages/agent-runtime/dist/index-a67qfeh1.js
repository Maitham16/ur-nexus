import {
  cacheAndRegisterPlugin,
  cachePlugin,
  calculatePluginVersion,
  clearAllCaches,
  copyPluginToVersionedCache,
  deletePluginDataDir,
  deletePluginOptions,
  findReverseDependents,
  formatReverseDependentsSuffix,
  getAddDirEnabledPlugins,
  getPluginById,
  getVersionedCachePath,
  getVersionedZipCachePath,
  init_addDirPluginSettings,
  init_builtinPlugins,
  init_cacheUtils,
  init_dependencyResolver,
  init_installedPluginsManager,
  init_marketplaceManager,
  init_pluginDirectories,
  init_pluginIdentifier,
  init_pluginInstallationHelpers,
  init_pluginLoader,
  init_pluginOptionsStorage,
  init_pluginPolicy,
  init_pluginVersioning,
  isBuiltinPluginId,
  isPluginBlockedByPolicy,
  loadAllPlugins,
  loadInstalledPluginsFromDisk,
  loadInstalledPluginsV2,
  loadPluginManifest,
  markPluginVersionOrphaned,
  parsePluginIdentifier,
  registerPluginInstallation,
  removePluginInstallation,
  scopeToSettingSource,
  updateInstallationPathOnDisk
} from "./index-qv8mzsdh.js";
import {
  getSettingsForSource,
  init_schemas,
  init_settings1 as init_settings,
  init_stringUtils,
  isLocalPluginSource,
  updateSettingsForSource
} from "./index-nds05g02.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import {
  init_log,
  logError
} from "./index-2g4gegqj.js";
import {
  getFsImplementation,
  init_debug,
  init_errors,
  init_fsOperations,
  isENOENT,
  logForDebugging
} from "./index-bdb5pzbm.js";
import {
  getOriginalCwd,
  init_state
} from "./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/utils/plugins/pluginStartupCheck.ts
import { join } from "path";
function getPluginEditableScopes() {
  const result = new Map;
  const addDirPlugins = getAddDirEnabledPlugins();
  for (const [pluginId, value] of Object.entries(addDirPlugins)) {
    if (!pluginId.includes("@")) {
      continue;
    }
    if (value === true) {
      result.set(pluginId, "flag");
    } else if (value === false) {
      result.delete(pluginId);
    }
  }
  const scopeSources = [
    { scope: "managed", source: "policySettings" },
    { scope: "user", source: "userSettings" },
    { scope: "project", source: "projectSettings" },
    { scope: "local", source: "localSettings" },
    { scope: "flag", source: "flagSettings" }
  ];
  for (const { scope, source } of scopeSources) {
    const settings = getSettingsForSource(source);
    if (!settings?.enabledPlugins) {
      continue;
    }
    for (const [pluginId, value] of Object.entries(settings.enabledPlugins)) {
      if (!pluginId.includes("@")) {
        continue;
      }
      if (pluginId in addDirPlugins && addDirPlugins[pluginId] !== value) {
        logForDebugging(`Plugin ${pluginId} from --add-dir (${addDirPlugins[pluginId]}) overridden by ${source} (${value})`);
      }
      if (value === true) {
        result.set(pluginId, scope);
      } else if (value === false) {
        result.delete(pluginId);
      }
    }
  }
  logForDebugging(`Found ${result.size} enabled plugins with scopes: ${Array.from(result.entries()).map(([id, scope]) => `${id}(${scope})`).join(", ")}`);
  return result;
}
async function installSelectedPlugins(pluginsToInstall, onProgress, scope = "user") {
  const projectPath = scope !== "user" ? getCwd() : undefined;
  const settingSource = scopeToSettingSource(scope);
  const settings = getSettingsForSource(settingSource);
  const updatedEnabledPlugins = { ...settings?.enabledPlugins };
  const installed = [];
  const failed = [];
  for (let i = 0;i < pluginsToInstall.length; i++) {
    const pluginId = pluginsToInstall[i];
    if (!pluginId)
      continue;
    if (onProgress) {
      onProgress(pluginId, i + 1, pluginsToInstall.length);
    }
    try {
      const pluginInfo = await getPluginById(pluginId);
      if (!pluginInfo) {
        failed.push({
          name: pluginId,
          error: "Plugin not found in any marketplace"
        });
        continue;
      }
      const { entry, marketplaceInstallLocation } = pluginInfo;
      if (!isLocalPluginSource(entry.source)) {
        await cacheAndRegisterPlugin(pluginId, entry, scope, projectPath);
      } else {
        registerPluginInstallation({
          pluginId,
          installPath: join(marketplaceInstallLocation, entry.source),
          version: entry.version
        }, scope, projectPath);
      }
      updatedEnabledPlugins[pluginId] = true;
      installed.push(pluginId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      failed.push({ name: pluginId, error: errorMessage });
      logError(error);
    }
  }
  updateSettingsForSource(settingSource, {
    ...settings,
    enabledPlugins: updatedEnabledPlugins
  });
  return { installed, failed };
}
var init_pluginStartupCheck = __esm(() => {
  init_cwd();
  init_debug();
  init_log();
  init_settings();
  init_addDirPluginSettings();
  init_installedPluginsManager();
  init_marketplaceManager();
  init_pluginIdentifier();
  init_pluginInstallationHelpers();
  init_schemas();
});

// ../../src/services/plugins/pluginOperations.ts
import { dirname, join as join2 } from "path";
function assertInstallableScope(scope) {
  if (!VALID_INSTALLABLE_SCOPES.includes(scope)) {
    throw new Error(`Invalid scope "${scope}". Must be one of: ${VALID_INSTALLABLE_SCOPES.join(", ")}`);
  }
}
function isInstallableScope(scope) {
  return VALID_INSTALLABLE_SCOPES.includes(scope);
}
function getProjectPathForScope(scope) {
  return scope === "project" || scope === "local" ? getOriginalCwd() : undefined;
}
function isPluginEnabledAtProjectScope(pluginId) {
  return getSettingsForSource("projectSettings")?.enabledPlugins?.[pluginId] === true;
}
function findPluginInSettings(plugin) {
  const hasMarketplace = plugin.includes("@");
  const searchOrder = ["local", "project", "user"];
  for (const scope of searchOrder) {
    const enabledPlugins = getSettingsForSource(scopeToSettingSource(scope))?.enabledPlugins;
    if (!enabledPlugins)
      continue;
    for (const key of Object.keys(enabledPlugins)) {
      if (hasMarketplace ? key === plugin : key.startsWith(`${plugin}@`)) {
        return { pluginId: key, scope };
      }
    }
  }
  return null;
}
function findPluginByIdentifier(plugin, plugins) {
  const { name, marketplace } = parsePluginIdentifier(plugin);
  return plugins.find((p) => {
    if (p.name === plugin || p.name === name)
      return true;
    if (marketplace && p.source) {
      return p.name === name && p.source.includes(`@${marketplace}`);
    }
    return false;
  });
}
function resolveDelistedPluginId(plugin) {
  const { name } = parsePluginIdentifier(plugin);
  const installedData = loadInstalledPluginsV2();
  if (installedData.plugins[plugin]?.length) {
    return { pluginId: plugin, pluginName: name };
  }
  const matchingKey = Object.keys(installedData.plugins).find((key) => {
    const { name: keyName } = parsePluginIdentifier(key);
    return keyName === name && (installedData.plugins[key]?.length ?? 0) > 0;
  });
  if (matchingKey) {
    return { pluginId: matchingKey, pluginName: name };
  }
  return null;
}
function getPluginInstallationFromV2(pluginId) {
  const installedData = loadInstalledPluginsV2();
  const installations = installedData.plugins[pluginId];
  if (!installations || installations.length === 0) {
    return { scope: "user" };
  }
  const currentProjectPath = getOriginalCwd();
  const localInstall = installations.find((inst) => inst.scope === "local" && inst.projectPath === currentProjectPath);
  if (localInstall) {
    return { scope: localInstall.scope, projectPath: localInstall.projectPath };
  }
  const projectInstall = installations.find((inst) => inst.scope === "project" && inst.projectPath === currentProjectPath);
  if (projectInstall) {
    return {
      scope: projectInstall.scope,
      projectPath: projectInstall.projectPath
    };
  }
  const userInstall = installations.find((inst) => inst.scope === "user");
  if (userInstall) {
    return { scope: userInstall.scope };
  }
  return {
    scope: installations[0].scope,
    projectPath: installations[0].projectPath
  };
}
async function uninstallPluginOp(plugin, scope = "user", deleteDataDir = true) {
  assertInstallableScope(scope);
  const { enabled, disabled } = await loadAllPlugins();
  const allPlugins = [...enabled, ...disabled];
  const foundPlugin = findPluginByIdentifier(plugin, allPlugins);
  const settingSource = scopeToSettingSource(scope);
  const settings = getSettingsForSource(settingSource);
  let pluginId;
  let pluginName;
  if (foundPlugin) {
    pluginId = Object.keys(settings?.enabledPlugins ?? {}).find((k) => k === plugin || k === foundPlugin.name || k.startsWith(`${foundPlugin.name}@`)) ?? (plugin.includes("@") ? plugin : foundPlugin.name);
    pluginName = foundPlugin.name;
  } else {
    const resolved = resolveDelistedPluginId(plugin);
    if (!resolved) {
      return {
        success: false,
        message: `Plugin "${plugin}" not found in installed plugins`
      };
    }
    pluginId = resolved.pluginId;
    pluginName = resolved.pluginName;
  }
  const projectPath = getProjectPathForScope(scope);
  const installedData = loadInstalledPluginsV2();
  const installations = installedData.plugins[pluginId];
  const scopeInstallation = installations?.find((i) => i.scope === scope && i.projectPath === projectPath);
  if (!scopeInstallation) {
    const { scope: actualScope } = getPluginInstallationFromV2(pluginId);
    if (actualScope !== scope && installations && installations.length > 0) {
      if (actualScope === "project") {
        return {
          success: false,
          message: `Plugin "${plugin}" is enabled at project scope (.ur/settings.json, shared with your team). To disable just for you: ur plugin disable ${plugin} --scope local`
        };
      }
      return {
        success: false,
        message: `Plugin "${plugin}" is installed in ${actualScope} scope, not ${scope}. Use --scope ${actualScope} to uninstall.`
      };
    }
    return {
      success: false,
      message: `Plugin "${plugin}" is not installed in ${scope} scope. Use --scope to specify the correct scope.`
    };
  }
  const installPath = scopeInstallation.installPath;
  const newEnabledPlugins = {
    ...settings?.enabledPlugins
  };
  newEnabledPlugins[pluginId] = undefined;
  updateSettingsForSource(settingSource, {
    enabledPlugins: newEnabledPlugins
  });
  clearAllCaches();
  removePluginInstallation(pluginId, scope, projectPath);
  const updatedData = loadInstalledPluginsV2();
  const remainingInstallations = updatedData.plugins[pluginId];
  const isLastScope = !remainingInstallations || remainingInstallations.length === 0;
  if (isLastScope && installPath) {
    await markPluginVersionOrphaned(installPath);
  }
  if (isLastScope) {
    deletePluginOptions(pluginId);
    if (deleteDataDir) {
      await deletePluginDataDir(pluginId);
    }
  }
  const reverseDependents = findReverseDependents(pluginId, allPlugins);
  const depWarn = formatReverseDependentsSuffix(reverseDependents);
  return {
    success: true,
    message: `Successfully uninstalled plugin: ${pluginName} (scope: ${scope})${depWarn}`,
    pluginId,
    pluginName,
    scope,
    reverseDependents: reverseDependents.length > 0 ? reverseDependents : undefined
  };
}
async function setPluginEnabledOp(plugin, enabled, scope) {
  const operation = enabled ? "enable" : "disable";
  if (isBuiltinPluginId(plugin)) {
    const { error: error2 } = updateSettingsForSource("userSettings", {
      enabledPlugins: {
        ...getSettingsForSource("userSettings")?.enabledPlugins,
        [plugin]: enabled
      }
    });
    if (error2) {
      return {
        success: false,
        message: `Failed to ${operation} built-in plugin: ${error2.message}`
      };
    }
    clearAllCaches();
    const { name: pluginName2 } = parsePluginIdentifier(plugin);
    return {
      success: true,
      message: `Successfully ${operation}d built-in plugin: ${pluginName2}`,
      pluginId: plugin,
      pluginName: pluginName2,
      scope: "user"
    };
  }
  if (scope) {
    assertInstallableScope(scope);
  }
  let pluginId;
  let resolvedScope;
  const found = findPluginInSettings(plugin);
  if (scope) {
    resolvedScope = scope;
    if (found) {
      pluginId = found.pluginId;
    } else if (plugin.includes("@")) {
      pluginId = plugin;
    } else {
      return {
        success: false,
        message: `Plugin "${plugin}" not found in settings. Use plugin@marketplace format.`
      };
    }
  } else if (found) {
    pluginId = found.pluginId;
    resolvedScope = found.scope;
  } else if (plugin.includes("@")) {
    pluginId = plugin;
    resolvedScope = "user";
  } else {
    return {
      success: false,
      message: `Plugin "${plugin}" not found in any editable settings scope. Use plugin@marketplace format.`
    };
  }
  if (enabled && isPluginBlockedByPolicy(pluginId)) {
    return {
      success: false,
      message: `Plugin "${pluginId}" is blocked by your organization's policy and cannot be enabled`
    };
  }
  const settingSource = scopeToSettingSource(resolvedScope);
  const scopeSettingsValue = getSettingsForSource(settingSource)?.enabledPlugins?.[pluginId];
  const SCOPE_PRECEDENCE = {
    user: 0,
    project: 1,
    local: 2
  };
  const isOverride = scope && found && SCOPE_PRECEDENCE[scope] > SCOPE_PRECEDENCE[found.scope];
  if (scope && scopeSettingsValue === undefined && found && found.scope !== scope && !isOverride) {
    return {
      success: false,
      message: `Plugin "${plugin}" is installed at ${found.scope} scope, not ${scope}. Use --scope ${found.scope} or omit --scope to auto-detect.`
    };
  }
  const isCurrentlyEnabled = scope && !isOverride ? scopeSettingsValue === true : getPluginEditableScopes().has(pluginId);
  if (enabled === isCurrentlyEnabled) {
    return {
      success: false,
      message: `Plugin "${plugin}" is already ${enabled ? "enabled" : "disabled"}${scope ? ` at ${scope} scope` : ""}`
    };
  }
  let reverseDependents;
  if (!enabled) {
    const { enabled: loadedEnabled, disabled } = await loadAllPlugins();
    const rdeps = findReverseDependents(pluginId, [
      ...loadedEnabled,
      ...disabled
    ]);
    if (rdeps.length > 0)
      reverseDependents = rdeps;
  }
  const { error } = updateSettingsForSource(settingSource, {
    enabledPlugins: {
      ...getSettingsForSource(settingSource)?.enabledPlugins,
      [pluginId]: enabled
    }
  });
  if (error) {
    return {
      success: false,
      message: `Failed to ${operation} plugin: ${error.message}`
    };
  }
  clearAllCaches();
  const { name: pluginName } = parsePluginIdentifier(pluginId);
  const depWarn = formatReverseDependentsSuffix(reverseDependents);
  return {
    success: true,
    message: `Successfully ${operation}d plugin: ${pluginName} (scope: ${resolvedScope})${depWarn}`,
    pluginId,
    pluginName,
    scope: resolvedScope,
    reverseDependents
  };
}
async function enablePluginOp(plugin, scope) {
  return setPluginEnabledOp(plugin, true, scope);
}
async function disablePluginOp(plugin, scope) {
  return setPluginEnabledOp(plugin, false, scope);
}
async function updatePluginOp(plugin, scope) {
  const { name: pluginName, marketplace: marketplaceName } = parsePluginIdentifier(plugin);
  const pluginId = marketplaceName ? `${pluginName}@${marketplaceName}` : plugin;
  const pluginInfo = await getPluginById(plugin);
  if (!pluginInfo) {
    return {
      success: false,
      message: `Plugin "${pluginName}" not found`,
      pluginId,
      scope
    };
  }
  const { entry, marketplaceInstallLocation } = pluginInfo;
  const diskData = loadInstalledPluginsFromDisk();
  const installations = diskData.plugins[pluginId];
  if (!installations || installations.length === 0) {
    return {
      success: false,
      message: `Plugin "${pluginName}" is not installed`,
      pluginId,
      scope
    };
  }
  const projectPath = getProjectPathForScope(scope);
  const installation = installations.find((inst) => inst.scope === scope && inst.projectPath === projectPath);
  if (!installation) {
    const scopeDesc = projectPath ? `${scope} (${projectPath})` : scope;
    return {
      success: false,
      message: `Plugin "${pluginName}" is not installed at scope ${scopeDesc}`,
      pluginId,
      scope
    };
  }
  return performPluginUpdate({
    pluginId,
    pluginName,
    entry,
    marketplaceInstallLocation,
    installation,
    scope,
    projectPath
  });
}
async function performPluginUpdate({
  pluginId,
  pluginName,
  entry,
  marketplaceInstallLocation,
  installation,
  scope,
  projectPath
}) {
  const fs = getFsImplementation();
  const oldVersion = installation.version;
  let sourcePath;
  let newVersion;
  let shouldCleanupSource = false;
  let gitCommitSha;
  if (typeof entry.source !== "string") {
    const cacheResult = await cachePlugin(entry.source, {
      manifest: { name: entry.name }
    });
    sourcePath = cacheResult.path;
    shouldCleanupSource = true;
    gitCommitSha = cacheResult.gitCommitSha;
    newVersion = await calculatePluginVersion(pluginId, entry.source, cacheResult.manifest, cacheResult.path, entry.version, cacheResult.gitCommitSha);
  } else {
    let marketplaceStats;
    try {
      marketplaceStats = await fs.stat(marketplaceInstallLocation);
    } catch (e) {
      if (isENOENT(e)) {
        return {
          success: false,
          message: `Marketplace directory not found at ${marketplaceInstallLocation}`,
          pluginId,
          scope
        };
      }
      throw e;
    }
    const marketplaceDir = marketplaceStats.isDirectory() ? marketplaceInstallLocation : dirname(marketplaceInstallLocation);
    sourcePath = join2(marketplaceDir, entry.source);
    try {
      await fs.stat(sourcePath);
    } catch (e) {
      if (isENOENT(e)) {
        return {
          success: false,
          message: `Plugin source not found at ${sourcePath}`,
          pluginId,
          scope
        };
      }
      throw e;
    }
    let pluginManifest;
    const manifestPath = join2(sourcePath, ".ur-plugin", "plugin.json");
    try {
      pluginManifest = await loadPluginManifest(manifestPath, entry.name, entry.source);
    } catch {}
    newVersion = await calculatePluginVersion(pluginId, entry.source, pluginManifest, sourcePath, entry.version);
  }
  try {
    let versionedPath = getVersionedCachePath(pluginId, newVersion);
    const zipPath = getVersionedZipCachePath(pluginId, newVersion);
    const isUpToDate = installation.version === newVersion || installation.installPath === versionedPath || installation.installPath === zipPath;
    if (isUpToDate) {
      return {
        success: true,
        message: `${pluginName} is already at the latest version (${newVersion}).`,
        pluginId,
        newVersion,
        oldVersion,
        alreadyUpToDate: true,
        scope
      };
    }
    versionedPath = await copyPluginToVersionedCache(sourcePath, pluginId, newVersion, entry);
    const oldVersionPath = installation.installPath;
    updateInstallationPathOnDisk(pluginId, scope, projectPath, versionedPath, newVersion, gitCommitSha);
    if (oldVersionPath && oldVersionPath !== versionedPath) {
      const updatedDiskData = loadInstalledPluginsFromDisk();
      const isOldVersionStillReferenced = Object.values(updatedDiskData.plugins).some((pluginInstallations) => pluginInstallations.some((inst) => inst.installPath === oldVersionPath));
      if (!isOldVersionStillReferenced) {
        await markPluginVersionOrphaned(oldVersionPath);
      }
    }
    const scopeDesc = projectPath ? `${scope} (${projectPath})` : scope;
    const message = `Plugin "${pluginName}" updated from ${oldVersion || "unknown"} to ${newVersion} for scope ${scopeDesc}. Restart to apply changes.`;
    return {
      success: true,
      message,
      pluginId,
      newVersion,
      oldVersion,
      scope
    };
  } finally {
    if (shouldCleanupSource && sourcePath !== getVersionedCachePath(pluginId, newVersion)) {
      await fs.rm(sourcePath, { recursive: true, force: true });
    }
  }
}
var VALID_INSTALLABLE_SCOPES;
var init_pluginOperations = __esm(() => {
  init_state();
  init_builtinPlugins();
  init_errors();
  init_fsOperations();
  init_log();
  init_cacheUtils();
  init_dependencyResolver();
  init_installedPluginsManager();
  init_marketplaceManager();
  init_pluginDirectories();
  init_pluginIdentifier();
  init_pluginInstallationHelpers();
  init_pluginLoader();
  init_pluginOptionsStorage();
  init_pluginPolicy();
  init_pluginStartupCheck();
  init_pluginVersioning();
  init_settings();
  init_stringUtils();
  VALID_INSTALLABLE_SCOPES = ["user", "project", "local"];
});

export { getPluginEditableScopes, installSelectedPlugins, init_pluginStartupCheck, isInstallableScope, isPluginEnabledAtProjectScope, getPluginInstallationFromV2, uninstallPluginOp, enablePluginOp, disablePluginOp, updatePluginOp, init_pluginOperations };
