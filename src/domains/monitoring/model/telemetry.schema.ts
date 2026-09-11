import { z } from 'zod'

export const telemetrySchema = z.object({
  machineId: z.string(),
  spindleSpeed: z.number().nonnegative(),
  cuttingForce: z.number().nonnegative(),
  toolWearPercent: z.number().min(0).max(100),
  energyKw: z.number().nonnegative(),
  qualityPrediction: z.number().min(0).max(100),
  waveform: z.array(z.number()).min(8),
  loadHistory: z.array(z.number()).min(8),
  sampledAt: z.string().datetime(),
})

export type Telemetry = z.infer<typeof telemetrySchema>