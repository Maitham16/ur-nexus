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
import"./index-vw0tpbas.js";
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
} from "./index-nds05g02.js";
import"./index-f7bfe40r.js";
import {
  exports_external,
  init_lazySchema,
  init_v4,
  lazySchema
} from "./index-3stg8t86.js";
import {
  init_analytics
} from "./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import {
  init_diagLogs,
  init_git
} from "./index-a9y6sg4d.js";
import"./index-dsy9thtk.js";
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
  errorMessage,
  init_debug,
  init_envUtils,
  init_errors,
  logForDebugging
} from "./index-bdb5pzbm.js";
import {
  getOriginalCwd,
  init_settingsCache,
  init_state
} from "./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/settingsSync/types.ts
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

// ../../src/services/settingsSync/index.ts
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

// ../../src/utils/plugins/refresh.ts
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

// ../../src/commands/reload-plugins/reload-plugins.ts
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
