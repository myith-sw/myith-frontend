import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ArchiveExperienceEntry } from '../data/archive'
import { ArchivePage } from './ArchivePage'

const experiences: ArchiveExperienceEntry[] = [
  {
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

function renderArchive() {
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
      experiences={experiences}
      onOpenRoadmap={vi.fn()}
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

  it('전체와 Lv.1~Lv.4 필터로 경험 카드를 전환하고 빈 단계를 안내한다', () => {
    renderArchive()

    const allFilter = screen.getByRole('button', { name: '전체' })
    const levelTwoFilter = screen.getByRole('button', { name: 'Lv.2 견습 단계' })
    expect(allFilter).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(levelTwoFilter)
    expect(levelTwoFilter).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('heading', { name: '견습 경험' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '입문 경험' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: '레벨 정보 없는 경험' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Lv.4 전설 단계' }))
    expect(screen.getByText('해당 단계에 기록된 경험이 없어요')).toBeInTheDocument()

    fireEvent.click(allFilter)
    expect(screen.getByRole('heading', { name: '입문 경험' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '견습 경험' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '레벨 정보 없는 경험' })).toBeInTheDocument()
  })
})
