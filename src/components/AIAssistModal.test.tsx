import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AIAssistModal, type StarRecord } from './AIAssistModal'

const originalRecord: StarRecord = {
  situation: '팀 프로젝트에서 API 응답 속도가 느렸습니다.',
  task: '응답 시간을 줄여야 했습니다.',
  action: '쿼리를 분석했습니다.',
  result: '응답 시간이 개선됐습니다.',
}

afterEach(() => cleanup())

describe('AIAssistModal', () => {
  it('AI 처리 실패 응답의 enhancedStar 안내를 표시하고 적용은 막는다', async () => {
    render(
      <AIAssistModal
        onApply={vi.fn()}
        onClose={vi.fn()}
        open
        originalRecord={originalRecord}
        requestEnhancement={async () => ({
          enhancementId: 'aie_failed',
          failed: true,
          record: {
            situation: 'AI 보완에 실패했습니다. 잠시 후 다시 시도해주세요.',
            task: '',
            action: '',
            result: '',
          },
        })}
      />,
    )

    expect(await screen.findByText('AI 보완에 실패했습니다. 잠시 후 다시 시도해주세요.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'AI 보완 내용으로 적용하기' })).toBeDisabled()
  })
})
