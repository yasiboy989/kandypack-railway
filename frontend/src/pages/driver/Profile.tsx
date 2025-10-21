import { useEffect, useMemo, useState } from 'react'
import apiFetch from '../../utils/api'
import './Profile.css'

type Emp = { id: number | string; name?: string; firstName?: string; lastName?: string; role?: string; email?: string; phone?: string; hours_worked_week?: number }

function Profile() {
  const [employee, setEmployee] = useState<Emp | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const driverId = useMemo(() => {
    const storedEmpId = (localStorage.getItem('employee_id') || '').trim()
    const storedUserId = (localStorage.getItem('user_id') || '').trim()
    const empId = /^\d+$/.test(storedEmpId) ? Number(storedEmpId) : null
    return empId ?? (/^\d+$/.test(storedUserId) ? Number(storedUserId) : null)
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
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
        const me = normalized.find((x) => String(x.id) === String(driverId)) || null
        setEmployee(me)
      } catch (e) {
        if (e instanceof Error) setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [driverId])

  const weekly = employee?.hours_worked_week ?? 0
  const maxWeekly = 40
  const name = employee?.name || [employee?.firstName, employee?.lastName].filter(Boolean).join(' ') || 'Driver'

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'var(--yellow-300)' }}>Error: {error}</div>}
      {!loading && !error && (
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">{String(name).charAt(0)}</div>
            <div className="profile-name">{name}</div>
            <div className="profile-id">ID: {employee?.id ?? driverId ?? '-'}</div>
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
              <div className="detail-value">{employee?.role ?? 'driver'}</div>
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
      )}
    </div>
  )
}

export default Profile