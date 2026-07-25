import { useState } from 'react'
import { homeAssets } from '../assets/home'
import { roadmapAssets } from '../assets/roadmap'
import {
  type RoadmapCharacter,
  type RoadmapQuest,
  type RoadmapQuestGroup,
} from '../data/roadmap'
import { CharacterSprite } from './CharacterSprite'
import { CustomSelect } from './CustomSelect'

interface RoadmapPageProps {
  axes: Array<{ code: string; name: string }>
  character: RoadmapCharacter
  levels: number[]
  questGroups: RoadmapQuestGroup[]
  onAddQuest: (quest: { title: string; axisCode: string; level: number }) => void
  onMoveQuest: (quest: RoadmapQuest, targetIndex: number) => void
  onOpenArchive: () => void
  onOpenQuest: (quest: RoadmapQuest) => void
}

function RoadmapQuestCard({ onOpenQuest, quest }: { onOpenQuest: (quest: RoadmapQuest) => void; quest: RoadmapQuest }) {
  const isLocked = quest.status === 'locked'
  const styles = {
    complete: 'border-[#c8eeed] bg-[rgba(215,255,254,0.4)]',
    known: 'border-[#c8eeed] bg-[rgba(215,255,254,0.4)]',
    pending: 'border-[#ffe3aa] bg-[rgba(255,235,198,0.4)]',
    open: 'border-[#c8eeed] bg-white',
    locked: 'border-transparent bg-[#f6f6f6] text-black/50',
  }[quest.status]

  const statusIcon = {
    complete: homeAssets.archiveSkillComplete,
    known: homeAssets.archiveSkillComplete,
    pending: homeAssets.archiveSkillPending,
    open: homeAssets.archiveSkillOpen,
    locked: homeAssets.archiveSkillLocked,
  }[quest.status]

  return (
    <button
      aria-disabled={isLocked}
      aria-label={isLocked ? `${quest.title} (잠김)` : quest.title}
      className={`flex min-h-[75px] w-full items-center justify-between rounded-[20px] border-[1.2px] p-4 text-left transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3] ${styles} ${isLocked ? 'cursor-default' : 'cursor-pointer hover:-translate-y-px'}`}
      onClick={() => {
        if (!isLocked) onOpenQuest(quest)
      }}
      disabled={isLocked}
      type="button"
    >
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
          <p className="text-xs font-medium tracking-[-0.24px] opacity-50">{quest.category}</p>
          <p className="truncate text-base font-semibold tracking-[-0.32px]">{quest.title}</p>
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
    </button>
  )
}

export function RoadmapPage({
  axes,
  character,
  levels,
  questGroups,
  onAddQuest,
  onMoveQuest,
  onOpenArchive,
  onOpenQuest,
}: RoadmapPageProps) {
  const [isQuestFormOpen, setIsQuestFormOpen] = useState(false)
  const [questTitle, setQuestTitle] = useState('')
  const [questAxisCode, setQuestAxisCode] = useState(axes[0]?.code ?? '')
  const [questLevel, setQuestLevel] = useState(levels[0] ?? 1)
  const canAddQuest = questTitle.trim().length > 0

  const addQuest = () => {
    if (!canAddQuest) return

    onAddQuest({ level: questLevel, axisCode: questAxisCode, title: questTitle.trim() })
    setQuestTitle('')
    setQuestLevel(levels[0] ?? 1)
    setQuestAxisCode(axes[0]?.code ?? '')
    setIsQuestFormOpen(false)
  }

  return (
    <section className="w-full pb-24">
      <header className="flex h-[289px] items-center gap-[10px]">
        <div className="flex size-[289px] shrink-0 items-center justify-center overflow-hidden">
          <CharacterSprite
            alt={`${character.name} 캐릭터`}
            characterId={character.characterId}
            size={289}
            stage={character.stage}
          />
        </div>
        <div className="flex w-[728px] flex-col gap-[25px]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <span className="rounded-[8px] bg-[#efefef] px-[6px] py-[2px] text-xs font-medium tracking-[-0.24px]">
                  Lv.{character.level}
                </span>
                <span className="text-sm font-medium tracking-[-0.28px]">{character.stageLabel}</span>
              </div>
              <div className="flex items-center gap-5">
                <h1 className="text-[28px] font-semibold tracking-[-0.84px]">{character.name}</h1>
                <p className="text-[13px] font-medium tracking-[-0.26px] opacity-50">{character.description}</p>
              </div>
            </div>
            <button
              className="flex h-10 items-center justify-center gap-2 rounded-[10px] border-[1.2px] border-[#eaeaea] bg-white px-[14px] text-[15px] font-medium tracking-[-0.3px] text-black/50"
              onClick={onOpenArchive}
              type="button"
            >
              <img
                alt=""
                aria-hidden="true"
                className="h-[14px] w-4"
                height={14}
                src={homeAssets.archiveIcon}
                width={16}
              />
              아카이브
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-medium tracking-[-0.24px]">
              <span className="opacity-50">신화 진행률</span>
              <span>{character.progress}%</span>
            </div>
            <div className="h-[10px] overflow-hidden rounded-[5px] bg-[#ddd]">
              <div className="h-full rounded-[5px] bg-black" style={{ width: `${character.progress}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="ml-[73px] w-[956px]">
        <div className="flex items-center justify-between">
          <div className="flex w-[364px] flex-col gap-2.5">
            <h2 className="text-[22px] font-semibold tracking-[-0.44px]">로드맵 퀘스트</h2>
            <p className="text-[13px] font-medium tracking-[-0.26px] opacity-50">
              같은 단계의 퀘스트는 원하는 순서로 조정하며 성장 루트를 만들 수 있어요.
            </p>
          </div>
          <button
            aria-expanded={isQuestFormOpen}
            className="flex items-center gap-2 rounded-[10px] bg-[#fefefe] px-[14px] py-2.5 text-sm tracking-[-0.28px]"
            onClick={() => setIsQuestFormOpen((current) => !current)}
            type="button"
          >
            <img
              alt=""
              aria-hidden="true"
              className="size-3"
              height={12}
              src={homeAssets.addCharacterIcon}
              width={12}
            />
            퀘스트 추가
          </button>
        </div>

        {isQuestFormOpen && (
          <form
            className="mt-[30px] rounded-[20px] border border-[#e3e3e3] bg-white p-5"
            onSubmit={(event) => {
              event.preventDefault()
              addQuest()
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold tracking-[-0.32px]">나만의 퀘스트 추가</h3>
              <button
                aria-label="퀘스트 추가 닫기"
                className="flex h-[19px] w-[18px] items-center justify-center"
                onClick={() => setIsQuestFormOpen(false)}
                type="button"
              >
                <img alt="" aria-hidden="true" className="size-full" src={roadmapAssets.questFormClose} />
              </button>
            </div>
            <label className="sr-only" htmlFor="roadmap-quest-title">퀘스트 제목</label>
            <input
              className="mt-5 h-[48px] w-full rounded-[10px] bg-[#f8f8f8] px-[14px] text-base font-medium tracking-[-0.32px] outline-none placeholder:text-black/50 focus:ring-2 focus:ring-[#7dcecb]/30"
              id="roadmap-quest-title"
              onChange={(event) => setQuestTitle(event.target.value)}
              placeholder="퀘스트 제목 (예: 사이드 프로젝트를 운영한다)"
              value={questTitle}
            />
            <div className="mt-3 flex items-center gap-3">
              <CustomSelect
                ariaLabel="역량 분류"
                className="flex-1"
                onChange={setQuestAxisCode}
                options={axes.map((axis) => ({ label: axis.name, value: axis.code }))}
                value={questAxisCode}
              />
              <CustomSelect
                ariaLabel="퀘스트 레벨"
                className="w-[143px] shrink-0"
                onChange={setQuestLevel}
                options={levels.map((level) => ({ label: `레벨 ${level}`, value: level }))}
                value={questLevel}
              />
              <button
                className="h-[40px] rounded-[10px] bg-[#58a9a3] px-[14px] text-base font-medium tracking-[-0.32px] text-white disabled:cursor-default disabled:opacity-50"
                disabled={!canAddQuest}
                type="submit"
              >
                추가
              </button>
            </div>
          </form>
        )}

        <div className="mt-[30px] flex flex-col gap-[30px]">
          {questGroups.map((group) => (
            <section className="flex flex-col gap-5" key={group.level}>
              <div className="flex items-center gap-[13px]">
                <span className="text-sm font-semibold tracking-[-0.28px] opacity-50">
                  Lv.{group.level}{group.label ? ` ${group.label}` : ''}
                </span>
                <span className="h-px flex-1 bg-[#e5e5e5]" />
              </div>
              <div className="flex flex-col gap-2.5">
                {group.quests.map((quest, index) => (
                  <div className="flex items-center gap-2" key={quest.id}>
                    <RoadmapQuestCard onOpenQuest={onOpenQuest} quest={quest} />
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        aria-label={`${quest.title} 위로 이동`}
                        className="flex size-8 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white text-sm disabled:cursor-default disabled:opacity-30"
                        disabled={index === 0}
                        onClick={() => onMoveQuest(quest, index - 1)}
                        type="button"
                      >
                        ↑
                      </button>
                      <button
                        aria-label={`${quest.title} 아래로 이동`}
                        className="flex size-8 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white text-sm disabled:cursor-default disabled:opacity-30"
                        disabled={index === group.quests.length - 1}
                        onClick={() => onMoveQuest(quest, index + 1)}
                        type="button"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}
