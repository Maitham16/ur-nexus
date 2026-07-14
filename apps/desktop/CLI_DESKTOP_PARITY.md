# CLI ↔ Desktop Capability Parity

Audit date: 2026-07-14 (release update) (desktop 1.0.3, runtime bundle 1.0.3, CLI source `src/` at monorepo root).

The desktop app is standalone: it vendors the agent runtime as a prebuilt local
bundle (`vendor/agent-runtime`, declared as `file:./vendor/agent-runtime` in
`package.json`). It never imports monorepo paths, never shells out to a global
`ur` command, and carries its own IPC/permission/UI layers in
`src/main`, `src/preload`, `src/renderer`, `src/shared`.

Legend — **Status**: ✅ working end-to-end · 🟡 working with noted limits · ❌ not implemented.

| CLI capability | CLI source | Desktop implementation | Desktop UI | Runtime/API used | Status | Missing behavior | Tests |
|---|---|---|---|---|---|---|---|
| Prompt execution | `src/QueryEngine.ts`, `src/query.ts` | `runtime.ts → runPromptStream()` consumes vendored `runPrompt()`; events streamed over `runtime:event` | Chat | `@ur/agent-runtime` `createSession`/`runPrompt` | ✅ | — | `ipcRegistry.test.ts`, `runtime.approval.test.ts` |
| Chat sessions | `src/screens/repl`, session store | `startRun()` creates a runtime session per chat; follow-up messages reuse the session | Chat | `createSession(project, {sessionId, canUseTool})` | ✅ | Named multi-chat tabs (single active session per window) | smoke + registry tests |
| Planning | `src/services/promptPlanning` | `planning.ts`: shouldPlan heuristic, structured plan generation via real model run, placeholder-plan rejection, editable review, scheduler-driven execution | Chat Plan mode (review/edit/start), live task board | real model run + TaskScheduler | ✅ | — | `planning.test.ts` (12) |
| Task creation/updates | `src/tasks.ts`, `src/tools/TaskCreateTool…TaskUpdateTool` | `taskAgentRegistry.ts` + `executeToolLocal` TaskCreate/TaskUpdate/TaskList mapping | Tasks page, Chat context | local registry + tool events | ✅ | Cross-session task persistence | registry tests |
| Multi-agent execution | `src/services/agents`, `src/coordinator` | `agents/scheduler.ts`: dependency-aware, concurrency-capped, file-target locks, FIFO fairness, retries, cancellation propagation, deterministic transitions | Agents page, plan execution, task board | TaskScheduler + real agent runs | ✅ | — | `scheduler.test.ts` (11 incl. stress) |
| Background agents | `src/commands/bg`, background tasks | `agents/backgroundAgents.ts`: queued/running real runs detached from chat, unique ids, lifecycle events, logs/results/changed files, cancel/retry, persistence + startup interruption reconcile | Agents page (launch, list, detail, cancel, retry) | scheduler + real runtime runs | ✅ | Records survive restart; live processes do not (marked interrupted) | `backgroundAgents.test.ts` (5, live model) |
| File reading | `src/tools/FileReadTool` | `file:read` IPC → `readProjectFile()` (worktree-scoped, safety-evaluated in tool path) | Chat tools, Files preview | Node fs + safety service | ✅ | — | registry validation tests |
| File writing | `src/tools/FileWriteTool` | `executeToolLocal('Write')` with `evaluateFileWrite` + approval | Chat tools | Node fs + safety service | ✅ | — | `safetyService.test.ts` |
| File editing | `src/tools/FileEditTool` | `proposeEdit()` (real unified diff + base hashes); `diffs.ts` per-hunk accept/reject/revert with stale detection; `patch:apply` via `git apply` | Chat diff cards (per-hunk controls), Changes page | git + runtime | ✅ | — | `unifiedDiff.test.ts`, `diffs.test.ts` (13) |
| Glob | `src/tools/GlobTool` | `globProjectFiles()` dependency-free walker (Electron's Node 20 lacks fs.glob) | Chat tools | Node fs | ✅ | — | `glob.test.ts` (5) |
| Grep | `src/tools/GrepTool` | `search.ts`: dependency-managed ripgrep (`@vscode/ripgrep`, asar-unpacked) + tested internal fallback; regex/fixed, case, include/exclude globs, .gitignore, structured file/line/column | Files page content search, Grep tool | ripgrep binary or internal engine | ✅ | — | `search.test.ts` (16, both engines) |
| Terminal/Bash | `src/tools/BashTool`, `src/utils/bash` | `shellRunner.ts` (node-pty) + `terminalManager.ts` (classification: destructive/network/package/outside-workspace) | Terminal page, Chat command blocks | node-pty + safety service | ✅ | PTY resize/interactive input | covered via runtime paths |
| Test runner | `src/tools/TestRunnerTool` | `testRunner.ts`: framework detection (bun/jest/vitest/pytest/go/mocha), structured counts + failing tests, rerun-failed command synthesis, runtime-failure distinction | Terminal → Tests tab | shell runner + parsers | ✅ | — | `testRunner.test.ts` (12) |
| Git operations | `src/tools/GitHubTool`, git utils | `explorer.ts`: `git status --porcelain`, `git diff`, `git checkout --`, `git check-ignore` | Changes page, Files page | git CLI | ✅ | Commit/push/PR flows (deliberately out of scope for review UI) | `explorer.test.ts` |
| Worktrees | `src/tools/EnterWorktreeTool`/`ExitWorktreeTool` | `worktreeManager.ts` + `EnterWorktree`/`ExitWorktree` tool mapping + per-run isolated worktrees | Chat (worktree toggle), Projects | git worktree | ✅ | — | runtime tests |
| Project instructions | `UR.md`/`UR.local.md` loading in `src/context.ts` | Vendored `openProject()` loads project instructions into the session | Chat (implicit), Projects page shows presence | `@ur/agent-runtime` | ✅ | — | — |
| Permissions | `src/services/safety`, `src/security` | `safetyService.ts` (526 lines: tool/shell/file/network/long-running/sensitive-path evaluation) + vendored policy helpers | Approval cards, Settings policy editor | local + `loadProjectSafetyPolicy` | ✅ | — | `safetyService.test.ts` |
| Approval requests | permission prompts in REPL | `requestApproval()` (run-scoped, cached scopes, 5-min timeout) + native dialog for standalone ops + approval log | Chat approval cards, Terminal approvals tab | IPC events + Electron dialog | ✅ | — | `runtime.approval.test.ts` |
| Safety rules | `src/services/guardrails`, policy files | `.ur/safety-policy.json` read/write (`safety:policy:get/set`), deny/ask rules, macOS sensitive dirs | Settings | safety service | ✅ | — | `safetyService.test.ts` |
| Verification | `src/services/verifier` | Verification events per task (`verification_completed`, L1) plus plan-task verification steps defined and shown per task | Tasks page, Chat, Plan cards | task registry + plans | 🟡 | L2 deep verification pipeline | — |
| Provider/model selection | `src/services/providers` | `providerService.ts`: 7 provider kinds, Keychain-backed keys, model discovery, connection tests, activation. Config is **global** (works with no project open); Settings + Chat auto-discover the live model list on load | Settings, Chat header | vendored provider registry | ✅ | — | `globalProviders.test.ts`, registry tests |
| Streaming responses | `src/QueryEngine.ts` streaming | `model_stream` deltas over `runtime:event` broadcast | Chat | runtime events | ✅ | — | — |
| MCP | `src/services/mcp`, MCP tools | `connectorService.ts` (stdio/sse/http/ws, test, tools listing, tool calls) + `mcp:*` channels | MCP page | `@modelcontextprotocol/sdk` | ✅ | OAuth-authenticated remote servers | — |
| Session history | `src/history.ts` | `historyStore.ts` (run records + JSONL transcripts in Application Support) | History page | local store | ✅ | — | via history flows |
| Checkpoints | `src/commands/rewind`, file history | `checkpoints.ts`: snapshots at before-tool/before-edit/after-edit/task-completed/before-agent/manual boundaries with session/task/git metadata; preview, approval-gated rewind, safety checkpoint (branched timeline), audit log | Checkpoints panel (History + Chat button) | local snapshot store | ✅ | — | `checkpoints.test.ts` (6 incl. rewind round-trip) |
| Cancel/pause/resume | REPL controls | `run:stop/pause/resume` + `sessions/runState.ts` incremental persistence, startup interruption reconcile, `sessions/resume.ts` continuation without repeating completed side-effect tools | Chat Stop/Pause/Resume + interrupted-run banner (Resume / Mark failed / Archive) | runtime + persisted state | ✅ | Resume starts a fresh session at a safe boundary with replayed context | `resume.test.ts` (5 incl. live end-to-end) |
| Context files | `@file` mentions, context pack | `contextFiles.ts`: validated attachments (missing/dir/oversize/binary/unreadable), re-read at send, fenced blocks | Chat attach + chips, Files "+ctx" | local validation | ✅ | Security-scoped bookmarks (not needed: no sandbox entitlement) | `contextFiles.test.ts` |
| Reports | `src/commands/export`, run reports | `reportBuilder.ts` + `report:markdown/json/get`; export reveals in Finder | History page, Chat Export | local builder from transcripts | ✅ | — | — |
| Usage/cost metadata | `src/cost-tracker.ts` | `usage.ts`: per-message accumulation, authoritative final `result` usage + provider cost, dated pricing table (user-overridable at `~/.ur/desktop/pricing.json`), estimates labeled, no fabricated cost for local providers; persisted to history | Chat header usage badge (live), History details | runtime events + pricing config | ✅ | — | `usage.test.ts` (9) |

## Known gaps (explicit)

1. **L2 deep verification** is not implemented; verification remains L1
   (per-task result events) plus plan-defined verification steps.
2. Resumed sessions continue in a **fresh runtime session** with replayed
   context and a completed-actions ledger; the exact in-memory engine state
   of the interrupted process is not rehydrated (it no longer exists).
3. The interrupted **worktree** of a resumed run is preserved on disk and
   referenced in run state, but the continuation executes in the main
   workspace.
4. **Plan generation quality is model-dependent**: the pipeline runs a real
   model and strictly validates the response; models that fail to emit the
   JSON contract produce a clear `PlanParseError` in the UI (never a
   fabricated placeholder plan), and slow cloud models can take minutes.

Everything else in the required audit list is wired end-to-end:
renderer → validated preload IPC → main-process handler → real runtime/OS
call → structured `runtime:event` stream back to the renderer.
