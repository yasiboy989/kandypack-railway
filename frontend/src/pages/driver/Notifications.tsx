import { useCallback, useEffect, useMemo, useState } from 'react'
import apiFetch from '../../utils/api'
import useWebSocket from '../../hooks/useWebSocket'
import './Notifications.css'

type Notice = { id: string | number; message: string; time?: string; read?: boolean }

function Notifications() {
  const [notifications, setNotifications] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const driverId = useMemo(() => {
    const storedEmpId = (localStorage.getItem('employee_id') || '').trim()
    const storedUserId = (localStorage.getItem('user_id') || '').trim()
    const empId = /^\d+$/.test(storedEmpId) ? Number(storedEmpId) : null
    return empId ?? (/^\d+$/.test(storedUserId) ? Number(storedUserId) : null)
  }, [])

  const pushNotice = useCallback((n: Notice) => {
    setNotifications((prev) => [{ ...n, read: false }, ...prev].slice(0, 50))
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const alertsRes = await apiFetch('/report/alerts')
        if (alertsRes.ok) {
          const data = await alertsRes.json()
          const candidateArrays = ['alerts', 'items', 'data', 'results']
          let arr: any[] = []
          if (Array.isArray(data)) {
            arr = data
          } else if (data && typeof data === 'object') {
            const foundKey = candidateArrays.find((k) => Array.isArray((data as any)[k]))
            if (foundKey) {
              arr = (data as any)[foundKey]
            } else {
              const vals = Object.values(data)
              arr = vals.reduce<any[]>((acc, v) => acc.concat(Array.isArray(v) ? v : [v]), [])
            }
          } else if (data) {
            arr = [data]
          }
          const items: Notice[] = (arr || []).map((a: any, idx: number) => ({
            id: a?.id ?? idx,
            message: a?.message ?? a?.type ?? a?.title ?? 'Alert',
            time: a?.time ?? a?.created_at ?? a?.date ?? undefined,
            read: false,
          }))
          setNotifications(items)
        } else {
          setNotifications([])
        }
      } catch (e) {
        if (e instanceof Error) setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Optional: subscribe to live delivery updates for this driver if backend provides ws at /ws/deliveries
  useWebSocket('/ws/deliveries', (data) => {
    try {
      if (data && (data.driver_employee_id == driverId || data.driverId == driverId)) {
        pushNotice({ id: Date.now(), message: `Delivery update: ${data.message ?? data.status ?? 'Changed'}` })
      }
    } catch (e) {
      // ignore
    }
  })

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1>Notifications</h1>
      </div>

      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'var(--yellow-300)' }}>Error: {error}</div>}

      <div className="notifications-list">
        {notifications.length === 0 && !loading && (
          <div style={{ color: 'var(--neutral-400)' }}>No notifications yet.</div>
        )}
        {notifications.map((notification) => (
          <div key={String(notification.id)} className={`notification-item ${notification.read ? 'read' : ''}`}>
            <div className="notification-message">{notification.message}</div>
            <div className="notification-time">{notification.time ? new Date(notification.time).toLocaleString() : ''}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Notifications