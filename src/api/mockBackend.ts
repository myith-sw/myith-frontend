import { experienceEntries } from '../data/archive'
import { mythCharacters } from '../data/home'
import {
  assessmentLevels,
  assessmentQuestions,
  availableJobs,
  jobCategories,
} from '../data/onboarding'
import { initialRoadmapQuestGroups } from '../data/roadmap'
import type { StarInput } from './types'

interface MockQuest {
  questId: string
  roadmapId: string
  level: number
  axisCode: string
  axisName: string
  title: string
  status: 'LOCKED' | 'OPEN' | 'PENDING' | 'DONE' | 'ALREADY_KNOWN'
  source: 'SKILL' | 'ACTIVITY' | 'CUSTOM'
  order: number
  version: number
  star: StarInput | null
}

interface MockRoadmap {
  roadmapId: string
  generationState: 'READY' | 'ANALYZING'
  jobCode: string
  jobName: string
  tagline: string
  character: {
    characterId: string
    species: string
    nickname: string
    stage: number
    stageLabel: string
    completionRate: number
  }
  quests: MockQuest[]
}

const jsonHeaders = { 'Content-Type': 'application/json' }
const levelIds = ['unknown', 'heard', 'tried', 'independent'] as const
const stars = new Map<string, StarInput>()
const aiRequests = new Map<string, { questId: string; star: StarInput; createdAt: number }>()

function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...jsonHeaders, ...headers },
  })
}

function apiError(code: string, message: string, status: number, fieldErrors?: Record<string, string>) {
  return json({ error: { code, message, fieldErrors, requestId: `mock-${crypto.randomUUID()}` } }, status)
}

function axisCode(axisName: string) {
  return axisName
    .toLowerCase()
    .replace(/[·\s]/g, '-')
    .replace(/[^a-z0-9가-힣-]/g, '')
}

function makeQuests(roadmapId: string) {
  return initialRoadmapQuestGroups.flatMap((group) =>
    group.quests.map<MockQuest>((quest, index) => ({
      questId: `${roadmapId}-${quest.id}`,
      roadmapId,
      level: group.level,
      axisCode: axisCode(quest.category),
      axisName: quest.category,
      title: quest.title,
      status:
        quest.status === 'complete'
          ? 'DONE'
          : quest.status === 'incomplete'
            ? 'PENDING'
            : quest.status === 'locked'
              ? 'LOCKED'
              : 'OPEN',
      source: 'SKILL',
      order: index + 1,
      version: 0,
      star: null,
    })),
  )
}

const roadmaps = new Map<string, MockRoadmap>()
const characters = mythCharacters.map((character, index) => {
  const roadmapId = `mock-roadmap-${index + 1}`
  const roadmap: MockRoadmap = {
    roadmapId,
    generationState: 'READY',
    jobCode: character.id,
    jobName: character.role,
    tagline: character.description,
    character: {
      characterId: `mock-character-${index + 1}`,
      species: character.characterId,
      nickname: character.title,
      stage: character.stage,
      stageLabel: character.stageLabel,
      completionRate: character.progress,
    },
    quests: makeQuests(roadmapId),
  }
  roadmaps.set(roadmapId, roadmap)
  return {
    characterId: roadmap.character.characterId,
    roadmapId,
    species: roadmap.character.species,
    nickname: roadmap.character.nickname,
    jobCode: roadmap.jobCode,
    jobName: roadmap.jobName,
    tagline: roadmap.tagline,
    roadmapStatus: 'ACTIVE',
    completionRate: roadmap.character.completionRate,
    stage: roadmap.character.stage,
    stageLabel: roadmap.character.stageLabel,
    level: character.stage,
    nextQuest: {
      questId: roadmap.quests.find((quest) => quest.status !== 'DONE')?.questId ?? '',
      title: character.nextQuest,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
})

function findQuest(questId: string) {
  for (const roadmap of roadmaps.values()) {
    const quest = roadmap.quests.find((candidate) => candidate.questId === questId)
    if (quest) return { roadmap, quest }
  }
  return null
}

function roadmapResponse(roadmap: MockRoadmap) {
  const levels = Array.from(new Set(roadmap.quests.map((quest) => quest.level)))
    .sort((a, b) => a - b)
    .map((level) => ({
      level,
      quests: roadmap.quests
        .filter((quest) => quest.level === level)
        .sort((a, b) => a.order - b.order),
    }))

  return {
    roadmapId: roadmap.roadmapId,
    generationState: roadmap.generationState,
    roadmapStatus: 'ACTIVE',
    jobCode: roadmap.jobCode,
    jobName: roadmap.jobName,
    tagline: roadmap.tagline,
    character: roadmap.character,
    levels,
    updatedAt: new Date().toISOString(),
  }
}

function dashboardResponse(roadmap: MockRoadmap) {
  const levels = Array.from(new Set(roadmap.quests.map((quest) => quest.level))).sort((a, b) => a - b)
  const axes = Array.from(
    new Map(
      roadmap.quests.map((quest) => [
        quest.axisCode,
        { axisCode: quest.axisCode, axisName: quest.axisName },
      ]),
    ).values(),
  )
  const completed = roadmap.quests.filter((quest) => ['DONE', 'ALREADY_KNOWN'].includes(quest.status))

  return {
    character: {
      nickname: roadmap.character.nickname,
      jobName: roadmap.jobName,
      species: roadmap.character.species,
      stage: roadmap.character.stage,
      stageLabel: roadmap.character.stageLabel,
      completionRate: roadmap.character.completionRate,
      completedQuestCount: completed.length,
      level: Math.max(1, ...completed.map((quest) => quest.level)),
    },
    radar: axes.map((axis) => {
      const quests = roadmap.quests.filter((quest) => quest.axisCode === axis.axisCode)
      const done = quests.filter((quest) => ['DONE', 'ALREADY_KNOWN'].includes(quest.status))
      return { ...axis, percent: Math.round((done.length / Math.max(quests.length, 1)) * 100) }
    }),
    skillTree: levels.map((level) => ({
      level,
      quests: roadmap.quests.filter((quest) => quest.level === level),
    })),
    experienceCards: roadmap.quests
      .filter((quest) => stars.has(quest.questId))
      .map((quest) => ({
        experienceId: `experience-${quest.questId}`,
        questId: quest.questId,
        title: quest.title,
        axisCode: quest.axisCode,
        axisName: quest.axisName,
        ncsUnitName: null,
        star: stars.get(quest.questId),
        createdAt: new Date().toISOString(),
      })),
    updatedAt: new Date().toISOString(),
  }
}

export async function mockFetch(input: string, init: RequestInit = {}) {
  const url = new URL(input, window.location.origin)
  const path = url.pathname
  const method = (init.method ?? 'GET').toUpperCase()
  const body = typeof init.body === 'string' ? JSON.parse(init.body) : undefined

  if (path === '/api/auth/google' && method === 'POST') {
    return json({ data: { accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', isNewUser: false } })
  }
  if (path === '/api/auth/refresh' && method === 'POST') {
    if (body?.refreshToken !== 'mock-refresh-token') return apiError('INVALID_REFRESH_TOKEN', '다시 로그인해주세요.', 401)
    return json({ data: { accessToken: 'mock-access-token' } })
  }
  if (path === '/api/users/me' && method === 'GET') {
    return json({
      data: {
        id: 'mock-user',
        email: 'demo@myith.local',
        nickname: 'MYiTH 데모',
        profileImageUrl: null,
        createdAt: new Date().toISOString(),
      },
    })
  }
  if (path === '/api/jobs' && method === 'GET') {
    return json({
      data: {
        categories: jobCategories.map((category, sortOrder) => ({
          categoryCode: category.id,
          categoryName: category.label,
          sortOrder,
          jobs: availableJobs
            .filter((job) => job.categoryId === category.id)
            .map((job) => ({
              jobCode: job.id,
              jobName: job.title,
              tagline: job.description,
              keywords: job.skills,
              available: true,
            })),
        })),
      },
    })
  }

  const diagnosisMatch = path.match(/^\/api\/jobs\/([^/]+)\/diagnosis$/)
  if (diagnosisMatch && method === 'GET') {
    return json({
      data: {
        jobCode: diagnosisMatch[1],
        profileVersion: 1,
        questions: assessmentQuestions.map((question, sortOrder) => ({
          skillCode: question.id,
          text: question.prompt,
          axisCode: axisCode(question.prompt),
          axisName: '대표 역량',
          sortOrder,
        })),
        levels: assessmentLevels.map((label, index) => ({
          id: levelIds[index],
          label,
          mastery: index / 3,
        })),
      },
    })
  }

  const axesMatch = path.match(/^\/api\/jobs\/([^/]+)\/axes$/)
  if (axesMatch && method === 'GET') {
    const axes = Array.from(
      new Map(
        initialRoadmapQuestGroups.flatMap((group) =>
          group.quests.map((quest) => [
            axisCode(quest.category),
            { axisCode: axisCode(quest.category), axisName: quest.category },
          ] as const),
        ),
      ).values(),
    )
    return json({ data: { jobCode: decodeURIComponent(axesMatch[1]), axes } })
  }

  if (path === '/api/uploads/presign' && method === 'POST') {
    if (body?.contentType !== 'application/pdf') return apiError('UNSUPPORTED_FILE_TYPE', 'PDF만 업로드할 수 있습니다.', 400)
    return json({
      data: {
        uploadUrl: `mock://upload/${crypto.randomUUID()}`,
        fileKey: `portfolio/mock/${crypto.randomUUID()}-${body.fileName}`,
        expiresIn: 900,
      },
    })
  }

  if (path === '/api/characters' && method === 'GET') {
    return json({ data: characters })
  }

  const characterMatch = path.match(/^\/api\/characters\/([^/]+)$/)
  if (characterMatch && method === 'DELETE') {
    const characterId = decodeURIComponent(characterMatch[1])
    const characterIndex = characters.findIndex(
      (character) => character.characterId === characterId,
    )
    if (characterIndex < 0) {
      return apiError('CHARACTER_NOT_FOUND', '캐릭터를 찾을 수 없습니다.', 404)
    }

    const [deletedCharacter] = characters.splice(characterIndex, 1)
    roadmaps.delete(deletedCharacter.roadmapId)
    return new Response(null, { status: 204 })
  }

  if (path === '/api/roadmaps' && method === 'POST') {
    const job = availableJobs.find((candidate) => candidate.id === body?.jobCode)
    if (!job) return apiError('VALIDATION_ERROR', '직무를 확인해주세요.', 422, { jobCode: '존재하지 않는 직무입니다.' })
    const roadmapId = `mock-roadmap-${crypto.randomUUID()}`
    const characterId = `mock-character-${crypto.randomUUID()}`
    const hasEvidence = Boolean(
      body.narrative?.experience ||
        body.narrative?.strength ||
        body.narrative?.difficulty ||
        body.repoUrl ||
        body.fileKey,
    )
    const roadmap: MockRoadmap = {
      roadmapId,
      generationState: hasEvidence ? 'ANALYZING' : 'READY',
      jobCode: job.id,
      jobName: job.title,
      tagline: job.description,
      character: {
        characterId,
        species: body.species,
        nickname: body.nickname,
        stage: 1,
        stageLabel: '시작',
        completionRate: 0,
      },
      quests: makeQuests(roadmapId),
    }
    roadmaps.set(roadmapId, roadmap)
    characters.push({
      characterId,
      roadmapId,
      species: body.species,
      nickname: body.nickname,
      jobCode: job.id,
      jobName: job.title,
      tagline: job.description,
      roadmapStatus: 'ACTIVE',
      completionRate: 0,
      stage: 1,
      stageLabel: '시작',
      level: 1,
      nextQuest: { questId: roadmap.quests[0].questId, title: roadmap.quests[0].title },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    return json(
      { data: { roadmapId, generationState: roadmap.generationState } },
      hasEvidence ? 202 : 200,
    )
  }

  const progressMatch = path.match(/^\/api\/roadmaps\/([^/]+)\/progress$/)
  if (progressMatch && method === 'GET') {
    const roadmap = roadmaps.get(progressMatch[1])
    if (!roadmap) return apiError('NOT_FOUND', '로드맵을 찾을 수 없습니다.', 404)
    roadmap.generationState = 'READY'
    const stream = [
      'event: progress\ndata: {"step":"프로젝트 경험 분석","percent":35}\n\n',
      'event: progress\ndata: {"step":"로드맵 구성","percent":80}\n\n',
      `event: done\ndata: {"roadmapId":"${roadmap.roadmapId}"}\n\n`,
    ].join('')
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
  }

  const roadmapMatch = path.match(/^\/api\/roadmaps\/([^/]+)$/)
  if (roadmapMatch && method === 'GET') {
    const roadmap = roadmaps.get(roadmapMatch[1])
    return roadmap ? json({ data: roadmapResponse(roadmap) }) : apiError('NOT_FOUND', '로드맵을 찾을 수 없습니다.', 404)
  }

  const addQuestMatch = path.match(/^\/api\/roadmaps\/([^/]+)\/quests$/)
  if (addQuestMatch && method === 'POST') {
    const roadmap = roadmaps.get(addQuestMatch[1])
    if (!roadmap) return apiError('NOT_FOUND', '로드맵을 찾을 수 없습니다.', 404)
    const quest: MockQuest = {
      questId: `mock-quest-${crypto.randomUUID()}`,
      roadmapId: roadmap.roadmapId,
      level: Number(body.level),
      axisCode: body.axisCode,
      axisName: body.axisCode,
      title: body.title,
      status: 'OPEN',
      source: 'CUSTOM',
      order: roadmap.quests.filter((candidate) => candidate.level === Number(body.level)).length + 1,
      version: 0,
      star: null,
    }
    roadmap.quests.push(quest)
    return json({ data: quest }, 201)
  }

  const questMatch = path.match(/^\/api\/quests\/([^/]+)$/)
  if (questMatch && method === 'GET') {
    const found = findQuest(questMatch[1])
    if (!found) return apiError('NOT_FOUND', '퀘스트를 찾을 수 없습니다.', 404)
    const { quest } = found
    return json({
      data: {
        ...quest,
        completionCriteria: `${quest.title}를 완료하고 배운 내용을 정리한다`,
        ncsUnit: null,
        certifications: [],
        star: stars.get(quest.questId) ?? null,
        starSource: stars.has(quest.questId) ? 'manual' : null,
        updatedAt: new Date().toISOString(),
      },
    })
  }

  const starMatch = path.match(/^\/api\/quests\/([^/]+)\/star$/)
  if (starMatch && method === 'PUT') {
    const found = findQuest(starMatch[1])
    if (!found) return apiError('NOT_FOUND', '퀘스트를 찾을 수 없습니다.', 404)
    if (found.quest.status === 'LOCKED') return apiError('QUEST_LOCKED', '선행 퀘스트를 먼저 완료해주세요.', 409)
    const star = body.star ?? {}
    stars.set(found.quest.questId, star)
    found.quest.star = star
    if (found.quest.status === 'OPEN') found.quest.status = 'PENDING'
    return json({
      data: {
        questId: found.quest.questId,
        star,
        source: body.source ?? 'manual',
        status: found.quest.status,
        updatedAt: new Date().toISOString(),
      },
    })
  }

  const completeMatch = path.match(/^\/api\/quests\/([^/]+)\/complete$/)
  if (completeMatch && method === 'PATCH') {
    const found = findQuest(completeMatch[1])
    if (!found) return apiError('NOT_FOUND', '퀘스트를 찾을 수 없습니다.', 404)
    if (body.version !== found.quest.version) return apiError('VERSION_CONFLICT', '최신 상태를 다시 불러와주세요.', 409)
    found.quest.status = body.completed ? 'DONE' : 'PENDING'
    found.quest.version += 1
    const done = found.roadmap.quests.filter((quest) => ['DONE', 'ALREADY_KNOWN'].includes(quest.status)).length
    found.roadmap.character.completionRate = Math.round((done / found.roadmap.quests.length) * 100)
    return json({
      data: {
        quest: {
          questId: found.quest.questId,
          status: found.quest.status,
          completedAt: body.completed ? new Date().toISOString() : null,
          version: found.quest.version,
        },
        characterChanges: {
          ...found.roadmap.character,
          nextQuest: null,
        },
        unlockedQuestIds: [],
        radar: dashboardResponse(found.roadmap).radar,
      },
    })
  }

  const aiPostMatch = path.match(/^\/api\/quests\/([^/]+)\/ai-enhancements$/)
  if (aiPostMatch && method === 'POST') {
    const requestId = `mock-ai-${crypto.randomUUID()}`
    aiRequests.set(requestId, { questId: aiPostMatch[1], star: body.star, createdAt: Date.now() })
    return json({ data: { requestId } }, 202)
  }

  const aiGetMatch = path.match(/^\/api\/ai-enhancements\/([^/]+)$/)
  if (aiGetMatch && method === 'GET') {
    const request = aiRequests.get(aiGetMatch[1])
    if (!request) return apiError('NOT_FOUND', 'AI 요청을 찾을 수 없습니다.', 404)
    const processing = Date.now() - request.createdAt < 250
    const enhancedStar = Object.fromEntries(
      Object.entries(request.star).map(([key, value]) => [key, `${value} 구체적인 행동과 정량적 결과를 중심으로 보완했습니다.`]),
    )
    return json({
      data: {
        requestId: aiGetMatch[1],
        questId: request.questId,
        status: processing ? 'PROCESSING' : 'COMPLETED',
        enhancedStar: processing ? null : enhancedStar,
        feedback: processing ? null : [],
        resumeDraft: null,
        errorCode: null,
        createdAt: new Date().toISOString(),
      },
    })
  }

  const dashboardMatch = path.match(/^\/api\/roadmaps\/([^/]+)\/dashboard$/)
  if (dashboardMatch && method === 'GET') {
    const roadmap = roadmaps.get(dashboardMatch[1])
    return roadmap ? json({ data: dashboardResponse(roadmap) }) : apiError('NOT_FOUND', '로드맵을 찾을 수 없습니다.', 404)
  }

  const exportMatch = path.match(/^\/api\/roadmaps\/([^/]+)\/export$/)
  if (exportMatch && method === 'GET') {
    const format = url.searchParams.get('format') ?? 'md'
    const content = format === 'pdf' ? 'MYiTH mock PDF export' : '# MYiTH 경험 기록\n\n목 API에서 생성한 내보내기 파일입니다.'
    return new Response(content, {
      headers: {
        'Content-Type': format === 'pdf' ? 'application/pdf' : 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''myith-export.${format}`,
      },
    })
  }

  if (path === '/api/star/records' && method === 'GET') {
    const cards = experienceEntries.map((entry, index) => ({
      experienceId: `static-${index}`,
      questId: `static-quest-${index}`,
      title: entry.title,
      axisCode: axisCode(entry.category),
      axisName: entry.category,
      star: Object.fromEntries(entry.entries.map(([key, value]) => [key.toLowerCase(), value])),
      createdAt: new Date().toISOString(),
    }))
    return json({ data: cards, meta: { nextCursor: null, hasNext: false } })
  }

  return apiError('NOT_FOUND', `${method} ${path} 목 API가 없습니다.`, 404)
}
