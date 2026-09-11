import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import { initialAlerts } from '@/domains/alerts/data/alerts'
import type { Alert, AlertSeverity } from '@/domains/alerts/model/alert.schema'

export type AlertView = 'open' | 'all' | 'resolved'
export type SeverityFilter = 'all' | AlertSeverity

interface AlertStore {
  alerts: Alert[]
  view: AlertView
  severity: SeverityFilter
  query: string
  selectedId: string
  setView: (view: AlertView) => void
  setSeverity: (severity: SeverityFilter) => void
  setQuery: (query: string) => void
  selectAlert: (alertId: string) => void
  acknowledge: (alertId: string) => void
  resolve: (alertId: string, note: string) => void
}

export const useAlertStore = create<AlertStore>()(
  devtools(
    persist(
      (set) => ({
        alerts: initialAlerts,
        view: 'open',
        severity: 'all',
        query: '',
        selectedId: initialAlerts[0]?.id ?? '',
        setView: (view) => set({ view }, false, 'alerts/setView'),
        setSeverity: (severity) => set({ severity }, false, 'alerts/setSeverity'),
        setQuery: (query) => set({ query }, false, 'alerts/setQuery'),
        selectAlert: (selectedId) => set({ selectedId }, false, 'alerts/select'),
        acknowledge: (alertId) => set(
          (state) => ({
            alerts: state.alerts.map((alert) => (
              alert.id === alertId
                ? { ...alert, status: 'acknowledged' as const, owner: '陳志明老師' }
                : alert
            )),
          }),
          false,
          'alerts/acknowledge',
        ),
        resolve: (alertId, note) => set(
          (state) => ({
            alerts: state.alerts.map((alert) => (
              alert.id === alertId
                ? {
                    ...alert,
                    status: 'resolved' as const,
                    owner: alert.owner ?? '陳志明老師',
                    resolutionNote: note,
                  }
                : alert
            )),
          }),
          false,
          'alerts/resolve',
        ),
      }),
      {
        name: 'fearyn-alerts',
        partialize: ({ alerts, view, severity, selectedId }) => ({ alerts, view, severity, selectedId }),
      },
    ),
    { name: 'Fearyn Alerts' },
  ),
)

export const selectOpenAlertCount = (state: AlertStore) =>
  state.alerts.filter((alert) => alert.status !== 'resolved').length

export const selectCriticalAlertCount = (state: AlertStore) =>
  state.alerts.filter(
    (alert) => alert.severity === 'critical' && alert.status !== 'resolved',
  ).length