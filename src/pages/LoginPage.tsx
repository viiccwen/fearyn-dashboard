import { useRef, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { loginSchema } from '@/domains/auth/model/auth.schema'
import { useAuthStore } from '@/domains/auth/model/auth.store'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Logo } from '@/shared/ui/Logo'

interface FieldErrors {
  email?: string
  password?: string
  form?: string
}

export default function LoginPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const location = useLocation()
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const destination = (location.state as { from?: string } | null)?.from ?? '/'

  if (isAuthenticated) return <Navigate to={destination} replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = loginSchema.safeParse({ email, password })

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      const nextErrors = {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      }
      setErrors(nextErrors)
      if (nextErrors.email) emailRef.current?.focus()
      else passwordRef.current?.focus()
      return
    }

    setErrors({})
    setIsSubmitting(true)
    try {
      const authenticated = await login(result.data)
      if (!authenticated) {
        setErrors({ form: '帳號或密碼錯誤' })
        passwordRef.current?.focus()
        return
      }
      navigate(destination, { replace: true })
    } catch {
      setErrors({ form: '登入驗證無法完成，請重新整理後再試' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-[0.9fr_1.1fr]">
      <section className="data-grid relative hidden overflow-hidden bg-ink-950 p-12 text-white lg:flex lg:items-center xl:p-16">
        <div className="pointer-events-none absolute -left-24 top-1/3 size-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="relative max-w-lg">
          <p className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            讓加工被數據看見
          </p>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-400">
            即時掌握機台風險、加工負載與設備健康度。
          </p>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3">
            <Logo />
            <h1 className="text-3xl font-bold tracking-tight text-ink-950">登入 Fearyn Console</h1>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">使用授權帳號開啟機台監控平台。</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="email" className="text-sm font-semibold text-ink-900">電子郵件</label>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (errors.email || errors.form) setErrors({ ...errors, email: undefined, form: undefined })
                }}
                className={cn(
                  'mt-2 h-12 w-full rounded-xl border bg-white px-4 text-base text-ink-950 outline-none transition-all placeholder:text-slate-400 focus:ring-4',
                  errors.email
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-line focus:border-brand-300 focus:ring-brand-100',
                )}
                placeholder="name@example.com"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && <p id="email-error" className="mt-2 text-xs text-red-600" role="alert">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="password" className="text-sm font-semibold text-ink-900">密碼</label>
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="min-h-9 rounded-lg px-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                >
                  {showPassword ? '隱藏' : '顯示'}
                </button>
              </div>
              <input
                ref={passwordRef}
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  if (errors.password || errors.form) setErrors({ ...errors, password: undefined, form: undefined })
                }}
                className={cn(
                  'mt-2 h-12 w-full rounded-xl border bg-white px-4 text-base text-ink-950 outline-none transition-all focus:ring-4',
                  errors.password || errors.form
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-line focus:border-brand-300 focus:ring-brand-100',
                )}
                aria-invalid={Boolean(errors.password || errors.form)}
                aria-describedby={errors.password ? 'password-error' : errors.form ? 'login-error' : undefined}
              />
              {errors.password && <p id="password-error" className="mt-2 text-xs text-red-600" role="alert">{errors.password}</p>}
            </div>

            {errors.form && (
              <div id="login-error" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">
                {errors.form}
              </div>
            )}

            <Button type="submit" className="w-full" loading={isSubmitting}>登入</Button>
          </form>

        </div>
      </section>
    </main>
  )
}