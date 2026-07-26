import type { AssessmentLevel } from './onboarding'

export type ArchiveSkillStatus = 'complete' | 'incomplete' | 'locked'

export interface ArchiveSkill {
  category: string
  status: ArchiveSkillStatus
  title: string
}

export interface ArchiveSkillGroup {
  level: number
  label: string
  skills: ArchiveSkill[]
}

export const competencyKeys = [
  'programming',
  'computerScience',
  'database',
  'serverApi',
  'collaboration',
  'deployment',
] as const

export type CompetencyKey = (typeof competencyKeys)[number]

export type CompetencyScores = Record<CompetencyKey, number>

export interface ArchiveCharacter {
  title: string
  role: string
  stage: number
  progress: number
  competencies: CompetencyScores
}

export interface ArchiveExperienceEntry {
  questId?: string
  axisCode?: string
  category: string
  level?: number
  levelLabel?: string
  title: string
  entries: [string, string][]
}

export interface ArchiveExperienceAxis {
  code: string
  label: string
}

export function resolveArchiveExperienceAxes(
  apiAxes: readonly ArchiveExperienceAxis[],
  radarAxes: readonly ArchiveExperienceAxis[],
  experiences: readonly ArchiveExperienceEntry[],
) {
  const source =
    apiAxes.length > 0
      ? apiAxes
      : [
          ...radarAxes,
          ...experiences
            .filter((entry) => entry.axisCode)
            .map((entry) => ({ code: entry.axisCode!, label: entry.category })),
        ]

  return Array.from(
    new Map(
      source
        .filter((axis) => axis.code && axis.label)
        .map((axis) => [axis.code, axis] as const),
    ).values(),
  )
}

export const archiveLevelLabels: Record<number, string> = {
  1: '입문 단계',
  2: '견습 단계',
  3: '성장 단계',
  4: '전설 단계',
}

export interface CompetencyMetric {
  key: CompetencyKey
  label: string
}

export const competencyMetrics: CompetencyMetric[] = [
  { key: 'programming', label: '프로그래밍 기초' },
  { key: 'database', label: '데이터베이스' },
  { key: 'serverApi', label: '서버·API' },
  { key: 'collaboration', label: '협업·형상관리' },
  { key: 'deployment', label: '배포·운영' },
  { key: 'computerScience', label: 'CS·자료구조' },
]

export const radarAxes: CompetencyMetric[] = [
  { key: 'programming', label: '프로그래밍 기초' },
  { key: 'database', label: '데이터베이스' },
  { key: 'serverApi', label: '서버·API' },
  { key: 'collaboration', label: '협업·형상관리' },
  { key: 'deployment', label: '배포·운영' },
  { key: 'computerScience', label: 'CS·자료구조' },
]

export function clampCompetencyScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round(value)))
}

const assessmentScoreMap: Record<string, number> = {
  모름: 0,
  들어봄: 33,
  해봄: 67,
  '혼자 가능': 100,
}

const assessmentCompetencies: Record<CompetencyKey, string[]> = {
  programming: ['environment', 'toy-app', 'testing'],
  computerScience: ['algorithm'],
  database: ['database'],
  serverApi: ['rest-api', 'security'],
  collaboration: ['version-control'],
  deployment: [],
}

export function assessmentToCompetencyScores(answers: Record<string, AssessmentLevel>): CompetencyScores {
  return competencyKeys.reduce<CompetencyScores>((scores, key) => {
    const questionIds = assessmentCompetencies[key]

    if (questionIds.length === 0) {
      scores[key] = 0
      return scores
    }

    const total = questionIds.reduce((sum, id) => sum + (assessmentScoreMap[answers[id] ?? '모름'] ?? 0), 0)
    scores[key] = clampCompetencyScore(total / questionIds.length)
    return scores
  }, {} as CompetencyScores)
}

export const archiveSkillGroups: ArchiveSkillGroup[] = [
  {
    level: 1,
    label: '입문 단계',
    skills: [
      { category: '프로그래밍 기초', status: 'complete', title: '개발환경을 구축할 수 있다' },
      { category: '프로그래밍 기초', status: 'complete', title: '언어 기초로 토이앱을 만든다' },
    ],
  },
  {
    level: 2,
    label: '견습 단계',
    skills: [
      { category: 'CS·자료구조', status: 'complete', title: '자료구조·알고리즘 기초를 안다' },
      { category: '데이터베이스', status: 'complete', title: '데이터베이스를 다룰 수 있다' },
      { category: '협업·형상관리', status: 'incomplete', title: '버전관리로 협업한다' },
    ],
  },
  {
    level: 3,
    label: '성장 단계',
    skills: [
      { category: '서버·API', status: 'complete', title: 'REST API 서버를 구현한다' },
      { category: '서버·API', status: 'complete', title: '인증·보안 기초를 적용한다' },
      { category: '프로그래밍 기초', status: 'incomplete', title: '테스트 코드를 작성한다' },
    ],
  },
  {
    level: 4,
    label: '전설 단계',
    skills: [
      { category: '배포·운영', status: 'incomplete', title: '서비스를 배포해본다' },
      { category: '배포·운영', status: 'incomplete', title: '컨테이너·CI를 맛본다' },
    ],
  },
  {
    level: 5,
    label: '',
    skills: [{ category: 'CS·자료구조', status: 'locked', title: 'CS 면접 질문을 정리한다' }],
  },
]

export const experienceEntries: ArchiveExperienceEntry[] = [
  {
    axisCode: 'programming',
    category: '프로그래밍 기초',
    level: 1,
    levelLabel: archiveLevelLabels[1],
    title: '언어 기초로 토이앱을 만든다',
    entries: [
      ['S', '언어 문법은 봤지만 직접 만들어본 적이 없어 감이 없었다.'],
      ['T', '자바로 동작하는 콘솔 CRUD 토이앱을 만들어보기로 했다.'],
      ['A', '메뉴 루프와 컬렉션으로 메모 추가·조회·수정·삭제 기능을 구현했다.'],
      ['R', '작게라도 끝까지 만들며 클래스 분리와 입력 검증의 필요성을 체감했다.'],
    ],
  },
  {
    axisCode: 'programming',
    category: '프로그래밍 기초',
    level: 1,
    levelLabel: archiveLevelLabels[1],
    title: '언어 기초로 토이앱을 만든다',
    entries: [
      ['S', '언어 문법은 봤지만 직접 만들어본 적이 없어 감이 없었다.'],
      ['T', '자바로 동작하는 콘솔 CRUD 토이앱을 만들어보기로 했다.'],
      ['A', '메뉴 루프와 컬렉션으로 메모 추가·조회·수정·삭제 기능을 구현했다.'],
      ['R', '작게라도 끝까지 만들며 클래스 분리와 입력 검증의 필요성을 체감했다.'],
    ],
  },
]
