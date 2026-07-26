import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getCharacters } from '../api/endpoints'
import type { CharacterSummary } from '../api/types'
import { createEmptyProjectExperience } from '../data/onboarding'
import { useAuth } from '../auth/useAuth'
import { ApplicationContext, type OnboardingState } from './applicationContextValue'

const initialOnboarding: OnboardingState = {
  selectedEggId: null,
  selectedCategoryId: 'marketing',
  selectedJob: null,
  nickname: '',
  diagnosis: null,
  answers: {},
  projectExperiences: [createEmptyProjectExperience()],
}

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [characters, setCharacters] = useState<CharacterSummary[]>([])
  const [charactersLoaded, setCharactersLoaded] = useState(false)
  const [charactersLoading, setCharactersLoading] = useState(false)
  const [charactersError, setCharactersError] = useState('')
  const [onboarding, setOnboarding] = useState<OnboardingState>(initialOnboarding)

  const refreshCharacters = useCallback(async () => {
    if (!user) {
      setCharacters([])
      setCharactersLoaded(false)
      setCharactersLoading(false)
      return
    }

    setCharactersLoading(true)
    setCharactersError('')
    try {
      setCharacters(await getCharacters())
    } catch (error) {
      setCharactersError(error instanceof Error ? error.message : '캐릭터를 불러오지 못했습니다.')
    } finally {
      setCharactersLoaded(true)
      setCharactersLoading(false)
    }
  }, [user])

  useEffect(() => {
    void refreshCharacters()
  }, [refreshCharacters])

  const resetOnboarding = useCallback(() => {
    setOnboarding({
      ...initialOnboarding,
      projectExperiences: [createEmptyProjectExperience()],
    })
  }, [])

  const value = useMemo(
    () => ({
      characters,
      charactersError,
      charactersLoaded,
      charactersLoading,
      onboarding,
      refreshCharacters,
      resetOnboarding,
      setOnboarding,
    }),
    [
      characters,
      charactersError,
      charactersLoaded,
      charactersLoading,
      onboarding,
      refreshCharacters,
      resetOnboarding,
    ],
  )
  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>
}
