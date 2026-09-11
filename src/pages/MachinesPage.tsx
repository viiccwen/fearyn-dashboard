import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { areas, machines } from '@/domains/machines/data/machines'
import { filterMachines } from '@/domains/machines/model/machine.selectors'
import { useMachineStore, type StatusFilter } from '@/domains/machines/model/machine.store'
import { MachineCard } from '@/domains/machines/ui/MachineCard'
import { MachineDetailDrawer } from '@/domains/machines/ui/MachineDetailDrawer'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { PageHeader } from '@/shared/ui/PageHeader'
import { useToastStore } from '@/shared/model/toast.store'

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: '全部狀態' },
  { value: 'operating', label: '加工中' },
  { value: 'idle', label: '待機' },
  { value: 'warning', label: '需注意' },
  { value: 'maintenance', label: '保養中' },
  { value: 'offline', label: '離線' },
]

export default function MachinesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = useMachineStore((state) => state.query)
  const area = useMachineStore((state) => state.area)
  const status = useMachineStore((state) => state.status)
  const selectedMachineId = useMachineStore((state) => state.selectedMachineId)
  const setQuery = useMachineStore((state) => state.setQuery)
  const setArea = useMachineStore((state) => state.setArea)
  const setStatus = useMachineStore((state) => state.setStatus)
  const selectMachine = useMachineStore((state) => state.selectMachine)
  const resetFilters = useMachineStore((state) => state.resetFilters)
  const showToast = useToastStore((state) => state.showToast)
  const selectedMachine = machines.find((machine) => machine.id === selectedMachineId) ?? null

  useEffect(() => {
    const machineId = searchParams.get('machine')
    if (!machineId) return
    const matchedMachine = machines.find((machine) => machine.id === machineId)
    if (matchedMachine) selectMachine(matchedMachine.id)
  }, [searchParams, selectMachine])

  const visibleMachines = useMemo(
    () => filterMachines(machines, query, area, status),
    [area, query, status],
  )

  const closeDrawer = () => {
    selectMachine(null)
    if (searchParams.has('machine')) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('machine')
      setSearchParams(nextParams, { replace: true })
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="機台監控"
        actions={
          <Button variant="secondary" onClick={() => showToast('場域資料已重新同步', { description: '8 台設備狀態皆已更新至最新時間點。', tone: 'info' })}>
            同步場域資料
          </Button>
        }
      />

      <section className="rounded-2xl border border-line bg-white p-4 shadow-card" aria-label="機台篩選">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_220px_1.6fr]">
          <div className="relative">
            <label className="sr-only" htmlFor="machine-search">搜尋機台</label>
            <input
              id="machine-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜尋編號、名稱或操作人員"
              className="h-11 w-full rounded-xl border border-line bg-slate-50 px-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <div className="relative">
            <label className="sr-only" htmlFor="area-filter">選擇場域</label>
            <select
              id="area-filter"
              value={area}
              onChange={(event) => setArea(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-line bg-slate-50 px-3 pr-9 text-sm font-medium text-slate-700 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
            >
              {areas.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <div className="scrollbar-thin flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1" role="group" aria-label="依機台狀態篩選">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                className={cn(
                  'min-h-9 shrink-0 rounded-lg px-3 text-xs font-semibold transition-all',
                  status === option.value ? 'bg-white text-ink-900 shadow-sm' : 'text-slate-500 hover:text-ink-800',
                )}
                aria-pressed={status === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          顯示 <span className="font-mono font-semibold text-ink-900">{visibleMachines.length}</span> / {machines.length} 台機台
        </p>
        {(query || area !== '全部場域' || status !== 'all') && (
          <button type="button" onClick={resetFilters} className="min-h-9 rounded-lg px-2 text-xs font-semibold text-brand-700 hover:bg-brand-50">清除篩選</button>
        )}
      </div>

      {visibleMachines.length ? (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3" aria-label="機台列表">
          {visibleMachines.map((machine) => (
            <MachineCard
              key={machine.id}
              machine={machine}
              onSelect={(selected) => selectMachine(selected.id)}
              featured={machine.riskPercent >= 70}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-line bg-white shadow-card">
          <EmptyState
            title="找不到符合條件的機台"
            description="請調整搜尋文字、場域或狀態篩選，查看其他設備。"
            action={<Button variant="secondary" size="sm" onClick={resetFilters}>顯示全部機台</Button>}
          />
        </section>
      )}

      <MachineDetailDrawer
        machine={selectedMachine}
        onClose={closeDrawer}
        onCreateInspection={(machine) => showToast('巡檢任務已建立', { description: `${machine.code} 已加入設備人員的今日待辦。` })}
      />
    </div>
  )
}