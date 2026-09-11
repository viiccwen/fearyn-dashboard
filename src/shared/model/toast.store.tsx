import { X } from 'lucide-react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

type ToastTone = 'success' | 'info'

interface ToastMessage {
  id: number
  title: string
  description?: string
  tone: ToastTone
}

interface ToastStore {
  toast: ToastMessage | null
  showToast: (title: string, options?: { description?: string; tone?: ToastTone }) => void
  dismissToast: () => void
}

let dismissTimer: number | undefined

export const useToastStore = create<ToastStore>()(
  devtools(
    (set) => ({
      toast: null,
      showToast: (title, options) => {
        const toast = {
          id: Date.now(),
          title,
          description: options?.description,
          tone: options?.tone ?? 'success',
        }
        window.clearTimeout(dismissTimer)
        set({ toast }, false, 'toast/show')
        dismissTimer = window.setTimeout(() => set({ toast: null }, false, 'toast/autoDismiss'), 4200)
      },
      dismissToast: () => {
        window.clearTimeout(dismissTimer)
        set({ toast: null }, false, 'toast/dismiss')
      },
    }),
    { name: 'Fearyn Toast' },
  ),
)

export function ToastViewport() {
  const toast = useToastStore((state) => state.toast)
  const dismissToast = useToastStore((state) => state.dismissToast)

  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-24 flex justify-end md:bottom-6"
      style={{ zIndex: 100 }}
      aria-live="polite"
    >
      {toast && (
        <div className="animate-toast pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-line bg-white p-4 shadow-float">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink-900">{toast.title}</p>
            {toast.description && <p className="mt-1 text-xs leading-5 text-slate-500">{toast.description}</p>}
          </div>
          <button
            type="button"
            onClick={dismissToast}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="關閉通知"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}