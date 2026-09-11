import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { Bell } from 'lucide-react'

import { primaryNavigation } from '@/app/navigation'
import { selectOpenAlertCount, useAlertStore } from '@/domains/alerts/model/alert.store'
import { useAuthStore } from '@/domains/auth/model/auth.store'
import { cn } from '@/shared/lib/cn'
import { Logo } from '@/shared/ui/Logo'
import { GlobalMachineSearch } from '@/app/layout/GlobalMachineSearch'

function DesktopSidebar() {
  const openCount = useAlertStore(selectOpenAlertCount)

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-ink-950 text-white lg:flex">
      <div className="flex h-20 items-center border-b border-white/8 px-6">
        <Logo inverse />
      </div>
      <div className="mx-4 mt-5 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          Edge 系統運作中
          <span className="live-pulse ml-auto size-2 rounded-full bg-emerald-400" aria-hidden="true" />
        </div>
      </div>
      <nav className="mt-6 flex-1 px-3" aria-label="主要導覽">
        <ul className="space-y-1">
          {primaryNavigation.map(({ path, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === '/'}
                className={({ isActive }) => cn(
                  'group flex min-h-11 items-center rounded-xl px-4 text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-brand-600 text-white shadow-[0_8px_24px_rgba(8,119,249,0.22)]'
                    : 'text-slate-400 hover:bg-white/10 hover:text-white',
                )}
              >
                <span>{label}</span>
                {path === '/alerts' && openCount > 0 && (
                  <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none text-white">
                    {openCount}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

function TopBar() {
  const openCount = useAlertStore(selectOpenAlertCount)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:h-20 lg:px-8">
      <Logo compact className="lg:hidden" />
      <button type="button" className="hidden size-11 place-items-center rounded-xl border border-line bg-white transition-colors hover:bg-slate-50 xl:grid" aria-label="切換場域：大安高工第一實習工場">
        <img src="./daan-vocational-emblem.webp" alt="" className="size-8 object-contain" width="32" height="32" />
      </button>
      <GlobalMachineSearch />
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden rounded-full bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:block">LIVE</div>
        <button
          type="button"
          onClick={() => navigate('/alerts')}
          className="relative grid size-11 place-items-center rounded-xl border border-line bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-ink-900"
          aria-label={`開啟告警中心，${openCount} 筆未結案`}
        >
          <Bell className="size-5" />
          {openCount > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="min-h-11 rounded-xl px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink-900"
        >
          登出
        </button>
      </div>
    </header>
  )
}

function MobileBottomNavigation() {
  const openCount = useAlertStore(selectOpenAlertCount)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden" aria-label="行動版主要導覽">
      <ul className="grid grid-cols-4">
        {primaryNavigation.map(({ path, label, icon: Icon }) => (
          <li key={path}>
            <NavLink
              to={path}
              end={path === '/'}
              className={({ isActive }) => cn(
                'relative flex min-h-12 items-center justify-center rounded-xl transition-colors',
                isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50 hover:text-ink-800',
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="sr-only">{label}</span>
              {path === '/alerts' && openCount > 0 && (
                <span className="absolute right-[22%] top-1 size-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export function AppShell() {
  const location = useLocation()

  return (
    <div className="min-h-dvh bg-surface">
      <a href="#main-content" className="fixed left-4 top-3 z-50 -translate-y-20 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0">
        跳至主要內容
      </a>
      <DesktopSidebar />
      <div className="lg:pl-64">
        <TopBar />
        <main id="main-content" key={location.pathname} className="mx-auto min-h-[calc(100dvh-5rem)] max-w-[1600px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <MobileBottomNavigation />
    </div>
  )
}