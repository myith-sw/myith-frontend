function parseBoolean(value: string | undefined) {
  return value === 'true'
}

export const apiConfig = {
  baseUrl: (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080').replace(/\/$/, ''),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
  useMocks:
    parseBoolean(import.meta.env.VITE_USE_API_MOCKS) ||
    (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL),
}
