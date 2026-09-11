import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="grid min-h-[65dvh] place-items-center px-4 text-center">
      <div>
        <p className="font-mono text-sm font-semibold text-brand-700">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink-950">找不到這個監控頁面</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">連結可能已變更，或目前帳號沒有此場域的存取權限。</p>
        <Button className="mt-6" onClick={() => navigate('/')}>返回機台總覽</Button>
      </div>
    </div>
  )
}