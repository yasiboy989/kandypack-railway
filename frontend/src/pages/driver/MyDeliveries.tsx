import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiFetch from '../../utils/api'
import './MyDeliveries.css'

interface DeliveryRow {
  delivery_id: number | string
  status: string
  route_name?: string
  route_start?: string
  route_end?: string
  delivery_date_time?: string
  truck_plate?: string
}

function MyDeliveries() {
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const res = await apiFetch('/deliveries/deliveries')
        if (!res.ok) throw new Error('Failed to fetch deliveries')
        const data = await res.json()
        const storedEmpId = (localStorage.getItem('employee_id') || '').trim()
        const storedUserId = (localStorage.getItem('user_id') || '').trim()
        const driverId = /^\d+$/.test(storedEmpId) ? Number(storedEmpId) : (/^\d+$/.test(storedUserId) ? Number(storedUserId) : null)
        const mine: DeliveryRow[] = (data || [])
          .filter((d: any) => (d.driver_employee_id ?? d.driverId) == driverId)
          .map((d: any) => ({
            delivery_id: d.delivery_id ?? d.id ?? d[0],
            status: d.status ?? 'pending',
            route_name: d.route_name,
            route_start: d.route_start,
            route_end: d.route_end,
            delivery_date_time: d.delivery_date_time,
            truck_plate: d.truck_plate,
          }))
        setDeliveries(mine)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDeliveries()
  }, [])

  const handleUpdateClick = (deliveryId: number | string) => {
    navigate(`/driver/actions?deliveryId=${deliveryId}`)
  }

  return (
    <div className="my-deliveries">
      <div className="page-header">
        <h1>My Deliveries</h1>
      </div>

      <div className="deliveries-list">
        {loading && <div>Loading…</div>}
        {error && <div style={{ color: 'var(--yellow-300)' }}>Error: {error}</div>}
        {!loading && !error && deliveries.length === 0 && (
          <div style={{ color: 'var(--neutral-400)' }}>No assigned deliveries found.</div>
        )}
        {deliveries.map((d) => {
          const when = d.delivery_date_time ? new Date(d.delivery_date_time).toLocaleString() : '-'
          const routeTitle = d.route_name || `${d.route_start ?? ''} → ${d.route_end ?? ''}`
          const mapHref = (d.route_start && d.route_end)
            ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(d.route_start)}&destination=${encodeURIComponent(d.route_end)}`
            : undefined
          return (
            <div key={String(d.delivery_id)} className="delivery-card">
              <div className="card-header">
                <h3>{routeTitle}</h3>
                <span className={`status-badge ${String(d.status).toLowerCase().replace(/\s+/g,'-')}`}>{d.status}</span>
              </div>
              <div className="card-body">
                <div className="meta-row"><span className="meta-label">Delivery</span><span className="meta-value">{d.delivery_id}</span></div>
                <div className="meta-row"><span className="meta-label">When</span><span className="meta-value">{when}</span></div>
                <div className="meta-row"><span className="meta-label">Truck</span><span className="meta-value">{d.truck_plate ?? '-'}</span></div>
                {mapHref && (
                  <div className="meta-actions">
                    <a className="btn-secondary" href={mapHref} target="_blank" rel="noreferrer">View Map</a>
                  </div>
                )}
              </div>
              <div className="card-actions">
                <button
                  className="btn-primary"
                  onClick={() => handleUpdateClick(d.delivery_id)}
                >
                  Delivery Actions
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MyDeliveries