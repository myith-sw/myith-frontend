import { homeAssets } from '../assets/home'
import {
  eggOptions as defaultEggOptions,
  type EggId,
  type EggOption,
} from '../data/home'

interface EggSelectionHomeProps {
  disabled?: boolean
  eggOptions?: EggOption[]
  selectedEggId: EggId | null
  onSelectEgg: (eggId: EggId) => void
  onContinue: () => void
}

export function EggSelectionHome({
  disabled = false,
  eggOptions = defaultEggOptions,
  selectedEggId,
  onSelectEgg,
  onContinue,
}: EggSelectionHomeProps) {
  return (
    <section className="flex w-full flex-col items-center gap-[50px]">
      <header className="flex flex-col items-center gap-[10px]">
        <p className="text-sm leading-[17px] font-medium tracking-[-0.28px] opacity-50">
          새로운 시작
        </p>
        <h1 className="h-[30px] text-[28px] leading-[30px] font-semibold tracking-[-0.84px]">
          알을 골라 신화를 시작해보세요
        </h1>
      </header>

      <div className="flex w-full flex-col items-end gap-[50px]">
        <div className="mx-auto flex items-center justify-center gap-[54px]">
          {eggOptions.map((egg) => {
            const isSelected = selectedEggId === egg.id

            return (
              <button
                aria-label={`${egg.alt} 선택`}
                aria-pressed={isSelected}
                className="relative size-[176.768px] border-0 bg-transparent p-0 transition-opacity duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#60d4d3] enabled:cursor-pointer disabled:cursor-default"
                disabled={disabled}
                key={egg.id}
                onClick={() => onSelectEgg(egg.id)}
                style={{ opacity: isSelected ? 1 : 0.2 }}
                type="button"
              >
                {isSelected && (
                  <img
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 size-[188px] max-w-none -translate-x-1/2 -translate-y-1/2"
                    draggable={false}
                    height={188}
                    src={homeAssets.selectionGlow}
                    width={188}
                  />
                )}
                <img
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none size-full object-contain"
                  draggable={false}
                  height={176.768}
                  src={egg.asset}
                  width={176.768}
                />
              </button>
            )
          })}
        </div>

        <button
          className="flex h-[50px] w-[191px] items-center justify-center gap-2 rounded-[10px] text-sm font-semibold text-white transition-colors disabled:cursor-default disabled:bg-[#e9e9e9] enabled:cursor-pointer enabled:bg-[#60d4d3]"
          disabled={disabled || !selectedEggId}
          onClick={onContinue}
          type="button"
        >
          선택할게요
          <img
            alt=""
            aria-hidden="true"
            className="size-3"
            draggable={false}
            height={12}
            src={homeAssets.ctaArrow}
            width={12}
          />
        </button>
      </div>
    </section>
  )
}
