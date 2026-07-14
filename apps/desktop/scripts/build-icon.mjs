#!/usr/bin/env node
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.resolve(__dirname, '..', 'assets')
const svgPath = path.join(assetsDir, 'icon.svg')
const icnsCheckPath = path.join(assetsDir, 'icon.icns')

const sizes = [16, 32, 64, 128, 256, 512, 1024]

// Icon regeneration needs the optional `sharp` rasterizer. The generated
// .icns/.png assets are committed, so a standalone build without sharp
// simply reuses them instead of failing the packaging pipeline.
let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  if (fs.existsSync(icnsCheckPath)) {
    console.log('sharp not installed; using committed assets/icon.icns')
    process.exit(0)
  }
  console.error(
    'sharp is not installed and assets/icon.icns is missing. Install sharp to generate icons.',
  )
  process.exit(1)
}

async function main() {
  if (!fs.existsSync(svgPath)) {
    throw new Error(`Missing icon source: ${svgPath}`)
  }

  // Generate PNG icons for Electron builder and DMG
  for (const size of sizes) {
    const out = path.join(assetsDir, `icon-${size}.png`)
    await sharp(svgPath, { density: Math.max(72, (size / 1024) * 300) })
      .resize(size, size)
      .png()
      .toFile(out)
    console.log(`Generated ${out}`)
  }

  // Generate macOS .icns via iconset
  const iconsetDir = path.join(assetsDir, 'icon.iconset')
  fs.mkdirSync(iconsetDir, { recursive: true })

  const iconsetSizes = [
    [16, '16x16'],
    [32, '16x16@2x'],
    [32, '32x32'],
    [64, '32x32@2x'],
    [128, '128x128'],
    [256, '128x128@2x'],
    [256, '256x256'],
    [512, '256x256@2x'],
    [512, '512x512'],
    [1024, '512x512@2x'],
  ]
  for (const [size, name] of iconsetSizes) {
    const out = path.join(iconsetDir, `icon_${name}.png`)
    await sharp(svgPath, { density: Math.max(72, (size / 1024) * 300) })
      .resize(size, size)
      .png()
      .toFile(out)
  }

  const icnsPath = path.join(assetsDir, 'icon.icns')
  try {
    execSync(`iconutil -c icns -o "${icnsPath}" "${iconsetDir}"`, { stdio: 'inherit' })
    console.log(`Generated ${icnsPath}`)
  } catch (error) {
    // Some macOS/iconutil versions reject otherwise valid PNG iconsets. A
    // committed, valid .icns is intentionally kept as a packaging fallback so
    // icon refreshes cannot make the entire desktop release pipeline fail.
    if (!fs.existsSync(icnsPath)) throw error
    console.warn('iconutil rejected the generated iconset; using the existing assets/icon.icns')
  }

  // Clean up intermediate iconset
  fs.rmSync(iconsetDir, { recursive: true, force: true })

  console.log('Icon assets ready.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
