/*
 * Singleton for using debugging lasers, especially for websockets
 */

let sendLasers = (m: string) => console.log('Nowhere to send lasers')
let onLasers = (m: string) => console.log('No one to receive lasers')

const setSendLasers = (fn: (m: string) => void) => {
  sendLasers = fn
}
const setOnLasers = (fn: (m: string) => void) => {
  onLasers = fn
}

export { onLasers, setOnLasers, sendLasers, setSendLasers }
