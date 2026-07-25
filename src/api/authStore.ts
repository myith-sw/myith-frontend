const refreshTokenKey = 'myith.refreshToken'

let accessToken: string | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

export const authStore = {
  getAccessToken() {
    return accessToken
  },
  getRefreshToken() {
    return typeof window === 'undefined' ? null : window.sessionStorage.getItem(refreshTokenKey)
  },
  setTokens(tokens: { accessToken?: string | null; refreshToken?: string | null }) {
    accessToken = tokens.accessToken ?? null
    if (typeof window !== 'undefined' && tokens.refreshToken !== undefined) {
      if (tokens.refreshToken) {
        window.sessionStorage.setItem(refreshTokenKey, tokens.refreshToken)
      } else {
        window.sessionStorage.removeItem(refreshTokenKey)
      }
    }
    emit()
  },
  clear() {
    accessToken = null
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(refreshTokenKey)
    }
    emit()
  },
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
}
