import type { components } from './openapi.generated'

export type ApiSchemas = components['schemas']
export type GoogleLoginResponse = ApiSchemas['GoogleLoginResponse']
export type UserResponse = ApiSchemas['UserResponse']
export type UpdateMeRequest = ApiSchemas['UpdateMeRequest']
export type JobListResponse = ApiSchemas['JobListResponse']
export type JobAxesResponse = ApiSchemas['JobAxesResponse']
export type JobAxis = ApiSchemas['JobAxis']
export type DiagnosisResponse = ApiSchemas['DiagnosisResponse']
export type CharacterSummary = ApiSchemas['CharacterSummary']
export type CreateRoadmapRequest = ApiSchemas['CreateRoadmapRequest']
export type CreateRoadmapResponse = ApiSchemas['CreateRoadmapResponse']
export type RoadmapDetail = ApiSchemas['RoadmapDetail']
export type QuestItem = ApiSchemas['QuestItem']
export type QuestDetail = ApiSchemas['QuestDetail']
export type SaveStarRequest = ApiSchemas['SaveStarRequest']
export type SaveStarResponse = ApiSchemas['SaveStarResponse']
export type CompleteRequest = ApiSchemas['CompleteRequest']
export type CompleteResponse = ApiSchemas['CompleteResponse']
export type AiEnhancementRequest = ApiSchemas['AiEnhancementRequest']
export type AiEnhancementResult = ApiSchemas['AiEnhancementResult']
export type DashboardResponse = ApiSchemas['DashboardResponse']
export type PresignResponse = ApiSchemas['PresignResponse']
export type ExperienceCard = ApiSchemas['ExperienceCard']
export type HealthResponse = ApiSchemas['HealthResponse']
export type HeartbeatResponse = ApiSchemas['HeartbeatResponse']
export type StarInput = ApiSchemas['StarInput']
export type AxisItem = ApiSchemas['AxisItem']

export interface ApiEnvelope<T> {
  data: T
  meta?: {
    nextCursor?: string | null
    hasNext?: boolean
    retryAfterSeconds?: number | null
  }
}

export interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
    fieldErrors?: Record<string, string>
    requestId?: string
  }
  meta?: {
    retryAfterSeconds?: number
  }
}

export type RoadmapProgressEvent =
  | { type: 'progress'; step: string; percent: number }
  | { type: 'done'; roadmapId: string }
  | { type: 'error'; code: string; message: string }
