import React, { useEffect, useState } from 'react'
import supabase from '../api/supabaseClient'
import { Session } from '@supabase/supabase-js'

const UserSessionContext = React.createContext<Session | null>(null)

function UserSessionProvider ({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    setSession(supabase.auth.session())

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <UserSessionContext.Provider value={session}>
      {children}
    </UserSessionContext.Provider>
  )
}

export { UserSessionContext, UserSessionProvider }
