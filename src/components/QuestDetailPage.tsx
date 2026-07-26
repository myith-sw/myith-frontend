import { useCallback, useEffect, useRef, useState } from 'react'
import { completeQuest, pollAiEnhancement, requestAiEnhancement, saveStar } from '../api/endpoints'
import type { QuestDetail, StarInput } from '../api/types'
import { homeAssets } from '../assets/home'
import { questDetailAssets } from '../assets/quest-detail'
import { AIAssistModal, type StarRecord } from './AIAssistModal'

interface QuestDetailPageProps {
  onBack: () => void
  onDirtyChange?: (isDirty: boolean) => void
  onUpdated?: () => void
  quest: QuestDetail
}

const starFields = [
  { id: 'situation', label: '상황 (Situation)', placeholder: '이 퀘스트를 시작하게 된 배경을 적어보세요.' },
  { id: 'task', label: '과제 (Task)', placeholder: '이번 퀘스트에서 해결하려던 목표를 적어보세요.' },
  { id: 'action', label: '행동 (Action)', placeholder: '목표를 위해 실제로 한 행동을 적어보세요.' },
  { id: 'result', label: '결과 (Result)', placeholder: '정리 후 얻은 결과나 배운 점을 적어보세요.' },
] as const

function normalizeStar(star: StarInput | null | undefined): StarRecord {
  return {
    situation: star?.situation ?? '',
    task: star?.task ?? '',
    action: star?.action ?? '',
    result: star?.result ?? '',
  }
}

function recordsMatch(left: StarRecord, right: StarRecord) {
  return starFields.every(({ id }) => left[id] === right[id])
}

function hasWrittenStar(record: StarRecord) {
  return starFields.some(({ id }) => record[id].trim().length > 0)
}

export function QuestDetailPage({ onBack, onDirtyChange, onUpdated, quest }: QuestDetailPageProps) {
  const [starRecord, setStarRecord] = useState<StarRecord>(() => normalizeStar(quest.star))
  const [persistedStar, setPersistedStar] = useState<StarRecord>(() => normalizeStar(quest.star))
  const [hasPersistedStar, setHasPersistedStar] = useState(() => hasWrittenStar(normalizeStar(quest.star)))
  const [status, setStatus] = useState(quest.status)
  const [version, setVersion] = useState(quest.version ?? 0)
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')
  const starRef = useRef(starRecord)
  const savePromiseRef = useRef<Promise<void> | null>(null)
  const isLocked = status === 'LOCKED'
  const isDirty = !recordsMatch(starRecord, persistedStar)

  useEffect(() => {
    const next = normalizeStar(quest.star)
    starRef.current = next
    setStarRecord(next)
    setPersistedStar(next)
    setHasPersistedStar(hasWrittenStar(next))
    setStatus(quest.status)
    setVersion(quest.version ?? 0)
    setSaveState('idle')
  }, [quest])

  useEffect(() => {
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  useEffect(() => {
    return () => {
      onDirtyChange?.(false)
    }
  }, [onDirtyChange])

  const saveNow = useCallback(async (source: 'manual' | 'ai-assisted' = 'manual', aiEnhancementId?: string) => {
    if (!quest.questId || isLocked) return
    if (savePromiseRef.current) await savePromiseRef.current

    const submittedRecord = { ...starRef.current }
    setSaveState('saving')
    setError('')
    const promise = saveStar(quest.questId, {
      star: submittedRecord,
      source,
      aiEnhancementId: aiEnhancementId ?? null,
    })
      .then((result) => {
        setStatus(result.status)
        setPersistedStar(submittedRecord)
        setHasPersistedStar(true)
        setSaveState(recordsMatch(starRef.current, submittedRecord) ? 'saved' : 'idle')
      })
      .catch((nextError: unknown) => {
        setSaveState('error')
        setError(nextError instanceof Error ? nextError.message : 'STAR 저장에 실패했습니다.')
        throw nextError
      })
      .finally(() => {
        savePromiseRef.current = null
      })
    savePromiseRef.current = promise
    await promise
  }, [isLocked, quest.questId])

  const requestEnhancement = useCallback(async (signal: AbortSignal) => {
    await saveNow()
    if (!quest.questId) throw new Error('퀘스트 ID가 없습니다.')
    const accepted = await requestAiEnhancement(quest.questId, {
      star: starRef.current,
      locale: 'ko-KR',
      style: 'resume',
    })
    if (!accepted.requestId) throw new Error('AI 요청 ID를 받지 못했습니다.')
    const result = await pollAiEnhancement(accepted.requestId, signal)
    if (result.status === 'FAILED') throw new Error(result.errorCode ?? 'AI 보완에 실패했습니다.')
    if (!result.enhancedStar) throw new Error('AI 보완 결과가 비어 있습니다.')
    return {
      enhancementId: accepted.requestId,
      record: normalizeStar(result.enhancedStar),
    }
  }, [quest.questId, saveNow])

  const canComplete = !isLocked && starFields.every(({ id }) => starRecord[id].trim())
  const canEnhance = !isLocked && (hasPersistedStar || canComplete)
  const canSubmit = canComplete && (!hasPersistedStar || isDirty)

  const submitStar = async () => {
    if (!quest.questId || !canSubmit) return
    try {
      await saveNow()
      if (!hasPersistedStar) {
        const result = await completeQuest(
          quest.questId,
          { completed: true, version },
        )
        setStatus(result.quest?.status)
        setVersion(result.quest?.version ?? version + 1)
      }
      onUpdated?.()
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'STAR 저장에 실패했습니다.')
    }
  }

  return (
    <section className="w-full pb-24">
      <button
        className="flex items-center gap-[6px] text-sm font-medium tracking-[-0.28px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
        onClick={onBack}
        type="button"
      >
        <img alt="" aria-hidden="true" className="h-2.5 w-[11.6px] rotate-180" src={homeAssets.archiveBackArrow} />
        로드맵으로
      </button>

      <article className="mt-[18px] rounded-[20px] bg-white p-5">
        <div className="flex flex-col gap-[14px]">
          <div className="flex gap-2">
            <span className="rounded-[10px] bg-[#efefef] px-2.5 py-[2px] text-xs font-medium">Stage {quest.level}</span>
            <span className="rounded-[10px] bg-[#efefef] px-2.5 py-[2px] text-xs font-medium">{quest.axisName}</span>
          </div>
          <h1 className="text-[22px] font-semibold tracking-[-0.44px]">{quest.title}</h1>
        </div>

        <div className="mt-[18px] flex flex-col gap-[14px]">
          <div className="grid grid-cols-2 gap-3">
            {quest.ncsUnit && (
              <QuestInfoCard
                icon={questDetailAssets.ncsReference}
                label="NCS 능력단위 근거"
                value={[quest.ncsUnit.name, quest.ncsUnit.description].filter(Boolean).join(' · ')}
              />
            )}
            <QuestInfoCard
              icon={questDetailAssets.certificate}
              label="추천 자격"
              value={quest.certifications?.map((item) => item.name).filter(Boolean).join(', ') || '해당 없음'}
            />
          </div>
          {quest.completionCriteria && <QuestInfoCard label="완료 기준" value={quest.completionCriteria} />}
        </div>
      </article>

      <article className="mt-[18px] rounded-[20px] bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-[-0.36px]">퀘스트 기록 (STAR)</h2>
          <span className="text-xs font-medium text-black/40" role="status">
            {saveState === 'saving'
              ? '저장 중…'
              : saveState === 'saved'
                ? '저장됨'
                : saveState === 'error'
                  ? '저장 실패'
                  : ''}
          </span>
        </div>

        <div className="mt-[18px] flex flex-col gap-2.5">
          {starFields.map((field) => (
            <label className="flex flex-col gap-2" key={field.id}>
              <span className="w-fit rounded-[13px] bg-[#59d8d4] px-3 py-1.5 text-sm font-medium text-white">{field.label}</span>
              <textarea
                className="h-[85px] min-h-[85px] w-full resize-y rounded-[10px] border border-[#e4e4e4] px-[14px] py-2.5 text-[13px] font-medium tracking-[0.52px] outline-none placeholder:text-black/50 focus:border-[#7dcecb] focus:ring-2 focus:ring-[#7dcecb]/20"
                disabled={isLocked}
                maxLength={2000}
                onChange={(event) => {
                  const next = { ...starRef.current, [field.id]: event.target.value }
                  starRef.current = next
                  setStarRecord(next)
                  setSaveState('idle')
                }}
                placeholder={field.placeholder}
                value={starRecord[field.id]}
              />
              <span className="text-right text-[11px] text-black/35">
                {starRecord[field.id].length}/2000
              </span>
            </label>
          ))}
        </div>

        {error && <p className="mt-3 text-right text-sm font-medium text-[#d65454]" role="alert">{error}</p>}

        <div className="mt-[18px] flex justify-end gap-2.5 pt-2.5">
          <button
            className="flex items-center gap-2 rounded-[10px] border-[1.2px] border-[#f1e7ff] bg-[rgba(231,214,255,0.24)] px-5 py-3 text-sm font-medium text-[#9954ff] disabled:opacity-35"
            disabled={!canEnhance}
            onClick={() => setIsAiModalOpen(true)}
            type="button"
          >
            <img alt="" aria-hidden="true" className="h-[15.341px] w-3.5" src={questDetailAssets.aiEnhance} />
            AI로 강화하기
          </button>
          <button
            className={`relative flex w-[190px] items-center justify-center rounded-[10px] border-[1.2px] px-5 py-3 text-sm font-medium transition-colors ${
              canSubmit
                ? 'border-[#59d8d4] bg-[#59d8d4] text-white'
                : 'border-[#eaeaea] bg-[#f7f7f7] text-black/60 opacity-40'
            }`}
            disabled={!canSubmit}
            onClick={() => void submitStar()}
            type="button"
          >
            <img
              alt=""
              aria-hidden="true"
              className={`absolute left-6 h-[11.2px] w-3.5 ${
                canSubmit ? 'brightness-0 invert' : ''
              }`}
              src={questDetailAssets.completeQuest}
            />
            <span>{hasPersistedStar ? '수정하기' : '완료하고 역량 채우기'}</span>
          </button>
        </div>
      </article>

      <AIAssistModal
        onApply={(record, enhancementId) => {
          starRef.current = record
          setStarRecord(record)
          setSaveState('idle')
          setIsAiModalOpen(false)
          void saveNow('ai-assisted', enhancementId)
        }}
        onClose={() => setIsAiModalOpen(false)}
        open={isAiModalOpen}
        originalRecord={starRecord}
        requestEnhancement={requestEnhancement}
      />
    </section>
  )
}

function QuestInfoCard({ icon, label, value }: { icon?: string; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[10px] bg-[#f9f9f9] px-[14px] py-4">
      <div className="flex items-center gap-2 text-xs font-medium opacity-50">
        {icon && <img alt="" aria-hidden="true" className="size-3 object-contain" src={icon} />}
        {label}
      </div>
      <p className="text-[13px] font-medium">{value}</p>
    </div>
  )
}
