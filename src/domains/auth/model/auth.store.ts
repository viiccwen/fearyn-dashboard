import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import type { LoginCredentials } from '@/domains/auth/model/auth.schema'
import { verifyDemoCredentials } from '@/domains/auth/model/demo-credentials'

interface AuthStore {
  isAuthenticated: boolean
  userEmail: string | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set) => ({
        isAuthenticated: false,
        userEmail: null,
        login: async (credentials) => {
          const isValid = await verifyDemoCredentials(credentials)
          if (!isValid) return false

          set(
            { isAuthenticated: true, userEmail: credentials.email.trim().toLowerCase() },
            false,
            'auth/login',
          )
          return true
        },
        logout: () => set(
          { isAuthenticated: false, userEmail: null },
          false,
          'auth/logout',
        ),
      }),
      {
        name: 'fearyn-demo-session',
        storage: createJSONStorage(() => sessionStorage),
        partialize: ({ isAuthenticated, userEmail }) => ({ isAuthenticated, userEmail }),
      },
    ),
    { name: 'Fearyn Auth' },
  ),
)