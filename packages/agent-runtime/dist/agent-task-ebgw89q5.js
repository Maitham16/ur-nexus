import {
  guardrailFindings,
  init_guardrails,
  loadGuardrails
} from "./index-k2et48pc.js";
import {
  hasBlockingFindings,
  init_selfReview,
  reviewDiff,
  summarizeFindings
} from "./index-azhaz9ta.js";
import"./index-j15w02ww.js";
import"./index-ad9qp29k.js";
import {
  getTaskListId,
  init_tasks,
  listTasks
} from "./index-0g63027x.js";
import"./index-na6pcvfj.js";
import {
  init_argumentSubstitution,
  parseArguments
} from "./index-ke69cyc7.js";
import"./index-3stg8t86.js";
import"./index-mwn5bkf6.js";
import {
  getDefaultBranch,
  gitExe,
  init_git
} from "./index-a9y6sg4d.js";
import {
  execFileNoThrowWithCwd,
  init_execFileNoThrow
} from "./index-dsy9thtk.js";
import {
  getCwd,
  init_cwd
} from "./index-2p1fe0x7.js";
import"./index-abak5acd.js";
import"./index-0x08e9n5.js";
import"./index-2g4gegqj.js";
import"./index-egwqqnxn.js";
import"./index-m9qhxms7.js";
import"./index-bdb5pzbm.js";
import"./index-nhjg91p1.js";
import {
  __esm
} from "./index-8rxa073f.js";

// ../../src/commands/agent-task/agent-task.ts
async function git(args) {
  return execFileNoThrowWithCwd(gitExe(), args, {
    cwd: getCwd(),
    timeout: 1e4,
    preserveOutputOnError: true
  });
}
async function exec(file, args) {
  return execFileNoThrowWithCwd(file, args, {
    cwd: getCwd(),
    timeout: 60000,
    preserveOutputOnError: true
  });
}
async function refExists(ref) {
  const r = await git(["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
  return r.code === 0;
}
async function resolveBaseRef(explicit) {
  const head = (await git(["rev-parse", "--abbrev-ref", "HEAD"])).stdout.trim();
  const candidates = [];
  if (explicit)
    candidates.push(explicit);
  const def = await getDefaultBranch().catch(() => {
    return;
  });
  if (def)
    candidates.push(def, `origin/${def}`);
  candidates.push("origin/HEAD", "main", "master", "origin/main", "origin/master");
  for (const ref of candidates) {
    if (!ref || ref === head)
      continue;
    if (await refExists(ref))
      return ref;
  }
  return;
}
async function getReviewDiff(base) {
  const parts = [];
  const baseRef = await resolveBaseRef(base);
  if (baseRef) {
    const branchDiff = await git(["diff", `${baseRef}...HEAD`]);
    if (branchDiff.code === 0 && branchDiff.stdout.trim()) {
      parts.push(branchDiff.stdout);
    }
  }
  const uncommitted = await git(["diff", "HEAD"]);
  if (uncommitted.code === 0 && uncommitted.stdout.trim()) {
    parts.push(uncommitted.stdout);
  }
  const untracked = await git(["ls-files", "--others", "--exclude-standard"]);
  if (untracked.code === 0 && untracked.stdout.trim()) {
    const files = untracked.stdout.split(`
`).map((s) => s.trim()).filter(Boolean).slice(0, 200);
    for (const file of files) {
      const d = await git(["diff", "--no-index", "--", "/dev/null", file]);
      if (d.stdout.trim()) {
        parts.push(d.stdout);
      }
    }
  }
  return parts.join(`
`);
}
async function getGitStatus() {
  const root = await git(["rev-parse", "--show-toplevel"]);
  if (root.code !== 0) {
    return { isGit: false, error: "Current directory is not a git repository." };
  }
  const [branch, status, diffStat] = await Promise.all([
    git(["branch", "--show-current"]),
    git(["status", "--short"]),
    git(["diff", "--stat"])
  ]);
  return {
    isGit: true,
    branch: branch.stdout.trim() || "detached-head",
    status: status.stdout.trim(),
    diffStat: diffStat.stdout.trim()
  };
}
function countTasks(tasks) {
  return tasks.reduce((counts, task) => {
    counts[task.status] += 1;
    return counts;
  }, { pending: 0, in_progress: 0, completed: 0, failed: 0, skipped: 0 });
}
function formatTaskTable(tasks) {
  if (tasks.length === 0)
    return "No tasks in the current task list.";
  return tasks.map((task) => {
    const owner = task.owner ? ` owner=${task.owner}` : "";
    const blocked = task.blockedBy.length ? ` blockedBy=${task.blockedBy.join(",")}` : "";
    return `- ${task.id} [${task.status}] ${task.subject}${owner}${blocked}`;
  }).join(`
`);
}
async function collectState() {
  const taskListId = getTaskListId();
  const [tasks, gitStatus] = await Promise.all([
    listTasks(taskListId),
    getGitStatus()
  ]);
  return {
    taskListId,
    tasks,
    counts: countTasks(tasks),
    git: gitStatus
  };
}
function formatStatus(state) {
  const lines = [
    "Agent task status",
    `Task list: ${state.taskListId}`,
    `Counts: ${state.counts.pending} pending, ${state.counts.in_progress} in progress, ${state.counts.completed} completed`,
    "",
    formatTaskTable(state.tasks),
    ""
  ];
  if (state.git.isGit) {
    lines.push(`Branch: ${state.git.branch}`);
    lines.push(state.git.status ? `Working tree changes:
${state.git.status}` : "Working tree changes: clean");
  } else {
    lines.push(state.git.error ?? "Git status unavailable.");
  }
  return lines.join(`
`);
}
function formatDiff(gitStatus) {
  if (!gitStatus.isGit)
    return gitStatus.error ?? "Git status unavailable.";
  return [
    `Branch: ${gitStatus.branch}`,
    gitStatus.status ? `Working tree changes:
${gitStatus.status}` : "Working tree changes: clean",
    "",
    gitStatus.diffStat ? `Diff stat:
${gitStatus.diffStat}` : "Diff stat: no unstaged diff"
  ].join(`
`);
}
function formatPrHandoff(state) {
  const lines = ["PR handoff", ""];
  if (!state.git.isGit) {
    lines.push(state.git.error ?? "Git status unavailable.");
    return lines.join(`
`);
  }
  lines.push(`Branch: ${state.git.branch}`);
  lines.push(state.git.status ? `Working tree changes:
${state.git.status}` : "Working tree changes: clean");
  lines.push("");
  lines.push("Suggested commands:");
  lines.push("  git status --short");
  lines.push("  git diff --stat");
  lines.push("  gh pr create --fill");
  lines.push("  ur agent-task pr --create");
  lines.push("");
  lines.push("Task summary:");
  lines.push(formatTaskTable(state.tasks));
  return lines.join(`
`);
}
function option(tokens, name) {
  const index = tokens.indexOf(name);
  if (index === -1)
    return;
  return tokens[index + 1];
}
function positionals(tokens) {
  const flagsWithValue = new Set(["--base", "--title", "--body"]);
  const values = [];
  for (let i = 0;i < tokens.length; i++) {
    const token = tokens[i];
    if (flagsWithValue.has(token)) {
      i++;
      continue;
    }
    if (!token.startsWith("--")) {
      values.push(token);
    }
  }
  return values;
}
function quoteArg(arg) {
  return /^[a-zA-Z0-9_./:=@+-]+$/.test(arg) ? arg : JSON.stringify(arg);
}
function formatPrResult(result) {
  if (result.error)
    return result.error;
  const lines = [
    result.dryRun ? "PR dry run" : result.created ? "PR created" : `PR create failed with exit ${result.exitCode ?? "unknown"}`,
    `Command: ${result.command.map(quoteArg).join(" ")}`
  ];
  if (result.stdout?.trim())
    lines.push(`Stdout:
${result.stdout.trim()}`);
  if (result.stderr?.trim())
    lines.push(`Stderr:
${result.stderr.trim()}`);
  return lines.join(`
`);
}
async function createPr(state, tokens) {
  if (!state.git.isGit) {
    return {
      created: false,
      dryRun: false,
      command: [],
      error: state.git.error ?? "Current directory is not a git repository."
    };
  }
  if (!state.git.branch || state.git.branch === "detached-head") {
    return {
      created: false,
      dryRun: false,
      command: [],
      error: "Cannot create a PR from detached HEAD. Check out a branch first."
    };
  }
  const args = ["pr", "create"];
  const title = option(tokens, "--title");
  const body = option(tokens, "--body");
  const base = option(tokens, "--base");
  if (title)
    args.push("--title", title);
  if (body)
    args.push("--body", body);
  if (base)
    args.push("--base", base);
  if (tokens.includes("--draft"))
    args.push("--draft");
  if (!title && !body)
    args.push("--fill");
  const command = ["gh", ...args];
  if (tokens.includes("--dry-run")) {
    return { created: false, dryRun: true, command };
  }
  const gh = await exec("gh", ["--version"]);
  if (gh.code !== 0) {
    return {
      created: false,
      dryRun: false,
      command,
      error: "GitHub CLI is not available. Install `gh` or use the printed handoff command.",
      stderr: gh.stderr
    };
  }
  const result = await exec("gh", args);
  return {
    created: result.code === 0,
    dryRun: false,
    command,
    exitCode: result.code,
    stdout: result.stdout,
    stderr: result.stderr || result.error
  };
}
var call = async (args) => {
  const tokens = parseArguments(args);
  const json = tokens.includes("--json");
  const positional = positionals(tokens);
  const command = positional[0] ?? "status";
  const state = await collectState();
  if (command === "pr" && tokens.includes("--create")) {
    let review;
    if (!tokens.includes("--no-review")) {
      const diff = await getReviewDiff(option(tokens, "--base"));
      review = [...reviewDiff(diff), ...guardrailFindings(diff, loadGuardrails(getCwd()))];
      if (hasBlockingFindings(review) && !tokens.includes("--force")) {
        const summary = summarizeFindings(review);
        return {
          type: "text",
          value: json ? JSON.stringify({ state, review, prCreated: false, blocked: true }, null, 2) : `PR creation blocked by self-review.

${summary}

Fix these issues, or re-run with --force to override or --no-review to skip.`
        };
      }
    }
    const pr = await createPr(state, tokens);
    if (json) {
      return {
        type: "text",
        value: JSON.stringify({ state, review, pr }, null, 2)
      };
    }
    const reviewText = review && review.length > 0 ? `${summarizeFindings(review)}

` : "";
    return { type: "text", value: `${reviewText}${formatPrResult(pr)}` };
  }
  if (json) {
    return { type: "text", value: JSON.stringify(state, null, 2) };
  }
  if (command === "status") {
    return { type: "text", value: formatStatus(state) };
  }
  if (command === "diff") {
    return { type: "text", value: formatDiff(state.git) };
  }
  if (command === "pr") {
    return { type: "text", value: formatPrHandoff(state) };
  }
  return {
    type: "text",
    value: `Usage: ur agent-task status|diff|pr [--json]
       ur agent-task pr --create [--draft] [--base main] [--title text] [--body text] [--dry-run]
       (pr --create runs a self-review gate first; use --force to override blocking findings or --no-review to skip)`
  };
};
var init_agent_task = __esm(() => {
  init_execFileNoThrow();
  init_cwd();
  init_git();
  init_tasks();
  init_argumentSubstitution();
  init_selfReview();
  init_guardrails();
});
init_agent_task();

export {
  call
};
