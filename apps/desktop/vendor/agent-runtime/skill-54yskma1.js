import {
  init_runWorkflow,
  init_workflows,
  runWorkflowSpec,
  validateWorkflow
} from "./index-zrfny9xn.js";
import"./index-zn5x3nwj.js";
import {
  getProjectDirsUpToHome,
  init_markdownConfigLoader
} from "./index-3xrbnz6c.js";
import"./index-kkermbsd.js";
import"./index-gph76kef.js";
import"./index-2j7c2ame.js";
import"./index-61fyyngt.js";
import"./index-6hrfermc.js";
import"./index-r9gwtga0.js";
import"./index-s87snjmt.js";
import"./index-6ykfn1n2.js";
import"./index-e7z6rkgj.js";
import"./index-e7zhbfbk.js";
import"./index-gkqe0rrq.js";
import"./index-ked7nkp4.js";
import"./index-43251g5q.js";
import"./index-33ph0x52.js";
import {
  require_dist
} from "./index-wxp81q89.js";
import"./index-efqwnst8.js";
import"./index-na6pcvfj.js";
import"./index-98nws6xf.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import"./index-4k4gpxwy.js";
import"./index-zh6q93c4.js";
import"./index-j9j0h3gp.js";
import"./index-mpvjr5hg.js";
import"./index-gtvyh4ft.js";
import"./index-d6epqsmt.js";
import"./index-bwntnbyg.js";
import"./index-xvadh9a8.js";
import"./index-a38sm3ww.js";
import"./index-t5r7sy2d.js";
import"./index-ktb0kcww.js";
import"./index-tdkq0knn.js";
import"./index-kq80n9z5.js";
import"./index-1f511qkg.js";
import"./index-bdfn6xh6.js";
import"./index-60smdz72.js";
import"./index-5jrp51k1.js";
import"./index-31dnhhm9.js";
import"./index-f7bfe40r.js";
import"./index-z5aeypvg.js";
import"./index-5jmh1e0k.js";
import"./index-r54kbd6k.js";
import"./index-f6t8v2s9.js";
import {
  init_json,
  safeParseJSON
} from "./index-wxsgjqjk.js";
import"./index-s1a1wahe.js";
import"./index-wred0kdg.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-7bd814mt.js";
import"./index-m9qhxms7.js";
import {
  getFsImplementation,
  getURConfigHomeDir,
  init_envUtils,
  init_errors,
  init_fsOperations,
  isFsInaccessible
} from "./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm,
  __toESM
} from "./index-8rxa073f.js";

// ../../src/skills/skillSpec.ts
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
function readTextFile(path) {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return;
  }
}
function listFiles(dir) {
  if (!existsSync(dir))
    return [];
  return readdirSync(dir, { withFileTypes: true }).filter((e) => e.isFile()).map((e) => e.name).sort();
}
function normalizeSkillStep(raw, index) {
  const step = raw ?? {};
  const gate = step.gate === "approval" || step.gate === "verification" ? step.gate : undefined;
  return {
    id: String(step.id ?? `step-${index + 1}`),
    name: String(step.name ?? step.id ?? `Step ${index + 1}`),
    agent: String(step.agent ?? "general-purpose"),
    prompt: String(step.prompt ?? ""),
    dependsOn: Array.isArray(step.dependsOn) ? step.dependsOn.map(String) : [],
    gate,
    checkpoint: step.checkpoint === true
  };
}
function parseSkillYaml(text) {
  const trimmed = text.trim();
  const parsed = trimmed.startsWith("{") ? safeParseJSON(trimmed, false) : import_yaml.parse(trimmed);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Skill spec is not an object");
  }
  const spec = parsed;
  if (!spec.name || !Array.isArray(spec.steps)) {
    throw new Error("Skill spec must have a name and a steps array");
  }
  return {
    version: 1,
    name: String(spec.name),
    description: spec.description ? String(spec.description) : undefined,
    instructions: spec.instructions ? String(spec.instructions) : undefined,
    allowedTools: Array.isArray(spec.allowedTools) ? spec.allowedTools.map(String) : undefined,
    argumentHint: spec.argumentHint ? String(spec.argumentHint) : undefined,
    templates: Array.isArray(spec.templates) ? spec.templates.map(String) : undefined,
    scripts: Array.isArray(spec.scripts) ? spec.scripts.map(String) : undefined,
    checklists: Array.isArray(spec.checklists) ? spec.checklists.map(String) : undefined,
    steps: spec.steps.map(normalizeSkillStep)
  };
}
function validateSkillSpec(spec) {
  const errors = [];
  if (!NAME_RE.test(spec.name)) {
    errors.push(`invalid skill name "${spec.name}"`);
  }
  if (spec.steps.length === 0) {
    errors.push("skill has no steps");
  }
  const seen = new Set;
  for (const step of spec.steps) {
    if (seen.has(step.id))
      errors.push(`duplicate step id "${step.id}"`);
    seen.add(step.id);
    if (!NAME_RE.test(step.id))
      errors.push(`invalid step id "${step.id}"`);
  }
  for (const step of spec.steps) {
    for (const dep of step.dependsOn ?? []) {
      if (!seen.has(dep)) {
        errors.push(`step "${step.id}" depends on missing step "${dep}"`);
      }
      if (dep === step.id)
        errors.push(`step "${step.id}" depends on itself`);
    }
  }
  return errors;
}
function findInstructions(dir) {
  for (const name of [SKILL_INSTRUCTIONS_FILE, "README.md"]) {
    const path = join(dir, name);
    const content = readTextFile(path);
    if (content !== undefined)
      return content;
  }
  return;
}
function loadSkillDir(skillsRoot, name) {
  const dir = join(skillsRoot, name);
  if (!existsSync(dir))
    return null;
  const specPath = join(dir, SKILL_YAML_FILE);
  const specText = readTextFile(specPath);
  if (specText === undefined)
    return null;
  const spec = parseSkillYaml(specText);
  const errors = validateSkillSpec(spec);
  if (errors.length > 0) {
    throw new Error(`Invalid skill "${name}": ${errors.join("; ")}`);
  }
  const templatesDir = join(dir, "templates");
  const scriptsDir = join(dir, "scripts");
  const checklistsDir = join(dir, "checklists");
  return {
    name,
    path: dir,
    spec,
    files: {
      instructions: findInstructions(dir),
      templates: listFiles(templatesDir),
      scripts: listFiles(scriptsDir),
      checklists: listFiles(checklistsDir)
    }
  };
}
function listSkillDirs(skillsRoot) {
  if (!existsSync(skillsRoot))
    return [];
  return readdirSync(skillsRoot, { withFileTypes: true }).filter((e) => e.isDirectory() && existsSync(join(skillsRoot, e.name, SKILL_YAML_FILE))).map((e) => e.name).sort();
}
function loadAllSkillDirs(roots) {
  const byName = new Map;
  for (const root of roots) {
    for (const name of listSkillDirs(root)) {
      const info = loadSkillDir(root, name);
      if (info)
        byName.set(name, info);
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}
function skillToWorkflow(skill, args, options) {
  const skillDir = options?.skillDir;
  const instructions = options?.instructionText ?? "";
  const prefixParts = [];
  if (skillDir) {
    prefixParts.push(`Base directory for this skill: ${skillDir}`);
  }
  if (instructions) {
    prefixParts.push(`
${instructions}`);
  }
  const prefix = prefixParts.length > 0 ? `${prefixParts.join(`
`)}

` : "";
  const substitutedSteps = skill.steps.map((step) => ({
    ...step,
    prompt: substituteSkillArgs(`${prefix}${step.prompt}`, args, skill.argumentHint)
  }));
  return {
    version: 1,
    name: skill.name,
    description: skill.description,
    steps: substitutedSteps
  };
}
function substituteSkillArgs(content, args, argumentHint) {
  const parsedArgs = parseSkillArgs(args);
  let result = content;
  result = result.replace(/\$ARGUMENTS\[(\d+)\]/g, (_, indexStr) => {
    const index = parseInt(indexStr, 10);
    return parsedArgs[index] ?? "";
  });
  result = result.replaceAll("$ARGUMENTS", args);
  result = result.replace(/\$(\d+)(?!\w)/g, (_, indexStr) => {
    const index = parseInt(indexStr, 10);
    return parsedArgs[index] ?? "";
  });
  if (result === content && args.trim()) {
    result = `${result}

ARGUMENTS: ${args}`;
  }
  return result;
}
function parseSkillArgs(args) {
  if (!args || !args.trim())
    return [];
  const out = [];
  let current = "";
  let quote = null;
  for (let i = 0;i < args.length; i++) {
    const ch = args[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
        out.push(current);
        current = "";
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (/\s/.test(ch)) {
      if (current) {
        out.push(current);
        current = "";
      }
    } else {
      current += ch;
    }
  }
  if (current)
    out.push(current);
  return out;
}
function formatSkillStatus(info) {
  const lines = [
    `Skill: ${info.name}`,
    info.spec.description ? info.spec.description : "",
    `Path: ${info.path}`,
    info.files.instructions ? "Instructions: instructions.md" : "",
    info.files.templates.length > 0 ? `Templates: ${info.files.templates.join(", ")}` : "",
    info.files.scripts.length > 0 ? `Scripts: ${info.files.scripts.join(", ")}` : "",
    info.files.checklists.length > 0 ? `Checklists: ${info.files.checklists.join(", ")}` : "",
    `Steps: ${info.spec.steps.length}`
  ];
  return lines.filter(Boolean).join(`
`);
}
function initSkillDir(dir, name) {
  mkdirSync(dir, { recursive: true });
  mkdirSync(join(dir, "scripts"), { recursive: true });
  mkdirSync(join(dir, "templates"), { recursive: true });
  mkdirSync(join(dir, "checklists"), { recursive: true });
  const spec = {
    version: 1,
    name,
    description: `Executable ${name} skill`,
    instructions: SKILL_INSTRUCTIONS_FILE,
    allowedTools: ["Read", "Grep", "Edit", "Bash", "Agent"],
    argumentHint: "[target]",
    steps: [
      {
        id: "prepare",
        name: "Prepare",
        agent: "general-purpose",
        prompt: "Read the relevant files and prepare a plan for the target: $ARGUMENTS.",
        dependsOn: [],
        checkpoint: true
      },
      {
        id: "execute",
        name: "Execute",
        agent: "worker",
        prompt: "Execute the plan from the prepare step for: $ARGUMENTS.",
        dependsOn: ["prepare"],
        checkpoint: true
      },
      {
        id: "verify",
        name: "Verify",
        agent: "verification",
        prompt: "Verify the changes end to end. End with VERDICT: PASS or VERDICT: FAIL.",
        dependsOn: ["execute"],
        gate: "verification"
      }
    ]
  };
  writeFileSync(join(dir, SKILL_YAML_FILE), stringifySkillYaml(spec));
  writeFileSync(join(dir, SKILL_INSTRUCTIONS_FILE), `# ${name}

Executable skill for ${name}.
`);
  writeFileSync(join(dir, "checklists", "default.md"), `# Default checklist

- [ ] Step completed successfully
`);
  writeFileSync(join(dir, "templates", "output.md"), `# Output template

## Summary

## Details
`);
  return {
    path: dir,
    files: [
      SKILL_YAML_FILE,
      SKILL_INSTRUCTIONS_FILE,
      "scripts/",
      "templates/output.md",
      "checklists/default.md"
    ]
  };
}
function stringifySkillYaml(spec) {
  return import_yaml.stringify(spec);
}
var import_yaml, SKILL_YAML_FILE = "skill.yaml", SKILL_INSTRUCTIONS_FILE = "instructions.md", NAME_RE;
var init_skillSpec = __esm(() => {
  init_json();
  import_yaml = __toESM(require_dist(), 1);
  NAME_RE = /^[a-z0-9][a-z0-9-_]{0,63}$/i;
});

// ../../src/commands/skill/skill.ts
import { join as join2 } from "node:path";
function getSkillRoots(cwd) {
  const user = join2(getURConfigHomeDir(), "skills");
  const project = getProjectDirsUpToHome("skills", cwd);
  return [user, ...project];
}
function notFound(name, available) {
  const hint = available.length > 0 ? `
Available: ${available.join(", ")}` : "";
  return {
    type: "text",
    value: `Skill not found: ${name}${hint}
Create one: ur skill init ${name}`
  };
}
async function findSkill(cwd, name) {
  const roots = getSkillRoots(cwd);
  for (const root of roots) {
    const info = loadSkillDir(root, name);
    if (info)
      return info;
  }
  return null;
}
var call = async (args) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const dryRun = tokens.includes("--dry-run");
  const positional = tokens.filter((token) => !token.startsWith("--"));
  const command = positional[0] ?? "list";
  const name = positional[1];
  const rest = positional.slice(2).join(" ");
  if (command === "list") {
    const roots = getSkillRoots(cwd);
    const all = loadAllSkillDirs(roots);
    if (json) {
      return {
        type: "text",
        value: JSON.stringify({
          skills: all.map((s) => ({
            name: s.name,
            path: s.path,
            description: s.spec.description,
            steps: s.spec.steps.length
          }))
        }, null, 2)
      };
    }
    if (all.length === 0) {
      return { type: "text", value: "No executable skills found. Create one: ur skill init <name>" };
    }
    return {
      type: "text",
      value: `Executable skills:
${all.map((s) => `  - ${s.name}${s.spec.description ? ` — ${s.spec.description}` : ""}`).join(`
`)}`
    };
  }
  if (command === "init") {
    if (!name) {
      return { type: "text", value: "Usage: ur skill init <name>" };
    }
    const projectSkills = getProjectDirsUpToHome("skills", cwd)[0] ?? join2(cwd, ".ur", "skills");
    const dir = join2(projectSkills, name);
    const fs = getFsImplementation();
    try {
      const exists = await fs.stat(dir).then(() => true).catch(() => false);
      if (exists) {
        return {
          type: "text",
          value: `Skill directory already exists: ${dir}
Use --force to overwrite (not yet implemented).`
        };
      }
    } catch (e) {
      if (!isFsInaccessible(e))
        return { type: "text", value: `Error checking ${dir}: ${e}` };
    }
    const result = initSkillDir(dir, name);
    return {
      type: "text",
      value: json ? JSON.stringify(result, null, 2) : `Initialized skill "${name}" at ${result.path}
  ${result.files.join(`
  `)}`
    };
  }
  if (!name) {
    return { type: "text", value: `Usage: ur skill ${command} <name> [args]` };
  }
  const available = listSkillDirs(getSkillRoots(cwd).find((r) => loadSkillDir(r, name)?.name === name) ?? join2(cwd, ".ur", "skills"));
  const info = await findSkill(cwd, name);
  if (!info)
    return notFound(name, available);
  if (command === "show") {
    const workflow = skillToWorkflow(info.spec, rest, {
      skillDir: info.path,
      instructionText: info.files.instructions
    });
    const validation = validateWorkflow(workflow);
    if (json) {
      return {
        type: "text",
        value: JSON.stringify({
          skill: info.name,
          path: info.path,
          files: info.files,
          workflow,
          validation
        }, null, 2)
      };
    }
    return {
      type: "text",
      value: [
        formatSkillStatus(info),
        "",
        `Compiled workflow: ${workflow.name}`,
        workflow.description ? workflow.description : "",
        "",
        `Steps (${workflow.steps.length}):`,
        ...workflow.steps.map((s) => `  ${s.id}: ${s.name} (${s.agent})${s.gate ? ` [${s.gate}]` : ""}${s.checkpoint ? " \uD83D\uDCBE" : ""}`),
        "",
        validation.valid ? "Workflow valid." : `Validation:
${validation.errors.map((e) => `  - ${e}`).join(`
`)}`
      ].filter((line) => line !== "").join(`
`)
    };
  }
  if (command === "run") {
    const workflow = skillToWorkflow(info.spec, rest, {
      skillDir: info.path,
      instructionText: info.files.instructions
    });
    const validation = validateWorkflow(workflow);
    if (!validation.valid) {
      return {
        type: "text",
        value: `Invalid compiled workflow:
${validation.errors.map((e) => `  - ${e}`).join(`
`)}`
      };
    }
    const skipPermissions = tokens.includes("--skip-permissions") || tokens.includes("--dangerously-skip-permissions");
    const maxTurnsValue = Number(tokens[tokens.indexOf("--max-turns") + 1] ?? "30");
    const result = await runWorkflowSpec(workflow, {
      cwd,
      stateName: workflow.name,
      dryRun,
      skipPermissions,
      maxTurns: Number.isFinite(maxTurnsValue) && maxTurnsValue > 0 ? maxTurnsValue : 30
    });
    if (json) {
      return { type: "text", value: JSON.stringify(result, null, 2) };
    }
    const header = dryRun ? `(dry run — no model calls)

` : "";
    return { type: "text", value: `${header}Skill "${name}" finished.
${JSON.stringify(result, null, 2)}` };
  }
  return { type: "text", value: `Unknown skill command: ${command}` };
};
var init_skill = __esm(() => {
  init_runWorkflow();
  init_workflows();
  init_skillSpec();
  init_argumentSubstitution();
  init_cwd();
  init_envUtils();
  init_errors();
  init_fsOperations();
  init_markdownConfigLoader();
});
init_skill();

export {
  call
};
