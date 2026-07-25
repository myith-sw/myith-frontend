import { useContext } from 'react'
import { ApplicationContext } from './applicationContextValue'

export function useApplication() {
  const value = useContext(ApplicationContext)
  if (!value) throw new Error('useApplication must be used within ApplicationProvider')
  return value
}
