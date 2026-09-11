import {
  Activity,
  BellRing,
  ChartNoAxesCombined,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
  label: string
  shortLabel: string
  path: string
  icon: LucideIcon
}

export const primaryNavigation: NavigationItem[] = [
  { label: '機台總覽', shortLabel: '總覽', path: '/', icon: LayoutDashboard },
  { label: '機台監控', shortLabel: '機台', path: '/machines', icon: Activity },
  { label: '分析中心', shortLabel: '分析', path: '/analytics', icon: ChartNoAxesCombined },
  { label: '告警中心', shortLabel: '告警', path: '/alerts', icon: BellRing },
]