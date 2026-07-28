import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useBlocker,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  addQuest,
  createRoadmap,
  deleteCharacter,
  downloadRoadmapExport,
  getDashboard,
  getDiagnosis,
  getJobAxes,
  getJobs,
  getQuest,
  getRoadmap,
  subscribeRoadmapProgress,
  uploadProjectFile,
} from './api/endpoints'
import { mapJobCatalog } from './api/jobCatalog'
import { prepareRoadmapEvidence } from './api/roadmapPayload'
import type {
  CharacterSummary,
  DashboardResponse,
  JobAxis,
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
import { EggSelectionHome } from './components/EggSelectionHome'
import { ErrorPage } from './components/ErrorPage'
import { JobSelection } from './components/JobSelection'
import { MythHub } from './components/MythHub'
import { QuestDetailPage } from './components/QuestDetailPage'
import { RoadmapPage } from './components/RoadmapPage'
import { RoadmapGenerationLoadingModal } from './components/RoadmapGenerationLoadingModal'
import { SelfAssessment } from './components/SelfAssessment'
import { Sidebar } from './components/Sidebar'
import {
  resolveArchiveExperienceAxes,
  type ArchiveCharacter,
  type ArchiveExperienceAxis,
  type ArchiveExperienceEntry,
  type ArchiveSkillStatus,
  type ArchiveSkillGroup,
  type CompetencyScores,
} from './data/archive'
import {
  createEggOptions,
  type MythCharacter,
} from './data/home'
import {
  createEmptyProjectExperience,
  type JobCategory,
  type JobOption,
} from './data/onboarding'
import {
  toRoadmapQuestStatus,
  type RoadmapCharacter,
  type RoadmapQuest,
  type RoadmapQuestGroup,
} from './data/roadmap'
import {
  questDetailPath,
  resolveQuestRoadmapId,
} from './routing/questRoutes'
import { unsavedChangesMessage } from './routing/unsavedChanges'

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
    resourceId: character.characterId,
    title: character.nickname ?? '이름 없는 캐릭터',
    role: character.jobName ?? '직무 미정',
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

function toArchiveSkillStatus(status: string | undefined): ArchiveSkillStatus {
  if (status === 'DONE') return 'complete'
  if (status === 'LOCKED') return 'locked'
  return 'incomplete'
}

function CharacterSidebar({
  activeRoadmapId,
  isHomeActive = false,
  onBeforeNavigate = () => true,
  onHome,
}: {
  activeRoadmapId?: string
  isHomeActive?: boolean
  onBeforeNavigate?: () => boolean
  onHome: () => void
}) {
  const navigate = useNavigate()
  const { characters, resetOnboarding } = useApplication()
  const { logout, user } = useAuth()
  const mapped = characters.map(toMythCharacter)
  const profileName = user?.nickname || user?.email?.split('@')[0] || 'MYiTH 사용자'
  const navigateIfAllowed = (action: () => void) => {
    if (onBeforeNavigate()) {
      action()
    }
  }

  return (
    <Sidebar
      activeCharacterId={activeRoadmapId}
      characters={mapped}
      isHomeActive={isHomeActive}
      onCreateCharacter={() => {
        navigateIfAllowed(() => {
          resetOnboarding()
          navigate('/characters/new/egg')
        })
      }}
      onHome={() => navigateIfAllowed(onHome)}
      onLogout={() => {
        navigateIfAllowed(() => {
          logout()
          resetOnboarding()
          navigate('/login', { replace: true })
        })
      }}
      onSelectCharacter={(roadmapId) =>
        navigateIfAllowed(() => navigate(`/roadmaps/${roadmapId}`))
      }
      profile={user ? { email: user.email, imageUrl: user.profileImageUrl, name: profileName } : undefined}
    />
  )
}

function ErrorRoute() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const goHome = () => navigate(user ? '/' : '/login')

  return (
    <ErrorPage
      onHome={goHome}
      sidebar={
        user ? (
          <CharacterSidebar onHome={goHome} />
        ) : (
          <Sidebar
            onHome={goHome}
            onLogin={() => navigate('/login')}
            variant="unauthenticated"
          />
        )
      }
    />
  )
}

function HomeRoute() {
  const navigate = useNavigate()
  const [deleteError, setDeleteError] = useState('')
  const [deletingCharacterId, setDeletingCharacterId] = useState<string>()
  const {
    characters,
    charactersError,
    charactersLoaded,
    charactersLoading,
    refreshCharacters,
    resetOnboarding,
  } = useApplication()
  const mapped = characters.map(toMythCharacter)
  const isResolvingCharacters = !charactersLoaded || charactersLoading

  if (
    charactersLoaded &&
    !charactersLoading &&
    !charactersError &&
    characters.length === 0
  ) {
    return <Navigate replace to="/characters/new/egg" />
  }

  return (
    <AppShell
      sidebar={<CharacterSidebar isHomeActive onHome={() => navigate('/')} />}
      variant="hub"
    >
      <AsyncState
        error={charactersError}
        loading={isResolvingCharacters}
        onRetry={() => void refreshCharacters()}
      />
      {charactersLoaded && !charactersLoading && !charactersError && (
        <MythHub
          characters={mapped}
          deletingCharacterId={deletingCharacterId}
          deleteError={deleteError}
          onCreateCharacter={() => {
            resetOnboarding()
            navigate('/characters/new/egg')
          }}
          onDeleteCharacter={(character) => {
            if (!character.resourceId || deletingCharacterId) return
            if (
              !window.confirm(
                `${character.title} 캐릭터를 삭제할까요?\n삭제한 캐릭터와 로드맵은 복구할 수 없습니다.`,
              )
            ) {
              return
            }

            setDeleteError('')
            setDeletingCharacterId(character.resourceId)
            void deleteCharacter(character.resourceId)
              .then(refreshCharacters)
              .catch((error) => {
                setDeleteError(
                  errorMessage(error, '캐릭터를 삭제하지 못했습니다.'),
                )
              })
              .finally(() => setDeletingCharacterId(undefined))
          }}
          onOpenArchive={(roadmapId) => navigate(`/roadmaps/${roadmapId}/archive`)}
          onOpenQuest={(character) => {
            if (character.nextQuestId) {
              navigate(questDetailPath(character.id, character.nextQuestId))
            }
          }}
          onOpenRoadmap={(roadmapId) => navigate(`/roadmaps/${roadmapId}`)}
        />
      )}
    </AppShell>
  )
}

function EggRoute() {
  const navigate = useNavigate()
  const { characters, onboarding, setOnboarding } = useApplication()
  const selectedEggIdRef = useRef(onboarding.selectedEggId)
  selectedEggIdRef.current = onboarding.selectedEggId
  const ownedSpeciesKey = characters
    .map((character) => character.species)
    .filter((species): species is string => Boolean(species))
    .sort()
    .join(',')
  const availableEggOptions = useMemo(
    () => createEggOptions(
      ownedSpeciesKey ? ownedSpeciesKey.split(',') : [],
      3,
      selectedEggIdRef.current,
    ),
    [ownedSpeciesKey],
  )

  return (
    <AppShell
      sidebar={<CharacterSidebar onHome={() => navigate('/')} />}
      variant="home"
    >
      <EggSelectionHome
        eggOptions={availableEggOptions}
        onContinue={() => navigate('/characters/new/jobs')}
        onSelectEgg={(selectedEggId) => setOnboarding((current) => ({ ...current, selectedEggId }))}
        selectedEggId={onboarding.selectedEggId}
      />
    </AppShell>
  )
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
      setOnboarding((current) => (
        next.categories.some((category) => category.id === current.selectedCategoryId)
          ? current
          : { ...current, selectedCategoryId: next.categories[0]?.id ?? '' }
      ))
    } catch (nextError) {
      setError(errorMessage(nextError, '직무 목록을 불러오지 못했습니다.'))
    } finally {
      setLoading(false)
    }
  }, [setOnboarding])

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
          nickname={onboarding.nickname}
          onContinue={() => navigate('/characters/new/assessment')}
          onNicknameChange={(nickname) =>
            setOnboarding((current) => ({ ...current, nickname }))
          }
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
          }}
          selectedCategoryId={onboarding.selectedCategoryId}
          selectedJob={onboarding.selectedJob}
        />
      )}
    </AppShell>
  )
}

function NameRoute() {
  return <Navigate replace to="/characters/new/jobs" />
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
    if (characters.some((character) => character.jobCode === selectedJob.id)) {
      window.alert('이미 존재하는 직무입니다.')
      return
    }

    setSubmitting(true)
    setError('')
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
        let generationError: Error | undefined
        try {
          await subscribeRoadmapProgress(result.roadmapId, (event) => {
            if (event.type === 'error') {
              generationError = new Error(event.message)
              throw generationError
            }
          })
        } catch {
          if (generationError) throw generationError
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
          projectExperiences={onboarding.projectExperiences}
          questions={questions}
          submitting={submitting}
        />
      )}
      <RoadmapGenerationLoadingModal open={submitting} />
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
  const { refreshCharacters } = useApplication()
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
          status: toRoadmapQuestStatus(quest.status),
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
              .then(() => Promise.all([load(), refreshCharacters()]))
              .catch((nextError) => setMutationError(errorMessage(nextError, '퀘스트 추가에 실패했습니다.')))
          }}
          onOpenArchive={() => navigate(`/roadmaps/${roadmapId}/archive`)}
          onOpenQuest={(quest) => navigate(questDetailPath(roadmapId, quest.id))}
          questGroups={questGroups}
        />
      )}
    </AppShell>
  )
}

function QuestRoute() {
  const navigate = useNavigate()
  const { questId, roadmapId: routeRoadmapId } = useParams()
  const { refreshCharacters } = useApplication()
  const [quest, setQuest] = useState<QuestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
      [hasUnsavedChanges],
    ),
  )

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

  useEffect(() => {
    if (!hasUnsavedChanges) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = unsavedChangesMessage
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  useEffect(() => {
    if (blocker.state !== 'blocked') return

    if (window.confirm(unsavedChangesMessage)) {
      blocker.proceed()
    } else {
      blocker.reset()
    }
  }, [blocker])

  const activeRoadmapId = resolveQuestRoadmapId(routeRoadmapId, quest?.roadmapId)

  useEffect(() => {
    if (!quest || !questId) return

    const responseRoadmapId = resolveQuestRoadmapId(undefined, quest.roadmapId)
    if (!responseRoadmapId) {
      if (!routeRoadmapId) {
        setError('퀘스트 응답에서 로드맵 정보를 확인할 수 없습니다.')
      }
      return
    }

    if (responseRoadmapId !== routeRoadmapId) {
      navigate(questDetailPath(responseRoadmapId, questId), { replace: true })
    }
  }, [navigate, quest, questId, routeRoadmapId])

  if (!questId) return <Navigate replace to="/" />

  return (
    <AppShell
      sidebar={
        <CharacterSidebar
          activeRoadmapId={activeRoadmapId}
          onHome={() => navigate('/')}
        />
      }
      variant="quest"
    >
      <AsyncState error={error} loading={loading} onRetry={() => void load()} />
      {quest && activeRoadmapId && !loading && !error && (
        <QuestDetailPage
          onBack={() => {
            navigate(`/roadmaps/${activeRoadmapId}`)
          }}
          onDirtyChange={setHasUnsavedChanges}
          onUpdated={() => {
            void Promise.all([load(), refreshCharacters()])
          }}
          quest={quest}
        />
      )}
    </AppShell>
  )
}

function ArchiveRoute() {
  const navigate = useNavigate()
  const { roadmapId } = useParams()
  const { characters } = useApplication()
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [jobAxes, setJobAxes] = useState<JobAxis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const activeCharacter = characters.find((character) => character.roadmapId === roadmapId)
  const jobCode = activeCharacter?.jobCode

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

  useEffect(() => {
    let cancelled = false

    setJobAxes([])
    if (!jobCode) return

    void getJobAxes(jobCode)
      .then((response) => {
        if (!cancelled) {
          setJobAxes(response.axes)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setJobAxes([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [jobCode])

  if (!roadmapId) return <Navigate replace to="/" />

  const character: ArchiveCharacter | null = data
    ? {
        title: data.character?.nickname ?? '',
        role: data.character?.jobName ?? '',
        stage: data.character?.stage ?? 1,
        progress: data.character?.completionRate ?? 0,
        competencies: emptyCompetencies,
      }
    : null
  const skillGroups: ArchiveSkillGroup[] = (data?.skillTree ?? []).map((group) => ({
    level: group.level ?? 1,
    skills: (group.quests ?? []).map((quest) => ({
      questId: quest.questId,
      category: quest.axisName ?? '',
      status: toArchiveSkillStatus(quest.status),
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
      questId: entry.questId,
      axisCode: entry.axisCode,
      category: entry.axisName ?? '',
      level,
      title: entry.title ?? '',
      entries: [
        ['S', entry.star?.situation ?? ''],
        ['T', entry.star?.task ?? ''],
        ['A', entry.star?.action ?? ''],
        ['R', entry.star?.result ?? ''],
      ],
    }
  })
  const apiExperienceAxes: ArchiveExperienceAxis[] = jobAxes.map((axis) => ({
    code: axis.axisCode,
    label: axis.axisName,
  }))
  const dashboardRadarAxes: ArchiveExperienceAxis[] = (data?.radar ?? [])
    .filter((axis) => axis.axisCode && axis.axisName)
    .map((axis) => ({
      code: axis.axisCode!,
      label: axis.axisName!,
    }))
  const experienceAxes = resolveArchiveExperienceAxes(
    apiExperienceAxes,
    dashboardRadarAxes,
    experiences,
  )
  const radarScoreByCode = new Map(
    (data?.radar ?? [])
      .filter((axis) => axis.axisCode)
      .map((axis) => [axis.axisCode!, axis.percent ?? 0] as const),
  )
  const radarAxisOrder =
    apiExperienceAxes.length > 0
      ? apiExperienceAxes
      : dashboardRadarAxes.length > 0
        ? dashboardRadarAxes
        : experienceAxes
  const radar = radarAxisOrder.map((axis) => ({
    key: axis.code,
    label: axis.label,
    value: radarScoreByCode.get(axis.code) ?? 0,
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
          experienceAxes={experienceAxes}
          experiences={experiences}
          onExport={(format) => {
            setError('')
            void downloadRoadmapExport(roadmapId, format).catch((nextError) =>
              setError(errorMessage(nextError, '내보내기에 실패했습니다.')),
            )
          }}
          onOpenRoadmap={() => navigate(`/roadmaps/${roadmapId}`)}
          onOpenQuest={(questId) => navigate(questDetailPath(roadmapId, questId))}
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
        <Route element={<QuestRoute />} path="/roadmaps/:roadmapId/quests/:questId" />
        <Route element={<QuestRoute />} path="/quests/:questId" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
