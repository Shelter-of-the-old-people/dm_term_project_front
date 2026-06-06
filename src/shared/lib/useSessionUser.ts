import { useEffect, useState } from 'react'

import { getSessionEventName, hasLoadedSessionUser, readSessionUser, refreshSessionUser } from './mockSession'

export function useSessionUser() {
  const [user, setUser] = useState(() => (hasLoadedSessionUser() ? readSessionUser() : undefined))

  useEffect(() => {
    const sync = () => setUser(hasLoadedSessionUser() ? readSessionUser() : undefined)
    const sessionEventName = getSessionEventName()

    sync()
    window.addEventListener(sessionEventName, sync)
    window.addEventListener('focus', syncSession)

    if (!hasLoadedSessionUser()) {
      void syncSession()
    }

    return () => {
      window.removeEventListener(sessionEventName, sync)
      window.removeEventListener('focus', syncSession)
    }

    async function syncSession() {
      try {
        await refreshSessionUser()
      } catch {
        setUser(null)
      }
    }
  }, [])

  return user
}
