import { useState, useEffect } from 'react'
import apiFetch from '../../utils/api'
import './TruckScheduling.css'

interface DeliveryRow {
  delivery_id: number | string
  route_id: number | string | null
  route_name: string | null
  route_start?: string | null
  route_end?: string | null
  truck_id: number | string | null
  truck_plate?: string | null
  driver_employee_id: number | string | null
  driver_name?: string | null
  assistant_employee_id: number | string | null
  assistant_name?: string | null
  status: string
}

const normalizeDeliveryRow = (d: any): DeliveryRow => {
  const id = d.delivery_id ?? d.id ?? (Array.isArray(d) ? d[0] : undefined)
  const route_id = d.route_id ?? (Array.isArray(d) ? d[1] : null)
  const status = (d.status ?? 'Pending').toString().trim()
  const route_start = d.route_start ?? d.start_location ?? d.origin ?? null
  const route_end = d.route_end ?? d.end_location ?? d.destination ?? null
  const route_name = d.route_name ?? d.route ?? (route_start && route_end ? `${route_start} → ${route_end}` : null)
  const truck_id = d.truck_id ?? d.truck ?? null
  const truck_plate = d.truck_plate ?? d.plate_number ?? null
  const driver_employee_id = d.driver_employee_id ?? d.driver_id ?? null
  const driver_name = d.driver_name ?? d.driver ?? null
  const assistant_employee_id = d.assistant_employee_id ?? d.assistant_id ?? null
  const assistant_name = d.assistant_name ?? d.assistant ?? null

  return {
    delivery_id: id,
    route_id,
    route_name,
    route_start,
    route_end,
    truck_id,
    truck_plate,
    driver_employee_id,
    driver_name,
    assistant_employee_id,
    assistant_name,
    status,
  }
}

function TruckScheduling() {
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([])
  const [conflicts, setConflicts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newDelivery, setNewDelivery] = useState({
    route_id: '' as number | string,
    truck_id: '' as number | string,
    driver_id: '' as number | string,
    assistant_id: '' as number | string,
    notes: '',
  })
  const [trucks, setTrucks] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [editingDelivery, setEditingDelivery] = useState<DeliveryRow | null>(null)

  const readErrorMessage = async (response: Awaited<ReturnType<typeof apiFetch>>, fallback: string) => {
    try {
      const body = await response.json()
      if (!body) return fallback
      const detail = body.detail ?? body.message ?? body.error
      if (typeof detail === 'string' && detail.trim()) return detail.trim()
      if (Array.isArray(detail)) {
        const messages = detail
          .map((item: any) => {
            if (!item) return null
            if (typeof item === 'string') return item
            if (item.msg) return item.msg
            if (item.message) return item.message
            if (item.detail) return item.detail
            return null
          })
          .filter(Boolean)
        if (messages.length) return messages.join(', ')
      }
    } catch (err) {
      // swallow parse issues and fall back to default message
    }
    return fallback
  }


  useEffect(() => {
    const fetchTruckRoutes = async () => {
      setError(null)
      try {
        const [deliveriesRes, routesRes, trucksRes, employeesRes, conflictsRes] = await Promise.all([
          apiFetch('/deliveries/deliveries'),
          apiFetch('/routes/routes'),
          apiFetch('/Trucks/trucks'),
          // employees live on backend B and are proxied by vite
          apiFetch('/employees'),
          apiFetch('/deliveries/conflicts'),
        ])

        if (!deliveriesRes.ok) throw new Error('Failed to fetch deliveries')
  const rawDeliveries = await deliveriesRes.json()
        const rawRoutes = routesRes.ok ? await routesRes.json() : []
        const rawTrucks = trucksRes.ok ? await trucksRes.json() : []
        const rawEmployees = employeesRes.ok ? await employeesRes.json() : []

  const normalizedDeliveries = (rawDeliveries || []).map(normalizeDeliveryRow)
        setDeliveries(normalizedDeliveries)
  if (conflictsRes.ok) setConflicts(await conflictsRes.json())

        // reuse for dropdowns
        const normalizeRoute = (r: any) => {
          const route_id = r.route_id ?? r.id ?? (Array.isArray(r) ? r[0] : undefined) ?? null
          const origin = r.origin ?? r.start_location ?? r.departure_city ?? (Array.isArray(r) ? r[1] : undefined) ?? ''
          const destination = r.destination ?? r.end_location ?? r.arrival_city ?? (Array.isArray(r) ? r[2] : undefined) ?? ''
          const name = r.name ?? r.routeName ?? (origin && destination ? `${origin} → ${destination}` : r[1] ?? r[2] ?? 'Unnamed')
          const assigned_truck_id = r.assigned_truck_id ?? r.truck_id ?? r.assignedTruckId ?? null
          const driver_id = r.driver_id ?? r.driver ?? null
          const assistant_id = r.assistant_id ?? r.assistant ?? null
          const status = r.status ?? 'pending'
          return { route_id, origin, destination, name, assigned_truck_id, driver_id, assistant_id, status }
        }

        const normalizedRoutes = (rawRoutes || []).map(normalizeRoute)
        setRoutes(normalizedRoutes)

        const normalizedTrucks = (rawTrucks || []).map((t: any) => ({ truck_id: t.truck_id ?? t.id ?? (Array.isArray(t) ? t[0] : undefined), plate_number: t.plate_number ?? t.plate ?? (Array.isArray(t) ? t[1] : undefined), max_load: t.max_load ?? t.maxLoad ?? 0 }))
        setTrucks(normalizedTrucks)

        const normalizedEmployees = (rawEmployees || []).map((e: any) => {
          const id = e.employee_id ?? e.id ?? (Array.isArray(e) ? e[0] : undefined)
          const first = e.firstName ?? e.first_name ?? ''
          const last = e.lastName ?? e.last_name ?? ''
          const name = (e.name ?? `${first} ${last}`.trim()) || (Array.isArray(e) ? e[1] : `Emp ${id}`)
          const roleRaw = (e.type ?? e.role ?? e.employee_type ?? '').toString().toLowerCase()
          const role = roleRaw.includes('driver') ? 'driver' : roleRaw.includes('assistant') ? 'assistant' : roleRaw || 'staff'
          return { id, name, role, email: e.email, phone: e.phone, hours_worked_week: e.hours_worked_week }
        })
        setEmployees(normalizedEmployees)
      } catch (err) {
        if (err instanceof Error) setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTruckRoutes()
  }, [])

  const handleAddDelivery = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const params = new URLSearchParams()
      params.set('truck_id', String(newDelivery.truck_id))
      params.set('route_id', String(newDelivery.route_id))
      const storedUserId = (localStorage.getItem('user_id') || '').trim()
      if (storedUserId && /^\d+$/.test(storedUserId)) {
        params.set('user_id', storedUserId)
      }
      params.set('delivery_date_time', new Date().toISOString())
      if (newDelivery.driver_id) params.set('driver_employee_id', String(newDelivery.driver_id))
      if (newDelivery.assistant_id) params.set('assistant_employee_id', String(newDelivery.assistant_id))

      const response = await apiFetch(`/deliveries/deliveries?${params.toString()}`, {
        method: 'POST',
      })

  if (!response.ok) throw new Error(await readErrorMessage(response, 'Failed to create delivery'))

      const createdRaw = await response.json()
      const created = normalizeDeliveryRow(createdRaw)
      setDeliveries((prev) => [created, ...prev])
      setShowAddModal(false)
      setEditingDelivery(null)
      setNewDelivery({ route_id: '', truck_id: '', driver_id: '', assistant_id: '', notes: '' })
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    }
  }

  const openEditDelivery = (delivery: DeliveryRow) => {
    setEditingDelivery(delivery)
    setNewDelivery({
      route_id: delivery.route_id ?? '',
      truck_id: delivery.truck_id ?? '',
      driver_id: delivery.driver_employee_id ?? '',
      assistant_id: delivery.assistant_employee_id ?? '',
      notes: '',
    })
    setShowAddModal(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDelivery) return
    setError(null)
    try {
      const id = editingDelivery.delivery_id
      const res = await apiFetch(`/deliveries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route_id: newDelivery.route_id || null,
          truck_id: newDelivery.truck_id || null,
          driver_employee_id: newDelivery.driver_id || null,
          assistant_employee_id: newDelivery.assistant_id || null,
          notes: newDelivery.notes || null,
        }),
      })
  if (!res.ok) throw new Error(await readErrorMessage(res, 'Failed to save delivery'))
      const updatedRaw = await res.json()
      const updated = normalizeDeliveryRow(updatedRaw)
      setDeliveries((prev) => prev.map((d) => (d.delivery_id === updated.delivery_id ? updated : d)))
      setShowAddModal(false)
      setEditingDelivery(null)
      setNewDelivery({ route_id: '', truck_id: '', driver_id: '', assistant_id: '', notes: '' })
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    }
  }

  const deleteDelivery = async (delivery: DeliveryRow) => {
    const id = delivery.delivery_id
    if (!id) return
    setError(null)
    if (!confirm('Delete this delivery?')) return
    try {
      const res = await apiFetch(`/deliveries/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(await readErrorMessage(res, 'Failed to delete delivery'))
      setDeliveries((prev) => prev.filter((d) => d.delivery_id !== id))
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="truck-scheduling">
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}
      <div className="page-header">
        <h1>Truck Scheduling</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingDelivery(null)
            setNewDelivery({ route_id: '', truck_id: '', driver_id: '', assistant_id: '', notes: '' })
            setShowAddModal(true)
          }}
        >
          + Add New Delivery
        </button>
      </div>

      <div className="filters-bar">
        <input type="text" placeholder="Search routes..." className="search-input" />
        <select className="filter-select">
          <option>All Statuses</option>
          <option>Pending</option>
          <option>In-transit</option>
          <option>Completed</option>
        </select>
      </div>

      <div className="routes-table-container">
        <table className="routes-table">
          <thead>
            <tr>
              <th>Route ID</th>
              <th>Route Name</th>
              <th>Truck</th>
              <th>Driver</th>
              <th>Assistant</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((delivery) => {
              const id = delivery.delivery_id
              const name = delivery.route_name ?? (delivery.route_start && delivery.route_end ? `${delivery.route_start} → ${delivery.route_end}` : 'Unnamed')

              const assignedTruckId = delivery.truck_id
              let truckLabel = delivery.truck_plate ?? '-'
              if (!truckLabel && assignedTruckId) {
                const found = trucks.find((t) => (t.truck_id ?? t.id) == assignedTruckId)
                truckLabel = found ? (found.plate_number ?? found.plate ?? `Truck ${(found.truck_id ?? found.id)}`) : String(assignedTruckId)
              }

              const driverId = delivery.driver_employee_id
              let driverLabel = delivery.driver_name ?? '-'
              if (!driverLabel && driverId) {
                const found = employees.find((e) => e.id == driverId || e.name === driverId)
                driverLabel = found ? found.name : String(driverId)
              }

              const assistantId = delivery.assistant_employee_id
              let assistantLabel = delivery.assistant_name ?? '-'
              if (!assistantLabel && assistantId) {
                const found = employees.find((e) => e.id == assistantId || e.name === assistantId)
                assistantLabel = found ? found.name : String(assistantId)
              }

              const statusText = delivery.status ?? '-'
              const statusClass = statusText.toLowerCase().replace(/\s+/g, '-')

              const hasConflict = conflicts.some((c) => c.delivery_id_1 == id || c.delivery_id_2 == id)
              return (
                <tr key={id}>
                  <td>{id}</td>
                  <td>
                    {name}
                    {hasConflict && <span className="badge-warning" style={{ marginLeft: 8 }}>Conflict</span>}
                  </td>
                  <td>{truckLabel}</td>
                  <td>{driverLabel}</td>
                  <td>{assistantLabel}</td>
                  <td>
                    <span className={`status-badge ${statusClass}`}>
                      {statusText}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon" title="Edit" onClick={() => openEditDelivery(delivery)}>✏️</button>
                      <button className="btn-icon btn-danger" title="Delete" onClick={() => deleteDelivery(delivery)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowAddModal(false)
            setEditingDelivery(null)
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDelivery ? 'Edit Delivery' : 'Add New Delivery'}</h2>
              <button
                className="modal-close"
                onClick={() => {
                  setShowAddModal(false)
                  setEditingDelivery(null)
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={editingDelivery ? handleSaveEdit : handleAddDelivery} className="modal-form">
              <div className="form-group">
                <label>Route</label>
                <select className="input-field" value={newDelivery.route_id} onChange={(e) => setNewDelivery({ ...newDelivery, route_id: e.target.value })} required>
                  <option value="">Select route</option>
                  {routes.map((r) => (
                    <option key={(r as any).route_id ?? (r as any).id} value={(r as any).route_id ?? (r as any).id}>{(r as any).name ?? (r as any).routeName ?? `${(r as any).origin} → ${(r as any).destination}`}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Truck</label>
                <select className="input-field" value={newDelivery.truck_id} onChange={(e) => setNewDelivery({ ...newDelivery, truck_id: e.target.value })} required>
                  <option value="">Select truck</option>
                  {trucks.map((t) => (
                    <option key={t.truck_id ?? t.id} value={t.truck_id ?? t.id}>{t.plate_number ?? t.plate ?? `Truck ${t.truck_id ?? t.id}`}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Driver (optional)</label>
                <select className="input-field" value={newDelivery.driver_id} onChange={(e) => setNewDelivery({ ...newDelivery, driver_id: e.target.value })}>
                  <option value="">Select driver</option>
                  {employees.filter((emp) => emp.role === 'driver').map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Assistant (optional)</label>
                <select className="input-field" value={newDelivery.assistant_id} onChange={(e) => setNewDelivery({ ...newDelivery, assistant_id: e.target.value })}>
                  <option value="">Select assistant</option>
                  {employees.filter((emp) => emp.role === 'assistant').map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="input-field" value={newDelivery.notes} onChange={(e) => setNewDelivery({ ...newDelivery, notes: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowAddModal(false); setEditingDelivery(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingDelivery ? 'Save' : 'Create Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TruckScheduling