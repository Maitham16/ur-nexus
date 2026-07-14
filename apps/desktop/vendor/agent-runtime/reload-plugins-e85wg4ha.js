import {
  clearAllCaches,
  clearPluginCacheExclusions,
  getAgentDefinitionsWithOverrides,
  getPluginCommands,
  init_agentmd,
  init_cacheUtils,
  init_changeDetector,
  init_loadAgentsDir,
  init_loadPluginCommands,
  init_loadPluginHooks,
  init_lspPluginIntegration,
  init_manager,
  init_mcpPluginIntegration,
  init_orphanedPluginFilter,
  init_pluginLoader,
  init_withRetry,
  loadAllPlugins,
  loadPluginHooks,
  loadPluginLspServers,
  loadPluginMcpServers,
  reinitializeLspServerManager
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
import {
  init_auth,
  init_config,
  init_growthbook,
  init_internalWrites,
  init_oauth,
  init_providers,
  init_settings1 as init_settings,
  init_sleep,
  init_stringUtils,
  init_userAgent,
  plural
} from "./index-133awary.js";
import"./index-pnhq4694.js";
import {
  exports_external,
  init_lazySchema,
  init_v4,
  lazySchema
} from "./index-4mfpjpj0.js";
import {
  init_analytics
} from "./index-mpmmtc93.js";
import"./index-s5dp14ed.js";
import {
  init_diagLogs,
  init_git
} from "./index-6dy59xbm.js";
import"./index-0r3wd4mq.js";
import"./index-b5f4m7g4.js";
import"./index-h7h0j06f.js";
import"./index-7h9ddexs.js";
import {
  init_log,
  logError
} from "./index-f80dj2bz.js";
import"./index-q00jv0fc.js";
import"./index-cs7da0vv.js";
import"./index-ycnb0yeb.js";
import"./index-vpczjthp.js";
import {
  errorMessage,
  init_debug,
  init_envUtils,
  init_errors,
  logForDebugging
} from "./index-t784n9jz.js";
import {
  getOriginalCwd,
  init_settingsCache,
  init_state
} from "./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/services/settingsSync/types.ts
var UserSyncContentSchema, UserSyncDataSchema;
var init_types = __esm(() => {
  init_v4();
  init_lazySchema();
  UserSyncContentSchema = lazySchema(() => exports_external.object({
    entries: exports_external.record(exports_external.string(), exports_external.string())
  }));
  UserSyncDataSchema = lazySchema(() => exports_external.object({
    userId: exports_external.string(),
    version: exports_external.number(),
    lastModified: exports_external.string(),
    checksum: exports_external.string(),
    content: UserSyncContentSchema()
  }));
});

// src/services/settingsSync/index.ts
var MAX_FILE_SIZE_BYTES;
var init_settingsSync = __esm(() => {
  init_state();
  init_oauth();
  init_auth();
  init_agentmd();
  init_config();
  init_diagLogs();
  init_errors();
  init_git();
  init_providers();
  init_internalWrites();
  init_settings();
  init_settingsCache();
  init_sleep();
  init_userAgent();
  init_growthbook();
  init_analytics();
  init_withRetry();
  init_types();
  MAX_FILE_SIZE_BYTES = 500 * 1024;
});

// src/utils/plugins/refresh.ts
async function refreshActivePlugins(setAppState) {
  logForDebugging("refreshActivePlugins: clearing all plugin caches");
  clearAllCaches();
  clearPluginCacheExclusions();
  const pluginResult = await loadAllPlugins();
  const [pluginCommands, agentDefinitions] = await Promise.all([
    getPluginCommands(),
    getAgentDefinitionsWithOverrides(getOriginalCwd())
  ]);
  const { enabled, disabled, errors } = pluginResult;
  const [mcpCounts, lspCounts] = await Promise.all([
    Promise.all(enabled.map(async (p) => {
      if (p.mcpServers)
        return Object.keys(p.mcpServers).length;
      const servers = await loadPluginMcpServers(p, errors);
      if (servers)
        p.mcpServers = servers;
      return servers ? Object.keys(servers).length : 0;
    })),
    Promise.all(enabled.map(async (p) => {
      if (p.lspServers)
        return Object.keys(p.lspServers).length;
      const servers = await loadPluginLspServers(p, errors);
      if (servers)
        p.lspServers = servers;
      return servers ? Object.keys(servers).length : 0;
    }))
  ]);
  const mcp_count = mcpCounts.reduce((sum, n) => sum + n, 0);
  const lsp_count = lspCounts.reduce((sum, n) => sum + n, 0);
  setAppState((prev) => ({
    ...prev,
    plugins: {
      ...prev.plugins,
      enabled,
      disabled,
      commands: pluginCommands,
      errors: mergePluginErrors(prev.plugins.errors, errors),
      needsRefresh: false
    },
    agentDefinitions,
    mcp: {
      ...prev.mcp,
      pluginReconnectKey: prev.mcp.pluginReconnectKey + 1
    }
  }));
  reinitializeLspServerManager();
  let hook_load_failed = false;
  try {
    await loadPluginHooks();
  } catch (e) {
    hook_load_failed = true;
    logError(e);
    logForDebugging(`refreshActivePlugins: loadPluginHooks failed: ${errorMessage(e)}`);
  }
  const hook_count = enabled.reduce((sum, p) => {
    if (!p.hooksConfig)
      return sum;
    return sum + Object.values(p.hooksConfig).reduce((s, matchers) => s + (matchers?.reduce((h, m) => h + m.hooks.length, 0) ?? 0), 0);
  }, 0);
  logForDebugging(`refreshActivePlugins: ${enabled.length} enabled, ${pluginCommands.length} commands, ${agentDefinitions.allAgents.length} agents, ${hook_count} hooks, ${mcp_count} MCP, ${lsp_count} LSP`);
  return {
    enabled_count: enabled.length,
    disabled_count: disabled.length,
    command_count: pluginCommands.length,
    agent_count: agentDefinitions.allAgents.length,
    hook_count,
    mcp_count,
    lsp_count,
    error_count: errors.length + (hook_load_failed ? 1 : 0),
    agentDefinitions,
    pluginCommands
  };
}
function mergePluginErrors(existing, fresh) {
  const preserved = existing.filter((e) => e.source === "lsp-manager" || e.source.startsWith("plugin:"));
  const freshKeys = new Set(fresh.map(errorKey));
  const deduped = preserved.filter((e) => !freshKeys.has(errorKey(e)));
  return [...deduped, ...fresh];
}
function errorKey(e) {
  return e.type === "generic-error" ? `generic-error:${e.source}:${e.error}` : `${e.type}:${e.source}`;
}
var init_refresh = __esm(() => {
  init_state();
  init_manager();
  init_loadAgentsDir();
  init_debug();
  init_errors();
  init_log();
  init_cacheUtils();
  init_loadPluginCommands();
  init_loadPluginHooks();
  init_lspPluginIntegration();
  init_mcpPluginIntegration();
  init_orphanedPluginFilter();
  init_pluginLoader();
});

// src/commands/reload-plugins/reload-plugins.ts
function n(count, noun) {
  return `${count} ${plural(count, noun)}`;
}
var call = async (_args, context) => {
  if (false) {}
  const r = await refreshActivePlugins(context.setAppState);
  const parts = [
    n(r.enabled_count, "plugin"),
    n(r.command_count, "skill"),
    n(r.agent_count, "agent"),
    n(r.hook_count, "hook"),
    n(r.mcp_count, "plugin MCP server"),
    n(r.lsp_count, "plugin LSP server")
  ];
  let msg = `Reloaded: ${parts.join(" · ")}`;
  if (r.error_count > 0) {
    msg += `
${n(r.error_count, "error")} during load. Run /doctor for details.`;
  }
  return { type: "text", value: msg };
};
var init_reload_plugins = __esm(() => {
  init_state();
  init_settingsSync();
  init_envUtils();
  init_refresh();
  init_changeDetector();
  init_stringUtils();
});
init_reload_plugins();

export {
  call
};
