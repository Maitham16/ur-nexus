import {
  clearCommandsCache,
  getSkillsPath,
  init_commands1 as init_commands,
  init_loadSkillsDir
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
  getDisplayPath,
  init_file
} from "./index-133awary.js";
import"./index-pnhq4694.js";
import"./index-4mfpjpj0.js";
import"./index-mpmmtc93.js";
import"./index-s5dp14ed.js";
import"./index-6dy59xbm.js";
import"./index-0r3wd4mq.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
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

// src/commands/create-skill/create-skill.tsx
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
