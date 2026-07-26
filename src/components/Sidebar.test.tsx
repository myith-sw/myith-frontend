import { cleanup, render, screen } from '@testing-library/react'
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
})
