import { cn } from '@/shared/lib/cn'

interface Segment<T extends string> {
  label: string
  value: T
}

interface SegmentedControlProps<T extends string> {
  label: string
  options: Array<Segment<T>>
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex rounded-xl bg-slate-100 p-1" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-9 rounded-lg px-3 text-sm font-semibold transition-all duration-200',
            value === option.value
              ? 'bg-white text-ink-900 shadow-sm'
              : 'text-slate-500 hover:text-ink-800',
          )}
          aria-pressed={value === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}