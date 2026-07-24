import { useState } from 'react'
import { homeAssets } from '../assets/home'
import { questDetailAssets } from '../assets/quest-detail'
import type { RoadmapQuest } from '../data/roadmap'

interface QuestDetailPageProps {
  onBack: () => void
  quest: RoadmapQuest
}

const stageLabels: Record<number, string> = {
  1: '입문 단계',
  2: '견습 단계',
  3: '성장 단계',
  4: '전설 단계',
  5: '전설 단계',
  6: '신화 단계',
}

const questDetails: Record<string, { completionCriteria: string; ncsReference: string; prompt: string; recommendedCertificate: string }> = {
  'cs-interview': {
    completionCriteria: '네트워크·OS·DB 핵심 답안을 정리한다',
    ncsReference: '-',
    prompt: '가장 헷갈린 개념은?',
    recommendedCertificate: '해당 없음',
  },
}

const starFields = [
  { id: 'situation', label: '상황 (Situation)', placeholder: '이 퀘스트를 시작하게 된 배경을 적어보세요.' },
  { id: 'task', label: '과제 (Task)', placeholder: '이번 퀘스트에서 해결하려던 목표를 적어보세요.' },
  { id: 'action', label: '행동 (Action)', placeholder: '목표를 위해 실제로 한 행동을 적어보세요.' },
  { id: 'result', label: '결과 (Result)', placeholder: '정리 후 얻은 결과나 배운 점을 적어보세요.' },
] as const

export function QuestDetailPage({ onBack, quest }: QuestDetailPageProps) {
  const [starRecord, setStarRecord] = useState<Record<string, string>>({})
  const isLocked = quest.status === 'locked'
  const detail = questDetails[quest.id] ?? {
    completionCriteria: `${quest.title}를 완료하고 배운 내용을 정리한다`,
    ncsReference: '-',
    prompt: '이번 퀘스트에서 가장 기억에 남는 점은?',
    recommendedCertificate: '해당 없음',
  }
  const canComplete = !isLocked && starFields.every(({ id }) => starRecord[id]?.trim())

  return (
    <section className="w-full pb-24">
      <button
        className="flex items-center gap-[6px] text-sm font-medium tracking-[-0.28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
        onClick={onBack}
        type="button"
      >
        <img alt="" aria-hidden="true" className="h-2.5 w-[11.6px] rotate-180" src={homeAssets.archiveBackArrow} />
        로드맵으로
      </button>

      <article className="mt-[25px] rounded-[20px] bg-white p-5">
        <div className="flex flex-col gap-[14px]">
          <div className="flex gap-2">
            <span className="rounded-[10px] bg-[#efefef] px-2.5 py-[2px] text-xs font-medium tracking-[-0.24px]">
              Lv.{quest.level} {stageLabels[quest.level] ?? '성장 단계'}
            </span>
            <span className="rounded-[10px] bg-[#efefef] px-2.5 py-[2px] text-xs font-medium tracking-[-0.24px]">
              {quest.category}
            </span>
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.44px]">{quest.title}</h1>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <QuestInfoCard icon={questDetailAssets.ncsReference} label="NCS 능력단위 근거" value={detail.ncsReference} />
          <QuestInfoCard icon={questDetailAssets.certificate} label="추천 자격" value={detail.recommendedCertificate} />
          <QuestInfoCard className="col-span-2" label="완료 기준" value={detail.completionCriteria} />
        </div>
      </article>

      <article className="mt-[25px] rounded-[20px] bg-white p-5">
        <div className="flex flex-col gap-2.5">
          <h2 className="text-lg font-semibold tracking-[-0.36px]">퀘스트 기록 (STAR)</h2>
          <div className="flex items-center gap-2 rounded-[10px] bg-[#f2ffff] px-2.5 py-[14px] text-[13px] font-medium text-[#7dcecb]">
            <img alt="" aria-hidden="true" className="size-[14.4px]" src={questDetailAssets.starPrompt} />
            {detail.prompt}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-[22px]">
          {starFields.map((field) => (
            <label className="flex flex-col gap-2" key={field.id}>
              <span className="w-fit rounded-[13px] bg-[#59d8d4] px-3 py-1.5 text-sm font-medium tracking-[-0.28px] text-white">
                {field.label}
              </span>
              <textarea
                className="h-[85px] resize-none rounded-[10px] border border-[#e4e4e4] px-[14px] py-[14px] text-sm font-medium tracking-[0.7px] outline-none placeholder:text-black/50 focus:border-[#7dcecb] focus:ring-2 focus:ring-[#7dcecb]/20"
                disabled={isLocked}
                onChange={(event) => setStarRecord((current) => ({ ...current, [field.id]: event.target.value }))}
                placeholder={field.placeholder}
                value={starRecord[field.id] ?? ''}
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2.5 pt-2.5">
          <button
            className="flex items-center gap-2 rounded-[10px] border-[1.2px] border-[#f1e7ff] bg-[rgba(231,214,255,0.24)] px-5 py-3 text-sm font-medium tracking-[-0.28px] text-[#9954ff]"
            type="button"
          >
            <img alt="" aria-hidden="true" className="h-[15.341px] w-3.5" src={questDetailAssets.aiEnhance} />
            AI로 강화하기
          </button>
          <button
            className="flex items-center gap-2 rounded-[10px] border-[1.2px] border-[#eaeaea] bg-[#f7f7f7] px-5 py-3 text-sm font-medium tracking-[-0.28px] text-black/50 disabled:cursor-default disabled:opacity-40"
            disabled={!canComplete}
            type="button"
          >
            <img alt="" aria-hidden="true" className="h-[11.2px] w-3.5" src={questDetailAssets.completeQuest} />
            완료하고 역량 채우기
          </button>
        </div>
      </article>
    </section>
  )
}

function QuestInfoCard({ className = '', icon, label, value }: { className?: string; icon?: string; label: string; value: string }) {
  return (
    <div className={`flex min-h-[83px] flex-col gap-2.5 rounded-[10px] bg-[#f9f9f9] px-[14px] py-4 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-medium opacity-50">
        {icon && <img alt="" aria-hidden="true" className="size-3 object-contain" src={icon} />}
        {label}
      </div>
      <p className="text-sm font-medium">{value}</p>
    </div>
  )
}
