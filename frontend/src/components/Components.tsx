import React from 'react'

export function Body ({ children }: { children: React.ReactNode }) {
  return (
    <div className="sm:rounded-lg px-6 pt-6 pb-6 bg-white dark:bg-slate-800 shadow-xl ring-1 ring-gray-900/5">
      <div className="max-w-md mx-auto">{children}</div>
    </div>
  )
}

export function Button ({
  onClick,
  disabled = false,
  children
}: {
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      className="duration-150 h-12 py-2.5 px-5 text-sm font-medium
       bg-white border border-gray-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:active:bg-gray-600
       disabled:bg-gray-100 disabled:hover:bg-gray-100 disabled:text-gray-500 dark:disabled:text-gray-400 dark:disabled:bg-gray-700  dark:disabled:hover:bg-gray-700
         focus:z-10 focus:ring-2 focus:ring-blue-700"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
