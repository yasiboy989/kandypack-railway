import { useState, useEffect } from 'react'
import apiFetch from '../../utils/api'
import './Trucks.css'

function Trucks() {
  const [trucks, setTrucks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newTruck, setNewTruck] = useState({ plate_number: '', max_load: 0 })

  useEffect(() => {
    const fetchTrucks = async () => {
      try {
        const res = await apiFetch('/Trucks/trucks')
        if (!res.ok) throw new Error('Failed to fetch trucks')
        const data = await res.json()
        setTrucks(data)
      } catch (err) {
        if (err instanceof Error) setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTrucks()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // backend expects plate_number and max_load as query parameters
      const qs = `?plate_number=${encodeURIComponent(newTruck.plate_number)}&max_load=${encodeURIComponent(String(newTruck.max_load))}`
      const res = await apiFetch(`/Trucks/trucks${qs}`, {
        method: 'POST',
      })
      if (!res.ok) {
        // attempt to read body for diagnostics
        let bodyPreview = ''
        try {
          const json = await res.json()
          bodyPreview = JSON.stringify(json)
        } catch (e) {
          try { bodyPreview = await (res as any).text() } catch (e2) { bodyPreview = '<no body>' }
        }
        throw new Error(`Failed to add truck (status ${res.status}) - ${bodyPreview}`)
      }
  const created = await res.json()
  // created may be tuple/array or object
  const createdTruck = Array.isArray(created) ? { truck_id: created[0], plate_number: created[1], max_load: created[2] } : created
  setTrucks([...trucks, createdTruck])
      setShowAdd(false)
      setNewTruck({ plate_number: '', max_load: 0 })
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    }
  }

  if (loading) return <div>Loading trucks...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="trucks-page">
      <div className="page-header">
        <h1>Trucks</h1>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add Truck</button>
      </div>

      <div className="trucks-list">
        <table className="trucks-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Plate</th>
              <th>Max Load</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map((t) => (
              <tr key={t.truck_id ?? t.id}>
                <td>{t.truck_id ?? t.id}</td>
                <td>{t.plate_number ?? t.plate}</td>
                <td>{t.max_load ?? t.maxLoad}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Truck</h2>
              <button className="modal-close" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <form onSubmit={handleAdd} className="modal-form">
              <div className="form-group">
                <label>Plate Number</label>
                <input value={newTruck.plate_number} onChange={(e) => setNewTruck({ ...newTruck, plate_number: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Max Load (kg)</label>
                <input type="number" value={newTruck.max_load} onChange={(e) => setNewTruck({ ...newTruck, max_load: Number(e.target.value) })} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Trucks
