import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import App from './App'

const applicationState = vi.hoisted(() => ({
  characters: [] as Array<Record<string, unknown>>,
  charactersError: '',
  charactersLoaded: true,
  charactersLoading: false,
}))

vi.mock('./auth/useAuth', () => ({
  useAuth: () => ({
    loading: false,
    login: vi.fn(async () => ({ hasCharacters: false, isNewUser: false })),
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
    ...applicationState,
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

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}</output>
}

afterEach(() => {
  cleanup()
  applicationState.characters = []
  applicationState.charactersError = ''
  applicationState.charactersLoaded = true
  applicationState.charactersLoading = false
})

describe('empty character home routing', () => {
  it('redirects a resolved empty character response to egg selection', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('location')).toHaveTextContent('/characters/new/egg')
    expect(screen.getByText('알을 골라 신화를 시작해보세요')).toBeInTheDocument()
  })

  it('waits for the first character request before redirecting', () => {
    applicationState.charactersLoaded = false
    applicationState.charactersLoading = true

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('location')).toHaveTextContent('/')
    expect(screen.getByText('데이터를 불러오고 있어요…')).toBeInTheDocument()
  })
})
