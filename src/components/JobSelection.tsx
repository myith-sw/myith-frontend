import { useEffect, useRef } from 'react'
import { homeAssets } from '../assets/home'
import type { CategoryId, JobCategory, JobOption } from '../data/onboarding'
import { CategoryIcon } from './CategoryIcon'
import { ComingSoonCard } from './ComingSoonCard'
import { JobCard } from './JobCard'

interface JobSelectionProps {
  categories: JobCategory[]
  nickname?: string
  onContinue?: () => void
  onNicknameChange?: (nickname: string) => void
  selectedCategoryId: CategoryId
  selectedJob?: JobOption | null
  jobs: JobOption[]
  onSelectCategory: (categoryId: CategoryId) => void
  onSelectJob: (job: JobOption) => void
}

export function JobSelection({
  categories,
  nickname = '',
  onContinue,
  onNicknameChange,
  selectedCategoryId,
  selectedJob,
  jobs,
  onSelectCategory,
  onSelectJob,
}: JobSelectionProps) {
  const nicknameSectionRef = useRef<HTMLFormElement>(null)
  const availableJobs = jobs.filter(
    (job) => job.categoryId === selectedCategoryId && job.available !== false,
  )
  const canContinue = nickname.trim().length > 0

  useEffect(() => {
    if (!selectedJob) return

    const frame = window.requestAnimationFrame(() => {
      nicknameSectionRef.current?.scrollIntoView?.({
        behavior: 'smooth',
        block: 'center',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [selectedJob])

  return (
    <section className="w-full pb-32" aria-labelledby="new-character-title">
      <header className="flex flex-col gap-[10px]">
        <h1 id="new-character-title" className="text-[22px] leading-[26px] font-semibold tracking-[-0.66px]">
          새 캐릭터 만들기
        </h1>
        <p className="text-sm font-normal tracking-[-0.28px] opacity-50">
          분야를 고르고, 도전할 직무를 선택하세요.
        </p>
      </header>

      <div className="mt-[30px] flex flex-wrap gap-[6px]" aria-label="직무 분야">
        {categories.map((category) => {
          const isActive = selectedCategoryId === category.id

          return (
            <button
              aria-pressed={isActive}
              className={`flex h-[37px] items-center gap-2 rounded-[10px] px-4 text-sm tracking-[-0.28px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3] ${
                isActive
                  ? 'bg-[#7dcecb] font-semibold text-white'
                  : 'bg-[#f2f2f2] font-medium text-[#717171]'
              }`}
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              type="button"
            >
              <CategoryIcon active={isActive} src={category.icon} />
              {category.label}
            </button>
          )
        })}
      </div>

      <div className="mt-[23px] grid grid-cols-1 items-stretch gap-[10px] min-[1200px]:grid-cols-2">
        {availableJobs.map((job) => (
          <JobCard
            isSelected={selectedJob?.id === job.id}
            job={job}
            key={job.id}
            onClick={() => onSelectJob(job)}
          />
        ))}
        <ComingSoonCard />
      </div>

      {selectedJob && (
        <form
          className="mt-[23px] rounded-[20px] bg-[#f4f4f4] p-5"
          onSubmit={(event) => {
            event.preventDefault()
            if (canContinue) onContinue?.()
          }}
          ref={nicknameSectionRef}
        >
          <label
            className="flex flex-col gap-2 text-[13px] font-medium tracking-[-0.26px] opacity-50"
            htmlFor="character-nickname"
          >
            캐릭터 닉네임
          </label>
          <div className="mt-2 flex gap-2">
            <input
              className="h-10 flex-1 rounded-[10px] border border-[#7dcecb] bg-white px-[10px] text-sm font-medium outline-none placeholder:text-black/50 focus:ring-2 focus:ring-[#7dcecb]/30"
              id="character-nickname"
              maxLength={20}
              onChange={(event) => onNicknameChange?.(event.target.value)}
              placeholder="예: 견습 서버 개발자"
              value={nickname}
            />
            <button
              className="flex h-10 items-center justify-center gap-2 rounded-[10px] px-5 text-sm font-medium text-white disabled:cursor-default disabled:bg-[#d9d9d9] enabled:bg-[#6bd8d5]"
              disabled={!canContinue}
              type="submit"
            >
              로드맵 생성
              <img alt="" aria-hidden="true" className="h-[10px] w-[11.6px]" src={homeAssets.ctaArrow} />
            </button>
          </div>
          <p className="mt-2 text-[13px] font-medium tracking-[-0.26px] opacity-50">
            생성 후 간단한 자가진단으로 로드맵 시작점을 정해요.
          </p>
        </form>
      )}
    </section>
  )
}
