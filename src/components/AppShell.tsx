import type { ReactNode } from 'react'
import { homeAssets } from '../assets/home'

interface AppShellProps {
  sidebar: ReactNode
  children: ReactNode
  variant?: 'hub' | 'archive' | 'home' | 'selection' | 'assessment' | 'roadmap' | 'quest'
}

export function AppShell({ sidebar, children, variant = 'home' }: AppShellProps) {
  const isHome = variant === 'home'
  const isAssessment = variant === 'assessment'
  const isHub = variant === 'hub'
  const isArchive = variant === 'archive'
  const isRoadmap = variant === 'roadmap'
  const isQuest = variant === 'quest'

  return (
    <div className="flex min-h-screen min-w-[1024px] bg-white text-black">
      {sidebar}
      <main
        className={`relative min-h-screen min-w-0 flex-1 overflow-x-hidden ${
          isHome || isQuest || isRoadmap ? 'bg-white' : isAssessment ? 'bg-white' : 'bg-[#f6f6f6]'
        }`}
      >
        {isHome && (
          <img
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 size-full object-cover"
            src={homeAssets.background}
          />
        )}
        <div
          className={`relative ${
            isHome
              ? 'mx-auto w-[calc(100%-48px)] max-w-[956.349px] pt-[138px]'
              : isHub || isArchive
                ? 'relative left-[9px] mx-auto w-[calc(100%-48px)] max-w-[956px] pt-[38px]'
                : isRoadmap
                  ? 'relative -left-[27px] mx-auto w-[calc(100%-48px)] max-w-[1029px] pt-[38px]'
                  : isQuest
                    ? 'relative left-[9px] mx-auto w-[calc(100%-48px)] max-w-[956px] pt-[38px]'
                : isAssessment
                ? 'mx-auto w-[calc(100%-48px)] max-w-[956px] pt-[38px]'
                : 'mx-auto w-[calc(100%-48px)] max-w-[950px] pt-[38px]'
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  )
}
