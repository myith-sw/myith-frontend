import { afterEach, describe, expect, it, vi } from 'vitest'
import { confirmDiscardChanges, unsavedChangesMessage } from './unsavedChanges'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('confirmDiscardChanges', () => {
  it('수정사항이 없으면 확인창 없이 이동을 허용한다', () => {
    const confirm = vi.spyOn(window, 'confirm')

    expect(confirmDiscardChanges(false)).toBe(true)
    expect(confirm).not.toHaveBeenCalled()
  })

  it('수정사항이 있으면 지정된 안내 문구로 이동 여부를 확인한다', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)

    expect(confirmDiscardChanges(true)).toBe(false)
    expect(confirm).toHaveBeenCalledWith(unsavedChangesMessage)
  })
})
