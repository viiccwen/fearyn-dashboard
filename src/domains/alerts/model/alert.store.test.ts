import { beforeEach, describe, expect, it } from 'vitest'

import { initialAlerts } from '@/domains/alerts/data/alerts'
import { selectOpenAlertCount, useAlertStore } from '@/domains/alerts/model/alert.store'

describe('alert store', () => {
  beforeEach(() => {
    useAlertStore.setState({
      alerts: initialAlerts,
      view: 'open',
      severity: 'all',
      query: '',
      selectedId: initialAlerts[0]?.id ?? '',
    })
  })

  it('moves an alert through acknowledge and resolve', () => {
    const alertId = initialAlerts[0]!.id

    useAlertStore.getState().acknowledge(alertId)
    expect(useAlertStore.getState().alerts.find((alert) => alert.id === alertId)?.status).toBe('acknowledged')

    useAlertStore.getState().resolve(alertId, '已完成刀具檢查')
    expect(useAlertStore.getState().alerts.find((alert) => alert.id === alertId)?.status).toBe('resolved')
    expect(useAlertStore.getState().alerts.find((alert) => alert.id === alertId)?.resolutionNote).toBe('已完成刀具檢查')
    expect(selectOpenAlertCount(useAlertStore.getState())).toBe(2)
  })
})