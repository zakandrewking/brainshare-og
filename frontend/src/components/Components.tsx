import React from 'react'

export function Body ({ children }: { children: React.ReactNode }) {
  return (
    <div className="sm:rounded-lg sm:mx-3 p-6 bg-white dark:bg-slate-800 shadow-lg ring-1 ring-gray-900/5">
      {children}
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
      className="duration-150 h-12 py-1 px-4 text-sm font-medium
       bg-white border rounded border-slate-300 dark:border-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:active:bg-slate-600
       disabled:bg-slate-100 disabled:hover:bg-slate-100 disabled:text-slate-500 dark:disabled:text-slate-400 dark:disabled:bg-slate-700  dark:disabled:hover:bg-slate-700
         focus:z-10 focus:ring-2 focus:ring-blue-700"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
