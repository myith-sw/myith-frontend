import { useState } from 'react'
import { homeAssets } from '../assets/home'
import {
  archiveSkillGroups,
  clampCompetencyScore,
  competencyMetrics,
  experienceEntries,
  type ArchiveCharacter,
  type ArchiveExperienceEntry,
  type ArchiveSkill,
  type ArchiveSkillGroup,
} from '../data/archive'
import { CompetencyRadar } from './CompetencyRadar'
import type { RadarAxisScore } from './CompetencyRadar'

type ExperienceLevelFilter = 'all' | 1 | 2 | 3 | 4

const experienceLevelFilters: { label: string; value: ExperienceLevelFilter }[] = [
  { label: '전체', value: 'all' },
  { label: 'Lv.1 입문 단계', value: 1 },
  { label: 'Lv.2 견습 단계', value: 2 },
  { label: 'Lv.3 성장 단계', value: 3 },
  { label: 'Lv.4 전설 단계', value: 4 },
]

interface ArchivePageProps {
  character: ArchiveCharacter
  completedCount?: number
  experiences?: ArchiveExperienceEntry[]
  onOpenRoadmap: () => void
  onExport?: (format: 'md' | 'pdf') => void
  radar?: RadarAxisScore[]
  skillGroups?: ArchiveSkillGroup[]
}

function SkillCard({ skill }: { skill: ArchiveSkill }) {
  const styles = {
    complete: 'border-[#c8eeed] bg-[rgba(215,255,254,0.4)]',
    known: 'border-[#c8eeed] bg-[rgba(215,255,254,0.4)]',
    pending: 'border-[#ffe3aa] bg-[rgba(255,235,198,0.4)]',
    open: 'border-[#e5e5e5] bg-white',
    locked: 'border-transparent bg-[#f6f6f6] text-black/50',
  }[skill.status]

  const statusIcon = {
    complete: homeAssets.archiveSkillComplete,
    known: homeAssets.archiveSkillComplete,
    pending: homeAssets.archiveSkillPending,
    open: homeAssets.archiveSkillOpen,
    locked: homeAssets.archiveSkillLocked,
  }[skill.status]

  return (
    <div className={`flex min-h-[75px] items-center justify-between rounded-[20px] border-[1.2px] p-4 ${styles}`}>
      <div className="flex min-w-0 items-center gap-3">
        <img
          alt=""
          aria-hidden="true"
          className="size-10 shrink-0 object-contain"
          height={40}
          src={statusIcon}
          width={40}
        />
        <div className="flex min-w-0 flex-col gap-2.5">
          <p className="text-xs font-medium tracking-[-0.24px] opacity-50">{skill.category}</p>
          <p className="truncate text-base font-semibold tracking-[-0.32px]">{skill.title}</p>
        </div>
      </div>
      <img
        alt=""
        aria-hidden="true"
        className="ml-3 h-[9.726px] w-[5.349px] shrink-0"
        height={9.726}
        src={homeAssets.archiveSkillChevron}
        width={5.349}
      />
    </div>
  )
}

function ExperienceCard({ entry }: { entry: ArchiveExperienceEntry }) {
  return (
    <article className="h-[277px] overflow-hidden rounded-[20px] bg-white px-[30px] pt-[21px]">
      <div className="flex items-center gap-2">
        {entry.level !== undefined && entry.levelLabel && (
          <span className="inline-flex rounded-[20px] bg-[#f8f8f8] px-2.5 py-[5px] text-xs font-semibold tracking-[-0.36px] text-[#878787]">
            Lv.{entry.level} {entry.levelLabel}
          </span>
        )}
        <span className="inline-flex rounded-[20px] bg-[#f8f8f8] px-2.5 py-[5px] text-xs font-semibold tracking-[-0.36px] text-[#878787]">
          {entry.category}
        </span>
      </div>
      <h3 className="mt-3 text-base font-semibold tracking-[-0.48px]">{entry.title}</h3>
      <div className="mt-4 flex flex-col gap-2.5">
        {entry.entries.map(([label, text]) => (
          <div className="flex items-center gap-2.5" key={label}>
            <span className="rounded-[5px] bg-[#f5f5f5] px-[5px] py-[3px] text-xs font-medium text-[#2fc5bf]">
              {label}
            </span>
            <p className="truncate text-[13px] font-medium text-[#b3b3b3]">{text}</p>
          </div>
        ))}
      </div>
      <div className="mt-[18px] border-t border-[#e5e5e5]" />
    </article>
  )
}

export function ArchivePage({
  character,
  completedCount = 2,
  experiences = experienceEntries,
  onOpenRoadmap,
  onExport,
  radar,
  skillGroups = archiveSkillGroups,
}: ArchivePageProps) {
  const [activeExperienceLevel, setActiveExperienceLevel] = useState<ExperienceLevelFilter>('all')
  const competencyScores = radar ?? competencyMetrics.map(({ key, label }) => ({
    key,
    label,
    value: clampCompetencyScore(character.competencies[key]),
  }))
  const filteredExperiences =
    activeExperienceLevel === 'all'
      ? experiences
      : experiences.filter((entry) => entry.level === activeExperienceLevel)

  return (
    <section className="w-full pb-24">
      <header className="relative min-h-[95px]">
        <div className="flex flex-col gap-[25px]">
          <button
            className="flex items-center gap-[6px] text-sm font-medium tracking-[-0.28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
            onClick={onOpenRoadmap}
            type="button"
          >
            <img
              alt=""
              aria-hidden="true"
              className="h-2.5 w-[11.6px] rotate-180"
              height={10}
              src={homeAssets.archiveBackArrow}
              width={11.6}
            />
            <span>로드맵으로</span>
          </button>
          <div className="flex flex-col gap-2.5">
            <h1 className="text-[22px] font-semibold tracking-[-0.66px]">{character.title}</h1>
            <p className="text-sm tracking-[-0.28px] opacity-50">
              {character.role} · Lv.{character.level} · 완료 {completedCount}개 · 진행률 {character.progress}%
            </p>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 flex gap-3">
          {(['md', 'pdf'] as const).map((format) => (
            <button
              className="flex h-[41px] items-center justify-center gap-2 rounded-[10px] border border-[#eaeaea] bg-white px-5 text-sm font-medium tracking-[-0.28px] transition-colors hover:bg-[#fafafa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
              key={format}
              onClick={() => onExport?.(format)}
              type="button"
            >
              <img
                alt=""
                aria-hidden="true"
                className="h-[15px] w-[14px]"
                height={15}
                src={homeAssets.archiveExportIcon}
                width={14}
              />
              {format.toUpperCase()} 내보내기
            </button>
          ))}
        </div>
      </header>

      <div className="mt-[29px] grid grid-cols-2 gap-5">
        <article className="relative h-[523px] overflow-hidden rounded-[20px] bg-white">
          <h2 className="absolute top-6 left-5 text-lg font-semibold tracking-[-0.54px]">역량 다각형</h2>
          <div className="absolute top-[86px] left-1/2 size-[220px] -translate-x-1/2">
            <CompetencyRadar axes={competencyScores} />
          </div>
          <div className="absolute top-[387px] left-[39px] grid w-[393px] grid-cols-2 gap-x-[45px] gap-y-5 text-sm tracking-[-0.42px]">
            {competencyScores.map(({ key, label, value }) => (
              <div className="flex items-center justify-between" key={key}>
                <span className="font-medium text-[#b3b3b3]">{label}</span>
                <span className="font-semibold">{value}%</span>
              </div>
            ))}
          </div>
        </article>

        <article className="relative h-[523px] overflow-hidden rounded-[20px] bg-white px-[27px] pt-6">
          <h2 className="text-lg font-semibold tracking-[-0.54px]">스킬 트리</h2>
          <div className="mt-[19px] h-[434px] overflow-y-auto pr-3">
            <div className="flex flex-col gap-5 pb-5">
              {skillGroups.map((group) => (
                <section className="flex flex-col gap-4" key={group.level}>
                  <div className="flex items-center gap-[13px]">
                    <span className="text-sm font-semibold tracking-[-0.28px] opacity-50">
                      Lv.{group.level}{group.label ? ` ${group.label}` : ''}
                    </span>
                    <span className="h-px flex-1 bg-[#e5e5e5]" />
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {group.skills.map((skill) => (
                      <SkillCard key={`${skill.category}-${skill.title}`} skill={skill} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </article>
      </div>

      <div className="mt-[38px] flex items-center gap-2 pl-5">
        <img
          alt=""
          aria-hidden="true"
          className="h-5 w-4"
          height={20}
          src={homeAssets.archiveExperienceIcon}
          width={16}
        />
        <h2 className="text-lg font-semibold tracking-[-0.54px]">경험 카드</h2>
        <span className="text-sm tracking-[-0.28px] opacity-50">
          {experiences.length > 0 ? `자기소개서 소스 · ${experiences.length}장` : '아직 기록된 경험이 없어요'}
        </span>
      </div>
      {experiences.length > 0 && (
        <div aria-label="경험 카드 레벨 필터" className="mt-4 flex flex-wrap items-center gap-2.5 pl-5">
          {experienceLevelFilters.map((filter) => {
            const isActive = activeExperienceLevel === filter.value

            return (
              <button
                aria-pressed={isActive}
                className={`rounded-[20px] px-[15px] py-[6px] text-xs font-semibold tracking-[-0.36px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3] ${
                  isActive ? 'bg-[#7dcecb] text-white' : 'bg-white text-black'
                }`}
                key={filter.value}
                onClick={() => setActiveExperienceLevel(filter.value)}
                type="button"
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      )}
      <div className={`${experiences.length > 0 ? 'mt-3' : 'mt-[29px]'} grid grid-cols-2 gap-5`}>
        {filteredExperiences.length > 0 ? (
          filteredExperiences.map((entry, index) => <ExperienceCard entry={entry} key={index} />)
        ) : (
          <article className="col-span-2 flex h-[188px] items-center justify-center rounded-[20px] bg-white text-sm font-medium tracking-[-0.28px] text-black/40">
            {experiences.length > 0 ? '해당 단계에 기록된 경험이 없어요' : '아직 기록된 경험이 없어요'}
          </article>
        )}
      </div>
    </section>
  )
}
