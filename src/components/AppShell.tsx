import type { ReactNode } from 'react'
import { homeAssets } from '../assets/home'

interface AppShellProps {
  sidebar: ReactNode
  children: ReactNode
}

export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen min-w-[1024px] bg-white text-[#0f0e00]">
      {sidebar}
      <main className="relative min-h-screen min-w-[956px] flex-1 overflow-hidden">
        <img
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full object-cover"
          src={homeAssets.background}
        />
        <div className="relative ml-[118px] w-[956.349px] pt-[138px]">{children}</div>
      </main>
    </div>
  )
}
