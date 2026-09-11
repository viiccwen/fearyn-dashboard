import { cn } from '@/shared/lib/cn'

interface SparklineProps {
  data: number[]
  label: string
  color?: 'brand' | 'success' | 'warning' | 'danger'
  height?: number
  showGrid?: boolean
  domain?: readonly [number, number]
  className?: string
}

const colors = {
  brand: { stroke: '#1689ff', fill: 'rgba(22,137,255,0.12)' },
  success: { stroke: '#10b981', fill: 'rgba(16,185,129,0.11)' },
  warning: { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.12)' },
  danger: { stroke: '#ef4444', fill: 'rgba(239,68,68,0.12)' },
}

function getPoints(
  data: number[],
  width: number,
  height: number,
  domain?: readonly [number, number],
) {
  if (data.length === 0) return ''
  const min = domain?.[0] ?? Math.min(...data)
  const max = domain?.[1] ?? Math.max(...data)
  const range = max - min || 1
  return data
    .map((value, index) => {
      const x = (index / Math.max(1, data.length - 1)) * width
      const y = height - ((value - min) / range) * (height - 16) - 8
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

export function Sparkline({
  data,
  label,
  color = 'brand',
  height = 140,
  showGrid = true,
  domain,
  className,
}: SparklineProps) {
  const width = 600
  const points = getPoints(data, width, height, domain)
  const area = points ? `0,${height} ${points} ${width},${height}` : ''
  const palette = colors[color]

  return (
    <svg
      className={cn('w-full overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      style={{ height }}
    >
      {showGrid && [0.25, 0.5, 0.75].map((ratio) => (
        <line
          key={ratio}
          x1="0"
          x2={width}
          y1={height * ratio}
          y2={height * ratio}
          stroke="#dfe7f1"
          strokeDasharray="4 6"
        />
      ))}
      {area && <polygon points={area} fill={palette.fill} />}
      {points && (
        <polyline
          points={points}
          fill="none"
          stroke={palette.stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  )
}