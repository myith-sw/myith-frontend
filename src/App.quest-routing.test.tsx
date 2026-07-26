import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import App from './App'
import { getQuest } from './api/endpoints'
import type { QuestDetail } from './api/types'

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
    refreshCharacters: vi.fn(),
    resetOnboarding: vi.fn(),
    setOnboarding: vi.fn(),
  }),
}))

const mockGetQuest = vi.mocked(getQuest)

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}</output>
}

function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  )
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

afterEach(cleanup)

beforeEach(() => {
  mockGetQuest.mockReset()
})

describe('quest sidebar routing', () => {
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
  })
})
