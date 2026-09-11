import { getRiskLabel, machineStatusMeta } from '@/domains/machines/model/machine.selectors'
import type { Machine } from '@/domains/machines/model/machine.schema'
import { cn } from '@/shared/lib/cn'
import { formatNumber } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'
import { ProgressBar } from '@/shared/ui/ProgressBar'

interface MachineCardProps {
  machine: Machine
  onSelect: (machine: Machine) => void
  featured?: boolean
}

export function MachineCard({ machine, onSelect, featured = false }: MachineCardProps) {
  const status = machineStatusMeta[machine.status]
  const risk = getRiskLabel(machine.riskPercent)
  const riskTone = machine.riskPercent >= 70 ? 'danger' : machine.riskPercent >= 40 ? 'warning' : 'brand'

  return (
    <button
      type="button"
      onClick={() => onSelect(machine)}
      className={cn(
        'group w-full rounded-2xl border bg-white p-5 text-left shadow-card transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg',
        featured ? 'border-brand-200 ring-1 ring-brand-100' : 'border-line',
      )}
      aria-label={`查看 ${machine.name} 詳細資料`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-slate-400">{machine.code}</p>
          <h3 className="mt-1 truncate text-base font-semibold text-ink-950 group-hover:text-brand-700">{machine.name}</h3>
          <p className="mt-1 truncate text-xs text-slate-500">{machine.area}</p>
        </div>
        <Badge tone={status.tone} dot>{status.label}</Badge>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-[10px] font-medium text-slate-400">轉速</p>
          <p className="font-mono text-sm font-semibold text-ink-900">{formatNumber(machine.rpm)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-[10px] font-medium text-slate-400">負載</p>
          <p className="font-mono text-sm font-semibold text-ink-900">{machine.loadPercent}%</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-[10px] font-medium text-slate-400">溫度</p>
          <p className="font-mono text-sm font-semibold text-ink-900">{machine.temperature}°</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">AI 風險</span>
          <span className={cn(
            'font-mono font-semibold',
            riskTone === 'danger' ? 'text-red-600' : riskTone === 'warning' ? 'text-amber-700' : 'text-brand-700',
          )}>
            {risk.label} · {machine.riskPercent}%
          </span>
        </div>
        <ProgressBar value={machine.riskPercent} tone={riskTone} label={`${machine.name} AI 風險 ${machine.riskPercent}%`} />
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4 text-xs">
        <span className="text-slate-500">{machine.operator ? `操作人員 · ${machine.operator}` : '目前無人操作'}</span>
      </div>
    </button>
  )
}