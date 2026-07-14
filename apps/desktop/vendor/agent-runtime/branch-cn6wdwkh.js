import {
  getProjectDir,
  getTranscriptPath,
  getTranscriptPathForSession,
  init_sessionStorage,
  isTranscriptMessage,
  saveCustomTitle,
  searchSessionsByCustomTitle
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
  escapeRegExp,
  init_stringUtils
} from "./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import {
  init_analytics,
  logEvent
} from "./index-mpmmtc93.js";
import {
  init_json,
  parseJSONL
} from "./index-s5dp14ed.js";
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
import {
  init_slowOperations,
  jsonStringify
} from "./index-t784n9jz.js";
import {
  getOriginalCwd,
  getSessionId,
  init_state
} from "./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/branch/branch.ts
import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
function deriveFirstPrompt(firstUserMessage) {
  const content = firstUserMessage?.message?.content;
  if (!content)
    return "Branched conversation";
  const raw = typeof content === "string" ? content : content.find((block) => block.type === "text")?.text;
  if (!raw)
    return "Branched conversation";
  return raw.replace(/\s+/g, " ").trim().slice(0, 100) || "Branched conversation";
}
async function createFork(customTitle) {
  const forkSessionId = randomUUID();
  const originalSessionId = getSessionId();
  const projectDir = getProjectDir(getOriginalCwd());
  const forkSessionPath = getTranscriptPathForSession(forkSessionId);
  const currentTranscriptPath = getTranscriptPath();
  await mkdir(projectDir, { recursive: true, mode: 448 });
  let transcriptContent;
  try {
    transcriptContent = await readFile(currentTranscriptPath);
  } catch {
    throw new Error("No conversation to branch");
  }
  if (transcriptContent.length === 0) {
    throw new Error("No conversation to branch");
  }
  const entries = parseJSONL(transcriptContent);
  const mainConversationEntries = entries.filter((entry) => isTranscriptMessage(entry) && !entry.isSidechain);
  const contentReplacementRecords = entries.filter((entry) => entry.type === "content-replacement" && entry.sessionId === originalSessionId).flatMap((entry) => entry.replacements);
  if (mainConversationEntries.length === 0) {
    throw new Error("No messages to branch");
  }
  let parentUuid = null;
  const lines = [];
  const serializedMessages = [];
  for (const entry of mainConversationEntries) {
    const forkedEntry = {
      ...entry,
      sessionId: forkSessionId,
      parentUuid,
      isSidechain: false,
      forkedFrom: {
        sessionId: originalSessionId,
        messageUuid: entry.uuid
      }
    };
    const serialized = {
      ...entry,
      sessionId: forkSessionId
    };
    serializedMessages.push(serialized);
    lines.push(jsonStringify(forkedEntry));
    if (entry.type !== "progress") {
      parentUuid = entry.uuid;
    }
  }
  if (contentReplacementRecords.length > 0) {
    const forkedReplacementEntry = {
      type: "content-replacement",
      sessionId: forkSessionId,
      replacements: contentReplacementRecords
    };
    lines.push(jsonStringify(forkedReplacementEntry));
  }
  await writeFile(forkSessionPath, lines.join(`
`) + `
`, {
    encoding: "utf8",
    mode: 384
  });
  return {
    sessionId: forkSessionId,
    title: customTitle,
    forkPath: forkSessionPath,
    serializedMessages,
    contentReplacementRecords
  };
}
async function getUniqueForkName(baseName) {
  const candidateName = `${baseName} (Branch)`;
  const existingWithExactName = await searchSessionsByCustomTitle(candidateName, { exact: true });
  if (existingWithExactName.length === 0) {
    return candidateName;
  }
  const existingForks = await searchSessionsByCustomTitle(`${baseName} (Branch`);
  const usedNumbers = new Set([1]);
  const forkNumberPattern = new RegExp(`^${escapeRegExp(baseName)} \\(Branch(?: (\\d+))?\\)$`);
  for (const session of existingForks) {
    const match = session.customTitle?.match(forkNumberPattern);
    if (match) {
      if (match[1]) {
        usedNumbers.add(parseInt(match[1], 10));
      } else {
        usedNumbers.add(1);
      }
    }
  }
  let nextNumber = 2;
  while (usedNumbers.has(nextNumber)) {
    nextNumber++;
  }
  return `${baseName} (Branch ${nextNumber})`;
}
async function call(onDone, context, args) {
  const customTitle = args?.trim() || undefined;
  const originalSessionId = getSessionId();
  try {
    const {
      sessionId,
      title,
      forkPath,
      serializedMessages,
      contentReplacementRecords
    } = await createFork(customTitle);
    const now = new Date;
    const firstPrompt = deriveFirstPrompt(serializedMessages.find((m) => m.type === "user"));
    const baseName = title ?? firstPrompt;
    const effectiveTitle = await getUniqueForkName(baseName);
    await saveCustomTitle(sessionId, effectiveTitle, forkPath);
    logEvent("tengu_conversation_forked", {
      message_count: serializedMessages.length,
      has_custom_title: !!title
    });
    const forkLog = {
      date: now.toISOString().split("T")[0],
      messages: serializedMessages,
      fullPath: forkPath,
      value: now.getTime(),
      created: now,
      modified: now,
      firstPrompt,
      messageCount: serializedMessages.length,
      isSidechain: false,
      sessionId,
      customTitle: effectiveTitle,
      contentReplacements: contentReplacementRecords
    };
    const titleInfo = title ? ` "${title}"` : "";
    const resumeHint = `
To resume the original: ur -r ${originalSessionId}`;
    const successMessage = `Branched conversation${titleInfo}. You are now in the branch.${resumeHint}`;
    if (context.resume) {
      await context.resume(sessionId, forkLog, "fork");
      onDone(successMessage, { display: "system" });
    } else {
      onDone(`Branched conversation${titleInfo}. Resume with: /resume ${sessionId}`);
    }
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    onDone(`Failed to branch conversation: ${message}`);
    return null;
  }
}
var init_branch = __esm(() => {
  init_state();
  init_analytics();
  init_json();
  init_sessionStorage();
  init_slowOperations();
  init_stringUtils();
});
init_branch();

export {
  deriveFirstPrompt,
  call
};
