import { z } from 'zod'

export const alertSeveritySchema = z.enum(['info', 'warning', 'critical'])
export const alertStatusSchema = z.enum(['new', 'acknowledged', 'resolved'])

export const alertSchema = z.object({
  id: z.string(),
  machineId: z.string(),
  machineCode: z.string(),
  title: z.string(),
  description: z.string(),
  severity: alertSeveritySchema,
  status: alertStatusSchema,
  occurredAt: z.string().datetime(),
  source: z.string(),
  suggestion: z.string(),
  owner: z.string().nullable(),
  resolutionNote: z.string().optional(),
})

export const alertsSchema = z.array(alertSchema)
export const resolutionSchema = z.object({
  note: z.string().trim().min(4, '請輸入至少 4 個字的處置說明').max(160, '處置說明不可超過 160 字'),
})

export type Alert = z.infer<typeof alertSchema>
export type AlertSeverity = z.infer<typeof alertSeveritySchema>
export type AlertStatus = z.infer<typeof alertStatusSchema>