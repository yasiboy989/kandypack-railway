import { useEffect, useState } from 'react'
import apiFetch from '../../utils/api'
import './Routes.css'

type RouteItem = {
  route_id?: number
  name?: string
  origin?: string
  destination?: string
  estimated_minutes?: number
}

function Routes() {
  const [routes, setRoutes] = useState<RouteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<RouteItem | null>(null)
  const [form, setForm] = useState<RouteItem>({ name: '', origin: '', destination: '', estimated_minutes: 0 })

  useEffect(() => {
    fetchRoutes()
  }, [])

  // Normalize backend route objects to the UI's RouteItem shape
  const normalizeRoute = (item: any): RouteItem => {
    if (!item) return {}
    const origin = item.origin ?? item.from ?? item.start_location ?? ''
    const destination = item.destination ?? item.to ?? item.end_location ?? ''
    return {
      route_id: item.route_id ?? item.id ?? item.routeId ?? null,
      name: item.name ?? item.route_name ?? item.title ?? (origin && destination ? `${origin} → ${destination}` : ''),
      origin,
      destination,
      estimated_minutes: item.estimated_minutes ?? item.estimatedMinutes ?? item.est_minutes ?? 0,
    }
  }

  const fetchRoutes = async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/routes/routes')
      if (!res.ok) throw new Error('Failed to fetch routes')
      let data = await res.json()
      // backend may wrap result in { data: [...] }
      if (data && data.data && Array.isArray(data.data)) data = data.data
      if (Array.isArray(data)) {
        setRoutes(data.map(normalizeRoute))
      } else {
        // single object? normalize into array
        setRoutes([normalizeRoute(data)])
      }
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', origin: '', destination: '', estimated_minutes: 0 })
    setShowModal(true)
  }

  const openEdit = (r: RouteItem) => {
    setEditing(r)
    setForm({ ...r })
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing && editing.route_id) {
        const res = await apiFetch(`/routes/routes/${editing.route_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
  if (!res.ok) throw new Error('Failed to update route')
  let updated = await res.json()
  if (updated && updated.data) updated = updated.data
  updated = normalizeRoute(updated)
  setRoutes(routes.map((r) => (r.route_id === updated.route_id ? updated : r)))
      } else {
        const res = await apiFetch('/routes/routes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
  if (!res.ok) throw new Error('Failed to create route')
  let created = await res.json()
  if (created && created.data) created = created.data
  created = normalizeRoute(created)
  setRoutes([...routes, created])
      }
      setShowModal(false)
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    }
  }

  const handleDelete = async (id?: number) => {
    if (!id) return
    if (!confirm('Delete this route?')) return
    try {
  const res = await apiFetch(`/routes/routes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setRoutes(routes.filter((r) => r.route_id !== id))
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    }
  }

  if (loading) return <div>Loading routes...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="routes-page">
      <div className="page-header">
        <h1>Routes</h1>
        <div>
          <button className="btn-primary" onClick={openAdd}>+ New Route</button>
        </div>
      </div>

      <div className="routes-table-container">
        <table className="routes-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Est. (min)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r.route_id}>
                <td>{r.route_id}</td>
                <td>{r.name}</td>
                <td>{r.origin}</td>
                <td>{r.destination}</td>
                <td>{r.estimated_minutes}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" onClick={() => openEdit(r)}>✏️</button>
                    <button className="btn-icon btn-danger" onClick={() => handleDelete(r.route_id)}>🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Route' : 'New Route'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Origin</label>
                <input className="input-field" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Destination</label>
                <input className="input-field" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Estimated Minutes</label>
                <input type="number" className="input-field" value={form.estimated_minutes} onChange={(e) => setForm({ ...form, estimated_minutes: Number(e.target.value) })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Routes
