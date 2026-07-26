import { cleanup, fireEvent, render, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { jobCategories, type JobOption } from '../data/onboarding'
import { JobSelection } from './JobSelection'

const frontendDeveloper: JobOption = {
  id: 'frontend-developer',
  categoryId: 'it',
  title: '프론트엔드 개발자',
  description: '사용자가 바로 느끼는 웹 경험을 구현한다',
  skills: ['React'],
}

afterEach(cleanup)

describe('JobSelection', () => {
  it('Figma의 9개 카테고리와 선택 색상을 표시한다', () => {
    const { getByLabelText, getByRole } = render(
      <JobSelection
        categories={jobCategories}
        jobs={[frontendDeveloper]}
        onSelectCategory={() => undefined}
        onSelectJob={() => undefined}
        selectedCategoryId="marketing"
      />,
    )

    expect(within(getByLabelText('직무 분야')).getAllByRole('button')).toHaveLength(9)

    const activeCategory = getByRole('button', { name: '광고·마케팅' })
    const inactiveCategory = getByRole('button', { name: 'IT' })

    expect(activeCategory).toHaveClass('bg-[#7dcecb]', 'text-white')
    expect(activeCategory.querySelector('[aria-hidden="true"]')).toHaveStyle({
      backgroundColor: '#ffffff',
    })
    expect(inactiveCategory).toHaveClass('bg-[#f2f2f2]', 'text-[#717171]')
    expect(inactiveCategory.querySelector('[aria-hidden="true"]')).toHaveStyle({
      backgroundColor: '#717171',
    })
  })

  it('직무가 없는 카테고리도 유지하고 준비중 카드를 표시한다', () => {
    const onSelectCategory = vi.fn()
    const { container } = render(
      <JobSelection
        categories={jobCategories}
        jobs={[frontendDeveloper]}
        onSelectCategory={onSelectCategory}
        onSelectJob={() => undefined}
        selectedCategoryId="finance"
      />,
    )

    expect(within(container).getByText('준비중')).toBeInTheDocument()
    expect(within(container).queryByText('프론트엔드 개발자')).not.toBeInTheDocument()

    fireEvent.click(within(container).getByRole('button', { name: 'IT' }))
    expect(onSelectCategory).toHaveBeenCalledWith('it')
  })

  it('준비 중인 직무가 여러 개여도 준비중 카드는 한 장만 표시한다', () => {
    const unavailableJobs: JobOption[] = [
      {
        id: 'mobile-developer',
        categoryId: 'it',
        title: '모바일 개발자',
        description: '',
        skills: [],
        available: false,
      },
      {
        id: 'security-engineer',
        categoryId: 'it',
        title: '보안 엔지니어',
        description: '',
        skills: [],
        available: false,
      },
    ]
    const { container } = render(
      <JobSelection
        categories={jobCategories}
        jobs={[frontendDeveloper, ...unavailableJobs]}
        onSelectCategory={() => undefined}
        onSelectJob={() => undefined}
        selectedCategoryId="it"
      />,
    )

    expect(within(container).getAllByText('준비중')).toHaveLength(1)
    expect(within(container).getByText('프론트엔드 개발자')).toBeInTheDocument()
    expect(within(container).queryByText('모바일 개발자')).not.toBeInTheDocument()
    expect(within(container).queryByText('보안 엔지니어')).not.toBeInTheDocument()
  })

  it('직무 선택 후 카드 목록을 유지하고 닉네임 입력 영역으로 스크롤한다', async () => {
    const scrollIntoView = vi.fn()
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })
    const backendDeveloper: JobOption = {
      id: 'backend-developer',
      categoryId: 'it',
      title: '백엔드 개발자',
      description: '서버를 구현한다',
      skills: ['Node.js'],
    }
    const { getByLabelText, getByRole } = render(
      <JobSelection
        categories={jobCategories}
        jobs={[backendDeveloper, frontendDeveloper]}
        nickname=""
        onContinue={() => undefined}
        onNicknameChange={() => undefined}
        onSelectCategory={() => undefined}
        onSelectJob={() => undefined}
        selectedCategoryId="it"
        selectedJob={frontendDeveloper}
      />,
    )

    expect(getByRole('button', { name: /백엔드 개발자/ })).toBeInTheDocument()
    expect(getByRole('button', { name: /프론트엔드 개발자/ })).toBeInTheDocument()
    expect(getByLabelText('캐릭터 닉네임')).toBeInTheDocument()
    expect(getByRole('img', { name: '선택됨' })).toBeInTheDocument()
    await waitFor(() => {
      expect(scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
      })
    })
  })

  it('직무 카드의 핵심 역량 태그를 한 줄로 제한하고 넘침을 숨긴다', () => {
    const { getByLabelText } = render(
      <JobSelection
        categories={jobCategories}
        jobs={[{ ...frontendDeveloper, skills: ['React', 'TypeScript', 'CSS', '접근성', '배포'] }]}
        onSelectCategory={() => undefined}
        onSelectJob={() => undefined}
        selectedCategoryId="it"
      />,
    )

    expect(getByLabelText('프론트엔드 개발자 핵심 역량')).toHaveClass(
      'h-[29px]',
      'flex-nowrap',
      'overflow-hidden',
    )
  })
})
