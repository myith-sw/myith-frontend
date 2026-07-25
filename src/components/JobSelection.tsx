import type { CategoryId, JobCategory, JobOption } from '../data/onboarding'
import { ComingSoonCard } from './ComingSoonCard'
import { JobCard } from './JobCard'

interface JobSelectionProps {
  categories: JobCategory[]
  selectedCategoryId: CategoryId
  jobs: JobOption[]
  onSelectCategory: (categoryId: CategoryId) => void
  onSelectJob: (job: JobOption) => void
}

export function JobSelection({
  categories,
  selectedCategoryId,
  jobs,
  onSelectCategory,
  onSelectJob,
}: JobSelectionProps) {
  const availableJobs = jobs.filter((job) => job.categoryId === selectedCategoryId)

  return (
    <section className="w-full" aria-labelledby="new-character-title">
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
              <img
                alt=""
                aria-hidden="true"
                className="size-3"
                height={12}
                src={category.icon}
                style={{ filter: isActive ? 'brightness(0) invert(1)' : undefined }}
                width={12}
              />
              {category.label}
            </button>
          )
        })}
      </div>

      <div className="mt-[23px] grid grid-cols-1 items-stretch gap-[10px] min-[1200px]:grid-cols-2">
        {availableJobs.map((job) =>
          job.available === false ? (
            <ComingSoonCard key={job.id} />
          ) : (
            <JobCard job={job} key={job.id} onClick={() => onSelectJob(job)} />
          ),
        )}
        <ComingSoonCard />
      </div>
    </section>
  )
}
