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
      status: 'open' as const,
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
          level: 1,
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

  it('Figma 커스텀 드롭다운에서 고른 역량과 레벨로 퀘스트를 추가한다', () => {
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
          level: 1,
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
    fireEvent.click(screen.getByRole('button', { name: '퀘스트 레벨: 레벨 1' }))
    fireEvent.click(screen.getByRole('option', { name: '레벨 2' }))
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
