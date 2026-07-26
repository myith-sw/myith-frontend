import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CompetencyRadar } from './CompetencyRadar'

function axes(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    key: `axis-${index}`,
    label: `역량 ${index + 1}`,
    value: index * 20,
  }))
}

describe('CompetencyRadar', () => {
  it.each([4, 7])('%i개 역량 축을 서버 응답 수대로 렌더링한다', (count) => {
    const { getByRole, unmount } = render(<CompetencyRadar axes={axes(count)} />)

    expect(getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringContaining(`${count}개 역량으로 구성된 다각형`),
    )
    axes(count).forEach((axis) => expect(screen.getByText(axis.label)).toBeInTheDocument())
    unmount()
  })
})
