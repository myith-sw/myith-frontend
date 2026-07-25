import { describe, expect, it, vi } from 'vitest'
import { consumeSse, parseSseBlock, toRoadmapProgressEvent } from './sse'

describe('SSE parsing', () => {
  it('parses a progress event', () => {
    const raw = parseSseBlock('event: progress\ndata: {"step":"증거 분석","percent":60}')
    expect(raw && toRoadmapProgressEvent(raw)).toEqual({
      type: 'progress',
      step: '증거 분석',
      percent: 60,
    })
  })

  it('handles events split across stream chunks', async () => {
    const encoder = new TextEncoder()
    const response = new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode('event: progress\ndata: {"step":"분'))
          controller.enqueue(encoder.encode('석","percent":80}\n\nevent: done\n'))
          controller.enqueue(encoder.encode('data: {"roadmapId":"rmp-1"}\n\n'))
          controller.close()
        },
      }),
    )
    const listener = vi.fn()
    await consumeSse(response, listener)
    expect(listener).toHaveBeenNthCalledWith(1, { type: 'progress', step: '분석', percent: 80 })
    expect(listener).toHaveBeenNthCalledWith(2, { type: 'done', roadmapId: 'rmp-1' })
  })
})
