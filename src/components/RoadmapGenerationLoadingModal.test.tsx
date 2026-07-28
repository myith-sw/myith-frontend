import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { RoadmapGenerationLoadingModal } from './RoadmapGenerationLoadingModal'

afterEach(() => {
  cleanup()
  document.getElementById('root')?.remove()
})

describe('RoadmapGenerationLoadingModal', () => {
  it('로드맵 생성 중에는 화면을 덮고 배경 조작과 스크롤을 막는다', () => {
    const root = document.createElement('div')
    root.id = 'root'
    document.body.append(root)
    const initialOverflow = document.body.style.overflow
    const { rerender } = render(<RoadmapGenerationLoadingModal open />)

    expect(screen.getByRole('status', { name: '로드맵 생성 로딩 중' })).toHaveTextContent('로딩 중..')
    expect(document.body.style.overflow).toBe('hidden')
    expect(root).toHaveAttribute('inert')

    rerender(<RoadmapGenerationLoadingModal open={false} />)

    expect(screen.queryByRole('status', { name: '로드맵 생성 로딩 중' })).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe(initialOverflow)
    expect(root).not.toHaveAttribute('inert')
  })
})
