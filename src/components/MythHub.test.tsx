import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mythCharacters } from '../data/home'
import { MythHub } from './MythHub'

const character = mythCharacters[0]

afterEach(cleanup)

function renderHub() {
  const onOpenRoadmap = vi.fn()
  const onOpenQuest = vi.fn()

  render(
    <MythHub
      characters={[character]}
      onCreateCharacter={vi.fn()}
      onDeleteCharacter={vi.fn()}
      onOpenArchive={vi.fn()}
      onOpenQuest={onOpenQuest}
      onOpenRoadmap={onOpenRoadmap}
    />,
  )

  return { onOpenQuest, onOpenRoadmap }
}

describe('MythHub card navigation', () => {
  it('opens the same roadmap when the card body is clicked', () => {
    const { onOpenRoadmap } = renderHub()

    fireEvent.click(screen.getByTestId(`myth-card-${character.id}`))

    expect(onOpenRoadmap).toHaveBeenCalledWith(character.id)
  })

  it('does not open the roadmap when the next quest button is clicked', () => {
    const { onOpenQuest, onOpenRoadmap } = renderHub()

    fireEvent.click(screen.getByRole('button', { name: character.nextQuest }))

    expect(onOpenQuest).toHaveBeenCalledWith(character)
    expect(onOpenRoadmap).not.toHaveBeenCalled()
  })
})
