import { homeAssets } from '../assets/home'
import type { CompetencyScores } from './archive'
import type { CSSProperties } from 'react'

export type EggId = 'teoreuteu' | 'migeo' | 'soongeo'

export interface EggOption {
  id: EggId
  asset: string
  alt: string
  spriteFrameStyle: CSSProperties
  spriteImageStyle: CSSProperties
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

export const eggOptions: EggOption[] = [
  {
    id: 'teoreuteu',
    asset: homeAssets.eggTeoreuteuSprite,
    alt: '터르트 egg',
    spriteFrameStyle: {
      width: 70.707,
      height: 89.562,
      left: 'calc(50% + 1.18px)',
      top: 'calc(50% - 1.18px)',
    },
    spriteImageStyle: {
      width: '512%',
      height: '269.47%',
      left: '-10%',
      top: '-92.11%',
    },
  },
  {
    id: 'migeo',
    asset: homeAssets.eggMigeoSprite,
    alt: '미거 egg',
    spriteFrameStyle: {
      width: 89.562,
      height: 101.347,
      left: 'calc(50% + 1.18px)',
      top: '50%',
    },
    spriteImageStyle: {
      width: '440%',
      height: '218.84%',
      left: '-7.89%',
      top: '-65.12%',
    },
  },
  {
    id: 'soongeo',
    asset: homeAssets.eggSoongeoSprite,
    alt: '소옹어 egg',
    spriteFrameStyle: {
      width: 65.993,
      height: 75.421,
      left: 'calc(50% + 1.18px)',
      top: 'calc(50% - 1.18px)',
    },
    spriteImageStyle: {
      width: '517.14%',
      height: '339.38%',
      left: '-14.29%',
      top: '-125%',
    },
  },
]

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
