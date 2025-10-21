import { useState, useEffect } from 'react'
import apiFetch from '../../utils/api'
import './TrainScheduling.css'

interface TrainTrip {
  train_trip_id: number
  departure_city: string
  arrival_city: string
  departure_date_time: string
  arrival_date_time: string
  total_capacity: number
  available_capacity?: number | null
}

interface Allocation { train_trip_id: number; order_id: number; allocated_space: number }

function TrainScheduling() {
  const [trainTrips, setTrainTrips] = useState<TrainTrip[]>([])
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTrip, setNewTrip] = useState({
    departure_city: '',
    arrival_city: '',
    departure_date_time: '', // datetime-local
    arrival_date_time: '',   // datetime-local
    total_capacity: 0,
  })
  const [allocateOrderId, setAllocateOrderId] = useState<string>('')

  useEffect(() => {
    const fetchTrainTrips = async () => {
      try {
        const [tripsRes, schedulesRes] = await Promise.all([
          apiFetch('/train-trips/train-trips'),
          apiFetch('/train-trips/train-schedules'),
        ])
        if (!tripsRes.ok) throw new Error('Failed to fetch train trips')
        const rawTrips = await tripsRes.json()
        const trips: TrainTrip[] = (rawTrips || []).map((t: any) => ({
          train_trip_id: t.train_trip_id ?? t.id ?? t[0],
          departure_city: t.departure_city ?? t[1] ?? 'Unknown',
          arrival_city: t.arrival_city ?? t[2] ?? 'Unknown',
          departure_date_time: t.departure_date_time ?? new Date().toISOString(),
          arrival_date_time: t.arrival_date_time ?? new Date().toISOString(),
          total_capacity: Number(t.total_capacity ?? 0),
          available_capacity: t.available_capacity ?? null,
        }))
        setTrainTrips(trips)

        if (schedulesRes.ok) {
          const sched = await schedulesRes.json()
          const norm: Allocation[] = (sched || []).map((s: any) => ({
            train_trip_id: s.train_trip_id ?? s[0],
            order_id: s.order_id ?? s[1],
            allocated_space: Number(s.allocated_space ?? s[2] ?? 0),
          }))
          setAllocations(norm)
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchTrainTrips()
  }, [])

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // existing backend expects query params on /train-trips/train-trips/create
      const params = new URLSearchParams()
      params.set('departure_city', newTrip.departure_city)
      params.set('arrival_city', newTrip.arrival_city)
      // convert datetime-local (YYYY-MM-DDTHH:mm) to ISO string accepted by backend
      const dep = new Date(newTrip.departure_date_time)
      const arr = new Date(newTrip.arrival_date_time)
      params.set('departure_date_time', dep.toISOString())
      params.set('arrival_date_time', arr.toISOString())
      params.set('total_capacity', String(newTrip.total_capacity))

      const response = await apiFetch(`/train-trips/train-trips/create?${params.toString()}`, { method: 'POST' })

      if (!response.ok) throw new Error('Failed to add trip')

      // Reload list after creation
      const listRes = await apiFetch('/train-trips/train-trips')
      if (listRes.ok) {
        const rawTrips = await listRes.json()
        const trips: TrainTrip[] = (rawTrips || []).map((t: any) => ({
          train_trip_id: t.train_trip_id ?? t.id ?? t[0],
          departure_city: t.departure_city ?? t[1] ?? 'Unknown',
          arrival_city: t.arrival_city ?? t[2] ?? 'Unknown',
          departure_date_time: t.departure_date_time ?? new Date().toISOString(),
          arrival_date_time: t.arrival_date_time ?? new Date().toISOString(),
          total_capacity: Number(t.total_capacity ?? 0),
          available_capacity: t.available_capacity ?? null,
        }))
        setTrainTrips(trips)
      }
      setShowAddModal(false)
      setNewTrip({ departure_city: '', arrival_city: '', departure_date_time: '', arrival_date_time: '', total_capacity: 0 })
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      }
    }
  }

  const handleAllocateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    const id = allocateOrderId.trim()
    if (!id) return
    try {
  const res = await apiFetch(`/orders/${id}/allocate-train`, { method: 'POST' })
      if (!res.ok) throw new Error('Allocation failed')
      // refresh schedules and trips (capacity)
      const [tripsRes, schedulesRes] = await Promise.all([
        apiFetch('/train-trips/train-trips'),
        apiFetch('/train-trips/train-schedules'),
      ])
      if (tripsRes.ok) {
        const rawTrips = await tripsRes.json()
        const trips: TrainTrip[] = (rawTrips || []).map((t: any) => ({
          train_trip_id: t.train_trip_id ?? t.id ?? t[0],
          departure_city: t.departure_city ?? t[1] ?? 'Unknown',
          arrival_city: t.arrival_city ?? t[2] ?? 'Unknown',
          departure_date_time: t.departure_date_time ?? new Date().toISOString(),
          arrival_date_time: t.arrival_date_time ?? new Date().toISOString(),
          total_capacity: Number(t.total_capacity ?? 0),
          available_capacity: t.available_capacity ?? null,
        }))
        setTrainTrips(trips)
      }
      if (schedulesRes.ok) {
        const sched = await schedulesRes.json()
        const norm: Allocation[] = (sched || []).map((s: any) => ({
          train_trip_id: s.train_trip_id ?? s[0],
          order_id: s.order_id ?? s[1],
          allocated_space: Number(s.allocated_space ?? s[2] ?? 0),
        }))
        setAllocations(norm)
      }
      setAllocateOrderId('')
    } catch (err) {
      if (err instanceof Error) setError(err.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="train-scheduling">
      <div className="page-header">
        <h1>Train Scheduling</h1>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          + Add New Trip
        </button>
      </div>

      <div className="filters-bar">
        <input type="text" placeholder="Search trips..." className="search-input" />
        <select className="filter-select">
          <option>All Destinations</option>
          <option>Colombo</option>
          <option>Kandy</option>
          <option>Galle</option>
        </select>
        <form onSubmit={handleAllocateOrder} className="inline-form" style={{ display: 'flex', gap: 8 }}>
          <input type="number" placeholder="Order ID to allocate" value={allocateOrderId} onChange={(e) => setAllocateOrderId(e.target.value)} className="input-field" />
          <button type="submit" className="btn-secondary">Allocate</button>
        </form>
      </div>

      <div className="trips-table-container">
        <table className="trips-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>From → To</th>
              <th>Departure</th>
              <th>Arrival</th>
              <th>Total Capacity</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            {trainTrips.map((trip) => (
              <tr key={trip.train_trip_id}>
                <td>{trip.train_trip_id}</td>
                <td>{trip.departure_city} → {trip.arrival_city}</td>
                <td>{new Date(trip.departure_date_time).toLocaleString()}</td>
                <td>{new Date(trip.arrival_date_time).toLocaleString()}</td>
                <td>{trip.total_capacity}</td>
                <td>{trip.available_capacity ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="trips-table-container allocations" style={{ marginTop: 16 }}>
        <h2>Allocations</h2>
        <table className="trips-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Order ID</th>
              <th>Allocated Space</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((a, i) => (
              <tr key={`${a.train_trip_id}-${a.order_id}-${i}`}>
                <td>{a.train_trip_id}</td>
                <td>{a.order_id}</td>
                <td>{a.allocated_space}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Train Trip</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddTrip} className="modal-form">
              <div className="form-group">
                <label>Departure City</label>
                <input type="text" value={newTrip.departure_city} onChange={(e) => setNewTrip({ ...newTrip, departure_city: e.target.value })} className="input-field" required />
              </div>
              <div className="form-group">
                <label>Arrival City</label>
                <input type="text" value={newTrip.arrival_city} onChange={(e) => setNewTrip({ ...newTrip, arrival_city: e.target.value })} className="input-field" required />
              </div>
              <div className="form-group">
                <label>Departure Date/Time</label>
                <input type="datetime-local" value={newTrip.departure_date_time} onChange={(e) => setNewTrip({ ...newTrip, departure_date_time: e.target.value })} className="input-field" required />
              </div>
              <div className="form-group">
                <label>Arrival Date/Time</label>
                <input type="datetime-local" value={newTrip.arrival_date_time} onChange={(e) => setNewTrip({ ...newTrip, arrival_date_time: e.target.value })} className="input-field" required />
              </div>
              <div className="form-group">
                <label>Total Capacity</label>
                <input type="number" value={newTrip.total_capacity} onChange={(e) => setNewTrip({ ...newTrip, total_capacity: parseInt(e.target.value || '0', 10) })} className="input-field" required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainScheduling