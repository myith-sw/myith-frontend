import { apiConfig } from './config'
import { authStore } from './authStore'
import { mockFetch } from './mockBackend'
import type { ApiEnvelope, ApiErrorBody } from './types'

export class ApiError extends Error {
  code: string
  fieldErrors?: Record<string, string>
  requestId?: string
  retryAfterSeconds?: number
  status: number

  constructor(status: number, body: ApiErrorBody) {
    super(body.error?.message ?? `요청에 실패했습니다. (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.code = body.error?.code ?? 'UNKNOWN_ERROR'
    this.fieldErrors = body.error?.fieldErrors
    this.requestId = body.error?.requestId
    this.retryAfterSeconds = body.meta?.retryAfterSeconds
  }
}

let refreshPromise: Promise<string> | null = null

async function dispatch(path: string, init: RequestInit) {
  const url = path.startsWith('http') ? path : `${apiConfig.baseUrl}${path}`
  return apiConfig.useMocks ? mockFetch(url, init) : fetch(url, init)
}

async function readError(response: Response) {
  try {
    return (await response.clone().json()) as ApiErrorBody
  } catch {
    return { error: { code: 'INVALID_RESPONSE', message: `서버 응답을 읽지 못했습니다. (${response.status})` } }
  }
}

async function refreshAccessToken() {
  const refreshToken = authStore.getRefreshToken()
  if (!refreshToken) throw new ApiError(401, { error: { code: 'NO_REFRESH_TOKEN', message: '다시 로그인해주세요.' } })

  const response = await dispatch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!response.ok) {
    authStore.clear()
    throw new ApiError(response.status, await readError(response))
  }
  const envelope = (await response.json()) as ApiEnvelope<{ accessToken?: string }>
  if (!envelope.data.accessToken) throw new Error('토큰 갱신 응답에 accessToken이 없습니다.')
  authStore.setTokens({ accessToken: envelope.data.accessToken })
  return envelope.data.accessToken
}

async function getRefreshedAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

async function requestResponse(path: string, init: RequestInit = {}, retry = true) {
  const headers = new Headers(init.headers)
  const token = authStore.getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response = await dispatch(path, { ...init, headers })
  if (response.status === 401 && retry && authStore.getRefreshToken()) {
    const body = await readError(response)
    if (body.error?.code === 'TOKEN_EXPIRED' || body.error?.code === 'UNAUTHORIZED') {
      const nextToken = await getRefreshedAccessToken()
      headers.set('Authorization', `Bearer ${nextToken}`)
      response = await dispatch(path, { ...init, headers })
    }
  }
  return response
}

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  return (await apiEnvelopeRequest<T>(path, init)).data
}

export async function apiEnvelopeRequest<T>(
  path: string,
  init: RequestInit = {},
) {
  const response = await requestResponse(path, init)
  if (!response.ok) throw new ApiError(response.status, await readError(response))
  if (response.status === 204) {
    return { data: undefined as T } satisfies ApiEnvelope<T>
  }

  return (await response.json()) as ApiEnvelope<T>
}

export async function apiRaw(path: string, init: RequestInit = {}) {
  const response = await requestResponse(path, init)
  if (!response.ok) throw new ApiError(response.status, await readError(response))
  return response
}

export async function apiPublicRequest<T>(path: string, init: RequestInit = {}) {
  const response = await dispatch(path, init)
  if (!response.ok) throw new ApiError(response.status, await readError(response))
  const envelope = (await response.json()) as ApiEnvelope<T>
  return envelope.data
}

export async function apiPublicValue<T>(path: string, init: RequestInit = {}) {
  const response = await dispatch(path, init)
  if (!response.ok) throw new ApiError(response.status, await readError(response))
  return (await response.json()) as T
}
