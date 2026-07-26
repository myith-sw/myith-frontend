import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorPage } from './ErrorPage'
import { Sidebar } from './Sidebar'

describe('ErrorPage', () => {
  it('Figma의 네트워크 오류 안내와 사이드바 이동 동작을 렌더링한다', () => {
    const onHome = vi.fn()
    const onLogin = vi.fn()
    const { getByRole, getByText } = render(
      <ErrorPage
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
    expect(getByText('네트워크를 확인 후 새로고침해주세요')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'MYITH 홈으로 이동' }))
    fireEvent.click(getByRole('button', { name: '신화 허브로 이동' }))
    fireEvent.click(getByRole('button', { name: '로그인' }))

    expect(onHome).toHaveBeenCalledTimes(2)
    expect(onLogin).toHaveBeenCalledOnce()
  })

  it('공통 사이드바에 전달된 캐릭터 목록과 선택 동작을 유지한다', () => {
    const onSelectCharacter = vi.fn()
    const { getByRole, getByText } = render(
      <ErrorPage
        sidebar={
          <Sidebar
            characters={[
              {
                id: 'rmp_42',
                level: 2,
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
})
