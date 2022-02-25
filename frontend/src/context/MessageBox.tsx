import React, { useEffect, useState } from 'react'
import { FaTimes } from 'react-icons/fa'

function MessageBox ({
  message,
  setMessage
}: {
  message: string
  setMessage: (message: string) => void
}) {
  const [visibleMessage, setVisibleMessage] = useState<string>(message)
  // avoid ugly effect where message disappears as you are closing the box
  useEffect(() => {
    if (message !== '') setVisibleMessage(message)
  }, [message])

  return (
    <div
      className="fixed w-screen flex items-center justify-center duration-200 pointer-events-none"
      style={{ top: message === '' ? '-100px' : 0 }}
    >
      <div
        className="relative bg-blue-200 dark:bg-blue-900 text-sm font-bold px-4 py-3 mt-3 mx-3 rounded-lg pointer-events-auto"
        role="alert"
      >
        <span className="mx-6">{visibleMessage}</span>
        <div
          className="absolute top-3 right-3 hover:text-gray-600 dark:hover:text-gray-400 cursor-pointer"
          onClick={() => setMessage('')}
        >
          <FaTimes className="inline" />
        </div>
      </div>
    </div>
  )
}

const MessageBoxContext = React.createContext<any>(null)

function MessageBoxProvider ({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string>('')
  return (
    <MessageBoxContext.Provider value={setMessage}>
      <MessageBox message={message} setMessage={setMessage} />
      {children}
    </MessageBoxContext.Provider>
  )
}

export { MessageBoxContext, MessageBoxProvider }
