import { useMemo, useState, type FormEvent } from 'react'

import { resolutionSchema, type Alert, type AlertSeverity, type AlertStatus } from '@/domains/alerts/model/alert.schema'
import {
  selectCriticalAlertCount,
  selectOpenAlertCount,
  useAlertStore,
  type SeverityFilter,
} from '@/domains/alerts/model/alert.store'
import { cn } from '@/shared/lib/cn'
import { formatDateTime, formatRelativeTime } from '@/shared/lib/format'
import { Badge, type BadgeTone } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { SegmentedControl } from '@/shared/ui/SegmentedControl'
import { useToastStore } from '@/shared/model/toast.store'

const severityMeta: Record<AlertSeverity, { label: string; tone: BadgeTone }> = {
  critical: { label: '高風險', tone: 'danger' },
  warning: { label: '警告', tone: 'warning' },
  info: { label: '通知', tone: 'info' },
}

const statusMeta: Record<AlertStatus, { label: string; tone: BadgeTone }> = {
  new: { label: '待認領', tone: 'danger' },
  acknowledged: { label: '處理中', tone: 'warning' },
  resolved: { label: '已結案', tone: 'success' },
}

export default function AlertsPage() {
  const alerts = useAlertStore((state) => state.alerts)
  const openCount = useAlertStore(selectOpenAlertCount)
  const criticalCount = useAlertStore(selectCriticalAlertCount)
  const view = useAlertStore((state) => state.view)
  const severity = useAlertStore((state) => state.severity)
  const query = useAlertStore((state) => state.query)
  const selectedId = useAlertStore((state) => state.selectedId)
  const setView = useAlertStore((state) => state.setView)
  const setSeverity = useAlertStore((state) => state.setSeverity)
  const setQuery = useAlertStore((state) => state.setQuery)
  const selectAlert = useAlertStore((state) => state.selectAlert)
  const acknowledge = useAlertStore((state) => state.acknowledge)
  const resolve = useAlertStore((state) => state.resolve)
  const [resolutionNote, setResolutionNote] = useState('')
  const [formError, setFormError] = useState('')
  const showToast = useToastStore((state) => state.showToast)

  const filteredAlerts = useMemo(() => alerts.filter((alert) => {
    const matchesView = view === 'all'
      || (view === 'open' && alert.status !== 'resolved')
      || (view === 'resolved' && alert.status === 'resolved')
    const matchesSeverity = severity === 'all' || alert.severity === severity
    const normalizedQuery = query.trim().toLocaleLowerCase('zh-Hant')
    const matchesQuery = [alert.title, alert.machineCode, alert.description]
      .join(' ')
      .toLocaleLowerCase('zh-Hant')
      .includes(normalizedQuery)
    return matchesView && matchesSeverity && matchesQuery
  }), [alerts, query, severity, view])

  const selectedAlert = alerts.find((alert) => alert.id === selectedId) ?? filteredAlerts[0] ?? null

  const handleAcknowledge = (alert: Alert) => {
    acknowledge(alert.id)
    showToast('告警已認領', { description: `${alert.machineCode} 已由陳志明老師開始處理。` })
  }

  const handleResolve = (event: FormEvent<HTMLFormElement>, alert: Alert) => {
    event.preventDefault()
    const result = resolutionSchema.safeParse({ note: resolutionNote })
    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? '請確認處置說明')
      return
    }
    resolve(alert.id, result.data.note)
    setResolutionNote('')
    setFormError('')
    showToast('告警已結案', { description: '處置紀錄已保存至機台歷史資料庫。' })
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="告警中心"
        actions={<SegmentedControl label="告警檢視範圍" value={view} onChange={setView} options={[{ label: `待處理 ${openCount}`, value: 'open' }, { label: '全部', value: 'all' }, { label: '已結案', value: 'resolved' }]} />}
      />

      <section className="grid gap-3 sm:grid-cols-3" aria-label="告警統計">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="font-mono text-xl font-semibold text-red-900">{criticalCount}</p><p className="mt-1 text-xs font-medium text-red-700">高風險待處理</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <p className="font-mono text-xl font-semibold text-amber-900">06:42</p><p className="mt-1 text-xs font-medium text-amber-700">平均認領時間</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="font-mono text-xl font-semibold text-emerald-900">92%</p><p className="mt-1 text-xs font-medium text-emerald-700">24 小時內結案</p>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-4 shadow-card" aria-label="告警篩選">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <label className="sr-only" htmlFor="alert-search">搜尋告警</label>
            <input id="alert-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋機台編號或告警內容" className="h-11 w-full rounded-xl border border-line bg-slate-50 px-4 text-sm outline-none focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100" />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1" role="group" aria-label="風險等級篩選">
            {([
              ['all', '全部等級'], ['critical', '高風險'], ['warning', '警告'], ['info', '通知'],
            ] as Array<[SeverityFilter, string]>).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setSeverity(value)} className={cn('min-h-9 shrink-0 rounded-lg px-3 text-xs font-semibold transition-all', severity === value ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-800')} aria-pressed={severity === value}>{label}</button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.72fr)]">
        <Card padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold text-ink-900">事件佇列</h2>
            <span className="font-mono text-xs text-slate-500">{filteredAlerts.length}</span>
          </div>
          {filteredAlerts.length ? (
            <div className="divide-y divide-line">
              {filteredAlerts.map((alert) => {
                const statusInfo = statusMeta[alert.status]
                const isSelected = selectedAlert?.id === alert.id
                return (
                  <button
                    key={alert.id}
                    type="button"
                    onClick={() => {
                      selectAlert(alert.id)
                      setFormError('')
                      setResolutionNote('')
                    }}
                    className={cn('group flex w-full items-start px-4 py-4 text-left transition-colors sm:px-5', isSelected ? 'bg-brand-50/70' : 'hover:bg-slate-50')}
                    aria-pressed={isSelected}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-ink-950">{alert.title}</span>
                        <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
                      </span>
                      <span className="mt-1.5 block line-clamp-2 text-xs leading-5 text-slate-500">{alert.description}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] text-slate-400">
                        <strong className="text-slate-600">{alert.machineCode}</strong>
                        <span>{formatRelativeTime(alert.occurredAt)}</span>
                        {alert.owner && <span>處理人 · {alert.owner}</span>}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <EmptyState title="目前沒有符合條件的告警" description="調整風險等級或搜尋條件，或切換到其他事件狀態。" />
          )}
        </Card>

        {selectedAlert ? (
          <Card className="h-fit xl:sticky xl:top-28">
            <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={severityMeta[selectedAlert.severity].tone} dot>{severityMeta[selectedAlert.severity].label}</Badge>
                  <Badge tone={statusMeta[selectedAlert.status].tone}>{statusMeta[selectedAlert.status].label}</Badge>
                </div>
                <h2 className="mt-4 text-xl font-bold leading-snug text-ink-950">{selectedAlert.title}</h2>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-xs">
              <div><p className="text-slate-400">發生機台</p><p className="mt-1 font-mono font-semibold text-ink-900">{selectedAlert.machineCode}</p></div>
              <div><p className="text-slate-400">發生時間</p><p className="mt-1 font-semibold text-ink-900">{formatDateTime(selectedAlert.occurredAt)}</p></div>
              <div className="col-span-2"><p className="text-slate-400">偵測來源</p><p className="mt-1 font-semibold text-ink-900">{selectedAlert.source}</p></div>
            </div>

            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">偵測摘要</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{selectedAlert.description}</p>
            </div>
            <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 p-4">
              <div className="text-sm font-semibold text-brand-900">建議處置</div>
              <p className="mt-2 text-sm leading-6 text-brand-900">{selectedAlert.suggestion}</p>
            </div>

            {selectedAlert.status === 'new' && (
              <Button className="mt-5 w-full" onClick={() => handleAcknowledge(selectedAlert)}>由我認領處理</Button>
            )}

            {selectedAlert.status === 'acknowledged' && (
              <form className="mt-5" onSubmit={(event) => handleResolve(event, selectedAlert)} noValidate>
                <label htmlFor="resolution-note" className="text-sm font-semibold text-ink-900">處置紀錄 <span className="text-red-600">*</span></label>
                <textarea
                  id="resolution-note"
                  value={resolutionNote}
                  onChange={(event) => {
                    setResolutionNote(event.target.value)
                    if (formError) setFormError('')
                  }}
                  rows={4}
                  maxLength={160}
                  className={cn('mt-3 w-full resize-none rounded-xl border bg-white p-3 text-sm leading-6 outline-none transition-all focus:ring-4', formError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-line focus:border-brand-300 focus:ring-brand-100')}
                  placeholder="例如：已更換崩刃刀具並確認筒夾鎖固，空車測試正常。"
                  aria-invalid={Boolean(formError)}
                  aria-describedby={formError ? 'resolution-error' : 'resolution-helper'}
                />
                <div className="mt-1 flex justify-between gap-3 text-xs">
                  <span id={formError ? 'resolution-error' : 'resolution-helper'} role={formError ? 'alert' : undefined} className={formError ? 'text-red-600' : 'text-slate-400'}>{formError || '至少 4 個字'}</span>
                  <span className="font-mono text-slate-400">{resolutionNote.length}/160</span>
                </div>
                <Button className="mt-4 w-full" type="submit">儲存紀錄並結案</Button>
              </form>
            )}

            {selectedAlert.status === 'resolved' && (
              <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
                <strong className="block">事件已完成結案</strong>
                {selectedAlert.resolutionNote && <span className="mt-2 block leading-6">{selectedAlert.resolutionNote}</span>}
                <span className="mt-1 block text-xs">處理人：{selectedAlert.owner ?? '系統管理員'}</span>
              </div>
            )}
          </Card>
        ) : (
          <Card className="h-fit"><EmptyState title="選擇一筆事件" description="從左側事件佇列選取告警，以查看偵測依據及建議處置。" /></Card>
        )}
      </div>
    </div>
  )
}