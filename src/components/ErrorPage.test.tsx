import { fireEvent, render, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorPage } from './ErrorPage'
import { Sidebar } from './Sidebar'

describe('ErrorPage', () => {
  it('Figma의 네트워크 오류 안내와 사이드바 이동 동작을 렌더링한다', () => {
    const onHome = vi.fn()
    const onLogin = vi.fn()
    const { getByRole } = render(
      <ErrorPage
        onHome={onHome}
        sidebar={
          <Sidebar
            onHome={onHome}
            onLogin={onLogin}
            variant="unauthenticated"
          />
        }
      />,
    )

    expect(getByRole('heading', { name: '오류가 발생했어요...' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: '홈으로 돌아가기' }))

    fireEvent.click(getByRole('button', { name: 'MYITH 홈으로 이동' }))
    fireEvent.click(getByRole('button', { name: '신화 허브로 이동' }))
    fireEvent.click(getByRole('button', { name: '로그인' }))

    expect(onHome).toHaveBeenCalledTimes(3)
    expect(onLogin).toHaveBeenCalledOnce()
  })

  it('공통 사이드바에 전달된 캐릭터 목록과 선택 동작을 유지한다', () => {
    const onSelectCharacter = vi.fn()
    const { getByRole, getByText } = render(
      <ErrorPage
        onHome={() => undefined}
        sidebar={
          <Sidebar
            characters={[
              {
                id: 'rmp_42',
                stage: 2,
                role: '프론트엔드 개발자',
                title: '테스트 캐릭터',
              },
            ]}
            onHome={() => undefined}
            onSelectCharacter={onSelectCharacter}
            profile={{ name: '테스트 사용자' }}
          />
        }
      />,
    )

    expect(getByText('테스트 캐릭터')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: '테스트 캐릭터 아카이브 열기' }))
    expect(onSelectCharacter).toHaveBeenCalledWith('rmp_42')
  })

  it('페이지가 길어져도 계정 영역이 보이도록 사이드바를 화면 높이에 고정한다', () => {
    const { container } = render(
      <Sidebar
        onHome={() => undefined}
        profile={{ name: '테스트 사용자' }}
      />,
    )

    expect(container.querySelector('aside')).toHaveClass(
      'sticky',
      'top-0',
      'h-screen',
      'overflow-hidden',
    )
    expect(within(container).getByRole('button', { name: '테스트 사용자 프로필 메뉴' }).parentElement).toHaveClass(
      'shrink-0',
      'bg-white',
    )
  })
})
