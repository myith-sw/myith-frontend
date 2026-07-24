import { onboardingAssets } from '../assets/onboarding'

export function ComingSoonCard() {
  return (
    <article
      className="flex h-full min-h-[119px] w-full items-center justify-center rounded-[20px] border border-dashed border-[#aaa] bg-[#fdfdfd] p-5 text-center opacity-50"
    >
      <div className="flex flex-col items-center gap-[11px] opacity-50">
        <img
          alt=""
          aria-hidden="true"
          className="h-[15px] w-[13.1px]"
          height={15}
          src={onboardingAssets.comingSoonLock}
          width={13.1}
        />
        <p className="text-sm font-medium tracking-[-0.28px]">준비중</p>
        <p className="text-xs font-medium tracking-[-0.24px]">더 많은 직무가 추가될 예정이에요</p>
      </div>
    </article>
  )
}
