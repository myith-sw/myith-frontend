import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApplication } from '../app/useApplication'
import { useAuth } from './useAuth'

function ProtectedApplication() {
  const location = useLocation()
  const { refreshCharacters } = useApplication()

  useEffect(() => {
    void refreshCharacters()
  }, [location.pathname, refreshCharacters])

  return <Outlet />
}

export function ProtectedRoute() {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f6f6f6] text-sm font-medium text-black/50">세션을 확인하고 있어요…</div>
  }
  if (!user) return <Navigate replace state={{ from: `${location.pathname}${location.search}` }} to="/login" />
  return <ProtectedApplication />
}
