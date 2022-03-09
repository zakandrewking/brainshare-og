import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaHamburger } from 'react-icons/fa'

import { Button } from './Components'
import { UserSessionContext } from '../context/UserSession'
import { logOut } from '../api/auth'

const Logo = () => (
  <Link to="/">
    <span
      className="text-3xl md:text-5xl"
      style={{ fontFamily: "'Domine', serif" }}
    >
      Brainshare
    </span>
  </Link>
)

export default function Navigation () {
  const session = useContext(UserSessionContext)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <React.Fragment>
      {/* Responsive Nav */}
      <div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <FaHamburger />
        </button>
        <Logo />
        <nav></nav>
      </div>
      <div className={`p-6 space-x-6 md:flex ${open ? '' : 'hidden'}`}>
        <div className="flex-grow"></div>

        {/* Account Management */}
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
    </React.Fragment>
  )
}
