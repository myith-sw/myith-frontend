import {
  jobCategories as localJobCategories,
  type JobCategory,
  type JobOption,
} from '../data/onboarding'
import type { JobListResponse } from './types'

export function mapJobCatalog(data: JobListResponse) {
  const serverCategories = data.categories ?? []
  const localCodes = new Set(localJobCategories.map(({ id }) => id))
  const categories: JobCategory[] = localJobCategories

  const jobs: JobOption[] = serverCategories
    .filter((category) => localCodes.has(category.categoryCode ?? ''))
    .flatMap((category) =>
      (category.jobs ?? []).map((job) => ({
        id: job.jobCode ?? '',
        categoryId: category.categoryCode ?? '',
        title: job.jobName ?? '',
        description: job.tagline ?? '',
        skills: job.keywords ?? [],
        available: job.available !== false,
      })),
    )

  return { categories, jobs }
}
