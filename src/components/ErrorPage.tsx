import { errorAssets } from '../assets/error'
import { Sidebar } from './Sidebar'

interface ErrorPageProps {
  onHome: () => void
  onLogin: () => void
}

export function ErrorPage({ onHome, onLogin }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen min-w-[1024px] bg-[#fbfbfb] text-[#0f0e00]">
      <Sidebar onHome={onHome} onLogin={onLogin} variant="unauthenticated" />

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
            className="mt-[26px] text-2xl font-semibold leading-normal tracking-[-0.48px] text-black"
            id="error-page-title"
          >
            오류가 발생했어요...
          </h1>
          <p className="mt-[14px] text-lg font-medium leading-normal tracking-[-0.36px] text-black/50">
            네트워크를 확인 후 새로고침해주세요
          </p>
        </section>
      </main>
    </div>
  )
}
