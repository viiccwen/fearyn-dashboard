import { lazy, Suspense } from 'react'
import { createHashRouter } from 'react-router-dom'

import { ProtectedRoute } from '@/app/auth/ProtectedRoute'
import { AppShell } from '@/app/layout/AppShell'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const MachinesPage = lazy(() => import('@/pages/MachinesPage'))
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'))
const AlertsPage = lazy(() => import('@/pages/AlertsPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function PageLoader() {
  return (
    <div className="grid min-h-[60dvh] place-items-center" role="status" aria-label="正在載入頁面">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600" />
        <span className="text-sm font-medium text-slate-500">載入監測資料…</span>
      </div>
    </div>
  )
}

const withSuspense = (page: React.ReactNode) => <Suspense fallback={<PageLoader />}>{page}</Suspense>

export const router = createHashRouter([
  {
    path: 'login',
    element: withSuspense(<LoginPage />),
  },
  {
    element: <ProtectedRoute><AppShell /></ProtectedRoute>,
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'machines', element: withSuspense(<MachinesPage />) },
      { path: 'analytics', element: withSuspense(<AnalyticsPage />) },
      { path: 'alerts', element: withSuspense(<AlertsPage />) },
      { path: '*', element: withSuspense(<NotFoundPage />) },
    ],
  },
])