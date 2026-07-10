import {
  analyzeContextUsage,
  getMessagesAfterCompactBoundary,
  init_analyzeContext,
  init_messages1 as init_messages,
  init_microCompact,
  microcompactMessages
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
  formatTokens,
  getSourceDisplayName,
  init_constants,
  init_format,
  init_stringUtils
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

// ../../src/commands/context/context-noninteractive.ts
async function collectContextData(context) {
  const {
    messages,
    getAppState,
    options: {
      mainLoopModel,
      tools,
      agentDefinitions,
      customSystemPrompt,
      appendSystemPrompt
    }
  } = context;
  let apiView = getMessagesAfterCompactBoundary(messages);
  if (false) {}
  const { messages: compactedMessages } = await microcompactMessages(apiView);
  const appState = getAppState();
  return analyzeContextUsage(compactedMessages, mainLoopModel, async () => appState.toolPermissionContext, tools, agentDefinitions, undefined, { options: { customSystemPrompt, appendSystemPrompt } }, undefined, apiView);
}
async function call(_args, context) {
  const data = await collectContextData(context);
  return {
    type: "text",
    value: formatContextAsMarkdownTable(data)
  };
}
function formatContextAsMarkdownTable(data) {
  const {
    categories,
    totalTokens,
    rawMaxTokens,
    percentage,
    model,
    memoryFiles,
    mcpTools,
    agents,
    skills,
    messageBreakdown,
    systemTools,
    systemPromptSections
  } = data;
  let output = `## Context Usage

`;
  output += `**Model:** ${model}  
`;
  output += `**Tokens:** ${formatTokens(totalTokens)} / ${formatTokens(rawMaxTokens)} (${percentage}%)
`;
  if (false) {}
  output += `
`;
  const visibleCategories = categories.filter((cat) => cat.tokens > 0 && cat.name !== "Free space" && cat.name !== "Autocompact buffer");
  if (visibleCategories.length > 0) {
    output += `### Estimated usage by category

`;
    output += `| Category | Tokens | Percentage |
`;
    output += `|----------|--------|------------|
`;
    for (const cat of visibleCategories) {
      const percentDisplay = (cat.tokens / rawMaxTokens * 100).toFixed(1);
      output += `| ${cat.name} | ${formatTokens(cat.tokens)} | ${percentDisplay}% |
`;
    }
    const freeSpaceCategory = categories.find((c) => c.name === "Free space");
    if (freeSpaceCategory && freeSpaceCategory.tokens > 0) {
      const percentDisplay = (freeSpaceCategory.tokens / rawMaxTokens * 100).toFixed(1);
      output += `| Free space | ${formatTokens(freeSpaceCategory.tokens)} | ${percentDisplay}% |
`;
    }
    const autocompactCategory = categories.find((c) => c.name === "Autocompact buffer");
    if (autocompactCategory && autocompactCategory.tokens > 0) {
      const percentDisplay = (autocompactCategory.tokens / rawMaxTokens * 100).toFixed(1);
      output += `| Autocompact buffer | ${formatTokens(autocompactCategory.tokens)} | ${percentDisplay}% |
`;
    }
    output += `
`;
  }
  if (mcpTools.length > 0) {
    output += `### MCP Tools

`;
    output += `| Tool | Server | Tokens |
`;
    output += `|------|--------|--------|
`;
    for (const tool of mcpTools) {
      output += `| ${tool.name} | ${tool.serverName} | ${formatTokens(tool.tokens)} |
`;
    }
    output += `
`;
  }
  if (systemTools && systemTools.length > 0 && process.env.USER_TYPE === "ant") {
    output += `### [ANT-ONLY] System Tools

`;
    output += `| Tool | Tokens |
`;
    output += `|------|--------|
`;
    for (const tool of systemTools) {
      output += `| ${tool.name} | ${formatTokens(tool.tokens)} |
`;
    }
    output += `
`;
  }
  if (systemPromptSections && systemPromptSections.length > 0 && process.env.USER_TYPE === "ant") {
    output += `### [ANT-ONLY] System Prompt Sections

`;
    output += `| Section | Tokens |
`;
    output += `|---------|--------|
`;
    for (const section of systemPromptSections) {
      output += `| ${section.name} | ${formatTokens(section.tokens)} |
`;
    }
    output += `
`;
  }
  if (agents.length > 0) {
    output += `### Custom Agents

`;
    output += `| Agent Type | Source | Tokens |
`;
    output += `|------------|--------|--------|
`;
    for (const agent of agents) {
      let sourceDisplay;
      switch (agent.source) {
        case "projectSettings":
          sourceDisplay = "Project";
          break;
        case "userSettings":
          sourceDisplay = "User";
          break;
        case "localSettings":
          sourceDisplay = "Local";
          break;
        case "flagSettings":
          sourceDisplay = "Flag";
          break;
        case "policySettings":
          sourceDisplay = "Policy";
          break;
        case "plugin":
          sourceDisplay = "Plugin";
          break;
        case "built-in":
          sourceDisplay = "Built-in";
          break;
        default:
          sourceDisplay = String(agent.source);
      }
      output += `| ${agent.agentType} | ${sourceDisplay} | ${formatTokens(agent.tokens)} |
`;
    }
    output += `
`;
  }
  if (memoryFiles.length > 0) {
    output += `### Memory Files

`;
    output += `| Type | Path | Tokens |
`;
    output += `|------|------|--------|
`;
    for (const file of memoryFiles) {
      output += `| ${file.type} | ${file.path} | ${formatTokens(file.tokens)} |
`;
    }
    output += `
`;
  }
  if (skills && skills.tokens > 0 && skills.skillFrontmatter.length > 0) {
    output += `### Skills

`;
    output += `| Skill | Source | Tokens |
`;
    output += `|-------|--------|--------|
`;
    for (const skill of skills.skillFrontmatter) {
      output += `| ${skill.name} | ${getSourceDisplayName(skill.source)} | ${formatTokens(skill.tokens)} |
`;
    }
    output += `
`;
  }
  if (messageBreakdown && process.env.USER_TYPE === "ant") {
    output += `### [ANT-ONLY] Message Breakdown

`;
    output += `| Category | Tokens |
`;
    output += `|----------|--------|
`;
    output += `| Tool calls | ${formatTokens(messageBreakdown.toolCallTokens)} |
`;
    output += `| Tool results | ${formatTokens(messageBreakdown.toolResultTokens)} |
`;
    output += `| Attachments | ${formatTokens(messageBreakdown.attachmentTokens)} |
`;
    output += `| Assistant messages (non-tool) | ${formatTokens(messageBreakdown.assistantMessageTokens)} |
`;
    output += `| User messages (non-tool-result) | ${formatTokens(messageBreakdown.userMessageTokens)} |
`;
    output += `
`;
    if (messageBreakdown.toolCallsByType.length > 0) {
      output += `#### Top Tools

`;
      output += `| Tool | Call Tokens | Result Tokens |
`;
      output += `|------|-------------|---------------|
`;
      for (const tool of messageBreakdown.toolCallsByType) {
        output += `| ${tool.name} | ${formatTokens(tool.callTokens)} | ${formatTokens(tool.resultTokens)} |
`;
      }
      output += `
`;
    }
    if (messageBreakdown.attachmentsByType.length > 0) {
      output += `#### Top Attachments

`;
      output += `| Attachment | Tokens |
`;
      output += `|------------|--------|
`;
      for (const attachment of messageBreakdown.attachmentsByType) {
        output += `| ${attachment.name} | ${formatTokens(attachment.tokens)} |
`;
      }
      output += `
`;
    }
  }
  return output;
}
var init_context_noninteractive = __esm(() => {
  init_microCompact();
  init_analyzeContext();
  init_format();
  init_messages();
  init_constants();
  init_stringUtils();
});
init_context_noninteractive();

export {
  collectContextData,
  call
};
