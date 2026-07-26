import { describe, expect, it } from 'vitest'
import { toRoadmapQuestStatus } from './roadmap'

describe('toRoadmapQuestStatus', () => {
  it.each(['DONE', 'ALREADY_KNOWN'])('%s 상태를 완료로 변환한다', (status) => {
    expect(toRoadmapQuestStatus(status)).toBe('complete')
  })

  it.each(['OPEN', 'PENDING', undefined])('%s 상태를 미완료로 변환한다', (status) => {
    expect(toRoadmapQuestStatus(status)).toBe('incomplete')
  })

  it('LOCKED 상태를 잠금으로 변환한다', () => {
    expect(toRoadmapQuestStatus('LOCKED')).toBe('locked')
  })
})
