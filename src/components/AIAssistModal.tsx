import { type CSSProperties, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { questDetailAssets } from '../assets/quest-detail'

export type StarFieldId = 'situation' | 'task' | 'action' | 'result'
export type StarRecord = Record<StarFieldId, string>

interface AIAssistModalProps {
  onApply: (record: StarRecord) => void
  onClose: () => void
  open: boolean
  originalRecord: StarRecord
}

type GenerationStatus = 'generating' | 'revealing' | 'ready'

const enhancedStarRecord: StarRecord = {
  situation:
    'CS 면접 준비를 하면서 네트워크·운영체제·데이터베이스 개념을 각각 공부했지만, 질문에 맞춰 핵심을 구조적으로 설명하는 데 어려움을 느꼈다.',
  task: '자주 출제되는 CS 질문을 주제별로 선별하고, 각 질문에 대해 핵심 개념과 실제 사례를 포함한 답변을 정리하기로 했다.',
  action:
    '네트워크·OS·DB 영역별 질문을 수집한 뒤 답변을 정의·원리·활용 사례 순서로 작성하고, 소리 내어 설명하며 부족한 부분을 보완했다.',
  result:
    '핵심 개념을 짧고 논리적으로 설명할 수 있게 되었고, 부족한 영역을 빠르게 찾아 반복 학습할 수 있는 면접 답변 자료를 완성했다.',
}

const starRows: Array<{
  englishLabel: string
  id: StarFieldId
  koreanLabel: string
  letter: string
}> = [
  { id: 'situation', letter: 'S', koreanLabel: '상황', englishLabel: 'Situation' },
  { id: 'task', letter: 'T', koreanLabel: '과제', englishLabel: 'Task' },
  { id: 'action', letter: 'A', koreanLabel: '행동', englishLabel: 'Action' },
  { id: 'result', letter: 'R', koreanLabel: '결과', englishLabel: 'Result' },
]

function requestAiEnhancement(signal: AbortSignal) {
  return new Promise<StarRecord>((resolve, reject) => {
    const timerId = window.setTimeout(() => resolve(enhancedStarRecord), 4_000)

    const abort = () => {
      window.clearTimeout(timerId)
      reject(new DOMException('AI enhancement request aborted', 'AbortError'))
    }

    if (signal.aborted) {
      abort()
      return
    }

    signal.addEventListener('abort', abort, { once: true })
  })
}

export function AIAssistModal({ onApply, onClose, open, originalRecord }: AIAssistModalProps) {
  const [enhancedRecord, setEnhancedRecord] = useState<StarRecord | null>(null)
  const [status, setStatus] = useState<GenerationStatus>('generating')
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const controller = new AbortController()
    let readyTimerId: number | undefined
    setEnhancedRecord(null)
    setStatus('generating')

    requestAiEnhancement(controller.signal)
      .then((record) => {
        if (controller.signal.aborted) return

        setEnhancedRecord(record)
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setStatus('ready')
          return
        }

        setStatus('revealing')
        readyTimerId = window.setTimeout(() => setStatus('ready'), 1_500)
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('AI enhancement failed', error)
        }
      })

    return () => {
      controller.abort()
      if (readyTimerId !== undefined) window.clearTimeout(readyTimerId)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !modalRef.current) return

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusableElements.length === 0) return

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]
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

  const canApply = status === 'ready' && enhancedRecord !== null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        aria-labelledby="ai-assist-title"
        aria-modal="true"
        className="flex h-[646px] w-full max-w-[1216px] flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_20px_80px_rgba(0,0,0,0.28)]"
        ref={modalRef}
        role="dialog"
        style={{ maxHeight: 'calc(100vh - 48px)' }}
      >
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-[#eeeeee] px-8">
          <div className="flex items-center gap-2.5">
            <img alt="" aria-hidden="true" className="size-[22px]" src={questDetailAssets.aiModalHeader} />
            <h2 className="text-xl font-semibold tracking-[-0.4px]" id="ai-assist-title">
              AI로 강화하기
            </h2>
          </div>
          <button
            aria-label="AI 강화 모달 닫기"
            className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9954ff]"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <img alt="" aria-hidden="true" className="size-4" src={questDetailAssets.aiModalClose} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto">
          <div className="min-w-[820px]">
            <div className="grid h-10 grid-cols-[94px_minmax(0,1fr)_46px_minmax(0,1fr)] items-center bg-[#f8f8f8] px-8 text-center text-[13px] font-semibold tracking-[-0.26px] text-black/55">
              <span aria-hidden="true" />
              <span>직접 쓴 글</span>
              <span aria-hidden="true" />
              <span>AI로 보완한 글</span>
            </div>

            <div className="flex flex-col gap-3 px-8 py-4">
              {starRows.map((row, rowIndex) => (
                <div
                  className="grid min-h-[88px] grid-cols-[94px_minmax(0,1fr)_46px_minmax(0,1fr)] items-stretch"
                  key={row.id}
                >
                <div className="flex items-center gap-2.5 pr-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#efe6ff] text-sm font-bold text-[#9954ff]">
                    {row.letter}
                  </span>
                  <span className="text-[12px] font-semibold leading-[1.35] tracking-[-0.24px]">
                    {row.koreanLabel}
                    <small className="block text-[10px] font-medium text-black/40">({row.englishLabel})</small>
                  </span>
                </div>

                <div className="flex items-center rounded-[10px] border border-[#e8e8e8] bg-[#fafafa] px-4 py-3 text-[12px] font-medium leading-[1.55] tracking-[-0.12px] text-black/65">
                  {originalRecord[row.id]}
                </div>

                <div className="flex items-center justify-center">
                  <img alt="" aria-hidden="true" className="w-[18px]" src={questDetailAssets.aiModalArrow} />
                </div>

                <div
                  aria-live={rowIndex === 0 ? 'polite' : undefined}
                  className="ai-result-loading relative flex min-w-0 items-center overflow-hidden rounded-[10px] border border-[#dbc3ff] bg-[#faf7ff] px-4 py-3 text-[12px] font-medium leading-[1.55] tracking-[-0.12px]"
                >
                  <span className="absolute right-3 top-2 rounded-full bg-[#eee3ff] px-2 py-0.5 text-[9px] font-semibold text-[#8d45f5]">
                    AI 보완
                  </span>
                  {status === 'generating' || !enhancedRecord ? (
                    <GeneratingResult />
                  ) : (
                    <p className="min-w-0 pr-12 pt-3">
                      <AnimatedText rowIndex={rowIndex} text={enhancedRecord[row.id]} />
                    </p>
                  )}
                </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex h-[82px] shrink-0 items-center justify-end gap-2.5 border-t border-[#eeeeee] px-8">
          <button
            className="rounded-[10px] border border-[#dedede] bg-white px-6 py-3 text-sm font-medium tracking-[-0.28px] transition-colors hover:bg-[#f8f8f8]"
            onClick={onClose}
            type="button"
          >
            취소
          </button>
          <button
            className="flex items-center gap-2 rounded-[10px] bg-[#9954ff] px-6 py-3 text-sm font-semibold tracking-[-0.28px] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
            disabled={!canApply}
            onClick={() => {
              if (enhancedRecord) onApply(enhancedRecord)
            }}
            type="button"
          >
            <img alt="" aria-hidden="true" className="size-4" src={questDetailAssets.aiModalApply} />
            AI 보완 내용으로 적용하기
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}

function GeneratingResult() {
  return (
    <div aria-label="AI 보완 내용을 생성하고 있습니다" className="w-full pr-12 pt-3" role="status">
      <span className="sr-only">AI 보완 내용을 생성하고 있습니다.</span>
      <div aria-hidden="true" className="flex flex-col gap-2">
        <span className="ai-skeleton-line w-full" />
        <span className="ai-skeleton-line w-[88%]" />
        <span className="ai-skeleton-line w-[62%]" />
      </div>
      <div aria-hidden="true" className="absolute inset-0">
        {Array.from({ length: 8 }, (_, index) => (
          <span className={`ai-particle ai-particle-${index + 1}`} key={index} />
        ))}
      </div>
    </div>
  )
}

function AnimatedText({ rowIndex, text }: { rowIndex: number; text: string }) {
  return text.split(' ').map((word, wordIndex) => {
    const style = {
      '--ai-word-delay': `${rowIndex * 180 + wordIndex * 24}ms`,
    } as CSSProperties

    return (
      <span className="ai-word-reveal" key={`${word}-${wordIndex}`} style={style}>
        {word}
        {wordIndex < text.split(' ').length - 1 ? '\u00a0' : ''}
      </span>
    )
  })
}
