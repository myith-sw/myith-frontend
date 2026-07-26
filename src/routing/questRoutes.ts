function normalizeRouteId(value: string | undefined) {
  const normalized = value?.trim()
  return normalized || undefined
}

export function questDetailPath(roadmapId: string, questId: string) {
  return `/roadmaps/${encodeURIComponent(roadmapId)}/quests/${encodeURIComponent(questId)}`
}

export function resolveQuestRoadmapId(
  routeRoadmapId: string | undefined,
  responseRoadmapId: string | undefined,
) {
  return normalizeRouteId(responseRoadmapId) ?? normalizeRouteId(routeRoadmapId)
}
