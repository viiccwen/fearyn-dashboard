import type { Machine } from '@/domains/machines/model/machine.schema'
import { machineStatusMeta } from '@/domains/machines/model/machine.selectors'
import { telemetryByMachine } from '@/domains/monitoring/data/telemetry'
import { useLiveMachine } from '@/domains/monitoring/model/use-live-machine'
import { formatDecimal, formatNumber } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Drawer } from '@/shared/ui/Drawer'
import { ProgressBar } from '@/shared/ui/ProgressBar'
import { Sparkline } from '@/shared/ui/Sparkline'

interface MachineDetailDrawerProps {
  machine: Machine | null
  onClose: () => void
  onCreateInspection?: (machine: Machine) => void
}

export function MachineDetailDrawer({ machine, onClose, onCreateInspection }: MachineDetailDrawerProps) {
  const telemetry = useLiveMachine(machine?.id ?? '')
  const status = machine ? machineStatusMeta[machine.status] : null
  const isCritical = (machine?.riskPercent ?? 0) >= 70
  const baselineWaveform = machine ? telemetryByMachine.get(machine.id)?.waveform ?? [] : []
  const waveformCeiling = Math.max(
    10,
    Math.ceil((Math.max(...baselineWaveform, 1) * 1.15) / 10) * 10,
  )

  return (
    <Drawer
      open={Boolean(machine)}
      onClose={onClose}
      title={machine?.name ?? '機台詳細資料'}
      description={machine ? `${machine.code} · ${machine.area}` : undefined}
      footer={machine && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>返回機台列表</Button>
          <Button onClick={() => onCreateInspection?.(machine)}>建立巡檢任務</Button>
        </div>
      )}
    >
      {machine && telemetry && status && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={status.tone} dot>{status.label}</Badge>
            <Badge tone={isCritical ? 'danger' : 'success'}>AI 風險 {machine.riskPercent}%</Badge>
            <span className="ml-auto inline-flex items-center gap-2 text-xs font-medium text-emerald-700">
              <span className="live-pulse size-2 rounded-full bg-emerald-500" aria-hidden="true" />
              0.5 秒即時更新
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: '主軸轉速', value: formatNumber(telemetry.spindleSpeed), unit: 'RPM' },
              { label: '即時切削力', value: formatDecimal(telemetry.cuttingForce), unit: 'N' },
              { label: '刀具磨耗', value: formatDecimal(telemetry.toolWearPercent), unit: '%' },
              { label: '即時能耗', value: formatDecimal(telemetry.energyKw), unit: 'kW' },
            ].map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-line bg-slate-50 p-3.5">
                <p className="text-xs text-slate-500">{metric.label}</p>
                <p className="mt-2 font-mono text-lg font-semibold text-ink-950">
                  {metric.value}<span className="ml-1 text-[10px] text-slate-400">{metric.unit}</span>
                </p>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-line p-4 sm:p-5">
            <p className="text-sm font-semibold text-ink-900">高頻振動阻抗 · 最近 12 秒</p>
            <Sparkline
              data={telemetry.waveform}
              label={`${machine.name} 最近 12 秒高頻振動波形`}
              color={isCritical ? 'danger' : 'brand'}
              height={156}
              domain={[0, waveformCeiling]}
              className="mt-4"
            />
          </section>

          <section className={isCritical ? 'rounded-2xl border border-red-200 bg-red-50 p-5' : 'rounded-2xl border border-brand-200 bg-brand-50 p-5'}>
            <div>
                <h3 className={isCritical ? 'font-semibold text-red-900' : 'font-semibold text-brand-900'}>
                  {isCritical ? '需要立即處置' : 'AI 即時優化建議'}
                </h3>
                <p className={isCritical ? 'mt-1.5 text-sm leading-6 text-red-800' : 'mt-1.5 text-sm leading-6 text-brand-900'}>
                  {isCritical
                    ? '高頻振動與主軸負載同步升高。建議暫停加工，優先檢查刀具崩刃、筒夾鎖固與工件夾持。'
                    : '加工狀態穩定，建議維持目前切削參數；表面品質達標機率為 96%，本工序預計可提前 3 分鐘完成。'}
                </p>
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">感測層健康狀態</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { key: 'vibration' as const, label: '振動' },
                { key: 'sound' as const, label: '聲音' },
                { key: 'current' as const, label: '電流' },
                { key: 'vision' as const, label: '影像' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2 rounded-xl border border-line px-3 py-3">
                  <span className="text-xs font-medium text-slate-700">{label}</span>
                  <span className={machine.sensors[key] ? 'ml-auto size-2 rounded-full bg-emerald-500' : 'ml-auto size-2 rounded-full bg-slate-300'} aria-label={machine.sensors[key] ? '正常' : '未安裝'} />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-ink-950 p-5 text-white">
            <div className="text-sm font-semibold">目前工序</div>
            <p className="mt-3 text-base font-semibold">{machine.currentJob ?? '目前沒有排定工序'}</p>
            {machine.currentJob && (
              <>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>工序進度</span><span className="font-mono text-white">{machine.progressPercent}%</span>
                </div>
                <ProgressBar value={machine.progressPercent} label="目前工序進度" className="mt-2 bg-white/10" />
              </>
            )}
          </section>
        </div>
      )}
    </Drawer>
  )
}