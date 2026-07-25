import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorPage } from './ErrorPage'

describe('ErrorPage', () => {
  it('Figma의 네트워크 오류 안내와 로그인 동작을 렌더링한다', () => {
    const onLogin = vi.fn()
    const { getByRole, getByText } = render(<ErrorPage onLogin={onLogin} />)

    expect(getByRole('heading', { name: '오류가 발생했어요...' })).toBeInTheDocument()
    expect(getByText('네트워크를 확인 후 새로고침해주세요')).toBeInTheDocument()

    fireEvent.click(getByRole('button', { name: '로그인' }))
    expect(onLogin).toHaveBeenCalledOnce()
  })
})
