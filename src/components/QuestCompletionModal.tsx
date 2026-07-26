import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { questCompletionAssets } from '../assets/quest-completion'

interface QuestCompletionModalProps {
  onClose: () => void
  onRoadmap: () => void
  open: boolean
  progress: number
  questTitle: string
}

function clampProgress(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function QuestCompletionModal({
  onClose,
  onRoadmap,
  open,
  progress,
  questTitle,
}: QuestCompletionModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    if (!open) return

    const start = 0
    const target = clampProgress(progress)
    setDisplayProgress(start)

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (start === target || prefersReducedMotion) {
      setDisplayProgress(target)
      return
    }

    const requestFrame = window.requestAnimationFrame?.bind(window) ??
      ((callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 16))
    const cancelFrame = window.cancelAnimationFrame?.bind(window) ?? window.clearTimeout.bind(window)
    let frameId = 0
    let startTime: number | undefined
    const animate = (timestamp: number) => {
      startTime ??= timestamp
      const elapsed = Math.min((timestamp - startTime) / 700, 1)
      const eased = 1 - (1 - elapsed) ** 3
      setDisplayProgress(Math.round(start + (target - start) * eased))
      if (elapsed < 1) frameId = requestFrame(animate)
    }

    frameId = requestFrame(animate)
    return () => cancelFrame(frameId)
  }, [open, progress])

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !modalRef.current) return
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLButtonElement>('button:not([disabled])'))
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [onClose, open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        aria-labelledby="quest-completion-title"
        aria-modal="true"
        className="flex w-full max-w-[382px] flex-col items-center gap-[30px] overflow-hidden rounded-[20px] bg-white px-2.5 pb-5 pt-2.5 shadow-[0_20px_80px_rgba(0,0,0,0.28)]"
        ref={modalRef}
        role="dialog"
      >
        <div className="flex w-full flex-col items-center gap-1">
          <div className="flex w-[357px] max-w-full justify-end rounded-[10px] p-1">
            <button
              aria-label="퀘스트 완료 모달 닫기"
              className="flex size-5 items-center justify-center rounded-[6px] hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
              onClick={onClose}
              ref={closeButtonRef}
              type="button"
            >
              <img alt="" aria-hidden="true" className="size-5" src={questCompletionAssets.successClose} />
            </button>
          </div>
          <p className="text-center text-xs font-medium text-black/50">{questTitle}</p>
          <h2 className="text-center text-lg font-semibold" id="quest-completion-title">퀘스트를 완료했어요</h2>

          <div className="relative h-[178px] w-[201.717px]">
            <img
              alt="퀘스트 완료 캐릭터"
              className="absolute left-0 top-[31px] h-[116.213px] w-[201.717px]"
              src={questCompletionAssets.successDecoration}
            />
            <img
              alt=""
              aria-hidden="true"
              className="absolute left-3 top-0 size-[178px] object-cover"
              src={questCompletionAssets.successCharacter}
            />
          </div>

          <div className="flex w-[332px] max-w-full flex-col gap-2">
            <div className="flex items-center justify-between text-sm font-medium tracking-[-0.28px]">
              <span className="text-black/50">신화 진행률</span>
              <span aria-live="polite">{displayProgress}%</span>
            </div>
            <div
              aria-label={`신화 진행률 ${displayProgress}%`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={displayProgress}
              className="h-[14px] overflow-hidden rounded-[5px] bg-[#ededed]"
              role="progressbar"
            >
              <div
                className="h-full rounded-[5px] bg-[#6bd8d5] transition-[width] duration-150 ease-out"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            className="flex h-[50px] w-[163px] items-center justify-center rounded-[14px] bg-[#ebebeb] p-2.5 text-lg font-semibold tracking-[-0.36px] transition-colors hover:bg-[#dfdfdf] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
            onClick={onClose}
            type="button"
          >
            확인
          </button>
          <button
            className="flex h-[50px] w-[163px] items-center justify-center gap-1 rounded-[14px] bg-black p-2.5 text-lg font-semibold tracking-[-0.36px] text-white transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
            onClick={onRoadmap}
            type="button"
          >
            로드맵으로
            <img alt="" aria-hidden="true" className="size-6 -scale-x-100" src={questCompletionAssets.successRoadmapArrow} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
