import {
  init_json,
  safeParseJSON
} from "./index-mwn5bkf6.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/execTarget.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
function isContainerized(config) {
  return config.kind !== "local";
}
function buildDockerArgs(config, command, cwd) {
  const workdir = config.workdir ?? "/workspace";
  const argv = ["run", "--rm", "-i"];
  if (!config.network)
    argv.push("--network", "none");
  argv.push("-v", `${cwd}:${workdir}`, "-w", workdir);
  for (const mount of config.mounts ?? [])
    argv.push("-v", mount);
  for (const name of config.env ?? [])
    argv.push("-e", name);
  argv.push(config.image ?? "ubuntu:22.04");
  argv.push(command.file, ...command.args);
  return argv;
}
function wrapCommand(config, command, cwd) {
  if (!isContainerized(config))
    return command;
  return { file: "docker", args: buildDockerArgs(config, command, cwd) };
}
function configPath(cwd) {
  return join(cwd, ".ur", "devcontainer.json");
}
function readDevcontainerImage(cwd) {
  const path = join(cwd, ".devcontainer", "devcontainer.json");
  if (!existsSync(path))
    return;
  const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
  if (parsed && typeof parsed === "object" && typeof parsed.image === "string") {
    return parsed.image;
  }
  return;
}
function resolveExecTarget(cwd, env = process.env) {
  const envKind = (env.UR_EXEC_TARGET || "").trim().toLowerCase();
  if (envKind === "docker" || envKind === "devcontainer") {
    return {
      kind: envKind,
      image: env.UR_EXEC_IMAGE || readDevcontainerImage(cwd),
      network: env.UR_EXEC_NETWORK === "1" || env.UR_EXEC_NETWORK === "true"
    };
  }
  if (envKind === "local")
    return { kind: "local" };
  const path = configPath(cwd);
  if (existsSync(path)) {
    const parsed = safeParseJSON(readFileSync(path, "utf-8"), false);
    if (parsed && typeof parsed === "object") {
      const config = parsed;
      if (config.kind === "devcontainer" && !config.image) {
        config.image = readDevcontainerImage(cwd);
      }
      if (config.kind === "local" || config.kind === "docker" || config.kind === "devcontainer") {
        return config;
      }
    }
  }
  return { kind: "local" };
}
function defaultExecTargetConfig(image = "node:22-bookworm") {
  return { kind: "docker", image, workdir: "/workspace", network: false, env: [] };
}
function scaffoldExecTarget(cwd, options = {}) {
  const path = configPath(cwd);
  mkdirSync(join(cwd, ".ur"), { recursive: true });
  if (existsSync(path) && options.force !== true)
    return { path, created: false };
  writeFileSync(path, `${JSON.stringify(defaultExecTargetConfig(options.image), null, 2)}
`);
  return { path, created: true };
}
function formatExecTarget(config) {
  if (!isContainerized(config)) {
    return "Execution target: local (host). Enable a container with `ur devcontainer init`.";
  }
  return [
    `Execution target: ${config.kind}`,
    `  image:   ${config.image ?? "(unset)"}`,
    `  workdir: ${config.workdir ?? "/workspace"}`,
    `  network: ${config.network ? "on" : "isolated (none)"}`,
    config.mounts?.length ? `  mounts:  ${config.mounts.join(", ")}` : ""
  ].filter(Boolean).join(`
`);
}
var init_execTarget = __esm(() => {
  init_json();
});

export { isContainerized, wrapCommand, resolveExecTarget, scaffoldExecTarget, formatExecTarget, init_execTarget };
