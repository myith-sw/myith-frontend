import { describe, expect, it } from 'vitest'
import { toRoadmapQuestStatus } from './roadmap'

describe('toRoadmapQuestStatus', () => {
  it('DONE 상태를 완료로 변환한다', () => {
    expect(toRoadmapQuestStatus('DONE')).toBe('complete')
  })

  it.each(['OPEN', 'ALREADY_KNOWN', undefined])('%s 상태를 수행 가능으로 변환한다', (status) => {
    expect(toRoadmapQuestStatus(status)).toBe('incomplete')
  })

  it('LOCKED 상태를 잠금으로 변환한다', () => {
    expect(toRoadmapQuestStatus('LOCKED')).toBe('locked')
  })
})
