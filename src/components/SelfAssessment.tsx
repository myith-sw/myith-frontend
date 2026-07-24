import { homeAssets } from '../assets/home'
import {
  assessmentLevels,
  assessmentQuestions,
  type AssessmentLevel,
} from '../data/onboarding'

interface SelfAssessmentProps {
  jobTitle: string
  answers: Record<string, AssessmentLevel>
  onAnswerChange: (questionId: string, answer: AssessmentLevel) => void
  onGenerateRoadmap: () => void
}

export function SelfAssessment({ jobTitle, answers, onAnswerChange, onGenerateRoadmap }: SelfAssessmentProps) {
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

      <div className="mt-[35px] flex flex-col gap-[25px]">
        {assessmentQuestions.map((question) => (
          <article className="rounded-[20px] bg-[#f7f7f7] p-5" key={question.id}>
            <h2 className="text-base font-semibold tracking-[-0.48px]">{question.prompt}</h2>
            <div className="mt-[14px] grid grid-cols-4 gap-2" role="radiogroup" aria-label={question.prompt}>
              {assessmentLevels.map((level) => {
                const isSelected = answers[question.id] === level

                return (
                  <button
                    aria-checked={isSelected}
                    className={`h-[37px] rounded-[10px] border px-2 text-[13px] tracking-[-0.39px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3] ${
                      isSelected
                        ? 'border-white bg-[#7dcecb] font-semibold text-white'
                        : 'border-[#e7e7e7] bg-white font-medium text-black'
                    }`}
                    key={level}
                    onClick={() => onAnswerChange(question.id, level)}
                    role="radio"
                    type="button"
                  >
                    {level}
                  </button>
                )
              })}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-[25px] flex justify-end">
        <button
          className="flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#6bd8d5] px-5 text-sm font-medium text-white"
          onClick={onGenerateRoadmap}
          type="button"
        >
          로드맵 생성
          <img alt="" aria-hidden="true" className="h-[10px] w-[11.6px]" src={homeAssets.ctaArrow} />
        </button>
      </div>
    </section>
  )
}
