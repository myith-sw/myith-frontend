import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import roadmapGenerationImage from '../assets/loading/roadmap-generation.png'

interface RoadmapGenerationLoadingModalProps {
  open: boolean
}

export function RoadmapGenerationLoadingModal({ open }: RoadmapGenerationLoadingModalProps) {
  useEffect(() => {
    if (!open) return

    const root = document.getElementById('root')
    const previousBodyOverflow = document.body.style.overflow
    const rootWasInert = root?.hasAttribute('inert') ?? false

    document.body.style.overflow = 'hidden'
    root?.setAttribute('inert', '')

    return () => {
      document.body.style.overflow = previousBodyOverflow
      if (!rootWasInert) root?.removeAttribute('inert')
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      aria-busy="true"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-6"
    >
      <div
        aria-label="로드맵 생성 로딩 중"
        aria-live="polite"
        className="flex w-full max-w-[382px] flex-col items-center gap-2.5 rounded-[20px] bg-white px-2.5 py-[30px]"
        role="status"
      >
        <p className="text-center text-[18px] font-semibold leading-normal">로딩 중..</p>
        <img
          alt=""
          aria-hidden="true"
          className="size-[178px] object-cover"
          src={roadmapGenerationImage}
        />
      </div>
    </div>,
    document.body,
  )
}
