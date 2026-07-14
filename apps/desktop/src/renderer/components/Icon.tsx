import type { ReactNode, SVGProps } from 'react'

export type IconName =
  | 'agents'
  | 'alert'
  | 'branch'
  | 'chat'
  | 'check'
  | 'chevron-down'
  | 'chevron-left'
  | 'clock'
  | 'command'
  | 'download'
  | 'file'
  | 'files'
  | 'folder'
  | 'history'
  | 'layers'
  | 'panel'
  | 'paperclip'
  | 'pause'
  | 'plan'
  | 'plug'
  | 'plus'
  | 'search'
  | 'send'
  | 'settings'
  | 'shield'
  | 'sparkles'
  | 'stop'
  | 'terminal'
  | 'tool'
  | 'x'

const paths: Record<IconName, ReactNode> = {
  agents: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  branch: <path d="M6 3v12M18 9a4 4 0 0 1-4 4H6M15 6l3 3-3 3M3 3h6" />,
  chat: (
    <>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
      <path d="M8 9h8M8 13h5" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-left': <path d="m15 18-6-6 6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  command: (
    <>
      <path d="M9 6V5a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v14a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3Z" />
    </>
  ),
  download: <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 21h16" />,
  file: (
    <>
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v5h5" />
    </>
  ),
  files: (
    <>
      <path d="M8 3H4v16h12v-4" />
      <path d="M10 1h7l3 3v13H10z" />
      <path d="M17 1v4h4" />
    </>
  ),
  folder: <path d="M3 5h6l2 2h10v12H3z" />,
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </>
  ),
  layers: <path d="m12 2 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5M3 17l9 5 9-5" />,
  panel: <path d="M3 4h18v16H3zM9 4v16" />,
  paperclip: <path d="m21.4 11.6-8.9 8.9a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 1 1 5.7 5.7l-9.2 9.2a2 2 0 1 1-2.8-2.8l8.5-8.5" />,
  pause: <path d="M8 5v14M16 5v14" />,
  plan: (
    <>
      <path d="M9 5h11M9 12h11M9 19h11" />
      <circle cx="4" cy="5" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="19" r="1" />
    </>
  ),
  plug: <path d="M12 22v-5M9 8V2M15 8V2M18 8v4a6 6 0 0 1-12 0V8Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  send: <path d="m5 12 14-8-4 16-3-6-7-2Zm7 2 7-10" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-4" />,
  sparkles: <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3ZM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Zm14-2 .8 2.2 2.2.8-2.2.8L19 19l-.8-2.2L16 16l2.2-.8L19 13Z" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  terminal: <path d="m5 7 4 4-4 4M11 17h8" />,
  tool: <path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 8.6 7 6.3 4.7a4 4 0 0 0 5 5L4 17l3 3 7.7-7.3a4 4 0 0 0 0-6.4Z" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
}

export function Icon({
  name,
  size = 18,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      {...props}
    >
      {paths[name]}
    </svg>
  )
}
