import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiConfig } from '../api/config'
import loginCloseIcon from '../assets/auth/login-close.svg'
import loginLogo from '../assets/auth/login-logo.png'
import googleShape1 from '../assets/auth/google-shape-1.svg'
import googleShape2 from '../assets/auth/google-shape-2.svg'
import googleShape3 from '../assets/auth/google-shape-3.svg'
import googleShape4 from '../assets/auth/google-shape-4.svg'
import { AppShell } from '../components/AppShell'
import { EggSelectionHome } from '../components/EggSelectionHome'
import { Sidebar } from '../components/Sidebar'
import { useAuth } from './useAuth'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void
        }
      }
    }
  }
}

function GoogleMark() {
  return (
    <span aria-hidden="true" className="relative block h-[17.03px] w-[17.03px] shrink-0">
      <img alt="" className="absolute left-[8.51px] top-[6.97px] h-[8px] w-[8.18px]" src={googleShape1} />
      <img alt="" className="absolute left-[0.9px] top-[10.13px] h-[6.9px] w-[13.25px]" src={googleShape2} />
      <img alt="" className="absolute left-0 top-[4.69px] h-[7.65px] w-[3.75px]" src={googleShape3} />
      <img alt="" className="absolute left-[0.9px] top-0 h-[6.9px] w-[13.31px]" src={googleShape4} />
    </span>
  )
}

export function GoogleLoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const destination = (location.state as { from?: string } | null)?.from ?? '/'

  useEffect(() => {
    if (user) navigate(destination, { replace: true })
  }, [destination, navigate, user])

  const completeLogin = useCallback(async (credential: string) => {
    setSubmitting(true)
    setError('')
    try {
      const result = await login(credential)
      navigate(result.isNewUser ? '/characters/new/egg' : destination, { replace: true })
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : '로그인에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }, [destination, login, navigate])

  useEffect(() => {
    if (!isLoginOpen || apiConfig.useMocks || !apiConfig.googleClientId) return
    const initialize = () => {
      if (!window.google || !googleButtonRef.current) return
      window.google.accounts.id.initialize({
        client_id: apiConfig.googleClientId,
        callback: ({ credential }) => void completeLogin(credential),
      })
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        width: 320,
      })
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-myith-google-login]')
    if (existing) {
      initialize()
      existing.addEventListener('load', initialize, { once: true })
      return () => existing.removeEventListener('load', initialize)
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.myithGoogleLogin = 'true'
    script.addEventListener('load', initialize, { once: true })
    document.head.appendChild(script)
    return () => script.removeEventListener('load', initialize)
  }, [completeLogin, isLoginOpen])

  return (
    <>
      <AppShell
        sidebar={<Sidebar onLogin={() => setIsLoginOpen(true)} variant="unauthenticated" />}
        variant="home"
      >
        <EggSelectionHome
          disabled
          onContinue={() => undefined}
          onSelectEgg={() => undefined}
          selectedEggId={null}
        />
      </AppShell>

      {isLoginOpen && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) setIsLoginOpen(false)
          }}
          role="dialog"
        >
          <section aria-label="MYiTH 로그인" className="w-full max-w-[382px] overflow-hidden rounded-[20px] bg-white px-[10px] pb-[15px] pt-[10px] text-center shadow-[0_20px_80px_rgba(0,0,0,0.24)]">
            <button
              aria-label="로그인 창 닫기"
              className="ml-auto flex size-[28px] items-center justify-center rounded-[10px] p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3]"
              disabled={submitting}
              onClick={() => setIsLoginOpen(false)}
              type="button"
            >
              <img alt="" aria-hidden="true" className="size-5" src={loginCloseIcon} />
            </button>

            <div className="mt-1 flex flex-col items-center">
              <img alt="MYiTH" className="h-[26px] w-20 object-contain" height={26} src={loginLogo} width={80} />
              <p className="mt-5 text-sm font-normal tracking-[-0.28px] text-black/50">로그인하고 MYITH 시작하기</p>

              <div className="mt-[14px] flex min-h-[56px] w-full items-center justify-center">
                {apiConfig.useMocks ? (
                  <button
                    className="flex h-[48.65px] w-[360px] items-center rounded-[17.03px] border border-[#cdcdcd] bg-white px-[16px] text-[#1f1f1f] transition-colors hover:bg-[#f8f8f8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#60d4d3] disabled:opacity-50"
                    disabled={submitting}
                    onClick={() => void completeLogin('mock-google-id-token')}
                    type="button"
                  >
                    <GoogleMark />
                    <span className="flex-1 pr-[17px] text-center text-[17px] font-medium tracking-[-0.34px]">
                      {submitting ? '로그인 중…' : 'Google로 계속하기'}
                    </span>
                  </button>
                ) : !apiConfig.googleClientId ? (
                  <button
                    className="flex h-[48.65px] w-[360px] cursor-not-allowed items-center rounded-[17.03px] border border-[#cdcdcd] bg-white px-[16px] text-[#1f1f1f] opacity-50"
                    disabled
                    type="button"
                  >
                    <GoogleMark />
                    <span className="flex-1 pr-[17px] text-center text-[17px] font-medium tracking-[-0.34px]">
                      Google로 계속하기
                    </span>
                  </button>
                ) : (
                  <div className="flex min-h-[49px] w-[360px] items-center justify-center" ref={googleButtonRef} />
                )}
              </div>
            </div>

            {!apiConfig.useMocks && !apiConfig.googleClientId && (
              <p className="mt-1 text-xs text-[#d65454]">VITE_GOOGLE_CLIENT_ID가 설정되지 않았습니다.</p>
            )}
            {error && <p className="mt-1 text-sm font-medium text-[#d65454]" role="alert">{error}</p>}
          </section>
        </div>
      )}
    </>
  )
}
