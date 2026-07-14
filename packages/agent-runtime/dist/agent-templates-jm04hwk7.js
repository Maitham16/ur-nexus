import {
  formatScaffoldResult,
  getAllAgentTemplates,
  init_featureScaffolds,
  installAgentTemplates,
  installAllAgentTemplates
} from "./index-ckfvergp.js";
import"./index-79vhy4mk.js";
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
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
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
import"./index-133awary.js";
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

// src/commands/agent-templates/agent-templates.ts
async function formatTemplateList(json) {
  const all = await getAllAgentTemplates();
  if (json) {
    return JSON.stringify({ templates: all }, null, 2);
  }
  const lines = ["Available agent templates", ""];
  for (const template of all) {
    lines.push(`${template.name}${template.plugin ? ` (${template.plugin})` : ""}`);
    lines.push(`  ${template.description}`);
  }
  lines.push("");
  lines.push("Install all: ur agent-templates install");
  lines.push("Install selected: ur agent-templates install reviewer test-runner");
  return lines.join(`
`);
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const force = tokens.includes("--force");
  const command = tokens.find((token) => !token.startsWith("--")) ?? "list";
  if (command === "list") {
    return { type: "text", value: await formatTemplateList(json) };
  }
  if (command === "install" || command === "init") {
    const all = await getAllAgentTemplates();
    const knownNames = new Set(all.map((template) => template.name));
    const requestedNames = tokens.filter((token) => !token.startsWith("--") && token !== command);
    const unknownNames = requestedNames.filter((name) => !knownNames.has(name));
    const names = requestedNames.filter((name) => knownNames.has(name));
    if (unknownNames.length > 0) {
      return {
        type: "text",
        value: `Unknown agent template${unknownNames.length === 1 ? "" : "s"}: ${unknownNames.join(", ")}
Known templates: ${all.map((t) => t.name).join(", ")}`
      };
    }
    const result = names.length === 0 ? await installAllAgentTemplates(getCwd(), { force }) : installAgentTemplates(getCwd(), names, { force });
    if (json) {
      return { type: "text", value: JSON.stringify(result, null, 2) };
    }
    return { type: "text", value: formatScaffoldResult(result) };
  }
  return {
    type: "text",
    value: `Unknown agent-templates command: ${command}

${await formatTemplateList(false)}`
  };
};
var init_agent_templates = __esm(() => {
  init_featureScaffolds();
  init_argumentSubstitution();
  init_cwd();
});
init_agent_templates();

export {
  call
};
