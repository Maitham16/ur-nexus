import { test, expect, afterAll, beforeAll } from 'bun:test'
import { rmSync, cpSync, realpathSync, lstatSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execSync } from 'node:child_process'

const STANDALONE_PATH = path.join(os.tmpdir(), `ur-desktop-standalone-test-${process.pid}`)
let STANDALONE_DIR = STANDALONE_PATH
const DESKTOP_DIR = path.resolve(import.meta.dir, '..')
const ROOT_EXCLUDES = ['node_modules', 'dist', '.ur', '.git']

function findFiles(dir, filter) {
  const out = []
  const fs = require('node:fs')
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    const rel = path.relative(STANDALONE_DIR, full)
    if (rel) {
      const parts = rel.split(path.sep)
      if (ROOT_EXCLUDES.some(ex => parts.includes(ex) || rel.includes(`${path.sep}${ex}`))) continue
    }
    if (entry.isDirectory()) {
      out.push(...findFiles(full, filter))
    } else if (!entry.isSymbolicLink()) {
      if (filter(full, entry)) out.push(full)
    } else {
      try {
        if (filter(full, entry)) out.push(full)
      } catch {
        // Skip broken symlinks.
      }
    }
  }
  return out
}

function isExcluded(src) {
  const rel = path.relative(DESKTOP_DIR, src)
  if (!rel) return false
  return ROOT_EXCLUDES.some(ex => {
    const normalized = path.normalize(rel)
    return normalized === ex || normalized.startsWith(`${ex}${path.sep}`) || normalized.includes(`${path.sep}${ex}${path.sep}`) || normalized.endsWith(`${path.sep}${ex}`)
  })
}

beforeAll(() => {
  rmSync(STANDALONE_PATH, { recursive: true, force: true })
  cpSync(DESKTOP_DIR, STANDALONE_PATH, {
    recursive: true,
    filter: (src) => !isExcluded(src),
  })
  STANDALONE_DIR = realpathSync(STANDALONE_PATH)
})

afterAll(() => {
  rmSync(STANDALONE_PATH, { recursive: true, force: true })
})

test('standalone copy has no symlinks pointing outside the package', () => {
  const bad = findFiles(STANDALONE_DIR, (full, entry) => {
    if (!entry.isSymbolicLink()) return false
    const target = realpathSync(full)
    const rel = path.relative(STANDALONE_DIR, target)
    return rel.startsWith('..') || path.isAbsolute(target)
  })
  expect(bad).toEqual([])
})

test('standalone package.json has no workspace dependencies', () => {
  const pkgPath = path.join(STANDALONE_DIR, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }
  for (const [name, version] of Object.entries(allDeps)) {
    expect(version).not.toMatch(/^workspace:/)
    expect(version).not.toMatch(/^file:\.\.\//)
  }
})

test('standalone tsconfig does not alias to outside package', () => {
  const tsconfigPath = path.join(STANDALONE_DIR, 'tsconfig.json')
  const tsconfigBuildPath = path.join(STANDALONE_DIR, 'tsconfig.build.json')
  for (const p of [tsconfigPath, tsconfigBuildPath]) {
    if (!existsSync(p)) continue
    const text = readFileSync(p, 'utf-8')
    expect(text).not.toMatch(/\.\.\/\.\.\/\.\.\//)
    expect(text).not.toMatch(/packages\/agent-runtime/)
  }
})

test('standalone copy builds successfully', () => {
  // Remove any lockfiles or package-manager caches from the copied source so
  // the install is fully local and does not resolve through the monorepo.
  rmSync(path.join(STANDALONE_DIR, 'bun.lockb'), { force: true })
  rmSync(path.join(STANDALONE_DIR, '.bun'), { recursive: true, force: true })
  const installTemp = path.join(STANDALONE_DIR, '.install-tmp')
  mkdirSync(installTemp, { recursive: true })
  let installError
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      execSync('bun install --no-cache', {
        cwd: STANDALONE_DIR,
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'development',
          TMPDIR: installTemp,
          TMP: installTemp,
          TEMP: installTemp,
        },
      })
      installError = undefined
      break
    } catch (error) {
      installError = error
      rmSync(path.join(STANDALONE_DIR, 'node_modules'), { recursive: true, force: true })
      mkdirSync(installTemp, { recursive: true })
    }
  }
  if (installError) throw installError
  execSync('bun run build', { cwd: STANDALONE_DIR, stdio: 'inherit' })
}, 300000)

test('standalone copy has no external symlinks', () => {
  const bad = findFiles(STANDALONE_DIR, (full, entry) => {
    if (!entry.isSymbolicLink()) return false
    // Bun uses relative symlinks inside node_modules; these resolve within
    // the standalone directory when no workspace root is involved.
    const target = realpathSync(full)
    const rel = path.relative(STANDALONE_DIR, target)
    const outside = rel.startsWith('..') || (path.isAbsolute(target) && !target.startsWith(STANDALONE_DIR))
    return outside
  })
  expect(bad).toEqual([])
})

test('standalone build has no unresolved @ur/agent-runtime references outside vendor', () => {
  const bad = findFiles(STANDALONE_DIR, (full, entry) => {
    if (entry.isDirectory() || entry.isSymbolicLink()) return false
    if (full.includes('vendor/agent-runtime') || full.includes('node_modules')) return false
    if (full.endsWith('test/standalone.test.mjs')) return false
    if (full.endsWith('src/types/agent-runtime-stub.d.ts')) return false
    if (!/\.(m?js|ts|tsx)$/.test(full)) return false
    const text = readFileSync(full, 'utf-8')
    // Allow path-mapped imports (tsconfig resolves @ur/agent-runtime to local vendor).
    // Only flag actual runtime import/require strings that would need a node_modules package.
    const literalImport = /(?:from\s+['\"]|import\(|require\()['\"]@ur\/agent-runtime['\"]/
    const typeOnlyImport = /import\(['\"]@ur\/agent-runtime['\"]\)\./
    return literalImport.test(text) && !typeOnlyImport.test(text)
  })
  expect(bad).toEqual([])
})
