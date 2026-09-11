import { cn } from '@/shared/lib/cn'

interface ProgressBarProps {
  value: number
  tone?: 'brand' | 'success' | 'warning' | 'danger'
  label: string
  className?: string
}

const tones = {
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
}

export function ProgressBar({ value, tone = 'brand', label, className }: ProgressBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, value))
  return (
    <div
      className={cn('h-1.5 overflow-hidden rounded-full bg-slate-100', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedValue}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-300', tones[tone])}
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  )
}