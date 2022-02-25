import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { logIn } from '../api/auth'
import { Button } from './Components'
import { BeatLoader } from 'react-spinners'

import { MessageBoxContext } from '../context/MessageBox'
import { UserSessionContext } from '../context/UserSession'

function LogIn () {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const setMessage = useContext(MessageBoxContext)
  const userSession = useContext(UserSessionContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (userSession) {
      navigate('/')
    }
  })

  return (
    <div className="flex items-center justify-center">
      <div className="px-8 py-6 mt-4 text-left rounded-lg bg-white dark:bg-slate-800 shadow-lg">
        <h3 className="text-2xl font-bold text-center">
          Log in to your account
        </h3>
        <form action="">
          <div className="mt-4">
            <label className="block" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600
                dark:text-gray-800"
            />
            <span className="text-xs tracking-wide text-red-600"></span>
            <div className="flex items-baseline justify-between pt-6">
              <Button
                onClick={async (e) => {
                  e.preventDefault()
                  setLoading(true)
                  const errorMessage = await logIn(email)
                  setMessage(
                    errorMessage ||
                      'Success! Check your email for a link to log in.'
                  )
                  setLoading(false)
                }}
                disabled={loading}
              >
                {loading
                  ? (
                  <span style={{ top: '3px', position: 'relative' }}>
                    <BeatLoader />
                  </span>
                    )
                  : (
                      'Log In'
                    )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LogIn
