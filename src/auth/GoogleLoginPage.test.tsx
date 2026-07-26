import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { GoogleLoginPage } from './GoogleLoginPage'

vi.mock('./useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    user: null,
  }),
}))

afterEach(cleanup)

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <GoogleLoginPage />
    </MemoryRouter>,
  )
}

describe('GoogleLoginPage', () => {
  it('로그인이 필요한 egg 선택을 누르면 로그인 모달을 연다', () => {
    renderLoginPage()

    const eggButton = screen.getByRole('button', { name: '소옹어 egg 선택' })
    expect(eggButton).toBeEnabled()

    fireEvent.click(eggButton)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('MYiTH 로그인')).toBeInTheDocument()
  })

  it('사이드바의 보호된 동작도 같은 로그인 모달을 연다', () => {
    renderLoginPage()

    const actions = [
      screen.getByRole('button', { name: 'MYITH 홈으로 이동' }),
      screen.getByRole('button', { name: '신화 허브로 이동' }),
      screen.getByRole('button', { name: '새 캐릭터' }),
    ]

    actions.forEach((action) => expect(action).toBeEnabled())

    fireEvent.click(actions[2])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
