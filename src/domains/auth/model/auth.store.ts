import { create } from 'zustand'
import { createJSONStorage, devtools, persist, type StateStorage } from 'zustand/middleware'

import type { LoginCredentials } from '@/domains/auth/model/auth.schema'
import { verifyDemoCredentials } from '@/domains/auth/model/demo-credentials'

interface AuthStore {
  isAuthenticated: boolean
  userEmail: string | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
}

const memoryStorage = new Map<string, string>()
const safeSessionStorage: StateStorage = {
  getItem: (name) => {
    try {
      return sessionStorage.getItem(name)
    } catch {
      return memoryStorage.get(name) ?? null
    }
  },
  setItem: (name, value) => {
    memoryStorage.set(name, value)
    try {
      sessionStorage.setItem(name, value)
    } catch {
      // Some mobile private browsers block storage. In-memory auth still works.
    }
  },
  removeItem: (name) => {
    memoryStorage.delete(name)
    try {
      sessionStorage.removeItem(name)
    } catch {
      // Ignore unavailable mobile storage.
    }
  },
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
        storage: createJSONStorage(() => safeSessionStorage),
        partialize: ({ isAuthenticated, userEmail }) => ({ isAuthenticated, userEmail }),
      },
    ),
    { name: 'Fearyn Auth' },
  ),
)