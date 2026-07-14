/**
 * Globals the vendored agent-runtime expects its host to define. The CLI
 * entrypoint sets these at startup; the desktop main process must do the
 * same before any runtime code executes. Import this module first.
 */

// Kept in sync with package.json by src/main/vendorGlobals.test.ts.
export const APP_VERSION = '1.0.5'

interface VendorMacro {
  VERSION: string
  BUILD_TIME: string
  FEEDBACK_CHANNEL: string
  ISSUES_EXPLAINER: string
  PACKAGE_URL: string
  VERSION_CHANGELOG: string
}

const globals = globalThis as typeof globalThis & { MACRO?: VendorMacro }

if (!globals.MACRO) {
  globals.MACRO = {
    VERSION: APP_VERSION,
    BUILD_TIME: new Date().toISOString(),
    FEEDBACK_CHANNEL: 'https://github.com/Maitham16/ur-nexus/issues',
    ISSUES_EXPLAINER:
      'report the issue at https://github.com/Maitham16/ur-nexus/issues',
    PACKAGE_URL: 'https://github.com/Maitham16/ur-nexus',
    VERSION_CHANGELOG: 'https://github.com/Maitham16/ur-nexus/blob/master/CHANGELOG.md',
  }
}
