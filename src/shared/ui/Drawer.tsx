import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { X } from 'lucide-react'

import { cn } from '@/shared/lib/cn'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function Drawer({ open, onClose, title, description, children, footer, size = 'lg' }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const drawer = drawerRef.current
    const firstFocusable = drawer?.querySelector<HTMLElement>(focusableSelector)
    firstFocusable?.focus()
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !drawer) return
      const focusable = [...drawer.querySelectorAll<HTMLElement>(focusableSelector)]
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 90 }} role="presentation">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-ink-950/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="關閉詳細資料"
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={cn(
          'absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-float',
          'animate-[toast-in_220ms_ease-out_both]',
          size === 'lg' ? 'max-w-2xl' : 'max-w-lg',
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-7">
          <div>
            <h2 id={titleId} className="text-xl font-bold tracking-tight text-ink-950">{title}</h2>
            {description && <p id={descriptionId} className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink-900"
            aria-label="關閉"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className="scrollbar-thin flex-1 overflow-y-auto p-5 sm:p-7">{children}</div>
        {footer && <footer className="border-t border-line bg-white px-5 py-4 sm:px-7">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}