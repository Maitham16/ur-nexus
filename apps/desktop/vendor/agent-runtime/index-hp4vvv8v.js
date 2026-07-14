import {
  extractVerdict,
  init_cliStepRunner,
  parseHeadlessOutput
} from "./index-zn5x3nwj.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-wred0kdg.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/headlessAgent.ts
function defaultHeadlessRunner() {
  return async (options) => {
    const file = options.bin?.file ?? process.execPath;
    const baseArgs = options.bin?.baseArgs ?? [process.argv[1] ?? ""];
    const args = [...baseArgs, "-p", "--output-format", "json"];
    if (options.maxTurns && options.maxTurns > 0) {
      args.push("--max-turns", String(options.maxTurns));
    }
    if (options.skipPermissions) {
      args.push("--dangerously-skip-permissions");
    }
    args.push(options.prompt);
    const env = options.model ? { ...process.env, UR_MODEL: options.model, OLLAMA_MODEL: options.model } : undefined;
    const result = await execFileNoThrowWithCwd(file, args, {
      cwd: options.cwd,
      timeout: options.timeoutMs ?? 30 * 60 * 1000,
      env,
      preserveOutputOnError: true
    });
    const output = parseHeadlessOutput(result.stdout) || result.stderr || result.error || "";
    return { output, verdict: extractVerdict(output), isError: result.code !== 0 };
  };
}
function makeDryHeadlessRunner() {
  return async (options) => ({
    output: `[dry-run] would run model=${options.model ?? "auto"}:
${options.prompt}`,
    verdict: "PASS",
    isError: false
  });
}
var init_headlessAgent = __esm(() => {
  init_execFileNoThrow();
  init_cliStepRunner();
});

export { defaultHeadlessRunner, makeDryHeadlessRunner, init_headlessAgent };
