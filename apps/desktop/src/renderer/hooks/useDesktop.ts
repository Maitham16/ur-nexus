import { useEffect } from 'react'
import type { RuntimeEvent } from '../../shared/ipc.js'

export function useDesktop() {
  if (typeof window === 'undefined' || !window.urDesktop) {
    return null
  }
  return window.urDesktop
}

export function useRuntimeEvents(callback: (event: RuntimeEvent) => void) {
  const desktop = useDesktop()
  useEffect(() => {
    if (!desktop) return
    return desktop.subscribe('runtime:event', callback)
  }, [desktop, callback])
}
