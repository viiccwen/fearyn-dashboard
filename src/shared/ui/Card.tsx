import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  padded?: boolean
}

export function Card({ children, padded = true, className, ...props }: CardProps) {
  return (
    <section
      className={cn('rounded-2xl border border-line bg-white shadow-card', padded && 'p-5 sm:p-6', className)}
      {...props}
    >
      {children}
    </section>
  )
}