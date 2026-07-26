import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EggSelectionHome } from './EggSelectionHome'

describe('EggSelectionHome', () => {
  it('전달된 캐릭터 후보를 표시하고 원본 이미지 드래그를 차단한다', () => {
    const onSelectEgg = vi.fn()
    const { getByRole } = render(
      <EggSelectionHome
        eggOptions={[
          { alt: '빠르타쪼 egg', asset: '/ppareutazzo-1.png', id: 'ppareutazzo' },
          { alt: '풍장군 egg', asset: '/pungjanggun-1.png', id: 'pungjanggun' },
        ]}
        onContinue={() => undefined}
        onSelectEgg={onSelectEgg}
        selectedEggId={null}
      />,
    )

    const firstOption = getByRole('button', { name: '빠르타쪼 egg 선택' })
    const firstImage = firstOption.querySelector('img[src="/ppareutazzo-1.png"]')

    expect(firstImage).toHaveAttribute('draggable', 'false')
    fireEvent.click(getByRole('button', { name: '풍장군 egg 선택' }))
    expect(onSelectEgg).toHaveBeenCalledWith('pungjanggun')
  })
})
