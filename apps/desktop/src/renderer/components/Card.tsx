import type { ReactNode } from 'react'

export function Card({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="card">
      <div className="card-title">{title}</div>
      {children}
    </div>
  )
}
