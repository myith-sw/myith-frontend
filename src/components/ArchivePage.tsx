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

interface ArchivePageProps {
  character: ArchiveCharacter
  completedCount?: number
  experiences?: ArchiveExperienceEntry[]
  onOpenRoadmap: () => void
  skillGroups?: ArchiveSkillGroup[]
}

function SkillCard({ skill }: { skill: ArchiveSkill }) {
  const styles = {
    complete: 'border-[#c8eeed] bg-[rgba(215,255,254,0.4)]',
    pending: 'border-[#ffe3aa] bg-[rgba(255,235,198,0.4)]',
    open: 'border-[#e5e5e5] bg-white',
    locked: 'border-transparent bg-[#f6f6f6] text-black/50',
  }[skill.status]

  const statusIcon = {
    complete: homeAssets.archiveSkillComplete,
    pending: homeAssets.archiveSkillPending,
    open: homeAssets.archiveSkillOpen,
    locked: homeAssets.archiveSkillLocked,
  }[skill.status]

  return (
    <div className={`flex min-h-[75px] items-center justify-between rounded-[20px] border-[1.2px] p-4 ${styles}`}>
      <div className="flex min-w-0 items-center gap-3">
        {skill.status === 'open' && (
          <img
            alt=""
            aria-hidden="true"
            className="h-[13.332px] w-2 shrink-0"
            height={13.332}
            src={homeAssets.archiveSkillOpenIndicator}
            width={8}
          />
        )}
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
      <span className="inline-flex rounded-[20px] bg-[#f8f8f8] px-2.5 py-[5px] text-xs font-semibold tracking-[-0.36px] text-[#878787]">
        {entry.category}
      </span>
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
  skillGroups = archiveSkillGroups,
}: ArchivePageProps) {
  const competencyScores = competencyMetrics.map(({ key, label }) => ({
    label,
    value: clampCompetencyScore(character.competencies[key]),
  }))

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
          {['MD 내보내기', 'PDF 내보내기'].map((label) => (
            <button
              className="flex h-[41px] items-center justify-center gap-2 rounded-[10px] border border-[#eaeaea] bg-white px-5 text-sm font-medium tracking-[-0.28px] transition-colors hover:bg-[#fafafa] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
              key={label}
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
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-[29px] grid grid-cols-2 gap-5">
        <article className="relative h-[523px] overflow-hidden rounded-[20px] bg-white">
          <h2 className="absolute top-6 left-5 text-lg font-semibold tracking-[-0.54px]">역량 다각형</h2>
          <p className="absolute top-[89px] left-1/2 -translate-x-1/2 text-sm font-medium tracking-[-0.42px] text-[#7dcecb]">
            프로그래밍 기초
          </p>
          <p className="absolute top-[140px] left-[62px] text-sm font-medium tracking-[-0.42px] text-[#7dcecb]">CS·자료구조</p>
          <p className="absolute top-[140px] right-[62px] text-sm font-medium tracking-[-0.42px] text-[#7dcecb]">데이터베이스</p>
          <p className="absolute top-[251px] left-[77px] text-sm font-medium tracking-[-0.42px] text-[#7dcecb]">배포·운영</p>
          <p className="absolute top-[251px] right-[85px] text-sm font-medium tracking-[-0.42px] text-[#7dcecb]">서버·API</p>
          <p className="absolute top-[319px] left-1/2 -translate-x-1/2 text-sm font-medium tracking-[-0.42px] text-[#7dcecb]">
            협업·형상관리
          </p>
          <div className="absolute top-[115px] left-[142px] size-[187px]">
            <CompetencyRadar scores={character.competencies} />
          </div>
          <div className="absolute top-[387px] left-[39px] grid w-[393px] grid-cols-2 gap-x-[45px] gap-y-5 text-sm tracking-[-0.42px]">
            {competencyScores.map(({ label, value }) => (
              <div className="flex items-center justify-between" key={label}>
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
      <div className="mt-[29px] grid grid-cols-2 gap-5">
        {experiences.length > 0 ? (
          experiences.map((entry, index) => <ExperienceCard entry={entry} key={index} />)
        ) : (
          <article className="col-span-2 flex h-[188px] items-center justify-center rounded-[20px] bg-white text-sm font-medium tracking-[-0.28px] text-black/40">
            아직 기록된 경험이 없어요
          </article>
        )}
      </div>
    </section>
  )
}
