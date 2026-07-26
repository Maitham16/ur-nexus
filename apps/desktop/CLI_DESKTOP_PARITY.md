# CLI ↔ Desktop Capability Parity

Audit date: 2026-07-26 (release update) (desktop 1.1.0, runtime bundle 1.0.4, CLI source `src/` at monorepo root).

The desktop app is standalone: it vendors the agent runtime as a prebuilt local
bundle (`vendor/agent-runtime`, declared as `file:./vendor/agent-runtime` in
`package.json`). It never imports monorepo paths, never shells out to a global
`ur` command, and carries its own IPC/permission/UI layers in
`src/main`, `src/preload`, `src/renderer`, `src/shared`.

Legend — **Status**: ✅ working end-to-end · 🟡 working with noted limits · ❌ not implemented.

| CLI capability | CLI source | Desktop implementation | Desktop UI | Runtime/API used | Status | Missing behavior | Tests |
|---|---|---|---|---|---|---|---|
| Prompt execution | `src/QueryEngine.ts`, `src/query.ts` | `runtime.ts → runPromptStream()` consumes vendored `runPrompt()`; events streamed over `runtime:event` | Chat | `@ur/agent-runtime` `createSession`/`runPrompt` | ✅ | — | `ipcRegistry.test.ts`, `runtime.approval.test.ts` |
| Slash commands and skills | `src/commands.ts`, project/plugin/workflow registries | Runtime sessions receive `getCommands(projectRoot)` and the renderer loads the same live catalog over `slash-commands:list`; desktop-native routes override CLI-only TUI dialogs | Chat `/` palette | shared command registry + `QueryEngine` slash processing | ✅ | — | `slashCommands.test.ts`, `runtime.e2e.test.ts` |
| Chat sessions | `src/screens/repl`, session store | `startRun()` creates a runtime session per chat; `sessions/chatSessions.ts` adds named, ordered, persisted sessions with one-run-per-session binding; `ChatTabs` + `useChatSessions` give a tab strip with create, switch, inline rename, close-to-archive, drag reorder, and per-tab conversation snapshots | Chat tab strip | `createSession(project, {sessionId, canUseTool})` + chat session store + `chat-session:*` IPC | ✅ | — | `chatSessions.test.ts` (24) |
| Planning | `src/services/promptPlanning` | `planning.ts`: shouldPlan heuristic, structured plan generation via real model run, placeholder-plan rejection, editable review, scheduler-driven execution | Chat Plan mode (review/edit/start), live task board | real model run + TaskScheduler | ✅ | — | `planning.test.ts` (12) |
| Task creation/updates | `src/tasks.ts`, `src/tools/TaskCreateTool…TaskUpdateTool` | `taskAgentRegistry.ts` + `executeToolLocal` TaskCreate/TaskUpdate/TaskList mapping; `taskStore.ts` checkpoints tasks at terminal transitions and on verification, reconciling abandoned `running` records to `interrupted` on load | Tasks page, Chat context | local registry + tool events + task store | ✅ | — | registry tests, `taskStore.test.ts` (15) |
| Multi-agent execution | `src/services/agents`, `src/coordinator` | `agents/scheduler.ts`: dependency-aware, concurrency-capped, file-target locks, FIFO fairness, retries, cancellation propagation, deterministic transitions | Agents page, plan execution, task board | TaskScheduler + real agent runs | ✅ | — | `scheduler.test.ts` (11 incl. stress) |
| Background agents | `src/commands/bg`, background tasks | `agents/backgroundAgents.ts`: queued/running real runs detached from chat, unique ids, lifecycle events, logs/results/changed files, cancel/retry, persistence + startup interruption reconcile | Agents page (launch, list, detail, cancel, retry) | scheduler + real runtime runs | ✅ | Records survive restart; live processes do not (marked interrupted) | `backgroundAgents.test.ts` (5, live model) |
| File reading | `src/tools/FileReadTool` | `file:read` IPC → `readProjectFile()` (worktree-scoped, safety-evaluated in tool path) | Chat tools, Files preview | Node fs + safety service | ✅ | — | registry validation tests |
| File writing | `src/tools/FileWriteTool` | `executeToolLocal('Write')` with `evaluateFileWrite` + approval | Chat tools | Node fs + safety service | ✅ | — | `safetyService.test.ts` |
| File editing | `src/tools/FileEditTool` | `proposeEdit()` (real unified diff + base hashes); `diffs.ts` per-hunk accept/reject/revert with stale detection; `patch:apply` via `git apply` | Chat diff cards (per-hunk controls), Changes page | git + runtime | ✅ | — | `unifiedDiff.test.ts`, `diffs.test.ts` (13) |
| Glob | `src/tools/GlobTool` | `globProjectFiles()` dependency-free walker (Electron's Node 20 lacks fs.glob) | Chat tools | Node fs | ✅ | — | `glob.test.ts` (5) |
| Grep | `src/tools/GrepTool` | `search.ts`: dependency-managed ripgrep (`@vscode/ripgrep`, asar-unpacked) + tested internal fallback; regex/fixed, case, include/exclude globs, .gitignore, structured file/line/column | Files page content search, Grep tool | ripgrep binary or internal engine | ✅ | — | `search.test.ts` (16, both engines) |
| Terminal/Bash | `src/tools/BashTool`, `src/utils/bash` | `shellRunner.ts` (node-pty) + `terminalManager.ts` (classification: destructive/network/package/outside-workspace); PTY geometry is measured from a monospace probe and reported over `terminal:resize` (debounced, clamped), and `terminal:write` forwards stdin verbatim including Ctrl-C/D/Z so interactive programs and prompts are answerable | Terminal page: resize-aware surface, Send mode while a command runs, control-key passthrough | node-pty + safety service | ✅ | — | `terminalSize.test.ts` (15) |
| Test runner | `src/tools/TestRunnerTool` | `testRunner.ts`: framework detection (bun/jest/vitest/pytest/go/mocha), structured counts + failing tests, rerun-failed command synthesis, runtime-failure distinction | Terminal → Tests tab | shell runner + parsers | ✅ | — | `testRunner.test.ts` (12) |
| Git operations | `src/tools/GitHubTool`, git utils | `explorer.ts`: `git status --porcelain`, `git diff`, `git checkout --`, `git check-ignore` | Changes page, Files page | git CLI | ✅ | Commit/push/PR flows (deliberately out of scope for review UI) | `explorer.test.ts` |
| Worktrees | `src/tools/EnterWorktreeTool`/`ExitWorktreeTool` | `worktreeManager.ts` + `EnterWorktree`/`ExitWorktree` tool mapping + per-run isolated worktrees | Chat (worktree toggle), Projects | git worktree | ✅ | — | runtime tests |
| Project instructions | `UR.md`/`UR.local.md` loading in `src/context.ts` | Vendored `openProject()` loads project instructions into the session | Chat (implicit), Projects page shows presence | `@ur/agent-runtime` | ✅ | — | — |
| Permissions | `src/services/safety`, `src/security` | `safetyService.ts` (tool/shell/file/network/long-running/sensitive-path evaluation) + vendored policy helpers | Approval cards, Settings policy editor | local + `loadProjectSafetyPolicy` | ✅ | — | `safetyService.test.ts` |
| Prompt-injection screening | prompt-layer wording in `src/tools/WebFetchTool`, `WebSearchTool` | `safety/injectionScreen.ts`: rule-based detection of instruction override, system-prompt probing, credential exfiltration, tool directives, false authority, hidden-unicode and bidi obfuscation; `screenToolResult.ts` screens every WebFetch/WebSearch/browser/`mcp__*` result on the `tool_result` path and attaches findings to `tool_call_finished`; workspace tools are excluded so the user's own repo cannot flag itself | Approval cards (high severity), tool result events | local screening | ✅ | — | `injectionScreen.test.ts` (25), `screenToolResult.test.ts` (7) |
| Approval requests | permission prompts in REPL | `requestApproval()` (run-scoped, cached scopes, 5-min timeout) + native dialog for standalone ops + approval log | Chat approval cards, Terminal approvals tab | IPC events + Electron dialog | ✅ | — | `runtime.approval.test.ts` |
| Safety rules | `src/services/guardrails`, policy files | `.ur/safety-policy.json` read/write (`safety:policy:get/set`), deny/ask rules, macOS sensitive dirs | Settings | safety service | ✅ | — | `safetyService.test.ts` |
| Verification | `src/services/verifier` | L1 events per task plus `verification.ts`: gate discovery (node scripts, go, pytest), real gate execution through the safety layer, fail-fast, and adjudication that separates `verified` / `failed` / `no-gates` / `denied` | Tasks page, Chat, Plan cards | task registry + plans + project gates | ✅ | — | `verification.test.ts` (16) |
| Provider/model selection | `src/services/providers` | `providerService.ts`: 7 provider kinds, Keychain-backed keys, model discovery, connection tests, activation. Config is **global** (works with no project open); Settings + Chat auto-discover the live model list on load | Settings, Chat header | vendored provider registry | ✅ | — | `globalProviders.test.ts`, registry tests |
| Streaming responses | `src/QueryEngine.ts` streaming | `model_stream` deltas over `runtime:event` broadcast | Chat | runtime events | ✅ | — | — |
| MCP | `src/services/mcp`, MCP tools | `connectorService.ts` (stdio/sse/http/ws, test, tools listing, tool calls) + `mcp:*` channels; `mcpOAuth.ts` (metadata discovery, PKCE S256, code exchange, refresh, constant-time state check) and `mcpOAuthStore.ts` (safeStorage-encrypted tokens); `mcpOAuthFlow.ts` runs the RFC 8252 loopback flow — one-shot 127.0.0.1 listener, system browser, RFC 7591 dynamic registration, RFC 8707 resource binding — with bearer injection and refresh-on-expiry at connect | MCP page: Authorize / Re-authorize / Sign out with status badges | `@modelcontextprotocol/sdk` + OAuth 2.1 | ✅ | — | `mcpOAuth.test.ts` (37), `mcpOAuthFlow.test.ts` (17) |
| Session history | `src/history.ts` | `historyStore.ts` (run records + JSONL transcripts in Application Support) | History page | local store | ✅ | — | via history flows |
| Checkpoints | `src/commands/rewind`, file history | `checkpoints.ts`: snapshots at before-tool/before-edit/after-edit/task-completed/before-agent/manual boundaries with session/task/git metadata; preview, approval-gated rewind, safety checkpoint (branched timeline), audit log | Checkpoints panel (History + Chat button) | local snapshot store | ✅ | — | `checkpoints.test.ts` (6 incl. rewind round-trip) |
| Cancel/pause/resume | REPL controls | `run:stop/pause/resume` + `sessions/runState.ts` incremental persistence, startup interruption reconcile, `sessions/resume.ts` continuation without repeating completed side-effect tools | Chat Stop/Pause/Resume + interrupted-run banner (Resume / Mark failed / Archive) | runtime + persisted state | ✅ | Resume starts a fresh session at a safe boundary with replayed context | `resume.test.ts` (5 incl. live end-to-end) |
| Context files | `@file` mentions, context pack | `contextFiles.ts`: validated attachments (missing/dir/oversize/binary/unreadable), re-read at send, fenced blocks | Chat attach + chips, Files "+ctx" | local validation | ✅ | Security-scoped bookmarks (not needed: no sandbox entitlement) | `contextFiles.test.ts` |
| Reports | `src/commands/export`, run reports | `reportBuilder.ts` + `report:markdown/json/get`; export reveals in Finder | History page, Chat Export | local builder from transcripts | ✅ | — | — |
| Usage/cost metadata | `src/cost-tracker.ts` | `usage.ts`: per-message accumulation, authoritative final `result` usage + provider cost, dated pricing table (user-overridable at `~/.ur/desktop/pricing.json`), estimates labeled, no fabricated cost for local providers; persisted to history | Chat header usage badge (live), History details | runtime events + pricing config | ✅ | — | `usage.test.ts` (9) |

## Known gaps (explicit)

1. **New UI is not visually verified.** The chat tab strip and the terminal's
   resize/Send behavior are implemented, typecheck clean, lint clean, and the
   renderer bundles, but no one has run them in Electron: tab layout and drag
   feel, and the measured cols/rows against real output wrapping, are unchecked.
   Provider/model and permissions are intentionally window-level rather than
   per-tab, so they do not reset when switching.
2. **Interactive input requires a PTY.** Under Bun the shell runner uses the
   child-process path with `stdin: 'ignore'` (a Bun 1.3 master-fd bug), so
   `terminal:write` correctly refuses input there instead of dropping it
   silently. Packaged Electron builds get the PTY and full interactivity.
3. **Injection screening is heuristic.** It is a rule-based pass that reports
   rather than blocks, so it will miss novel phrasings and can flag prose that
   discusses injection. It raises the cost of an attack; it does not close it,
   and the prompt-layer instructions remain the primary defense.
4. **L2 verification depends on the project defining a gate.** A project with
   no test, typecheck, lint, or build script reports `no-gates` — deliberately
   not a pass, so the report builder can distinguish "nothing failed" from
   "nothing was checked."
5. Resumed sessions continue in a **fresh runtime session** with replayed
   context and a completed-actions ledger; the exact in-memory engine state
   of the interrupted process is not rehydrated (it no longer exists).
6. The interrupted **worktree** of a resumed run is preserved on disk and
   referenced in run state, but the continuation executes in the main
   workspace.
7. **Plan generation quality is model-dependent**: the pipeline runs a real
   model and strictly validates the response; models that fail to emit the
   JSON contract produce a clear `PlanParseError` in the UI (never a
   fabricated placeholder plan), and slow cloud models can take minutes.

Everything else in the required audit list is wired end-to-end:
renderer → validated preload IPC → main-process handler → real runtime/OS
call → structured `runtime:event` stream back to the renderer.
