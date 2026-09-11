import { cn } from '@/shared/lib/cn'

interface LogoProps {
  compact?: boolean
  inverse?: boolean
  className?: string
}

export function Logo({ compact = false, inverse = false, className }: LogoProps) {
  void compact
  void inverse
  return (
    <img
      src="./fearyn.webp"
      alt="Fearyn.ai"
      className={cn('size-10 shrink-0 object-contain', className)}
      width="40"
      height="40"
    />
  )
}