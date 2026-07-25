import type { ProjectExperience } from '../data/onboarding'
import type { CreateRoadmapRequest } from './types'

export interface PreparedRoadmapEvidence {
  file?: File
  narrative?: CreateRoadmapRequest['narrative']
  repoUrl?: string
}

export function prepareRoadmapEvidence(
  projectExperiences: ProjectExperience[],
): PreparedRoadmapEvidence {
  const descriptions = projectExperiences
    .map((experience) => experience.description.trim())
    .filter(Boolean)
  const repoUrl = projectExperiences
    .map((experience) => experience.link.trim())
    .find(Boolean)
  const file = projectExperiences.find((experience) => experience.file)?.file ?? undefined

  return {
    file,
    narrative:
      descriptions.length > 0
        ? {
            experience: descriptions
              .map((description, index) => `${index + 1}. ${description}`)
              .join('\n\n'),
          }
        : undefined,
    repoUrl,
  }
}
