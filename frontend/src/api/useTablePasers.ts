/*
 * Singleton for accessing table-parser websocket service
 *
 * consider using this if necessary: https://github.com/pladaria/reconnecting-websocket
 */

import { useEffect } from 'react'

let websocket: WebSocket | null = null

export function getWebSocket () {
  if (!websocket) {
    const url = 'ws://' + window.location.host + '/api/table-parser/sock'
    websocket = new WebSocket(url)
  }
  return websocket
}

export function sendMessage (message: string | Blob) {
  if (!websocket) throw Error('No websocket')
  websocket.send(message)
}

export function sendJsonMessage (message: any) {
  if (!websocket) throw Error('No websocket')
  websocket.send(JSON.stringify(message))
}

// track all the listeners
interface Listener {
  name: string
  onMessage: (m: string) => void
}
const listeners: { [key: string]: Listener } = {}

export function useTableParser (options: Listener) {
  useEffect(() => {
    return () => {
      delete listeners[options.name]
    }
  })
}
