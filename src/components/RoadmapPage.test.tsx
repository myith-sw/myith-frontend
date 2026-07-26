import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RoadmapPage } from './RoadmapPage'

afterEach(cleanup)

describe('RoadmapPage', () => {
  it('잠긴 퀘스트의 진입을 막고 순서 변경 버튼을 표시하지 않는다', () => {
    const onOpenQuest = vi.fn()
    const openQuest = {
      id: 'quest-open',
      level: 1,
      axisCode: 'api',
      category: '서버 API',
      title: '열린 퀘스트',
      status: 'incomplete' as const,
      version: 3,
    }
    const lockedQuest = {
      ...openQuest,
      id: 'quest-locked',
      title: '잠긴 퀘스트',
      status: 'locked' as const,
    }

    render(
      <RoadmapPage
        axes={[{ code: 'api', name: '서버 API' }]}
        character={{
          name: '테스트',
          job: '백엔드 개발자',
          description: '테스트 캐릭터',
          characterId: 'teoreuteu',
          stage: 1,
          stageLabel: '입문',
          progress: 0,
        }}
        levels={[1]}
        onAddQuest={vi.fn()}
        onOpenArchive={vi.fn()}
        onOpenQuest={onOpenQuest}
        questGroups={[{ level: 1, label: '입문', quests: [openQuest, lockedQuest] }]}
      />,
    )

    const lockedButton = screen.getByRole('button', { name: '잠긴 퀘스트 (잠김)' })
    expect(lockedButton).toBeDisabled()
    fireEvent.click(lockedButton)
    expect(onOpenQuest).not.toHaveBeenCalled()

    expect(screen.queryByRole('button', { name: '열린 퀘스트 위로 이동' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '열린 퀘스트 아래로 이동' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '열린 퀘스트' }))
    expect(onOpenQuest).toHaveBeenCalledWith(openQuest)
  })

  it('캐릭터는 API 스테이지를 Lv. 표기로, 퀘스트 구분선은 Stage. 표기로 렌더링한다', () => {
    render(
      <RoadmapPage
        axes={[{ code: 'programming', name: '프로그래밍 기초' }]}
        character={{
          name: '테스트',
          job: '백엔드 개발자',
          description: '테스트 캐릭터',
          characterId: 'teoreuteu',
          stage: 1,
          stageLabel: '입문 단계',
          progress: 0,
        }}
        levels={[1]}
        onAddQuest={vi.fn()}
        onOpenArchive={vi.fn()}
        onOpenQuest={vi.fn()}
        questGroups={[
          {
            level: 1,
            label: '입문 단계',
            quests: [
              {
                id: 'complete',
                level: 1,
                category: '프로그래밍 기초',
                title: '완료 퀘스트',
                status: 'complete',
              },
              {
                id: 'incomplete',
                level: 1,
                category: '프로그래밍 기초',
                title: '미완료 퀘스트',
                status: 'incomplete',
              },
              {
                id: 'locked',
                level: 1,
                category: '프로그래밍 기초',
                title: '잠금 퀘스트',
                status: 'locked',
              },
            ],
          },
        ]}
      />,
    )

    expect(screen.getByText('Lv.1', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('Stage 1', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '완료 퀘스트' })).toHaveClass(
      'border-[#c8eeed]',
      'bg-[rgba(215,255,254,0.4)]',
    )
    expect(screen.getByRole('button', { name: '미완료 퀘스트' })).toHaveClass(
      'border-[#ffe3aa]',
      'bg-[#faf4e7]',
    )
    expect(screen.getByRole('button', { name: '잠금 퀘스트 (잠김)' })).toHaveClass('bg-[#f6f6f6]')
  })

  it('Figma 커스텀 드롭다운에서 고른 역량과 스테이지로 퀘스트를 추가한다', () => {
    const onAddQuest = vi.fn()

    render(
      <RoadmapPage
        axes={[
          { code: 'programming', name: '프로그래밍 기초' },
          { code: 'web', name: '웹 개발 입문' },
        ]}
        character={{
          name: '테스트',
          job: '백엔드 개발자',
          description: '테스트 캐릭터',
          characterId: 'teoreuteu',
          stage: 1,
          stageLabel: '입문',
          progress: 0,
        }}
        levels={[1, 2]}
        onAddQuest={onAddQuest}
        onOpenArchive={vi.fn()}
        onOpenQuest={vi.fn()}
        questGroups={[]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '퀘스트 추가' }))
    fireEvent.click(screen.getByRole('button', { name: '역량 분류: 프로그래밍 기초' }))
    fireEvent.click(screen.getByRole('option', { name: '웹 개발 입문' }))
    fireEvent.click(screen.getByRole('button', { name: '퀘스트 스테이지: 스테이지 1' }))
    fireEvent.click(screen.getByRole('option', { name: '스테이지 2' }))
    fireEvent.change(screen.getByPlaceholderText('퀘스트 제목 (예: 사이드 프로젝트를 운영한다)'), {
      target: { value: '나만의 웹 프로젝트 만들기' },
    })
    fireEvent.click(screen.getByRole('button', { name: '추가' }))

    expect(onAddQuest).toHaveBeenCalledWith({
      axisCode: 'web',
      level: 2,
      title: '나만의 웹 프로젝트 만들기',
    })
  })
})
