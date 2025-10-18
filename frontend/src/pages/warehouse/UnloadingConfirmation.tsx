import { useState } from 'react'
import './UnloadingConfirmation.css'

interface TrainTrip {
  id: string
  origin: string
  arrivalTime: string
  status: 'arrived' | 'unloaded'
}

function UnloadingConfirmation() {
  const [trainTrips, setTrainTrips] = useState<TrainTrip[]>([
    { id: 'TT001', origin: 'Kandy', arrivalTime: '10:30', status: 'arrived' },
    { id: 'TT002', origin: 'Colombo', arrivalTime: '14:00', status: 'arrived' },
    { id: 'TT003', origin: 'Galle', arrivalTime: '16:00', status: 'unloaded' },
  ])

  const handleConfirmUnloading = (tripId: string) => {
    setTrainTrips(trainTrips.map(trip => 
      trip.id === tripId ? { ...trip, status: 'unloaded' } : trip
    ))
  }

  return (
    <div className="unloading-confirmation">
      <div className="page-header">
        <h1>Unloading Confirmation</h1>
      </div>

      <div className="trips-table-container">
        <table className="trips-table">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Origin</th>
              <th>Arrival Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trainTrips.map((trip) => (
              <tr key={trip.id}>
                <td>{trip.id}</td>
                <td>{trip.origin}</td>
                <td>{trip.arrivalTime}</td>
                <td>
                  <span className={`status-badge ${trip.status}`}>
                    {trip.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {trip.status === 'arrived' && (
                      <button 
                        className="btn-primary" 
                        onClick={() => handleConfirmUnloading(trip.id)}
                      >
                        Confirm Unloading
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UnloadingConfirmation