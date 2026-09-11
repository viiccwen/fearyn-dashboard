import { cn } from '@/shared/lib/cn'

interface MetricCardProps {
  label: string
  value: string
  unit?: string
  helper?: string
  trend?: { direction: 'up' | 'down'; label: string; positive?: boolean }
}

export function MetricCard({ label, value, unit, helper, trend }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-ink-950 sm:text-[1.75rem]">
        {value}
        {unit && <span className="ml-1.5 text-sm font-medium text-slate-500">{unit}</span>}
      </p>
      {(trend || helper) && <div className="mt-4 flex items-center gap-2 text-xs">
        {trend && (
          <span
            className={cn(
              'font-semibold',
              trend.positive === false ? 'text-red-600' : 'text-emerald-700',
            )}
          >
            {trend.label}
          </span>
        )}
        {helper && <span className="text-slate-500">{helper}</span>}
      </div>}
    </article>
  )
}