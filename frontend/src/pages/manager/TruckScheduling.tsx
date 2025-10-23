import { useEffect, useMemo, useState } from 'react'
import { TruckIcon } from '../../components/Icons'
import './TruckScheduling.css'
import { createDelivery, getDeliveries, getEmployees, getRoutes, getTrucks, type DeliveryInfo, type EmployeeSummary, type RouteInfo, type Truck } from '../../lib/api'
import { getProfile } from '../../lib/api'

function TruckScheduling() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [routes, setRoutes] = useState<RouteInfo[]>([])
  const [deliveries, setDeliveries] = useState<DeliveryInfo[]>([])
  const [employees, setEmployees] = useState<EmployeeSummary[]>([])
  const [userId, setUserId] = useState<number | null>(null)

  const [truckId, setTruckId] = useState<number | ''>('')
  const [routeId, setRouteId] = useState<number | ''>('')
  const [driverId, setDriverId] = useState<number | ''>('')
  const [assistantId, setAssistantId] = useState<number | ''>('')
  const [dateTime, setDateTime] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getTrucks().then(setTrucks)
    getRoutes().then(setRoutes)
    getDeliveries().then(setDeliveries)
    getEmployees().then(setEmployees)
    getProfile().then(p => setUserId(p.user_id)).catch(() => setUserId(null))
  }, [])

  const drivers = useMemo(() => employees.filter(e => e.type.toLowerCase().includes('driver')), [employees])
  const assistants = useMemo(() => employees.filter(e => e.type.toLowerCase().includes('assistant')), [employees])

  async function submit() {
    if (!userId || !truckId || !routeId || !dateTime) return
    setSubmitting(true)
    try {
      await createDelivery({
        truck_id: Number(truckId),
        route_id: Number(routeId),
        user_id: Number(userId),
        delivery_date_time: new Date(dateTime).toISOString(),
        driver_employee_id: driverId ? Number(driverId) : null,
        assistant_employee_id: assistantId ? Number(assistantId) : null,
      })
      setTruckId(''); setRouteId(''); setDriverId(''); setAssistantId(''); setDateTime('')
      const refreshed = await getDeliveries()
      setDeliveries(refreshed)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="manager-truck-page">
      <h1 className="page-title">Truck Scheduling</h1>
      <p className="page-subtitle manager-section-intro">Manage truck routes, assign drivers and assistants</p>

      <div className="truck-layout">
        <div className="panel">
          <h3 className="panel-title">Schedule New Delivery</h3>
          <div className="form-row">
            <div className="form-field">
              <select className="control" value={truckId} onChange={e => setTruckId(Number(e.target.value) as any)}>
                <option value="">Select Truck</option>
                {trucks.map(t => (
                  <option key={t.truck_id} value={t.truck_id}>{t.plate_number} · {t.status}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <select className="control" value={routeId} onChange={e => setRouteId(Number(e.target.value) as any)}>
                <option value="">Select Route</option>
                {routes.map(r => (
                  <option key={r.route_id} value={r.route_id}>{r.start_location} → {r.end_location}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <select className="control" value={driverId} onChange={e => setDriverId(Number(e.target.value) as any)}>
                <option value="">Assign Driver (optional)</option>
                {drivers.map(emp => (
                  <option key={emp.employee_id} value={emp.employee_id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <select className="control" value={assistantId} onChange={e => setAssistantId(Number(e.target.value) as any)}>
                <option value="">Assign Assistant (optional)</option>
                {assistants.map(emp => (
                  <option key={emp.employee_id} value={emp.employee_id}>{emp.firstName} {emp.lastName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <input className="control" type="datetime-local" value={dateTime} onChange={e => setDateTime(e.target.value)} />
            </div>
          </div>
          <div className="submit-row">
            <button className="btn btn-primary" onClick={submit} disabled={submitting || !userId}>Schedule Delivery</button>
          </div>
        </div>

        <div className="panel">
          <h3 className="panel-title panel-title-row"><TruckIcon size={18}/> Upcoming Deliveries</h3>
          <div className="list">
            {deliveries.map(d => (
              <div key={d.delivery_id} className="list-item">
                <div>
                  <div>#{d.delivery_id} · Route {d.route_id} · Truck {d.truck_id}</div>
                  <div className="subtext">{new Date(d.delivery_date_time).toLocaleString()} · {d.status}</div>
                </div>
              </div>
            ))}
            {deliveries.length === 0 && <div className="subtext text-center">No deliveries scheduled</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TruckScheduling
