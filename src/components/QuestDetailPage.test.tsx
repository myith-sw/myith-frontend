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
  it('STAR 입력을 한 줄에 하나씩 배치하고 세로 크기 조절을 허용한다', () => {
    render(
      <QuestDetailPage onBack={vi.fn()} quest={baseQuest} />,
    )

    const textareas = screen.getAllByRole('textbox')
    expect(textareas).toHaveLength(4)
    textareas.forEach((textarea) => {
      expect(textarea).toHaveClass(
        'h-[85px]',
        'min-h-[85px]',
        'w-full',
        'resize-y',
      )
      expect(textarea.parentElement).toHaveClass('flex-col')
    })
    const starSection = screen
      .getByRole('heading', { name: '퀘스트 기록 (STAR)' })
      .closest('article')
    expect(starSection?.querySelector('.grid-cols-2')).not.toBeInTheDocument()
    expect(screen.queryByText('/2000', { exact: false })).not.toBeInTheDocument()
  })

  it('처음 작성하는 STAR에는 완료 버튼 문구와 고정 폭을 사용한다', () => {
    render(<QuestDetailPage onBack={vi.fn()} quest={baseQuest} />)

    const button = screen.getByRole('button', { name: '완료하고 역량 채우기' })
    expect(button).toHaveClass('w-[190px]')
    expect(button).toBeDisabled()
    expect(button.querySelector('img')).toHaveClass(
      'absolute',
      'left-6',
    )
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
    expect(button).toBeDisabled()
    expect(button.querySelector('img')).toHaveClass(
      'absolute',
      'left-6',
    )
    expect(screen.queryByRole('button', { name: '완료 취소' })).not.toBeInTheDocument()
  })

  it('최초 STAR 네 항목을 모두 작성하면 청록색 제출 버튼을 활성화한다', () => {
    render(<QuestDetailPage onBack={vi.fn()} quest={baseQuest} />)

    screen.getAllByRole('textbox').forEach((textbox, index) => {
      fireEvent.change(textbox, { target: { value: `${index + 1}번째 입력` } })
    })

    const button = screen.getByRole('button', { name: '완료하고 역량 채우기' })
    expect(button).toBeEnabled()
    expect(button).toHaveClass('border-[#59d8d4]', 'bg-[#59d8d4]', 'text-white')
    expect(button.querySelector('img')).toHaveClass(
      'brightness-0',
      'invert',
    )
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
    expect(screen.getByRole('button', { name: '수정하기' })).toBeEnabled()
  })

  it('기존 STAR를 원래 값으로 되돌리면 수정 버튼을 다시 비활성화한다', () => {
    render(
      <QuestDetailPage
        onBack={vi.fn()}
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

    const situation = screen.getByLabelText(/상황 \(Situation\)/)
    fireEvent.change(situation, { target: { value: '수정된 상황' } })
    expect(screen.getByRole('button', { name: '수정하기' })).toBeEnabled()

    fireEvent.change(situation, { target: { value: '기존 상황' } })
    expect(screen.getByRole('button', { name: '수정하기' })).toBeDisabled()
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
