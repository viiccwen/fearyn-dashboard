import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export type TimeRange = '24h' | '7d' | '30d'

interface AnalyticsStore {
  range: TimeRange
  setRange: (range: TimeRange) => void
}

export const useAnalyticsStore = create<AnalyticsStore>()(
  devtools(
    persist(
      (set) => ({
        range: '7d',
        setRange: (range) => set({ range }, false, 'analytics/setRange'),
      }),
      { name: 'fearyn-analytics' },
    ),
    { name: 'Fearyn Analytics' },
  ),
)