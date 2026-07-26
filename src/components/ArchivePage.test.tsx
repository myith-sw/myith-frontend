import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ArchiveExperienceEntry } from '../data/archive'
import { ArchivePage } from './ArchivePage'

const experiences: ArchiveExperienceEntry[] = [
  {
    questId: 'qst_intro',
    axisCode: 'programming',
    category: '프로그래밍 기초',
    level: 1,
    levelLabel: '입문 단계',
    title: '입문 경험',
    entries: [
      ['S', '입문 상황'],
      ['T', '입문 과제'],
      ['A', '입문 행동'],
      ['R', '입문 결과'],
    ],
  },
  {
    questId: 'qst_database',
    axisCode: 'database',
    category: '데이터베이스',
    level: 2,
    levelLabel: '견습 단계',
    title: '견습 경험',
    entries: [
      ['S', '견습 상황'],
      ['T', '견습 과제'],
      ['A', '견습 행동'],
      ['R', '견습 결과'],
    ],
  },
  {
    axisCode: 'server-api',
    category: '서버·API',
    title: '레벨 정보 없는 경험',
    entries: [
      ['S', '예외 상황'],
      ['T', '예외 과제'],
      ['A', '예외 행동'],
      ['R', '예외 결과'],
    ],
  },
]

afterEach(cleanup)

function renderArchive(onOpenQuest = vi.fn()) {
  return render(
    <ArchivePage
      character={{
        title: '테스트 캐릭터',
        role: '백엔드 개발자',
        level: 2,
        progress: 25,
        competencies: {
          programming: 10,
          computerScience: 20,
          database: 30,
          serverApi: 40,
          collaboration: 50,
          deployment: 60,
        },
      }}
      experienceAxes={[
        { code: 'programming', label: '프로그래밍 기초' },
        { code: 'database', label: '데이터베이스' },
        { code: 'server-api', label: '서버·API' },
        { code: 'collab', label: '협업·형상관리' },
      ]}
      experiences={experiences}
      onOpenRoadmap={vi.fn()}
      onOpenQuest={onOpenQuest}
      skillGroups={[]}
    />,
  )
}

describe('ArchivePage experience cards', () => {
  it('경험 카드에 레벨과 역량 칩을 표시하고 레벨 누락 데이터는 분야 칩만 표시한다', () => {
    renderArchive()

    const levelOneCard = screen.getByRole('heading', { name: '입문 경험' }).closest('article')
    expect(levelOneCard).not.toBeNull()
    expect(within(levelOneCard!).getByText('Lv.1 입문 단계')).toBeInTheDocument()
    expect(within(levelOneCard!).getByText('프로그래밍 기초')).toBeInTheDocument()

    const unknownLevelCard = screen.getByRole('heading', { name: '레벨 정보 없는 경험' }).closest('article')
    expect(unknownLevelCard).not.toBeNull()
    expect(within(unknownLevelCard!).getByText('서버·API')).toBeInTheDocument()
    expect(within(unknownLevelCard!).queryByText(/^Lv\./)).not.toBeInTheDocument()
  })

  it('전체와 역량 필터를 axisCode 기준으로 전환하고 빈 역량을 안내한다', () => {
    renderArchive()

    const allFilter = screen.getByRole('button', { name: '전체' })
    const databaseFilter = screen.getByRole('button', { name: '데이터베이스' })
    expect(allFilter).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(databaseFilter)
    expect(databaseFilter).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: '견습 경험' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '입문 경험' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '레벨 정보 없는 경험' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '협업·형상관리' }))
    expect(screen.getByText('해당 역량에 기록된 경험이 없어요')).toBeInTheDocument()

    fireEvent.click(allFilter)
    expect(screen.getByRole('heading', { name: '입문 경험' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '견습 경험' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '레벨 정보 없는 경험' })).toBeInTheDocument()
  })

  it('questId가 있는 경험 카드만 퀘스트 이동 버튼으로 제공한다', () => {
    const onOpenQuest = vi.fn()
    renderArchive(onOpenQuest)

    fireEvent.click(screen.getByRole('button', { name: '입문 경험 퀘스트 열기' }))
    expect(onOpenQuest).toHaveBeenCalledWith('qst_intro')
    expect(screen.queryByRole('button', { name: '레벨 정보 없는 경험 퀘스트 열기' })).not.toBeInTheDocument()
  })
})
