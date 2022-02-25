/**
 * Toolbar for debugging UI
 */

import React, { useState, useEffect } from 'react'

/**
 * Toggle dark mode on/off/auto
 */
function DarkMode () {
  const [mode, setMode] = useState('auto')
  useEffect(() => {
    if (
      mode === 'dark' ||
      (mode === 'auto' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  })
  return (
    <div className="space-x-4">
      <span>Dark mode: </span>
      <label>
        <input
          type="radio"
          checked={mode === 'auto'}
          onChange={(e) => {
            setMode('auto')
          }}
        />{' '}
        Auto
      </label>
      <label>
        <input
          type="radio"
          checked={mode === 'dark'}
          onChange={(e) => {
            setMode('dark')
          }}
        />{' '}
        Dark
      </label>
      <label>
        <input
          type="radio"
          checked={mode === 'light'}
          onChange={(e) => {
            setMode('light')
          }}
        />{' '}
        Light
      </label>
    </div>
  )
}

function DebugBar () {
  return (
    <div
      id="debug-toolbar"
      className="sm:rounded-lg px-6 pt-6 pb-6 bg-white dark:bg-slate-800 shadow-xl ring-1 ring-gray-900/5"
    >
      <h1>Debug</h1>
      <DarkMode></DarkMode>
    </div>
  )
}

export default DebugBar
