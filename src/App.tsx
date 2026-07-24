import { useState } from 'react'
import { AppShell } from './components/AppShell'
import { CharacterNameStep } from './components/CharacterNameStep'
import { EggSelectionHome } from './components/EggSelectionHome'
import { JobSelection } from './components/JobSelection'
import { ArchivePage } from './components/ArchivePage'
import { MythHub } from './components/MythHub'
import { RoadmapPage } from './components/RoadmapPage'
import { SelfAssessment } from './components/SelfAssessment'
import { Sidebar } from './components/Sidebar'
import { mythCharacters, type EggId } from './data/home'
import type { RoadmapCharacter, RoadmapQuest } from './data/roadmap'
import {
  digitalMarketer,
  initialAssessmentAnswers,
  availableJobs,
  type AssessmentLevel,
  type CategoryId,
  type JobId,
  type OnboardingStep,
} from './data/onboarding'

function App() {
  const [step, setStep] = useState<OnboardingStep>('hub')
  const [activeCharacterId, setActiveCharacterId] = useState(mythCharacters[0].id)
  const [selectedEggId, setSelectedEggId] = useState<EggId | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId>('marketing')
  const [selectedJobId, setSelectedJobId] = useState<JobId | null>(null)
  const [nickname, setNickname] = useState('')
  const [assessmentAnswers, setAssessmentAnswers] = useState(initialAssessmentAnswers)
  const [roadmapTarget, setRoadmapTarget] = useState<{ kind: 'existing'; id: string } | { kind: 'draft' }>({
    kind: 'existing',
    id: mythCharacters[0].id,
  })
  const [customQuestsByRoadmap, setCustomQuestsByRoadmap] = useState<Record<string, RoadmapQuest[]>>({})
  const selectedJob = selectedJobId ? availableJobs.find((job) => job.id === selectedJobId) ?? null : null
  const openArchive = (characterId: string) => {
    setActiveCharacterId(characterId)
    setStep('archive')
  }
  const openRoadmap = (characterId: string) => {
    setActiveCharacterId(characterId)
    setRoadmapTarget({ kind: 'existing', id: characterId })
    setStep('roadmap')
  }

  if (step === 'hub') {
    return (
      <AppShell
        sidebar={
          <Sidebar
            characters={mythCharacters}
            onCreateCharacter={() => setStep('egg')}
            onHome={() => setStep('hub')}
            onSelectCharacter={openRoadmap}
          />
        }
        variant="hub"
      >
        <MythHub
          characters={mythCharacters}
          onCreateCharacter={() => setStep('egg')}
          onOpenRoadmap={openRoadmap}
          onOpenArchive={openArchive}
        />
      </AppShell>
    )
  }

  if (step === 'archive') {
    const activeCharacter = mythCharacters.find(({ id }) => id === activeCharacterId) ?? mythCharacters[0]

    return (
      <AppShell
        sidebar={
          <Sidebar
            activeCharacterId={activeCharacter.id}
            characters={mythCharacters}
            onCreateCharacter={() => setStep('egg')}
            onHome={() => setStep('hub')}
            onSelectCharacter={openRoadmap}
          />
        }
        variant="archive"
      >
        <ArchivePage character={activeCharacter} onOpenRoadmap={() => openRoadmap(activeCharacter.id)} />
      </AppShell>
    )
  }

  if (step === 'egg') {
    return (
      <AppShell
        sidebar={<Sidebar onHome={() => setStep('hub')} onSelectCharacter={openRoadmap} variant="samples" />}
        variant="home"
      >
        <EggSelectionHome
          onContinue={() => setStep('job-selection')}
          onSelectEgg={setSelectedEggId}
          selectedEggId={selectedEggId}
        />
      </AppShell>
    )
  }

  if (step === 'job-selection') {
    return (
      <AppShell sidebar={<Sidebar onHome={() => setStep('hub')} variant="empty" />} variant="selection">
        <JobSelection
          jobs={availableJobs}
          onSelectCategory={(categoryId) => {
            setSelectedCategoryId(categoryId)
            setSelectedJobId(null)
          }}
          onSelectJob={(job) => {
            setSelectedCategoryId(job.categoryId)
            setSelectedJobId(job.id)
            setStep('nickname')
          }}
          selectedCategoryId={selectedCategoryId}
        />
      </AppShell>
    )
  }

  if (step === 'nickname') {
    return (
      <AppShell sidebar={<Sidebar onHome={() => setStep('hub')} variant="empty" />} variant="selection">
        <CharacterNameStep
          key={selectedJob?.id ?? 'digital-marketer'}
          job={selectedJob ?? digitalMarketer}
          nickname={nickname}
          onContinue={() => setStep('self-assessment')}
          onNicknameChange={setNickname}
        />
      </AppShell>
    )
  }

  if (step === 'roadmap') {
    const isDraftRoadmap = roadmapTarget.kind === 'draft'
    const selectedJobForRoadmap = selectedJob ?? digitalMarketer
    const selectedExistingCharacter =
      roadmapTarget.kind === 'existing'
        ? mythCharacters.find(({ id }) => id === roadmapTarget.id) ?? mythCharacters[0]
        : mythCharacters[0]
    const activeRoadmapCharacter = isDraftRoadmap ? null : selectedExistingCharacter
    const roadmapCharacter: RoadmapCharacter = activeRoadmapCharacter
      ? {
          name: activeRoadmapCharacter.title,
          job: activeRoadmapCharacter.role,
          description: activeRoadmapCharacter.description,
          characterId: activeRoadmapCharacter.characterId,
          level: activeRoadmapCharacter.level,
          stage: activeRoadmapCharacter.stage,
          stageLabel: activeRoadmapCharacter.stageLabel,
          progress: activeRoadmapCharacter.progress,
        }
      : {
          name: nickname,
          job: selectedJobForRoadmap.title,
          description: selectedJobForRoadmap.description,
          characterId: selectedEggId ?? 'teoreuteu',
          level: 1,
          stage: 1,
          stageLabel: '입문 단계',
          progress: 5,
        }
    const roadmapKey = isDraftRoadmap ? 'draft' : selectedExistingCharacter.id

    return (
      <AppShell
        sidebar={
          isDraftRoadmap ? (
            <Sidebar
              draftCharacter={{ title: nickname, role: selectedJobForRoadmap.title, level: 1 }}
              onCreateCharacter={() => setStep('egg')}
              onHome={() => setStep('hub')}
              variant="draft"
            />
          ) : (
            <Sidebar
              activeCharacterId={selectedExistingCharacter.id}
              characters={mythCharacters}
              onCreateCharacter={() => setStep('egg')}
              onHome={() => setStep('hub')}
              onSelectCharacter={openRoadmap}
            />
          )
        }
        variant="roadmap"
      >
        <RoadmapPage
          character={roadmapCharacter}
          customQuests={customQuestsByRoadmap[roadmapKey] ?? []}
          onAddQuest={(quest) =>
            setCustomQuestsByRoadmap((current) => ({
              ...current,
              [roadmapKey]: [...(current[roadmapKey] ?? []), quest],
            }))
          }
        />
      </AppShell>
    )
  }

  return (
    <AppShell
      sidebar={
        <Sidebar
          draftCharacter={{
            title: nickname,
            role: (selectedJob ?? digitalMarketer).title,
            level: 1,
          }}
          onHome={() => setStep('hub')}
          variant="draft"
        />
      }
      variant="assessment"
    >
      <SelfAssessment
        answers={assessmentAnswers}
        jobTitle={(selectedJob ?? digitalMarketer).title}
        onGenerateRoadmap={() => {
          setRoadmapTarget({ kind: 'draft' })
          setStep('roadmap')
        }}
        onAnswerChange={(questionId, answer) =>
          setAssessmentAnswers((currentAnswers) => ({
            ...currentAnswers,
            [questionId]: answer as AssessmentLevel,
          }))
        }
      />
    </AppShell>
  )
}

export default App
