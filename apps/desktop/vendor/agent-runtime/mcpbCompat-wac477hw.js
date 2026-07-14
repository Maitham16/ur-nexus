import {
  __esm
} from "./index-8rxa073f.js";

// src/utils/dxt/mcpbCompat.ts
async function getMcpConfigForManifest({
  manifest
}) {
  return manifest.mcpServers ?? manifest.server ?? null;
}
async function mcpbRun() {
  return null;
}
async function mcpbInstall() {
  return null;
}
function validateManifest() {
  return true;
}
var McpbManifestSchema;
var init_mcpbCompat = __esm(() => {
  McpbManifestSchema = {
    safeParse(input) {
      if (input && typeof input === "object" && typeof input.name === "string") {
        return { success: true, data: input };
      }
      return {
        success: false,
        error: {
          flatten: () => ({
            fieldErrors: { name: ["Required string"] },
            formErrors: []
          })
        }
      };
    }
  };
});
init_mcpbCompat();

export {
  validateManifest,
  mcpbRun,
  mcpbInstall,
  getMcpConfigForManifest,
  McpbManifestSchema
};
