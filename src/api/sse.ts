import type { RoadmapProgressEvent } from './types'

interface RawSseEvent {
  event: string
  data: string
}

export function parseSseBlock(block: string): RawSseEvent | null {
  let event = 'message'
  const data: string[] = []

  for (const line of block.split(/\r?\n/)) {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    if (line.startsWith('data:')) data.push(line.slice(5).trimStart())
  }

  return data.length > 0 ? { event, data: data.join('\n') } : null
}

export function toRoadmapProgressEvent(raw: RawSseEvent): RoadmapProgressEvent | null {
  let data: unknown
  try {
    data = JSON.parse(raw.data)
  } catch {
    return null
  }
  if (!data || typeof data !== 'object') return null

  const value = data as Record<string, unknown>
  if (raw.event === 'progress' && typeof value.step === 'string' && typeof value.percent === 'number') {
    return { type: 'progress', step: value.step, percent: value.percent }
  }
  if (raw.event === 'done' && typeof value.roadmapId === 'string') {
    return { type: 'done', roadmapId: value.roadmapId }
  }
  if (raw.event === 'error' && typeof value.code === 'string' && typeof value.message === 'string') {
    return { type: 'error', code: value.code, message: value.message }
  }
  return null
}

export async function consumeSse(
  response: Response,
  onEvent: (event: RoadmapProgressEvent) => void,
) {
  if (!response.body) throw new Error('SSE 응답 본문이 없습니다.')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value, { stream: !done })
    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() ?? ''

    for (const block of blocks) {
      const raw = parseSseBlock(block)
      const event = raw ? toRoadmapProgressEvent(raw) : null
      if (event) onEvent(event)
    }
    if (done) break
  }
}
