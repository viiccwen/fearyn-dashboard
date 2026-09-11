import { telemetrySchema } from '@/domains/monitoring/model/telemetry.schema'
import type { Telemetry } from '@/domains/monitoring/model/telemetry.schema'

const stableWaveform = [18, 22, 17, 25, 21, 29, 18, 24, 20, 31, 23, 27, 21, 26, 19, 24, 22, 28, 20, 25, 18, 22, 20, 24]
const warningWaveform = [32, 38, 30, 49, 42, 68, 39, 74, 48, 82, 61, 91, 55, 78, 64, 88, 70, 93, 63, 84, 58, 79, 52, 71]

const telemetryEntries = [
  ['cnc-a01', 2456, 42.4, 12.5, 8.7, 96, stableWaveform, [51, 53, 57, 55, 58, 60, 62, 64, 63, 65, 64, 66]],
  ['cnc-a02', 0, 0, 8.2, 0.8, 98, stableWaveform.map((value) => value * 0.3), [4, 3, 5, 4, 4, 3, 4, 4, 5, 4, 4, 4]],
  ['cnc-b01', 3120, 78.6, 89, 14.9, 62, warningWaveform, [68, 72, 75, 81, 84, 88, 91, 92, 89, 93, 91, 90]],
  ['lathe-02', 1860, 51.8, 31, 10.4, 89, stableWaveform.map((value, index) => value + (index % 4) * 3), [62, 64, 67, 70, 71, 73, 74, 72, 71, 73, 72, 72]],
  ['mill-03', 1320, 36.2, 18, 6.4, 94, stableWaveform.map((value) => value * 0.8), [48, 50, 52, 55, 57, 56, 58, 57, 59, 58, 57, 57]],
  ['grinder-01', 0, 0, 24, 0, 92, stableWaveform.map(() => 4), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
  ['cnc-c01', 8240, 63.1, 28, 18.6, 91, stableWaveform.map((value, index) => value + (index % 3) * 4), [69, 71, 75, 74, 77, 79, 80, 78, 79, 78, 77, 78]],
  ['lathe-04', 0, 0, 16, 0, 0, stableWaveform.map(() => 0), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
] as const

export const telemetryByMachine: ReadonlyMap<string, Telemetry> = new Map(
  telemetryEntries.map(([machineId, spindleSpeed, cuttingForce, toolWearPercent, energyKw, qualityPrediction, waveform, loadHistory]) => {
    const telemetry = telemetrySchema.parse({
      machineId,
      spindleSpeed,
      cuttingForce,
      toolWearPercent,
      energyKw,
      qualityPrediction,
      waveform: [...waveform],
      loadHistory: [...loadHistory],
      sampledAt: '2026-09-11T01:14:32.000Z',
    })
    return [machineId, telemetry]
  }),
)