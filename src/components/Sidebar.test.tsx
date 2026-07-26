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
