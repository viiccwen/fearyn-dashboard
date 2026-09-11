import { describe, expect, it } from 'vitest'

import { resolutionSchema } from '@/domains/alerts/model/alert.schema'

describe('resolutionSchema', () => {
  it('rejects notes that cannot explain the resolution', () => {
    const result = resolutionSchema.safeParse({ note: '已修' })
    expect(result.success).toBe(false)
  })

  it('trims and accepts a meaningful resolution note', () => {
    const result = resolutionSchema.parse({ note: '  已檢查刀具並重新鎖固  ' })
    expect(result.note).toBe('已檢查刀具並重新鎖固')
  })
})