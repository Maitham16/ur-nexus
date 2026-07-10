import {
  init_argumentSubstitution,
  parseArguments
} from "./index-ke69cyc7.js";
import {
  PROVIDER_IDS,
  authAliasForProvider,
  clearProviderApiKey,
  doctorProvider,
  getActiveProviderSettings,
  getInitialSettings,
  getProviderApiKeySource,
  getProviderDefinition,
  init_providerCredentials,
  init_providerRegistry,
  init_settings1 as init_settings,
  launchProviderAuth,
  resolveProviderId,
  setProviderApiKey
} from "./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import"./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import"./index-a9y6sg4d.js";
import"./index-dsy9thtk.js";
import"./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/providers/providerConnection.ts
function getApiConnectionState(providerId, options = {}) {
  const source = getProviderApiKeySource(providerId, options);
  return { state: source === "none" ? "needs-key" : "connected", keySource: source };
}
async function getProviderConnection(providerId, options = {}) {
  const provider = resolveProviderId(providerId);
  if (!provider) {
    throw new Error(`Unknown provider "${providerId}". Run: ur provider list`);
  }
  const def = getProviderDefinition(provider);
  const base = { provider, displayName: def.displayName, accessType: def.accessType };
  if (def.accessType === "api") {
    const { state, keySource } = getApiConnectionState(provider, options.credentials);
    if (def.endpointKind === "openai-compatible" && keySource === "none") {
      const baseUrl2 = getConfiguredBaseUrl(provider);
      return baseUrl2 ? { ...base, state: "connected", detail: `endpoint ${baseUrl2}`, keySource } : { ...base, state: "needs-endpoint", detail: "no base URL configured", keySource };
    }
    return {
      ...base,
      state,
      keySource,
      detail: state === "connected" ? `${keySource === "stored" ? "stored key" : `${def.envKey} in environment`}` : `run: ur connect ${provider}`
    };
  }
  if (def.accessType === "subscription") {
    const doctor = await doctorProvider(provider);
    return {
      ...base,
      state: doctor.ok ? "connected" : "needs-login",
      detail: doctor.ok ? "official CLI logged in" : doctor.failureReason ?? `run: ur connect ${provider}`
    };
  }
  const baseUrl = getConfiguredBaseUrl(provider);
  return baseUrl ? { ...base, state: "connected", detail: `endpoint ${baseUrl}` } : { ...base, state: "needs-endpoint", detail: "no base URL configured" };
}
function getConfiguredBaseUrl(provider) {
  const settings = getActiveProviderSettings(getInitialSettings());
  const scoped = settings.active === provider ? settings.baseUrl : undefined;
  return scoped ?? getProviderDefinition(provider).defaultBaseUrl;
}
function formatConnectionLine(conn) {
  const mark = conn.state === "connected" ? "connected" : conn.state;
  return `${conn.displayName} (${conn.provider}) — ${mark}: ${conn.detail}`;
}
var init_providerConnection = __esm(() => {
  init_providerRegistry();
  init_providerCredentials();
  init_settings();
});

// ../../src/commands/connect/connect.tsx
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
function positionals(tokens) {
  const withValue = new Set(["--key"]);
  const values = [];
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (withValue.has(token)) {
      i++;
      continue;
    }
    if (token.startsWith("--"))
      continue;
    values.push(token);
  }
  return values;
}
async function readStdinKey() {
  if (process.stdin.isTTY)
    return "";
  const chunks = [];
  for await (const chunk of process.stdin)
    chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8").trim();
}
function usage() {
  return [
    "Usage:",
    "  ur connect status [--json]           Show connection status for every provider",
    "  ur connect <provider>                Connect (subscription: official login; API: prompts for a key)",
    "  ur connect <provider> --key <KEY>    Store an API key (or pipe it: echo $KEY | ur connect <provider>)",
    "  ur connect logout <provider>         Disconnect (clear stored key / CLI logout hint)",
    "",
    `Providers: ${PROVIDER_IDS.join(", ")}`
  ].join(`
`);
}
async function connectProvider(provider, keyFlag) {
  const def = getProviderDefinition(provider);
  if (def.accessType === "subscription") {
    const alias = authAliasForProvider(provider);
    if (alias === "provider") {
      return `No official login is configured for ${provider}.`;
    }
    const result = await launchProviderAuth(alias);
    return `${result.message}
Once logged in, ${def.displayName} runs via its official CLI. Select it with /model.`;
  }
  if (def.envKey) {
    const key = keyFlag ?? await readStdinKey();
    if (!key) {
      return [
        `${def.displayName} connects with an API key.`,
        `Provide it securely (not in shell history):`,
        `  echo $${def.envKey} | ur connect ${provider}`,
        `or: ur connect ${provider} --key <KEY>`,
        `The key is stored in your OS keychain and reused automatically.`
      ].join(`
`);
    }
    const saved = setProviderApiKey(provider, key);
    if (!saved.ok)
      return saved.message;
    return `Connected ${def.displayName}. ${saved.message} You can now select it with /model.`;
  }
  return `${def.displayName} needs a local endpoint, not a login. Set it with: ur config set base_url <url>`;
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const positional = positionals(tokens);
  const action = positional[0] ?? "status";
  if (action === "status" || action === "list") {
    const connections = await Promise.all(PROVIDER_IDS.map((id) => getProviderConnection(id).catch(() => null)));
    const ok = connections.filter(Boolean);
    if (json) {
      return { type: "text", value: JSON.stringify(ok, null, 2) };
    }
    return { type: "text", value: ok.map((c) => `- ${formatConnectionLine(c)}`).join(`
`) };
  }
  if (action === "logout" || action === "disconnect") {
    const provider2 = resolveProviderId(positional[1] ?? "");
    if (!provider2)
      return { type: "text", value: usage() };
    const def = getProviderDefinition(provider2);
    if (def.accessType === "subscription") {
      return {
        type: "text",
        value: `Log out of ${def.displayName} through its official CLI (e.g. its \`logout\` command). UR does not store its session.`
      };
    }
    const cleared = clearProviderApiKey(provider2);
    return { type: "text", value: cleared.message };
  }
  const provider = resolveProviderId(action);
  if (!provider) {
    return { type: "text", value: usage() };
  }
  return { type: "text", value: await connectProvider(provider, option(tokens, "--key")) };
};
var init_connect = __esm(() => {
  init_argumentSubstitution();
  init_providerRegistry();
  init_providerCredentials();
  init_providerConnection();
});
init_connect();

export {
  call
};
