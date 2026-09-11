import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { X } from 'lucide-react'

import { machines } from '@/domains/machines/data/machines'
import { machineStatusMeta } from '@/domains/machines/model/machine.selectors'
import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/Badge'

export function GlobalMachineSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('zh-Hant')
    if (!normalized) return machines.slice(0, 4)
    return machines.filter((machine) => (
      [machine.code, machine.name, machine.area, machine.operator ?? '']
        .join(' ')
        .toLocaleLowerCase('zh-Hant')
        .includes(normalized)
    )).slice(0, 6)
  }, [query])

  const selectMachine = (machineId: string) => {
    setOpen(false)
    setQuery('')
    navigate(`/machines?machine=${machineId}`)
  }

  return (
    <div className="relative hidden w-full max-w-md md:block" ref={containerRef}>
      <label className="sr-only" htmlFor="global-machine-search">搜尋機台、操作人員或場域</label>
      <input
        id="global-machine-search"
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false)
          if (event.key === 'Enter' && results[0]) selectMachine(results[0].id)
        }}
        placeholder="搜尋機台、操作人員或場域…"
        autoComplete="off"
        className="h-11 w-full rounded-xl border border-line bg-slate-50 px-4 pr-10 text-sm text-ink-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
        role="combobox"
        aria-expanded={open}
        aria-controls="machine-search-results"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="清除搜尋"
        >
          <X className="size-4" />
        </button>
      )}
      {open && (
        <div
          id="machine-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-float"
        >
          <div className="flex items-center justify-between px-2 py-2">
            <span className="text-xs font-semibold text-slate-500">{query ? '搜尋結果' : '快速前往'}</span>
            <button type="button" onClick={() => setOpen(false)} className="text-xs font-medium text-brand-700 hover:text-brand-800">關閉</button>
          </div>
          {results.length ? results.map((machine) => {
            const status = machineStatusMeta[machine.status]
            return (
              <button
                key={machine.id}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => selectMachine(machine.id)}
                className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors hover:bg-slate-50"
              >
                <span className={cn(
                  'grid size-9 shrink-0 place-items-center rounded-lg font-mono text-[10px] font-bold',
                  machine.riskPercent >= 70 ? 'bg-red-50 text-red-700' : 'bg-brand-50 text-brand-700',
                )}>
                  {machine.code.split('-')[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-900">{machine.name}</span>
                  <span className="block truncate text-xs text-slate-500">{machine.code} · {machine.area}</span>
                </span>
                <Badge tone={status.tone}>{status.label}</Badge>
              </button>
            )
          }) : (
            <p className="px-3 py-8 text-center text-sm text-slate-500">找不到符合的機台</p>
          )}
        </div>
      )}
    </div>
  )
}