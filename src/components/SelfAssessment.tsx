import { homeAssets } from '../assets/home'
import {
  type AssessmentOption,
  type AssessmentQuestion,
  type AssessmentLevel,
  type ProjectExperience,
} from '../data/onboarding'
import { ProjectExperienceCard } from './ProjectExperienceCard'

interface SelfAssessmentProps {
  error?: string
  progressMessage?: string
  submitting?: boolean
  levels: AssessmentOption[]
  questions: AssessmentQuestion[]
  jobTitle: string
  answers: Record<string, AssessmentLevel>
  projectExperiences: ProjectExperience[]
  onAddProjectExperience: () => void
  onAnswerChange: (questionId: string, answer: AssessmentLevel) => void
  onProjectExperienceChange: (
    experienceId: string,
    changes: Partial<Omit<ProjectExperience, 'id'>>,
  ) => void
  onGenerateRoadmap: () => void
  onRemoveProjectExperience: (experienceId: string) => void
}

export function SelfAssessment({
  error,
  progressMessage,
  submitting = false,
  levels,
  questions,
  jobTitle,
  answers,
  projectExperiences,
  onAddProjectExperience,
  onAnswerChange,
  onProjectExperienceChange,
  onGenerateRoadmap,
  onRemoveProjectExperience,
}: SelfAssessmentProps) {
  return (
    <section className="w-full pb-10" aria-labelledby="self-assessment-title">
      <header className="flex flex-col gap-[10px]">
        <h1 id="self-assessment-title" className="text-[22px] leading-[26px] font-semibold tracking-[-0.66px]">
          자가진단
        </h1>
        <p className="text-sm font-normal tracking-[-0.28px] opacity-50">
          {jobTitle} · 대표 역량을 어디까지 해봤는지 골라주세요. 채점은 없어요 — 시작점만 정합니다.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-[30px]">
        {questions.map((question) => (
          <article className="rounded-[20px] bg-[#f7f7f7] p-5" key={question.id}>
            <h2 className="text-base font-semibold tracking-[-0.48px]">{question.prompt}</h2>
            <div className="mt-[14px] grid grid-cols-4 gap-2" role="radiogroup" aria-label={question.prompt}>
              {levels.map((level) => {
                const isSelected = answers[question.id] === level.id

                return (
                  <button
                    aria-checked={isSelected}
                    className={`h-[37px] rounded-[10px] border px-2 text-[13px] tracking-[-0.39px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3] ${
                      isSelected
                        ? 'border-white bg-[#7dcecb] font-semibold text-white'
                        : 'border-[#e7e7e7] bg-white font-medium text-black'
                    }`}
                    key={level.id}
                    onClick={() => onAnswerChange(question.id, level.id)}
                    role="radio"
                    type="button"
                  >
                    {level.label}
                  </button>
                )
              })}
            </div>
          </article>
        ))}

        {projectExperiences.map((experience, index) => (
          <ProjectExperienceCard
            canRemove={projectExperiences.length > 1}
            experience={experience}
            index={index}
            key={experience.id}
            onChange={(changes) => onProjectExperienceChange(experience.id, changes)}
            onRemove={() => onRemoveProjectExperience(experience.id)}
          />
        ))}

        <div className="flex w-full items-center justify-center">
          <button
            aria-label="프로젝트 경험 추가"
            className="group flex h-10 w-[400px] items-center justify-center rounded-[20px] border border-[#d8eeee] bg-[#f0fbfa] text-[#67c8c4] transition-colors hover:border-[#bde4e2] hover:bg-[#e5f8f7] hover:text-[#4eb9b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
            onClick={onAddProjectExperience}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="size-5 transition-transform group-hover:scale-110"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path d="M10 4.5V15.5M4.5 10H15.5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-10 flex justify-end">
        <button
          className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#6bd8d5] px-5 text-sm font-medium text-white"
          disabled={submitting}
          onClick={onGenerateRoadmap}
          type="button"
        >
          {submitting ? '로드맵 생성 중…' : '로드맵 생성'}
          <img alt="" aria-hidden="true" className="h-[10px] w-[11.6px]" src={homeAssets.ctaArrow} />
        </button>
      </div>
      {progressMessage && <p className="mt-4 text-right text-sm font-medium text-[#58a9a3]" role="status">{progressMessage}</p>}
      {error && <p className="mt-3 text-right text-sm font-medium text-[#d65454]" role="alert">{error}</p>}
    </section>
  )
}
