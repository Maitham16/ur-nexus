import {
  getProjectDir,
  getTranscriptPath,
  getTranscriptPathForSession,
  init_sessionStorage,
  isTranscriptMessage,
  saveCustomTitle,
  searchSessionsByCustomTitle
} from "./index-ncjdg6tp.js";
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
  escapeRegExp,
  init_stringUtils
} from "./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import {
  init_analytics,
  logEvent
} from "./index-5jmh1e0k.js";
import {
  init_json,
  parseJSONL
} from "./index-mwn5bkf6.js";
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
import {
  init_slowOperations,
  jsonStringify
} from "./index-bdb5pzbm.js";
import {
  getOriginalCwd,
  getSessionId,
  init_state
} from "./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/branch/branch.ts
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
