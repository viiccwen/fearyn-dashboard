import type { Machine } from '@/domains/machines/model/machine.schema'

export interface FleetSummary {
  total: number
  connected: number
  operating: number
  attention: number
  averageHealth: number
  utilization: number
}

export function calculateFleetSummary(machines: Machine[]): FleetSummary {
  const total = machines.length
  const connected = machines.filter((machine) => machine.status !== 'offline').length
  const operating = machines.filter((machine) => machine.status === 'operating').length
  const attention = machines.filter((machine) => machine.riskPercent >= 40).length
  const averageHealth = total
    ? Math.round(machines.reduce((sum, machine) => sum + machine.healthPercent, 0) / total)
    : 0
  const available = machines.filter(
    (machine) => machine.status !== 'offline' && machine.status !== 'maintenance',
  )
  const utilization = available.length
    ? Math.round(available.reduce((sum, machine) => sum + machine.loadPercent, 0) / available.length)
    : 0

  return { total, connected, operating, attention, averageHealth, utilization }
}

export const oeeTrend = [
  { label: '09/05', value: 74 },
  { label: '09/06', value: 78 },
  { label: '09/07', value: 77 },
  { label: '09/08', value: 81 },
  { label: '09/09', value: 80 },
  { label: '09/10', value: 84 },
  { label: '今天', value: 86 },
]

export const energyTrend = [82, 78, 88, 92, 85, 96, 101, 93, 89, 97, 91, 86]