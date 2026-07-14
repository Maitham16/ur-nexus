import {
  analyzeContextUsage,
  getMessagesAfterCompactBoundary,
  init_analyzeContext,
  init_messages1 as init_messages,
  init_microCompact,
  microcompactMessages
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
  formatTokens,
  getSourceDisplayName,
  init_constants,
  init_format,
  init_stringUtils
} from "./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import"./index-mpmmtc93.js";
import"./index-s5dp14ed.js";
import"./index-6dy59xbm.js";
import"./index-0r3wd4mq.js";
import"./index-b5f4m7g4.js";
import"./index-h7h0j06f.js";
import"./index-7h9ddexs.js";
import"./index-f80dj2bz.js";
import"./index-q00jv0fc.js";
import"./index-cs7da0vv.js";
import"./index-ycnb0yeb.js";
import"./index-vpczjthp.js";
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/context/context-noninteractive.ts
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
