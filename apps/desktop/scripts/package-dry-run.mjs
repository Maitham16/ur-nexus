import { spawnSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(
  await fs.readFile(path.join(root, 'package.json'), 'utf-8'),
)
const stage = await fs.mkdtemp(path.join(tmpdir(), 'ur-nexus-package-check-'))

try {
  await fs.writeFile(
    path.join(stage, 'package.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )
  for (const entry of manifest.files ?? []) {
    const source = path.join(root, entry)
    const destination = path.join(stage, entry)
    await fs.mkdir(path.dirname(destination), { recursive: true })
    await fs.cp(source, destination, {
      recursive: true,
      preserveTimestamps: true,
    })
  }

  const result = spawnSync(
    'npm',
    ['pack', '--dry-run', '--json', '--ignore-scripts'],
    {
      cwd: stage,
      env: process.env,
      encoding: 'utf-8',
      maxBuffer: 16 * 1024 * 1024,
    },
  )
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`npm pack dry-run exited with code ${result.status}`)
  }
} finally {
  await fs.rm(stage, { recursive: true, force: true })
}
