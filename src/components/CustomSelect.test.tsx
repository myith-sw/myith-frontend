import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CustomSelect } from './CustomSelect'

afterEach(cleanup)

describe('CustomSelect', () => {
  it('선택값을 표시하고 클릭한 옵션을 전달한다', () => {
    const onChange = vi.fn()

    render(
      <CustomSelect
        ariaLabel="역량 분류"
        onChange={onChange}
        options={[
          { label: '프로그래밍 기초', value: 'programming' },
          { label: '웹 개발 입문', value: 'web' },
        ]}
        value="programming"
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '역량 분류: 프로그래밍 기초' }))
    expect(screen.getByRole('listbox', { name: '역량 분류' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '프로그래밍 기초' })).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(screen.getByRole('option', { name: '웹 개발 입문' }))
    expect(onChange).toHaveBeenCalledWith('web')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('방향키로 옵션을 탐색하고 Escape로 닫는다', () => {
    render(
      <CustomSelect
        ariaLabel="퀘스트 레벨"
        onChange={vi.fn()}
        options={[
          { label: '레벨 1', value: 1 },
          { label: '레벨 2', value: 2 },
          { label: '레벨 3', value: 3 },
        ]}
        value={1}
      />,
    )

    const trigger = screen.getByRole('button', { name: '퀘스트 레벨: 레벨 1' })
    fireEvent.click(trigger)

    const firstOption = screen.getByRole('option', { name: '레벨 1' })
    const secondOption = screen.getByRole('option', { name: '레벨 2' })
    fireEvent.keyDown(firstOption, { key: 'ArrowDown' })
    expect(secondOption).toHaveFocus()

    fireEvent.keyDown(secondOption, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
