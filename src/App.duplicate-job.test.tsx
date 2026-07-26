import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { createRoadmap } from './api/endpoints'

const applicationState = vi.hoisted(() => ({
  characters: [{ characterId: 'chr_backend', jobCode: 'backend-developer' }],
  onboarding: {
    answers: {},
    diagnosis: {
      jobCode: 'backend-developer',
      levels: [],
      profileVersion: 1,
      questions: [],
    },
    nickname: '테스터',
    projectExperiences: [],
    selectedCategoryId: 'it',
    selectedEggId: 'teoreuteu',
    selectedJob: {
      categoryId: 'it',
      description: '서버를 구현한다',
      id: 'backend-developer',
      skills: [],
      title: '백엔드 개발자',
    },
  },
}))

vi.mock('./api/endpoints', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./api/endpoints')>()),
  createRoadmap: vi.fn(),
}))

vi.mock('./auth/useAuth', () => ({
  useAuth: () => ({
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    user: { email: 'tester@myith.test', id: 'usr_test' },
  }),
}))

vi.mock('./app/useApplication', () => ({
  useApplication: () => ({
    ...applicationState,
    charactersError: '',
    charactersLoaded: true,
    charactersLoading: false,
    refreshCharacters: vi.fn(),
    resetOnboarding: vi.fn(),
    setOnboarding: vi.fn(),
  }),
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('duplicate job creation', () => {
  it('alerts and does not request roadmap creation for an existing job', () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined)

    render(
      <MemoryRouter initialEntries={['/characters/new/assessment']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: '로드맵 생성' }))

    expect(alert).toHaveBeenCalledWith('이미 존재하는 직무입니다.')
    expect(createRoadmap).not.toHaveBeenCalled()
  })
})
