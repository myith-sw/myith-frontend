import { useState } from 'react'
import logoutIcon from '../assets/auth/logout.svg'
import { homeAssets } from '../assets/home'
import {
  sidebarCharacters as defaultCharacters,
  type SidebarCharacter,
} from '../data/home'

interface SidebarProps {
  variant?: 'samples' | 'empty' | 'draft' | 'unauthenticated'
  characters?: SidebarCharacter[]
  draftCharacter?: SidebarCharacter
  activeCharacterId?: string
  onHome?: () => void
  onLogin?: () => void
  onLogout?: () => void
  onCreateCharacter?: () => void
  onSelectCharacter?: (characterId: string) => void
  profile?: {
    email?: string
    imageUrl?: string | null
    name: string
  }
}

export function Sidebar({
  variant = 'samples',
  characters = defaultCharacters,
  draftCharacter,
  activeCharacterId,
  onHome,
  onLogin,
  onLogout,
  onCreateCharacter,
  onSelectCharacter,
  profile,
}: SidebarProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const shouldShowCharacters = variant !== 'empty'
  const shouldShowCharacterCards = variant !== 'unauthenticated'
  const visibleCharacters = variant === 'draft' && draftCharacter ? [draftCharacter] : characters
  const profileInitial = profile?.name.trim().slice(0, 1).toLowerCase() || 'm'

  return (
    <aside className="sticky top-0 z-10 flex h-screen w-[244px] shrink-0 self-start flex-col overflow-hidden border-r border-[#eaeaea] bg-white text-[#0f0e00]">
      <div className="min-h-0 flex-1 overflow-y-auto pb-5">
        <button
        aria-label="MYITH 홈으로 이동"
        className="ml-5 mt-5 block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60d4d3] enabled:cursor-pointer"
        disabled={!onHome}
        onClick={onHome}
        type="button"
      >
        <img
          alt="MYITH"
          className="h-[21.72px] w-[65.16px]"
          height={21.72}
          src={homeAssets.sidebarLogo}
          width={65.16}
        />
      </button>

        <div className="mx-auto mt-[30.28px] flex w-[213px] flex-col gap-[21px]">
        <button
          aria-label="신화 허브로 이동"
          className="flex w-full items-center gap-[7px] rounded-sm px-[10px] py-1 text-left opacity-30 transition-opacity enabled:cursor-pointer enabled:hover:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3] disabled:cursor-default"
          disabled={!onHome}
          onClick={onHome}
          type="button"
        >
          <img
            alt=""
            aria-hidden="true"
            className="size-[14px]"
            height={14}
            src={homeAssets.hubIcon}
            width={14}
          />
          <span className="text-sm font-semibold">신화 허브</span>
        </button>

        {shouldShowCharacters && (
          <>
            <section className="py-[10px]" aria-label="내 캐릭터">
              <div className="flex flex-col gap-[23px]">
                <p className="ml-[11px] text-[10px] font-semibold tracking-[0.4px] opacity-30">내 캐릭터</p>
                {shouldShowCharacterCards && <ul className="flex w-[213px] flex-col gap-2.5">
                  {visibleCharacters.map((character) => {
                    const isSelected = variant === 'draft' || character.id === activeCharacterId
                    const isInteractive = Boolean(character.id && onSelectCharacter)

                    return (
                      <li className="h-[58px] w-[213px]" key={character.id ?? `${character.title}-${character.stage}`}>
                        <button
                          aria-label={isInteractive ? `${character.title} 아카이브 열기` : undefined}
                          className={`box-border flex h-full w-full items-center justify-between rounded-[10px] border px-[15px] py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3] ${
                            isSelected
                              ? 'border-[#7dcecb] bg-[#e9f9f8]'
                              : 'border-transparent bg-transparent enabled:hover:bg-[#f8f8f8]'
                          } ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
                          disabled={!isInteractive}
                          onClick={() => {
                            if (character.id) {
                              onSelectCharacter?.(character.id)
                            }
                          }}
                          type="button"
                        >
                          <div className="flex w-[105px] flex-col gap-1">
                            <span className="text-[13px] font-semibold leading-none">{character.title}</span>
                            <span className="text-[10px] font-semibold tracking-[0.4px] opacity-50">
                              {character.role}
                            </span>
                          </div>
                          <span
                            className={`rounded-[8px] px-[6px] py-1 text-[10px] font-semibold ${
                              isSelected ? 'bg-[#7dcecb] text-white' : 'bg-[#efefef]'
                            }`}
                          >
                            Lv.{character.stage}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>}
              </div>
            </section>

            <button
              className="flex h-10 w-full items-center gap-2 rounded-[10px] border border-dashed border-[#0f0e00] pl-[14px] text-left opacity-30 transition-opacity hover:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3] enabled:cursor-pointer disabled:cursor-default"
              disabled={!onCreateCharacter}
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
              <span className="text-[13px] font-semibold">새 캐릭터</span>
            </button>
          </>
        )}
        </div>
      </div>
      {profile ? (
        <div className="relative flex h-[50px] shrink-0 items-center border-t border-[#eaeaea] bg-white px-[9px]">
          {isProfileMenuOpen && (
            <div className="absolute bottom-[51px] left-[9px] z-20 flex w-[226px] flex-col gap-2.5 rounded-[10px] border border-[#eaeaea] bg-white p-[5px] shadow-[0_8px_20px_rgba(0,0,0,0.05)]">
              <p className="px-1 py-0.5 text-[10px] tracking-[-0.2px] text-[#656565]">
                {profile.email ?? '이메일 정보 없음'}
              </p>
              <button
                className="flex h-[25px] w-full items-center gap-2 rounded-[10px] bg-white px-[14px] py-1 text-left text-[10px] font-medium tracking-[-0.2px] text-[#1b1b1b] hover:bg-[#f7f7f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
                onClick={onLogout}
                type="button"
              >
                <img alt="" aria-hidden="true" className="h-[10px] w-[11.25px]" src={logoutIcon} />
                로그아웃
              </button>
            </div>
          )}
          <button
            aria-expanded={isProfileMenuOpen}
            aria-label={`${profile.name} 프로필 메뉴`}
            className={`flex h-[42px] w-full items-center gap-2 rounded-[10px] px-2.5 py-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3] ${
              isProfileMenuOpen ? 'bg-[#efefef]' : 'bg-white'
            }`}
            onClick={() => setIsProfileMenuOpen((open) => !open)}
            type="button"
          >
            {profile.imageUrl ? (
              <img alt="" className="size-[25px] rounded-full object-cover" src={profile.imageUrl} />
            ) : (
              <span className="flex size-[25px] items-center justify-center rounded-full bg-[#7dcecb] text-xs font-medium text-white">
                {profileInitial}
              </span>
            )}
            <span className="truncate text-sm font-medium tracking-[-0.28px] text-[#656565]">{profile.name}</span>
          </button>
        </div>
      ) : onLogin ? (
        <div className="flex h-[50px] shrink-0 items-center border-t border-[#eaeaea] bg-white px-5">
          <button
            className="rounded-sm px-2.5 py-1 text-sm font-semibold tracking-[-0.28px] text-[#7dcecb] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
            onClick={onLogin}
            type="button"
          >
            로그인
          </button>
        </div>
      ) : null}
    </aside>
  )
}
