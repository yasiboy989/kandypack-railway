import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { UserProfile } from '../lib/api'
import { getProfile, loginWithPassword, logout as apiLogout, setAuthToken, getAuthToken } from '../lib/api'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  login: (username: string, password: string) => Promise<UserProfile>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize from token
  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      setLoading(false)
      return
    }
    getProfile()
      .then(setUser)
      .catch(() => {
        setAuthToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    await loginWithPassword(username, password)
    const profile = await getProfile()
    setUser(profile)
    return profile
  }, [])

  const logout = useCallback(() => {
    apiLogout()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
