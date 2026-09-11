import type { Machine, MachineStatus } from '@/domains/machines/model/machine.schema'

export const machineStatusMeta: Record<
  MachineStatus,
  { label: string; tone: 'success' | 'neutral' | 'warning' | 'danger' | 'info' }
> = {
  operating: { label: '加工中', tone: 'success' },
  idle: { label: '待機', tone: 'neutral' },
  warning: { label: '需注意', tone: 'danger' },
  offline: { label: '離線', tone: 'neutral' },
  maintenance: { label: '保養中', tone: 'info' },
}

export function getRiskLabel(risk: number) {
  if (risk >= 70) return { label: '高風險', tone: 'danger' as const }
  if (risk >= 40) return { label: '留意', tone: 'warning' as const }
  return { label: '穩定', tone: 'success' as const }
}

export function filterMachines(
  source: Machine[],
  query: string,
  area: string,
  status: 'all' | MachineStatus,
) {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-Hant')

  return source.filter((machine) => {
    const matchesQuery = [machine.code, machine.name, machine.operator ?? '']
      .join(' ')
      .toLocaleLowerCase('zh-Hant')
      .includes(normalizedQuery)
    const matchesArea = area === '全部場域' || machine.area === area
    const matchesStatus = status === 'all' || machine.status === status
    return matchesQuery && matchesArea && matchesStatus
  })
}