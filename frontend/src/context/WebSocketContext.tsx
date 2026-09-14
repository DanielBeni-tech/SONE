import { createContext, useContext, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface WebSocketContextValue {
  send: (data: unknown) => void
  subscribe: (handler: (data: any) => void) => () => void
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null)

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const wsRef = useRef<WebSocket | null>(null)
  const handlersRef = useRef<Set<(data: any) => void>>(new Set())

  useEffect(() => {
    if (!token) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handlersRef.current.forEach(h => h(data))
      } catch { /* ignore */ }
    }

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [token])

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data))
    }
  }, [])

  const subscribe = useCallback((handler: (data: any) => void) => {
    handlersRef.current.add(handler)
    return () => { handlersRef.current.delete(handler) }
  }, [])

  return (
    <WebSocketContext.Provider value={{ send, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const ctx = useContext(WebSocketContext)
  if (!ctx) throw new Error('useWebSocket must be used within WebSocketProvider')
  return ctx
}
