import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { GoogleLoginPage } from './GoogleLoginPage'

const { loginMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
}))

vi.mock('./useAuth', () => ({
  useAuth: () => ({
    login: loginMock,
    user: null,
  }),
}))

vi.mock('../api/config', () => ({
  apiConfig: {
    googleClientId: '',
    useMocks: true,
  },
}))

afterEach(cleanup)

beforeEach(() => {
  loginMock.mockReset()
})

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.pathname}</output>
}

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <GoogleLoginPage />
      <LocationProbe />
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

  it('캐릭터가 있는 사용자는 로그인 후 기존 목적지로 이동한다', async () => {
    loginMock.mockResolvedValue({ hasCharacters: true, isNewUser: false })
    renderLoginPage()

    fireEvent.click(screen.getByRole('button', { name: '소옹어 egg 선택' }))
    fireEvent.click(screen.getByRole('button', { name: 'Google로 계속하기' }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
    })
  })

  it('캐릭터가 없는 사용자는 로그인 후 새 캐릭터 생성으로 이동한다', async () => {
    loginMock.mockResolvedValue({ hasCharacters: false, isNewUser: false })
    renderLoginPage()

    fireEvent.click(screen.getByRole('button', { name: '소옹어 egg 선택' }))
    fireEvent.click(screen.getByRole('button', { name: 'Google로 계속하기' }))

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/characters/new/egg')
    })
  })
})
