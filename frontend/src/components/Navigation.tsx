import React, { useContext, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  FaAddressBook,
  FaHamburger,
  FaSignInAlt,
  FaSignOutAlt,
  FaTimes,
  FaUpload,
  FaUserAstronaut
} from 'react-icons/fa'

import { UserSessionContext } from '../context/UserSession'
import { logOut } from '../api/auth'

const Logo = () => (
  <Link to="/">
    <div
      className="text-3xl md:text-5xl md:p-3"
      style={{ fontFamily: "'Domine', serif" }}
    >
      Brainshare
    </div>
  </Link>
)
const NavButton = ({
  to = '#',
  onClick = () => {},
  icon = null,
  children,
  setOpen = () => {}
}: {
  to?: string
  onClick?: () => void
  icon?: React.ReactNode
  children: React.ReactNode
  setOpen: (open: boolean) => void
}) => (
  <NavLink
    to={to}
    onClick={() => {
      setOpen(false)
      onClick()
    }}
    className={(navData) =>
      (navData.isActive ? 'bg-slate-200 dark:bg-slate-800 ' : '') +
      'flex items-center p-2 text-base font-normal duration-150 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 active:hover:bg-slate-300 active:dark:hover:bg-slate-700'
    }
  >
    {/* TODO put these click effects in one place */}
    {icon}
    <span className="flex-1 ml-3 whitespace-nowrap">{children}</span>
    {/* tag examples: */}
    {/* <span className="inline-flex justify-center items-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300">
                  Pro
                </span> */}
    {/* <span className="inline-flex justify-center items-center p-3 ml-3 w-3 h-3 text-sm font-medium text-blue-600 bg-blue-200 rounded-full dark:bg-blue-900 dark:text-blue-200">
                  3
                </span> */}
  </NavLink>
)

export default function Navigation ({
  children
}: {
  children: React.ReactNode
}) {
  const session = useContext(UserSessionContext)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col items-left pb-3">
      <div className="flex flex-row items-center">
        {/* Responsive Nav */}
        <button
          className="flex flex-col items-center md:hidden p-3 duration-150 text-slate-800 dark:text-slate-200 hover:text-slate-700 hover:dark:text-slate-300 active:text-slate-600 active:dark:text-slate-400"
          onClick={() => setOpen(!open)}
        >
          {open ? <FaTimes /> : <FaHamburger />}
          <span className="text-xs">MENU</span>
        </button>
        <Logo />
      </div>

      <div className="flex flex-row flex-wrap">
        {/* Menu based on https://github.com/themesberg/flowbite/blob/f3d8cb6f0fc9678d060196f0a542688c24b9159e/content/components/sidebar.md */}
        <nav
          className={
            'w-screen md:w-48 border-b md:border-b-0 md:border-r shadow-lg md:shadow-none ' +
            'border-slate-200 dark:border-slate-800 ' +
            `flex-col gap-2 md:flex ${open ? '' : 'hidden'}`
          }
        >
          {/* Home */}
          <NavButton to="/" icon={<FaAddressBook />} setOpen={setOpen}>
            Home
          </NavButton>
          {/* Account Management */}
          {session
            ? (
            <React.Fragment>
              <NavButton to="/uploads" icon={<FaUpload />} setOpen={setOpen}>
                Uploads
              </NavButton>
              <NavButton
                to="/account"
                icon={<FaUserAstronaut />}
                setOpen={setOpen}
              >
                My Account
              </NavButton>
              <NavButton
                to="/log-out"
                onClick={async () => {
                  await logOut()
                  navigate('/')
                }}
                icon={<FaSignOutAlt />}
                setOpen={setOpen}
              >
                Log Out
              </NavButton>
            </React.Fragment>
              )
            : (
            <NavButton to="/log-in" icon={<FaSignInAlt />} setOpen={setOpen}>
              Log In
            </NavButton>
              )}
        </nav>

        {/* Content */}
        <main className="grow pt-2 md:pt-2 md:px-2">{children}</main>
      </div>
    </div>
  )
}
