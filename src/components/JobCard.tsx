import { onboardingAssets } from '../assets/onboarding'
import type { JobOption } from '../data/onboarding'

interface JobCardProps {
  job: JobOption
  isSelected?: boolean
  onClick?: () => void
}

export function JobCard({ job, isSelected = false, onClick }: JobCardProps) {
  const content = (
    <>
      <div className="flex w-full items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-base font-medium tracking-[-0.32px]">{job.title}</p>
          <p className="text-[13px] font-medium opacity-50">{job.description}</p>
        </div>
        {isSelected && (
          <img
            alt="선택됨"
            className="size-6"
            height={24}
            src={onboardingAssets.jobSelected}
            width={24}
          />
        )}
      </div>
      <ul
        className="flex h-[29px] flex-nowrap gap-[7px] overflow-hidden"
        aria-label={`${job.title} 핵심 역량`}
      >
        {job.skills.map((skill) => (
          <li
            className="shrink-0 rounded-[10px] border-[0.8px] border-[#ebebeb] bg-white px-[10px] py-[6px] text-xs font-medium opacity-50"
            key={skill}
          >
            {skill}
          </li>
        ))}
      </ul>
    </>
  )

  const className = `flex h-full min-h-[119px] w-full flex-col gap-[14px] rounded-[20px] border bg-[#fdfdfd] p-5 text-left transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60d4d3] ${
    isSelected ? 'border-[#7dcecb]' : 'border-[#e7e7e7]'
  }`

  return onClick ? (
    <button className={`${className} cursor-pointer`} onClick={onClick} type="button">
      {content}
    </button>
  ) : (
    <article className={className}>{content}</article>
  )
}
