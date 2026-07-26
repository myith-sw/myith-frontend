import { describe, expect, it } from 'vitest'
import { jobCategories } from '../data/onboarding'
import { mapJobCatalog } from './jobCatalog'

describe('mapJobCatalog', () => {
  it('서버 응답과 무관하게 Figma의 9개 카테고리를 같은 순서로 유지한다', () => {
    const catalog = mapJobCatalog({
      categories: [
        {
          categoryCode: 'it',
          categoryName: 'IT·개발',
          jobs: [
            {
              available: true,
              jobCode: 'frontend-developer',
              jobName: '프론트엔드 개발자',
            },
          ],
        },
        {
          categoryCode: 'server-only',
          categoryName: '서버 전용 카테고리',
          jobs: [
            {
              available: true,
              jobCode: 'server-only-job',
              jobName: '서버 전용 직무',
            },
          ],
        },
      ],
    })

    expect(catalog.categories).toEqual(jobCategories)
    expect(catalog.categories.map(({ label }) => label)).toEqual([
      '경영·사무',
      '금융·회계',
      '영업·해외영업',
      '광고·마케팅',
      'IT',
      '연구·R&D',
      '생산·제조',
      '공공행정',
      '기타',
    ])
    expect(catalog.jobs).toHaveLength(1)
    expect(catalog.jobs[0]?.id).toBe('frontend-developer')
  })
})
