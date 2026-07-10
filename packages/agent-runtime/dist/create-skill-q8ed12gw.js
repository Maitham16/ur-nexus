import {
  clearCommandsCache,
  getSkillsPath,
  init_commands1 as init_commands,
  init_loadSkillsDir
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
  getDisplayPath,
  init_file
} from "./index-nds05g02.js";
import"./index-f7bfe40r.js";
import"./index-3stg8t86.js";
import"./index-5jmh1e0k.js";
import"./index-mwn5bkf6.js";
import"./index-a9y6sg4d.js";
import"./index-dsy9thtk.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
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

// ../../src/commands/create-skill/create-skill.tsx
import { mkdir, writeFile } from "fs/promises";
import { isAbsolute, join, resolve } from "path";
function slugify(raw) {
  return raw.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function buildSkillTemplate(name, description) {
  const title = name.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return `---
name: ${name}
description: ${description}
when_to_use: Describe the situations where UR should reach for this skill.
---

# ${title}

Replace this body with the instructions UR should follow when this skill runs.

## Steps
1. ...
2. ...

## Notes
- Keep the description above focused — it is what UR reads to decide whether to use this skill.
- Anything in this file below the frontmatter is the prompt that expands when the skill is invoked.
`;
}
var USAGE, call = async (args) => {
  const useProject = /(^|\s)--project(\s|$)/.test(args ?? "");
  const cleaned = (args ?? "").replace(/(^|\s)--project(\s|$)/, " ").trim();
  const colonIndex = cleaned.indexOf(":");
  const rawName = (colonIndex === -1 ? cleaned : cleaned.slice(0, colonIndex)).trim();
  const rawDescription = colonIndex === -1 ? "" : cleaned.slice(colonIndex + 1).trim();
  if (!rawName) {
    return { type: "text", value: USAGE };
  }
  const name = slugify(rawName);
  if (!name) {
    return {
      type: "text",
      value: `Invalid skill name "${rawName}". Use letters, numbers, and spaces or hyphens.`
    };
  }
  const humanName = name.replace(/-/g, " ");
  const description = rawDescription || `${humanName.charAt(0).toUpperCase()}${humanName.slice(1)} skill`;
  const source = useProject ? "projectSettings" : "userSettings";
  const baseDir = getSkillsPath(source, "skills");
  const resolvedBase = isAbsolute(baseDir) ? baseDir : resolve(getCwd(), baseDir);
  const skillDir = join(resolvedBase, name);
  const skillFile = join(skillDir, "SKILL.md");
  try {
    await mkdir(skillDir, { recursive: true });
    await writeFile(skillFile, buildSkillTemplate(name, description), {
      encoding: "utf-8",
      flag: "wx"
    });
  } catch (error) {
    const code = error?.code;
    if (code === "EEXIST") {
      return {
        type: "text",
        value: `A skill already exists at ${getDisplayPath(skillFile)}. Pick a different name or edit it directly.`
      };
    }
    return {
      type: "text",
      value: `Failed to create skill: ${error instanceof Error ? error.message : String(error)}`
    };
  }
  clearCommandsCache();
  return {
    type: "text",
    value: `Created skill "${name}" at ${getDisplayPath(skillFile)}.
` + `Edit it to add your instructions, then run /${name} or let UR invoke it automatically.`
  };
};
var init_create_skill = __esm(() => {
  init_commands();
  init_loadSkillsDir();
  init_cwd();
  init_file();
  USAGE = `usage: /create-skill <name> [: <description>] [--project]
` + `  <name>         skill name (spaces become hyphens), e.g. release notes
` + `  : <description>  optional summary used to decide when the skill applies
` + `  --project      write to ./.ur/skills instead of ~/.ur/skills
` + `examples:
` + `  /create-skill release-notes
` + "  /create-skill release notes : Summarize the git log into release notes";
});
init_create_skill();

export {
  call
};
