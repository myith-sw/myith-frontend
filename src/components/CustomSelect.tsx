import { useEffect, useId, useRef, useState } from 'react'
import { roadmapAssets } from '../assets/roadmap'

export interface CustomSelectOption<T extends string | number> {
  label: string
  value: T
}

interface CustomSelectProps<T extends string | number> {
  ariaLabel: string
  className?: string
  onChange: (value: T) => void
  options: CustomSelectOption<T>[]
  value: T
}

export function CustomSelect<T extends string | number>({
  ariaLabel,
  className = '',
  onChange,
  options,
  value,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const listboxId = useId()
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  )
  const selectedOption = options[selectedIndex]

  const focusOption = (index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), options.length - 1)
    setActiveIndex(nextIndex)
    optionRefs.current[nextIndex]?.focus()
  }

  const openDropdown = () => {
    if (options.length === 0) return
    setActiveIndex(selectedIndex)
    setIsOpen(true)
  }

  const closeDropdown = (restoreFocus = false) => {
    setIsOpen(false)
    if (restoreFocus) {
      triggerRef.current?.focus()
    }
  }

  const selectOption = (option: CustomSelectOption<T>) => {
    onChange(option.value)
    closeDropdown(true)
  }

  useEffect(() => {
    if (!isOpen) return

    const frameId = requestAnimationFrame(() => {
      optionRefs.current[activeIndex]?.focus()
    })
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeDropdown()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      cancelAnimationFrame(frameId)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [activeIndex, isOpen])

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        aria-controls={isOpen ? listboxId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`${ariaLabel}: ${selectedOption?.label ?? '선택 안 됨'}`}
        className="flex h-10 w-full items-center justify-between rounded-[10px] bg-[#f8f8f8] px-[14px] text-left text-base font-medium tracking-[-0.32px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3] disabled:cursor-default disabled:opacity-50"
        disabled={options.length === 0}
        onClick={() => {
          if (isOpen) {
            closeDropdown()
          } else {
            openDropdown()
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            openDropdown()
          }
        }}
        ref={triggerRef}
        type="button"
      >
        <span className="truncate">{selectedOption?.label ?? '선택'}</span>
        <img
          alt=""
          aria-hidden="true"
          className="ml-3 h-[5px] w-[11.5px] shrink-0"
          height={5}
          src={roadmapAssets.selectChevron}
          width={11.5}
        />
      </button>

      {isOpen && (
        <div
          aria-label={ariaLabel}
          className="absolute top-[42px] left-0 z-50 w-full overflow-hidden rounded-[10px] bg-white py-2.5 shadow-[0_0_10px_rgba(0,0,0,0.15)]"
          id={listboxId}
          role="listbox"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            const isActive = activeIndex === index

            return (
              <button
                aria-selected={isSelected}
                className={`flex h-[39px] w-full items-center px-[14px] text-left text-[15px] font-medium tracking-[-0.3px] text-black/90 outline-none ${
                  isSelected || isActive ? 'bg-[#e9f9f8]' : 'bg-white hover:bg-[#e9f9f8]'
                }`}
                key={option.value}
                onClick={() => selectOption(option)}
                onFocus={() => setActiveIndex(index)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowDown') {
                    event.preventDefault()
                    focusOption((index + 1) % options.length)
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault()
                    focusOption((index - 1 + options.length) % options.length)
                  } else if (event.key === 'Home') {
                    event.preventDefault()
                    focusOption(0)
                  } else if (event.key === 'End') {
                    event.preventDefault()
                    focusOption(options.length - 1)
                  } else if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    selectOption(option)
                  } else if (event.key === 'Escape') {
                    event.preventDefault()
                    closeDropdown(true)
                  } else if (event.key === 'Tab') {
                    closeDropdown()
                  }
                }}
                ref={(node) => {
                  optionRefs.current[index] = node
                }}
                role="option"
                tabIndex={-1}
                type="button"
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
