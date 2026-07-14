import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const stage = path.join(root, 'build', 'native-app')
const sourcePackage = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'))

// electron-builder requires Electron to be a development dependency because
// the Electron framework is embedded into a native app. The public npm package
// intentionally keeps Electron as a runtime dependency for its CLI launcher,
// so native packaging uses this generated, non-published manifest.
const nativePackage = {
  name: 'ur-nexus-desktop-native',
  version: sourcePackage.version,
  description: sourcePackage.description,
  author: sourcePackage.author,
  license: sourcePackage.license,
  main: 'dist/main/main.mjs',
  dependencies: Object.fromEntries(
    Object.entries(sourcePackage.dependencies).filter(([name]) =>
      !['electron', 'react', 'react-dom', 'react-router-dom'].includes(name),
    ),
  ),
  optionalDependencies: sourcePackage.optionalDependencies,
  devDependencies: {
    electron: sourcePackage.dependencies.electron,
  },
}

await fs.rm(stage, { recursive: true, force: true })
await Promise.all([
  fs.mkdir(path.join(stage, 'dist'), { recursive: true }),
  fs.mkdir(path.join(stage, 'assets'), { recursive: true }),
  fs.mkdir(path.join(stage, 'build'), { recursive: true }),
  fs.mkdir(path.join(stage, 'scripts'), { recursive: true }),
])
await Promise.all([
  fs.cp(path.join(root, 'dist', 'main'), path.join(stage, 'dist', 'main'), { recursive: true }),
  fs.cp(path.join(root, 'dist', 'preload'), path.join(stage, 'dist', 'preload'), { recursive: true }),
  fs.cp(path.join(root, 'dist', 'renderer'), path.join(stage, 'dist', 'renderer'), { recursive: true }),
  fs.copyFile(path.join(root, 'assets', 'icon.icns'), path.join(stage, 'assets', 'icon.icns')),
  fs.copyFile(
    path.join(root, 'build', 'entitlements.mac.plist'),
    path.join(stage, 'build', 'entitlements.mac.plist'),
  ),
  fs.copyFile(
    path.join(root, 'scripts', 'bundle-ripgrep.mjs'),
    path.join(stage, 'scripts', 'bundle-ripgrep.mjs'),
  ),
  fs.writeFile(path.join(stage, 'package.json'), `${JSON.stringify(nativePackage, null, 2)}\n`),
])
await fs.symlink(path.join(root, 'node_modules'), path.join(stage, 'node_modules'), 'dir')

console.log(`[native-build] prepared ${stage}`)
