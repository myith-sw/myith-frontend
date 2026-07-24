import type { CharacterId, CharacterStage } from '../assets/characters'

export type RoadmapQuestStatus = 'complete' | 'pending' | 'open' | 'locked'

export interface RoadmapCharacter {
  name: string
  job: string
  description: string
  characterId: CharacterId
  level: number
  stage: CharacterStage
  stageLabel: string
  progress: number
}

export interface RoadmapQuest {
  id: string
  level: number
  category: string
  title: string
  status: RoadmapQuestStatus
}

export interface RoadmapQuestGroup {
  level: number
  label: string
  quests: RoadmapQuest[]
}

export const initialRoadmapQuestGroups: RoadmapQuestGroup[] = [
  {
    level: 1,
    label: '입문 단계',
    quests: [
      { id: 'environment', level: 1, category: '프로그래밍 기초', title: '개발환경을 구축할 수 있다', status: 'complete' },
      { id: 'toy-app', level: 1, category: '프로그래밍 기초', title: '언어 기초로 토이앱을 만든다', status: 'complete' },
    ],
  },
  {
    level: 2,
    label: '견습 단계',
    quests: [
      { id: 'algorithm', level: 2, category: 'CS·자료구조', title: '자료구조·알고리즘 기초를 안다', status: 'complete' },
      { id: 'database', level: 2, category: '데이터베이스', title: '데이터베이스를 다룰 수 있다', status: 'complete' },
      { id: 'version-control', level: 2, category: '협업·형상관리', title: '버전관리로 협업한다', status: 'pending' },
    ],
  },
  {
    level: 3,
    label: '성장 단계',
    quests: [
      { id: 'rest-api', level: 3, category: '서버·API', title: 'REST API 서버를 구현한다', status: 'complete' },
      { id: 'security', level: 3, category: '서버·API', title: '인증·보안 기초를 적용한다', status: 'complete' },
      { id: 'testing', level: 3, category: '프로그래밍 기초', title: '테스트 코드를 작성한다', status: 'pending' },
    ],
  },
  {
    level: 4,
    label: '전설 단계',
    quests: [
      { id: 'deployment', level: 4, category: '배포·운영', title: '서비스를 배포해본다', status: 'pending' },
      { id: 'container-ci', level: 4, category: '배포·운영', title: '컨테이너·CI를 맛본다', status: 'pending' },
    ],
  },
  {
    level: 5,
    label: '',
    quests: [{ id: 'cs-interview', level: 5, category: 'CS·자료구조', title: 'CS 면접 질문을 정리한다', status: 'locked' }],
  },
  {
    level: 6,
    label: '',
    quests: [{ id: 'collaboration-project', level: 6, category: '서버·API', title: '협업 프로젝트로 실전을 쌓는다', status: 'locked' }],
  },
]

export function getRoadmapQuestGroups(customQuests: RoadmapQuest[] = []): RoadmapQuestGroup[] {
  return initialRoadmapQuestGroups.map((group) => ({
    ...group,
    quests: [...group.quests, ...customQuests.filter((quest) => quest.level === group.level)],
  }))
}
