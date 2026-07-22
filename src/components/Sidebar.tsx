import { homeAssets } from '../assets/home'
import {
  sidebarCharacters as defaultCharacters,
  type SidebarCharacter,
} from '../data/home'

interface SidebarProps {
  characters?: SidebarCharacter[]
}

export function Sidebar({ characters = defaultCharacters }: SidebarProps) {
  return (
    <aside className="z-10 min-h-screen w-[244px] shrink-0 border-r border-[#eaeaea] bg-white">
      <img
        alt="MYITH"
        className="ml-5 mt-5 h-[21.72px] w-[65.16px]"
        height={21.72}
        src={homeAssets.sidebarLogo}
        width={65.16}
      />

      <div className="mx-auto mt-[30.28px] flex w-[213px] flex-col gap-[21px]">
        <div className="flex items-center gap-[7px] px-[10px] py-1 opacity-30">
          <img
            alt=""
            aria-hidden="true"
            className="size-[14px]"
            height={14}
            src={homeAssets.hubIcon}
            width={14}
          />
          <span className="text-sm font-semibold">신화 허브</span>
        </div>

        <section className="px-[5px] py-[10px]" aria-label="내 캐릭터">
          <div className="flex flex-col gap-[23px] px-[11px]">
            <p className="text-[10px] font-semibold tracking-[0.4px] opacity-30">
              내 캐릭터
            </p>
            <ul className="flex flex-col gap-[30px]">
              {characters.map((character) => (
                <li
                  className="flex items-center justify-between px-[5px]"
                  key={`${character.title}-${character.level}`}
                >
                  <div className="flex w-[105px] flex-col gap-1">
                    <span className="text-[13px] font-semibold leading-none">
                      {character.title}
                    </span>
                    <span className="text-[10px] font-semibold tracking-[0.4px] opacity-50">
                      {character.role}
                    </span>
                  </div>
                  <span className="rounded-[8px] bg-[#efefef] px-[6px] py-1 text-[10px] font-semibold">
                    Lv.{character.level}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="flex h-10 items-center gap-2 rounded-[10px] border border-dashed border-[#0f0e00] pl-[14px] opacity-30">
          <img
            alt=""
            aria-hidden="true"
            className="size-3"
            height={12}
            src={homeAssets.addCharacterIcon}
            width={12}
          />
          <span className="text-[13px] font-semibold">새 캐릭터</span>
        </div>
      </div>
    </aside>
  )
}
