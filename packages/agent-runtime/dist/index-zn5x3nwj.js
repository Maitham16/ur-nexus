import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-wred0kdg.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/cliStepRunner.ts
function extractVerdict(text) {
  const match = VERDICT_RE.exec(text);
  return match ? match[1].toUpperCase() : null;
}
function compileStepPrompt(input) {
  let prompt = input.step.prompt;
  for (const [depId, output] of Object.entries(input.priorOutputs)) {
    prompt = prompt.replaceAll(`{{${depId}}}`, output);
  }
  const joinedPrior = Object.values(input.priorOutputs).join(`

`);
  prompt = prompt.replaceAll("{{prior}}", joinedPrior);
  prompt = prompt.replace(/\{\{[a-z0-9_-]+\}\}/gi, "").trim();
  if (input.feedback) {
    prompt += `

Reviewer feedback from the previous iteration — address it directly:
${input.feedback}`;
  }
  return prompt;
}
function parseHeadlessOutput(stdout) {
  const trimmed = stdout.trim();
  if (!trimmed)
    return "";
  try {
    const parsed = JSON.parse(trimmed);
    return pickResultText(parsed) ?? trimmed;
  } catch {
    return trimmed;
  }
}
function pickResultText(parsed) {
  if (parsed == null)
    return null;
  if (typeof parsed === "string")
    return parsed;
  if (Array.isArray(parsed)) {
    for (let i = parsed.length - 1;i >= 0; i--) {
      const found = pickResultText(parsed[i]);
      if (found)
        return found;
    }
    return null;
  }
  if (typeof parsed === "object") {
    const obj = parsed;
    if (typeof obj.result === "string")
      return obj.result;
    if (typeof obj.text === "string")
      return obj.text;
    if (typeof obj.content === "string")
      return obj.content;
  }
  return null;
}
function makeCliStepRunner(options) {
  return async (input) => {
    const prompt = compileStepPrompt(input);
    const file = options.bin?.file ?? process.execPath;
    const baseArgs = options.bin?.baseArgs ?? [process.argv[1] ?? ""];
    const args = [...baseArgs, "-p", "--output-format", "json"];
    if (options.maxTurns && options.maxTurns > 0) {
      args.push("--max-turns", String(options.maxTurns));
    }
    if (options.skipPermissions) {
      args.push("--dangerously-skip-permissions");
    }
    args.push(prompt);
    const result = await execFileNoThrowWithCwd(file, args, {
      cwd: options.cwd,
      timeout: options.timeoutMs ?? 30 * 60 * 1000,
      preserveOutputOnError: true
    });
    const output = parseHeadlessOutput(result.stdout) || result.stderr || result.error || "";
    return {
      output,
      verdict: extractVerdict(output),
      isError: result.code !== 0
    };
  };
}
function makeDryRunner() {
  return async (input) => {
    const prompt = compileStepPrompt(input);
    return {
      output: `[dry-run] ${input.step.agent} would run:
${prompt}`,
      verdict: input.step.gate === "verification" ? "PASS" : null,
      isError: false
    };
  };
}
var VERDICT_RE;
var init_cliStepRunner = __esm(() => {
  init_execFileNoThrow();
  VERDICT_RE = /\bVERDICT:\s*(PASS|FAIL|PARTIAL)\b/i;
});

export { extractVerdict, parseHeadlessOutput, makeCliStepRunner, makeDryRunner, init_cliStepRunner };
