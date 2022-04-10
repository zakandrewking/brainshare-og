import React, { useState } from 'react'

export default function PrepareBase () {
  const [status, setStatus] = useState('')

  // connect to websockets & get status

  return (
    <div>
      <h1>PrepareBase</h1>
      <div>Status: {status}</div>
    </div>
  )
}
