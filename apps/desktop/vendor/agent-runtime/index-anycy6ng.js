import {
  createAssistantMessage,
  init_constants1 as init_constants,
  init_messages1 as init_messages,
  init_plans
} from "./index-79vhy4mk.js";
import {
  init_strip_ansi,
  stripAnsi
} from "./index-133awary.js";
import {
  init_xml
} from "./index-f80dj2bz.js";
import {
  getSessionId,
  init_state
} from "./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/utils/messages/mappers.ts
import { randomUUID } from "crypto";
function toInternalMessages(messages) {
  return messages.flatMap((message) => {
    switch (message.type) {
      case "assistant":
        return [
          {
            type: "assistant",
            message: message.message,
            uuid: message.uuid,
            requestId: undefined,
            timestamp: new Date().toISOString()
          }
        ];
      case "user":
        return [
          {
            type: "user",
            message: message.message,
            uuid: message.uuid ?? randomUUID(),
            timestamp: message.timestamp ?? new Date().toISOString(),
            isMeta: message.isSynthetic
          }
        ];
      case "system":
        if (message.subtype === "compact_boundary") {
          const compactMsg = message;
          return [
            {
              type: "system",
              content: "Conversation compacted",
              level: "info",
              subtype: "compact_boundary",
              compactMetadata: fromSDKCompactMetadata(compactMsg.compact_metadata),
              uuid: message.uuid,
              timestamp: new Date().toISOString()
            }
          ];
        }
        return [];
      default:
        return [];
    }
  });
}
function toSDKCompactMetadata(meta) {
  const seg = meta.preservedSegment;
  return {
    trigger: meta.trigger,
    pre_tokens: meta.preTokens,
    ...seg && {
      preserved_segment: {
        head_uuid: seg.headUuid,
        anchor_uuid: seg.anchorUuid,
        tail_uuid: seg.tailUuid
      }
    }
  };
}
function fromSDKCompactMetadata(meta) {
  const seg = meta.preserved_segment;
  return {
    trigger: meta.trigger,
    preTokens: meta.pre_tokens,
    ...seg && {
      preservedSegment: {
        headUuid: seg.head_uuid,
        anchorUuid: seg.anchor_uuid,
        tailUuid: seg.tail_uuid
      }
    }
  };
}
function localCommandOutputToSDKAssistantMessage(rawContent, uuid) {
  const cleanContent = stripAnsi(rawContent).replace(/<local-command-stdout>([\s\S]*?)<\/local-command-stdout>/, "$1").replace(/<local-command-stderr>([\s\S]*?)<\/local-command-stderr>/, "$1").trim();
  const synthetic = createAssistantMessage({ content: cleanContent });
  return {
    type: "assistant",
    message: synthetic.message,
    parent_tool_use_id: null,
    session_id: getSessionId(),
    uuid
  };
}
var init_mappers = __esm(() => {
  init_state();
  init_xml();
  init_constants();
  init_strip_ansi();
  init_messages();
  init_plans();
});

export { toInternalMessages, toSDKCompactMetadata, localCommandOutputToSDKAssistantMessage, init_mappers };
