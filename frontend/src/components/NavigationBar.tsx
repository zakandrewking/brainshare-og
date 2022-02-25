import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './Components'
import { UserSessionContext } from '../context/UserSession'
import { logOut } from '../api/auth'

function NavigationBar () {
  const session = useContext(UserSessionContext)
  const navigate = useNavigate()

  return (
    <div className="flex p-6 space-x-6">
      <Link to="/">
        <span
          className="text-3xl sm:text-5xl"
          style={{ fontFamily: "'Domine', serif" }}
        >
          Brainshare
        </span>
      </Link>
      <div className="flex-grow"></div>
      {session
        ? (
        <React.Fragment>
          <Link to="/account">
            <Button>My Account</Button>
          </Link>
          <Button
            onClick={async () => {
              await logOut()
              navigate('/')
            }}
          >
            Log Out
          </Button>
        </React.Fragment>
          )
        : (
        <Link to="/log-in">
          <Button>Log In</Button>
        </Link>
          )}
    </div>
  )
}

export default NavigationBar
