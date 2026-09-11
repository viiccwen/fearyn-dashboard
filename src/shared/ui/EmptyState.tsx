import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
      {icon && <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">{icon}</span>}
      <h3 className={icon ? 'mt-4 font-semibold text-ink-900' : 'font-semibold text-ink-900'}>{title}</h3>
      <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}