import { homeAssets } from '../assets/home'
import { CharacterSprite } from './CharacterSprite'
import type { MythCharacter } from '../data/home'

interface MythHubProps {
  characters: MythCharacter[]
  onCreateCharacter: () => void
  onOpenRoadmap: (characterId: string) => void
  onOpenArchive: (characterId: string) => void
}

interface MythCardProps {
  character: MythCharacter
  onOpenRoadmap: (characterId: string) => void
  onOpenArchive: (characterId: string) => void
}

function MythCard({ character, onOpenRoadmap, onOpenArchive }: MythCardProps) {
  return (
    <article className="flex flex-col gap-[6px]">
      <div className="rounded-[10px] border-[1.2px] border-[#eaeaea] bg-[#fefefe] p-[10px]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-[30px]">
            <div className="flex size-[96px] shrink-0 items-center justify-center overflow-hidden">
              <CharacterSprite
                alt={`${character.title} 캐릭터`}
                characterId={character.characterId}
                size={96}
                stage={character.stage}
              />
            </div>

            <div className="flex min-w-0 flex-col justify-center gap-2">
              <div className="flex items-center gap-[6px]">
                <span className="rounded-[8px] bg-[#efefef] px-[6px] py-[2px] text-xs font-medium tracking-[-0.24px]">
                  Lv.{character.level}
                </span>
                <span className="text-sm font-medium tracking-[-0.28px]">{character.stageLabel}</span>
              </div>
              <h2 className="w-[200px] text-lg leading-[22px] font-semibold tracking-[-0.36px]">
                {character.title}
              </h2>
              <p className="whitespace-nowrap text-[13px] font-medium tracking-[-0.26px]">
                {character.description}
              </p>
            </div>
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

          <div className="flex items-center justify-between py-2.5">
            <span className="text-xs font-medium tracking-[-0.24px] opacity-50">다음 퀘스트</span>
            <span className="flex items-center gap-2 text-sm font-medium tracking-[-0.28px] opacity-70">
              {character.nextQuest}
              <img
                alt=""
                aria-hidden="true"
                className="h-[9.726px] w-[5.349px]"
                height={9.726}
                src={homeAssets.nextQuestChevron}
                width={5.349}
              />
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-[6px]">
        <button
          aria-label={`${character.title} 로드맵`}
          className="flex h-10 flex-1 items-center justify-center gap-[6px] rounded-[10px] border border-[#eaeaea] bg-white text-sm font-medium tracking-[-0.28px] transition-colors hover:bg-[#f6f6f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
          onClick={() => onOpenRoadmap(character.id)}
          type="button"
        >
          로드맵
          <img
            alt=""
            aria-hidden="true"
            className="h-[10px] w-[11.6px]"
            height={10}
            src={homeAssets.roadmapArrow}
            width={11.6}
          />
        </button>
        <button
          aria-label={`${character.title} 아카이브`}
          className="flex h-10 flex-1 items-center justify-center gap-[6px] rounded-[10px] border border-[#eaeaea] bg-white text-sm font-medium tracking-[-0.28px] transition-colors hover:bg-[#f6f6f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
          onClick={() => onOpenArchive(character.id)}
          type="button"
        >
          <img
            alt=""
            aria-hidden="true"
            className="h-3 w-[14px]"
            height={12}
            src={homeAssets.archiveIcon}
            width={14}
          />
          아카이브
        </button>
      </div>
    </article>
  )
}

export function MythHub({ characters, onCreateCharacter, onOpenRoadmap, onOpenArchive }: MythHubProps) {
  return (
    <section className="w-full">
      <header className="flex items-center justify-between pl-[11px]">
        <div className="flex flex-col gap-2.5">
          <h1 className="text-[22px] leading-[26px] font-semibold tracking-[-0.66px]">신화 허브</h1>
          <p className="text-sm tracking-[-0.28px] opacity-50">
            로드맵 퀘스트를 따라 캐릭터와 함께 성장해보세요.
          </p>
        </div>
        <button
          className="flex items-center justify-center gap-2 rounded-[10px] bg-[#fefefe] px-[14px] py-2.5 text-sm tracking-[-0.28px] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
          onClick={onCreateCharacter}
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
          새 캐릭터
        </button>
      </header>

      <div className="mt-[30px] grid grid-cols-2 gap-x-4 gap-y-1.5">
        {characters.map((character) => (
          <MythCard character={character} key={character.id} onOpenArchive={onOpenArchive} onOpenRoadmap={onOpenRoadmap} />
        ))}
      </div>
    </section>
  )
}
