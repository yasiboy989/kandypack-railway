import { useEffect, useState } from 'react'
import apiFetch from '../../utils/api'
import './AssistantPortal.css'

function AssistantPortal() {
  const [assignment, setAssignment] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch('/deliveries/deliveries')
        if (!res.ok) throw new Error('Failed to load assignments')
        const list = await res.json()
        const storedUserId = (localStorage.getItem('user_id') || '').trim()
        const uid = /^\d+$/.test(storedUserId) ? Number(storedUserId) : null
        const mine = (list || []).filter((d: any) => (d.assistant_employee_id ?? d.assistantId) == uid)
        // pick the next upcoming or the latest pending
        const sorted = mine.sort((a: any, b: any) => new Date(a.delivery_date_time ?? 0).getTime() - new Date(b.delivery_date_time ?? 0).getTime())
        setAssignment(sorted[0] || mine[0] || null)
      } catch (e) {
        if (e instanceof Error) setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="assistant-portal">
      <div className="page-header">
        <h1>Assistant Dashboard</h1>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {(!loading && !error) && (
        <div className="assignment-card">
          <div className="card-header">
            <h2>Current Assignment</h2>
          </div>
          {!assignment ? (
            <div className="assignment-details"><div className="detail-value">No current assignment</div></div>
          ) : (
            <div className="assignment-details">
              <div className="detail-item">
                <div className="detail-label">Assigned Driver:</div>
                <div className="detail-value">{assignment.driver_name || assignment.driver || `Driver ${assignment.driver_employee_id || '-'}`}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Delivery ID:</div>
                <div className="detail-value">{assignment.delivery_id}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Route:</div>
                <div className="detail-value">{assignment.route_name || `${assignment.route_start ?? ''} → ${assignment.route_end ?? ''}`}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Truck:</div>
                <div className="detail-value">{assignment.truck_plate || `Truck ${assignment.truck_id}`}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">When:</div>
                <div className="detail-value">{assignment.delivery_date_time ? new Date(assignment.delivery_date_time).toLocaleString() : '-'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Status:</div>
                <div className="detail-value">{assignment.status || 'pending'}</div>
              </div>
            </div>
          )}
          <div className="card-actions">
            <a className="btn-primary" href="/assistant/assignments">View My Assignments</a>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssistantPortal
