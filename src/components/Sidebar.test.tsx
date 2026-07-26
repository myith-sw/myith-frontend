import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Sidebar } from './Sidebar'

afterEach(cleanup)

describe('Sidebar character spacing', () => {
  it('reduces the empty character section gap before the new character action', () => {
    render(<Sidebar characters={[]} onCreateCharacter={() => undefined} />)

    expect(screen.getByLabelText('내 캐릭터')).toHaveClass('pb-[6px]', 'pt-[10px]')
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('keeps the existing character list spacing when characters are present', () => {
    render(<Sidebar onCreateCharacter={() => undefined} />)

    expect(screen.getByLabelText('내 캐릭터')).toHaveClass('py-[10px]')
    expect(screen.getByRole('list')).toBeInTheDocument()
  })

  it('uses the full Figma ink color for the active myth hub menu', () => {
    render(<Sidebar isHomeActive onHome={() => undefined} />)

    expect(screen.getByRole('button', { name: '신화 허브로 이동' })).toHaveClass(
      'text-[#0f0e00]',
      'opacity-100',
    )
  })

  it('uses the updated Figma typography for character list entries', () => {
    render(<Sidebar onCreateCharacter={() => undefined} />)

    const characterName = screen.getByText('견습 서버 개발자')
    const characterRole = screen.getByText('백엔드 개발자')

    expect(characterName).toHaveClass('text-[15px]', 'font-semibold')
    expect(characterRole).toHaveClass('text-xs', 'tracking-[0.48px]', 'font-semibold')
  })

  it('uses the larger Figma profile logout popup metrics', () => {
    render(<Sidebar profile={{ email: 'tester@myith.test', name: '테스터' }} />)

    fireEvent.click(screen.getByRole('button', { name: '테스터 프로필 메뉴' }))

    const email = screen.getByText('tester@myith.test')
    const menu = email.parentElement
    const logout = screen.getByRole('button', { name: '로그아웃' })

    expect(menu).toHaveClass('w-[226px]', 'px-[5px]', 'py-2', 'gap-2.5')
    expect(email).toHaveClass('text-xs', 'tracking-[-0.24px]')
    expect(logout).toHaveClass('h-[25px]', 'text-[13px]', 'tracking-[-0.26px]')
    expect(logout.querySelector('img')).toHaveClass('h-[11.556px]', 'w-[13px]')
  })
})
