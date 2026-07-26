import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  selectedCategoryId: 'business',
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
  const activeUserKey = user?.id ?? user?.email ?? ''
  const activeUserKeyRef = useRef(activeUserKey)
  const refreshSequenceRef = useRef(0)
  activeUserKeyRef.current = activeUserKey

  const refreshCharacters = useCallback(async () => {
    if (!activeUserKey) {
      refreshSequenceRef.current += 1
      setCharacters([])
      setCharactersError('')
      setCharactersLoaded(false)
      setCharactersLoading(false)
      return
    }

    const requestSequence = ++refreshSequenceRef.current
    setCharactersLoading(true)
    setCharactersError('')
    try {
      const nextCharacters = await getCharacters()
      if (
        activeUserKeyRef.current === activeUserKey &&
        refreshSequenceRef.current === requestSequence
      ) {
        setCharacters(nextCharacters)
      }
    } catch (error) {
      if (
        activeUserKeyRef.current === activeUserKey &&
        refreshSequenceRef.current === requestSequence
      ) {
        setCharactersError(
          error instanceof Error ? error.message : '캐릭터를 불러오지 못했습니다.',
        )
      }
    } finally {
      if (
        activeUserKeyRef.current === activeUserKey &&
        refreshSequenceRef.current === requestSequence
      ) {
        setCharactersLoaded(true)
        setCharactersLoading(false)
      }
    }
  }, [activeUserKey])

  useEffect(() => {
    if (activeUserKey) return

    refreshSequenceRef.current += 1
    setCharacters([])
    setCharactersError('')
    setCharactersLoaded(false)
    setCharactersLoading(false)
  }, [activeUserKey])

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
