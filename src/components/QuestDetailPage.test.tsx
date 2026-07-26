import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { completeQuest, saveStar } from '../api/endpoints'
import type { QuestDetail } from '../api/types'
import { QuestDetailPage } from './QuestDetailPage'

vi.mock('../api/endpoints', () => ({
  completeQuest: vi.fn(),
  pollAiEnhancement: vi.fn(),
  requestAiEnhancement: vi.fn(),
  saveStar: vi.fn(),
}))

const baseQuest: QuestDetail = {
  questId: 'qst_1',
  roadmapId: 'rmp_1',
  level: 1,
  axisCode: 'programming',
  axisName: '프로그래밍 기초',
  title: '테스트 퀘스트',
  status: 'OPEN',
  version: 1,
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('QuestDetailPage STAR action', () => {
  it('처음 작성하는 STAR에는 완료 버튼 문구와 고정 폭을 사용한다', () => {
    render(<QuestDetailPage onBack={vi.fn()} quest={baseQuest} />)

    const button = screen.getByRole('button', { name: '완료하고 역량 채우기' })
    expect(button).toHaveClass('w-[190px]')
  })

  it('이미 작성된 STAR에는 같은 폭의 수정하기 버튼을 표시한다', () => {
    render(
      <QuestDetailPage
        onBack={vi.fn()}
        quest={{
          ...baseQuest,
          status: 'DONE',
          star: {
            situation: '상황',
            task: '과제',
            action: '행동',
            result: '결과',
          },
        }}
      />,
    )

    const button = screen.getByRole('button', { name: '수정하기' })
    expect(button).toHaveClass('w-[190px]')
    expect(screen.queryByRole('button', { name: '완료 취소' })).not.toBeInTheDocument()
  })

  it('입력값이 저장본과 달라지면 수정 상태를 상위에 알린다', () => {
    const onDirtyChange = vi.fn()
    render(
      <QuestDetailPage
        onBack={vi.fn()}
        onDirtyChange={onDirtyChange}
        quest={{
          ...baseQuest,
          star: {
            situation: '기존 상황',
            task: '기존 과제',
            action: '기존 행동',
            result: '기존 결과',
          },
        }}
      />,
    )

    fireEvent.change(screen.getByLabelText(/상황 \(Situation\)/), {
      target: { value: '수정된 상황' },
    })

    expect(onDirtyChange).toHaveBeenLastCalledWith(true)
    expect(screen.getByText('저장되지 않음')).toBeInTheDocument()
  })

  it('처음 작성한 STAR는 저장 후 퀘스트를 완료 처리한다', async () => {
    vi.mocked(saveStar).mockResolvedValue({ questId: 'qst_1', status: 'PENDING' })
    vi.mocked(completeQuest).mockResolvedValue({
      quest: { questId: 'qst_1', status: 'DONE', version: 2 },
    })
    render(<QuestDetailPage onBack={vi.fn()} quest={baseQuest} />)

    const values = ['상황', '과제', '행동', '결과']
    screen.getAllByRole('textbox').forEach((textbox, index) => {
      fireEvent.change(textbox, { target: { value: values[index] } })
    })
    fireEvent.click(screen.getByRole('button', { name: '완료하고 역량 채우기' }))

    await vi.waitFor(() => {
      expect(saveStar).toHaveBeenCalledOnce()
      expect(completeQuest).toHaveBeenCalledWith('qst_1', { completed: true, version: 1 })
    })
  })

  it('기존 STAR 수정은 저장만 하고 완료 상태를 다시 변경하지 않는다', async () => {
    vi.mocked(saveStar).mockResolvedValue({ questId: 'qst_1', status: 'DONE' })
    render(
      <QuestDetailPage
        onBack={vi.fn()}
        quest={{
          ...baseQuest,
          status: 'DONE',
          star: {
            situation: '기존 상황',
            task: '기존 과제',
            action: '기존 행동',
            result: '기존 결과',
          },
        }}
      />,
    )

    fireEvent.change(screen.getByLabelText(/상황 \(Situation\)/), {
      target: { value: '수정된 상황' },
    })
    fireEvent.click(screen.getByRole('button', { name: '수정하기' }))

    await vi.waitFor(() => {
      expect(saveStar).toHaveBeenCalledOnce()
    })
    expect(completeQuest).not.toHaveBeenCalled()
  })
})
