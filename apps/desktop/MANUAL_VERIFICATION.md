# Manual Verification Checklist

Items that require a human at the machine (native dialogs, Dock, Keychain
prompts, DMG installation). Automated coverage notes what a machine already
verified; the checkbox is for the human pass.

Status legend: `[ ]` not yet performed · `[x]` performed and passed ·
`[!]` performed, issue found (file it). **Do not tick a box without actually
performing the step.**

Environment for the pass: macOS ___, app version ___, date ___, tester ___.

## Native interaction

- [ ] **Native project picker** — Title bar → "Open Project…" opens the macOS
  directory sheet; choosing a folder updates the title bar and recents.
  (Automated: `dialog:open-project` handler registration + `project:open`
  validation. The sheet itself needs eyes.)
- [ ] **File attachment picker** — Chat → Attach opens the multi-select file
  sheet; oversized/binary picks show per-file reasons; ✕ removes chips.
  (Automated: validation matrix in `contextFiles.test.ts`.)
- [ ] **Menu shortcuts** — ⌘N new chat, ⌘O open project, ⌘⇧A attach, ⌘, settings,
  ⌘Y history; Open Recent lists the last projects; Reload absent in the
  packaged app.
- [ ] **Dock reopen** — Close the window (⌘W) with the app running, click the
  Dock icon: the window returns (activate → `restoreOrCreateWindow`).
- [ ] **Multiple-window prevention** — Launch the .app twice; the second launch
  focuses the existing instance. (Automated headless:
  `single-instance.test.mjs` against the packaged binary.)
- [ ] **Provider configuration** — Settings: save an API key, Test connection
  against a live provider, Discover models, Set active; key never appears in
  any settings file (`grep -r` the app data dir).
- [ ] **Keychain persistence** — After saving a key, find it in Keychain
  Access; relaunch the app; provider still shows "key present"; Replace API
  key overwrites the Keychain item.
- [ ] **Agent background execution** — Agents → launch a background agent on a
  real project; navigate away and keep chatting while it runs; logs stream in
  the detail panel; Cancel stops it mid-run. (Automated: full lifecycle with a
  live model in `backgroundAgents.test.ts`.)
- [ ] **Checkpoint rewind** — History → Checkpoints: create one, edit a file,
  Preview shows the file as `restore`, Rewind prompts the native approval
  dialog, file content reverts, a `branch`-badged safety checkpoint appears.
  (Automated: round-trip in `checkpoints.test.ts`; the native dialog needs
  eyes.)
- [ ] **Interrupted-session resume** — Start a chat run, force-quit the app
  (⌘⌥Esc) mid-response, relaunch: the interrupted banner appears with the
  prompt excerpt and completed-action count; Resume restores the transcript
  and finishes; completed writes are not repeated. (Automated: subprocess
  interruption + live resume in `resume.test.ts`.)
- [ ] **Hunk acceptance** — In a chat diff with 2+ hunks, Accept one hunk:
  only that region changes on disk; edit the file externally, Accept another:
  the stale banner appears; Revert restores. (Automated: `diffs.test.ts`; the
  UI interaction needs eyes.)
- [ ] **DMG installation / replacement** — Open `dist/UR Desktop-<v>-arm64.dmg`,
  drag to /Applications, launch from /Applications (Gatekeeper: unsigned build
  requires right-click → Open). Install a rebuilt DMG over it: replacement
  keeps recents/history (stored in Application Support, not the bundle).

## Visual / appearance

- [ ] Light and dark appearance both render legibly (System Settings →
  Appearance toggle while the app is open).
- [ ] Window resizing: no horizontal overflow in Chat, Files, Changes at
  900×600 minimum size.

## Sign-off

| Item block | Tester | Date | Result |
|---|---|---|---|
| Native interaction | | | |
| Visual / appearance | | | |
