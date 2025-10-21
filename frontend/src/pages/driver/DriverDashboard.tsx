import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import apiFetch from '../../utils/api'
import './DriverDashboard.css'

function DriverDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deliveries, setDeliveries] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch('/deliveries/deliveries')
        if (!res.ok) throw new Error('Failed to fetch deliveries')
        const data = await res.json()
        const storedEmpId = (localStorage.getItem('employee_id') || '').trim()
        const storedUserId = (localStorage.getItem('user_id') || '').trim()
        const driverId = /^\d+$/.test(storedEmpId) ? Number(storedEmpId) : (/^\d+$/.test(storedUserId) ? Number(storedUserId) : null)
        const mine = (data || []).filter((d: any) => (d.driver_employee_id ?? d.driverId) == driverId)
        setDeliveries(mine)
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const todayStr = new Date().toDateString()
    const today = deliveries.filter((d) => d.delivery_date_time && new Date(d.delivery_date_time).toDateString() === todayStr).length
    const pending = deliveries.filter((d) => String(d.status ?? '').toLowerCase() === 'pending').length
    const completed = deliveries.filter((d) => String(d.status ?? '').toLowerCase() === 'delivered').length
    return { today, pending, completed }
  }, [deliveries])

  const current = useMemo(() => deliveries[0], [deliveries])

  const navigate = useNavigate()

  const handleViewDetailsClick = () => {
    navigate('/driver/deliveries')
  }

  return (
    <div className="driver-dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Driver Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Today's Deliveries</div>
          <div className="stat-value">{stats.today}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{stats.completed}</div>
        </div>
      </div>

      <div className="current-task-card">
        <div className="card-header">
          <h2>Current Task</h2>
        </div>
        {loading && <div>Loading…</div>}
        {error && <div style={{ color: 'var(--yellow-300)' }}>Error: {error}</div>}
        {!loading && !error && !current && (
          <div style={{ color: 'var(--neutral-400)' }}>No active delivery assigned.</div>
        )}
        {current && (
          <div className="task-details">
            <div className="task-info">
              <div className="info-label">Delivery ID:</div>
              <div className="info-value">{current.delivery_id ?? current.id}</div>
            </div>
            <div className="task-info">
              <div className="info-label">Route:</div>
              <div className="info-value">{current.route_name || `${current.route_start ?? ''} → ${current.route_end ?? ''}`}</div>
            </div>
            <div className="task-info">
              <div className="info-label">When:</div>
              <div className="info-value">{current.delivery_date_time ? new Date(current.delivery_date_time).toLocaleString() : '-'}</div>
            </div>
            <div className="task-info">
              <div className="info-label">Status:</div>
              <div className="info-value">
                <span className={`status-badge ${String(current.status ?? 'pending').toLowerCase().replace(/\s+/g,'-')}`}>
                  {current.status ?? 'pending'}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="task-actions">
          <button className="btn-primary" onClick={handleViewDetailsClick}>View Details</button>
        </div>
      </div>
    </div>
  )
}

export default DriverDashboard