import { useEffect, useMemo, useRef, useState } from 'react'

import { telemetryByMachine } from '@/domains/monitoring/data/telemetry'
import type { Telemetry } from '@/domains/monitoring/model/telemetry.schema'
import { advanceWaveform, generateWaveformSample } from '@/domains/monitoring/model/waveform'

function fluctuate(value: number, ratio: number) {
  return Math.max(0, value + value * ratio * (Math.random() - 0.5))
}

export function useLiveMachine(machineId: string) {
  const baseline = telemetryByMachine.get(machineId)
  const sampleCursor = useRef(0)
  const [tick, setTick] = useState(0)
  const [waveform, setWaveform] = useState<number[]>([])

  useEffect(() => {
    sampleCursor.current = Math.max(0, (baseline?.waveform.length ?? 1) - 1)
    setTick(0)
    setWaveform(baseline ? [...baseline.waveform] : [])
    if (!baseline) return

    const timer = window.setInterval(() => {
      sampleCursor.current += 1
      const nextSample = generateWaveformSample(
        baseline.waveform,
        sampleCursor.current,
      )
      setWaveform((current) => advanceWaveform(current, nextSample))
      setTick((current) => current + 1)
    }, 500)

    return () => window.clearInterval(timer)
  }, [baseline])

  return useMemo<Telemetry | undefined>(() => {
    if (!baseline) return undefined
    return {
      ...baseline,
      spindleSpeed: Math.round(fluctuate(baseline.spindleSpeed, 0.006)),
      cuttingForce: Number(fluctuate(baseline.cuttingForce, 0.035).toFixed(1)),
      energyKw: Number(fluctuate(baseline.energyKw, 0.025).toFixed(1)),
      waveform,
      sampledAt: new Date().toISOString(),
    }
  }, [baseline, tick, waveform])
}