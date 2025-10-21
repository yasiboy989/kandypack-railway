import { useEffect, useMemo, useState } from 'react'
import apiFetch from '../../utils/api'
import './Profile.css'

type Emp = { id: number | string; name?: string; firstName?: string; lastName?: string; role?: string; email?: string; phone?: string; hours_worked_week?: number }

function Profile() {
  const [employee, setEmployee] = useState<Emp | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<Array<{ id: string | number; customerName?: string; date?: string }>>([])

  const assistantId = useMemo(() => {
    const storedEmpId = (localStorage.getItem('employee_id') || '').trim()
    const storedUserId = (localStorage.getItem('user_id') || '').trim()
    const empId = /^\d+$/.test(storedEmpId) ? Number(storedEmpId) : null
    return empId ?? (/^\d+$/.test(storedUserId) ? Number(storedUserId) : null)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        // fetch employees (backend B) and find current assistant
        const empRes = await apiFetch('/employees')
        if (!empRes.ok) throw new Error('Failed to load employee')
        const list = await empRes.json()
        const normalized: Emp[] = (list || []).map((e: any) => ({
          id: e.employee_id ?? e.id ?? e[0],
          name: e.name ?? ([e.firstName, e.lastName].filter(Boolean).join(' ') || undefined),
          firstName: e.firstName,
          lastName: e.lastName,
          role: e.role ?? e.type,
          email: e.email,
          phone: e.phone,
          hours_worked_week: e.hours_worked_week ?? e.hours ?? undefined,
        }))
        const mine = normalized.find((x) => String(x.id) === String(assistantId)) || null
        setEmployee(mine)

        // Build simple history from recent orders linked to deliveries for this assistant
        // Strategy: fetch deliveries to get those assigned to assistant, then fetch /api/orders and filter by delivery_id
        const delRes = await apiFetch('/deliveries/deliveries')
        const ordRes = await apiFetch('/api/orders')
        if (delRes.ok && ordRes.ok) {
          const dels = await delRes.json()
          const myDelIds = new Set((dels || []).filter((d: any) => (d.assistant_employee_id ?? d.assistantId) == assistantId).map((d: any) => d.delivery_id ?? d.id ?? d[0]))
          const orders = await ordRes.json()
          const recent = (orders || [])
            .filter((o: any) => myDelIds.has(o.delivery_id ?? o.deliveryId ?? o[5]))
            .slice(0, 10)
            .map((o: any) => ({
              id: o.id ?? o.order_id ?? o[0],
              customerName: o.customerName ?? o.customer_name ?? o[1],
              date: o.orderDate ?? o.scheduleDate ?? undefined,
            }))
          setHistory(recent)
        } else {
          setHistory([])
        }
      } catch (e) {
        if (e instanceof Error) setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [assistantId])

  const weekly = employee?.hours_worked_week ?? 0
  const maxWeekly = 40
  const name = employee?.name || [employee?.firstName, employee?.lastName].filter(Boolean).join(' ') || 'Assistant'

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'var(--warning-color, #d97706)' }}>Error: {error}</div>}
      {!loading && !error && (
        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar">{String(name).charAt(0)}</div>
              <div className="profile-name">{name}</div>
              <div className="profile-id">ID: {employee?.id ?? assistantId ?? '-'}</div>
            </div>
            <div className="profile-details">
              <div className="detail-item">
                <div className="detail-label">Phone</div>
                <div className="detail-value">{employee?.phone ?? '-'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Email</div>
                <div className="detail-value">{employee?.email ?? '-'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Role</div>
                <div className="detail-value">{employee?.role ?? 'assistant'}</div>
              </div>
            </div>
            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-label">Weekly Hours</div>
                <div className="stat-value">{weekly} / {maxWeekly}</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${Math.min(100, Math.round((weekly / maxWeekly) * 100))}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="history-card">
            <h2>Recent Orders</h2>
            <div className="history-list">
              {history.length === 0 && <div style={{ color: 'var(--neutral-400)' }}>No recent orders found.</div>}
              {history.map((assignment) => (
                <div key={String(assignment.id)} className="history-item">
                  <div className="history-info">
                    <div className="history-customer">{assignment.customerName ?? 'Customer'}</div>
                    <div className="history-order">Order ID: {assignment.id}</div>
                  </div>
                  <div className="history-date">{assignment.date ? new Date(assignment.date).toLocaleDateString() : '-'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
