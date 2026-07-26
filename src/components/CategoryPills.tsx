import { jobCategories, type CategoryId } from '../data/onboarding'
import { CategoryIcon } from './CategoryIcon'

interface CategoryPillsProps {
  activeCategoryId: CategoryId
  ariaLabel: string
  onSelectCategory?: (categoryId: CategoryId) => void
}

export function CategoryPills({
  activeCategoryId,
  ariaLabel,
  onSelectCategory,
}: CategoryPillsProps) {
  return (
    <div className="flex flex-wrap gap-[6px]" aria-label={ariaLabel}>
      {jobCategories.map((category) => {
        const isActive = category.id === activeCategoryId

        return (
          <button
            aria-pressed={isActive}
            className={`flex h-[37px] items-center gap-2 rounded-[10px] px-4 text-sm tracking-[-0.28px] ${
              isActive
                ? 'bg-[#7dcecb] font-semibold text-white'
                : 'bg-[#f2f2f2] font-medium text-[#717171]'
            } ${onSelectCategory ? 'cursor-pointer' : 'cursor-default'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]`}
            disabled={!onSelectCategory}
            key={category.id}
            onClick={() => onSelectCategory?.(category.id)}
            type="button"
          >
            <CategoryIcon active={isActive} src={category.icon} />
            {category.label}
          </button>
        )
      })}
    </div>
  )
}
