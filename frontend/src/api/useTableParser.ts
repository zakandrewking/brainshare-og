/*
 * Singleton for accessing table-parser websocket service
 */

import { useEffect } from 'react'

import { TableParserMessage } from '../schema/table-parser'

const URL = 'ws://' + window.location.host + '/api/table-parser/sock'
const WEBSOCKET_CLOSE_TIMEOUT_MS = 2000

// If no one is listening after a timeout, then close the websocket
let websocketCloseTimeout: ReturnType<typeof setTimeout> | null = null

// singleton to track all listeners
interface Listener {
  onOpen: () => void
  onClose: () => void
  onMessage: (m: TableParserMessage) => void
}
const listeners: Set<Listener> = new Set()

// websocket
let websocket: WebSocket | null = null
const reopen = () => {
  console.debug('(Re)opening WebSocket')
  if (websocket) {
    websocket.close()
  }
  websocket = new WebSocket(URL)
  // Keep a single copy of the websocket
  websocket.onopen = () => {
    console.debug('WebSocket opened')
    listeners.forEach((listener) => listener.onOpen())
  }
  websocket.onclose = () => {
    // TODO try to reopen
    console.debug('WebSocket closed')
    listeners.forEach((listener) => listener.onClose())
  }
  websocket.onmessage = (event: MessageEvent) => {
    const message: TableParserMessage = JSON.parse(event.data)
    listeners.forEach((listener) => listener.onMessage(message))
  }
}

export default function useTableParser (listener: Listener) {
  useEffect(() => {
    listeners.add(listener)
    console.debug('Added listener', listeners)

    // don't close it now
    if (websocketCloseTimeout) clearTimeout(websocketCloseTimeout)

    // if it's closed or closing, reopen
    if (
      !websocket ||
      websocket.readyState === websocket.CLOSED ||
      websocket.readyState === websocket.CLOSING
    ) {
      reopen()
    } else if (websocket.readyState === websocket.CONNECTING) {
      console.warn('WebSocket still connecting')
    }

    // Clean up any listeners when the component unmounts
    return function cleanup () {
      listeners.delete(listener)
      console.debug('Deleted listener', listeners)

      // If no one is listening after a timeout, then close the websocket after
      // a short delay
      if (listeners.size === 0) {
        if (websocketCloseTimeout) clearTimeout(websocketCloseTimeout)
        websocketCloseTimeout = setTimeout(() => {
          if (websocket) {
            console.debug('Closing websocket')
            websocket.close()
            websocket = null
          }
        }, WEBSOCKET_CLOSE_TIMEOUT_MS)
      }
    }
  }, []) // only run once per component mount

  return {
    sendMessage: (message: string | Blob) => {
      if (!websocket || websocket.readyState !== websocket.OPEN) {
        throw Error('WebSocket not open')
      }
      websocket.send(message)
    },
    sendJsonMessage: (message: TableParserMessage) => {
      if (!websocket || websocket.readyState !== websocket.OPEN) {
        throw Error('WebSocket not open')
      }
      websocket.send(JSON.stringify(message))
    }
  }
}