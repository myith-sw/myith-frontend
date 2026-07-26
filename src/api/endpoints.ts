import { apiConfig } from './config'
import {
  apiEnvelopeRequest,
  apiPublicRequest,
  apiPublicValue,
  apiRaw,
  apiRequest,
} from './client'
import { authStore } from './authStore'
import { consumeSse } from './sse'
import type {
  AiEnhancementRequest,
  AiEnhancementResult,
  CharacterSummary,
  CompleteRequest,
  CompleteResponse,
  CreateRoadmapRequest,
  CreateRoadmapResponse,
  DashboardResponse,
  DiagnosisResponse,
  ExperienceCard,
  GoogleLoginResponse,
  HealthResponse,
  HeartbeatResponse,
  JobAxesResponse,
  JobListResponse,
  PresignResponse,
  QuestDetail,
  QuestItem,
  RoadmapDetail,
  RoadmapProgressEvent,
  SaveStarRequest,
  SaveStarResponse,
  UpdateMeRequest,
  UserResponse,
} from './types'

export async function loginWithGoogle(idToken: string) {
  const result = await apiPublicRequest<GoogleLoginResponse>('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
  authStore.setTokens({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  })
  return result
}

export async function restoreSession() {
  const refreshToken = authStore.getRefreshToken()
  if (!refreshToken) return null
  const result = await apiPublicRequest<{ accessToken?: string }>('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  authStore.setTokens({ accessToken: result.accessToken })
  return getMe()
}

export function getMe() {
  return apiRequest<UserResponse>('/api/users/me')
}

export function updateMe(input: UpdateMeRequest) {
  return apiRequest<UserResponse>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteMe() {
  return apiRequest<void>('/api/users/me', { method: 'DELETE' })
}

export function getHealth() {
  return apiPublicValue<HealthResponse>('/api/health')
}

export function getJobs() {
  return apiRequest<JobListResponse>('/api/jobs')
}

export function getJobAxes(jobCode: string) {
  return apiRequest<JobAxesResponse>(`/api/jobs/${encodeURIComponent(jobCode)}/axes`)
}

export function getDiagnosis(jobCode: string) {
  return apiRequest<DiagnosisResponse>(`/api/jobs/${encodeURIComponent(jobCode)}/diagnosis`)
}

export function getCharacters(status: 'active' | 'archived' | 'all' = 'active') {
  return apiRequest<CharacterSummary[]>(`/api/characters?status=${status}`)
}

export function deleteCharacter(characterId: string) {
  return apiRequest<void>(`/api/characters/${encodeURIComponent(characterId)}`, {
    method: 'DELETE',
  })
}

export async function uploadProjectFile(file: File) {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('PDF 파일만 첨부할 수 있습니다.')
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('PDF 파일은 10MB 이하만 첨부할 수 있습니다.')
  }

  const presign = await apiRequest<PresignResponse>('/api/uploads/presign', {
    method: 'POST',
    body: JSON.stringify({ fileName: file.name, contentType: 'application/pdf' }),
  })
  if (!presign.uploadUrl || !presign.fileKey) throw new Error('업로드 URL을 발급받지 못했습니다.')

  if (!apiConfig.useMocks) {
    const response = await fetch(presign.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      body: file,
    })
    if (!response.ok) throw new Error(`파일 업로드에 실패했습니다. (${response.status})`)
  }
  return presign.fileKey
}

export function createRoadmap(input: CreateRoadmapRequest) {
  return apiRequest<CreateRoadmapResponse>('/api/roadmaps', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getRoadmap(roadmapId: string) {
  return apiRequest<RoadmapDetail>(`/api/roadmaps/${encodeURIComponent(roadmapId)}`)
}

export async function subscribeRoadmapProgress(
  roadmapId: string,
  onEvent: (event: RoadmapProgressEvent) => void,
  signal?: AbortSignal,
) {
  const response = await apiRaw(`/api/roadmaps/${encodeURIComponent(roadmapId)}/progress`, { signal })
  await consumeSse(response, onEvent)
}

export function addQuest(
  roadmapId: string,
  input: { title: string; axisCode: string; level: number },
) {
  return apiRequest<QuestItem>(`/api/roadmaps/${encodeURIComponent(roadmapId)}/quests`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function deleteQuest(roadmapId: string, questId: string) {
  return apiRequest<void>(
    `/api/roadmaps/${encodeURIComponent(roadmapId)}/quests/${encodeURIComponent(questId)}`,
    { method: 'DELETE' },
  )
}

export function getQuest(questId: string) {
  return apiRequest<QuestDetail>(`/api/quests/${encodeURIComponent(questId)}`)
}

export function saveStar(questId: string, input: SaveStarRequest) {
  return apiRequest<SaveStarResponse>(`/api/quests/${encodeURIComponent(questId)}/star`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function completeQuest(questId: string, input: CompleteRequest) {
  return apiRequest<CompleteResponse>(`/api/quests/${encodeURIComponent(questId)}/complete`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function requestAiEnhancement(questId: string, input: AiEnhancementRequest) {
  return apiRequest<{ requestId?: string }>(`/api/quests/${encodeURIComponent(questId)}/ai-enhancements`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getAiEnhancement(requestId: string) {
  return apiRequest<AiEnhancementResult>(`/api/ai-enhancements/${encodeURIComponent(requestId)}`)
}

export async function pollAiEnhancement(requestId: string, signal?: AbortSignal) {
  while (!signal?.aborted) {
    const result = await getAiEnhancement(requestId)
    if (result.status === 'COMPLETED' || result.status === 'FAILED') return result
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(resolve, apiConfig.useMocks ? 100 : 2_000)
      signal?.addEventListener(
        'abort',
        () => {
          window.clearTimeout(timeout)
          reject(new DOMException('Aborted', 'AbortError'))
        },
        { once: true },
      )
    })
  }
  throw new DOMException('Aborted', 'AbortError')
}

export function getDashboard(roadmapId: string) {
  return apiRequest<DashboardResponse>(`/api/roadmaps/${encodeURIComponent(roadmapId)}/dashboard`)
}

export function getStarRecords(options: {
  axis?: string
  completeness?: 'all' | 'complete' | 'partial'
  cursor?: string
  size?: number
  tag?: string
} = {}) {
  const search = new URLSearchParams()
  if (options.cursor) search.set('cursor', options.cursor)
  if (options.size !== undefined) search.set('size', String(options.size))
  if (options.axis) search.set('axis', options.axis)
  if (options.completeness) search.set('completeness', options.completeness)
  if (options.tag) search.set('tag', options.tag)
  const query = search.size > 0 ? `?${search.toString()}` : ''
  return apiEnvelopeRequest<ExperienceCard[]>(`/api/star/records${query}`)
}

export function sendHeartbeat() {
  return apiRequest<HeartbeatResponse>('/api/heartbeat', { method: 'POST' })
}

function parseFilename(contentDisposition: string | null, fallback: string) {
  if (!contentDisposition) return fallback
  const utf8 = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8?.[1]) return decodeURIComponent(utf8[1])
  const regular = contentDisposition.match(/filename="?([^";]+)"?/i)
  return regular?.[1] ?? fallback
}

export async function downloadRoadmapExport(roadmapId: string, format: 'md' | 'pdf') {
  const response = await apiRaw(`/api/roadmaps/${encodeURIComponent(roadmapId)}/export?format=${format}`)
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = parseFilename(response.headers.get('Content-Disposition'), `myith-export.${format}`)
  anchor.click()
  URL.revokeObjectURL(url)
}
