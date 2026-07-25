import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { authStore } from './authStore'
import { apiRequest } from './client'

let refreshCount = 0
let validAccessToken = false

const server = setupServer(
  http.get('http://localhost/api/jobs', ({ request }) => {
    if (!validAccessToken || request.headers.get('Authorization') !== 'Bearer refreshed-access') {
      return HttpResponse.json(
        { error: { code: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다.' } },
        { status: 401 },
      )
    }
    return HttpResponse.json({ data: { categories: [] } })
  }),
  http.post('http://localhost/api/auth/refresh', async () => {
    refreshCount += 1
    await new Promise((resolve) => setTimeout(resolve, 20))
    validAccessToken = true
    return HttpResponse.json({ data: { accessToken: 'refreshed-access' } })
  }),
  http.get('http://localhost/api/error', () =>
    HttpResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: '입력값을 확인해주세요.',
          fieldErrors: { nickname: '필수입니다.' },
          requestId: 'req-1',
        },
      },
      { status: 422 },
    ),
  ),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  authStore.clear()
  refreshCount = 0
  validAccessToken = false
})
afterAll(() => server.close())

describe('API client', () => {
  it('refreshes an expired token only once for concurrent requests', async () => {
    authStore.setTokens({ refreshToken: 'refresh-token' })
    const [first, second] = await Promise.all([
      apiRequest<{ categories: unknown[] }>('/api/jobs'),
      apiRequest<{ categories: unknown[] }>('/api/jobs'),
    ])
    expect(first.categories).toEqual([])
    expect(second.categories).toEqual([])
    expect(refreshCount).toBe(1)
  })

  it('normalizes common API errors', async () => {
    await expect(apiRequest('/api/error')).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      status: 422,
      fieldErrors: { nickname: '필수입니다.' },
      requestId: 'req-1',
    })
  })
})
