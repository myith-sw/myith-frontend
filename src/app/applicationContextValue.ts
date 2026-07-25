import { createContext, type Dispatch, type SetStateAction } from 'react'
import type { CharacterSummary, DiagnosisResponse } from '../api/types'
import type { EggId } from '../data/home'
import type { JobOption, ProjectExperience } from '../data/onboarding'

export interface OnboardingState {
  selectedEggId: EggId | null
  selectedCategoryId: string
  selectedJob: JobOption | null
  nickname: string
  diagnosis: DiagnosisResponse | null
  answers: Record<string, string>
  projectExperiences: ProjectExperience[]
}

export interface ApplicationContextValue {
  characters: CharacterSummary[]
  charactersError: string
  charactersLoading: boolean
  onboarding: OnboardingState
  refreshCharacters: () => Promise<void>
  resetOnboarding: () => void
  setOnboarding: Dispatch<SetStateAction<OnboardingState>>
}

export const ApplicationContext = createContext<ApplicationContextValue | null>(null)
