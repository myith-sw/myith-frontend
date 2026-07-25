import { useRef, useState } from 'react'
import { assessmentAssets } from '../assets/assessment'
import type { ProjectExperience } from '../data/onboarding'

const descriptionPlaceholder =
  '예) OO 프로젝트에서 OO 역할을 맡아 진행했습니다. 진행 중 OO한 어려움을 겪었고, OO 방식으로 해결했습니다.'

function isWebUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

interface ProjectExperienceCardProps {
  canRemove: boolean
  experience: ProjectExperience
  index: number
  onChange: (changes: Partial<Omit<ProjectExperience, 'id'>>) => void
  onRemove: () => void
}

export function ProjectExperienceCard({
  canRemove,
  experience,
  index,
  onChange,
  onRemove,
}: ProjectExperienceCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileError, setFileError] = useState('')
  const [linkError, setLinkError] = useState('')
  const [isEditingLink, setIsEditingLink] = useState(!isWebUrl(experience.link))
  const fileInputId = `project-file-${experience.id}`
  const linkInputId = `project-link-${experience.id}`

  const removeFile = () => {
    onChange({ file: null })
    setFileError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const commitLink = () => {
    const normalizedLink = experience.link.trim()
    onChange({ link: normalizedLink })

    if (!normalizedLink) {
      setLinkError('')
      setIsEditingLink(true)
      return
    }

    if (!isWebUrl(normalizedLink)) {
      setLinkError('http:// 또는 https://로 시작하는 주소를 입력해주세요.')
      setIsEditingLink(true)
      return
    }

    setLinkError('')
    setIsEditingLink(false)
  }

  return (
    <article
      aria-labelledby={`project-experience-title-${experience.id}`}
      className="relative flex w-full flex-col gap-[14px] rounded-[20px] bg-[#f7f7f7] p-5"
    >
      {canRemove && (
        <button
          aria-label={`${index + 1}번째 프로젝트 경험 삭제`}
          className="absolute top-5 right-5 flex size-[22px] items-center justify-center rounded-full transition-colors hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
          onClick={onRemove}
          type="button"
        >
          <img alt="" aria-hidden="true" className="size-[11.5px]" src={assessmentAssets.projectRemove} />
        </button>
      )}

      <div className="flex flex-col gap-2.5 pr-8">
        <h2
          className="text-base font-semibold tracking-[-0.48px]"
          id={`project-experience-title-${experience.id}`}
        >
          지금까지 수행한 프로젝트 경험을 소개하고, 진행 과정에서 겪었던 어려움과 그것을 어떻게 해결했는지
          구체적으로 서술해 주세요.
        </h2>
        <p className="text-sm tracking-[-0.42px] opacity-50">
          ※ 포트폴리오, 레포지토리 링크 또는 PDF 자료가 있다면 함께 첨부해 주세요.
        </p>
      </div>

      <label className="sr-only" htmlFor={`project-description-${experience.id}`}>
        {index + 1}번째 프로젝트 경험
      </label>
      <textarea
        className="h-[65px] w-full resize-none rounded-[10px] bg-white px-[15px] py-2.5 text-base font-medium leading-[22px] tracking-[-0.48px] outline-none placeholder:text-black/40 focus:ring-2 focus:ring-[#7dcecb]/30"
        id={`project-description-${experience.id}`}
        maxLength={2000}
        onChange={(event) => onChange({ description: event.target.value })}
        placeholder={descriptionPlaceholder}
        value={experience.description}
      />

      <div className="flex flex-col gap-[7.5px]">
        <div className="flex min-h-10 w-full items-center overflow-hidden rounded-[10px] bg-white">
          <span
            className={`flex h-10 w-[70px] shrink-0 items-center justify-center text-base font-semibold tracking-[-0.48px] text-white ${
              experience.file ? 'bg-[#7dcecb]' : 'bg-[#e2e2e2]'
            }`}
          >
            자료
          </span>
          <input
            accept=".pdf,application/pdf"
            aria-label={`${index + 1}번째 프로젝트 PDF 첨부`}
            className="sr-only"
            id={fileInputId}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              if (!file) return

              const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
              if (!isPdf) {
                setFileError('PDF 파일만 첨부할 수 있어요.')
                event.target.value = ''
                return
              }

              setFileError('')
              onChange({ file })
            }}
            ref={fileInputRef}
            type="file"
          />
          {experience.file ? (
            <div className="ml-2.5 flex min-w-0 items-center gap-2.5 rounded-[10px] bg-[#f1f1f1] px-2.5 py-[5px]">
              <span className="truncate text-[15px] font-semibold tracking-[-0.45px]">{experience.file.name}</span>
              <button
                aria-label={`${experience.file.name} 첨부 삭제`}
                className="flex size-[11.5px] shrink-0 items-center justify-center"
                onClick={removeFile}
                type="button"
              >
                <img alt="" aria-hidden="true" className="size-[11.5px]" src={assessmentAssets.projectRemove} />
              </button>
            </div>
          ) : (
            <label
              className="ml-[5px] cursor-pointer px-2.5 py-2 text-base font-semibold tracking-[-0.48px] text-[#7dcecb] underline underline-offset-2 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#60d4d3]"
              htmlFor={fileInputId}
            >
              파일 첨부하기
            </label>
          )}
        </div>
        {fileError && (
          <p className="pl-[75px] text-xs font-medium text-[#d65454]" role="alert">
            {fileError}
          </p>
        )}

        <div className="flex min-h-10 w-full items-center overflow-hidden rounded-[10px] bg-white">
          <span
            className={`flex h-10 w-[70px] shrink-0 items-center justify-center text-base font-semibold tracking-[-0.48px] text-white ${
              !isEditingLink && experience.link ? 'bg-[#7dcecb]' : 'bg-[#e2e2e2]'
            }`}
          >
            링크
          </span>
          {!isEditingLink && experience.link ? (
            <div className="ml-2.5 flex min-w-0 items-center gap-2.5 rounded-[10px] bg-[#f1f1f1] px-2.5 py-[5px]">
              <a
                className="truncate text-[15px] font-semibold tracking-[-0.45px] underline underline-offset-2"
                href={experience.link}
                rel="noreferrer"
                target="_blank"
              >
                {experience.link}
              </a>
              <button
                aria-label={`${experience.link} 링크 삭제`}
                className="flex size-[11.5px] shrink-0 items-center justify-center"
                onClick={() => {
                  onChange({ link: '' })
                  setLinkError('')
                  setIsEditingLink(true)
                }}
                type="button"
              >
                <img alt="" aria-hidden="true" className="size-[11.5px]" src={assessmentAssets.projectRemove} />
              </button>
            </div>
          ) : (
            <>
              <label className="sr-only" htmlFor={linkInputId}>
                {index + 1}번째 프로젝트 링크
              </label>
              <input
                aria-describedby={linkError ? `${linkInputId}-error` : undefined}
                aria-invalid={Boolean(linkError)}
                className="h-10 min-w-0 flex-1 bg-transparent px-[15px] text-[15px] font-medium tracking-[-0.45px] outline-none placeholder:text-black/30"
                id={linkInputId}
                onBlur={commitLink}
                onChange={(event) => {
                  onChange({ link: event.target.value })
                  setLinkError('')
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return
                  event.preventDefault()
                  commitLink()
                }}
                placeholder="https://"
                type="url"
                value={experience.link}
              />
            </>
          )}
        </div>
        {linkError && (
          <p className="pl-[75px] text-xs font-medium text-[#d65454]" id={`${linkInputId}-error`} role="alert">
            {linkError}
          </p>
        )}
      </div>
    </article>
  )
}
