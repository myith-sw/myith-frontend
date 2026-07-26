import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { authStore } from '../api/authStore'
import {
  getCharacters,
  getMe,
  loginWithGoogle,
  restoreSession,
} from '../api/endpoints'
import type { UserResponse } from '../api/types'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserResponse | null>(null)

  useEffect(() => {
    let active = true
    restoreSession()
      .then((restoredUser) => {
        if (active) setUser(restoredUser)
      })
      .catch(() => {
        authStore.clear()
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (idToken: string) => {
    const result = await loginWithGoogle(idToken)
    const nextUser = await getMe()
    const characters = await getCharacters()
    setUser(nextUser)
    return {
      hasCharacters: characters.length > 0,
      isNewUser: Boolean(result.isNewUser),
    }
  }, [])

  const logout = useCallback(() => {
    authStore.clear()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ loading, user, login, logout }), [loading, login, logout, user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
