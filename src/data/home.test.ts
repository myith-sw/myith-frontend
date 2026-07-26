import { describe, expect, it } from 'vitest'
import { createEggOptions } from './home'

describe('createEggOptions', () => {
  it('보유한 캐릭터를 제외하고 서로 다른 후보를 만든다', () => {
    const options = createEggOptions(
      ['teoreuteu', 'migeo'],
      3,
      null,
      () => 0.5,
    )

    expect(options).toHaveLength(3)
    expect(new Set(options.map(({ id }) => id)).size).toBe(3)
    expect(options.map(({ id }) => id)).not.toContain('teoreuteu')
    expect(options.map(({ id }) => id)).not.toContain('migeo')
    expect(options.every(({ asset }) => asset.endsWith('.png'))).toBe(true)
  })

  it('이전 단계에서 선택한 캐릭터는 후보에 유지한다', () => {
    const options = createEggOptions([], 3, 'soongeo', () => 0.5)

    expect(options[0]?.id).toBe('soongeo')
  })
})
