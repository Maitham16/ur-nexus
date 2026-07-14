// electron-builder afterPack hook: harden generated macOS metadata and copy
// the resolved ripgrep binary into the app. Electron's base Info.plist enables
// broad transport access and includes unused camera/microphone/Bluetooth
// prompts; a code agent should request none of those capabilities.
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

const require = createRequire(import.meta.url)

/** @param {{ appOutDir: string, packager: { appInfo: { productFilename: string } }, electronPlatformName: string }} context */
export default async function afterPack(context) {
  if (context.electronPlatformName !== 'darwin') return

  const appName = context.packager.appInfo.productFilename
  const appDir = path.join(context.appOutDir, `${appName}.app`)
  const infoPlist = path.join(appDir, 'Contents', 'Info.plist')
  const plistBuddy = '/usr/libexec/PlistBuddy'
  const updatePlist = command =>
    spawnSync(plistBuddy, ['-c', command, infoPlist], { stdio: 'ignore' })

  for (const key of [
    'NSBluetoothAlwaysUsageDescription',
    'NSBluetoothPeripheralUsageDescription',
    'NSCameraUsageDescription',
    'NSMicrophoneUsageDescription',
  ]) {
    updatePlist(`Delete :${key}`)
  }
  updatePlist('Delete :NSAppTransportSecurity')
  updatePlist('Add :NSAppTransportSecurity dict')
  updatePlist('Add :NSAppTransportSecurity:NSAllowsArbitraryLoads bool false')
  updatePlist('Add :NSAppTransportSecurity:NSAllowsLocalNetworking bool true')
  console.log(`[bundle-security] hardened ${infoPlist}`)

  let rgPath
  try {
    rgPath = require('@vscode/ripgrep').rgPath
  } catch (err) {
    console.warn(
      `[bundle-ripgrep] could not resolve @vscode/ripgrep: ${err.message}; app will use the internal search engine`,
    )
    return
  }
  if (!rgPath || !fs.existsSync(rgPath)) {
    console.warn(
      `[bundle-ripgrep] resolved rg path does not exist (${rgPath}); app will use the internal search engine`,
    )
    return
  }

  const resourcesDir = path.join(appDir, 'Contents', 'Resources')
  const binDir = path.join(resourcesDir, 'bin')
  fs.mkdirSync(binDir, { recursive: true })
  const dest = path.join(binDir, 'rg')
  fs.copyFileSync(rgPath, dest)
  fs.chmodSync(dest, 0o755)
  console.log(`[bundle-ripgrep] copied ${rgPath} -> ${dest}`)
}
