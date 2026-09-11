import { describe, expect, it } from 'vitest'

import { advanceWaveform, generateWaveformSample } from '@/domains/monitoring/model/waveform'

describe('waveform sliding window', () => {
  it('keeps historical values and appends only one new sample', () => {
    const previous = [12, 18, 15, 21]
    const next = advanceWaveform(previous, 24)

    expect(next).toEqual([18, 15, 21, 24])
    expect(next.slice(0, -1)).toEqual(previous.slice(1))
    expect(next).toHaveLength(previous.length)
  })

  it('samples the signal pattern without changing the whole buffer', () => {
    const pattern = [10, 20, 30]

    expect(generateWaveformSample(pattern, 1, () => 0.5)).toBe(20)
    expect(generateWaveformSample([0, 0, 0], 2, () => 1)).toBe(0)
  })
})