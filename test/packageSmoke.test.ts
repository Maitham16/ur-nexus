import { describe, expect, test } from 'bun:test'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const repoRoot = join(import.meta.dir, '..')
const nodeBin = process.env.NODE_BIN || 'node'
const bunBin = process.env.BUN_BIN || process.execPath

function readPackageJson(path = repoRoot) {
  return JSON.parse(readFileSync(join(path, 'package.json'), 'utf8'))
}

function packAndExtract(): string {
  const tmp = mkdtempSync(join(tmpdir(), 'ur-package-smoke-'))
  const packOutput = execFileSync(
    'npm',
    ['pack', '--ignore-scripts', '--pack-destination', tmp, '--json'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        npm_config_cache: join(tmp, 'npm-cache'),
      },
    },
  )
  const packed = JSON.parse(packOutput)[0]
  const tarball = join(tmp, packed.filename)
  const extractDir = join(tmp, 'extract')
  execFileSync('mkdir', ['-p', extractDir])
  execFileSync('tar', ['-xzf', tarball, '-C', extractDir])
  return join(extractDir, 'package')
}

function runPackagedBin(packageRoot: string, args: string[]) {
  return spawnSync(nodeBin, [join(packageRoot, 'bin', 'ur.js'), ...args], {
    cwd: packageRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      BUN_BIN: bunBin,
      UR_CONFIG_DIR: mkdtempSync(join(tmpdir(), 'ur-package-config-')),
      OPENAI_API_KEY: '',
      ANTHROPIC_API_KEY: '',
      GEMINI_API_KEY: '',
      OPENROUTER_API_KEY: '',
    },
  })
}

describe('package runtime contract', () => {
  test('package metadata declares Bun runtime and sharp runtime dependency', () => {
    const pkg = readPackageJson()
    expect(pkg.packageManager).toStartWith('bun@')
    expect(pkg.engines?.node).toBeDefined()
    expect(pkg.engines?.bun).toBeDefined()
    expect(pkg.dependencies?.sharp).toBeDefined()
    expect(pkg.devDependencies?.sharp).toBeUndefined()
  })

  test('launcher reports a precise missing-Bun runtime error', () => {
    const result = spawnSync(nodeBin, [join(repoRoot, 'bin', 'ur.js'), '--version'], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        BUN_BIN: join(tmpdir(), 'ur-missing-bun'),
      },
    })

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('UR-AGENT requires Bun')
    expect(result.stderr).toContain('Bun >=1.3')
    expect(result.stderr).toContain('BUN_BIN')
  })

  test('packed package bin starts for version/help/doctor and reports missing API key cleanly', () => {
    const packageRoot = packAndExtract()
    try {
      const pkg = readPackageJson(packageRoot)

      const version = runPackagedBin(packageRoot, ['--version'])
      expect(version.status).toBe(0)
      expect(version.stdout.trim()).toBe(`${pkg.version} (UR-AGENT)`)

      const help = runPackagedBin(packageRoot, ['--help'])
      expect(help.status).toBe(0)
      expect(help.stdout).toContain('Usage: ur')

      const doctorHelp = runPackagedBin(packageRoot, ['doctor', '--help'])
      expect(doctorHelp.status).toBe(0)
      expect(doctorHelp.stdout).toContain('Usage: ur doctor')

      const providerDoctor = runPackagedBin(packageRoot, [
        'provider',
        'doctor',
        'openai-api',
        '--json',
      ])
      expect(providerDoctor.status).toBe(1)
      const body = JSON.parse(providerDoctor.stdout)
      expect(body.failureReason).toBe('API key missing')
      expect(body.suggestedFix).toContain('OPENAI_API_KEY')

      expect(pkg.dependencies?.sharp).toBeDefined()
    } finally {
      rmSync(packageRoot.split('/extract/package')[0], {
        recursive: true,
        force: true,
      })
    }
  })
})
