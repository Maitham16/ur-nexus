# UI Action Audit

Every visible control, its handler chain, and its states. Audit date: 2026-07-11.

Conventions: all handlers go renderer → `window.urDesktop.*` (typed preload) →
`ipcMain.handle` (validated in `src/main/ipcRegistry.ts`) → runtime/service.
Errors reject the invoke promise and surface in a dismissible error banner on
the owning screen — no control silently fails.

## Application (native menu / window)

| Control | Expected action | Handler | Loading | Success | Error | Test |
|---|---|---|---|---|---|---|
| New Chat (⌘N) | Clear conversation, new session on next send | menu → `menu:action new-chat` → ChatPage `clearContext` | n/a | empty chat | n/a | smoke |
| Open Project… (⌘O) | Native directory picker, open project | menu → `dialog:open-project` → `project:open` | `opening` flag | title bar updates, recents refresh | title-bar error chip | `ipcRegistry.test.ts` |
| Open Recent → item | Open that project directly | menu → `menu:action open-project {root}` | same | same | same | — |
| Attach File… (⌘⇧A) | Native file picker, attach to composer | menu → ChatPage `attachFiles` | n/a | chips appear | attachment error list | `contextFiles.test.ts` |
| Settings… (⌘,) | Navigate to Settings | menu → route `/settings` | n/a | page shown | n/a | — |
| History (⌘Y) | Navigate to History | menu → route `/history` | n/a | page shown | n/a | — |
| Quit / Close / Minimize / Zoom | Standard roles | Electron menu roles | n/a | n/a | n/a | `single-instance.test.mjs` |
| Reload / DevTools | Development only | menu roles gated by `NODE_ENV=development` | n/a | n/a | hidden in prod | `menu.ts` guard |
| Drag & drop folder | Open as project | App shell `onDrop` → `getPathForFile` → `project:open` | overlay | project opens | error chip | — |
| Drag & drop files | Attach to chat | App shell → `ur:attach-files` event → ChatPage | overlay | chips appear | attachment errors | — |

## Chat

| Control | Expected action | Handler | Loading | Success | Error | Test |
|---|---|---|---|---|---|---|
| Send (⌘↵) | Start run if needed, stream prompt | `run:start` + `message:send` (attachments re-validated) | "Starting…" button state | streamed assistant/tool events | error message card | registry tests |
| Stop | Cancel the active run | `run:stop` | n/a | status→idle | banner | — |
| Pause / Resume | Pause/resume streaming | `run:pause` / `run:resume` | n/a | status badge | banner | — |
| Regenerate | Re-send last prompt | local + `message:send` | busy state | new response | error card | — |
| Edit last | Load last prompt into composer | local state | n/a | composer filled | n/a | — |
| Copy (assistant/diff) | Copy content to clipboard | `navigator.clipboard` | n/a | "Copied" flash | n/a | — |
| Attach | Native multi-file picker + validation | `dialog:open-files` → `context:add-files` | n/a | chips with size | per-file reasons (missing/binary/oversize/dir) | `contextFiles.test.ts` |
| Remove attachment (✕) | Detach file | `context:remove-file` | n/a | chip removed | n/a | `contextFiles.test.ts` |
| New Chat (composer) | Clear context | local reset | n/a | empty stream | disabled when empty | — |
| Provider select | Persist active provider, discover models | `provider:update` → `provider:models:get` | n/a | model list refreshed | banner | — |
| Model select | Persist model choice | `provider:update` | n/a | badge updates | banner | — |
| Ask / Edit / Agent mode | Composer mode + placeholder | local state | n/a | active tab styling | n/a | — |
| Isolated worktree toggle | Next run in a git worktree | `run:start {useWorktree}` | disabled mid-run | worktree badge | banner | — |
| Export | Export latest run report (Markdown) | `report:export` | n/a | report card with path | banner | — |
| Approval card: Allow once / Allow for run / Deny | Resolve pending approval | `approval:respond` | card frozen after click | decision shown, logged | timeout auto-denies at 5 min | `runtime.approval.test.ts` |
| Diff card: Apply / Reject | Apply patch via `git apply` or mark rejected | `patch:apply` | n/a | Applied/Rejected label, changed-files bar | banner | `unifiedDiff.test.ts` |

## Projects

| Control | Action | Handler | States | Test |
|---|---|---|---|---|
| Browse… | Native directory picker, open project | `dialog:open-project` → `project:open` | opening / error banner | registry tests |
| Close project | Drop cached project + context files | `project:close` | title bar → "No project open" | — |
| Recent → Open | Open recent project | shared `openProject` | error banner on stale path (and recents restore) | — |
| Create worktree | `git worktree add` via runtime | `worktree:create` | disabled for non-git; message on success | — |

## Files (explorer)

| Control | Action | Handler | States | Test |
|---|---|---|---|---|
| Expand/collapse dir | Lazy-load children | `explorer:list` | per-node loading row | `explorer.test.ts` |
| Click file | Inline preview | `file:read` | preview panel | — |
| Filter | Client-side name filter | local | n/a | — |
| Show ignored | Include git-ignored entries | `explorer:list {showIgnored}` | dimmed rows | `explorer.test.ts` |
| New File / New Folder | Inline path form → create (native approval) | `explorer:create` (+ `evaluateFileWrite` + native dialog) | notice / error banner | `explorer.test.ts` |
| rename | Inline form → rename | `explorer:rename` | notice / error | `explorer.test.ts` |
| delete | Delete with native approval | `explorer:delete` (+ `evaluateFileDelete`) | notice / error | `explorer.test.ts` |
| +ctx | Add file to chat context | `context:add-files` + navigate hint | notice with "Go to chat" | — |
| reveal | Reveal in Finder | `file:reveal` (`shell.showItemInFolder`) | n/a | — |
| Open (preview) | Open in default editor | `file:open-default` (`shell.openPath`) | error banner on failure | — |
| Refresh | Re-list root | `explorer:list` | button disabled while loading | — |

## Tasks / Agents

| Control | Action | Handler | States | Test |
|---|---|---|---|---|
| Task board (live) | Auto-refresh on task/agent/run events | `tasks:list` on `runtime:event` | empty states for no-project/no-tasks | — |
| Agents refresh | Reload agents | `agents:list` | disabled without project | — |
| Max parallel agents slider | Set parallelism cap | `settings:maxAgents` | value label updates | `ipcRegistry.test.ts` (validation) |

## Terminal

| Control | Action | Handler | States | Test |
|---|---|---|---|---|
| Run (Enter) | Execute via node-pty with safety classification | `command:run` | live `command_output` streaming | — |
| Stop | SIGTERM the pty | `command:stop` | status → stopped | — |
| Copy command / Copy output | Clipboard | local | n/a | — |
| Rerun | Re-execute recorded command | `command:run` | new block | — |
| Clear display | Hide prior blocks (records kept) | local timestamp filter | disabled when empty | — |
| Open in Finder | Reveal working directory | `file:reveal` | disabled without project | — |
| Raw toggle | Show raw ANSI output | local | n/a | — |
| Approvals tab | Respond to pending approvals | `approval:respond` | pending list, denial recorded in Errors | `runtime.approval.test.ts` |

## Changes (diffs)

| Control | Action | Handler | States | Test |
|---|---|---|---|---|
| File row | Load per-file diff (untracked synthesized) | `git:diff` | diff loading state, colorized lines | `explorer.test.ts` |
| Refresh | Re-run `git status` | `git:status` | clean-tree empty state | `explorer.test.ts` |
| Open | Open source file in default editor | `file:open-default` | error banner | — |
| Reveal | Reveal in Finder | `file:reveal` | n/a | — |
| Revert | Restore committed version (native approval; untracked = delete) | `git:revert-file` | notice / error banner | `explorer.test.ts` |
| Chat diff Apply/Reject/Accept-file | See Chat section | `patch:apply` | Applied/Rejected | `unifiedDiff.test.ts` |

### Chat diff cards (per-hunk)

| Control | Action | Handler | States | Test |
|---|---|---|---|---|
| Accept hunk | Apply one hunk via `git apply` (offset-recomputed subset patch) | `patch:apply-hunks` | Applied badge; stale banner on base-hash mismatch | `diffs.test.ts` |
| Reject hunk | Mark hunk rejected (no disk change) | local state | Rejected badge | — |
| Accept all / Reject all | Bulk pending hunks | `patch:apply-hunks` / local | counts in buttons | `diffs.test.ts` |
| Revert (hunk / applied) | Reverse-apply accepted hunks | `patch:apply-hunks {reverse}` | back to pending | `diffs.test.ts` |
| Copy patch | Clipboard | local | "Copied" flash | — |
| Open file | Default editor | `file:open-default` | error banner | — |
| Stale detection | Base-hash check before apply | `StaleDiffError` | "source changed — regenerate" chip; accepts disabled | `diffs.test.ts` |

## Providers (Settings)

> Provider/model configuration is **global** — the provider list, model discovery, connection test, and key storage all work with no project open. Only the safety-policy editor requires an open project.


| Control | Action | Handler | States | Test |
|---|---|---|---|---|
| Provider card select | Load config for that provider | `provider:config:get` | selected styling | — |
| Save settings | Persist model/baseUrl; key → macOS Keychain | `provider:config:set` (+ key store) | "Saving…", error banner | — |
| Test connection | Live probe (Ollama `/api/tags` or provider doctor) | `provider:test` | "Testing…", latency + models on success | — |
| Discover (models) | Model discovery for provider | `provider:models:get` | datalist populated | — |
| Set active | Activate provider+model for new sessions | `provider:update` | active badge | — |
| Replace API key | Stored via approval-gated flow | `provider:key:store` (approval) / `provider:key:clear` | error banner | — |
| Ollama Local / Network / Cloud | Dedicated provider kinds with base-URL fields | providerService kinds | placeholder URLs per kind | — |
| Save policy / Reset | Edit `.ur/safety-policy.json` | `safety:policy:set/get` | JSON parse errors surfaced | `safetyService.test.ts` |

## MCP (Connectors)

| Control | Action | Handler | States |
|---|---|---|---|
| Add server / Save | Create or update connector config | `connector:add` / `connector:update` | loading, validation, error banner |
| Test server | Connect and list tools | `connector:test` | ok/error + tool list |
| Enable / Disable | Toggle enabled flag | `connector:update` | badge |
| Refresh tools | Re-list tools | `connector:tools` | expandable list |
| Remove server | Delete config | `connector:remove` | list refresh |

## History

| Control | Action | Handler | States |
|---|---|---|---|
| Open run | Load record + transcript + report | `history:get` + `report:get` | detail cards |
| Delete run | Remove record + transcript (confirm) | `history:delete` | list updates |
| Export Markdown / JSON | Write report file | `report:markdown` / `report:json` | notice banner with path |
| Reveal exported file | Show in Finder | `file:reveal` | n/a |
| Resume run | — | not implemented (read-only history; live session rehydration unsupported) | documented gap |

## Enforcement

`test/noPlaceholders.test.mjs` fails the suite if production source contains
placeholder implementations, `href="#"`, empty click handlers, TODO/FIXME
handlers, mocked runtime data, `window.prompt`, or "not implemented" throws.
`src/main/ipcRegistry.test.ts` fails if any declared or preload-invoked IPC
channel lacks a registered main-process handler.


## Background agents (Agents page)

| Control | Action | Handler | States | Test |
|---|---|---|---|---|
| Launch | Queue a real detached agent run | `bgagent:launch` | queued→running→done/failed live via `background_agent_update` | `backgroundAgents.test.ts` |
| Agent row click | Detail panel with logs/result/usage | `bgagent:get` | full log tail (500 lines) | — |
| Cancel | Abort queued/running agent (stops the run) | `bgagent:cancel` | cancelled status | `backgroundAgents.test.ts` |
| Retry | New agent with lineage (`retryOf`) | `bgagent:retry` | new row | `backgroundAgents.test.ts` |
| Remove | Delete settled record (active refused) | `bgagent:remove` | row removed; error if active | `backgroundAgents.test.ts` |
| Changed file chip | Reveal in Finder | `file:reveal` | n/a | — |
| Active count | Header shows accurate active count | derived from live list | updates on events | — |
| Restart behavior | Active agents marked interrupted on relaunch | `reconcileBackgroundAgents` at startup | interrupted + reason | `backgroundAgents.test.ts` |

## Checkpoints (History page panel; Chat → Checkpoints)

| Control | Action | Handler | States | Test |
|---|---|---|---|---|
| Create checkpoint now | Snapshot current git-dirty files | `checkpoint:create` | notice banner | `checkpoints.test.ts` |
| Preview | Diff-free list of restore/recreate/delete actions | `checkpoint:preview` | colored action rows | `checkpoints.test.ts` |
| Rewind | Native approval → safety checkpoint → restore files | `checkpoint:rewind` | notice with safety checkpoint id; audit entry | `checkpoints.test.ts` |
| Delete | Remove checkpoint (audited) | `checkpoint:delete` | list refresh | `checkpoints.test.ts` |
| Branch badge | Marks safety checkpoints (branched timeline) | `branchedFrom` metadata | badge + tooltip | `checkpoints.test.ts` |

## Interrupted runs (Chat banner)

| Control | Action | Handler | States | Test |
|---|---|---|---|---|
| Resume | Restore transcript into chat, continue in fresh session without repeating completed tools | `resume:run` (+ `resume:transcript`) | streaming continues; banner clears | `resume.test.ts` (live E2E) |
| Mark failed | Close out unrecoverable run | `resume:mark-failed` | banner clears | `resume.test.ts` |
| Archive | Hide from interrupted list | `resume:archive` | banner clears | `resume.test.ts` |

## Tests tab (Terminal page)

| Control | Action | Handler | States | Test |
|---|---|---|---|---|
| Run tests | Structured run with framework detection | `test:run` | pass/fail/skip counts; runtime-failure banner distinct from test failures | `testRunner.test.ts` |
| Rerun failed only | Framework-specific rerun command | `test:rerun-failed` | new summary | `testRunner.test.ts` |
| Copy (failure) | Copy failing test reference | clipboard | n/a | — |
| Open file | Open failing test file | `file:open-default` | error banner | — |
| Show raw output | Expandable full output | local | n/a | — |

## Content search (Files page)

| Control | Action | Handler | States | Test |
|---|---|---|---|---|
| Search in file contents (Enter) | ripgrep-parity structured search | `search:grep` | match count + engine label; truncation marker | `search.test.ts` |
| Result row | Open preview at file | `file:read` | preview panel | — |
| Clear | Dismiss results | local | n/a | — |

## Plan mode (Chat composer)

| Control | Action | Handler | States | Test |
|---|---|---|---|---|
| Plan mode button | Generate reviewable plan instead of executing | `plan:generate` (real model run) | "Generating…" system line; error card on failure | `planning.test.ts` |
| planning recommended chip | Heuristic hint on multi-step prompts (debounced) | `plan:should-plan` | switches to Plan mode | `planning.test.ts` |
| Edit task title/description | Inline edit before start | local plan state | draft only | — |
| remove task | Drop task + fix dependents | local plan state | draft only | — |
| Start plan | Execute via dependency scheduler; task board mirrors real state | `plan:execute` | per-task status badges + errors | `scheduler.test.ts` |
| Discard | Delete draft plan card | local | n/a | — |

## Usage badge (Chat header)

| Control | Action | Handler | States | Test |
|---|---|---|---|---|
| Usage badge | Live tokens in/out + cost during streaming | `usage_updated`/`run_result` events | "est." label for table-derived cost; no cost for Ollama | `usage.test.ts` |
