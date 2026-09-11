export function advanceWaveform(samples: readonly number[], nextSample: number) {
  if (samples.length === 0) return [nextSample]
  return [...samples.slice(1), nextSample]
}

export function generateWaveformSample(
  pattern: readonly number[],
  cursor: number,
  random: () => number = Math.random,
) {
  if (pattern.length === 0) return 0

  const baseSample = pattern[cursor % pattern.length] ?? 0
  if (baseSample === 0 && pattern.every((sample) => sample === 0)) return 0

  const noiseAmplitude = Math.max(0.8, baseSample * 0.14)
  const noise = (random() - 0.5) * noiseAmplitude
  return Number(Math.max(0, baseSample + noise).toFixed(2))
}