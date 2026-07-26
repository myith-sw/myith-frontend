import {
  characterAssets,
  characterCatalog,
  type CharacterId,
} from '../assets/characters'
import type { CompetencyScores } from './archive'

export type EggId = CharacterId

export interface EggOption {
  id: EggId
  asset: string
  alt: string
}

export interface SidebarCharacter {
  id?: string
  title: string
  role: string
  level: number
}

export interface MythCharacter extends SidebarCharacter {
  id: string
  stageLabel: string
  description: string
  progress: number
  nextQuest: string
  nextQuestId?: string
  characterId: string
  stage: number
  competencies: CompetencyScores
}

function toEggOption(character: (typeof characterCatalog)[number]): EggOption {
  return {
    id: character.id,
    asset: characterAssets[character.id][1],
    alt: `${character.name} egg`,
  }
}

export const eggOptions: EggOption[] = characterCatalog
  .filter(({ id }) => ['teoreuteu', 'migeo', 'soongeo'].includes(id))
  .map(toEggOption)

export function createEggOptions(
  ownedSpecies: string[] = [],
  count = 3,
  preferredId?: EggId | null,
  random: () => number = Math.random,
) {
  const owned = new Set(ownedSpecies)
  const available = characterCatalog.filter(({ id }) => !owned.has(id))
  const preferred = preferredId
    ? available.find(({ id }) => id === preferredId)
    : undefined
  const shuffled = available.filter(({ id }) => id !== preferred?.id)

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]
  }

  return [
    ...(preferred ? [preferred] : []),
    ...shuffled,
  ].slice(0, count).map(toEggOption)
}

export const mythCharacters: MythCharacter[] = [
  {
    id: 'backend-apprentice',
    title: '견습 서버 개발자',
    role: '백엔드 개발자',
    level: 4,
    stageLabel: '전설 단계',
    description: '서버, API, DB로 서비스의 뼈대를 만든다',
    progress: 80,
    nextQuest: 'REST API 구조 이해하기',
    characterId: 'deokbaseu',
    stage: 4,
    competencies: {
      programming: 67,
      computerScience: 80,
      database: 18,
      serverApi: 67,
      collaboration: 90,
      deployment: 10,
    },
  },
  {
    id: 'data-analyst',
    title: '데이터 분석가',
    role: '데이터 분석가',
    level: 1,
    stageLabel: '입문 단계',
    description: '데이터 속 문제의 흐름과 의사결정의 근거를 찾는다',
    progress: 5,
    nextQuest: '데이터 시각화 그래프 만들어보기',
    characterId: 'kokkoburi',
    stage: 1,
    competencies: {
      programming: 38,
      computerScience: 88,
      database: 93,
      serverApi: 24,
      collaboration: 72,
      deployment: 30,
    },
  },
  {
    id: 'digital-marketer',
    title: 'ㅇㅇㅇ',
    role: '디지털 마케터',
    level: 2,
    stageLabel: '견습 단계',
    description: '콘텐츠와 데이터를 엮어 사람들의 행동을 움직인다',
    progress: 20,
    nextQuest: '콘텐츠 반응 지표 정리하기',
    characterId: 'progul',
    stage: 2,
    competencies: {
      programming: 28,
      computerScience: 42,
      database: 55,
      serverApi: 18,
      collaboration: 92,
      deployment: 48,
    },
  },
]

export const sidebarCharacters: SidebarCharacter[] = mythCharacters
