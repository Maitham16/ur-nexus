import {
  init_selfReview,
  reviewDiff
} from "./index-azhaz9ta.js";
import {
  init_learning,
  recordOutcome
} from "./index-qg6cjfb3.js";
import"./index-5jrgxedg.js";
import {
  defaultHeadlessRunner,
  init_headlessAgent,
  makeDryHeadlessRunner
} from "./index-hp4vvv8v.js";
import"./index-zn5x3nwj.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-f6z7dc9t.js";
import"./index-wxsgjqjk.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-wred0kdg.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-9xfq6h4s.js";
import"./index-0x08e9n5.js";
import"./index-4bphgmcc.js";
import"./index-m9qhxms7.js";
import"./index-5h7w9qkc.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/services/agents/arena.ts
import {
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { join } from "node:path";
function countChangedLines(diff) {
  let count = 0;
  for (const line of diff.split(`
`)) {
    if ((line.startsWith("+") || line.startsWith("-")) && !line.startsWith("+++") && !line.startsWith("---")) {
      count++;
    }
  }
  return count;
}
function scoreCandidate(candidate) {
  const findings = reviewDiff(candidate.diff);
  const blocking = findings.filter((f) => f.severity === "block").length;
  const warnings = findings.filter((f) => f.severity === "warn").length;
  const changedLines = countChangedLines(candidate.diff);
  const reasons = [];
  let score = 0;
  if (candidate.isError) {
    score -= 10;
    reasons.push("run errored");
  }
  if (candidate.verdict === "PASS") {
    score += 5;
    reasons.push("verdict PASS");
  } else if (candidate.verdict === "PARTIAL") {
    score += 1;
    reasons.push("verdict PARTIAL");
  } else if (candidate.verdict === "FAIL") {
    score -= 5;
    reasons.push("verdict FAIL");
  }
  if (changedLines === 0) {
    score -= 6;
    reasons.push("empty diff (no change)");
  } else {
    score += 2;
    reasons.push(`${changedLines} changed lines`);
  }
  if (blocking > 0) {
    score -= 8 * Math.min(blocking, 3);
    reasons.push(`${blocking} blocking finding(s)`);
  }
  if (warnings > 0) {
    score -= warnings;
    reasons.push(`${warnings} warning(s)`);
  }
  score -= changedLines * 0.001;
  return {
    ...candidate,
    score: Number(score.toFixed(3)),
    changedLines,
    blocking,
    warnings,
    reasons
  };
}
function judge(candidates) {
  const ranked = candidates.map(scoreCandidate).sort((a, b) => b.score - a.score);
  const winner = ranked.find((c) => !c.isError && c.changedLines > 0) ?? ranked[0] ?? null;
  return { ranked, winner: winner ?? null };
}
async function git(cwd, args) {
  return execFileNoThrowWithCwd("git", args, {
    cwd,
    timeout: 60000,
    preserveOutputOnError: true
  });
}
async function ensureWorktree(cwd, runId, id) {
  const root = join(cwd, ".ur", "arena", ".worktrees");
  const path = join(root, `${runId}-${id}`);
  const branch = `ur/arena/${runId}/${id}`;
  if (existsSync(path))
    return path;
  mkdirSync(root, { recursive: true });
  const result = await git(cwd, ["worktree", "add", "-b", branch, path]);
  return result.code === 0 ? path : null;
}
async function captureDiff(worktree) {
  await git(worktree, ["add", "-A"]);
  const diff = await git(worktree, ["diff", "--cached"]);
  return diff.code === 0 ? diff.stdout : "";
}
async function removeWorktree(cwd, worktree) {
  await git(cwd, ["worktree", "remove", "--force", worktree]);
}
async function runArena(task, options) {
  const cwd = options.cwd;
  const agents = Math.max(2, options.agents ?? 3);
  const runner = options.runner ?? (options.dryRun ? makeDryHeadlessRunner() : defaultHeadlessRunner());
  const runId = Date.now().toString(36);
  const prompt = `${task}

Implement this fully and correctly. Make focused changes. End your reply with VERDICT: PASS or VERDICT: FAIL.`;
  const ids = Array.from({ length: agents }, (_, i) => `c${i + 1}`);
  const candidates = await Promise.all(ids.map(async (id, index) => {
    const model = options.models?.[index];
    options.onEvent?.({ kind: "start", id, model });
    let worktree;
    let workCwd = cwd;
    if (!options.dryRun && !options.runner) {
      const wt = await ensureWorktree(cwd, runId, id);
      if (wt) {
        worktree = wt;
        workCwd = wt;
      }
    }
    const out = await runner({
      cwd: workCwd,
      prompt,
      model,
      maxTurns: options.maxTurns,
      skipPermissions: options.skipPermissions
    });
    const diff = worktree && !options.dryRun ? await captureDiff(worktree) : "";
    options.onEvent?.({ kind: "done", id, verdict: out.verdict ?? null, isError: !!out.isError });
    return {
      id,
      model,
      worktree,
      diff,
      output: out.output,
      verdict: out.verdict ?? null,
      isError: !!out.isError
    };
  }));
  const { ranked, winner } = judge(candidates);
  let applied = false;
  if (options.apply && winner && winner.diff.trim() && !options.dryRun) {
    const patch = join(cwd, ".ur", "arena", `${runId}-winner.patch`);
    mkdirSync(join(cwd, ".ur", "arena"), { recursive: true });
    writeFileSync(patch, winner.diff);
    const result = await git(cwd, ["apply", "--3way", patch]);
    applied = result.code === 0;
    if (applied)
      options.onEvent?.({ kind: "applied", id: winner.id });
    rmSync(patch, { force: true });
  }
  if (!options.keep && !options.dryRun && !options.runner) {
    for (const candidate of candidates) {
      if (candidate.worktree)
        await removeWorktree(cwd, candidate.worktree);
    }
  }
  if (!options.dryRun) {
    for (const candidate of candidates) {
      const isWinner = winner?.id === candidate.id;
      const judgedFail = candidate.isError || candidate.verdict === "FAIL";
      if (!isWinner && !judgedFail)
        continue;
      recordOutcome(cwd, {
        id: `arena-${runId}-${candidate.id}`,
        task,
        model: candidate.model ?? null,
        pass: isWinner && !judgedFail,
        detail: `arena ${isWinner ? "winner" : "failed candidate"}: ${task.slice(0, 80)}`
      });
    }
  }
  return { task: task.trim(), agents, candidates: ranked, winner, applied };
}
function formatArenaResult(result, json) {
  if (json)
    return JSON.stringify(result, null, 2);
  const lines = [
    `Arena: ${result.task}`,
    `Agents: ${result.agents}   Winner: ${result.winner?.id ?? "none"}${result.applied ? " (applied)" : ""}`,
    "",
    "Ranking:"
  ];
  for (const c of result.candidates) {
    const flag = c === result.winner ? "★" : " ";
    lines.push(`${flag} ${c.id} [${c.model ?? "auto"}]  score ${c.score}  (${c.reasons.join(", ")})`);
  }
  if (result.winner && !result.applied && result.winner.diff.trim()) {
    lines.push("", 'Apply the winner with: ur arena "<task>" --apply');
  }
  return lines.join(`
`);
}
var init_arena = __esm(() => {
  init_execFileNoThrow();
  init_selfReview();
  init_headlessAgent();
  init_learning();
});

// ../../src/commands/arena/arena.ts
function option(tokens, name) {
  const index = tokens.indexOf(name);
  return index === -1 ? undefined : tokens[index + 1];
}
function freeText(tokens) {
  const withValue = new Set(["--agents", "--max-turns", "--models"]);
  const parts = [];
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (withValue.has(token)) {
      i++;
      continue;
    }
    if (token.startsWith("--"))
      continue;
    parts.push(token);
  }
  return parts.join(" ").trim();
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const task = freeText(tokens);
  if (!task) {
    return {
      type: "text",
      value: 'Usage: ur arena "<task>" [--agents N] [--apply] [--keep] [--dry-run] [--max-turns N] [--skip-permissions] [--json]'
    };
  }
  const agentsRaw = option(tokens, "--agents");
  const maxTurnsRaw = option(tokens, "--max-turns");
  const models = option(tokens, "--models")?.split(",").map((m) => m.trim() || undefined);
  const events = [];
  const result = await runArena(task, {
    cwd: getCwd(),
    agents: agentsRaw ? Number(agentsRaw) : undefined,
    models,
    dryRun: tokens.includes("--dry-run"),
    apply: tokens.includes("--apply"),
    keep: tokens.includes("--keep"),
    skipPermissions: tokens.includes("--skip-permissions"),
    maxTurns: maxTurnsRaw ? Number(maxTurnsRaw) : undefined,
    onEvent: (event) => {
      if (event.kind === "done") {
        events.push(`  ${event.id}: ${event.isError ? "error" : event.verdict ?? "no verdict"}`);
      }
    }
  });
  const trace = !json && events.length ? `

Runs:
${events.join(`
`)}` : "";
  return { type: "text", value: `${formatArenaResult(result, json)}${trace}` };
};
var init_arena2 = __esm(() => {
  init_arena();
  init_argumentSubstitution();
  init_cwd();
});
init_arena2();

export {
  call
};
