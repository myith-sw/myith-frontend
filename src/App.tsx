import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  addQuest,
  createRoadmap,
  downloadRoadmapExport,
  getDashboard,
  getDiagnosis,
  getJobs,
  getQuest,
  getRoadmap,
  reorderQuest,
  subscribeRoadmapProgress,
  uploadProjectFile,
} from './api/endpoints'
import { prepareRoadmapEvidence } from './api/roadmapPayload'
import type {
  CharacterSummary,
  DashboardResponse,
  JobListResponse,
  QuestDetail,
  RoadmapDetail,
} from './api/types'
import { useApplication } from './app/useApplication'
import { GoogleLoginPage } from './auth/GoogleLoginPage'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { useAuth } from './auth/useAuth'
import { AppShell } from './components/AppShell'
import { ArchivePage } from './components/ArchivePage'
import { AsyncState } from './components/AsyncState'
import { CharacterNameStep } from './components/CharacterNameStep'
import { EggSelectionHome } from './components/EggSelectionHome'
import { ErrorPage } from './components/ErrorPage'
import { JobSelection } from './components/JobSelection'
import { MythHub } from './components/MythHub'
import { QuestDetailPage } from './components/QuestDetailPage'
import { RoadmapPage } from './components/RoadmapPage'
import { SelfAssessment } from './components/SelfAssessment'
import { Sidebar } from './components/Sidebar'
import {
  archiveLevelLabels,
  type ArchiveCharacter,
  type ArchiveExperienceEntry,
  type ArchiveSkillGroup,
  type CompetencyScores,
} from './data/archive'
import type { MythCharacter } from './data/home'
import {
  createEmptyProjectExperience,
  jobCategories as localJobCategories,
  type JobCategory,
  type JobOption,
} from './data/onboarding'
import type {
  RoadmapCharacter,
  RoadmapQuest,
  RoadmapQuestGroup,
  RoadmapQuestStatus,
} from './data/roadmap'

const emptyCompetencies: CompetencyScores = {
  programming: 0,
  computerScience: 0,
  database: 0,
  serverApi: 0,
  collaboration: 0,
  deployment: 0,
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function toMythCharacter(character: CharacterSummary): MythCharacter {
  return {
    id: character.roadmapId ?? character.characterId ?? crypto.randomUUID(),
    title: character.nickname ?? '이름 없는 캐릭터',
    role: character.jobName ?? '직무 미정',
    level: character.level ?? 1,
    stageLabel: character.stageLabel ?? '시작',
    description: character.tagline ?? '',
    progress: character.completionRate ?? 0,
    nextQuest: character.nextQuest?.title ?? '모든 퀘스트 완료',
    nextQuestId: character.nextQuest?.questId || undefined,
    characterId: character.species ?? 'teoreuteu',
    stage: character.stage ?? 1,
    competencies: emptyCompetencies,
  }
}

function toQuestStatus(status: string | undefined): RoadmapQuestStatus {
  if (status === 'DONE') return 'complete'
  if (status === 'ALREADY_KNOWN') return 'known'
  if (status === 'PENDING') return 'pending'
  if (status === 'LOCKED') return 'locked'
  return 'open'
}

function CharacterSidebar({
  activeRoadmapId,
  onHome,
}: {
  activeRoadmapId?: string
  onHome: () => void
}) {
  const navigate = useNavigate()
  const { characters, resetOnboarding } = useApplication()
  const { logout, user } = useAuth()
  const mapped = characters.map(toMythCharacter)
  const profileName = user?.nickname || user?.email?.split('@')[0] || 'MYiTH 사용자'
  return (
    <Sidebar
      activeCharacterId={activeRoadmapId}
      characters={mapped}
      onCreateCharacter={() => {
        resetOnboarding()
        navigate('/characters/new/egg')
      }}
      onHome={onHome}
      onLogout={() => {
        logout()
        resetOnboarding()
        navigate('/login', { replace: true })
      }}
      onSelectCharacter={(roadmapId) => navigate(`/roadmaps/${roadmapId}`)}
      profile={user ? { email: user.email, imageUrl: user.profileImageUrl, name: profileName } : undefined}
    />
  )
}

function ErrorRoute() {
  const navigate = useNavigate()

  return (
    <ErrorPage
      onHome={() => navigate('/')}
      onLogin={() => navigate('/login')}
    />
  )
}

function HomeRoute() {
  const navigate = useNavigate()
  const {
    characters,
    charactersError,
    charactersLoading,
    refreshCharacters,
    resetOnboarding,
  } = useApplication()
  const mapped = characters.map(toMythCharacter)

  return (
    <AppShell
      sidebar={<CharacterSidebar onHome={() => navigate('/')} />}
      variant="hub"
    >
      <AsyncState
        error={charactersError}
        loading={charactersLoading}
        onRetry={() => void refreshCharacters()}
      />
      {!charactersLoading && !charactersError && (
        <MythHub
          characters={mapped}
          onCreateCharacter={() => {
            resetOnboarding()
            navigate('/characters/new/egg')
          }}
          onOpenArchive={(roadmapId) => navigate(`/roadmaps/${roadmapId}/archive`)}
          onOpenQuest={(character) => {
            if (character.nextQuestId) navigate(`/quests/${character.nextQuestId}`)
          }}
          onOpenRoadmap={(roadmapId) => navigate(`/roadmaps/${roadmapId}`)}
        />
      )}
    </AppShell>
  )
}

function EggRoute() {
  const navigate = useNavigate()
  const { onboarding, setOnboarding } = useApplication()
  return (
    <AppShell
      sidebar={<CharacterSidebar onHome={() => navigate('/')} />}
      variant="home"
    >
      <EggSelectionHome
        onContinue={() => navigate('/characters/new/jobs')}
        onSelectEgg={(selectedEggId) => setOnboarding((current) => ({ ...current, selectedEggId }))}
        selectedEggId={onboarding.selectedEggId}
      />
    </AppShell>
  )
}

function mapJobCatalog(data: JobListResponse) {
  const iconByCode = new Map(localJobCategories.map((category) => [category.id, category.icon]))
  const fallbackIcon = localJobCategories.find((category) => category.id === 'other')?.icon ?? ''
  const categories: JobCategory[] = (data.categories ?? []).map((category) => ({
    id: category.categoryCode ?? '',
    label: category.categoryName ?? '',
    icon: iconByCode.get(category.categoryCode ?? '') ?? fallbackIcon,
  }))
  const jobs: JobOption[] = (data.categories ?? []).flatMap((category) =>
    (category.jobs ?? []).map((job) => ({
      id: job.jobCode ?? '',
      categoryId: category.categoryCode ?? '',
      title: job.jobName ?? '',
      description: job.tagline ?? '',
      skills: job.keywords ?? [],
      available: job.available !== false,
    })),
  )
  return { categories, jobs }
}

function JobRoute() {
  const navigate = useNavigate()
  const { onboarding, setOnboarding } = useApplication()
  const [catalog, setCatalog] = useState<{ categories: JobCategory[]; jobs: JobOption[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const next = mapJobCatalog(await getJobs())
      setCatalog(next)
      if (!next.categories.some((category) => category.id === onboarding.selectedCategoryId)) {
        setOnboarding((current) => ({
          ...current,
          selectedCategoryId: next.categories[0]?.id ?? '',
        }))
      }
    } catch (nextError) {
      setError(errorMessage(nextError, '직무 목록을 불러오지 못했습니다.'))
    } finally {
      setLoading(false)
    }
  }, [onboarding.selectedCategoryId, setOnboarding])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <AppShell sidebar={<CharacterSidebar onHome={() => navigate('/')} />} variant="selection">
      <AsyncState error={error} loading={loading} onRetry={() => void load()} />
      {catalog && !loading && !error && (
        <JobSelection
          categories={catalog.categories}
          jobs={catalog.jobs}
          onSelectCategory={(selectedCategoryId) =>
            setOnboarding((current) => ({
              ...current,
              selectedCategoryId,
              selectedJob: null,
              diagnosis: null,
            }))
          }
          onSelectJob={(selectedJob) => {
            if (selectedJob.available === false) return
            setOnboarding((current) => ({
              ...current,
              selectedCategoryId: selectedJob.categoryId,
              selectedJob,
              diagnosis: null,
            }))
            navigate('/characters/new/name')
          }}
          selectedCategoryId={onboarding.selectedCategoryId}
        />
      )}
    </AppShell>
  )
}

function NameRoute() {
  const navigate = useNavigate()
  const { onboarding, setOnboarding } = useApplication()
  if (!onboarding.selectedJob) return <Navigate replace to="/characters/new/jobs" />

  return (
    <AppShell sidebar={<CharacterSidebar onHome={() => navigate('/')} />} variant="selection">
      <CharacterNameStep
        job={onboarding.selectedJob}
        nickname={onboarding.nickname}
        onContinue={() => navigate('/characters/new/assessment')}
        onNicknameChange={(nickname) => setOnboarding((current) => ({ ...current, nickname }))}
      />
    </AppShell>
  )
}

function AssessmentRoute() {
  const navigate = useNavigate()
  const {
    characters,
    onboarding,
    refreshCharacters,
    setOnboarding,
  } = useApplication()
  const [loading, setLoading] = useState(!onboarding.diagnosis)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [progressMessage, setProgressMessage] = useState('')
  const selectedJob = onboarding.selectedJob

  useEffect(() => {
    if (!selectedJob) return
    if (onboarding.diagnosis?.jobCode === selectedJob.id) return
    let active = true
    setLoading(true)
    getDiagnosis(selectedJob.id)
      .then((diagnosis) => {
        if (!active) return
        const defaultLevel = diagnosis.levels?.[0]?.id ?? 'unknown'
        setOnboarding((current) => ({
          ...current,
          diagnosis,
          answers: Object.fromEntries(
            (diagnosis.questions ?? []).map((question) => [question.skillCode ?? '', defaultLevel]),
          ),
        }))
      })
      .catch((nextError) => {
        if (active) setError(errorMessage(nextError, '자가진단 문항을 불러오지 못했습니다.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [onboarding.diagnosis?.jobCode, selectedJob, setOnboarding])

  if (!selectedJob) return <Navigate replace to="/characters/new/jobs" />
  if (!onboarding.selectedEggId) return <Navigate replace to="/characters/new/egg" />
  const selectedEggId = onboarding.selectedEggId

  const diagnosis = onboarding.diagnosis
  const questions = (diagnosis?.questions ?? []).map((question) => ({
    id: question.skillCode ?? '',
    prompt: question.text ?? '',
    initialAnswer: diagnosis?.levels?.[0]?.id ?? 'unknown',
  }))
  const levels = (diagnosis?.levels ?? []).map((level) => ({
    id: level.id ?? '',
    label: level.label ?? '',
  }))

  const generate = async () => {
    if (!diagnosis?.profileVersion) return
    if (
      characters.some((character) => character.jobCode === selectedJob.id) &&
      !window.confirm('같은 직무의 기존 활성 로드맵이 아카이브됩니다. 새 로드맵을 생성할까요?')
    ) {
      return
    }

    setSubmitting(true)
    setError('')
    setProgressMessage('첨부 자료를 준비하고 있어요…')
    try {
      const evidence = prepareRoadmapEvidence(onboarding.projectExperiences)
      const fileKey = evidence.file
        ? await uploadProjectFile(evidence.file)
        : undefined
      const result = await createRoadmap(
        {
          jobCode: selectedJob.id,
          profileVersion: diagnosis.profileVersion,
          species: selectedEggId,
          nickname: onboarding.nickname.trim(),
          answers: (diagnosis.questions ?? []).map((question) => ({
            skillCode: question.skillCode ?? '',
            level: (onboarding.answers[question.skillCode ?? ''] ??
              diagnosis.levels?.[0]?.id ??
              'unknown') as 'unknown' | 'heard' | 'tried' | 'independent',
          })),
          narrative: evidence.narrative,
          repoUrl: evidence.repoUrl,
          fileKey,
        },
      )
      if (!result.roadmapId) throw new Error('생성된 로드맵 ID가 없습니다.')

      if (result.generationState === 'ANALYZING') {
        setProgressMessage('프로젝트 경험을 분석하고 있어요…')
        try {
          await subscribeRoadmapProgress(result.roadmapId, (event) => {
            if (event.type === 'progress') setProgressMessage(`${event.step} ${event.percent}%`)
            if (event.type === 'error') setError(event.message)
          })
        } catch {
          const recovered = await getRoadmap(result.roadmapId)
          if (recovered.generationState !== 'READY') throw new Error('분석 상태를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.')
        }
      }

      await refreshCharacters()
      const roadmapId = result.roadmapId
      navigate(`/roadmaps/${roadmapId}`, { replace: true })
    } catch (nextError) {
      setError(errorMessage(nextError, '로드맵 생성에 실패했습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell sidebar={<CharacterSidebar onHome={() => navigate('/')} />} variant="assessment">
      <AsyncState error={error && !diagnosis ? error : undefined} loading={loading} />
      {diagnosis && !loading && (
        <SelfAssessment
          answers={onboarding.answers}
          error={error}
          jobTitle={selectedJob.title}
          levels={levels}
          onAddProjectExperience={() =>
            setOnboarding((current) => ({
              ...current,
              projectExperiences: [...current.projectExperiences, createEmptyProjectExperience()],
            }))
          }
          onAnswerChange={(questionId, answer) =>
            setOnboarding((current) => ({
              ...current,
              answers: { ...current.answers, [questionId]: answer },
            }))
          }
          onGenerateRoadmap={() => void generate()}
          onProjectExperienceChange={(experienceId, changes) =>
            setOnboarding((current) => ({
              ...current,
              projectExperiences: current.projectExperiences.map((experience) =>
                experience.id === experienceId ? { ...experience, ...changes } : experience,
              ),
            }))
          }
          onRemoveProjectExperience={(experienceId) =>
            setOnboarding((current) => ({
              ...current,
              projectExperiences:
                current.projectExperiences.length > 1
                  ? current.projectExperiences.filter((experience) => experience.id !== experienceId)
                  : current.projectExperiences,
            }))
          }
          progressMessage={progressMessage}
          projectExperiences={onboarding.projectExperiences}
          questions={questions}
          submitting={submitting}
        />
      )}
    </AppShell>
  )
}

function useRoadmapDetail(roadmapId: string | undefined) {
  const [data, setData] = useState<RoadmapDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!roadmapId) return
    setLoading(true)
    setError('')
    try {
      setData(await getRoadmap(roadmapId))
    } catch (nextError) {
      setError(errorMessage(nextError, '로드맵을 불러오지 못했습니다.'))
    } finally {
      setLoading(false)
    }
  }, [roadmapId])

  useEffect(() => {
    void load()
  }, [load])
  return { data, error, load, loading }
}

function RoadmapRoute() {
  const navigate = useNavigate()
  const { roadmapId } = useParams()
  const { data, error, load, loading } = useRoadmapDetail(roadmapId)
  const [mutationError, setMutationError] = useState('')

  const questGroups = useMemo<RoadmapQuestGroup[]>(
    () =>
      (data?.levels ?? []).map((group) => ({
        level: group.level ?? 1,
        label: '',
        quests: (group.quests ?? []).map<RoadmapQuest>((quest) => ({
          id: quest.questId ?? '',
          level: quest.level ?? group.level ?? 1,
          axisCode: quest.axisCode,
          category: quest.axisName ?? '',
          title: quest.title ?? '',
          status: toQuestStatus(quest.status),
          version: quest.version ?? 0,
        })),
      })),
    [data],
  )
  const axes = useMemo(
    () =>
      Array.from(
        new Map(
          questGroups.flatMap((group) =>
            group.quests.map((quest) => [
              quest.axisCode ?? quest.category,
              { code: quest.axisCode ?? quest.category, name: quest.category },
            ]),
          ),
        ).values(),
      ),
    [questGroups],
  )

  if (!roadmapId) return <Navigate replace to="/" />

  const character: RoadmapCharacter | null = data
    ? {
        name: data.character?.nickname ?? '',
        job: data.jobName ?? '',
        description: data.tagline ?? '',
        characterId: data.character?.species ?? 'teoreuteu',
        level: Math.max(1, ...(data.levels ?? []).map((level) => level.level ?? 1)),
        stage: data.character?.stage ?? 1,
        stageLabel: data.character?.stageLabel ?? '시작',
        progress: data.character?.completionRate ?? 0,
      }
    : null

  return (
    <AppShell
      sidebar={<CharacterSidebar activeRoadmapId={roadmapId} onHome={() => navigate('/')} />}
      variant="roadmap"
    >
      <AsyncState error={error} loading={loading} onRetry={() => void load()} />
      {mutationError && <p className="mb-4 text-sm font-medium text-[#d65454]" role="alert">{mutationError}</p>}
      {data && character && !loading && (
        <RoadmapPage
          axes={axes}
          character={character}
          levels={questGroups.map((group) => group.level)}
          onAddQuest={(input) => {
            setMutationError('')
            void addQuest(roadmapId, input)
              .then(() => load())
              .catch((nextError) => setMutationError(errorMessage(nextError, '퀘스트 추가에 실패했습니다.')))
          }}
          onMoveQuest={(quest, targetIndex) => {
            setMutationError('')
            void reorderQuest(roadmapId, {
              questId: quest.id,
              targetLevel: quest.level,
              targetIndex,
              version: quest.version ?? 0,
            })
              .then(() => load())
              .catch((nextError) => {
                const message = errorMessage(nextError, '퀘스트 순서를 변경하지 못했습니다.')
                setMutationError(
                  message.includes('최신 상태')
                    ? `${message} 최신 로드맵을 불러왔으니 다시 시도해주세요.`
                    : message,
                )
                void load()
              })
          }}
          onOpenArchive={() => navigate(`/roadmaps/${roadmapId}/archive`)}
          onOpenQuest={(quest) => navigate(`/quests/${quest.id}`)}
          questGroups={questGroups}
        />
      )}
    </AppShell>
  )
}

function QuestRoute() {
  const navigate = useNavigate()
  const { questId } = useParams()
  const [quest, setQuest] = useState<QuestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!questId) return
    setLoading(true)
    setError('')
    try {
      setQuest(await getQuest(questId))
    } catch (nextError) {
      setError(errorMessage(nextError, '퀘스트를 불러오지 못했습니다.'))
    } finally {
      setLoading(false)
    }
  }, [questId])

  useEffect(() => {
    void load()
  }, [load])
  if (!questId) return <Navigate replace to="/" />

  return (
    <AppShell
      sidebar={<CharacterSidebar activeRoadmapId={quest?.roadmapId} onHome={() => navigate('/')} />}
      variant="quest"
    >
      <AsyncState error={error} loading={loading} onRetry={() => void load()} />
      {quest && !loading && (
        <QuestDetailPage
          onBack={() => navigate(`/roadmaps/${quest.roadmapId}`)}
          onUpdated={() => void load()}
          quest={quest}
        />
      )}
    </AppShell>
  )
}

function ArchiveRoute() {
  const navigate = useNavigate()
  const { roadmapId } = useParams()
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!roadmapId) return
    setLoading(true)
    setError('')
    try {
      setData(await getDashboard(roadmapId))
    } catch (nextError) {
      setError(errorMessage(nextError, '아카이브를 불러오지 못했습니다.'))
    } finally {
      setLoading(false)
    }
  }, [roadmapId])

  useEffect(() => {
    void load()
  }, [load])
  if (!roadmapId) return <Navigate replace to="/" />

  const character: ArchiveCharacter | null = data
    ? {
        title: data.character?.nickname ?? '',
        role: data.character?.jobName ?? '',
        level: data.character?.level ?? 1,
        progress: data.character?.completionRate ?? 0,
        competencies: emptyCompetencies,
      }
    : null
  const skillGroups: ArchiveSkillGroup[] = (data?.skillTree ?? []).map((group) => ({
    level: group.level ?? 1,
    label: archiveLevelLabels[group.level ?? 1] ?? '',
    skills: (group.quests ?? []).map((quest) => ({
      category: quest.axisName ?? '',
      status: toQuestStatus(quest.status),
      title: quest.title ?? '',
    })),
  }))
  const experienceLevelByQuestId = new Map<string, number>()
  for (const group of data?.skillTree ?? []) {
    if (group.level === undefined) continue
    for (const quest of group.quests ?? []) {
      if (quest.questId) {
        experienceLevelByQuestId.set(quest.questId, group.level)
      }
    }
  }
  const experiences: ArchiveExperienceEntry[] = (data?.experienceCards ?? []).map((entry) => {
    const level = entry.questId ? experienceLevelByQuestId.get(entry.questId) : undefined

    return {
      category: entry.axisName ?? '',
      level,
      levelLabel: level === undefined ? undefined : archiveLevelLabels[level],
      title: entry.title ?? '',
      entries: [
        ['S', entry.star?.situation ?? ''],
        ['T', entry.star?.task ?? ''],
        ['A', entry.star?.action ?? ''],
        ['R', entry.star?.result ?? ''],
      ],
    }
  })
  const radar = (data?.radar ?? []).map((axis) => ({
    key: axis.axisCode ?? axis.axisName ?? crypto.randomUUID(),
    label: axis.axisName ?? '',
    value: axis.percent ?? 0,
  }))

  return (
    <AppShell
      sidebar={<CharacterSidebar activeRoadmapId={roadmapId} onHome={() => navigate('/')} />}
      variant="archive"
    >
      <AsyncState error={error} loading={loading} onRetry={() => void load()} />
      {character && data && !loading && (
        <ArchivePage
          character={character}
          completedCount={data.character?.completedQuestCount}
          experiences={experiences}
          onExport={(format) => {
            setError('')
            void downloadRoadmapExport(roadmapId, format).catch((nextError) =>
              setError(errorMessage(nextError, '내보내기에 실패했습니다.')),
            )
          }}
          onOpenRoadmap={() => navigate(`/roadmaps/${roadmapId}`)}
          radar={radar}
          skillGroups={skillGroups}
        />
      )}
    </AppShell>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<GoogleLoginPage />} path="/login" />
      <Route element={<ErrorRoute />} path="/error" />
      <Route element={<ProtectedRoute />}>
        <Route element={<HomeRoute />} path="/" />
        <Route element={<EggRoute />} path="/characters/new/egg" />
        <Route element={<JobRoute />} path="/characters/new/jobs" />
        <Route element={<NameRoute />} path="/characters/new/name" />
        <Route element={<AssessmentRoute />} path="/characters/new/assessment" />
        <Route element={<RoadmapRoute />} path="/roadmaps/:roadmapId" />
        <Route element={<ArchiveRoute />} path="/roadmaps/:roadmapId/archive" />
        <Route element={<QuestRoute />} path="/quests/:questId" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
