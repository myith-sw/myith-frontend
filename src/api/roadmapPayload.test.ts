import { describe, expect, it } from 'vitest'
import type { ProjectExperience } from '../data/onboarding'
import { prepareRoadmapEvidence } from './roadmapPayload'

function experience(
  changes: Partial<ProjectExperience> = {},
): ProjectExperience {
  return {
    id: crypto.randomUUID(),
    description: '',
    file: null,
    link: '',
    ...changes,
  }
}

describe('prepareRoadmapEvidence', () => {
  it('converts project cards to the single evidence fields accepted by Swagger', () => {
    const file = new File(['portfolio'], 'portfolio.pdf', {
      type: 'application/pdf',
    })

    expect(
      prepareRoadmapEvidence([
        experience({
          description: '첫 번째 프로젝트',
          file,
          link: 'https://github.com/myith-sw/myith-frontend',
        }),
        experience({
          description: '두 번째 프로젝트',
          link: 'https://example.com/second',
        }),
      ]),
    ).toEqual({
      file,
      narrative: {
        experience: '1. 첫 번째 프로젝트\n\n2. 두 번째 프로젝트',
      },
      repoUrl: 'https://github.com/myith-sw/myith-frontend',
    })
  })

  it('omits optional evidence fields when every project card is empty', () => {
    expect(prepareRoadmapEvidence([experience()])).toEqual({
      file: undefined,
      narrative: undefined,
      repoUrl: undefined,
    })
  })
})
