import { describe, expect, it } from 'vitest'
import type { ArchiveExperienceEntry } from './archive'
import { resolveArchiveExperienceAxes } from './archive'

const experiences: ArchiveExperienceEntry[] = [
  {
    axisCode: 'server-api',
    category: '서버·API',
    title: 'API 경험',
    entries: [],
  },
  {
    axisCode: 'collab',
    category: '협업·형상관리',
    title: '협업 경험',
    entries: [],
  },
  {
    category: '분류 없음',
    title: '예외 경험',
    entries: [],
  },
]

describe('resolveArchiveExperienceAxes', () => {
  it('API 역량 축이 있으면 응답 순서를 그대로 사용한다', () => {
    expect(
      resolveArchiveExperienceAxes(
        [
          { code: 'cs', label: 'CS·자료구조' },
          { code: 'programming', label: '프로그래밍 기초' },
        ],
        [{ code: 'database', label: '데이터베이스' }],
        experiences,
      ),
    ).toEqual([
      { code: 'cs', label: 'CS·자료구조' },
      { code: 'programming', label: '프로그래밍 기초' },
    ])
  })

  it('API 역량 축이 없으면 레이더와 경험 카드의 고유 역량을 순서대로 합친다', () => {
    expect(
      resolveArchiveExperienceAxes(
        [],
        [
          { code: 'programming', label: '프로그래밍 기초' },
          { code: 'server-api', label: '서버·API' },
        ],
        experiences,
      ),
    ).toEqual([
      { code: 'programming', label: '프로그래밍 기초' },
      { code: 'server-api', label: '서버·API' },
      { code: 'collab', label: '협업·형상관리' },
    ])
  })
})
