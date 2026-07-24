import { jobCategories, type CategoryId } from '../data/onboarding'

interface CategoryPillsProps {
  activeCategoryId: CategoryId
  ariaLabel: string
}

export function CategoryPills({ activeCategoryId, ariaLabel }: CategoryPillsProps) {
  return (
    <div className="flex flex-wrap gap-[6px]" aria-label={ariaLabel}>
      {jobCategories.map((category) => {
        const isActive = category.id === activeCategoryId

        return (
          <span
            className={`flex h-[37px] items-center gap-2 rounded-[10px] px-4 text-sm tracking-[-0.28px] ${
              isActive
                ? 'bg-[#7dcecb] font-semibold text-white'
                : 'bg-[#f2f2f2] font-medium text-[#717171]'
            }`}
            key={category.id}
          >
            <img
              alt=""
              aria-hidden="true"
              className="size-3"
              height={12}
              src={category.icon}
              style={{ filter: isActive ? 'brightness(0) invert(1)' : undefined }}
              width={12}
            />
            {category.label}
          </span>
        )
      })}
    </div>
  )
}
