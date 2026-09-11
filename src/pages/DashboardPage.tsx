import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { calculateFleetSummary } from '@/domains/analytics/model/fleet-analytics'
import { selectCriticalAlertCount, selectOpenAlertCount, useAlertStore } from '@/domains/alerts/model/alert.store'
import { machines } from '@/domains/machines/data/machines'
import { getRiskLabel, machineStatusMeta } from '@/domains/machines/model/machine.selectors'
import { useMachineStore } from '@/domains/machines/model/machine.store'
import { MachineDetailDrawer } from '@/domains/machines/ui/MachineDetailDrawer'
import { telemetryByMachine } from '@/domains/monitoring/data/telemetry'
import { cn } from '@/shared/lib/cn'
import { formatDateTime, formatNumber } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { MetricCard } from '@/shared/ui/MetricCard'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Sparkline } from '@/shared/ui/Sparkline'
import { useToastStore } from '@/shared/model/toast.store'

export default function DashboardPage() {
  const alerts = useAlertStore((state) => state.alerts)
  const openCount = useAlertStore(selectOpenAlertCount)
  const criticalCount = useAlertStore(selectCriticalAlertCount)
  const selectedMachineId = useMachineStore((state) => state.selectedMachineId)
  const selectMachine = useMachineStore((state) => state.selectMachine)
  const showToast = useToastStore((state) => state.showToast)
  const navigate = useNavigate()
  const selectedMachine = machines.find((machine) => machine.id === selectedMachineId) ?? null
  const summary = calculateFleetSummary(machines)
  const activeMachines = useMemo(
    () => [...machines].sort((left, right) => right.riskPercent - left.riskPercent).slice(0, 4),
    [],
  )
  const warningTelemetry = telemetryByMachine.get('cnc-b01')

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="機台總覽"
        description="第一實習工場目前有 5 台機台運行中；AI 偵測到 1 項高風險事件需要優先處理。"
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="關鍵監控指標">
        <MetricCard
          label="連線機台"
          value={`${summary.connected}/${summary.total}`}
          trend={{ direction: 'up', label: '87.5%' }}
        />
        <MetricCard
          label="平均健康度"
          value={`${summary.averageHealth}`}
          unit="分"
          trend={{ direction: 'up', label: '+3.2%' }}
        />
        <MetricCard
          label="設備稼動率"
          value={`${summary.utilization}`}
          unit="%"
          helper="今日 08:00 起"
          trend={{ direction: 'up', label: '+6.8%' }}
        />
        <MetricCard
          label="待處理告警"
          value={`${openCount}`}
          unit="件"
          helper={criticalCount ? `${criticalCount} 件高風險` : '無高風險事件'}
          trend={criticalCount ? { direction: 'up', label: '需處置', positive: false } : undefined}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-ink-950">機台即時狀態</h2>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/machines')}>查看全部</Button>
          </div>
          <div className="space-y-2">
            {activeMachines.map((machine) => {
              const status = machineStatusMeta[machine.status]
              const risk = getRiskLabel(machine.riskPercent)
              return (
                <button
                  key={machine.id}
                  type="button"
                  onClick={() => selectMachine(machine.id)}
                  className="group grid min-h-19 w-full grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-transparent bg-slate-50 px-4 py-3 text-left transition-all hover:border-brand-200 hover:bg-brand-50/50 sm:grid-cols-[1.2fr_0.65fr_0.65fr_auto]"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink-950 group-hover:text-brand-700">{machine.name}</span>
                    <span className="mt-1 block truncate font-mono text-[10px] text-slate-400">{machine.code} · {machine.operator ?? '無操作人員'}</span>
                  </span>
                  <span className="hidden sm:block">
                    <span className="block font-mono text-sm font-semibold text-ink-900">{formatNumber(machine.rpm)}</span>
                    <span className="block text-[10px] text-slate-400">RPM</span>
                  </span>
                  <span className="hidden sm:block">
                    <span className={cn('block font-mono text-sm font-semibold', machine.riskPercent >= 70 ? 'text-red-600' : 'text-ink-900')}>{machine.riskPercent}%</span>
                    <span className="block text-[10px] text-slate-400">{risk.label}</span>
                  </span>
                  <Badge tone={status.tone} dot>{status.label}</Badge>
                </button>
              )
            })}
          </div>
        </Card>

        <Card className="overflow-hidden xl:col-span-5" padded={false}>
          <div className="border-b border-line p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Badge tone="danger" dot>高風險事件</Badge>
                <h2 className="mt-3 text-lg font-bold text-ink-950">CNC-B01 振動特徵異常</h2>
              </div>
            </div>
          </div>
          <div className="px-5 pt-4 sm:px-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">高頻振動阻抗 · 12 秒</span>
              <span className="font-mono font-semibold text-red-600">4.82 mm/s</span>
            </div>
            <Sparkline data={warningTelemetry?.waveform ?? []} label="CNC-B01 高頻振動明顯超出正常區間" color="danger" height={146} className="mt-2" />
          </div>
          <div className="m-5 mt-3 rounded-2xl bg-red-50 p-4 sm:mx-6 sm:mb-6">
            <div>
                <p className="text-sm font-semibold text-red-900">AI 建議立即停機檢查</p>
                <p className="mt-1 text-xs leading-5 text-red-800">高頻震動與負載同步上升，可能為刀具崩刃或夾治具鬆脫。</p>
                <button type="button" onClick={() => selectMachine('cnc-b01')} className="mt-3 inline-flex min-h-9 items-center rounded-lg bg-red-600 px-3 text-xs font-semibold text-white transition-colors hover:bg-red-700">
                  開啟機台詳情
                </button>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-12">
          <h2 className="text-lg font-bold tracking-tight text-ink-950">現場洞察</h2>
          <div className="mt-5">
            <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
              <div className="text-sm font-semibold text-brand-900">參數優化機會</div>
              <p className="mt-2 text-sm leading-6 text-slate-700">LATHE-02 若將進給率下修 8%，預估可降低 12% 刀具磨耗，節拍僅增加 46 秒。</p>
              <button type="button" onClick={() => selectMachine('lathe-02')} className="mt-3 text-xs font-semibold text-brand-700 hover:text-brand-900">檢視建議依據</button>
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-12">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-ink-950">近期告警</h2>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/alerts')}>告警中心</Button>
          </div>
          <div className="space-y-1">
            {alerts.filter((alert) => alert.status !== 'resolved').slice(0, 3).map((alert) => (
              <button key={alert.id} type="button" onClick={() => navigate('/alerts')} className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-slate-50">
                <span className={cn('mt-1 size-2 shrink-0 rounded-full', alert.severity === 'critical' ? 'bg-red-500' : alert.severity === 'warning' ? 'bg-amber-500' : 'bg-brand-500')} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-900">{alert.title}</span>
                  <span className="mt-1 block text-xs text-slate-500">{alert.machineCode} · {formatDateTime(alert.occurredAt)}</span>
                </span>
                {alert.status === 'new' && <span className="mt-1.5 size-1.5 rounded-full bg-brand-500" aria-label="新告警" />}
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-3 text-xs font-medium text-emerald-800">過去 24 小時，安全機制成功攔截 1 次高風險加工。</div>
        </Card>
      </div>

      <MachineDetailDrawer
        machine={selectedMachine}
        onClose={() => selectMachine(null)}
        onCreateInspection={(machine) => showToast('巡檢任務已建立', { description: `${machine.code} 已指派給設備管理員，預計 10 分鐘內回報。` })}
      />
    </div>
  )
}