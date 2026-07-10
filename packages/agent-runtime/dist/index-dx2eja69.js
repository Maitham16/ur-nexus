import {
  getAuthHeaders,
  getOauthConfig,
  getURAIOAuthTokens,
  getURCodeUserAgent,
  hasProfileScope,
  init_auth,
  init_client,
  init_http,
  init_oauth,
  init_userAgent,
  isOAuthTokenExpired,
  isURAISubscriber
} from "./index-nds05g02.js";
import {
  axios_default,
  init_axios
} from "./index-r54kbd6k.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/api/usage.ts
async function fetchUtilization() {
  if (!isURAISubscriber() || !hasProfileScope()) {
    return {};
  }
  const tokens = getURAIOAuthTokens();
  if (tokens?.expiresAt != null && isOAuthTokenExpired(tokens.expiresAt)) {
    return null;
  }
  const authResult = getAuthHeaders();
  if (authResult.error) {
    throw new Error(`Auth error: ${authResult.error}`);
  }
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": getURCodeUserAgent(),
    ...authResult.headers
  };
  const url = `${getOauthConfig().BASE_API_URL}/api/oauth/usage`;
  const response = await axios_default.get(url, {
    headers,
    timeout: 5000
  });
  return response.data;
}
var init_usage = __esm(() => {
  init_axios();
  init_oauth();
  init_auth();
  init_http();
  init_userAgent();
  init_client();
});

export { fetchUtilization, init_usage };
