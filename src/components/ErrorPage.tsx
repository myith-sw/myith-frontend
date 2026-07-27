import type { ReactNode } from 'react'
import { errorAssets } from '../assets/error'

interface ErrorPageProps {
  onHome: () => void
  sidebar: ReactNode
}

export function ErrorPage({ onHome, sidebar }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen min-w-[1024px] bg-[#fbfbfb] text-[#0f0e00]">
      {sidebar}

      <main className="relative min-h-screen min-w-0 flex-1 overflow-hidden">
        <section
          aria-labelledby="error-page-title"
          className="relative -left-[15px] mx-auto flex w-full flex-col items-center pt-[clamp(96px,16.7vh,171px)] text-center"
        >
          <img
            alt=""
            aria-hidden="true"
            className="h-[263.52px] w-[334.943px]"
            height={263.52}
            src={errorAssets.networkError}
            width={334.943}
          />
          <h1
            className="mt-5 text-2xl font-semibold leading-normal tracking-[-0.48px] text-black"
            id="error-page-title"
          >
            오류가 발생했어요...
          </h1>
          <button
            className="mt-5 flex h-[50px] w-[230px] items-center justify-center gap-2.5 rounded-[14px] bg-[#6bd8d5] px-2.5 text-lg font-semibold tracking-[-0.36px] text-white transition-colors hover:bg-[#59d8d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f0e00]"
            onClick={onHome}
            type="button"
          >
            홈으로 돌아가기
            <img
              alt=""
              aria-hidden="true"
              className="size-6 rotate-180"
              src={errorAssets.homeArrow}
            />
          </button>
        </section>
      </main>
    </div>
  )
}
