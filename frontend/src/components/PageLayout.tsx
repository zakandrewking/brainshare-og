import React from 'react'
import { Outlet } from 'react-router-dom'

import Navigation from './Navigation'
import DebugBar from '../debug/DebugBar'

import { MessageBoxProvider } from '../context/MessageBox'

function PageLayout () {
  return (
    <MessageBoxProvider>
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
        <Navigation>
          <Outlet />
        </Navigation>
        <DebugBar />
      </div>
    </MessageBoxProvider>
  )
}

export default PageLayout
