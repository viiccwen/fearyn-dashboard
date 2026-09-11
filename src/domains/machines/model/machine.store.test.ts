import { beforeEach, describe, expect, it } from 'vitest'

import { useMachineStore } from '@/domains/machines/model/machine.store'

describe('machine store', () => {
  beforeEach(() => {
    useMachineStore.setState({
      query: '',
      area: '全部場域',
      status: 'all',
      selectedMachineId: null,
    })
  })

  it('keeps browsing state and resets filters without closing details', () => {
    const store = useMachineStore.getState()
    store.setArea('第一實習工場')
    store.setStatus('warning')
    store.selectMachine('cnc-b01')
    useMachineStore.getState().resetFilters()

    expect(useMachineStore.getState()).toMatchObject({
      area: '全部場域',
      status: 'all',
      selectedMachineId: 'cnc-b01',
    })
  })
})