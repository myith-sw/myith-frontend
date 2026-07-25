import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import {
  completeQuest,
  createRoadmap,
  getHealth,
  getStarRecords,
} from './endpoints'

const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Swagger-compatible endpoints', () => {
  it('sends the backend CreateRoadmapRequest without a CORS-blocked idempotency header', async () => {
    server.use(
      http.post('http://localhost/api/roadmaps', async ({ request }) => {
        expect(request.headers.get('Idempotency-Key')).toBeNull()
        expect(await request.json()).toEqual({
          jobCode: 'server',
          profileVersion: 1,
          species: 'deokbaseu',
          nickname: '견습 서버 개발자',
          answers: [{ skillCode: 'git', level: 'tried' }],
          narrative: { experience: '프로젝트 경험' },
          repoUrl: 'https://github.com/myith-sw/myith-frontend',
          fileKey: 'portfolio/user/file.pdf',
        })
        return HttpResponse.json({
          data: {
            roadmapId: 'rmp_42',
            generationState: 'ANALYZING',
          },
        })
      }),
    )

    await expect(
      createRoadmap({
        jobCode: 'server',
        profileVersion: 1,
        species: 'deokbaseu',
        nickname: '견습 서버 개발자',
        answers: [{ skillCode: 'git', level: 'tried' }],
        narrative: { experience: '프로젝트 경험' },
        repoUrl: 'https://github.com/myith-sw/myith-frontend',
        fileKey: 'portfolio/user/file.pdf',
      }),
    ).resolves.toMatchObject({
      roadmapId: 'rmp_42',
      generationState: 'ANALYZING',
    })
  })

  it('sends prefixed quest IDs as strings and omits the optional idempotency header', async () => {
    server.use(
      http.patch('http://localhost/api/quests/qst_17/complete', async ({ request }) => {
        expect(request.headers.get('Idempotency-Key')).toBeNull()
        expect(await request.json()).toEqual({ completed: true, version: 3 })
        return HttpResponse.json({
          data: {
            quest: {
              questId: 'qst_17',
              status: 'DONE',
              version: 4,
            },
          },
        })
      }),
    )

    await expect(
      completeQuest('qst_17', { completed: true, version: 3 }),
    ).resolves.toMatchObject({
      quest: { questId: 'qst_17', version: 4 },
    })
  })

  it('keeps pagination meta for STAR records', async () => {
    server.use(
      http.get('http://localhost/api/star/records', ({ request }) => {
        expect(new URL(request.url).searchParams.get('size')).toBe('20')
        return HttpResponse.json({
          data: [],
          meta: { nextCursor: 'next-page', hasNext: true },
        })
      }),
    )

    await expect(getStarRecords({ size: 20 })).resolves.toEqual({
      data: [],
      meta: { nextCursor: 'next-page', hasNext: true },
    })
  })

  it('parses the unwrapped health response', async () => {
    server.use(
      http.get('http://localhost/api/health', () =>
        HttpResponse.json({
          status: 'ok',
          version: '0.1.0',
          time: '2026-07-25T00:00:00Z',
        }),
      ),
    )

    await expect(getHealth()).resolves.toMatchObject({ status: 'ok' })
  })
})
