import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api, setToken } from '../lib/api'
import type { AuthUser, SessionResponse } from '../types'

interface AuthState {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterInput) => Promise<void>
  logout: () => void
}

export interface RegisterInput {
  user_name: string
  email: string
  password: string
}

const USER_KEY = 'godtasker.user'

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  })

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  }, [user])

  async function login(email: string, password: string) {
    const { data } = await api.post<SessionResponse>('/sessions', {
      email,
      password,
    })
    setToken(data.token)
    setUser(data.user)
  }

  async function register(input: RegisterInput) {
    await api.post('/users', input)
    // Registration does not return a token; log in to obtain one.
    await login(input.email, input.password)
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  // AuthProvider only re-renders when `user` changes, so a fresh value object
  // here is created exactly when it should be.
  const value: AuthState = { user, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
