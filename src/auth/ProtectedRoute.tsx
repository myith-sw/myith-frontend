import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export function ProtectedRoute() {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f6f6f6] text-sm font-medium text-black/50">세션을 확인하고 있어요…</div>
  }
  if (!user) return <Navigate replace state={{ from: `${location.pathname}${location.search}` }} to="/login" />
  return <Outlet />
}
