import React from 'react'
import { Outlet } from 'react-router-dom'

import NavigationBar from './NavigationBar'
import DebugBar from './DebugBar'

import { MessageBoxProvider } from '../context/MessageBox'

function PageLayout () {
  return (
    <MessageBoxProvider>
      <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
        <NavigationBar />
        <div className="container sm:px-6 space-y-16 pb-6">
          <Outlet />
          <DebugBar />
        </div>
      </div>
    </MessageBoxProvider>
  )
}

export default PageLayout