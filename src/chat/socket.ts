import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { API_URL, getToken } from '../lib/api'

let socket: Socket | null = null

// Lazily create a single shared socket connection.
export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      transports: ['websocket'],
      auth: { token: getToken() },
    })
  }
  return socket
}
