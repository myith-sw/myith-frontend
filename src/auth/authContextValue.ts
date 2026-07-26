import { createContext } from 'react'
import type { UserResponse } from '../api/types'

export interface AuthContextValue {
  loading: boolean
  user: UserResponse | null
  login: (idToken: string) => Promise<{
    hasCharacters: boolean
    isNewUser: boolean
  }>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
