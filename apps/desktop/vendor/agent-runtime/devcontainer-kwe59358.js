import {
  formatExecTarget,
  init_execTarget,
  isContainerized,
  resolveExecTarget,
  scaffoldExecTarget,
  wrapCommand
} from "./index-tq3vvaz3.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-skb7s3mf.js";
import"./index-s5dp14ed.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-0r3wd4mq.js";
import {
  getCwd,
  init_cwd
} from "./index-b5f4m7g4.js";
import"./index-h7h0j06f.js";
import"./index-7h9ddexs.js";
import"./index-f80dj2bz.js";
import"./index-vpczjthp.js";
import"./index-t784n9jz.js";
import"./index-93rq225h.js";
import {
  __esm
} from "./index-8rxa073f.js";

// src/commands/devcontainer/devcontainer.ts
function optionValue(tokens, flag) {
  const index = tokens.indexOf(flag);
  return index >= 0 ? tokens[index + 1] : undefined;
}
function usage() {
  return [
    "Usage:",
    "  ur devcontainer status [--json]",
    "  ur devcontainer init [--image <ref>] [--force]",
    "  ur devcontainer exec -- <command...> [--dry-run]",
    "",
    "Routes command execution through a reproducible container (opt-in).",
    "Configure via .ur/devcontainer.json or UR_EXEC_TARGET / UR_EXEC_IMAGE.",
    "`ci-loop` automatically honors the configured target."
  ].join(`
`);
}
var call = async (args) => {
  const cwd = getCwd();
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const action = tokens.find((token) => !token.startsWith("--")) ?? "status";
  if (action === "help")
    return { type: "text", value: usage() };
  if (action === "init") {
    const result = scaffoldExecTarget(cwd, {
      force: tokens.includes("--force"),
      image: optionValue(tokens, "--image")
    });
    return {
      type: "text",
      value: result.created ? `Created ${result.path}. Edit "image" and run \`ur devcontainer status\`.` : `Kept existing ${result.path} (use --force to overwrite).`
    };
  }
  if (action === "status") {
    const config = resolveExecTarget(cwd);
    return {
      type: "text",
      value: json ? JSON.stringify(config, null, 2) : formatExecTarget(config)
    };
  }
  if (action === "exec" || action === "run") {
    const config = resolveExecTarget(cwd);
    const sepIndex = tokens.indexOf("--");
    const rawParts = sepIndex >= 0 ? tokens.slice(sepIndex + 1) : tokens.filter((t) => t !== action && !t.startsWith("--"));
    if (rawParts.length === 0)
      return { type: "text", value: usage() };
    const wrapped = wrapCommand(config, { file: rawParts[0], args: rawParts.slice(1) }, cwd);
    if (tokens.includes("--dry-run")) {
      return {
        type: "text",
        value: `target: ${config.kind}
` + `would run: ${wrapped.file} ${wrapped.args.join(" ")}`
      };
    }
    if (!isContainerized(config)) {
      return {
        type: "text",
        value: "Execution target is local; nothing to isolate. Run the command directly, " + "or configure a container with `ur devcontainer init`."
      };
    }
    const run = await execFileNoThrowWithCwd(wrapped.file, wrapped.args, {
      cwd,
      timeout: 30 * 60 * 1000,
      preserveOutputOnError: true
    });
    const body = `${run.stdout}
${run.stderr}`.trim();
    return {
      type: "text",
      value: `exit ${run.code}${body ? `

${body}` : ""}`
    };
  }
  return { type: "text", value: usage() };
};
var init_devcontainer = __esm(() => {
  init_execFileNoThrow();
  init_execTarget();
  init_argumentSubstitution();
  init_cwd();
});
init_devcontainer();

export {
  call
};
