// Fixture: starts a real run, completes a real Write tool action, then
// exits abruptly while the run state is still `running` — simulating the
// app quitting mid-run. Invoked as a subprocess by the resume test.
//
//   bun test/fixtures/interruptedRun.fixture.ts <projectDir>
//
// UR_DESKTOP_DATA_DIR must point at the test's temporary data directory.
import {
  setRendererEmitter,
  respondApproval,
  openProjectAndCache,
  startRun,
  executeTool,
} from '../../src/main/runtime.js'
import { patchRunState, flushRunStates } from '../../src/main/sessions/runState.js'

const projectDir = process.argv[2]
if (!projectDir || !process.env.UR_DESKTOP_DATA_DIR) {
  console.error('usage: UR_DESKTOP_DATA_DIR=… bun interruptedRun.fixture.ts <projectDir>')
  process.exit(2)
}

setRendererEmitter((_root, event) => {
  const e = event as { type?: string; requestId?: string }
  if (e.type === 'approval_required' && e.requestId) {
    setImmediate(() => respondApproval(e.requestId!, true, 'run'))
  }
})

await openProjectAndCache(projectDir)
const { runId } = await startRun(projectDir)

// The prompt that was in flight when the app "crashed". The continuation
// step is deliberately tool-free so the live resume test completes quickly.
patchRunState(runId, {
  pendingPrompt:
    'Create hello.txt containing the marker text, then confirm completion by replying with exactly the word: finished. Do not use any tools for the confirmation.',
})

const result = (await executeTool(runId, 'Write', {
  path: 'hello.txt',
  content: 'marker-content-from-first-run\n',
})) as { written?: boolean }

if (!result.written) {
  console.error('fixture failed: Write tool did not execute')
  process.exit(3)
}

await flushRunStates()
console.log(`FIXTURE_RUN_ID=${runId}`)
// Abrupt exit: no finish/failure transition — state remains `running`.
process.exit(0)
