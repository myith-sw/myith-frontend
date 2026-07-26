import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom'
import App from './App'
import { getQuest } from './api/endpoints'
import type { QuestDetail } from './api/types'

const refreshCharacters = vi.hoisted(() => vi.fn(async () => {}))

vi.mock('./api/endpoints', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./api/endpoints')>()),
  getQuest: vi.fn(),
}))

vi.mock('./auth/useAuth', () => ({
  useAuth: () => ({
    loading: false,
    login: vi.fn(async () => ({ hasCharacters: true, isNewUser: false })),
    logout: vi.fn(),
    user: {
      email: 'tester@myith.test',
      nickname: '테스터',
      userId: 'usr_test',
    },
  }),
}))

vi.mock('./app/useApplication', () => ({
  useApplication: () => ({
    characters: [
      {
        characterId: 'chr_alpha',
        level: 1,
        nickname: '알파',
        roadmapId: 'rmp_alpha',
        species: 'teoreuteu',
      },
      {
        characterId: 'chr_beta',
        level: 2,
        nickname: '베타',
        roadmapId: 'rmp_beta',
        species: 'migeo',
      },
    ],
    charactersError: '',
    charactersLoaded: true,
    charactersLoading: false,
    onboarding: {
      answers: {},
      diagnosis: null,
      nickname: '',
      projectExperiences: [],
      selectedCategoryId: 'marketing',
      selectedEggId: null,
      selectedJob: null,
    },
    refreshCharacters,
    resetOnboarding: vi.fn(),
    setOnboarding: vi.fn(),
  }),
}))

const mockGetQuest = vi.mocked(getQuest)

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}</output>
}

function renderApp(path: string, previousPath?: string) {
  const router = createMemoryRouter(
    [
      {
        element: (
          <>
            <App />
            <LocationProbe />
          </>
        ),
        path: '*',
      },
    ],
    {
      initialEntries: previousPath ? [previousPath, path] : [path],
      initialIndex: previousPath ? 1 : 0,
    },
  )

  return { router, ...render(<RouterProvider router={router} />) }
}

function quest(overrides: Partial<QuestDetail> = {}): QuestDetail {
  return {
    axisCode: 'programming',
    axisName: '프로그래밍 기초',
    certifications: [],
    completionCriteria: '완료 기준',
    level: 1,
    questId: 'qst_1',
    roadmapId: 'rmp_alpha',
    status: 'OPEN',
    title: '테스트 퀘스트',
    version: 0,
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

beforeEach(() => {
  mockGetQuest.mockReset()
  refreshCharacters.mockClear()
})

describe('quest sidebar routing', () => {
  it('revalidates sidebar characters when the route screen opens', async () => {
    mockGetQuest.mockReturnValue(new Promise(() => {}))
    renderApp('/roadmaps/rmp_alpha/quests/qst_1')

    await waitFor(() => expect(refreshCharacters).toHaveBeenCalledTimes(1))
  })

  it('selects the route character before the quest response arrives', () => {
    mockGetQuest.mockReturnValue(new Promise(() => {}))
    renderApp('/roadmaps/rmp_alpha/quests/qst_1')

    expect(screen.getByRole('button', { name: '알파 아카이브 열기' })).toHaveClass(
      'border-[#7dcecb]',
      'bg-[#e9f9f8]',
    )
    expect(screen.getByRole('button', { name: '베타 아카이브 열기' })).not.toHaveClass(
      'border-[#7dcecb]',
    )
  })

  it('upgrades a legacy quest URL using the response roadmap', async () => {
    mockGetQuest.mockResolvedValue(quest())
    renderApp('/quests/qst_1')

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/roadmaps/rmp_alpha/quests/qst_1',
      )
    })
    expect(screen.getByRole('button', { name: '알파 아카이브 열기' })).toHaveClass(
      'border-[#7dcecb]',
    )
  })

  it('corrects a stale route using the response roadmap', async () => {
    mockGetQuest.mockResolvedValue(quest({ roadmapId: 'rmp_beta' }))
    renderApp('/roadmaps/rmp_alpha/quests/qst_1')

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/roadmaps/rmp_beta/quests/qst_1',
      )
    })
    expect(screen.getByRole('button', { name: '베타 아카이브 열기' })).toHaveClass(
      'border-[#7dcecb]',
    )
    await waitFor(() => expect(refreshCharacters).toHaveBeenCalledTimes(2))
  })

  it('blocks the roadmap button until unsaved STAR changes are confirmed', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    mockGetQuest.mockResolvedValue(quest())
    renderApp('/roadmaps/rmp_alpha/quests/qst_1')

    const situation = await screen.findByLabelText(/상황 \(Situation\)/)
    fireEvent.change(situation, { target: { value: '저장 전 상황' } })
    fireEvent.click(screen.getByRole('button', { name: '로드맵으로' }))

    await waitFor(() => expect(confirm).toHaveBeenCalledWith('지금 나가면 저장되지 않아요.\n나가시겠습니까?'))
    expect(screen.getByTestId('location')).toHaveTextContent('/roadmaps/rmp_alpha/quests/qst_1')
  })

  it('blocks browser back navigation until unsaved STAR changes are confirmed', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    mockGetQuest.mockResolvedValue(quest())
    const { router } = renderApp('/roadmaps/rmp_alpha/quests/qst_1', '/roadmaps/rmp_alpha')

    const situation = await screen.findByLabelText(/상황 \(Situation\)/)
    fireEvent.change(situation, { target: { value: '저장 전 상황' } })
    await router.navigate(-1)

    await waitFor(() => expect(confirm).toHaveBeenCalledWith('지금 나가면 저장되지 않아요.\n나가시겠습니까?'))
    expect(screen.getByTestId('location')).toHaveTextContent('/roadmaps/rmp_alpha/quests/qst_1')
  })

  it('proceeds with navigation after confirming unsaved STAR changes', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mockGetQuest.mockResolvedValue(quest())
    renderApp('/roadmaps/rmp_alpha/quests/qst_1')

    const situation = await screen.findByLabelText(/상황 \(Situation\)/)
    fireEvent.change(situation, { target: { value: '저장 전 상황' } })
    fireEvent.click(screen.getByRole('button', { name: '로드맵으로' }))

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/roadmaps/rmp_alpha'))
  })

  it('registers the browser unload warning only after STAR changes', async () => {
    mockGetQuest.mockResolvedValue(quest())
    renderApp('/roadmaps/rmp_alpha/quests/qst_1')

    const situation = await screen.findByLabelText(/상황 \(Situation\)/)
    const unchangedEvent = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(unchangedEvent)
    expect(unchangedEvent.defaultPrevented).toBe(false)

    fireEvent.change(situation, { target: { value: '저장 전 상황' } })
    await waitFor(() => {
      const changedEvent = new Event('beforeunload', { cancelable: true })
      window.dispatchEvent(changedEvent)
      expect(changedEvent.defaultPrevented).toBe(true)
    })
  })

  it('allows navigation without a confirmation when STAR has not changed', async () => {
    const confirm = vi.spyOn(window, 'confirm')
    mockGetQuest.mockResolvedValue(quest())
    renderApp('/roadmaps/rmp_alpha/quests/qst_1')

    await screen.findByLabelText(/상황 \(Situation\)/)
    fireEvent.click(screen.getByRole('button', { name: '로드맵으로' }))

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/roadmaps/rmp_alpha'))
    expect(confirm).not.toHaveBeenCalled()
  })
})
