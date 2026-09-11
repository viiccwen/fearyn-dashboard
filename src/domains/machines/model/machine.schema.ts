import { z } from 'zod'

export const machineStatusSchema = z.enum([
  'operating',
  'idle',
  'warning',
  'offline',
  'maintenance',
])

export const machineSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  area: z.string().min(1),
  operator: z.string().nullable(),
  status: machineStatusSchema,
  rpm: z.number().nonnegative(),
  loadPercent: z.number().min(0).max(100),
  riskPercent: z.number().min(0).max(100),
  healthPercent: z.number().min(0).max(100),
  temperature: z.number(),
  vibration: z.number().nonnegative(),
  currentJob: z.string().nullable(),
  progressPercent: z.number().min(0).max(100),
  lastUpdated: z.string().datetime(),
  sensors: z.object({
    vibration: z.boolean(),
    sound: z.boolean(),
    current: z.boolean(),
    vision: z.boolean(),
  }),
})

export const machinesSchema = z.array(machineSchema)

export type Machine = z.infer<typeof machineSchema>
export type MachineStatus = z.infer<typeof machineStatusSchema>