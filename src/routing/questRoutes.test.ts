import { describe, expect, it } from 'vitest'
import { questDetailPath, resolveQuestRoadmapId } from './questRoutes'

describe('quest routes', () => {
  it('builds a roadmap-scoped quest path', () => {
    expect(questDetailPath('rmp_42', 'qst_17')).toBe('/roadmaps/rmp_42/quests/qst_17')
  })

  it('encodes route identifiers', () => {
    expect(questDetailPath('roadmap/42', 'quest 17')).toBe(
      '/roadmaps/roadmap%2F42/quests/quest%2017',
    )
  })

  it('uses the route roadmap while the quest response is unavailable', () => {
    expect(resolveQuestRoadmapId('rmp_route', undefined)).toBe('rmp_route')
  })

  it('uses the response roadmap when it differs from the route', () => {
    expect(resolveQuestRoadmapId('rmp_stale', 'rmp_current')).toBe('rmp_current')
  })

  it('does not guess a roadmap when both values are missing', () => {
    expect(resolveQuestRoadmapId(undefined, undefined)).toBeUndefined()
  })
})
