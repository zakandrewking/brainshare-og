import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaAddressBook, FaHamburger } from 'react-icons/fa'

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
  onClick,
  icon = null,
  children
}: {
  to?: string
  onClick?: () => void
  icon?: React.ReactNode
  children: React.ReactNode
}) => (
  <Link to={to} onClick={onClick}>
    <li className="flex items-center p-2 text-base font-normal text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
      {icon}
      <span className="flex-1 ml-3 whitespace-nowrap">{children}</span>
      {/* tag examples: */}
      {/* <span className="inline-flex justify-center items-center px-2 ml-3 text-sm font-medium text-gray-800 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300">
                  Pro
                </span> */}
      {/* <span className="inline-flex justify-center items-center p-3 ml-3 w-3 h-3 text-sm font-medium text-blue-600 bg-blue-200 rounded-full dark:bg-blue-900 dark:text-blue-200">
                  3
                </span> */}
    </li>
  </Link>
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
          <FaHamburger />
          <span className="text-xs">MENU</span>
        </button>
        <Logo />
      </div>

      <div className="flex flex-row flex-wrap">
        {/* Menu based on https://github.com/themesberg/flowbite/blob/f3d8cb6f0fc9678d060196f0a542688c24b9159e/content/components/sidebar.md */}
        <aside
          aria-label="Sidebar"
          className={
            'w-screen md:w-48 border-b md:border-b-0 md:border-r mb-2 md:mb-0 md:mr-2 ' +
            'border-indigo-100 dark:border-indigo-800 ' +
            `md:flex ${open ? '' : 'hidden'}`
          }
        >
          <ul className="w-full space-y-2">
            {/* Home */}
            <NavButton to="/" icon={<FaAddressBook />}>
              Home
            </NavButton>
            {/* Account Management */}
            {session
              ? (
              <React.Fragment>
                <NavButton to="/account">My Account</NavButton>
                <NavButton
                  onClick={async () => {
                    await logOut()
                    navigate('/')
                  }}
                >
                  Log Out
                </NavButton>
              </React.Fragment>
                )
              : (
              <NavButton to="/log-in">Log In</NavButton>
                )}
          </ul>
        </aside>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
