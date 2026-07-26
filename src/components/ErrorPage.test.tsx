import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorPage } from './ErrorPage'

describe('ErrorPage', () => {
  it('Figma의 네트워크 오류 안내와 사이드바 이동 동작을 렌더링한다', () => {
    const onHome = vi.fn()
    const onLogin = vi.fn()
    const { getByRole, getByText } = render(
      <ErrorPage onHome={onHome} onLogin={onLogin} />,
    )

    expect(getByRole('heading', { name: '오류가 발생했어요...' })).toBeInTheDocument()
    expect(getByText('네트워크를 확인 후 새로고침해주세요')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: 'MYITH 홈으로 이동' }))
    fireEvent.click(getByRole('button', { name: '신화 허브로 이동' }))
    fireEvent.click(getByRole('button', { name: '로그인' }))

    expect(onHome).toHaveBeenCalledTimes(2)
    expect(onLogin).toHaveBeenCalledOnce()
  })
})
