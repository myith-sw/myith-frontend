import { useState } from 'react'
import { AppShell } from './components/AppShell'
import { CharacterNameStep } from './components/CharacterNameStep'
import { EggSelectionHome } from './components/EggSelectionHome'
import { JobSelection } from './components/JobSelection'
import { ArchivePage } from './components/ArchivePage'
import { MythHub } from './components/MythHub'
import { QuestDetailPage } from './components/QuestDetailPage'
import { RoadmapPage } from './components/RoadmapPage'
import { SelfAssessment } from './components/SelfAssessment'
import { Sidebar } from './components/Sidebar'
import {
  assessmentToCompetencyScores,
  type ArchiveCharacter,
  type ArchiveSkillGroup,
} from './data/archive'
import { mythCharacters, type EggId } from './data/home'
import { getRoadmapQuestGroups, type RoadmapCharacter, type RoadmapQuest } from './data/roadmap'
import {
  createEmptyProjectExperience,
  digitalMarketer,
  initialAssessmentAnswers,
  availableJobs,
  type AssessmentLevel,
  type CategoryId,
  type JobId,
  type OnboardingStep,
  type ProjectExperience,
} from './data/onboarding'

function App() {
  const [step, setStep] = useState<OnboardingStep>('hub')
  const [activeCharacterId, setActiveCharacterId] = useState(mythCharacters[0].id)
  const [selectedEggId, setSelectedEggId] = useState<EggId | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId>('marketing')
  const [selectedJobId, setSelectedJobId] = useState<JobId | null>(null)
  const [nickname, setNickname] = useState('')
  const [assessmentAnswers, setAssessmentAnswers] = useState(initialAssessmentAnswers)
  const [projectExperiences, setProjectExperiences] = useState<ProjectExperience[]>(() => [
    createEmptyProjectExperience(),
  ])
  const [roadmapTarget, setRoadmapTarget] = useState<{ kind: 'existing'; id: string } | { kind: 'draft' }>({
    kind: 'existing',
    id: mythCharacters[0].id,
  })
  const [customQuestsByRoadmap, setCustomQuestsByRoadmap] = useState<Record<string, RoadmapQuest[]>>({})
  const [activeQuest, setActiveQuest] = useState<RoadmapQuest | null>(null)
  const selectedJob = selectedJobId ? availableJobs.find((job) => job.id === selectedJobId) ?? null : null
  const openArchive = (characterId: string) => {
    setActiveCharacterId(characterId)
    setRoadmapTarget({ kind: 'existing', id: characterId })
    setStep('archive')
  }
  const openDraftArchive = () => {
    setRoadmapTarget({ kind: 'draft' })
    setStep('archive')
  }
  const openRoadmap = (characterId: string) => {
    setActiveCharacterId(characterId)
    setRoadmapTarget({ kind: 'existing', id: characterId })
    setStep('roadmap')
  }
  const openQuest = (quest: RoadmapQuest) => {
    setActiveQuest(quest)
    setStep('quest-detail')
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
          onOpenQuest={(character) => {
            setActiveCharacterId(character.id)
            setRoadmapTarget({ kind: 'existing', id: character.id })
            openQuest({
              id: `next-${character.id}`,
              level: character.level,
              category: '다음 퀘스트',
              status: 'open',
              title: character.nextQuest,
            })
          }}
        />
      </AppShell>
    )
  }

  if (step === 'archive') {
    const isDraftArchive = roadmapTarget.kind === 'draft'
    const activeCharacter = mythCharacters.find(({ id }) => id === activeCharacterId) ?? mythCharacters[0]
    const selectedJobForArchive = selectedJob ?? digitalMarketer
    const draftArchiveCharacter: ArchiveCharacter = {
      title: nickname,
      role: selectedJobForArchive.title,
      level: 1,
      progress: 5,
      competencies: assessmentToCompetencyScores(assessmentAnswers),
    }
    const draftArchiveSkillGroups: ArchiveSkillGroup[] = getRoadmapQuestGroups(customQuestsByRoadmap.draft ?? []).map(
      (group) => ({
        level: group.level,
        label: group.label,
        skills: group.quests.map(({ category, status, title }) => ({ category, status, title })),
      }),
    )
    const draftCompletedCount = draftArchiveSkillGroups.reduce(
      (count, group) => count + group.skills.filter((skill) => skill.status === 'complete').length,
      0,
    )

    return (
      <AppShell
        sidebar={
          isDraftArchive ? (
            <Sidebar
              draftCharacter={{ title: nickname, role: selectedJobForArchive.title, level: 1 }}
              onCreateCharacter={() => setStep('egg')}
              onHome={() => setStep('hub')}
              variant="draft"
            />
          ) : (
            <Sidebar
              activeCharacterId={activeCharacter.id}
              characters={mythCharacters}
              onCreateCharacter={() => setStep('egg')}
              onHome={() => setStep('hub')}
              onSelectCharacter={openRoadmap}
            />
          )
        }
        variant="archive"
      >
        <ArchivePage
          character={isDraftArchive ? draftArchiveCharacter : activeCharacter}
          completedCount={isDraftArchive ? draftCompletedCount : undefined}
          experiences={isDraftArchive ? [] : undefined}
          onOpenRoadmap={() => {
            if (isDraftArchive) {
              setStep('roadmap')
              return
            }
            openRoadmap(activeCharacter.id)
          }}
          skillGroups={isDraftArchive ? draftArchiveSkillGroups : undefined}
        />
      </AppShell>
    )
  }

  if (step === 'quest-detail') {
    const isDraftQuest = roadmapTarget.kind === 'draft'
    const selectedExistingCharacter =
      roadmapTarget.kind === 'existing'
        ? mythCharacters.find(({ id }) => id === roadmapTarget.id) ?? mythCharacters[0]
        : mythCharacters[0]
    const selectedJobForQuest = selectedJob ?? digitalMarketer
    const fallbackQuest = getRoadmapQuestGroups(customQuestsByRoadmap[isDraftQuest ? 'draft' : selectedExistingCharacter.id] ?? [])
      .flatMap((group) => group.quests)
      .find((quest) => quest.status !== 'locked')
    const quest = activeQuest ?? fallbackQuest ?? getRoadmapQuestGroups()[0].quests[0]

    return (
      <AppShell
        sidebar={
          isDraftQuest ? (
            <Sidebar
              draftCharacter={{ title: nickname, role: selectedJobForQuest.title, level: 1 }}
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
        variant="quest"
      >
        <QuestDetailPage onBack={() => setStep('roadmap')} quest={quest} />
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
          onOpenArchive={() => {
            if (isDraftRoadmap) {
              openDraftArchive()
              return
            }
            openArchive(selectedExistingCharacter.id)
          }}
          onOpenQuest={openQuest}
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
        projectExperiences={projectExperiences}
        onAddProjectExperience={() =>
          setProjectExperiences((currentExperiences) => [
            ...currentExperiences,
            createEmptyProjectExperience(),
          ])
        }
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
        onProjectExperienceChange={(experienceId, changes) =>
          setProjectExperiences((currentExperiences) =>
            currentExperiences.map((experience) =>
              experience.id === experienceId ? { ...experience, ...changes } : experience,
            ),
          )
        }
        onRemoveProjectExperience={(experienceId) =>
          setProjectExperiences((currentExperiences) =>
            currentExperiences.length > 1
              ? currentExperiences.filter((experience) => experience.id !== experienceId)
              : currentExperiences,
          )
        }
      />
    </AppShell>
  )
}

export default App
