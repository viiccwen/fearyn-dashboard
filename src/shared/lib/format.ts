const numberFormatter = new Intl.NumberFormat('zh-TW')
const compactFormatter = new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 1 })
const dateTimeFormatter = new Intl.DateTimeFormat('zh-TW', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export const formatNumber = (value: number) => numberFormatter.format(value)
export const formatDecimal = (value: number) => compactFormatter.format(value)
export const formatDateTime = (value: string) => dateTimeFormatter.format(new Date(value))

export function formatRelativeTime(value: string) {
  const diffMinutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000))
  if (diffMinutes < 1) return '剛剛'
  if (diffMinutes < 60) return `${diffMinutes} 分鐘前`
  const hours = Math.floor(diffMinutes / 60)
  if (hours < 24) return `${hours} 小時前`
  return formatDateTime(value)
}