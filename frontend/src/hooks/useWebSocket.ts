import { useEffect, useRef } from 'react'

type OnMessage = (data: any) => void

export function useWebSocket(path: string, onMessage: OnMessage) {
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const base = (import.meta.env.VITE_API_BASE_URL as string) || ''
    // convert http(s) to ws(s) if absolute
    let url = ''
    if (base.startsWith('http')) {
      url = base.replace(/^http/, 'ws') + path
    } else {
      url = path
    }

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      // console.log('WS open', url)
    }
    ws.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data)
        onMessage(payload)
      } catch (e) {
        onMessage(ev.data)
      }
    }
    ws.onclose = () => {
      // reconnect in a bit
      setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          useWebSocket(path, onMessage)
        }
      }, 3000)
    }

    return () => {
      try { ws.close() } catch (e) {}
      wsRef.current = null
    }
  }, [path, onMessage])
}

export default useWebSocket
