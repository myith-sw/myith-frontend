interface AsyncStateProps {
  error?: string
  loading?: boolean
  onRetry?: () => void
}

export function AsyncState({ error, loading, onRetry }: AsyncStateProps) {
  if (loading) {
    return <div className="flex min-h-[360px] items-center justify-center text-sm font-medium text-black/45" role="status">데이터를 불러오고 있어요…</div>
  }
  if (!error) return null

  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-[20px] bg-white px-6 text-center">
      <p className="text-sm font-medium text-[#d65454]" role="alert">{error}</p>
      {onRetry && (
        <button className="rounded-[10px] bg-[#60d4d3] px-5 py-2.5 text-sm font-semibold text-white" onClick={onRetry} type="button">
          다시 시도
        </button>
      )}
    </div>
  )
}
