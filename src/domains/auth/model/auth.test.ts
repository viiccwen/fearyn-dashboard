import { beforeEach, describe, expect, it } from 'vitest'

import { loginSchema } from '@/domains/auth/model/auth.schema'
import { useAuthStore } from '@/domains/auth/model/auth.store'
import { hashDemoPassword, verifyDemoCredentials } from '@/domains/auth/model/demo-credentials'

describe('demo authentication', () => {
  beforeEach(() => {
    sessionStorage.clear()
    useAuthStore.setState({ isAuthenticated: false, userEmail: null })
  })

  it('validates the login payload with Zod', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: '' }).success).toBe(false)
  })

  it('verifies the configured account against a salted password hash', async () => {
    const credentials = { email: 'viiccwen@gmail.com', password: '123456' }

    expect(await hashDemoPassword(credentials.password)).not.toBe(credentials.password)
    expect(await verifyDemoCredentials(credentials)).toBe(true)
    expect(await verifyDemoCredentials({ ...credentials, password: 'incorrect' })).toBe(false)
  })

  it('stores only authenticated session state and supports logout', async () => {
    const authenticated = await useAuthStore.getState().login({
      email: 'viiccwen@gmail.com',
      password: '123456',
    })

    expect(authenticated).toBe(true)
    expect(useAuthStore.getState()).toMatchObject({
      isAuthenticated: true,
      userEmail: 'viiccwen@gmail.com',
    })
    expect(sessionStorage.getItem('fearyn-demo-session')).not.toContain('123456')

    useAuthStore.getState().logout()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})