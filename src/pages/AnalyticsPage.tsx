import { useMemo } from 'react'

import { useAnalyticsStore } from '@/domains/analytics/model/analytics.store'
import { energyTrend, oeeTrend } from '@/domains/analytics/model/fleet-analytics'
import { machines } from '@/domains/machines/data/machines'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { MetricCard } from '@/shared/ui/MetricCard'
import { PageHeader } from '@/shared/ui/PageHeader'
import { ProgressBar } from '@/shared/ui/ProgressBar'
import { SegmentedControl } from '@/shared/ui/SegmentedControl'
import { Sparkline } from '@/shared/ui/Sparkline'
import { useToastStore } from '@/shared/model/toast.store'

const rangeOptions = [
  { label: '24 小時', value: '24h' as const },
  { label: '7 天', value: '7d' as const },
  { label: '30 天', value: '30d' as const },
]

const metricByRange = {
  '24h': { oee: '86.4', uptime: '93.1', quality: '97.8', energy: '1.18' },
  '7d': { oee: '83.6', uptime: '91.8', quality: '96.9', energy: '1.24' },
  '30d': { oee: '81.2', uptime: '90.4', quality: '96.1', energy: '1.31' },
}

const downtimeReasons = [
  { label: '換線與工件設定', value: 38, color: 'bg-brand-500' },
  { label: '預防性保養', value: 27, color: 'bg-sky-400' },
  { label: '待料／待課程', value: 21, color: 'bg-amber-400' },
  { label: '異常處置', value: 14, color: 'bg-red-400' },
]

function downloadAnalyticsCsv() {
  const rows = [
    ['機台編號', '機台名稱', '健康度', '平均負載', 'AI 風險'],
    ...machines.map((machine) => [
      machine.code,
      machine.name,
      machine.healthPercent,
      machine.loadPercent,
      machine.riskPercent,
    ]),
  ]
  const csv = `\uFEFF${rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n')}`
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'fearyn-fleet-analytics-2026-09-11.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function AnalyticsPage() {
  const range = useAnalyticsStore((state) => state.range)
  const setRange = useAnalyticsStore((state) => state.setRange)
  const showToast = useToastStore((state) => state.showToast)
  const metrics = metricByRange[range]
  const oeeValues = useMemo(() => {
    const base = oeeTrend.map((point) => point.value)
    if (range === '24h') return [79, 78, 82, 81, 84, 83, 85, 84, 86, 87, 85, 86]
    if (range === '30d') return [72, 74, 73, 76, 78, 79, 77, 80, 81, 83, 82, 84]
    return base
  }, [range])
  const comparableMachines = [...machines]
    .filter((machine) => machine.status !== 'offline' && machine.status !== 'maintenance')
    .sort((left, right) => right.healthPercent - left.healthPercent)

  const exportReport = () => {
    downloadAnalyticsCsv()
    showToast('報表匯出完成', { description: 'CSV 已包含目前場域各機台健康度、負載與 AI 風險。' })
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="分析中心"
        actions={
          <>
            <SegmentedControl label="分析時間範圍" options={rangeOptions} value={range} onChange={setRange} />
            <Button variant="secondary" onClick={exportReport}>匯出報表</Button>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="績效指標">
        <MetricCard label="綜合設備效率 OEE" value={metrics.oee} unit="%" trend={{ direction: 'up', label: '+4.2%' }} />
        <MetricCard label="設備可用率" value={metrics.uptime} unit="%" trend={{ direction: 'up', label: '+2.8%' }} />
        <MetricCard label="品質預測達標率" value={metrics.quality} unit="%" helper="186 件" trend={{ direction: 'up', label: '+1.4%' }} />
        <MetricCard label="單件平均能耗" value={metrics.energy} unit="kWh" trend={{ direction: 'down', label: '-8.1%' }} />
      </section>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-ink-950">OEE 趨勢</h2>
            </div>
            <div className="text-right">
              <p className="font-mono text-3xl font-semibold text-ink-950">{metrics.oee}<span className="ml-1 text-sm text-slate-400">%</span></p>
              <p className="mt-1 text-xs font-semibold text-emerald-700">高於目標 3.6%</p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 px-3 pt-4 sm:px-5">
            <Sparkline data={oeeValues} label={`${range} OEE 趨勢，從 ${oeeValues[0] ?? 0}% 上升至 ${oeeValues.at(-1) ?? 0}%`} height={220} />
            <div className="flex justify-between pb-4 font-mono text-[9px] text-slate-400">
              <span>{range === '24h' ? '00:00' : range === '7d' ? '09/05' : '08/12'}</span>
              <span>{range === '24h' ? '12:00' : range === '7d' ? '09/08' : '08/27'}</span>
              <span>{range === '24h' ? '現在' : '今天'}</span>
            </div>
          </div>
          <details className="mt-4 rounded-xl border border-line px-4 py-3">
            <summary className="cursor-pointer text-xs font-semibold text-slate-600">查看圖表資料表</summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead><tr className="text-slate-500"><th className="py-2">序列</th>{oeeTrend.map((point) => <th key={point.label} className="px-2 py-2">{point.label}</th>)}</tr></thead>
                <tbody><tr><th className="py-2 font-medium">OEE</th>{oeeTrend.map((point) => <td key={point.label} className="px-2 py-2 font-mono">{point.value}%</td>)}</tr></tbody>
              </table>
            </div>
          </details>
        </Card>

        <Card className="xl:col-span-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-ink-950">停機原因分布</h2>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <div
              className="relative grid size-48 place-items-center rounded-full"
              style={{ background: 'conic-gradient(#1689ff 0 38%, #38bdf8 38% 65%, #fbbf24 65% 86%, #f87171 86% 100%)' }}
              role="img"
              aria-label="停機原因：換線與設定 38%，預防性保養 27%，待料或待課程 21%，異常處置 14%"
            >
              <div className="grid size-32 place-items-center rounded-full bg-white text-center shadow-inner">
                <div><p className="font-mono text-2xl font-semibold text-ink-950">6.8</p><p className="text-xs text-slate-500">停機小時</p></div>
              </div>
            </div>
          </div>
          <ul className="mt-6 space-y-3">
            {downtimeReasons.map((reason) => (
              <li key={reason.label} className="flex items-center gap-3 text-xs">
                <span className={cn('size-2.5 rounded-full', reason.color)} aria-hidden="true" />
                <span className="flex-1 text-slate-600">{reason.label}</span>
                <span className="font-mono font-semibold text-ink-900">{reason.value}%</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="xl:col-span-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-ink-950">機台健康度</h2>
          </div>
          <div className="mt-5 space-y-4">
            {comparableMachines.map((machine) => (
              <div key={machine.id} className="grid grid-cols-[88px_1fr_42px] items-center gap-3 sm:grid-cols-[120px_1fr_54px]">
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11px] font-semibold text-ink-900">{machine.code}</p>
                  <p className="hidden truncate text-[10px] text-slate-400 sm:block">負載 {machine.loadPercent}%</p>
                </div>
                <ProgressBar value={machine.healthPercent} tone={machine.healthPercent < 75 ? 'danger' : machine.healthPercent < 90 ? 'warning' : 'success'} label={`${machine.code} 健康度 ${machine.healthPercent} 分`} className="h-2" />
                <span className="text-right font-mono text-xs font-semibold text-ink-900">{machine.healthPercent}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-ink-950">全場即時能耗</h2>
            <span className="text-xs font-semibold text-emerald-700">較昨日 -6.2%</span>
          </div>
          <Sparkline data={energyTrend} label="全場能耗介於 78 至 101 kW，目前 86 kW" color="warning" height={168} className="mt-6" />
          <div className="mt-3 grid grid-cols-3 divide-x divide-line rounded-xl bg-slate-50 py-3 text-center">
            <div><p className="font-mono text-sm font-semibold">86 kW</p><p className="mt-1 text-[10px] text-slate-500">目前</p></div>
            <div><p className="font-mono text-sm font-semibold">101 kW</p><p className="mt-1 text-[10px] text-slate-500">尖峰</p></div>
            <div><p className="font-mono text-sm font-semibold">89 kW</p><p className="mt-1 text-[10px] text-slate-500">平均</p></div>
          </div>
        </Card>

        <section className="relative overflow-hidden rounded-2xl bg-brand-700 p-6 text-white shadow-card xl:col-span-12">
          <div className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-brand-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
            <div className="flex-1">
              <h2 className="text-lg font-bold">效能洞察</h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-brand-50">本期 OEE 成長主要來自 CNC-A01 與 MILL-03 的待機時間縮短。若將 LATHE-02 的預防性換刀提前至剩餘壽命 15%，預估下週可再減少 34 分鐘非計畫停機。</p>
            </div>
            <Button variant="inverse" onClick={() => showToast('優化建議已加入改善追蹤', { description: '下週將自動比較換刀策略前後的停機時間。' })}>建立改善項目</Button>
          </div>
        </section>
      </div>
    </div>
  )
}