import { useState } from 'react'
import './TrainScheduling.css'

interface TrainTrip {
  id: string
  destination: string
  departureTime: string
  arrivalTime: string
  capacity: number
  status: 'scheduled' | 'departed' | 'arrived'
}

function TrainScheduling() {
  const [trainTrips, setTrainTrips] = useState<TrainTrip[]>([
    { id: 'TT001', destination: 'Colombo', departureTime: '08:00', arrivalTime: '10:30', capacity: 850, status: 'scheduled' },
    { id: 'TT002', destination: 'Kandy', departureTime: '10:30', arrivalTime: '14:00', capacity: 600, status: 'departed' },
    { id: 'TT003', destination: 'Galle', departureTime: '14:00', arrivalTime: '16:00', capacity: 1200, status: 'arrived' },
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [newTrip, setNewTrip] = useState({
    destination: '',
    departureTime: '',
    arrivalTime: '',
    capacity: 0,
  })

  const handleAddTrip = (e: React.FormEvent) => {
    e.preventDefault()
    const trip: TrainTrip = {
      id: `TT${(trainTrips.length + 1).toString().padStart(3, '0')}`,
      destination: newTrip.destination,
      departureTime: newTrip.departureTime,
      arrivalTime: newTrip.arrivalTime,
      capacity: newTrip.capacity,
      status: 'scheduled',
    }
    setTrainTrips([...trainTrips, trip])
    setShowAddModal(false)
    setNewTrip({ destination: '', departureTime: '', arrivalTime: '', capacity: 0 })
  }

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
        <select className="filter-select">
          <option>All Statuses</option>
          <option>Scheduled</option>
          <option>Departed</option>
          <option>Arrived</option>
        </select>
      </div>

      <div className="trips-table-container">
        <table className="trips-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Destination</th>
              <th>Departure Time</th>
              <th>Arrival Time</th>
              <th>Capacity (kg)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainTrips.map((trip) => (
              <tr key={trip.id}>
                <td>{trip.id}</td>
                <td>{trip.destination}</td>
                <td>{trip.departureTime}</td>
                <td>{trip.arrivalTime}</td>
                <td>{trip.capacity}</td>
                <td>
                  <span className={`status-badge ${trip.status}`}>
                    {trip.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Edit">✏️</button>
                    <button className="btn-icon btn-danger" title="Delete">🗑️</button>
                  </div>
                </td>
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
                <label>Destination</label>
                <input
                  type="text"
                  value={newTrip.destination}
                  onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label>Departure Time</label>
                <input
                  type="time"
                  value={newTrip.departureTime}
                  onChange={(e) => setNewTrip({ ...newTrip, departureTime: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label>Arrival Time</label>
                <input
                  type="time"
                  value={newTrip.arrivalTime}
                  onChange={(e) => setNewTrip({ ...newTrip, arrivalTime: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div className="form-group">
                <label>Capacity (kg)</label>
                <input
                  type="number"
                  value={newTrip.capacity}
                  onChange={(e) => setNewTrip({ ...newTrip, capacity: parseInt(e.target.value) })}
                  className="input-field"
                  required
                />
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