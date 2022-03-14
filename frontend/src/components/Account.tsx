import React, { useContext, useEffect, useState } from 'react'
import { get } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { BeatLoader } from 'react-spinners'

import supabase from '../api/supabaseClient'
import { UserSessionContext } from '../context/UserSession'
import { MessageBoxContext } from '../context/MessageBox'
import { Button, Body } from './Components'

export default function Account () {
  const session = useContext(UserSessionContext)
  const setMessage = useContext(MessageBoxContext)
  const navigate = useNavigate()
  const [name, setName] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const saveProfile = async (): Promise<{ error: string | null }> => {
    setLoading(true)
    const user = supabase.auth.user()

    if (user === null) {
      navigate('/log-in')
      return { error: 'No user' }
    }

    const updates = {
      id: user.id,
      name,
      updated_at: new Date()
    }
    const { error } = await supabase.from('profiles').upsert(updates, {
      returning: 'minimal' // Don't return the value after inserting
    })
    if (error) {
      return { error: String(error) }
    }
    setLoading(false)
    return { error: null }
  }

  useEffect(() => {
    // TODO switch to using SWR; see Uploads.tsx
    const getUserData = async () => {
      const user = supabase.auth.user()

      if (user === null) {
        console.warn('No user')
        return navigate('/log-in')
      }

      const { data, error, status } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single()
      // If profile does not exist yet, then lazy create it!
      if (status === 406) {
        const { error } = await saveProfile()
        if (error) setMessage(error)
        // TODO clean up this mess
      } else if (error || !data.name) {
        console.warn(status, error, data)
        setMessage(String(error))
      } else {
        setName(data.name)
      }
    }

    getUserData()
  }, [session])

  return (
    <Body>
      <h3 className="text-2xl font-bold">Account</h3>
      <form action="">
        <div className="mt-4 space-y-6">
          <div className="flex flex-col">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              value={get(session, '.user.email', '')}
              disabled
              className="w-96 px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600
                dark:text-gray-800"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="w-96 px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600
                dark:text-gray-800"
            />
          </div>
          <Button onClick={saveProfile}>
            {loading
              ? (
              <span style={{ top: '3px', position: 'relative' }}>
                <BeatLoader />
              </span>
                )
              : (
                  'Save'
                )}
          </Button>
        </div>
      </form>
    </Body>
  )
}
