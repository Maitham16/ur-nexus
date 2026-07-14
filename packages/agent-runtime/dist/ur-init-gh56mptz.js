import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/utils/urAssets.ts
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
function scaffoldUrAssets(cwd) {
  const root = join(cwd, ".ur");
  const created = [];
  const skipped = [];
  mkdirSync(root, { recursive: true });
  for (const d of DIRS)
    mkdirSync(join(root, d), { recursive: true });
  for (const file of SEED_FILES) {
    const full = join(root, file.path);
    if (existsSync(full)) {
      skipped.push(file.path);
      continue;
    }
    writeFileSync(full, file.content);
    created.push(file.path);
  }
  return { root, created, skipped };
}
function formatUrAssetsResult(r) {
  const lines = [`.ur ready at ${r.root}`];
  if (r.created.length)
    lines.push(`created: ${r.created.join(", ")}`);
  if (r.skipped.length)
    lines.push(`kept existing: ${r.skipped.join(", ")}`);
  return lines.join(`
`);
}
var SEED_FILES, DIRS;
var init_urAssets = __esm(() => {
  SEED_FILES = [
    {
      path: "README.md",
      content: `# .ur

Project-local assets for the UR agent. UR reads from and writes to this folder.

- \`docs/\`          — documentation about this project and the agent
- \`superpowers/\`   — reusable skills/superpowers the agent can apply
- \`brainstorming/\` — scratch space for ideas and plans
- \`memory/\`        — persistent memory carried across sessions
- \`prompts/\`       — prompt assets (system prompt, snippets)
`
    },
    {
      path: "config.json",
      content: `${JSON.stringify({
        version: 1,
        assets: ["docs", "superpowers", "brainstorming", "memory", "prompts"],
        createdBy: "ur"
      }, null, 2)}
`
    },
    {
      path: "docs/agent.md",
      content: `# Agent documentation

Describe what this agent does, how it is configured, and any project-specific
conventions it should follow.
`
    },
    {
      path: "superpowers/README.md",
      content: `# Superpowers

Drop reusable skills here — focused capabilities the agent can pull in on demand
(one Markdown file per superpower). Each file should explain *when to use it* and
*how to apply it*.
`
    },
    {
      path: "brainstorming/README.md",
      content: `# Brainstorming

Free-form space for ideas, designs, and plans. Nothing here is binding — it is
working memory for thinking through problems.
`
    },
    {
      path: "memory/memory.md",
      content: `# Memory

Durable facts and decisions the agent should remember across sessions. Keep it
concise and current; prune anything stale.
`
    },
    {
      path: "prompts/system.md",
      content: `# System prompt assets

Reusable prompt fragments and the project system prompt live here.
`
    }
  ];
  DIRS = ["docs", "superpowers", "brainstorming", "memory", "prompts"];
});

// ../../src/commands/ur-init/ur-init.ts
var call = async () => {
  const result = scaffoldUrAssets(getCwd());
  return { type: "text", value: formatUrAssetsResult(result) };
};
var init_ur_init = __esm(() => {
  init_cwd();
  init_urAssets();
});
init_ur_init();

export {
  call
};
