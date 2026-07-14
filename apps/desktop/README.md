# UR Desktop

A standalone macOS Electron app for UR-Nexus. It installs and runs alone with no global `ur` CLI dependency, no subscription CLI provider, and bundles the internal `@ur/agent-runtime` package.

## Install from npm

UR-Nexus Desktop is published as `ur-nexus-desktop` and includes its own
Electron runtime. No API key is bundled: each user chooses a provider and adds,
replaces, or removes their own credentials in **Settings**.

```bash
npm install --global --allow-scripts=node-pty ur-nexus-desktop
ur-nexus-desktop
```

Recent npm versions require explicit approval before global packages may run
native install scripts. UR-Nexus needs only node-pty's terminal binding; the
command above approves that package alone. Electron 43 no longer needs an
install lifecycle script. This does not enable arbitrary dependency scripts. See npm's
[`allow-scripts` documentation](https://docs.npmjs.com/using-npm/config/#allow-scripts).

Use `ur-nexus-desktop --version` to verify the installed release. Ollama users
can select any model installed on their own Ollama server and may change the
server URL at any time.

## macOS development

Requires [Bun](https://bun.sh) and macOS 12+. Native modules are rebuilt for the running Electron ABI automatically when packaging.

```bash
bun install
bun run dev
```

`bun run dev` builds the main and preload scripts, starts the Vite renderer dev server, and launches Electron against `http://localhost:5173`.

## macOS build

```bash
bun run build
```

Produces:

- `dist/main/main.mjs`
- `dist/preload/preload.cjs`
- `dist/renderer/*`

## macOS package

```bash
bun run build:electron
```

Generates in `dist/`:

- `UR Desktop-x.x.x-arm64.dmg` (Apple Silicon)
- `UR Desktop-x.x.x-arm64.zip` (Apple Silicon)
- `UR Desktop-x.x.x-x64.dmg` (Intel, when built on Intel or with `--x64`)

Universal binaries are produced when `electron-builder` runs on an Apple Silicon Mac with both architectures available. Set `electron-arch` or use `electron-builder --universal` if needed.

The native terminal module (`node-pty`) is unpacked from the ASAR so it loads at runtime.

## macOS install

Open the produced `.dmg` and drag **UR Desktop** to `/Applications`. On first launch the app opens without a project selected; use the project input in the chat footer to open a local directory.

## macOS Keychain secret storage

API keys are stored by the main process in the macOS Keychain via the existing `providerCredentials` module. Keys are never written to project files, history, transcripts, or exported reports. The renderer receives only `hasKey`/`keySource` booleans, never the key value.

## Provider setup

Open **Settings**, pick a provider, enter a model, and save. Click **Save & test** to verify reachability.

In chat, type `/` to open the command palette. Continue typing to filter,
use <kbd>↑</kbd>/<kbd>↓</kbd> to navigate, <kbd>Tab</kbd> or
<kbd>Enter</kbd> to select, and <kbd>Esc</kbd> to close it.

### OpenAI API setup

1. Choose **OpenAI API**.
2. Paste your API key.
3. Enter a model (e.g. `gpt-4o`).
4. Click **Save settings** then **Set active**.

### Anthropic API setup

1. Choose **Claude API**.
2. Paste your Anthropic API key.
3. Enter a model (e.g. `claude-3-5-sonnet-20241022`).
4. Click **Save settings** then **Set active**.

### OpenRouter API setup

1. Choose **OpenRouter**.
2. Paste your OpenRouter API key.
3. Enter a model (e.g. `openai/gpt-4o`).
4. Click **Save settings** then **Set active**.

### Ollama Local setup

1. Install and start [Ollama](https://ollama.com) on your Mac.
2. In Settings choose **Ollama Local**.
3. Click **Discover** to list downloaded models.
4. Select a model and click **Set active**.

The app does not install Ollama for you. If Ollama is not running, Local mode will not connect; switch to an API provider or Ollama Cloud.

### Ollama Network setup

1. Choose **Ollama Network**.
2. Enter the base URL (e.g. `http://ollama.local:11434`).
3. Click **Test connection**.
4. Click **Set active**.

### Ollama Cloud/API setup

1. Choose **Ollama Cloud/API**.
2. Enter the managed base URL (e.g. `https://ollama.example.com`).
3. Click **Test connection**.
4. Click **Set active**.

## MCP connector setup

MCP servers can be added in the Connectors panel. The app supports `stdio`, `sse`, `http`, and `ws` transports. Connector tools are exposed to runs and gated by the same approval model as built-in tools.

## Security model

- Electron secure context defaults: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`.
- All file system and shell operations are scoped to the opened project or an isolated worktree.
- Risky actions pause execution and require user approval; denied actions do not run.
- Every approval decision is logged to `~/Library/Application Support/UR Desktop/desktop/approval-log.jsonl`.
- macOS-sensitive paths (Desktop, Documents, Downloads, `.ssh`, `.gnupg`, `Library`, Keychain access patterns, and external drives) are protected.
- Reading outside the selected project, writing/deleting outside the project/worktree, destructive shell commands, package installs, network commands, `git push`, file deletion, MCP side-effect tools, external app/URL opening, long-running commands, and provider key replacement require explicit approval.
- Project-level safety policy lives in `.ur/safety-policy.json` and can be edited from the Settings page.

## Auto-update

The renderer checks the repository's latest public GitHub release through the
GitHub Releases API. Update checks do not require a token and do not download or
execute anything automatically.

## Deep links

The app registers the `ur-desktop://` protocol. On launch it handles `open-url` and `second-instance` argv payloads. Pending deep links are stored for the renderer to consume after load.

## macOS signing and notarization

`electron-builder.yml` includes:

- `hardenedRuntime: true`
- `entitlements: build/entitlements.mac.plist`
- `notarize.teamId: ${env.APPLE_TEAM_ID}`

To sign and notarize, set environment variables before packaging:

```bash
export APPLE_ID=your-apple-id@example.com
export APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
export APPLE_TEAM_ID=ABCD123456
```

Packaging works without these credentials for local testing. Public macOS
distribution requires a valid Developer ID Application certificate and Apple
notarization credentials; they are intentionally never stored in the repo or
npm package.

## Troubleshooting

- **Blank window**: check that `dist/renderer/index.html` exists after `bun run build`. In dev mode ensure Vite is running on port 5173.
- **Electron runtime missing after npm install**: reinstall with `npm install --global --allow-scripts=node-pty ur-nexus-desktop`. Do not use the broad `--dangerously-allow-all-scripts` option.
- **Type errors**: run `bun run typecheck` from `apps/desktop`.
- **Tests**: run `bun test` from `apps/desktop`.
- **Packaging fails on native modules**: run `bun run build` first so `electron-builder` can locate rebuilt binaries; ensure `node-pty` has a prebuild for the target Electron ABI.
- **Signing/notarization fails**: verify `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`, and the provisioning profile path.
