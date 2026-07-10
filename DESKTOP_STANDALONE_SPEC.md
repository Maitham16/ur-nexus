# UR Desktop — Standalone Spec

## 1. Product vision

Build a self-contained desktop AI coding agent application that works out-of-the-box after installation, with no dependency on a globally installed `ur` CLI. It preserves UR-Nexus's local-first, privacy-respecting, tool-calling engine while adding a native chat-first desktop experience. The app bundles the UR runtime as internal packages, uses Electron for the shell, and keeps the existing CLI fully functional and independently shippable.

## 2. Final app architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Electron main process                                      │
│  - node-ur-core runtime package (QueryEngine, providers,  │
│    tools, permissions, sandbox, MCP, verifier, history)     │
│  - manages windows, settings store, secure credentials,     │
│    project registry, background workers                     │
├─────────────────────────────────────────────────────────────┤
│  Electron preload / IPC bridge                              │
│  - exposes a small, typed channel surface to renderer       │
├─────────────────────────────────────────────────────────────┤
│  Renderer process (React/Vite)                              │
│  - chat UI, project picker, task board, model picker,       │
│    approval dialogs, diff review, settings panels          │
├─────────────────────────────────────────────────────────────┤
│  Bundled binary dependencies (shipped with app)             │
│  - bun/node runtime embedded / bundled                      │
│  - ripgrep, sandbox helpers where platform allows           │
└─────────────────────────────────────────────────────────────┘
```

The runtime executes in the **main process**, not a separate `ur` subprocess. The renderer never shells out; it drives the runtime through IPC.

## 3. Folder/package structure

```
packages/
  ur-core/              # Reused UR runtime (was src/ core)
    src/
      engine/           # QueryEngine, query.ts, QueryDeps
      tools/            # tool registry + built-in tool implementations
      providers/        # provider registry + adapters
      mcp/              # MCP client, config, auth
      agents/           # subagent orchestration, crews, arena, bg runner
      verifier/         # L1/L2 verification
      permissions/      # permission engine + rule parser
      sandbox/          # OS sandbox wrappers
      safety/           # project safety policy
      history/          # session persistence, transcript, rewind
      tasks/            # task system v2 store + execution
      state/            # AppState store (headless subset)
      settings/         # settings schema + loaders
      utils/            # shared utilities
  ur-electron/
    src/
      main/             # main process entry, runtime host, window mgmt
      preload/          # typed IPC bridge
      renderer/         # React chat UI
      shared/           # types shared across main/preload/renderer
  ur-cli/               # Existing CLI entrypoint (remains separate)
    src/                # mirrors current src/ structure
    bin/ur.js
    package.json
```

Root workspace uses `bun` workspaces. `ur-core` is a regular package dependency of both `ur-cli` and `ur-electron`.

## 4. Which UR modules will be reused

Reused largely unchanged:

- `src/QueryEngine.ts` / `src/query.ts` — conversation loop and provider-agnostic model streaming.
- `src/tools.ts` / `src/tools/` — tool registry, built-in tools, MCP tool wrappers.
- `src/services/providers/` — provider registry, model discovery, connection doctor, credentials.
- `src/services/mcp/` — MCP client, transports, OAuth, resource/tool discovery.
- `src/services/agents/` — subagents, background runner, crews, arena, model router, escalation.
- `src/services/verifier/` — L1/L2 verification.
- `src/utils/permissions/` — permission engine, rule parsing, classifier hooks.
- `src/utils/sandbox/` — OS sandbox wrappers.
- `src/services/safety/` — project safety policy.
- `src/history.ts` / `src/utils/fileHistory.ts` — session persistence, checkpoints, rewind.
- `src/tasks/` — task system v2.
- `src/utils/settings/` — settings schema and loading.
- `src/state/AppStateStore.ts` — headless subset of AppState.

## 5. Which UR modules must be refactored

- **Terminal / Ink UI (`src/screens/REPL.tsx`, `src/components/`)** — replaced by the Electron renderer React UI. Keep logic but remove Ink-specific rendering; expose observable state for the renderer.
- **Command dispatch (`src/commands.ts`, `src/main.tsx`)** — desktop exposes slash commands as UI actions or runtime API calls, not a commander CLI.
- **Entrypoints (`src/entrypoints/cli.tsx`)** — split: CLI-specific fast paths stay in `ur-cli`; shared runtime boot moves to `ur-core`.
- **Process assumptions** — modules that read `process.argv`, assume a TTY, or shell out to `process.execPath` must accept explicit cwd/runtime host parameters.
- **AppState (`src/state/AppState.tsx`)** — React provider stays in CLI only; desktop uses a headless store wrapper in `ur-core` plus a renderer-side mirror.
- **Background agents** — today `backgroundRunner.ts` spawns a child `ur` process. Desktop version spawns a hidden renderer worker or main-process subagent using the same runtime, never `ur` on PATH.
- **MCP / tool execution paths** — ensure all file system operations respect a configurable workspace root rather than `process.cwd()`.

## 6. How the app works without global `ur`

The desktop app embeds the UR runtime as the `ur-core` package and ships its own Node/Bun execution environment. At startup the main process loads `ur-core` directly. No `ur` binary is invoked; no PATH lookup occurs. Background tasks, subagents, and MCP servers run inside the app process tree. The CLI continues to exist as a separate installable package, but the desktop app does not require it.

## 7. Shared runtime API design

`ur-core` exposes a single headless API surface used by both the CLI and desktop:

```ts
export interface URuntime {
  // Lifecycle
  init(options: RuntimeInitOptions): Promise<void>
  shutdown(): Promise<void>

  // Projects
  openProject(root: string): Promise<ProjectHandle>
  listProjects(): Promise<ProjectSummary[]>
  closeProject(handle: ProjectHandle): Promise<void>

  // Conversations
  createSession(project: ProjectHandle, opts?: SessionOptions): Promise<SessionHandle>
  resumeSession(project: ProjectHandle, sessionId: string): Promise<SessionHandle>
  sendMessage(session: SessionHandle, content: string | ContentBlockParam[]): AsyncIterable<RuntimeEvent>
  interrupt(session: SessionHandle): void
  getSessionTranscript(session: SessionHandle): Message[]

  // Tools / providers
  getProviderStatus(project: ProjectHandle): Promise<ProviderStatusSummary[]>
  setProvider(project: ProjectHandle, provider: ProviderId, model?: string): Promise<void>
  listTools(project: ProjectHandle): Promise<ToolInfo[]>
  getPermissionRules(project: ProjectHandle): PermissionRule[]
  updatePermissionRules(project: ProjectHandle, updates: PermissionUpdate[]): Promise<void>

  // Tasks / agents
  createTask(project: ProjectHandle, spec: TaskSpec): Promise<TaskHandle>
  listTasks(project: ProjectHandle): TaskSummary[]
  stopTask(task: TaskHandle): Promise<void>
  subscribeTaskEvents(project: ProjectHandle): AsyncIterable<TaskEvent>

  // MCP
  listMcpServers(project: ProjectHandle): MCPServerSummary[]
  addMcpServer(project: ProjectHandle, config: McpServerConfig): Promise<void>
  removeMcpServer(project: ProjectHandle, name: string): Promise<void>

  // Settings
  getSettings(project: ProjectHandle, scope: SettingScope): SettingsJson
  updateSettings(project: ProjectHandle, scope: SettingScope, patch: Partial<SettingsJson>): Promise<void>

  // Events
  on<E extends RuntimeEventName>(event: E, handler: RuntimeEventMap[E]): () => void
}
```

All side effects (file edits, shell commands, MCP calls) go through this runtime; the renderer only consumes events.

## 8. Electron IPC design

IPC is narrow and typed. The preload exposes one invocation surface:

```ts
interface UrIpc {
  invoke(channel: UrChannel, ...args: unknown[]): Promise<unknown>
  subscribe(channel: UrEventChannel, handler: (event: IpcRendererEvent, payload: unknown) => void): () => void
}
```

Channels (examples):

- `runtime:init`, `runtime:shutdown`
- `project:open`, `project:list`, `project:close`
- `session:create`, `session:resume`, `session:send`, `session:interrupt`
- `session:subscribe` (returns a port for streaming events)
- `provider:list`, `provider:set`
- `tool:list`, `permission:get`, `permission:update`
- `task:create`, `task:list`, `task:stop`, `task:subscribe`
- `mcp:list`, `mcp:add`, `mcp:remove`
- `settings:get`, `settings:set`
- `dialog:approval` (renderer → main for permission approvals)

Streaming events use a `MessageChannel` port created by the main process and transferred to the renderer, avoiding repeated synchronous IPC for high-frequency events.

## 9. Chat-first UI design

The renderer centers on a persistent chat view per project:

- **Conversation stream** — user/assistant bubbles, thinking blocks (dim, left-bordered, labeled "model reasoning"), tool use summaries, compact boundaries.
- **Input bar** — multiline composer, model/status pills, file drop, image paste, `/` command typeahead.
- **Side panel** — project files, session list, MCP servers, task board, settings.
- **Inline approvals** — permission requests render as cards with Allow/Allow once/Deny/Always deny.
- **Diff review** — proposed file changes surface in a diff viewer; user approves/rejects before apply.
- **Task board** — pinned bottom panel (like CLI task panel) showing live task statuses.

UI conventions from the CLI are preserved: accent ⏺ dot for answers, dim italic for reasoning, live task statuses with ✔/■/□.

## 10. Project/worktree model

- A **project** maps to a directory on disk (usually a git repo).
- Project state lives under `<project>/.ur/` exactly as today: settings, memory, specs, workflows, guardrails, safety policy, checkpoints.
- Global user state lives under `~/.ur/` (or platform app data directory for sandboxed installs).
- Worktrees are supported: a project may have isolated worktree sessions, each with its own session transcript and checkpoints. The desktop app creates worktrees via `ur-core` APIs, not by shelling out to `ur -w`.

## 11. Task/multi-agent model

- **Tasks** are the same v2 tasks as today (`TaskCreate/TaskGet/TaskUpdate/TaskList`). They appear in the bottom task panel.
- **Subagents** (`Agent` tool) run inside the main process or a background renderer worker; they are not CLI subprocesses.
- **Background agents** use a desktop-specific worker host that reuses `backgroundRunner.ts` logic but spawns an in-app worker instead of `ur --bg`.
- **Crews/arena/escalation** reuse `src/services/agents/` unchanged; only the spawning layer is replaced.

## 12. Tools model

- Tool discovery, filtering, and execution reuse `src/tools.ts` and `src/tools/`.
- File tools (`Read`, `Write`, `Edit`, `Glob`, `Grep`) operate against the open project root.
- `Bash`/`PowerShell` run through the same security/sandbox pipeline, but in the desktop app they execute under the main process with sandbox wrappers applied.
- MCP tools are discovered and invoked via `src/services/mcp/client.ts`.
- Tools that prompt the user (permission, `AskUserQuestion`) render desktop-native dialogs instead of terminal prompts.

## 13. Provider/model model

Reuse `src/services/providers/providerRegistry.ts` and provider adapters.

- Provider selection UI mirrors `/model`: provider-first, then model list.
- Credentials stored in the OS keychain via existing secure storage; in sandboxed installs, use the Electron safe-storage API as a fallback.
- Local providers (Ollama, LM Studio, etc.) detected the same way.
- Subscription CLI providers (Codex CLI, Claude Code, etc.) remain optional; the desktop app can dispatch through them only if the official CLI is installed and authenticated.

## 14. MCP/connectors model

- MCP client code reused from `src/services/mcp/`.
- Configuration sources: user settings, project `.mcp.json`, desktop app UI.
- Transports supported: stdio, SSE, HTTP, WebSocket. Stdio MCP servers spawn as child processes of the main process.
- OAuth flows for MCP servers open in a desktop-managed browser window and complete through a local redirect handler.
- Permissions/allowlists for MCP servers are enforced by the same permission engine.

## 15. Permission/sandbox/approval model

- Permission engine reused from `src/utils/permissions/`.
- Approval requests route to the renderer as IPC events and block the tool call until the user responds.
- Auto-approve rules, deny rules, permission modes, and managed/org policies all work unchanged.
- OS sandbox (`src/utils/sandbox/`) wraps shell commands when supported.
- Project safety policy (`src/services/safety/projectSafety.ts`) and guardrails are applied per project.

## 16. Session/history model

- Sessions persist under `~/.ur/projects/<slug>/` using the same transcript format as today.
- Resume, rewind, branch, fork, export, tag, rename reuse `src/history.ts` and the session commands.
- The desktop app adds a session picker UI and visual timeline.
- Checkpoints (`/rewind`) restore code and/or conversation from `src/utils/fileHistory.ts` snapshots.

## 17. Packaging strategy

- **Development**: monorepo with `packages/ur-core`, `packages/ur-electron`, `packages/ur-cli`. `ur-core` is the shared runtime.
- **Build**:
  - `ur-core` bundles into a single ESM/CJS dual package.
  - `ur-electron` bundles with Vite for renderer, esbuild/bun for main.
  - `ur-cli` continues to bundle `dist/cli.js` with `ur-core` as an internal dependency.
- **Distribution**:
  - Desktop: `.dmg` (macOS), `.exe` installer (Windows), `.AppImage`/`.deb` (Linux).
  - CLI: npm package `ur-agent` remains publishable independently.
- **Auto-update**: use electron-updater with signed releases; respect `autoUpdatesChannel` setting.
- **Offline/local-first**: bundle all runtime code; only model traffic leaves the machine.

## 18. Implementation phases

### Phase 0 — Foundation (no UI)
1. Create `packages/ur-core` and migrate core runtime modules with minimal changes.
2. Make `ur-cli` depend on `ur-core`; keep CLI behavior identical.
3. Add a CI gate that `bun test` and `bun run typecheck` pass for both packages.

### Phase 1 — Runtime API + headless harness
1. Define and implement the `URuntime` API in `ur-core`.
2. Replace process/TTY assumptions with explicit project/cwd parameters.
3. Add desktop-compatible background task host.
4. Acceptance: a headless test can open a project, start a session, send a prompt, and receive streamed events.

### Phase 2 — Electron shell + chat UI
1. Create `packages/ur-electron` with main/preload/renderer.
2. Wire IPC to `URuntime`.
3. Build chat stream, input bar, model picker, session list.
4. Acceptance: user can install the app, open a project, and have a chat session without `ur` on PATH.

### Phase 3 — Approvals, diff review, tasks
1. Desktop-native permission approval dialogs.
2. Diff viewer for proposed edits.
3. Task board panel.
4. Acceptance: a Bash/Edit tool call triggers an approval dialog; approved edits show in diff viewer.

### Phase 4 — MCP, providers, settings polish
1. MCP server management UI.
2. Provider/model picker with connection doctor.
3. Settings panels (permissions, sandbox, memory).
4. Acceptance: add an MCP server in UI; its tools appear in the tool pool.

### Phase 5 — Packaging, updater, CLI parity
1. Cross-platform installers and signed auto-updater.
2. Verify CLI package still installs and passes tests independently.
3. Documentation and release checklist updates.
4. Acceptance: install desktop app on a clean machine, run through all acceptance tests.

## 19. Acceptance tests

### A. Installation independence
- Install the desktop app on a fresh VM with no `ur` binary and no Node.js.
- Open the app; confirm it launches and can create a project.

### B. Chat session
- Open a project, select Ollama (or an API provider with key stored), send "Read README.md and summarize".
- Verify the assistant uses `Read`, returns a summary, and the transcript persists after restart.

### C. Tool approval
- With permission mode `default`, ask "Create a file called hello.txt containing hi".
- Verify an approval card appears for `Write`; deny it and confirm no file is written; approve it and confirm the file is written.

### D. Diff review
- Ask "Rename variable x to count in src/foo.ts".
- Verify the proposed edit appears in the diff viewer before it is applied.

### E. Task/multi-agent
- Ask "Plan and implement a small helper in src/utils/helpers.ts with a test".
- Verify tasks appear in the task panel and complete.

### F. Provider/model
- Open the model picker, switch provider, pick a model, and send a message.
- Verify `runtime:provider:set` succeeds and the new model is used.

### G. MCP
- Add a filesystem MCP server pointing at the project root via the UI.
- Verify its tools appear in `tool:list` and can be invoked through chat.

### H. Session persistence
- Close and reopen the app.
- Verify the previous session appears in the session list and resumes correctly.

### I. CLI still works
- In the same repo, run `bun run build` for `ur-cli` and `bun test`.
- Verify the CLI binary runs `ur --version` and a headless prompt without regressions.

### J. No shell out to `ur`
- Run the desktop app under process monitoring; confirm no `ur` or `bin/ur.js` process is spawned for normal chat, tasks, or background work.
