import { describe, expect, it } from 'vitest'

import { machines } from '@/domains/machines/data/machines'
import { calculateFleetSummary } from '@/domains/analytics/model/fleet-analytics'

describe('calculateFleetSummary', () => {
  it('summarizes validated machine data', () => {
    const summary = calculateFleetSummary(machines)

    expect(summary.total).toBe(8)
    expect(summary.connected).toBe(7)
    expect(summary.operating).toBe(4)
    expect(summary.attention).toBe(2)
    expect(summary.averageHealth).toBeGreaterThan(80)
  })

  it('handles an empty fleet', () => {
    expect(calculateFleetSummary([])).toEqual({
      total: 0,
      connected: 0,
      operating: 0,
      attention: 0,
      averageHealth: 0,
      utilization: 0,
    })
  })
})