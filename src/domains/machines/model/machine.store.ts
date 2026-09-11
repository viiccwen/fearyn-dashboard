import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import type { MachineStatus } from '@/domains/machines/model/machine.schema'

export type StatusFilter = 'all' | MachineStatus

interface MachineStore {
  query: string
  area: string
  status: StatusFilter
  selectedMachineId: string | null
  setQuery: (query: string) => void
  setArea: (area: string) => void
  setStatus: (status: StatusFilter) => void
  selectMachine: (machineId: string | null) => void
  resetFilters: () => void
}

export const useMachineStore = create<MachineStore>()(
  devtools(
    persist(
      (set) => ({
        query: '',
        area: '全部場域',
        status: 'all',
        selectedMachineId: null,
        setQuery: (query) => set({ query }, false, 'machines/setQuery'),
        setArea: (area) => set({ area }, false, 'machines/setArea'),
        setStatus: (status) => set({ status }, false, 'machines/setStatus'),
        selectMachine: (selectedMachineId) => set({ selectedMachineId }, false, 'machines/select'),
        resetFilters: () => set(
          { query: '', area: '全部場域', status: 'all' },
          false,
          'machines/resetFilters',
        ),
      }),
      {
        name: 'fearyn-machines',
        partialize: ({ area, status }) => ({ area, status }),
      },
    ),
    { name: 'Fearyn Machines' },
  ),
)